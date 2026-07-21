"""Multi-signal LLM combiner: technicals + momentum + social, fused by an LLM.

A distinct strategy from the rules/plain-LLM combiners. For each decision date
it hands the reasoning model a **structured, three-pillar** view of each asset
and asks for a target weight, stance, and rationale:

* **Technicals** — position vs the 50/200-day moving averages, fast/slow MA
  relationship, ATR%, realized vol, drawdown state.
* **Momentum** — 12-1 momentum plus 1- and 3-month returns.
* **Social / forums** — the (lookahead-safe, lagged) Fear & Greed market
  sentiment reading and its causal z-score. In live mode, per-coin StockTwits
  mention volume can be appended (see ``features/social.py``); in backtests only
  the timestamped market-wide reading is used, and that limitation is stated.

The reasoning backend is pluggable (Claude / DeepSeek / OpenAI) via ``provider``.
It inherits all the safety machinery of :class:`LLMCombiner`: point-in-time
prompts (no lookahead), on-disk response caching, and graceful degradation to
all-flat + a clear note when the provider is unavailable.
"""
from __future__ import annotations

import json

import pandas as pd

from .llm import LLMCombiner

_SYSTEM = (
    "You are a disciplined crypto portfolio manager who fuses THREE independent "
    "evidence streams into one decision per asset: (1) TECHNICALS (trend vs "
    "moving averages, volatility, drawdown), (2) MOMENTUM (medium-term return "
    "persistence), and (3) SOCIAL/FORUM sentiment (a market-wide crowd-sentiment "
    "gauge). Weigh them together: strong aligned technicals+momentum with "
    "non-extreme social sentiment is the best long setup; euphoric social "
    "sentiment (very high greed) into weakening momentum is a caution; broken "
    "trend overrides bullish social chatter. All inputs are point-in-time and "
    "use only past data. Decide a target weight per asset in [-1.0, 1.0] (0 = "
    "flat). Be conservative: prefer flat when the three streams conflict. "
    "Respond ONLY with compact JSON: "
    '{"ASSET": {"weight": <float>, "stance": "long|flat|short", '
    '"why": "<one sentence citing which of the 3 streams drove it>"}, ...}.'
)

# Grouped so the model sees the three pillars explicitly. The per-coin social
# fields (mentions / bull fraction) are present only in LIVE mode; in backtests
# they are absent and silently omitted from the prompt.
_TECH = ["px_vs_ma_50", "px_vs_ma_200", "ma_fast_slow", "atr_pct", "realized_vol", "drawdown"]
_MOMENTUM = ["mom_12_1", "ret_21", "ret_63"]
_SOCIAL = ["social_value", "social_sentiment", "social_z",
           "social_mentions", "social_bull_frac"]


class ClaudeMultiSignalCombiner(LLMCombiner):
    name = "claude_multisignal"

    def __init__(self, model: str, **kwargs):
        prompt_features = _TECH + _MOMENTUM + _SOCIAL
        kwargs.setdefault("cache_dir", "data_cache/claude_multisignal_cache")
        super().__init__(
            model=model, system_prompt=_SYSTEM,
            prompt_features=prompt_features, **kwargs,
        )

    def _prompt_for(self, date: pd.Timestamp, cross: pd.DataFrame) -> str:
        """Structured, three-pillar payload per asset (overrides base flat one)."""
        def group(row, cols):
            return {
                c: (None if pd.isna(row[c]) else round(float(row[c]), 4))
                for c in cols if c in row
            }

        payload = {
            "date": str(date.date()),
            "note": "social_value is a market-wide Fear&Greed reading (0=extreme "
                    "fear,100=extreme greed), lagged 1 day; it is not per-coin.",
            "assets": {
                asset: {
                    "technicals": group(row, _TECH),
                    "momentum": group(row, _MOMENTUM),
                    "social": group(row, _SOCIAL),
                }
                for asset, row in cross.iterrows()
            },
        }
        return json.dumps(payload, sort_keys=True)
