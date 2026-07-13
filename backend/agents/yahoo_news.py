"""Validation agent for Yahoo Finance headlines.

Yahoo feeds are per-ticker, so attribution is usually right -- but generic
"market roundup" / "N stocks to buy" items land in a ticker's feed without
actually naming the company. This agent flags headlines that never reference the
attributed ticker, and re-checks the lexicon score of the headline.
"""
from __future__ import annotations

from agents.base import BaseAgent

SOURCE = "yahoo_news"


class YahooNewsAgent(BaseAgent):
    SOURCE = SOURCE
    EXPECT_LEXICON_SENTIMENT = True  # sentiment is the lexicon over the headline

    def check_legit(self, post, mention, text):
        legit, reasons = super().check_legit(post, mention, text)
        if not legit:
            return legit, reasons

        if not self._mentions_company(mention["ticker"], text):
            reasons.append("ticker_not_referenced")

        return (len(reasons) == 0), reasons
