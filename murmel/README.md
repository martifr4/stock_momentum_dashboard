# $MURMEL: launch kit (DRAFTS for creator approval)

A sleepy Swiss marmot who hibernates through bear markets and wakes up whistling in bull markets.

Everything here is a **draft**. Nothing has been posted, deployed or signed. The creator posts everything and signs every wallet transaction themselves.

| # | Deliverable | Where |
|---|---|---|
| 1 | Character bible: personality, catchphrases, running jokes, 10 meme templates, palette | [`01-character-bible.md`](01-character-bible.md) |
| 2 | Logo + 5 sticker poses (sleeping, waking, whistling, panicking, partying) | [`art/`](art/) (SVG; `build_art.py` regenerates; `preview-sheet.png` shows them all) |
| 3 | One-page website with hibernation meter (live SOL 7-day change) | [`site/index.html`](site/index.html) |
| 4 | 14-day pre-launch calendar for X + TikTok (posts, scripts, replies) | [`02-content-calendar.md`](02-content-calendar.md) |
| 5 | Launch-day run-of-show + announcement posts | [`03-launch-day.md`](03-launch-day.md) |
| 6 | Telegram bot "Murmel (bot)": persona, system prompt, runnable bot | [`telegram-bot/`](telegram-bot/) |
| 7 | Transparency page template (dev wallet, pre-announced sells, creator fees) | [`site/transparency.html`](site/transparency.html) |

## Before you publish: fill-ins and decisions

- [ ] `site/index.html` → `CONFIG`: dev wallet, links. Leave `contractAddress` empty until launch.
- [ ] `site/transparency.html` → JSON block: dev wallet, `lastUpdated`, delete the example rows, confirm `totalSupply` matches what Pump.fun shows for your token.
- [ ] **Decide your own sell policy.** The template defaults to *48h notice, max 1% of supply per sell*. Change it if you like, but publish it before launch.
- [ ] Export `art/logo.svg` to PNG for the Pump.fun token image and profile pictures. The SVGs use Fredoka text; convert text to outlines (Inkscape: Path → Object to Path) if you need pixel-identical results everywhere.
- [ ] Check TikTok's and X's current policies on crypto-related content in your country, and any local rules on promoting tokens.

## Hosting the site
It's static HTML with no build step: upload the `site/` folder to any static host (GitHub Pages, Netlify, Cloudflare Pages). The meter fetches CoinGecko from the browser, falls back to Binance, and shows a "meter is napping" state if both fail.

## Guardrails built into everything
No price, return or utility promises · no fake followers, bots posing as people or wash trading · paid promotion always `#ad` and logged · the bot is labeled as a bot · no contract address before launch · no Swiss flag/cross (protected under Swiss law).
