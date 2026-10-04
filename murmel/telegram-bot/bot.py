"""Murmel (bot): an in-character, clearly labeled Telegram bot for $MURMEL.

- Replies only when spoken to: in DMs, or in groups when @mentioned or replied to.
  It never messages anyone first.
- Every reply starts with a "🤖" marker so it can never pass as a person.
- Contract and wallet addresses come only from config (/ca, /dev). Any address-like
  string in a model reply is stripped, so the model can't post a fake CA.
- No conversation memory: each message is answered on its own.

Env vars:
  TELEGRAM_BOT_TOKEN   from @BotFather
  ANTHROPIC_API_KEY    Claude API key
  MURMEL_CA            contract address (leave empty before launch)
  MURMEL_DEV_WALLET    public dev wallet
  MURMEL_WEBSITE       e.g. https://murmel.example
  MURMEL_MODEL         optional, defaults to claude-opus-5-5
"""
import asyncio
import json
import logging
import os
import re
import time
import urllib.request
from pathlib import Path

import anthropic
from telegram import Update
from telegram.constants import ChatType
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("murmel-bot")

CA = os.environ.get("MURMEL_CA", "").strip()
DEV = os.environ.get("MURMEL_DEV_WALLET", "").strip()
SITE = os.environ.get("MURMEL_WEBSITE", "").strip().rstrip("/")
MODEL = os.environ.get("MURMEL_MODEL", "claude-opus-5-5")
SYSTEM = (Path(__file__).parent / "system_prompt.md").read_text()

TAG = "🤖 "
COOLDOWN_S = 10
MAX_INPUT_CHARS = 800
BASE58_ADDR = re.compile(r"\b[1-9A-HJ-NP-Za-km-z]{32,44}\b")

client = anthropic.AsyncAnthropic()
last_seen: dict[int, float] = {}


def say(text: str) -> str:
    return text if text.startswith(TAG) else TAG + text


def scrub_addresses(text: str) -> str:
    return BASE58_ADDR.sub("[use /ca or /dev for addresses]", text)


# ---------- commands ----------

async def start(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(say(
        "Grüezi! I'm Murmel (bot): an automated bot that talks like a sleepy Swiss marmot. "
        "I'm not a person and not the dev.\n\n"
        "I can't give financial advice or price predictions. I'm a cartoon marmot.\n\n"
        "/ca  contract address\n/dev  dev wallet\n/transparency  sells & creator fees\n"
        "/meter  is Murmel awake?\n/rules  safety rules\n\n"
        "Admins never DM first. Nobody needs your seed phrase. 🐾"))


async def ca(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    if not CA:
        await update.message.reply_text(say(
            "No contract address yet. Murmel hasn't launched. Anyone posting one now isn't us. 💤"))
        return
    await update.message.reply_text(say(
        f"The official $MURMEL contract address:\n{CA}\n\n"
        f"Check it matches the website{(' (' + SITE + ')') if SITE else ''} and the pinned message. "
        "Check the address twice, nap once. 🐾"))


async def dev(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(say(
        f"Public dev wallet:\n{DEV or '(not set yet)'}\n\n"
        "Any sell from it is announced at least 48 hours in advance on the transparency page (/transparency)."))


async def transparency(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    link = f"{SITE}/transparency.html" if SITE else "the transparency page on the website"
    await update.message.reply_text(say(
        f"Dev wallet, pre-announced sells, creator-fee income and any paid promos are all logged here: {link} 🧾"))


async def rules(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(say(
        "Burrow rules 🏔️\n"
        "1. Admins never DM you first. 'Support' DMs are scams.\n"
        "2. Nobody needs your seed phrase or private key. Ever.\n"
        "3. Only trust the contract address from /ca, the website, or the pinned post.\n"
        "4. No price predictions, no shilling, no raids. Be nice.\n"
        "5. Memecoin = no utility, no promises. Only spend what you could lose entirely."))


_meter_cache: tuple[float, tuple[float, float]] | None = None


def _sol_7d() -> tuple[float, float]:
    """SOL price and 7-day % change from CoinGecko, cached 5 min to respect rate limits."""
    global _meter_cache
    if _meter_cache and time.monotonic() - _meter_cache[0] < 300:
        return _meter_cache[1]
    req = urllib.request.Request(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=solana&price_change_percentage=7d",
        headers={"User-Agent": "murmel-bot/1.0", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=8) as r:
        c = json.load(r)[0]
    result = (c["current_price"], c["price_change_percentage_7d_in_currency"])
    _meter_cache = (time.monotonic(), result)
    return result


async def meter(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        price, ch7 = await asyncio.to_thread(_sol_7d)
    except Exception:
        log.exception("meter fetch failed")
        await update.message.reply_text(say("The meter is napping (price feed unreachable). Me too. 💤"))
        return
    if ch7 < -10:
        mood = "PANIC 😱 …okay, blanket. Back in the burrow."
    elif ch7 < -2:
        mood = "Hibernating 💤 Wake me when it's green."
    elif ch7 <= 2:
        mood = "Drowsy 🥱 *yaaawn* Is it spring?"
    elif ch7 <= 10:
        mood = "Awake and whistling 🎵 Fweeet!"
    else:
        mood = "Meadow party 🎉 (still wearing the nightcap)"
    await update.message.reply_text(say(
        f"Hibernation meter: SOL is {ch7:+.1f}% over 7 days (${price:,.2f}).\nMurmel's state: {mood}\n\n"
        "This measures SOL, not $MURMEL. It's a joke, not a signal."))


# ---------- free-text chat ----------

def addressed_to_bot(update: Update, bot_username: str, bot_id: int) -> bool:
    msg = update.message
    if update.effective_chat.type == ChatType.PRIVATE:
        return True
    if msg.reply_to_message and msg.reply_to_message.from_user and msg.reply_to_message.from_user.id == bot_id:
        return True
    return f"@{bot_username}".lower() in (msg.text or "").lower()


async def chat(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.message.text:
        return
    if not addressed_to_bot(update, context.bot.username, context.bot.id):
        return

    uid = update.effective_user.id
    now = time.monotonic()
    if now - last_seen.get(uid, 0) < COOLDOWN_S:
        return  # quietly ignore rapid-fire messages
    last_seen[uid] = now

    text = update.message.text.replace(f"@{context.bot.username}", "").strip()[:MAX_INPUT_CHARS]
    if not text:
        text = "Hi!"

    try:
        response = await client.beta.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM,
            output_config={"effort": "low"},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            messages=[{"role": "user", "content": text}],
        )
    except anthropic.RateLimitError:
        await update.message.reply_text(say("Too many marmots talking at once. Try again in a minute. 💤"))
        return
    except anthropic.APIError:
        log.exception("Claude API error")
        await update.message.reply_text(say("My burrow Wi-Fi dropped out. Try again later. 🏔️"))
        return

    if response.stop_reason == "refusal":
        await update.message.reply_text(say("I'm just a marmot. I'll sit this one out. 🐾"))
        return

    reply = "".join(b.text for b in response.content if b.type == "text").strip()
    if not reply:
        reply = "*yawn* Sorry, I dozed off. Could you ask again? 💤"
    await update.message.reply_text(say(scrub_addresses(reply)))


def main() -> None:
    app = Application.builder().token(os.environ["TELEGRAM_BOT_TOKEN"]).build()
    for name, fn in [("start", start), ("help", start), ("ca", ca), ("dev", dev),
                     ("transparency", transparency), ("rules", rules), ("meter", meter)]:
        app.add_handler(CommandHandler(name, fn))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, chat))
    log.info("Murmel (bot) starting with model %s", MODEL)
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
