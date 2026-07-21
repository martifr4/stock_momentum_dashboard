"""LLM-reasoning combiner (Claude via the Anthropic API).

Swappable with :class:`RulesCombiner` behind the same interface. For each
decision date it hands Claude the *current* feature cross-section (only data at
or before that date — no future rows are ever in the prompt) and asks for a
target weight per asset plus a one-line rationale.

Honesty / safety properties:

* **Graceful degradation** — if ``ANTHROPIC_API_KEY`` is unset or the
  ``anthropic`` package is missing, ``generate`` returns ``available=False`` and
  an all-flat frame with a clear note, instead of inventing positions.
* **No lookahead** — the prompt for date ``T`` contains only the row for ``T``
  (which itself is built from causal features). The model cannot see ``T+1``.
* **Cost control** — calling an LLM for every day over years is expensive, so
  the combiner (a) only decides on a configurable schedule (e.g. every N days,
  holding between decisions) and (b) caches every response to disk keyed by a
  hash of the prompt, so re-runs cost nothing.

This module never *requires* an API key to import or to run the rest of the
system; the rules combiner remains the default.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

import numpy as np
import pandas as pd

from .base import Combiner, CombinerOutput

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
    ):
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.decision_every = decision_every
        self.cache_dir = Path(cache_dir)
        self.allow_short = allow_short

    # -- availability ------------------------------------------------------
    def _client(self):
        key = os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            return None, "ANTHROPIC_API_KEY not set"
        try:
            import anthropic  # noqa: PLC0415 (optional dependency)
        except ImportError:
            return None, "anthropic package not installed"
        return anthropic.Anthropic(api_key=key), ""

    # -- prompt / cache ----------------------------------------------------
    def _prompt_for(self, date: pd.Timestamp, cross: pd.DataFrame) -> str:
        payload = {
            "date": str(date.date()),
            "assets": {
                asset: {
                    f: (None if pd.isna(row[f]) else round(float(row[f]), 4))
                    for f in _PROMPT_FEATURES if f in row
                }
                for asset, row in cross.iterrows()
            },
        }
        return json.dumps(payload, sort_keys=True)

    def _cache_key(self, prompt: str) -> Path:
        h = hashlib.sha256((self.model + "|" + prompt).encode()).hexdigest()[:24]
        return self.cache_dir / f"{h}.json"

    def _query(self, client, prompt: str) -> dict:
        cache_file = self._cache_key(prompt)
        if cache_file.exists():
            return json.loads(cache_file.read_text())
        msg = client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            system=_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(block.text for block in msg.content if block.type == "text")
        parsed = _extract_json(text)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        cache_file.write_text(json.dumps(parsed))
        return parsed

    # -- main --------------------------------------------------------------
    def generate(self, features: pd.DataFrame) -> CombinerOutput:
        client, why = self._client()
        assets = sorted(features.index.get_level_values("asset").unique())
        dates = features.index.get_level_values("date").unique().sort_values()
        weights = pd.DataFrame(0.0, index=dates, columns=assets)

        if client is None:
            return CombinerOutput(
                weights=weights, available=False,
                note=f"LLM combiner unavailable ({why}); returned all-flat. "
                     "Switch decision.combiner to 'rules' or set the API key.",
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
                    parsed = self._query(client, prompt)
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


def _extract_json(text: str) -> dict:
    """Best-effort parse of a JSON object from model output."""
    text = text.strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        return {}
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return {}
