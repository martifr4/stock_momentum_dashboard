"""
agent_social.py — "Social": sentiment / momentum agent.

Assesses whether the pair looks in good or bad shape over the prior
1, 2, and 5 days by combining:
  - price momentum over those windows (from CoinGecko history)
  - a keyword-based sentiment scan of recent crypto news headlines
    that mention the coin (from RSS feeds)

Outputs a probability of an UP move.

NOTE ON SCRAPING: real social platforms (X, Reddit) require auth and
actively block scrapers. This agent uses public RSS news as a robust,
key-free proxy. To upgrade to true social sentiment, plug a paid social
API into `_headline_sentiment` — the interface stays the same.
"""

from indicators import pct_change, logistic
from datasources import resolve_coin, price_history, news_headlines
from analysts import social_analyst

# Tiny lexicon for headline sentiment. Deliberately simple + transparent.
POSITIVE = {
    "surge", "soar", "rally", "gain", "bullish", "breakout", "record",
    "adoption", "upgrade", "partnership", "approval", "inflow", "high",
    "boost", "recover", "outperform", "green", "buy", "accumulate", "etf",
}
NEGATIVE = {
    "crash", "plunge", "drop", "fall", "bearish", "selloff", "hack",
    "exploit", "ban", "lawsuit", "outflow", "liquidation", "fear", "dump",
    "decline", "warning", "risk", "fraud", "collapse", "red", "sell", "fud",
}


def _headline_sentiment(coin_name, symbol, headlines):
    """Return (score in ~[-1,1], n_matched, sample) from headline keywords."""
    name_l = coin_name.lower()
    sym_l = symbol.lower()
    pos = neg = matched = 0
    sample = []
    for h in headlines:
        text = f"{h['title']} {h['desc']}".lower()
        if name_l not in text and f" {sym_l} " not in f" {text} ":
            continue
        matched += 1
        p = sum(1 for w in POSITIVE if w in text)
        n = sum(1 for w in NEGATIVE if w in text)
        if p or n:
            sample.append((h["title"][:90], p - n))
        pos += p
        neg += n
    total = pos + neg
    if total == 0:
        return 0.0, matched, sample[:5]
    return (pos - neg) / total, matched, sample[:5]


def run(pair_base, quote="USD"):
    coin_id, meta = resolve_coin(pair_base)
    raw_prices, _ = price_history(coin_id, days=30)
    raw_headlines = news_headlines(max_items=60)

    # --- Analyst validates prices + de-duplicates headlines first ---
    prices, headlines, audit = social_analyst(raw_prices, raw_headlines)
    if not audit.ok:
        return {"agent": "Social", "pair": f"{pair_base}/{quote}",
                "error": "data validation failed", "audit": audit,
                "direction": "UP", "p_up": 0.5, "p_down": 0.5,
                "confidence": 0.5, "score": 0.0, "signals": {},
                "headline_samples": [], "matched_headlines": 0}

    signals = {}
    score = 0.0

    # --- Momentum over 1/2/5 day windows ---
    windows = {"1d": 1, "2d": 2, "5d": 5}
    weights = {"1d": 1.0, "2d": 0.7, "5d": 0.5}
    for label, days in windows.items():
        chg = pct_change(prices, days)
        if chg is None:
            continue
        tilt = max(-1.0, min(1.0, chg / 6.0)) * weights[label]
        score += tilt
        shape = "good" if chg > 0 else "bad"
        signals[f"{label} momentum"] = f"{chg:+.2f}% ({shape}) {tilt:+.2f}"

    # --- Headline sentiment (uses analyst-cleaned, de-duplicated headlines) ---
    sent, n_matched, sample = _headline_sentiment(
        meta.get("name", pair_base), pair_base, headlines)
    sent_tilt = sent * 1.5  # weight sentiment meaningfully
    score += sent_tilt
    signals["News sentiment"] = (
        f"{sent:+.2f} across {n_matched} matching headlines {sent_tilt:+.2f}")

    p_up = logistic(score, k=0.7)
    p_down = 1 - p_up

    return {
        "agent": "Social",
        "pair": f"{pair_base}/{quote}",
        "score": round(score, 2),
        "p_up": round(p_up, 4),
        "p_down": round(p_down, 4),
        "direction": "UP" if p_up >= 0.5 else "DOWN",
        "confidence": round(max(p_up, p_down), 4),
        "signals": signals,
        "audit": audit,
        "headline_samples": sample,
        "matched_headlines": n_matched,
    }
