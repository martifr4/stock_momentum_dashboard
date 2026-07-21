# Portfolio Tracker

> **Append-only trade ledger.** This file records ONLY trades the owner has
> explicitly authorized. A committee verdict (BUY/SELL/HOLD) is a *recommendation*
> and must NEVER modify this file on its own. A line is added here only when the
> owner explicitly instructs the orchestrator to execute a trade.
>
> **Editing rule:** append new rows only. Never edit or delete an existing row.
> To correct a mistake, append a new reversing/adjusting row and note it.

## Holdings summary
_(optional running notes — the ledger below is the source of truth)_

## Trade ledger

| # | Timestamp (UTC) | Pair | Side | Amount | Price | Value | Authorized by | Note |
|--:|-----------------|------|------|-------:|------:|------:|---------------|------|
