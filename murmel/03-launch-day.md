# $MURMEL Launch Day: Run-of-Show + Announcement Posts

> Status: **DRAFT for creator approval.** You sign every transaction and post every message yourself. Times are relative to **T = the moment you create the token on Pump.fun.** Pick a T where you can stay at your desk for 4+ hours.

## T−24h → T−1h: prep checklist

- [ ] Write down your plan for the dev buy (size in SOL) and **post it on the transparency page now**, before launch. Recommendation: keep it small and state it publicly.
- [ ] Decide your sell policy (the transparency template defaults to: 48h notice, max 1% of supply per sell). Edit it if you want something different, but publish it **before** launch.
- [ ] Token metadata ready: name `Murmel`, ticker `MURMEL`, image `art/logo.svg` exported to PNG (512×512 or larger), description:
  > *A sleepy Swiss marmot who hibernates through bear markets and wakes up whistling in bull markets. Memecoin. No utility, no roadmap, no promises. Just a marmot. 🐾*
- [ ] Socials in metadata: website, X, Telegram. **Double-check every URL.**
- [ ] Website deployed with `contractAddress: ""` (shows "not launched yet"). Have the edit ready to paste.
- [ ] Transparency page: dev wallet filled in, example rows removed, `lastUpdated` set.
- [ ] Telegram: bot running and tested; slow mode on; links only from admins; pinned message drafted (below).
- [ ] Wallet hygiene: use a dedicated dev wallet holding only what you need for launch + fees. Hardware wallet if possible. Nobody else gets the seed phrase, ever, including "helpers" and bots (including me).
- [ ] All posts below pasted into drafts with `[CA]` placeholders.
- [ ] Have someone you trust (not a paid shiller) on standby to report impersonator accounts.

## Run-of-show

| Time | Who | Action |
|---|---|---|
| T−60m | You | Final check: site loads, bot responds, links correct. Post **"1 hour" teaser** (X-1). |
| T−15m | You | Post **"15 min" teaser** (X-2). Telegram: "Launching in 15 min. Address will be pinned here, nowhere else first." |
| **T−0** | You | Create the token on Pump.fun, **signing in your own wallet**. Make the pre-announced dev buy (if any) in the same flow. |
| T+1m | You | Copy the CA **directly from Pump.fun / your wallet / Solscan**. Never retype it. Verify the first 4 and last 4 characters against Solscan. |
| T+2m | You | Telegram: post + pin the **CA message** (TG-1). |
| T+3m | You | X: post the **launch announcement** (X-3) and pin it. |
| T+5m | You | Website: set `contractAddress` and the Pump.fun link → deploy → hard-refresh and verify the address matches. |
| T+10m | You | Transparency page: log the dev buy (`launch.devBuyTokens`, `devBuySol`, `tx`). Post **X-4** (transparency receipt). |
| T+15m | You | TikTok: post the **launch video** (TT-1). It does not show the CA. |
| T+15m → T+3h | You | Community time: answer questions with the reply bank. Every 30–45 min, post one **in-character** fun post (X-5 options). Report impersonators and fake CAs. |
| Any time | You | If the bonding curve completes and the token migrates, post **X-6**. If it doesn't, that's normal; don't post anything implying it "will". |
| T+3h | You | **Wind-down post** (X-7). Telegram goodnight message. |
| T+24h | You | Day-1 recap (X-8): factual, no price brag. Update transparency page (`changelog`). |

### Things that must not happen on launch day
- No buying from second wallets, no "volume bots," no coordinated buys with friends you don't disclose.
- No paid shills without `#ad`.
- No price posts ("we're up X%", "market cap is…"). If people ask, point to Pump.fun/Solscan and let them look.
- No deleting tweets about the CA. If you make a mistake, post a correction and leave the record.
- If something goes wrong (wrong image, typo in metadata), say so plainly. Honesty is the brand.

---

## Announcement posts

### X-1 (T−60m)
> ⏰ One hour.
> Murmel's alarm has gone off.
> Murmel has hit snooze.
> Murmel will be up in 60 minutes, probably. 💤
> The contract address will only come from this account, the website, and the pinned Telegram message.

### X-2 (T−15m)
> 15 minutes. 🌄
> *yaaawn*
> Reminder: no presale, no whitelist, no early access. Anyone DMing you a "Murmel address" isn't me.

### TG-1 (pinned Telegram message, T+2m)
> 🐾 **$MURMEL is live on Pump.fun.**
>
> **Contract address:**
> `[CA]`
>
> ✅ Verify: it matches the website ([link]) and the pinned post on X ([link]).
> 🧾 Dev wallet & pre-announced sells: [transparency link]
> 🤖 The only bot here is **Murmel (bot)**, and it is a bot.
> 🚫 Admins will never DM you first. Nobody needs your seed phrase. Ever.
>
> Memecoin. No utility, no roadmap, no promises. Only spend what you'd be fine losing. Now if you'll excuse me, I've been asleep for a while. Fweeet! 🎵

### X-3 (launch announcement, pin it)
> FWEEEET! 🎵 Murmel is awake.
>
> $MURMEL is live on Pump.fun.
> CA: [CA]
>
> 🧾 Dev wallet + pre-announced sells: [transparency link]
> 🌐 [website]
>
> It's a memecoin about a sleepy Swiss marmot. No utility, no roadmap, no promises. Check the address twice, nap once. 🐾
[image: sticker-waking or sticker-whistling]

### X-4 (transparency receipt, T+10m)
> 🧾 Launch receipt:
> Dev buy: [X] SOL → [Y] $MURMEL ([Z]% of supply)
> Tx: [solscan link]
> Logged here: [transparency link]
> Any future sell gets announced at least 48h ahead. Back to sitting on my rock now.

### X-5: in-character filler options (rotate, one every 30–45 min)
- > Status report from the rock: sun is out, snacks are adequate, Steinbock is complaining. 4 fweets. 🎵
- > Someone asked me for a price prediction. I gave them a dandelion instead. It's the best I can do. 🌼
- > PSA from Sentinel Murmel: I have seen at least one fake $MURMEL already. Only trust the CA on [website]. FWEET! 🚨
- > It is 14:00. The nap departs on time. Swiss precision. Back in 20 min. 💤
- > Thank you for all the marmot drawings. I am printing them out and putting them in the burrow. (I don't have a printer. I'm a marmot.)
- > Reminder that I am not financial advice. I am a marmot in a nightcap.

### X-6 (only if the token migrates off the bonding curve)
> The bonding curve finished and $MURMEL has moved on from the Pump.fun curve. 🏔️
> Same CA: [CA]. Nothing else changes: same marmot, same transparency page, same lack of a roadmap.
> I'm celebrating with a nap.

### X-7 (wind-down, T+3h)
> Big day for a small marmot. 🌙
> Thanks to everyone who showed up, made memes, and reported fakes.
> I'm going to bed now. (Not hibernating. Just bed.)
> Everything the dev wallet does stays on [transparency link]. Uf Wiederluege. 💤

### X-8 (Day-1 recap, T+24h)
> Day 1 recap from the burrow 🐾
> • Memes made: many (thank you)
> • Fake tokens spotted & reported: [n]
> • Dev wallet sells: 0 (any future sell is announced 48h ahead)
> • Naps taken: 3, all on time
> Back to regular programming: marmot content, zero promises.

### TT-1 (TikTok launch video, 15s, no CA on screen)
- *0–3s:* Sleeping sticker under the moon. Snoring. Text: "6 months of hibernation…"
- *3–6s:* Sun rises (waking sticker), yawn sound. Text: "…and today Murmel wakes up."
- *6–10s:* Whistling sticker, whistle sound, notes float up. Text: "FWEEET."
- *10–15s:* Partying sticker, confetti. Text: "Murmel is a memecoin now. That's the whole joke. 🐾"
- *Caption:* "Murmel's awake 🌄 (memecoin, not financial advice, no promises; official links in bio)"
