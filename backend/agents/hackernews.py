"""Validation agent for Hacker News stories/comments.

HN is attributed via a company-name query map, so its big risk is *name
collisions*: "Apple" the fruit, "Arm" the body part / CPU architecture, "Meta"
the prefix, "Amazon" the rainforest, "Intel" as "intelligence". For those
collision-prone names this agent requires some market/company context in the
text; otherwise it flags a probable mis-attribution.
"""
from __future__ import annotations

import re

from agents.base import BaseAgent

SOURCE = "hackernews"

# Tickers whose company name is also a common English word / unrelated tech term.
_COLLISION_PRONE = {"AAPL", "ARM", "META", "AMZN", "INTC", "MU"}

_MARKET_CONTEXT = re.compile(
    r"\b(stock|shares?|share\s+price|market\s+cap|nasdaq|nyse|ticker|earnings|"
    r"revenue|guidance|quarter(ly)?|valuation|investors?|ipo|dividend|"
    r"ceo|inc\.?|corp\.?|company|analysts?|wall\s+street|\$)\b",
    re.IGNORECASE,
)


class HackerNewsAgent(BaseAgent):
    SOURCE = SOURCE
    EXPECT_LEXICON_SENTIMENT = True

    def check_legit(self, post, mention, text):
        legit, reasons = super().check_legit(post, mention, text)
        if not legit:
            return legit, reasons

        ticker = mention["ticker"]
        # For collision-prone names, require market/company context so we don't
        # attribute "apple pie" or an ARM-architecture thread to the stock.
        if ticker in _COLLISION_PRONE and not _MARKET_CONTEXT.search(text):
            reasons.append("possible_name_collision(no_market_context)")

        return (len(reasons) == 0), reasons
