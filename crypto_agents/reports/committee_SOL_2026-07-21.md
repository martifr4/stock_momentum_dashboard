# Committee Trade Report — SOL/USD
_Generated 2026-07-21_

> Deterministic multi-agent signal system, adjudicated by the Trade-Coordinator.
> Not financial advice. A verdict is a recommendation only and never modifies the
> portfolio. Backtest before risking capital.

## Verdict

### ⛔ NO TRADE (HOLD)

All three agents agree on direction (**UP**), and no analyst raised a fatal data
issue — but the trade does **not** fire because the confidence bar was missed.
Each agent must report **> 70%** confidence in the agreed direction; the highest
was Macro at 65% and the minimum was Tecnic at 57%. **Failed on threshold, not on
disagreement or data.**

## Agent Scorecard

| Agent | Direction | P(up) | P(down) | Confidence | Clears >70%? |
|-------|:---------:|------:|--------:|-----------:|:------------:|
| Tecnic | UP | 57.0% | 43.0% | 57.0% | No |
| Social | UP | 63.0% | 37.0% | 63.0% | No |
| Macro  | UP | 65.0% | 35.0% | 65.0% | No |

Direction: **unanimous UP**. Minimum confidence: **57.0%** (bar is 70%).

## Data Quality — analyst audit

| Analyst | Status | Notes |
|---------|:------:|-------|
| Tecnic-Analyst | ✅ PASS | 201/201 clean price/volume points, fully aligned; no bad ticks, gaps, or frozen runs |
| Social-Analyst | ✅ PASS | 201 valid price points; 40 headlines, exact-dedup clean; flagged 3 near-duplicate story pairs (WARN) |
| Macro-Analyst  | ✅ PASS | globals in range; 8/8 F&G readings valid; 40 news items validated |

**Tecnic-Analyst** — clean, aligned price/volume series ready for the full indicator suite. No repairs required.

**Social-Analyst** — price tail validated for 1/2/5-day momentum. Exact-match dedup left the feed clean, but three near-duplicate story PAIRS slipped past exact matching and were flagged (`WARN`, not fatal) so the Social trader could avoid double-counting sentiment:
- Movement Labs Chapter 11 bankruptcy (2 versions)
- Russia parliament crypto market law (2 versions)
- UK banking barriers / chokepoint inquiry (2 versions)

**Macro-Analyst** — globals validated: total mcap ~$2.34T, 24h change +1.18%, BTC dominance 56.82% (all in range). Fear & Greed: 8/8 readings valid (22–29 band), chronologically ordered, no dupes. Market news validated.

No analyst returned BLOCK, so all three lanes were cleared to trade.

---

## Tecnic — technical read on SOL/USD

- Current price: ~$77.95
- **P(up): 57.0%  |  P(down): 43.0%  →  DIRECTION: UP**

**Key signals:**
- MA structure: SMA10 76.42 > SMA30 76.00 (thin, recent bullish cross); EMA10 76.87 > EMA30 76.33 → bullish, low weight
- Price vs SMA50: 77.95 vs 73.17 (+6.5%) → price well above long-term MA, bullish structure, moderate weight
- RSI(14) = 41.0 → below the 50 midline, soft/neutral, not oversold, not confirming strength
- MACD: line 0.445 < signal 0.624, histogram -0.18 → still bearish/below zero, BUT histogram has climbed 6 straight sessions (-0.43 → -0.18), a leading (not yet confirmed) bullish signal
- Bollinger %B = 0.48 → dead mid-band, no stretch, neutral
- Drift: 3d +3.34%, 5d +3.56% → decent positive short-term push
- Volume: last-5-day avg (~1.46B) ~34% below prior-20-day avg (~2.21B) → bounce on fading volume, non-confirming

**Reasoning:** Trend structure (price above the 50-day, fast MAs above slow) and a
genuine 3–5 day positive drift give the edge to upside, and the steadily rising
MACD histogram hints a bullish crossover may be near. But RSI under 50 and MACD
still negative/below-signal mean momentum hasn't confirmed the move, and the rally
comes on fading volume rather than rising participation — the classic
conviction-killer. That split picture keeps confidence in the 50s, not the 70s.

---

## Social — sentiment & 1/2/5-day shape

- **P(up): 63.0%  |  P(down): 37.0%  →  DIRECTION: UP**
- SHAPE: 1d +0.33%, 2d +2.15%, 5d +3.56% → good (consistent uptrend, momentum building into ~$77)
- SENTIMENT: positive but thin coin-specific coverage — 0 of 37 de-duplicated provided headlines mention SOL directly; 3 positive SOL-specific stories found via supplemental WebSearch, no SOL-specific negatives

**Sample headlines:**
- 🟢 US Solana ETFs log positive inflows every July trading day; TSOL switches to FTSE benchmark (supplemental)
- 🟢 Solana and HYPE ETF inflows rise as XRP funds face fresh outflows (supplemental)
- 🟢 Morgan Stanley files updated documents for spot Solana ETF (ticker MSOL, 0.14% fee) (supplemental)
- 🔴 Movement Labs files for Chapter 11 bankruptcy (provided set, dedup'd 2 versions — MOVE is a different chain, background noise only)
- ⚪ Bitcoin rally faces key test at $68,000 as 'summer slumber' grips crypto (provided set, market-wide, not SOL-specific)

**Reasoning:** Price shape is cleanly positive across all three windows with
acceleration into the 5-day window, and SOL sits right at the ~$77 level flagged as
a flip-to-support trigger. Supplemental SOL-specific news is modestly bullish and
non-contradictory (sustained July ETF-inflow streak, a new Morgan Stanley spot-SOL
filing, rising active addresses). But the analyst-vetted 40-headline set contains
zero SOL-specific stories — all BTC/ETH/macro-regulatory chatter — so coin-specific
sentiment signal is thin. That widened uncertainty and held P_up at 63% rather than
higher (deterministic baseline was 60.5%).

---

## Macro — whole-market regime: **BULLISH**

- Total market cap: ~$2.34T
- BTC dominance: 56.8%
- **P(up): 65.0%  |  P(down): 35.0%  →  DIRECTION: UP**

**Key signals:**
- Total mcap 24h: +1.18% (~$2.34T) → mildly bullish, confirmed by independent web check (no divergence)
- BTC dominance: 56.8% → elevated/flat, no altcoin rotation; capital concentrated in BTC = cautious risk-on, not broad risk-on
- Fear & Greed: 25 (Extreme Fear), 8-day path 22→29→25, ticked back down last 2 readings → extreme-fear zone is contrarian-bullish but not yet a clean reversal
- News tone: net positive → ETF inflow streak (5 days, $600M+), Clarity Act ethics-deal optimism, BTC 7-week highs dominate breadth; offset by Movement Labs bankruptcy, Iran/tariff geopolitics, MiCA-exit concerns

**Reasoning:** Market cap is modestly up, news breadth skews constructive
(regulatory progress + sustained ETF inflows), and Extreme Fear historically favors
contrarian upside — together outweighing the flat/elevated BTC dominance (alts not
participating yet). Confidence was trimmed from the model's raw ~73% toward 65%
because an independent web check found technical commentary describing the broader
trend as "structurally bearish," and dominance near 56–57% suggests a narrow,
BTC-led rally rather than broad risk-on. The fear regime has not decisively resolved.

_Macro sources: cryptonomist.ch, tv-hub.org, milkroad.com._

---

### How the decision rule works

```
TRADE  ⇔  (Tecnic.dir == Social.dir == Macro.dir)
         AND every agent's confidence in that direction > 70%   (70.0% is NOT > 70%)
         AND no analyst returned a FATAL / BLOCK data issue
```

Checked against this run:
- **Unanimous direction?** YES — all three point UP.
- **Every agent > 70%?** NO — confidences were 57% / 63% / 65% (min 57%). ← this is what blocks the trade.
- **Any data block?** NO — all three analysts returned PASS.

Two of the three conditions are satisfied, but the confidence bar is not. The rule
is intentionally strict: a unanimous but moderate-conviction UP lean is **NO TRADE
(HOLD)**, not a weak buy. The committee waits for stronger multi-factor alignment.
