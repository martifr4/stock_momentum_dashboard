"""The crown-jewel property: NO LOOKAHEAD.

We test it empirically, not just by assertion: if we perturb prices strictly in
the *future* (after some cutoff date), every feature value and every decision
weight at or before that cutoff must be byte-for-byte identical. If any past
value changes when the future changes, information is leaking backwards.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from crypto_research.features.price import compute_price_features
from crypto_research.features.volume import compute_volume_features
from crypto_research.decision.rules import RulesCombiner
from tests.conftest import make_panel

_PRICE_KW = dict(
    return_horizons=[1, 5, 21], momentum_lookback=100, momentum_skip=10,
    moving_averages=[10, 50, 100], realized_vol_window=21, atr_window=14,
)


def _features(panel):
    price = compute_price_features(panel, **_PRICE_KW)
    vol = compute_volume_features(panel, baseline_window=30, zscore_window=30)
    return price.join(vol, how="outer").sort_index()


def test_features_do_not_change_when_future_changes():
    panel = make_panel(n_days=400, seed=1)
    cutoff = panel.index.get_level_values("date").unique()[250]

    base = _features(panel)

    # Perturb ALL prices strictly after the cutoff by a large factor.
    perturbed = panel.copy()
    future = perturbed.index.get_level_values("date") > cutoff
    perturbed.loc[future, ["open", "high", "low", "close", "volume"]] *= 1.5
    after = _features(perturbed)

    past = base.index.get_level_values("date") <= cutoff
    base_past = base[past].dropna(how="all")
    after_past = after.loc[base_past.index]

    # Every past feature must be unchanged.
    diff = (base_past - after_past).abs().to_numpy()
    max_diff = np.nanmax(diff) if diff.size else 0.0
    assert max_diff < 1e-9, f"future leaked into past features (max diff {max_diff})"


def test_decision_weights_do_not_change_when_future_changes():
    panel = make_panel(n_days=400, seed=2)
    dates = panel.index.get_level_values("date").unique()
    cutoff = dates[250]

    combiner = RulesCombiner(
        weights={"momentum_12_1": 1.0, "trend_ma": 1.0, "vol_penalty": 0.5, "volume_confirm": 0.5},
        long_threshold=0.25, short_threshold=-0.25, allow_short=True,
    )

    w_base = combiner.generate(_features(panel)).weights

    perturbed = panel.copy()
    future = perturbed.index.get_level_values("date") > cutoff
    perturbed.loc[future, ["open", "high", "low", "close", "volume"]] *= 0.5
    w_after = combiner.generate(_features(perturbed)).weights

    past = w_base.index <= cutoff
    diff = (w_base[past] - w_after.loc[w_base[past].index]).abs().to_numpy()
    assert np.nanmax(diff) < 1e-9, "future prices changed past decisions (lookahead)"
