"""Typed configuration loader.

The whole system is config-driven: modules never hard-code parameters, they
receive a :class:`Config` built from ``config/config.yaml``. Access is via
attribute-style dotted sections (``cfg.data.universe``) so call sites read
clearly and typos raise instead of silently returning ``None``.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import yaml


class Section:
    """Read-only attribute view over a nested dict from the YAML config."""

    def __init__(self, data: dict[str, Any]):
        self._data = data

    def __getattr__(self, name: str) -> Any:
        try:
            value = self._data[name]
        except KeyError as exc:  # pragma: no cover - defensive
            raise AttributeError(
                f"config has no key '{name}'. Available: {sorted(self._data)}"
            ) from exc
        if isinstance(value, dict):
            return Section(value)
        return value

    def get(self, name: str, default: Any = None) -> Any:
        value = self._data.get(name, default)
        return Section(value) if isinstance(value, dict) else value

    def as_dict(self) -> dict[str, Any]:
        return dict(self._data)

    def __repr__(self) -> str:  # pragma: no cover - cosmetic
        return f"Section({self._data!r})"


@dataclass
class Config:
    data: Section
    features: Section
    news: Section
    social: Section
    decision: Section
    portfolio: Section
    backtest: Section
    _raw: dict[str, Any]

    @classmethod
    def load(cls, path: str | None = None) -> "Config":
        if path is None:
            path = os.environ.get("CRYPTO_CONFIG", "config/config.yaml")
        with open(path, "r", encoding="utf-8") as fh:
            raw = yaml.safe_load(fh)
        return cls(
            data=Section(raw["data"]),
            features=Section(raw["features"]),
            news=Section(raw["news"]),
            social=Section(raw.get("social", {"enabled": False, "fear_greed": False,
                                              "stocktwits_live": False, "lag_days": 1})),
            decision=Section(raw["decision"]),
            portfolio=Section(raw["portfolio"]),
            backtest=Section(raw["backtest"]),
            _raw=raw,
        )

    def as_dict(self) -> dict[str, Any]:
        return dict(self._raw)
