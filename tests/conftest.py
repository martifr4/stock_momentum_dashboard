"""Shared fixtures: small synthetic OHLCV panels (no network in unit tests)."""
from __future__ import annotations

import numpy as np
import pandas as pd
import pytest


def make_panel(n_days: int = 400, seed: int = 0, sol_start: int = 200) -> pd.DataFrame:
    """Build a synthetic (date, asset) OHLCV panel like the real ingester emits.

    SOL is introduced late (row ``sol_start``) so survivorship logic is testable.
    """
    rng = np.random.default_rng(seed)
    dates = pd.date_range("2020-01-01", periods=n_days, freq="D", tz="UTC")
    assets = ["BTC-USD", "ETH-USD", "SOL-USD"]
    frames = []
    for i, asset in enumerate(assets):
        drift = 0.001 * (i + 1)
        rets = rng.normal(drift, 0.03, n_days)
        close = 100 * (1 + i) * np.exp(np.cumsum(rets))
        open_ = close * (1 + rng.normal(0, 0.005, n_days))
        high = np.maximum(open_, close) * (1 + np.abs(rng.normal(0, 0.004, n_days)))
        low = np.minimum(open_, close) * (1 - np.abs(rng.normal(0, 0.004, n_days)))
        vol = rng.uniform(1e6, 5e6, n_days)
        df = pd.DataFrame(
            {"open": open_, "high": high, "low": low, "close": close, "volume": vol},
            index=dates,
        )
        if asset == "SOL-USD":
            df.iloc[:sol_start] = np.nan  # not listed yet -> survivorship
        df["asset"] = asset
        df["is_synthetic"] = False
        frames.append(df)
    panel = pd.concat(frames)
    panel.index.name = "date"
    return panel.set_index("asset", append=True).reorder_levels(["date", "asset"]).sort_index()


@pytest.fixture
def panel() -> pd.DataFrame:
    return make_panel()
