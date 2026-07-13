"""Validation agent for Reddit posts/comments.

Reddit tickers are *extracted* from free text, so the main risks are
false-positive extraction (a bare symbol that was really an English word) and
automated/bot noise. This agent re-runs the project's own extractor to confirm
the ticker is still found in the stored text, flags known bot authors, and
re-checks the lexicon score.
"""
from __future__ import annotations

from agents.base import BaseAgent
from tickers import extract_tickers

SOURCE = "reddit"

# Automated accounts whose text is templated, not genuine sentiment.
_BOT_AUTHORS = {"automoderator", "visualmod", "wsbapp", "assetdash"}


class RedditAgent(BaseAgent):
    SOURCE = SOURCE
    EXPECT_LEXICON_SENTIMENT = True

    def check_legit(self, post, mention, text):
        legit, reasons = super().check_legit(post, mention, text)
        if not legit:
            return legit, reasons

        author = (post.get("author") or "").lower()
        if author in _BOT_AUTHORS:
            reasons.append(f"bot_author({post.get('author')})")

        # Re-extract with the same rules used at ingest. If the attributed
        # ticker no longer surfaces, the original extraction was a false positive
        # (or the text changed after scoring).
        if mention["ticker"] not in extract_tickers(text):
            reasons.append("ticker_not_reextracted")

        return (len(reasons) == 0), reasons
