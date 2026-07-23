# Committee Trade Report — ETH/USD
_Generated 2026-07-21_

> Deterministic multi-agent signal system, adjudicated by the Trade-Coordinator.
> Not financial advice. A verdict is a recommendation only and never modifies the
> portfolio. Backtest before risking capital.

## Verdict

### ⛔ NO TRADE

All three agents agree on direction (**UP**), and no analyst raised a fatal data
issue — but the trade does **not** fire because the confidence bar was missed.
Each agent must report **> 70%** confidence in the agreed direction; the highest
was Tecnic at 63% and the minimum was 60%. **Failed on threshold, not on
disagreement or data.**

## Agent Scorecard

| Agent | Direction | P(up) | P(down) | Confidence | Clears >70%? |
|-------|:---------:|------:|--------:|-----------:|:------------:|
| Tecnic | UP | 63.0% | 37.0% | 63.0% | No |
| Social | UP | 60.0% | 40.0% | 60.0% | No |
| Macro  | UP | 60.0% | 40.0% | 60.0% | No |

Direction: **unanimous UP**. Minimum confidence: **60.0%** (bar is 70%).

## Data Quality — analyst audit

| Analyst | Status | Flagged | Fixed | Notes |
|---------|:------:|:-------:|:-----:|-------|
| Tecnic-Analyst | PASS | 1 | 0 | 201/201 clean price/volume points |
| Social-Analyst | PASS | 3 | 3 | 30 price points; 37 headlines kept / 3 removed |
| Macro-Analyst  | PASS | 1 | 1 | globals in range; 8/8 F&G valid; 39 news kept / 1 removed |

**Tecnic-Analyst** — 201 clean price points and 201 clean volume points, fully aligned.
- `WARN` [outlier] index 34 price 1820.57, z-score 7.59 → flagged, NOT removed (166 days back, outside every lookback window used by Tecnic — no effect on the current read)

**Social-Analyst** — 30 valid price-tail points; headlines de-duplicated 37 kept / 3 removed.
- `INFO` [price] 30 clean tail points, all finite positive → verified, ready for 1/2/5-day momentum
- `WARN` [headlines] 3 near-duplicate stories collapsed (Russia crypto law, UK banking inquiry, Tether/Strike merger) → removed, kept most detailed version of each

**Macro-Analyst** — globals in range, F&G series clean, news de-duplicated.
- `INFO` [headlines] 1 near-duplicate removed (UK banking chokepoint inquiry) → removed
- Global: mcap +$2.34T total, 24h change +1.33%, BTC dominance 56.81% (all in range)
- Fear & Greed: 8/8 readings valid (22–29), chronologically ordered, no dupes

No analyst returned BLOCK, so all three lanes were cleared to trade.

---

## Tecnic — technical read on ETH/USD

- Current price: ~$1,919.93
- **P(up): 63.0%  |  P(down): 37.0%  →  DIRECTION: UP**

**Key signals:**
- Trend structure: price 1919.93 > SMA10 1864.63 > SMA30 1746.30 > SMA50 1730.88; EMA10 > EMA30 → bullish, strong weight
- RSI(14): 67.4 → bullish but approaching overbought (>70), tempers conviction
- MACD: line 44.79 / signal 31.91 / histogram +12.88 but decelerating over last 5 sessions → bullish direction, momentum losing thrust (mild conflict)
- Bollinger %B: 0.92 → price stretched near upper band, elevated near-term pullback risk
- Drift: 3d +3.16%, 5d +3.05% → bullish short-term momentum
- Volume: last close ~1.23x 20d average, rising on recent up days but below 50d average → moderate bullish confirmation

**Reasoning:** Trend, short-term drift, and volume align bullish with price cleanly
stacked above all major MAs (the dominant signal). But RSI near overbought, a
flattening MACD histogram, and %B pinned at 0.92 mean the move is stretched — not
a clean five-for-five alignment. Main risk: a mean-reversion pullback toward the
20-day mid-band (~1815) even within an intact uptrend. Hence 63%, not higher.

---

## Social — sentiment & 1/2/5-day shape

- **P(up): 60.0%  |  P(down): 40.0%  →  DIRECTION: UP**
- SHAPE: 1d +0.90%, 2d +2.62%, 5d +3.05% → good (steady multi-window uptick, no single-day spike/crash)
- SENTIMENT: positive but thin coin-specific coverage, across 37 provided headlines + 4 supplemental (WebSearch)

**Sample headlines:**
- 🟢 Morpho launches fixed-rate lending protocol on Base (Ethereum L2 ecosystem activity)
- 🟢 Base's 1:1-backed tokenized equities launch 'imminent,' Pollak says (Ethereum L2)
- 🟢 Bitcoin ETFs post 5-day inflow streak, longest since May (broad tailwind, not ETH-specific)
- 🔴 More MiCA-licensed crypto firms may exit EU market (broad regulatory friction)
- 🟢 Ethereum ETF Inflows Strengthen the Case for a Break Above $1,900 (supplemental)
- 🟢 Ethereum Reclaims $2,000 as ETF Flows and Staking Access Improve Setup (supplemental)
- ⚪ Dip Buyers Stake Their Claim: ETHB Draws Fresh Inflows Despite Ethereum's 19% Slide (supplemental, mixed)

**Reasoning:** The de-duplicated 37-headline set contained zero direct
Ethereum-specific stories — only two Base (L2) items were coin-adjacent — so Social
widened uncertainty and pulled ETH-specific coverage via WebSearch. That
supplemental coverage (ETF/staking inflows returning, staking-ETF interest, ETHB
inflows) is net positive and consistent with a steady 3-window price uptrend off a
deep multi-month drawdown. No meaningful price/sentiment divergence, just thin
coin-specific signal — confidence held at 60%.

---

## Macro — whole-market regime: **BULLISH**

- Total market cap: ~$2.34T
- BTC dominance: 56.8%
- **P(up): 60.0%  |  P(down): 40.0%  →  DIRECTION: UP**

**Key signals:**
- Total mcap 24h: +1.33% → modest risk-on, consistent with BTC printing a fresh multi-week high (~$66K)
- BTC dominance: 56.8% → elevated/risk-off tilt for alts, but plausibly BTC-led ETF inflows rather than broad de-risking
- Fear & Greed: 25 (Extreme Fear), 8-day series choppy in the 22–29 band with no clean trend → fearful in absolute terms, but a recovery off a deeper earlier reading; extreme fear + resilient price is a contrarian-bullish setup
- News tone: net constructive → 5-day BTC ETF inflow streak (longest since May), broad-based rally, CLARITY Act ethics-deal progress; offset by isolated negatives (Movement Labs Ch.11, Twenty One/Strike merger scrapped, MiCA EU exits, Iran/tariff headline risk)

**Reasoning:** Price is decoupling positively from sentiment — mcap up and BTC at a
multi-week high with a real ETF inflow streak while Fear & Greed stays in
Fear/Extreme Fear, typically a bullish divergence rather than froth. Elevated BTC
dominance and an unresolved CLARITY Act outcome (~43–50% odds) plus rate-hike risk
are the biggest uncertainties, keeping conviction moderate at 60%.

_Macro sources: cryptotimes.io, milkroad.com, benzinga.com, bitcoinfoundation.org,
thecoinrepublic.com, crypto.news, fool.com._

---

### How the decision rule works

```
TRADE  ⇔  (Tecnic.dir == Social.dir == Macro.dir)
         AND every agent's confidence in that direction > 70%   (70.0% is NOT > 70%)
         AND no analyst returned a FATAL / BLOCK data issue
```

Checked against this run:
- **Unanimous direction?** YES — all three point UP.
- **Every agent > 70%?** NO — confidences were 63% / 60% / 60% (min 60%). ← this is what blocks the trade.
- **Any data block?** NO — all three analysts returned PASS.

Two of the three conditions are satisfied, but the confidence bar is not. The rule
is intentionally strict: a unanimous but low-conviction UP lean is **NO TRADE**, not
a weak buy. The committee waits for stronger multi-factor alignment.
