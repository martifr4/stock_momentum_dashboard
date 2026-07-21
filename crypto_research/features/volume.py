"""Volume-dynamics features.

Causal, like the price module: every value at ``T`` uses only data up to ``T``.
Volume on synthetic (gap-filled) bars was set to 0 upstream, so those days
correctly read as "no participation" rather than inheriting a stale figure.

Columns produced (all long (date, asset)):

* ``vol_zscore``       – z-score of log volume vs a rolling baseline window;
  how unusual today's participation is.
* ``vol_trend``        – (short-window mean volume / baseline mean volume) - 1;
  is participation rising or fading.
* ``vol_price_div``    – volume-price divergence: sign agreement between the
  recent volume trend and the recent price trend. Positive means volume is
  confirming the price move; negative means the move is on fading volume
  (a classic non-confirmation warning).
* ``dollar_volume``    – close * volume, a liquidity proxy.
* ``dollar_vol_z``     – z-score of log dollar volume vs baseline.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def compute_volume_features(
    panel: pd.DataFrame,
    baseline_window: int,
    zscore_window: int,
    short_window: int = 5,
) -> pd.DataFrame:
    """Compute the volume feature frame from an OHLCV panel."""
    close = panel["close"].unstack("asset").sort_index()
    volume = panel["volume"].unstack("asset").sort_index()

    out: dict[str, pd.DataFrame] = {}

    # log1p keeps zero-volume (synthetic) bars finite and well-behaved.
    log_vol = np.log1p(volume)
    roll_mean = log_vol.rolling(zscore_window, min_periods=zscore_window).mean()
    roll_std = log_vol.rolling(zscore_window, min_periods=zscore_window).std()
    out["vol_zscore"] = (log_vol - roll_mean) / roll_std.replace(0.0, np.nan)

    short_mean = volume.rolling(short_window, min_periods=short_window).mean()
    base_mean = volume.rolling(baseline_window, min_periods=baseline_window).mean()
    out["vol_trend"] = short_mean / base_mean.replace(0.0, np.nan) - 1.0

    # Volume-price divergence: do the recent volume trend and price trend agree?
    price_trend = close.pct_change(short_window)
    vol_trend = out["vol_trend"]
    # Product of signs, scaled by volume-trend magnitude: +ve = confirmation.
    out["vol_price_div"] = np.sign(price_trend) * vol_trend

    dollar_volume = close * volume
    out["dollar_volume"] = dollar_volume
    log_dv = np.log1p(dollar_volume)
    dv_mean = log_dv.rolling(baseline_window, min_periods=baseline_window).mean()
    dv_std = log_dv.rolling(baseline_window, min_periods=baseline_window).std()
    out["dollar_vol_z"] = (log_dv - dv_mean) / dv_std.replace(0.0, np.nan)

    stacked = {
        name: frame.stack(future_stack=True).rename(name)
        for name, frame in out.items()
    }
    result = pd.concat(stacked.values(), axis=1)
    result.index.names = ["date", "asset"]
    return result.sort_index()
