"""Price-dynamics features.

Every feature here is **causal**: the value at date ``T`` uses only prices at or
before ``T``. Pandas rolling / shift operations are backward-looking by default,
and we add no forward-looking transforms. The backtest layer additionally
asserts this property empirically, but keeping it correct at the source is the
first line of defence against lookahead.

Output is a long (date, asset) frame of documented, individually-named columns
so downstream combiners can reference features explicitly.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def _log_returns(close: pd.DataFrame) -> pd.DataFrame:
    return np.log(close / close.shift(1))


def compute_price_features(
    panel: pd.DataFrame,
    return_horizons: list[int],
    momentum_lookback: int,
    momentum_skip: int,
    moving_averages: list[int],
    realized_vol_window: int,
    atr_window: int,
) -> pd.DataFrame:
    """Compute the price feature frame from an OHLCV panel.

    Parameters mirror ``config.features``. ``panel`` is a MultiIndex
    (date, asset) frame with columns ``open/high/low/close/volume`` (as produced
    by :func:`crypto_research.data.ingest.load_universe`).

    Returns a MultiIndex (date, asset) frame; column meanings:

    * ``ret_{h}``            – simple return over the last ``h`` days.
    * ``mom_12_1``           – momentum: return from ``T-lookback`` to
      ``T-skip`` (classic 12-1, skipping the most recent month to avoid the
      short-term reversal effect).
    * ``ma_{w}``             – simple moving average of close over ``w`` days.
    * ``px_vs_ma_{w}``       – (close / MA_w) - 1, trend position vs each MA.
    * ``ma_fast_slow``       – (MA_short / MA_long) - 1 using the shortest and
      longest configured windows (golden/death-cross proxy).
    * ``realized_vol``       – annualized rolling std of daily log returns.
    * ``atr``                – Average True Range over ``atr_window``.
    * ``atr_pct``            – ATR / close (volatility as a fraction of price).
    * ``drawdown``           – current drawdown from the running peak close
      (<= 0), a persistent risk-state feature.
    """
    close = panel["close"].unstack("asset").sort_index()
    high = panel["high"].unstack("asset").sort_index()
    low = panel["low"].unstack("asset").sort_index()

    out: dict[str, pd.DataFrame] = {}

    # --- multi-horizon returns -------------------------------------------
    for h in return_horizons:
        out[f"ret_{h}"] = close.pct_change(h)

    # --- 12-1 style momentum ---------------------------------------------
    # Return from (T - lookback) to (T - skip): price known at T-skip over price
    # known at T-lookback. Uses only past data.
    shifted_close = close.shift(momentum_skip)
    out["mom_12_1"] = shifted_close / close.shift(momentum_lookback) - 1.0

    # --- moving averages & relationships ---------------------------------
    ma_frames = {}
    for w in moving_averages:
        ma = close.rolling(w, min_periods=w).mean()
        ma_frames[w] = ma
        out[f"ma_{w}"] = ma
        out[f"px_vs_ma_{w}"] = close / ma - 1.0
    short_w, long_w = min(moving_averages), max(moving_averages)
    out["ma_fast_slow"] = ma_frames[short_w] / ma_frames[long_w] - 1.0

    # --- realized volatility (annualized) --------------------------------
    log_ret = _log_returns(close)
    out["realized_vol"] = log_ret.rolling(realized_vol_window, min_periods=realized_vol_window).std() * np.sqrt(365)

    # --- ATR --------------------------------------------------------------
    # True Range = max(high-low, |high-prev_close|, |low-prev_close|), per asset.
    prev_close = close.shift(1)
    tr = pd.DataFrame(index=close.index, columns=close.columns, dtype=float)
    for asset in close.columns:
        hl = high[asset] - low[asset]
        hc = (high[asset] - prev_close[asset]).abs()
        lc = (low[asset] - prev_close[asset]).abs()
        tr[asset] = pd.concat([hl, hc, lc], axis=1).max(axis=1)
    atr = tr.rolling(atr_window, min_periods=atr_window).mean()
    out["atr"] = atr
    out["atr_pct"] = atr / close

    # --- drawdown state ---------------------------------------------------
    running_peak = close.cummax()
    out["drawdown"] = close / running_peak - 1.0

    return _stack(out)


def _stack(feature_frames: dict[str, pd.DataFrame]) -> pd.DataFrame:
    """Combine {name: (date x asset)} frames into a (date, asset) long frame."""
    stacked = {
        name: frame.stack(future_stack=True).rename(name)
        for name, frame in feature_frames.items()
    }
    result = pd.concat(stacked.values(), axis=1)
    result.index.names = ["date", "asset"]
    return result.sort_index()
