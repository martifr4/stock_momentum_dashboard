"""Analytics: probability changes -> sector / industry / stock / region impact.

Impact model (per market m, over a window):

    dp        = prob_now - prob_at(now - window)          (in points, -100..100)
    weight    = min(1.5, log10(1 + volume) / 6)            ($1M lifetime -> 1.0)
              * time_weight                                (damps markets expiring < 7d)
              * us_weight                                  (non-US spillover)
              / n_markets_in_event                         (a 13-outcome ladder counts once)
    pressure_e += dp * polarity(m, topic) * beta(topic, e) * weight

`pressure` is signed (bullish > 0 / bearish < 0); `attention` is the same sum
of absolute values without polarity, so ambiguous markets (polarity 0) still
show where the market is paying attention.
"""
from __future__ import annotations

import math
import re
import time
from collections import defaultdict

from markets import store
from markets.impact_map import (GROUPS, INDUSTRIES, INDUSTRY_ROLLUP, REGIONS, SECTORS,
                                TOPICS, exposure, exposure_sector)

WINDOWS = {"24h": 86400, "7d": 7 * 86400, "30d": 30 * 86400}
_SRC_CHG = {"24h": "src_chg_1d", "7d": "src_chg_1w", "30d": "src_chg_1m"}


def _window(w: str) -> tuple[str, int]:
    w = (w or "24h").lower()
    return (w, WINDOWS[w]) if w in WINDOWS else ("24h", WINDOWS["24h"])


def volume_weight(volume: float) -> float:
    return min(1.5, math.log10(1 + max(volume or 0, 0)) / 6)


def _load(conn, source=None, group=None, region=None, topic=None, q=None, include_inactive=False):
    sql, args = "SELECT * FROM markets WHERE 1=1", []
    if not include_inactive:
        sql += " AND active=1"
    if source:
        sql += " AND source=?"
        args.append(source)
    ms = [store.row_to_market(r) for r in conn.execute(sql, args)]
    if group:
        ms = [m for m in ms if any(TOPICS[t]["group"] == group for t in m["topics"] if t in TOPICS)]
    if topic:
        ms = [m for m in ms if topic in m["topics"]]
    if region:
        ms = [m for m in ms if region in m["regions"]]
    if q:
        rx = re.compile(re.escape(q), re.IGNORECASE)
        ms = [m for m in ms if rx.search(f"{m['event_title']} {m['question']} {m['outcome']}")]
    return ms


def _with_changes(conn, ms: list[dict], window: str, now: int) -> list[dict]:
    """Attach `change` (probability delta over the window, or None)."""
    w, secs = _window(window)
    past = store.probs_at(conn, now - secs, min_ts=now - secs - max(6 * 3600, secs // 2))
    for m in ms:
        before = past.get(m["id"])
        if before is not None:
            m["change"] = m["prob"] - before
        elif m.get(_SRC_CHG[w]) is not None:
            m["change"] = m[_SRC_CHG[w]]
        else:
            m["change"] = None
        m["is_new"] = (m.get("created_ts") or 0) >= now - secs
        m["expired"] = m.get("end_ts") is not None and m["end_ts"] < now
    return ms


def _group_of(m: dict) -> str:
    for t in m["topics"]:
        if t in TOPICS:
            return TOPICS[t]["group"]
    return "macro"


def _public(m: dict) -> dict:
    keys = ("id", "source", "event_id", "event_title", "question", "outcome", "url", "prob", "change",
            "volume", "volume24h", "liquidity", "regions", "topics", "created_ts", "end_ts", "first_seen",
            "is_new")
    d = {k: m.get(k) for k in keys}
    d["group"] = _group_of(m)
    return d


# ---------------------------------------------------------------------------
# Impact
# ---------------------------------------------------------------------------
def time_weight(m: dict, now: int) -> float:
    """Damp markets about to expire: a "by Sep 30?" market sliding toward NO
    as the date nears is mostly time decay, not news."""
    end = m.get("end_ts")
    if end is None:
        return 1.0
    left = end - now
    return 0.3 if left < 3 * 86400 else 0.6 if left < 7 * 86400 else 1.0


def compute_impact(ms: list[dict], now: int | None = None) -> dict:
    """Aggregate per-exposure pressure / attention from markets with changes."""
    now = int(now or time.time())
    event_size = defaultdict(int)
    for m in ms:
        event_size[m["event_id"]] += 1

    pressure = defaultdict(float)
    attention = defaultdict(float)
    matrix = defaultdict(float)                 # (sector, topic) -> pressure
    topic_pressure = defaultdict(float)         # topic -> signed "move in its + direction"
    topic_attention = defaultdict(float)
    drivers = defaultdict(list)                 # exposure -> [(contrib, market)]
    region_att = defaultdict(float)
    region_n = defaultdict(int)

    for m in ms:
        if m.get("change") is None or m.get("expired"):
            continue
        dp = m["change"] * 100
        w = volume_weight(m["volume"]) * time_weight(m, now) / event_size[m["event_id"]]
        for r in m["regions"]:
            region_att[r] += abs(dp) * w
            region_n[r] += 1
        for tid, pol in m["topics"].items():
            t = TOPICS.get(tid)
            if not t:
                continue
            topic_pressure[tid] += dp * pol * w
            topic_attention[tid] += abs(dp) * w
            ew = w * m.get("us_weight", 1.0)
            for eid, beta in t["betas"].items():
                c = dp * pol * beta * ew
                pressure[eid] += c
                attention[eid] += abs(dp * beta) * ew
                share = 1.0 if eid in SECTORS else INDUSTRY_ROLLUP
                matrix[(exposure_sector(eid), tid)] += c * share
                if c:
                    drivers[eid].append((c, tid, m))
    return {"pressure": pressure, "attention": attention, "matrix": matrix, "drivers": drivers,
            "topic_pressure": topic_pressure, "topic_attention": topic_attention,
            "region_att": region_att, "region_n": region_n}


def _driver_list(items, n=5):
    items = sorted(items, key=lambda x: -abs(x[0]))[:n]
    return [{"contrib": round(c, 3), "topic": tid, "topic_label": TOPICS[tid]["label"],
             "id": m["id"], "question": m["question"], "outcome": m["outcome"], "url": m["url"],
             "prob": m["prob"], "change": m["change"], "source": m["source"]} for c, tid, m in items]


def impact(window="24h", source=None, group=None, region=None, now=None) -> dict:
    now = int(now or time.time())
    with store.connect() as conn:
        ms = _with_changes(conn, _load(conn, source, group, region), window, now)
    agg = compute_impact(ms, now)
    P, A = agg["pressure"], agg["attention"]

    sectors = []
    for sid, s in SECTORS.items():
        inds = [i for i, v in INDUSTRIES.items() if v["sector"] == sid]
        net = P[sid] + INDUSTRY_ROLLUP * sum(P[i] for i in inds)
        att = A[sid] + INDUSTRY_ROLLUP * sum(A[i] for i in inds)
        drv = agg["drivers"][sid] + [d for i in inds for d in agg["drivers"][i]]
        sectors.append({"id": sid, "label": s["label"], "etf": s["etf"], "net": round(net, 3),
                        "attention": round(att, 3), "drivers": _driver_list(drv)})
    sectors.sort(key=lambda x: -abs(x["net"]))

    industries = [{"id": iid, "label": v["label"], "sector": v["sector"], "etf": v["etf"],
                   "stocks": v["stocks"], "net": round(P[iid], 3), "attention": round(A[iid], 3),
                   "drivers": _driver_list(agg["drivers"][iid], 3)}
                  for iid, v in INDUSTRIES.items()]
    industries.sort(key=lambda x: -abs(x["net"]))

    # Stocks: an industry's pressure hits its constituents fully; a sector's
    # own (direct) pressure hits its representative stocks at 0.7.
    stock_score = defaultdict(float)
    stock_via = defaultdict(list)
    for eid in list(SECTORS) + list(INDUSTRIES):
        v = P[eid]
        if not v:
            continue
        k = 1.0 if eid in INDUSTRIES else 0.7
        for tk in exposure(eid)["stocks"]:
            stock_score[tk] += v * k
            stock_via[tk].append(exposure(eid)["label"])
    stocks = [{"ticker": tk, "score": round(sc, 3), "via": stock_via[tk]}
              for tk, sc in stock_score.items() if abs(sc) >= 0.005]
    stocks.sort(key=lambda x: -x["score"])

    topics_used = sorted({t for (_, t) in agg["matrix"]}, key=lambda t: -agg["topic_attention"][t])
    matrix = {
        "rows": [{"id": s, "label": SECTORS[s]["label"]} for s in SECTORS],
        "cols": [{"id": t, "label": TOPICS[t]["label"], "group": TOPICS[t]["group"]} for t in topics_used],
        "cells": [{"sector": s, "topic": t, "value": round(v, 3)} for (s, t), v in agg["matrix"].items() if v],
    }

    topics = [{"id": t, "label": TOPICS[t]["label"], "group": TOPICS[t]["group"],
               "direction": TOPICS[t]["direction"], "net": round(agg["topic_pressure"][t], 3),
               "attention": round(agg["topic_attention"][t], 3),
               "markets": sum(1 for m in ms if t in m["topics"])}
              for t in TOPICS if agg["topic_attention"][t] or any(t in m["topics"] for m in ms)]
    topics.sort(key=lambda x: -x["attention"])

    regions = [{"id": r, "label": REGIONS[r]["label"], "etf": REGIONS[r]["etf"],
                "attention": round(agg["region_att"][r], 3),
                "markets": sum(1 for m in ms if r in m["regions"]),
                "new": sum(1 for m in ms if r in m["regions"] and m["is_new"])}
               for r in REGIONS if any(r in m["regions"] for m in ms)]
    regions.sort(key=lambda x: -x["attention"])

    return {"window": _window(window)[0], "sectors": sectors, "industries": industries,
            "stocks": {"bullish": [s for s in stocks if s["score"] > 0][:15],
                       "bearish": sorted([s for s in stocks if s["score"] < 0], key=lambda x: x["score"])[:15]},
            "matrix": matrix, "topics": topics, "regions": regions,
            "markets_with_change": sum(1 for m in ms if m.get("change") is not None)}


# ---------------------------------------------------------------------------
# Feeds
# ---------------------------------------------------------------------------
def overview(window="24h", now=None) -> dict:
    now = int(now or time.time())
    w, secs = _window(window)
    with store.connect() as conn:
        ms = _with_changes(conn, _load(conn), w, now)
        n_alerts = conn.execute("SELECT kind, COUNT(*) n FROM alerts WHERE ts>=? GROUP BY kind",
                                (now - secs,)).fetchall()
        last_run = conn.execute("SELECT * FROM runs ORDER BY id DESC LIMIT 1").fetchone()
        n_snap = conn.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0]
    by_src = defaultdict(int)
    by_group = defaultdict(int)
    for m in ms:
        by_src[m["source"]] += 1
        by_group[_group_of(m)] += 1
    movers = [m for m in ms if m.get("change") is not None and not m["expired"]]
    big = [m for m in movers if abs(m["change"]) >= 0.05 and m["volume"] >= 10000]
    return {
        "window": w,
        "tracked": len(ms),
        "events": len({m["event_id"] for m in ms}),
        "by_source": dict(by_src),
        "by_group": {GROUPS[g]: n for g, n in by_group.items()},
        "new_markets": sum(1 for m in ms if m["is_new"]),
        "big_moves": len(big),
        "volume24h": round(sum(m["volume24h"] or 0 for m in ms)),
        "alerts": {r["kind"]: r["n"] for r in n_alerts},
        "last_run": dict(last_run) if last_run else None,
        "snapshots": n_snap,
    }


def alerts(window="7d", kind=None, group=None, limit=100, now=None) -> list[dict]:
    now = int(now or time.time())
    _, secs = _window(window)
    sql = """SELECT a.*, m.question, m.outcome, m.event_title, m.url, m.source, m.topics, m.regions,
                    m.volume, m.volume24h, m.prob AS prob_now
             FROM alerts a JOIN markets m ON m.id = a.market_id WHERE a.ts >= ?"""
    args: list = [now - secs]
    if kind:
        sql += " AND a.kind = ?"
        args.append(kind)
    sql += " ORDER BY a.ts DESC, ABS(COALESCE(a.value, 0)) DESC LIMIT ?"
    args.append(max(limit * 3, limit))
    with store.connect() as conn:
        rows = [store.row_to_market(r) for r in conn.execute(sql, args)]
    out = []
    for r in rows:
        r["group"] = _group_of(r)
        if group and r["group"] != group:
            continue
        # Which exposures does this market touch the most?
        exp = defaultdict(float)
        for tid, pol in r["topics"].items():
            for eid, beta in TOPICS.get(tid, {}).get("betas", {}).items():
                exp[eid] += beta * (pol if pol else 0)
        sign = 1 if (r["kind"] != "prob_move" or (r["value"] or 0) >= 0) else -1
        r["exposures"] = [{"id": e, "label": exposure(e)["label"], "dir": round(v * sign, 2)}
                          for e, v in sorted(exp.items(), key=lambda x: -abs(x[1]))[:4] if v]
        out.append(r)
        if len(out) >= limit:
            break
    return out


def markets(window="24h", source=None, group=None, region=None, topic=None, q=None,
            sort="move", limit=200, now=None) -> list[dict]:
    now = int(now or time.time())
    with store.connect() as conn:
        ms = _with_changes(conn, _load(conn, source, group, region, topic, q), window, now)
    keyf = {
        "move": lambda m: -abs(m["change"] or 0) * volume_weight(m["volume"]),
        "volume": lambda m: -(m["volume24h"] or 0),
        "new": lambda m: -(m.get("created_ts") or 0),
        "prob": lambda m: -m["prob"],
    }.get(sort, lambda m: -abs(m["change"] or 0))
    ms.sort(key=keyf)
    return [_public(m) for m in ms[:limit]]


def market_detail(market_id: str, now=None) -> dict | None:
    now = int(now or time.time())
    with store.connect() as conn:
        r = conn.execute("SELECT * FROM markets WHERE id=?", (market_id,)).fetchone()
        if not r:
            return None
        m = store.row_to_market(r)
        series = [{"ts": s["ts"], "prob": s["prob"], "volume": s["volume"]} for s in conn.execute(
            "SELECT ts, prob, volume FROM snapshots WHERE market_id=? ORDER BY ts", (market_id,))]
        siblings = [store.row_to_market(x) for x in conn.execute(
            "SELECT * FROM markets WHERE event_id=? AND active=1 ORDER BY prob DESC", (m["event_id"],))]
        al = [dict(a) for a in conn.execute(
            "SELECT * FROM alerts WHERE market_id=? ORDER BY ts DESC LIMIT 20", (market_id,))]
        _with_changes(conn, [m] + siblings, "24h", now)
    # Per-exposure sensitivity to +10 pts on this market.
    exp = defaultdict(float)
    for tid, pol in m["topics"].items():
        for eid, beta in TOPICS.get(tid, {}).get("betas", {}).items():
            exp[eid] += 10 * pol * beta * m.get("us_weight", 1.0)
    return {
        **_public(m),
        "series": series,
        "alerts": al,
        "topic_info": [{"id": t, "label": TOPICS[t]["label"], "direction": TOPICS[t]["direction"],
                        "polarity": p} for t, p in m["topics"].items() if t in TOPICS],
        "sensitivity": [{"id": e, "label": exposure(e)["label"], "etf": exposure(e)["etf"],
                         "stocks": exposure(e)["stocks"], "per10": round(v, 2)}
                        for e, v in sorted(exp.items(), key=lambda x: -abs(x[1])) if v],
        "siblings": [_public(s) for s in siblings[:30]],
    }


def taxonomy() -> dict:
    return {
        "groups": GROUPS,
        "topics": [{"id": t, "label": v["label"], "group": v["group"], "direction": v["direction"],
                    "betas": v["betas"]} for t, v in TOPICS.items()],
        "sectors": [{"id": k, **v} for k, v in SECTORS.items()],
        "industries": [{"id": k, **v} for k, v in INDUSTRIES.items()],
        "regions": [{"id": k, "label": v["label"], "etf": v["etf"]} for k, v in REGIONS.items()],
    }
