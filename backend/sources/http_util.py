"""Shared HTTP helpers for all data sources.

Injects `truststore` so Python uses the OS-native certificate verifier (fixes
CERTIFICATE_VERIFY_FAILED on machines without a configured CA bundle, e.g.
fresh Python installs on Windows). Falls back gracefully if truststore is absent.
"""
from __future__ import annotations

import json as _json
import time
import urllib.error
import urllib.request

try:  # Use the OS trust store (Windows SChannel / macOS Keychain) for TLS.
    import truststore
    truststore.inject_into_ssl()
    _TRUSTSTORE = True
except Exception:  # noqa: BLE001
    _TRUSTSTORE = False

BROWSER_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def truststore_active() -> bool:
    return _TRUSTSTORE


def get_bytes(url: str, headers: dict | None = None, timeout: int = 25,
              retries: int = 3, delay: float = 1.0) -> bytes | None:
    h = {"User-Agent": BROWSER_UA}
    if headers:
        h.update(headers)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=h)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(delay * (attempt + 1) * 2)
                continue
            print(f"[http] HTTP {e.code} on {url}")
            return None
        except (urllib.error.URLError, TimeoutError) as e:
            print(f"[http] error on {url}: {e}")
            time.sleep(delay * (attempt + 1))
    return None


def get_json(url: str, headers: dict | None = None, **kw):
    raw = get_bytes(url, headers=headers, **kw)
    if raw is None:
        return None
    try:
        return _json.loads(raw.decode("utf-8", "replace"))
    except _json.JSONDecodeError as e:
        print(f"[http] bad JSON from {url}: {e}")
        return None


def get_text(url: str, headers: dict | None = None, **kw) -> str | None:
    raw = get_bytes(url, headers=headers, **kw)
    return raw.decode("utf-8", "replace") if raw is not None else None
