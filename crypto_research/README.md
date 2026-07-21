# Crypto Trading Research System

A modular, config-driven pipeline for **honestly** evaluating whether a
multi-signal daily crypto strategy has any real edge — built so that correctness
and out-of-sample honesty matter more than impressive-looking returns.

> **Headline result (this repo's default config): the strategy does NOT beat
> buy-and-hold BTC after costs, and it loses money out-of-sample.** See
> [`../HONEST_ASSESSMENT.md`](../HONEST_ASSESSMENT.md). The point of the system
> is that it *tells you that clearly* instead of hiding it.

## Quick start

```bash
pip install -r requirements-crypto.txt      # from repo root
python run_backtest.py                       # full pipeline, prints a report
python run_backtest.py --report REPORT.md    # also write Markdown report
python -m pytest tests/ -q                   # run the unit tests
```

First run pulls daily OHLCV from Coinbase and caches it to Parquet under
`data_cache/`; later runs are offline unless you pass `--refresh`.

## Architecture (independently testable modules)

| Module | File | Responsibility |
|---|---|---|
| Config | `crypto_research/config.py` | Typed loader over `config/config.yaml` |
| Data ingestion | `crypto_research/data/ingest.py` | Coinbase daily OHLCV, Parquet cache, UTC alignment, missing-bar fill (flagged), explicit survivorship |
| Price dynamics | `crypto_research/features/price.py` | Returns (multi-horizon), 12-1 momentum, MA relationships, realized vol, ATR, drawdown state |
| Volume dynamics | `crypto_research/features/volume.py` | Volume z-score & trend vs baseline, volume-price divergence, dollar-volume liquidity |
| News (quarantined) | `crypto_research/features/news.py` | Neutral + `news_available=False` by design — no free lookahead-safe history, so it never fabricates a signal |
| Decision | `crypto_research/decision/{rules,llm}.py` | Swappable combiners: (a) transparent rules, (b) Claude LLM reasoning |
| Portfolio / risk | `crypto_research/portfolio/risk.py` | Position sizing, per-asset cap, max-gross, vol targeting |
| Backtest | `crypto_research/backtest/*.py` | Next-bar execution, costs, no-lookahead assertions, metrics, benchmarks, walk-forward split, null test |
| Entry point | `run_backtest.py` | Wires it all together and reports IS vs OOS |

## Why you can trust the evaluation (and where you can't)

- **Data source**: Coinbase Exchange public candles (free, no key). Binance is
  geo-blocked from many hosts; CoinGecko's free tier lacks clean OHLC+volume.
- **No lookahead**: every feature at date T uses only data ≤ T. Enforced by
  causal transforms, an engine-level assertion (`assert_no_lookahead`), **and**
  an empirical test (`tests/test_no_lookahead.py`) that perturbs the *future*
  and checks the *past* is byte-identical.
- **Next-bar execution**: decide at T's close, execute at **T+1 open**
  (open-to-open returns), never same-bar.
- **Costs**: `cost_bps + slippage_bps` charged on turnover, subtracted from
  returns. Total costs paid are reported.
- **Walk-forward**: an OOS holdout (`backtest.oos_start`) is reported separately
  from in-sample.
- **Benchmarks**: buy-and-hold BTC and equal-weight, run through the *same*
  engine and cost model.
- **Null test**: the same pipeline on shuffled/random signals, to show what "no
  edge" looks like and where the strategy sits in that distribution.

The honest caveats — survivorship in the universe itself, in-sample-informed
design choices, single-vendor data, the untested LLM track record — are all laid
out in [`../HONEST_ASSESSMENT.md`](../HONEST_ASSESSMENT.md).

## Strategies (swappable combiners)

```bash
python run_backtest.py --combiner rules              # Strategy 1: transparent rules
python run_backtest.py --combiner llm                # plain Claude over features
python run_backtest.py --combiner claude_multisignal # Strategy 2 (below)
```

All combiners only ever see the current day's causal features (no lookahead),
cache responses to disk, and **degrade gracefully** (all-flat + a clear note) if
no `ANTHROPIC_API_KEY` is present — they never invent positions.

### Strategy 2 — Claude multi-signal (technicals + momentum + forums)

`decision/claude_multisignal.py` fuses **three pillars** and lets Claude make the
call:

1. **Technicals** — position vs 50/200-day MAs, fast/slow MA, ATR%, realized
   vol, drawdown.
2. **Momentum** — 12-1 momentum + 1/3-month returns.
3. **Social / forums** — see below.

The social input is where honesty bites, and it is handled in two modes:

| Mode | Social source | Lookahead-safe? |
|---|---|---|
| **Backtest** | **Fear & Greed Index** (alternative.me, free, daily since 2018), lagged 1 day | Yes — timestamped, and lagged for safety. But it is *market-wide*, not per-coin forum counts. |
| **Live** (`run_live.py`) | **StockTwits** per-coin mentions + bull/bear tags | Yes — "now" has no future. This is the real per-coin forum signal, usable forward only (no free history). |

```bash
# Forward/paper decision for today (real per-coin forum mentions participate):
ANTHROPIC_API_KEY=... python run_live.py
# Without a key it still prints every gathered live signal, just no decision.
```

**Status:** the strategy is fully wired, unit-tested (with a mock Claude client),
and runnable. It has **not** been run over history here (no API key in the build
environment), so this repo makes **no performance claim** for it yet — see
`../HONEST_ASSESSMENT.md`.

## Configuration

Everything is in [`config/config.yaml`](../config/config.yaml): universe, date
range, feature windows, combiner weights/thresholds, risk limits, costs, and the
OOS split date. Modules never hard-code parameters.
