// Hoja de prueba de poses y expresiones nuevas (post 00). node poses-check.js [carpeta150]
const R = require('./riso.js');
const { L, add, chispa, pausa, riso, render, text, shadowEllipse, burst, nodMarks, pausaSweat, INK, FONT_MONO } = R;
const cells = [
  ['Chispa · orgullosa · hips', (x, y) => chispa({ x, y, s: 0.8, expr: 'orgullosa', pose: 'hips', lean: 8, sweat: 1 })],
  ['Chispa · alarma · tiesa', (x, y) => chispa({ x, y, s: 0.8, expr: 'alarma', pose: 'tiesa', sweat: 3 })],
  ['Chispa · feliz · compra', (x, y) => chispa({ x, y, s: 0.8, expr: 'feliz', pose: 'compra' })],
  ['Chispa · neutral · look al lector', (x, y) => chispa({ x, y, s: 0.8, expr: 'neutral', pose: 'stand', look: [0, 2], sweat: 1 })],
  ['Pausa · jadeo · llega', (x, y) => { const o = pausa({ x: x + 10, y, s: 0.55, expr: 'jadeo', pose: 'llega', flip: true, rot: -6 }); o.red += pausaSweat(x - 120, y - 60, 0.8); return o; }],
  ['Pausa · dormida · duerme', (x, y) => { const o = pausa({ x: x - 20, y, s: 0.55, expr: 'dormida', pose: 'duerme', squash: 0.95 }); o.blue += text(x + 70, y - 80, 'z z z', { size: 40, fill: INK.blue }); return o; }],
  ['Pausa · neutral · lee', (x, y) => pausa({ x: x - 20, y, s: 0.55, expr: 'neutral', pose: 'lee', look: [4, 10] })],
  ['Pausa · brindis · brindis', (x, y) => pausa({ x: x - 20, y: y + 20, s: 0.55, expr: 'brindis', pose: 'brindis' })],
];
const ly = L();
cells.forEach(([label, fn], i) => {
  const cx = 150 + (i % 4) * 260, cy = 220 + Math.floor(i / 4) * 330;
  ly.black += shadowEllipse(cx, cy + 100, 100, 12, INK.black, 7, 2.4);
  add(ly, fn(cx, cy));
  ly.black += text(cx, cy + 150, label, { size: 15, font: FONT_MONO, weight: 500, anchor: 'middle', stretch: '100%' });
});
const svg = riso(1080, 700, { layers: ly });
const dir150 = process.argv[2] || __dirname;
render([{ name: 'poses-check', svg, w: 1080, h: 700 }, { name: 'poses-check-small', svg, w: 1080, h: 700, outW: 540, dir: dir150, svgOut: false }]);
