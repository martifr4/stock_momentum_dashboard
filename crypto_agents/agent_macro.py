"""
agent_macro.py — "Macro": whole-market regime agent.

Assesses whether the overall crypto market is bullish or bearish using:
  - global total market-cap 24h change (CoinGecko /global)
  - BTC dominance level (risk-on vs risk-off proxy)
  - Crypto Fear & Greed index, current level + short trend
  - broad news-flow sentiment (market-wide, not coin-specific)

Outputs a probability of an UP move for the market as a whole.
"""

from indicators import logistic
from datasources import global_market, fear_greed, news_headlines
from agent_social import POSITIVE, NEGATIVE
from analysts import macro_analyst


def _market_news_tone(headlines):
    pos = neg = 0
    for h in headlines:
        text = f"{h['title']} {h['desc']}".lower()
        pos += sum(1 for w in POSITIVE if w in text)
        neg += sum(1 for w in NEGATIVE if w in text)
    total = pos + neg
    if total == 0:
        return 0.0
    return (pos - neg) / total


def run():
    signals = {}
    score = 0.0

    # --- Fetch raw, then let the analyst validate/repair everything ---
    raw_global = global_market()
    raw_fng = fear_greed(limit=6)
    raw_news = news_headlines(max_items=50)
    g, fng, news, audit = macro_analyst(raw_global, raw_fng, raw_news)
    if not audit.ok:
        return {"agent": "Macro", "scope": "whole crypto market",
                "error": "data validation failed", "audit": audit,
                "direction": "UP", "p_up": 0.5, "p_down": 0.5,
                "regime": "UNKNOWN", "confidence": 0.5, "score": 0.0,
                "signals": {}, "global": raw_global or {}}

    # --- Global market cap 24h change ---
    mc = g.get("mcap_change_24h")
    if mc is not None:
        tilt = max(-1.5, min(1.5, mc / 3.0))
        score += tilt
        regime = "bullish" if mc > 0 else "bearish"
        signals["Total mcap 24h"] = f"{mc:+.2f}% ({regime}) {tilt:+.2f}"

    # --- BTC dominance (context, mild signal) ---
    dom = g.get("btc_dominance")
    if dom is not None:
        signals["BTC dominance"] = f"{dom:.1f}% (context)"

    # --- Fear & Greed level + trend (analyst-validated) ---
    if fng:
        cur = fng[0]["value"]
        # Contrarian-aware but trend-following blend:
        # extreme fear = potential bottom (+), extreme greed = froth (-)
        if cur <= 25:
            tilt = 0.8; note = "extreme fear (contrarian up)"
        elif cur >= 75:
            tilt = -0.8; note = "extreme greed (froth risk)"
        else:
            tilt = (cur - 50) / 50.0  # mild trend-follow in the middle
            note = "neutral zone"
        score += tilt
        signals["Fear & Greed"] = f"{cur} {fng[0]['classification']} ({note}) {tilt:+.2f}"

        if len(fng) >= 5:
            trend = fng[0]["value"] - fng[4]["value"]
            ttilt = max(-0.5, min(0.5, trend / 20.0))
            score += ttilt
            signals["F&G 5d trend"] = f"{trend:+d} pts {ttilt:+.2f}"

    # --- Market-wide news tone (analyst-cleaned, de-duplicated) ---
    tone = _market_news_tone(news)
    ttilt = tone * 1.0
    score += ttilt
    signals["Market news tone"] = f"{tone:+.2f} {ttilt:+.2f}"

    p_up = logistic(score, k=0.7)
    p_down = 1 - p_up

    return {
        "agent": "Macro",
        "scope": "whole crypto market",
        "score": round(score, 2),
        "p_up": round(p_up, 4),
        "p_down": round(p_down, 4),
        "direction": "UP" if p_up >= 0.5 else "DOWN",
        "regime": "BULLISH" if p_up >= 0.5 else "BEARISH",
        "confidence": round(max(p_up, p_down), 4),
        "signals": signals,
        "audit": audit,
        "global": g,
    }
