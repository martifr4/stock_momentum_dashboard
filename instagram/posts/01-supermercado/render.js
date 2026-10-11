// Post 01 · El supermercado está diseñado para Chispa — 11 slides 1080 × 1350, estilo «Riso».
// Uso: node render.js [n ...]   (sin argumentos: las 11 + overview.png)
// Librería compartida (sin modificar) + atrezo propio en props.js. Texto literal de copy.md.
const path = require('path');
const R = require('../../characters/riso/riso.js');
const {
  INK, PAPERS, W, L, add, chispa, pausa, burst, shadowEllipse, liftedShadow, text, richText, measurer, pageChrome, riso, render,
  strokeP, f, sign, FONT_MONO,
} = R;
const P = require('./props.js');
const { G, nb, chispaP, CH_POSES, carrito, cargaLlena, cargaMedia, stopBadge, storeMap, stopHeader, pausaCorner, sourceLine } = P;
const OUT = __dirname;
const X0 = 64, CW = 952, TOTAL = 11, POST = 'N.º 01';

const r = (t) => ({ t: nb(t), st: 'body', ink: 'black' });
const b = (t, ink = 'black') => ({ t: nb(t), st: 'bold', ink });
const h = (t, ink = 'black') => ({ t: nb(t), st: 'head', ink });
const m = (t) => ({ t, st: 'mono' });
const mi = (t) => ({ t, st: 'monoI' });
const chrome = (n, ink, signoff) => pageChrome({ n, total: TOTAL, ink, post: POST, signoff });

// bloque de texto con ajuste de línea; devuelve la y de la línea base siguiente
async function para(ly, M, spans, { x = X0, y, w = CW, size = 38, lh = 1.2, ls = 0 }) {
  const lines = await M.wrap(spans, w, size);
  add(ly, richText({ x, y, lines, size, lh, ls }));
  return { next: y + lines.length * size * lh, n: lines.length };
}
// título de parada: líneas a mano (arrays de spans)
function title(ly, lines, size, y = 290 + 0) {
  const base = y + size * 0.8;
  add(ly, richText({ x: X0, y: base, lines, size, lh: 0.98, ls: -0.012 }));
  return base + (lines.length - 1) * size * 0.98 + size * 0.22;
}

const S = {};

// ------------------------------------------------------------------ 1 · Portada
S[1] = async (M) => {
  const ly = L();
  add(ly, chrome(1, 'red'));
  add(ly, richText({ x: X0 - 4, y: 268, lines: [[h('Entraste')], [h('a por pan.')]], size: 150, lh: 0.92, ls: -0.02 }));
  add(ly, richText({ x: X0, y: 500, lines: [[h('Chispa', 'red'), h(' salió con 43 €.')]], size: 80, ls: -0.01 }));
  add(ly, stopBadge(X0 + 26, 590, 7, { r: 26, size: 34 }));
  add(ly, richText({ x: X0 + 62, y: 601, lines: [[mi('trucos del súper (y cómo frenarlos)')]], size: 32 }));
  // escena: Chispa sale empujando el carrito desbordado; Pausa va de pasajera encima del montón
  const C = { x: 236, y: 1004, s: 1.12, lean: -8 };
  const hand = G(C, ...CH_POSES.empuja.hand);
  const cs = 1.12;
  const cart = { x: hand[0], y: hand[1] };
  const T = (c) => P.tf(c, `translate(${cart.x} ${cart.y}) scale(${cs})`);
  ly.black += shadowEllipse(C.x + 260, 1162, 380, 16, INK.black, 8, 3);
  for (const c of cargaLlena({ withRider: true })) add(ly, T(c));
  // la barra de pan, lo único que venía a comprar, asoma en diagonal (pequeña)
  add(ly, P.baguette(cart.x + 70 * cs, cart.y - 178 * cs, 84, 18, -52));
  // Pausa sentada sobre el montón; los alambres delanteros van por encima
  const Pz = { x: cart.x + 214 * cs, y: cart.y - 20 * cs, s: 0.45 };
  add(ly, pausa({ ...Pz, expr: 'esceptico', pose: 'sit', look: [-2, 6], knockFor: ['red', 'black'] }));
  add(ly, carrito({ x: cart.x, y: cart.y, s: cs, carga: [] }));
  add(ly, chispaP('empuja', { ...C, expr: 'euforia', look: [2, -1], sweat: 2, speed: 3 }));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 2 · El mapa
S[2] = async (M) => {
  const ly = L();
  add(ly, chrome(2, 'blue'));
  add(ly, richText({ x: X0, y: 214, lines: [[h('El súper no es')], [h('un sitio neutral.')]], size: 80, lh: 0.96, ls: -0.012 }));
  let y = 214 + 80 * 0.96 + 72;
  y = (await para(ly, M, [r('Cada pasillo está pensado para hablar con '), b('Chispa'), r('.')], { y, w: 650, size: 40 })).next + 10;
  await para(ly, M, [r('Hoy lo recorremos con '), b('Pausa'), r(' de guía.')], { y, w: 650, size: 40 });
  // plano
  add(ly, storeMap({ x: 108, y: 600, s: 0.9, mode: 'full' }));
  // Pausa guía, arriba a la derecha, mira al texto y al plano
  const Pz = { x: 870, y: 410, s: 0.5, flip: true };
  add(ly, P.pausaProp({ ...Pz, expr: 'neutral', look: [-4, 8], prop: P.banderin, raise: 'up' }));
  ly.black += shadowEllipse(Pz.x, Pz.y + 70, 110, 8, INK.black, 6, 2);
  // Chispa diminuta en la puerta, con el carrito vacío, mirando hacia dentro
  const C = { x: 1006, y: 1190, s: 0.28, flip: true, lean: 10 };
  const hand = G(C, ...CH_POSES.empuja.hand);
  add(ly, carrito({ x: hand[0], y: hand[1], s: 0.28, flip: true }));
  add(ly, chispaP('empuja', { ...C, expr: 'euforia', look: [-3, 0] }));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 3 · Parada 1: la música
S[3] = async (M) => {
  const ly = L();
  add(ly, chrome(3, 'red'));
  add(ly, stopHeader(1, 'PARADA 1: LA MÚSICA'));
  let y = title(ly, [[h('La música va despacio.')], [h('Tú también.')]], 72);
  y += 24 + 38 * 0.8;
  y = (await para(ly, M, [r('En un estudio clásico, con música lenta la gente caminaba más despacio y gastaba más que con música rápida.')], { y })).next + 16;
  y = (await para(ly, M, [r('Más tiempo en el pasillo = más cosas en el carrito.')], { y })).next;
  const sceneTop = y;
  // altavoz colgado y notas que bajan flotando
  add(ly, P.altavoz(110, sceneTop + 70, 0.8, sceneTop - 10));
  ly.black += P.nota(200, sceneTop + 70, 0.9, -10) + P.nota(256, sceneTop + 130, 0.85, 8, true) + P.nota(214, sceneTop + 196, 0.75, -6);
  // Chispa en cámara lenta, embelesada, con el carrito a medio llenar
  const C = { x: 200, y: 1030, s: 0.75, lean: 4 };
  const hand = G(C, ...CH_POSES.empujaLenta.hand);
  const cs = 0.75;
  ly.black += shadowEllipse(C.x + 150, 1132, 250, 10, INK.black, 7, 2.4);
  const carga = cargaMedia().map((c) => P.tf(c, `translate(${hand[0]} ${hand[1]}) scale(${cs})`));
  for (const c of carga) add(ly, c);
  add(ly, P.botella(hand[0] + 200 * cs, hand[1] - 34 * cs, 34 * cs, 92 * cs, 'red', 32)); // uno más, cayendo dentro
  add(ly, carrito({ x: hand[0], y: hand[1], s: cs }));
  add(ly, chispaP('empujaLenta', { ...C, expr: 'feliz' }));
  ly.black += nodArcs(C.x, C.y - 150 * C.s, 0.6);
  const pc = await pausaCorner(M, { pose: 'muestra', prop: P.listaMini, expr: 'neutral', look: [-6, 2], quote: '«Entra con lista. Sal cuando la acabes.»', anchor: 880 });
  add(ly, pc.layers);
  add(ly, sourceLine([[m('Fuente: Milliman (1982), '), mi('Journal of Marketing'), m('.')]]));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};
function nodArcs(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${INK.black}" stroke-width="5" stroke-linecap="round">` +
    `<path d="M-130 30 Q-138 8 -130 -14"/><path d="M-150 34 Q-160 8 -150 -18"/><path d="M130 30 Q138 8 130 -14"/><path d="M150 34 Q160 8 150 -18"/></g>`;
}

// ------------------------------------------------------------------ main
(async () => {
  const which = process.argv.slice(2).map(Number).filter(Boolean);
  const list = which.length ? which : Array.from({ length: TOTAL }, (_, i) => i + 1);
  const M = await measurer();
  const jobs = [];
  for (const n of list) if (S[n]) jobs.push({ name: `slide-${String(n).padStart(2, '0')}`, svg: await S[n](M), w: 1080, h: 1350, dir: OUT });
  await M.close();
  await render(jobs);
  if (!which.length) {
    const { execFileSync } = require('child_process');
    execFileSync('python3', ['-I', path.join(OUT, 'overview.py')], { stdio: 'inherit', cwd: OUT });
  }
})().catch((e) => { console.error(e); process.exit(1); });

module.exports = { S };
