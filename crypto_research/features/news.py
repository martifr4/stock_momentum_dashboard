"""News / sentiment module — QUARANTINED by design.

The requirement is explicit and correct: only use news timestamped **before**
each decision point, and if reliable timestamped news is not available, return a
neutral signal and *flag* it rather than fabricate one.

Reality check for a free, reproducible backtest: free RSS/news endpoints only
serve *recent* items and carry no trustworthy per-day historical timestamps
going back years. There is no free, lookahead-safe way to reconstruct "what
headlines existed at midnight UTC on 2021-03-14". Therefore, in **backtest
mode** this module returns a neutral (0.0) sentiment for every (date, asset) and
sets ``news_available = False``. It never injects a signal it cannot timestamp.

A live/current-mode helper (:func:`fetch_current_sentiment`) is provided for
forward, real-time use where "now" is unambiguous — but it is intentionally not
wired into the historical backtest, so it cannot leak future information.
"""
from __future__ import annotations

from dataclasses import dataclass

import pandas as pd


@dataclass
class NewsResult:
    """Sentiment scores plus an explicit availability flag."""

    scores: pd.Series          # (date, asset) -> sentiment in [-1, 1]
    news_available: bool       # False => neutral placeholder, do not trust
    reason: str                # human-readable explanation of the flag


def neutral_sentiment(index: pd.MultiIndex, reason: str) -> NewsResult:
    """A neutral, clearly-flagged sentiment series aligned to ``index``."""
    scores = pd.Series(0.0, index=index, name="news_sentiment")
    return NewsResult(scores=scores, news_available=False, reason=reason)


def compute_news_features(
    feature_index: pd.MultiIndex,
    enabled: bool,
    rss_feeds: list[str] | None = None,
) -> NewsResult:
    """Backtest-mode news features.

    Always returns neutral + ``news_available=False`` for historical backtests,
    because free timestamped historical news is not lookahead-safe. ``enabled``
    is honoured only to the extent of the returned ``reason`` string; the signal
    stays neutral either way, by design.
    """
    if not enabled:
        return neutral_sentiment(
            feature_index,
            "news disabled in config (quarantined); returning neutral signal",
        )
    return neutral_sentiment(
        feature_index,
        "no free lookahead-safe historical news source; returning neutral "
        "signal and flagging as unavailable rather than fabricating one",
    )


def fetch_current_sentiment(feeds: list[str]) -> NewsResult:  # pragma: no cover
    """Live-mode only: score *current* headlines from RSS feeds.

    Deliberately not used by the backtest. Intended for forward paper/live
    trading where the decision timestamp is unambiguously 'now', so pulling the
    latest headlines introduces no lookahead. Kept minimal and dependency-light;
    returns neutral if feeds are unreachable.
    """
    if not feeds:
        return NewsResult(
            scores=pd.Series(dtype=float),
            news_available=False,
            reason="no feeds configured",
        )
    # Intentionally left as a neutral stub: wiring a specific sentiment model or
    # paid news API would be a data-dependency decision to raise with the user
    # first (see project instructions), so we do not silently add one here.
    return NewsResult(
        scores=pd.Series(dtype=float),
        news_available=False,
        reason="live sentiment scoring not enabled; add a source explicitly",
    )
