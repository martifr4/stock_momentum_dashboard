"""Central configuration for the Reddit Momentum Dashboard."""
from __future__ import annotations

import os
from pathlib import Path

# --- Paths -----------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "reddit.db"
FRONTEND_DIR = ROOT / "frontend"

DATA_DIR.mkdir(exist_ok=True)

# --- Reddit access ---------------------------------------------------------
# Reddit now BLOCKS all non-OAuth / unidentified traffic, and throttles generic
# User-Agents (e.g. "Python/urllib"). Reddit requires this exact UA format:
#   <platform>:<app id>:<version> (by /u/<your reddit username>)
# Override REDDIT_USER_AGENT with YOUR reddit username before going live.
USER_AGENT = os.environ.get(
    "REDDIT_USER_AGENT",
    "windows:AnalysingSentiment:0.1 (by /u/CHANGE_ME)",
)
REDDIT_CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET", "")

# Seconds to sleep between Reddit HTTP calls to stay polite / avoid throttling.
REQUEST_DELAY = float(os.environ.get("REDDIT_REQUEST_DELAY", "1.5"))

# Investment / trading communities to digest. Add or remove freely.
SUBREDDITS = [
    "stocks",
    "investing",
    "wallstreetbets",
    "StockMarket",
    "options",
    "ValueInvesting",
    "SecurityAnalysis",
    "dividends",
    "pennystocks",
    "Daytrading",
    "swingtrading",
    "stockstobuytoday",
]

# How many posts to pull per subreddit per ingest run (max 100 per Reddit call).
POSTS_PER_SUB = int(os.environ.get("POSTS_PER_SUB", "100"))
# How many top-level comments to scan per post (0 = skip comments, faster).
COMMENTS_PER_POST = int(os.environ.get("COMMENTS_PER_POST", "40"))
# Sort/listing to pull: "hot", "new", "top", "rising".
LISTING = os.environ.get("REDDIT_LISTING", "hot")

# --- Other sources ---------------------------------------------------------
# Which sources ingestion pulls from. Reddit needs OAuth creds (see README);
# the others work out of the box.
ENABLE_REDDIT = os.environ.get("ENABLE_REDDIT", "1") == "1"
ENABLE_STOCKTWITS = os.environ.get("ENABLE_STOCKTWITS", "1") == "1"
ENABLE_HACKERNEWS = os.environ.get("ENABLE_HACKERNEWS", "1") == "1"
ENABLE_YAHOO_NEWS = os.environ.get("ENABLE_YAHOO_NEWS", "1") == "1"

# Tickers we actively poll on per-symbol sources (StockTwits streams, Yahoo
# news). Kept focused to respect rate limits; StockTwits *trending* discovery
# adds hot names on top of this automatically.
WATCHLIST = [
    "NVDA", "TSLA", "AAPL", "AMD", "PLTR", "MSFT", "AMZN", "META", "GOOGL",
    "SPY", "QQQ", "SMCI", "COIN", "MSTR", "HOOD", "SOFI", "MU", "ARM", "AVGO",
    "TSM", "INTC", "NFLX", "MARA", "GME", "BA", "F", "RIVN", "LLY", "UNH", "DIS",
]
# Max symbols polled per per-symbol source per run (rate-limit guard).
MAX_WATCHLIST_PER_RUN = int(os.environ.get("MAX_WATCHLIST_PER_RUN", "30"))
# How many StockTwits trending symbols to also pull each run.
STOCKTWITS_TRENDING = int(os.environ.get("STOCKTWITS_TRENDING", "12"))

# --- Server ----------------------------------------------------------------
HOST = os.environ.get("DASH_HOST", "127.0.0.1")
PORT = int(os.environ.get("DASH_PORT", "8000"))
