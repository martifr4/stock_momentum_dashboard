# Committee Trade Report — BTC/USD
_Generated 2026-07-21 18:40_

> Deterministic multi-agent signal system. Not financial advice. Backtest before risking capital.

## Verdict

### ✅ TRADE: **UP BTC/USD**
All three agents agree **UP** with minimum confidence 75.0% (threshold 70%).

## Agent Scorecard

| Agent | Direction | P(up) | P(down) | Confidence |
|-------|:---------:|------:|--------:|-----------:|
| Tecnic | UP | 82.0% | 18.0% | 82.0% |
| Social | UP | 79.0% | 21.0% | 79.0% |
| Macro | UP | 75.0% | 25.0% | 75.0% |

## 🔎 Data Quality — analyst audit

| Analyst | Status | Flagged | Fixed |
|---------|:------:|:-------:|:-----:|
| Tecnic-Analyst | ✅ PASS | 1 | 1 |
| Social-Analyst | ✅ PASS | 1 | 1 |
| Macro-Analyst | ✅ PASS | 0 | 0 |

**Tecnic-Analyst** — Tecnic-Analyst: PASS (1 WARN; 1 fixed)

- `WARN` [prices] interpolated 1 gap (🔧 fixed)

**Social-Analyst** — Social-Analyst: PASS (1 WARN; 1 fixed)

- `WARN` [headlines] removed 2 duplicate headline(s) (🔧 fixed)

---

## 🧮 Tecnic — technical read on BTC/USD

- Current price: $64,250.00
- Net technical score: +2.80
- **P(up): 82.0%  |  P(down): 18.0%**

**Signals:**

- SMA 10/30: bullish +1.0
- RSI: 44 neutral +0.29
- MACD: hist + bullish +1.0

---

## 💬 Social — sentiment & 1/2/5-day shape

- Net social score: +1.90
- Matching headlines scanned: 7
- **P(up): 79.0%  |  P(down): 21.0%**

**Signals:**

- 1d momentum: +1.8% good +0.30
- 5d momentum: +6.2% good +0.50
- News sentiment: +0.5 +0.75

**Sample headlines:**

- 🟢 BTC ETF inflows hit record (+2)

---

## 🌐 Macro — whole-market regime: **BULLISH**

- Total market cap: $2,380,000,000,000
- BTC dominance: 54.2%
- Net macro score: +1.60
- **P(up): 75.0%  |  P(down): 25.0%**

**Signals:**

- Total mcap 24h: +2.4% bullish +0.8
- Fear & Greed: 22 Extreme Fear +0.8

---

### How the decision rule works

A trade fires only if **all three agents point the same way** *and* each reports **>70%** confidence in that direction. Any disagreement, or any agent below the bar, results in NO TRADE. This is intentionally strict — it trades rarely but only on strong multi-factor alignment.