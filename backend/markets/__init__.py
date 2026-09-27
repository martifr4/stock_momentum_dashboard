"""Prediction-market monitor (Polymarket + Kalshi).

Tracks macro / political / geopolitical prediction markets, detects new
markets and meaningful probability moves, and translates those moves into
directional pressure on economic sectors, industries and stocks.

Modules:
  impact_map.py  taxonomy: topics, polarity rules, sector/industry betas, regions
  classify.py    market text -> topics (+ polarity) and regions
  sources.py     Polymarket (Gamma API) + Kalshi (trade API v2) fetchers
  store.py       SQLite schema (data/markets.db)
  ingest.py      fetch -> classify -> upsert -> snapshot -> alerts
  analytics.py   changes, sector/stock impact, matrices, feeds
  seed_demo.py   synthetic data to explore the UI offline
"""
