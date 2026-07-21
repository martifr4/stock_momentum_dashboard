# Backtest Report

```
======================================================================
CRYPTO STRATEGY BACKTEST
======================================================================

Universe: ['BTC-USD', 'ETH-USD', 'SOL-USD']
Date range: 2019-01-01 -> 2025-06-30
  BTC-USD: first listed 2019-01-01, synthetic bars filled: 0
  ETH-USD: first listed 2019-01-01, synthetic bars filled: 0
  SOL-USD: first listed 2021-06-17, synthetic bars filled: 0

News module: available=False (news disabled in config (quarantined); returning neutral signal)

Combiner: rules

----------------------------------------------------------------------
STRATEGY (rules) — FULL SAMPLE
----------------------------------------------------------------------
  CAGR              13.04%
  Ann. return       13.79%
  Ann. vol          17.53%
  Sharpe              0.79
  Sortino             0.88
  Max drawdown     -32.00%
  Calmar              0.41
  Hit rate          27.07%
  Avg win/loss    +0.9635% / -0.8088%
  Win/loss ratio      1.19
  Turnover (ann)     15.20x
  Costs paid      $      32,092
  Periods             2372

IN-SAMPLE (< 2024-01-01)
----------------------------------------------------------------------
  CAGR              20.86%
  Ann. return       20.40%
  Ann. vol          17.07%
  Sharpe              1.20
  Sortino             1.30
  Max drawdown     -21.74%
  Calmar              0.96
  Hit rate          25.68%
  Avg win/loss    +0.9914% / -0.8343%
  Win/loss ratio      1.19
  Turnover (ann)     10.01x
  Costs paid      $      13,136
  Periods             1826

OUT-OF-SAMPLE (>= 2024-01-01)   <-- the honest test
----------------------------------------------------------------------
  CAGR              -9.60%
  Ann. return       -8.30%
  Ann. vol          18.95%
  Sharpe             -0.44
  Sortino            -0.53
  Max drawdown     -32.00%
  Calmar             -0.30
  Hit rate          31.68%
  Avg win/loss    +0.8879% / -0.7581%
  Win/loss ratio      1.17
  Turnover (ann)     32.54x
  Costs paid      $      18,956
  Periods              546

----------------------------------------------------------------------
BENCHMARKS (same engine, same costs)
----------------------------------------------------------------------

buy_hold_BTC-USD:
  full : CAGR  67.25% | Sharpe  1.12 | MaxDD -76.67%
  OOS  : CAGR  87.61% | Sharpe  1.48 | MaxDD -28.17%

equal_weight:
  full : CAGR  78.92% | Sharpe  1.15 | MaxDD -85.46%
  OOS  : CAGR  44.91% | Sharpe  0.90 | MaxDD -49.14%

----------------------------------------------------------------------
NULL TEST (shuffle, 500 runs) — what no edge looks like
----------------------------------------------------------------------
  Null Sharpe: mean -0.09, std 0.29, 95th pct 0.38
  Strategy Sharpe 0.79 sits at the 100th percentile of the null distribution.
  Verdict vs noise: BEATS noise (>95th pct)

======================================================================
Done. See HONEST_ASSESSMENT.md for caveats and what NOT to trust.
======================================================================
```
