"""Null / noise test — what "no edge" looks like.

We run the *same* pipeline (same engine, same costs, same risk module) on random
signals, many times, and summarize the distribution of outcomes. If the real
strategy's Sharpe/CAGR is inside the cloud of what random signals produce, it has
no demonstrable edge — the honest benchmark for "did we beat noise".

Two flavors, both preserving the strategy's realized exposure profile so the
comparison is fair:

* **shuffle** — take the strategy's own target weights and randomly permute them
  in time (per asset). Same distribution of positions, destroyed timing.
* **random** — draw fresh target weights from a simple distribution matched to
  the strategy's gross exposure.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from .engine import open_to_open_returns, run_backtest
from .metrics import compute_metrics


def _tradable_mask(panel: pd.DataFrame, columns) -> pd.DataFrame:
    """1.0 where the asset is listed and has a next-open return, else 0.0.

    Randomized null weights must respect survivorship exactly like the strategy
    does — you cannot hold an asset before it was listed.
    """
    ret_oo = open_to_open_returns(panel)
    return ret_oo.reindex(columns=columns).notna().astype(float)


@dataclass
class NullResult:
    sharpe: np.ndarray
    cagr: np.ndarray
    n_runs: int

    def summary(self) -> dict:
        return {
            "sharpe_mean": float(np.nanmean(self.sharpe)),
            "sharpe_std": float(np.nanstd(self.sharpe)),
            "sharpe_p95": float(np.nanpercentile(self.sharpe, 95)),
            "cagr_mean": float(np.nanmean(self.cagr)),
            "cagr_p95": float(np.nanpercentile(self.cagr, 95)),
            "n_runs": self.n_runs,
        }

    def percentile_of(self, sharpe_value: float) -> float:
        """Fraction of null runs with Sharpe <= the strategy's Sharpe."""
        return float((self.sharpe <= sharpe_value).mean() * 100.0)


def _shuffle_weights(weights: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    out = weights.copy()
    idx = np.arange(len(out))
    for col in out.columns:
        perm = rng.permutation(idx)
        out[col] = out[col].to_numpy()[perm]
    return out


def _random_weights(weights: pd.DataFrame, rng: np.random.Generator, allow_short: bool) -> pd.DataFrame:
    # Match the average per-asset gross exposure of the real strategy.
    avg_gross = float(weights.abs().mean().mean())
    draw = rng.uniform(-1.0, 1.0, size=weights.shape) if allow_short else rng.uniform(0.0, 1.0, size=weights.shape)
    out = pd.DataFrame(draw, index=weights.index, columns=weights.columns)
    # Rescale rows toward the strategy's typical gross exposure.
    gross = out.abs().sum(axis=1).replace(0.0, np.nan)
    target_gross = avg_gross * out.shape[1]
    out = out.mul((target_gross / gross).fillna(0.0), axis=0)
    return out


def run_null_test(
    panel: pd.DataFrame, strategy_weights: pd.DataFrame, initial_capital: float,
    cost_bps: float, slippage_bps: float, periods_per_year: int,
    n_runs: int = 200, mode: str = "shuffle", allow_short: bool = False, seed: int = 42,
) -> NullResult:
    """Run ``n_runs`` random-signal backtests and collect Sharpe/CAGR."""
    rng = np.random.default_rng(seed)
    mask = _tradable_mask(panel, strategy_weights.columns).reindex(
        index=strategy_weights.index, columns=strategy_weights.columns
    ).fillna(0.0)
    sharpes, cagrs = [], []
    for _ in range(n_runs):
        if mode == "shuffle":
            w = _shuffle_weights(strategy_weights, rng)
        else:
            w = _random_weights(strategy_weights, rng, allow_short)
        w = w * mask  # respect survivorship: no positions before listing
        res = run_backtest(panel, w, initial_capital, cost_bps, slippage_bps)
        m = compute_metrics(res.returns, periods_per_year=periods_per_year, turnover=res.turnover)
        sharpes.append(m.sharpe)
        cagrs.append(m.cagr)
    return NullResult(sharpe=np.array(sharpes), cagr=np.array(cagrs), n_runs=n_runs)
