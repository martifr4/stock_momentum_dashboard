// Motor de animación «Riso» — tarjetas de subtítulo.
// Bricolage Grotesque 800 (75 %, opsz 96) sobre losas color papel (reserva en las tres planchas),
// entrada «sello» (1,08 → 1,03 → 1,00) o rebote con overshoot, palabras en la tinta de cada personaje,
// sello por segmentos y zona segura x 60–940, y 260–1480.
// prepare() es asíncrono (mide con las fuentes reales); render() es síncrono y puro (por fotograma).
const R = require('../riso.js');
const { INK, W, L, f, styleCss } = R;
const T = require('./timeline.js');

const SAFE = { x0: 60, x1: 940, y0: 260, y1: 1480 };
const DEF = { cx: 500, maxW: 840, ls: -0.01, lh: 1.0, slabPadX: 18, slabPadTop: 0.80, slabPadBot: 0.24 };

// Spans: { t, ink: 'black'|'red'|'blue', seg?: n } o { dot: 'red'|'blue', r, seg? }.
// spec: { id, in, out, lines: [[span…]], size, base: [y1, y2…] | y, cx, segs: [f0, f1…], world: {x, y, rot}, outline }
async function prepare(M, specs) {
  const out = [];
  for (const sp of specs) {
    let size = sp.size;
    const st = sp.st || 'head';
    const widthOf = async (span, sz) => (span.dot ? span.r * 2 + sz * 0.08 : M.width([{ t: span.t, st, ls: sp.ls ?? DEF.ls }], sz));
    const lineW = async (line, sz) => { let w = 0; for (const s of line) w += await widthOf(s, sz); return w; };
    // si una línea no cabe, se baja de 4 en 4 px (no se vuelve a cortar)
    while (true) {
      let max = 0; for (const ln of sp.lines) max = Math.max(max, await lineW(ln, size));
      if (max <= (sp.maxW || DEF.maxW) || size <= 40) break;
      size -= 4;
    }
    const lines = [];
    for (let i = 0; i < sp.lines.length; i++) {
      const ln = sp.lines[i];
      const ws = []; for (const s of ln) ws.push(await widthOf(s, size));
      const total = ws.reduce((a, b) => a + b, 0);
      const anchor = sp.world ? 'start' : sp.anchor || 'middle';
      const cx = sp.cx ?? DEF.cx;
      let x = anchor === 'start' ? 0 : anchor === 'end' ? cx - total : cx - total / 2;
      const base = Array.isArray(sp.base) ? sp.base[i] : (sp.base ?? (size > 96 ? 410 : 400)) + i * size * (sp.lh ?? DEF.lh);
      const spans = ln.map((s, j) => { const o = { ...s, x, w: ws[j] }; x += ws[j]; return o; });
      lines.push({ spans, base, w: total, x0: spans[0].x, x1: x });
    }
    out.push({ ...sp, size, st, lines, sizeIn: sp.size });
  }
  return out;
}

// escala del sello en el fotograma k desde su entrada
function stampScale(k, kind = 'stamp') {
  if (k < 0) return null;
  if (kind === 'stamp') return [1.08, 1.03, 1.0][Math.min(k, 2)];
  if (kind === 'pop') return k >= 6 ? 1 : 0.6 + 0.4 * T.EASE.easeOutBack(k / 6, 2.2); // pop con overshoot
  if (kind === 'big') return k >= 2 ? 1 : [1.3, 1.15][k];
  return 1;
}

// bounds de un grupo de spans (x0, x1, yTop, yBot)
function spanBounds(lines, filter, size) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const ln of lines) for (const s of ln.spans) if (filter(s)) {
    x0 = Math.min(x0, s.x); x1 = Math.max(x1, s.x + s.w);
    y0 = Math.min(y0, ln.base - size * 0.74); y1 = Math.max(y1, ln.base + size * 0.12);
  }
  return { x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

// Dibuja una tarjeta en el fotograma t. Devuelve capas (o null si no está en pantalla).
function render(card, t, { slab = true, kind = 'stamp' } = {}) {
  if (t < card.in || t >= card.out) return null;
  const o = L();
  const size = card.size, ls = card.ls ?? DEF.ls;
  const segs = card.segs || [card.in];
  const css = styleCss(card.st, size, ls);
  const slabs = L();
  for (let si = 0; si < segs.length; si++) {
    const k = t - segs[si];
    const sc = stampScale(k, card.kind || kind);
    if (sc == null) continue;
    const inSeg = (s) => (s.seg || 0) === si;
    const bb = spanBounds(card.lines, inSeg, size);
    if (!isFinite(bb.x0)) continue;
    // ancla del sello: centro del bloque entero (una tarjeta) o del segmento (por segmentos)
    const anc = segs.length === 1 ? spanBounds(card.lines, () => true, size) : bb;
    const g = L(), gs = L();
    for (const ln of card.lines) {
      const mine = ln.spans.filter(inSeg);
      if (!mine.length) continue;
      if (slab && !card.noSlab) {
        const sx0 = mine[0].x - DEF.slabPadX, sx1 = mine[mine.length - 1].x + mine[mine.length - 1].w + DEF.slabPadX;
        const sy0 = ln.base - size * DEF.slabPadTop, sy1 = ln.base + size * DEF.slabPadBot;
        const rect = `<rect x="${f(sx0)}" y="${f(sy0)}" width="${f(sx1 - sx0)}" height="${f(sy1 - sy0)}" rx="${f(size * 0.16)}" fill="${W}"/>`;
        gs.blue += rect; gs.red += rect; gs.black += rect;
      }
      for (const s of mine) {
        const ink = s.dot || s.ink || 'black';
        if (s.dot) { g[ink] += `<circle cx="${f(s.x + s.w / 2)}" cy="${f(ln.base - size * 0.34)}" r="${s.r}" fill="${INK[ink]}"/>`; continue; }
        const outline = card.outline && s.ink === card.outline.ink ? ` stroke="${W}" stroke-width="${card.outline.w}" stroke-linejoin="round" paint-order="stroke"` : '';
        g[ink] += `<text x="${f(s.x)}" y="${f(ln.base)}" style="${css}white-space:pre" fill="${INK[ink]}"${outline}>${R_esc(s.t)}</text>`;
      }
    }
    const tf = sc === 1 ? '' : `translate(${f(anc.cx)} ${f(anc.cy)}) scale(${sc}) translate(${f(-anc.cx)} ${f(-anc.cy)})`;
    for (const kk of ['blue', 'red', 'black']) {
      if (gs[kk]) slabs[kk] += tf ? `<g transform="${tf}">${gs[kk]}</g>` : gs[kk];
      if (g[kk]) o[kk] += tf ? `<g transform="${tf}">${g[kk]}</g>` : g[kk];
    }
  }
  // todas las losas debajo de todo el texto (una losa nueva no tapa el final del segmento anterior)
  for (const kk of ['blue', 'red', 'black']) o[kk] = slabs[kk] + o[kk];
  if (card.world) { // anclada al mundo: ancla izquierda en (x,y) con giro
    const { x, y, rot = 0 } = card.world;
    for (const kk of ['blue', 'red', 'black']) if (o[kk]) o[kk] = `<g transform="translate(${x} ${y}) rotate(${rot})">${o[kk]}</g>`;
  }
  return o;
}
const R_esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// comprobación de zona segura (para el informe): devuelve [] o lista de problemas
function checkSafe(cards) {
  const bad = [];
  for (const c of cards) {
    if (c.world) continue;
    for (const ln of c.lines) {
      if (ln.x0 < SAFE.x0 || ln.x1 > SAFE.x1 || ln.base - c.size * 0.8 < SAFE.y0 || ln.base > SAFE.y1) bad.push(`${c.id}: x ${ln.x0.toFixed(0)}–${ln.x1.toFixed(0)} base ${ln.base}`);
    }
  }
  return bad;
}

module.exports = { SAFE, DEF, prepare, render, stampScale, checkSafe };
