# Reddit Momentum Dashboard

A local dashboard that digests what retail-investment communities are talking
about — tracking **stock ticker mentions, sentiment, and momentum** on
**daily / weekly / monthly / yearly** timeframes so you can see where retail
attention is heading.

**Data sources** (each pluggable and independently toggleable):

| Source | What it adds | Auth |
|---|---|---|
| **StockTwits** | Retail traders' cashtag network, with user-tagged Bullish/Bearish sentiment + trending-symbol discovery | none |
| **Yahoo Finance** | Per-ticker news headlines (news drives retail attention) | none |
| **Hacker News** | Tech-stock discussion (curated company-name query map avoids ticker-collision noise) | none |
| **Reddit** | ~12 investing subreddits (posts + comments) | OAuth (see below) |

- **Almost dependency-free** — Python standard library plus one small package
  (`truststore`) so HTTPS works on fresh Python installs. Python 3.10+.
- Extracts tickers (cashtags `$NVDA` + a curated known-ticker universe; sources
  that carry explicit symbols, like StockTwits, use those directly).
- Scores finance/WSB-aware sentiment (bullish ↔ bearish); trusts user Bull/Bear
  tags where a source provides them.
- Stores everything in SQLite (tagged by source) so history accumulates over time.
- Interactive dashboard: **filter by source**, per-source breakdown, top movers,
  momentum arrows, sentiment meters, per-ticker trend charts, and the actual
  posts/headlines driving the buzz.

## Install

```powershell
pip install -r requirements.txt      # just `truststore`
```

## Quick start

```powershell
pip install -r requirements.txt

# Option A: pull REAL data right now from StockTwits + Yahoo + Hacker News
#           (no accounts needed; Reddit is added later once approved)
python backend/ingest.py          # or: .\run_ingest.ps1

# Option B: or just load demo data to explore the UI instantly
python backend/seed_demo.py

# Start the dashboard
python backend/server.py          # or: .\run_server.ps1
```

Then open <http://127.0.0.1:8000>. Toggle Daily / Weekly / Monthly / Yearly,
filter by **source**, and click any ticker for its trend and the posts/headlines
driving it. You can also hit **"Pull new data"** in the UI to ingest on demand.

To remove demo data before going live:

```powershell
python backend/seed_demo.py --wipe   # wipes, then re-seeds
# ...or wipe only:
python -c "import sys; sys.path.insert(0,'backend'); import seed_demo; seed_demo.wipe()"
```

## Toggling sources

Each source is independent. Disable any via env vars (all default on):

```powershell
$env:ENABLE_STOCKTWITS = "0"   # or ENABLE_YAHOO_NEWS / ENABLE_HACKERNEWS / ENABLE_REDDIT
```

The tickers actively polled on per-symbol sources (StockTwits streams, Yahoo
feeds) are the `WATCHLIST` in `backend/config.py`; StockTwits *trending* symbols
are added automatically on top. Hacker News uses the curated company-name map in
`backend/sources/hackernews.py`.

## Getting LIVE Reddit data

The other three sources need no setup, but Reddit **blocks anonymous access** to
its JSON endpoints (HTTP 403). You need a free Reddit "script" app for OAuth
credentials:

1. Go to <https://www.reddit.com/prefs/apps> → **create another app**.
2. Choose type **script**. Set redirect URI to `http://localhost:8080`
   (unused for script apps, but required).
3. Copy the **client ID** (under the app name) and the **secret**.
4. Set them as environment variables and run ingestion:

```powershell
$env:REDDIT_CLIENT_ID     = "your_client_id"
$env:REDDIT_CLIENT_SECRET = "your_client_secret"
$env:REDDIT_USER_AGENT    = "RedditMomentumDashboard/0.1 by /u/yourusername"

python backend/ingest.py          # or: .\run_ingest.ps1
```

You can also click **"Pull new Reddit data"** in the dashboard (it runs ingestion
in the background), as long as those env vars are set in the server's environment.

> **History builds over time.** Reddit's API only returns recent posts, so the
> monthly/yearly views fill in as you keep pulling. Schedule ingestion (below) to
> accumulate a real history.

## Scheduling automatic ingestion (Windows Task Scheduler)

Run ingestion hourly so data keeps accumulating:

```powershell
$action  = New-ScheduledTaskAction -Execute "python" `
             -Argument "backend\ingest.py" -WorkingDirectory "C:\Claude_Projects\RedditMomentumDashboard"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
             -RepetitionInterval (New-TimeSpan -Hours 1)
Register-ScheduledTask -TaskName "RedditMomentumIngest" -Action $action -Trigger $trigger
```

Make sure the Reddit env vars are set for the account that runs the task
(set them at the machine level via `System Properties → Environment Variables`,
or hard-code them in a small wrapper `.ps1`).

## Configuration

Everything is tunable via environment variables (see `backend/config.py`):

| Variable | Default | Meaning |
|---|---|---|
| `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | — | OAuth app creds (recommended) |
| `REDDIT_USER_AGENT` | generic | Identify your app to Reddit |
| `POSTS_PER_SUB` | 100 | Posts pulled per subreddit per run |
| `COMMENTS_PER_POST` | 40 | Top comments scanned per post (0 = skip) |
| `REDDIT_LISTING` | hot | `hot` / `new` / `top` / `rising` |
| `REDDIT_REQUEST_DELAY` | 1.5 | Seconds between Reddit calls |
| `DASH_HOST` / `DASH_PORT` | 127.0.0.1 / 8000 | Server bind |

Edit the `SUBREDDITS` list in `backend/config.py` to change which communities are
digested. Extend `KNOWN_TICKERS` / `STOPWORDS` in `backend/tickers.py` and the
finance lexicon in `backend/sentiment.py` to tune detection for your interests.

## How it works

```
Reddit (OAuth JSON)  ->  ingest.py  ->  SQLite (posts, mentions)
                              |              |
                    tickers.py + sentiment.py
                                             |
                              analytics.py (windows + momentum)
                                             |
                              server.py  ->  frontend/index.html
```

- **Momentum** = change in mention count for a ticker vs. the *previous* period of
  the same length (e.g. this week vs. last week). `NEW` = no prior-period mentions.
- **Buzz** = sum of per-mention weights, where weight = `1 + ln(1 + reddit_score)`,
  so a highly-upvoted post counts more than a throwaway comment.
- **Weighted sentiment** = buzz-weighted average sentiment in `[-1, 1]`.

## Project layout

```
backend/
  config.py         settings (sources, watchlist, subreddits, env vars)
  db.py             SQLite schema + migration + helpers
  tickers.py        ticker extraction + known universe
  sentiment.py      finance/WSB sentiment lexicon
  reddit_client.py  Reddit fetch (OAuth + public-JSON fallback)
  sources/          pluggable data sources (each exposes fetch())
    http_util.py    shared HTTP + truststore SSL fix
    stocktwits.py   StockTwits streams + trending
    yahoo_news.py   Yahoo Finance per-ticker RSS
    hackernews.py   Hacker News (Algolia) via company-name map
    reddit_source.py Reddit adapter
  ingest.py         the pipeline: sources -> tickers -> sentiment -> DB
  analytics.py      window aggregation + momentum + source filtering
  server.py         stdlib HTTP API + serves the frontend
  seed_demo.py      synthetic demo data for exploring the UI
frontend/
  index.html        the dashboard (self-contained, no CDN)
data/
  reddit.db         SQLite database (created on first run)
```

To add a new source, drop a module in `backend/sources/` exposing `SOURCE` and
`fetch() -> list[dict]` (normalized docs), and register it in
`backend/sources/__init__.py`. The pipeline handles the rest.

## Caveats & ideas

- Sentiment is a lexicon model — good for a momentum signal, not equity research.
- Ticker detection favors precision; bare symbols outside `KNOWN_TICKERS` are only
  caught as cashtags (`$XYZ`). Add symbols you care about to the known set.
- **Not investment advice.** This measures forum *chatter*, not fundamentals.
- Easy extensions: add StockTwits / HN / Discord sources, a "new tickers today"
  feed, alerts when a ticker's momentum crosses a threshold, or price overlay.
```

