"""Yahoo Finance news source: per-ticker headline RSS feeds.

News is a major driver of retail attention. Each watchlist ticker has its own
feed; we attribute every headline to that ticker and score the headline text.
"""
from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

import config
import watchlist
from sources.http_util import get_text

SOURCE = "yahoo_news"
_FEED = "https://feeds.finance.yahoo.com/rss/2.0/headline?s={sym}&region=US&lang=en-US"
_TAG_RE = re.compile(r"<[^>]+>")

# News reaches a broad audience -> a fixed, above-average influence weight.
NEWS_WEIGHT = 3.0


def _clean(text: str) -> str:
    return _TAG_RE.sub("", text or "").strip()


def _parse_pubdate(s: str) -> int | None:
    try:
        return int(parsedate_to_datetime(s).timestamp())
    except (TypeError, ValueError):
        return None


def _feed(symbol: str) -> list[dict]:
    raw = get_text(_FEED.format(sym=symbol))
    if not raw:
        return []
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return []
    docs = []
    for it in root.findall(".//item"):
        title = _clean(it.findtext("title") or "")
        if not title:
            continue
        link = it.findtext("link") or ""
        guid = it.findtext("guid") or link
        desc = _clean(it.findtext("description") or "")
        pub = _parse_pubdate(it.findtext("pubDate") or "")
        if pub is None:
            continue
        docs.append({
            "id": f"yh_{abs(hash(guid)) & 0xFFFFFFFFFFFF:x}",
            "source": SOURCE,
            "kind": "news",
            "title": title,
            "body": desc,
            "author": "yahoo_finance",
            "permalink": link,
            "score": 0,
            "created_utc": pub,
            "symbols": [symbol.upper()],
            "sentiment": None,       # lexicon scores the headline
            "weight": NEWS_WEIGHT,
        })
    return docs


def fetch() -> list[dict]:
    symbols = watchlist.polling_symbols(config.MAX_WATCHLIST_PER_RUN)
    docs: list[dict] = []
    for sym in symbols:
        got = _feed(sym)
        docs.extend(got)
        print(f"[yahoo_news] {sym}: {len(got)} headlines")
    return docs


if __name__ == "__main__":
    d = fetch()
    print(f"total {len(d)} headlines")
    for x in d[:3]:
        print(x["symbols"], x["title"][:70])
