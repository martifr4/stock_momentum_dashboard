// Motor de animación «Riso» — atrezo reutilizable para Reels (capas por plancha, tintas de la biblia).
// Sin marcas, sin divisas, sin anatomía. El blanco (#fff) dentro de una plancha es reserva.
const R = require('../riso.js');
const { INK, W, L, f, strokeP, halftone, smooth, text, teardrop, roundPoly, FONT_MONO } = R;

// ---------- botón «COMPRAR YA» ----------
// cx: centro; G: suelo. Base negra 360 × 56; tapa roja 320 × 100 (pulsada 320 × 78, arriba 26 px más abajo).
// lift: px que la tapa sube por encima de su sitio (rebote al soltarse).
function buyButton(cx, G, { pressed = false, lift = 0, label = 'COMPRAR YA', size = 58 } = {}) {
  const o = L();
  const baseTop = G - 56;
  o.black += `<rect x="${cx - 180}" y="${baseTop}" width="360" height="56" rx="10" fill="${INK.black}"/>`;
  const lidTop = (pressed ? G - 138 : G - 164) - lift, lidH = pressed ? 78 : 100;
  // cuello entre tapa y base (negro), con hueco de reserva bajo la tapa
  o.black += `<rect x="${cx - 128}" y="${f(lidTop + lidH - 10)}" width="256" height="${f(baseTop - (lidTop + lidH - 10) + 2)}" fill="${INK.black}"/>`;
  o.black += `<rect x="${cx - 164}" y="${f(lidTop + lidH)}" width="328" height="4" fill="${W}"/>`;
  o.red += `<rect x="${cx - 160}" y="${f(lidTop)}" width="320" height="${lidH}" rx="22" fill="${INK.red}"/>`;
  o.red += text(cx, f(lidTop + lidH / 2 + size * 0.36), label, { size, fill: W, anchor: 'middle', ls: 0.01 });
  return o;
}

// ---------- moneda sin divisa ----------
// cara: disco azul con aro de reserva; canto: elipse girada. Halo de reserva de 5 px en la plancha azul.
function coinBlank(x, y, r = 26, rot = 0, edge = false) {
  if (edge) {
    const ry = r * 0.3;
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><ellipse rx="${r + 5}" ry="${f(ry + 5)}" fill="${W}"/><ellipse rx="${r}" ry="${f(ry)}" fill="${INK.blue}"/>` +
      `<ellipse rx="${r - 6}" ry="${f(Math.max(1, ry - 4))}" fill="none" stroke="${W}" stroke-width="2"/></g>`;
  }
  return `<g transform="translate(${f(x)} ${f(y)})"><circle r="${r + 5}" fill="${W}"/><circle r="${r}" fill="${INK.blue}"/><circle r="${r - 5}" fill="none" stroke="${W}" stroke-width="2.5"/></g>`;
}

// ---------- líneas de caída / de movimiento ----------
function fallLines(x, yTop, { len = 40, gap = 34, w = 5 } = {}) {
  let d = '';
  for (const dx of [-gap, 0, gap]) d += `M${f(x + dx)} ${f(yTop)} L${f(x + dx)} ${f(yTop + len)} `;
  return strokeP(d, INK.black, w, 'stroke-linecap="round"');
}
function motionLines(x, y, { dir = 1, len = 60, gap = 26, w = 5, n = 3 } = {}) {
  let d = '';
  for (let i = 0; i < n; i++) { const yy = y + (i - (n - 1) / 2) * gap, x0 = x + dir * (i % 2 ? 14 : 0); d += `M${f(x0)} ${f(yy)} L${f(x0 + dir * len)} ${f(yy)} `; }
  return strokeP(d, INK.black, w, 'stroke-linecap="round"');
}

// ---------- mancha de tinta ----------
// contorno cerrado suave por Catmull-Rom
function blobPath(cx, cy, radii) {
  const n = radii.length, P = radii.map((r, i) => { const a = (i / n) * 2 * Math.PI; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
// step 0: pequeña; 1: grande + gotas saliendo; 2: asentada (gotas quietas más lejos)
function inkSplash(x, y, step = 2, { ink = INK.red, rx = 1.6 } = {}) {
  const lob = [1.0, 0.82, 1.08, 0.86, 1.12, 0.8, 1.04, 0.9, 1.1, 0.84, 1.0, 0.88, 1.06, 0.8, 1.1, 0.86];
  const R0 = step === 0 ? 60 : step === 1 ? 118 : 110;
  const radii = lob.map((k, i) => R0 * k * (i % 2 ? 1 : 1.04));
  let s = `<g transform="translate(${f(x)} ${f(y)}) scale(${rx} 1) translate(${f(-x)} ${f(-y)})"><path d="${blobPath(x, y, radii)}" fill="${ink}"/></g>`;
  if (step >= 1) {
    const drops = [[-150, -20, 0.9], [-120, 40, 0.7], [150, -34, 0.8], [168, 22, 0.65], [40, 70, 0.6]];
    const k = step === 1 ? 1.12 : 1.3;
    for (const [dx, dy, sc] of drops) {
      const a = (Math.atan2(dy, dx) * 180) / Math.PI;
      s += teardrop(x + dx * k * 1.05, y + dy * k * 0.9, sc * 1.4, a - 90 + 180, ink);
    }
  }
  return s;
}

// ---------- polvo (semitono negro claro, 3 bultos) ----------
function dust(x, y, r = 20, k = 1) {
  const bumps = [[-0.7, 0.1, 0.65], [0, -0.25, 0.85], [0.75, 0.05, 0.6]];
  return halftone({
    x0: x - r * 1.6, y0: y - r * 1.3, x1: x + r * 1.6, y1: y + r * 0.8, step: 6, rmax: 2, color: INK.black,
    fn: (px, py) => k * Math.max(...bumps.map(([bx, by, br]) => 1 - smooth(0.45, 1, Math.hypot((px - (x + bx * r)) / (br * r), (py - (y + by * r)) / (br * r * 0.8))))),
  });
}

// ---------- balón genérico ----------
function ball(x, y, r = 46, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><circle r="${r}" fill="${INK.black}"/>` +
    `<g fill="none" stroke="${W}" stroke-width="${f(r * 0.09)}" stroke-linecap="round">` +
    `<path d="M${f(-r * 0.95)} ${f(-r * 0.2)} Q${f(-r * 0.1)} ${f(-r * 0.05)} ${f(r * 0.35)} ${f(-r * 0.88)}"/>` +
    `<path d="M${f(-r * 0.55)} ${f(r * 0.8)} Q${f(-r * 0.2)} ${f(r * 0.1)} ${f(r * 0.95)} ${f(r * 0.2)}"/>` +
    `<path d="M${f(-r * 0.1)} ${f(-r * 0.05)} Q${f(r * 0.4)} ${f(r * 0.2)} ${f(r * 0.45)} ${f(r * 0.86)}"/></g></g>`;
}

// ---------- semáforo (sin figuras ni texto) ----------
function trafficLight({ x = 820, top = 820, foot = 1440, boxC = [820, 840], red = false, blue = true } = {}) {
  const o = L();
  o.black += `<rect x="${x - 7}" y="${top}" width="14" height="${foot - top}" fill="${INK.black}"/>`;
  o.black += `<rect x="${boxC[0] - 60}" y="${boxC[1] - 115}" width="120" height="230" rx="18" fill="${INK.black}"/>`;
  const lamps = [[boxC[0], boxC[1] - 55, red, 'red'], [boxC[0], boxC[1] + 55, blue, 'blue']];
  for (const [lx, ly, on, ink] of lamps) {
    if (on) { o.black += `<circle cx="${lx}" cy="${ly}" r="42" fill="${W}"/>`; o[ink] += `<circle cx="${lx}" cy="${ly}" r="40" fill="${INK[ink]}"/>`; }
    else o.black += `<circle cx="${lx}" cy="${ly}" r="36" fill="none" stroke="${W}" stroke-width="4"/>`;
  }
  return o;
}

// ---------- calzada con paso de cebra ----------
function zebra(x0, y0, x1, y1, { from = 380, n = 6, w = 60, gap = 50, skew = 10 } = {}) {
  const id = R.uid('zb');
  let s = `<defs><clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath></defs>`;
  s += halftone({ x0, y0, x1, y1, step: 7, rmax: 1.4, color: INK.black, fn: () => 1 });
  let st = '';
  const dx = Math.tan((skew * Math.PI) / 180) * (y1 - y0);
  for (let i = 0; i < n; i++) { const a = from + i * (w + gap); st += `<path d="M${f(a + dx)} ${y0} L${f(a + w + dx)} ${y0} L${a + w} ${y1} L${a} ${y1}Z" fill="${W}"/>`; }
  return s + `<g clip-path="url(#${id})">${st}</g>`;
}

// ---------- puntos de pensar ----------
const thinkDots = (pts, n, r = 8) => pts.slice(0, n).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK.blue}"/>`).join('');

// ---------- marco de viñeta ----------
const panelFrame = (x0, y0, x1, y1, w = 8) => `<rect x="${x0 + w / 2}" y="${y0 + w / 2}" width="${x1 - x0 - w}" height="${y1 - y0 - w}" rx="14" fill="none" stroke="${INK.black}" stroke-width="${w}"/>`;

// ---------- caja registradora genérica ----------
// body: [x0, y0, x1, y1]; display: texto del visor (reserva); drawerOut: px que sale el cajón
function register({ body = [670, 820, 890, 960], display = '0,00', drawerOut = 0, keys = [690, 846] } = {}) {
  const [x0, y0, x1, y1] = body;
  let s = '';
  // visor sobre la caja
  s += `<rect x="${x0 + 110}" y="${y0 - 6}" width="20" height="10" fill="${INK.black}"/>`;
  s += `<rect x="740" y="770" width="120" height="48" rx="8" fill="${INK.black}"/>`;
  s += `<rect x="748" y="777" width="104" height="34" rx="5" fill="none" stroke="${W}" stroke-width="2.5"/>`;
  s += text(800, 804, display, { size: 28, font: FONT_MONO, weight: 500, anchor: 'middle', stretch: '100%', fill: W });
  s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0 - 30}" rx="12" fill="${INK.black}"/>`;
  // teclado 3 × 3 (reserva)
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) s += `<rect x="${keys[0] + c * 30}" y="${keys[1] + r * 24}" width="22" height="16" rx="4" fill="${W}"/>`;
  // ranura del ticket (derecha)
  s += `<rect x="${x1 - 26}" y="${y0 + 72}" width="16" height="12" rx="3" fill="${W}"/>`;
  // cajón en la base
  const dx = -drawerOut;
  s += `<rect x="${x0 + 10 + dx}" y="${y1 - 28}" width="200" height="28" rx="6" fill="${INK.black}"/>`;
  s += `<rect x="${x0 + 10 + dx + 76}" y="${y1 - 17}" width="48" height="6" rx="3" fill="${W}"/>`;
  if (drawerOut) s += `<rect x="${x0 + 10 + dx}" y="${y1 - 31}" width="200" height="3" fill="${W}"/>`;
  return s;
}

// ---------- ticket que crece ----------
// pts: polilínea completa; len: longitud dibujada (se trunca y el extremo va rasgado).
// El total solo aparece con len ≥ longitud total. Devuelve capas.
function ticketGrow(pts, w, { len = Infinity, totalLabel = 'TOTAL', amount = '189,99 €', labelSize = 24, amountSize = 28, amountFont = FONT_MONO, amountWeight = 500, amountStretch = '100%' } = {}) {
  const o = L();
  const segs = [];
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty); tx /= l; ty /= l;
    segs.push({ a, b, tx, ty, nx: -ty, ny: tx, len: l, s0: acc }); acc += l;
  }
  const total = acc, full = len >= total - 0.5;
  const Ld = Math.min(len, total);
  if (Ld < 4) return o;
  const hw = w / 2;
  let shadow = '', paper = '', ink = '', edges = '', pe = '';
  const vis = segs.filter((sg) => sg.s0 < Ld);
  vis.forEach((sg, i) => {
    const last = i === vis.length - 1;
    const l = Math.min(sg.len, Ld - sg.s0);
    const b = [sg.a[0] + sg.tx * l, sg.a[1] + sg.ty * l];
    // un poco de solape con el tramo siguiente para que el pliegue no deje rendija
    // juntas a inglete en los pliegues (el borde exterior de dos tramos se encuentra en un punto)
    const miter = (j) => { // vértice j de la polilínea completa
      if (j <= 0 || j >= segs.length) { const sgj = segs[Math.min(Math.max(j, 0), segs.length - 1)]; return [sgj.nx * hw, sgj.ny * hw]; }
      const p0 = segs[j - 1], p1 = segs[j];
      let mx = p0.nx + p1.nx, my = p0.ny + p1.ny; const ml = Math.hypot(mx, my); mx /= ml; my /= ml;
      const k = hw / (mx * p0.nx + my * p0.ny);
      return [mx * k, my * k];
    };
    const segIdx = segs.indexOf(sg);
    const mA = miter(segIdx), mB = last ? [sg.nx * hw, sg.ny * hw] : miter(segIdx + 1);
    const a0 = sg.a, b2 = b;
    const q = [[a0[0] + mA[0], a0[1] + mA[1]], [b2[0] + mB[0], b2[1] + mB[1]], [b2[0] - mB[0], b2[1] - mB[1]], [a0[0] - mA[0], a0[1] - mA[1]]];
    let d = 'M' + q.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L') + 'Z';
    if (last) {
      const [p0, p1, p2, p3] = q, n = 8;
      let z = `M${f(p3[0])} ${f(p3[1])} L${f(p0[0])} ${f(p0[1])} L${f(p1[0])} ${f(p1[1])}`;
      for (let k = 1; k <= n; k++) { const tt = k / n, bx = p1[0] + (p2[0] - p1[0]) * tt, by = p1[1] + (p2[1] - p1[1]) * tt, off = k % 2 ? -10 : 0; z += ` L${f(bx + sg.tx * off)} ${f(by + sg.ty * off)}`; }
      d = z + 'Z';
    }
    shadow += `<path d="${d}" transform="translate(8 10)"/>`;
    paper += `<path d="${d}" fill="${W}"/>`;
    edges += `<path d="${d}" fill="none" stroke="${INK.black}" stroke-width="2.5" stroke-linejoin="round"/>`;
    pe += `<path d="${d}" fill="${W}"/>` + `<path d="${d}" fill="none" stroke="${INK.black}" stroke-width="2.5" stroke-linejoin="round"/>`;
    // renglones a posiciones fijas del recorrido completo (no se mueven al crecer)
    const isFinalSeg = sg === segs[segs.length - 1];
    const nL = Math.floor((sg.len - (isFinalSeg ? 130 : 26)) / 16);
    for (let k = 0; k < nL; k++) {
      const t = 16 + k * 16;
      if (sg.s0 + t > Ld - 14) break;
      if (i > 0 && t < hw + 10) continue; // bajo el pliegue del tramo anterior
      const cx = sg.a[0] + sg.tx * t, cy = sg.a[1] + sg.ty * t;
      const in1 = hw - 12, l1 = 22 + ((k * 37 + i * 11) % 26) + (w - 92) * 0.3, l2 = 12 + ((k * 13) % 8);
      const s1 = [cx + sg.nx * in1, cy + sg.ny * in1], e1 = [s1[0] - sg.nx * l1, s1[1] - sg.ny * l1];
      const s2 = [cx - sg.nx * in1, cy - sg.ny * in1], e2 = [s2[0] + sg.nx * l2, s2[1] + sg.ny * l2];
      ink += `<path d="M${f(s1[0])} ${f(s1[1])} L${f(e1[0])} ${f(e1[1])} M${f(s2[0])} ${f(s2[1])} L${f(e2[0])} ${f(e2[1])}" stroke="${INK.black}" stroke-width="3" stroke-linecap="round"/>`;
    }
  });
  const paperEdge = pe;
  if (full) {
    const sg = segs[segs.length - 1];
    const t = sg.len - 62, cx = sg.a[0] + sg.tx * t, cy = sg.a[1] + sg.ty * t;
    const ang = (Math.atan2(sg.ty, sg.tx) * 180) / Math.PI - 90;
    ink += `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(ang)})"><path d="M${f(-hw + 12)} ${f(-labelSize - 14)} H${f(hw - 12)}" stroke="${INK.black}" stroke-width="2.5" stroke-dasharray="4 4"/>` +
      text(0, -6, totalLabel, { size: labelSize, font: FONT_MONO, weight: 500, anchor: 'middle', stretch: '100%', ls: 0.08 }) +
      text(0, amountSize + 2, amount, { size: amountSize, font: amountFont, weight: amountWeight, anchor: 'middle', stretch: amountStretch }) + '</g>';
  }
  const shId = R.uid('tsh');
  o.defs += `<clipPath id="${shId}">${shadow}</clipPath>`;
  const all = vis.flatMap((sg) => [sg.a, sg.b]);
  const sx0 = Math.min(...all.map((p) => p[0])) - 70, sx1 = Math.max(...all.map((p) => p[0])) + 70, sy0 = Math.min(...all.map((p) => p[1])) - 70, sy1 = Math.max(...all.map((p) => p[1])) + 70;
  o.black += halftone({ x0: sx0, y0: sy0, x1: sx1, y1: sy1, step: 6, rmax: 1.9, color: INK.black, clip: shId, fn: () => 1 }) + paperEdge + ink;
  o.blue += paper; o.red += paper;
  return o;
}
// longitud de una polilínea
const polyLen = (pts) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

// ---------- correa (asa de la taza → tobillo) ----------
const LOOP = (x, y, rot = -20) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" fill="none" stroke="${INK.black}" stroke-width="3.5" stroke-linecap="round"><path d="M0 0 C-12 -16 -22 -4 0 0 C12 -16 22 -4 0 0"/></g>`;
const LOOP_OPEN = (x, y, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" fill="none" stroke="${INK.black}" stroke-width="3.5" stroke-linecap="round"><path d="M0 0 C-10 -14 -26 -10 -24 -2 C-22 6 -10 6 -4 2"/></g>`;
function leashLoose(p0, p1, sag = 80, { loop = true, loopRot = -20 } = {}) {
  const mx = (p0[0] + p1[0]) / 2, my = Math.max(p0[1], p1[1]) + sag;
  return strokeP(`M${f(p0[0])} ${f(p0[1])} Q${f(mx)} ${f(my)} ${f(p1[0])} ${f(p1[1])}`, INK.black, 3.5, 'stroke-linecap="round"') + (loop ? LOOP(p1[0], p1[1], loopRot) : '');
}
const leashTaut = (p0, p1, loopRot = -20) => strokeP(`M${f(p0[0])} ${f(p0[1])} L${f(p1[0])} ${f(p1[1])}`, INK.black, 3.5, 'stroke-linecap="round"') + LOOP(p1[0], p1[1], loopRot);
// correa en reposo en el suelo: el trazado del storyboard, que sigue al asa
function leashRest(h, end = [520, 1402]) {
  return strokeP(`M${f(h[0])} ${f(h[1])} C${f(h[0] - 21)} ${f(h[1] + 38)} ${f(end[0] + 60)} ${f(end[1] + 4)} ${f(end[0])} ${f(end[1])}`, INK.black, 3.5, 'stroke-linecap="round"') + LOOP_OPEN(end[0], end[1], 0);
}

// ---------- rótulo de sonido con sello ----------
// ancla izquierda en (x,y), rot; sc = escala del sello (1,3 → 1,0)
function sfxText(x, y, str, { size = 84, rot = 0, sc = 1, ink = INK.black, approxW = null } = {}) {
  const cw = approxW || size * 0.42 * str.length;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) translate(${f(cw / 2)} ${f(-size * 0.35)}) scale(${sc}) translate(${f(-cw / 2)} ${f(size * 0.35)})">` +
    text(0, 0, str, { size, fill: ink, ls: -0.01 }) + '</g>';
}

// ---------- cuenta atrás con texto ----------
function countdown(x, y, rot = 0, s = 1, label = '00:59') {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})"><rect x="-26" y="-92" width="52" height="20" rx="6" fill="${INK.black}"/>` +
    `<rect x="-130" y="-74" width="260" height="128" rx="22" fill="${INK.black}"/>` +
    `<rect x="-112" y="-56" width="224" height="92" rx="10" fill="none" stroke="${W}" stroke-width="3"/>` +
    text(0, 22, label, { size: 80, fill: W, anchor: 'middle', font: FONT_MONO, weight: 500, stretch: '100%' }) + '</g>';
}

module.exports = {
  buyButton, coinBlank, fallLines, motionLines, blobPath, inkSplash, dust, ball, trafficLight, zebra, thinkDots, panelFrame,
  register, ticketGrow, polyLen, LOOP, LOOP_OPEN, leashLoose, leashTaut, leashRest, sfxText, countdown,
};
