// «Gominolas» (ronda 2) — construcción reutilizable de Mapi (Sistema 1) y Capi (Sistema 2).
// Coordenadas locales: origen = centro de la base del cuerpo (pies por debajo de y=0).
// Cuerpos generados con lobed(): una elipse base + cúspides (surcos) unidas por
// curvas Bézier que se abomban hacia fuera. Todas las piezas se definen una vez
// aquí y se combinan en cada escena (scenes.js).

const P = {
  ink: '#33203A',      // contorno: ciruela muy oscura (no negro)
  red: '#F5506A',      // Mapi — rojo cereza claro (L* 58)
  redShade: '#CF3152',
  blue: '#2850B8',     // Capi — azul tinta (L* 37): ≥20 L* de diferencia con Mapi
  blueShade: '#1B3889',
  blush: '#FF9BB5',
  mouth: '#FF6F8A',
  mug: '#FFE27A',
  mugShade: '#F2BE3C',
  sweat: '#8FD8F7',
};

let uid = 0;
const id = (p) => `${p}${++uid}`;
const OUT = 9, IN = 5, FINE = 4;
const f1 = (n) => +n.toFixed(1);

// ---------- GENERADOR DE CUERPOS LOBULADOS ----------
function lobed({ cx, cy, rx, ry, angles, bulge, widen = 0, flatBottom = 1 }) {
  const pts = angles.map(a => {
    const t = a * Math.PI / 180, s = Math.sin(t), r = rx * (1 + widen * s);
    return [cx + r * Math.cos(t), cy + ry * s * (s > 0 ? flatBottom : 1)];
  });
  const segs = [];
  for (let i = 0; i < pts.length; i++) {
    const A = pts[i], B = pts[(i + 1) % pts.length];
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
    let nx = -dy / L, ny = dx / L;
    if (nx * ((A[0] + B[0]) / 2 - cx) + ny * ((A[1] + B[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
    const b = Array.isArray(bulge) ? bulge[i] : bulge;
    segs.push([A, [A[0] + dx * 0.08 + nx * b * L, A[1] + dy * 0.08 + ny * b * L], [B[0] - dx * 0.08 + nx * b * L, B[1] - dy * 0.08 + ny * b * L], B]);
  }
  // normaliza: base en y=0
  let maxY = -1e9;
  for (const [a, b, c, d] of segs) for (let t = 0; t <= 1; t += 0.02) {
    const u = 1 - t, y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
    if (y > maxY) maxY = y;
  }
  const sh = (p) => [f1(p[0]), f1(p[1] - maxY)];
  let d = `M ${sh(segs[0][0]).join(' ')}`;
  for (const [, b, c, e] of segs) d += ` C ${sh(b).join(' ')} ${sh(c).join(' ')} ${sh(e).join(' ')}`;
  return { d: d + ' Z', cusps: pts.map(sh) };
}

// Mapi: alto y estrecho, más pesado arriba, 8 lóbulos grandes e irregulares.
const MAPI = lobed({ cx: 0, cy: -110, rx: 92, ry: 112, widen: -0.12,
  angles: [60, 124, 160, 214, 246, 296, 326, 14], bulge: [0.16, 0.36, 0.44, 0.34, 0.4, 0.32, 0.44, 0.36] });
// Capi: cúpula/pera ancha (≈1,4× Mapi), peso abajo, 6 lóbulos amplios y simétricos.
const CAPI = lobed({ cx: 0, cy: -118, rx: 152, ry: 124, widen: 0.14, flatBottom: 0.98,
  angles: [22, 158, 205, 248, 292, 335], bulge: [0.11, 0.36, 0.32, 0.3, 0.32, 0.36] });
const MAPI_BODY = MAPI.d, CAPI_BODY = CAPI.d;
const mc = MAPI.cusps, cc = CAPI.cusps;

// Curva suave que pasa por una lista de puntos (Catmull-Rom → Bézier)
function smooth(pts) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C ${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
// Muesca: trazo corto hacia el centro desde una cúspide (separa los lóbulos)
function notch(p, c, len = 16) {
  const dx = c[0] - p[0], dy = c[1] - p[1], L = Math.hypot(dx, dy);
  return `M ${p[0]} ${p[1]} L ${f1(p[0] + dx / L * len)} ${f1(p[1] + dy / L * len)}`;
}

// ---------- SURCOS ----------
// Firma de la propuesta: los surcos que terminan dentro del cuerpo acaban en una
// «bolita» (remate redondo, como una gota de gominola). Mapi: surcos sinuosos e
// irregulares. Capi: cuatro surcos largos, paralelos y simétricos («peinados»).
const MAPI_SULCI = [
  smooth([mc[3], [-64, -166], [-50, -186], [-28, -186], [-14, -168], [6, -170], [22, -190], [44, -188], [60, -172], mc[6]]),
  smooth([[56, -178], [62, -156], [80, -142], [76, -120], [88, -102], mc[7]]),
  notch(mc[0], [0, -110]), notch(mc[1], [0, -110]), notch(mc[5], [0, -110], 20),
];
const MAPI_BALLS = [
  { d: smooth([mc[4], [-38, -198], [-24, -196]]), end: [-24, -196] },
  { d: smooth([mc[2], [-74, -58], [-66, -42]]), end: [-66, -42] },
];
const CAPI_LEFT = [
  { d: smooth([cc[2], [-120, -108], [-128, -88], [-116, -68], [-122, -48], [-112, -32]]), end: [-112, -32] },
  { d: smooth([cc[3], [-64, -176], [-80, -162], [-86, -142], [-80, -122], [-90, -102], [-82, -82], [-90, -62], [-84, -42]]), end: [-84, -42] },
];
const mirrorPts = (s) => ({ d: s.d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${f1(-x)} ${y}`), end: [-s.end[0], s.end[1]] });
const CAPI_SULCI = [...CAPI_LEFT, ...CAPI_LEFT.map(mirrorPts), notch(cc[0], [0, -100], 14), notch(cc[1], [0, -100], 14)];

function sulcusPaths(list, w = IN) {
  return list.map(s => {
    const d = typeof s === 'string' ? s : s.d;
    let out = `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (s.end) out += `<circle cx="${s.end[0]}" cy="${s.end[1]}" r="${w * 1.05}" fill="${P.ink}"/>`;
    return out;
  }).join('');
}

// Mechón: un único rizo de pliegue suelto
const MAPI_CURL = `M ${mc[4][0] + 30} ${mc[4][1] - 26} C ${mc[4][0] + 22} ${mc[4][1] - 50} ${mc[4][0] + 52} ${mc[4][1] - 64} ${mc[4][0] + 62} ${mc[4][1] - 48} C ${mc[4][0] + 70} ${mc[4][1] - 36} ${mc[4][0] + 52} ${mc[4][1] - 28} ${mc[4][0] + 48} ${mc[4][1] - 42}`;

function bodyGroup(path, base, shade, opts = {}) {
  const cid = id('clip');
  const sx = opts.shadeShift || [-12, -12];
  return `
  <defs><clipPath id="${cid}"><path d="${path}"/></clipPath></defs>
  ${opts.noOutline ? '' : `<path d="${path}" fill="none" stroke="${P.ink}" stroke-width="${OUT * 2}" stroke-linejoin="round"/>`}
  <path d="${path}" fill="${shade}"/>
  <g clip-path="url(#${cid})">
    <path d="${path}" fill="${base}" transform="translate(${sx[0]} ${sx[1]})"/>
    ${opts.shine || ''}
    ${opts.inner || ''}
  </g>`;
}

// ---------- OJOS ----------
function eye(x, y, o = {}) {
  const rx = o.rx || 15, ry = o.ry || 19;
  const [lx, ly] = o.look || [0, 0];
  const lid = o.lid || 0, tilt = o.lidTilt || 0;
  const g = [], eyeId = id('eye');
  const lidY = y - ry + lid * 2 * ry;
  const lidPath = `M ${x - rx - 6} ${lidY + tilt} Q ${x} ${lidY - 3} ${x + rx + 6} ${lidY - tilt}`;
  g.push(`<defs><clipPath id="${eyeId}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/></clipPath>`);
  if (lid > 0) g.push(`<clipPath id="${eyeId}l"><path d="${lidPath} L ${x + rx + 6} ${y + ry + 6} L ${x - rx - 6} ${y + ry + 6} Z"/></clipPath>`);
  g.push('</defs>');
  if (lid > 0) g.push(`<g clip-path="url(#${eyeId}l)">`);
  g.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${P.ink}"/>`);
  g.push(`<g clip-path="url(#${eyeId})">`);
  g.push(`<ellipse cx="${x + lx}" cy="${y + ry * 0.62 + ly}" rx="${rx * 0.78}" ry="${ry * 0.4}" fill="${o.glow || '#7B3A6E'}"/>`);
  if (o.sparkle !== false) {
    const hy = lid > 0 ? Math.max(y - ry * 0.38, lidY + rx * 0.42 + 1) : y - ry * 0.38;
    g.push(`<circle cx="${x + rx * 0.3 + lx}" cy="${hy + ly}" r="${rx * 0.4}" fill="#fff"/>`);
    g.push(`<circle cx="${x - rx * 0.36 + lx}" cy="${y + ry * 0.36 + ly}" r="${rx * 0.17}" fill="#fff"/>`);
  }
  g.push('</g>');
  if (lid > 0) g.push('</g>');
  if (lid > 0) g.push(`<path d="M ${x - rx - 4} ${lidY + tilt} Q ${x} ${lidY - 3} ${x + rx + 4} ${lidY - tilt}" fill="none" stroke="${P.ink}" stroke-width="${FINE + 2}" stroke-linecap="round"/>`);
  return g.join('');
}
const happyEye = (x, y, w = 15) => `<path d="M ${x - w} ${y + 5} C ${x - w * 0.6} ${y - 12} ${x + w * 0.6} ${y - 12} ${x + w} ${y + 5}" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>`;
const brow = (x, y, angle, len = 18, curve = -4) => {
  const r = angle * Math.PI / 180, dx = Math.cos(r) * len / 2, dy = Math.sin(r) * len / 2;
  return `<path d="M ${f1(x - dx)} ${f1(y - dy)} Q ${x} ${y + curve} ${f1(x + dx)} ${f1(y + dy)}" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`;
};
const blush = (x, y, w = 15) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.55}" fill="${P.blush}" opacity="0.9"/>`;

function star(cx, cy, R, r, fill) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'} ${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr)} `;
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/>`;
}
function openSmile(x, y, w, h) {
  return `<path d="M ${x - w} ${y} C ${x - w * 0.7} ${y + h * 1.3} ${x + w * 0.7} ${y + h * 1.3} ${x + w} ${y} C ${x + w * 0.4} ${y + 3} ${x - w * 0.4} ${y + 3} ${x - w} ${y} Z" fill="${P.ink}" stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M ${x - w * 0.5} ${y + h * 0.75} C ${x - w * 0.2} ${y + h * 0.45} ${x + w * 0.2} ${y + h * 0.45} ${x + w * 0.5} ${y + h * 0.75} C ${x + w * 0.25} ${y + h * 0.98} ${x - w * 0.25} ${y + h * 0.98} ${x - w * 0.5} ${y + h * 0.75} Z" fill="${P.mouth}"/>`;
}

// ---------- CARAS ----------
// Firma 2: ojos asimétricos en Mapi (el izquierdo un 10 % más grande, siempre).
function mapiFace(expr = 'neutral') {
  const fx = 0, fy = -104, ex = 42;
  const L = fx - ex, R = fx + ex, g = [], glow = '#8E2348';
  const big = { rx: 22, ry: 28 }, small = { rx: 20, ry: 25 };
  if (expr === 'neutral') {
    g.push(eye(L, fy, { ...big, look: [3, 0], glow }), eye(R, fy + 1, { ...small, look: [3, 0], glow }));
    g.push(brow(L, fy - 40, -10), brow(R, fy - 37, 8));
    g.push(`<path d="M ${fx - 9} ${fy + 30} C ${fx - 4} ${fy + 37} ${fx + 4} ${fy + 37} ${fx + 9} ${fy + 30}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  } else if (expr === 'alarm') {
    // pánico: ojos en blanco con pupila encogida y temblorosa, cejas muy alzadas,
    // boca de grito ovalada y alta
    for (const [x, s] of [[L, 1.1], [R, 1]]) {
      g.push(`<ellipse cx="${x}" cy="${fy - 4}" rx="${22 * s}" ry="${27 * s}" fill="#fff" stroke="${P.ink}" stroke-width="5.5"/>`);
      g.push(`<circle cx="${x}" cy="${fy - 2}" r="${5.5 * s}" fill="${P.ink}"/>`);
      g.push(`<path d="M ${x - 11} ${fy - 2} L ${x - 15} ${fy - 2} M ${x + 11} ${fy - 2} L ${x + 15} ${fy - 2}" stroke="${P.ink}" stroke-width="3" stroke-linecap="round"/>`);
    }
    g.push(brow(L, fy - 48, -32, 24, 2), brow(R, fy - 46, 32, 24, 2));
    g.push(`<ellipse cx="${fx}" cy="${fy + 44}" rx="13" ry="21" fill="${P.ink}"/>`);
    g.push(`<ellipse cx="${fx}" cy="${fy + 55}" rx="8" ry="7" fill="${P.mouth}"/>`);
  } else if (expr === 'euphoria') {
    for (const [x, s] of [[L, big], [R, small]]) {
      g.push(eye(x, fy, { ...s, glow, sparkle: false }));
      g.push(star(x, fy - 1, 13, 5.6, '#FFE27A'));
      g.push(`<circle cx="${x + 9}" cy="${fy - 14}" r="3.6" fill="#fff"/>`);
    }
    g.push(brow(L, fy - 46, -14), brow(R, fy - 44, 14));
    g.push(openSmile(fx, fy + 22, 22, 20));
  } else if (expr === 'happy') {
    g.push(happyEye(L, fy, 17), happyEye(R, fy, 15));
    g.push(openSmile(fx, fy + 22, 15, 15));
  } else if (expr === 'skeptic') {
    g.push(eye(L, fy, { ...big, look: [5, 2], glow, lid: 0.42, lidTilt: -3 }));
    g.push(eye(R, fy - 2, { ...small, look: [5, 2], glow }));
    g.push(brow(R, fy - 46, -14, 20, -6));
    g.push(`<path d="M ${fx - 10} ${fy + 32} C ${fx - 2} ${fy + 28} ${fx + 6} ${fy + 28} ${fx + 14} ${fy + 24}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  }
  if (expr === 'skeptic') g.push(blush(R + 6, fy + 32));
  else if (expr !== 'alarm') g.push(blush(L - 6, fy + 32), blush(R + 6, fy + 32));
  return g.join('');
}

function capiFace(expr = 'neutral') {
  const fx = 0, fy = -96, ex = 42;
  const L = fx - ex, R = fx + ex, g = [], glow = '#4B57B8';
  const e = { rx: 20, ry: 24 };
  if (expr === 'neutral') {
    g.push(eye(L, fy, { ...e, look: [-3, 4], glow, lid: 0.5, lidTilt: 1 }));
    g.push(eye(R, fy, { ...e, look: [-3, 4], glow, lid: 0.5, lidTilt: -1 }));
    g.push(`<path d="M ${fx - 9} ${fy + 34} L ${fx + 9} ${fy + 34}" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  } else if (expr === 'alarm') {
    // los párpados se abren de golpe (único momento con ojos enteros) + una gota
    g.push(eye(L, fy - 2, { rx: 21, ry: 26, look: [0, -2], glow }));
    g.push(eye(R, fy - 2, { rx: 21, ry: 26, look: [0, -2], glow }));
    g.push(brow(L, fy - 42, -14, 20, -3), brow(R, fy - 42, 14, 20, -3));
    g.push(`<ellipse cx="${fx}" cy="${fy + 36}" rx="7" ry="9" fill="${P.ink}"/>`);
  } else if (expr === 'happy') {
    g.push(happyEye(L, fy + 2, 15), happyEye(R, fy + 2, 15));
    g.push(`<path d="M ${fx - 12} ${fy + 28} C ${fx - 6} ${fy + 38} ${fx + 6} ${fy + 38} ${fx + 12} ${fy + 28}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  } else if (expr === 'skeptic') {
    g.push(eye(L, fy, { ...e, look: [-5, 3], glow, lid: 0.62, lidTilt: 2 }));
    g.push(eye(R, fy - 2, { ...e, look: [-5, 3], glow, lid: 0.3, lidTilt: -2 }));
    g.push(brow(R, fy - 40, -16, 22, -6));
    g.push(`<path d="M ${fx - 12} ${fy + 34} C ${fx - 4} ${fy + 36} ${fx + 4} ${fy + 34} ${fx + 12} ${fy + 28}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  }
  g.push(blush(L - 4, fy + 32, 14), blush(R + 4, fy + 32, 14));
  return g.join('');
}

// ---------- EXTREMIDADES Y ACCESORIOS ----------
function limb(x1, y1, x2, y2, w, fill, straight = false) {
  const dx = x2 - x1, dy = y2 - y1, k = straight ? 0 : 0.12;
  const d = `M ${x1} ${y1} Q ${f1((x1 + x2) / 2 - dy * k)} ${f1((y1 + y2) / 2 + dx * k)} ${x2} ${y2}`;
  return `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="${w + OUT * 1.6}" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function sweatDrop(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M 0 -18 C 6 -8 13 0 13 8 C 13 16 7 21 0 21 C -7 21 -13 16 -13 8 C -13 0 -6 -8 0 -18 Z" fill="${P.sweat}" stroke="${P.ink}" stroke-width="4.5" stroke-linejoin="round"/>
  <path d="M -5 6 C -5 2 -3 -1 -1 -3" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></g>`;
}
function mug(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M -14 -66 C -24 -78 -4 -86 -14 -100" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <path d="M 8 -70 C -2 -84 18 -92 8 -110" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <path d="M 26 -44 C 50 -46 50 -14 24 -16" fill="none" stroke="${P.ink}" stroke-width="15" stroke-linecap="round"/>
    <path d="M 26 -44 C 50 -46 50 -14 24 -16" fill="none" stroke="${P.mug}" stroke-width="6" stroke-linecap="round"/>
    <path d="M -30 -56 L 30 -56 C 30 -30 28 -8 18 0 L -18 0 C -28 -8 -30 -30 -30 -56 Z" fill="${P.mug}"/>
    <path d="M 14 -56 L 30 -56 C 30 -30 28 -8 18 0 L 4 0 C 14 -10 16 -30 14 -56 Z" fill="${P.mugShade}"/>
    <ellipse cx="0" cy="-56" rx="30" ry="7" fill="#8A4B2E"/>
    <path d="M -30 -56 L 30 -56 C 30 -30 28 -8 18 0 L -18 0 C -28 -8 -30 -30 -30 -56 Z" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="0" cy="-56" rx="30" ry="7" fill="none" stroke="${P.ink}" stroke-width="5"/>
    <path d="M -20 -44 L -20 -20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
  </g>`;
}

// ---------- POSES ----------
// Mapi por defecto: inclinado y con un pie en el aire (nunca quieto).
const MAPI_POSES = {
  stand: { arms: [[-100, -78, -128, -44], [100, -84, 128, -54]], legs: [[-34, -4, -40, 18], [30, -8, 74, -22]], r: -7 },
  panic: { arms: [[-100, -96, -146, -66], [100, -96, 146, -66]], legs: [[-34, -4, -46, 18], [34, -4, 46, 18]], r: 0, rigid: true },
  run: { arms: [[-100, -82, -140, -60], [100, -90, 134, -118]], legs: [[-30, -4, -66, 4], [30, -4, 40, 22]], r: -8 },
  cheer: { arms: [[-100, -100, -128, -150], [100, -104, 124, -156]], legs: [[-34, -4, -40, 18], [30, -8, 72, -24]], r: -5 },
  hips: { arms: [[-100, -72, -120, -90], [100, -72, 120, -90]], legs: [[-34, -4, -40, 18], [30, -8, 74, -22]], r: -6 },
};
const CAPI_POSES = {
  stand: { arms: [[-160, -66, -182, -32], [160, -66, 182, -32]] },
  mug: { arms: [[-160, -66, -182, -32], [158, -70, 170, -40]], mug: true },
  point: { arms: [[-160, -78, -196, -104], [160, -66, 182, -32]] },
  shrug: { arms: [[-160, -74, -196, -92], [160, -74, 196, -92]] },
};
const CAPI_LEGS = [[-70, -2, -72, 20], [70, -2, 72, 20]];

const mapiShine = `<path d="M -92 -150 C -92 -172 -80 -196 -62 -206" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
  <circle cx="-98" cy="-126" r="5.5" fill="#fff" opacity="0.9"/>`;
const capiShine = `<path d="M 88 -176 C 110 -170 128 -152 134 -134" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.75"/>
  <circle cx="142" cy="-114" r="5.5" fill="#fff" opacity="0.75"/>`;

function mapiBody(o = {}) {
  return bodyGroup(MAPI_BODY, P.red, P.redShade, { shine: mapiShine, shadeShift: [-12, -12], noOutline: o.noOutline,
    inner: sulcusPaths(MAPI_SULCI) + sulcusPaths(MAPI_BALLS) });
}
function capiBody(o = {}) {
  return bodyGroup(CAPI_BODY, P.blue, P.blueShade, { shine: capiShine, shadeShift: [12, -12], noOutline: o.noOutline,
    inner: sulcusPaths(CAPI_SULCI) });
}
const curl = () => `<path d="${MAPI_CURL}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`;

function mapi(o = {}) {
  const base = MAPI_POSES[o.pose || 'stand'];
  const pose = Object.assign({}, base, o.custom || {});
  const g = [];
  const limbs = (arr, w) => arr.map(a => limb(...a, w, P.red, pose.rigid)).join('');
  if (o.behind) g.push(o.behind);
  g.push(limbs(pose.legs, 20));
  g.push(curl());
  g.push(mapiBody());
  g.push(mapiFace(o.expr || 'neutral'));
  if (pose.rigid) {
    g.push(`<g stroke="${P.ink}" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M -160 -96 q -6 6 0 12 M -170 -78 q -6 6 0 12 M 160 -96 q 6 6 0 12 M 170 -78 q 6 6 0 12"/></g>`);
  }
  if (o.beforeArms) g.push(o.beforeArms);
  if (!o.noArms) g.push(limbs(pose.arms, 18));
  if (o.sweat) {
    g.push(sweatDrop(-126, -214, 0.9, -20), sweatDrop(118, -228, 0.75, 20));
    if (o.sweat > 1) g.push(sweatDrop(-140, -160, 0.6, -30));
  }
  if (o.extra) g.push(o.extra);
  const r = o.r != null ? o.r : (base.r || 0);
  return wrap(g.join(''), Object.assign({}, o, { r }));
}

function capi(o = {}) {
  const pose = Object.assign({}, CAPI_POSES[o.pose || 'stand'], o.custom || {});
  const g = [];
  const limbs = (arr, w) => arr.map(a => limb(...a, w, P.blue)).join('');
  if (o.behind) g.push(o.behind);
  g.push(limbs(pose.legs || CAPI_LEGS, 24));
  g.push(capiBody());
  g.push(capiFace(o.expr || 'neutral'));
  if (o.expr === 'alarm') g.push(sweatDrop(150, -186, 0.8, 20));
  if (pose.mug) g.push(mug(196, -12, 0.95));
  if (o.beforeArms) g.push(o.beforeArms);
  if (!o.noArms) g.push(limbs(pose.arms, 20));
  if (o.extra) g.push(o.extra);
  return wrap(g.join(''), o);
}

function wrap(inner, o) {
  const x = o.x || 0, y = o.y || 0, s = o.s || 1, r = o.r || 0, flip = o.flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s * flip} ${s})">${inner}</g>`;
}

module.exports = { P, mapi, capi, mug, sweatDrop, star, limb, blush, eye, happyEye, brow,
  MAPI_BODY, CAPI_BODY, mapiBody, capiBody, mapiFace, capiFace, curl, bodyGroup, sulcusPaths, mc, cc, OUT, IN };
