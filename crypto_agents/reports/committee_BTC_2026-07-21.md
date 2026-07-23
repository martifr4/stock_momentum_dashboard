# Trade Committee Report — BTC/USD

**Date:** 2026-07-21
**Pair:** BTC/USD
**Threshold rule:** unanimous direction AND every agent's confidence **strictly > 70%**

---

## ⛔ NO TRADE

**Reason:** All three traders agree on direction (**UP**) and no analyst blocked, but
the confidence bar failed. Two of three agents did not clear the strict **> 70%**
threshold — **Tecnic 67%** and **Macro 62%**. Only Social (75%) qualified. Under
the unanimous-70% rule, a single sub-threshold agent forces NO TRADE, so the
committee's recommendation is **HOLD**.

This is a **threshold** failure, not a directional disagreement and not a data block.

---

## Agent scorecard

| Trader | Direction | P_up | P_down | Confidence | Clears > 70%? |
|--------|:---------:|-----:|-------:|-----------:|:-------------:|
| Tecnic | UP | 0.67 | 0.33 | 67% | No |
| Social | UP | 0.75 | 0.25 | 75% | Yes |
| Macro  | UP | 0.62 | 0.38 | 62% | No |

Direction: **unanimous UP.** Confidence gate: **2 of 3 fail.**

---

## Data-quality audit (analysts run before traders)

| Analyst | Lane | STATUS | Issues flagged | Issues fixed |
|---------|------|:------:|----------------|--------------|
| Tecnic-Analyst | price/volume (201 daily pts) | OK | none | none |
| Social-Analyst | short prices + headlines | OK | 1 near-duplicate headline (INFO) | collapsed 1 near-dup (40 → 39 headlines) |
| Macro-Analyst | global stats + F&G + news | OK | none | none |

**Details:**
- **Tecnic-Analyst:** All 201 price and volume points finite, positive, aligned; no NaN/inf/zero/negative, no duplicates, no frozen runs, no >6σ outlier ticks. 201 pts ≥ 60 required. Original data used.
- **Social-Analyst:** Price tail (last 30 pts) clean with real movement. Removed one near-duplicate Russia crypto-law headline (kept the more detailed version); 39 unique, current, on-topic headlines remain. No empty or stale titles.
- **Macro-Analyst:** total_mcap $2.34T (positive), mcap_change_24h +1.33% (plausible), btc_dominance 56.81% (0–100 OK), 8 Fear & Greed readings all 0–100 with unique timestamps, 40 news items no invalid/duplicate entries.

**No BLOCK returned by any analyst** — all three lanes were cleared to trade on validated data.

---

## Per-agent detail

### Tecnic (technical) — UP, 67%
Last close $66,315. Four of five signal groups bullish:
- **Trend:** price +5.1% above SMA50; EMA10 > EMA30; SMA10 > SMA30 (bullish, though SMA30 62,713 still just under SMA50 63,090 — medium-term trend only recently turned up).
- **RSI(14) = 62.9:** healthy uptrend, not overbought.
- **MACD:** line 486.6 > signal 103.5; histogram positive and accelerating 3 sessions (323→327→383).
- **Short-term drift:** +2.35% (3d), +3.96% (5d), +3.79% (10d), all positive.
- **Volume:** last two sessions ~31.5B vs 26.3B 20-day avg (~1.2x) confirming the breakout.
- **Counter-signal (why capped at 67%):** Bollinger %B = 1.06 — price pushed *above* the upper band, a stretched/overextended condition raising near-term mean-reversion risk toward the 63,800 mid-band.

### Social (sentiment + shape) — UP, 75%
- **Momentum:** 1d +1.71%, 2d +2.53%, 5d +3.96% — consistently positive and accelerating into a ~seven-week high near $66–67K.
- **Sentiment (39 headlines):** ~12 bullish BTC/market items vs ~3 negative. Dominant themes: CLARITY Act regulatory-clarity progress (White House ethics deal, Polymarket odds to 43%), a 5-day BTC ETF inflow streak (~$600–727M), broad-based institutional/whale/options support.
- **Negatives are low-relevance:** Twenty One/Strike merger collapse (corporate, not spot BTC), one Iran/tariff pullback note, stale Celsius settlement.
- No price/sentiment divergence — tape and news align, clearing 70% at 75% but capped by lingering geopolitical headline risk.

### Macro (whole-market regime) — UP, 62%
- **Total mcap:** +1.33% to $2.34T — mild broad risk-on, not a blowoff.
- **BTC dominance 56.81%:** elevated — capital rotating into BTC specifically; constructive for BTC but signals a narrow, BTC-concentrated advance.
- **Fear & Greed = 25 (Extreme Fear)**, range 22–29 over 5–8 days: sentiment still depressed and lagging the price rally — contrarian-supportive (room to run) but genuine fear keeps reversal risk live.
- **News tone:** net constructive (7-week highs, ETF inflows, legislative tailwinds) offset by idiosyncratic negatives (Movement Labs Ch.11, merger scrapped, BIS stablecoin warning).
- **Why capped at 62%:** Extreme Fear + high dominance implies a fragile, BTC-only advance vulnerable to a single macro/regulatory headline (CLARITY Act stalling, Iran/tariff escalation).

---

## Rule explainer

```
TRADE  ⇔  (Tecnic.dir == Social.dir == Macro.dir)
          AND every agent's confidence > 70%   (strict, 70.0% does not pass)
          AND no analyst returned BLOCK
```

| Condition | Result |
|-----------|:------:|
| Unanimous direction (all UP) | PASS |
| No analyst BLOCK | PASS |
| Tecnic confidence > 70% (67%) | **FAIL** |
| Social confidence > 70% (75%) | PASS |
| Macro confidence > 70% (62%) | **FAIL** |

**Outcome: NO TRADE (HOLD).** The direction and data-quality gates passed, but the
confidence gate failed on two of three agents. The committee trades only on strong
multi-factor alignment; a directionally-bullish-but-not-yet-convincing setup like
this one is deliberately left on the sidelines.

---

*This report is a signal and recommendation only. It does not place orders and has
not modified the portfolio tracker. No trade recorded.*
