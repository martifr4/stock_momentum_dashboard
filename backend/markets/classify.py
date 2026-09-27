"""Classify a prediction market into topics (with polarity) and regions.

Polarity answers: "if this market's YES probability rises, does the topic
move in its +1 direction (e.g. easier Fed), the -1 direction (tighter), or
is it ambiguous (0 - counts toward attention but not direction)?"
"""
from __future__ import annotations

import re
from functools import lru_cache

from markets.impact_map import (DOWN_WORDS, FULL_WEIGHT_REGIONS, NON_US_SPILLOVER,
                                REGIONS, TOPICS, UP_WORDS)

_FLAGS = re.IGNORECASE
_UP = re.compile(UP_WORDS, _FLAGS)
_DOWN = re.compile(DOWN_WORDS, _FLAGS)
# A bucket outcome like "4.0-4.2%", "150k–175k" or "between 2 and 3" has no
# single direction.
_RANGE = re.compile(r"\d[\d.,]*\s*[k%]?\s*(-|–|—|to)\s*\d|between .+ and ", _FLAGS)


@lru_cache(maxsize=None)
def _rx(pattern: str) -> re.Pattern:
    return re.compile(pattern, _FLAGS)


def _generic_direction(text: str) -> float | None:
    up, down = bool(_UP.search(text)), bool(_DOWN.search(text))
    if up and not down:
        return 1.0
    if down and not up:
        return -1.0
    return None


def topic_polarity(topic_id: str, outcome: str, question: str, full_text: str) -> float:
    """Polarity of a YES move for `topic_id` given the market's wording."""
    t = TOPICS[topic_id]
    if t.get("attention_only"):
        return 0.0
    rules = [(_rx(p), v) for p, v in t.get("rules", [])]
    invert = -1.0 if t.get("invert") and _rx(t["invert"]).search(full_text) else 1.0

    # 1) Topic-specific rules on the outcome label first, then the question.
    for text in (outcome, question):
        if not text:
            continue
        for rx, v in rules:
            if rx.search(text):
                return v
        # Bucket outcomes ("4.0-4.2%") are directionless.
        if text is outcome and _RANGE.search(text) and not (_UP.search(text) or _DOWN.search(text)):
            return 0.0
    # 2) Generic above/below wording.
    for text in (outcome, question) if not t.get("no_generic") else ():
        if text:
            d = _generic_direction(text)
            if d is not None:
                return d * invert
    # 3) Topic default (0 = attention only).
    return float(t.get("default", 0.0))


def regions_for(text: str, tags: str, source: str) -> list[str]:
    def hits(t):
        return [rid for rid, r in REGIONS.items() if _rx(r["match"]).search(t)]
    # Titles first; venue tags (e.g. "world", "global-elections") are broad,
    # so they only decide when the wording names no place.
    found = hits(text) or hits(tags.replace("-", " "))
    if not found:
        # Kalshi is a US-regulated venue whose macro series are US data.
        found = ["us"] if source == "kalshi" else ["global"]
    return found


def _topics_in(text: str) -> list[str]:
    return [tid for tid, t in TOPICS.items() if _rx(t["match"]).search(text)]


def classify(market: dict) -> dict:
    """Return {"topics": {topic: polarity}, "regions": [...], "us_weight": w}.

    `market` needs question/outcome/event_title/tags/source keys.
    An empty topics dict means the market is not relevant to this monitor.
    """
    question = market.get("question") or ""
    outcome = market.get("outcome") or ""
    event_title = market.get("event_title") or ""
    tags = " ".join(market.get("tags") or [])
    wording = f"{event_title} | {question} | {outcome}"
    full = f"{wording} | {tags}"

    regions = regions_for(wording, tags, market.get("source", ""))
    has_us = any(r in FULL_WEIGHT_REGIONS for r in regions)

    # Topic assignment uses titles, not the outcome label (an outcome like
    # "Republican" should not by itself make a market political). Venue tags
    # are a fallback only - they are too coarse to pick a direction from.
    title_text = f"{event_title} | {question}"
    topic_ids = _topics_in(title_text) or _topics_in(tags.replace("-", " "))
    topics: dict[str, float] = {}
    for tid in topic_ids:
        if TOPICS[tid].get("us_only") and "us" not in regions:
            continue
        topics[tid] = topic_polarity(tid, outcome, question, full)

    # A foreign election / leadership market -> international politics.
    if "us_elections" in topic_ids and "us_elections" not in topics:
        topics["intl_politics"] = 0.0
    if not topics and re.search(r"election|president|prime minister|parliament", title_text, _FLAGS):
        topics["intl_politics"] = 0.0

    return {
        "topics": topics,
        "regions": regions,
        "us_weight": 1.0 if has_us else NON_US_SPILLOVER,
    }
