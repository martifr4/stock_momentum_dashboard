// Post 00 · Presentación (fijado) — 9 slides 1080 × 1350 en estilo «Riso».
// Uso: node render.js [n ...]   (sin argumentos: las 9 + overview.png)
// Importa la librería compartida instagram/characters/riso/riso.js. Texto literal de copy.md.
const path = require('path');
const R = require('../../characters/riso/riso.js');
const {
  INK, PAPERS, W, L, add, chispa, pausa, burst, pausaSweat, nodMarks, mug, priceTag, sign, shadowEllipse, liftedShadow,
  text, richText, measurer, pageChrome, fichaCard, CARD, riso, render, strokeP, halftone, smooth, f, FONT_MONO,
} = R;
const OUT = __dirname;
const X0 = 64, CW = 952; // margen y ancho de contenido

// helpers de spans
const b = (t, ink = 'black') => ({ t, st: 'bold', ink });
const r = (t) => ({ t, st: 'body', ink: 'black' });
const h = (t, ink = 'black') => ({ t, st: 'head', ink });
const mono = (t) => ({ t, st: 'mono', ink: 'black' });

// posición global de un punto local de una personaje {x,y,s,rot,lean,flip}
function G(c, lx, ly) {
  const a = ((c.rot || 0) * Math.PI) / 180, Y = ly * c.s, X = lx * c.s * (c.flip ? -1 : 1) + Math.tan(((c.lean || 0) * Math.PI) / 180) * Y;
  return [c.x + X * Math.cos(a) - Y * Math.sin(a), c.y + X * Math.sin(a) + Y * Math.cos(a)];
}
// recorta todas las planchas de un grupo de capas a un rectángulo
function clipLayers(layers, x, y, w, hgt) {
  const id = R.uid('cl');
  const o = L();
  o.defs = (layers.defs || '') + `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${hgt}"/></clipPath>`;
  for (const k of ['black', 'red', 'blue']) if (layers[k]) o[k] = `<g clip-path="url(#${id})">${layers[k]}</g>`;
  return o;
}
// desplaza solo una plancha (desregistro exagerado de Pausa)
function shiftPlate(layers, k, dx, dy) { if (layers[k]) layers[k] = `<g transform="translate(${dx} ${dy})">${layers[k]}</g>`; return layers; }
// correa: del asa de la taza al tobillo, curva suelta
function leash(p0, p1, sag = 80) {
  const mx = (p0[0] + p1[0]) / 2, my = Math.max(p0[1], p1[1]) + sag;
  return strokeP(`M${f(p0[0])} ${f(p0[1])} Q${f(mx)} ${f(my)} ${f(p1[0])} ${f(p1[1])}`, INK.black, 3.5, 'stroke-linecap="round"') +
    `<g transform="translate(${f(p1[0])} ${f(p1[1])}) rotate(-20)" fill="none" stroke="${INK.black}" stroke-width="3.5" stroke-linecap="round"><path d="M0 0 C-12 -16 -22 -4 0 0 C12 -16 22 -4 0 0"/></g>`;
}

// =============================================================== SLIDES
const S = {};

S[1] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 1, ink: 'red' }));
  // titular a todo el ancho, dos líneas
  add(ly, richText({ x: X0 - 4, y: 300, lines: [[h('En tu cabeza')], [h('viven dos.')]], size: 168, lh: 0.94, ls: -0.02 }));
  // la línea del dinero: grande, «tu dinero» en peso fuerte
  add(ly, richText({ x: X0, y: 528, lines: [[r('Y las dos deciden qué haces')], [r('con '), h('tu dinero.')]], size: 66, lh: 1.08, ls: -0.01 }));
  // Pausa al fondo, ni se inmuta
  const P = { x: 820, y: 1086, s: 0.7 };
  ly.black += shadowEllipse(P.x + 8, P.y + 98, 150, 12, INK.black, 7, 2.4);
  add(ly, pausa({ ...P, expr: 'neutral', pose: 'sit', look: [-6, 4] }));
  // Chispa en primer plano, saltando hacia el lector
  const C = { x: 352, y: 922, s: 1.62 };
  ly.black += liftedShadow(C.x + 6, C.y + 127 * C.s + 56, 145, 17);
  add(ly, chispa({ ...C, expr: 'euforia', pose: 'cheer', sweat: 2, look: [1, -1] }));
  ly.black += burst(C.x + 8, C.y - 130 * C.s - 12, 1.2);
  return riso(1080, 1350, { layers: ly, paper: PAPERS.lila });
};

async function fichaRows(M, defs, valueSize) {
  const out = [];
  for (const [label, value] of defs) out.push({ label, lines: await M.wrap(value, 600, valueSize) });
  return out;
}

S[2] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 2, ink: 'red' }));
  add(ly, richText({ x: X0, y: 240, lines: [[h('Esta es '), h('Chispa.', 'red')]], size: 96, ls: -0.01 }));
  const rows = await fichaRows(M, [
    ['Velocidad:', [r('más rápida que tu pulgar.')]],
    ['Trabajo:', [r('decidir sin preguntar.')]],
    ['Le pierde:', [r('«Solo hoy», «Últimas unidades», el botón de «Comprar ya».')]],
  ], 36);
  // figura: Chispa se lanza (sin rotación: solo lean, base horizontal). El pie trasero y las
  // líneas de velocidad rompen el marco izquierdo; la mano delantera, corta y doblada, agarra la etiqueta.
  const fig = L();
  const C = { x: 330, y: 600, s: 1.36, rot: 0, lean: -10 };
  const hand = G(C, 176, -18);
  fig.red += priceTag(hand[0] + 70, hand[1] - 8, 10, '−70 %', 0.42);
  add(fig, chispa({ ...C, expr: 'euforia', pose: 'lunge', sweat: 3, speed: 4, halo: 7,
    limbs: { armR: [[150, 18], [176, -18]] } }));
  const card = fichaCard({ ink: 'red', nombre: 'CHISPA', numero: 'SISTEMA 1 · 01', rows, frase: [h('«¡Ya, ya, ya!»', 'red')], meter: 5, rot: -1.5, figure: fig });
  add(ly, card);
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

S[3] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 3, ink: 'blue' }));
  add(ly, richText({ x: X0, y: 240, lines: [[h('Y esta es '), h('Pausa.', 'blue')]], size: 96, ls: -0.01 }));
  const rows = await fichaRows(M, [
    ['Velocidad:', [r('sin prisa.')]],
    ['Trabajo:', [r('hacer cuentas y leer la letra pequeña.')]],
    ['Le encanta:', [r('comparar precios y consultarlo con la almohada.')]],
    ['Defecto:', [r('llega tarde. Pensar cansa.')]],
  ], 34);
  const fig = L();
  const P = { x: 474, y: 640, s: 1.08 };
  fig.black += shadowEllipse(P.x + 6, P.y + 140, 230, 12, INK.black, 7, 2.6);
  add(fig, pausa({ ...P, expr: 'neutral', pose: 'sit', look: [0, 5], halo: 7 }));
  const card = fichaCard({ ink: 'blue', nombre: 'PAUSA', numero: 'SISTEMA 2 · 02', rows, frase: [h('«Espera… déjame pensarlo.»', 'blue')], meter: 1, rot: 1.5, late: [8, 6], figure: fig, valueSize: 34 });
  add(ly, card);
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// marcas de asentimiento: arcos de movimiento sobre la cúpula (la cabeza sube y baja)
function nodArcs(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${INK.black}" stroke-width="5" stroke-linecap="round">` +
    `<path d="M-40 0 Q-46 -18 -40 -36"/><path d="M-58 4 Q-66 -18 -58 -40"/><path d="M40 0 Q46 -18 40 -36"/><path d="M58 4 Q66 -18 58 -40"/></g>`;
}

S[4] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 4, ink: 'red' }));
  ly.black += text(X0, 196, 'Spoiler:', { size: 30, font: FONT_MONO, weight: 500, stretch: '100%' });
  add(ly, richText({ x: X0, y: 296, lines: [[h('Chispa', 'red'), h(' no es')], [h('la mala.')]], size: 104, lh: 0.96, ls: -0.01 }));
  const p1 = await M.wrap([r('Gracias a ella frenas antes de pensar, esquivas un balón y reconoces una cara en un segundo.')], CW, 40);
  add(ly, richText({ x: X0, y: 466, lines: p1, size: 40, lh: 1.2 }));
  const p2 = await M.wrap([r('Sin Chispa, tardarías media hora en cruzar la calle.')], CW, 40);
  add(ly, richText({ x: X0, y: 600, lines: p2, size: 40, lh: 1.2 }));
  // mismo plano: Chispa ≈ 0,6 × el ancho de Pausa
  const GROUND = 1200;
  const P = { x: 312, y: GROUND - 135 * 1.25, s: 1.25 };
  ly.black += shadowEllipse(P.x + 10, GROUND - 6, 260, 15, INK.black, 8, 3);
  add(ly, pausa({ ...P, expr: 'brindis', pose: 'sit', look: [10, -3] }));
  ly.black += nodArcs(P.x - 6, P.y - 150 * P.s - 14, 1);
  const cs = 0.62 * (380 * P.s) / 235;
  const C = { x: 826, y: GROUND - 127 * cs, s: cs, lean: 8 };
  ly.black += shadowEllipse(C.x - 6, GROUND - 6, 150, 13, INK.black, 7, 2.8);
  add(ly, chispa({ ...C, expr: 'orgullosa', pose: 'hips', sweatIdx: [1] }));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// Ticket larguísimo: tira de papel en reserva plegada en tramos rectos (pliegues de papel, no tubo),
// con renglones cortos de texto ilegible, sombra de semitono, final rasgado en zigzag y el total.
function ticket(pts, w = 92) {
  const o = L();
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b2] = [pts[i], pts[i + 1]];
    let tx = b2[0] - a[0], ty = b2[1] - a[1]; const len = Math.hypot(tx, ty); tx /= len; ty /= len;
    segs.push({ a, b: b2, tx, ty, nx: -ty, ny: tx, len });
  }
  const hw = w / 2;
  const quad = (sg) => [[sg.a[0] + sg.nx * hw, sg.a[1] + sg.ny * hw], [sg.b[0] + sg.nx * hw, sg.b[1] + sg.ny * hw], [sg.b[0] - sg.nx * hw, sg.b[1] - sg.ny * hw], [sg.a[0] - sg.nx * hw, sg.a[1] - sg.ny * hw]];
  let shadow = '', paper = '', ink = '';
  segs.forEach((sg, i) => {
    const last = i === segs.length - 1;
    const q = quad(sg);
    let d = 'M' + q.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L') + 'Z';
    if (last) { // final rasgado en zigzag
      const [p0, p1, p2, p3] = q, n = 8;
      let z = `M${f(p3[0])} ${f(p3[1])} L${f(p0[0])} ${f(p0[1])} L${f(p1[0])} ${f(p1[1])}`;
      for (let k = 1; k <= n; k++) { const t = k / n, bx = p1[0] + (p2[0] - p1[0]) * t, by = p1[1] + (p2[1] - p1[1]) * t, off = k % 2 ? -10 : 0; z += ` L${f(bx + sg.tx * off)} ${f(by + sg.ty * off)}`; }
      d = z + 'Z';
    }
    shadow += `<path d="${d}" transform="translate(8 10)"/>`;
    paper += `<path d="${d}" fill="${W}"/>`;
    if (sg.back) { // reverso del pliegue: trama clara (opcional por tramo)
      const cid = R.uid('tkc'); o.defs += `<clipPath id="${cid}"><path d="${d}"/></clipPath>`;
      ink += halftone({ x0: Math.min(...q.map((p) => p[0])) - 2, y0: Math.min(...q.map((p) => p[1])) - 2, x1: Math.max(...q.map((p) => p[0])) + 2, y1: Math.max(...q.map((p) => p[1])) + 2, step: 6, rmax: 1.4, color: INK.black, clip: cid, fn: () => 1 });
    } else { // renglones: concepto (izq.) + importe (dcha.)
      const nL = Math.floor((sg.len - (last ? 120 : 26)) / 16);
      for (let k = 0; k < nL; k++) {
        const t = 16 + k * 16, cx = sg.a[0] + sg.tx * t, cy = sg.a[1] + sg.ty * t;
        const in1 = hw - 12, l1 = 22 + ((k * 37) % 26), l2 = 12 + ((k * 13) % 8);
        const s1 = [cx + sg.nx * in1, cy + sg.ny * in1], e1 = [s1[0] - sg.nx * l1, s1[1] - sg.ny * l1];
        const s2 = [cx - sg.nx * in1, cy - sg.ny * in1], e2 = [s2[0] + sg.nx * l2, s2[1] + sg.ny * l2];
        ink += `<path d="M${f(s1[0])} ${f(s1[1])} L${f(e1[0])} ${f(e1[1])} M${f(s2[0])} ${f(s2[1])} L${f(e2[0])} ${f(e2[1])}" stroke="${INK.black}" stroke-width="3" stroke-linecap="round"/>`;
      }
    }
  });
  // total, cerca del final, escrito a lo ancho de la tira
  const sg = segs[segs.length - 1];
  const t = sg.len - 62, cx = sg.a[0] + sg.tx * t, cy = sg.a[1] + sg.ty * t;
  const ang = (Math.atan2(sg.ty, sg.tx) * 180) / Math.PI - 90;
  ink += `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(ang)})"><path d="M-38 -30 H38" stroke="${INK.black}" stroke-width="2.5" stroke-dasharray="4 4"/>` +
    text(0, -6, 'TOTAL', { size: 22, font: FONT_MONO, weight: 500, anchor: 'middle', stretch: '100%', ls: 0.08 }) +
    text(0, 22, '189,99 €', { size: 24, font: FONT_MONO, weight: 500, anchor: 'middle', stretch: '100%' }) + '</g>';
  // sombra en semitono bajo la tira
  const shId = R.uid('tsh');
  o.defs += `<clipPath id="${shId}">${shadow}</clipPath>`;
  const all = segs.flatMap((sg2) => [sg2.a, sg2.b]);
  const sx0 = Math.min(...all.map((p) => p[0])) - 60, sx1 = Math.max(...all.map((p) => p[0])) + 60, sy0 = Math.min(...all.map((p) => p[1])) - 60, sy1 = Math.max(...all.map((p) => p[1])) + 60;
  o.black += halftone({ x0: sx0, y0: sy0, x1: sx1, y1: sy1, step: 6, rmax: 1.9, color: INK.black, clip: shId, fn: () => 1 }) + paper + ink;
  o.blue += paper; o.red += paper;
  return o;
}

S[5] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 5, ink: 'red' }));
  add(ly, richText({ x: X0, y: 206, lines: [[r('El problema es otro:')]], size: 40 }));
  add(ly, richText({ x: X0, y: 304, lines: [[h('Chispa', 'red'), h(' decide primero.')], [h('Pausa', 'blue'), h(' llega tarde.')]], size: 92, lh: 1.0, ls: -0.01 }));
  add(ly, richText({ x: X0, y: 492, lines: [[r('Y cuando llega… Chispa ya ha pagado.')]], size: 40 }));
  const C = { x: 290, y: 790, s: 1.34 };
  ly.black += shadowEllipse(C.x - 4, C.y + 180, 175, 14, INK.black, 7, 2.6);
  // ticket: cuelga de la mano, se pliega en el suelo y se estira hacia Pausa (sin llegar a tocarla)
  const hnd = G(C, 158, 74);
  add(ly, ticket([[hnd[0] - 2, hnd[1] - 8], [hnd[0] + 18, 1120], [736, 1160]], 100));
  add(ly, chispa({ ...C, expr: 'feliz', pose: 'compra' }));
  // Pausa entrando por la derecha, cortada, sin aliento; su plancha azul aún no ha llegado
  const P = { x: 1020, y: 1060, s: 0.8, rot: -6, flip: true };
  ly.black += shadowEllipse(1010, 1180, 150, 12, INK.black, 7, 2.6);
  const pz = pausa({ ...P, expr: 'jadeo', pose: 'llega' });
  shiftPlate(pz, 'blue', 12, 7);
  add(ly, clipLayers(pz, 0, 0, 1080, 1350));
  const sw = G(P, 10, -150);
  ly.red += pausaSweat(sw[0], sw[1], 1.0);
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// reloj de cuenta atrás: cuerpo negro, dígitos en reserva
function countdown(x, y, rot = 0, s = 1) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-26" y="-92" width="52" height="20" rx="6" fill="${INK.black}"/>` +
    `<rect x="-130" y="-74" width="260" height="128" rx="22" fill="${INK.black}"/>` +
    `<rect x="-112" y="-56" width="224" height="92" rx="10" fill="none" stroke="${W}" stroke-width="3"/>` +
    text(0, 22, '00:59', { size: 80, fill: W, anchor: 'middle', font: FONT_MONO, weight: 500, stretch: '100%' }) + '</g>';
}

S[6] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 6, ink: 'red' }));
  add(ly, richText({ x: X0, y: 200, lines: [[mono('Ofertas flash. Cuentas atrás. «Quedan 2».')]], size: 32 }));
  const l1 = await M.wrap([h('Todo eso está diseñado para hablar con '), h('Chispa', 'red'), h('…')], CW, 76);
  const l2 = await M.wrap([h('antes de que '), h('Pausa', 'blue'), h(' se entere.')], CW, 76);
  add(ly, richText({ x: X0, y: 292, lines: [...l1, ...l2], size: 76, lh: 1.0, ls: -0.01 }));
  // el mundo comercial (plancha roja) apretado alrededor de Chispa; se pisan y Chispa va delante con hueco de reserva
  ly.red += priceTag(318, 728, -12, '−70 %', 0.6);
  ly.red += sign(560, 676, -3, 'SOLO HOY', { w: 300, h: 88, size: 50 });
  ly.red += priceTag(812, 716, 13, '−50 %', 0.56);
  ly.red += sign(300, 1070, 5, 'OFERTA FLASH', { w: 390, h: 94, size: 56 });
  ly.black += countdown(236, 914, -8, 0.84);
  const C = { x: 548, y: 880, s: 1.08 };
  ly.black += shadowEllipse(C.x - 2, C.y + 150, 140, 12, INK.black, 7, 2.6);
  ly.red += sign(800, 886, 8, 'QUEDAN 2', { w: 300, h: 94, size: 56 });
  add(ly, chispa({ ...C, expr: 'alarma', pose: 'tiesa', sweat: 3, halo: 9 }));
  // Pausa dormida en la esquina, por encima del filete y lejos de la tira de progreso
  const P = { x: 846, y: 1128, s: 0.5 };
  ly.black += shadowEllipse(P.x + 20, 1196, 130, 9, INK.black, 6, 2.2);
  add(ly, pausa({ ...P, expr: 'dormida', pose: 'duerme', squash: 0.95 }));
  ly.blue += text(926, 1030, 'z z z', { size: 44, fill: INK.blue, rot: -8 });
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

S[7] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 7, ink: 'plum' }));
  add(ly, richText({ x: X0, y: 208, lines: [[r('Todos tenemos una Chispa y una Pausa.')], [r('Aquí no vamos a apagar a Chispa.')]], size: 44, lh: 1.2 }));
  add(ly, richText({ x: X0, y: 360, lines: [[h('Vamos a enseñar')], [h('a '), h('Pausa', 'blue'), h(' a llegar')], [h('a tiempo.')]], size: 88, lh: 0.98, ls: -0.01 }));
  // subrayado bicolor: los dos trazos se cruzan y donde se pisan sale el ciruela
  const uw = (await M.width([h('a tiempo.')], 88)) + 10;
  ly.red += strokeP(`M${X0} 560 C${X0 + uw * 0.3} 548 ${X0 + uw * 0.65} 582 ${X0 + uw} 562`, INK.red, 9, 'stroke-linecap="round"');
  ly.blue += strokeP(`M${X0 + 4} 574 C${X0 + uw * 0.35} 584 ${X0 + uw * 0.6} 548 ${X0 + uw + 6} 556`, INK.blue, 9, 'stroke-linecap="round"');
  const p = await M.wrap([r('Cada semana: un truco que usa tu Chispa y cómo frenarlo.')], CW, 40);
  add(ly, richText({ x: X0, y: 632, lines: p, size: 40, lh: 1.2 }));
  // las dos, del mismo lado, al lector, sobre una sombra compartida
  ly.black += shadowEllipse(560, 1166, 430, 22, INK.black, 8, 3.2);
  const P = { x: 324, y: 1018, s: 1.1 };
  add(ly, pausa({ ...P, expr: 'neutral', pose: 'sit', look: [0, 4] }));
  const C = { x: 810, y: 960, s: 1.1 };
  add(ly, chispa({ ...C, expr: 'neutral', pose: 'stand', look: [-1, 2], sweatIdx: [1] }));
  // correa floja: asa de la taza → tobillo izquierdo de Chispa
  const h0 = G(P, 256, 86), a0 = G(C, -42, 118);
  ly.black += strokeP(`M${f(h0[0])} ${f(h0[1])} C${f(h0[0] + 30)} ${f(1186)} ${f(a0[0] - 60)} ${f(1188)} ${f(a0[0])} ${f(a0[1])}`, INK.black, 3.5, 'stroke-linecap="round"');
  ly.black += `<g transform="translate(${f(a0[0])} ${f(a0[1])}) rotate(-10)" fill="none" stroke="${INK.black}" stroke-width="3.5" stroke-linecap="round"><path d="M0 0 C-12 -16 -22 -4 0 0 C12 -16 22 -4 0 0"/></g>`;
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

S[8] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 8, ink: 'blue' }));
  const p1 = await M.wrap([r('Chispa y Pausa se inspiran en el '), b('Sistema 1'), r(' y el '), b('Sistema 2'), r(' del psicólogo '), b('Daniel Kahneman'), r(', premio Nobel de Economía en 2002.')], CW, 44);
  add(ly, richText({ x: X0, y: 214, lines: p1, size: 44, lh: 1.2 }));
  const y2 = 214 + p1.length * 52.8 + 28;
  const p2 = await M.wrap([r('Son una forma de entender cómo decides, no dos trozos reales de tu cerebro.')], CW, 44);
  add(ly, richText({ x: X0, y: y2, lines: p2, size: 44, lh: 1.2 }));
  const y3 = y2 + (p2.length - 1) * 52.8 + 62;
  ly.black += `<rect x="${X0}" y="${y3}" width="72" height="2" fill="${INK.black}"/>`;
  add(ly, richText({ x: X0, y: y3 + 44, lines: [[{ t: 'Aquí todo va con fuentes.', st: 'monoI', ink: 'black' }]], size: 30 }));
  // Chispa asomada por detrás (Pausa reserva su silueta en la plancha roja)
  const P = { x: 500, y: 1018, s: 1.16 };
  const C = { x: 620, y: 818, s: 0.9 };
  add(ly, chispa({ ...C, expr: 'neutral', pose: 'none', look: [-6, 6] }));
  ly.black += shadowEllipse(P.x + 20, P.y + 150, 290, 16, INK.black, 8, 3);
  add(ly, pausa({ ...P, expr: 'neutral', pose: 'lee', look: [4, 10], knockFor: ['red'] }));
  // bracitos de alambre de Chispa (desde sus enchufes) hasta las manos agarradas a la cúpula de Pausa
  const arms = [[[-106, 36], [-140, 60]], [[106, 34], [134, 66]]];
  const handsAt = [G(P, -6, -142), G(P, 150, -100)];
  arms.forEach(([sk, el], i) => {
    const a = G(C, ...sk), e = G(C, ...el), hd = handsAt[i];
    ly.black += strokeP(`M${f(a[0])} ${f(a[1])} L${f(e[0])} ${f(e[1])} L${f(hd[0])} ${f(hd[1])}`, INK.black, 5.5, 'stroke-linejoin="miter" stroke-linecap="round"');
    ly.black += `<circle cx="${f(hd[0])}" cy="${f(hd[1])}" r="7.5" fill="${INK.black}"/>`;
  });
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

S[9] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 9, ink: 'plum', signoff: '@dinero_irracional' }));
  add(ly, richText({ x: X0, y: 250, lines: [[h('¿Quién manda más')], [h('en tu cabeza?')]], size: 104, lh: 0.96, ls: -0.01 }));
  // botones de voto: punto de tinta + nombre, encima de cada personaje
  const vy = 476;
  const wC = await M.width([h('Chispa')], 72), wP = await M.width([h('Pausa')], 72);
  const cxC = 260, cxP = 720;
  ly.red += `<circle cx="${f(cxC - (wC + 58) / 2 + 22)}" cy="${vy - 24}" r="22" fill="${INK.red}"/>`;
  add(ly, richText({ x: cxC - (wC + 58) / 2 + 58, y: vy, lines: [[h('Chispa', 'red')]], size: 72 }));
  ly.blue += `<circle cx="${f(cxP - (wP + 58) / 2 + 22)}" cy="${vy - 24}" r="22" fill="${INK.blue}"/>`;
  add(ly, richText({ x: cxP - (wP + 58) / 2 + 58, y: vy, lines: [[h('Pausa', 'blue')]], size: 72 }));
  add(ly, richText({ x: 540, y: 572, lines: [[h('Comenta con un color.')]], size: 60, anchor: 'middle' }));
  const p = await M.wrap([r('Envíaselo a la Chispa de tu grupo. Y síguenos para que tu Pausa llegue a tiempo.')], CW, 36);
  add(ly, richText({ x: X0, y: 650, lines: p, size: 36, lh: 1.2 }));
  // las dos al lector; Chispa pisa el filete del pie
  const P = { x: 700, y: 1200 - 135 * 1.25, s: 1.25 };
  ly.black += shadowEllipse(P.x + 10, 1196, 260, 14, INK.black, 7, 2.8);
  add(ly, pausa({ ...P, expr: 'brindis', pose: 'brindis', look: [0, 6] }));
  const cs = 1.2;
  const C = { x: 250, y: 1236 - 122 * cs - 2, s: cs };
  add(ly, chispa({ ...C, expr: 'euforia', pose: 'cheer', sweat: 2, look: [0, -1] }));
  ly.black += burst(C.x + 6, C.y - 130 * C.s - 10, 1);
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// =============================================================== main
(async () => {
  const which = process.argv.slice(2).map(Number).filter(Boolean);
  const list = which.length ? which : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const M = await measurer();
  const jobs = [];
  for (const n of list) jobs.push({ name: `slide-${String(n).padStart(2, '0')}`, svg: await S[n](M), w: 1080, h: 1350, dir: OUT });
  await M.close();
  await render(jobs);
  if (!which.length) {
    const { execFileSync } = require('child_process');
    execFileSync('python3', ['-I', path.join(OUT, 'overview.py')], { stdio: 'inherit', cwd: OUT });
  }
})().catch((e) => { console.error(e); process.exit(1); });
