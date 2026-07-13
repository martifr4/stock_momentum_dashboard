"""Reddit fetching via stdlib urllib.

Default path uses Reddit's public JSON endpoints (no auth, rate-limited). If
REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET are set, it uses OAuth app-only auth for
higher limits.
"""
from __future__ import annotations

import base64
import json
import time
import urllib.error
import urllib.parse
import urllib.request

import config

_token_cache: dict[str, object] = {"token": None, "expires": 0.0}


def _get_oauth_token() -> str | None:
    """Application-only OAuth token, if creds are configured."""
    if not (config.REDDIT_CLIENT_ID and config.REDDIT_CLIENT_SECRET):
        return None
    now = time.time()
    if _token_cache["token"] and float(_token_cache["expires"]) > now + 30:
        return str(_token_cache["token"])

    creds = f"{config.REDDIT_CLIENT_ID}:{config.REDDIT_CLIENT_SECRET}"
    auth = base64.b64encode(creds.encode()).decode()
    data = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode()
    req = urllib.request.Request(
        "https://www.reddit.com/api/v1/access_token",
        data=data,
        headers={
            "Authorization": f"Basic {auth}",
            "User-Agent": config.USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode())
    except urllib.error.URLError as e:
        print(f"[reddit] OAuth token request failed: {e}")
        return None
    token = payload.get("access_token")
    _token_cache["token"] = token
    _token_cache["expires"] = now + float(payload.get("expires_in", 3600))
    return token


def _base_url() -> str:
    return "https://oauth.reddit.com" if _get_oauth_token() else "https://www.reddit.com"


def _get_json(path: str, params: dict | None = None, retries: int = 3) -> dict | list | None:
    """GET a Reddit JSON endpoint with polite retry/backoff."""
    token = _get_oauth_token()
    base = "https://oauth.reddit.com" if token else "https://www.reddit.com"
    url = base + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    headers = {"User-Agent": config.USER_AGENT}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    for attempt in range(retries):
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503):
                wait = config.REQUEST_DELAY * (attempt + 1) * 2
                print(f"[reddit] {e.code} on {path}, retrying in {wait:.1f}s")
                time.sleep(wait)
                continue
            print(f"[reddit] HTTP {e.code} on {url}")
            return None
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            print(f"[reddit] error on {url}: {e}")
            time.sleep(config.REQUEST_DELAY * (attempt + 1))
    return None


def fetch_listing(subreddit: str, listing: str = "hot", limit: int = 100,
                  t: str = "day") -> list[dict]:
    """Return a list of post dicts (Reddit 't3' data) from a subreddit listing."""
    params = {"limit": min(limit, 100), "raw_json": 1}
    if listing == "top":
        params["t"] = t
    data = _get_json(f"/r/{subreddit}/{listing}.json", params)
    time.sleep(config.REQUEST_DELAY)
    if not isinstance(data, dict):
        return []
    children = data.get("data", {}).get("children", [])
    return [c["data"] for c in children if c.get("kind") == "t3"]


def fetch_comments(subreddit: str, post_id: str, limit: int = 40) -> list[dict]:
    """Return top-level comment dicts for a post."""
    params = {"limit": limit, "depth": 1, "raw_json": 1, "sort": "top"}
    data = _get_json(f"/r/{subreddit}/comments/{post_id}.json", params)
    time.sleep(config.REQUEST_DELAY)
    if not isinstance(data, list) or len(data) < 2:
        return []
    children = data[1].get("data", {}).get("children", [])
    out = []
    for c in children:
        if c.get("kind") != "t1":
            continue
        d = c.get("data", {})
        if d.get("body") and d.get("body") not in ("[deleted]", "[removed]"):
            out.append(d)
    return out


if __name__ == "__main__":
    posts = fetch_listing("stocks", "hot", 5)
    for p in posts:
        print(f"[{p.get('score'):>5}] {p.get('title')}")
