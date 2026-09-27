"""Fetchers for Polymarket (Gamma API) and Kalshi (public trade API v2).

Both are public, read-only and need no API key. Each fetcher returns a list
of normalized binary-market dicts:

  id, source, event_id, event_title, question, outcome, url, category, tags,
  created_ts, end_ts, prob (0..1 YES price), volume, volume24h, volume1wk,
  liquidity, src_chg_1d, src_chg_1w, src_chg_1m (source-reported price
  changes, may be None)
"""
from __future__ import annotations

import json
import time
import urllib.parse
from datetime import datetime

import config
from sources.http_util import get_json

POLY_API = "https://gamma-api.polymarket.com/events"
KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2/events"


def _ts(iso: str | None) -> int | None:
    if not iso:
        return None
    try:
        return int(datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp())
    except ValueError:
        return None


def _f(x, default=None):
    try:
        return float(x) if x not in (None, "") else default
    except (TypeError, ValueError):
        return default


# ---------------------------------------------------------------------------
# Polymarket
# ---------------------------------------------------------------------------
def _poly_market(ev: dict, m: dict, tags: list[str]) -> dict | None:
    if m.get("closed") or not m.get("active", True):
        return None
    try:
        outcomes = json.loads(m.get("outcomes") or "[]")
        prices = json.loads(m.get("outcomePrices") or "[]")
    except json.JSONDecodeError:
        return None
    if len(prices) != 2:
        return None
    bid, ask = _f(m.get("bestBid")), _f(m.get("bestAsk"))
    prob = (bid + ask) / 2 if bid and ask and 0 < ask - bid <= 0.10 else _f(prices[0])
    if prob is None:
        return None
    label = m.get("groupItemTitle") or ""
    if not label and outcomes and outcomes[0] not in ("Yes", "No"):
        label = outcomes[0]
    return {
        "id": f"polymarket:{m['id']}",
        "source": "polymarket",
        "event_id": f"polymarket:{ev.get('id')}",
        "event_title": ev.get("title") or "",
        "question": m.get("question") or ev.get("title") or "",
        "outcome": label,
        "url": f"https://polymarket.com/event/{ev.get('slug')}",
        "category": (tags[0] if tags else ""),
        "tags": tags,
        "created_ts": _ts(m.get("createdAt") or m.get("startDate")),
        "end_ts": _ts(m.get("endDate")),
        "prob": max(0.0, min(1.0, prob)),
        "volume": _f(m.get("volumeNum"), _f(m.get("volume"), 0.0)),
        "volume24h": _f(m.get("volume24hr"), 0.0),
        "volume1wk": _f(m.get("volume1wk")),
        "liquidity": _f(m.get("liquidityNum"), _f(m.get("liquidity"), 0.0)),
        "src_chg_1d": _f(m.get("oneDayPriceChange")),
        "src_chg_1w": _f(m.get("oneWeekPriceChange")),
        "src_chg_1m": _f(m.get("oneMonthPriceChange")),
    }


def fetch_polymarket() -> list[dict]:
    seen_events: set = set()
    out: list[dict] = []
    for tag in config.POLYMARKET_TAGS:
        for page in range(config.POLYMARKET_MAX_PAGES):
            q = urllib.parse.urlencode({
                "active": "true", "closed": "false", "limit": 100, "offset": page * 100,
                "tag_slug": tag, "order": "volume24hr", "ascending": "false",
            })
            events = get_json(f"{POLY_API}?{q}")
            if not events:
                break
            for ev in events:
                if ev.get("id") in seen_events:
                    continue
                seen_events.add(ev.get("id"))
                tags = [t.get("slug", "") for t in (ev.get("tags") or []) if isinstance(t, dict)]
                for m in ev.get("markets") or []:
                    nm = _poly_market(ev, m, tags)
                    if nm and nm["volume"] >= config.MARKETS_MIN_VOLUME:
                        out.append(nm)
            if len(events) < 100:
                break
            time.sleep(0.2)
    print(f"[polymarket] {len(seen_events)} events -> {len(out)} markets")
    return out


# ---------------------------------------------------------------------------
# Kalshi
# ---------------------------------------------------------------------------
def _clean(text: str | None) -> str:
    return (text or "").replace("**", "").strip()


def _kalshi_market(ev: dict, m: dict) -> dict | None:
    if m.get("status") not in (None, "active", "open"):
        return None
    bid, ask = _f(m.get("yes_bid_dollars")), _f(m.get("yes_ask_dollars"))
    last = _f(m.get("last_price_dollars"))
    if bid and ask and 0 < ask - bid <= 0.10:
        prob = (bid + ask) / 2
    else:
        prob = last
    if prob is None:
        return None
    prev = _f(m.get("previous_price_dollars"))
    series = ev.get("series_ticker") or ""
    outcome = _clean(m.get("yes_sub_title") or m.get("subtitle"))
    return {
        "id": f"kalshi:{m['ticker']}",
        "source": "kalshi",
        "event_id": f"kalshi:{ev.get('event_ticker')}",
        "event_title": _clean(ev.get("title")),
        "question": _clean(m.get("title") or ev.get("title")),
        "outcome": outcome if outcome != _clean(ev.get("title")) else "",
        "url": f"https://kalshi.com/markets/{series.lower()}",
        "category": ev.get("category") or "",
        "tags": [ev.get("category") or "", series],
        "created_ts": _ts(m.get("created_time") or m.get("open_time")),
        "end_ts": _ts(m.get("close_time")),
        "prob": max(0.0, min(1.0, prob)),
        # Kalshi contracts pay $1, so contract counts ~ USD notional.
        "volume": _f(m.get("volume_fp"), 0.0),
        "volume24h": _f(m.get("volume_24h_fp"), 0.0),
        "volume1wk": None,
        "liquidity": _f(m.get("open_interest_fp"), 0.0),
        "src_chg_1d": (last - prev) if (last is not None and prev) else None,
        "src_chg_1w": None,
        "src_chg_1m": None,
    }


def fetch_kalshi() -> list[dict]:
    out: list[dict] = []
    cursor, n_events = "", 0
    for _ in range(config.KALSHI_MAX_PAGES):
        q = {"status": "open", "limit": 200, "with_nested_markets": "true"}
        if cursor:
            q["cursor"] = cursor
        data = get_json(f"{KALSHI_API}?{urllib.parse.urlencode(q)}")
        if not data:
            break
        for ev in data.get("events") or []:
            if ev.get("category") not in config.KALSHI_CATEGORIES:
                continue
            n_events += 1
            for m in ev.get("markets") or []:
                nm = _kalshi_market(ev, m)
                if nm and nm["volume"] >= config.MARKETS_MIN_VOLUME:
                    out.append(nm)
        cursor = data.get("cursor")
        if not cursor:
            break
    print(f"[kalshi] {n_events} relevant events -> {len(out)} markets")
    return out


def fetch_all() -> tuple[list[dict], dict]:
    """Fetch every enabled venue. Returns (markets, per-source counts)."""
    markets, counts = [], {}
    for name, enabled, fn in (("polymarket", config.ENABLE_POLYMARKET, fetch_polymarket),
                              ("kalshi", config.ENABLE_KALSHI, fetch_kalshi)):
        if not enabled:
            continue
        try:
            got = fn()
        except Exception as e:  # noqa: BLE001 - one venue failing shouldn't stop the other
            print(f"[{name}] failed: {e}")
            got = []
        counts[name] = len(got)
        markets.extend(got)
    return markets, counts
