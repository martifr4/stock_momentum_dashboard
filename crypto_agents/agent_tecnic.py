"""
agent_tecnic.py — "Tecnic": professional-trader technical agent.

Collects OHLC/volume data for the pair, computes indicators, and converts
the net technical picture into a probability of an UP move (and its
complement, DOWN). Also returns a markdown block documenting the read.
"""

from indicators import (sma, ema, rsi, macd, bollinger, pct_change, logistic)
from datasources import resolve_coin, price_history
from analysts import tecnic_analyst


def run(pair_base, quote="USD"):
    coin_id, meta = resolve_coin(pair_base)
    raw_prices, raw_volumes = price_history(coin_id, days=200)

    # --- Analyst validates & repairs data before the trader sees it ---
    prices, volumes, audit = tecnic_analyst(raw_prices, raw_volumes)
    if not audit.ok:
        return {"agent": "Tecnic", "pair": f"{pair_base}/{quote}",
                "error": "data validation failed", "audit": audit,
                "direction": "UP", "p_up": 0.5, "p_down": 0.5,
                "confidence": 0.5, "score": 0.0, "signals": {},
                "price": raw_prices[-1] if raw_prices else None, "meta": {}}
    price = prices[-1]

    score = 0.0
    signals = {}

    # --- Trend: fast vs slow SMA ---
    f, s = sma(prices, 10), sma(prices, 30)
    if f and s:
        if f > s:
            score += 1.0; signals["SMA 10/30"] = f"bullish ({f:.2f} > {s:.2f}) +1.0"
        else:
            score -= 1.0; signals["SMA 10/30"] = f"bearish ({f:.2f} < {s:.2f}) -1.0"

    # --- Price vs longer trend (SMA50) ---
    s50 = sma(prices, 50)
    if s50:
        if price > s50:
            score += 0.5; signals["Price vs SMA50"] = "above +0.5"
        else:
            score -= 0.5; signals["Price vs SMA50"] = "below -0.5"

    # --- RSI momentum ---
    r = rsi(prices, 14)
    if r is not None:
        if r < 40:
            score += 1.0; signals["RSI"] = f"{r:.1f} oversold (mean-revert up) +1.0"
        elif r > 60:
            score -= 1.0; signals["RSI"] = f"{r:.1f} overbought -1.0"
        else:
            tilt = (50 - r) / 20.0
            score += tilt; signals["RSI"] = f"{r:.1f} neutral {tilt:+.2f}"

    # --- MACD histogram ---
    _, _, hist = macd(prices)
    if hist is not None:
        if hist > 0:
            score += 1.0; signals["MACD"] = f"hist {hist:+.4f} bullish +1.0"
        else:
            score -= 1.0; signals["MACD"] = f"hist {hist:+.4f} bearish -1.0"

    # --- Bollinger position ---
    up, mid, low = bollinger(prices, 20, 2.0)
    if up:
        if price < low:
            score += 1.0; signals["Bollinger"] = "below lower band (oversold) +1.0"
        elif price > up:
            score -= 1.0; signals["Bollinger"] = "above upper band (overbought) -1.0"
        else:
            pos = (price - low) / (up - low)
            tilt = (0.5 - pos)
            score += tilt; signals["Bollinger"] = f"{pos*100:.0f}% of band {tilt:+.2f}"

    # --- Short-term momentum (3-day) ---
    c3 = pct_change(prices, 3)
    if c3 is not None:
        tilt = max(-1.0, min(1.0, c3 / 5.0))
        score += tilt; signals["3-day momentum"] = f"{c3:+.2f}% {tilt:+.2f}"

    # --- Volume confirmation ---
    if len(volumes) >= 14:
        recent = sum(volumes[-7:]) / 7
        prior = sum(volumes[-14:-7]) / 7
        if prior > 0:
            vchg = (recent - prior) / prior * 100
            if vchg > 20:
                boost = 0.5 if score > 0 else -0.5
                score += boost
                signals["Volume"] = f"+{vchg:.0f}% confirms move {boost:+.1f}"
            else:
                signals["Volume"] = f"{vchg:+.0f}% neutral 0"

    # Convert net score to probability of UP move.
    # Scale chosen so a strong |score|~4 saturates near 0.9.
    p_up = logistic(score, k=0.55)
    p_down = 1 - p_up

    return {
        "agent": "Tecnic",
        "pair": f"{pair_base}/{quote}",
        "price": price,
        "score": round(score, 2),
        "p_up": round(p_up, 4),
        "p_down": round(p_down, 4),
        "direction": "UP" if p_up >= 0.5 else "DOWN",
        "confidence": round(max(p_up, p_down), 4),
        "signals": signals,
        "audit": audit,
        "meta": {"rank": meta.get("market_cap_rank"),
                 "mcap": meta.get("market_cap"),
                 "chg_24h": meta.get("price_change_percentage_24h")},
    }
