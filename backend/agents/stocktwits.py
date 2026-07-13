"""Validation agent for StockTwits messages.

StockTwits carries an explicit user Bull/Bear tag that the pipeline trusts over
the lexicon, so this agent:
  * flags promotional / pump-and-dump spam (the main StockTwits noise source),
  * flags cashtag-stuffed "watchlist" posts that mention many symbols at once,
  * checks the text doesn't clearly contradict the stored (often user-tagged)
    sentiment -- but tolerates a neutral-text/strong-tag gap, since the tag is
    the intended signal.
"""
from __future__ import annotations

import re

from agents.base import BaseAgent

SOURCE = "stocktwits"

_CASHTAG = re.compile(r"\$[A-Za-z]{1,5}(?:\.[A-Za-z])?\b")
_URL = re.compile(r"https?://|t\.me/|discord\.gg|bit\.ly", re.IGNORECASE)
_PROMO = re.compile(
    r"\b(join|subscribe|sign\s?up|free\s+(alerts?|signals?|trial)|premium|"
    r"guaranteed|dm\s+me|my\s+(link|group|channel|discord|telegram)|"
    r"whatsapp|telegram|100%\s+(win|accuracy)|pump)\b",
    re.IGNORECASE,
)


class StockTwitsAgent(BaseAgent):
    SOURCE = SOURCE
    # Sentiment is often the user's explicit Bull/Bear tag, not the lexicon.
    EXPECT_LEXICON_SENTIMENT = False

    def check_legit(self, post, mention, text):
        legit, reasons = super().check_legit(post, mention, text)
        if not legit:
            return legit, reasons

        body = post.get("body") or ""

        if _PROMO.search(body):
            reasons.append("promotional_spam")
        if _URL.search(body) and (_PROMO.search(body) or len(body) < 80):
            reasons.append("link_spam")

        cashtags = _CASHTAG.findall(body)
        if len(cashtags) > 5:
            reasons.append(f"cashtag_stuffing({len(cashtags)} symbols)")

        # Message that is only cashtags with no actual commentary.
        stripped = _CASHTAG.sub("", body).strip()
        if cashtags and len(stripped) < 3:
            reasons.append("no_commentary")

        return (len(reasons) == 0), reasons
