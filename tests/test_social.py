"""Social module: Fear & Greed normalization, causal lag, neutral fallback."""
from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

import crypto_research.features.social as social
from crypto_research.features.social import build_social_features


def _make_index(n_days=120):
    dates = pd.date_range("2021-01-01", periods=n_days, freq="D", tz="UTC")
    assets = ["BTC-USD", "ETH-USD"]
    return pd.MultiIndex.from_product([dates, assets], names=["date", "asset"])


def test_disabled_returns_neutral_and_flagged():
    idx = _make_index()
    res = build_social_features(idx, enabled=False, fear_greed=False, cache_dir="x")
    assert res.market_available is False
    assert (res.features["social_sentiment"] == 0.0).all()


def test_fear_greed_is_lagged_for_causality(monkeypatch):
    idx = _make_index(120)
    dates = idx.get_level_values("date").unique().sort_values()
    fng = pd.DataFrame(
        {"fng_value": np.arange(len(dates)), "fng_class": "x",
         "fng_norm": (np.arange(len(dates)) - 50.0) / 50.0},
        index=dates,
    )
    monkeypatch.setattr(social, "load_fear_greed", lambda *a, **k: fng)

    res = build_social_features(idx, enabled=True, fear_greed=True, cache_dir="x", lag_days=1)
    btc = res.features.xs("BTC-USD", level="asset")
    for i in range(2, 10):
        assert btc["social_value"].iloc[i] == fng["fng_value"].iloc[i - 1]
    assert np.isnan(btc["social_value"].iloc[0])
    assert btc["social_sentiment"].iloc[0] == 0.0


def test_fetch_failure_degrades_to_neutral(monkeypatch):
    idx = _make_index()
    def boom(*a, **k):
        raise RuntimeError("network down")
    monkeypatch.setattr(social, "load_fear_greed", boom)
    res = build_social_features(idx, enabled=True, fear_greed=True, cache_dir="x")
    assert res.market_available is False
    assert (res.features["social_sentiment"] == 0.0).all()
    assert "failed" in res.reason
