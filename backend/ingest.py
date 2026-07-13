"""Ingestion pipeline: sources -> tickers -> sentiment -> SQLite.

Pulls from every enabled source (StockTwits, Yahoo news, Hacker News, Reddit),
normalizes each document, extracts tickers, scores sentiment, and stores
ticker mentions. Run repeatedly (e.g. hourly) so history accumulates.
"""
from __future__ import annotations

import math
import time

import db
import sentiment
import sources
from tickers import extract_tickers


def _upsert_post(cur, d: dict) -> None:
    cur.execute(
        """INSERT INTO posts
           (id, source, subreddit, kind, title, body, author, permalink, score,
            num_comments, created_utc, sentiment, fetched_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(id) DO UPDATE SET
             score=excluded.score,
             num_comments=excluded.num_comments,
             fetched_at=excluded.fetched_at""",
        (d["id"], d["source"], d["subreddit"], d["kind"], d.get("title"),
         d.get("body"), d.get("author"), d.get("permalink"), d.get("score", 0),
         d.get("num_comments", 0), d["created_utc"], d.get("sentiment", 0.0),
         d["fetched_at"]),
    )


def _insert_mentions(cur, tickers, post_id, source, subreddit, kind, sent,
                     weight, created) -> None:
    for tk in tickers:
        cur.execute(
            """INSERT OR IGNORE INTO mentions
               (ticker, post_id, source, subreddit, kind, sentiment, weight, created_utc)
               VALUES (?,?,?,?,?,?,?,?)""",
            (tk, post_id, source, subreddit, kind, sent, weight, created),
        )


def ingest_once() -> dict:
    db.init_db()
    now = int(time.time())
    posts_seen = 0
    mentions_added = 0
    per_source: dict[str, int] = {}

    with db.cursor() as cur:
        cur.execute("INSERT INTO ingest_runs (started_at, note) VALUES (?, ?)",
                    (now, "multi-source"))
        run_id = cur.lastrowid

    for mod in sources.enabled_sources():
        src = getattr(mod, "SOURCE", mod.__name__)
        try:
            docs = mod.fetch()
        except Exception as e:  # noqa: BLE001 - one bad source shouldn't kill the run
            print(f"[ingest] source '{src}' failed: {e}")
            continue
        print(f"[ingest] source '{src}': {len(docs)} documents")

        for doc in docs:
            text = f"{doc.get('title') or ''}\n{doc.get('body') or ''}".strip()

            # Tickers: explicit from the source, else extracted from text.
            syms = doc.get("symbols")
            tickers = ({s.upper() for s in syms} if syms is not None
                       else extract_tickers(text))
            if not tickers:
                continue  # only store ticker-bearing documents

            posts_seen += 1
            sent = doc.get("sentiment")
            if sent is None:
                sent = sentiment.score(text)
            weight = doc.get("weight")
            if weight is None:
                weight = 1.0 + math.log1p(max(doc.get("score", 0), 0))
            created = int(doc.get("created_utc", now))
            subreddit = doc.get("subreddit_hint") or src

            row = {
                "id": doc["id"], "source": src, "subreddit": subreddit,
                "kind": doc.get("kind", "post"), "title": doc.get("title"),
                "body": doc.get("body"), "author": doc.get("author"),
                "permalink": doc.get("permalink", ""),
                "score": doc.get("score", 0),
                "num_comments": doc.get("num_comments", 0),
                "created_utc": created, "sentiment": sent, "fetched_at": now,
            }
            with db.cursor() as cur:
                _upsert_post(cur, row)
                _insert_mentions(cur, tickers, doc["id"], src, subreddit,
                                 row["kind"], sent, weight, created)
            mentions_added += len(tickers)
            per_source[src] = per_source.get(src, 0) + len(tickers)

    with db.cursor() as cur:
        cur.execute(
            "UPDATE ingest_runs SET finished_at=?, posts_seen=?, mentions=?, note=? WHERE id=?",
            (int(time.time()), posts_seen, mentions_added,
             ", ".join(f"{k}:{v}" for k, v in per_source.items()) or "no data",
             run_id),
        )

    result = {"posts_seen": posts_seen, "mentions_added": mentions_added,
              "per_source": per_source}
    print(f"[ingest] done: {result}")
    return result


if __name__ == "__main__":
    ingest_once()
