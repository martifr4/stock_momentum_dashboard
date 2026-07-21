"""Transparent, rules-based signal combiner.

Every step is explicit and vectorized, and — critically — **causal**: signals
are standardized with an *expanding* window (mean/std of all values up to and
including ``T``), never the full-sample statistics. Using full-sample z-scores
would leak the future into the past; the expanding window is the honest choice
and the backtest's lookahead assertion would catch it if we got it wrong.

Composite score per (date, asset):

    score = w_mom   * z(momentum_12_1)
          + w_trend * z(ma_fast_slow)
          - w_vol   * z(realized_vol)          # high vol reduces conviction
          + w_volc  * z(vol_price_div)         # volume confirmation adds it

Then a dead-band maps score -> target weight:

    score >  long_threshold          -> tanh(score)         (long)
    score <  short_threshold & short -> tanh(score)         (short, if allowed)
    otherwise                        -> 0                    (flat)
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .base import Combiner, CombinerOutput

_MIN_HISTORY = 63  # need some history before z-scores are meaningful


def _expanding_z(wide: pd.DataFrame, min_periods: int = _MIN_HISTORY) -> pd.DataFrame:
    """Causal z-score: standardize each column by its expanding mean/std."""
    mean = wide.expanding(min_periods=min_periods).mean()
    std = wide.expanding(min_periods=min_periods).std()
    return (wide - mean) / std.replace(0.0, np.nan)


class RulesCombiner(Combiner):
    name = "rules"

    def __init__(
        self,
        weights: dict[str, float],
        long_threshold: float,
        short_threshold: float,
        allow_short: bool,
    ):
        self.weights = weights
        self.long_threshold = long_threshold
        self.short_threshold = short_threshold
        self.allow_short = allow_short

    def generate(self, features: pd.DataFrame) -> CombinerOutput:
        # Pull each driver as a (date x asset) wide frame, then z-score causally.
        def wide(col: str) -> pd.DataFrame:
            return features[col].unstack("asset").sort_index()

        z_mom = _expanding_z(wide("mom_12_1"))
        z_trend = _expanding_z(wide("ma_fast_slow"))
        z_vol = _expanding_z(wide("realized_vol"))
        z_volc = _expanding_z(wide("vol_price_div"))

        w = self.weights
        score = (
            w.get("momentum_12_1", 0.0) * z_mom
            + w.get("trend_ma", 0.0) * z_trend
            - w.get("vol_penalty", 0.0) * z_vol
            + w.get("volume_confirm", 0.0) * z_volc
        )

        raw = np.tanh(score)
        target = raw.copy()
        # Dead band: flat between thresholds.
        flat_mask = (score <= self.long_threshold) & (score >= self.short_threshold)
        target = target.where(~flat_mask, 0.0)
        if not self.allow_short:
            target = target.clip(lower=0.0)

        # Where score is NaN (insufficient history), stay flat, not NaN.
        target = target.where(score.notna(), 0.0)

        rationales = self._build_rationales(score, z_mom, z_trend, z_vol, z_volc, target)
        return CombinerOutput(weights=target.sort_index(), rationales=rationales)

    @staticmethod
    def _build_rationales(score, z_mom, z_trend, z_vol, z_volc, target) -> dict:
        """Attach a short, human-readable why-string to the most recent date."""
        rationales: dict[tuple, str] = {}
        last_date = target.index.max()
        for asset in target.columns:
            s = score.loc[last_date, asset]
            if pd.isna(s):
                continue
            tw = target.loc[last_date, asset]
            stance = "LONG" if tw > 0 else ("SHORT" if tw < 0 else "FLAT")
            rationales[(last_date, asset)] = (
                f"{stance} (target {tw:+.2f}): score={s:+.2f} from "
                f"mom_z={z_mom.loc[last_date, asset]:+.2f}, "
                f"trend_z={z_trend.loc[last_date, asset]:+.2f}, "
                f"vol_z={z_vol.loc[last_date, asset]:+.2f}, "
                f"volconf_z={z_volc.loc[last_date, asset]:+.2f}"
            )
        return rationales
