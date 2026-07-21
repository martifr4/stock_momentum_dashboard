#!/usr/bin/env python3
"""Live / forward decision for the Claude multi-signal strategy.

This is the mode where the **per-coin forum signal genuinely participates**: it
pulls the latest prices, builds today's technical + momentum features, fetches
*current* StockTwits per-coin mentions and the Fear & Greed reading, and asks
Claude for today's target positions with a rationale.

Because the decision timestamp is "now", using current data is lookahead-safe by
construction (there is no future to peek at). This does NOT backtest the per-coin
forum signal — see HONEST_ASSESSMENT.md for why free per-coin forum history is
not available.

Usage:
    ANTHROPIC_API_KEY=... python run_live.py           # real decision
    python run_live.py                                  # shows inputs, notes no key

Requires ANTHROPIC_API_KEY for the decision step; without it, the script still
prints all the gathered signals so you can see what would be sent.
"""
from __future__ import annotations

import sys

import pandas as pd

from crypto_research.config import Config
from crypto_research.data.ingest import load_universe
from crypto_research.features.social import fetch_stocktwits_mentions
from crypto_research.decision.claude_multisignal import ClaudeMultiSignalCombiner
from crypto_research.portfolio.risk import apply_risk
from run_backtest import build_features


def main(argv=None) -> int:
    cfg = Config.load(argv[0] if argv else None)
    print("=" * 68)
    print("CLAUDE MULTI-SIGNAL — LIVE DECISION")
    print("=" * 68)

    # Latest data (refresh so 'today' is current). Live mode extends the end
    # date to today rather than the config's backtest end.
    today = pd.Timestamp.now("UTC").normalize()
    res = load_universe(
        cfg.data.universe, cfg.data.start, today,
        cfg.data.granularity_seconds, cfg.data.cache_dir,
        max_forward_fill=cfg.data.max_forward_fill_days, refresh=True,
    )
    features = build_features(cfg, res.panel)
    last = features.index.get_level_values("date").max()
    print(f"\nAs of {last.date()} (UTC). Universe: {cfg.data.universe}")

    # Live per-coin forum mentions (StockTwits) — the real per-coin social input.
    per_asset = {}
    if cfg.social.stocktwits_live:
        st = fetch_stocktwits_mentions(list(cfg.data.universe))
        for asset, d in st.items():
            per_asset[asset] = {
                "social_mentions": d["mentions"],
                "social_bull_frac": round(d["bull_frac"], 3),
            }
        print("\nLive StockTwits per-coin forum activity:")
        for asset, d in st.items():
            print(f"  {asset}: {d['mentions']} recent msgs, "
                  f"{d['bull_frac']:.0%} bull / {d['bear_frac']:.0%} bear")

    # Market-wide social reading already in the features (Fear & Greed).
    cross = features.xs(last, level="date")
    if "social_value" in cross:
        fg = cross["social_value"].dropna()
        if len(fg):
            print(f"\nFear & Greed (lagged): {fg.iloc[0]:.0f}/100")

    # Ask Claude for today's decision.
    c = cfg.decision.claude_multisignal
    combiner = ClaudeMultiSignalCombiner(
        model=c.model, max_tokens=c.max_tokens, temperature=c.temperature,
        decision_every=1, allow_short=c.allow_short,
    )
    weights, rationales, note = combiner.decide_latest(features, extra_per_asset=per_asset)
    print(f"\n{note}")

    if not weights:
        print("\nNo decision produced (set ANTHROPIC_API_KEY to enable the Claude "
              "decision step). All signals above were still gathered live.")
        return 0

    # Size the raw targets through the same risk module the backtest uses.
    raw = pd.DataFrame([weights], index=[last])
    asset_returns = res.panel["close"].unstack("asset").sort_index().pct_change()
    pf = cfg.portfolio
    sized = apply_risk(
        raw.reindex(columns=asset_returns.columns).fillna(0.0), asset_returns,
        max_position=pf.max_position, gross_leverage=pf.gross_leverage,
        max_gross=pf.max_gross, vol_target_annual=0.0, vol_lookback=pf.vol_lookback,
        max_leverage_from_vol=pf.max_leverage_from_vol,
        trading_days_per_year=cfg.backtest.trading_days_per_year,
    )
    print("\nRecommended target weights (after caps):")
    for asset in cfg.data.universe:
        w = float(sized.iloc[-1].get(asset, 0.0))
        why = rationales.get(asset, "")
        print(f"  {asset:9s} {w:+.2%}   {why}")
    print("\nExecute at the next daily open. This is a recommendation, not advice.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
