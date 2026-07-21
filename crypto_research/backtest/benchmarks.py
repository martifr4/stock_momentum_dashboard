"""Benchmark strategies, run through the *same* engine as the strategy.

Running benchmarks through the identical execution/cost machinery is the honest
way to compare — the benchmark pays the same open-to-open lag (and, for
rebalancing, the same costs) the strategy does.

* **Buy-and-hold BTC** — 100% weight in the benchmark asset from its first
  available bar, never rebalanced (so it pays cost only once, at entry).
* **Equal-weight** — equal weight across all currently-listed assets, rebalanced
  daily (pays ongoing turnover cost, like a real EW index would).
"""
from __future__ import annotations

import pandas as pd

from .engine import BacktestResult, run_backtest


def buy_and_hold_weights(panel: pd.DataFrame, asset: str) -> pd.DataFrame:
    """Static 100%-in-``asset`` target-weight frame (decided each day = 1.0)."""
    close = panel["close"].unstack("asset").sort_index()
    weights = pd.DataFrame(0.0, index=close.index, columns=close.columns)
    # Long only once the asset has a price; constant thereafter (no rebalancing
    # churn beyond the initial entry, since the target is flat at 1.0).
    listed = close[asset].notna()
    weights.loc[listed, asset] = 1.0
    return weights


def equal_weight_weights(panel: pd.DataFrame) -> pd.DataFrame:
    """Equal weight across all currently-listed assets, each day."""
    close = panel["close"].unstack("asset").sort_index()
    listed = close.notna()
    n_listed = listed.sum(axis=1).replace(0, pd.NA)
    weights = listed.div(n_listed, axis=0).astype(float).fillna(0.0)
    return weights


def run_benchmarks(
    panel: pd.DataFrame, benchmark_asset: str, initial_capital: float,
    cost_bps: float, slippage_bps: float,
) -> dict[str, BacktestResult]:
    """Run both benchmarks through the engine and return them by name."""
    bh = run_backtest(
        panel, buy_and_hold_weights(panel, benchmark_asset),
        initial_capital, cost_bps, slippage_bps,
    )
    ew = run_backtest(
        panel, equal_weight_weights(panel),
        initial_capital, cost_bps, slippage_bps,
    )
    return {f"buy_hold_{benchmark_asset}": bh, "equal_weight": ew}
