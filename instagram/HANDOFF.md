# Handoff: @dinero_irracional (Instagram project)

State as of 2026-10-11. Branch: `ccr-47970a53-7k0uvr`. Everything lives under `instagram/` and `.claude/agents/ig-*.md`. The rest of the repo (stock dashboard, crypto agents) is unrelated.

## The account
- **Handle:** @dinero_irracional, Spanish-language (Spain + neutral Spanish, euros). Topic: psychology of money (behavioural economics / cognitive biases), faceless.
- **Mascots:** **Chispa** (red, Kahneman's System 1: fast, impulsive) and **Pausa** (blue, System 2: slow, calm, always late, carries a mug). Both are referred to in the feminine.
- **Visual style:** «Riso» (risograph: 3 inks, grain, misregistration). Character bible: `characters/BIBLE.md`. Shared drawing library: `characters/riso/riso.js`. Animation engine: `characters/riso/anim/`.
- **Writing style rules from the owner:**
  - Fresh, clear, direct; sources on every claim.
  - Do not use «sin humo» or «dato sin humo». Use «Dato:» or «Los datos hablan por sí solos».
  - Cite the source briefly at the foot of each slide.
  - Address the reader with gender-neutral wording.
  - No investment recommendations (CNMV rules).
  - **Cover / first slide (owner rule, always):** the text of the first image of every content post does NOT mention Chispa or Pausa. It speaks to the reader and to what happens to them, in plain everyday terms (e.g. «Fuiste a por pan, pero saliste con la bolsa llena.»). The mascots may appear in the illustration. From slide 2 on, introduce Chispa as the culprit and Pausa as the antidote. The same goes for the first caption line and the Reel's first caption. Exception: the intro/pinned post (00), which exists to present the characters.
- **Owner preferences:** dislikes generic or «obviously AI» looks. Wants dynamic, scroll-proof Reels with no dead silences.

## Agents (`.claude/agents/`)
- **Art:** `ig-art-director` (bible and per-post art briefs), `ig-illustrator` (SVG to PNG via Playwright), `ig-art-critic` (scores out of 70, gives a MUST FIX list).
- **Reels:** `ig-reel-director` (storyboard), `ig-animator` (engine and MP4 via ffmpeg), `ig-reel-critic`.
- **Pipeline:** brief → illustrator/animator → critic → 1 revision round.
- **Shared library rule:** when two agents run at once, only one may edit `riso.js`; post-specific pieces go in a `props.js` inside the post's folder.

## Content status
| Item | Folder | Status |
|---|---|---|
| Post 00: intro (pinned), 9 slides | `posts/00-presentacion/` | **Final.** ZIP plus `copy.md` (caption, alt text). The owner publishes and pins it manually. |
| Post 01: supermarket, 11 slides | `posts/01-supermercado/` | **Final.** Cover reworded to speak to the reader (no Chispa/Pausa in the text). ZIP, `copy.md` (caption, alt text per slide). |
| Reel 00: intro | `reels/00-presentacion/` | **Round 3 done; sent to the owner for approval.** Silent `reel.mp4` is 37.8 s. Voice A is mixed with SFX and bed into `reel-final.mp4` (gitignored; rebuild it as shown below). Critic score 58/70; all MUST FIX items are fixed. |

### Reel 00: state and how to rebuild
- **Round 3 is closed.**
  - Critic score: 58/70.
  - Fixes applied:
    - SFX are ducked under the voice, with mix tweaks in `sfx-mix.json`.
    - Audio is 48 kHz.
    - Pausa's face on card 19 is moved left of the IG buttons.
    - Card 1 gets a hook push-in.
  - Details are in `notes.md` («Ronda 3» and «Ronda 3 · revisión»).
- **Final audio:** −14 LUFS, true peak −2.9 dBTP, no silences over 0.5 s.
- **Open nice-to-haves for a later round:**
  - Caption size jumps between cards; aim for a minimum 60 px cap height.
  - Card 4 (5.3–6.4 s) is low-motion, but passes freezedetect at default settings.
- **Rebuild the audio** from `reels/00-presentacion/`, with `$S` set to any scratch dir:
  ```
  python3 ../tools/voiceover.py vo.json --preset A --out $S/vo.wav
  python3 ../tools/sfx.py sfx-cues.json --duration 37.8 --out $S/sfx.wav --bed $S/bed.wav --tweaks sfx-mix.json
  python3 ../tools/sfx.py --mix $S/vo.wav $S/sfx.wav $S/bed.wav --video reel.mp4 --out reel-final.mp4
  ```
- **Voice:** the owner wants to change it later. `vo.json` line times match the 22 cards (one line per card).

## Pending decisions and notes for the owner
- **Voice:** current audio is synthetic (Piper). For a better voice: an ElevenLabs or Google TTS API key as an environment variable, or the owner records it.
- **Publishing:** there is no Instagram connector, so the owner uploads manually. Automating it would need a professional account, a Meta app, an `INSTAGRAM_ACCESS_TOKEN` env var and public JPEG hosting.
- **Next content candidates** (owner's calendar):
  - «7 trampas en las que cae Chispa» (index of the series);
  - the «¿100 € hoy o 110 € en una semana?» dilemma;
  - «9,99 €» left-digit Reel;
  - loss aversion.
- **Bible updates pending:**
  - lila paper only for the pinned post (bible §4);
  - add the `espiral` expression (validated on post 01, slide 6).
