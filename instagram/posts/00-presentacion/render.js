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
  add(ly, richText({ x: X0, y: 262, lines: [[h('En tu cabeza')], [h('viven dos.')]], size: 128, lh: 0.98, ls: -0.015 }));
  // dos líneas equilibradas (corte manual; el texto es literal)
  add(ly, richText({ x: X0 + 2, y: 466, lines: [[h('Y las dos deciden qué haces')], [h('con tu dinero.')]], size: 56, lh: 1.04, ls: -0.01 }));
  // Pausa al fondo, pequeña, ni se inmuta
  const P = { x: 846, y: 1010, s: 0.5 };
  ly.black += shadowEllipse(P.x + 8, P.y + 70, 110, 10, INK.black, 6, 2.2);
  add(ly, pausa({ ...P, expr: 'neutral', pose: 'sit', look: [-6, 4] }));
  // Chispa en primer plano, saltando hacia el lector
  const C = { x: 400, y: 896, s: 1.7 };
  ly.black += liftedShadow(C.x + 6, C.y + 127 * C.s + 60, 150, 18);
  add(ly, chispa({ ...C, expr: 'euforia', pose: 'cheer', sweat: 2, look: [1, -1] }));
  ly.black += burst(C.x + 8, C.y - 130 * C.s - 14, 1.25);
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
  // figura: Chispa del hero; el pie trasero y las líneas de velocidad rompen el marco izquierdo,
  // la mano delantera sube hasta la banda.
  const fig = L();
  const C = { x: 318, y: 588, s: 1.42, rot: -6, lean: -16 };
  add(fig, chispa({ ...C, expr: 'euforia', pose: 'lunge', sweat: 3, speed: 4, halo: 7,
    limbs: { armR: [[176, -40], [250, -150]] } }));
  fig.red += priceTag(906, 476, 12, '−70 %', 0.42);
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

// pictogramas (tinta negra, formas planas)
function pictoFreno(x, y) { // pedal de freno visto de lado: pastilla con estrías, palanca y pivote
  return `<g transform="translate(${x} ${y})"><path d="M-30 40 H34" stroke="${INK.black}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M14 34 L-4 -10" stroke="${INK.black}" stroke-width="10" stroke-linecap="round"/><circle cx="14" cy="34" r="9" fill="${INK.black}"/>` +
    `<g transform="translate(-10 -22) rotate(-28)"><rect x="-34" y="-17" width="68" height="34" rx="8" fill="${INK.black}"/>` +
    `<path d="M-22 -6 H22 M-22 6 H22" stroke="${W}" stroke-width="4.5" stroke-linecap="round"/></g></g>`;
}
function pictoBalon(x, y) {
  let s = `<g transform="translate(${x} ${y})"><circle r="42" fill="${INK.black}"/>`;
  const pent = (cx, cy, rr, rot) => 'M' + [0, 1, 2, 3, 4].map((i) => { const a = ((rot + i * 72 - 90) * Math.PI) / 180; return `${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`; }).join(' L') + 'Z';
  s += `<path d="${pent(0, 0, 14, 0)}" fill="${W}"/>`;
  for (let i = 0; i < 5; i++) { const a = ((i * 72 - 90) * Math.PI) / 180; s += `<path d="M${f(14 * Math.cos(a))} ${f(14 * Math.sin(a))} L${f(34 * Math.cos(a))} ${f(34 * Math.sin(a))}" stroke="${W}" stroke-width="5"/>`; }
  return s + '</g>';
}
function pictoCara(x, y) {
  return `<g transform="translate(${x} ${y})"><circle r="42" fill="${INK.black}"/><circle cx="-14" cy="-8" r="6" fill="${W}"/><circle cx="14" cy="-8" r="6" fill="${W}"/>` +
    `<path d="M-17 12 Q0 26 17 12" fill="none" stroke="${W}" stroke-width="6" stroke-linecap="round"/></g>`;
}

S[4] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 4, ink: 'red' }));
  ly.black += text(X0, 196, 'Spoiler:', { size: 30, font: FONT_MONO, weight: 500, stretch: '100%' });
  add(ly, richText({ x: X0, y: 296, lines: [[h('Chispa', 'red'), h(' no es')], [h('la mala.')]], size: 104, lh: 0.96, ls: -0.01 }));
  const p1 = await M.wrap([r('Gracias a ella frenas antes de pensar, esquivas un balón y reconoces una cara en un segundo.')], CW, 40);
  add(ly, richText({ x: X0, y: 466, lines: p1, size: 40, lh: 1.2 }));
  // tira de pictogramas
  ly.black += pictoFreno(X0 + 46, 640) + pictoBalon(X0 + 186, 640) + pictoCara(X0 + 326, 640);
  const p2 = await M.wrap([r('Sin Chispa, tardarías media hora en cruzar la calle.')], 540, 40);
  add(ly, richText({ x: X0, y: 778, lines: p2, size: 40, lh: 1.2 }));
  // Pausa abajo a la izquierda, asintiendo mirando a Chispa
  const P = { x: 262, y: 1104, s: 0.7 };
  ly.black += shadowEllipse(P.x + 10, P.y + 92, 160, 12, INK.black, 7, 2.6);
  add(ly, pausa({ ...P, expr: 'neutral', pose: 'sit', look: [9, -7] }));
  ly.black += nodMarks(P.x - 150, P.y - 112, 1.1);
  // Chispa a la derecha, en jarras, echada hacia atrás
  const C = { x: 776, y: 986, s: 1.18, lean: 8 };
  ly.black += shadowEllipse(C.x - 6, C.y + 156, 160, 14, INK.black, 7, 2.8);
  add(ly, chispa({ ...C, expr: 'orgullosa', pose: 'hips', sweatIdx: [1] }));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ticket larguísimo: cinta de papel (trama muy clara) con renglones negros perpendiculares
function ticket(pts, w = 40) {
  // Catmull-Rom → muestras
  const samp = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let t = 0; t < 1; t += 0.02) {
      const t2 = t * t, t3 = t2 * t;
      samp.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  samp.push(pts[pts.length - 1]);
  // reparto por longitud
  const even = [samp[0]]; let acc = 0;
  for (let i = 1; i < samp.length; i++) { acc += Math.hypot(samp[i][0] - samp[i - 1][0], samp[i][1] - samp[i - 1][1]); if (acc >= 9) { even.push(samp[i]); acc = 0; } }
  const left = [], right = [], bars = [];
  even.forEach((p, i) => {
    const q = even[Math.min(even.length - 1, i + 1)], o = even[Math.max(0, i - 1)];
    let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const nx = -ty, ny = tx;
    left.push([p[0] + nx * w / 2, p[1] + ny * w / 2]); right.push([p[0] - nx * w / 2, p[1] - ny * w / 2]);
    const last = i >= even.length - 3;
    if (i > 1 && i < even.length - 1 && (i % 3 === 0 || last)) {
      const len = last ? w - 10 : (0.3 + 0.45 * Math.abs(Math.sin(i * 1.9))) * (w - 12);
      const sx = p[0] + nx * (w / 2 - 6), sy = p[1] + ny * (w / 2 - 6);
      bars.push(`<path d="M${f(sx)} ${f(sy)} L${f(sx - nx * len)} ${f(sy - ny * len)}" stroke="${INK.black}" stroke-width="${last ? 7 : 3.5}" stroke-linecap="round"/>`);
    }
  });
  const outline = 'M' + left.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L') + ' L' + right.reverse().map((p) => `${f(p[0])} ${f(p[1])}`).join(' L') + 'Z';
  const id = R.uid('tk');
  const defs = `<clipPath id="${id}"><path d="${outline}"/></clipPath>`;
  const xs = left.concat(right).map((p) => p[0]), ys = left.concat(right).map((p) => p[1]);
  const tint = `<path d="${outline}" fill="#ffffff"/>` + halftone({ x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys), step: 7, rmax: 1.0, color: INK.black, clip: id, fn: () => 1 });
  return { defs, black: tint + bars.join(''), outline };
}

S[5] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 5, ink: 'red' }));
  add(ly, richText({ x: X0, y: 206, lines: [[r('El problema es otro:')]], size: 40 }));
  add(ly, richText({ x: X0, y: 304, lines: [[h('Chispa', 'red'), h(' decide primero.')], [h('Pausa', 'blue'), h(' llega tarde.')]], size: 92, lh: 1.0, ls: -0.01 }));
  add(ly, richText({ x: X0, y: 540, lines: [[r('Y cuando llega… Chispa ya ha pagado.')]], size: 40 }));
  // Chispa con la compra
  const C = { x: 300, y: 790, s: 1.34 };
  ly.black += shadowEllipse(C.x - 4, C.y + 180, 175, 14, INK.black, 7, 2.6);
  add(ly, chispa({ ...C, expr: 'feliz', pose: 'compra' }));
  // ticket desde su mano derecha, al suelo y serpenteando hasta los pies de Pausa
  const hnd = G(C, 158, 74);
  const tk = ticket([[hnd[0] + 4, hnd[1] + 6], [hnd[0] + 40, hnd[1] + 90], [500, 1040], [440, 1150], [560, 1196], [680, 1150], [790, 1186]], 46);
  ly.defs += tk.defs; ly.black += tk.black;
  ly.blue += `<path d="${tk.outline}" fill="${W}"/>`;
  // Pausa entrando por la derecha, cortada, sin aliento; su plancha azul aún no ha llegado
  const P = { x: 990, y: 1066, s: 0.8, rot: -6, flip: true };
  ly.black += shadowEllipse(990, 1180, 150, 12, INK.black, 7, 2.6);
  const pz = pausa({ ...P, expr: 'jadeo', pose: 'llega' });
  shiftPlate(pz, 'blue', 12, 7);
  add(ly, clipLayers(pz, 0, 0, 1080, 1350));
  ly.red += pausaSweat(G(P, 30, -150)[0], G(P, 30, -150)[1], 1.0);
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
  // el mundo comercial, en la plancha roja
  ly.red += priceTag(150, 668, -12, '−70 %', 0.56);
  ly.red += sign(540, 620, -3, 'SOLO HOY', { w: 290, h: 84, size: 48 });
  ly.red += priceTag(946, 676, 13, '−50 %', 0.5);
  ly.red += sign(902, 890, 8, 'QUEDAN 2', { w: 300, h: 92, size: 54 });
  ly.red += sign(236, 1160, 4, 'OFERTA FLASH', { w: 380, h: 92, size: 54 });
  ly.black += countdown(160, 930, -7, 0.82);
  // Chispa hipnotizada en el centro
  const C = { x: 536, y: 870, s: 1.0 };
  ly.black += shadowEllipse(C.x - 2, C.y + 138, 135, 12, INK.black, 7, 2.6);
  add(ly, chispa({ ...C, expr: 'alarma', pose: 'tiesa', sweat: 3 }));
  // Pausa dormida en la esquina, cortada por el filete del pie
  const P = { x: 860, y: 1176, s: 0.5 };
  const pz = pausa({ ...P, expr: 'dormida', pose: 'duerme', squash: 0.95 });
  add(ly, clipLayers(pz, 0, 0, 1080, 1234));
  ly.blue += text(940, 1068, 'z z z', { size: 44, fill: INK.blue, rot: -8 });
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
  add(ly, richText({ x: X0, y: y3 + 44, lines: [[{ t: 'Aquí todo va con fuentes. Sin humo.', st: 'monoI', ink: 'black' }]], size: 30 }));
  // Chispa asomada por detrás (Pausa reserva su silueta en la plancha roja)
  const P = { x: 500, y: 1040, s: 1.06 };
  const C = { x: 610, y: 858, s: 0.84 };
  add(ly, chispa({ ...C, expr: 'neutral', pose: 'none', look: [-6, 6] }));
  ly.black += shadowEllipse(P.x + 20, P.y + 134, 270, 16, INK.black, 8, 3);
  add(ly, pausa({ ...P, expr: 'neutral', pose: 'lee', look: [4, 10], knockFor: ['red'] }));
  // manos-punto de Chispa agarradas al borde de la cúpula de Pausa (encima)
  for (const [lx, ly2] of [[52, -146], [128, -108]]) { const g = G(P, lx, ly2); ly.black += `<circle cx="${f(g[0])}" cy="${f(g[1])}" r="8" fill="${INK.black}"/>`; }
  // taza en el suelo, sin vapor («sin humo»)
  ly.black += mug(862, 1146, 1.1, false);
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

S[9] = async (M) => {
  const ly = L();
  add(ly, pageChrome({ n: 9, ink: 'plum', signoff: 'Dinero Irracional' }));
  const t = await M.wrap([h('¿Quién manda más en tu cabeza?')], CW, 104);
  add(ly, richText({ x: X0, y: 250, lines: t, size: 104, lh: 0.96, ls: -0.01 }));
  // botones de voto: punto de tinta + nombre, encima de cada personaje
  const vy = 470;
  const wC = await M.width([h('Chispa')], 72), wP = await M.width([h('Pausa')], 72);
  const cxC = 330, cxP = 770;
  ly.red += `<circle cx="${f(cxC - (wC + 58) / 2 + 22)}" cy="${vy - 24}" r="22" fill="${INK.red}"/>`;
  add(ly, richText({ x: cxC - (wC + 58) / 2 + 58, y: vy, lines: [[h('Chispa', 'red')]], size: 72 }));
  ly.blue += `<circle cx="${f(cxP - (wP + 58) / 2 + 22)}" cy="${vy - 24}" r="22" fill="${INK.blue}"/>`;
  add(ly, richText({ x: cxP - (wP + 58) / 2 + 58, y: vy, lines: [[h('Pausa', 'blue')]], size: 72 }));
  add(ly, richText({ x: 540, y: vy, lines: [[h('·')]], size: 72, anchor: 'middle' }));
  add(ly, richText({ x: 540, y: 566, lines: [[h('Comenta con un color.')]], size: 60, anchor: 'middle' }));
  // las dos al lector
  const C = { x: 330, y: 800, s: 0.95 };
  ly.black += liftedShadow(C.x + 4, C.y + 127 * C.s + 50, 110, 13);
  add(ly, chispa({ ...C, expr: 'euforia', pose: 'cheer', sweat: 2, look: [0, -1] }));
  ly.black += burst(C.x + 6, C.y - 130 * C.s - 10, 0.9);
  const P = { x: 742, y: 948, s: 0.85 };
  ly.black += shadowEllipse(P.x + 10, P.y + 112, 190, 13, INK.black, 7, 2.8);
  add(ly, pausa({ ...P, expr: 'brindis', pose: 'brindis', look: [0, 6] }));
  const p = await M.wrap([r('Envíaselo a la Chispa de tu grupo. Y síguenos para que tu Pausa llegue a tiempo.')], CW, 36);
  add(ly, richText({ x: X0, y: 1210 - (p.length - 1) * 43 - 8, lines: p, size: 36, lh: 1.2 }));
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
