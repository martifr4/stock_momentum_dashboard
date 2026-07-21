# HONEST_ASSESSMENT.md

_Last regenerated from a full run on 2019-01-01 → 2025-06-30 daily data
(Coinbase Exchange), rules combiner, 10 bps cost + 5 bps slippage per unit
turnover, next-open execution, 500 null-test runs._

## Bottom line: does the strategy beat the benchmarks after costs, out-of-sample?

**No.** Out-of-sample (2024-01-01 onward), the strategy **loses money** and is
beaten decisively by simply holding BTC.

| Metric (net of costs) | Strategy | Buy-&-Hold BTC | Equal-Weight |
|---|---|---|---|
| **Full-sample Sharpe** | 0.79 | **1.12** | **1.15** |
| Full-sample CAGR | 13.0% | 67.3% | 78.9% |
| Full-sample MaxDD | −32.0% | −76.7% | −85.5% |
| **Out-of-sample Sharpe** | **−0.44** | **1.48** | **0.90** |
| **Out-of-sample CAGR** | **−9.6%** | **87.6%** | **44.9%** |
| In-sample Sharpe | 1.20 | — | — |

Read that middle-to-bottom block carefully. The strategy looked good **in-sample**
(Sharpe 1.20, CAGR 20.9%), but that is the period whose behavior informed the
feature and combiner design. On the **held-out** period the strategy earned a
**negative** Sharpe while both benchmarks were strongly positive. That is the
textbook signature of an in-sample fit that does not generalize.

## What the null test does and doesn't tell us

The strategy's **full-sample** Sharpe (0.79) sits at the ~100th percentile of the
shuffled-signal null distribution (null mean Sharpe ≈ −0.09, 95th pct ≈ 0.38). So
the signal's *timing* carries information relative to randomly permuting the same
positions — it is **not pure noise**.

But "beats a random shuffle of itself" is a much weaker claim than "is worth
trading." A long-biased crypto strategy will beat a *random* long/flat schedule
mostly because crypto went up over the sample — the null here does not neutralize
the market's own drift. **The benchmark comparison, not the null test, is the
binding verdict, and the benchmark comparison says do not trade this.**

## Why the honest result is what it is

The rules combiner is essentially long-biased trend/momentum on 3 assets. Over
2019–2023 that rode the bull market (though still worse than just holding). In
2024–2025 the chop and sharp reversals punished a lagging trend signal, and
turnover roughly tripled (10x → 33x annualized), so costs bit harder exactly when
the signal was weakest. Concentrating in 3 correlated majors means there is no
real diversification to harvest — you are mostly making a levered bet on "crypto
up," which buy-and-hold does more cheaply.

## What could still be leaking or overfit (things I do NOT fully trust)

1. **Combiner/feature choices are in-sample-informed.** The weights, thresholds,
   z-score windows, and which features to include were chosen while looking at
   the whole series. The IS/OOS split guards the *reported* numbers, but it does
   **not** retroactively make the design choices out-of-sample. A truly clean
   evaluation would re-select everything on IS only, then touch OOS exactly once.
   This code makes that discipline *possible*; it does not enforce that I never
   glanced at later data while building.
2. **Survivorship is handled for the chosen universe, but the universe itself is
   survivor-biased.** BTC/ETH/SOL are today's winners. Coins that died are absent.
   Any "crypto momentum works" conclusion is contaminated by having picked assets
   that survived.
3. **Single data vendor, no cross-check.** All prices are Coinbase. Bad prints,
   halts, or vendor-specific quirks are not cross-validated against a second
   source. The `is_synthetic` flag caught 0 gaps here, which is reassuring but not
   independently verified.
4. **Execution realism is optimistic.** Next-open execution assumes you get the
   open print with only a flat bps slippage. Real fills, market impact on rebalance
   days, funding, and exchange downtime are not modeled. Turnover of 30x+/year is
   where these unmodeled frictions would hurt most.
5. **Cost model is a linear turnover charge.** It ignores the bid/ask spread
   widening in stress, and treats a full rebalance-to-target as the traded amount
   (slightly conservative), but does not model partial fills.
6. **The vol-target and gross scaling use recent realized vol**, which lags regime
   changes; in a fast drawdown it de-risks too late. That is realistic, but it
   means the drawdown numbers are not a floor.
7. **News module contributes nothing.** It is quarantined to neutral because there
   is no free, lookahead-safe historical news source. So this is *not* the
   "multi-signal + news" system in spirit — it is price+volume only. Do not read
   these results as evidence for or against a news signal.
8. **The LLM combiner was not run over the full history** (cost/time, and it needs
   an API key). When enabled it is structurally lookahead-safe (it only sees the
   current day's causal features), but I have **not** produced an OOS LLM track
   record, so I make **no** claim about whether LLM reasoning adds edge. Treat
   `decision.combiner: llm` as wired-and-testable, not as validated.

## What I would trust

- The **infrastructure**: UTC alignment, survivorship handling, next-bar
  execution, the empirical no-lookahead test (perturbing the future leaves the
  past bit-identical), and the cost accounting. These are unit-tested.
- The **direction** of the conclusion: a simple long-biased daily
  trend/momentum combiner on BTC/ETH/SOL, after realistic costs, **did not beat
  buy-and-hold**, and fell apart out-of-sample. I would trust that enough to
  *not* deploy this strategy.

## What I would do next (if chasing real edge, honestly)

- Select all parameters on IS only, freeze, then evaluate OOS exactly once.
- Broaden the universe (including delisted coins) to kill survivorship bias.
- Test market-neutral / cross-sectional (long-short ranked) construction so the
  result is not just a proxy for "crypto up."
- Add a second price source and reconcile.
- Only then consider whether an LLM combiner or a genuinely lookahead-safe news
  feed adds anything on top of the rules baseline.
