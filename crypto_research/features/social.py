"""Social / forum-presence module.

This is the honest heart of the "forum mentions" signal, and it has the same
lookahead hazard as news: a social reading is only usable at decision time T if
it was genuinely knowable at or before T.

Two sources, each used only where it is lookahead-safe:

* **Fear & Greed Index** (alternative.me, free) — a *market-wide* crypto
  sentiment gauge built partly from social-media volume/engagement, published
  **daily with UTC timestamps back to 2018**. This is genuinely backtestable.
  We additionally **lag it by ``lag_days`` (default 1)** so the value used for a
  decision at close of day T is the reading from day T-1 — a conservative
  guarantee against same-day leakage.

* **StockTwits crypto streams** (free) — real *per-coin* forum mentions and
  bull/bear tags, but only for the **current moment**. There is no free,
  reliable per-coin historical mention archive, so this is used only in
  **live/forward mode**, where "now" is unambiguous and introduces no lookahead.
  In backtests the per-coin forum signal is reported as unavailable rather than
  fabricated.

If a source is unreachable the module degrades to neutral and flags it; it never
invents a signal.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import pandas as pd
import requests

_FNG_URL = "https://api.alternative.me/fng/"
_STOCKTWITS_URL = "https://api.stocktwits.com/api/2/streams/symbol/{symbol}.json"
_HEADERS = {"User-Agent": "crypto-research/1.0"}

# Map Coinbase product ids -> StockTwits crypto symbols (live per-coin mentions).
_STOCKTWITS_SYMBOLS = {"BTC-USD": "BTC.X", "ETH-USD": "ETH.X", "SOL-USD": "SOL.X"}


@dataclass
class SocialResult:
    """Aligned social features plus explicit availability flags."""

    features: pd.DataFrame          # (date, asset) -> social_* columns
    market_available: bool          # Fear & Greed (backtestable) usable?
    per_coin_available: bool        # per-coin forum history usable? (backtest: no)
    reason: str = ""
    meta: dict = field(default_factory=dict)


# --------------------------------------------------------------------------
# Fear & Greed (backtestable, market-wide)
# --------------------------------------------------------------------------
def _fng_cache(cache_dir: Path) -> Path:
    return cache_dir / "fear_greed.parquet"


def load_fear_greed(
    start, end, cache_dir: str, refresh: bool = False,
    session: requests.Session | None = None,
) -> pd.DataFrame:
    """Load the daily Fear & Greed index as a UTC-date-indexed frame.

    Columns: ``fng_value`` (0-100 int) and ``fng_norm`` in [-1, 1] where
    ``(value - 50) / 50``. Cached to Parquet.
    """
    cache = Path(cache_dir)
    cache.mkdir(parents=True, exist_ok=True)
    path = _fng_cache(cache)
    if path.exists() and not refresh:
        df = pd.read_parquet(path)
    else:
        own = session is None
        session = session or requests.Session()
        try:
            resp = session.get(
                _FNG_URL, params={"limit": 0, "format": "json"},
                headers=_HEADERS, timeout=30,
            )
            resp.raise_for_status()
            rows = resp.json()["data"]
        finally:
            if own:
                session.close()
        df = pd.DataFrame(rows)
        df["date"] = pd.to_datetime(df["timestamp"].astype(int), unit="s", utc=True).dt.normalize()
        df["fng_value"] = df["value"].astype(int)
        df["fng_class"] = df["value_classification"]
        df = df[["date", "fng_value", "fng_class"]].set_index("date").sort_index()
        df.to_parquet(path)

    df["fng_norm"] = (df["fng_value"] - 50.0) / 50.0
    start_ts = pd.Timestamp(start).tz_localize("UTC") if pd.Timestamp(start).tzinfo is None else pd.Timestamp(start)
    end_ts = pd.Timestamp(end).tz_localize("UTC") if pd.Timestamp(end).tzinfo is None else pd.Timestamp(end)
    return df.loc[(df.index >= start_ts) & (df.index <= end_ts)]


# --------------------------------------------------------------------------
# StockTwits (live-only, per-coin)
# --------------------------------------------------------------------------
def fetch_stocktwits_mentions(
    products: list[str], session: requests.Session | None = None,
) -> dict[str, dict]:  # pragma: no cover - network, live mode only
    """Current per-coin forum activity from StockTwits (live use only).

    Returns ``{product: {mentions, bull_frac, bear_frac}}``. This is a *now*
    snapshot; it must never be used to fill historical backtest bars.
    """
    own = session is None
    session = session or requests.Session()
    out: dict[str, dict] = {}
    try:
        for product in products:
            sym = _STOCKTWITS_SYMBOLS.get(product)
            if not sym:
                continue
            try:
                resp = session.get(_STOCKTWITS_URL.format(symbol=sym), headers=_HEADERS, timeout=20)
                msgs = resp.json().get("messages", []) if resp.status_code == 200 else []
            except (requests.RequestException, ValueError):
                msgs = []
            bull = sum(1 for m in msgs if (m.get("entities", {}).get("sentiment") or {}).get("basic") == "Bullish")
            bear = sum(1 for m in msgs if (m.get("entities", {}).get("sentiment") or {}).get("basic") == "Bearish")
            n = len(msgs)
            out[product] = {
                "mentions": n,
                "bull_frac": bull / n if n else 0.0,
                "bear_frac": bear / n if n else 0.0,
            }
    finally:
        if own:
            session.close()
    return out


# --------------------------------------------------------------------------
# Assemble aligned social features for the (date, asset) frame
# --------------------------------------------------------------------------
def _expanding_z(s: pd.Series, min_periods: int = 63) -> pd.Series:
    mean = s.expanding(min_periods=min_periods).mean()
    std = s.expanding(min_periods=min_periods).std()
    return (s - mean) / std.replace(0.0, np.nan)


def build_social_features(
    feature_index: pd.MultiIndex,
    enabled: bool,
    fear_greed: bool,
    cache_dir: str,
    lag_days: int = 1,
    refresh: bool = False,
) -> SocialResult:
    """Build social features aligned to a (date, asset) MultiIndex.

    Backtest path: market-wide Fear & Greed, lagged by ``lag_days`` for a
    conservative no-lookahead guarantee, broadcast across every asset. Per-coin
    forum mentions are marked unavailable (no free lookahead-safe history).

    Columns produced: ``social_value`` (0-100), ``social_sentiment`` (-1..1),
    ``social_z`` (causal expanding z-score of sentiment).
    """
    dates = feature_index.get_level_values("date").unique().sort_values()
    empty = pd.DataFrame(
        {"social_value": np.nan, "social_sentiment": 0.0, "social_z": 0.0},
        index=feature_index,
    )
    if not enabled or not fear_greed:
        return SocialResult(
            features=empty, market_available=False, per_coin_available=False,
            reason="social disabled in config; neutral social features",
        )

    try:
        fng = load_fear_greed(dates.min(), dates.max(), cache_dir, refresh=refresh)
    except Exception as exc:  # noqa: BLE001 - degrade, never fabricate
        return SocialResult(
            features=empty, market_available=False, per_coin_available=False,
            reason=f"Fear & Greed fetch failed ({exc}); neutral social features",
        )

    # Reindex to the trading calendar, forward-fill short gaps, then LAG.
    fng_daily = fng.reindex(dates).ffill(limit=3)
    lagged_norm = fng_daily["fng_norm"].shift(lag_days)
    lagged_value = fng_daily["fng_value"].shift(lag_days)
    social_z = _expanding_z(lagged_norm)

    # Broadcast the market-wide reading across all assets.
    frame = pd.DataFrame(index=feature_index)
    date_level = feature_index.get_level_values("date")
    frame["social_value"] = lagged_value.reindex(date_level).to_numpy()
    frame["social_sentiment"] = lagged_norm.reindex(date_level).to_numpy()
    frame["social_z"] = social_z.reindex(date_level).to_numpy()
    frame["social_sentiment"] = frame["social_sentiment"].fillna(0.0)
    frame["social_z"] = frame["social_z"].fillna(0.0)

    return SocialResult(
        features=frame.sort_index(), market_available=True, per_coin_available=False,
        reason=(
            f"market-wide Fear & Greed (lag {lag_days}d) used as backtestable "
            "social signal; per-coin forum history not available for free "
            "(StockTwits per-coin mentions are live-mode only)"
        ),
        meta={"n_fng_days": int(fng_daily["fng_value"].notna().sum())},
    )
