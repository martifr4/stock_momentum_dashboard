"""SQLite storage layer."""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from typing import Iterator

from config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS posts (
    id            TEXT PRIMARY KEY,      -- source-prefixed unique id
    source        TEXT NOT NULL DEFAULT 'reddit',  -- reddit|stocktwits|hackernews|yahoo_news
    subreddit     TEXT NOT NULL,         -- subreddit (reddit) or channel/feed label
    kind          TEXT NOT NULL,         -- post|comment|message|story|news
    title         TEXT,
    body          TEXT,
    author        TEXT,
    permalink     TEXT,
    score         INTEGER DEFAULT 0,
    num_comments  INTEGER DEFAULT 0,
    created_utc   INTEGER NOT NULL,      -- reddit post time (unix seconds)
    sentiment     REAL DEFAULT 0,        -- [-1, 1] for the text itself
    fetched_at    INTEGER NOT NULL       -- when we ingested it
);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_utc);
CREATE INDEX IF NOT EXISTS idx_posts_sub ON posts(subreddit);

CREATE TABLE IF NOT EXISTS mentions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker      TEXT NOT NULL,
    post_id     TEXT NOT NULL,
    source      TEXT NOT NULL DEFAULT 'reddit',
    subreddit   TEXT NOT NULL,
    kind        TEXT NOT NULL,
    sentiment   REAL DEFAULT 0,          -- sentiment of the mentioning text
    weight      REAL DEFAULT 1,          -- influence (log of reddit score)
    created_utc INTEGER NOT NULL,
    UNIQUE(ticker, post_id)
);
CREATE INDEX IF NOT EXISTS idx_mentions_ticker ON mentions(ticker);
CREATE INDEX IF NOT EXISTS idx_mentions_created ON mentions(created_utc);
CREATE INDEX IF NOT EXISTS idx_mentions_ticker_created ON mentions(ticker, created_utc);

CREATE TABLE IF NOT EXISTS ingest_runs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at  INTEGER NOT NULL,
    finished_at INTEGER,
    posts_seen  INTEGER DEFAULT 0,
    mentions    INTEGER DEFAULT 0,
    note        TEXT
);

-- Per-mention validation verdicts produced by the source agents (see
-- backend/agents/). One row per (ticker, post) mention that was audited.
CREATE TABLE IF NOT EXISTS mention_audits (
    ticker           TEXT NOT NULL,
    post_id          TEXT NOT NULL,
    source           TEXT NOT NULL,
    status           TEXT NOT NULL,      -- ok|flag
    legit            INTEGER NOT NULL,   -- 1 = post looks genuine/relevant
    agrees           INTEGER NOT NULL,   -- 1 = stored sentiment agrees with agent
    stored_sentiment REAL,               -- score that fed momentum/buzz
    agent_sentiment  REAL,               -- agent's independent reading
    confidence       REAL,               -- agent confidence in its reading
    reasons          TEXT,               -- '; '-joined reason codes
    audited_at       INTEGER NOT NULL,
    PRIMARY KEY (ticker, post_id)
);
CREATE INDEX IF NOT EXISTS idx_audits_status ON mention_audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_source ON mention_audits(source);

-- Tickers discovered trending outside the hardcoded WATCHLIST and promoted to a
-- dynamic watchlist so the per-symbol sources start covering them (see
-- backend/watchlist.py + backend/discovery.py).
CREATE TABLE IF NOT EXISTS discovered_watchlist (
    ticker    TEXT PRIMARY KEY,
    added_utc INTEGER NOT NULL,
    buzz      REAL DEFAULT 0,
    mentions  INTEGER DEFAULT 0,
    reason    TEXT
);
"""


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=30000;")
    return conn


def _migrate(conn: sqlite3.Connection) -> None:
    """Add columns introduced after the first release, if missing."""
    for table in ("posts", "mentions"):
        cols = {r["name"] for r in conn.execute(f"PRAGMA table_info({table})")}
        if "source" not in cols:
            conn.execute(
                f"ALTER TABLE {table} ADD COLUMN source TEXT NOT NULL DEFAULT 'reddit'")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_mentions_source ON mentions(source)")


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)
        _migrate(conn)
        conn.commit()


@contextmanager
def cursor() -> Iterator[sqlite3.Cursor]:
    conn = connect()
    try:
        yield conn.cursor()
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
    print(f"Initialized database at {DB_PATH}")
