# Three-Agent Crypto Trade Committee

A deterministic, **no-API-key** multi-agent system. Three independent agents each
produce a probability of an UP vs DOWN move for a crypto pair. A trade is only
greenlit when **all three agree on direction AND each exceeds a 70% confidence bar**.

No LLM is used anywhere — every decision is transparent, reproducible, and backtestable.

## The agents

| Agent | Role | Data it uses |
|-------|------|--------------|
| **Tecnic** | Professional-trader technical read | Daily OHLC/volume → SMA, RSI, MACD, Bollinger, momentum, volume (CoinGecko) |
| **Social** | Sentiment + 1/2/5-day shape | Price momentum over 1/2/5 days + keyword sentiment of crypto news RSS |
| **Macro** | Whole-market regime | Global market-cap change, BTC dominance, Fear & Greed index, market-wide news tone |

Each returns `p_up`, `p_down`, a direction, and a documented list of signals.

## The analysts (data-quality layer)

Every trader has a dedicated **analyst** that validates and repairs its input
data *before* the trader analyzes it. Analysts live in `analysts.py`:

| Analyst | Guards | Checks & fixes |
|---------|--------|----------------|
| **Tecnic-Analyst** | price + volume history | drops None/NaN/inf/negative/zero values, interpolates interior gaps, aligns price/volume lengths, flags frozen (stale) runs and >6σ outlier ticks, blocks if too few points |
| **Social-Analyst** | short price history + headlines | validates momentum series, removes duplicate (exact + case-insensitive) and empty headlines |
| **Macro-Analyst** | global stats + Fear&Greed + news | nulls out-of-range values (e.g. dominance >100%, non-numeric mcap change), drops invalid/duplicate F&G readings, de-duplicates market news |

Every issue is logged with a severity (`INFO / WARN / ERROR / FATAL`) and whether
it was fixed. The audit appears in a **Data Quality** section of every report.
A `FATAL` issue (unrepairable data) **blocks that trader and forces NO TRADE** —
the committee never trades on data an analyst couldn't vouch for.

## The rule

```
TRADE  ⇔  (Tecnic.dir == Social.dir == Macro.dir)  AND  every agent's confidence > 70%
```

Otherwise: **NO TRADE**. Strict by design — it trades rarely, only on strong
multi-factor alignment.

## Setup

```bash
pip install requests
```

## Run

```bash
python coordinator.py BTC                 # BTC/USD, 70% threshold
python coordinator.py ETH --threshold 0.75
python coordinator.py SOL
```

Writes a dated markdown report to `reports/committee_<COIN>_<DATE>.md` and prints
the verdict. See `reports/SAMPLE_committee_BTC.md` for an example of the output.

## Run it daily (cron, Mac/Linux)

```
0 9 * * * cd /path/to/crypto_agents && /usr/bin/python3 coordinator.py BTC
```

## Files

- `indicators.py` — pure-python technical indicators
- `datasources.py` — all key-free data fetching (CoinGecko, Fear&Greed, RSS)
- `analysts.py` — the three data-quality analysts + validation primitives
- `agent_tecnic.py` / `agent_social.py` / `agent_macro.py` — the three traders
- `coordinator.py` — runs the committee, applies the rule, writes the report

## Important limitations (read this)

- **This generates signals; it does not place orders.** Wiring to a real exchange
  is a separate, higher-risk step.
- **Probabilities are heuristic, not calibrated.** They come from squashing indicator
  scores through a logistic function. A "75%" here is a relative confidence, not a
  statistically validated forecast. **Backtest before trusting any of it.**
- **Social sentiment uses news RSS as a proxy**, because X/Reddit block key-free
  scraping. Swap a paid social API into `agent_social._headline_sentiment` to upgrade;
  the interface stays the same.
- **Free CoinGecko endpoints are rate-limited.** The built-in pauses handle single-pair
  runs; heavy use may need the paid tier.
- **Not financial advice.** Mechanical systems lose money too. You are responsible for
  any capital you deploy.
