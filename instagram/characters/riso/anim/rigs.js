// Motor de animación «Riso» — rigs sobre los parámetros de la librería (nunca se redibuja a mano).
// Chispa: en «dos», a tirones, squash desde los pies, parpadeo rápido, vibración, ciclos de carrera.
// Pausa: en «unos», interpolada, respiración, parpadeo lentísimo, plancha azul que llega tarde.
const R = require('../riso.js');
const T = require('./timeline.js');
const { L, f } = R;

// ---------- geometría local → mundo ----------
// Chispa: transform = translate rotate skewX(lean) scale(±s, s) [squash desde y local 127]
function GC(c, lx, ly) {
  const sq = c.squash || 1;
  const qx = lx / Math.sqrt(sq), qy = 127 + (ly - 127) * sq;
  const Y = qy * c.s, X = qx * c.s * (c.flip ? -1 : 1) + Math.tan(((c.lean || 0) * Math.PI) / 180) * Y;
  const a = ((c.rot || 0) * Math.PI) / 180;
  return [c.x + X * Math.cos(a) - Y * Math.sin(a), c.y + X * Math.sin(a) + Y * Math.cos(a)];
}
// Pausa: transform = translate rotate scale(±s, s) [squash desde y local 122]
function GP(p, lx, ly) {
  const sq = p.squash || 1;
  const qx = lx / Math.sqrt(sq), qy = 122 + (ly - 122) * sq;
  const X = qx * p.s * (p.flip ? -1 : 1), Y = qy * p.s;
  const a = ((p.rot || 0) * Math.PI) / 180;
  return [p.x + X * Math.cos(a) - Y * Math.sin(a), p.y + X * Math.sin(a) + Y * Math.cos(a)];
}
const groundChispa = (G, s) => G - 127 * s; // y de Chispa para un suelo G
const groundPausa = (G, s) => G - 122 * s;
// asa de la taza (local: centro de la taza + [42, −16], taza a escala 1,2)
const HANDLE = [42, -16];
function pausaMug(p) { return p.mug !== undefined ? p.mug : (R.PAUSA_POSES[p.pose || 'sit'] || {}).mug; }
function pausaHandle(p) { const m = pausaMug(p); return m ? GP(p, m[0] + HANDLE[0], m[1] + HANDLE[1]) : null; }
// tobillo / pie izquierdo de Chispa (donde va el lazo de la correa)
function chispaAnkle(c) {
  const P = { ...(R.CHISPA_POSES[c.pose] || R.CHISPA_POSES.stand), ...(c.limbs || {}) };
  const foot = P.legL ? P.legL[P.legL.length - 1] : [-42, 122];
  return GC(c, foot[0] + 2, foot[1] - 4);
}

// halo de reserva bajo las extremidades de alambre (para que se lean sobre atrezo negro): capa negra blanca
function limbHalo(c, w = 16) {
  const P = c.pose && R.CHISPA_POSES[c.pose] ? { ...R.CHISPA_POSES[c.pose], ...(c.limbs || {}) } : null;
  if (!P) return '';
  const SOCK = R.SOCK;
  let d = '';
  for (const [k, sk] of [['armL', 'armL'], ['armR', 'armR'], ['legL', 'legL'], ['legR', 'legR']]) {
    if (!P[k]) continue;
    const pts = [SOCK[sk], ...P[k]].map((q) => RIG_GC(c, q[0], q[1]));
    d += 'M' + pts.map((q) => `${f(q[0])} ${f(q[1])}`).join(' L') + ' ';
  }
  const ws = w * c.s;
  return `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${f(ws)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const RIG_GC = (...a) => GC(...a);

// ---------- squash & stretch, anticipación ----------
// impacto: squash que se recupera (en unos para Pausa; Chispa lo muestrea en dos)
function impactSquash(t, f0, { amount = 0.88, frames = 6, e = 'out' } = {}) {
  if (t < f0 || t > f0 + frames) return 1;
  return T.ramp(t, f0, f0 + frames, amount, 1, e);
}
// anticipación: se encoge antes de saltar (amount < 1) y estira al salir (stretch > 1)
function anticipate(t, fStart, fGo, { amount = 0.9, stretch = 1.06, stretchFrames = 4 } = {}) {
  if (t >= fStart && t < fGo) return T.ramp(t, fStart, fGo, 1, amount, 'out');
  if (t >= fGo && t < fGo + stretchFrames) return T.ramp(t, fGo, fGo + stretchFrames, stretch, 1, 'out');
  return 1;
}

// ---------- respiración y parpadeos ----------
// respiración en reposo: escala Y ±amp (Pausa en unos)
const breathe = (t, period = 90, amp = 0.02, phase = 0) => 1 + amp * Math.sin(((t + phase) / period) * 2 * Math.PI);
// parpadeo lentísimo de Pausa: baja (ease-in), se queda, sube (ease-out, tarda más)
function blinkSlow(t, start, { down = 8, hold = 8, up = 14, base = 0.5 } = {}) {
  const a = start, b = a + down, c = b + hold, d = c + up;
  if (t < a || t > d) return null;
  if (t < b) return T.ramp(t, a, b, base, 1, 'in');
  if (t < c) return 1;
  return T.ramp(t, c, d, 1, base, 'out');
}
// parpadeo rápido de Chispa: un dibujo cerrado (2 f) cada 40–75 f, determinista.
// Devuelve true si en t está cerrado. Respeta ventanas [a,b] donde se permite.
function blinkFast(t, windows, seed = 1) {
  for (const [a, b] of windows) {
    if (t < a || t > b) continue;
    let k = a + 14 + Math.floor(T.hash01(seed + a) * 20);
    let i = 0;
    while (k <= b - 2) {
      if (t >= k && t < k + 2) return true;
      k += 40 + Math.floor(T.hash01(seed * 7 + i++) * 36);
      k += k % 2; // en pares
    }
  }
  return false;
}

// ---------- ciclos ----------
// ciclo de dibujos en «dos» (hold = fotogramas por dibujo)
function cycle(t, start, drawings, hold = 2) { const i = Math.floor((t - start) / hold); return drawings[((i % drawings.length) + drawings.length) % drawings.length]; }
// carrera de 2 dibujos: A/B con bote en B, avance por dibujo
function runCycle(t, start, { x0, dx, y0, bob = -14, poses = ['corre_a', 'corre_b'] }) {
  const i = Math.floor((t - start) / 2);
  return { pose: poses[i % 2], x: x0 + dx * i, y: y0 + (i % 2 ? bob : 0), i };
}
// paso «tieso»: sube y baja en cada paso (para la caminata hipnotizada)
function walkCycle(t, start, { x0, dxStep, y0, lift = -6, stepFrames = 6 }) {
  const n = Math.floor((t - start) / stepFrames);
  return { x: x0 + dxStep * n, y: y0 + (n % 2 ? lift : 0), n };
}

// ---------- mirada y boca ----------
// pupila hacia un punto del mundo: devuelve [dx,dy] limitado a mag (en el sistema local; flip invierte x)
function lookAt(from, to, mag = 8, flip = false) {
  const dx = to[0] - from[0], dy = to[1] - from[1], l = Math.hypot(dx, dy) || 1;
  return [((flip ? -1 : 1) * dx * mag) / l, (dy * mag) / l];
}
// cambio de boca/expresión sincronizado con los «beats» de los subtítulos: [[f, expr], ...]
const mouthSwap = (beats, before) => T.step(beats, before);

// ---------- planchas ----------
function wrapLayers(layers, tf) {
  const o = L();
  for (const k of ['blue', 'red', 'black']) o[k] = layers[k] ? `<g transform="${tf}">${layers[k]}</g>` : '';
  o.defs = layers.defs || '';
  return o;
}
function clipLayers(layers, x, y, w, h) {
  const id = R.uid('cl');
  const o = L();
  o.defs = (layers.defs || '') + `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/></clipPath>`;
  for (const k of ['black', 'red', 'blue']) if (layers[k]) o[k] = `<g clip-path="url(#${id})">${layers[k]}</g>`;
  return o;
}
// desplaza (y gira) una sola plancha: el desregistro exagerado de Pausa
function shiftPlate(layers, k, dx, dy, rot = 0, cx = 0, cy = 0) {
  if (layers[k] && (dx || dy || rot)) layers[k] = `<g transform="translate(${f(dx)} ${f(dy)}) rotate(${f(rot)} ${f(cx)} ${f(cy)})">${layers[k]}</g>`;
  return layers;
}
// gag de la plancha azul que llega tarde: desde `from` [dx,dy,rot] hasta 0 en [a,b]; antes de a, en `from`
function latePlate(t, a, b, from, e = 'out') {
  const k = T.ease(e)(T.clamp((t - a) / (b - a)));
  return from.map((v) => v * (1 - k));
}

// ---------- cámara ----------
// cam = { x: camX, z, A: [ax, ay], shake: [dx, dy] } → pantalla = A + (mundo − camX − A)·z + shake
function camTransform({ x = 0, z = 1, A = [540, 960], shake = [0, 0] } = {}) {
  const tx = A[0] * (1 - z) + shake[0] - x * z, ty = A[1] * (1 - z) + shake[1];
  return `translate(${f(tx)} ${f(ty)}) scale(${f(z * 10000) / 10000})`;
}
const camApply = ({ x = 0, z = 1, A = [540, 960], shake = [0, 0] } = {}, p) => [A[0] + (p[0] - x - A[0]) * z + shake[0], A[1] + (p[1] - A[1]) * z + shake[1]];
// temblor por tabla: { f: [dx,dy] } relativo a f0
function shakeTable(t, f0, table) { const v = table[t - f0]; return v ? v : [0, 0]; }

module.exports = {
  GC, GP, limbHalo, groundChispa, groundPausa, HANDLE, pausaMug, pausaHandle, chispaAnkle,
  impactSquash, anticipate, breathe, blinkSlow, blinkFast, cycle, runCycle, walkCycle, lookAt, mouthSwap,
  wrapLayers, clipLayers, shiftPlate, latePlate, camTransform, camApply, shakeTable,
};
