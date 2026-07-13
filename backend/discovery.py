"""Discovery: surface tickers trending *outside* your hardcoded watchlist.

Reuses the same buzz/momentum aggregation as Top Movers, but keeps only tickers
that aren't in config.WATCHLIST, and enriches each with when it was first seen
in your data and whether it's already been auto-promoted to the dynamic
watchlist.
"""
from __future__ import annotations

import time

import analytics
import config
import db
import watchlist


def discover(window: str | None = None, limit: int = 30,
             min_buzz: float = 0.0) -> list[dict]:
    window = window or config.DISCOVERY_WINDOW
    watch = {t.upper() for t in config.WATCHLIST}
    promoted = watchlist.dynamic_set()

    # movers is already ranked by buzz; pull a wide slice then filter.
    rows = analytics.movers(window, limit=1000)
    off = [r for r in rows
           if r["ticker"] not in watch and (r["buzz"] or 0) >= min_buzz][:limit]

    first_seen = {}
    if off:
        tickers = [r["ticker"] for r in off]
        ph = ",".join("?" * len(tickers))
        with db.cursor() as c:
            c.execute(
                f"SELECT ticker, MIN(created_utc) AS fs FROM mentions "
                f"WHERE ticker IN ({ph}) GROUP BY ticker", tickers)
            first_seen = {r["ticker"]: r["fs"] for r in c.fetchall()}

    now = int(time.time())
    period = analytics.WINDOWS.get(window, analytics.WINDOWS["weekly"])[0]
    for r in off:
        fs = first_seen.get(r["ticker"])
        r["first_seen"] = fs
        r["is_recent"] = fs is not None and fs >= now - period
        r["promoted"] = r["ticker"] in promoted
    return off


def summary(window: str | None = None, limit: int = 30) -> dict:
    window = window or config.DISCOVERY_WINDOW
    tickers = discover(window, limit=limit)
    return {
        "window": window,
        "count": len(tickers),
        "promote_buzz": config.DISCOVERY_PROMOTE_BUZZ,
        "promote_mentions": config.DISCOVERY_PROMOTE_MENTIONS,
        "auto_promote": config.DISCOVERY_AUTO_PROMOTE,
        "tickers": tickers,
    }


def _print_report(window: str) -> None:
    s = summary(window)
    print(f"\n=== Off-watchlist discovery ({window}) ===")
    if not s["tickers"]:
        print("  nothing trending outside your watchlist in this window.")
        return
    print(f"  {'ticker':<8}{'mentions':>9}{'buzz':>8}{'momentum':>10}  first_seen")
    for r in s["tickers"]:
        fs = r["first_seen"]
        ago = (f"{round((time.time()-fs)/86400,1)}d ago" if fs else "?")
        newp = "  <- NEW" if r["is_recent"] else ""
        prom = "  [promoted]" if r["promoted"] else ""
        print(f"  {r['ticker']:<8}{r['mentions']:>9}{round(r['buzz']):>8}"
              f"{round(r['momentum']*100):>9}%  {ago}{newp}{prom}")


def main(argv=None) -> int:
    import argparse
    ap = argparse.ArgumentParser(description="Show tickers trending outside your "
                                             "hardcoded watchlist.")
    ap.add_argument("--window", default=config.DISCOVERY_WINDOW,
                    help="daily|weekly|monthly|yearly")
    ap.add_argument("--promote", action="store_true",
                    help="also auto-promote qualifying tickers to the dynamic watchlist")
    args = ap.parse_args(argv)

    db.init_db()
    _print_report(args.window)
    if args.promote:
        promoted = watchlist.auto_promote()
        print(f"\npromoted: {promoted or 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
