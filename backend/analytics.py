"""Aggregation queries: movers, momentum, time series, per-ticker detail.

Every query optionally filters by `source` (reddit / stocktwits / hackernews /
yahoo_news / demo); pass None for "all sources combined".
"""
from __future__ import annotations

import time

import db

# window -> (current period seconds, bucket seconds for time series)
WINDOWS = {
    "daily": (86400, 3600),          # last 24h, hourly buckets
    "weekly": (7 * 86400, 86400),    # last 7d, daily buckets
    "monthly": (30 * 86400, 86400),  # last 30d, daily buckets
    "yearly": (365 * 86400, 7 * 86400),  # last 365d, weekly buckets
}


def _period(window: str) -> int:
    return WINDOWS.get(window, WINDOWS["weekly"])[0]


def _src(source: str | None, col: str = "source") -> tuple[str, list]:
    """Return an SQL fragment + params for an optional source filter.

    `col` qualifies the column (e.g. "m.source") for queries that join tables
    where an unqualified `source` would be ambiguous.
    """
    if source and source != "all":
        return f" AND {col} = ?", [source]
    return "", []


def movers(window: str = "weekly", limit: int = 30,
           source: str | None = None) -> list[dict]:
    """Top tickers by weighted buzz, with momentum vs the previous period."""
    period = _period(window)
    now = int(time.time())
    cur_start = now - period
    prev_start = now - 2 * period
    sc, sp = _src(source)

    with db.cursor() as c:
        c.execute(
            f"""
            SELECT ticker,
                   COUNT(*)                         AS mentions,
                   SUM(weight)                      AS buzz,
                   AVG(sentiment)                   AS avg_sent,
                   SUM(sentiment * weight)          AS wsent,
                   SUM(CASE WHEN sentiment >= 0.25 THEN 1 ELSE 0 END) AS bull,
                   SUM(CASE WHEN sentiment <= -0.25 THEN 1 ELSE 0 END) AS bear,
                   COUNT(DISTINCT source)           AS n_sources
            FROM mentions
            WHERE created_utc >= ?{sc}
            GROUP BY ticker
            """,
            [cur_start, *sp],
        )
        current = {r["ticker"]: dict(r) for r in c.fetchall()}

        c.execute(
            f"""SELECT ticker, COUNT(*) AS mentions
                FROM mentions
                WHERE created_utc >= ? AND created_utc < ?{sc}
                GROUP BY ticker""",
            [prev_start, cur_start, *sp],
        )
        prev = {r["ticker"]: dict(r) for r in c.fetchall()}

    rows = []
    for tk, cur_row in current.items():
        prev_m = prev.get(tk, {}).get("mentions", 0)
        cur_m = cur_row["mentions"]
        momentum = (cur_m - prev_m) / (prev_m if prev_m else 1)
        buzz = cur_row["buzz"] or 0
        wsent = (cur_row["wsent"] or 0) / buzz if buzz else 0
        rows.append({
            "ticker": tk,
            "mentions": cur_m,
            "prev_mentions": prev_m,
            "buzz": round(buzz, 1),
            "avg_sentiment": round(cur_row["avg_sent"] or 0, 3),
            "weighted_sentiment": round(wsent, 3),
            "bullish": cur_row["bull"],
            "bearish": cur_row["bear"],
            "n_sources": cur_row["n_sources"],
            "momentum": round(momentum, 3),
            "is_new": prev_m == 0,
        })

    rows.sort(key=lambda r: r["buzz"], reverse=True)
    return rows[:limit]


def timeseries(ticker: str, window: str = "weekly",
               source: str | None = None) -> dict:
    """Bucketed mention count + avg sentiment for one ticker over the window."""
    period, bucket = WINDOWS.get(window, WINDOWS["weekly"])
    now = int(time.time())
    start = now - period
    sc, sp = _src(source)

    with db.cursor() as c:
        c.execute(
            f"""SELECT (created_utc / ?) AS b,
                       COUNT(*) AS mentions,
                       AVG(sentiment) AS avg_sent
                FROM mentions
                WHERE ticker = ? AND created_utc >= ?{sc}
                GROUP BY b ORDER BY b""",
            [bucket, ticker.upper(), start, *sp],
        )
        raw = {int(r["b"]): dict(r) for r in c.fetchall()}

    labels, mentions, sent = [], [], []
    first = start // bucket
    last = now // bucket
    for b in range(first, last + 1):
        ts = b * bucket
        labels.append(ts)
        row = raw.get(b)
        mentions.append(row["mentions"] if row else 0)
        sent.append(round(row["avg_sent"], 3) if row else None)

    return {"ticker": ticker.upper(), "window": window,
            "labels": labels, "mentions": mentions, "sentiment": sent}


def overview(window: str = "weekly", source: str | None = None) -> dict:
    period = _period(window)
    start = int(time.time()) - period
    sc, sp = _src(source)
    with db.cursor() as c:
        c.execute(
            f"""SELECT COUNT(*) AS mentions,
                       COUNT(DISTINCT ticker) AS tickers,
                       AVG(sentiment) AS avg_sent,
                       SUM(CASE WHEN sentiment >= 0.25 THEN 1 ELSE 0 END) AS bull,
                       SUM(CASE WHEN sentiment <= -0.25 THEN 1 ELSE 0 END) AS bear,
                       SUM(CASE WHEN sentiment > -0.25 AND sentiment < 0.25 THEN 1 ELSE 0 END) AS neut
                FROM mentions WHERE created_utc >= ?{sc}""",
            [start, *sp],
        )
        row = dict(c.fetchone())
    return {
        "window": window,
        "source": source or "all",
        "total_mentions": row["mentions"] or 0,
        "unique_tickers": row["tickers"] or 0,
        "avg_sentiment": round(row["avg_sent"] or 0, 3),
        "bullish": row["bull"] or 0,
        "bearish": row["bear"] or 0,
        "neutral": row["neut"] or 0,
    }


def source_breakdown(window: str = "weekly") -> list[dict]:
    """Mention count + avg sentiment per source in the window."""
    start = int(time.time()) - _period(window)
    with db.cursor() as c:
        c.execute(
            """SELECT source, COUNT(*) AS mentions, ROUND(AVG(sentiment), 3) AS avg_sent
               FROM mentions WHERE created_utc >= ?
               GROUP BY source ORDER BY mentions DESC""",
            (start,),
        )
        return [dict(r) for r in c.fetchall()]


def top_posts(ticker: str, window: str = "weekly", limit: int = 10,
              source: str | None = None) -> list[dict]:
    """Documents driving a ticker's buzz in the window.

    For a single source, returns the highest-weighted docs. For "all sources",
    diversifies so each active source is represented (avoids one high-engagement
    source drowning out the rest), then orders the mix by influence.
    """
    period = _period(window)
    start = int(time.time()) - period
    cols = ("p.title, p.body, p.source, p.subreddit, p.kind, p.score, "
            "p.num_comments, p.permalink, p.created_utc, p.sentiment, p.author")

    with db.cursor() as c:
        if source and source != "all":
            c.execute(
                f"""SELECT {cols}
                    FROM mentions m JOIN posts p ON p.id = m.post_id
                    WHERE m.ticker = ? AND m.created_utc >= ? AND m.source = ?
                    ORDER BY m.weight DESC, p.created_utc DESC LIMIT ?""",
                (ticker.upper(), start, source, limit))
        else:
            # Top few per source (window function), then merge by weight.
            per_source = max(2, (limit + 2) // 3)
            c.execute(
                f"""SELECT {cols}, m.weight AS _w FROM (
                        SELECT *, ROW_NUMBER() OVER (
                            PARTITION BY source ORDER BY weight DESC, created_utc DESC
                        ) AS rn
                        FROM mentions
                        WHERE ticker = ? AND created_utc >= ?
                    ) m JOIN posts p ON p.id = m.post_id
                    WHERE m.rn <= ?
                    ORDER BY _w DESC, p.created_utc DESC LIMIT ?""",
                (ticker.upper(), start, per_source, limit))
        out = []
        for r in c.fetchall():
            d = dict(r)
            d.pop("_w", None)
            snippet = (d.get("title") or d.get("body") or "").strip()
            if len(snippet) > 240:
                snippet = snippet[:240] + "..."
            d["snippet"] = snippet
            d.pop("body", None)
            out.append(d)
    return out


def status() -> dict:
    with db.cursor() as c:
        c.execute("SELECT COUNT(*) AS n FROM posts")
        posts = c.fetchone()["n"]
        c.execute("SELECT COUNT(*) AS n FROM mentions")
        mentions = c.fetchone()["n"]
        c.execute(
            """SELECT started_at, finished_at, posts_seen, mentions, note
               FROM ingest_runs ORDER BY id DESC LIMIT 1""")
        last = c.fetchone()
        c.execute("SELECT MIN(created_utc) AS lo, MAX(created_utc) AS hi FROM mentions")
        span = c.fetchone()
        c.execute("SELECT DISTINCT source FROM mentions ORDER BY source")
        srcs = [r["source"] for r in c.fetchall()]
    return {
        "total_posts": posts,
        "total_mentions": mentions,
        "sources": srcs,
        "last_run": dict(last) if last else None,
        "data_from": span["lo"],
        "data_to": span["hi"],
    }
