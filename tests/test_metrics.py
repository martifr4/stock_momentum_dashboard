"""Metrics: check against hand-computable cases."""
from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from crypto_research.backtest.metrics import compute_metrics


def test_zero_returns_give_zero_metrics():
    r = pd.Series([0.0] * 100)
    m = compute_metrics(r, periods_per_year=365)
    assert m.ann_return == pytest.approx(0.0)
    assert m.max_drawdown == pytest.approx(0.0)


def test_constant_positive_return_cagr_and_no_drawdown():
    daily = 0.001
    r = pd.Series([daily] * 365)
    m = compute_metrics(r, periods_per_year=365)
    expected_cagr = (1 + daily) ** 365 - 1
    assert m.cagr == pytest.approx(expected_cagr, rel=1e-6)
    assert m.max_drawdown == pytest.approx(0.0)  # monotonic up
    assert m.hit_rate == pytest.approx(1.0)


def test_max_drawdown_known():
    # Up 20% then down 50% -> drawdown of -50% from the peak.
    r = pd.Series([0.20, -0.50, 0.0])
    m = compute_metrics(r, periods_per_year=365)
    assert m.max_drawdown == pytest.approx(-0.50, rel=1e-9)


def test_sharpe_matches_manual():
    rng = np.random.default_rng(0)
    r = pd.Series(rng.normal(0.001, 0.02, 1000))
    m = compute_metrics(r, periods_per_year=365)
    manual = r.mean() / r.std(ddof=1) * np.sqrt(365)
    assert m.sharpe == pytest.approx(manual, rel=1e-9)


def test_sortino_only_penalizes_downside():
    # Positive-mean series whose downside deviation is smaller than its total
    # std -> Sortino should exceed Sharpe.
    r = pd.Series([0.03, 0.03, 0.03, -0.01, -0.02])
    m = compute_metrics(r, periods_per_year=365)
    assert m.sortino > m.sharpe  # downside dev < total dev here
