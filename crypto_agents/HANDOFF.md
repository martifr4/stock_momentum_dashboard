# Crypto Trade Committee — Build Handoff

Paste this into Claude Code to reconstruct and run the system. It describes a
multi-agent crypto decision tool with a strict trade rule and an append-only
portfolio ledger. **No LLM API key is used for the decision logic**; the Python
version is fully deterministic, and the agentic version uses Claude Code subagents.

## What to build

Two parallel implementations of the same committee, plus a portfolio tracker.

### A. Deterministic Python version (for backtesting / scheduled runs)
Files (all key-free; data from CoinGecko public API, Alternative.me Fear&Greed,
crypto news RSS):

- `indicators.py` — pure-python SMA, EMA, RSI, MACD, Bollinger, pct_change, logistic.
- `datasources.py` — fetch price/volume history, global market stats, Fear&Greed,
  news headlines. No API keys. Graceful degradation on failure.
- `analysts.py` — three data-quality analysts + shared validation primitives:
  - `tecnic_analyst(prices, volumes)` — drop None/NaN/inf/neg/zero, interpolate
    interior gaps, align price/volume lengths, flag frozen runs & >6σ outliers,
    FATAL (block) if < 60 clean points.
  - `social_analyst(prices, headlines)` — validate momentum series; remove exact,
    case-insensitive, and empty duplicate headlines.
  - `macro_analyst(global_stats, fng, headlines)` — range-check (dominance 0–100%,
    numeric mcap change), drop invalid/duplicate Fear&Greed, de-dupe news.
  - Each returns an `AnalystReport` with issues (severity INFO/WARN/ERROR/FATAL,
    `fixed` flag). `.ok` is False if any FATAL.
- `agent_tecnic.py` / `agent_social.py` / `agent_macro.py` — three traders. Each
  fetches raw data, runs its analyst FIRST, then scores signals and outputs
  `p_up`, `p_down`, `direction`, `confidence`, `signals`, and the `audit`.
  Scores are squashed to probabilities with a logistic function.
- `coordinator.py` — runs all three, applies the rule, writes a dated markdown
  report to `reports/`. CLI: `python coordinator.py BTC [--threshold 0.70]`.

### B. Claude Code subagent version (for richer daily judgment)
Seven markdown files in `.claude/agents/`, each YAML frontmatter + system prompt:

- `tecnic.md` (sonnet) — technical trader, UP/DOWN probability, price action only.
- `social.md` (sonnet) — sentiment + 1/2/5-day shape; may WebSearch/WebFetch.
- `macro.md` (sonnet) — whole-market regime (mcap trend, BTC dominance, Fear&Greed,
  news); may WebSearch/WebFetch.
- `tecnic-analyst.md` / `social-analyst.md` / `macro-analyst.md` (haiku) — validate
  and repair each trader's data before it runs; block on FATAL issues.
- `trade-coordinator.md` (opus) — orchestrates: runs each analyst via Task, then
  each trader, adjudicates, writes the report, and handles portfolio recording.

Install by copying `.claude/agents/*.md` into the project's `.claude/agents/`
(or `~/.claude/agents/` for user scope). Subagents load at session start; restart
after editing on disk. Invoke: `Use the trade-coordinator subagent on BTC/USD`.

### C. Portfolio tracker
- `portfolio_tracker.md` — append-only trade ledger (markdown table: #, UTC
  timestamp, pair, side, amount, price, value, authorized-by, note).
- `record_trade.py` — the ONLY sanctioned writer. Appends one auto-numbered row;
  never edits/deletes existing rows; validates positive amount/price; has a
  `--confirm` gate. Usage:
  `python record_trade.py --pair BTC/USD --side buy --amount 0.5 --price 64250 --by owner --note "..." --confirm`

## THE DECISION RULE (strict)

```
TRADE  ⇔  tecnic.direction == social.direction == macro.direction
         AND every trader's confidence in that direction > 70%   (70.0% is NOT > 70%)
         AND no analyst returned a FATAL / BLOCK data issue
```

Anything else → NO TRADE. Report must state which part failed (disagreement,
sub-threshold, or data block).

## PORTFOLIO SAFETY CONSTRAINT (critical)

- A committee verdict is a **recommendation only**. It NEVER modifies the portfolio.
- `portfolio_tracker.md` changes **only** when the human explicitly authorizes a
  trade ("record this trade", "execute", "log this buy" + amount and price).
- Even a unanimous 100% verdict does not authorize recording. The coordinator may
  *offer* to record, then must WAIT for explicit confirmation.
- The only write path is `record_trade.py` (append-only). Never hand-edit or delete
  ledger history; correct mistakes by appending an adjusting row.

## Data / environment notes

- CoinGecko free tier is rate-limited; add ~1.5–2s pauses between calls.
- Social sentiment uses news RSS as a key-free proxy (X/Reddit block scraping).
  Upgrade path: swap a paid social API into the sentiment function; interface stays.
- Analysts guarantee *internal* data integrity, not real-world correctness. A
  second price feed (e.g. Binance public API) cross-checked against CoinGecko would
  catch feed-level errors that look statistically normal. (Not yet built.)

## Known limitations / honesty

- Probabilities are heuristic (logistic-squashed indicator scores), NOT calibrated
  forecasts. Backtest before trusting them.
- The system outputs signals and reports only — it does NOT place exchange orders.
- The ledger records what was *authorized*, not actual exchange fills; reconcile if
  you later connect a real exchange.
- Not financial advice.

## Suggested next steps (optional, not yet built)

1. Backtester: replay the committee rule over past N days, report signal hit-rate.
2. Position/P&L summary: read the ledger, compute holdings and realized/unrealized
   P&L per pair.
3. Source cross-validation: second price feed vs CoinGecko in the Tecnic analyst.
4. `--dry-run` mode: run the full pipeline on saved sample data to verify mechanics
   before pointing at live markets.
5. Stronger tamper resistance for the ledger: OS-level read-only + hash-chain.

## How to run (in Claude Code, on your machine)

```
# Python version
pip install requests
python coordinator.py BTC

# Subagent version
#   copy .claude/agents/*.md into your project's .claude/agents/, then in Claude Code:
#   Use the trade-coordinator subagent on BTC/USD

# Record an authorized trade (only when you decide to)
python record_trade.py --pair BTC/USD --side buy --amount 0.5 --price 64250 --by owner --note "approved" --confirm
```
