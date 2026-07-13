"""Effective watchlist = the hardcoded config.WATCHLIST plus a DB-backed set of
tickers auto-discovered from trending activity (see discovery.py).

The per-symbol sources (StockTwits, Yahoo) call `polling_symbols()` instead of
reading config.WATCHLIST directly, so newly-promoted tickers actually get
polled -- with a reserved share of the per-run budget so they aren't crowded
out by the (already ~30-strong) hardcoded watchlist.
"""
from __future__ import annotations

import time

import config
import db

_WATCH = {t.upper() for t in config.WATCHLIST}


def get_dynamic() -> list[str]:
    """Discovered tickers, hottest first."""
    with db.cursor() as c:
        c.execute("SELECT ticker FROM discovered_watchlist "
                  "ORDER BY buzz DESC, added_utc DESC")
        return [r["ticker"] for r in c.fetchall()]


def dynamic_set() -> set[str]:
    return set(get_dynamic())


def _prune(cur, keep: int) -> None:
    """Keep only the `keep` highest-buzz discovered tickers."""
    cur.execute("SELECT COUNT(*) AS n FROM discovered_watchlist")
    n = cur.fetchone()["n"]
    if n <= keep:
        return
    cur.execute(
        """DELETE FROM discovered_watchlist WHERE ticker IN (
               SELECT ticker FROM discovered_watchlist
               ORDER BY buzz ASC, added_utc ASC LIMIT ?)""",
        (n - keep,))


def add(ticker: str, buzz: float = 0.0, mentions: int = 0,
        reason: str = "auto") -> bool:
    """Add/refresh a discovered ticker. Returns True only on first insert.

    Tickers already in the hardcoded watchlist are ignored (nothing to promote).
    """
    ticker = ticker.upper()
    if ticker in _WATCH:
        return False
    now = int(time.time())
    with db.cursor() as c:
        c.execute("SELECT 1 FROM discovered_watchlist WHERE ticker = ?", (ticker,))
        if c.fetchone():
            c.execute("UPDATE discovered_watchlist SET buzz = ?, mentions = ? "
                      "WHERE ticker = ?", (buzz, mentions, ticker))
            return False
        c.execute(
            "INSERT INTO discovered_watchlist (ticker, added_utc, buzz, mentions, reason) "
            "VALUES (?,?,?,?,?)", (ticker, now, buzz, mentions, reason))
        _prune(c, config.DISCOVERY_MAX_DYNAMIC)
    return True


def remove(ticker: str) -> None:
    with db.cursor() as c:
        c.execute("DELETE FROM discovered_watchlist WHERE ticker = ?",
                  (ticker.upper(),))


def polling_symbols(cap: int) -> list[str]:
    """The symbols per-symbol sources should poll this run, capped at `cap`.

    Reserves up to a third of the budget for the hottest discovered tickers so
    they get real coverage, then fills the rest with the hardcoded watchlist.
    """
    base = list(config.WATCHLIST)
    dyn = [t for t in get_dynamic() if t not in _WATCH]
    if not dyn:
        return base[:cap]
    reserve = min(len(dyn), max(1, cap // 3))
    picked = dyn[:reserve]
    picked += [b for b in base if b not in picked]
    picked += [d for d in dyn[reserve:] if d not in picked]
    return picked[:cap]


def auto_promote() -> list[str]:
    """Promote off-watchlist tickers that clear the buzz/mention thresholds."""
    import discovery  # lazy: discovery imports this module
    promoted: list[str] = []
    for r in discovery.discover(config.DISCOVERY_WINDOW, limit=100,
                                min_buzz=config.DISCOVERY_PROMOTE_BUZZ):
        if (r["mentions"] >= config.DISCOVERY_PROMOTE_MENTIONS
                and r["buzz"] >= config.DISCOVERY_PROMOTE_BUZZ):
            if add(r["ticker"], r["buzz"], r["mentions"],
                   reason=f"auto buzz>={config.DISCOVERY_PROMOTE_BUZZ:g} "
                          f"mentions>={config.DISCOVERY_PROMOTE_MENTIONS}"):
                promoted.append(r["ticker"])
    return promoted
