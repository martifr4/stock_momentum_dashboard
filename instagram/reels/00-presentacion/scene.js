// Reel 00 · Presentación — «En tu cabeza viven dos». Escena: frame(t) → planchas SVG (función pura).
// Contrato: storyboard.md + captions.srt (1680 fotogramas, 30 fps). Motor: characters/riso/anim/.
// Chispa en «dos» (todo se muestrea en tc = par), Pausa en «unos» (interpolada), cámara y texto en «unos».
const fs = require('fs');
const path = require('path');
const R = require('../../characters/riso/riso.js');
const { T, RIG, PROPS: P, CAP } = require('../../characters/riso/anim/index.js');
const { INK, W, L, add, f } = R;

const WIDTH = 1080, HEIGHT = 1920, FRAMES = 1680;
let LAY = null; // tarjetas de subtítulo medidas + medidas sueltas

// =====================================================================================
// SUBTÍTULOS Y MEDIDAS (prepare: asíncrono, una vez; se guarda en JSON para los workers)
// =====================================================================================
const k = (t, ink = 'black', seg = 0) => ({ t, ink, seg });
const CARDS = [
  { id: 'c1', in: 0, out: 51, size: 112, base: [400, 510], lines: [[k('En tu cabeza')], [k('viven dos.')]] },
  { id: 'c2', in: 51, out: 156, size: 80, lines: [[k('Y '), k('una', 'red'), k(' acaba de')], [k('gastarse tu dinero.')]] },
  { id: 'c3', in: 156, out: 230, size: 96, noSlab: true, outline: { ink: 'red', w: 12 }, lines: [[k('Esta es '), k('Chispa.', 'red')]] },
  { id: 'c4', in: 230, out: 290, size: 80, segs: [230, 242, 254], lines: [[k('Rápida. ', 'black', 0), k('Impulsiva.', 'black', 1)], [k('Decide sin preguntar.', 'black', 2)]] },
  { id: 'c5', in: 290, out: 384, size: 96, segs: [290, 300, 310], base: [0], world: { x: 620, y: 960, rot: -4 }, lines: [[k('¡Ya, ', 'red', 0), k('ya, ', 'red', 1), k('ya!', 'red', 2)]] },
  { id: 'c6', in: 384, out: 446, size: 96, lines: [[k('Y esta es '), k('Pausa.', 'blue')]] },
  { id: 'c7', in: 446, out: 494, size: 80, lines: [[k('Tranquila.')], [k('Hace las cuentas…')]] },
  { id: 'c8', in: 494, out: 532, size: 96, lines: [[k('…cuando llega.')]] },
  { id: 'c9', in: 532, out: 570, size: 80, cx: 600, base: [930, 1010], lines: [[k('Espera…', 'blue')], [k('déjame pensarlo.', 'blue')]] },
  { id: 'c10', in: 570, out: 670, size: 96, lines: [[k('Ojo: '), k('Chispa', 'red')], [k('no es la mala.')]] },
  { id: 'c11', in: 670, out: 724, size: 80, base: [400, 480], lines: [[k('Sin ella, tardarías')], [k('media hora…')]] },
  { id: 'c12', in: 724, out: 780, size: 80, lines: [[k('…en cruzar la calle.')]] },
  { id: 'c13', in: 780, out: 850, size: 76, base: [380, 456], lines: [[k('El problema:')], [k('Chispa', 'red'), k(' decide primero.')]] },
  { id: 'c14', in: 850, out: 960, size: 80, lines: [[k('Pausa', 'blue'), k(' llega tarde.')]] },
  { id: 'c15', in: 960, out: 1050, size: 80, lines: [[k('Y cuando llega…')], [k('Chispa', 'red'), k(' ya ha pagado.')]] },
  { id: 'c16', in: 1050, out: 1130, size: 68, segs: [1050, 1074, 1092], lines: [[k('Ofertas flash.', 'black', 0)], [k('Cuentas atrás. ', 'black', 1), k('«Quedan 2».', 'black', 2)]] },
  { id: 'c17', in: 1130, out: 1210, size: 76, lines: [[k('Todo está diseñado')], [k('para hablar con '), k('Chispa', 'red'), k('…')]] },
  { id: 'c18', in: 1210, out: 1330, size: 80, lines: [[k('…antes de que')], [k('Pausa', 'blue'), k(' se entere.')]] },
  { id: 'c19', in: 1330, out: 1410, size: 80, lines: [[k('Todos tenemos una')], [k('Chispa', 'red'), k(' y una '), k('Pausa', 'blue'), k('.')]] },
  { id: 'c20', in: 1410, out: 1530, size: 76, lines: [[k('Aquí enseñamos a '), k('Pausa', 'blue')], [k('a llegar a tiempo.')]] },
  { id: 'c21', in: 1530, out: 1590, size: 112, base: [410, 522], lines: [[k('¿Quién manda')], [k('en tu cabeza?')]] },
  { id: 'c22', in: 1590, out: 1680, size: 96, base: [420], segs: [1590, 1594, 1600], lines: [[k('Comenta ', 'black', 0), { dot: 'red', r: 30, seg: 1 }, k(' o ', 'black', 0), { dot: 'blue', r: 30, seg: 2 }]] },
  { id: 'c22b', in: 1590, out: 1680, size: 40, st: 'mono', ls: 0.06, base: [520], lines: [[k('@dinero_irracional')]] },
  // frase de Pausa durante el tirón (decisión del dueño): junto a quien habla, en azul
  { id: 'chispaNo', in: 1322, out: 1362, size: 60, cx: 795, base: [1172], lines: [[k('Chispa, no.', 'blue')]] },
  // portada
  { id: 'cover', in: -1e9, out: 1e9, size: 150, maxW: 880, base: [470, 610], lines: [[k('En tu cabeza')], [k('viven dos.')]] },
];
const TICKET = { w: 150, pts: [[900, 900], [920, 990], [560, 1170], [560, 1425]] };

async function prepare(M) {
  const cards = await CAP.prepare(M, CARDS);
  // «¡Ya, ya, ya!» anclado al mundo: que no pase de x 930 (zona segura) — se corre a la izquierda si hace falta
  const c5 = cards.find((c) => c.id === 'c5');
  const w5 = c5.lines[0].w;
  c5.world.x = Math.min(620, Math.round(925 - w5 * Math.cos((4 * Math.PI) / 180)));
  const sfx = { clac: await M.width([{ t: '¡CLAC!', st: 'head', ls: -0.01 }], 84), ding: await M.width([{ t: '¡DING!', st: 'head', ls: -0.01 }], 72) };
  // total del ticket: importe en Bricolage 800 al mayor tamaño que quepa en el ancho de la tira
  let amountSize = 38;
  while (amountSize > 20 && (await M.width([{ t: '189,99 €', st: 'head' }], amountSize)) > TICKET.w - 22) amountSize -= 1;
  let labelSize = 30;
  while (labelSize > 16 && (await M.width([{ t: 'TOTAL', st: 'mono', ls: 0.08 }], labelSize)) > TICKET.w - 30) labelSize -= 1;
  return { cards, sfx, amountSize, labelSize, safe: CAP.checkSafe(cards.filter((c) => c.id !== 'cover')) };
}
async function setup(cfg) { LAY = JSON.parse(fs.readFileSync(cfg.layout, 'utf8')); }
const card = (id) => LAY.cards.find((c) => c.id === id);

// =====================================================================================
// AYUDAS
// =====================================================================================
const tw = (t) => T.onTwos(t);
const CH = (o, p) => { add(o, R.chispa(p)); return p; };
const PZ = (o, p) => { add(o, R.pausa(p)); return p; };
function chShadow(o, c, G) {
  const feet = c.y + 127 * c.s, h = G - feet;
  if (h < 8) o.black += R.shadowEllipse(c.x, G, 100 * c.s, 12, INK.black, 7, 2.6);
  else o.black += R.liftedShadow(c.x, G, Math.max(46, 100 * c.s - h * 0.12), 10);
}
const pzShadow = (o, p, G) => { o.black += R.shadowEllipse(p.x + (p.flip ? -8 : 8), G, 205 * p.s, 13, INK.black, 7, 2.6); };
// vapor alterno cada 8 f
const steamAlt = (t) => (Math.floor(t / 8) % 2 ? 'vapor2' : 'vapor');
// respiración de Pausa en reposo (periodo 120 f: 1680 = 14 ciclos, así el bucle no salta)
const breath = (t) => RIG.breathe(t, 120, 0.015);
// reposo de Chispa: vibración ±1 en dos + chisporroteo de lóbulos
const rest = (tc, amp = 1) => ({ dx: T.jitter(tc, amp), sizzle: Math.floor(tc / 2) % 2 === 1 });
const lerpPts = (a, b, k2) => a.map((v, i) => (Array.isArray(v) ? lerpPts(v, b[i], k2) : v + (b[i] - v) * k2));
const SIT = R.PAUSA_POSES.sit, BRINDIS = R.PAUSA_POSES.brindis, SORBO = R.PAUSA_POSES.sorbo;

// decorado compartido 1 / 7 / 8 («el botón»)
const BTN = { cx: 320, G: 1400 };
const PZ0 = { x: 830, y: 1324, s: 0.62, flip: true };
const REST_END = [520, 1402];

// =====================================================================================
// PLANO 1 · Gancho · 0–119
// =====================================================================================
const COINS = [[-10, -46, 0], [-7, -52, 20], [-4, -54, 45], [-1, -50, 80], [3, -53, 15], [6, -48, 60], [9, -42, 30], [12, -38, 70], [-13, -36, 10], [15, -44, 55], [-2, -40, 35], [5, -34, 90]];
function coinsAt(tc, { minY = -1e9 } = {}) {
  let s = '';
  if (tc < 6 || tc > 62) return s;
  const tt = tc - 6, kk = tt / 2;
  COINS.forEach(([vx, vy, rot0], i) => {
    const x = 320 + vx * tt, y = 1240 + vy * tt + 1.2 * tt * tt;
    if (y > 1960 || y < minY) return;
    const edge = (kk + i + 1) % 2 === 1; // las impares (c1, c3…) empiezan de canto
    s += P.coinBlank(x, y, 26, rot0 + 40 * kk, edge);
  });
  return s;
}
function chispa1(tc) {
  // claves del storyboard (todas en pares)
  const base = { s: 1.2, x: 320, pose: 'hold', expr: 'euforia', look: [0, 4], sweat: 2 };
  if (tc <= 4) return { ...base, y: { 0: 778, 2: 818, 4: 908 }[tc], fall: true };
  if (tc <= 10) return { ...base, pose: 'golpe', y: { 6: 1078, 8: 1086, 10: 1090 }[tc], squash: { 6: 0.9, 8: 0.95, 10: 1 }[tc], halo: 8 };
  if (tc <= 16) return { ...base, pose: 'cheer', y: { 12: 1070, 14: 1100, 16: 1110 }[tc], squash: { 12: 1.04, 14: 1, 16: 0.95 }[tc], halo: 8 };
  if (tc <= 50) {
    const ph = ((tc - 18) / 2) % 4;
    return { ...base, pose: 'cheer', y: 1110 + [0, -30, -44, -30][ph], squash: ph === 0 ? 0.95 : 1, halo: 8 };
  }
  if (tc <= 98) { const r = rest(tc); return { ...base, x: 320 + r.dx, pose: 'happy', expr: 'feliz', look: [0, 2], y: 1110, sweat: 0, sweatIdx: [1], halo: 8, sizzle: r.sizzle }; }
  if (tc <= 106) return { ...base, pose: 'shrug', look: [6, 0], y: 1110, squash: tc === 100 ? 0.9 : 0.86, halo: 8 };
  const path1 = { 108: [380, 1000], 110: [500, 880], 112: [640, 800], 114: [790, 770], 116: [950, 790], 118: [1110, 840] }[tc];
  return { ...base, pose: 'lunge', look: [6, 0], x: path1[0], y: path1[1], speed: 4, lean: -12, sweat: 3, squash: tc === 108 ? 1.06 : 1 };
}
function shot1(t, w, opt = {}) {
  const tc = tw(t);
  // Pausa (unos): sentada, sin enterarse; parpadeo lento f70–100
  const pz = { ...PZ0, pose: 'sit', expr: 'neutral', look: [8, 6], lid: RIG.blinkSlow(t, 70, { down: 8, hold: 8, up: 14 }), steam: steamAlt(t), squash: breath(t) };
  pzShadow(w, pz, 1400);
  PZ(w, pz);
  w.black += P.leashRest(RIG.pausaHandle(pz), REST_END);
  // botón: levantado f0–5; pulsado f6–107; al soltarse salta 6 px (f108) y vuelve (f110)
  add(w, P.buyButton(BTN.cx, BTN.G, { pressed: t >= 6 && t < 108, lift: t >= 108 && t < 110 ? 6 : 0 }));
  // monedas (dos), por delante de Pausa con su halo de reserva
  w.blue += coinsAt(tc, opt);
  // Chispa
  const c = chispa1(tc);
  if (c.fall) { w.black += R.liftedShadow(320, 1238, 104 - (908 - c.y) * 0.1, 7); w.black += P.fallLines(c.x, c.y - 203); }
  const knock = (tc >= 6 && tc <= 62) || (tc >= 112 && tc <= 118) ? ['blue'] : null;
  const cp = { ...c, knockFor: knock };
  delete cp.fall;
  CH(w, cp);
  if (tc >= 6 && tc <= 10) for (const sx of [-70, 70]) { const h = RIG.GC(cp, sx, 136); w.black += R.burst(h[0], h[1] + 16, 0.9); }
  // «¡CLAC!» f6–19 (sello 1,3 → 1,0)
  if (!opt.cover && t >= 6 && t <= 19) w.black += P.sfxText(520, 1150, '¡CLAC!', { size: 84, rot: -8, sc: [1.3, 1.15, 1][Math.min(t - 6, 2)], approxW: LAY.sfx.clac });
  const shake = opt.cover ? [0, 0] : RIG.shakeTable(t, 6, { 0: [0, 14], 1: [-8, -6], 2: [6, 4], 3: [-3, -2] });
  return { cam: { shake } };
}

// =====================================================================================
// PLANOS 2–3 · mundo continuo (Chispa → paneo → Pausa)
// =====================================================================================
const TAG_STAND = { pole: [700, 1400, 1150], arm: 640 };
const ARM_TAG = { armR: [[150, 18], [176, -18]] };
function chispa23(tc) {
  const base = { s: 1.3, y: 1235, expr: 'euforia', look: null };
  if (tc <= 130) { const r = RIG.runCycle(tc, 120, { x0: -260, dx: 110, y0: 1235, bob: -14 }); return { ...base, pose: r.pose, x: r.x, y: r.y, speed: 4, lean: -12 }; }
  if (tc === 132) return { ...base, pose: 'corre_a', x: 400, speed: 4, lean: -12, limbs: ARM_TAG, tag: 'hand', grab: true };
  if (tc <= 154) {
    const x = { 134: 450, 136: 485, 138: 505, 140: 515 }[tc] ?? 520;
    const r = tc >= 142 ? rest(tc) : { dx: 0 };
    return { ...base, pose: 'frena', x: x + r.dx, lean: 8, expr: tc >= 146 ? 'euforia' : 'alarma', limbs: ARM_TAG, tag: 'hand', dust: tc <= 146 };
  }
  if (tc <= 188) { const r = tc >= 160 ? rest(tc) : { dx: 0, sizzle: false }; return { ...base, pose: 'stand', x: 520 + r.dx, y: tc === 156 ? 1219 : tc === 158 ? 1239 : 1235, expr: 'feliz', look: [0, 2], limbs: ARM_TAG, tag: 'hand', sizzle: r.sizzle }; }
  if (tc <= 228) { const r = rest(tc); return { ...base, pose: 'stand', x: 520 + r.dx, expr: 'neutral', look: [0, 2], limbs: ARM_TAG, tag: 'hand', tagRot: { 190: 10, 192: -6, 194: 10 }[tc], sizzle: r.sizzle, blink: RIG.blinkFast(tc, [[196, 228]], 3) }; }
  if (tc <= 252) {
    const hop = { 230: -24, 232: -30, 234: -12 }[tc] ?? 0;
    const r = tc >= 236 ? rest(tc) : { dx: 0 };
    return { ...base, pose: 'stand', x: 520 + r.dx, y: 1235 + hop, expr: 'euforia', look: [0, 2], limbs: ARM_TAG, tag: 'hand', tagRot: tc >= 242 && tc <= 250 ? [10, -10][((tc - 242) / 2) % 2] : 10, sweatIdx: tc >= 242 ? [1] : null };
  }
  if (tc <= 288) { const r = rest(tc); return { ...base, pose: 'hips', x: 520 + r.dx, expr: 'orgullosa', look: [0, 2], tag: 'hips', sweatIdx: [1], sizzle: r.sizzle }; }
  if (tc <= 328) {
    let off = 0;
    for (const k0 of [290, 300, 310]) if (tc >= k0 && tc <= k0 + 8) off = [0, -36, -50, -36, 0][(tc - k0) / 2];
    if (tc >= 320) off = { 320: 0, 322: -20, 324: -40, 326: -40, 328: -40 }[tc];
    return { ...base, pose: 'cheer', x: 520, y: 1235 + off, sweat: 3, tag: 'cheer', burst: tc < 320 };
  }
  // plano 3: el 4.º saltito «en seises» (se cierra el arco y aterriza en f384)
  const y = T.step([[330, 1185], [336, 1177], [342, 1173], [348, 1173], [354, 1177], [360, 1185], [366, 1185], [372, 1199], [378, 1217], [384, 1235]])(tc);
  return { ...base, pose: 'cheer', x: 520, y, sweat: 3, tag: 'cheer' };
}
function camX3(t) { return t < 330 ? 0 : t >= 420 ? 700 : 700 * (1 - Math.cos(Math.PI * ((t - 330) / 90))) / 2; }
function shot23(t, w) {
  const tc = tw(t);
  // percha de la etiqueta (negra). El tirón de f132 la tumba hacia la derecha (dos): así no cruza a Chispa
  const fall = tc < 134 ? 0 : { 134: 14, 136: 38, 138: 66, 140: 86, 142: 80, 144: 90 }[tc] ?? 90;
  const c = chispa23(tc);
  let st = `<path d="M700 1396 L700 1150 L640 1150" fill="none" stroke="${INK.black}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (tc < 132) {
    st += R.strokeP('M640 1150 L640 1176', INK.black, 3.5);
    w.red += R.priceTag(640, 1205, 10, '−70 %', 0.42);
  } else {
    const sw = tc <= 150 ? [6, -6][((tc - 132) / 2) % 2] : 0; // hilo roto que se balancea (2 dibujos)
    st += `<g transform="rotate(${sw - fall} 640 1150)">${R.strokeP('M640 1150 L640 1185', INK.black, 3.5, 'stroke-linecap="round"')}</g>`;
  }
  w.black += `<g transform="rotate(${fall} 700 1396)">${st}</g>`;
  if (tc === 140 || tc === 142) w.black += P.dust(930, 1394, 18, 0.8);
  // polvo del frenazo (dos): crece r 10 → 34 y se deshace f134–146
  if (c.dust) {
    const kk = (tc - 134) / 12;
    for (const dx of [-20, 70]) w.black += P.dust(c.x + dx * 1.3, 1392, 10 + 24 * kk, 1 - 0.8 * Math.max(0, kk - 0.4) / 0.6);
  }
  chShadow(w, c, 1400);
  const cp = { ...c, halo: c.tag ? 8 : 0 };
  for (const kk2 of ['tag', 'grab', 'dust', 'tagRot', 'burst']) delete cp[kk2];
  // etiqueta en la mano (antes que Chispa: su halo la recorta)
  if (c.tag === 'hand') { const h = RIG.GC(cp, 176, -18); w.red += R.priceTag(h[0] + 70, h[1] - 8, c.tagRot ?? 10, '−70 %', 0.42); }
  if (c.tag === 'hips') { const h = RIG.GC(cp, 108, 64); w.red += R.priceTag(h[0] + 64, h[1] + 16, 8, '−70 %', 0.42); }
  if (c.tag === 'cheer') { const h = RIG.GC(cp, 136, -42); w.red += R.priceTag(h[0] + 58, h[1] - 22, -14, '−70 %', 0.42); }
  CH(w, cp);
  if (c.burst) { const b = RIG.GC(cp, 6, -150); w.black += R.burst(b[0], b[1], 1.1); }
  // salpicadura detrás de «Chispa.» (subtítulo 3): f156 pequeña, f158 grande, f160–229 asentada
  if (t >= 156 && t < 230) {
    const sp = card('c3').lines[0].spans[1];
    const bx = sp.x + sp.w / 2 + 18, by = card('c3').lines[0].base - 96 * 0.34 + 10;
    w.screenRed = P.inkSplash(bx, by, t < 158 ? 0 : t < 160 ? 1 : 2, { rx: 1.55 });
  }
  // ---- plano 3: Pausa (unos) y el gag de la plancha azul ----
  if (t >= 330) {
    const look = t < 458 ? [-4, 6] : T.ramp(t, 458, 470, 0, 1, 'io') < 1 ? T.mix([-4, 6], [0, 6], T.ramp(t, 458, 470, 0, 1, 'io')) : [0, 6];
    // sorbo 500–514 (sube), 514–526 bebe, 526–540 baja; parpadeo lentísimo 540–569
    let arms = SIT.arms, mug = SIT.mug, lid = 0.5;
    if (t >= 500 && t < 540) {
      const up = t < 514 ? T.ramp(t, 500, 514, 0, 1, 'io') : t < 526 ? 1 : T.ramp(t, 526, 540, 1, 0, 'io');
      arms = lerpPts(SIT.arms, SORBO.arms, up); mug = lerpPts(SIT.mug, SORBO.mug, up);
      lid = t < 514 ? 0.5 : t < 526 ? T.ramp(t, 514, 526, 0.5, 0.8, 'io') : T.ramp(t, 526, 540, 0.8, 0.5, 'io');
    }
    const bl = RIG.blinkSlow(t, 540, { down: 8, hold: 8, up: 13 });
    if (bl != null) lid = bl;
    const sq = t < 494 ? 1 : T.track([[494, 0.96], [498, 0.98, 'out'], [504, 1, 'out']])(t);
    const pz = { x: 1330, y: 1260, s: 1.15, pose: 'sit', expr: 'neutral', look, lid, arms, mug, steam: steamAlt(t), squash: sq * breath(t) };
    pzShadow(w, pz, 1400);
    const layers = R.pausa(pz);
    // plancha azul: fuera de cuadro hasta f458, entra deslizándose (ease-out) y encaja en f494
    const [dx, dy, rot] = t < 458 ? [720, 40, 3] : RIG.latePlate(t, 458, 494, [720, 40, 3], 'out');
    RIG.shiftPlate(layers, 'blue', dx, dy, rot, 1330, 1260);
    add(w, layers);
  }
  return { cam: { x: camX3(t) } };
}

// =====================================================================================
// PLANO 4 · El giro · 570–779
// =====================================================================================
const PANEL = [60, 600, 1020, 1440];
function shot4(t, w) {
  const tc = tw(t);
  if (t < 610) { // 4a · Chispa saca pecho
    const s = { 570: 1.45, 572: 1.7, 574: 1.62 }[tc] ?? 1.6;
    const r = tc >= 576 ? rest(tc) : { dx: 0 };
    const c = { x: 500 + r.dx, y: 1150 + (tc === 572 ? -10 : 0), s, pose: 'hips', expr: tc >= 592 ? 'feliz' : 'orgullosa', look: [0, 2], lean: 6, sweatIdx: [1], sizzle: r.sizzle };
    w.black += R.shadowEllipse(500, 1360, 100 * s, 14, INK.black, 7, 2.6);
    CH(w, c);
    if (tc >= 572 && tc <= 580) { const b = RIG.GC(c, 4, -150); w.black += R.burst(b[0], b[1] - 6, 1.3); }
    return { cam: {} };
  }
  const inner = L();
  if (t < 670) { // 4b · el balón
    let c = { x: 480, y: 1250, s: 1.1, pose: 'stand', expr: 'neutral', look: [0, 2] };
    if (tc >= 614) c = { ...c, expr: 'alarma', look: [6, 0] };
    if (tc >= 620 && tc <= 634) { const r = rest(tc, 2); c = { ...c, x: 480 + r.dx, y: 1296, lean: -16, pose: 'agachada', sweat: 2 }; }
    if (tc >= 636) { const r = tc >= 640 ? rest(tc) : { dx: 0 }; c = { ...c, x: 480 + r.dx, y: tc === 636 ? 1230 : 1250, pose: 'cheer', expr: 'orgullosa', look: null, lean: 0, sweat: 0, sizzle: r.sizzle }; }
    inner.black += R.shadowEllipse(480, 1390, 110, 12, INK.black, 7, 2.6);
    CH(inner, c);
    if (tc === 636 || tc === 638) { const b = RIG.GC(c, 6, -150); inner.black += R.burst(b[0], b[1], 1.1); }
    if (t >= 618 && t <= 634) { // balón en unos
      const bx = 1000 - 64 * (t - 618);
      inner.black += P.motionLines(bx + 56, 1090, { dir: 1, len: 60, gap: 24 }) + P.ball(bx, 1090, 46, -30 * (t - 618));
    }
    add(w, RIG.clipLayers(inner, PANEL[0] + 4, PANEL[1] + 4, PANEL[2] - PANEL[0] - 8, PANEL[3] - PANEL[1] - 8));
    w.black += P.panelFrame(...PANEL);
    return { cam: {} };
  }
  // 4c · Pausa y el semáforo
  inner.black += P.zebra(60, 1330, 1020, 1440, { from: 380 });
  const red = t >= 744;
  add(inner, P.trafficLight({ red, blue: !red }));
  if (t >= 744 && t <= 750) { for (const [bx, by, rr] of [[820, 718, 0], [748, 760, -60], [892, 760, 60]]) inner.black += `<g transform="rotate(${rr} ${bx} ${by})">${R.burst(bx, by, 1)}</g>`; }
  let look = [8, 4];
  if (t >= 680) look = T.mix([8, 4], [-10, 4], T.ramp(t, 680, 690, 0, 1, 'io'));
  if (t >= 700) look = T.mix([-10, 4], [10, 4], T.ramp(t, 700, 710, 0, 1, 'io'));
  if (t >= 716) look = T.mix([10, 4], [-10, 4], T.ramp(t, 716, 726, 0, 1, 'io'));
  const x = t < 730 ? 250 : T.ramp(t, 730, 744, 250, 262, 'in');
  const pose = t >= 730 && t < 746 ? 'llega' : 'sit';
  let expr = 'neutral';
  if (t >= 750) expr = 'alarma';
  if (t >= 760) { expr = 'esceptico'; look = [-6, 6]; }
  if (t >= 750 && t < 760) look = undefined;
  const sq = t >= 760 ? T.track([[760, 1], [770, 0.97, 'io'], [779, 1, 'io']])(t) : 1;
  const pz = { x, y: 1232, s: 0.8, pose, expr, look, squash: sq * breath(t), steam: pose === 'sit' ? steamAlt(t) : undefined };
  pzShadow(inner, pz, 1330);
  PZ(inner, pz);
  const n = t < 690 ? 0 : t < 714 ? (t >= 706 ? 3 : t >= 698 ? 2 : 1) : t < 746 ? (t >= 738 ? 3 : t >= 730 ? 2 : t >= 722 ? 1 : 0) : 0;
  inner.blue += P.thinkDots([[300, 1080], [330, 1062], [360, 1050]], n);
  if (t >= 760) { const s0 = RIG.GP(pz, 10, -150); inner.red += R.pausaSweat(s0[0], s0[1], 0.8); }
  add(w, RIG.clipLayers(inner, PANEL[0] + 4, PANEL[1] + 4, PANEL[2] - PANEL[0] - 8, PANEL[3] - PANEL[1] - 8));
  w.black += P.panelFrame(...PANEL);
  return { cam: { shake: RIG.shakeTable(t, 744, { 0: [0, 6], 1: [-4, -3], 2: [2, 2] }) } };
}

// =====================================================================================
// PLANO 5 · El problema · 780–1049 (pantalla partida)
// =====================================================================================
const PA = [60, 560, 1020, 990], PB = [60, 1010, 1020, 1450];
const SLAM = { armL: [[-136, 10], [-120, -26]], armR: [[150, 0], [147, 56]] }; // un puño sobre las teclas
function chispa5(tc) {
  const base = { s: 0.85, y: 852, expr: 'euforia', knockFor: ['black'] };
  if (tc <= 802) { const r = RIG.runCycle(tc, 780, { x0: 100, dx: 500 / 11, y0: 852, bob: -12 }); return { ...base, pose: r.pose, x: r.x, y: r.y, speed: 4, lean: -12 }; }
  if (tc === 804) return { ...base, pose: 'frena', x: 610, lean: 8 };
  if (tc === 806) return { ...base, pose: 'hold', x: 610, y: 822, squash: 1.04 };
  if (tc === 808) return { ...base, pose: 'golpe', limbs: SLAM, x: 610, y: 812, squash: 0.94 };
  if (tc === 810) return { ...base, pose: 'golpe', limbs: SLAM, x: 610, y: 818 };
  if (tc <= 962) { const bob = (tc - 812) % 12 === 6 ? -10 : 0; return { ...base, pose: 'compra', x: 610, y: 852 + bob, expr: 'feliz', look: [4, 6], sizzle: Math.floor(tc / 2) % 2 === 1, squash: tc === 812 ? 0.92 : 1 }; }
  return { ...base, pose: 'compra', x: 610 + (490 * (tc - 962)) / 18, expr: 'feliz', speed: 4, lean: -12 };
}
function shot5(t, w) {
  const tc = tw(t);
  const A = L(), B = L();
  // panel A: caja + Chispa (Chispa va delante del ticket: se añade al final)
  const rung = tc >= 810;
  A.black += P.register({ display: rung ? '189,99' : '0,00', drawerOut: rung ? 30 : 0 });
  if (tc >= 810 && tc <= 816) A.black += R.burst(800, 750, 1.1);
  // panel B: Pausa camina lentísima (unos)
  const arrived = t >= 960;
  const x = arrived ? 240 : 100 + (140 * (t - 780)) / 180;
  const y = 1332 + (arrived ? 0 : 4 * Math.sin(((t - 780) / 30) * 2 * Math.PI));
  const pz = { x, y, s: 0.8, pose: 'llega', expr: arrived ? 'jadeo' : 'neutral', look: arrived ? undefined : [6, 6] };
  B.black += R.shadowEllipse(x + 6, 1430, 170, 12, INK.black, 7, 2.6);
  const pl = R.pausa(pz);
  if (arrived) { const kk = t < 990 ? 0 : T.ramp(t, 990, 1010, 0, 1, 'out'); RIG.shiftPlate(pl, 'blue', 12 * (1 - kk), 7 * (1 - kk)); }
  add(B, pl);
  if (arrived) { const s0 = RIG.GP(pz, 10, -150); B.red += R.pausaSweat(s0[0], s0[1], 0.85); }
  add(w, RIG.clipLayers(A, PA[0] + 4, PA[1] + 4, PA[2] - PA[0] - 8, PA[3] - PA[1] - 8));
  add(w, RIG.clipLayers(B, PB[0] + 4, PB[1] + 4, PB[2] - PB[0] - 8, PB[3] - PB[1] - 8));
  w.black += P.panelFrame(...PA) + P.panelFrame(...PB);
  // ticket (dos): rompe los marcos
  const total = P.polyLen(TICKET.pts);
  if (tc >= 814) add(w, P.ticketGrow(TICKET.pts, TICKET.w, { len: tc >= 960 ? total + 1 : (total * (tc - 814)) / 146, labelSize: LAY.labelSize, amountSize: LAY.amountSize, amountFont: R.FONT_HEAD, amountWeight: 800, amountStretch: '75%' }));
  // Chispa delante (recortada al panel A)
  const C = L();
  const c = chispa5(tc);
  if (c.x < 1200) { C.black += c.y >= 846 ? R.shadowEllipse(c.x, 960, 86, 10, INK.black, 7, 2.4) : R.liftedShadow(c.x, 960, 70, 8); C.black += RIG.limbHalo(c, 18); CH(C, c); }
  add(w, RIG.clipLayers(C, PA[0] + 4, PA[1] + 4, PA[2] - PA[0] - 8, PA[3] - PA[1] - 8));
  if (t >= 810 && t <= 825) w.black += P.sfxText(742, 738, '¡DING!', { size: 72, rot: 6, sc: [1.3, 1.15, 1][Math.min(t - 810, 2)], approxW: LAY.sfx.ding });
  // empuje final hacia el total
  const z = t < 990 ? 1 : T.ramp(t, 990, 1004, 1, 1.6, 'out');
  return { cam: { z, A: [560, 1363] }, clip: t >= 990 ? [0, 540, 1080, 940] : null };
}

// =====================================================================================
// PLANO 6 · El villano · 1050–1289
// =====================================================================================
const SIGNS = [
  { kind: 'sign', label: 'OFERTA FLASH', at: [252, 1250], rot: 5, f0: 1050, opt: { w: 390, h: 94, size: 56 } },
  { kind: 'count', at: [188, 1094], rot: -8, f0: 1068, s: 0.84 },
  { kind: 'sign', label: 'QUEDAN 2', at: [752, 1066], rot: 8, f0: 1086, opt: { w: 300, h: 94, size: 56 } },
  { kind: 'sign', label: 'SOLO HOY', at: [512, 856], rot: -3, f0: 1104, opt: { w: 300, h: 88, size: 50 } },
  { kind: 'tag', label: '−70 %', at: [270, 908], rot: -12, f0: 1118, s: 0.6 },
  { kind: 'tag', label: '−50 %', at: [764, 896], rot: 13, f0: 1130, s: 0.56 },
];
const LANDS = SIGNS.map((s) => s.f0 + 6);
function signPose(sg, t) {
  if (t < sg.f0) return null;
  const land = sg.f0 + 6;
  if (t < land) { const kk = T.EASE.easeInCubic((t - sg.f0) / 6); return { y: sg.at[1] - 700 * (1 - kk), rot: sg.rot * kk }; }
  const off = T.track([[land, 18], [land + 2, -6], [land + 4, 0]])(t);
  return { y: sg.at[1] + off, rot: sg.rot };
}
function shot6(t, w) {
  const tc = tw(t);
  // Pausa dormida en la esquina (unos)
  const pz = { x: 830, y: 1350, s: 0.5, pose: 'duerme', expr: 'dormida', squash: 0.975 + 0.025 * Math.cos(((t - 1050) / 40) * 2 * Math.PI) };
  w.black += R.shadowEllipse(850, 1411, 110, 9, INK.black, 6, 2.2);
  PZ(w, pz);
  if (t >= 1220 && t < 1250) w.blue += R.text(858, 1236, 'Z', { size: 72, fill: INK.blue, rot: -8 });
  else { const kk = ((t - 1050) % 30) / 30; w.blue += R.text(838, 1262 - 40 * kk, 'z z z', { size: 44, fill: INK.blue, rot: -8 }); }
  // carteles (unos): caen con ease-in y rebotan
  const sec = t < 1080 ? 59 : 59 - Math.floor((t - 1080) / 10);
  for (const sg of SIGNS) {
    const p = signPose(sg, t);
    if (!p) continue;
    if (sg.kind === 'sign') w.red += R.sign(sg.at[0], p.y, p.rot, sg.label, sg.opt);
    if (sg.kind === 'tag') w.red += R.priceTag(sg.at[0], p.y, p.rot, sg.label, sg.s);
    if (sg.kind === 'count') w.black += P.countdown(sg.at[0], p.y, p.rot, sg.s, `00:${String(sec).padStart(2, '0')}`);
  }
  // Chispa delante de todo
  let flinch = 0;
  for (const L0 of LANDS) if (tc === L0) flinch = -8;
  const esp = tc >= 1150;
  const r = esp ? rest(tc, 2) : { dx: 0, sizzle: false };
  const c = { x: 500 + r.dx, y: 1060 + flinch, s: 1.15, pose: 'tiesa', halo: 9, expr: esp ? 'espiral' : tc >= 1056 ? 'alarma' : 'neutral', look: tc < 1056 ? [0, -6] : null, sweat: tc >= 1092 ? 3 : 0, spin: (tc / 2) % 2, sizzle: r.sizzle };
  w.black += R.shadowEllipse(500, 1210, 118, 12, INK.black, 7, 2.6);
  CH(w, c);
  // cámara: temblor en cada aterrizaje + empuje lento
  let shake = [0, 0];
  for (const L0 of LANDS) { const s0 = RIG.shakeTable(t, L0, { 0: [0, 10], 1: [-6, -4], 2: [3, 2] }); if (s0[0] || s0[1]) shake = s0; }
  const z = t < 1200 ? 1 : T.ramp(t, 1200, 1289, 1, 1.12, 'io');
  return { cam: { z, A: [500, 1000], shake } };
}

// =====================================================================================
// PLANO 7 · La promesa · 1290–1529
// =====================================================================================
const REACH = { armR: [[150, 60], [190, 110]] };
function chispa7(tc) {
  const base = { s: 1, expr: 'euforia' };
  if (tc <= 1308) {
    const p0 = T.step([[1290, [580, 1273]], [1296, [560, 1267]], [1302, [540, 1273]], [1308, [520, 1267]]])(tc);
    return { ...base, pose: 'tiesa', x: p0[0], y: p0[1], expr: 'espiral', spin: (tc / 2) % 2, sizzle: (tc / 2) % 2 === 1 };
  }
  if (tc === 1310) return { ...base, pose: 'tiesa', x: 520, y: 1273 };
  if (tc === 1312) return { ...base, pose: 'shrug', x: 520, y: 1273, squash: 0.88 };
  if (tc <= 1320) {
    const p0 = { 1314: [470, 1180], 1316: [430, 1130], 1318: [405, 1112], 1320: [395, 1110] }[tc];
    return { ...base, pose: 'lunge', flip: true, limbs: REACH, x: p0[0], y: p0[1], speed: 4, halo: 8, squash: tc === 1314 ? 1.05 : 1 };
  }
  if (tc <= 1360) {
    const dx = tc <= 1328 ? T.jitter(tc, 3, 1322) : 0;
    return { ...base, pose: 'lunge', flip: true, limbs: REACH, x: 395 + dx, y: 1110, expr: 'alarma', halo: 8 };
  }
  if (tc <= 1366) {
    const p0 = { 1362: [420, 1180], 1364: [470, 1250], 1366: [530, 1273] }[tc];
    return { ...base, pose: 'shrug', flip: true, x: p0[0], y: p0[1], expr: 'alarma', squash: tc === 1366 ? 0.88 : 1, dust: tc === 1366 };
  }
  const r = rest(tc);
  if (tc < 1380) return { ...base, pose: 'stand', x: 530 + r.dx, y: 1273, expr: 'esceptico', look: [8, 0], sizzle: r.sizzle, dust: tc === 1368 };
  if (tc < 1424) return { ...base, pose: 'stand', x: 530 + r.dx, y: 1273, expr: 'neutral', look: [0, 2], sweatIdx: [1], sizzle: r.sizzle, blink: RIG.blinkFast(tc, [[1384, 1422]], 11) };
  return { ...base, pose: 'happy', x: 530 + r.dx, y: 1273, expr: tc < 1470 ? 'feliz' : 'orgullosa', look: tc < 1470 ? null : [0, 2], sweatIdx: [1], sizzle: r.sizzle };
}
function pausa7(t) {
  const p = { ...PZ0, pose: 'duerme', expr: 'dormida' };
  if (t < 1318) return { ...p, squash: 0.975 + 0.025 * Math.cos(((t - 1290) / 40) * 2 * Math.PI) };
  if (t < 1320) return { ...p, mug: [236 + 14 / 0.62, 104], mugRot: 15 };
  if (t < 1322) return { ...p, expr: 'alarma', y: PZ0.y - 10, mug: [236 + 14 / 0.62, 104], mugRot: 15 };
  const yOff = t < 1340 ? -10 : T.ramp(t, 1340, 1350, -10, 0, 'io');
  const rot = t < 1340 ? T.ramp(t, 1322, 1326, 0, 6, 'out') : T.ramp(t, 1340, 1350, 6, 0, 'io');
  if (t < 1340) return { ...p, pose: 'hold', expr: 'alarma', y: PZ0.y + yOff, rot };
  let expr = 'neutral', look = [8, 6];
  if (t >= 1350) { expr = 'esceptico'; look = [8, 4]; }
  if (t >= 1380) { expr = 'neutral'; look = [0, 6]; }
  const up = T.ramp(t, 1420, 1436, 0, 1, 'io');
  if (t >= 1420) expr = 'brindis';
  return { ...p, pose: 'sit', expr, look, y: PZ0.y + yOff, rot, arms: lerpPts(SIT.arms, BRINDIS.arms, up), mug: lerpPts(SIT.mug, BRINDIS.mug, up), steam: steamAlt(t), lid: RIG.blinkSlow(t, 1500, { down: 7, hold: 3, up: 10 }), squash: breath(t) };
}
function shot7(t, w, scr) {
  const tc = tw(t);
  const pz = pausa7(t);
  pzShadow(w, { ...pz, y: PZ0.y }, 1400);
  PZ(w, pz);
  add(w, P.buyButton(BTN.cx, BTN.G, {}));
  const c = chispa7(tc);
  chShadow(w, c, 1400);
  if (c.dust) for (const dx of [-60, 60]) w.black += P.dust(c.x + dx, 1394, 22, 0.9);
  const cp = { halo: 8, ...c }; delete cp.dust;
  w.black += RIG.limbHalo(cp, 16); // delante del botón: el alambre se lee sobre la base negra
  CH(w, cp);
  // correa: floja → tensa (f1318–1361) → floja; siempre calculada del asa al tobillo
  const h = RIG.pausaHandle(pz), a = RIG.chispaAnkle(cp);
  if (tc >= 1318 && tc <= 1360) w.black += P.leashTaut(h, a, cp.flip ? 20 : -20);
  else w.black += P.leashLoose(h, a, 60, { loopRot: cp.flip ? 20 : -20 });
  // cámara: microempuje en el congelado y plano de las dos
  let cam = { z: 1 };
  if (t >= 1330 && t < 1380) cam = { z: T.ramp(t, 1330, 1360, 1, 1.04, 'io'), A: [300, 1220] };
  if (t >= 1380) { const kk = T.ramp(t, 1380, 1400, 0, 1, 'out'); cam = { z: 1.04 + 0.08 * kk, A: T.mix([300, 1220], [620, 1250], kk) }; }
  return { cam };
}

// =====================================================================================
// PLANO 8 · Cierre y bucle · 1530–1679
// =====================================================================================
const KICK = [{ legL: [[-60, 90], [-80, 110]] }, { legL: [[-30, 98], [-36, 124]] }];
function chispa8(tc) {
  const base = { s: 1, x: 530, y: 1273, expr: 'euforia' };
  if (tc < 1630) {
    let y = 1273;
    const J = { 0: 1233, 2: 1213, 4: 1233, 6: 1273 };
    if (tc >= 1536 && tc <= 1542) y = J[tc - 1536];
    if (tc >= 1560 && tc <= 1566) y = J[tc - 1560];
    if (tc >= 1594 && tc <= 1598) y = { 1594: 1253, 1596: 1243, 1598: 1273 }[tc];
    const air = y !== 1273;
    const r = air ? { dx: 0 } : rest(tc);
    return { ...base, x: 530 + r.dx, y, pose: 'cheer', sweat: 2, sizzle: r.sizzle, burst: (tc >= 1536 && tc <= 1542) || (tc >= 1560 && tc <= 1566), blink: RIG.blinkFast(tc, [[1600, 1628]], 5) };
  }
  if (tc < 1660) {
    const kick = tc >= 1646 && tc <= 1652 ? KICK[((tc - 1646) / 2) % 2] : null;
    const r = rest(tc);
    return { ...base, x: 530 + r.dx, pose: 'stand', look: [-6, 6], limbs: kick, sizzle: r.sizzle };
  }
  if (tc === 1660) return { ...base, pose: 'shrug', squash: 0.88 };
  const K = { 1662: [500, 1150, 1.03, 'lunge'], 1664: [450, 1010, 1.06, 'lunge'], 1666: [410, 920, 1.09, 'lunge'], 1668: [378, 858, 1.12, 'hold'], 1670: [355, 818, 1.15, 'hold'], 1672: [338, 795, 1.17, 'hold'], 1674: [328, 784, 1.19, 'hold'], 1676: [322, 780, 1.2, 'hold'], 1678: [321, 779, 1.2, 'hold'] }[tc];
  const lunge = K[3] === 'lunge';
  return { ...base, x: K[0], y: K[1], s: K[2], pose: K[3], flip: tc < 1678, speed: lunge ? 4 : 0, halo: 8, look: tc >= 1676 ? [0, 4] : null, sweat: tc >= 1676 ? 2 : 0, fall: tc === 1678, squash: tc === 1662 ? 1.05 : 1 };
}
function pausa8(t) {
  const p = { ...PZ0, pose: 'sit', steam: steamAlt(t), squash: breath(t) };
  const lift = T.ramp(t, 1540, 1550, 0, 10 / 0.62, 'io');
  const br = { arms: [[204, -6, 226, -74 - lift]], mug: [234, -112 - lift] };
  const down = T.ramp(t, 1660, 1676, 0, 1, 'io');
  const arms = lerpPts(br.arms, SIT.arms, down), mug = lerpPts(br.mug, SIT.mug, down);
  let expr = 'brindis', look;
  if (t >= 1640) { expr = 'esceptico'; look = [8, 4]; }
  if (t >= 1672) { expr = 'neutral'; look = [8, 6]; }
  const sq = t >= 1600 && t <= 1610 ? T.ramp(t, 1600, 1610, 0.96, 1, 'out') : 1;
  return { ...p, expr, look, arms, mug, squash: p.squash * sq };
}
function shot8(t, w) {
  const tc = tw(t);
  const pz = pausa8(t);
  pzShadow(w, pz, 1400);
  PZ(w, pz);
  add(w, P.buyButton(BTN.cx, BTN.G, {}));
  const c = chispa8(tc);
  const cp = { ...c }; delete cp.burst; delete cp.fall;
  if (c.fall) { w.black += R.liftedShadow(320, 1238, 104 - (908 - c.y) * 0.1, 7); w.black += P.fallLines(c.x, c.y - 203); }
  else chShadow(w, cp, cp.x > 170 && cp.x < 470 && cp.y + 127 * cp.s < 1238 ? 1238 : 1400);
  cp.halo = 8;
  w.black += RIG.limbHalo(cp, 16);
  CH(w, cp);
  if (c.burst) { const b = RIG.GC(cp, 6, -150); w.black += R.burst(b[0], b[1], 1.1); }
  // correa: atada hasta f1653; el lazo se suelta y cae (3 dibujos) al trazado de reposo
  const h = RIG.pausaHandle(pz);
  if (tc < 1654) w.black += P.leashLoose(h, RIG.chispaAnkle(cp), 120);
  else if (tc < 1660) {
    const a0 = RIG.chispaAnkle({ ...cp, pose: 'stand', limbs: null, x: 530, y: 1273, s: 1, squash: 1 });
    const kk = { 1654: 0.3, 1656: 0.65, 1658: 0.92 }[tc];
    const e = [a0[0] + (REST_END[0] - a0[0]) * kk, a0[1] + (REST_END[1] - a0[1]) * kk];
    w.black += P.leashLoose(h, e, 120 * (1 - kk) + 10, { loop: false }) + P.LOOP_OPEN(e[0], e[1], -30 * (1 - kk));
  } else w.black += P.leashRest(h, REST_END);
  return { cam: {} };
}

// =====================================================================================
// COMPOSICIÓN
// =====================================================================================
function frame(t, opt = {}) {
  R.resetUid();
  const w = L();
  let res;
  if (t < 120) res = shot1(t, w, opt);
  else if (t < 570) res = shot23(t, w);
  else if (t < 780) res = shot4(t, w);
  else if (t < 1050) res = shot5(t, w);
  else if (t < 1290) res = shot6(t, w);
  else if (t < 1530) res = shot7(t, w);
  else res = shot8(t, w);
  // subtítulos (pantalla) y frases ancladas al mundo
  const scr = L();
  if (w.screenRed) { scr.red += w.screenRed; delete w.screenRed; }
  const cards = opt.cover ? [card('cover')] : LAY.cards.filter((c) => c.id !== 'cover');
  for (const c of cards) {
    const r = CAP.render(c, opt.cover ? 0 : t);
    if (!r) continue;
    add(c.world ? w : scr, r);
  }
  const tf = RIG.camTransform(res.cam || {});
  const out = { defs: (w.defs || '') + (scr.defs || '') };
  let clipOpen = '', clipClose = '';
  if (res.clip) { out.defs += `<clipPath id="worldclip"><rect x="${res.clip[0]}" y="${res.clip[1]}" width="${res.clip[2]}" height="${res.clip[3]}"/></clipPath>`; clipOpen = '<g clip-path="url(#worldclip)">'; clipClose = '</g>'; }
  for (const kk of ['blue', 'red', 'black']) out[kk] = `${clipOpen}<g transform="${tf}">${w[kk] || ''}</g>${clipClose}${scr[kk] || ''}`;
  return out;
}

module.exports = { WIDTH, HEIGHT, FRAMES, CARDS, prepare, setup, frame, _setLayout: (l) => { LAY = l; } };
