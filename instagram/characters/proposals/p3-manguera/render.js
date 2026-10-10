// «Manguera» — scenes + render. Usage: node render.js [hero|expressions|cover|avatar|all]
// Writes <name>.svg (self-contained, fonts via Google Fonts @import) and <name>.png next to this file.
const path = require('path');
const { C, mapi, capi, defs, paperBg, filmFx, FONTS, stroke, taper, sweat, steam, mug } = require('./chars.js');
const P = require('./props.js');
const { render, done, writeSvg } = require('./render-lib.js');
const OUT = __dirname;

const svgDoc = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>${FONTS}</style>${defs(w, h)}${inner}</svg>`;

// ------------------------------------------------------------------ HERO
// «Capi siempre llega tarde»: Mapi se lanza a las rebajas tirando del cable que los une;
// Capi, plantado con su café, no se ha movido ni un centímetro.
function hero() {
  const W = 1080, H = 1350;
  const ground = 1168;
  // sunburst behind the sign
  let rays = '';
  for (let i = 0; i < 18; i++) {
    const a0 = (i * 20) * Math.PI / 180, a1 = (i * 20 + 10) * Math.PI / 180, cx = 790, cy = 300, R = 900;
    rays += `<path d="M${cx} ${cy} L${cx + Math.cos(a0) * R} ${cy + Math.sin(a0) * R} L${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R}Z" fill="${C.paperDk}" opacity=".22"/>`;
  }
  const sign = `<g transform="translate(756 262) rotate(-5)">
    ${stroke('M-150 -150 L-130 -78', 3)}${stroke('M150 -150 L130 -78', 3)}
    <path d="M-196 -76 C-120 -86 120 -86 196 -76 C204 -10 204 50 196 92 C120 102 -120 102 -196 92 C-204 40 -204 -20 -196 -76Z" fill="${C.ink}" transform="translate(6 8)"/>
    <path d="M-196 -76 C-120 -86 120 -86 196 -76 C204 -10 204 50 196 92 C120 102 -120 102 -196 92 C-204 40 -204 -20 -196 -76Z" fill="${C.mustard}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M-180 -62 C-100 -70 100 -70 180 -62 C186 -10 186 40 180 78 C100 86 -100 86 -180 78 C-186 30 -186 -20 -180 -62Z" fill="none" stroke="${C.ink}" stroke-width="2" opacity=".55"/>
    <text x="4" y="22" text-anchor="middle" font-family="Ultra" font-size="58" fill="${C.ink}">¡REBAJAS!</text>
    <text x="0" y="18" text-anchor="middle" font-family="Ultra" font-size="58" fill="${C.red}">¡REBAJAS!</text>
    <g transform="translate(160 100) rotate(12)"><circle r="44" fill="${C.ink}" transform="translate(4 5)"/><circle r="44" fill="${C.red}" stroke="${C.ink}" stroke-width="3.5"/>
    <text y="11" text-anchor="middle" font-family="Ultra" font-size="25" fill="${C.glove}">−70 %</text></g>
    ${P.ticks(-10, 6, 210, 0)}</g>`;

  // Mapi: mid-leap, stretched along an arcing line of action
  const mx = 640, my = 770;
  const m = mapi({
    x: mx, y: my, s: 1.5, lean: 18, sx: 0.9, sy: 1.12, bend: 34,
    expr: { look: [0.6, -0.5], mouth: 'grin', brow: [-8, 8], pupil: 0.92 },
    arms: [
      { x: -150, y: -70, bend: 30, glove: 'open', back: true, thumb: 1 },
      { x: 178, y: -236, bend: 36, glove: 'open', thumb: -1 },
    ],
    legs: [{ x: -34, y: 96, bend: -34, rot: 34, dir: -1 }, { x: 80, y: 36, bend: 40, rot: -20, dir: 1 }],
    sweat: [[-84, -196, 1.1, -30], [-104, -150, 0.85, -50]],
  });
  const capiPos = { x: 300, y: 1108, s: 1.5 };
  const A = [capiPos.x - 44 * 1.5, capiPos.y - 200 * 1.5]; // top-back of Capi
  const B = [mx - 6, my - 4];
  const cord = P.coil(A, B, [360, 640], { loops: 13, r: 15, k: 0.75, w: 8 });

  const c = capi({
    ...capiPos,
    expr: { look: [0.55, -0.75], lid: 0.42, lidRot: 4, brow: [10, 4], browR: [-4, 10], mouth: 'flat', mx: 2 },
    arms: [
      { x: -116, y: -34, bend: 34, glove: 'fist', back: false, thumb: 1 },
      { x: 150, y: -52, bend: 30, glove: 'hold', held: `<g transform="translate(36 -2)">${mug({ steam: true })}</g>` },
    ],
    legs: [{ x: -14, y: 40, bend: -6, dir: -1 }, { x: 58, y: 40, bend: 6, dir: 1 }],
  });

  const money = P.bill(960, 520, -14, 1.3, 10) + P.bill(880, 640, 16, 1.1, -12) + P.bill(990, 680, -6, 0.9, 6) + P.coin(930, 450, 1.2, 0) + P.coin(1010, 600, 0.9, 0);
  const groundSvg = `<rect x="0" y="${ground}" width="${W}" height="${H - ground}" fill="${C.paperDk}" opacity=".45"/>${taper(40, ground, 540, ground + 2, 1040, ground, 2.6)}
    <ellipse cx="300" cy="${ground + 4}" rx="190" ry="16" fill="${C.ink}" opacity=".22"/>
    <ellipse cx="700" cy="${ground + 4}" rx="70" ry="9" fill="${C.ink}" opacity=".16"/>`;
  const fx = P.taper(600, 1128, 600, 1010, 646, 920, 3) + P.taper(640, 1132, 646, 1020, 690, 930, 2.4) + P.puff(590, ground - 10, 1.15) + P.puff(660, ground - 4, 0.7);

  const bubM = P.bubble(300, 300, 300, 104, [560, 470], ['¡YA, YA, YA!'], { size: 50, rot: -6 });
  const bubC = P.bubble(70, 590, 250, 92, [230, 752], ['Mapi, no.'], { size: 46, rot: 3, tailW: 18 });
  const late = `<text x="540" y="${ground + 96}" text-anchor="middle" font-family="Oswald" font-weight="500" font-size="30" fill="${C.ink}" letter-spacing="3">(CAPI LLEGA TARDE. COMO SIEMPRE.)</text>`;

  const inner = `${paperBg(W, H)}${rays}${groundSvg}
  <g filter="url(#wobble)">${sign}${cord}${c}${fx}${m}${money}${bubM}${bubC}</g>
  ${late}
  ${P.wordmark(80, 96, 0.82)}
  ${filmFx(W, H)}${P.filmGate(W, H)}`;
  return { svg: svgDoc(W, H, inner), W, H };
}

// ------------------------------------------------------------------ EXPRESSIONS
function plaque(x, y, text, col) {
  const w = text.length * 15 + 44;
  return `<g transform="translate(${x} ${y})"><rect x="${-w / 2 + 3}" y="-21" width="${w}" height="42" rx="21" fill="${C.ink}"/>
    <rect x="${-w / 2}" y="-24" width="${w}" height="42" rx="21" fill="${col}" stroke="${C.ink}" stroke-width="3"/>
    <text y="7" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="24" letter-spacing="1.5" fill="${C.glove}">${text.toUpperCase()}</text></g>`;
}
function rowTitle(x, y, name, sub, col) {
  return `<text x="${x}" y="${y}" font-family="Ultra" font-size="40" fill="${col}">${name}</text>
    <text x="${x + name.length * 31 + 18}" y="${y - 4}" font-family="Oswald" font-weight="500" font-size="26" letter-spacing="2" fill="${C.ink}">${sub}</text>
    ${taper(x, y + 16, 520, y + 19, 1010, y + 14, 2)}`;
}
function expressions() {
  const W = 1080, H = 1350, cols = [172, 418, 664, 910];
  const my = 524, cy = 1052, cs = 0.74;
  const M = [
    mapi({ x: cols[0], y: my, s: 0.96, expr: { look: [0.15, 0.05] }, sweat: [[78, -196, 0.8, 20]],
      arms: [{ x: -78, y: -14, bend: -22, glove: 'open' }, { x: 78, y: -18, bend: 22, glove: 'open' }] }),
    mapi({ x: cols[1], y: my, s: 0.96, sx: 0.86, sy: 1.12, expr: { look: [0, -0.1], pupil: 0.55, mouth: 'scream', brow: [14, 12], blush: false },
      arms: [{ x: -62, y: -170, bend: 34, glove: 'open', thumb: -1 }, { x: 62, y: -174, bend: -34, glove: 'open', thumb: 1 }],
      legs: [{ x: -18, y: 46, bend: 16, dir: -1 }, { x: 16, y: 46, bend: -16, dir: 1 }],
      sweat: [[-84, -200, 1, -30], [86, -206, 1, 30], [-92, -130, 0.8, -60], [94, -140, 0.7, 60]],
      front: P.ticks(cols[1], my - 118, 112, 5, 215, 110) }),
    mapi({ x: cols[2], y: my, s: 0.96, sx: 1.07, sy: 0.92, bend: 10, expr: { closed: 'happy', mouth: 'grin' },
      arms: [{ x: -100, y: -196, bend: 30, glove: 'open', thumb: -1 }, { x: 100, y: -196, bend: -30, glove: 'open', thumb: 1 }],
      legs: [{ x: -44, y: 36, bend: 14, rot: -16, dir: -1 }, { x: 40, y: 40, bend: -14, rot: 10, dir: 1 }] }),
    mapi({ x: cols[3], y: my, s: 0.96, lean: -5, expr: { look: [-0.75, 0.1], lid: 0.42, lidR: 0.12, lidRot: -8, brow: [-6, -2], browR: [-14, 12], mouth: 'smirk', mx: 4 },
      arms: [{ x: -62, y: -34, bend: 56, glove: 'fist', thumb: -1 }, { x: 60, y: -38, bend: -56, glove: 'fist', thumb: 1 }] }),
  ];
  const Cp = [
    capi({ x: cols[0] - 16, y: cy, s: cs, expr: {},
      arms: [{ x: -112, y: -20, bend: -10, glove: 'open', back: true }, { x: 128, y: -36, bend: 24, glove: 'hold', held: `<g transform="translate(36 -2)">${mug()}</g>` }] }),
    capi({ x: cols[1] - 16, y: cy, s: cs, sx: 0.95, sy: 1.08, expr: { lid: 0, pupil: 0.8, look: [0.1, -0.2], brow: [-6, 12], mouth: 'grin', glassesDy: -5, mx: -2 },
      arms: [{ x: -128, y: -230, bend: -30, glove: 'open', thumb: -1 }, { x: 136, y: -262, bend: 26, glove: 'hold', held: `<g transform="translate(36 -2) rotate(-8)">${mug()}</g>` }],
      legs: [{ x: -24, y: 40, bend: -10, dir: -1 }, { x: 70, y: 40, bend: 10, dir: 1 }] }),
    capi({ x: cols[2] - 16, y: cy, s: cs, lean: 4, expr: { closed: 'happy', mouth: 'smile', brow: [6, 4] },
      arms: [{ x: -110, y: -16, bend: -10, glove: 'open', back: true }, { x: 124, y: -34, bend: 24, glove: 'hold', held: `<g transform="translate(36 -2)">${mug()}</g>` }] }),
    capi({ x: cols[3] - 16, y: cy, s: cs, lean: -3, expr: { look: [-0.9, -0.1], lid: 0.55, lidR: 0.22, brow: [10, -2], browR: [-12, 14], mouth: 'flat' },
      arms: [{ x: -112, y: -20, bend: -10, glove: 'fist', back: true }, { x: 92, y: -52, bend: -40, glove: 'point', aim: -112, thumb: 1, sc: 0.95 }] }),
  ];
  const labsM = ['Neutral', '¡Alarma!', 'Feliz', '¿En serio?'], labsC = ['Neutral', '¡Euforia!', 'Feliz', '¿En serio?'];
  const inner = `${paperBg(W, H)}
    <text x="540" y="128" text-anchor="middle" font-family="Ultra" font-size="52" fill="${C.ink}">Hoja de expresiones</text>
    ${rowTitle(70, 200, 'Mapi', 'SISTEMA 1 · RÁPIDO', C.red)}
    ${rowTitle(70, 740, 'Capi', 'SISTEMA 2 · LENTO', C.blueDk)}
    <g filter="url(#wobble)">${M.join('')}${Cp.join('')}</g>
    ${labsM.map((l, i) => plaque(cols[i], 640, l, C.redDk)).join('')}
    ${labsC.map((l, i) => plaque(cols[i], 1166, l, C.blueDk)).join('')}
    <text x="540" y="1250" text-anchor="middle" font-family="Oswald" font-weight="500" font-size="22" letter-spacing="3" fill="${C.ink}" opacity=".8">DINERO IRRACIONAL · PROPUESTA «MANGUERA»</text>
    ${filmFx(W, H)}${P.filmGate(W, H)}`;
  return { svg: svgDoc(W, H, inner), W, H };
}

// ------------------------------------------------------------------ COVER
function cover() {
  const W = 1080, H = 1350, ground = 1172;
  let rays = '';
  for (let i = 0; i < 24; i++) {
    const a0 = (i * 15) * Math.PI / 180, a1 = (i * 15 + 7.5) * Math.PI / 180, cx = 540, cy = 760, R = 1100;
    rays += `<path d="M${cx} ${cy} L${cx + Math.cos(a0) * R} ${cy + Math.sin(a0) * R} L${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R}Z" fill="${C.red}" opacity=".13"/>`;
  }
  const title = `
    <text x="540" y="300" text-anchor="middle" font-family="Ultra" font-size="168" fill="${C.ink}" transform="translate(7 9)">7 sesgos</text>
    <text x="540" y="300" text-anchor="middle" font-family="Ultra" font-size="168" fill="${C.red}" stroke="${C.ink}" stroke-width="4" paint-order="stroke">7 sesgos</text>
    <path id="arc1" d="M70 438 Q540 352 1010 438" fill="none"/>
    <text font-family="Ultra" font-size="56" fill="${C.ink}" letter-spacing="1"><textPath href="#arc1" startOffset="50%" text-anchor="middle">que te vacían la cuenta</textPath></text>
    <g transform="translate(540 500) rotate(-2)">
      <path d="M-200 -34 L-262 -34 L-240 0 L-262 34 L-180 34Z" fill="${C.blueDk}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M200 -34 L262 -34 L240 0 L262 34 L180 34Z" fill="${C.blueDk}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-206 -40 Q0 -52 206 -40 L206 30 Q0 18 -206 30Z" fill="${C.ink}" transform="translate(5 7)"/>
      <path d="M-206 -40 Q0 -52 206 -40 L206 30 Q0 18 -206 30Z" fill="${C.blue}" stroke="${C.ink}" stroke-width="3.5"/>
      <text y="12" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="46" letter-spacing="10" fill="${C.glove}">CADA MES</text></g>`;

  // Mapi shakes an empty wallet overhead; only a moth comes out.
  const m = mapi({ x: 290, y: 1072, s: 1.32, sx: 0.9, sy: 1.1, bend: -14, lean: -3,
    expr: { look: [0.25, -0.9], pupil: 0.6, mouth: 'scream', brow: [16, 12], blush: false },
    arms: [{ x: -98, y: -150, bend: 30, glove: 'open', aim: -40, thumb: -1 },
           { x: 70, y: -300, bend: -50, glove: 'fist', thumb: -1, aim: -95, held: `<g transform="translate(-2 -40)">${P.wallet()}</g>`, heldFront: false }],
    legs: [{ x: -36, y: 50, bend: 18, dir: -1 }, { x: 30, y: 50, bend: -18, dir: 1 }],
    sweat: [[-70, -226, 1.1, -30], [92, -196, 0.8, 40]],
  });
  const moths = P.moth(470, 610, 1.5, 16) + P.moth(300, 588, 0.9, -20) + stroke('M392 742 C380 712 420 700 408 676 C398 656 440 640 450 628', 2.2, C.ink, 'stroke-dasharray="5 8"') + P.ticks(372, 650, 70, 5, 200, 140);
  // Capi (flipped, faces Mapi) reads the endless ticket.
  const rec = P.receipt([[604, 850], [592, 940], [612, 1030], [580, 1100], [500, 1140], [430, 1160], [404, 1196], [436, 1228]], 56);
  const recTop = `<g transform="translate(606 838) rotate(-3)"><rect x="-46" y="-70" width="92" height="96" fill="${C.ink}" transform="translate(4 5)"/><rect x="-46" y="-70" width="92" height="96" fill="${C.glove}" stroke="${C.ink}" stroke-width="3.2"/>
    <text x="0" y="-44" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="17" fill="${C.ink}" letter-spacing="2">TICKET</text>
    ${[-26, -12, 2, 16].map((y, i) => stroke(`M-32 ${y} L${i % 2 ? 6 : 14} ${y} M22 ${y} L32 ${y}`, 3, C.ink, 'opacity=".42"')).join('')}</g>`;
  const c = capi({ x: 820, y: 1100, s: 1.22, flip: true, mid: rec + recTop,
    expr: { look: [0.85, 0.2], lid: 0.55, lidR: 0.3, brow: [10, -2], browR: [-12, 14], mouth: 'flat' },
    arms: [{ x: 150, y: -150, bend: -30, glove: 'hold', back: true, thumb: -1 }, { x: 150, y: -206, bend: 40, glove: 'hold', thumb: -1 }],
  });

  const groundSvg = `<rect x="0" y="${ground}" width="${W}" height="${H - ground}" fill="${C.paperDk}" opacity=".45"/>${taper(40, ground, 540, ground + 2, 1040, ground, 2.6)}`;
  const inner = `${paperBg(W, H)}${rays}${groundSvg}
    ${title}<g filter="url(#wobble)">${c}${m}${moths}</g>
    ${P.wordmark(84, 1254, 0.72, { fill: C.glove })}
    <text x="1000" y="1268" text-anchor="end" font-family="Oswald" font-weight="700" font-size="28" letter-spacing="3" fill="${C.ink}">DESLIZA →</text>
    ${filmFx(W, H)}${P.filmGate(W, H)}`;
  return { svg: svgDoc(W, H, inner), W, H, file: 'cover-mock' };
}

// ------------------------------------------------------------------ AVATAR
// Mapi (la almendra) anidada en el hueco de Capi (el lóbulo): un cerebro, dos caracteres.
function avatar() {
  const W = 320, H = 320, cx = 160, cy = 160, R = 160;
  let rays = '';
  for (let i = 0; i < 16; i++) {
    const a0 = (i * 22.5) * Math.PI / 180, a1 = (i * 22.5 + 11.25) * Math.PI / 180;
    rays += `<path d="M${cx} ${cy + 40} L${cx + Math.cos(a0) * 400} ${cy + 40 + Math.sin(a0) * 400} L${cx + Math.cos(a1) * 400} ${cy + 40 + Math.sin(a1) * 400}Z" fill="${C.red}" opacity=".14"/>`;
  }
  const c = capi({ x: 178, y: 274, s: 0.96, expr: { look: [-0.55, 0.55], lid: 0.45, mouth: 'smile', brow: [6, 2] },
    arms: [{ x: -150, y: -10, bend: 0, glove: 'open', back: true }, { x: 140, y: 30, bend: 10, glove: 'open', back: true }],
    legs: [] });
  const m = mapi({ x: 102, y: 304, s: 0.84, lean: 4, bend: 6, expr: { look: [0.2, -0.15], mouth: 'grin', brow: [-6, 6], pupil: 0.95 },
    arms: [{ x: -90, y: 40, bend: -20, glove: 'open', back: true }, { x: 44, y: -262, bend: 22, glove: 'open', aim: -84, thumb: -1, sc: 1.1 }],
    legs: [], sweat: [[-70, -200, 1.2, -30]], front: P.ticks(146, 60, 24, 3, 200, 140) });
  const cid = 'avclip';
  const inner = `<rect width="${W}" height="${H}" fill="${C.ink}"/><clipPath id="${cid}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
    <g clip-path="url(#${cid})">${paperBg(W, H)}${rays}
      <g filter="url(#wobble)">${c}${m}</g>
      <rect width="${W}" height="${H}" filter="url(#grain)" opacity=".3" style="mix-blend-mode:multiply"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${R - 5}" fill="none" stroke="${C.ink}" stroke-width="7"/>
    <circle cx="${cx}" cy="${cy}" r="${R - 13}" fill="none" stroke="${C.ink}" stroke-width="1.6" opacity=".6"/>`;
  return { svg: svgDoc(W, H, inner), W, H };
}

const SCENES = { hero, expressions, cover, avatar };
(async () => {
  const which = process.argv[2] || 'all';
  const names = which === 'all' ? Object.keys(SCENES) : [which];
  for (const n of names) {
    const { svg, W, H, file } = SCENES[n]();
    const base = file || n;
    writeSvg(path.join(OUT, `${base}.svg`), svg);
    await render(svg, W, H, path.join(OUT, `${base}.png`));
    console.log('rendered', base);
  }
  await done();
})();
