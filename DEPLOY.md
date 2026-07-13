# Deploying the dashboard online (access from anywhere)

This hosts the dashboard on **Render's free tier** so you can open it from your
laptop, your phone, anywhere — no need to keep your laptop running.

The repo already includes a [`render.yaml`](render.yaml) blueprint, and the
server honors the `$PORT` most hosts inject, so this is mostly clicking through.

## Steps

1. **Push this branch to GitHub** (already done if you're reading this there).

2. Go to <https://render.com> and sign up / log in (free; you can sign in with
   your GitHub account). No credit card needed for the free tier.

3. **New → Blueprint**, then connect this GitHub repo. Render reads
   `render.yaml` and proposes a web service called `momentum-dashboard`.

4. It will prompt you for **`DASH_PASSWORD`** (because the URL is public — see
   below). Enter a password you'll remember. Click **Apply / Deploy**.

5. Wait for the first build to finish (a couple of minutes). Render gives you a
   URL like `https://momentum-dashboard.onrender.com`. Open it on your phone or
   laptop — your browser will ask for a username/password:
   - username: `admin` (change with the `DASH_USERNAME` env var if you like)
   - password: whatever you set for `DASH_PASSWORD`

6. The dashboard starts with **no data**. Click **"Pull new data"** in the UI
   (or wait for your first scheduled ingest) to populate it.

## Getting Reddit data too (optional)

StockTwits, Yahoo, and Hacker News work out of the box. For Reddit, add these
in Render → your service → **Environment**, then trigger a redeploy or hit
"Pull new data":

- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT` (e.g. `web:MomentumDashboard:0.1 (by /u/yourname)`)

See the main README's "Getting LIVE Reddit data" section for how to create the
free Reddit app.

## Important caveats about the free tier

- **It sleeps when idle.** Free Render services spin down after ~15 min of no
  traffic; the next visit takes ~30–60s to wake up (a "cold start"). After that
  it's snappy again.
- **Data does not persist across restarts.** The free tier has an ephemeral
  filesystem, so the SQLite database is wiped on every redeploy/restart. Since
  momentum compares this period vs. the previous one, history only accumulates
  while the instance stays up. To keep history permanently, add a **Render Disk**
  (a paid add-on): create a disk mounted at e.g. `/data`, then set the env var
  `DASH_DATA_DIR=/data`. The app will store `reddit.db` there and survive
  restarts.
- **The URL is public.** Anyone with the link can reach it, which is why
  `DASH_PASSWORD` (HTTP Basic auth) is set. Keep it set for a public deploy.

## Scheduling automatic ingestion

To keep data fresh without clicking the button, add a **Render Cron Job** (free
tier available) that runs `python backend/ingest.py` on a schedule (e.g. hourly),
using the same environment variables. Note: with the ephemeral free web tier,
scheduled ingests still won't build long-term history unless you add the
persistent disk above.

## Other hosts

The same code works anywhere that runs Python and injects `$PORT` (Railway,
Fly.io, Heroku, a small VPS, ...). Just set `DASH_HOST=0.0.0.0` and
`DASH_PASSWORD`, and run `python backend/server.py`. Render is the least-effort
free option, which is why it's the documented path.
