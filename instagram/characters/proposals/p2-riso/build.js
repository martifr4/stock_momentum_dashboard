// Propuesta 2 — «Riso». Construcción de personajes + escenas + render.
// Uso: node build.js [hero|expressions|cover|avatar|check|all]
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
// MAPI — Sistema 1. Un cerebrito facetado: cúpula en sierra de puntas romas,
// base plana, dos surcos en zigzag y una cisura horizontal.
// Sistema local: (0,0) ≈ centro del cuerpo. Cuerpo ≈ 232 × 195 (+ patas de 52).
// =====================================================================
// Cada diente es una circunvolución. Solo 3 dientes son afilados (S), el resto romos (r≈9).
const MAPI_TEETH = [0.8, 1.2, 0.95, 1.35, 1.0, 1.15, 0.75];
const MAPI_SHARP = [false, true, false, true, false, false, true];
function mapiArc(scale, a0, a1, amp, cy, teeth = MAPI_TEETH) {
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
const MAPI_DOME = mapiArc(1, Math.PI * 0.86, Math.PI * 0.12, 26, 0);
// Contorno: facetas laterales + cúpula de lóbulos. Los lóbulos romos son arcos (cúbicas);
// solo 3 son puntas afiladas: el nervio de Mapi, sin que deje de ser un cerebro.
function mapiBodyPath() {
  const D = MAPI_DOME;
  let d = 'M-66 70 L-92 56 Q-100 51 -104 44 L-118 8 L-110 -24 L' + D[0].join(' ');
  for (let i = 0; i + 2 < D.length; i += 2) {
    const v0 = D[i], p = D[i + 1], v1 = D[i + 2];
    if (MAPI_SHARP[i / 2]) { d += ` L${p[0]} ${p[1]} L${v1[0]} ${v1[1]}`; continue; }
    const mx = (v0[0] + v1[0]) / 2, my = (v0[1] + v1[1]) / 2, nx = p[0] - mx, ny = p[1] - my;
    const k = 1.33;
    d += ` C${f(v0[0] + nx * k)} ${f(v0[1] + ny * k)} ${f(v1[0] + nx * k)} ${f(v1[1] + ny * k)} ${v1[0]} ${v1[1]}`;
  }
  return d + ' L112 -18 L118 10 L104 42 Q100 50 92 54 L64 70 Z';
}
const MAPI_BODY_D = mapiBodyPath();
// surcos: dos zigzags concéntricos + cisura horizontal en la nuca
const MAPI_FOLDS = [
  mapiArc(0.8, Math.PI * 0.84, Math.PI * 0.2, 13, 0, [1, 1.2, 0.9, 1.25, 1, 1.1, 0.9]).slice(1, -1),
  mapiArc(0.54, Math.PI * 0.8, Math.PI * 0.36, 11, -2, [1, 1.2, 1.1]).slice(1, -1),
  [[-114, 8], [-96, 2], [-80, 10], [-62, 4], [-50, 8]],
];
// enchufes fijos de las extremidades (siempre en la mitad baja, lejos de la cara)
const SOCK = { legL: [-34, 68], legR: [32, 68], armL: [-106, 36], armR: [106, 34] };
function mapiFace(expr) {
  const o = L();
  const E1 = [-14, -2], E2 = [38, -4];
  const ex = expr;
  if (ex === 'neutral') {
    add(o, eye({ cx: E1[0], cy: E1[1], r: 17, look: [4, 1] }));
    add(o, eye({ cx: E2[0], cy: E2[1], r: 17, look: [4, 1] }));
    o.black += strokeP(`M-30 -28 L-2 -30 M24 -32 L52 -30`, INK.black, 5, 'stroke-linecap="round"');
    o.black += strokeP(`M4 32 Q16 36 28 31`, INK.black, 4.5, 'stroke-linecap="round"');
  } else if (ex === 'euforia' || ex === 'alarma') {
    const big = 20;
    add(o, eye({ cx: E1[0] - 2, cy: E1[1] - 2, r: big, pr: 5.5, look: ex === 'alarma' ? [-3, -2] : [3, -4] }));
    add(o, eye({ cx: E2[0] + 2, cy: E2[1] - 3, r: big, pr: 5.5, look: ex === 'alarma' ? [-3, -2] : [3, -4] }));
    o.black += strokeP(ex === 'alarma' ? `M-34 -38 L-4 -28 M28 -29 L58 -40` : `M-34 -32 L-20 -45 L-5 -36 M27 -39 L42 -51 L57 -39`, INK.black, 5, 'stroke-linecap="round" stroke-linejoin="round"');
    if (ex === 'alarma') {
      o.black += `<path d="${roundPoly([[-2, 24], [32, 24], [36, 46], [-6, 46]], 4)}" fill="${INK.black}"/>`;
      o.red += `<path d="M1 26 L31 26 L31.5 31 L0.5 31Z" fill="${W}"/>`;
    } else {
      o.black += `<path d="M-10 22 L44 19 C42 40 30 50 16 50 C2 50 -8 40 -10 22Z" fill="${INK.black}"/>`;
      o.red += `<path d="M-7 23.5 L41 21 L39 28 L-5 30Z" fill="${W}"/>`; // dientes (reserva)
    }
  } else if (ex === 'feliz') {
    add(o, closedEye(E1[0], E1[1] + 4, 14, true, 5.5));
    add(o, closedEye(E2[0], E2[1] + 4, 14, true, 5.5));
    o.black += strokeP(`M-30 -30 L-4 -34 M24 -35 L50 -31`, INK.black, 5, 'stroke-linecap="round"');
    o.black += `<path d="M-6 22 L40 20 C36 40 26 48 16 48 C5 48 -3 38 -6 22Z" fill="${INK.black}"/>`;
    o.red += `<path d="M-3 23 L37 21.5 L35 27 L-1 28Z" fill="${W}"/>`;
  } else if (ex === 'esceptico') {
    add(o, eye({ cx: E1[0], cy: E1[1], r: 17, lid: 0.42, tilt: -8, look: [6, 5], pr: 7 }));
    add(o, eye({ cx: E2[0], cy: E2[1], r: 17, lid: 0.18, tilt: 6, look: [6, 3], pr: 7 }));
    o.black += strokeP(`M-30 -22 L-1 -20 M24 -42 L40 -50 L54 -38`, INK.black, 5, 'stroke-linecap="round" stroke-linejoin="round"');
    o.black += strokeP(`M4 34 L34 26`, INK.black, 5, 'stroke-linecap="round"');
  }
  return o;
}
// Poses: cada extremidad parte de su enchufe fijo (SOCK) y solo se dan codo/rodilla y mano/pie.
// feet: [dirección de la puntera: -1 izquierda, +1 derecha]
const MAPI_POSES = {
  stand: { // relajado: brazos colgando, peso en una pierna
    legL: [[-56, 94], [-44, 122]], legR: [[48, 96], [38, 122]], feet: [-1, 1],
    armL: [[-130, 62], [-122, 88]], armR: [[126, 62], [134, 86]],
  },
  happy: { // brazos abiertos, un pie levantado
    legL: [[-50, 92], [-44, 122]], legR: [[54, 88], [70, 108]], feet: [-1, 1],
    armL: [[-136, 26], [-150, -2]], armR: [[132, 24], [148, -4]],
  },
  cheer: { // euforia: brazos arriba, rodilla arriba
    legL: [[-46, 94], [-42, 122]], legR: [[62, 82], [52, 106]], feet: [-1, 1],
    armL: [[-132, 6], [-126, -40]], armR: [[128, 4], [136, -42]],
  },
  shrug: {
    legL: [[-44, 94], [-38, 122]], legR: [[40, 94], [36, 122]], feet: [-1, 1],
    armL: [[-136, 46], [-146, 24]], armR: [[132, 46], [142, 24]],
  },
  hips: { // en jarras
    legL: [[-46, 94], [-40, 122]], legR: [[40, 94], [44, 122]], feet: [-1, 1],
    armL: [[-140, 52], [-112, 64]], armR: [[136, 52], [108, 64]],
  },
  lunge: { // se lanza a la derecha: brazo delantero estirado, pierna trasera tirante
    legL: [[-66, 92], [-104, 104]], legR: [[66, 84], [58, 110]], feet: [-1, 1],
    armL: [[-138, 8], [-152, -24]], armR: [[140, 12], [178, -22]],
  },
  hold: {
    legL: [[-46, 94], [-40, 122]], legR: [[40, 94], [36, 122]], feet: [-1, 1],
    armL: [[-136, 10], [-120, -26]], armR: [[132, 8], [118, -28]],
  },
  none: null,
};
function mapi({ x = 0, y = 0, s = 1, rot = 0, lean = 0, flip = false, expr = 'neutral', pose = 'stand', sweat = 0, speed = 0, knockFor = null, knockClip = null, faceKnock = null }) {
  const o = L();
  const P = MAPI_POSES[pose];
  const body = MAPI_BODY_D;
  if (P) {
    const legs = [[SOCK.legL, ...P.legL], [SOCK.legR, ...P.legR]];
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
  }
  // cuerpo: plancha roja
  o.red += `<path d="${body}" fill="${INK.red}"/>`;
  for (const fd of MAPI_FOLDS) o.red += strokeP(poly(fd), W, 6.5, 'stroke-linejoin="round" stroke-linecap="round"');
  // reserva en otras planchas (para que el cuerpo tape lo que hay detrás)
  if (knockFor) {
    let clip = '';
    if (knockClip) { const cid = uid('mk'); o.defs += `<clipPath id="${cid}"><rect x="${knockClip[0]}" y="${knockClip[1]}" width="${knockClip[2]}" height="${knockClip[3]}"/></clipPath>`; clip = `clip-path="url(#${cid})"`; }
    for (const k of knockFor) o[k] += `<path d="${body}" fill="${W}" ${clip}/>`;
  }
  const face = mapiFace(expr);
  if (faceKnock) for (const k of faceKnock) o[k] += face.red;
  add(o, face);
  // gotas de sudor: tinta azul (la otra plancha)
  const drops = [[-112, -78, 1.25, -25], [124, -64, 1.0, 25], [-136, -40, 0.85, -40]];
  for (let i = 0; i < sweat; i++) o.blue += teardrop(...drops[i]);
  // líneas de velocidad
  const sp = [[-178, -48, -236], [-176, -12, -262], [-172, 22, -226], [-150, 54, -196]];
  for (let i = 0; i < speed; i++) { const [x1, yy, x2] = sp[i]; o.black += strokeP(`M${x1} ${yy} L${x2} ${yy}`, INK.black, 5, 'stroke-linecap="round"'); }
  // lean = inclinación de dibujo animado (skew): la base sigue plana y horizontal
  return wrap(o, `translate(${x} ${y}) rotate(${rot}) skewX(${lean}) scale(${flip ? -s : s} ${s})`);
}

// =====================================================================
// CAPI — Sistema 2. Canto rodado con tres lóbulos suaves y surcos peinados.
// Sistema local: centro en (0,0). Ancho ~380, alto ~265.
// =====================================================================
const CAPI_BODY = `M-176 70 C-196 8 -172 -72 -112 -98 C-96 -134 -42 -146 -10 -124 C12 -150 74 -152 102 -116 C152 -110 192 -62 186 2 C182 62 160 106 100 113 C40 120 -60 121 -120 113 C-160 108 -173 94 -176 70Z`;
const CAPI_FOLDS = [ // surcos «peinados»: serpenteos lentos con gancho final, todos en la misma dirección
  `M-158 12 C-134 -10 -108 16 -82 0 C-58 -14 -44 8 -18 -6 C-4 -14 8 -12 16 -4`,
  `M-138 -50 C-122 -82 -90 -96 -64 -86 C-50 -80 -50 -66 -62 -62`,
  `M-26 -104 C-10 -118 14 -118 24 -104`,
  `M8 -78 C26 -96 52 -84 70 -98 C88 -110 116 -98 128 -76 C132 -66 126 -58 116 -60`,
  `M-52 -36 C-28 -54 -6 -30 20 -44 C34 -52 44 -48 50 -40`,
  `M-160 58 C-136 42 -110 66 -86 50 C-76 44 -66 48 -64 58`,
];
// Cara de Capi: ojos grandes de media luna (r 27), centrada ~40 px más hacia el cuerpo.
// Cada expresión cambia párpados Y boca.
const CAPI_E1 = [34, 12], CAPI_E2 = [106, 10], CAPI_MOUTH = [70, 62];
function capiFace(expr, lookIn) {
  const o = L();
  const [E1, E2] = [CAPI_E1, CAPI_E2], [mx, my] = CAPI_MOUTH;
  const wl = 'blue', R = 27, PR = 12;
  if (expr === 'neutral') {
    const look = lookIn || [4, 6];
    add(o, eye({ cx: E1[0], cy: E1[1], r: R, lid: 0.5, tilt: -3, look, pr: PR, whiteLayer: wl, lidW: 8 }));
    add(o, eye({ cx: E2[0], cy: E2[1], r: R, lid: 0.5, tilt: 3, look, pr: PR, whiteLayer: wl, lidW: 8 }));
    // boca: línea casi recta con una comisura apenas levantada (sonrisa de «ya, ya»)
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
    // sonrisa grande abierta en D, con lengua en reserva
    o.black += `<path d="M${mx - 26} ${my - 8} Q${mx} ${my - 2} ${mx + 26} ${my - 10} Q${mx + 22} ${my + 22} ${mx} ${my + 22} Q${mx - 22} ${my + 22} ${mx - 26} ${my - 8}Z" fill="${INK.black}"/>`;
    o.blue += `<ellipse cx="${mx}" cy="${my + 14}" rx="11" ry="6" fill="${W}" opacity="0.55"/>`;
    // rubor en reserva: trama clara (papel) sobre el azul, nada de morado
    for (const [bx, by] of [[E1[0] - 22, 46], [E2[0] + 22, 44]]) o.blue += halftone({ x0: bx - 22, y0: by - 13, x1: bx + 22, y1: by + 13, step: 6, rmax: 2.6, color: W, fn: (x, y) => 1 - smooth(0.3, 1, Math.hypot((x - bx) / 21, (y - by) / 12)) });
  } else if (expr === 'esceptico') {
    const look = lookIn || [-7, 6];
    add(o, eye({ cx: E1[0], cy: E1[1], r: R, lid: 0.64, tilt: 5, look, pr: PR, whiteLayer: wl, lidW: 8 }));
    add(o, eye({ cx: E2[0], cy: E2[1], r: R, lid: 0.34, tilt: -7, look, pr: PR, whiteLayer: wl, lidW: 8 }));
    o.black += strokeP(`M${E2[0] - 24} -32 Q${E2[0]} -52 ${E2[0] + 26} -36`, INK.black, 6, 'stroke-linecap="round"');
    // boca torcida hacia un lado, con mueca
    o.black += strokeP(`M${mx - 20} ${my + 2} L${mx + 6} ${my + 2} Q${mx + 18} ${my + 2} ${mx + 24} ${my - 8}`, INK.black, 6, 'stroke-linecap="round" stroke-linejoin="round"');
  }
  return o;
}
// brazos-muñón: cápsulas de tinta azul separadas del cuerpo por un hueco de reserva
function stub(x1, y1, x2, y2, w = 36) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${W}" stroke-width="${w + 12}" stroke-linecap="round"/>` +
         `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK.blue}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function mug(x, y, s = 1, steam = true) {
  // taza de tinta negra con banda en reserva; vapor en línea fina
  let b = `<g transform="translate(${x} ${y}) scale(${s})">`;
  b += `<path d="M-23 -26 L23 -26 L21 20 Q20 28 12 28 L-12 28 Q-20 28 -21 20Z" fill="${INK.black}"/>`;
  b += `<path d="M22 -14 C40 -14 40 12 21 12" fill="none" stroke="${INK.black}" stroke-width="7"/>`;
  b += `<rect x="-22" y="-12" width="44" height="6" fill="${W}"/>`;
  if (steam) b += strokeP(`M-8 -36 C-16 -46 0 -52 -8 -64 M8 -38 C0 -50 16 -56 8 -70`, INK.black, 3.5, 'stroke-linecap="round"');
  return b + '</g>';
}
const CAPI_POSES = {
  sit: { arms: [[146, 86, 182, 96]], mug: [214, 86], feet: true },
  hold: { arms: [[146, 86, 182, 96], [-150, 10, -196, -16]], mug: [214, 86], feet: true },
  nomug: { arms: [[150, 64, 182, 58]], mug: null, feet: true },
  shrug: { arms: [[-164, 30, -206, 4], [168, 30, 210, 4]], mug: null, feet: true },
};
function capi({ x = 0, y = 0, s = 1, rot = 0, flip = false, expr = 'neutral', pose = 'sit', look, knockFor = null, shine = true }) {
  const o = L();
  const P = CAPI_POSES[pose];
  // piececitos (asoman bajo el canto)
  if (P.feet) o.blue += `<ellipse cx="-74" cy="120" rx="38" ry="15" fill="${INK.blue}"/><ellipse cx="62" cy="122" rx="38" ry="15" fill="${INK.blue}"/>`;
  o.blue += `<path d="${CAPI_BODY}" fill="${INK.blue}"/>`;
  o.blue += `<path d="M-128 112 C-60 121 40 120 108 112" fill="none" stroke="${W}" stroke-width="6"/>`; // separa pies del cuerpo
  for (const d of CAPI_FOLDS) o.blue += strokeP(d, W, 8.5, 'stroke-linecap="round" stroke-linejoin="round"');
  if (shine) {
    const cid = uid('capiclip');
    o.defs += `<clipPath id="${cid}"><path d="${CAPI_BODY}"/></clipPath>`;
    o.blue += halftone({ x0: -190, y0: -150, x1: 40, y1: 60, step: 9, rmax: 3.6, color: W, clip: cid,
      fn: (px, py) => 0.95 * (1 - smooth(0.0, 1, Math.hypot((px + 120) / 120, (py + 80) / 85))) });
  }
  if (knockFor) for (const k of knockFor) o[k] += `<path d="${CAPI_BODY}" fill="${W}"/>`;
  const face = capiFace(expr, look);
  add(o, face);
  for (const a of P.arms) o.blue += stub(...a);
  if (P.mug) o.black += mug(P.mug[0], P.mug[1], 1.2);
  return wrap(o, `translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`);
}

// ---------- texto ----------
const FONT_HEAD = `'Bricolage Grotesque', sans-serif`;
const FONT_MONO = `'DM Mono', monospace`;
function text(x, y, str, { size = 40, font = FONT_HEAD, weight = 800, anchor = 'start', ls = 0, fill = INK.black, stretch = '75%', rot = 0, extra = '' } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" transform="rotate(${rot} ${x} ${y})" style="font-family:${font};font-weight:${weight};font-size:${size}px;letter-spacing:${ls}em;font-stretch:${stretch};font-variation-settings:'opsz' 96" fill="${fill}" ${extra}>${str}</text>`;
}

// ---------- documento risográfico ----------
const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=DM+Mono:wght@400;500&display=block');`;
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

// ---------- render ----------
async function render(jobs) {
  const { chromium } = require('/opt/node-tools/node_modules/playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const { name, svg, w, h, outW, dir = OUT } of jobs) {
    fs.writeFileSync(path.join(dir, name + '.svg'), svg);
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

module.exports = { INK, PAPERS, L, add, mapi, capi, text, riso, render, halftone, shadowEllipse, teardrop, strokeP, roundPoly, smooth, mug, uid, W, FONT_HEAD, FONT_MONO };

if (require.main === module) {
  const which = process.argv[2] || 'all';
  (which==='zoom'?require('./scenes.js').zoom():require('./scenes.js').run(which)).catch((e) => { console.error(e); process.exit(1); });
}
