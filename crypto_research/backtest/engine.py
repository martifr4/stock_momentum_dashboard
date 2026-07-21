"""Daily backtest engine — vectorized, next-bar execution, no lookahead.

Execution model (the single most important thing to get right):

* A target weight is **decided at the close of day T** (from features that use
  only data <= T).
* It is **executed at the open of day T+1**.
* The position is held over ``[open_{T+1}, open_{T+2}]`` and earns the
  **open-to-open** return of that window.

Concretely, the weight held during the period beginning at ``open[t]`` is the
target decided at ``close[t-1]`` — i.e. ``target.shift(1)``. That is a full day
of execution lag: the weight is fixed strictly before the return window it earns
starts. This makes same-bar execution structurally impossible.

Lookahead is additionally guarded by explicit assertions in
:func:`assert_no_lookahead`, which the engine runs on every backtest.

Costs: turnover on each rebalance is charged ``(cost_bps + slippage_bps)`` in
basis points, subtracted from that day's return. Turnover is the sum of absolute
weight changes at the open (target-to-target), a standard, slightly conservative
approximation.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class BacktestResult:
    equity: pd.Series          # net-of-cost equity curve (indexed by period start)
    returns: pd.Series         # net daily returns
    gross_returns: pd.Series   # daily returns before costs
    weights: pd.DataFrame      # weights actually held each period (date x asset)
    turnover: pd.Series        # per-day turnover (sum |dw|)
    costs: pd.Series           # per-day cost drag (fraction)
    initial_capital: float

    @property
    def total_costs_paid(self) -> float:
        """Total cost drag in currency terms (approx, on the equity path)."""
        return float((self.costs * self.equity.shift(1).fillna(self.initial_capital)).sum())


def open_to_open_returns(panel: pd.DataFrame) -> pd.DataFrame:
    """Return (date x asset) open-to-open simple returns.

    ``ret[t] = open[t+1] / open[t] - 1`` — the return realized by a position put
    on at ``open[t]``. The final date is NaN (no next open) and is dropped by the
    engine.
    """
    open_px = panel["open"].unstack("asset").sort_index()
    return open_px.shift(-1) / open_px - 1.0


def assert_no_lookahead(target: pd.DataFrame, held: pd.DataFrame) -> None:
    """Fail loudly if any weight is used before it could have been known.

    ``held[t]`` must equal ``target[t-1]`` (executed one day later). We verify
    the shift relationship exactly, and that the first non-flat held weight
    strictly post-dates the first non-flat target.
    """
    expected = target.shift(1)
    # Compare only where both are defined; they must match exactly.
    aligned_held = held.reindex_like(expected)
    diff = (aligned_held.fillna(0.0) - expected.fillna(0.0)).abs()
    max_diff = float(diff.to_numpy().max()) if diff.size else 0.0
    assert max_diff < 1e-12, (
        f"lookahead violation: held weights are not target.shift(1) "
        f"(max mismatch {max_diff:.2e})"
    )
    for asset in target.columns:
        # fillna(0) first: NaN counts as nonzero to numpy, and held's first row
        # is NaN by construction (no position before the first decision).
        t_nonzero = target[asset].fillna(0.0).to_numpy().nonzero()[0]
        h_nonzero = held[asset].fillna(0.0).to_numpy().nonzero()[0]
        if len(t_nonzero) and len(h_nonzero):
            assert h_nonzero[0] > t_nonzero[0], (
                f"lookahead violation for {asset}: position held no later than "
                "the decision that created it"
            )


def run_backtest(
    panel: pd.DataFrame,
    target_weights: pd.DataFrame,
    initial_capital: float,
    cost_bps: float,
    slippage_bps: float,
) -> BacktestResult:
    """Run the daily backtest for a set of target weights.

    ``panel`` is the OHLCV MultiIndex panel; ``target_weights`` is the (date x
    asset) pre-shift decision frame (weight decided at that date's close).
    """
    ret_oo = open_to_open_returns(panel)
    assets = [a for a in target_weights.columns if a in ret_oo.columns]
    target = target_weights[assets].sort_index()
    ret_oo = ret_oo.reindex(index=target.index, columns=assets)

    # Weight held during the period starting at open[t] = decided at close[t-1].
    held = target.shift(1)
    assert_no_lookahead(target, held)

    # Tradable rows: at least one asset has a next-open return. The terminal
    # row is all-NaN (no next open) and is dropped later, so it is excluded from
    # the survivorship check below.
    valid = ret_oo.notna().any(axis=1)

    # Contribution per asset. Where we hold nothing, contribution is exactly 0
    # even if the asset has no price (pre-listing); where we DO hold an asset on
    # a tradable day it must have a return, else it is a bug (trading a
    # non-existent asset).
    held_f = held.fillna(0.0)
    contrib = held_f * ret_oo
    missing_price_while_held = (
        (held_f.abs() > 1e-12) & ret_oo.isna()
    ).loc[valid]
    assert not missing_price_while_held.to_numpy().any(), (
        "attempted to hold an asset with no available return (survivorship bug)"
    )
    contrib = contrib.where(~(held_f == 0.0), 0.0).fillna(0.0)
    gross_ret = contrib.sum(axis=1)

    # Turnover at each rebalance open: change in held weights vs previous period.
    dw = held_f.diff().abs().sum(axis=1)
    dw.iloc[0] = held_f.iloc[0].abs().sum()  # initial position build
    cost_rate = (cost_bps + slippage_bps) / 1e4
    costs = dw * cost_rate

    net_ret = gross_ret - costs
    # Drop the final period (no next open -> NaN return everywhere).
    net_ret = net_ret[valid]
    gross_ret = gross_ret[valid]
    costs = costs[valid]
    dw = dw[valid]

    equity = (1.0 + net_ret).cumprod() * initial_capital

    return BacktestResult(
        equity=equity,
        returns=net_ret,
        gross_returns=gross_ret,
        weights=held_f.loc[net_ret.index],
        turnover=dw,
        costs=costs,
        initial_capital=initial_capital,
    )
