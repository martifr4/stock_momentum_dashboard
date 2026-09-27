"""SQLite storage for the prediction-market monitor (data/markets.db)."""
from __future__ import annotations

import json
import sqlite3

import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS markets (
    id           TEXT PRIMARY KEY,   -- polymarket:<id> | kalshi:<ticker>
    source       TEXT NOT NULL,
    event_id     TEXT,
    event_title  TEXT,
    question     TEXT,
    outcome      TEXT,
    url          TEXT,
    category     TEXT,
    tags         TEXT,               -- JSON list
    topics       TEXT,               -- JSON {topic: polarity}
    regions      TEXT,               -- JSON list
    us_weight    REAL DEFAULT 1,
    created_ts   INTEGER,            -- when the venue listed it
    end_ts       INTEGER,
    first_seen   INTEGER NOT NULL,   -- when this monitor first saw it
    last_seen    INTEGER NOT NULL,
    prob         REAL,
    volume       REAL DEFAULT 0,
    volume24h    REAL DEFAULT 0,
    volume1wk    REAL,
    liquidity    REAL DEFAULT 0,
    src_chg_1d   REAL,
    src_chg_1w   REAL,
    src_chg_1m   REAL,
    active       INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_pm_markets_event ON markets(event_id);
CREATE INDEX IF NOT EXISTS idx_pm_markets_active ON markets(active);

CREATE TABLE IF NOT EXISTS snapshots (
    market_id  TEXT NOT NULL,
    ts         INTEGER NOT NULL,
    prob       REAL NOT NULL,
    volume     REAL,
    volume24h  REAL,
    PRIMARY KEY (market_id, ts)
);
CREATE INDEX IF NOT EXISTS idx_pm_snap_ts ON snapshots(ts);

CREATE TABLE IF NOT EXISTS alerts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ts          INTEGER NOT NULL,
    market_id   TEXT NOT NULL,
    kind        TEXT NOT NULL,       -- new_market | prob_move | volume_spike | near_certain
    value       REAL,                -- move size / spike ratio / prob
    prob_before REAL,
    prob_after  REAL,
    detail      TEXT
);
CREATE INDEX IF NOT EXISTS idx_pm_alerts_ts ON alerts(ts);
CREATE INDEX IF NOT EXISTS idx_pm_alerts_market ON alerts(market_id, kind, ts);

CREATE TABLE IF NOT EXISTS runs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at  INTEGER NOT NULL,
    finished_at INTEGER,
    n_markets   INTEGER DEFAULT 0,
    n_new       INTEGER DEFAULT 0,
    n_alerts    INTEGER DEFAULT 0,
    note        TEXT
);
"""


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(config.MARKETS_DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=30000;")
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)
        conn.commit()


def row_to_market(r: sqlite3.Row) -> dict:
    d = dict(r)
    for k, default in (("tags", []), ("topics", {}), ("regions", [])):
        try:
            d[k] = json.loads(d.get(k) or "null") or default
        except json.JSONDecodeError:
            d[k] = default
    return d


def probs_at(conn: sqlite3.Connection, ts: int, min_ts: int | None = None) -> dict[str, float]:
    """market_id -> probability from the latest snapshot at or before `ts`.

    `min_ts` ignores snapshots that are too stale to stand in for `ts`.
    """
    rows = conn.execute(
        """SELECT s.market_id, s.prob FROM snapshots s
           JOIN (SELECT market_id, MAX(ts) AS mts FROM snapshots
                 WHERE ts <= ? AND ts >= ? GROUP BY market_id) x
             ON x.market_id = s.market_id AND x.mts = s.ts""",
        (ts, min_ts if min_ts is not None else 0),
    ).fetchall()
    return {r["market_id"]: r["prob"] for r in rows}
