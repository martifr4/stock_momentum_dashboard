"""Data source registry. Each source module exposes `SOURCE` and `fetch()`."""
from __future__ import annotations

import config


def enabled_sources() -> list:
    """Return the list of enabled source modules."""
    mods = []
    if config.ENABLE_STOCKTWITS:
        from sources import stocktwits
        mods.append(stocktwits)
    if config.ENABLE_YAHOO_NEWS:
        from sources import yahoo_news
        mods.append(yahoo_news)
    if config.ENABLE_HACKERNEWS:
        from sources import hackernews
        mods.append(hackernews)
    if config.ENABLE_REDDIT:
        from sources import reddit_source
        mods.append(reddit_source)
    return mods
