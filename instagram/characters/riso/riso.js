// Librería de producción «Riso» — Dinero Irracional.
// Chispa (roja, Sistema 1) y Pausa (azul, Sistema 2), atrezo, texto y compositor de planchas.
// Derivada de proposals/p2-riso/build.js (ronda 2). Ver characters/BIBLE.md.
// Cada escena se compone por PLANCHAS de tinta (azul, rojo, negro), como una risografía real.
// Dentro de una plancha, el blanco (#fff) es «reserva» (papel); las planchas se imprimen en multiply.
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

// ---------- paleta ----------
const INK = {
  red: '#FF4458',   // rojo flúor riso
  blue: '#2F5FD0',  // azul riso
  black: '#26232E', // negro riso (nunca negro puro)
};
const PAPERS = {
  niebla: '#E6ECE4', // papel verde niebla (base)
  lila: '#E6E2EC',   // papel lila claro
  hielo: '#DFE7EC',  // papel azul hielo
};

let UID = 0;
const uid = (p) => `${p}${++UID}`;
const resetUid = () => { UID = 0; }; // animación: ids estables por fotograma
const f = (n) => Math.round(n * 100) / 100;
const L = () => ({ blue: '', red: '', black: '', defs: '' });
function add(a, b) { for (const k in b) a[k] = (a[k] || '') + (b[k] || ''); return a; }
function wrap(layers, tf) {
  const o = L();
  for (const k of ['blue', 'red', 'black']) o[k] = layers[k] ? `<g transform="${tf}">${layers[k]}</g>` : '';
  o.defs = layers.defs || '';
  return o;
}
const W = '#ffffff'; // reserva

// ---------- utilidades de dibujo ----------
// Polígono con esquinas ligeramente redondeadas (como una plancha cortada a mano)
function roundPoly(pts, r = 5) {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
    const rv = Array.isArray(r) ? r[i] : r;
    const rr = Math.min(rv, l1 / 2.2, l2 / 2.2);
    const a = [p1[0] + v1[0] / l1 * rr, p1[1] + v1[1] / l1 * rr];
    const b = [p1[0] + v2[0] / l2 * rr, p1[1] + v2[1] / l2 * rr];
    d += (i === 0 ? 'M' : 'L') + f(a[0]) + ' ' + f(a[1]) + ' Q' + p1[0] + ' ' + p1[1] + ' ' + f(b[0]) + ' ' + f(b[1]) + ' ';
  }
  return d + 'Z';
}
const poly = (pts) => 'M' + pts.map((p) => p.join(' ')).join(' L');
function strokeP(d, color, w, extra = '') {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" ${extra}/>`;
}
// Trama de semitono AM real (puntos de tamaño variable) sobre retícula girada.
function halftone({ x0, y0, x1, y1, step = 9, angle = 45, rmax = 4.6, fn, color, clip = '' }) {
  const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + step;
  let s = '';
  for (let u = -R; u <= R; u += step) for (let v = -R; v <= R; v += step) {
    const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    const t = fn(x, y);
    if (t <= 0.04) continue;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rmax * Math.sqrt(Math.min(1, t)))}"/>`;
  }
  return `<g fill="${color}" ${clip ? `clip-path="url(#${clip})"` : ''}>${s}</g>`;
}
const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function shadowEllipse(cx, cy, rx, ry, color = INK.black, step = 8, rmax = 3.6, k = 1) {
  return halftone({
    x0: cx - rx, y0: cy - ry, x1: cx + rx, y1: cy + ry, step, rmax, color,
    fn: (x, y) => k * (1 - smooth(0.25, 1, Math.hypot((x - cx) / rx, (y - cy) / ry))),
  });
}

// ---------- OJOS (compartidos: misma construcción para los dos) ----------
const eyeFn = (o) => eye(o);
// lid: 0 = abierto, 0.5 = media asta. tilt: inclinación del párpado. look: [dx,dy] de la pupila.
function eye({ cx, cy, r, lid = 0, tilt = 0, look = [0, 0], pr = null, lidW = 5, shine = true, whiteLayer = 'red' }) {
  const out = L();
  pr = pr ?? r * 0.45;
  const cid = uid('eye');
  let white;
  if (lid <= 0.001) {
    white = `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  } else {
    const yc = cy - r + 2 * r * lid, dy = yc - cy, w = Math.sqrt(Math.max(0, r * r - dy * dy));
    const large = yc < cy ? 1 : 0;
    white = `M${f(cx - w)} ${f(yc)} A${r} ${r} 0 ${large} 0 ${f(cx + w)} ${f(yc)}Z`;
  }
  const tf = `rotate(${tilt} ${cx} ${cy})`;
  out.defs += `<clipPath id="${cid}"><path d="${white}" transform="${tf}"/></clipPath>`;
  out[whiteLayer] += `<path d="${white}" fill="${W}" transform="${tf}"/>`;
  const px = cx + look[0], py = cy + look[1];
  let b = `<g clip-path="url(#${cid})"><circle cx="${f(px)}" cy="${f(py)}" r="${f(pr)}" fill="${INK.black}"/>`;
  if (shine) b += `<circle cx="${f(px - pr * 0.38)}" cy="${f(py - pr * 0.4)}" r="${f(Math.max(1.4, pr * 0.3))}" fill="${W}"/>`;
  b += `</g>`;
  if (lid > 0.001) {
    const yc = cy - r + 2 * r * lid, dy = yc - cy, w = Math.sqrt(Math.max(0, r * r - dy * dy));
    b += `<line x1="${f(cx - w - 3)}" y1="${f(yc)}" x2="${f(cx + w + 3)}" y2="${f(yc)}" stroke="${INK.black}" stroke-width="${lidW}" stroke-linecap="round" transform="${tf}"/>`;
  }
  out.black += b;
  return out;
}
// ojo cerrado feliz (arco) o cansado
function closedEye(cx, cy, r, up = true, w = 5) {
  const d = up ? `M${cx - r} ${cy + 3} Q${cx} ${cy - r * 1.25} ${cx + r} ${cy + 3}`
               : `M${cx - r} ${cy - 2} Q${cx} ${cy + r * 0.9} ${cx + r} ${cy - 2}`;
  return { black: strokeP(d, INK.black, w, 'stroke-linecap="round"') };
}
function teardrop(x, y, s, rot = 0, color = INK.blue) {
  return `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 -14 C4 -6 9 -1 9 5 C9 10.5 5 14 0 14 C-5 14 -9 10.5 -9 5 C-9 -1 -4 -6 0 -14Z" fill="${color}"/>`;
}

// =====================================================================
// CHISPA — Sistema 1 (ex-Mapi). Un cerebrito facetado: cúpula en sierra de puntas romas,
// base plana, dos surcos en zigzag y una cisura horizontal.
// Sistema local: (0,0) ≈ centro del cuerpo. Cuerpo ≈ 232 × 195 (+ patas de 52).
// =====================================================================
// Cada diente es una circunvolución. Solo 3 dientes son afilados (S), el resto romos (r≈9).
const CHISPA_TEETH = [0.8, 1.2, 0.95, 1.35, 1.0, 1.15, 0.75];
const CHISPA_SHARP = [false, true, false, true, false, false, true];
function chispaArc(scale, a0, a1, amp, cy, teeth = CHISPA_TEETH) {
  const pts = [], N = teeth.length;
  for (let i = 0; i <= N * 2; i++) {
    const a = a0 + (a1 - a0) * (i / (N * 2));
    const k = i % 2 === 1 ? teeth[(i - 1) / 2] : 0;
    const front = Math.max(0, Math.cos(a)) * 10 * scale; // lóbulo frontal más alto
    const rx = 112 * scale + k * amp * 0.35, ry = 92 * scale + k * amp;
    pts.push([Math.round(Math.cos(a) * rx), Math.round(cy - Math.sin(a) * (ry + front))]);
  }
  return pts;
}
const CHISPA_DOME = chispaArc(1, Math.PI * 0.86, Math.PI * 0.12, 26, 0);
// «chisporroteo» (biblia § 9): segunda versión de los lóbulos (±0,08), mismas 3 puntas. Solo para Reels.
const CHISPA_TEETH_B = [0.88, 1.12, 1.03, 1.27, 0.92, 1.23, 0.83];
const CHISPA_DOME_B = chispaArc(1, Math.PI * 0.86, Math.PI * 0.12, 26, 0, CHISPA_TEETH_B);
// Contorno: facetas laterales + cúpula de lóbulos. Los lóbulos romos son arcos (cúbicas);
// solo 3 son puntas afiladas: el nervio de Chispa, sin que deje de ser un cerebro.
function chispaBodyPath(D = CHISPA_DOME) {
  let d = 'M-66 70 L-92 56 Q-100 51 -104 44 L-118 8 L-110 -24 L' + D[0].join(' ');
  for (let i = 0; i + 2 < D.length; i += 2) {
    const v0 = D[i], p = D[i + 1], v1 = D[i + 2];
    if (CHISPA_SHARP[i / 2]) { d += ` L${p[0]} ${p[1]} L${v1[0]} ${v1[1]}`; continue; }
    const mx = (v0[0] + v1[0]) / 2, my = (v0[1] + v1[1]) / 2, nx = p[0] - mx, ny = p[1] - my;
    const k = 1.33;
    d += ` C${f(v0[0] + nx * k)} ${f(v0[1] + ny * k)} ${f(v1[0] + nx * k)} ${f(v1[1] + ny * k)} ${v1[0]} ${v1[1]}`;
  }
  return d + ' L112 -18 L118 10 L104 42 Q100 50 92 54 L64 70 Z';
}
const CHISPA_BODY_D = chispaBodyPath();
const CHISPA_BODY_D_B = chispaBodyPath(CHISPA_DOME_B);
// surcos: dos zigzags concéntricos + cisura horizontal en la nuca
const CHISPA_FOLDS = [
  chispaArc(0.8, Math.PI * 0.84, Math.PI * 0.2, 13, 0, [1, 1.2, 0.9, 1.25, 1, 1.1, 0.9]).slice(1, -1),
  chispaArc(0.54, Math.PI * 0.8, Math.PI * 0.36, 11, -2, [1, 1.2, 1.1]).slice(1, -1),
  [[-114, 8], [-96, 2], [-80, 10], [-62, 4], [-50, 8]],
];
// enchufes fijos de las extremidades (siempre en la mitad baja, lejos de la cara)
const SOCK = { legL: [-34, 68], legR: [32, 68], armL: [-106, 36], armR: [106, 34] };
// look: desplazamiento de pupila [dx, dy]; si se omite, cada expresión usa el suyo.
// espiral de hipnosis (2,5 vueltas) en lugar de pupila; spin 0/1 = girada 0° / 90°
function spiralPath(cx, cy, rmax, spin = 0) {
  const pts = [], turns = 2.5, n = 60, a0 = (spin ? Math.PI / 2 : 0);
  for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + t * turns * 2 * Math.PI, r = 1.5 + t * (rmax - 1.5); pts.push([f(cx + r * Math.cos(a)), f(cy + r * Math.sin(a))]); }
  return 'M' + pts.map((p) => p.join(' ')).join(' L');
}
function chispaFace(expr, look, { blink = false, spin = 0 } = {}) {
  const o = L();
  const E1 = [-14, -2], E2 = [38, -4];
  const ex = expr;
  const lk = (d) => look || d;
  // parpadeo rápido (Reels): cada ojo abierto se sustituye por una línea cerrada; cejas y boca no cambian
  const eye = (o2) => (blink ? { black: strokeP(`M${o2.cx - o2.r + 2} ${o2.cy + 2} Q${o2.cx} ${o2.cy + 8} ${o2.cx + o2.r - 2} ${o2.cy + 2}`, INK.black, 5.5, 'stroke-linecap="round"') } : eyeFn(o2));
  if (ex === 'espiral') {
    // hipnotizada: blancos grandes con espiral negra; cejas y boca de alarma
    for (const [cx, cy] of [[E1[0] - 2, E1[1] - 2], [E2[0] + 2, E2[1] - 3]]) {
      o.red += `<circle cx="${cx}" cy="${cy}" r="20" fill="${W}"/>`;
      o.black += strokeP(spiralPath(cx, cy, 16, spin), INK.black, 4, 'stroke-linecap="round" stroke-linejoin="round"');
    }
    o.black += strokeP(`M-36 -40 L-20 -48 L-4 -38 M26 -40 L42 -50 L58 -40`, INK.black, 5, 'stroke-linecap="round" stroke-linejoin="round"');
    o.black += `<path d="${roundPoly([[2, 26], [30, 24], [32, 44], [0, 46]], 7)}" fill="${INK.black}"/>`;
    return o;
  }
  if (ex === 'neutral') {
    add(o, eye({ cx: E1[0], cy: E1[1], r: 17, look: lk([4, 1]) }));
    add(o, eye({ cx: E2[0], cy: E2[1], r: 17, look: lk([4, 1]) }));
    o.black += strokeP(`M-30 -28 L-2 -30 M24 -32 L52 -30`, INK.black, 5, 'stroke-linecap="round"');
    o.black += strokeP(`M4 32 Q16 36 28 31`, INK.black, 4.5, 'stroke-linecap="round"');
  } else if (ex === 'euforia' || ex === 'alarma') {
    const big = 20;
    const pr = ex === 'alarma' ? 4 : 5.5;
    add(o, eye({ cx: E1[0] - 2, cy: E1[1] - 2, r: big, pr, look: lk(ex === 'alarma' ? [0, 0] : [3, -4]) }));
    add(o, eye({ cx: E2[0] + 2, cy: E2[1] - 3, r: big, pr, look: lk(ex === 'alarma' ? [0, 0] : [3, -4]) }));
    o.black += strokeP(ex === 'alarma' ? `M-36 -40 L-20 -48 L-4 -38 M26 -40 L42 -50 L58 -40` : `M-34 -32 L-20 -45 L-5 -36 M27 -39 L42 -51 L57 -39`, INK.black, 5, 'stroke-linecap="round" stroke-linejoin="round"');
    if (ex === 'alarma') {
      // boca pequeña y temblorosa (ondulada), sin dientes
      o.black += `<path d="${roundPoly([[2, 26], [30, 24], [32, 44], [0, 46]], 7)}" fill="${INK.black}"/>`;
    } else {
      o.black += `<path d="M-10 22 L44 19 C42 40 30 50 16 50 C2 50 -8 40 -10 22Z" fill="${INK.black}"/>`;
      o.red += `<path d="M-7 23.5 L41 21 L39 28 L-5 30Z" fill="${W}"/>`;
    }
  } else if (ex === 'feliz') {
    add(o, closedEye(E1[0], E1[1] + 4, 14, true, 5.5));
    add(o, closedEye(E2[0], E2[1] + 4, 14, true, 5.5));
    o.black += strokeP(`M-30 -30 L-4 -34 M24 -35 L50 -31`, INK.black, 5, 'stroke-linecap="round"');
    o.black += `<path d="M-6 22 L40 20 C36 40 26 48 16 48 C5 48 -3 38 -6 22Z" fill="${INK.black}"/>`;
    o.red += `<path d="M-3 23 L37 21.5 L35 27 L-1 28Z" fill="${W}"/>`;
  } else if (ex === 'orgullosa') {
    // «¿lo ves?»: un ojo cerrado en arco, el otro abierto mirando al lector, cejas arriba, sonrisa de lado cerrada
    add(o, closedEye(E1[0], E1[1] + 4, 14, true, 5.5));
    add(o, eye({ cx: E2[0], cy: E2[1], r: 17, look: lk([-1, 2]) }));
    o.black += strokeP(`M-30 -26 L-16 -36 L-2 -30 M24 -36 L38 -46 L52 -38`, INK.black, 5, 'stroke-linecap="round" stroke-linejoin="round"');
    o.black += strokeP(`M0 30 Q18 38 34 22 M34 22 L38 18`, INK.black, 5, 'stroke-linecap="round"');
  } else if (ex === 'esceptico') {
    add(o, eye({ cx: E1[0], cy: E1[1], r: 17, lid: 0.42, tilt: -8, look: lk([6, 5]), pr: 7 }));
    add(o, eye({ cx: E2[0], cy: E2[1], r: 17, lid: 0.18, tilt: 6, look: lk([6, 3]), pr: 7 }));
    o.black += strokeP(`M-30 -22 L-1 -20 M24 -42 L40 -50 L54 -38`, INK.black, 5, 'stroke-linecap="round" stroke-linejoin="round"');
    o.black += strokeP(`M4 34 L34 26`, INK.black, 5, 'stroke-linecap="round"');
  }
  return o;
}
// Poses: cada extremidad parte de su enchufe fijo (SOCK) y solo se dan codo/rodilla y mano/pie.
const CHISPA_POSES = {
  stand: { legL: [[-56, 94], [-44, 122]], legR: [[48, 96], [38, 122]], feet: [-1, 1], armL: [[-130, 62], [-122, 88]], armR: [[126, 62], [134, 86]] },
  happy: { legL: [[-50, 92], [-44, 122]], legR: [[54, 88], [70, 108]], feet: [-1, 1], armL: [[-136, 26], [-150, -2]], armR: [[132, 24], [148, -4]] },
  cheer: { legL: [[-46, 94], [-42, 122]], legR: [[62, 82], [52, 106]], feet: [-1, 1], armL: [[-132, 6], [-126, -40]], armR: [[128, 4], [136, -42]] },
  shrug: { legL: [[-44, 94], [-38, 122]], legR: [[40, 94], [36, 122]], feet: [-1, 1], armL: [[-136, 46], [-146, 24]], armR: [[132, 46], [142, 24]] },
  hips: { legL: [[-46, 94], [-40, 122]], legR: [[40, 94], [44, 122]], feet: [-1, 1], armL: [[-140, 52], [-112, 64]], armR: [[136, 52], [108, 64]] },
  lunge: { legL: [[-66, 92], [-104, 104]], legR: [[66, 84], [58, 110]], feet: [-1, 1], armL: [[-138, 8], [-152, -24]], armR: [[140, 12], [178, -22]] },
  hold: { legL: [[-46, 94], [-40, 122]], legR: [[40, 94], [36, 122]], feet: [-1, 1], armL: [[-136, 10], [-120, -26]], armR: [[132, 8], [118, -28]] },
  // compra: brazo izquierdo en alto con la bolsa, derecho hacia delante sujetando el ticket
  compra: { legL: [[-50, 94], [-42, 122]], legR: [[46, 94], [40, 122]], feet: [-1, 1], armL: [[-140, 6], [-176, -34]], armR: [[132, 50], [158, 74]], bag: true },
  // tiesa: brazos pegados al cuerpo (hipnotizada)
  tiesa: { legL: [[-40, 96], [-38, 122]], legR: [[36, 96], [34, 122]], feet: [-1, 1], armL: [[-120, 64], [-112, 92]], armR: [[120, 62], [112, 90]] },
  armsUp: { armL: [[-134, 10], [-130, -30]], armR: [[132, 6], [140, -34]] },
  // --- Reels (reel 00) ---
  // golpe: los dos puños abajo, sobre lo que golpea; piernas recogidas
  golpe: { legL: [[-62, 92], [-44, 108]], legR: [[58, 90], [40, 108]], feet: [-1, 1], armL: [[-140, 70], [-70, 136]], armR: [[138, 70], [70, 136]] },
  // ciclo de carrera de 2 dibujos (con lean −12 y speed 4)
  corre_a: { legL: [[-70, 86], [-112, 96]], legR: [[56, 96], [60, 122]], feet: [-1, 1], armL: [[-138, 8], [-152, -24]], armR: [[140, 12], [178, -22]] },
  corre_b: { legL: [[-40, 96], [-44, 122]], legR: [[74, 84], [104, 100]], feet: [-1, 1], armL: [[-138, 8], [-152, -24]], armR: [[118, 60], [96, 88]] },
  // frena: derrape, piernas adelantadas y rígidas, brazos atrás (con lean +8)
  frena: { legL: [[-20, 98], [10, 122]], legR: [[62, 96], [96, 118]], feet: [1, 1], armL: [[-140, 20], [-170, 4]], armR: [[120, 10], [100, -20]] },
  // agachada: brazos de shrug y rodillas dobladas hacia fuera (los pies quedan en y local ≈ 90)
  agachada: { legL: [[-84, 64], [-66, 86]], legR: [[80, 62], [62, 86]], feet: [-1, 1], armL: [[-136, 46], [-146, 24]], armR: [[132, 46], [142, 24]] },
  none: null,
};
// Bolsa de la compra genérica: tinta negra, asa en reserva, sin logos. (hx,hy) = mano.
function bag(hx, hy) {
  let b = `<path d="M${hx - 34} ${hy + 22} L${hx + 34} ${hy + 22} L${hx + 40} ${hy + 104} Q${hx + 40} ${hy + 110} ${hx + 34} ${hy + 110} L${hx - 34} ${hy + 110} Q${hx - 40} ${hy + 110} ${hx - 40} ${hy + 104}Z" fill="${INK.black}"/>`;
  b += `<path d="M${hx - 18} ${hy + 24} C${hx - 18} ${hy - 6} ${hx + 18} ${hy - 6} ${hx + 18} ${hy + 24}" fill="none" stroke="${INK.black}" stroke-width="6"/>`;
  b += `<rect x="${hx - 22}" y="${hy + 40}" width="44" height="7" rx="3.5" fill="${W}"/>`;
  return b;
}
// halo: hueco de reserva alrededor de la silueta (para separarla de una trama de su misma tinta)
// Parámetros de Reels: squash (aplasta desde los pies, y local 127), sizzle (lóbulos B), blink, spin (espiral).
function chispa({ x = 0, y = 0, s = 1, rot = 0, lean = 0, flip = false, expr = 'neutral', pose = 'stand', look = null, sweat = 0, sweatIdx = null, speed = 0, knockFor = null, knockClip = null, faceKnock = null, halo = 0, hands = null, limbs = null, squash = 1, sizzle = false, blink = false, spin = 0 }) {
  const o = L();
  const P = CHISPA_POSES[pose] && limbs ? { ...CHISPA_POSES[pose], ...limbs } : CHISPA_POSES[pose];
  const body = sizzle ? CHISPA_BODY_D_B : CHISPA_BODY_D;
  if (halo) o.red += `<path d="${body}" fill="${W}" stroke="${W}" stroke-width="${halo * 2}" stroke-linejoin="round"/>`;
  if (P) {
    const legs = P.legL ? [[SOCK.legL, ...P.legL], [SOCK.legR, ...P.legR]] : [];
    legs.forEach((leg, i) => {
      o.black += strokeP(poly(leg), INK.black, 6, 'stroke-linejoin="miter" stroke-linecap="round"');
      const [fx, fy] = leg[leg.length - 1], d = P.feet[i], tx = fx + d * 20;
      o.black += `<path d="M${fx - d * 3} ${fy - 3} L${tx} ${fy - 1} L${tx + d * 2} ${fy + 5} L${fx - d * 3} ${fy + 5}Z" fill="${INK.black}" stroke="${INK.black}" stroke-width="2" stroke-linejoin="round"/>`;
    });
    for (const arm of [[SOCK.armL, ...P.armL], [SOCK.armR, ...P.armR]]) {
      o.black += strokeP(poly(arm), INK.black, 6, 'stroke-linejoin="miter" stroke-linecap="round"');
      const h = arm[arm.length - 1];
      o.black += `<circle cx="${h[0]}" cy="${h[1]}" r="7" fill="${INK.black}"/>`;
    }
    if (P.bag) { const h = P.armL[P.armL.length - 1]; o.black += `<g transform="translate(${h[0]} ${h[1]}) scale(0.72) translate(${-h[0]} ${-h[1]})">${bag(h[0], h[1] - 4)}</g>`; }
  }
  // manos sueltas (pose «asomada»: las manos-punto agarradas a un borde)
  if (hands) for (const [hx, hy] of hands) o.black += `<circle cx="${hx}" cy="${hy}" r="8" fill="${INK.black}"/>`;
  o.red += `<path d="${body}" fill="${INK.red}"/>`;
  for (const fd of CHISPA_FOLDS) o.red += strokeP(poly(fd), W, 6.5, 'stroke-linejoin="round" stroke-linecap="round"');
  if (knockFor) {
    let clip = '';
    if (knockClip) { const cid = uid('mk'); o.defs += `<clipPath id="${cid}"><rect x="${knockClip[0]}" y="${knockClip[1]}" width="${knockClip[2]}" height="${knockClip[3]}"/></clipPath>`; clip = `clip-path="url(#${cid})"`; }
    for (const k of knockFor) o[k] += `<path d="${body}" fill="${W}" ${clip}/>`;
  }
  const face = chispaFace(expr, look, { blink, spin });
  if (faceKnock) for (const k of faceKnock) o[k] += face.red;
  add(o, face);
  const drops = [[-112, -78, 1.25, -25], [124, -64, 1.0, 25], [-136, -40, 0.85, -40]];
  for (const i of sweatIdx || [...Array(sweat).keys()]) o.blue += teardrop(...drops[i]);
  const sp = [[-178, -48, -236], [-176, -12, -262], [-172, 22, -226], [-150, 54, -196]];
  for (let i = 0; i < speed; i++) { const [x1, yy, x2] = sp[i]; o.black += strokeP(`M${x1} ${yy} L${x2} ${yy}`, INK.black, 5, 'stroke-linecap="round"'); }
  const sq = squash !== 1 ? ` translate(0 127) scale(${f(1 / squash ** 0.5)} ${squash}) translate(0 -127)` : '';
  return wrap(o, `translate(${x} ${y}) rotate(${rot}) skewX(${lean}) scale(${flip ? -s : s} ${s})${sq}`);
}
// marcas de exaltación (tres trazos) — coordenadas de escena
function burst(x, y, s = 1, color = INK.black) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${color}" stroke-width="5" stroke-linecap="round"><path d="M0 -6 L0 -28 M-22 2 L-38 -10 M22 2 L38 -10"/></g>`;
}

// =====================================================================
// PAUSA — Sistema 2. Canto rodado con tres lóbulos suaves y surcos peinados.
// Sistema local: centro en (0,0). Ancho ~380, alto ~265 (+ pies).
// =====================================================================
const PAUSA_BODY = `M-176 70 C-196 8 -172 -72 -112 -98 C-96 -134 -42 -146 -10 -124 C12 -150 74 -152 102 -116 C152 -110 192 -62 186 2 C182 62 160 106 100 113 C40 120 -60 121 -120 113 C-160 108 -173 94 -176 70Z`;
const PAUSA_FOLDS = [
  `M-158 12 C-134 -10 -108 16 -82 0 C-62 -12 -50 4 -36 -2`,
  `M-138 -50 C-122 -82 -90 -96 -64 -86 C-50 -80 -50 -66 -62 -62`,
  `M-26 -104 C-10 -118 14 -118 24 -104`,
  `M8 -78 C26 -96 52 -84 70 -98 C88 -110 116 -98 128 -76 C132 -66 126 -58 116 -60`,
  `M-52 -36 C-28 -54 -6 -30 20 -44 C34 -52 44 -48 50 -40`,
  `M-160 58 C-136 42 -110 66 -86 50 C-76 44 -66 48 -64 58`,
];
// Ronda 2 del post 00: cara 30 px más hacia el centro del cuerpo (antes ojos 34/106, boca 70).
const PAUSA_E1 = [4, 12], PAUSA_E2 = [76, 10], PAUSA_MOUTH = [40, 62];
function pausaBlush() {
  let b = '';
  for (const [bx, by] of [[PAUSA_E1[0] - 22, 46], [PAUSA_E2[0] + 22, 44]]) b += halftone({ x0: bx - 22, y0: by - 13, x1: bx + 22, y1: by + 13, step: 6, rmax: 2.6, color: W, fn: (x, y) => 1 - smooth(0.3, 1, Math.hypot((x - bx) / 21, (y - by) / 12)) });
  return b;
}
function pausaSmileD(mx, my) {
  return `<path d="M${mx - 26} ${my - 8} Q${mx} ${my - 2} ${mx + 26} ${my - 10} Q${mx + 22} ${my + 22} ${mx} ${my + 22} Q${mx - 22} ${my + 22} ${mx - 26} ${my - 8}Z" fill="${INK.black}"/>`;
}
// lid (Reels): sobrescribe la media asta (0,5) de los ojos de párpado; ≥ 0,97 = cerrado (arco de dormida)
function pausaFace(expr, lookIn, lidIn = null) {
  const o = L();
  const [E1, E2] = [PAUSA_E1, PAUSA_E2], [mx, my] = PAUSA_MOUTH;
  const wl = 'blue', R = 27, PR = 12;
  const halfEyes = (look, tilt = 3) => {
    const lid = lidIn ?? 0.5;
    if (lid >= 0.97) {
      for (const [ex, ey] of [E1, E2]) o.black += strokeP(`M${ex - 22} ${ey + 4} Q${ex} ${ey + 14} ${ex + 22} ${ey + 4}`, INK.black, 7, 'stroke-linecap="round"');
      return;
    }
    add(o, eye({ cx: E1[0], cy: E1[1], r: R, lid, tilt: -tilt, look, pr: PR, whiteLayer: wl, lidW: 8 }));
    add(o, eye({ cx: E2[0], cy: E2[1], r: R, lid, tilt, look, pr: PR, whiteLayer: wl, lidW: 8 }));
  };
  if (expr === 'neutral') {
    halfEyes(lookIn || [4, 6]);
    o.black += strokeP(`M${mx - 16} ${my} Q${mx} ${my + 4} ${mx + 18} ${my - 4}`, INK.black, 6, 'stroke-linecap="round"');
  } else if (expr === 'alarma') {
    const look = lookIn || [0, 0];
    add(o, eye({ cx: E1[0], cy: E1[1] - 6, r: R + 2, lid: 0, look, pr: 6, whiteLayer: wl }));
    add(o, eye({ cx: E2[0], cy: E2[1] - 6, r: R + 2, lid: 0, look, pr: 6, whiteLayer: wl }));
    o.black += strokeP(`M${E1[0] - 26} -40 Q${E1[0]} -54 ${E1[0] + 24} -44 M${E2[0] - 24} -46 Q${E2[0]} -56 ${E2[0] + 26} -42`, INK.black, 6, 'stroke-linecap="round"');
    o.black += `<ellipse cx="${mx}" cy="${my + 6}" rx="10" ry="14" fill="${INK.black}"/>`;
  } else if (expr === 'feliz') {
    add(o, closedEye(E1[0], E1[1] + 6, 21, false, 8));
    add(o, closedEye(E2[0], E2[1] + 6, 21, false, 8));
    o.black += pausaSmileD(mx, my);
    o.blue += `<ellipse cx="${mx}" cy="${my + 14}" rx="11" ry="6" fill="${W}" opacity="0.55"/>` + pausaBlush();
  } else if (expr === 'brindis') {
    // ojos de neutral (al lector) + boca y rubor de feliz
    halfEyes(lookIn || [0, 6], 2);
    o.black += pausaSmileD(mx, my + 2);
    o.blue += `<ellipse cx="${mx}" cy="${my + 16}" rx="11" ry="6" fill="${W}" opacity="0.55"/>` + pausaBlush();
  } else if (expr === 'esceptico') {
    const look = lookIn || [-7, 6];
    add(o, eye({ cx: E1[0], cy: E1[1], r: R, lid: 0.64, tilt: 5, look, pr: PR, whiteLayer: wl, lidW: 8 }));
    add(o, eye({ cx: E2[0], cy: E2[1], r: R, lid: 0.34, tilt: -7, look, pr: PR, whiteLayer: wl, lidW: 8 }));
    o.black += strokeP(`M${E2[0] - 24} -32 Q${E2[0]} -52 ${E2[0] + 26} -36`, INK.black, 6, 'stroke-linecap="round"');
    o.black += strokeP(`M${mx - 20} ${my + 2} L${mx + 6} ${my + 2} Q${mx + 18} ${my + 2} ${mx + 24} ${my - 8}`, INK.black, 6, 'stroke-linecap="round" stroke-linejoin="round"');
  } else if (expr === 'jadeo') {
    // sin aliento: media asta, boca en O pequeña, dos resoplidos
    halfEyes(lookIn || [-4, 6], 6);
    o.black += `<ellipse cx="${mx - 4}" cy="${my + 4}" rx="8" ry="11" fill="${INK.black}"/>`;
    o.black += strokeP(`M${mx - 24} ${my + 2} q-14 -6 -26 2 M${mx - 22} ${my + 16} q-14 4 -24 14`, INK.black, 5, 'stroke-linecap="round"');
  } else if (expr === 'dormida') {
    for (const [ex, ey] of [E1, E2]) o.black += strokeP(`M${ex - 22} ${ey + 4} Q${ex} ${ey + 14} ${ex + 22} ${ey + 4}`, INK.black, 7, 'stroke-linecap="round"');
    o.black += `<ellipse cx="${mx}" cy="${my + 2}" rx="7" ry="6" fill="${INK.black}"/>`;
  }
  return o;
}
// brazos-muñón: cápsulas de tinta azul separadas del cuerpo por un hueco de reserva
function stub(x1, y1, x2, y2, w = 36) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${W}" stroke-width="${w + 12}" stroke-linecap="round"/>` +
         `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK.blue}" stroke-width="${w}" stroke-linecap="round"/>`;
}
// steam: 'vapor' | 'salpica' | false
function mug(x, y, s = 1, steam = 'vapor', rot = 0) {
  if (steam === true) steam = 'vapor';
  let b = `<g transform="translate(${x} ${y})${rot ? ` rotate(${rot})` : ''} scale(${s})">`;
  b += `<path d="M-23 -26 L23 -26 L21 20 Q20 28 12 28 L-12 28 Q-20 28 -21 20Z" fill="${INK.black}"/>`;
  b += `<path d="M22 -14 C40 -14 40 12 21 12" fill="none" stroke="${INK.black}" stroke-width="7"/>`;
  b += `<rect x="-22" y="-12" width="44" height="6" fill="${W}"/>`;
  if (steam === 'vapor') b += strokeP(`M-8 -36 C-16 -46 0 -52 -8 -64 M8 -38 C0 -50 16 -56 8 -70`, INK.black, 3.5, 'stroke-linecap="round"');
  if (steam === 'vapor2') b += strokeP(`M-8 -36 C0 -46 -16 -52 -8 -66 M8 -38 C16 -50 0 -56 8 -68`, INK.black, 3.5, 'stroke-linecap="round"'); // vapor alterno (Reels)
  if (steam === 'salpica') { // gotas que salen de la taza en arco hacia delante (la punta mira atrás)
    const arc = [[8, -40, 1.0, 70], [30, -56, 0.85, 95], [54, -58, 0.7, 115], [76, -46, 0.55, 140]];
    for (const [dx, dy, sc, r] of arc) b += teardrop(dx, dy, sc, r, INK.black);
    b += `<path d="M-14 -30 Q0 -40 12 -34" fill="none" stroke="${INK.black}" stroke-width="5" stroke-linecap="round"/>`;
  }
  return b + '</g>';
}
// Libro abierto genérico (páginas en reserva con renglones de semitono, sin título). (x,y) = centro del lomo abajo.
function book(x, y, s = 1) {
  const o = L();
  const g = (str) => `<g transform="translate(${x} ${y}) scale(${s})">${str}</g>`;
  const pages = `M0 -6 C-30 -22 -80 -22 -112 -8 L-112 -98 C-80 -112 -30 -112 0 -96 C30 -112 80 -112 112 -98 L112 -8 C80 -22 30 -22 0 -6Z`;
  o.black += g(`<path d="M-120 2 L-120 -92 L-112 -98 L-112 -8 C-80 -22 -30 -22 0 -6 C30 -22 80 -22 112 -8 L112 -98 L120 -92 L120 2 C80 -10 30 -10 0 6 C-30 -10 -80 -10 -120 2Z" fill="${INK.black}"/>`);
  o.blue += g(`<path d="${pages}" fill="${W}" stroke="${W}" stroke-width="10" stroke-linejoin="round"/>`);
  o.red += g(`<path d="${pages}" fill="${W}"/>`);
  let lines = '';
  for (let i = 0; i < 6; i++) {
    const yy = -84 + i * 12;
    lines += `<path d="M-96 ${yy} C-70 ${yy - 8} -36 ${yy - 8} -14 ${yy}" fill="none" stroke="${INK.black}" stroke-width="3" stroke-dasharray="${i === 5 ? '20 200' : '1 0'}" opacity="0.35"/>`;
    lines += `<path d="M14 ${yy} C36 ${yy - 8} 70 ${yy - 8} 96 ${yy}" fill="none" stroke="${INK.black}" stroke-width="3" opacity="0.35"/>`;
  }
  o.black += g(lines + `<path d="M0 -94 L0 -8" stroke="${INK.black}" stroke-width="3"/>`);
  return o;
}
// Gafas de lectura redondas (atrezo de situación) sobre los ojos de Pausa
function glasses() {
  const [E1, E2] = [PAUSA_E1, PAUSA_E2];
  return `<g fill="none" stroke="${INK.black}" stroke-width="6"><circle cx="${E1[0]}" cy="${E1[1] + 4}" r="34"/><circle cx="${E2[0]}" cy="${E2[1] + 4}" r="34"/><path d="M${E1[0] + 33} ${E1[1] - 2} Q${(E1[0] + E2[0]) / 2} ${E1[1] - 12} ${E2[0] - 33} ${E2[1] - 2}"/><path d="M${E1[0] - 34} ${E1[1]} L${E1[0] - 62} ${E1[1] - 8}"/></g>`;
}
const PAUSA_POSES = {
  sit: { arms: [[146, 86, 182, 96]], mug: [214, 86], feet: true },
  hold: { arms: [[146, 86, 182, 96], [-150, 10, -196, -16]], mug: [214, 86], feet: true },
  nomug: { arms: [[150, 64, 182, 58]], mug: null, feet: true },
  shrug: { arms: [[-164, 30, -206, 4], [168, 30, 210, 4]], mug: null, feet: true },
  // llega: muñón con la taza por delante (salpicando), un pie levantado en zancada
  llega: { arms: [[150, 50, 200, 40]], mug: [236, 30], steam: 'salpica', stride: true },
  // duerme: sin brazos visibles, taza en el suelo a su lado, sin vapor
  duerme: { arms: [], mug: [236, 104], steam: false, feet: true },
  // lee: dos muñones hacia delante sujetando un libro; sin taza en mano
  lee: { arms: [[-36, 104, -54, 124], [150, 100, 140, 124]], mug: null, feet: true, book: [52, 156], bookS: 0.86, glasses: true },
  // brindis: muñón derecho a la altura de la cúpula con la taza arriba
  brindis: { arms: [[204, -6, 226, -74]], mug: [234, -112], feet: true },
  // sorbo (Reels): la taza sube hasta la comisura
  sorbo: { arms: [[140, 80, 112, 66]], mug: [100, 56], feet: true },
};
// Parámetros de Reels: lid (párpado), arms / mug (sobrescriben la pose para interpolar), steam, mugRot.
function pausa({ x = 0, y = 0, s = 1, rot = 0, flip = false, expr = 'neutral', pose = 'sit', look, knockFor = null, shine = true, squash = 1, halo = 0, lid = null, arms = null, mug: mugAt = undefined, steam = undefined, mugRot = 0 }) {
  const o = L();
  const P0 = PAUSA_POSES[pose];
  const P = { ...P0, ...(arms ? { arms } : {}), ...(mugAt !== undefined ? { mug: mugAt } : {}), ...(steam !== undefined ? { steam } : {}) };
  if (halo) o.blue += `<path d="${PAUSA_BODY}" fill="${W}" stroke="${W}" stroke-width="${halo * 2}" stroke-linejoin="round"/>`;
  if (P.stride) o.blue += `<ellipse cx="-92" cy="120" rx="38" ry="15" fill="${INK.blue}"/><ellipse cx="78" cy="110" rx="38" ry="15" fill="${INK.blue}" transform="rotate(-18 78 110)"/>`;
  else if (P.feet) o.blue += `<ellipse cx="-74" cy="120" rx="38" ry="15" fill="${INK.blue}"/><ellipse cx="62" cy="122" rx="38" ry="15" fill="${INK.blue}"/>`;
  o.blue += `<path d="${PAUSA_BODY}" fill="${INK.blue}"/>`;
  o.blue += `<path d="M-128 112 C-60 121 40 120 108 112" fill="none" stroke="${W}" stroke-width="6"/>`;
  for (const d of PAUSA_FOLDS) o.blue += strokeP(d, W, 8.5, 'stroke-linecap="round" stroke-linejoin="round"');
  if (shine) {
    const cid = uid('pausaclip');
    o.defs += `<clipPath id="${cid}"><path d="${PAUSA_BODY}"/></clipPath>`;
    o.blue += halftone({ x0: -190, y0: -150, x1: 40, y1: 60, step: 9, rmax: 3.6, color: W, clip: cid,
      fn: (px, py) => 0.95 * (1 - smooth(0.0, 1, Math.hypot((px + 120) / 120, (py + 80) / 85))) });
  }
  if (knockFor) for (const k of knockFor) o[k] += `<path d="${PAUSA_BODY}" fill="${W}"/>`;
  add(o, pausaFace(expr, look, lid));
  if (P.glasses) o.black += glasses();
  if (P.book) add(o, book(P.book[0], P.book[1], P.bookS || 0.92));
  for (const a of P.arms) o.blue += stub(...a);
  if (P.mug) o.black += mug(P.mug[0], P.mug[1], 1.2, P.steam === undefined ? 'vapor' : P.steam, mugRot);
  // squash de canto rodado: se aplasta desde la base
  const sq = squash !== 1 ? ` translate(0 122) scale(${1 / squash ** 0.5} ${squash}) translate(0 -122)` : '';
  return wrap(o, `translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})${sq}`);
}
// gotas de sudor de Pausa: en rojo (la tinta de la otra)
function pausaSweat(x, y, s = 1) { return teardrop(x, y, s, -20, INK.red) + teardrop(x + 26 * s, y - 22 * s, s * 0.8, 15, INK.red); }
// marcas de asentimiento: dos arcos pequeños junto a la cúpula
function nodMarks(x, y, s = 1) { return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${INK.black}" stroke-width="4.5" stroke-linecap="round"><path d="M0 0 Q10 14 0 28"/><path d="M14 -6 Q28 14 14 34"/></g>`; }

// ---------- atrezo de escena ----------
function priceTag(x, y, rot, label, s = 1, ink = INK.red) { // etiqueta en tinta; texto en reserva
  let r = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`;
  r += `<path d="${roundPoly([[-150, -78], [110, -78], [168, 0], [110, 78], [-150, 78]], 14)}" fill="${ink}"/>`;
  r += `<circle cx="116" cy="0" r="13" fill="${W}"/>`;
  r += text(-12, 34, label, { size: 104, fill: W, anchor: 'middle', ls: -0.02 });
  return r + '</g>';
}
function sign(x, y, rot, label, { w = 300, h = 96, size = 52, ink = INK.red } = {}) { // cartel rectangular, texto en reserva
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${ink}"/>` +
    text(0, size * 0.36, label, { size, fill: W, anchor: 'middle', ls: 0.01 }) + '</g>';
}
function coin(x, y, r = 24, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="${r}" ry="${r}" fill="${INK.blue}"/><ellipse rx="${r - 5}" ry="${r - 5}" fill="none" stroke="${W}" stroke-width="2.5"/>` +
    text(0, r * 0.4, '€', { size: r * 1.15, fill: W, anchor: 'middle', stretch: '100%' }) + `</g>`;
}
// sombra despegada (para saltos): más pequeña y clara
function liftedShadow(cx, cy, rx, ry) { return shadowEllipse(cx, cy, rx, ry, INK.black, 8, 2.6, 0.75); }

// ---------- texto ----------
const FONT_HEAD = `'Bricolage Grotesque', sans-serif`;
const FONT_MONO = `'DM Mono', monospace`;
function text(x, y, str, { size = 40, font = FONT_HEAD, weight = 800, anchor = 'start', ls = 0, fill = INK.black, stretch = '75%', rot = 0, extra = '' } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" transform="rotate(${rot} ${x} ${y})" style="font-family:${font};font-weight:${weight};font-size:${size}px;letter-spacing:${ls}em;font-stretch:${stretch};font-variation-settings:'opsz' 96" fill="${fill}" ${extra}>${str}</text>`;
}

// ---------- documento risográfico ----------
const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=DM+Mono:ital,wght@0,400;0,500;1,500&display=block');`;
function inkFilter(id, seed, { rough = 2.2, speck = 1 } = {}) {
  return `<filter id="${id}" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${seed}" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="${rough}" xChannelSelector="R" yChannelSelector="G" result="rough"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed + 11}" result="grain"/>
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${-6 * speck} 0 0 0 ${2.45 * speck}" result="speck"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="${seed + 5}" result="wash"/>
    <feColorMatrix in="wash" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${-0.8 * speck} 0 0 0 ${0.44 * speck}" result="washA"/>
    <feMerge result="spk"><feMergeNode in="speck"/><feMergeNode in="washA"/></feMerge>
    <feComposite in="spk" in2="rough" operator="in" result="spkIn"/>
    <feMerge><feMergeNode in="rough"/><feMergeNode in="spkIn"/></feMerge>
  </filter>`;
}
function riso(w, h, { paper = PAPERS.niebla, layers, misreg = { blue: [3.5, 2.5, 0.12], red: [-2, -1, -0.06], black: [0, 0, 0] }, under = '', grain = 1 }) {
  const defs = `
  <style><![CDATA[${FONTS_CSS}]]></style>
  ${inkFilter('inkBlue', 3, { speck: grain })}${inkFilter('inkRed', 21, { speck: grain })}${inkFilter('inkBlack', 41, { rough: 1.4, speck: 0.55 * grain })}
  <filter id="paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="8" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.25  0 0 0 0 0.3  0 0 0 -1.1 0.62"/>
  </filter>
  <filter id="fiber" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.4" numOctaves="2" seed="13" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 -1.4 0.72"/>
  </filter>
  ${layers.defs || ''}`;
  const plate = (k, filt) => {
    const [dx, dy, r] = misreg[k];
    return `<g style="mix-blend-mode:multiply" filter="url(#${filt})"><g transform="translate(${dx} ${dy}) rotate(${r} ${w / 2} ${h / 2})">${layers[k]}</g></g>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>${defs}</defs>
<rect width="${w}" height="${h}" fill="${paper}"/>
<g style="mix-blend-mode:multiply"><rect width="${w}" height="${h}" fill="#fff" filter="url(#paper)" opacity="${0.5 * Math.min(1, grain + 0.1)}"/><rect width="${w}" height="${h}" fill="#fff" filter="url(#fiber)" opacity="0.12"/></g>
${under}
${plate('blue', 'inkBlue')}
${plate('red', 'inkRed')}
${plate('black', 'inkBlack')}
</svg>`;
}

// ---------- texto enriquecido por planchas ----------
// Un span = { t, st, ink }. st: 'head' (800, 75 %), 'body' (600, 88 %), 'bold' (800, 88 %),
// 'mono' (DM Mono 500), 'monoI' (DM Mono 500 cursiva). ink: 'black' | 'red' | 'blue'.
// Cada línea se escribe una vez por plancha con los mismos tspans; en cada plancha los spans
// de otra tinta van transparentes, así la composición es idéntica y cada color cae en su plancha.
const STY = {
  head: { family: FONT_HEAD, weight: 800, stretch: '75%', ital: false, opsz: 96 },
  body: { family: FONT_HEAD, weight: 600, stretch: '88%', ital: false, opsz: 48 },
  bold: { family: FONT_HEAD, weight: 800, stretch: '88%', ital: false, opsz: 48 },
  mono: { family: FONT_MONO, weight: 500, stretch: '100%', ital: false },
  monoI: { family: FONT_MONO, weight: 500, stretch: '100%', ital: true },
};
const INKKEY = { black: INK.black, red: INK.red, blue: INK.blue };
function styleCss(st, size, ls = 0) {
  const S = STY[st];
  return `font-family:${S.family};font-weight:${S.weight};font-size:${size}px;font-stretch:${S.stretch};font-style:${S.ital ? 'italic' : 'normal'};letter-spacing:${ls}em;${S.opsz ? `font-variation-settings:'opsz' ${S.opsz};` : ''}`;
}
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// lines: array de arrays de spans. Devuelve capas.
function richText({ x, y, lines, size, lh = 1.2, anchor = 'start', ls = 0, rot = 0 }) {
  const o = L();
  lines.forEach((spans, i) => {
    const yy = y + i * size * lh;
    const inks = [...new Set(spans.map((sp) => sp.ink || 'black'))];
    for (const ink of inks) {
      const ts = spans.map((sp) => `<tspan style="${styleCss(sp.st || 'body', sp.size || size, sp.ls ?? ls)}" fill="${(sp.ink || 'black') === ink ? INKKEY[ink] : 'none'}">${esc(sp.t)}</tspan>`).join('');
      o[ink] += `<text x="${x}" y="${f(yy)}" text-anchor="${anchor}" xml:space="preserve" transform="rotate(${rot} ${x} ${f(yy)})">${ts}</text>`;
    }
  });
  return o;
}
// Medidor de texto con las fuentes reales (Playwright). Uso: const M = await measurer(); M.wrap(spans, maxW, size)
async function measurer() {
  const { chromium } = require('/opt/node-tools/node_modules/playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${FONTS_CSS}</style></head><body><div id="m" style="position:absolute;white-space:pre"></div><span style="font-family:'Bricolage Grotesque';font-weight:800">a</span><span style="font-family:'Bricolage Grotesque';font-weight:600">a</span><span style="font-family:'DM Mono';font-weight:500">a</span><span style="font-family:'DM Mono';font-weight:500;font-style:italic">a</span></body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const cache = new Map();
  async function width(spans, size) {
    const html = spans.map((sp) => `<span style="${styleCss(sp.st || 'body', sp.size || size, sp.ls || 0)}">${esc(sp.t)}</span>`).join('');
    if (cache.has(html)) return cache.get(html);
    const w = await page.evaluate((h) => { const m = document.getElementById('m'); m.innerHTML = h; return m.getBoundingClientRect().width; }, html);
    cache.set(html, w);
    return w;
  }
  // Ajuste de línea voraz por palabras, respetando el estilo de cada palabra.
  async function wrapSpans(spans, maxW, size) {
    const words = [];
    for (const sp of spans) {
      const parts = sp.t.split(/( )/);
      for (const p of parts) if (p !== '') words.push({ ...sp, t: p });
    }
    const lines = [];
    let cur = [];
    const merge = (arr) => { const out = []; for (const w of arr) { const last = out[out.length - 1]; if (last && last.st === w.st && (last.ink || 'black') === (w.ink || 'black') && last.size === w.size) last.t += w.t; else out.push({ ...w }); } return out; };
    for (const w of words) {
      const trial = merge([...cur, w]);
      const trimmed = merge(trial); if (trimmed.length) trimmed[trimmed.length - 1].t = trimmed[trimmed.length - 1].t.replace(/ +$/, '');
      if (cur.length && w.t !== ' ' && (await width(trimmed, size)) > maxW) {
        const done = merge(cur); done[done.length - 1].t = done[done.length - 1].t.replace(/ +$/, '');
        lines.push(done); cur = [w];
      } else cur.push(w);
    }
    if (cur.length) { const done = merge(cur); done[done.length - 1].t = done[done.length - 1].t.replace(/ +$/, ''); lines.push(done); }
    return lines;
  }
  return { width, wrap: wrapSpans, close: () => browser.close() };
}

// ---------- carta de personaje (fichaCard) ----------
// Carta coleccionable de fanzine. rows: [{ label, lines }] (lines = líneas ya ajustadas, arrays de spans);
// frase: spans de la frase (en la tinta de la personaje); meter: nº de segmentos llenos (0–5);
// late: desregistro extra [dx,dy] de la plancha de la personaje en marco y banda (gag de Pausa).
// figure: capas de la personaje, dibujadas encima de la ventana. Devuelve capas.
const CARD = { x0: 88, y0: 290, x1: 992, y1: 1196, frame: 14, band: 96, win: 400 };
function fichaCard({ ink = 'red', nombre, numero, rows, frase, meter = 5, rot = 0, late = null, figure = null, valueSize = 36, under = null }) {
  const o = L();
  const C = CARD, col = INK[ink];
  const cx = (C.x0 + C.x1) / 2, cy = (C.y0 + C.y1) / 2;
  const ix0 = C.x0 + C.frame, ix1 = C.x1 - C.frame, by1 = C.y0 + C.band, wy1 = by1 + C.win;
  const lateT = late ? `translate(${late[0]} ${late[1]})` : '';
  // marco (anillo de tinta) + banda
  const outer = `M${C.x0 + 18} ${C.y0} H${C.x1 - 18} Q${C.x1} ${C.y0} ${C.x1} ${C.y0 + 18} V${C.y1 - 18} Q${C.x1} ${C.y1} ${C.x1 - 18} ${C.y1} H${C.x0 + 18} Q${C.x0} ${C.y1} ${C.x0} ${C.y1 - 18} V${C.y0 + 18} Q${C.x0} ${C.y0} ${C.x0 + 18} ${C.y0}Z`;
  const inner = `M${ix0 + 6} ${C.y0 + C.frame} H${ix1 - 6} Q${ix1} ${C.y0 + C.frame} ${ix1} ${C.y0 + C.frame + 6} V${C.y1 - C.frame - 6} Q${ix1} ${C.y1 - C.frame} ${ix1 - 6} ${C.y1 - C.frame} H${ix0 + 6} Q${ix0} ${C.y1 - C.frame} ${ix0} ${C.y1 - C.frame - 6} V${C.y0 + C.frame + 6} Q${ix0} ${C.y0 + C.frame} ${ix0 + 6} ${C.y0 + C.frame}Z`;
  let plate = `<path d="${outer} ${inner}" fill="${col}" fill-rule="evenodd"/>`;
  plate += `<path d="M${C.x0} ${by1} V${C.y0 + 18} Q${C.x0} ${C.y0} ${C.x0 + 18} ${C.y0} H${C.x1 - 18} Q${C.x1} ${C.y0} ${C.x1} ${C.y0 + 18} V${by1}Z" fill="${col}"/>`;
  plate += text(ix0 + 22, C.y0 + 74, nombre, { size: 72, fill: W, ls: 0.01 });
  plate += text(ix1 - 22 + 22 * 0.06, C.y0 + 60, numero, { size: 22, font: FONT_MONO, weight: 500, fill: W, ls: 0.06, anchor: 'end', stretch: '100%' });
  // ventana: trama de la tinta, más densa hacia abajo
  const wid = uid('win');
  o.defs += `<clipPath id="${wid}"><rect x="${ix0}" y="${by1}" width="${ix1 - ix0}" height="${C.win}"/></clipPath>`;
  const tr = halftone({ x0: ix0, y0: by1, x1: ix1, y1: wy1, step: 10, rmax: 5, color: col, clip: wid,
    fn: (x, y) => 0.13 + 0.17 * ((y - by1) / C.win) });
  const g = (str) => `<g transform="rotate(${rot} ${cx} ${cy})">${str}</g>`;
  o[ink] += g(`<g transform="${lateT}">${plate}</g>${tr}`);
  if (under) add(o, wrapRot(under, rot, cx, cy));
  if (figure) add(o, wrapRot(figure, rot, cx, cy));
  // medidor de velocidad: velocímetro de 5 sectores con aguja, sin texto.
  // meter = sectores encendidos (negro lleno); el resto en semitono. La aguja apunta al último encendido.
  let m = '';
  const gx = ix1 - 92, gy = wy1 - 26, R0 = 40, R1 = 64;
  const pt = (a, rr) => [gx + rr * Math.cos(a), gy - rr * Math.sin(a)];
  for (let i = 0; i < 5; i++) {
    const a0 = Math.PI - (i * Math.PI) / 5 - 0.05, a1 = Math.PI - ((i + 1) * Math.PI) / 5 + 0.05;
    const [p0, p1, p2, p3] = [pt(a0, R1), pt(a1, R1), pt(a1, R0), pt(a0, R0)];
    const d = `M${f(p0[0])} ${f(p0[1])} A${R1} ${R1} 0 0 1 ${f(p1[0])} ${f(p1[1])} L${f(p2[0])} ${f(p2[1])} A${R0} ${R0} 0 0 0 ${f(p3[0])} ${f(p3[1])}Z`;
    if (i < meter) m += `<path d="${d}" fill="${INK.black}"/>`;
    else {
      const cid = uid('mt');
      o.defs += `<clipPath id="${cid}"><path d="${d}"/></clipPath>`;
      m += halftone({ x0: gx - R1 - 2, y0: gy - R1 - 2, x1: gx + R1 + 2, y1: gy + 2, step: 4.5, rmax: 1.5, color: INK.black, clip: cid, fn: () => 1 });
    }
  }
  const an = Math.PI - ((Math.max(1, meter) - 0.5) * Math.PI) / 5, tip = pt(an, R1 - 4);
  m += `<path d="M${gx} ${gy} L${f(tip[0])} ${f(tip[1])}" stroke="${INK.black}" stroke-width="6" stroke-linecap="round"/><circle cx="${gx}" cy="${gy}" r="9" fill="${INK.black}"/>`;
  o[ink] += g(`<path d="M${gx - R1 - 14} ${gy + 12} V${gy} A${R1 + 14} ${R1 + 14} 0 0 1 ${gx + R1 + 14} ${gy} V${gy + 12}Z" fill="${W}"/>`);
  o.black += g(m);
  // filas de datos
  const fraseH = 116, rowsTop = wy1 + 4, rowsBot = C.y1 - C.frame - fraseH - 6;
  const lh = valueSize * 1.12;
  const nLines = rows.reduce((a, r) => a + r.lines.length, 0);
  const pad = Math.max(4, Math.min(12, ((rowsBot - rowsTop) - nLines * lh) / (2 * rows.length)));
  const nat = rows.map((r) => r.lines.length * lh + pad * 2);
  const extra = Math.max(0, (rowsBot - rowsTop) - nat.reduce((a, b) => a + b, 0)) / rows.length;
  let y = rowsTop, blk = '';
  const tx = add(L(), {});
  rows.forEach((r, i) => {
    const h = nat[i] + extra;
    if (i > 0) blk += `<rect x="${ix0 + 18}" y="${y - 1}" width="${ix1 - ix0 - 36}" height="2" fill="${INK.black}"/>`;
    const base = y + (h - r.lines.length * lh) / 2 + valueSize * 0.8;
    blk += text(ix0 + 18, base - 3, r.label, { size: 30, font: FONT_MONO, weight: 500, ls: 0.04, stretch: '100%' });
    add(tx, richText({ x: ix0 + 18 + 230, y: base, lines: r.lines, size: valueSize, lh: 1.12 }));
    y += h;
  });
  blk += `<rect x="${ix0 + 18}" y="${rowsBot + 5}" width="${ix1 - ix0 - 36}" height="2" fill="${INK.black}"/>`;
  const fb = C.y1 - C.frame - 40;
  blk += text(ix0 + 18, fb - 6, 'Frase:', { size: 30, font: FONT_MONO, weight: 500, ls: 0.04, stretch: '100%' });
  add(tx, richText({ x: ix0 + 18 + 230, y: fb, lines: [frase], size: 52 }));
  o.black += g(blk);
  for (const k of ['black', 'red', 'blue']) if (tx[k]) o[k] += g(tx[k]);
  return o;
}
function wrapRot(layers, rot, cx, cy) {
  const o = L();
  for (const k of ['black', 'red', 'blue']) if (layers[k]) o[k] = `<g transform="rotate(${rot} ${cx} ${cy})">${layers[k]}</g>`;
  o.defs = layers.defs || '';
  return o;
}

// ---------- página de carrusel (cabecera, pie, progreso) ----------
// n: slide actual (1..total); ink: 'red' | 'blue' | 'plum'; post: «N.º 00»
function pageChrome({ n, total = 9, ink = 'red', post = 'N.º 00', signoff = null }) {
  const o = L();
  o.black += text(64, 92, 'DINERO IRRACIONAL', { size: 24, font: FONT_MONO, weight: 500, ls: 0.12, stretch: '100%' });
  o.black += text(1016, 92, post, { size: 24, font: FONT_MONO, weight: 500, ls: 0.12, anchor: 'end', stretch: '100%' });
  o.black += `<rect x="64" y="112.5" width="952" height="3" fill="${INK.black}"/>`;
  o.black += `<rect x="64" y="1234.5" width="952" height="3" fill="${INK.black}"/>`;
  if (signoff) o.black += text(64, 1296, signoff, { size: 40 });
  else o.black += text(64, 1292, 'Desliza →', { size: 30, font: FONT_MONO, weight: 500, stretch: '100%' });
  const pad = (k) => String(k).padStart(2, '0');
  // DM Mono con interletra deja un hueco al final: se compensa para alinear a x = 1016
  o.black += text(1016 + 24 * 0.12, 1292, `${pad(n)} / ${pad(total)}`, { size: 24, font: FONT_MONO, weight: 500, ls: 0.12, anchor: 'end', stretch: '100%' });
  for (let i = 0; i < total; i++) {
    const cx = 1012 - (total - 1 - i) * 18, cy = 1260;
    if (i + 1 === n) {
      // ciruela: los dos puntos se compensan del desregistro estándar para que se pisen enteros
      if (ink === 'plum') { o.red += `<circle cx="${cx + 2}" cy="${cy + 1}" r="5" fill="${INK.red}"/>`; o.blue += `<circle cx="${cx - 3.5}" cy="${cy - 2.5}" r="5" fill="${INK.blue}"/>`; }
      else o[ink] += `<circle cx="${cx}" cy="${cy}" r="5" fill="${INK[ink]}"/>`;
    } else if (i + 1 < n) o.black += `<circle cx="${cx}" cy="${cy}" r="4" fill="${INK.black}"/>`;
    else o.black += `<circle cx="${cx}" cy="${cy}" r="4" fill="${INK.black}" opacity="0.22"/>`;
  }
  return o;
}

// ---------- render ----------
async function render(jobs) {
  const { chromium } = require('/opt/node-tools/node_modules/playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const { name, svg, w, h, outW, dir = OUT, svgOut = true } of jobs) {
    if (svgOut) fs.writeFileSync(path.join(dir, name + '.svg'), svg);
    const scale = outW ? outW / w : 1;
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}</style></head><body><div id="c" style="width:${w * scale}px;height:${h * scale}px;overflow:hidden">${svg.replace(`width="${w}" height="${h}"`, `width="${w * scale}" height="${h * scale}"`)}</div></body></html>`;
    await page.setViewportSize({ width: Math.ceil(w * scale), height: Math.ceil(h * scale) });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    await page.locator('#c').screenshot({ path: path.join(dir, name + '.png') });
    console.log('rendered', name);
  }
  await browser.close();
}

module.exports = {
  INK, PAPERS, W, L, add, wrap, uid, resetUid, f, FONTS_CSS, inkFilter, CHISPA_POSES, PAUSA_POSES, spiralPath, smooth, roundPoly, poly, strokeP, halftone, shadowEllipse, liftedShadow, teardrop, eye, closedEye,
  chispa, pausa, CHISPA_BODY_D, PAUSA_BODY, SOCK, burst, pausaSweat, nodMarks, mug, bag, book, glasses, stub, priceTag, sign, coin,
  text, richText, measurer, STY, styleCss, pageChrome, fichaCard, CARD, wrapRot, riso, render, FONT_HEAD, FONT_MONO,
};
