// Escenas de la propuesta «Riso». Se ejecuta desde build.js.
const B = require('./build.js');
const { INK, PAPERS, L, add, mapi, capi, text, riso, render, halftone, shadowEllipse, strokeP, W, FONT_HEAD, FONT_MONO, teardrop, roundPoly, mug } = B;
const path = require('path');
const SCRATCH = process.env.SCRATCH || '/tmp';

function checkScene() {
  const ly = L();
  ly.black += shadowEllipse(330, 640, 230, 26);
  ly.black += shadowEllipse(820, 640, 130, 20);
  add(ly, capi({ x: 330, y: 515, s: 1, expr: 'neutral', pose: 'sit' }));
  add(ly, mapi({ x: 820, y: 505, s: 1, expr: 'neutral', pose: 'stand', sweat: 2, speed: 0 }));
  return riso(1080, 760, { layers: ly });
}
function singleScene(who) {
  const ly = L();
  if (who === 'mapi') add(ly, mapi({ x: 250, y: 230, s: 1.4, expr: 'neutral', sweat: 1 }));
  else add(ly, capi({ x: 255, y: 250, s: 1.05, expr: 'neutral' }));
  return riso(500, 440, { layers: ly });
}

function rule(x1, y1, x2, y2, w = 2.5) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK.black}" stroke-width="${w}"/>`; }
function burst(x, y, s = 1, color = INK.black) { // marcas de exaltación
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${color}" stroke-width="5" stroke-linecap="round"><path d="M0 -10 L0 -34 M-22 -2 L-40 -16 M22 -2 L40 -16"/></g>`;
}

function expressionsScene() {
  const ly = L();
  const Wd = 1080, H = 1350;
  // cabecera
  ly.black += text(64, 128, 'Hoja de expresiones', { size: 92, ls: -0.01 });
  ly.black += text(66, 176, 'PROPUESTA 2 · «RISO» · DOS TINTAS, UN CEREBRO', { size: 22, font: FONT_MONO, weight: 500, ls: 0.06, stretch: '100%' });
  ly.black += rule(64, 206, Wd - 64, 206, 3);
  const cx = [148, 408, 668, 928];
  // fila Mapi
  const yM = 418;
  ly.red += text(64, 268, 'Mapi', { size: 64, fill: INK.red });
  ly.black += text(232, 266, 'SISTEMA 1 · RÁPIDO, AUTOMÁTICO, EMOCIONAL', { size: 20, font: FONT_MONO, weight: 500, ls: 0.04, stretch: '100%' });
  const mExp = [
    { expr: 'neutral', pose: 'stand', sweat: 1, label: 'Neutral' },
    { expr: 'euforia', pose: 'cheer', sweat: 2, label: '¡Euforia!' },
    { expr: 'feliz', pose: 'stand', sweat: 0, label: 'Feliz' },
    { expr: 'esceptico', pose: 'hips', sweat: 0, label: '¿En serio?' },
  ];
  mExp.forEach((m, i) => {
    ly.black += shadowEllipse(cx[i], yM + 98, 100, 13, INK.black, 7, 2.6);
    add(ly, mapi({ x: cx[i], y: yM, s: 0.8, expr: m.expr, pose: m.pose, sweat: m.sweat }));
    if (m.expr === 'euforia') ly.black += burst(cx[i], yM - 98, 0.9);
    ly.black += text(cx[i], yM + 160, m.label, { size: 26, font: FONT_MONO, weight: 500, anchor: 'middle', stretch: '100%' });
  });
  ly.black += rule(64, 618, Wd - 64, 618, 3);
  // Capi: más grande, en 2 × 2
  ly.blue += text(64, 680, 'Capi', { size: 64, fill: INK.blue });
  ly.black += text(222, 678, 'SISTEMA 2 · LENTO, DELIBERADO, TRANQUILO', { size: 20, font: FONT_MONO, weight: 500, ls: 0.04, stretch: '100%' });
  const cExp = [
    { expr: 'neutral', pose: 'sit', label: 'Neutral' },
    { expr: 'alarma', pose: 'shrug', label: '¡Alarma!' },
    { expr: 'feliz', pose: 'sit', label: 'Feliz' },
    { expr: 'esceptico', pose: 'sit', label: '¿En serio?' },
  ];
  cExp.forEach((m, i) => {
    const s = 0.66;
    const gx = [300, 780][i % 2], gy = [806, 1046][Math.floor(i / 2)];
    const ox = m.pose === 'shrug' ? 0 : -26;
    ly.black += shadowEllipse(gx + ox * s, gy + 82, 134, 14, INK.black, 7, 2.6);
    add(ly, capi({ x: gx + ox * s, y: gy, s, expr: m.expr, pose: m.pose }));
    if (m.expr === 'alarma') ly.red += text(gx + 122, gy - 96, '!', { size: 72, fill: INK.red, anchor: 'middle', rot: 12 });
    ly.black += text(gx, gy + 132, m.label, { size: 26, font: FONT_MONO, weight: 500, anchor: 'middle', stretch: '100%' });
  });
  ly.black += rule(64, 1222, Wd - 64, 1222, 3);
  ly.black += text(64, 1284, 'Dinero Irracional', { size: 40 });
  ly.black += text(Wd - 64, 1282, 'Rojo flúor · Azul · Negro', { size: 22, font: FONT_MONO, weight: 500, anchor: 'end', stretch: '100%' });
  return riso(Wd, H, { layers: ly, paper: PAPERS.niebla });
}

function G(c, lx, ly) { // local → global para un personaje {x,y,s,rot}
  const a = (c.rot || 0) * Math.PI / 180, X = lx * c.s, Y = ly * c.s;
  return [c.x + X * Math.cos(a) - Y * Math.sin(a), c.y + X * Math.sin(a) + Y * Math.cos(a)];
}
function priceTag(x, y, rot, label, s = 1) { // etiqueta en plancha roja; texto en reserva
  let r = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`;
  r += `<path d="${roundPoly([[-150, -78], [110, -78], [168, 0], [110, 78], [-150, 78]], 14)}" fill="${INK.red}"/>`;
  r += `<circle cx="116" cy="0" r="13" fill="${W}"/>`;
  r += text(-12, 34, label, { size: 104, fill: W, anchor: 'middle', ls: -0.02 });
  return r + '</g>';
}

function heroScene() {
  const ly = L();
  const Wd = 1080, H = 1350;
  // cabecera
  ly.black += text(64, 92, 'DINERO IRRACIONAL', { size: 24, font: FONT_MONO, weight: 500, ls: 0.12, stretch: '100%' });
  ly.black += text(Wd - 64, 92, 'Nº 01', { size: 24, font: FONT_MONO, weight: 500, ls: 0.12, anchor: 'end', stretch: '100%' });
  ly.black += `<line x1="64" y1="114" x2="${Wd - 64}" y2="114" stroke="${INK.black}" stroke-width="3"/>`;
  // la etiqueta que Mapi persigue
  ly.red += priceTag(842, 300, 12, '−70 %', 0.92);
  ly.black += strokeP('M955 262 C990 220 1010 190 1040 170', INK.black, 3.5, 'stroke-linecap="round"');
  // personajes
  const C = { x: 350, y: 1000, s: 1.42, rot: 0 };
  const M = { x: 560, y: 560, s: 1.42, rot: -18 };
  ly.black += shadowEllipse(C.x + 10, C.y + 172, 310, 28, INK.black, 8, 3.4);
  add(ly, capi({ ...C, expr: 'neutral', pose: 'sit', look: [5, 3] }));
  add(ly, mapi({ ...M, expr: 'euforia', pose: 'lunge', sweat: 3, speed: 4 }));
  // el hilo: de la mano de Capi al tobillo de Mapi
  // gag: Capi ni se levanta; ha atado a Mapi al asa de la taza
  const h = G(C, 238, 52), a = G(M, -90, 90);
  ly.black += `<circle cx="${h[0]}" cy="${h[1]}" r="6" fill="${INK.black}"/>`;
  ly.black += strokeP(`M${h[0]} ${h[1]} C${h[0] + 30} ${h[1] - 120} ${a[0] + 120} ${a[1] + 60} ${a[0]} ${a[1]}`, INK.black, 3.5, 'stroke-linecap="round"');
  ly.black += `<g transform="translate(${a[0]} ${a[1]}) rotate(-30)" fill="none" stroke="${INK.black}" stroke-width="3.5" stroke-linecap="round"><path d="M0 0 C-14 -18 -26 -4 0 0 C14 -18 26 -4 0 0 M0 0 L-8 18 M0 0 L9 16"/></g>`;
  // bocadillos sin globo: cada uno habla en su tinta
  ly.red += text(112, 470, '¡Ya, ya, ya!', { size: 96, fill: INK.red, rot: -9, ls: -0.01 });
  ly.blue += text(724, 1000, 'Mapi, no.', { size: 88, fill: INK.blue, ls: -0.01 });
  // pie
  ly.black += `<line x1="64" y1="1236" x2="${Wd - 64}" y2="1236" stroke="${INK.black}" stroke-width="3"/>`;
  ly.black += text(64, 1296, 'Uno tira. El otro sujeta.', { size: 50 });
  ly.black += text(Wd - 64, 1292, 'SISTEMA 1 + SISTEMA 2', { size: 20, font: FONT_MONO, weight: 500, ls: 0.08, anchor: 'end', stretch: '100%' });
  return riso(Wd, H, { layers: ly, paper: PAPERS.niebla });
}

function coin(x, y, r = 24, rot = 0) { // moneda en plancha azul, con canto y € en reserva
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="${r}" ry="${r}" fill="${INK.blue}"/><ellipse rx="${r - 5}" ry="${r - 5}" fill="none" stroke="${W}" stroke-width="2.5"/>` +
    text(0, r * 0.4, '€', { size: r * 1.15, fill: W, anchor: 'middle', stretch: '100%' }) + `</g>`;
}

function coverScene() {
  const ly = L();
  const Wd = 1080, H = 1350;
  ly.black += text(64, 92, 'DINERO IRRACIONAL', { size: 24, font: FONT_MONO, weight: 500, ls: 0.12, stretch: '100%' });
  ly.black += text(Wd - 64, 92, 'SESGOS · 01', { size: 24, font: FONT_MONO, weight: 500, ls: 0.12, anchor: 'end', stretch: '100%' });
  ly.black += `<line x1="64" y1="114" x2="${Wd - 64}" y2="114" stroke="${INK.black}" stroke-width="3"/>`;
  // el 7 gigante en plancha roja
  ly.red += text(26, 934, '7', { size: 820, fill: INK.red, ls: -0.04, stretch: '75%' });
  // titular
  const lines = ['sesgos que', 'te vacían', 'la cuenta', 'cada mes'];
  lines.forEach((t, i) => { ly.black += text(450, 478 + i * 112, t, { size: 126, ls: -0.015 }); });
  // Mapi en lo alto del 7, tirando monedas
  const M = { x: 196, y: 286, s: 0.9, rot: 5 };
  add(ly, mapi({ ...M, expr: 'euforia', pose: 'cheer', sweat: 2 }));
  ly.black += `<g transform="translate(${M.x + 6} ${M.y - 100}) rotate(5)" stroke="${INK.black}" stroke-width="5" stroke-linecap="round"><path d="M0 -10 L0 -30 M-20 -2 L-36 -14 M20 -2 L36 -14"/></g>`;
  [[372, 214, 26, -10], [86, 176, 22, 25], [420, 300, 22, 18], [330, 150, 18, 30]].forEach((c) => (ly.blue += coin(...c)));
  // Capi abajo, con la taza (y una moneda que cae dentro: plof)
  const C = { x: 790, y: 1136, s: 1.3, rot: 0 };
  ly.black += shadowEllipse(C.x - 20, C.y + 150, 300, 24, INK.black, 8, 3.2);
  add(ly, capi({ ...C, flip: true, expr: 'esceptico', pose: 'sit', look: [7, 1] }));
  ly.blue += text(470, 950, 'Mapi…', { size: 74, fill: INK.blue, anchor: 'start', rot: -4 });
  // monedas cayendo
  [[250, 990, 24, 15], [342, 1010, 23, -25], [420, 1050, 22, 40], [478, 1106, 21, 10]].forEach((c) => (ly.blue += coin(...c)));
  ly.black += strokeP('M150 960 C200 930 230 960 250 990', INK.black, 3, 'stroke-dasharray="2 9" stroke-linecap="round"');
  ly.black += text(64, 1292, 'Desliza →', { size: 30, font: FONT_MONO, weight: 500, stretch: '100%' });
  return riso(Wd, H, { layers: ly, paper: PAPERS.lila });
}

function avatarScene() {
  // Dos planchas, un cerebro: Mapi encajado en la cima de Capi; donde se pisan, morado.
  const ly = L();
  const S = 640;
  ly.black += shadowEllipse(300, 530, 230, 22, INK.black, 8, 3.4);
  add(ly, capi({ x: 272, y: 394, s: 1.08, expr: 'neutral', look: [4, -1] }));
  add(ly, mapi({ x: 446, y: 236, s: 1.04, rot: 16, expr: 'euforia', pose: 'none', sweat: 2, faceKnock: ['blue'] }));
  return riso(S, S, { layers: ly, paper: PAPERS.niebla, grain: 0.6 });
}

async function run(which) {
  const jobs = [];
  if (which === 'check' || which === 'all') {
    jobs.push({ name: 'check' + (process.env.V||''), svg: checkScene(), w: 1080, h: 760, dir: SCRATCH });
    jobs.push({ name: 'mapi150' + (process.env.V||''), svg: singleScene('mapi'), w: 500, h: 440, outW: 150, dir: SCRATCH });
    jobs.push({ name: 'capi150' + (process.env.V||''), svg: singleScene('capi'), w: 500, h: 440, outW: 150, dir: SCRATCH });
  }
  if (which === 'hero' || which === 'all') jobs.push({ name: 'hero', svg: heroScene(), w: 1080, h: 1350 });
  if (which === 'cover' || which === 'all') jobs.push({ name: 'cover-mock', svg: coverScene(), w: 1080, h: 1350 });
  if (which === 'avatar' || which === 'all') {
    jobs.push({ name: 'avatar', svg: avatarScene(), w: 640, h: 640, outW: 320 });
    jobs.push({ name: 'avatar150', svg: avatarScene(), w: 640, h: 640, outW: 150, dir: SCRATCH });
  }
  if (which === 'expressions' || which === 'all') jobs.push({ name: 'expressions', svg: expressionsScene(), w: 1080, h: 1350 });
  await render(jobs);
  if (process.env.V) for (const j of jobs) if (!j.dir) require('fs').copyFileSync(path.join(__dirname, j.name + '.png'), path.join(SCRATCH, j.name + process.env.V + '.png'));
}
module.exports = { run };
// zoom de detalle
module.exports.zoom = async function () {
  const ly = L();
  add(ly, mapi({ x: 270, y: 230, s: 1.6, expr: process.env.EX || 'neutral', pose: process.env.PO || 'stand', sweat: 2 }));
  add(ly, capi({ x: 820, y: 260, s: 1.05, expr: process.env.EX2 || 'neutral', pose: process.env.PO2 || 'sit' }));
  await render([{ name: 'zoom' + (process.env.V || ''), svg: riso(1080, 480, { layers: ly }), w: 1080, h: 480, dir: SCRATCH }]);
};
