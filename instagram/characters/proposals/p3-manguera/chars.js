// «Manguera» — reusable character construction for Mapi (almendra) and Capi (lóbulo).
// Every drawing (hero, expresiones, portada, avatar) is built from these functions,
// so construction, palette and line treatment stay identical across deliverables.

const C = {
  paper: '#E0CDA2', paperDk: '#B89C6E', ink: '#1F1915',
  red: '#C24A32', redDk: '#8A2C1F', redLt: '#DD7A5C',
  blue: '#5B7F99', blueDk: '#34526A', blueLt: '#8EAABD',
  glove: '#F3EAD3', mustard: '#D3A03E', mouth: '#3B1510', tongue: '#D8665A',
};

let UID = 0;
const uid = (p) => `${p}${++UID}`;
const r1 = (n) => Math.round(n * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

// Map every absolute coordinate pair of a path (M/L/C/Q/S/T/Z only) through f.
function mapPath(d, f) {
  const toks = d.match(/[MLCQSTZ]|-?\d*\.?\d+/g);
  const out = []; let buf = [];
  for (const t of toks) {
    if (/[A-Z]/.test(t)) { out.push(t); continue; }
    buf.push(+t);
    if (buf.length === 2) { const p = f(buf[0], buf[1]); out.push(`${r1(p[0])} ${r1(p[1])}`); buf = []; }
  }
  return out.join(' ');
}

// ---------- rig: squash/stretch + bend along a line of action + lean + flip ----------
function rig(o) {
  const H = o.H, s = o.s || 1, L = rad(o.lean || 0), fl = o.flip ? -1 : 1;
  const sx = o.sx || 1, sy = o.sy || 1, bend = o.bend || 0;
  const T = (x, y) => { // outer transform (limb targets live here)
    x *= fl;
    const X = x * Math.cos(L) - y * Math.sin(L), Y = x * Math.sin(L) + y * Math.cos(L);
    return [o.x + X * s, o.y + Y * s];
  };
  const F = (x, y) => { // body transform: squash + bend increasing with height
    const t = Math.max(0, -y / H);
    return T(x * sx + bend * t * t, y * sy);
  };
  const ang = (y) => { const t = Math.max(0, -y / H); return (o.lean || 0) + fl * deg(Math.atan((2 * bend * t / H) / sy)); };
  // place a local-frame drawing at body point (x,y)
  const place = (x, y, svg, opt = {}) => {
    const [X, Y] = F(x, y); const sc = s * (opt.sc || 1);
    const sxx = sc * fl * (opt.sxMul || sx), syy = sc * (opt.syMul || Math.min(1.12, Math.max(0.88, sy)));
    return `<g transform="translate(${r1(X)} ${r1(Y)}) rotate(${r1(ang(y) + fl * (opt.rot || 0))}) scale(${r1(sxx * 100) / 100} ${r1(syy * 100) / 100})">${svg}</g>`;
  };
  return { T, F, ang, place, s, fl };
}

// ---------- line work ----------
// Body: ink "drop" offset to the lower right gives a thick-thin contour (light from top-left),
// one-tone flat shade, small varnish highlight, then the contour.
function body(d, col, colDk, s, extra = '') {
  const cid = uid('bc');
  return `<clipPath id="${cid}"><path d="${d}"/></clipPath>
  <path d="${d}" fill="${C.ink}" transform="translate(${r1(3.2 * s)} ${r1(4.2 * s)})"/>
  <path d="${d}" fill="${colDk}"/>
  <g clip-path="url(#${cid})"><path d="${d}" fill="${col}" transform="translate(${r1(-9 * s)} ${r1(-11 * s)})"/>${extra}</g>
  <path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${r1(3 * s)}" stroke-linejoin="round"/>`;
}
const stroke = (d, w, col = C.ink, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

// Tapered ink stroke along a quadratic: filled crescent (variable weight).
function taper(ax, ay, cx, cy, bx, by, w) {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len * w, ny = dx / len * w;
  return `<path d="M${r1(ax)} ${r1(ay)} Q${r1(cx + nx)} ${r1(cy + ny)} ${r1(bx)} ${r1(by)} Q${r1(cx - nx)} ${r1(cy - ny)} ${r1(ax)} ${r1(ay)}Z" fill="${C.ink}"/>`;
}

// ---------- eyes (pie-cut pupils) ----------
function eye(o) {
  const { rx, ry, look = [0, 0], lid = 0, lidRot = 0, low = 0, lowRot = 0, pupil = 1, col } = o;
  if (o.closed === 'happy') // upward arc, thick in the middle
    return taper(-rx * 0.95, ry * 0.15, 0, -ry * 1.15, rx * 0.95, ry * 0.15, 3.2) ;
  if (o.closed === 'shut')
    return taper(-rx, 0, 0, ry * 0.35, rx, 0, 2.6);
  if (o.closed === 'squeeze') // > <  shaped
    return `${stroke(`M${-rx * .8} ${-ry * .6} L${rx * .7} 0 L${-rx * .8} ${ry * .6}`, 4)}`;
  const cid = uid('ec');
  const prx = rx * 0.56 * pupil, pry = ry * 0.6 * pupil;
  const cx = look[0] * (rx - prx * 0.95), cy = look[1] * (ry - pry * 0.95);
  const a1 = rad(-78), a2 = rad(-30);
  const P = (a) => `${r1(cx + prx * Math.cos(a))} ${r1(cy + pry * Math.sin(a))}`;
  const pup = o.dot
    ? `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(prx * .45)}" ry="${r1(pry * .45)}" fill="${C.ink}"/>`
    : `<path d="M${r1(cx)} ${r1(cy)} L${P(a2)} A${r1(prx)} ${r1(pry)} 0 1 1 ${P(a1)} Z" fill="${C.ink}"/>`;
  const ye = -ry + 2 * ry * lid, yl = ry - 2 * ry * low;
  const lidSvg = lid > 0 ? `<g transform="rotate(${lidRot})"><rect x="${-rx * 2}" y="${-ry * 3}" width="${rx * 4}" height="${r1(ye + ry * 3)}" fill="${col}"/>${stroke(`M${-rx * 2} ${r1(ye)} L${rx * 2} ${r1(ye)}`, 3.4)}</g>` : '';
  const lowSvg = low > 0 ? `<g transform="rotate(${lowRot})"><rect x="${-rx * 2}" y="${r1(yl)}" width="${rx * 4}" height="${ry * 3}" fill="${col}"/>${stroke(`M${-rx * 2} ${r1(yl)} L${rx * 2} ${r1(yl)}`, 2.4)}</g>` : '';
  return `<clipPath id="${cid}"><ellipse rx="${rx}" ry="${ry}"/></clipPath>
  <ellipse rx="${rx}" ry="${ry}" fill="${C.glove}"/>
  <g clip-path="url(#${cid})">${pup}${lidSvg}${lowSvg}</g>
  <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${C.ink}" stroke-width="2.8"/>`;
}
function brow(len, arch = 4, w = 3.2) { return taper(-len / 2, 0, 0, -arch * 2, len / 2, 0, w); }

// ---------- mouths (local frame, ~44 px wide) ----------
function mouth(kind, o = {}) {
  const w = o.w || 1;
  const g = (inner) => `<g transform="scale(${w})">${inner}</g>`;
  switch (kind) {
    case 'smile': return g(`${taper(-16, -2, 0, 12, 16, -3, 2.6)}${stroke('M-18 -5 Q-15 -1 -14 2', 2.2)}${stroke('M18 -6 Q15 -2 14 1', 2.2)}`);
    case 'worry': // wobbly nervous line + one tooth
      return g(`<path d="M-16 2 Q-8 -5 0 1 Q8 7 16 -1 L14 5 Q8 12 0 7 Q-8 2 -15 8 Z" fill="${C.mouth}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-3 2 L4 4 L3 8 L-3 6Z" fill="${C.glove}"/>`);
    case 'grin':
      return g(`<path d="M-22 -6 Q0 2 22 -6 Q20 22 0 25 Q-20 22 -22 -6Z" fill="${C.mouth}" stroke="${C.ink}" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M-14 16 Q0 6 14 16 Q8 23 0 24 Q-8 23 -14 16Z" fill="${C.tongue}"/>
      <path d="M-19 -3.5 Q0 4 19 -3.5 L18 1.5 Q0 8 -18 1.5Z" fill="${C.glove}"/>
      ${stroke('M-25 -9 Q-22 -6 -21 -2', 2.2)}${stroke('M25 -9 Q22 -6 21 -2', 2.2)}`);
    case 'scream':
      return g(`<path d="M-15 -8 Q0 -14 15 -8 Q20 14 0 30 Q-20 14 -15 -8Z" fill="${C.mouth}" stroke="${C.ink}" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M-9 20 Q0 12 9 20 Q5 28 0 29 Q-5 28 -9 20Z" fill="${C.tongue}"/>
      <path d="M-13 -6.5 Q0 -12 13 -6.5 L12.5 -2 Q0 -6 -12.5 -2Z" fill="${C.glove}"/>`);
    case 'flat': return g(`${taper(-14, 2, 0, 0, 14, -2, 1.8)}${stroke('M14 -2 Q18 -3 19 -7', 2.2)}`);
    case 'smirk': return g(`${taper(-15, 0, 2, 4, 16, -6, 2.2)}${stroke('M16 -6 Q19 -8 19 -11', 2.2)}`);
    case 'o': return g(`<ellipse cx="0" cy="2" rx="6" ry="7" fill="${C.mouth}" stroke="${C.ink}" stroke-width="2.6"/>`);
    case 'calm': return g(`${taper(-12, 0, 0, 7, 12, -1, 2)}`);
    default: return '';
  }
}

// ---------- gloves (wrist at origin, hand pointing +x, thumb towards -y) ----------
function glove(kind = 'open') {
  const f = C.glove, sw = 2.7;
  const P = (d) => `<path d="${d}" fill="${f}" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const L = (d) => stroke(d, 1.8);
  const cuff = `<path d="M-5 -9 C-2 -12 4 -15 11 -15 C14 -6 14 6 11 15 C4 15 -2 12 -5 9 C-6 3 -6 -3 -5 -9Z" fill="${f}" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"/>${L('M3 -13 C5 -5 5 5 3 13')}`;
  let hand;
  if (kind === 'fist') {
    hand = P('M6 -11 C10 -17 22 -19 31 -15 C40 -12 43 -4 42 2 C43 9 40 17 30 18 C20 19 10 15 6 11Z') +
      L('M41 -4 C37 -4 34 -3 32 -2') + L('M42 5 C38 5 35 5 32 4') + L('M38 13 C35 12 33 11 31 10') +
      P('M14 -13 C22 -13 31 -9 33 -3 C34 1 30 3 27 0 C23 -4 18 -7 12 -7Z');
  } else if (kind === 'point') {
    hand = P('M6 -11 C10 -17 20 -17 26 -13 C34 -15 50 -15 58 -12 C63 -10 62 -4 57 -3 C49 -2 41 -3 37 -2 C42 3 41 13 31 16 C20 18 10 15 6 11Z') +
      L('M37 -2 C35 2 35 6 33 9') + L('M30 -6 C34 -6 37 -5 38 -3') +
      P('M14 -13 C20 -14 27 -12 29 -7 C30 -3 26 -2 23 -4 C20 -6 16 -8 12 -8Z');
  } else if (kind === 'hold') { // relaxed, fingers curled under (for cups / handles)
    hand = P('M6 -11 C12 -17 26 -17 33 -11 C38 -6 39 0 36 4 C40 8 38 14 33 14 C36 18 30 22 25 19 C22 22 14 20 13 16 C9 16 6 14 6 11Z') +
      L('M36 4 C33 4 30 5 29 7') + L('M33 14 C30 13 28 12 27 11') +
      P('M16 -14 C22 -22 32 -24 34 -18 C36 -13 30 -10 24 -10Z');
  } else { // open, four puffy fingers fanned
    hand = P('M6 -9 C10 -14 16 -16 20 -14 C20 -22 26 -30 32 -28 C38 -26 36 -18 31 -12 C38 -15 48 -16 52 -11 C55 -7 52 -3 46 -4 C52 -2 57 2 55 6 C53 10 47 9 43 7 C48 10 51 15 48 18 C45 21 39 18 36 14 C38 19 36 23 32 23 C27 23 24 18 24 14 C20 15 12 14 6 9Z') +
      L('M46 -4 C42 -4 38 -4 34 -3') + L('M43 7 C40 6 37 5 34 4') + L('M36 14 C34 12 32 11 30 10') + L('M31 -12 C28 -10 26 -9 24 -9');
  }
  return hand + cuff;
}

// ---------- shoes (heel at origin, toe to +x) ----------
function shoe(opt = {}) {
  const s = `<path d="M-10 0 C-14 -10 -6 -17 4 -15 C10 -14 14 -13 18 -15 C30 -26 54 -22 56 -6 C58 6 46 11 30 11 L-6 11 C-12 11 -13 5 -10 0Z" fill="${C.ink}"/>
  <path d="M-9 6 C10 7 34 7 52 4" fill="none" stroke="${C.paperDk}" stroke-width="1.6" opacity=".55"/>
  <ellipse cx="40" cy="-11" rx="8" ry="3.6" transform="rotate(-16 40 -11)" fill="${C.glove}" opacity=".85"/>`;
  const sp = opt.spats ? `<path d="M-9 -1 C-12 -11 -4 -19 6 -19 C13 -19 19 -16 21 -10 C14 -5 2 -3 -9 -1Z" fill="${C.glove}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="12" cy="-10" r="1.5" fill="${C.ink}"/><circle cx="6" cy="-8" r="1.5" fill="${C.ink}"/>` : '';
  return s + sp;
}

// ---------- limbs ----------
function hose(A, B, bend, w) {
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
  const c = [mx - dy / len * bend, my + dx / len * bend];
  const d = `M${r1(A[0])} ${r1(A[1])} Q${r1(c[0])} ${r1(c[1])} ${r1(B[0])} ${r1(B[1])}`;
  const a = deg(Math.atan2(B[1] - c[1], B[0] - c[0]));
  return { svg: stroke(d, w), angle: a };
}
function arm(R, from, spec, w) {
  const A = R.F(from[0], from[1]);
  const B = R.T(spec.x, spec.y);
  const h = hose(A, B, (spec.bend || 0) * R.s * R.fl, w * R.s);
  const a = spec.aim != null ? (R.fl > 0 ? spec.aim : 180 - spec.aim) : h.angle + (spec.rot || 0) * R.fl;
  const up = spec.thumb != null ? spec.thumb : (Math.cos(rad(a)) < 0 ? -1 : 1);
  const gsc = (spec.sc || 1) * R.s;
  const g = `<g transform="translate(${r1(B[0])} ${r1(B[1])}) rotate(${r1(a)}) scale(${r1(gsc * 100) / 100} ${r1(gsc * up * 100) / 100})">${spec.prop || ''}${glove(spec.glove)}${spec.propFront || ''}</g>`;
  const held = spec.held ? `<g transform="translate(${r1(B[0])} ${r1(B[1])}) scale(${r1(R.s * R.fl * 100) / 100} ${r1(R.s * 100) / 100})">${spec.held}</g>` : '';
  return spec.heldFront ? h.svg + g + held : h.svg + held + g;
}
function leg(R, from, spec, w, shoeOpt) {
  const A = R.F(from[0], from[1]);
  const B = R.T(spec.x, spec.y);
  const h = hose(A, B, (spec.bend || 0) * R.s * R.fl, w * R.s);
  const dir = (spec.dir != null ? spec.dir : 1) * R.fl;
  return h.svg + `<g transform="translate(${r1(B[0])} ${r1(B[1] + 2 * R.s)}) rotate(${r1(spec.rot || 0) * R.fl}) scale(${r1(R.s * dir * 100) / 100} ${r1(R.s * 100) / 100}) translate(-6 0)">${shoe(shoeOpt)}</g>`;
}

// Folds: light ridge offset up-left + ink groove = embossed gyri.
function foldSet(list, R, lt) {
  const s = R.s;
  return list.map((f) => { const d = mapPath(f, R.F);
    return stroke(d, 2.6 * s, lt, `opacity=".8" transform="translate(${r1(-2.4 * s)} ${r1(-2.6 * s)})"`) + stroke(d, 3.1 * s); }).join('');
}

// ---------- extras ----------
const sweat = (sc = 1) => `<path d="M0 -14 C4 -6 8 -1 8 4 C8 9 4 12 0 12 C-4 12 -8 9 -8 4 C-8 -1 -4 -6 0 -14Z" transform="scale(${sc})" fill="${C.glove}" stroke="${C.ink}" stroke-width="2.2"/><path d="M-3 3 Q-3 7 0 8" transform="scale(${sc})" fill="none" stroke="${C.blueLt}" stroke-width="2" stroke-linecap="round"/>`;
function steam(x, y, sc = 1) {
  return `<g transform="translate(${x} ${y}) scale(${sc})" opacity=".9">${stroke('M-6 0 C-14 -10 2 -16 -6 -28 C-12 -36 -2 -42 -6 -50', 2.4)}${stroke('M8 -4 C0 -14 16 -20 8 -32 C2 -40 12 -44 8 -52', 2.4)}</g>`;
}
function mug(opt = {}) { // mug centre at origin, handle on -x side
  return `<path d="M-30 -10 C-44 -12 -46 12 -30 12" fill="none" stroke="${C.ink}" stroke-width="6"/>
  <path d="M-30 -10 C-44 -12 -46 12 -30 12" fill="none" stroke="${C.glove}" stroke-width="2.4"/>
  <path d="M-26 -22 L24 -22 L20 20 C10 26 -12 26 -22 20Z" fill="${C.glove}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M-25 -8 L23 -8 L22 0 L-24 0Z" fill="${C.blue}"/>
  <ellipse cx="-1" cy="-22" rx="25" ry="5" fill="#5a3a22" stroke="${C.ink}" stroke-width="3"/>
  ${opt.steam === false ? '' : steam(0, -30, .8)}`;
}

// Wavy elliptical band (Catmull-Rom → cubic Bézier): tidy, combed gyri for Capi.
function wavyBand(cx, cy, rx, ry, a0, a1, amp, waves, seed) {
  const pts = []; const n = 90;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = rad(a0 + (a1 - a0) * t);
    const w = amp * Math.sin(t * Math.PI * 2 * waves / 2 + seed) * Math.sin(Math.PI * t) * 1.6;
    pts.push([cx + (rx + w) * Math.cos(a), cy + (ry + w) * Math.sin(a)]);
  }
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

// ================= MAPI — la almendra =================
const MAPI = {
  H: 216,
  body: 'M16 -218 C36 -198 68 -146 68 -86 C68 -28 38 4 -2 4 C-42 4 -72 -24 -72 -80 C-72 -140 -30 -194 16 -218Z',
  folds: [
    'M12 -204 C2 -196 14 -186 6 -176 C0 -168 8 -158 20 -164',
    'M-30 -180 C-42 -170 -28 -160 -40 -150 C-50 -142 -62 -148 -58 -158',
    'M-70 -122 C-58 -128 -48 -118 -56 -108 C-62 -100 -60 -92 -68 -86',
    'M-66 -52 C-56 -58 -44 -52 -46 -42 C-48 -32 -36 -24 -26 -30 C-18 -34 -16 -24 -22 -18',
    'M-4 -8 C-2 -20 12 -22 16 -14 C20 -6 32 -10 34 -20',
    'M66 -66 C54 -64 50 -52 56 -44 C60 -38 54 -30 46 -32',
    'M68 -126 C58 -122 56 -110 64 -102',
    'M38 -186 C30 -174 42 -166 50 -158 C54 -154 50 -148 44 -150',
  ],
  shoulders: [[-64, -74], [64, -78]], hips: [[-22, -1], [20, -1]],
};
function mapi(o) {
  const R = rig({ ...o, H: MAPI.H });
  const s = R.s, e = o.expr || {};
  const d = mapPath(MAPI.body, R.F);
  const folds = foldSet(MAPI.folds, R, C.redLt);
  const hl = stroke(mapPath('M-40 -150 C-30 -176 -14 -194 -2 -202', R.F), 4 * s, C.redLt, 'opacity=".9"');
  const arms = o.arms || [{ x: -86, y: -30, bend: -20, glove: 'open' }, { x: 86, y: -34, bend: 20, glove: 'open' }];
  const legs = o.legs || [{ x: -40, y: 46, bend: 12, dir: -1 }, { x: 36, y: 46, bend: -12, dir: 1 }];
  let out = '';
  out += o.behind || '';
  legs.forEach((l, i) => { out += leg(R, MAPI.hips[i], l, 7.5, {}); });
  arms.forEach((a, i) => { if (a.back) out += arm(R, MAPI.shoulders[i], a, 7.5); });
  out += body(d, C.red, C.redDk, s, hl + folds);
  // face
  const look = e.look || [0.2, 0];
  const eyeL = eye({ rx: 17, ry: 25, look, lid: e.lid || 0, lidRot: e.lidRot || 0, low: e.low || 0, pupil: e.pupil || 1, col: C.red, closed: e.closed, dot: e.dot });
  const eyeR = eye({ rx: 18, ry: 26, look, lid: e.lidR != null ? e.lidR : (e.lid || 0), lidRot: -(e.lidRotR != null ? e.lidRotR : (e.lidRot || 0)), low: e.low || 0, pupil: e.pupil || 1, col: C.red, closed: e.closedR || e.closed, dot: e.dot });
  out += R.place(-20, -128, eyeL, { rot: -4 });
  out += R.place(20, -130, eyeR, { rot: 4 });
  const bL = e.brow || [0, 0], bR = e.browR || [-(bL[0]), bL[1]];
  out += R.place(-22, -164 - bL[1], `<g transform="rotate(${bL[0]})">${brow(22, 3)}</g>`);
  out += R.place(22, -168 - bR[1], `<g transform="rotate(${bR[0]})">${brow(22, 3)}</g>`);
  out += R.place(-2 + (e.mx || 0), -80, mouth(e.mouth || 'worry', { w: e.mw || 1 }), { rot: e.mrot || 0 });
  if (e.blush !== false) {
    out += R.place(-44, -92, `<ellipse rx="9" ry="4" fill="${C.redLt}" opacity=".75"/>`);
    out += R.place(40, -94, `<ellipse rx="9" ry="4" fill="${C.redLt}" opacity=".75"/>`);
  }
  out += o.mid || '';
  arms.forEach((a, i) => { if (!a.back) out += arm(R, MAPI.shoulders[i], a, 7.5); });
  if (o.sweat) o.sweat.forEach(([x, y, sc, rot]) => { out += R.place(x, y, `<g transform="rotate(${rot || 0})">${sweat(sc || 1)}</g>`); });
  out += o.front || '';
  return `<g class="mapi">${out}</g>`;
}

// ================= CAPI — el lóbulo =================
const CAPI = {
  H: 214,
  body: 'M-112 -44 C-129 -59 -126 -109 -106 -128 C-111 -149 -86 -185 -64 -188 C-57 -207 -21 -222 -4 -214 C11 -226 48 -221 58 -206 C78 -208 108 -183 108 -164 C127 -154 137 -114 126 -96 C124 -40 98 -2 52 2 C22 4 10 -10 -12 -8 C-36 -6 -48 6 -76 2 C-100 -2 -108 -22 -112 -44Z',
  folds: [
    'M-60 -184 C-40 -198 0 -204 28 -196 C42 -192 44 -180 32 -176 C20 -172 8 -182 -8 -178 C-24 -174 -30 -162 -22 -154',
    'M60 -194 C76 -190 92 -180 100 -168 C106 -158 98 -150 90 -156',
    'M-98 -132 C-92 -152 -76 -166 -60 -164 C-48 -162 -48 -148 -60 -144 C-72 -140 -74 -126 -62 -120 C-50 -114 -38 -124 -32 -136 C-26 -146 -12 -146 -6 -138',
    'M-108 -82 C-104 -98 -92 -108 -82 -102 C-72 -96 -80 -84 -70 -76 C-60 -68 -46 -78 -44 -90 C-42 -100 -30 -104 -22 -96 C-14 -88 -20 -76 -10 -68',
    'M-98 -36 C-90 -48 -76 -50 -70 -42 C-64 -34 -52 -32 -44 -40',
    'M-28 -50 C-20 -58 -8 -56 -4 -46 C0 -36 12 -36 16 -42',
    'M8 -150 C14 -140 4 -130 12 -120 C16 -114 24 -116 26 -122',
  ],
  shoulders: [[-104, -64], [116, -66]], hips: [[-6, -4], [44, -2]],
};
function capi(o) {
  const R = rig({ ...o, H: CAPI.H });
  const s = R.s, e = o.expr || {};
  const d = mapPath(CAPI.body, R.F);
  const folds = foldSet(CAPI.folds, R, C.blueLt);
  const hl = stroke(mapPath('M-90 -126 C-78 -160 -50 -184 -20 -192', R.F), 4.5 * s, C.blueLt, 'opacity=".9"');
  const arms = o.arms || [{ x: -128, y: -10, bend: -18, glove: 'open' }, { x: 140, y: -20, bend: 16, glove: 'open' }];
  const legs = o.legs || [{ x: -8, y: 40, bend: -4, dir: -1 }, { x: 50, y: 40, bend: 4, dir: 1 }];
  let out = o.behind || '';
  legs.forEach((l, i) => { out += leg(R, CAPI.hips[i], l, 9, { spats: true }); });
  arms.forEach((a, i) => { if (a.back) out += arm(R, CAPI.shoulders[i], a, 9); });
  out += body(d, C.blue, C.blueDk, s, hl + folds);
  const look = e.look || [0.25, 0.1];
  const lid = e.lid != null ? e.lid : 0.48, lidR = e.lidR != null ? e.lidR : lid;
  const ex = [40, 98], ey = -114, er = { rx: 15, ry: 17 }, gr = 25;
  if (e.closed) {
    out += R.place(ex[0], ey, eye({ ...er, closed: e.closed }));
    out += R.place(ex[1], ey, eye({ ...er, closed: e.closed }));
  } else {
    out += R.place(ex[0], ey, eye({ ...er, look, lid, lidRot: e.lidRot != null ? e.lidRot : 6, low: e.low || 0, col: C.blue, pupil: e.pupil || 1 }));
    out += R.place(ex[1], ey, eye({ ...er, look, lid: lidR, lidRot: -(e.lidRotR != null ? e.lidRotR : (e.lidRot != null ? e.lidRot : 6)), low: e.low || 0, col: C.blue, pupil: e.pupil || 1 }));
  }
  // round professor glasses (they break the silhouette on purpose)
  const lens = (x) => `<circle cx="${x}" cy="0" r="${gr}" fill="${C.blueLt}" fill-opacity=".16" stroke="${C.ink}" stroke-width="4.6"/>
    ${stroke(`M${x - 14} -13 Q${x - 7} -19 ${x + 2} -19`, 2.8, C.glove, 'opacity=".9"')}`;
  const gl = `${lens(ex[0])}${lens(ex[1])}
    ${stroke(`M${ex[0] + gr - 1} -5 Q${(ex[0] + ex[1]) / 2} -14 ${ex[1] - gr + 1} -5`, 4)}
    ${stroke(`M${ex[0] - gr} -5 L${ex[0] - gr - 30} -12`, 3.4)}`;
  out += R.place(0, ey + (e.glassesDy || 0), gl);
  // nose
  out += R.place(69, -82, `<ellipse rx="11" ry="8.5" fill="${C.blueDk}" stroke="${C.ink}" stroke-width="2.8"/><ellipse cx="-3" cy="-3" rx="3.5" ry="2.2" fill="${C.blueLt}"/>`);
  const bL = e.brow || [8, 0], bR = e.browR || [-bL[0], bL[1]];
  out += R.place(ex[0], -150 - bL[1], `<g transform="rotate(${bL[0]})">${brow(30, 2, 3.8)}</g>`);
  out += R.place(ex[1], -150 - bR[1], `<g transform="rotate(${bR[0]})">${brow(30, 2, 3.8)}</g>`);
  out += R.place(72 + (e.mx || 0), -58, mouth(e.mouth || 'calm', { w: (e.mw || 1) * 1.15 }), { rot: e.mrot || 0 });
  // moustache-free; cheek fold
  
  // bow tie
  const bow = `<path d="M0 0 C-10 -14 -30 -18 -32 -6 C-34 6 -26 14 -14 8 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M0 0 C10 -14 30 -18 32 -6 C34 6 26 14 14 8 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="2.8" stroke-linejoin="round"/>
    <circle cx="-20" cy="-4" r="2.4" fill="${C.glove}"/><circle cx="-14" cy="4" r="2" fill="${C.glove}"/><circle cx="20" cy="-4" r="2.4" fill="${C.glove}"/><circle cx="14" cy="4" r="2" fill="${C.glove}"/>
    <ellipse cx="0" cy="1" rx="7" ry="8" fill="${C.redDk}" stroke="${C.ink}" stroke-width="2.6"/>`;
  out += R.place(70, -24, bow, { rot: e.bowRot || -4 });
  out += o.mid || '';
  arms.forEach((a, i) => { if (!a.back) out += arm(R, CAPI.shoulders[i], a, 9); });
  out += o.front || '';
  return `<g class="capi">${out}</g>`;
}

// ---------- shared defs: grain, paper stains, vignette, ink wobble ----------
function defs(w, h) {
  return `<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix type="matrix" values="0 0 0 0 .12  0 0 0 0 .09  0 0 0 0 .06  0 0 0 -1.6 1.15"/>
  </filter>
  <filter id="stain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".006 .009" numOctaves="4" seed="3"/>
    <feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .18  0 0 0 -2.2 1.25"/>
  </filter>
  <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="11" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <radialGradient id="vig" cx="50%" cy="48%" r="72%">
    <stop offset="55%" stop-color="#2a1a0c" stop-opacity="0"/>
    <stop offset="100%" stop-color="#2a1a0c" stop-opacity=".42"/>
  </radialGradient>
  </defs>`;
}
function paperBg(w, h, col = C.paper) {
  return `<rect width="${w}" height="${h}" fill="${col}"/><rect width="${w}" height="${h}" filter="url(#stain)" opacity=".55"/>`;
}
function filmFx(w, h, vig = true) {
  return `${vig ? `<rect width="${w}" height="${h}" fill="url(#vig)"/>` : ''}<rect width="${w}" height="${h}" filter="url(#grain)" opacity=".34" style="mix-blend-mode:multiply"/>`;
}
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Ultra&amp;family=Oswald:wght@500;700&amp;family=Shrikhand&amp;display=swap');`;

module.exports = { C, mapi, capi, defs, paperBg, filmFx, FONTS, stroke, taper, sweat, steam, mug, glove, shoe, uid, r1, mapPath, eye, mouth };
