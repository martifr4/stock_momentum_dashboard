"""Decision-combiner interface.

A combiner turns the (date, asset) feature frame into a **target-weight frame**
(date x asset), where each value is a pre-risk target in ``[-1, 1]`` (+1 fully
long, -1 fully short, 0 flat). The portfolio/risk module then imposes caps and
volatility targeting on top.

Two implementations share this interface so they are swappable from config:

* :class:`crypto_research.decision.rules.RulesCombiner` — transparent, vectorized.
* :class:`crypto_research.decision.llm.LLMCombiner` — Claude-reasoning.

The interface is deliberately "produce the whole frame" rather than "decide one
day", because the rules path is naturally vectorized and lookahead-safe that
way. The LLM path iterates internally but still only ever sees data up to each
decision date.
"""
from __future__ import annotations

import abc
from dataclasses import dataclass, field

import pandas as pd


@dataclass
class Decision:
    """A single (date, asset) position recommendation with rationale."""

    date: pd.Timestamp
    asset: str
    target_weight: float          # pre-risk target in [-1, 1]
    rationale: str = ""
    components: dict[str, float] = field(default_factory=dict)


@dataclass
class CombinerOutput:
    """What every combiner returns."""

    weights: pd.DataFrame                     # date x asset, pre-risk targets
    rationales: dict[tuple, str] = field(default_factory=dict)  # (date,asset)->str
    available: bool = True                    # False => combiner could not run
    note: str = ""                            # e.g. why unavailable


class Combiner(abc.ABC):
    """Base class: feature frame in, target-weight frame out."""

    name: str = "base"

    @abc.abstractmethod
    def generate(self, features: pd.DataFrame) -> CombinerOutput:
        """Return pre-risk target weights (date x asset) from ``features``.

        ``features`` is a MultiIndex (date, asset) frame. Implementations MUST
        only use, for the weight at date ``T``, feature values at or before
        ``T`` (the backtest asserts this).
        """
        raise NotImplementedError
