"""Reddit source adapter -- wraps reddit_client into the common document shape.

Requires OAuth credentials (see README); returns [] gracefully if Reddit blocks
the requests, so the other sources still ingest.
"""
from __future__ import annotations

import math
import time

import config
import reddit_client

SOURCE = "reddit"


def _weight(score: int) -> float:
    return 1.0 + math.log1p(max(score, 0))


def fetch() -> list[dict]:
    now = int(time.time())
    docs: list[dict] = []
    for sub in config.SUBREDDITS:
        try:
            posts = reddit_client.fetch_listing(sub, config.LISTING,
                                                config.POSTS_PER_SUB)
        except Exception as e:  # noqa: BLE001
            print(f"[reddit] {sub}: fetch failed: {e}")
            continue
        if not posts:
            continue
        print(f"[reddit] r/{sub}: {len(posts)} posts")
        for p in posts:
            title = p.get("title") or ""
            body = p.get("selftext") or ""
            created = int(p.get("created_utc", now))
            docs.append({
                "id": p.get("name") or ("t3_" + p.get("id", "")),
                "source": SOURCE,
                "kind": "post",
                "title": title,
                "body": body,
                "author": p.get("author"),
                "permalink": "https://reddit.com" + (p.get("permalink") or ""),
                "score": p.get("score", 0),
                "num_comments": p.get("num_comments", 0),
                "created_utc": created,
                "subreddit_hint": sub,
                "symbols": None,      # extract from text
                "sentiment": None,    # lexicon
                "weight": _weight(p.get("score", 0)),
            })

            if config.COMMENTS_PER_POST and p.get("num_comments", 0) > 0:
                for c in reddit_client.fetch_comments(sub, p.get("id", ""),
                                                      config.COMMENTS_PER_POST):
                    cbody = c.get("body") or ""
                    if not cbody:
                        continue
                    docs.append({
                        "id": c.get("name") or ("t1_" + c.get("id", "")),
                        "source": SOURCE,
                        "kind": "comment",
                        "title": None,
                        "body": cbody,
                        "author": c.get("author"),
                        "permalink": "https://reddit.com" + (c.get("permalink") or ""),
                        "score": c.get("score", 0),
                        "num_comments": 0,
                        "created_utc": int(c.get("created_utc", created)),
                        "subreddit_hint": sub,
                        "symbols": None,
                        "sentiment": None,
                        "weight": _weight(c.get("score", 0)),
                    })
    return docs
