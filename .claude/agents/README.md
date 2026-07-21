# Crypto Trade Committee — Claude Code Subagents

This is the **agentic** version of the committee: seven Claude Code subagents,
each a scoped Claude instance with its own system prompt, tools, and model.
Unlike the Python version, these agents *reason* over the data rather than
running fixed formulas — they read numbers, weigh conflicting signals, search
the web for context, and explain their calls.

## The team

| Subagent | Model | Role |
|----------|-------|------|
| `trade-coordinator` | opus | Orchestrates everything, applies the unanimous-70% rule, writes the report |
| `tecnic` | sonnet | Technical-analysis trader → UP/DOWN probability |
| `social` | sonnet | Sentiment + 1/2/5-day shape trader → UP/DOWN probability |
| `macro` | sonnet | Whole-market regime trader → UP/DOWN probability |
| `tecnic-analyst` | haiku | Validates/repairs Tecnic's price+volume data |
| `social-analyst` | haiku | Validates prices, de-duplicates headlines for Social |
| `macro-analyst` | haiku | Range-checks global stats + Fear&Greed, de-dupes news |

Analysts run on **haiku** (cheap, high-volume validation), traders on **sonnet**,
and the coordinator on **opus** (judgment). Adjust `model:` in any file to taste.

## Install

Copy the `agents/` folder into your project's `.claude/` directory:

```
your-project/
└── .claude/
    └── agents/
        ├── trade-coordinator.md
        ├── tecnic.md
        ├── tecnic-analyst.md
        ├── social.md
        ├── social-analyst.md
        ├── macro.md
        └── macro-analyst.md
```

For a user-level install (available in every project), put them in
`~/.claude/agents/` instead.

> Subagents load at session start. If you edit a file on disk, restart the
> Claude Code session (or use `/agents`) to pick up the change.

## Use

Open Claude Code in the project and either let it auto-delegate or call explicitly:

```
Use the trade-coordinator subagent on BTC/USD
```

The coordinator will:
1. run each **analyst** to validate/clean that lane's data,
2. run each **trader** on the clean data,
3. apply the rule — **trade only if all three agree AND each > 70% AND no data block**,
4. write `reports/committee_BTC_<date>.md` and print the verdict.

You can also invoke any agent directly, e.g.
`Use the tecnic subagent on ETH/USD` or
`Use the social-analyst subagent to check today's headlines`.

## Portfolio tracker (explicit-authorization only)

`portfolio_tracker.md` is an **append-only trade ledger**. The committee's
verdict is a *recommendation* and never writes to it. A row is added **only**
when you explicitly tell the orchestrator to execute — e.g. "record this trade,
BUY 0.5 BTC/USD at 64250". The coordinator then appends one row via the
sanctioned helper:

```
python record_trade.py --pair BTC/USD --side buy --amount 0.5 --price 64250 \
    --by "owner" --note "committee UP 78%, approved" --confirm
```

`record_trade.py` is the only way the file should ever change. It appends a
single auto-numbered row and never edits or deletes existing history. To correct
a mistake, append a new adjusting row with a note — you keep a full audit trail.

Each row captures: index, UTC timestamp, pair, side, amount, price, value,
who authorized it, and a note.

## The decision rule

```
TRADE  ⇔  tecnic.dir == social.dir == macro.dir
         AND every trader's confidence in that direction > 70%
         AND no analyst returned STATUS: BLOCK
```

Anything else → NO TRADE. And even a TRADE verdict only *recommends* — it never
touches the portfolio without your explicit go-ahead.

## How this differs from the Python version

The Python files (`agent_*.py`, `analysts.py`, `coordinator.py`) are deterministic:
same input → same output, no tokens, fully reproducible, ideal for backtesting.
These subagents are *reasoning* agents: they handle messy/ambiguous data, pull
fresh context from the web, and explain themselves — at the cost of token spend
and run-to-run variability. Many people use both: Python for backtesting and
scheduled runs, subagents for richer daily judgment.

## Notes & limitations

- Data-fetch specifics (which API, paths) are described in the prompts; wire them
  to your actual data scripts or MCP connectors. The agents assume price/volume,
  headlines, and global stats are obtainable via their tools.
- Subagent-heavy runs cost meaningfully more tokens than a single thread (each
  agent has its own context). The haiku/sonnet/opus split keeps this in check.
- These produce **signals and reports only** — no order placement. Not financial
  advice; backtest the logic before risking capital.
