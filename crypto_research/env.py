"""Zero-dependency .env loader.

Lets you keep secrets (e.g. ``ANTHROPIC_API_KEY``) in a git-ignored ``.env`` file
at the repo root instead of exporting them every session:

    ANTHROPIC_API_KEY=sk-ant-...

``load_dotenv`` is called at the top of ``run_backtest.py`` and ``run_live.py``.
It never overrides a variable already present in the real environment (so an
environment-level secret always wins), and it silently does nothing if there is
no ``.env`` file. No third-party dependency.
"""
from __future__ import annotations

import os
from pathlib import Path


def load_dotenv(path: str | os.PathLike | None = None) -> bool:
    """Load KEY=VALUE lines from a .env file into os.environ.

    Returns True if a file was found and parsed. Existing env vars are not
    overwritten. Lines that are blank, comments (``#``), or malformed are
    skipped. Surrounding quotes on values are stripped.
    """
    env_path = Path(path) if path else Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return False
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value
    return True
