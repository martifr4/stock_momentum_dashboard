"""Ingestion: fetch venues -> classify -> upsert -> snapshot -> alerts.

Run on a schedule (e.g. every 15-60 min) so probability history accumulates:

    python backend/markets/ingest.py
"""
from __future__ import annotations

import json
import os
import sys
import time

if __package__ in (None, ""):  # allow `python backend/markets/ingest.py`
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config  # noqa: E402
from markets import store  # noqa: E402
from markets.classify import classify  # noqa: E402

DAY = 86400
# Store a snapshot when the price moved at least this much, or when the last
# one is older than SNAPSHOT_EVERY - keeps history compact but gap-free.
SNAPSHOT_MIN_MOVE = 0.005
SNAPSHOT_EVERY = 3 * 3600
SNAPSHOT_RETENTION_DAYS = 180
NEAR_CERTAIN = 0.95


def _recent_alert(cur, market_id: str, kind: str, since: int):
    return cur.execute(
        "SELECT value FROM alerts WHERE market_id=? AND kind=? AND ts>=? ORDER BY ts DESC LIMIT 1",
        (market_id, kind, since)).fetchone()


def _alert(cur, now, market_id, kind, value=None, before=None, after=None, detail=""):
    cur.execute(
        "INSERT INTO alerts (ts, market_id, kind, value, prob_before, prob_after, detail) VALUES (?,?,?,?,?,?,?)",
        (now, market_id, kind, value, before, after, detail))


def process(markets: list[dict], now: int | None = None, fetched_sources: set | None = None) -> dict:
    """Store a batch of normalized markets and emit alerts. Returns a summary."""
    now = int(now or time.time())
    store.init_db()
    conn = store.connect()
    cur = conn.cursor()

    existing = {r["id"]: dict(r) for r in cur.execute(
        "SELECT id, prob, first_seen, active FROM markets")}
    baseline = not existing
    last_snap = {r["market_id"]: (r["ts"], r["prob"]) for r in cur.execute(
        """SELECT s.market_id, s.ts, s.prob FROM snapshots s
           JOIN (SELECT market_id, MAX(ts) mts FROM snapshots GROUP BY market_id) x
             ON x.market_id=s.market_id AND x.mts=s.ts""")}
    day_ago = store.probs_at(conn, now - DAY, min_ts=now - DAY - 6 * 3600)

    seen: set[str] = set()
    new_by_event: dict[str, list[dict]] = {}
    # Threshold ladders ("gas above $4.47 / $4.48 / ...") move together; alert
    # once per event, on its largest mover.
    moves_by_event: dict[str, tuple] = {}
    n_alerts = 0
    kept = 0

    for m in markets:
        if m["id"] in seen:
            continue
        seen.add(m["id"])
        cls = classify(m)
        if not cls["topics"]:
            continue
        kept += 1
        prev = existing.get(m["id"])
        cur.execute(
            """INSERT INTO markets (id, source, event_id, event_title, question, outcome, url, category,
                   tags, topics, regions, us_weight, created_ts, end_ts, first_seen, last_seen, prob,
                   volume, volume24h, volume1wk, liquidity, src_chg_1d, src_chg_1w, src_chg_1m, active)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
               ON CONFLICT(id) DO UPDATE SET
                 event_title=excluded.event_title, question=excluded.question, outcome=excluded.outcome,
                 url=excluded.url, category=excluded.category, tags=excluded.tags, topics=excluded.topics,
                 regions=excluded.regions, us_weight=excluded.us_weight, end_ts=excluded.end_ts,
                 last_seen=excluded.last_seen, prob=excluded.prob, volume=excluded.volume,
                 volume24h=excluded.volume24h, volume1wk=excluded.volume1wk, liquidity=excluded.liquidity,
                 src_chg_1d=excluded.src_chg_1d, src_chg_1w=excluded.src_chg_1w,
                 src_chg_1m=excluded.src_chg_1m, active=1""",
            (m["id"], m["source"], m["event_id"], m["event_title"], m["question"], m["outcome"], m["url"],
             m["category"], json.dumps(m["tags"]), json.dumps(cls["topics"]), json.dumps(cls["regions"]),
             cls["us_weight"], m["created_ts"], m["end_ts"], now, now, m["prob"], m["volume"],
             m["volume24h"], m["volume1wk"], m["liquidity"], m["src_chg_1d"], m["src_chg_1w"],
             m["src_chg_1m"]))

        # --- snapshot ---
        ls = last_snap.get(m["id"])
        if ls is None or abs(m["prob"] - ls[1]) >= SNAPSHOT_MIN_MOVE or now - ls[0] >= SNAPSHOT_EVERY:
            cur.execute("INSERT OR REPLACE INTO snapshots (market_id, ts, prob, volume, volume24h) VALUES (?,?,?,?,?)",
                        (m["id"], now, m["prob"], m["volume"], m["volume24h"]))

        # --- new market (grouped per event below) ---
        created = m.get("created_ts")
        recently_listed = created is not None and created >= now - config.NEW_MARKET_DAYS * DAY
        if prev is None and (recently_listed or (not baseline and created is None)):
            new_by_event.setdefault(m["event_id"], []).append(m)

        # --- probability move over ~24h ---
        before = day_ago.get(m["id"])
        if before is None and m.get("src_chg_1d") is not None:
            before = m["prob"] - m["src_chg_1d"]
        # Markets past their end date are just decaying toward resolution.
        expired = m.get("end_ts") is not None and m["end_ts"] < now
        if before is not None and not expired and m["volume"] >= config.ALERT_MOVE_MIN_VOLUME:
            move = m["prob"] - before
            if abs(move) >= config.ALERT_PROB_MOVE:
                best = moves_by_event.get(m["event_id"])
                if best is None or abs(move) > abs(best[1]):
                    moves_by_event[m["event_id"]] = (m, move, before)

        # --- volume spike: 24h volume vs 7-day daily average ---
        wk = m.get("volume1wk")
        if wk and m["volume24h"] >= config.ALERT_SPIKE_MIN_24H:
            avg = max((wk - m["volume24h"]) / 6.0, 1.0)
            ratio = m["volume24h"] / avg
            if ratio >= config.ALERT_VOLUME_SPIKE and not _recent_alert(cur, m["id"], "volume_spike", now - DAY):
                _alert(cur, now, m["id"], "volume_spike", ratio, None, m["prob"],
                       f"24h volume {ratio:.1f}x the 7-day average")
                n_alerts += 1

        # --- crossing into near-certainty ---
        if prev and prev["prob"] is not None:
            for lvl, crossed in ((NEAR_CERTAIN, prev["prob"] < NEAR_CERTAIN <= m["prob"]),
                                 (1 - NEAR_CERTAIN, prev["prob"] > 1 - NEAR_CERTAIN >= m["prob"])):
                if crossed and m["volume"] >= config.ALERT_MOVE_MIN_VOLUME:
                    _alert(cur, now, m["id"], "near_certain", m["prob"], prev["prob"], m["prob"],
                           f"crossed {lvl:.0%}")
                    n_alerts += 1

    for m, move, before in moves_by_event.values():
        last = _recent_alert(cur, m["id"], "prob_move", now - DAY // 2)
        if last is None or abs(move) >= abs(last["value"] or 0) + 0.03:
            _alert(cur, now, m["id"], "prob_move", move, before, m["prob"], f"{move * 100:+.1f} pts in 24h")
            n_alerts += 1

    # One "new market" alert per event (multi-outcome events list many markets).
    for ev_id, ms in new_by_event.items():
        top = max(ms, key=lambda x: x["volume"])
        detail = f"{len(ms)} outcome{'s' if len(ms) > 1 else ''}" if len(ms) > 1 else "new listing"
        _alert(cur, now, top["id"], "new_market", len(ms), None, top["prob"], detail)
        n_alerts += 1

    # Markets that vanished from a venue that fetched fine are closed/resolved.
    for src in (fetched_sources or set()):
        cur.execute("UPDATE markets SET active=0 WHERE source=? AND active=1 AND last_seen < ?", (src, now))

    cur.execute("DELETE FROM snapshots WHERE ts < ?", (now - SNAPSHOT_RETENTION_DAYS * DAY,))
    conn.commit()
    conn.close()
    return {"kept": kept, "new_events": len(new_by_event), "alerts": n_alerts, "baseline": baseline}


def ingest_once() -> dict:
    from markets.sources import fetch_all

    store.init_db()
    started = int(time.time())
    markets, counts = fetch_all()
    fetched_ok = {s for s, n in counts.items() if n > 0}
    summary = process(markets, now=started, fetched_sources=fetched_ok)
    summary["fetched"] = counts
    with store.connect() as conn:
        conn.execute(
            "INSERT INTO runs (started_at, finished_at, n_markets, n_new, n_alerts, note) VALUES (?,?,?,?,?,?)",
            (started, int(time.time()), summary["kept"], summary["new_events"], summary["alerts"],
             json.dumps(counts)))
        conn.commit()
    print(f"[markets] kept {summary['kept']} relevant markets, "
          f"{summary['new_events']} new events, {summary['alerts']} alerts")
    return summary


if __name__ == "__main__":
    ingest_once()
