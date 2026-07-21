"""Backtest engine: next-bar execution, cost accounting, guardrails."""
from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from crypto_research.backtest.engine import (
    open_to_open_returns, run_backtest, assert_no_lookahead,
)


def _one_asset_panel(opens):
    dates = pd.date_range("2021-01-01", periods=len(opens), freq="D", tz="UTC")
    df = pd.DataFrame({
        "open": opens, "high": opens, "low": opens, "close": opens,
        "volume": [1.0] * len(opens),
    }, index=dates)
    df["asset"] = "X"
    return df.set_index("asset", append=True).reorder_levels([0, 1]).rename_axis(["date", "asset"])


def test_open_to_open_return_is_next_bar():
    panel = _one_asset_panel([100.0, 110.0, 121.0])
    ret = open_to_open_returns(panel)["X"]
    # ret[t] = open[t+1]/open[t]-1
    assert ret.iloc[0] == pytest.approx(0.10)
    assert ret.iloc[1] == pytest.approx(0.10)
    assert np.isnan(ret.iloc[2])  # no next open


def test_full_long_matches_buy_and_hold_minus_one_entry_cost():
    # Decide weight 1.0 every day -> held from next open. With opens compounding
    # 10%/day, each held period earns 10%. Two tradable periods.
    panel = _one_asset_panel([100.0, 110.0, 121.0, 133.1])
    target = pd.DataFrame(1.0, index=panel.index.get_level_values("date").unique(), columns=["X"])
    res = run_backtest(panel, target, initial_capital=1000.0, cost_bps=0.0, slippage_bps=0.0)
    # 3 opens -> ret defined for first 3 dates? open has 4 pts -> ret_oo defined
    # for first 3 dates (last is NaN). held is target.shift(1): first period held=NaN->0.
    # So gross returns: period0 held 0, period1 held 1 ->10%, period2 held 1 ->10%.
    assert res.gross_returns.iloc[0] == pytest.approx(0.0)
    assert res.gross_returns.iloc[1] == pytest.approx(0.10)
    assert res.gross_returns.iloc[2] == pytest.approx(0.10)


def test_costs_reduce_returns_on_turnover():
    panel = _one_asset_panel([100.0, 100.0, 100.0, 100.0])
    dates = panel.index.get_level_values("date").unique()
    target = pd.DataFrame({"X": [1.0, 1.0, 1.0, 1.0]}, index=dates)
    res = run_backtest(panel, target, 1000.0, cost_bps=10.0, slippage_bps=0.0)
    # First held period builds the position (turnover 1.0) -> cost 10bps.
    assert res.costs.iloc[0] == pytest.approx(0.0)   # held=0 on first period
    assert res.costs.iloc[1] == pytest.approx(10 / 1e4)  # position built
    # No further turnover afterwards.
    assert res.costs.iloc[2] == pytest.approx(0.0)


def test_no_lookahead_assertion_catches_same_bar():
    dates = pd.date_range("2021-01-01", periods=5, freq="D", tz="UTC")
    target = pd.DataFrame({"X": [1.0, 0, 0, 0, 0]}, index=dates)
    # A "cheating" held frame that uses the weight on the SAME bar it was decided.
    held_cheat = target.copy()  # not shifted -> lookahead
    with pytest.raises(AssertionError):
        assert_no_lookahead(target, held_cheat)


def test_survivorship_guard_trips_on_pre_listing_hold():
    from tests.conftest import make_panel
    panel = make_panel(n_days=300, sol_start=150)
    dates = panel.index.get_level_values("date").unique()
    # Force a SOL position from day 1 (before it lists at row 150).
    target = pd.DataFrame(0.0, index=dates, columns=["BTC-USD", "ETH-USD", "SOL-USD"])
    target["SOL-USD"] = 1.0
    with pytest.raises(AssertionError):
        run_backtest(panel, target, 1000.0, 0.0, 0.0)
