#!/usr/bin/env python3
"""
record_trade.py — the ONLY sanctioned way to write to portfolio_tracker.md.

It APPENDS a single trade row. It never edits or deletes existing rows.
A trade is recorded only when the human explicitly authorizes it; this script
is the mechanism for that authorization, not an automatic consequence of any
committee verdict.

Usage:
    python record_trade.py --pair BTC/USD --side buy --amount 0.5 --price 64250 \
        --by "you" --note "committee UP 78%, manually approved"

Safety:
    - Refuses to run without an explicit --confirm flag (or interactive y/N).
    - Validates side/amount/price.
    - Auto-numbers the row from the existing ledger.
    - Only ever appends; the rest of the file is untouched.
"""

import argparse
import datetime as dt
import re
import sys
from pathlib import Path

TRACKER = Path(__file__).parent / "portfolio_tracker.md"
ROW_RE = re.compile(r"^\|\s*(\d+)\s*\|")


def next_index(lines):
    idx = 0
    for ln in lines:
        m = ROW_RE.match(ln)
        if m:
            idx = max(idx, int(m.group(1)))
    return idx + 1


def main():
    ap = argparse.ArgumentParser(description="Append an authorized trade to the portfolio tracker.")
    ap.add_argument("--pair", required=True, help="e.g. BTC/USD")
    ap.add_argument("--side", required=True, choices=["buy", "sell"])
    ap.add_argument("--amount", required=True, type=float, help="units of base asset")
    ap.add_argument("--price", required=True, type=float, help="execution price in quote currency")
    ap.add_argument("--by", default="owner", help="who authorized the trade")
    ap.add_argument("--note", default="", help="free-text note")
    ap.add_argument("--timestamp", default=None, help="ISO UTC; defaults to now")
    ap.add_argument("--confirm", action="store_true",
                    help="required to actually write (guards against accidental runs)")
    args = ap.parse_args()

    if args.amount <= 0 or args.price <= 0:
        sys.exit("ERROR: amount and price must be positive.")

    if not TRACKER.exists():
        sys.exit(f"ERROR: {TRACKER} not found. Create the tracker first.")

    ts = args.timestamp or dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M")
    value = args.amount * args.price
    note = args.note.replace("|", "/")  # keep the table intact

    # Explicit human confirmation gate.
    if not args.confirm:
        print(f"About to APPEND this trade to {TRACKER.name}:")
        print(f"  {args.side.upper()} {args.amount} {args.pair} @ {args.price} "
              f"(value {value:,.2f}) authorized by {args.by}")
        resp = input("Type 'yes' to confirm: ").strip().lower()
        if resp != "yes":
            sys.exit("Aborted — nothing written.")

    lines = TRACKER.read_text(encoding="utf-8").splitlines()
    n = next_index(lines)
    row = (f"| {n} | {ts} | {args.pair} | {args.side.upper()} | "
           f"{args.amount:g} | {args.price:g} | {value:,.2f} | {args.by} | {note} |")

    # APPEND ONLY: add the row after the last existing table row.
    with TRACKER.open("a", encoding="utf-8") as f:
        f.write(row + "\n")

    print(f"Recorded trade #{n}: {row}")


if __name__ == "__main__":
    main()
