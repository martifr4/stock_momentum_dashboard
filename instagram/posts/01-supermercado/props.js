// Post 01 · El supermercado — atrezo, poses nuevas, plano del súper y plantilla de paradas.
// Importa la librería compartida SIN modificarla (characters/riso/riso.js). Todo devuelve capas
// { black, red, blue, defs } como el resto de la librería.
const R = require('../../characters/riso/riso.js');
const { INK, W, L, add, f, uid, strokeP, halftone, shadowEllipse, text, richText, chispa, pausa, stub, FONT_MONO, roundPoly } = R;

// ---------------------------------------------------------------- helpers (del post 00)
function G(c, lx, ly) {
  const a = ((c.rot || 0) * Math.PI) / 180, Y = ly * c.s, X = lx * c.s * (c.flip ? -1 : 1) + Math.tan(((c.lean || 0) * Math.PI) / 180) * Y;
  return [c.x + X * Math.cos(a) - Y * Math.sin(a), c.y + X * Math.sin(a) + Y * Math.cos(a)];
}
function clipLayers(layers, x, y, w, hgt) {
  const id = uid('cl');
  const o = L();
  o.defs = (layers.defs || '') + `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${hgt}"/></clipPath>`;
  for (const k of ['black', 'red', 'blue']) if (layers[k]) o[k] = `<g clip-path="url(#${id})">${layers[k]}</g>`;
  return o;
}
function shiftPlate(layers, k, dx, dy) { if (layers[k]) layers[k] = `<g transform="translate(${dx} ${dy})">${layers[k]}</g>`; return layers; }
function tf(layers, t) { const o = L(); for (const k of ['black', 'red', 'blue']) if (layers[k]) o[k] = `<g transform="${t}">${layers[k]}</g>`; o.defs = layers.defs || ''; return o; }
// pinta una forma en su tinta y la reserva en las otras planchas indicadas (oclusión entre planchas)
function shape(d, ink, knock = ['black', 'red'], extra = '') {
  const o = L();
  for (const k of knock) if (k !== ink) o[k] += `<path d="${d}" fill="${W}" ${extra}/>`;
  o[ink] += `<path d="${d}" fill="${INK[ink]}" ${extra}/>`;
  return o;
}
const NB = ' '; // espacio de no separación entre cifra y € / %
const nb = (t) => t.replace(/ (€|%)/g, NB + '$1');

// ---------------------------------------------------------------- envases genéricos (sin marcas ni texto)
// (x, y) = centro de la base. Devuelven capas; «etiquetas» = bandas en reserva.
function caja(x, y, w = 60, h = 80, ink = 'black', rot = 0) {
  const o = shape(`M${x - w / 2} ${y - h} h${w} v${h} h${-w}Z`, ink);
  o[ink] += `<rect x="${x - w / 2}" y="${y - h * 0.62}" width="${w}" height="${Math.max(6, h * 0.16)}" fill="${W}"/>`;
  o[ink] += `<rect x="${x - w * 0.28}" y="${y - h * 0.3}" width="${w * 0.56}" height="${Math.max(4, h * 0.07)}" rx="2" fill="${W}"/>`;
  return rot ? tf(o, `rotate(${rot} ${x} ${y - h / 2})`) : o;
}
function botella(x, y, w = 34, h = 96, ink = 'red', rot = 0) {
  const n = w * 0.38, sh = h * 0.3;
  const d = `M${x - w / 2} ${y - 6} Q${x - w / 2} ${y} ${x - w / 2 + 6} ${y} H${x + w / 2 - 6} Q${x + w / 2} ${y} ${x + w / 2} ${y - 6} V${y - h + sh + 8} Q${x + w / 2} ${y - h + sh - 6} ${x + n / 2} ${y - h + sh - 14} V${y - h + 8} H${x - n / 2} V${y - h + sh - 14} Q${x - w / 2} ${y - h + sh - 6} ${x - w / 2} ${y - h + sh + 8}Z`;
  const o = shape(d, ink);
  o.black += `<rect x="${x - n / 2 - 2}" y="${y - h}" width="${n + 4}" height="10" rx="2" fill="${INK.black}"/>`;
  o[ink] += `<rect x="${x - w / 2}" y="${y - h * 0.5}" width="${w}" height="${h * 0.2}" fill="${W}"/>`;
  return rot ? tf(o, `rotate(${rot} ${x} ${y - h / 2})`) : o;
}
function lata(x, y, w = 40, h = 54, ink = 'black', rot = 0) {
  const o = shape(roundPoly([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y], [x - w / 2, y]], 5), ink);
  o[ink] += `<path d="M${x - w / 2} ${y - h + 8} h${w} M${x - w / 2} ${y - 8} h${w}" stroke="${W}" stroke-width="3"/>`;
  o[ink] += `<rect x="${x - w / 2}" y="${y - h * 0.62}" width="${w}" height="${h * 0.24}" fill="${W}"/>`;
  return rot ? tf(o, `rotate(${rot} ${x} ${y - h / 2})`) : o;
}
function bolsaSnack(x, y, w = 58, h = 76, ink = 'red', rot = 0) {
  // almohada con bordes dentados arriba y abajo
  let d = `M${x - w / 2} ${y - h + 8}`;
  const n = 7;
  for (let i = 0; i <= n; i++) d += ` L${f(x - w / 2 + (w * i) / n)} ${y - h + (i % 2 ? 0 : 8)}`;
  d += ` Q${x + w / 2 + 6} ${y - h / 2} ${x + w / 2} ${y - 8}`;
  for (let i = n; i >= 0; i--) d += ` L${f(x - w / 2 + (w * i) / n)} ${y - (i % 2 ? 0 : 8)}`;
  d += ` Q${x - w / 2 - 6} ${y - h / 2} ${x - w / 2} ${y - h + 8}Z`;
  const o = shape(d, ink);
  o[ink] += `<ellipse cx="${x}" cy="${y - h * 0.48}" rx="${w * 0.26}" ry="${h * 0.16}" fill="${W}"/>`;
  return rot ? tf(o, `rotate(${rot} ${x} ${y - h / 2})`) : o;
}
function brick(x, y, w = 44, h = 92, ink = 'black', rot = 0) { // cartón de leche con tejadillo
  const d = `M${x - w / 2} ${y} V${y - h + 18} L${x - w / 2 + 6} ${y - h + 4} H${x + w / 2 - 6} L${x + w / 2} ${y - h + 18} V${y}Z`;
  const o = shape(d, ink);
  o[ink] += `<path d="M${x - w / 2} ${y - h + 18} H${x + w / 2}" stroke="${W}" stroke-width="3"/>`;
  o[ink] += `<rect x="${x - w / 2}" y="${y - h * 0.55}" width="${w}" height="${h * 0.22}" fill="${W}"/>`;
  o.black += `<rect x="${x - 6}" y="${y - h - 2}" width="12" height="8" fill="${INK.black}"/>`;
  return rot ? tf(o, `rotate(${rot} ${x} ${y - h / 2})`) : o;
}
function huevera(x, y, w = 96, h = 30, ink = 'black', rot = 0) {
  let d = `M${x - w / 2} ${y} V${y - h} `;
  const n = 4, cw = w / n;
  for (let i = 0; i < n; i++) d += `Q${x - w / 2 + cw * (i + 0.5)} ${y - h - 22} ${x - w / 2 + cw * (i + 1)} ${y - h} `;
  d += `V${y}Z`;
  const o = shape(d, ink);
  o[ink] += `<path d="M${x - w / 2 + 6} ${y - h * 0.45} H${x + w / 2 - 6}" stroke="${W}" stroke-width="4" stroke-dasharray="10 8"/>`;
  return rot ? tf(o, `rotate(${rot} ${x} ${y - h / 2})`) : o;
}
// barra de pan: negra, 3 cortes en reserva. (x,y) = centro; len = largo; rot en grados
function baguette(x, y, len = 150, th = 30, rot = -30) {
  const d = `M${-len / 2} 0 C${-len / 2} ${-th * 0.7} ${-len / 2 + th * 0.6} ${-th / 2} ${-len / 2 + th} ${-th / 2} H${len / 2 - th} C${len / 2 - th * 0.4} ${-th / 2} ${len / 2} ${-th * 0.6} ${len / 2} 0 C${len / 2} ${th * 0.6} ${len / 2 - th * 0.4} ${th / 2} ${len / 2 - th} ${th / 2} H${-len / 2 + th} C${-len / 2 + th * 0.6} ${th / 2} ${-len / 2} ${th * 0.7} ${-len / 2} 0Z`;
  const o = shape(d, 'black');
  for (const k of [-0.25, 0, 0.25]) o.black += `<path d="M${f(len * k - 12)} ${f(th * 0.2)} L${f(len * k + 12)} ${f(-th * 0.25)}" stroke="${W}" stroke-width="5" stroke-linecap="round"/>`;
  return tf(o, `translate(${x} ${y}) rotate(${rot})`);
}

// ---------------------------------------------------------------- carrito (vista lateral)
// Origen = asa (donde van las manos). Va hacia +x. Alto asa→suelo = 142 u; cesta de 280 u.
// carga: lista de funciones (cx, cy) => capas, en coordenadas locales del carrito (antes de la escala).
const CART = { top: 6, bot: 108, x0: 34, x1: 314, bx0: 56, bx1: 296, ground: 142 };
function carrito({ x, y, s = 1, flip = false, carga = [], rider = null }) {
  const o = L();
  const C = CART;
  // carga (detrás de los alambres delanteros)
  for (const it of carga) add(o, it);
  if (rider) add(o, rider);
  // cesta: alambre negro de 5 px (en unidades locales ~ 5/s)
  const w = 5;
  let b = '';
  const basket = `M${C.x0} ${C.top} L${C.x1} ${C.top} L${C.bx1} ${C.bot} L${C.bx0} ${C.bot}Z`;
  b += `<path d="${basket}" fill="none" stroke="${INK.black}" stroke-width="${w}" stroke-linejoin="round"/>`;
  for (let xx = C.x0 + 22; xx < C.x1 - 6; xx += 22) {
    const t = (xx - C.x0) / (C.x1 - C.x0), xb = C.bx0 + t * (C.bx1 - C.bx0);
    b += `<path d="M${f(xx)} ${C.top} L${f(xb)} ${C.bot}" stroke="${INK.black}" stroke-width="2.6"/>`;
  }
  b += `<path d="M${C.x0 + 8} ${(C.top + C.bot) / 2} L${C.x1 - 8} ${(C.top + C.bot) / 2}" stroke="${INK.black}" stroke-width="2.6"/>`;
  // asa y barra al bastidor
  b += `<path d="M-6 0 L10 0 L${C.x0} ${C.top + 6}" fill="none" stroke="${INK.black}" stroke-width="${w + 1}" stroke-linecap="round" stroke-linejoin="round"/>`;
  b += `<path d="M${C.bx0 - 10} ${C.bot + 14} L${C.bx1 + 6} ${C.bot + 14} M${C.bx0} ${C.bot} L${C.bx0 - 10} ${C.bot + 14} M${C.bx1} ${C.bot} L${C.bx1 + 6} ${C.bot + 14}" stroke="${INK.black}" stroke-width="${w}" stroke-linecap="round"/>`;
  for (const wx of [C.bx0 + 6, C.bx1 - 10]) b += `<circle cx="${wx}" cy="${C.ground - 14}" r="14" fill="${INK.black}"/><circle cx="${wx}" cy="${C.ground - 14}" r="4.5" fill="${W}"/>`;
  o.black += b;
  return tf(o, `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`);
}
// cargas predefinidas (coordenadas locales del carrito; y = fondo de la cesta ~104)
function cargaLlena({ withRider = false } = {}) {
  const items = [];
  const B = 104;
  items.push(caja(80, B, 64, 96, 'black'), brick(130, B, 44, 104, 'red'), caja(186, B, 72, 84, 'red'), lata(236, B, 40, 60, 'black'), caja(278, B, 54, 80, 'black'));
  items.push(bolsaSnack(96, 16, 64, 84, 'red', -8), huevera(178, 22, 100, 28, 'black', 4), botella(250, 24, 36, 104, 'red', 6));
  if (!withRider) items.push(caja(150, -54, 70, 70, 'black', -6), bolsaSnack(226, -64, 58, 72, 'red', 10), lata(110, -70, 38, 52, 'red', -12));
  else items.push(caja(66, -46, 58, 60, 'black', -8), bolsaSnack(118, -60, 52, 64, 'red', -14), lata(62, -104, 36, 46, 'red', 6), brick(296, -40, 38, 78, 'black', 10));
  return items;
}
function cargaMedia(extraFalling = true) {
  const B = 104;
  const it = [caja(92, B, 64, 70, 'black'), bolsaSnack(160, B, 60, 74, 'red', -6), brick(222, B, 42, 88, 'black'), lata(270, B, 40, 52, 'red')];
  return it;
}

// ---------------------------------------------------------------- pose helpers de Chispa (limbs sobre poses de la librería)
// Todas parten de los enchufes SOCK; solo se dan codo/rodilla y mano/pie.
const CH_POSES = {
  // empuja: brazo delantero al asa (≈ 186, −20), el otro balancea hacia atrás; zancada
  // (el brazo lejano pasa por detrás del cuerpo: Chispa reserva su silueta en la plancha negra)
  empuja: { pose: 'stand', limbs: { armR: [[150, 6], [186, -20]], armL: [[20, 56], [172, -8]], legL: [[-64, 92], [-96, 116]], legR: [[58, 90], [66, 122]] }, hand: [186, -20] },
  // empujaLenta: paso corto, sin prisa
  empujaLenta: { pose: 'stand', limbs: { armR: [[150, 6], [186, -20]], armL: [[20, 56], [172, -8]], legL: [[-50, 94], [-58, 122]], legR: [[46, 94], [42, 122]] }, hand: [186, -20] },
  // alcanza: un brazo estirado hacia delante y un poco abajo, el otro en jarras
  alcanza: { pose: 'hips', limbs: { armR: [[156, 40], [214, 52]] }, hand: [214, 52] },
  // zombi: los dos brazos en horizontal hacia delante (el trasero por debajo del cuerpo no se ve: va por encima de la base)
  zombi: { pose: 'tiesa', limbs: { armR: [[160, 22], [206, 20]], armL: [[20, 40], [186, 30]] } },
  // abraza: brazo doblado que sujeta una caja contra el costado
  abraza: { pose: 'happy', limbs: { armR: [[150, 76], [186, 18]] }, hand: [186, 18] },
  // pica: brazo estirado bajo y hacia el lado, disimulando
  pica: { pose: 'stand', limbs: { armR: [[138, 64], [160, 60]] }, hand: [160, 60] },
  // trofeo: brazos arriba (cheer); la mano derecha sostiene el pan
  trofeo: { pose: 'cheer', limbs: { armR: [[146, -10], [176, -76]] }, hand: [176, -76] },
};
function chispaP(name, opts) {
  const P = CH_POSES[name];
  return chispa({ knockFor: ['black'], ...opts, pose: P.pose, limbs: { ...(P.limbs || {}), ...(opts.limbs || {}) } });
}

// ---------------------------------------------------------------- Pausa con objeto en el muñón delantero levantado
// muñón delantero levantado (cápsula separada del cuerpo) + el otro muñón con la taza a la altura del vientre
const PA_ARMS = {
  up: { arm: [196, -14, 222, -74], hand: [224, -92] },        // en alto (banderín)
  side: { arm: [188, 10, 246, -18], hand: [262, -26] },       // hacia delante, a media altura (lista, lupa)
};
const PA_HAND = PA_ARMS.up.hand;
function pausaProp({ x, y, s, flip = false, expr = 'neutral', look, prop, raise = 'up', knockFor }) {
  const P = { x, y, s, flip };
  const A = PA_ARMS[raise];
  const o = pausa({ ...P, expr, look, pose: 'sit', arms: [[-150, 70, -190, 84], A.arm], mug: [-222, 70], knockFor });
  const hd = G(P, ...A.hand);
  if (prop) add(o, prop(hd[0], hd[1], flip ? -1 : 1, s));
  return o;
}
// banderín de guía: asta negra + triángulo azul. dir = hacia dónde apunta el banderín
function banderin(hx, hy, dir = 1, s = 1) {
  const o = L();
  const top = [hx + dir * 10 * s, hy - 120 * s];
  o.black += `<path d="M${f(hx)} ${f(hy + 24 * s)} L${f(top[0])} ${f(top[1])}" stroke="${INK.black}" stroke-width="${4 / Math.max(0.5, s) * s * 1.6}" stroke-linecap="round"/>`;
  o.blue += `<path d="M${f(top[0])} ${f(top[1] + 2)} L${f(top[0] + dir * 74 * s)} ${f(top[1] + 22 * s)} L${f(top[0])} ${f(top[1] + 44 * s)}Z" fill="${INK.blue}"/>`;
  return o;
}
function lupa(hx, hy, dir = 1, s = 1) {
  const o = L();
  const cx = hx + dir * 46 * s, cy = hy - 40 * s, r = 34 * s;
  o.black += `<path d="M${f(hx)} ${f(hy + 8 * s)} L${f(cx - dir * r * 0.7)} ${f(cy + r * 0.7)}" stroke="${INK.black}" stroke-width="${12 * s}" stroke-linecap="round"/>`;
  o.black += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${INK.black}" stroke-width="${10 * s}"/>`;
  o.blue += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${W}"/>`;
  o.red += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${W}"/>`;
  o.black += `<path d="M${f(cx - r * 0.5)} ${f(cy - r * 0.15)} Q${f(cx - r * 0.45)} ${f(cy - r * 0.5)} ${f(cx - r * 0.1)} ${f(cy - r * 0.55)}" fill="none" stroke="${INK.black}" stroke-width="${4 * s}" stroke-linecap="round" opacity="0.6"/>`;
  return o;
}

// ---------------------------------------------------------------- lista de la compra (hoja arrancada) y lista mini
// Hoja en reserva, borde superior arrancado irregular, sombra en trama, margen rojo, renglones azules, casillas a mano.
function rand(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
function sheetPath(x0, y0, x1, y1, seed = 7) {
  const rnd = rand(seed);
  let d = `M${x0} ${y1} V${y0 + 10}`;
  let x = x0; const n = 18;
  while (x < x1) {
    const step = (x1 - x0) / n * (0.6 + rnd() * 0.8);
    const xm = Math.min(x1, x + step / 2), xe = Math.min(x1, x + step);
    const big = rnd() < 0.18;
    d += ` L${f(xm)} ${f(y0 + (big ? -6 : 0) + rnd() * 4)} L${f(xe)} ${f(y0 + 6 + rnd() * (big ? 16 : 8))}`;
    x = xe;
  }
  return d + ` V${y1}Z`;
}
function listaCompra({ x0 = 104, y0 = 160, x1 = 912, y1 = 1196, rot = -1.5, mini = false, seed = 11, first = null, gap: gapIn = null } = {}) {
  const o = L();
  const d = sheetPath(x0, y0, x1, y1, seed);
  const sid = uid('sh');
  o.defs += `<clipPath id="${sid}"><path d="${d}" transform="translate(${mini ? 3 : 8} ${mini ? 4 : 10})"/></clipPath>`;
  o.black += halftone({ x0: x0, y0: y0, x1: x1 + 12, y1: y1 + 12, step: mini ? 3 : 6, rmax: mini ? 0.8 : 1.9, color: INK.black, clip: sid, fn: () => 1 });
  for (const k of ['black', 'red', 'blue']) o[k] += `<path d="${d}" fill="${W}"/>`;
  o.black += `<path d="${d}" fill="none" stroke="${INK.black}" stroke-width="${mini ? 1.2 : 2.5}" stroke-linejoin="round" opacity="0.85"/>`;
  // pautado: margen rojo y renglones azules
  const mx = x0 + (x1 - x0) * (110 / 808);
  const gap = gapIn || (y1 - y0) * (108 / 1036);
  o.red += `<path d="M${f(mx)} ${y0 + 14} V${y1}" stroke="${INK.red}" stroke-width="${mini ? 1 : 3}"/>`;
  for (let yy = first || y0 + gap * 1.9; yy < y1 - 10; yy += gap) o.blue += `<path d="M${x0} ${f(yy)} H${x1}" stroke="${INK.blue}" stroke-width="${mini ? 0.8 : 2}"/>`;
  if (mini) { // renglones de texto como rayas
    for (let i = 0; i < 6; i++) { const yy = y0 + gap * (2.9 + i) - gap * 0.25; o.black += `<path d="M${f(mx + 4)} ${f(yy)} h${f((x1 - mx) * (0.4 + 0.3 * ((i * 7) % 5) / 5))}" stroke="${INK.black}" stroke-width="2.2" stroke-linecap="round"/>`; }
    o.black += `<path d="M${f(mx + 4)} ${f(y0 + gap * 1.3)} h${f((x1 - mx) * 0.7)}" stroke="${INK.black}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  const c = [(x0 + x1) / 2, (y0 + y1) / 2];
  return tf(o, `rotate(${rot} ${c[0]} ${c[1]})`);
}
function listaMini(hx, hy, dir = 1, s = 1) { // la misma hoja, en pequeño, sujeta por la mano
  const w = 92 * s, h = 120 * s;
  return listaCompra({ x0: hx - w / 2 + dir * 10 * s, y0: hy - h + 6 * s, x1: hx + w / 2 + dir * 10 * s, y1: hy + 6 * s, rot: dir * 6, mini: true, seed: 5 });
}
function casilla(x, y, size = 40, rot = 0) {
  return `<rect x="${x}" y="${y - size}" width="${size}" height="${size}" rx="4" fill="none" stroke="${INK.black}" stroke-width="4" transform="rotate(${rot} ${x + size / 2} ${y - size / 2})"/>`;
}

// ---------------------------------------------------------------- insignia de parada
function stopBadge(x, y, n, { r = 30, size = null } = {}) {
  const o = L();
  const fs = size || r * 1.2;
  o.blue += `<circle cx="${f(x)}" cy="${f(y)}" r="${r + 4}" fill="${W}"/>`;
  o.red += `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${INK.red}"/>`;
  o.red += text(f(x), f(y + fs * 0.36), String(n), { size: fs, fill: W, anchor: 'middle', stretch: '100%' });
  return o;
}

// ---------------------------------------------------------------- plano del súper
const STORE = {
  w: 888, h: 610,
  gond: [[84, 134], [264, 314], [444, 494], [624, 674]], gondY: [150, 440],
  fondo: [600, 860, 8, 44],
  cajas: [[20, 100, 160, 240], [20, 100, 520, 600]],
  route: [[774, 610], [774, 95], [559, 95], [559, 480], [379, 480], [379, 95], [199, 95], [199, 480], [130, 480], [130, 610]],
  stops: [[774, 520], [680, 95], [559, 270], [469, 480], [379, 290], [199, 290], [130, 560]],
};
// ruta como polilínea densa con esquinas redondeadas (r 24)
function routeDense(r = 24) {
  const P = STORE.route, out = [P[0]];
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], b = P[i], c = P[i + 1];
    const d1 = Math.hypot(b[0] - a[0], b[1] - a[1]), d2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const p1 = [b[0] + ((a[0] - b[0]) / d1) * r, b[1] + ((a[1] - b[1]) / d1) * r];
    const p2 = [b[0] + ((c[0] - b[0]) / d2) * r, b[1] + ((c[1] - b[1]) / d2) * r];
    for (let t = 0; t <= 1.0001; t += 0.125) {
      const u = 1 - t;
      out.push([u * u * p1[0] + 2 * u * t * b[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * b[1] + t * t * p2[1]]);
    }
  }
  out.push(P[P.length - 1]);
  // densificar
  const dense = [out[0]];
  for (let i = 1; i < out.length; i++) {
    const a = out[i - 1], b = out[i], L0 = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L0 / 6));
    for (let k = 1; k <= n; k++) dense.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return dense;
}
function nearestIdx(pts, p) { let bi = 0, bd = 1e9; pts.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; bi = i; } }); return bi; }
const ptsPath = (pts, X, Y) => 'M' + pts.map((p) => `${f(X(p[0]))} ${f(Y(p[1]))}`).join(' L');

// pictogramas del mapa (tinta negra, ≈ 40 px, trazo 6), centro (cx, cy) en coords globales
function picto(n, cx, cy, k = 1) {
  const g = (s) => `<g transform="translate(${f(cx)} ${f(cy)}) scale(${k})">${s}</g>`;
  const B = INK.black;
  switch (n) {
    case 1: return g(`<ellipse cx="-12" cy="12" rx="8" ry="6" fill="${B}" transform="rotate(-20 -12 12)"/><ellipse cx="12" cy="8" rx="8" ry="6" fill="${B}" transform="rotate(-20 12 8)"/><path d="M-5 11 V-16 L19 -20 V7" fill="none" stroke="${B}" stroke-width="5" stroke-linejoin="round"/><path d="M-5 -10 L19 -14" stroke="${B}" stroke-width="6"/>`);
    case 2: return g(`<g transform="rotate(-25)"><rect x="-24" y="-8" width="48" height="16" rx="8" fill="${B}"/><path d="M-12 4 L-6 -4 M0 4 L6 -4 M12 4 L18 -4" stroke="${W}" stroke-width="3" stroke-linecap="round"/></g>`);
    case 3: return g(`<path d="M-22 0 Q0 -20 22 0 Q0 20 -22 0Z" fill="none" stroke="${B}" stroke-width="5" stroke-linejoin="round"/><circle r="7" fill="${B}"/>`);
    case 4: { let d = ''; for (let i = 0; i < 24; i++) { const a = (i * Math.PI) / 12, rr = i % 2 ? 12 : 22; d += (i ? 'L' : 'M') + f(rr * Math.cos(a)) + ' ' + f(rr * Math.sin(a)); } return g(`<path d="${d}Z" fill="${B}"/>`); }
    case 5: return g(`<rect x="-20" y="-18" width="16" height="36" rx="3" fill="${B}"/><rect x="4" y="-18" width="16" height="36" rx="3" fill="${B}"/><path d="M-20 -2 h16 M4 -2 h16" stroke="${W}" stroke-width="4"/>`);
    case 6: return g(`<rect x="-17" y="-20" width="34" height="40" fill="none" stroke="${B}" stroke-width="5"/><rect x="-14" y="2" width="28" height="15" fill="${B}"/><path d="M-14 0 H14" stroke="${B}" stroke-width="3" stroke-dasharray="4 3"/>`);
    case 7: return g(`<rect x="-22" y="4" width="44" height="12" fill="${B}"/><path d="M-16 10 h6 M-4 10 h6 M8 10 h6" stroke="${W}" stroke-width="3"/><rect x="-16" y="-14" width="12" height="16" fill="${B}"/><rect x="2" y="-10" width="14" height="12" fill="${B}"/>`);
  }
  return '';
}
const PICTO_AT = [[722, 540], [727, 168], [598, 336], [469, 548], [413, 352], [233, 352], [177, 560]];

function storeMap({ x, y, s, mode = 'full', current = 0 }) {
  const o = L();
  const X = (lx) => x + lx * s, Y = (ly) => y + ly * s;
  const full = mode === 'full';
  const ww = full ? 6 : 3;
  // paredes con huecos de entrada (724–824) y salida (105–155)
  const wall = `M${X(155)} ${Y(610)} L${X(724)} ${Y(610)} M${X(824)} ${Y(610)} L${X(872)} ${Y(610)} Q${X(888)} ${Y(610)} ${X(888)} ${Y(594)} L${X(888)} ${Y(16)} Q${X(888)} ${Y(0)} ${X(872)} ${Y(0)} L${X(16)} ${Y(0)} Q${X(0)} ${Y(0)} ${X(0)} ${Y(16)} L${X(0)} ${Y(594)} Q${X(0)} ${Y(610)} ${X(16)} ${Y(610)} L${X(105)} ${Y(610)}`;
  o.black += `<path d="${wall}" fill="none" stroke="${INK.black}" stroke-width="${ww}" stroke-linecap="round"/>`;
  // mostrador del fondo
  const [fx0, fx1, fy0, fy1] = STORE.fondo;
  o.black += `<rect x="${f(X(fx0))}" y="${f(Y(fy0))}" width="${f((fx1 - fx0) * s)}" height="${f((fy1 - fy0) * s)}" fill="${INK.black}"/>`;
  if (full) o.black += text(f(X((fx0 + fx1) / 2) + 1.3), f(Y((fy0 + fy1) / 2) + 8), 'FONDO', { size: 22, font: FONT_MONO, weight: 500, fill: W, anchor: 'middle', ls: 0.12, stretch: '100%' });
  // góndolas
  STORE.gond.forEach(([gx0, gx1], i) => {
    o.black += `<rect x="${f(X(gx0))}" y="${f(Y(STORE.gondY[0]))}" width="${f((gx1 - gx0) * s)}" height="${f((STORE.gondY[1] - STORE.gondY[0]) * s)}" fill="${INK.black}"/>`;
    if (full && i === 1) { const cx = X((gx0 + gx1) / 2) + 8, cy = Y((STORE.gondY[0] + STORE.gondY[1]) / 2); o.black += text(f(cx), f(cy), 'ESTANTES', { size: 22, font: FONT_MONO, weight: 500, fill: W, anchor: 'middle', ls: 0.12, stretch: '100%', rot: -90 }); }
  });
  // cajas
  for (const [cx0, cx1, cy0, cy1] of STORE.cajas) {
    o.black += `<rect x="${f(X(cx0))}" y="${f(Y(cy0))}" width="${f((cx1 - cx0) * s)}" height="${f((cy1 - cy0) * s)}" fill="${INK.black}"/>`;
    for (let k = 1; k <= 3; k++) { const yy = Y(cy0 + ((cy1 - cy0) * k) / 4); o.black += `<path d="M${f(X(cx0 + 10))} ${f(yy)} H${f(X(cx1 - 10))}" stroke="${W}" stroke-width="${full ? 4 : 1.6}"/>`; }
  }
  if (full) {
    o.black += text(f(X(774)), f(Y(610) + 34), 'ENTRADA', { size: 22, font: FONT_MONO, weight: 500, anchor: 'middle', ls: 0.12, stretch: '100%' });
    o.black += text(f(X(60)), f(Y(610) + 34), 'CAJA', { size: 22, font: FONT_MONO, weight: 500, anchor: 'middle', ls: 0.12, stretch: '100%' });
  }
  // ruta (azul)
  const dense = routeDense();
  if (full) {
    o.blue += `<path d="${ptsPath(dense, X, Y)}" fill="none" stroke="${INK.blue}" stroke-width="7" stroke-dasharray="18 14" stroke-linecap="round" stroke-linejoin="round"/>`;
    // chevrons de sentido cada ~220 px de recorrido
    let acc = 0;
    for (let i = 1; i < dense.length - 1; i++) {
      acc += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
      if (acc >= 220) {
        acc = 0;
        const a = dense[i - 1], b = dense[i + 1], ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        if (STORE.stops.some((p) => Math.hypot(p[0] - dense[i][0], p[1] - dense[i][1]) < 60)) { acc = 180; continue; }
        o.blue += `<path d="M-7 -9 L4 0 L-7 9" transform="translate(${f(X(dense[i][0]))} ${f(Y(dense[i][1]))}) rotate(${f(ang)})" fill="none" stroke="${INK.blue}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    }
    STORE.stops.forEach((p, i) => { add(o, stopBadge(X(p[0]), Y(p[1]), i + 1, { r: 30 })); o.black += picto(i + 1, X(PICTO_AT[i][0]), Y(PICTO_AT[i][1]), s); });
  } else {
    const cut = current ? nearestIdx(dense, STORE.stops[current - 1]) : 0;
    const done = dense.slice(0, cut + 1), todo = dense.slice(cut);
    if (done.length > 1) o.blue += `<path d="${ptsPath(done, X, Y)}" fill="none" stroke="${INK.blue}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (todo.length > 1) o.blue += `<path d="${ptsPath(todo, X, Y)}" fill="none" stroke="${INK.blue}" stroke-width="3" stroke-dasharray="6 6" stroke-linejoin="round"/>`;
    STORE.stops.forEach((p, i) => {
      const n = i + 1, gx = X(p[0]), gy = Y(p[1]);
      if (n === current) add(o, stopBadge(gx, gy, n, { r: 14, size: 18 }));
      else if (n < current) { o.blue += `<circle cx="${f(gx)}" cy="${f(gy)}" r="7" fill="${W}"/>`; o.black += `<circle cx="${f(gx)}" cy="${f(gy)}" r="5" fill="${INK.black}"/>`; }
      else { o.blue += `<circle cx="${f(gx)}" cy="${f(gy)}" r="6" fill="${W}"/>`; o.black += `<circle cx="${f(gx)}" cy="${f(gy)}" r="5" fill="${W}" stroke="${INK.black}" stroke-width="2"/>`; }
    });
  }
  return o;
}

// ---------------------------------------------------------------- plantilla de paradas
function stopHeader(n, rotulo) {
  const o = L();
  add(o, stopBadge(100, 200, n, { r: 34, size: 42 }));
  o.black += text(150, 210, rotulo, { size: 26, font: FONT_MONO, weight: 500, ls: 0.1, stretch: '100%' });
  add(o, storeMap({ x: 836, y: 140, s: 0.2027, mode: 'mini', current: n }));
  return o;
}
// Rincón de Pausa: Pausa (866, 1046) s 0,7 flip; disco + «Pausa:» + frase azul anclada en y 920
async function pausaCorner(M, { expr = 'neutral', look, pose = 'sit', prop = null, raise = 'side', quote, size = 44, extra = null, anchor = 920 }) {
  const o = L();
  const P = { x: 866, y: 1046, s: 0.7, flip: true };
  o.black += shadowEllipse(P.x + 4, 1136, 150, 10, INK.black, 7, 2.4);
  if (pose === 'sit') add(o, pausa({ ...P, expr, look, pose: 'sit' }));
  else add(o, pausaProp({ ...P, expr, look, prop, raise }));
  if (extra) extra(o, P);
  let sz = size, lines = await M.wrap([{ t: quote, st: 'head', ink: 'blue' }], 376, sz);
  if (lines.length > 4) { sz = 40; lines = await M.wrap([{ t: quote, st: 'head', ink: 'blue' }], 376, sz); }
  const lh = sz * 1.05, yLast = anchor, yFirst = yLast - (lines.length - 1) * lh;
  add(o, richText({ x: 640, y: yFirst, lines, size: sz, lh: 1.05, ls: -0.005 }));
  const yP = yFirst - sz * 1.05 - 6;
  o.blue += `<circle cx="652" cy="${f(yP - 12)}" r="12" fill="${INK.blue}"/>`;
  add(o, richText({ x: 674, y: yP, lines: [[{ t: 'Pausa:', st: 'head', ink: 'blue' }]], size: 36 }));
  return { layers: o, top: yP - 36 };
}
// línea de fuente: DM Mono 500 24 px, negro; tramos en cursiva (st: 'monoI'); base 1216 (y 1186 si hay dos)
function sourceLine(lines) {
  const ys = lines.length === 2 ? 1186 : 1216;
  return richText({ x: 64, y: ys, lines: lines.map((ln) => ln.map((sp) => ({ ...sp, st: sp.st || 'mono', size: 24 }))), size: 24, lh: 1.25 });
}

// ---------------------------------------------------------------- atrezo de escenas
function altavoz(x, y, s = 1, hangTop = null) {
  const o = L();
  if (hangTop !== null) o.black += `<path d="M${x - 30 * s} ${hangTop} V${y - 46 * s} M${x + 30 * s} ${hangTop} V${y - 46 * s}" stroke="${INK.black}" stroke-width="3.5"/>`;
  o.black += `<rect x="${x - 44 * s}" y="${y - 50 * s}" width="${88 * s}" height="${120 * s}" rx="${10 * s}" fill="${INK.black}"/>`;
  o.black += `<circle cx="${x}" cy="${y - 16 * s}" r="${16 * s}" fill="${W}"/><circle cx="${x}" cy="${y - 16 * s}" r="${6 * s}" fill="${INK.black}"/>`;
  o.black += `<circle cx="${x}" cy="${y + 34 * s}" r="${24 * s}" fill="${W}"/><circle cx="${x}" cy="${y + 34 * s}" r="${10 * s}" fill="${INK.black}"/>`;
  return o;
}
function nota(x, y, s = 1, rot = 0, doble = false) { // corchea en trazo
  const B = INK.black;
  let g = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`;
  g += `<ellipse cx="0" cy="0" rx="11" ry="8" fill="${B}" transform="rotate(-22)"/><path d="M9 -3 V-46" stroke="${B}" stroke-width="5" stroke-linecap="round"/>`;
  if (doble) g += `<ellipse cx="34" cy="-6" rx="11" ry="8" fill="${B}" transform="rotate(-22 34 -6)"/><path d="M43 -9 V-52 M9 -44 L43 -50" stroke="${B}" stroke-width="5" stroke-linecap="round"/><path d="M9 -34 L43 -40" stroke="${B}" stroke-width="5"/>`;
  else g += `<path d="M9 -46 C22 -40 30 -30 24 -16" fill="none" stroke="${B}" stroke-width="5" stroke-linecap="round"/>`;
  return g + '</g>';
}
function mostradorPan(x0, yFloor) { // mostrador bajo con cesta y 3 barras
  const o = L();
  o.black += `<rect x="${x0}" y="${yFloor - 70}" width="110" height="70" fill="${INK.black}"/><rect x="${x0 + 8}" y="${yFloor - 50}" width="94" height="6" fill="${W}"/>`;
  add(o, baguette(x0 + 40, yFloor - 104, 92, 20, -72));
  add(o, baguette(x0 + 58, yFloor - 102, 96, 20, -86));
  add(o, baguette(x0 + 76, yFloor - 100, 90, 20, 74));
  o.black += `<path d="M${x0 + 14} ${yFloor - 92} L${x0 + 96} ${yFloor - 92} L${x0 + 88} ${yFloor - 70} L${x0 + 22} ${yFloor - 70}Z" fill="${INK.black}"/>`;
  o.black += `<path d="M${x0 + 26} ${yFloor - 84} h58 M${x0 + 28} ${yFloor - 77} h54" stroke="${W}" stroke-width="2.5"/>`;
  return o;
}
function balda(x0, x1, y, th = 6) { return `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${th}" fill="${INK.black}"/>`; }
function etiquetaMuda(cx, y) { // etiqueta de precio negra con dos rayas en reserva, sin cifras
  return `<rect x="${cx - 30}" y="${y}" width="60" height="30" rx="3" fill="${INK.black}"/><path d="M${cx - 20} ${y + 10} h40 M${cx - 20} ${y + 20} h26" stroke="${W}" stroke-width="3.5" stroke-linecap="round"/>`;
}
function cartelEstallido(cx, cy, r = 120, label = 'OFERTA', seed = 3) {
  const rnd = rand(seed);
  let d = '';
  const n = 15;
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2, rr = i % 2 ? r * (0.68 + rnd() * 0.08) : r * (0.92 + rnd() * 0.12);
    d += (i ? 'L' : 'M') + f(cx + rr * Math.cos(a)) + ' ' + f(cy + rr * Math.sin(a) * 0.9);
  }
  const o = shape(d + 'Z', 'red');
  o.red += text(cx, cy + r * 0.13, label, { size: r * 0.42, fill: W, anchor: 'middle', ls: 0.01, rot: -8 });
  return o;
}
// caja con corte de rayos X: ventana en reserva y relleno en trama negra hasta «nivel» (0–1)
function envaseCorte(x, y, w = 110, h = 150, nivel = 1) {
  const o = shape(`M${x - w / 2} ${y - h} h${w} v${h} h${-w}Z`, 'red');
  o.red += `<rect x="${x - w / 2}" y="${y - h + 14}" width="${w}" height="16" fill="${W}"/>`;
  const wx0 = x - w / 2 + 14, wx1 = x + w / 2 - 14, wy0 = y - h + 42, wy1 = y - 14;
  o.red += `<rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}" fill="${W}"/>`;
  const lv = wy1 - (wy1 - wy0) * nivel;
  const cid = uid('ec');
  o.defs += `<clipPath id="${cid}"><rect x="${wx0}" y="${f(lv)}" width="${wx1 - wx0}" height="${f(wy1 - lv)}"/></clipPath>`;
  o.black += halftone({ x0: wx0, y0: lv, x1: wx1, y1: wy1, step: 6, rmax: 2.3, color: INK.black, clip: cid, fn: () => 1 });
  if (nivel < 1) o.black += `<path d="M${wx0 - 6} ${f(lv)} H${wx1 + 6}" stroke="${INK.black}" stroke-width="3" stroke-dasharray="6 5"/>`;
  // etiqueta de peso diminuta, sin cifras
  o.black += `<rect x="${x + w / 2 - 34}" y="${y - 12}" width="26" height="9" fill="${INK.black}"/>`;
  o.red += `<rect x="${x + w / 2 - 38}" y="${y - 14}" width="34" height="13" fill="${W}"/>`;
  return o;
}
function mostradorCaja(x0, x1, y0, yFloor) {
  const o = L();
  o.black += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${yFloor - y0}" fill="${INK.black}"/>`;
  for (let xx = x0 + 14; xx < x1 - 10; xx += 24) o.black += `<path d="M${xx} ${y0 + 8} v14" stroke="${W}" stroke-width="5"/>`;
  o.black += `<rect x="${x0}" y="${y0 + 30}" width="${x1 - x0}" height="5" fill="${W}"/>`;
  add(o, caja(x0 + 70, y0, 54, 58, 'red'));
  add(o, lata(x0 + 150, y0, 40, 46, 'black'));
  return o;
}
function expositorSnacks(x0, x1, yTop, yFloor) {
  const o = L();
  const cx = (x0 + x1) / 2;
  o.black += `<rect x="${cx - 4}" y="${yTop}" width="8" height="${yFloor - yTop}" fill="${INK.black}"/><rect x="${x0 - 6}" y="${yFloor - 8}" width="${x1 - x0 + 12}" height="8" fill="${INK.black}"/>`;
  const rows = 4, gap = (yFloor - 20 - yTop) / rows;
  for (let i = 0; i < rows; i++) {
    const yy = yTop + 10 + i * gap;
    o.black += `<path d="M${x0} ${yy} H${x1}" stroke="${INK.black}" stroke-width="4"/>`;
    if (i % 2 === 0) { add(o, bolsaSnack(x0 + 20, yy + gap - 8, 34, gap - 16, 'red')); add(o, bolsaSnack(x1 - 20, yy + gap - 8, 34, gap - 16, 'red')); }
    else { o.black += `<rect x="${x0 + 4}" y="${yy + 8}" width="30" height="${gap - 20}" fill="${INK.black}"/><rect x="${x1 - 34}" y="${yy + 8}" width="30" height="${gap - 20}" fill="${INK.black}"/><path d="M${x0 + 4} ${yy + gap / 2} h30 M${x1 - 34} ${yy + gap / 2} h30" stroke="${W}" stroke-width="3"/>`; }
  }
  return o;
}
function correaTensa(p0, p1) {
  let b = strokeP(`M${f(p0[0])} ${f(p0[1])} L${f(p1[0])} ${f(p1[1])}`, INK.black, 3.5, 'stroke-linecap="round"');
  b += `<g transform="translate(${f(p1[0])} ${f(p1[1])}) rotate(-10)" fill="none" stroke="${INK.black}" stroke-width="3.5" stroke-linecap="round"><path d="M0 0 C-12 -16 -22 -4 0 0 C12 -16 22 -4 0 0"/></g>`;
  b += `<path d="M${f(p1[0] + 18)} ${f(p1[1] - 26)} l10 -8 M${f(p1[0] + 26)} ${f(p1[1] - 14)} l12 -4" stroke="${INK.black}" stroke-width="4" stroke-linecap="round"/>`;
  return b;
}
function chincheta(x, y, s = 1) {
  const o = L();
  o.black += `<path d="M${x} ${y + 4 * s} L${x - 14 * s} ${y + 22 * s}" stroke="${INK.black}" stroke-width="${4 * s}" stroke-linecap="round" transform="rotate(0)"/>`;
  o.red += `<g transform="translate(${x} ${y}) rotate(35) scale(${s})"><rect x="-10" y="-22" width="20" height="8" rx="3" fill="${INK.red}"/><path d="M-6 -15 H6 L8 -2 H-8Z" fill="${INK.red}"/><rect x="-14" y="-3" width="28" height="7" rx="3" fill="${INK.red}"/></g>`;
  return o;
}
function avionPapel(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 -2 L22 -18 L8 18 L0 4Z" fill="${INK.black}"/><path d="M0 4 L22 -18" stroke="${W}" stroke-width="3"/></g>`;
}

module.exports = {
  PA_ARMS, G, clipLayers, shiftPlate, tf, shape, NB, nb, rand,
  caja, botella, lata, bolsaSnack, brick, huevera, baguette, carrito, CART, cargaLlena, cargaMedia,
  CH_POSES, chispaP, pausaProp, PA_HAND, banderin, lupa, listaCompra, listaMini, casilla, stopBadge, STORE, storeMap, picto,
  stopHeader, pausaCorner, sourceLine, altavoz, nota, mostradorPan, balda, etiquetaMuda, cartelEstallido, envaseCorte,
  mostradorCaja, expositorSnacks, correaTensa, chincheta, avionPapel,
};
