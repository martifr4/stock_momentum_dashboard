"""Performance metrics.

All metrics operate on a daily net-return series (and optionally the backtest
result for turnover/cost figures). Annualization uses ``periods_per_year`` (365
for crypto, which trades every calendar day).
"""
from __future__ import annotations

from dataclasses import asdict, dataclass

import numpy as np
import pandas as pd


@dataclass
class Metrics:
    cagr: float
    ann_return: float
    ann_vol: float
    sharpe: float
    sortino: float
    max_drawdown: float
    calmar: float
    hit_rate: float
    avg_win: float
    avg_loss: float
    win_loss_ratio: float
    turnover_annual: float
    total_costs_paid: float
    n_periods: int

    def as_dict(self) -> dict:
        return asdict(self)


def _max_drawdown(equity: pd.Series) -> float:
    peak = equity.cummax()
    dd = equity / peak - 1.0
    return float(dd.min()) if len(dd) else 0.0


def compute_metrics(
    returns: pd.Series,
    periods_per_year: int = 365,
    risk_free_annual: float = 0.0,
    turnover: pd.Series | None = None,
    total_costs_paid: float = 0.0,
    initial_capital: float = 1.0,
) -> Metrics:
    """Compute a full metric set from a daily return series."""
    r = returns.dropna()
    n = len(r)
    if n == 0:
        return Metrics(*([0.0] * 12), n_periods=0)

    equity = (1.0 + r).cumprod()
    total_growth = float(equity.iloc[-1])
    years = n / periods_per_year
    cagr = total_growth ** (1.0 / years) - 1.0 if years > 0 and total_growth > 0 else float("nan")

    rf_daily = risk_free_annual / periods_per_year
    excess = r - rf_daily
    ann_return = float(r.mean() * periods_per_year)
    ann_vol = float(r.std(ddof=1) * np.sqrt(periods_per_year))
    sharpe = float(excess.mean() / r.std(ddof=1) * np.sqrt(periods_per_year)) if r.std(ddof=1) > 0 else float("nan")

    downside = r[r < 0]
    downside_dev = float(downside.std(ddof=1) * np.sqrt(periods_per_year)) if len(downside) > 1 else 0.0
    sortino = float(excess.mean() * periods_per_year / downside_dev) if downside_dev > 0 else float("nan")

    mdd = _max_drawdown(equity)
    calmar = float(cagr / abs(mdd)) if mdd < 0 and not np.isnan(cagr) else float("nan")

    wins, losses = r[r > 0], r[r < 0]
    hit_rate = float(len(wins) / n)
    avg_win = float(wins.mean()) if len(wins) else 0.0
    avg_loss = float(losses.mean()) if len(losses) else 0.0
    win_loss_ratio = float(avg_win / abs(avg_loss)) if avg_loss < 0 else float("nan")

    turnover_annual = float(turnover.mean() * periods_per_year) if turnover is not None and len(turnover) else 0.0

    return Metrics(
        cagr=cagr, ann_return=ann_return, ann_vol=ann_vol, sharpe=sharpe,
        sortino=sortino, max_drawdown=mdd, calmar=calmar, hit_rate=hit_rate,
        avg_win=avg_win, avg_loss=avg_loss, win_loss_ratio=win_loss_ratio,
        turnover_annual=turnover_annual, total_costs_paid=total_costs_paid,
        n_periods=n,
    )
