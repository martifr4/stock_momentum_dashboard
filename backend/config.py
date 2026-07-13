"""Central configuration for the Reddit Momentum Dashboard."""
from __future__ import annotations

import os
from pathlib import Path

# --- Paths -----------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
# DATA_DIR is overridable so a cloud host can point it at a persistent disk
# (e.g. a mounted Render Disk) and keep history across restarts/redeploys.
DATA_DIR = Path(os.environ.get("DASH_DATA_DIR", str(ROOT / "data")))
DB_PATH = DATA_DIR / "reddit.db"
FRONTEND_DIR = ROOT / "frontend"

DATA_DIR.mkdir(parents=True, exist_ok=True)

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
# HOST: bind 0.0.0.0 to accept connections from other devices / a cloud host.
HOST = os.environ.get("DASH_HOST", "127.0.0.1")
# PORT: many hosts (Render, Railway, Heroku, ...) inject the port via $PORT,
# so honor that when DASH_PORT isn't set explicitly.
PORT = int(os.environ.get("DASH_PORT") or os.environ.get("PORT") or "8000")

# --- Discovery / dynamic watchlist -----------------------------------------
# Tickers that trend outside your WATCHLIST are surfaced in the dashboard's
# discovery panel. When auto-promote is on, a discovered ticker that sustains
# enough buzz/mentions is added to a DB-backed dynamic watchlist so the
# per-symbol sources (StockTwits, Yahoo) start covering it in depth too.
DISCOVERY_AUTO_PROMOTE = os.environ.get("DISCOVERY_AUTO_PROMOTE", "1") == "1"
# Window used to judge "sustained" buzz for promotion.
DISCOVERY_WINDOW = os.environ.get("DISCOVERY_WINDOW", "weekly")
# A ticker must clear BOTH thresholds in that window to be auto-promoted.
DISCOVERY_PROMOTE_BUZZ = float(os.environ.get("DISCOVERY_PROMOTE_BUZZ", "20"))
DISCOVERY_PROMOTE_MENTIONS = int(os.environ.get("DISCOVERY_PROMOTE_MENTIONS", "10"))
# Cap on how many dynamically-discovered tickers to retain (lowest buzz pruned).
DISCOVERY_MAX_DYNAMIC = int(os.environ.get("DISCOVERY_MAX_DYNAMIC", "40"))

# --- Optional access control ------------------------------------------------
# When deployed on the public internet the dashboard is reachable by anyone who
# has the URL. Set DASH_PASSWORD to require HTTP Basic auth. Leave it empty
# (the default) to keep the dashboard open, e.g. for local use.
AUTH_USERNAME = os.environ.get("DASH_USERNAME", "admin")
AUTH_PASSWORD = os.environ.get("DASH_PASSWORD", "")
