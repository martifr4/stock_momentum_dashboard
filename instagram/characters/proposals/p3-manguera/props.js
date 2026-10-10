// Scene props for «Manguera»: the shared nerve-cord, winged money, bubbles, signage, film frame.
const { C, stroke, taper, uid, r1 } = require('./chars.js');

// Smooth path through points (Catmull-Rom → cubic).
function smooth(pts) {
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

// The gimmick: Mapi and Capi are joined by one coiled nerve-cord (a rubber hose, literally).
// Tight coils at the calm end (A), stretched taut at the hasty end (B). Blue → red gradient.
function coil(A, B, Cc, o = {}) {
  const loops = o.loops || 14, r = o.r || 13, k = o.k || 1.9, w = o.w || 7;
  const steps = loops * 18, pts = [];
  const q = (t) => [(1 - t) ** 2 * A[0] + 2 * (1 - t) * t * Cc[0] + t * t * B[0], (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * Cc[1] + t * t * B[1]];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps, t = 1 - (1 - u) ** k; // dense near A? (k>1 → stretched near B)
    const p = q(t), p2 = q(Math.min(1, t + 0.001)), p1 = q(Math.max(0, t - 0.001));
    let tx = p2[0] - p1[0], ty = p2[1] - p1[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const nx = -ty, ny = tx, ph = u * loops * Math.PI * 2;
    const rr = r * (1 - 0.45 * u) * (u < 0.03 ? u / 0.03 : 1) * (u > 0.97 ? (1 - u) / 0.03 : 1);
    pts.push([p[0] + nx * rr * Math.sin(ph) + tx * rr * 0.75 * Math.cos(ph) - tx * rr * 0.75, p[1] + ny * rr * Math.sin(ph) + ty * rr * 0.75 * Math.cos(ph) - ty * rr * 0.75]);
  }
  const d = smooth(pts), gid = uid('cg');
  return `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"><stop offset="0" stop-color="${C.blueLt}"/><stop offset=".55" stop-color="${C.glove}"/><stop offset="1" stop-color="${C.redLt}"/></linearGradient>
  <path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="url(#${gid})" stroke-width="${r1(w * 0.42)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// Winged banknote (euro) — «el dinero vuela».
function bill(x, y, rot = 0, sc = 1, flap = 0) {
  const wing = (dir) => `<g transform="scale(${dir} 1) rotate(${-flap})"><path d="M22 -6 C34 -30 58 -36 66 -28 C58 -26 62 -20 54 -18 C60 -14 56 -8 48 -9 C52 -4 44 0 36 -2 C30 -2 26 -3 22 -6Z" fill="${C.glove}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/>${stroke('M30 -10 C38 -16 46 -22 56 -27', 1.5)}</g>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">
    ${wing(1)}${wing(-1)}
    <rect x="-28" y="-15" width="56" height="30" rx="3" fill="${C.ink}" transform="translate(3 4)"/>
    <rect x="-28" y="-15" width="56" height="30" rx="3" fill="#B9C2A0" stroke="${C.ink}" stroke-width="2.6"/>
    <rect x="-22" y="-10" width="44" height="20" rx="2" fill="none" stroke="${C.ink}" stroke-width="1.3" opacity=".7"/>
    <circle r="7.5" fill="${C.glove}" stroke="${C.ink}" stroke-width="1.6"/>
    <text y="4.2" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="12" fill="${C.ink}">€</text></g>`;
}
function coin(x, y, sc = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><ellipse rx="13" ry="13" fill="${C.ink}" transform="translate(2 3)"/><ellipse rx="13" ry="13" fill="${C.mustard}" stroke="${C.ink}" stroke-width="2.6"/><ellipse rx="8" ry="8" fill="none" stroke="${C.ink}" stroke-width="1.4" opacity=".6"/>${stroke('M-6 -6 Q-3 -9 1 -9', 2, C.glove)}</g>`;
}
function wallet() { // open bifold hanging upside down: spine at origin, panels splay downward
  const panel = (dir, fill, inner) => `<g transform="scale(${dir} 1) rotate(-32)">
    <rect x="-4" y="0" width="46" height="62" rx="6" fill="${C.ink}" transform="translate(3 4)"/>
    <rect x="-4" y="0" width="46" height="62" rx="6" fill="${fill}" stroke="${C.ink}" stroke-width="3"/>
    ${inner ? `<path d="M4 34 L36 34 L36 54 L4 54Z" fill="${C.redDk}" stroke="${C.ink}" stroke-width="2"/><path d="M4 22 L36 22" stroke="${C.ink}" stroke-width="2"/><path d="M4 12 L36 12" stroke="${C.ink}" stroke-width="2" opacity=".6"/>` : ''}
    <rect x="1" y="5" width="36" height="52" rx="4" fill="none" stroke="${C.redLt}" stroke-width="1.6" stroke-dasharray="4 4"/></g>`;
  return panel(-1, C.redDk, false) + panel(1, '#a8402d', true);
}
// Speech bubble (1930s: soft rounded box, ink contour, thick lower-right edge). tail → [tx,ty]
function bubble(x, y, w, h, tail, lines, o = {}) {
  const fs = o.size || 40, rot = o.rot || 0, font = o.font || 'Oswald', weight = o.weight || 700;
  const cx = x + w / 2, cy = y + h / 2;
  const bx = tail[0], by = tail[1];
  const dx = bx - cx, dy = by - cy, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
  const te = Math.min((w / 2) / Math.abs(dx || 1e-6), (h / 2) / Math.abs(dy || 1e-6));
  const ex = cx + dx * te - ux * 14, ey = cy + dy * te - uy * 14, half = o.tailW || 20;
  const px = -uy * half, py = ux * half;
  const tailD = `M${r1(ex + px)} ${r1(ey + py)} Q${r1((ex + bx) / 2 + px * .15)} ${r1((ey + by) / 2 + py * .15)} ${bx} ${by} Q${r1((ex + bx) / 2 - px * .55)} ${r1((ey + by) / 2 - py * .55)} ${r1(ex - px)} ${r1(ey - py)}Z`;
  const ang = Math.atan2(uy, ux);
  const box = `M${x + 26} ${y} C${x + w * .35} ${y - 6} ${x + w * .65} ${y - 6} ${x + w - 26} ${y} C${x + w + 4} ${y + 2} ${x + w + 6} ${y + h - 4} ${x + w - 24} ${y + h} C${x + w * .65} ${y + h + 6} ${x + w * .35} ${y + h + 6} ${x + 24} ${y + h} C${x - 6} ${y + h - 2} ${x - 6} ${y + 2} ${x + 26} ${y}Z`;
  const lh = fs * 1.08, ty0 = cy - (lines.length - 1) * lh / 2 + fs * 0.36;
  const txt = lines.map((l, i) => `<text x="${cx}" y="${r1(ty0 + i * lh)}" text-anchor="middle" font-family="${font}" font-weight="${weight}" font-size="${fs}" fill="${C.ink}" letter-spacing="${o.ls || 0.5}">${l}</text>`).join('');
  return `<g transform="rotate(${rot} ${cx} ${cy})">
    <path d="${tailD}" fill="${C.ink}" transform="translate(3 4)"/><path d="${box}" fill="${C.ink}" transform="translate(4 5)"/>
    <path d="${tailD}" fill="${C.glove}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>
    <path d="${box}" fill="${C.glove}" stroke="${C.ink}" stroke-width="3"/>
    <path d="M${r1(ex + px * .82)} ${r1(ey + py * .82)} L${r1(ex - px * .82)} ${r1(ey - py * .82)} L${r1(ex - px * .82 - ux * 18)} ${r1(ey - py * .82 - uy * 18)} L${r1(ex + px * .82 - ux * 18)} ${r1(ey + py * .82 - uy * 18)}Z" fill="${C.glove}"/>
    ${txt}</g>`;
}

// Motion: speed lines, dust puffs, impact ticks.
function speedLines(x, y, ang, n = 5, len = 120, gap = 22) {
  let o = '';
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * gap, l = len * (0.6 + 0.4 * ((i * 37) % 5) / 4);
    const ca = Math.cos(ang), sa = Math.sin(ang), px = -sa * off, py = ca * off;
    const ax = x + px, ay = y + py, bx = ax - ca * l, by = ay - sa * l;
    o += taper(ax, ay, (ax + bx) / 2, (ay + by) / 2, bx, by, 2.6);
  }
  return o;
}
function puff(x, y, sc = 1) {
  return `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M-30 6 C-40 4 -40 -12 -28 -12 C-28 -26 -10 -30 -4 -20 C2 -32 22 -30 22 -16 C34 -18 40 -4 30 4 C26 10 -24 12 -30 6Z" fill="${C.glove}" stroke="${C.ink}" stroke-width="2.8" stroke-linejoin="round"/>${stroke('M-18 -8 C-14 -12 -8 -12 -6 -8', 1.6)}</g>`;
}
function ticks(x, y, r = 40, n = 6, a0 = 0, spread = 360) {
  let o = '';
  for (let i = 0; i < n; i++) {
    const a = (a0 + spread * i / n) * Math.PI / 180;
    o += taper(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3, x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6, 2.4);
  }
  return o;
}

// Rounded 1930s film gate around the whole frame.
function filmGate(w, h, inset = 26, rad = 70) {
  const x = inset, y = inset, W = w - 2 * inset, H = h - 2 * inset;
  return `<path fill-rule="evenodd" fill="${C.ink}" d="M0 0H${w}V${h}H0Z M${x + rad} ${y}H${x + W - rad}Q${x + W} ${y} ${x + W} ${y + rad}V${y + H - rad}Q${x + W} ${y + H} ${x + W - rad} ${y + H}H${x + rad}Q${x} ${y + H} ${x} ${y + H - rad}V${y + rad}Q${x} ${y} ${x + rad} ${y}Z"/>`;
}

// Title-card wordmark: «Dinero Irracional» in a small ribboned cartouche.
function wordmark(x, y, sc = 1, o = {}) {
  const fill = o.fill || C.glove;
  return `<g transform="translate(${x} ${y}) scale(${sc})">
    <path d="M-20 -6 L0 -24 L0 24 L-20 6 L-8 0Z" fill="${C.redDk}" stroke="${C.ink}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M360 -24 L380 -6 L368 0 L380 6 L360 24Z" fill="${C.redDk}" stroke="${C.ink}" stroke-width="2.6" stroke-linejoin="round"/>
    <rect x="3" y="-25" width="360" height="54" rx="10" fill="${C.ink}"/>
    <rect x="0" y="-28" width="360" height="54" rx="10" fill="${fill}" stroke="${C.ink}" stroke-width="3"/>
    <text x="180" y="10" text-anchor="middle" font-family="Ultra" font-size="27" fill="${C.ink}" letter-spacing="1">Dinero Irracional</text></g>`;
}

// Moth — the empty-wallet gag.
function moth(x, y, sc = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">
    <path d="M0 0 C-10 -22 -34 -26 -38 -12 C-40 -2 -24 4 0 0Z" fill="${C.glove}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M0 0 C10 -22 34 -26 38 -12 C40 -2 24 4 0 0Z" fill="${C.glove}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="-20" cy="-12" r="3.5" fill="${C.paperDk}"/><circle cx="20" cy="-12" r="3.5" fill="${C.paperDk}"/>
    <ellipse cx="0" cy="2" rx="4.5" ry="11" fill="${C.ink}"/>
    ${stroke('M-2 -8 Q-6 -18 -12 -20', 1.6)}${stroke('M2 -8 Q6 -18 12 -20', 1.6)}</g>`;
}
// Sample a Catmull-Rom curve densely (for ribbons).
function sampleCurve(pts, per = 24) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let j = 0; j < per; j++) {
      const t = j / per, u = 1 - t;
      out.push([u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0], u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1]]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
// Endless receipt: a ribbon along pts with printed lines and a torn end.
function receipt(pts, w = 64) {
  const S = sampleCurve(pts, 30), L = [], Rr = [], marks = [];
  let acc = 0;
  for (let i = 0; i < S.length; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const nx = -ty * w / 2, ny = tx * w / 2;
    L.push([S[i][0] + nx, S[i][1] + ny]); Rr.push([S[i][0] - nx, S[i][1] - ny]);
    if (i > 0) acc += Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]);
    if (acc > 15 && i < S.length - 3) { acc = 0;
      const k = marks.length, len = 0.35 + 0.5 * (((k * 53) % 7) / 7), price = k % 3 !== 2;
      marks.push(`M${r1(S[i][0] + nx * 0.78)} ${r1(S[i][1] + ny * 0.78)} L${r1(S[i][0] + nx * (0.78 - len))} ${r1(S[i][1] + ny * (0.78 - len))}` + (price ? ` M${r1(S[i][0] - nx * 0.5)} ${r1(S[i][1] - ny * 0.5)} L${r1(S[i][0] - nx * 0.78)} ${r1(S[i][1] - ny * 0.78)}` : ''));
    }
  }
  // torn zigzag end
  const e = S.length - 1, zl = L[e], zr = Rr[e], zz = [];
  for (let k = 0; k <= 6; k++) { const t = k / 6, j = k % 2 ? 7 : 0, a = S[e - 1], dx = S[e][0] - a[0], dy = S[e][1] - a[1], dl = Math.hypot(dx, dy) || 1;
    zz.push([zr[0] + (zl[0] - zr[0]) * t + dx / dl * j, zr[1] + (zl[1] - zr[1]) * t + dy / dl * j]); }
  const poly = [...L, ...zz.reverse().slice(0), ...Rr.reverse()];
  const d = 'M' + poly.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(' L') + 'Z';
  return `<path d="${d}" fill="${C.ink}" transform="translate(4 5)"/><path d="${d}" fill="${C.glove}" stroke="${C.ink}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="${marks.join(' ')}" fill="none" stroke="${C.ink}" stroke-width="3" opacity=".42" stroke-linecap="round"/>`;
}
module.exports = { sampleCurve, moth, receipt, taper, smooth, coil, bill, coin, wallet, bubble, speedLines, puff, ticks, filmGate, wordmark };
