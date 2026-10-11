// Reel 00 · Presentación — «En tu cabeza viven dos». Escena: frame(u) → planchas SVG (función pura).
// Contrato: storyboard.md + captions.srt. Motor: characters/riso/anim/. Ronda 2: escala y composición nuevas
// (suelo y 1460, protagonista ≥ 40 % del ancho), subtítulos grandes, recorte de ≈ 2 s por remapeo de tiempo.
// Tiempo: u = fotograma de salida (0…1617); t = fotograma del storyboard (0…1679). Se saltan los tramos CUTS.
// Chispa en «dos» (todo se muestrea en tc = par de t), Pausa en «unos», cámara y texto en «unos».
const fs = require('fs');
const R = require('../../characters/riso/riso.js');
const { T, RIG, PROPS: P, CAP } = require('../../characters/riso/anim/index.js');
const { INK, W, L, add, f } = R;

const WIDTH = 1080, HEIGHT = 1920, STORY_FRAMES = 1680;
// recortes (fotogramas del storyboard, incluidos; longitudes pares para no romper los «dos»)
const CUTS = [[192, 229], [714, 737]];
const FRAMES = STORY_FRAMES - CUTS.reduce((a, [x, y]) => a + y - x + 1, 0);
function storyT(u) { let t = u; for (const [a, b] of CUTS) if (t >= a) t += b - a + 1; return t; }
function outOf(t) { let u = t; for (const [a, b] of CUTS) { if (t > b) u -= b - a + 1; else if (t >= a) u -= t - a; } return u; }
let LAY = null;
let CUR_U = 0;

// =====================================================================================
// SUBTÍTULOS (tamaños de la ronda 2; la parte alta de la primera línea en y 240, interlineado 1,0)
// =====================================================================================
const k = (t, ink = 'black', seg = 0) => ({ t, ink, seg });
const CARDS = [
  { id: 'c1', in: 0, out: 51, size: 160, lines: [[k('En tu cabeza')], [k('viven dos.')]] },
  { id: 'c2', in: 51, out: 156, size: 104, lines: [[k('Y '), k('una', 'red'), k(' acaba de')], [k('gastarse tu dinero.')]] },
  { id: 'c3', in: 156, out: 230, size: 120, noSlab: true, outline: { ink: 'red', w: 12 }, lines: [[k('Esta es '), k('Chispa.', 'red')]] },
  { id: 'c4', in: 230, out: 290, size: 104, segs: [230, 242, 254], lines: [[k('Rápida. ', 'black', 0), k('Impulsiva.', 'black', 1)], [k('Decide sin preguntar.', 'black', 2)]] },
  { id: 'c5', in: 290, out: 384, size: 120, segs: [290, 300, 310], base: [0], world: { x: 520, y: 770, rot: -4 }, lines: [[k('¡Ya, ', 'red', 0), k('ya, ', 'red', 1), k('ya!', 'red', 2)]] },
  { id: 'c6', in: 384, out: 446, size: 120, lines: [[k('Y esta es '), k('Pausa.', 'blue')]] },
  { id: 'c7', in: 446, out: 494, size: 104, lines: [[k('Tranquila.')], [k('Hace las cuentas…')]] },
  { id: 'c8', in: 494, out: 520, size: 120, lines: [[k('…cuando llega.')]] },
  { id: 'c9', in: 520, out: 570, size: 104, base: [828, 932], lines: [[k('Espera…', 'blue')], [k('déjame pensarlo.', 'blue')]] },
  { id: 'c10', in: 570, out: 670, size: 104, lines: [[k('Ojo: '), k('Chispa', 'red')], [k('no es la mala.')]] },
  { id: 'c11', in: 670, out: 724, size: 104, lines: [[k('Sin ella, tardarías')], [k('media hora…')]] },
  { id: 'c12', in: 724, out: 780, size: 120, lines: [[k('…en cruzar la calle.')]] },
  { id: 'c13', in: 780, out: 850, size: 104, lines: [[k('El problema:')], [k('Chispa', 'red'), k(' decide primero.')]] },
  { id: 'c14', in: 850, out: 960, size: 120, lines: [[k('Pausa', 'blue'), k(' llega tarde.')]] },
  { id: 'c15', in: 960, out: 1050, size: 104, lines: [[k('Y cuando llega…')], [k('Chispa', 'red'), k(' ya ha pagado.')]] },
  { id: 'c16', in: 1050, out: 1130, size: 88, segs: [1050, 1074, 1092], lines: [[k('Ofertas flash.', 'black', 0)], [k('Cuentas atrás. ', 'black', 1), k('«Quedan 2».', 'black', 2)]] },
  { id: 'c17', in: 1130, out: 1210, size: 104, lines: [[k('Todo está diseñado')], [k('para hablar con '), k('Chispa', 'red'), k('…')]] },
  { id: 'c18', in: 1210, out: 1330, size: 104, lines: [[k('…antes de que')], [k('Pausa', 'blue'), k(' se entere.')]] },
  { id: 'c19', in: 1330, out: 1410, size: 104, lines: [[k('Todos tenemos una')], [k('Chispa', 'red'), k(' y una '), k('Pausa', 'blue'), k('.')]] },
  { id: 'c20', in: 1410, out: 1530, size: 104, lines: [[k('Aquí enseñamos a '), k('Pausa', 'blue')], [k('a llegar a tiempo.')]] },
  { id: 'c21', in: 1530, out: 1590, size: 160, lines: [[k('¿Quién manda')], [k('en tu cabeza?')]] },
  { id: 'c22', in: 1590, out: 1680, size: 120, segs: [1590, 1594, 1600], lines: [[k('Comenta ', 'black', 0), { dot: 'red', r: 36, seg: 1 }, k(' o ', 'black', 0), { dot: 'blue', r: 36, seg: 2 }]] },
  { id: 'c22b', in: 1590, out: 1680, size: 60, st: 'mono', ls: 0.06, base: [436], lines: [[k('@dinero_irracional')]] },
  { id: 'chispaNo', in: 1322, out: 1362, size: 96, cx: 735, base: [1080], lines: [[k('Chispa, no.', 'blue')]] },
  { id: 'cover', in: -1e9, out: 1e9, size: 150, maxW: 880, base: [470, 610], lines: [[k('En tu cabeza')], [k('viven dos.')]] },
];
// ticket del plano 5 (sale por la ranura de la caja, se pliega y baja a la derecha de Pausa)
const TICKET = { w: 150, pts: [[728, 862], [752, 960], [860, 1050], [710, 1160], [710, 1420]] };

async function prepare(M) {
  const cards = await CAP.prepare(M, CARDS);
  const c5 = cards.find((c) => c.id === 'c5');
  c5.world.x = Math.min(c5.world.x, Math.round(925 - c5.lines[0].w * Math.cos((4 * Math.PI) / 180)));
  const sfx = { clac: await M.width([{ t: '¡CLAC!', st: 'head', ls: -0.01 }], 96), ding: await M.width([{ t: '¡DING!', st: 'head', ls: -0.01 }], 80) };
  let amountSize = 38;
  while (amountSize > 20 && (await M.width([{ t: '189,99 €', st: 'head' }], amountSize)) > TICKET.w - 22) amountSize -= 1;
  let labelSize = 30;
  while (labelSize > 16 && (await M.width([{ t: 'TOTAL', st: 'mono', ls: 0.08 }], labelSize)) > TICKET.w - 30) labelSize -= 1;
  return { cards, sfx, amountSize, labelSize, safe: CAP.checkSafe(cards.filter((c) => c.id !== 'cover'), { yTop: 240, capH: 0.74 }) };
}
async function setup(cfg) { LAY = JSON.parse(fs.readFileSync(cfg.layout, 'utf8')); }
const card = (id) => LAY.cards.find((c) => c.id === id);

// =====================================================================================
// AYUDAS
// =====================================================================================
const G = 1460; // suelo general
const tw = (t) => T.onTwos(t);
const CH = (o, p) => { add(o, R.chispa(p)); return p; };
const PZ = (o, p) => { add(o, R.pausa(p)); return p; };
function chShadow(o, c, g) {
  const feet = c.y + 127 * c.s * (c.squash || 1), h = g - feet;
  if (h < 8) o.black += R.shadowEllipse(c.x, g, 100 * c.s, 13, INK.black, 7, 2.6);
  else o.black += R.liftedShadow(c.x, g, Math.max(46, 100 * c.s - h * 0.12), 10);
}
const pzShadow = (o, p, g) => { o.black += R.shadowEllipse(p.x + (p.flip ? -8 : 8), g, 205 * p.s, 14, INK.black, 7, 2.6); };
const steamAlt = (t) => (Math.floor(t / 8) % 2 ? 'vapor2' : 'vapor');
// respiración de Pausa en tiempo de SALIDA: 13 ciclos exactos en el Reel, el bucle no salta
const breath = () => RIG.breathe(CUR_U, FRAMES / 13, 0.015);
const rest = (tc, amp = 1) => ({ dx: T.jitter(tc, amp), sizzle: Math.floor(tc / 2) % 2 === 1 });
const lerpPts = (a, b, k2) => a.map((v, i) => (Array.isArray(v) ? lerpPts(v, b[i], k2) : v + (b[i] - v) * k2));
const SIT = R.PAUSA_POSES.sit, BRINDIS = R.PAUSA_POSES.brindis, SORBO = R.PAUSA_POSES.sorbo;
// reserva alrededor de la taza (cuando pisa la base negra del botón)
function mugHalo(o, p) { const m = RIG.pausaMug(p); if (!m) return; const c = RIG.GP(p, m[0] + 6, m[1]); o.black += `<rect x="${f(c[0] - 44 * p.s)}" y="${f(c[1] - 40 * p.s)}" width="${f(88 * p.s)}" height="${f(80 * p.s)}" rx="${f(14 * p.s)}" fill="${W}"/>`; }

// decorado compartido 1 / 7 / 8 («el botón», también el del bucle)
const BTN = { cx: 262, G, s: 1.2 };
const CAP_UP = P.buttonCapTop(G, { s: 1.2 }), CAP_DOWN = P.buttonCapTop(G, { s: 1.2, pressed: true }); // 1263,2 / 1294,4
const CAP_X = [262 - 192, 262 + 192];
const PZ0 = { x: 742, y: G - 122, s: 1.0, flip: true };
const REST_END = [380, 1486];
const button = (o, opt = {}) => add(o, P.buyButton(BTN.cx, BTN.G, { s: BTN.s, ...opt }));

// =====================================================================================
// PLANO 1 · Gancho · 0–119
// =====================================================================================
const COINS = [[-10, -46, 0], [-7, -52, 20], [-4, -54, 45], [-1, -50, 80], [3, -53, 15], [6, -48, 60], [9, -42, 30], [12, -38, 70], [-13, -36, 10], [15, -44, 55], [-2, -40, 35], [5, -34, 90]];
function coinsAt(tc, { minY = -1e9 } = {}) {
  let s = '';
  if (tc < 6 || tc > 62) return s;
  const tt = tc - 6, kk = tt / 2;
  COINS.forEach(([vx, vy, rot0], i) => {
    const x = BTN.cx + vx * 1.1 * tt, y = CAP_DOWN + vy * tt + 1.2 * tt * tt;
    if (y > 1960 || y < minY) return;
    s += P.coinBlank(x, y, 30, rot0 + 40 * kk, (kk + i + 1) % 2 === 1);
  });
  return s;
}
const CS1 = 1.05, YST1 = Math.round(CAP_DOWN - 127 * CS1); // de pie sobre la tapa pulsada
const Y1 = (yo) => Math.round(YST1 + (yo - 1110) * 0.875);
function chispa1(tc) {
  const base = { s: CS1, x: BTN.cx, pose: 'hold', expr: 'euforia', look: [0, 4], sweat: 2 };
  if (tc <= 4) return { ...base, y: Y1({ 0: 778, 2: 818, 4: 908 }[tc]), fall: true };
  if (tc <= 10) return { ...base, pose: 'golpe', y: Y1({ 6: 1078, 8: 1086, 10: 1090 }[tc]), squash: { 6: 0.9, 8: 0.95, 10: 1 }[tc], halo: 8 };
  if (tc <= 16) return { ...base, pose: 'cheer', y: Y1({ 12: 1070, 14: 1100, 16: 1110 }[tc]), squash: { 12: 1.04, 14: 1, 16: 0.95 }[tc], halo: 8 };
  if (tc <= 50) { const ph = ((tc - 18) / 2) % 4; return { ...base, pose: 'cheer', y: YST1 + [0, -30, -44, -30][ph], squash: ph === 0 ? 0.95 : 1, halo: 8 }; }
  if (tc <= 98) { const r = rest(tc); return { ...base, x: BTN.cx + r.dx, pose: 'happy', expr: 'feliz', look: [0, 2], y: YST1, sweat: 0, sweatIdx: [1], halo: 8, sizzle: r.sizzle }; }
  if (tc <= 106) return { ...base, pose: 'shrug', look: [6, 0], y: YST1, squash: tc === 100 ? 0.9 : 0.86, halo: 8 };
  const p0 = { 108: [380, 1000], 110: [500, 880], 112: [640, 800], 114: [790, 770], 116: [950, 790], 118: [1110, 840] }[tc];
  return { ...base, pose: 'lunge', look: [6, 0], x: BTN.cx + (p0[0] - 320) * 1.05, y: Y1(p0[1]), speed: 4, lean: -12, sweat: 3, squash: tc === 108 ? 1.06 : 1 };
}
function shot1(t, w, opt = {}) {
  const tc = tw(t);
  button(w, { pressed: t >= 6 && t < 108, lift: t >= 108 && t < 110 ? 7 : 0 });
  const pz = { ...PZ0, pose: 'sit', expr: 'neutral', look: [8, 6], lid: RIG.blinkSlow(t, 70, { down: 8, hold: 8, up: 14 }), steam: steamAlt(t), squash: breath() };
  pzShadow(w, pz, G);
  PZ(w, pz);
  w.black += P.leashRest(RIG.pausaHandle(pz), REST_END);
  w.blue += coinsAt(tc, opt);
  const c = chispa1(tc);
  if (c.fall) { w.black += R.liftedShadow(BTN.cx, CAP_UP + 4, 116 - (YST1 - c.y) * 0.1, 8); w.black += P.fallLines(c.x, c.y - 178); }
  const cp = { ...c, knockFor: (tc >= 6 && tc <= 62) || (tc >= 112 && tc <= 118) ? ['blue'] : null };
  delete cp.fall;
  if (!c.fall && tc < 108) w.black += R.shadowEllipse(BTN.cx, CAP_DOWN + 2, 92, 8, INK.black, 7, 2.2);
  CH(w, cp);
  if (tc >= 6 && tc <= 10) for (const sx of [-70, 70]) { const h = RIG.GC(cp, sx, 136); w.black += R.burst(h[0], h[1] + 16, 1); }
  if (!opt.cover && t >= 6 && t <= 19) w.black += P.sfxText(462, 1112, '¡CLAC!', { size: 96, rot: -8, sc: [1.3, 1.15, 1][Math.min(t - 6, 2)], approxW: LAY.sfx.clac });
  const shake = opt.cover ? [0, 0] : RIG.shakeTable(t, 6, { 0: [0, 16], 1: [-9, -7], 2: [7, 5], 3: [-3, -2] });
  return { cam: { shake } };
}

// =====================================================================================
// PLANOS 2–3 · mundo continuo (Chispa s 1,9 → paneo → Pausa s 1,6)
// =====================================================================================
const CS2 = 1.9, Y2 = Math.round(G - 127 * CS2), K2 = CS2 / 1.3; // 1219; K2 escala los saltos y offsets del storyboard
const ARM_TAG = { armR: [[150, 18], [176, -18]] };
const TAG_S = 0.42 * K2;
function chispa23(tc) {
  const base = { s: CS2, y: Y2, expr: 'euforia', look: null };
  if (tc <= 130) { const r = RIG.runCycle(tc, 120, { x0: -480, dx: 150, y0: Y2, bob: -20 }); return { ...base, pose: r.pose, x: r.x, y: r.y, speed: 4, lean: -12 }; }
  if (tc === 132) return { ...base, pose: 'corre_a', x: 360, speed: 4, lean: -12, limbs: ARM_TAG, tag: 'hand' };
  if (tc <= 154) {
    const x = { 134: 400, 136: 435, 138: 455, 140: 465 }[tc] ?? 470;
    const r = tc >= 142 ? rest(tc) : { dx: 0 };
    return { ...base, pose: 'frena', x: x + r.dx, lean: 8, expr: tc >= 146 ? 'euforia' : 'alarma', limbs: ARM_TAG, tag: 'hand', dust: tc <= 146 };
  }
  if (tc <= 188) { const r = tc >= 160 ? rest(tc) : { dx: 0, sizzle: false }; return { ...base, pose: 'stand', x: 470 + r.dx, y: tc === 156 ? Y2 - 23 : tc === 158 ? Y2 + 6 : Y2, expr: 'feliz', look: [0, 2], limbs: ARM_TAG, tag: 'hand', sizzle: r.sizzle }; }
  if (tc <= 228) { const r = rest(tc); return { ...base, pose: 'stand', x: 470 + r.dx, expr: 'neutral', look: [0, 2], limbs: ARM_TAG, tag: 'hand', tagRot: { 190: 10, 192: -6, 194: 10 }[tc], sizzle: r.sizzle }; }
  if (tc <= 252) {
    const hop = ({ 230: -24, 232: -30, 234: -12 }[tc] ?? 0) * K2;
    const r = tc >= 236 ? rest(tc) : { dx: 0 };
    return { ...base, pose: 'stand', x: 470 + r.dx, y: Y2 + hop, expr: 'euforia', look: [0, 2], limbs: ARM_TAG, tag: 'hand', tagRot: tc >= 242 && tc <= 250 ? [10, -10][((tc - 242) / 2) % 2] : 10, sweatIdx: tc >= 242 ? [1] : null };
  }
  if (tc <= 288) { const r = rest(tc); return { ...base, pose: 'hips', x: 470 + r.dx, expr: 'orgullosa', look: [0, 2], tag: 'hips', sweatIdx: [1], sizzle: r.sizzle }; }
  if (tc <= 328) {
    let off = 0;
    for (const k0 of [290, 300, 310]) if (tc >= k0 && tc <= k0 + 8) off = [0, -36, -50, -36, 0][(tc - k0) / 2];
    if (tc >= 320) off = { 320: 0, 322: -20, 324: -40, 326: -40, 328: -40 }[tc];
    return { ...base, pose: 'cheer', x: 470, y: Y2 + off * K2, sweat: 3, tag: 'cheer', burst: tc < 320 };
  }
  const off = T.step([[330, -50], [336, -58], [342, -62], [348, -62], [354, -58], [360, -50], [366, -50], [372, -36], [378, -18], [384, 0]])(tc);
  return { ...base, pose: 'cheer', x: 470, y: Y2 + off * K2, sweat: 3, tag: 'cheer' };
}
const CAM3 = 900;
function camX3(t) { return t < 330 ? 0 : t >= 420 ? CAM3 : CAM3 * (1 - Math.cos(Math.PI * ((t - 330) / 90))) / 2; }
const tagInHand = (cp, rot = 10) => { const h = RIG.GC(cp, 176, -18); return [h[0] + 70 * K2, h[1] - 8 * K2, rot]; };
const TAG_AT = tagInHand({ x: 360, y: Y2, s: CS2, lean: -12, pose: 'corre_a', limbs: ARM_TAG });
function shot23(t, w) {
  const tc = tw(t);
  const c = chispa23(tc);
  // percha (solo plano 2): el tirón de f132 la tumba hacia la derecha, fuera de cuadro
  if (t < 330) {
    const [tx, ty] = TAG_AT, px = tx + 150, top = ty - 120;
    const fall = tc < 134 ? 0 : { 134: 14, 136: 38, 138: 66, 140: 86, 142: 80, 144: 90 }[tc] ?? 90;
    let st = `<path d="M${f(px)} ${G - 4} L${f(px)} ${f(top)} L${f(tx)} ${f(top)}" fill="none" stroke="${INK.black}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (tc < 132) { st += R.strokeP(`M${f(tx)} ${f(top)} L${f(tx)} ${f(ty - 62)}`, INK.black, 4.5); w.red += R.priceTag(tx, ty, 10, '−70 %', TAG_S); }
    else { const sw = tc <= 150 ? [6, -6][((tc - 132) / 2) % 2] : 0; st += `<g transform="rotate(${sw} ${f(tx)} ${f(top)})">${R.strokeP(`M${f(tx)} ${f(top)} L${f(tx)} ${f(top + 46)}`, INK.black, 4.5, 'stroke-linecap="round"')}</g>`; }
    w.black += `<g transform="rotate(${fall} ${f(px)} ${G - 4})">${st}</g>`;
  }
  if (c.dust) { const kk = (tc - 134) / 12; for (const dx of [-30, 100]) w.black += P.dust(c.x + dx * 1.3, G - 8, (10 + 24 * kk) * 1.4, 1 - 0.8 * Math.max(0, kk - 0.4) / 0.6); }
  chShadow(w, c, G);
  const cp = { ...c, halo: c.tag ? 9 : 0 };
  for (const kk2 of ['tag', 'dust', 'tagRot', 'burst']) delete cp[kk2];
  if (c.tag === 'hand') { const [x, y, r] = tagInHand(cp, c.tagRot ?? 10); w.red += R.priceTag(x, y, r, '−70 %', TAG_S); }
  if (c.tag === 'hips') { const h = RIG.GC(cp, 108, 64); w.red += R.priceTag(h[0] + 64 * K2, h[1] + 16 * K2, 8, '−70 %', TAG_S); }
  if (c.tag === 'cheer') { const h = RIG.GC(cp, 136, -42); w.red += R.priceTag(h[0] + 58 * K2, h[1] - 22 * K2, -14, '−70 %', TAG_S); }
  CH(w, cp);
  if (c.burst) { const b = RIG.GC(cp, 6, -150); w.black += R.burst(b[0], b[1], 1.5); }
  if (t >= 156 && t < 230) {
    const ln = card('c3').lines[0], sp = ln.spans[1];
    w.screenRed = P.inkSplash(sp.x + sp.w / 2 + 44, ln.base - 120 * 0.34 + 10, t < 158 ? 0 : t < 160 ? 1 : 2, { rx: 1.25, k: 1.12 });
  }
  // ---- plano 3: Pausa (s 1,6) y el gag de la plancha azul ----
  if (t >= 330) {
    const look = t < 458 ? [-4, 6] : T.mix([-4, 6], [0, 6], T.ramp(t, 458, 470, 0, 1, 'io'));
    let arms = SIT.arms, mug = SIT.mug, lid = 0.5;
    if (t >= 500 && t < 540) {
      const up = t < 514 ? T.ramp(t, 500, 514, 0, 1, 'io') : t < 526 ? 1 : T.ramp(t, 526, 540, 1, 0, 'io');
      arms = lerpPts(SIT.arms, SORBO.arms, up); mug = lerpPts(SIT.mug, SORBO.mug, up);
      lid = t < 514 ? 0.5 : t < 526 ? T.ramp(t, 514, 526, 0.5, 0.8, 'io') : T.ramp(t, 526, 540, 0.8, 0.5, 'io');
    }
    const bl = RIG.blinkSlow(t, 540, { down: 8, hold: 8, up: 13 });
    if (bl != null) lid = bl;
    const sq = t < 494 ? 1 : T.track([[494, 0.96], [498, 0.98, 'out'], [504, 1, 'out']])(t);
    const PX = 479 + CAM3, PY = G - 122 * 1.6;
    const pz = { x: PX, y: PY, s: 1.6, pose: 'sit', expr: 'neutral', look, lid, arms, mug, steam: steamAlt(t), squash: sq * breath() };
    pzShadow(w, pz, G);
    const layers = R.pausa(pz);
    // la plancha azul espera en el borde (dx +400) y entra deslizándose (ease-out); encaja en f494
    const [dx, dy, rot] = t < 458 ? [400, 40, 3] : RIG.latePlate(t, 458, 494, [400, 40, 3], 'out');
    RIG.shiftPlate(layers, 'blue', dx, dy, rot, PX, PY);
    add(w, layers);
  }
  return { cam: { x: camX3(t) } };
}

// =====================================================================================
// PLANO 4 · El giro · 570–779
// =====================================================================================
const PANEL = [60, 520, 940, 1460];
const clipPanel = (o, pn) => RIG.clipLayers(o, pn[0] + 4, pn[1] + 4, pn[2] - pn[0] - 8, pn[3] - pn[1] - 8);
function shot4(t, w) {
  const tc = tw(t);
  if (t < 610) { // 4a · Chispa saca pecho (s 1,9)
    const s = { 570: 1.75, 572: 2.05, 574: 1.95 }[tc] ?? 1.9;
    const r = tc >= 576 ? rest(tc) : { dx: 0 };
    const c = { x: 500 + r.dx, y: G - 127 * s + (tc === 572 ? -12 : 0), s, pose: 'hips', expr: tc >= 592 ? 'feliz' : 'orgullosa', look: [0, 2], lean: 6, sweatIdx: [1], sizzle: r.sizzle };
    w.black += R.shadowEllipse(500, G, 100 * s, 16, INK.black, 7, 2.8);
    CH(w, c);
    if (tc >= 572 && tc <= 580) { const b = RIG.GC(c, 4, -150); w.black += R.burst(b[0], b[1] - 8, 1.6); }
    return { cam: {} };
  }
  const inner = L();
  if (t < 670) { // 4b · el balón (Chispa s 1,8, suelo 1440)
    const GB = 1440, S = 1.8, YB = GB - 127 * S;
    let c = { x: 470, y: YB, s: S, pose: 'stand', expr: 'neutral', look: [0, 2] };
    if (tc >= 614) c = { ...c, expr: 'alarma', look: [6, 0] };
    if (tc >= 620 && tc <= 634) { const r = rest(tc, 2); c = { ...c, x: 470 + r.dx, y: GB - 91 * S, lean: -16, pose: 'agachada', sweat: 2 }; }
    if (tc >= 636) { const r = tc >= 640 ? rest(tc) : { dx: 0 }; c = { ...c, x: 470 + r.dx, y: tc === 636 ? YB - 40 : YB, pose: 'cheer', expr: 'orgullosa', look: null, lean: 0, sweat: 0, sizzle: r.sizzle }; }
    inner.black += R.shadowEllipse(470, GB, 180, 14, INK.black, 7, 2.8);
    CH(inner, c);
    if (tc === 636 || tc === 638) { const b = RIG.GC(c, 6, -150); inner.black += R.burst(b[0], b[1], 1.6); }
    if (t >= 618 && t <= 634) { const bx = 1010 - 70 * (t - 618); inner.black += P.motionLines(bx + 88, 926, { dir: 1, len: 90, gap: 34, w: 7 }) + P.ball(bx, 926, 74, -30 * (t - 618)); }
    add(w, clipPanel(inner, PANEL));
    w.black += P.panelFrame(...PANEL);
    return { cam: {} };
  }
  // 4c · Pausa (s 1,2) y el semáforo — se recorta el 2.º ciclo de puntos (f714–737)
  inner.black += P.zebra(60, 1350, 940, 1460, { from: 420 });
  const red = t >= 744;
  add(inner, P.trafficLight({ x: 820, top: 760, foot: 1460, boxC: [820, 800], red, blue: !red }));
  if (t >= 744 && t <= 750) for (const [bx, by, rr] of [[820, 674, 0], [748, 712, -60], [892, 712, 60]]) inner.black += `<g transform="rotate(${rr} ${bx} ${by})">${R.burst(bx, by, 1.15)}</g>`;
  let look = [8, 4];
  if (t >= 680) look = T.mix([8, 4], [-10, 4], T.ramp(t, 680, 690, 0, 1, 'io'));
  if (t >= 700) look = T.mix([-10, 4], [10, 4], T.ramp(t, 700, 710, 0, 1, 'io'));
  const x = t < 738 ? 300 : T.ramp(t, 738, 744, 300, 314, 'in');
  const pose = t >= 738 && t < 746 ? 'llega' : 'sit';
  let expr = 'neutral';
  if (t >= 750) expr = 'alarma';
  if (t >= 760) { expr = 'esceptico'; look = [-6, 6]; }
  if (t >= 750 && t < 760) look = undefined;
  const sq = t >= 760 ? T.track([[760, 1], [770, 0.97, 'io'], [779, 1, 'io']])(t) : 1;
  const pz = { x, y: 1350 - 122 * 1.2, s: 1.2, pose, expr, look, squash: sq * breath(), steam: pose === 'sit' ? steamAlt(t) : undefined };
  pzShadow(inner, pz, 1350);
  PZ(inner, pz);
  const n = t < 690 ? 0 : t < 746 ? (t >= 706 ? 3 : t >= 698 ? 2 : 1) : 0;
  inner.blue += P.thinkDots([[340, 966], [378, 944], [418, 930]], n, 10);
  if (t >= 760) { const s0 = RIG.GP(pz, 10, -150); inner.red += R.pausaSweat(s0[0], s0[1], 1.1); }
  add(w, clipPanel(inner, PANEL));
  w.black += P.panelFrame(...PANEL);
  return { cam: { shake: RIG.shakeTable(t, 744, { 0: [0, 7], 1: [-5, -3], 2: [2, 2] }) } };
}

// =====================================================================================
// PLANO 5 · El problema · 780–1049 (pantalla partida en x 60–940)
// =====================================================================================
const PA = [60, 480, 940, 950], PB = [60, 970, 940, 1460], GA = 920, GB = 1440;
const REG = [520, 780, 740, 920];
const SLAM = { armL: [[-136, 10], [-120, -26]], armR: [[150, 0], [147, 56]] };
function chispa5(tc) {
  const S = 1.1, Y = GA - 127 * S;
  const base = { s: S, y: Y, expr: 'euforia', knockFor: ['black'] };
  if (tc <= 802) { const r = RIG.runCycle(tc, 780, { x0: -60, dx: 42, y0: Y, bob: -14 }); return { ...base, pose: r.pose, x: r.x, y: r.y, speed: 4, lean: -12 }; }
  if (tc === 804) return { ...base, pose: 'frena', x: 400, lean: 8 };
  if (tc === 806) return { ...base, pose: 'hold', x: 400, y: Y - 30, squash: 1.04 };
  if (tc === 808) return { ...base, pose: 'golpe', limbs: SLAM, x: 400, y: Y - 40, squash: 0.94 };
  if (tc === 810) return { ...base, pose: 'golpe', limbs: SLAM, x: 400, y: Y - 32 };
  if (tc <= 962) { const bob = (tc - 812) % 12 === 6 ? -12 : 0; return { ...base, pose: 'compra', x: 400, y: Y + bob, expr: 'feliz', look: [4, 6], sizzle: Math.floor(tc / 2) % 2 === 1, squash: tc === 812 ? 0.92 : 1 }; }
  return { ...base, pose: 'compra', x: 400 + (750 * (tc - 962)) / 18, expr: 'feliz', speed: 4, lean: -12 };
}
function shot5(t, w) {
  const tc = tw(t);
  const push = t >= 990;
  const A = L(), B = L();
  const rung = tc >= 810;
  const regFade = push ? T.ramp(t, 990, 1000, 1, 0, 'out') : 1;
  if (regFade > 0.01) A.black += `<g opacity="${f(regFade)}">${P.register({ body: REG, display: rung ? '189,99' : '0,00', drawerOut: rung ? 30 : 0 })}</g>`;
  if (tc >= 810 && tc <= 816) A.black += R.burst(780, 770, 1.2);
  const arrived = t >= 960;
  const x = arrived ? 330 : 250 + (80 * (t - 780)) / 180;
  const y = GB - 122 + (arrived ? 0 : 5 * Math.sin(((t - 780) / 30) * 2 * Math.PI));
  const pz = { x, y, s: 1.0, pose: 'llega', expr: arrived ? 'jadeo' : 'neutral', look: arrived ? undefined : [6, 6] };
  B.black += R.shadowEllipse(x + 6, GB, 205, 13, INK.black, 7, 2.6);
  const pl = R.pausa(pz);
  if (arrived) { const kk = t < 990 ? 0 : T.ramp(t, 990, 1010, 0, 1, 'out'); RIG.shiftPlate(pl, 'blue', 12 * (1 - kk), 7 * (1 - kk)); }
  add(B, pl);
  if (arrived) { const s0 = RIG.GP(pz, 10, -150); B.red += R.pausaSweat(s0[0], s0[1], 1.05); }
  if (push) { add(w, A); add(w, B); } // al empujar desaparecen los marcos (y los recortes)
  else {
    add(w, clipPanel(A, PA)); add(w, clipPanel(B, PB));
    w.black += P.panelFrame(...PA) + P.panelFrame(...PB);
  }
  const total = P.polyLen(TICKET.pts);
  if (tc >= 814) add(w, P.ticketGrow(TICKET.pts, TICKET.w, { len: tc >= 960 ? total + 1 : (total * (tc - 814)) / 146, labelSize: LAY.labelSize, amountSize: LAY.amountSize, amountFont: R.FONT_HEAD, amountWeight: 800, amountStretch: '75%' }));
  const C = L();
  const c = chispa5(tc);
  if (c.x < 1250) { C.black += c.y >= GA - 127 * 1.1 - 4 ? R.shadowEllipse(c.x, GA, 110, 11, INK.black, 7, 2.4) : R.liftedShadow(c.x, GA, 90, 9); C.black += RIG.limbHalo(c, 18); CH(C, c); }
  add(w, clipPanel(C, PA));
  if (t >= 810 && t <= 825) w.black += P.sfxText(575, 712, '¡DING!', { size: 80, rot: 6, sc: [1.3, 1.15, 1][Math.min(t - 810, 2)], approxW: LAY.sfx.ding });
  const z = push ? T.ramp(t, 990, 1004, 1, 1.35, 'out') : 1;
  return { cam: { z, A: [500, 1340] }, clip: push ? [0, 480, 1080, 1000] : null };
}

// =====================================================================================
// PLANO 6 · El villano · 1050–1289 (Chispa s 1,6)
// =====================================================================================
const SIGNS = [
  { kind: 'sign', label: 'OFERTA FLASH', at: [290, 1395], rot: 5, f0: 1050, opt: { w: 420, h: 100, size: 60 } },
  { kind: 'count', at: [185, 1150], rot: -8, f0: 1068, s: 0.95 },
  { kind: 'sign', label: 'QUEDAN 2', at: [790, 1110], rot: 8, f0: 1086, opt: { w: 320, h: 100, size: 60 } },
  { kind: 'sign', label: 'SOLO HOY', at: [515, 905], rot: -3, f0: 1104, opt: { w: 320, h: 96, size: 54 } },
  { kind: 'tag', label: '−70 %', at: [235, 925], rot: -12, f0: 1118, s: 0.68 },
  { kind: 'tag', label: '−50 %', at: [790, 905], rot: 13, f0: 1130, s: 0.62 },
];
const LANDS = SIGNS.map((s) => s.f0 + 6);
function signPose(sg, t) {
  if (t < sg.f0) return null;
  const land = sg.f0 + 6;
  if (t < land) { const kk = T.EASE.easeInCubic((t - sg.f0) / 6); return { y: sg.at[1] - 800 * (1 - kk), rot: sg.rot * kk }; }
  return { y: sg.at[1] + T.track([[land, 20], [land + 2, -7], [land + 4, 0]])(t), rot: sg.rot };
}
function shot6(t, w) {
  const tc = tw(t);
  const G6 = 1440;
  const pz = { x: 835, y: 1452 - 122 * 0.52, s: 0.52, flip: true, pose: 'duerme', expr: 'dormida', squash: 0.975 + 0.025 * Math.cos(((t - 1050) / 40) * 2 * Math.PI) };
  w.black += R.shadowEllipse(835, 1452, 110, 9, INK.black, 6, 2.2);
  PZ(w, pz);
  if (t >= 1220 && t < 1250) w.blue += R.text(842, 1290, 'Z', { size: 80, fill: INK.blue, rot: -8 });
  else { const kk = ((t - 1050) % 30) / 30; w.blue += R.text(800, 1300 - 40 * kk, 'z z z', { size: 48, fill: INK.blue, rot: -8 }); }
  const sec = t < 1080 ? 59 : 59 - Math.floor((t - 1080) / 10);
  for (const sg of SIGNS) {
    const p = signPose(sg, t);
    if (!p) continue;
    if (sg.kind === 'sign') w.red += R.sign(sg.at[0], p.y, p.rot, sg.label, sg.opt);
    if (sg.kind === 'tag') w.red += R.priceTag(sg.at[0], p.y, p.rot, sg.label, sg.s);
    if (sg.kind === 'count') w.black += P.countdown(sg.at[0], p.y, p.rot, sg.s, `00:${String(sec).padStart(2, '0')}`);
  }
  let flinch = 0;
  for (const L0 of LANDS) if (tc === L0) flinch = -10;
  const esp = tc >= 1150;
  const r = esp ? rest(tc, 2) : { dx: 0, sizzle: false };
  const S = 1.6;
  const c = { x: 500 + r.dx, y: G6 - 127 * S + flinch, s: S, pose: 'tiesa', halo: 9, expr: esp ? 'espiral' : tc >= 1056 ? 'alarma' : 'neutral', look: tc < 1056 ? [0, -6] : null, sweat: tc >= 1092 ? 3 : 0, spin: (tc / 2) % 2, sizzle: r.sizzle };
  w.black += R.shadowEllipse(500, G6, 165, 14, INK.black, 7, 2.8);
  w.black += RIG.limbHalo(c, 14);
  CH(w, c);
  let shake = [0, 0];
  for (const L0 of LANDS) { const s0 = RIG.shakeTable(t, L0, { 0: [0, 12], 1: [-7, -5], 2: [3, 2] }); if (s0[0] || s0[1]) shake = s0; }
  const z = t < 1200 ? 1 : T.ramp(t, 1200, 1289, 1, 1.12, 'io');
  return { cam: { z, A: [500, 1100], shake } };
}

// =====================================================================================
// PLANO 7 · La promesa · 1290–1529 — el tirón «a un milímetro»
// =====================================================================================
// zambullida: la mano apunta recta hacia abajo a la tapa; pies recogidos detrás (todo por encima de la tapa)
const DIVE = { armR: [[132, 96], [128, 170]], armL: [[-124, 4], [-154, -32]], legL: [[-80, 82], [-130, 74]], legR: [[0, 96], [-44, 102]] };
const HAND = [128, 170];
const CS7 = 1.0, Y7 = G - 127 * CS7;
const HAND_R = 12, GAP = 30;
const LEAN7 = -10;
const YDIVE = CAP_UP - GAP - HAND_R - HAND[1] * CS7; // yema a 30 px de la tapa
function chispa7(tc) {
  const base = { s: CS7, expr: 'euforia' };
  if (tc <= 1308) {
    const xx = T.step([[1290, 680], [1296, 664], [1302, 648], [1308, 632]])(tc);
    return { ...base, pose: 'tiesa', x: xx, y: Math.floor((tc - 1290) / 6) % 2 ? Y7 - 6 : Y7, expr: 'espiral', spin: (tc / 2) % 2, sizzle: (tc / 2) % 2 === 1, front: true };
  }
  if (tc === 1310) return { ...base, pose: 'tiesa', x: 625, y: Y7, front: true };
  if (tc === 1312) return { ...base, pose: 'shrug', x: 625, y: Y7, squash: 0.86, front: true };
  if (tc === 1314) return { ...base, pose: 'lunge', flip: true, x: 545, y: 1190, speed: 4, halo: 8, squash: 1.05 };
  if (tc === 1316) return { ...base, pose: 'lunge', flip: true, x: 440, y: 1104, speed: 4, halo: 8 };
  if (tc === 1318) return { ...base, pose: 'lunge', flip: true, limbs: DIVE, lean: LEAN7, x: 350, y: YDIVE - 8, speed: 4, halo: 8, dive: true };
  if (tc <= 1360) {
    const dx = tc >= 1322 && tc <= 1328 ? T.jitter(tc, 3, 1322) : 0;
    return { ...base, pose: 'lunge', flip: true, limbs: DIVE, lean: LEAN7, x: 330 + dx, y: YDIVE, expr: tc >= 1322 ? 'alarma' : 'euforia', halo: 8, dive: true };
  }
  if (tc <= 1366) {
    const p0 = { 1362: [370, 1200], 1364: [395, 1290], 1366: [400, Y7] }[tc];
    return { ...base, pose: 'shrug', flip: true, x: p0[0], y: p0[1], expr: 'alarma', squash: tc === 1366 ? 0.88 : 1, dust: tc === 1366, halo: 8 };
  }
  const r = rest(tc);
  if (tc < 1380) return { ...base, pose: 'stand', x: 400 + r.dx, y: Y7, expr: 'esceptico', look: [8, 0], sizzle: r.sizzle, dust: tc === 1368 };
  if (tc < 1424) return { ...base, pose: 'stand', x: 400 + r.dx, y: Y7, expr: 'neutral', look: [0, 2], sweatIdx: [1], sizzle: r.sizzle, blink: RIG.blinkFast(tc, [[1384, 1422]], 11) };
  return { ...base, pose: 'happy', x: 400 + r.dx, y: Y7, expr: tc < 1470 ? 'feliz' : 'orgullosa', look: tc < 1470 ? null : [0, 2], sweatIdx: [1], sizzle: r.sizzle };
}
function pausa7(t) {
  const p = { ...PZ0, pose: 'duerme', expr: 'dormida' };
  if (t < 1318) return { ...p, squash: 0.975 + 0.025 * Math.cos(((t - 1290) / 40) * 2 * Math.PI) };
  if (t < 1320) return { ...p, mug: [236 + 18, 104], mugRot: 15 };
  if (t < 1322) return { ...p, expr: 'alarma', y: PZ0.y - 12, mug: [236 + 18, 104], mugRot: 15 };
  const yOff = t < 1340 ? -12 : T.ramp(t, 1340, 1350, -12, 0, 'io');
  const rot = t < 1340 ? T.ramp(t, 1322, 1326, 0, 12, 'out') : T.ramp(t, 1340, 1350, 12, 0, 'io');
  if (t < 1340) return { ...p, pose: 'hold', expr: 'alarma', y: PZ0.y + yOff, rot };
  let expr = 'neutral', look = [8, 6];
  if (t >= 1350) { expr = 'esceptico'; look = [8, 4]; }
  if (t >= 1380) { expr = 'neutral'; look = [0, 6]; }
  const up = T.ramp(t, 1420, 1436, 0, 1, 'io');
  if (t >= 1420) expr = 'brindis';
  return { ...p, pose: 'sit', expr, look, y: PZ0.y + yOff, rot, arms: lerpPts(SIT.arms, BRINDIS.arms, up), mug: lerpPts(SIT.mug, BRINDIS.mug, up), steam: steamAlt(t), lid: RIG.blinkSlow(t, 1500, { down: 7, hold: 3, up: 10 }), squash: breath() };
}
function shot7(t, w) {
  const tc = tw(t);
  button(w);
  const pz = pausa7(t);
  pzShadow(w, { ...pz, y: PZ0.y, rot: 0 }, G);
  mugHalo(w, pz);
  PZ(w, pz);
  // tirón de Pausa: 2 líneas de movimiento detrás (f1322–1326)
  if (t >= 1322 && t <= 1326) w.black += R.strokeP('M560 1236 Q540 1256 548 1282 M548 1300 Q528 1318 536 1342', INK.black, 6, 'stroke-linecap="round" fill="none"');
  const c = chispa7(tc);
  const cp = { halo: 8, ...c };
  for (const kk of ['dust', 'front', 'dive']) delete cp[kk];
  if (c.front) cp.knockFor = ['blue', 'black']; // pasa por delante de Pausa dormida
  // sombra: en el suelo o, si vuela sobre el botón, sobre la tapa
  if (tc >= 1314 && tc <= 1361) w.black += R.liftedShadow(Math.min(CAP_X[1] - 70, Math.max(CAP_X[0] + 70, c.x - 20)), CAP_UP + 4, 82, 8);
  else chShadow(w, cp, G);
  if (c.dust) for (const dx of [-60, 60]) w.black += P.dust(c.x + dx, G - 6, 24, 0.9);
  w.black += RIG.limbHalo(cp, 16);
  CH(w, cp);
  if (c.dive) { const h = RIG.GC(cp, HAND[0], HAND[1]); w.black += `<circle cx="${f(h[0])}" cy="${f(h[1])}" r="${HAND_R}" fill="${INK.black}"/>`; }
  const h = RIG.pausaHandle(pz), a = RIG.chispaAnkle(cp);
  if (tc >= 1318 && tc <= 1360) w.black += P.leashTaut(h, a, cp.flip ? 20 : -20, 5, 1.5);
  else w.black += P.leashLoose(h, a, 60, { loopRot: cp.flip ? 20 : -20 });
  // cámara: empuje fuerte hacia la yema del dedo durante el congelado, y vuelta
  const FT = RIG.GC({ ...cp, x: 330, y: YDIVE, flip: true, lean: LEAN7, s: CS7, squash: 1 }, HAND[0], HAND[1] + HAND_R / CS7);
  let z = 1;
  if (t >= 1330 && t <= 1361) z = T.ramp(t, 1330, 1340, 1, 1.35, 'out');
  if (t > 1361) z = T.ramp(t, 1362, 1378, 1.35, 1, 'io');
  return { cam: { z, A: FT } };
}

// =====================================================================================
// PLANO 8 · Cierre y bucle · 1530–1679
// =====================================================================================
const KICK = [{ legL: [[-60, 90], [-80, 110]] }, { legL: [[-30, 98], [-36, 124]] }];
const F0 = { x: BTN.cx, y: Y1(778), s: CS1 }; // dibujo de f0
function chispa8(tc) {
  const base = { s: 1, x: 400, y: Y7, expr: 'euforia' };
  if (tc < 1630) {
    let y = Y7;
    const J = { 0: -50, 2: -76, 4: -50, 6: 0 };
    if (tc >= 1536 && tc <= 1542) y = Y7 + J[tc - 1536];
    if (tc >= 1560 && tc <= 1566) y = Y7 + J[tc - 1560];
    if (tc >= 1594 && tc <= 1598) y = Y7 + { 1594: -26, 1596: -38, 1598: 0 }[tc];
    const air = y !== Y7;
    const r = air ? { dx: 0 } : rest(tc);
    return { ...base, x: 400 + r.dx, y, pose: 'cheer', sweat: 2, sizzle: r.sizzle, burst: (tc >= 1536 && tc <= 1542) || (tc >= 1560 && tc <= 1566), blink: RIG.blinkFast(tc, [[1600, 1628]], 5) };
  }
  if (tc < 1660) {
    const kick = tc >= 1646 && tc <= 1652 ? KICK[((tc - 1646) / 2) % 2] : null;
    const r = rest(tc);
    return { ...base, x: 400 + r.dx, pose: 'stand', look: [-6, 6], limbs: kick, sizzle: r.sizzle };
  }
  if (tc === 1660) return { ...base, pose: 'shrug', squash: 0.86 };
  const K = { 1662: [390, 1220, 1.0, 'lunge'], 1664: [360, 1075, 1.01, 'lunge'], 1666: [330, 975, 1.02, 'lunge'], 1668: [298, 920, 1.03, 'hold'], 1670: [279, 892, 1.04, 'hold'], 1672: [269, 879, 1.045, 'hold'], 1674: [264, 874, 1.05, 'hold'], 1676: [262, 872, 1.05, 'hold'], 1678: [262, F0.y, 1.05, 'hold'] }[tc];
  const lunge = K[3] === 'lunge';
  return { ...base, x: K[0], y: K[1], s: K[2], pose: K[3], flip: tc < 1678, speed: lunge ? 4 : 0, look: tc >= 1676 ? [0, 4] : null, sweat: tc >= 1676 ? 2 : 0, squash: tc === 1662 ? 1.05 : 1 };
}
function pausa8(t) {
  const p = { ...PZ0, pose: 'sit', steam: steamAlt(t), squash: breath() };
  const lift = T.ramp(t, 1540, 1550, 0, 12, 'io');
  const br = { arms: [[204, -6, 226, -74 - lift]], mug: [234, -112 - lift] };
  const down = T.ramp(t, 1660, 1676, 0, 1, 'io');
  let expr = 'brindis', look;
  if (t >= 1640) { expr = 'esceptico'; look = [8, 4]; }
  if (t >= 1672) { expr = 'neutral'; look = [8, 6]; }
  const sq = t >= 1600 && t <= 1610 ? T.ramp(t, 1600, 1610, 0.96, 1, 'out') : 1;
  return { ...p, expr, look, arms: lerpPts(br.arms, SIT.arms, down), mug: lerpPts(br.mug, SIT.mug, down), squash: p.squash * sq };
}
function shot8(t, w) {
  const tc = tw(t);
  button(w);
  const pz = pausa8(t);
  pzShadow(w, pz, G);
  PZ(w, pz);
  const c = chispa8(tc);
  const cp = { ...c, halo: 8 }; delete cp.burst;
  const overCap = cp.x > CAP_X[0] && cp.x < CAP_X[1] && cp.y + 127 * cp.s < CAP_UP;
  chShadow(w, cp, overCap ? CAP_UP + 4 : G);
  w.black += RIG.limbHalo(cp, 16);
  CH(w, cp);
  if (c.burst) { const b = RIG.GC(cp, 6, -150); w.black += R.burst(b[0], b[1], 1.2); }
  const h = RIG.pausaHandle(pz);
  if (tc < 1654) w.black += P.leashLoose(h, RIG.chispaAnkle(cp), 120);
  else if (tc < 1660) {
    const a0 = RIG.chispaAnkle({ ...cp, pose: 'stand', limbs: null, x: 400, y: Y7, s: 1, squash: 1 });
    const kk = { 1654: 0.3, 1656: 0.65, 1658: 0.92 }[tc];
    const e = [a0[0] + (REST_END[0] - a0[0]) * kk, a0[1] + (REST_END[1] - a0[1]) * kk];
    w.black += P.leashLoose(h, e, 120 * (1 - kk) + 10, { loop: false }) + P.LOOP_OPEN(e[0], e[1], -30 * (1 - kk));
  } else w.black += P.leashRest(h, REST_END);
  return { cam: {} };
}

// =====================================================================================
// COMPOSICIÓN
// =====================================================================================
function frame(u, opt = {}) {
  R.resetUid();
  CUR_U = u;
  const t = opt.story ? u : storyT(u);
  if (opt.story) CUR_U = outOf(u);
  const w = L();
  let res;
  if (t < 120) res = shot1(t, w, opt);
  else if (t < 570) res = shot23(t, w);
  else if (t < 780) res = shot4(t, w);
  else if (t < 1050) res = shot5(t, w);
  else if (t < 1290) res = shot6(t, w);
  else if (t < 1530) res = shot7(t, w);
  else res = shot8(t, w);
  const scr = L();
  if (w.screenRed) { scr.red += w.screenRed; delete w.screenRed; }
  const cards = opt.cover ? [card('cover')] : LAY.cards.filter((c) => c.id !== 'cover');
  for (const c of cards) { const r = CAP.render(c, opt.cover ? 0 : t); if (r) add(c.world ? w : scr, r); }
  const tf = RIG.camTransform(res.cam || {});
  const out = { defs: (w.defs || '') + (scr.defs || '') };
  let o0 = '', o1 = '';
  if (res.clip) { out.defs += `<clipPath id="worldclip"><rect x="${res.clip[0]}" y="${res.clip[1]}" width="${res.clip[2]}" height="${res.clip[3]}"/></clipPath>`; o0 = '<g clip-path="url(#worldclip)">'; o1 = '</g>'; }
  for (const kk of ['blue', 'red', 'black']) out[kk] = `${o0}<g transform="${tf}">${w[kk] || ''}</g>${o1}${scr[kk] || ''}`;
  return out;
}

module.exports = { WIDTH, HEIGHT, FRAMES, STORY_FRAMES, CUTS, CARDS, storyT, outOf, prepare, setup, frame };
