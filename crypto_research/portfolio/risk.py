"""Portfolio construction & risk management.

Takes pre-risk target weights (date x asset, each in [-1, 1]) from a combiner
and turns them into final portfolio weights subject to:

* **Per-asset cap** — ``|w_i| <= max_position`` (no single-asset concentration).
* **Gross leverage target** — scale so ``sum(|w_i|) ~= gross_leverage`` when the
  combiner is fully invested (avoids being accidentally tiny or huge).
* **Volatility targeting** — scale the whole book toward an annual vol target
  using a *causal* estimate of recent portfolio volatility (only past returns),
  capped by ``max_leverage_from_vol``.
* **Max gross** — a hard final cap on ``sum(|w_i|)``.

All scaling uses information available at the decision date ``T`` only. The
vol-target estimate deliberately lags by one day (uses returns up to ``T-1``'s
realized move relative to weights known at ``T``) — see comments.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def _normalize_gross(weights: pd.DataFrame, gross_leverage: float) -> pd.DataFrame:
    """Scale each row so sum(|w|) == gross_leverage (rows that have exposure)."""
    gross = weights.abs().sum(axis=1)
    scale = pd.Series(1.0, index=weights.index)
    nonzero = gross > 1e-12
    scale[nonzero] = gross_leverage / gross[nonzero]
    return weights.mul(scale, axis=0)


def apply_risk(
    target_weights: pd.DataFrame,
    asset_returns: pd.DataFrame,
    max_position: float,
    gross_leverage: float,
    max_gross: float,
    vol_target_annual: float,
    vol_lookback: int,
    max_leverage_from_vol: float,
    trading_days_per_year: int,
) -> pd.DataFrame:
    """Convert pre-risk targets into final, capped, vol-targeted weights.

    ``asset_returns`` is the (date x asset) simple-return frame used only for the
    causal volatility estimate. Returns final weights (date x asset).
    """
    # Ordering principle: soft *targets* first (gross leverage, vol target),
    # then *hard caps* last so they always win. Otherwise gross normalization
    # could re-inflate a single asset back above its per-asset cap.
    w = target_weights.copy()

    # 1) Normalize gross exposure toward the target leverage (a soft target).
    w = _normalize_gross(w, gross_leverage)

    # 2) Volatility targeting (causal, also a soft target).
    if vol_target_annual and vol_target_annual > 0:
        # Portfolio return the book WOULD have earned each past day given the
        # weights we held. We use weights shifted by 1 against realized returns
        # so the vol estimate at T never uses T's own forward return.
        aligned_ret = asset_returns.reindex(index=w.index, columns=w.columns)
        port_ret = (w.shift(1) * aligned_ret).sum(axis=1)
        realized = port_ret.rolling(vol_lookback, min_periods=vol_lookback).std() * np.sqrt(trading_days_per_year)
        # Scale factor known at T uses realized vol through T-1 (shifted).
        scale = (vol_target_annual / realized.shift(1)).clip(upper=max_leverage_from_vol)
        scale = scale.fillna(1.0).replace([np.inf, -np.inf], 1.0)
        w = w.mul(scale, axis=0)

    # 3) HARD per-asset concentration cap (wins over the gross target above).
    w = w.clip(lower=-max_position, upper=max_position)

    # 4) HARD max-gross cap after all scaling (scale-down only, so it cannot
    #    re-break the per-asset cap just applied).
    gross = w.abs().sum(axis=1)
    over = gross > max_gross
    if over.any():
        cap_scale = pd.Series(1.0, index=w.index)
        cap_scale[over] = max_gross / gross[over]
        w = w.mul(cap_scale, axis=0)

    return w.fillna(0.0).sort_index()
