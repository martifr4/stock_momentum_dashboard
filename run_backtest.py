#!/usr/bin/env python3
"""Single entry point for the crypto trading research backtest.

Usage:
    python run_backtest.py                      # uses config/config.yaml
    python run_backtest.py --config other.yaml
    python run_backtest.py --combiner rules|llm
    python run_backtest.py --refresh            # re-pull data, ignore cache
    python run_backtest.py --null-runs 500      # more null-test iterations
    python run_backtest.py --report out.md      # write a Markdown report

It performs, in order:
  1. Ingest OHLCV (cached to Parquet), survivorship-safe.
  2. Build price + volume features (causal). News stays quarantined/neutral.
  3. Combine into pre-risk target weights (rules or LLM combiner).
  4. Apply portfolio/risk sizing (caps, gross, vol target).
  5. Backtest with next-bar execution, costs, and lookahead assertions.
  6. Report IS vs OOS metrics, both benchmarks, and a null-test comparison.
"""
from __future__ import annotations

import argparse
import sys

import pandas as pd

from crypto_research.config import Config
from crypto_research.data.ingest import load_universe
from crypto_research.features.price import compute_price_features
from crypto_research.features.volume import compute_volume_features
from crypto_research.features.news import compute_news_features
from crypto_research.decision.rules import RulesCombiner
from crypto_research.decision.llm import LLMCombiner
from crypto_research.portfolio.risk import apply_risk
from crypto_research.backtest.engine import run_backtest, open_to_open_returns
from crypto_research.backtest.metrics import compute_metrics, Metrics
from crypto_research.backtest.benchmarks import run_benchmarks
from crypto_research.backtest.walkforward import split_is_oos
from crypto_research.backtest.nulltest import run_null_test


def build_features(cfg: Config, panel: pd.DataFrame) -> pd.DataFrame:
    price = compute_price_features(
        panel, cfg.features.return_horizons, cfg.features.momentum.lookback,
        cfg.features.momentum.skip, cfg.features.moving_averages,
        cfg.features.realized_vol_window, cfg.features.atr_window,
    )
    volume = compute_volume_features(
        panel, cfg.features.volume.baseline_window, cfg.features.volume.zscore_window,
    )
    features = price.join(volume, how="outer").sort_index()
    news = compute_news_features(features.index, cfg.news.enabled)
    features["news_sentiment"] = news.scores
    features.attrs["news_available"] = news.news_available
    features.attrs["news_reason"] = news.reason
    return features


def make_combiner(cfg: Config, which: str):
    if which == "llm":
        c = cfg.decision.llm
        return LLMCombiner(
            model=c.model, max_tokens=c.max_tokens, temperature=c.temperature,
            allow_short=cfg.decision.rules.allow_short,
        )
    r = cfg.decision.rules
    return RulesCombiner(
        weights=r.weights.as_dict(), long_threshold=r.long_threshold,
        short_threshold=r.short_threshold, allow_short=r.allow_short,
    )


def _fmt(m: Metrics) -> str:
    return (
        f"  CAGR            {m.cagr:8.2%}\n"
        f"  Ann. return     {m.ann_return:8.2%}\n"
        f"  Ann. vol        {m.ann_vol:8.2%}\n"
        f"  Sharpe          {m.sharpe:8.2f}\n"
        f"  Sortino         {m.sortino:8.2f}\n"
        f"  Max drawdown    {m.max_drawdown:8.2%}\n"
        f"  Calmar          {m.calmar:8.2f}\n"
        f"  Hit rate        {m.hit_rate:8.2%}\n"
        f"  Avg win/loss    {m.avg_win:+.4%} / {m.avg_loss:+.4%}\n"
        f"  Win/loss ratio  {m.win_loss_ratio:8.2f}\n"
        f"  Turnover (ann)  {m.turnover_annual:8.2f}x\n"
        f"  Costs paid      ${m.total_costs_paid:12,.0f}\n"
        f"  Periods         {m.n_periods:8d}\n"
    )


def _metrics_for(returns, cfg, turnover=None, costs_paid=0.0, cap=1.0) -> Metrics:
    return compute_metrics(
        returns, periods_per_year=cfg.backtest.trading_days_per_year,
        risk_free_annual=cfg.backtest.risk_free_annual,
        turnover=turnover, total_costs_paid=costs_paid, initial_capital=cap,
    )


def run_pipeline(cfg: Config, combiner_name: str | None = None, refresh: bool = False):
    """Run data -> features -> decision -> risk -> backtest and return objects.

    Shared by the CLI report and the results notebook so both use one code path.
    Returns a dict with the ingest result, feature frame, combiner, final
    weights, strategy :class:`BacktestResult`, and the benchmark results.
    """
    combiner_name = combiner_name or cfg.decision.combiner
    res = load_universe(
        cfg.data.universe, cfg.data.start, cfg.data.end,
        cfg.data.granularity_seconds, cfg.data.cache_dir,
        max_forward_fill=cfg.data.max_forward_fill_days, refresh=refresh,
    )
    panel = res.panel
    features = build_features(cfg, panel)

    combiner = make_combiner(cfg, combiner_name)
    out = combiner.generate(features)
    if not out.available:
        combiner = make_combiner(cfg, "rules")
        out = combiner.generate(features)

    asset_returns = panel["close"].unstack("asset").sort_index().pct_change()
    pf = cfg.portfolio
    final_weights = apply_risk(
        out.weights, asset_returns, max_position=pf.max_position,
        gross_leverage=pf.gross_leverage, max_gross=pf.max_gross,
        vol_target_annual=pf.vol_target_annual, vol_lookback=pf.vol_lookback,
        max_leverage_from_vol=pf.max_leverage_from_vol,
        trading_days_per_year=cfg.backtest.trading_days_per_year,
    )
    bt = run_backtest(
        panel, final_weights, cfg.backtest.initial_capital,
        cfg.backtest.cost_bps, cfg.backtest.slippage_bps,
    )
    benches = run_benchmarks(
        panel, cfg.data.benchmark_asset, cfg.backtest.initial_capital,
        cfg.backtest.cost_bps, cfg.backtest.slippage_bps,
    )
    return {
        "ingest": res, "panel": panel, "features": features,
        "combiner": combiner, "combiner_output": out,
        "final_weights": final_weights, "backtest": bt, "benchmarks": benches,
    }


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Crypto strategy backtest")
    p.add_argument("--config", default=None)
    p.add_argument("--combiner", default=None, choices=["rules", "llm"])
    p.add_argument("--refresh", action="store_true")
    p.add_argument("--null-runs", type=int, default=200)
    p.add_argument("--null-mode", default="shuffle", choices=["shuffle", "random"])
    p.add_argument("--report", default=None, help="write Markdown report to path")
    args = p.parse_args(argv)

    cfg = Config.load(args.config)
    combiner_name = args.combiner or cfg.decision.combiner
    lines: list[str] = []

    def emit(s=""):
        print(s)
        lines.append(s)

    emit("=" * 70)
    emit("CRYPTO STRATEGY BACKTEST")
    emit("=" * 70)

    # 1. Data ---------------------------------------------------------------
    res = load_universe(
        cfg.data.universe, cfg.data.start, cfg.data.end,
        cfg.data.granularity_seconds, cfg.data.cache_dir,
        max_forward_fill=cfg.data.max_forward_fill_days, refresh=args.refresh,
    )
    panel = res.panel
    emit(f"\nUniverse: {cfg.data.universe}")
    emit(f"Date range: {panel.index.get_level_values('date').min().date()} "
         f"-> {panel.index.get_level_values('date').max().date()}")
    for a, d in res.first_available.items():
        emit(f"  {a}: first listed {d.date()}, synthetic bars filled: "
             f"{res.synthetic_counts.get(a, 0)}")

    # 2. Features -----------------------------------------------------------
    features = build_features(cfg, panel)
    emit(f"\nNews module: available={features.attrs['news_available']} "
         f"({features.attrs['news_reason']})")

    # 3. Decision -----------------------------------------------------------
    combiner = make_combiner(cfg, combiner_name)
    emit(f"\nCombiner: {combiner.name}")
    out = combiner.generate(features)
    if not out.available:
        emit(f"  !! {out.note}")
        emit("  Falling back to rules combiner for a runnable comparison.")
        combiner = make_combiner(cfg, "rules")
        out = combiner.generate(features)

    # 4. Risk ---------------------------------------------------------------
    asset_returns = panel["close"].unstack("asset").sort_index().pct_change()
    pf = cfg.portfolio
    final_weights = apply_risk(
        out.weights, asset_returns, max_position=pf.max_position,
        gross_leverage=pf.gross_leverage, max_gross=pf.max_gross,
        vol_target_annual=pf.vol_target_annual, vol_lookback=pf.vol_lookback,
        max_leverage_from_vol=pf.max_leverage_from_vol,
        trading_days_per_year=cfg.backtest.trading_days_per_year,
    )

    # 5. Backtest -----------------------------------------------------------
    bt = run_backtest(
        panel, final_weights, cfg.backtest.initial_capital,
        cfg.backtest.cost_bps, cfg.backtest.slippage_bps,
    )

    # 6. Report -------------------------------------------------------------
    ppy = cfg.backtest.trading_days_per_year
    full_m = _metrics_for(bt.returns, cfg, bt.turnover, bt.total_costs_paid, bt.initial_capital)
    is_ret, oos_ret = split_is_oos(bt.returns, cfg.backtest.oos_start)
    is_to, oos_to = split_is_oos(bt.turnover, cfg.backtest.oos_start)
    # Currency cost drag per period (fraction * prior equity), split IS/OOS.
    prev_equity = bt.equity.shift(1).fillna(bt.initial_capital)
    cost_ccy = bt.costs * prev_equity
    is_cost, oos_cost = split_is_oos(cost_ccy, cfg.backtest.oos_start)

    emit("\n" + "-" * 70)
    emit(f"STRATEGY ({combiner.name}) — FULL SAMPLE")
    emit("-" * 70)
    emit(_fmt(full_m))
    emit(f"IN-SAMPLE (< {cfg.backtest.oos_start})")
    emit("-" * 70)
    emit(_fmt(_metrics_for(is_ret, cfg, is_to, float(is_cost.sum()))))
    emit(f"OUT-OF-SAMPLE (>= {cfg.backtest.oos_start})   <-- the honest test")
    emit("-" * 70)
    emit(_fmt(_metrics_for(oos_ret, cfg, oos_to, float(oos_cost.sum()))))

    # Benchmarks (through the same engine) ----------------------------------
    benches = run_benchmarks(
        panel, cfg.data.benchmark_asset, cfg.backtest.initial_capital,
        cfg.backtest.cost_bps, cfg.backtest.slippage_bps,
    )
    emit("-" * 70)
    emit("BENCHMARKS (same engine, same costs)")
    emit("-" * 70)
    for name, b in benches.items():
        b_is, b_oos = split_is_oos(b.returns, cfg.backtest.oos_start)
        m_full = _metrics_for(b.returns, cfg, b.turnover, b.total_costs_paid, b.initial_capital)
        m_oos = _metrics_for(b_oos, cfg)
        emit(f"\n{name}:")
        emit(f"  full : CAGR {m_full.cagr:7.2%} | Sharpe {m_full.sharpe:5.2f} "
             f"| MaxDD {m_full.max_drawdown:7.2%}")
        emit(f"  OOS  : CAGR {m_oos.cagr:7.2%} | Sharpe {m_oos.sharpe:5.2f} "
             f"| MaxDD {m_oos.max_drawdown:7.2%}")

    # Null test -------------------------------------------------------------
    emit("\n" + "-" * 70)
    emit(f"NULL TEST ({args.null_mode}, {args.null_runs} runs) — what no edge looks like")
    emit("-" * 70)
    null = run_null_test(
        panel, final_weights, cfg.backtest.initial_capital,
        cfg.backtest.cost_bps, cfg.backtest.slippage_bps, ppy,
        n_runs=args.null_runs, mode=args.null_mode,
        allow_short=cfg.decision.rules.allow_short,
    )
    s = null.summary()
    pct = null.percentile_of(full_m.sharpe)
    emit(f"  Null Sharpe: mean {s['sharpe_mean']:.2f}, std {s['sharpe_std']:.2f}, "
         f"95th pct {s['sharpe_p95']:.2f}")
    emit(f"  Strategy Sharpe {full_m.sharpe:.2f} sits at the "
         f"{pct:.0f}th percentile of the null distribution.")
    verdict = ("BEATS noise (>95th pct)" if pct >= 95 else
               "INSIDE the noise band — no demonstrable edge" if pct < 90 else
               "marginal vs noise")
    emit(f"  Verdict vs noise: {verdict}")

    emit("\n" + "=" * 70)
    emit("Done. See HONEST_ASSESSMENT.md for caveats and what NOT to trust.")
    emit("=" * 70)

    if args.report:
        with open(args.report, "w", encoding="utf-8") as fh:
            fh.write("# Backtest Report\n\n```\n" + "\n".join(lines) + "\n```\n")
        print(f"\nReport written to {args.report}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
