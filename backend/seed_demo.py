"""Seed the database with realistic DEMO data spanning ~400 days.

This lets you explore the dashboard (including weekly/monthly/yearly views)
before wiring up live Reddit access. It is clearly-labelled synthetic data --
run `python backend/seed_demo.py --wipe` to remove it, then use real ingestion.

Usage:
    python backend/seed_demo.py           # add demo data
    python backend/seed_demo.py --wipe     # delete ALL data first, then seed
"""
from __future__ import annotations

import math
import random
import sys
import time

import db
import sentiment
from config import SUBREDDITS

random.seed(42)

# ticker -> (base daily popularity, trend slope over the year, vibe bias)
TICKERS = {
    "NVDA": (9.0, 1.8, 0.5), "TSLA": (8.0, -0.6, -0.1), "AAPL": (6.0, 0.3, 0.2),
    "AMD": (5.0, 0.6, 0.3), "PLTR": (4.5, 1.4, 0.4), "SPY": (5.5, 0.2, 0.0),
    "MSFT": (4.0, 0.4, 0.25), "GME": (3.0, -0.3, 0.1), "AMZN": (3.5, 0.3, 0.2),
    "META": (3.2, 0.5, 0.25), "SMCI": (2.5, -1.2, -0.2), "COIN": (2.8, 0.9, 0.1),
    "MSTR": (2.6, 1.1, 0.2), "SOFI": (2.0, 0.4, 0.15), "HOOD": (1.8, 0.7, 0.2),
    "QQQ": (3.0, 0.3, 0.1), "GOOGL": (2.4, 0.3, 0.2), "MU": (1.6, 0.5, 0.15),
    "ARM": (1.5, 0.6, 0.2), "INTC": (2.0, -0.8, -0.3), "BA": (1.4, -0.5, -0.2),
    "F": (1.2, -0.2, -0.1), "RIVN": (1.3, -0.4, -0.1), "AVGO": (1.7, 0.7, 0.3),
    "TSM": (1.6, 0.6, 0.3), "MARA": (1.4, 0.5, 0.0), "NFLX": (1.5, 0.4, 0.2),
}

BULL_TEMPLATES = [
    "{t} is going to the moon, loading up on calls",
    "Why {t} is massively undervalued right now",
    "{t} earnings beat, this is bullish AF",
    "Just went all in on {t}, diamond hands",
    "{t} breakout confirmed, strong momentum",
    "{t} up big today, tendies incoming",
    "DD: {t} has huge growth ahead, buying more",
    "{t} printing, best stock in my portfolio",
]
BEAR_TEMPLATES = [
    "{t} is overvalued, buying puts",
    "{t} looks weak, this is a bull trap",
    "Why I'm shorting {t} here",
    "{t} crashing after guidance cut, bearish",
    "Sold all my {t}, this is going to drop",
    "{t} bubble is about to pop, avoid",
    "{t} bagholders in denial, downgrade incoming",
]
NEUTRAL_TEMPLATES = [
    "Thoughts on {t} at these levels?",
    "Is {t} a hold or should I trim?",
    "{t} technical analysis for this week",
    "What's the deal with {t} lately?",
    "{t} options flow discussion",
]


def _make_text(ticker: str, bias: float) -> tuple[str, float]:
    r = random.random() + bias * 0.25
    if r > 0.62:
        tpl = random.choice(BULL_TEMPLATES)
    elif r < 0.30:
        tpl = random.choice(BEAR_TEMPLATES)
    else:
        tpl = random.choice(NEUTRAL_TEMPLATES)
    text = tpl.format(t=ticker)
    return text, sentiment.score(text)


def seed(days: int = 400) -> None:
    db.init_db()
    now = int(time.time())
    day = 86400
    rows_posts = []
    rows_mentions = []
    counter = 0

    for d in range(days):
        day_start = now - d * day
        # recency factor: more activity in recent days (momentum feel)
        recency = 1.0 + max(0.0, (60 - d) / 60.0) * 1.5 if d < 60 else 1.0
        for ticker, (base, trend, bias) in TICKERS.items():
            # popularity evolves: trend across the year + weekly noise
            frac = (days - d) / days
            pop = max(0.1, base * (0.5 + frac * (1 + trend)) * recency)
            n = max(0, int(random.gauss(pop, pop * 0.5)))
            for _ in range(min(n, 25)):
                counter += 1
                created = day_start - random.randint(0, day - 1)
                text, sent = _make_text(ticker, bias)
                score = int(abs(random.gauss(40, 120)))
                weight = 1.0 + math.log1p(score)
                sub = random.choice(SUBREDDITS)
                pid = f"demo_{counter}"
                rows_posts.append((
                    pid, "demo", sub, "post", text, "", "demo_user",
                    "https://reddit.com/r/%s" % sub, score,
                    random.randint(0, 200), created, sent, now,
                ))
                rows_mentions.append((
                    ticker, pid, "demo", sub, "post", sent, weight, created,
                ))

    with db.cursor() as cur:
        cur.executemany(
            """INSERT OR IGNORE INTO posts
               (id, source, subreddit, kind, title, body, author, permalink, score,
                num_comments, created_utc, sentiment, fetched_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""", rows_posts)
        cur.executemany(
            """INSERT OR IGNORE INTO mentions
               (ticker, post_id, source, subreddit, kind, sentiment, weight, created_utc)
               VALUES (?,?,?,?,?,?,?,?)""", rows_mentions)
        cur.execute(
            "INSERT INTO ingest_runs (started_at, finished_at, posts_seen, mentions, note) VALUES (?,?,?,?,?)",
            (now, now, len(rows_posts), len(rows_mentions), "DEMO SEED"))

    print(f"Seeded {len(rows_mentions)} demo mentions across {days} days.")


def wipe() -> None:
    db.init_db()
    with db.cursor() as cur:
        cur.execute("DELETE FROM mentions")
        cur.execute("DELETE FROM posts")
        cur.execute("DELETE FROM ingest_runs")
    print("Wiped all data.")


if __name__ == "__main__":
    if "--wipe" in sys.argv:
        wipe()
    seed()
