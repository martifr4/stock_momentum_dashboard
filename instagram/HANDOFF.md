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
| Post 01: supermarket, 11 slides | `posts/01-supermercado/` | **Final** after critic round 2. ZIP plus `copy.md`. |
| Reel 00: intro | `reels/00-presentacion/` | **In progress, round 3 (pacing).** See below. |

### Reel 00: next steps
1. The owner found the 53.9 s version boring, with silences. Round-3 brief: `pacing-v3.md` and `pacing-v3.json`. The voice leads: target **37.8 s / 1134 frames**, each caption lasts its voice line plus 0.18 s, nothing static for more than 0.5 s, a pop and a camera punch on every caption change, quick cuts.
2. The animator was **stopped mid-round-3**:
   - `scene.js`, `anim/rigs.js`, `anim/captions.js`, `build.js`, `captions.srt`, `sfx-cues.json` and `notes.md` are partly updated.
   - `reel.mp4` and the covers are still the OLD 53.9 s round-2 encode (restored; the round-3 encode was interrupted). Re-render and encode needed.
   - `notes.md` already has the «Ronda 3» changelog: the 1134-frame timeline is built, `captions.srt` and `sfx-cues.json` are regenerated, and the c18 ticks are tuned.
   - Last open issue: near-static runs (e.g. about f1003–1030, card 20) must be checked against the 0.5 s rule before the final encode.
3. **To finish:**
   - Resume with `ig-animator` (render frames outside the repo).
   - Encode the silent `reel.mp4` (~37.8 s).
   - Regenerate `captions.srt` and `sfx-cues.json` against the final frames.
4. **Audio** (voice **A** is chosen for now; the owner wants to change it later):
   - Update `vo.json` line times to the new captions (one line per caption card, same 22 texts).
   - Then:
     ```
     python3 instagram/reels/tools/voiceover.py vo.json --preset A --out vo.wav
     python3 instagram/reels/tools/sfx.py sfx-cues.json --duration <dur> --out sfx.wav --bed bed.wav
     python3 instagram/reels/tools/sfx.py --mix vo.wav sfx.wav bed.wav --video reel.mp4 --out reel-final.mp4
     ```
   - Piper voices download automatically into `reels/tools/voices/` (gitignored). Needs `pip install piper-tts`.
5. Run `ig-reel-critic` on the result, do one revision round, and send the owner the MP4. Keep large MP4 variants out of git.

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
