"""Rules combiner behavior, news quarantine, and LLM graceful degradation."""
from __future__ import annotations

import os

import numpy as np
import pandas as pd
import pytest

from crypto_research.decision.rules import RulesCombiner
from crypto_research.decision.llm import LLMCombiner, _extract_json
from crypto_research.features.news import compute_news_features
from crypto_research.features.price import compute_price_features
from crypto_research.features.volume import compute_volume_features
from tests.conftest import make_panel


def _features():
    panel = make_panel(n_days=400, seed=3)
    price = compute_price_features(
        panel, return_horizons=[1, 5, 21], momentum_lookback=100,
        momentum_skip=10, moving_averages=[10, 50, 100],
        realized_vol_window=21, atr_window=14,
    )
    vol = compute_volume_features(panel, baseline_window=30, zscore_window=30)
    return price.join(vol, how="outer").sort_index()


def test_rules_long_only_never_short():
    combiner = RulesCombiner(
        weights={"momentum_12_1": 1.0, "trend_ma": 1.0, "vol_penalty": 0.5, "volume_confirm": 0.5},
        long_threshold=0.25, short_threshold=-0.25, allow_short=False,
    )
    out = combiner.generate(_features())
    assert (out.weights.to_numpy() >= -1e-12).all(), "long-only produced a short"


def test_rules_short_allowed_can_go_negative():
    combiner = RulesCombiner(
        weights={"momentum_12_1": 1.0, "trend_ma": 1.0, "vol_penalty": 0.5, "volume_confirm": 0.5},
        long_threshold=0.25, short_threshold=-0.25, allow_short=True,
    )
    out = combiner.generate(_features())
    assert (out.weights.to_numpy() < 0).any(), "allow_short never produced a short"


def test_rules_deadband_produces_flats():
    combiner = RulesCombiner(
        weights={"momentum_12_1": 1.0, "trend_ma": 1.0, "vol_penalty": 0.5, "volume_confirm": 0.5},
        long_threshold=0.25, short_threshold=-0.25, allow_short=True,
    )
    out = combiner.generate(_features())
    assert (out.weights.to_numpy() == 0.0).any(), "dead band never yielded a flat"


def test_rules_weights_bounded():
    combiner = RulesCombiner(
        weights={"momentum_12_1": 1.0, "trend_ma": 1.0, "vol_penalty": 0.5, "volume_confirm": 0.5},
        long_threshold=0.0, short_threshold=0.0, allow_short=True,
    )
    out = combiner.generate(_features())
    assert (out.weights.abs().to_numpy() <= 1.0 + 1e-9).all()


def test_news_is_quarantined_neutral_and_flagged():
    feats = _features()
    res = compute_news_features(feats.index, enabled=False)
    assert res.news_available is False
    assert (res.scores == 0.0).all()
    # Even if "enabled", still neutral + flagged (no lookahead-safe source).
    res2 = compute_news_features(feats.index, enabled=True)
    assert res2.news_available is False
    assert (res2.scores == 0.0).all()


def test_llm_combiner_degrades_without_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    combiner = LLMCombiner(model="claude-opus-4-8")
    out = combiner.generate(_features())
    assert out.available is False
    assert (out.weights.to_numpy() == 0.0).all()  # all-flat, not invented


def test_extract_json_tolerates_prose():
    text = 'Sure! Here you go:\n{"BTC-USD": {"weight": 0.5, "why": "up"}}\nHope that helps.'
    parsed = _extract_json(text)
    assert parsed["BTC-USD"]["weight"] == 0.5
