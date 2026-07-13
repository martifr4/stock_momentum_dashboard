"""Lightweight, dependency-free sentiment scoring tuned for finance / WSB text.

Returns a compound score in [-1, 1]. This is a lexicon model with negation and
intensifier handling -- not a neural net, but plenty for a momentum signal and
it needs zero external packages.
"""
from __future__ import annotations

import math
import re

# Base lexicon: word -> polarity. Positive = bullish, negative = bearish.
LEXICON: dict[str, float] = {
    # General positive
    "good": 1.2, "great": 1.8, "excellent": 2.2, "amazing": 2.4, "love": 1.8,
    "strong": 1.5, "beat": 1.6, "beats": 1.6, "growth": 1.3, "profit": 1.4,
    "gain": 1.4, "gains": 1.4, "up": 0.8, "win": 1.4, "winner": 1.6,
    "opportunity": 1.2, "undervalued": 1.6, "cheap": 1.0, "quality": 1.1,
    "outperform": 1.8, "upgrade": 1.6, "record": 1.2, "surge": 1.7,
    "rally": 1.6, "breakout": 1.6, "momentum": 1.0, "solid": 1.3,
    "buy": 1.4, "buying": 1.3, "bought": 1.0, "accumulate": 1.2, "long": 1.0,
    "bullish": 2.0, "bull": 1.4, "confident": 1.2, "recovery": 1.2,
    # General negative
    "bad": -1.4, "terrible": -2.2, "awful": -2.3, "hate": -1.8, "weak": -1.5,
    "miss": -1.5, "missed": -1.5, "loss": -1.5, "losses": -1.5, "down": -0.9,
    "drop": -1.4, "drops": -1.4, "crash": -2.2, "crashing": -2.3,
    "dump": -1.6, "dumping": -1.7, "selloff": -1.8, "plunge": -2.0,
    "overvalued": -1.6, "expensive": -1.0, "downgrade": -1.8, "cut": -1.0,
    "bearish": -2.0, "bear": -1.4, "short": -1.0, "shorting": -1.3,
    "sell": -1.4, "selling": -1.3, "sold": -0.9, "avoid": -1.4, "risk": -0.6,
    "risky": -1.2, "bankrupt": -2.5, "bankruptcy": -2.5, "fraud": -2.4,
    "scam": -2.3, "bagholder": -1.8, "bagholding": -1.8, "dead": -1.6,
    "worried": -1.2, "fear": -1.4, "panic": -1.9, "collapse": -2.2,
    "bubble": -1.3, "recession": -1.6, "warning": -1.2, "lawsuit": -1.4,
    "delisted": -2.2, "dilution": -1.6, "halt": -1.2, "halted": -1.3,
    # WSB / retail slang
    "moon": 2.2, "mooning": 2.3, "rocket": 2.0, "tendies": 1.8, "printing": 1.6,
    "squeeze": 1.6, "calls": 1.0, "yolo": 0.6, "diamond": 1.2, "hold": 0.6,
    "hodl": 1.0, "hands": 0.0, "gains": 1.4, "lambo": 1.6, "green": 1.2,
    "printer": 1.4, "stonks": 1.0, "gme": 0.0, "brrr": 1.2, "pump": 0.8,
    "puts": -1.0, "drilling": -1.6, "red": -1.2, "rekt": -2.0, "rip": -1.4,
    "guh": -1.8, "baghold": -1.8, "cope": -1.0, "clown": -1.4, "trap": -1.2,
    "dumpster": -1.6, "worthless": -2.2, "overpriced": -1.4, "fomo": -0.5,
}

NEGATORS = {
    "not", "no", "never", "none", "cant", "can't", "cannot", "dont", "don't",
    "doesnt", "doesn't", "wont", "won't", "isnt", "isn't", "aint", "ain't",
    "without", "hardly", "barely", "neither", "nor",
}

INTENSIFIERS = {
    "very": 1.4, "super": 1.5, "extremely": 1.7, "really": 1.3, "so": 1.2,
    "absolutely": 1.6, "insanely": 1.7, "massively": 1.6, "hugely": 1.5,
    "slightly": 0.6, "somewhat": 0.7, "kinda": 0.7, "barely": 0.5,
}

_TOKEN_RE = re.compile(r"[a-z']+|\$[a-z]+", re.IGNORECASE)


def score(text: str) -> float:
    """Return a compound sentiment in [-1, 1] for `text`."""
    if not text:
        return 0.0
    tokens = _TOKEN_RE.findall(text.lower())
    total = 0.0
    n_hits = 0
    for i, tok in enumerate(tokens):
        val = LEXICON.get(tok)
        if val is None:
            continue
        # Look back up to 3 tokens for negators / intensifiers.
        mult = 1.0
        for j in range(max(0, i - 3), i):
            prev = tokens[j]
            if prev in NEGATORS:
                mult *= -0.9
            elif prev in INTENSIFIERS:
                mult *= INTENSIFIERS[prev]
        # Emphasis for repeated punctuation handled at text level below.
        total += val * mult
        n_hits += 1

    if n_hits == 0:
        return 0.0

    # Exclamation emphasis.
    exclaims = text.count("!")
    if exclaims:
        total *= 1.0 + min(exclaims, 4) * 0.05

    # Normalize a la VADER: x / sqrt(x^2 + alpha).
    alpha = 15.0
    compound = total / math.sqrt(total * total + alpha)
    return max(-1.0, min(1.0, compound))


def label(compound: float) -> str:
    if compound >= 0.25:
        return "bullish"
    if compound <= -0.25:
        return "bearish"
    return "neutral"


if __name__ == "__main__":
    tests = [
        "NVDA to the moon, absolutely printing tendies!",
        "TSLA is going to crash, puts printing, bearish af",
        "not bullish on this, looks overvalued",
        "just some regular text about the weather",
    ]
    for t in tests:
        c = score(t)
        print(f"{c:+.3f} {label(c):8} | {t}")
