"""Ingestion alignment (offline) + portfolio/risk caps."""
from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from crypto_research.data.ingest import align_panel
from crypto_research.portfolio.risk import apply_risk


# -- ingestion / alignment (no network) ----------------------------------
def _raw(dates, closes):
    df = pd.DataFrame({
        "open": closes, "high": closes, "low": closes, "close": closes,
        "volume": [10.0] * len(closes),
    }, index=pd.DatetimeIndex(dates, tz="UTC"))
    return df


def test_missing_interior_bar_is_filled_and_flagged():
    start = pd.Timestamp("2021-01-01", tz="UTC")
    end = pd.Timestamp("2021-01-05", tz="UTC")
    # Missing 2021-01-03.
    raw = _raw(["2021-01-01", "2021-01-02", "2021-01-04", "2021-01-05"],
               [100, 101, 103, 104])
    res = align_panel({"BTC-USD": raw}, start, end, max_forward_fill=2)
    close = res.wide("close")["BTC-USD"]
    synth = res.panel["is_synthetic"].xs("BTC-USD", level="asset")
    assert close.loc["2021-01-03"] == 101  # forward filled from 01-02
    assert bool(synth.loc["2021-01-03"]) is True
    assert res.synthetic_counts["BTC-USD"] == 1
    # Synthetic bar carries zero volume.
    assert res.panel.xs("BTC-USD", level="asset").loc["2021-01-03", "volume"] == 0.0


def test_survivorship_pre_listing_is_nan_not_filled():
    start = pd.Timestamp("2021-01-01", tz="UTC")
    end = pd.Timestamp("2021-01-05", tz="UTC")
    # Asset only lists on 01-03.
    raw = _raw(["2021-01-03", "2021-01-04", "2021-01-05"], [50, 51, 52])
    res = align_panel({"SOL-USD": raw}, start, end, max_forward_fill=5)
    close = res.wide("close")["SOL-USD"]
    assert np.isnan(close.loc["2021-01-01"])  # did not exist -> NaN
    assert np.isnan(close.loc["2021-01-02"])
    assert close.loc["2021-01-03"] == 50
    assert res.first_available["SOL-USD"] == pd.Timestamp("2021-01-03", tz="UTC")


def test_index_is_utc():
    start = pd.Timestamp("2021-01-01", tz="UTC")
    end = pd.Timestamp("2021-01-03", tz="UTC")
    raw = _raw(["2021-01-01", "2021-01-02", "2021-01-03"], [1, 2, 3])
    res = align_panel({"BTC-USD": raw}, start, end, max_forward_fill=1)
    assert res.panel.index.get_level_values("date").tz is not None
    assert str(res.panel.index.get_level_values("date").tz) == "UTC"


# -- portfolio / risk -----------------------------------------------------
def _flat_returns(dates, assets):
    return pd.DataFrame(0.0, index=dates, columns=assets)


def test_per_asset_cap_enforced():
    dates = pd.date_range("2021-01-01", periods=10, freq="D", tz="UTC")
    assets = ["A", "B"]
    target = pd.DataFrame({"A": [1.0] * 10, "B": [0.0] * 10}, index=dates)
    out = apply_risk(
        target, _flat_returns(dates, assets), max_position=0.5,
        gross_leverage=1.0, max_gross=1.0, vol_target_annual=0.0,
        vol_lookback=5, max_leverage_from_vol=2.0, trading_days_per_year=365,
    )
    assert (out.abs() <= 0.5 + 1e-9).all().all()


def test_max_gross_never_exceeded():
    dates = pd.date_range("2021-01-01", periods=10, freq="D", tz="UTC")
    assets = ["A", "B", "C"]
    target = pd.DataFrame(0.4, index=dates, columns=assets)
    out = apply_risk(
        target, _flat_returns(dates, assets), max_position=0.5,
        gross_leverage=1.0, max_gross=1.0, vol_target_annual=0.0,
        vol_lookback=5, max_leverage_from_vol=2.0, trading_days_per_year=365,
    )
    assert (out.abs().sum(axis=1) <= 1.0 + 1e-9).all()


def test_vol_target_scales_down_high_vol():
    dates = pd.date_range("2021-01-01", periods=120, freq="D", tz="UTC")
    assets = ["A"]
    rng = np.random.default_rng(0)
    # Very high vol asset -> vol targeting should scale exposure below 1.
    rets = pd.DataFrame({"A": rng.normal(0, 0.10, 120)}, index=dates)
    target = pd.DataFrame({"A": [1.0] * 120}, index=dates)
    out = apply_risk(
        target, rets, max_position=1.0, gross_leverage=1.0, max_gross=2.0,
        vol_target_annual=0.20, vol_lookback=21, max_leverage_from_vol=2.0,
        trading_days_per_year=365,
    )
    # After the lookback warms up, realized vol >> target, so weight < 1.
    late = out["A"].iloc[60:]
    assert late.mean() < 1.0
