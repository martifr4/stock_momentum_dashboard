"""StockTwits source: retail traders' cashtag social network.

Highest-signal non-Reddit source -- messages carry explicit ticker symbols and
often a user-tagged Bullish/Bearish sentiment, which we trust over the lexicon.
"""
from __future__ import annotations

import calendar
import math
import time
from datetime import datetime

import config
import watchlist
from sources.http_util import get_json

SOURCE = "stocktwits"
_API = "https://api.stocktwits.com/api/2"


def _parse_ts(iso: str) -> int:
    try:
        dt = datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ")
        return calendar.timegm(dt.timetuple())
    except (ValueError, TypeError):
        return int(time.time())


def _trending_symbols(limit: int) -> list[str]:
    j = get_json(f"{_API}/trending/symbols.json?limit={limit}")
    if not j:
        return []
    out = []
    for s in j.get("symbols", []):
        sym = (s.get("symbol") or "").upper()
        if sym and not sym.endswith(".X"):  # skip crypto (.X)
            out.append(sym)
    return out


def _stream(symbol: str) -> list[dict]:
    j = get_json(f"{_API}/streams/symbol/{symbol}.json")
    if not j:
        return []
    docs = []
    for m in j.get("messages", []):
        mid = m.get("id")
        body = m.get("body") or ""
        user = m.get("user") or {}
        uname = user.get("username", "")
        # Engagement on the message itself (comparable across sources), not the
        # author's follower count -- otherwise big accounts drown everything out.
        likes = (m.get("likes") or {}).get("total", 0) or 0
        sent_tag = ((m.get("entities") or {}).get("sentiment") or {})
        basic = sent_tag.get("basic") if isinstance(sent_tag, dict) else None
        explicit_sent = 1.0 if basic == "Bullish" else -1.0 if basic == "Bearish" else None
        syms = [s.get("symbol", "").upper() for s in m.get("symbols", [])]
        syms = [s for s in syms if s and not s.endswith(".X")]
        docs.append({
            "id": f"st_{mid}",
            "source": SOURCE,
            "kind": "message",
            "title": None,
            "body": body,
            "author": uname,
            "permalink": f"https://stocktwits.com/{uname}/message/{mid}",
            "score": int(likes),
            "created_utc": _parse_ts(m.get("created_at", "")),
            "symbols": syms or None,
            "sentiment": explicit_sent,
            "weight": 1.0 + math.log1p(max(likes, 0)),
        })
    return docs


def fetch() -> list[dict]:
    symbols = watchlist.polling_symbols(config.MAX_WATCHLIST_PER_RUN)
    for s in _trending_symbols(config.STOCKTWITS_TRENDING):
        if s not in symbols:
            symbols.append(s)

    docs: list[dict] = []
    for sym in symbols:
        got = _stream(sym)
        docs.extend(got)
        print(f"[stocktwits] ${sym}: {len(got)} messages")
        time.sleep(0.6)  # be gentle on the ~200 req/hr limit
    return docs


if __name__ == "__main__":
    d = fetch()
    print(f"total {len(d)} messages")
    for x in d[:3]:
        print(x["symbols"], x["sentiment"], x["body"][:60])
