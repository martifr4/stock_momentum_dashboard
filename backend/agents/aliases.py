"""Ticker -> company name aliases, used by the validation agents to verify that
a post actually refers to the company it was attributed to.

Kept lightweight and focused on the tickers the pipeline actively polls
(config.WATCHLIST) plus the Hacker News company-name map. Aliases are matched
case-insensitively against post text.
"""
from __future__ import annotations

# Primary company names / common aliases per ticker. Lowercase; matched as
# substrings against lowercased post text.
COMPANY_ALIASES: dict[str, list[str]] = {
    "NVDA": ["nvidia"],
    "TSLA": ["tesla"],
    "AAPL": ["apple"],
    "AMD": ["advanced micro devices", "amd"],
    "PLTR": ["palantir"],
    "MSFT": ["microsoft"],
    "AMZN": ["amazon"],
    "META": ["meta platforms", "facebook", "instagram", "meta"],
    "GOOGL": ["google", "alphabet"],
    "GOOG": ["google", "alphabet"],
    "SPY": ["s&p 500", "s&p500", "spdr"],
    "QQQ": ["nasdaq 100", "nasdaq-100", "invesco qqq"],
    "SMCI": ["super micro", "supermicro"],
    "COIN": ["coinbase"],
    "MSTR": ["microstrategy", "strategy inc"],
    "HOOD": ["robinhood"],
    "SOFI": ["sofi"],
    "MU": ["micron"],
    "ARM": ["arm holdings", "arm ltd"],
    "AVGO": ["broadcom"],
    "TSM": ["tsmc", "taiwan semiconductor"],
    "INTC": ["intel"],
    "NFLX": ["netflix"],
    "MARA": ["marathon digital", "mara holdings"],
    "GME": ["gamestop"],
    "BA": ["boeing"],
    "F": ["ford"],
    "RIVN": ["rivian"],
    "LLY": ["eli lilly", "lilly"],
    "UNH": ["unitedhealth", "united health"],
    "DIS": ["disney"],
    "SNOW": ["snowflake"],
    "CRWD": ["crowdstrike"],
    "PYPL": ["paypal"],
    "SHOP": ["shopify"],
    "UBER": ["uber"],
}


def aliases_for(ticker: str) -> list[str]:
    return COMPANY_ALIASES.get(ticker.upper(), [])
