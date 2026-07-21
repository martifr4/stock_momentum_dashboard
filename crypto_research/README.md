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

## Switching combiners

```bash
python run_backtest.py --combiner rules     # default, transparent
python run_backtest.py --combiner llm        # Claude; needs ANTHROPIC_API_KEY
```

The LLM combiner only ever sees the current day's causal features (no
lookahead), caches responses to disk, and **degrades gracefully** (all-flat +
a clear note) if no API key is present — it never invents positions.

## Configuration

Everything is in [`config/config.yaml`](../config/config.yaml): universe, date
range, feature windows, combiner weights/thresholds, risk limits, costs, and the
OOS split date. Modules never hard-code parameters.
