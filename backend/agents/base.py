"""Base class for per-source validation agents.

Each agent audits a single stored *mention* (a ticker attributed to a post) and
returns a `Verdict` answering two questions:

  1. **Is the post legit?**  Source-specific: not spam/pump, not deleted, the
     attributed ticker is actually referenced, no name-collision, etc.
  2. **Does it agree with the initially scored sentiment?**  Re-derive the
     sentiment independently and compare it to the value stored in the DB that
     feeds momentum/buzz.

Agents are deterministic and dependency-free (they reuse the project's own
lexicon), so the audit can run over every post cheaply and reproducibly.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

import sentiment
from agents import aliases

_WORD = re.compile(r"[a-z']+|\$[a-z.]+", re.IGNORECASE)


@dataclass
class Verdict:
    """The result of auditing one (ticker, post) mention."""
    post_id: str
    ticker: str
    source: str
    legit: bool
    agrees: bool
    stored_sentiment: float
    agent_sentiment: float
    confidence: float
    reasons: list[str] = field(default_factory=list)

    @property
    def status(self) -> str:
        return "ok" if (self.legit and self.agrees) else "flag"

    def to_row(self, audited_at: int) -> tuple:
        return (
            self.ticker, self.post_id, self.source, self.status,
            int(self.legit), int(self.agrees),
            round(self.stored_sentiment, 4), round(self.agent_sentiment, 4),
            round(self.confidence, 3), "; ".join(self.reasons), audited_at,
        )


def post_text(post: dict) -> str:
    return f"{post.get('title') or ''}\n{post.get('body') or ''}".strip()


def lexicon_support(text: str) -> int:
    """How many lexicon terms fire in `text` (a proxy for read confidence)."""
    if not text:
        return 0
    return sum(1 for tok in _WORD.findall(text.lower()) if tok in sentiment.LEXICON)


def _labels_conflict(a: str, b: str) -> bool:
    return {a, b} == {"bullish", "bearish"}


class BaseAgent:
    """Shared audit logic. Subclass per source and override the hooks below."""

    #: Source label this agent handles (matches mentions.source).
    SOURCE: str = ""
    #: True when the stored sentiment is expected to equal the lexicon score of
    #: the text (Yahoo/HN/Reddit). False when it comes from an explicit external
    #: signal such as a StockTwits Bull/Bear tag.
    EXPECT_LEXICON_SENTIMENT: bool = True
    #: Tolerance for the data-integrity check on lexicon-scored sources.
    INTEGRITY_EPS: float = 0.02

    # -- overridable hooks ---------------------------------------------------

    def independent_sentiment(self, post: dict, text: str) -> float:
        """The agent's own reading of the text's sentiment."""
        return sentiment.score(text)

    def check_legit(self, post: dict, mention: dict, text: str) -> tuple[bool, list[str]]:
        """Source-specific legitimacy checks. Override and call super()."""
        reasons: list[str] = []
        if not text or text in ("[deleted]", "[removed]"):
            return False, ["empty_or_deleted"]
        return True, reasons

    # -- shared machinery ----------------------------------------------------

    def _mentions_company(self, ticker: str, text: str) -> bool:
        low = text.lower()
        # $CASHTAG or bare symbol as a whole word.
        if re.search(rf"\${re.escape(ticker.lower())}\b", low):
            return True
        if re.search(rf"\b{re.escape(ticker.lower())}\b", low):
            return True
        return any(a in low for a in aliases.aliases_for(ticker))

    def check_agreement(self, stored: float, agent: float,
                        text: str) -> tuple[bool, list[str]]:
        stored_lbl = sentiment.label(stored)
        agent_lbl = sentiment.label(agent)
        # Opposite polarity is always a real disagreement.
        if _labels_conflict(stored_lbl, agent_lbl):
            return False, [
                f"sentiment_conflict(stored={stored_lbl} text={agent_lbl})"]
        if self.EXPECT_LEXICON_SENTIMENT and abs(stored - agent) > self.INTEGRITY_EPS:
            # The stored score should be reproducible from the text; a gap means
            # the score is stale/corrupted or the text changed after scoring.
            return False, [
                f"score_mismatch(stored={stored:+.2f} recomputed={agent:+.2f})"]
        return True, []

    def confidence(self, text: str, agent_sentiment: float) -> float:
        support = lexicon_support(text)
        return round(min(1.0, 0.3 + 0.2 * support), 3)

    def review(self, post: dict, mention: dict) -> Verdict:
        text = post_text(post)
        stored = float(mention.get("sentiment") or 0.0)
        agent_sent = self.independent_sentiment(post, text)

        legit, legit_reasons = self.check_legit(post, mention, text)
        if legit:
            agrees, agree_reasons = self.check_agreement(stored, agent_sent, text)
        else:
            # If the post isn't legit, sentiment agreement is moot.
            agrees, agree_reasons = True, []

        return Verdict(
            post_id=mention["post_id"],
            ticker=mention["ticker"],
            source=self.SOURCE or mention.get("source", ""),
            legit=legit,
            agrees=agrees,
            stored_sentiment=stored,
            agent_sentiment=agent_sent,
            confidence=self.confidence(text, agent_sent),
            reasons=legit_reasons + agree_reasons,
        )
