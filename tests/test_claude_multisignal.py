"""Claude multi-signal combiner: decision loop driven by a MOCK Claude client.

No network / API key: we inject a fake client so the plumbing (prompt -> parse ->
weights, holding between decision dates, caching, long-only clipping) is verified
deterministically.
"""
from __future__ import annotations

import json

import numpy as np
import pandas as pd
import pytest

from crypto_research.decision.claude_multisignal import ClaudeMultiSignalCombiner
from crypto_research.features.price import compute_price_features
from crypto_research.features.volume import compute_volume_features
from crypto_research.features.social import build_social_features
from tests.conftest import make_panel


# -- fake anthropic client -------------------------------------------------
class _Block:
    type = "text"
    def __init__(self, text): self.text = text


class _Msg:
    def __init__(self, text): self.content = [_Block(text)]


class _Messages:
    def __init__(self, counter): self._counter = counter
    def create(self, **kwargs):
        self._counter["calls"] += 1
        # Deterministic: long BTC, flat ETH, short SOL (clipped if long-only).
        payload = {
            "BTC-USD": {"weight": 0.9, "stance": "long", "why": "momentum+technicals"},
            "ETH-USD": {"weight": 0.0, "stance": "flat", "why": "mixed"},
            "SOL-USD": {"weight": -0.7, "stance": "short", "why": "broken trend"},
        }
        return _Msg(json.dumps(payload))


class _FakeClient:
    def __init__(self, counter): self.messages = _Messages(counter)


def _features():
    panel = make_panel(n_days=400, seed=5)
    price = compute_price_features(
        panel, return_horizons=[1, 21, 63], momentum_lookback=100,
        momentum_skip=10, moving_averages=[10, 50, 200],
        realized_vol_window=21, atr_window=14,
    )
    vol = compute_volume_features(panel, baseline_window=30, zscore_window=30)
    feats = price.join(vol, how="outer").sort_index()
    # Attach neutral social columns so the prompt assembles.
    for c in ("social_value", "social_sentiment", "social_z"):
        feats[c] = 0.0
    return feats


def _combiner_with_mock(monkeypatch, counter, **kw):
    c = ClaudeMultiSignalCombiner(model="claude-opus-4-8", decision_every=5, **kw)
    monkeypatch.setattr(c, "_client", lambda: (_FakeClient(counter), ""))
    return c


def test_long_only_clips_short(monkeypatch):
    counter = {"calls": 0}
    c = _combiner_with_mock(monkeypatch, counter, allow_short=False)
    out = c.generate(_features())
    assert out.available is True
    # SOL short (-0.7) must be clipped to 0 under long-only.
    assert (out.weights["SOL-USD"] >= -1e-12).all()
    # BTC long should appear.
    assert (out.weights["BTC-USD"] > 0).any()


def test_short_allowed_keeps_short(monkeypatch):
    counter = {"calls": 0}
    c = _combiner_with_mock(monkeypatch, counter, allow_short=True)
    out = c.generate(_features())
    assert (out.weights["SOL-USD"] < 0).any()


def test_holds_between_decision_dates(monkeypatch):
    counter = {"calls": 0}
    c = _combiner_with_mock(monkeypatch, counter, allow_short=True)
    feats = _features()
    out = c.generate(feats)
    n_dates = feats.index.get_level_values("date").nunique()
    # decision_every=5 -> far fewer API calls than dates (holds in between).
    assert counter["calls"] <= n_dates // 5 + 1
    # Weights are piecewise-constant between decisions (no NaNs, bounded).
    assert out.weights.abs().to_numpy().max() <= 1.0 + 1e-9
    assert not np.isnan(out.weights.to_numpy()).any()


def test_response_is_cached(monkeypatch, tmp_path):
    counter = {"calls": 0}
    c = _combiner_with_mock(monkeypatch, counter, allow_short=True, cache_dir=str(tmp_path))
    feats = _features()
    c.generate(feats)
    first = counter["calls"]
    # Second run should hit the on-disk cache and make no new calls.
    c2 = _combiner_with_mock(monkeypatch, counter, allow_short=True, cache_dir=str(tmp_path))
    c2.generate(feats)
    assert counter["calls"] == first, "cache miss: model was re-queried"
