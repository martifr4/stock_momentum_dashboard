"""LLM-reasoning combiner — provider-swappable (Claude / DeepSeek / OpenAI).

Swappable with :class:`RulesCombiner` behind the same interface. For each
decision date it hands the model the *current* feature cross-section (only data
at or before that date — no future rows are ever in the prompt) and asks for a
target weight per asset plus a one-line rationale.

The reasoning backend is pluggable via ``provider`` (see
:mod:`crypto_research.decision.providers`): ``anthropic`` (Claude),
``deepseek``, or ``openai``. The rest of the logic is identical across
providers.

Honesty / safety properties:

* **Graceful degradation** — if the provider's API key is unset or its SDK is
  missing, ``generate`` returns ``available=False`` and an all-flat frame with a
  clear note, instead of inventing positions.
* **No lookahead** — the prompt for date ``T`` contains only the row for ``T``
  (built from causal features). The model cannot see ``T+1``.
* **Cost control** — calling an LLM for every day over years is expensive, so
  the combiner (a) only decides on a configurable schedule (every N days,
  holding between decisions) and (b) caches every response to disk keyed by a
  hash of provider+model+system+prompt, so re-runs cost nothing.

This module never *requires* an API key to import or to run the rest of the
system; the rules combiner remains the default.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd

from .base import Combiner, CombinerOutput
from .providers import get_caller

_SYSTEM = (
    "You are a disciplined systematic crypto portfolio manager. You are given a "
    "single day's precomputed, point-in-time features for a small universe of "
    "crypto assets. All features use only past data. Decide a target portfolio "
    "weight for each asset in the range -1.0 (fully short) to +1.0 (fully long), "
    "where 0 is flat. Be conservative: prefer flat when signals conflict or are "
    "weak. You must not assume access to any information beyond the features "
    "given. Respond ONLY with compact JSON of the form "
    '{"ASSET": {"weight": <float>, "why": "<short reason>"}, ...}.'
)

# Features exposed to the model. Kept small and interpretable on purpose.
_PROMPT_FEATURES = [
    "mom_12_1", "ret_21", "ret_63", "px_vs_ma_50", "px_vs_ma_200",
    "ma_fast_slow", "realized_vol", "atr_pct", "drawdown",
    "vol_zscore", "vol_price_div",
]


class LLMCombiner(Combiner):
    name = "llm"

    def __init__(
        self,
        model: str,
        max_tokens: int = 2000,
        temperature: float = 0.0,
        decision_every: int = 5,
        cache_dir: str = "data_cache/llm_cache",
        allow_short: bool = False,
        system_prompt: str | None = None,
        prompt_features: list[str] | None = None,
        provider: str = "anthropic",
    ):
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.decision_every = decision_every
        self.cache_dir = Path(cache_dir)
        self.allow_short = allow_short
        # Which reasoning backend runs the decision (anthropic|deepseek|openai).
        self.provider = provider
        # Subclasses (e.g. the multi-signal combiner) override these to change
        # what the model is told and which features it sees.
        self.system_prompt = system_prompt or _SYSTEM
        self.prompt_features = prompt_features or _PROMPT_FEATURES

    # -- availability ------------------------------------------------------
    def _caller(self):
        """Return ``(call, "")`` for the configured provider, else ``(None, reason)``.

        ``call(system, prompt) -> str``. Overridable in tests with a stub.
        """
        return get_caller(self.provider, self.model, self.max_tokens, self.temperature)

    # -- prompt / cache ----------------------------------------------------
    def _prompt_for(self, date: pd.Timestamp, cross: pd.DataFrame) -> str:
        payload = {
            "date": str(date.date()),
            "assets": {
                asset: {
                    f: (None if pd.isna(row[f]) else round(float(row[f]), 4))
                    for f in self.prompt_features if f in row
                }
                for asset, row in cross.iterrows()
            },
        }
        return json.dumps(payload, sort_keys=True)

    def _cache_key(self, prompt: str) -> Path:
        # Include provider + system prompt so different backends / instructions
        # do not share cached responses.
        material = f"{self.provider}|{self.model}|{self.system_prompt}|{prompt}"
        h = hashlib.sha256(material.encode()).hexdigest()[:24]
        return self.cache_dir / f"{h}.json"

    def _query(self, call, prompt: str) -> dict:
        cache_file = self._cache_key(prompt)
        if cache_file.exists():
            return json.loads(cache_file.read_text())
        text = call(self.system_prompt, prompt)
        parsed = _extract_json(text)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        cache_file.write_text(json.dumps(parsed))
        return parsed

    # -- main --------------------------------------------------------------
    def generate(self, features: pd.DataFrame) -> CombinerOutput:
        call, why = self._caller()
        assets = sorted(features.index.get_level_values("asset").unique())
        dates = features.index.get_level_values("date").unique().sort_values()
        weights = pd.DataFrame(0.0, index=dates, columns=assets)

        if call is None:
            return CombinerOutput(
                weights=weights, available=False,
                note=f"LLM combiner unavailable ({why}); returned all-flat. "
                     "Switch decision.combiner to 'rules', pick another provider, "
                     "or set the API key.",
            )

        rationales: dict[tuple, str] = {}
        decision_dates = dates[::self.decision_every]
        last_row = pd.Series(0.0, index=assets)
        for date in dates:
            if date in decision_dates:
                cross = features.xs(date, level="date")
                cross = cross[cross["mom_12_1"].notna()] if "mom_12_1" in cross else cross
                if len(cross):
                    prompt = self._prompt_for(date, cross)
                    parsed = self._query(call, prompt)
                    row = pd.Series(0.0, index=assets)
                    for asset in assets:
                        entry = parsed.get(asset) or {}
                        w = float(entry.get("weight", 0.0)) if isinstance(entry, dict) else 0.0
                        if not self.allow_short:
                            w = max(w, 0.0)
                        row[asset] = float(np.clip(w, -1.0, 1.0))
                        if isinstance(entry, dict) and entry.get("why"):
                            rationales[(date, asset)] = str(entry["why"])
                    last_row = row
            weights.loc[date] = last_row  # hold between decision dates

        return CombinerOutput(weights=weights.sort_index(), rationales=rationales)

    # -- live / forward single decision ------------------------------------
    def decide_latest(self, features: pd.DataFrame, extra_per_asset: dict | None = None):
        """One forward decision for the latest date (live/paper trading).

        ``extra_per_asset`` optionally merges live-only fields into each asset's
        row (e.g. per-coin StockTwits mentions), which the prompt will include.
        Because the decision timestamp is "now", using current data introduces
        no lookahead. Returns ``(weights: dict[asset->float], rationales, note)``.
        """
        call, why = self._caller()
        if call is None:
            return {}, {}, f"LLM combiner unavailable ({why})."
        last = features.index.get_level_values("date").max()
        cross = features.xs(last, level="date").copy()
        if extra_per_asset:
            for asset, fields in extra_per_asset.items():
                if asset in cross.index:
                    for k, v in fields.items():
                        cross.loc[asset, k] = v
        prompt = self._prompt_for(last, cross)
        parsed = self._query(call, prompt)
        weights, rationales = {}, {}
        for asset in cross.index:
            entry = parsed.get(asset) or {}
            w = float(entry.get("weight", 0.0)) if isinstance(entry, dict) else 0.0
            if not self.allow_short:
                w = max(w, 0.0)
            weights[asset] = float(np.clip(w, -1.0, 1.0))
            if isinstance(entry, dict) and entry.get("why"):
                rationales[asset] = str(entry["why"])
        return weights, rationales, f"decided for {last.date()}"


def _extract_json(text: str) -> dict:
    """Best-effort parse of a JSON object from model output."""
    text = (text or "").strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        return {}
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return {}
