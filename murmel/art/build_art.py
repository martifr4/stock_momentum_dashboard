"""Generate the $MURMEL logo and sticker poses as standalone SVG files.

Every pose is built from the same marmot parts so the character stays
on-model. Run:  python3 murmel/art/build_art.py
"""
from pathlib import Path

OUT = Path(__file__).parent

# Palette (mirrors character-bible.md)
FUR = "#9A6440"
FUR_DARK = "#6B4228"
CREAM = "#F2DDB8"
INK = "#2A1E17"
SNOOZE = "#2B3A67"
MINT = "#BDE7E0"
SNOW = "#FBF8F1"
GREEN = "#3FBF7F"
RED = "#E5484D"
GLOW = "#F59E6C"
GOLD = "#F2C14E"
MOUTH = "#7A2E2E"

S = f'stroke="{INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"'

STICKER_FILTER = f"""
  <filter id="sticker" x="-10%" y="-10%" width="120%" height="120%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="12" result="grown"/>
    <feFlood flood-color="#FFFFFF"/>
    <feComposite in2="grown" operator="in" result="outline"/>
    <feMorphology in="SourceAlpha" operator="dilate" radius="12" result="grown2"/>
    <feOffset in="grown2" dx="0" dy="8" result="shadowOff"/>
    <feFlood flood-color="{INK}" flood-opacity="0.25"/>
    <feComposite in2="shadowOff" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>"""


def svg(title, desc, inner, defs=""):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-labelledby="t d">
  <title id="t">{title}</title>
  <desc id="d">{desc}</desc>
  <defs>{STICKER_FILTER}
  <clipPath id="scene"><circle cx="256" cy="256" r="232"/></clipPath>{defs}
  </defs>
{inner}
</svg>
"""


# ---------- marmot parts ----------

def eyes(kind):
    L, R, y = 214, 298, 182
    if kind == "open":
        return "".join(
            f'<circle cx="{x}" cy="{y}" r="12" fill="{INK}"/><circle cx="{x-4}" cy="{y-5}" r="4" fill="#fff"/>'
            for x in (L, R))
    if kind == "closed":
        return "".join(f'<path d="M{x-15} {y} Q{x} {y+12} {x+15} {y}" fill="none" {S}/>' for x in (L, R))
    if kind == "happy":
        return "".join(f'<path d="M{x-15} {y+6} Q{x} {y-12} {x+15} {y+6}" fill="none" {S}/>' for x in (L, R))
    if kind == "groggy":  # left shut, right half-open
        return (f'<path d="M{L-15} {y} Q{L} {y+12} {L+15} {y}" fill="none" {S}/>'
                f'<path d="M{R-14} {y+2} A14 12 0 0 0 {R+14} {y+2} Z" fill="{INK}"/>'
                f'<path d="M{R-17} {y} L{R+17} {y}" {S}/>')
    if kind == "panic":
        return "".join(
            f'<circle cx="{x}" cy="{y-4}" r="21" fill="#fff" {S}/><circle cx="{x}" cy="{y-2}" r="5" fill="{INK}"/>'
            for x in (L, R))
    raise ValueError(kind)


def mouth(kind):
    teeth = (f'<rect x="244" y="{{y}}" width="12" height="20" rx="3" fill="#fff" stroke="{INK}" stroke-width="4"/>'
             f'<rect x="256" y="{{y}}" width="12" height="20" rx="3" fill="#fff" stroke="{INK}" stroke-width="4"/>')
    if kind == "teeth":
        return f'<path d="M256 214 V228 M236 226 Q246 234 256 228 Q266 234 276 226" fill="none" {S}/>' + teeth.format(y=231)
    if kind == "yawn":
        return f'<ellipse cx="256" cy="250" rx="19" ry="25" fill="{MOUTH}" {S}/>' + teeth.format(y=226)
    if kind == "pucker":
        return f'<path d="M256 214 V226" {S}/><circle cx="256" cy="238" r="9" fill="{MOUTH}" {S}/>'
    if kind == "scream":
        return (f'<ellipse cx="256" cy="254" rx="24" ry="30" fill="{MOUTH}" {S}/>'
                f'<ellipse cx="256" cy="272" rx="13" ry="7" fill="{GLOW}"/>' + teeth.format(y=226))
    if kind == "grin":
        return (f'<path d="M222 226 Q256 276 290 226 Z" fill="{MOUTH}" {S}/>'
                f'<path d="M238 252 Q256 266 274 252" fill="none" stroke="{GLOW}" stroke-width="8" stroke-linecap="round"/>'
                + teeth.format(y=227))
    raise ValueError(kind)


def limb(x1, y1, x2, y2):
    return (f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{INK}" stroke-width="48" stroke-linecap="round"/>'
            f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{FUR}" stroke-width="34" stroke-linecap="round"/>')


def paw(x, y):
    return f'<ellipse cx="{x}" cy="{y}" rx="24" ry="18" fill="{FUR_DARK}" {S}/>'


def arms(kind):
    if kind == "rest":
        return paw(212, 306) + paw(300, 306)
    if kind == "chest":
        return limb(178, 290, 232, 312) + limb(334, 290, 280, 312) + paw(236, 312) + paw(276, 312)
    if kind == "up":
        return limb(160, 290, 112, 150) + limb(352, 290, 400, 150) + paw(110, 140) + paw(402, 140)
    if kind == "cheeks":
        return limb(156, 300, 152, 228) + limb(356, 300, 360, 228) + paw(154, 220) + paw(358, 220)
    if kind == "party":
        return limb(352, 290, 404, 150) + paw(406, 140) + paw(212, 306)
    raise ValueError(kind)


def marmot(eye="open", mouth_kind="teeth", arm="rest", blush=True):
    parts = [
        # feet
        f'<ellipse cx="190" cy="462" rx="38" ry="18" fill="{FUR_DARK}" {S}/>',
        f'<ellipse cx="322" cy="462" rx="38" ry="18" fill="{FUR_DARK}" {S}/>',
        # body + belly
        f'<path d="M256 220 C150 220 118 320 126 390 C134 450 190 470 256 470 C322 470 378 450 386 390 C394 320 362 220 256 220 Z" fill="{FUR}" {S}/>',
        f'<ellipse cx="256" cy="378" rx="78" ry="82" fill="{CREAM}"/>',
        # ears
        f'<circle cx="174" cy="122" r="26" fill="{FUR}" {S}/><circle cx="174" cy="122" r="12" fill="{FUR_DARK}"/>',
        f'<circle cx="338" cy="122" r="26" fill="{FUR}" {S}/><circle cx="338" cy="122" r="12" fill="{FUR_DARK}"/>',
        # head
        f'<ellipse cx="256" cy="190" rx="108" ry="94" fill="{FUR}" {S}/>',
        f'<path d="M206 118 Q256 96 306 118" fill="none" stroke="{FUR_DARK}" stroke-width="10" stroke-linecap="round"/>',
        f'<ellipse cx="256" cy="230" rx="54" ry="40" fill="{CREAM}"/>',
    ]
    if blush:
        parts.append(f'<ellipse cx="190" cy="222" rx="18" ry="11" fill="{GLOW}" opacity="0.55"/>'
                     f'<ellipse cx="322" cy="222" rx="18" ry="11" fill="{GLOW}" opacity="0.55"/>')
    parts += [eyes(eye), mouth(mouth_kind),
              f'<ellipse cx="256" cy="208" rx="15" ry="10" fill="{INK}"/>',
              f'<ellipse cx="251" cy="205" rx="5" ry="3" fill="#fff" opacity="0.6"/>',
              arms(arm)]
    return "\n    ".join(parts)


# ---------- props ----------

def candle(x, top, h, color, wick=24):
    return (f'<path d="M{x+14} {top-wick} V{top+h+wick}" {S}/>'
            f'<rect x="{x}" y="{top}" width="28" height="{h}" rx="5" fill="{color}" {S}/>')


def note(x, y, scale=1.0, color=INK):
    return (f'<g transform="translate({x} {y}) scale({scale})">'
            f'<path d="M0 0 V-46 L30 -54 V-8" fill="none" stroke="{color}" stroke-width="7" stroke-linejoin="round"/>'
            f'<ellipse cx="-8" cy="2" rx="12" ry="9" fill="{color}"/><ellipse cx="22" cy="-6" rx="12" ry="9" fill="{color}"/></g>')


def mountains(fill=FUR_DARK):
    return ('<g clip-path="url(#scene)">'
            f'<path d="M30 400 L150 230 L230 330 L320 200 L482 400 Z" fill="#7FA9A2" {S}/>'
            f'<path d="M150 230 L122 270 L140 262 L156 276 L176 266 Z M320 200 L290 244 L310 236 L326 250 L346 238 Z" fill="{SNOW}" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/></g>')


def zzz():
    return (f'<text x="360" y="120" font-family="Fredoka, &quot;Baloo 2&quot;, &quot;Arial Rounded MT Bold&quot;, sans-serif" font-weight="700" fill="{SNOW}" stroke="{INK}" stroke-width="4" paint-order="stroke">'
            f'<tspan font-size="64">Z</tspan><tspan dx="6" dy="-30" font-size="46">z</tspan><tspan dx="4" dy="-26" font-size="32">z</tspan></text>')


def caption(text, y=500, size=40, fill=INK, stroke=SNOW):
    return (f'<text x="256" y="{y}" text-anchor="middle" font-family="Fredoka, &quot;Baloo 2&quot;, &quot;Arial Rounded MT Bold&quot;, sans-serif" '
            f'font-weight="700" font-size="{size}" fill="{fill}" stroke="{stroke}" stroke-width="8" paint-order="stroke">{text}</text>')


# ---------- poses ----------

def sleeping():
    inner = f"""  <g filter="url(#sticker)">
    <circle cx="256" cy="256" r="236" fill="{SNOOZE}" {S}/>
    <circle cx="120" cy="120" r="44" fill="{GOLD}"/><circle cx="142" cy="106" r="40" fill="{SNOOZE}"/>
    <circle cx="96" cy="230" r="5" fill="{SNOW}"/><circle cx="420" cy="230" r="6" fill="{SNOW}"/><circle cx="200" cy="60" r="4" fill="{SNOW}"/>
    <g transform="translate(0 -6) rotate(-8 256 300)">
    {marmot("closed", "teeth", "rest")}
    <path d="M160 132 Q250 70 340 120 Q392 160 404 222 L330 132 Z" fill="{SNOOZE}" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M150 140 Q256 92 352 132" fill="none" stroke="{SNOW}" stroke-width="22" stroke-linecap="round"/>
    <circle cx="404" cy="226" r="18" fill="{SNOW}" {S}/>
    </g>
    <path d="M30 430 Q120 380 256 400 Q392 380 482 430 Q470 470 256 488 Q42 470 30 430 Z" fill="{SNOW}" {S}/>
    {zzz()}
  </g>"""
    return svg("Murmel sleeping", "The marmot dozes in a snow burrow under a crescent moon, wearing a nightcap. Bear-market mode.", inner)


def waking():
    rays = "".join(
        f'<path d="M{400 + 70*c} {110 + 70*s} L{400 + 92*c} {110 + 92*s}" stroke="{GOLD}" stroke-width="10" stroke-linecap="round"/>'
        for c, s in [(1, 0), (0.7, 0.7), (0, 1), (-0.7, 0.7), (-1, 0), (-0.7, -0.7), (0, -1), (0.7, -0.7)])
    inner = f"""  <g filter="url(#sticker)">
    <circle cx="256" cy="256" r="236" fill="#FFE3C2" {S}/>
    {rays}<circle cx="400" cy="110" r="52" fill="{GOLD}" {S}/>
    {mountains()}
    {marmot("groggy", "yawn", "up")}
    {caption("*yaaawn*", y=500, size=44)}
  </g>"""
    return svg("Murmel waking up", "The marmot stretches both paws up and yawns, one eye open, as the sun rises over the Alps.", inner)


def whistling():
    inner = f"""  <g filter="url(#sticker)">
    <circle cx="256" cy="256" r="236" fill="{MINT}" {S}/>
    {mountains()}
    {candle(56, 250, 90, GREEN)}{candle(96, 200, 110, GREEN)}{candle(136, 150, 120, GREEN)}
    {marmot("open", "pucker", "chest")}
    {note(372, 140, 1.1)}{note(430, 80, 0.8, GREEN)}{note(330, 70, 0.7)}
  </g>"""
    return svg("Murmel whistling", "The marmot stands tall like a sentinel and whistles; music notes float up past green candles. Bull-market mode.", inner)


def panicking():
    drops = "".join(f'<path d="M{x} {y} Q{x+14} {y+24} {x} {y+30} Q{x-14} {y+24} {x} {y} Z" fill="#7CC4F0" {S}/>'
                    for x, y in [(110, 150), (402, 150), (390, 70)])
    inner = f"""  <g filter="url(#sticker)">
    <circle cx="256" cy="256" r="236" fill="#FDE2E1" {S}/>
    {candle(40, 140, 110, RED)}{candle(80, 210, 120, RED)}{candle(404, 120, 100, RED)}{candle(444, 190, 140, RED)}
    {marmot("panic", "scream", "cheeks", blush=False)}
    {drops}
    {caption("AAAAAA", y=500, size=46, fill=RED)}
  </g>"""
    return svg("Murmel panicking at red candles", "The marmot clutches its cheeks and screams, sweat flying, surrounded by red candles.", inner)


def partying():
    colors = [GREEN, GOLD, RED, "#7CC4F0", GLOW, SNOOZE]
    spots = [(70, 120, 20), (130, 70, -30), (380, 60, 40), (450, 160, -15), (60, 260, 60), (460, 300, 10),
             (100, 380, -40), (420, 410, 30), (200, 40, 15), (320, 30, -20)]
    confetti = "".join(f'<rect x="{x}" y="{y}" width="18" height="10" rx="2" fill="{colors[i % len(colors)]}" transform="rotate({r} {x} {y})"/>'
                       for i, (x, y, r) in enumerate(spots))
    inner = f"""  <g filter="url(#sticker)">
    <circle cx="256" cy="256" r="236" fill="#FFF1C9" {S}/>
    {confetti}
    {candle(60, 300, 80, GREEN)}{candle(100, 240, 110, GREEN)}
    {marmot("happy", "grin", "party")}
    <path d="M206 112 L262 4 L304 108 Z" fill="{RED}" {S}/>
    <path d="M226 72 L282 60 M240 40 L272 34" stroke="{GOLD}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="262" cy="8" r="14" fill="{GOLD}" {S}/>
    {caption("WHEEEE", y=500, size=46, fill=GREEN)}
  </g>"""
    return svg("Murmel partying", "The marmot in a party hat throws a paw in the air, grinning, surrounded by confetti and green candles.", inner)


def logo():
    defs = '<clipPath id="badge"><circle cx="256" cy="236" r="200"/></clipPath>'
    inner = f"""  <circle cx="256" cy="236" r="214" fill="{INK}"/>
  <circle cx="256" cy="236" r="200" fill="{MINT}"/>
  <g clip-path="url(#badge)">
    {mountains()}
    <g transform="translate(46 46) scale(0.82)">
    {marmot("open", "teeth", "rest")}
    </g>
  </g>
  <circle cx="256" cy="236" r="200" fill="none" stroke="{INK}" stroke-width="14"/>
  <path d="M40 392 L96 372 L96 452 L40 470 L64 430 Z" fill="{FUR_DARK}" {S}/>
  <path d="M472 392 L416 372 L416 452 L472 470 L448 430 Z" fill="{FUR_DARK}" {S}/>
  <path d="M84 372 Q256 410 428 372 L428 448 Q256 486 84 448 Z" fill="{GOLD}" {S}/>
  <text x="256" y="446" text-anchor="middle" font-family="Fredoka, &quot;Baloo 2&quot;, &quot;Arial Rounded MT Bold&quot;, sans-serif" font-weight="700" font-size="58" fill="{INK}" letter-spacing="2">$MURMEL</text>"""
    return svg("$MURMEL logo", "Round badge: a smiling Swiss marmot in front of Alpine peaks, with a gold ribbon reading $MURMEL.", inner, defs)


if __name__ == "__main__":
    for name, fn in {"logo": logo, "sticker-sleeping": sleeping, "sticker-waking": waking,
                     "sticker-whistling": whistling, "sticker-panicking": panicking,
                     "sticker-partying": partying}.items():
        (OUT / f"{name}.svg").write_text(fn())
        print("wrote", name)
