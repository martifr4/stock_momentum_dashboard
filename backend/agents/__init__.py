"""Per-source validation agents.

Each source has its own agent because the "is this legit?" question is
source-specific (StockTwits pump spam, Yahoo attribution, HN name collisions,
Reddit false-positive ticker extraction). Look one up with `agent_for(source)`.
"""
from __future__ import annotations

from agents.base import BaseAgent, Verdict
from agents.hackernews import HackerNewsAgent
from agents.reddit import RedditAgent
from agents.stocktwits import StockTwitsAgent
from agents.yahoo_news import YahooNewsAgent

# One instance per source; agents are stateless so sharing is fine.
_AGENTS: dict[str, BaseAgent] = {
    a.SOURCE: a for a in (
        StockTwitsAgent(),
        YahooNewsAgent(),
        HackerNewsAgent(),
        RedditAgent(),
    )
}

# Fallback for any source without a dedicated agent (e.g. demo data): the base
# agent still runs the generic legitimacy + lexicon-agreement checks.
_FALLBACK = BaseAgent()


def agent_for(source: str) -> BaseAgent:
    return _AGENTS.get(source, _FALLBACK)


def all_agents() -> dict[str, BaseAgent]:
    return dict(_AGENTS)


__all__ = ["BaseAgent", "Verdict", "agent_for", "all_agents"]
