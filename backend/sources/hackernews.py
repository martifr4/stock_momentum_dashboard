"""Hacker News source (Algolia API, free & open).

HN keyword search on bare tickers is noisy ("NVDA" collides with the NVDA screen
reader; single-letter tickers match everything). So we drive HN off a curated
ticker -> company-name query map, and attribute hits to that ticker explicitly.
Sentiment comes from the lexicon (HN has no user sentiment tags).
"""
from __future__ import annotations

import html
import math
import re
import time

from sources.http_util import get_json

_TAG_RE = re.compile(r"<[^>]+>")


def _clean(text: str) -> str:
    """Strip HTML tags and unescape entities from Algolia comment text."""
    return html.unescape(_TAG_RE.sub(" ", text or "")).strip()

SOURCE = "hackernews"
_API = "https://hn.algolia.com/api/v1/search_by_date"

# Only names where HN discussion is meaningful. Query -> attributed ticker.
HN_QUERIES: dict[str, str] = {
    "Nvidia": "NVDA", "Tesla": "TSLA", "Apple": "AAPL", "Microsoft": "MSFT",
    "Amazon": "AMZN", "Google": "GOOGL", "Palantir": "PLTR", "Coinbase": "COIN",
    "MicroStrategy": "MSTR", "Robinhood": "HOOD", "Intel": "INTC",
    "Netflix": "NFLX", "Broadcom": "AVGO", "TSMC": "TSM", "SoFi": "SOFI",
    "Micron": "MU", "Snowflake": "SNOW", "CrowdStrike": "CRWD",
    "PayPal": "PYPL", "Shopify": "SHOP", "Uber": "UBER", "AMD": "AMD",
    "Meta Platforms": "META", "Arm Holdings": "ARM",
}

# Look back this many days per run (older items accrue over time in the DB).
LOOKBACK_DAYS = 90
HITS_PER_QUERY = 30


def _search(query: str, cutoff: int) -> list[dict]:
    url = (f"{_API}?query={query.replace(' ', '%20')}"
           f"&tags=(story,comment)"
           f"&numericFilters=created_at_i%3E{cutoff}"
           f"&hitsPerPage={HITS_PER_QUERY}")
    return (get_json(url) or {}).get("hits", [])


def fetch() -> list[dict]:
    cutoff = int(time.time()) - LOOKBACK_DAYS * 86400
    docs: list[dict] = []
    for query, ticker in HN_QUERIES.items():
        hits = _search(query, cutoff)
        for h in hits:
            is_comment = h.get("comment_text") is not None
            text = _clean(h.get("comment_text")) if is_comment else _clean(
                h.get("title") or h.get("story_title") or "")
            if not text:
                continue
            points = h.get("points") or 0
            ncomments = h.get("num_comments") or 0
            oid = h.get("objectID")
            docs.append({
                "id": f"hn_{oid}",
                "source": SOURCE,
                "kind": "comment" if is_comment else "story",
                "title": None if is_comment else text,
                "body": text if is_comment else (h.get("story_text") or ""),
                "author": h.get("author"),
                "permalink": f"https://news.ycombinator.com/item?id={oid}",
                "score": int(points),
                "num_comments": int(ncomments),
                "created_utc": int(h.get("created_at_i") or cutoff),
                "symbols": [ticker],          # attributed via the query
                "sentiment": None,             # lexicon decides
                "weight": 1.0 + math.log1p(max(points, 0)),
            })
        print(f"[hackernews] {query} -> ${ticker}: {len(hits)} hits")
        time.sleep(0.3)
    return docs


if __name__ == "__main__":
    d = fetch()
    print(f"total {len(d)} HN docs")
