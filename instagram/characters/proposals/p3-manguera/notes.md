# Propuesta 3 — «Manguera»

**Style name:** Manguera (a 1930s rubber-hose cartoon in a newsreel-paper finish)
**Three adjectives:** bouncy, inky, old-fashioned (in a warm way)

## Design rationale
- **Mapi (Sistema 1) is an almond.** *Amygdala* means "almond" in Greek, but no image says that; this is a wink, not an anatomy claim. He is small and tall. His pointed tip leans forward, so the whole body reads as an arrow that is already moving. His eyes are huge, he sweats, and his folds are short, messy squiggles: an "uncombed" brain.
- **Capi (Sistema 2) is a big lobe.** He is wide, heavy and low. His top edge is scalloped, so the silhouette says "brain" even in solid black. His folds are long, tidy, meandering gyri, as if combed. Round professor glasses stick out past his contour on purpose, so they show in silhouette. He also has a bulb nose, a polka-dot bow tie, spats and a mug that is always steaming.
- **Shared construction.** Both have noodle arms (a single ink tube), four-finger gloves, big shiny shoes and pie-cut pupils. That shared kit is the only thing taken from the 1930s. Neither one has ears or a human or animal body, and neither copies any existing character.
- **Unexpected idea (the gimmick): the nerve cord.** Mapi and Capi are joined by one coiled cable, like an old telephone cord. That makes them "parts of the same brain" without any text, and it is literally a rubber hose. The cord runs from blue to red. It stays tightly coiled at Capi's calm end and goes taut where Mapi pulls. The gag is that Mapi bolts and Capi doesn't even notice the tug.
- **Second idea (avatar):** the almond sits nested in the lobe, so together they make one brain and two personalities.
- **Recurring gag props:** the street clock ("Capi llega tarde"), winged banknotes ("el dinero vuela"), the moth in the empty wallet, and the endless *ticket*.

## Palette (6 + paper)
| Rol | Hex |
|---|---|
| Papel envejecido | `#E0CDA2` (sombra de papel `#B89C6E`) |
| Tinta | `#1F1915` |
| Rojo tomate (Mapi) | `#C24A32` · oscuro `#8A2C1F` · brillo `#DD7A5C` |
| Azul acero (Capi) | `#5B7F99` · oscuro `#34526A` · brillo `#8EAABD` |
| Blanco guante (ojos, guantes, bocadillos) | `#F3EAD3` |
| Mostaza (acento: carteles, monedas) | `#D3A03E` |

Mouth and tongue (`#3B1510`, `#D8665A`) are tints of the red family. This palette deliberately avoids the old cream `#F4EEE3`, coral `#FF5A36` and Fraunces look: the paper is a darker, stained ochre, the reds are muted, and the type is a slab.

## Shape language and proportions
- **Mapi:** a vertical almond about 140 × 220 u with a pointed tip. Body and head are one shape, with the face in the upper 55 %. Legs are about 0.2 of the body height, and arms are long so they can flail. The eyes are 34 × 50 u, so the face is mostly eyes.
- **Capi:** a horizontal lobe about 240 × 215 u with a lower notch and a scalloped crown. The face sits in the front third, so he always reads as facing forward or 3/4. Legs are short and stubby. At the same scale he is about 1.6 times Mapi's mass.
- **Silhouette test:** a pointed teardrop-almond against a cloud-lobe with glasses bumps. Both pass in solid black at 150 px.

## Line and texture
- **Thick-and-thin contour.** An ink copy of the body is offset to the lower right, under a 3 px contour. That gives a heavy lower-right edge and a thin upper-left edge (light comes from the upper left).
- **Shading:** one flat tone in each colour family, as a crescent on the lower right, plus a small varnish highlight on the upper left.
- **Embossed folds:** an ink groove plus a light ridge offset to the upper left, clipped inside the body.
- **Rubber-hose limbs:** quadratic Béziers with round caps, so every arm curves (never straight lines).
- **Faces:** tapered strokes for brows, closed eyes and smiles.
- **Ink wobble:** `feDisplacementMap` with scale 2.4, so the lines don't look vector-perfect.
- **Finish:** film grain (`feTurbulence`, multiplied at 34 %), large-scale paper stains, a soft radial vignette, and a rounded black film gate around the 1080 × 1350 frames.

## Typography (Google Fonts)
- **Ultra:** fat 19th-century slab, the poster and title-card voice. Used for headlines, the wordmark, names and the shop sign.
- **Oswald 500/700:** condensed caps for speech bubbles, labels and secondary lines. It's a nod to newsreel captions.

## Reusable construction (sources)
- **`chars.js`:** `mapi(opts)` and `capi(opts)`. The same rig serves every drawing:
  - **Rig parameters:** `x, y, s` (scale), `flip`, `lean` (rotation), `sx/sy` (squash & stretch), `bend` (arc of the line of action, increasing with height).
  - **Arms and legs:** shoulder or hip to a target point, with `bend` (hose curve), `glove` (open, fist, point, hold), `aim`, `held` (props) and `back` (behind the body).
  - **Face:** `expr` sets look direction, lids and lid angle, pupil size, closed eyes (happy, shut, squeeze), brows, mouth (smile, worry, grin, scream, flat, smirk, o, calm) and `glassesDy`.
- **`props.js`:** the nerve coil, winged banknote, coin, wallet, moth, receipt ribbon, speech bubble, motion ticks, puffs, film gate and wordmark.
- **`render.js`:** the four scenes. `node render.js [hero|expressions|cover|avatar|all]` writes each `.svg` (self-contained, fonts loaded through `@import`) and its `.png`.
- **`render-lib.js`:** the Playwright rasteriser.

## How they'd move in a Reel
- **Mapi** moves on twos, fast:
  - anticipation squash (`sy` 0.85) → stretch (`sy` 1.15, `bend` +30) → smear frame;
  - a constant 2-frame tremble and sweat drops that fly off;
  - eyes that blink and pupils that shrink in alarm.
- **Capi** moves on fours, slow:
  - lids drop a frame late and rise slowly;
  - a heavy "settle" overshoot when he finally arrives;
  - the mug steam loops continuously (a 3-frame wiggle).
- **The cord is the timing device.** It stretches while Mapi runs. When it reaches full extension it goes *boing*, and Capi is pulled into frame three beats late (the late gag). The coil can also squeeze into a heart or a question mark for transitions.
- **1930s grammar:** idle "rubber-hose bounce" cycles for both, iris-out endings using the film gate, and title-card intros built with Ultra on the paper texture.
- **Rendering:** bake the grain and wobble as a looping 3-frame texture overlay. Animating `feTurbulence` per frame is expensive.

## Known weaknesses
- Pie-cut eyes plus white gloves are inherently 1930s, so the pair sits near the Fleischer, Disney and *Cuphead* family. The difference rests on non-humanoid brain bodies, no ears and the muted palette. The critic should check this.
- At a glance Mapi's almond can read as a drop or flame. The folds and the "pointed tip forward" posture carry the almond idea, but it isn't obvious without the backstory.
- Capi's face is always on the front third. Front views aren't built, so a 3/4 view is the only angle; a back or turnaround view would need extra drawing.
- The receipt says *TICKET* (Spain usage). In neutral Spanish it could be *RECIBO*.
- Fonts load from Google at render time. An offline render would fall back to system fonts.
- The pointing glove and the "hold" glove are less refined than the open and fist ones.
