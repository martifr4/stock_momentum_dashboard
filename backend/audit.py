"""Validation audit runner.

Dispatches every stored mention to its source's agent (see backend/agents/),
records a verdict per mention in the `mention_audits` table, and can print a
summary report. Non-destructive: it never changes mentions or momentum -- it
only writes audit verdicts you can review (and query via /api/audit).

Usage:
    python backend/audit.py                # audit all mentions, print report
    python backend/audit.py --source reddit
    python backend/audit.py --days 30      # only mentions from the last 30 days
    python backend/audit.py --flags        # after auditing, list flagged mentions
"""
from __future__ import annotations

import argparse
import sys
import time

import db
from agents import agent_for


def _fetch_mentions(source: str | None, since: int | None) -> list[dict]:
    """Join mentions to their post text for auditing."""
    where = []
    params: list = []
    if source:
        where.append("m.source = ?")
        params.append(source)
    if since:
        where.append("m.created_utc >= ?")
        params.append(since)
    clause = (" WHERE " + " AND ".join(where)) if where else ""
    with db.cursor() as c:
        c.execute(
            f"""SELECT m.ticker, m.post_id, m.source, m.sentiment, m.weight,
                       m.kind, p.title, p.body, p.author, p.score, p.permalink,
                       p.created_utc
                FROM mentions m JOIN posts p ON p.id = m.post_id{clause}""",
            params,
        )
        return [dict(r) for r in c.fetchall()]


def _store(verdicts, audited_at: int) -> None:
    rows = [v.to_row(audited_at) for v in verdicts]
    if not rows:
        return
    with db.cursor() as c:
        c.executemany(
            """INSERT INTO mention_audits
               (ticker, post_id, source, status, legit, agrees,
                stored_sentiment, agent_sentiment, confidence, reasons, audited_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(ticker, post_id) DO UPDATE SET
                 source=excluded.source, status=excluded.status,
                 legit=excluded.legit, agrees=excluded.agrees,
                 stored_sentiment=excluded.stored_sentiment,
                 agent_sentiment=excluded.agent_sentiment,
                 confidence=excluded.confidence, reasons=excluded.reasons,
                 audited_at=excluded.audited_at""",
            rows,
        )


def audit(source: str | None = None, since: int | None = None) -> dict:
    """Audit stored mentions and persist verdicts. Returns run stats."""
    db.init_db()
    audited_at = int(time.time())
    mentions = _fetch_mentions(source, since)

    verdicts = [agent_for(m["source"]).review(m, m) for m in mentions]
    _store(verdicts, audited_at)

    flagged = [v for v in verdicts if v.status == "flag"]
    per_source: dict[str, dict] = {}
    for v in verdicts:
        s = per_source.setdefault(v.source, {"audited": 0, "flagged": 0})
        s["audited"] += 1
        s["flagged"] += 1 if v.status == "flag" else 0

    return {
        "audited": len(verdicts),
        "flagged": len(flagged),
        "illegitimate": sum(1 for v in flagged if not v.legit),
        "disagreements": sum(1 for v in flagged if v.legit and not v.agrees),
        "per_source": per_source,
        "audited_at": audited_at,
    }


def summary() -> dict:
    """Read-side summary of stored audit verdicts (used by /api/audit)."""
    db.init_db()
    with db.cursor() as c:
        c.execute("SELECT COUNT(*) AS n FROM mention_audits")
        total = c.fetchone()["n"]
        c.execute(
            """SELECT source,
                      COUNT(*) AS audited,
                      SUM(CASE WHEN status='flag' THEN 1 ELSE 0 END) AS flagged,
                      SUM(CASE WHEN legit=0 THEN 1 ELSE 0 END) AS illegitimate,
                      SUM(CASE WHEN legit=1 AND agrees=0 THEN 1 ELSE 0 END) AS disagreements
               FROM mention_audits GROUP BY source ORDER BY flagged DESC""")
        by_source = [dict(r) for r in c.fetchall()]
        c.execute(
            """SELECT a.ticker, a.post_id, a.source, a.reasons, a.legit, a.agrees,
                      a.stored_sentiment, a.agent_sentiment, a.confidence,
                      p.permalink, p.title, p.body
               FROM mention_audits a LEFT JOIN posts p ON p.id = a.post_id
               WHERE a.status='flag'
               ORDER BY a.audited_at DESC, a.confidence DESC LIMIT 50""")
        recent_flags = []
        for r in c.fetchall():
            d = dict(r)
            snippet = (d.pop("title", None) or d.pop("body", None) or "").strip()
            d.pop("body", None)
            d["snippet"] = snippet[:200] + ("..." if len(snippet) > 200 else "")
            recent_flags.append(d)
        c.execute("SELECT MAX(audited_at) AS t FROM mention_audits")
        last = c.fetchone()["t"]
    flagged = sum(s["flagged"] or 0 for s in by_source)
    return {
        "total_audited": total,
        "total_flagged": flagged,
        "flag_rate": round(flagged / total, 3) if total else 0.0,
        "by_source": by_source,
        "recent_flags": recent_flags,
        "last_audit": last,
    }


def _print_report(stats: dict, show_flags: bool) -> None:
    print("\n=== Mention validation audit ===")
    print(f"audited: {stats['audited']}   flagged: {stats['flagged']} "
          f"(illegitimate: {stats['illegitimate']}, "
          f"disagreements: {stats['disagreements']})")
    print("\nby source:")
    print(f"  {'source':<12} {'audited':>8} {'flagged':>8}")
    for src, s in sorted(stats["per_source"].items()):
        print(f"  {src:<12} {s['audited']:>8} {s['flagged']:>8}")

    if show_flags:
        with db.cursor() as c:
            c.execute(
                """SELECT ticker, source, reasons, stored_sentiment, agent_sentiment
                   FROM mention_audits WHERE status='flag'
                   ORDER BY audited_at DESC, confidence DESC LIMIT 40""")
            rows = c.fetchall()
        if rows:
            print("\nflagged mentions (up to 40):")
            for r in rows:
                print(f"  ${r['ticker']:<6} [{r['source']:<10}] "
                      f"stored={r['stored_sentiment']:+.2f} "
                      f"agent={r['agent_sentiment']:+.2f}  {r['reasons']}")
    print()


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Audit stored mentions for legitimacy "
                                             "and sentiment agreement.")
    ap.add_argument("--source", help="only audit one source "
                                      "(reddit|stocktwits|hackernews|yahoo_news)")
    ap.add_argument("--days", type=int, help="only audit mentions from the last N days")
    ap.add_argument("--flags", action="store_true", help="list flagged mentions")
    args = ap.parse_args(argv)

    since = int(time.time()) - args.days * 86400 if args.days else None
    stats = audit(source=args.source, since=since)
    _print_report(stats, show_flags=args.flags)
    return 0


if __name__ == "__main__":
    sys.exit(main())
