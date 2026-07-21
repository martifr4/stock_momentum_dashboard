"""
datasources.py — all external data fetching, no API keys required.

Sources used (all free, no auth):
  - CoinGecko public API: price history, market data, global market stats
  - Alternative.me: Crypto Fear & Greed index
  - CoinDesk / CoinTelegraph RSS: recent news headlines for sentiment

If any source fails, callers get None / empty and degrade gracefully.
"""

import time
import requests

CG = "https://api.coingecko.com/api/v3"
FNG = "https://api.alternative.me/fng/"
NEWS_FEEDS = [
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://cointelegraph.com/rss",
]

HEADERS = {"User-Agent": "crypto-agent/1.0 (research)"}
PAUSE = 1.5


def _get(url, **params):
    r = requests.get(url, params=params or None, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r


# ---------------------------------------------------------------- market data
def resolve_coin(pair_base):
    """Map a base symbol like 'BTC' to a CoinGecko id like 'bitcoin'."""
    r = _get(f"{CG}/coins/markets", vs_currency="usd",
             order="market_cap_desc", per_page=250, page=1, sparkline="false")
    for c in r.json():
        if c["symbol"].upper() == pair_base.upper():
            return c["id"], c
    raise ValueError(f"Could not resolve base symbol '{pair_base}' on CoinGecko")


def price_history(coin_id, days=200):
    r = _get(f"{CG}/coins/{coin_id}/market_chart",
             vs_currency="usd", days=days, interval="daily")
    data = r.json()
    prices = [p[1] for p in data["prices"]]
    volumes = [v[1] for v in data["total_volumes"]]
    return prices, volumes


def global_market():
    """Return global crypto market stats (total mcap, 24h change, BTC dominance)."""
    r = _get(f"{CG}/global")
    d = r.json()["data"]
    return {
        "total_mcap_usd": d["total_market_cap"]["usd"],
        "mcap_change_24h": d.get("market_cap_change_percentage_24h_usd"),
        "btc_dominance": d["market_cap_percentage"].get("btc"),
        "active_cryptos": d.get("active_cryptocurrencies"),
    }


# ---------------------------------------------------------------- sentiment
def fear_greed(limit=6):
    """Return list of {value:int, classification:str, ts:int}, newest first."""
    try:
        r = _get(FNG, limit=limit)
        out = []
        for row in r.json()["data"]:
            out.append({
                "value": int(row["value"]),
                "classification": row["value_classification"],
                "ts": int(row["timestamp"]),
            })
        return out
    except Exception:
        return []


def news_headlines(max_items=40):
    """Fetch recent headlines from crypto RSS feeds. Returns list of dicts."""
    import xml.etree.ElementTree as ET
    from email.utils import parsedate_to_datetime

    items = []
    for feed in NEWS_FEEDS:
        try:
            r = requests.get(feed, headers=HEADERS, timeout=30)
            r.raise_for_status()
            root = ET.fromstring(r.content)
            for item in root.iter("item"):
                title = item.findtext("title") or ""
                desc = item.findtext("description") or ""
                pub = item.findtext("pubDate")
                try:
                    ts = parsedate_to_datetime(pub).timestamp() if pub else None
                except Exception:
                    ts = None
                items.append({"title": title.strip(),
                              "desc": desc.strip(), "ts": ts})
            time.sleep(PAUSE)
        except Exception:
            continue
    items.sort(key=lambda x: x["ts"] or 0, reverse=True)
    return items[:max_items]
