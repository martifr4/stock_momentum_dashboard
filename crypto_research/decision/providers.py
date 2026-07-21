"""LLM provider abstraction — swappable reasoning backends.

The decision combiners don't care *which* model reasons over the features, only
that they can send a system prompt + a user prompt and get text back. This module
provides that single interface across providers:

* ``anthropic``  — Claude, via the ``anthropic`` SDK and ``ANTHROPIC_API_KEY``.
* ``deepseek``   — DeepSeek, via its OpenAI-compatible endpoint and
  ``DEEPSEEK_API_KEY`` (models ``deepseek-chat`` / ``deepseek-reasoner``).
* ``openai``     — OpenAI, via the ``openai`` SDK and ``OPENAI_API_KEY``.

``get_caller`` returns ``(call, "")`` on success or ``(None, reason)`` if the
provider cannot be used (missing key or package) — so the combiners degrade
gracefully and never fabricate positions. ``call(system, prompt) -> str``.

Proxy/TLS note: in sandboxed environments outbound HTTPS may go through a proxy
with a custom CA bundle. If a provider call fails TLS verification, point the
SDK at the bundle via ``SSL_CERT_FILE`` / ``REQUESTS_CA_BUNDLE`` (see the
environment's proxy README); do not disable verification.
"""
from __future__ import annotations

import os
from typing import Callable

# provider -> (env var for the key, base_url or None for native SDK)
_OPENAI_COMPATIBLE = {
    "deepseek": ("DEEPSEEK_API_KEY", "https://api.deepseek.com"),
    "openai": ("OPENAI_API_KEY", None),  # default OpenAI base url
}


def _anthropic_caller(model: str, max_tokens: int, temperature: float):
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return None, "ANTHROPIC_API_KEY not set"
    try:
        import anthropic  # noqa: PLC0415
    except ImportError:
        return None, "anthropic package not installed (pip install anthropic)"
    client = anthropic.Anthropic(api_key=key)

    def call(system: str, prompt: str) -> str:
        msg = client.messages.create(
            model=model, max_tokens=max_tokens, temperature=temperature,
            system=system, messages=[{"role": "user", "content": prompt}],
        )
        return "".join(b.text for b in msg.content if b.type == "text")

    return call, ""


def _openai_compatible_caller(
    provider: str, model: str, max_tokens: int, temperature: float,
):
    key_env, base_url = _OPENAI_COMPATIBLE[provider]
    key = os.environ.get(key_env)
    if not key:
        return None, f"{key_env} not set"
    try:
        from openai import OpenAI  # noqa: PLC0415
    except ImportError:
        return None, "openai package not installed (pip install openai)"
    client = OpenAI(api_key=key, base_url=base_url) if base_url else OpenAI(api_key=key)

    def call(system: str, prompt: str) -> str:
        resp = client.chat.completions.create(
            model=model, max_tokens=max_tokens, temperature=temperature,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            # Both prompts instruct "respond ONLY with JSON"; ask for JSON mode
            # so parsing is reliable across OpenAI-compatible providers.
            response_format={"type": "json_object"},
        )
        return resp.choices[0].message.content or ""

    return call, ""


def get_caller(
    provider: str, model: str, max_tokens: int, temperature: float,
) -> tuple[Callable[[str, str], str] | None, str]:
    """Return ``(call, "")`` for the provider, or ``(None, reason)`` if unusable."""
    provider = (provider or "anthropic").lower()
    if provider == "anthropic":
        return _anthropic_caller(model, max_tokens, temperature)
    if provider in _OPENAI_COMPATIBLE:
        return _openai_compatible_caller(provider, model, max_tokens, temperature)
    return None, f"unknown provider '{provider}' (use anthropic|deepseek|openai)"
