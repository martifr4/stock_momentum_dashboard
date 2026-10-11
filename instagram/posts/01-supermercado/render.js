// Post 01 · El supermercado está diseñado para Chispa — 11 slides 1080 × 1350, estilo «Riso».
// Uso: node render.js [n ...]   (sin argumentos: las 11 + overview.png)
// Librería compartida (sin modificar) + atrezo propio en props.js. Texto literal de copy.md.
const path = require('path');
const R = require('../../characters/riso/riso.js');
const {
  INK, PAPERS, W, L, add, chispa, pausa, burst, shadowEllipse, liftedShadow, text, richText, measurer, pageChrome, riso, render,
  strokeP, f, sign, FONT_MONO,
} = R;
const P = require('./props.js');
const { G, nb, chispaP, CH_POSES, carrito, cargaLlena, cargaMedia, stopBadge, storeMap, stopHeader, pausaCorner, sourceLine } = P;
const OUT = __dirname;
const X0 = 64, CW = 952, TOTAL = 11, POST = 'N.º 01';

const r = (t) => ({ t: nb(t), st: 'body', ink: 'black' });
const b = (t, ink = 'black') => ({ t: nb(t), st: 'bold', ink });
const h = (t, ink = 'black') => ({ t: nb(t), st: 'head', ink });
const m = (t) => ({ t, st: 'mono' });
const mi = (t) => ({ t, st: 'monoI' });
const chrome = (n, ink, signoff) => pageChrome({ n, total: TOTAL, ink, post: POST, signoff });

// bloque de texto con ajuste de línea; devuelve la y de la línea base siguiente
async function para(ly, M, spans, { x = X0, y, w = CW, size = 38, lh = 1.2, ls = 0 }) {
  const lines = await M.wrap(spans, w, size);
  add(ly, richText({ x, y, lines, size, lh, ls }));
  return { next: y + lines.length * size * lh, n: lines.length };
}
// título de parada: líneas a mano (arrays de spans)
function title(ly, lines, size, y = 290 + 0) {
  const base = y + size * 0.8;
  add(ly, richText({ x: X0, y: base, lines, size, lh: 0.98, ls: -0.012 }));
  return base + (lines.length - 1) * size * 0.98 + size * 0.22;
}

const S = {};

// ------------------------------------------------------------------ 1 · Portada
S[1] = async (M) => {
  const ly = L();
  add(ly, chrome(1, 'red'));
  add(ly, richText({ x: X0 - 4, y: 268, lines: [[h('Entraste')], [h('a por pan.')]], size: 150, lh: 0.92, ls: -0.02 }));
  add(ly, richText({ x: X0, y: 500, lines: [[h('Chispa', 'red'), h(' salió con 43 €.')]], size: 80, ls: -0.01 }));
  add(ly, stopBadge(X0 + 26, 590, 7, { r: 26, size: 34 }));
  add(ly, richText({ x: X0 + 62, y: 601, lines: [[mi('trucos del súper (y cómo frenarlos)')]], size: 32 }));
  // escena: Chispa sale empujando el carrito desbordado; Pausa va de pasajera encima del montón
  const C = { x: 236, y: 1004, s: 1.12, lean: -8 };
  const hand = G(C, ...CH_POSES.empuja.hand);
  const cs = 1.12;
  const cart = { x: hand[0], y: hand[1] };
  const T = (c) => P.tf(c, `translate(${cart.x} ${cart.y}) scale(${cs})`);
  ly.black += shadowEllipse(C.x + 260, 1162, 380, 16, INK.black, 8, 3);
  for (const c of cargaLlena({ withRider: true })) add(ly, T(c));
  // la barra de pan, lo único que venía a comprar, asoma en diagonal (pequeña)
  add(ly, P.baguette(cart.x + 70 * cs, cart.y - 178 * cs, 84, 18, -52));
  // Pausa sentada sobre el montón; los alambres delanteros van por encima
  const Pz = { x: cart.x + 214 * cs, y: cart.y - 20 * cs, s: 0.45 };
  add(ly, pausa({ ...Pz, expr: 'esceptico', pose: 'sit', look: [-2, 6], knockFor: ['red', 'black'] }));
  add(ly, carrito({ x: cart.x, y: cart.y, s: cs, carga: [] }));
  add(ly, chispaP('empuja', { ...C, expr: 'euforia', look: [2, -1], sweat: 2, speed: 3 }));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 2 · El mapa
S[2] = async (M) => {
  const ly = L();
  add(ly, chrome(2, 'blue'));
  add(ly, richText({ x: X0, y: 214, lines: [[h('El súper no es')], [h('un sitio neutral.')]], size: 80, lh: 0.96, ls: -0.012 }));
  let y = 214 + 80 * 0.96 + 72;
  y = (await para(ly, M, [r('Cada pasillo está pensado para hablar con '), b('Chispa'), r('.')], { y, w: 650, size: 40 })).next + 10;
  await para(ly, M, [r('Hoy lo recorremos con '), b('Pausa'), r(' de guía.')], { y, w: 650, size: 40 });
  // plano
  add(ly, storeMap({ x: 108, y: 600, s: 0.9, mode: 'full' }));
  // Pausa guía, arriba a la derecha, mira al texto y al plano
  const Pz = { x: 870, y: 410, s: 0.5, flip: true };
  add(ly, P.pausaProp({ ...Pz, expr: 'neutral', look: [-4, 8], prop: P.banderin, raise: 'up' }));
  ly.black += shadowEllipse(Pz.x, Pz.y + 70, 110, 8, INK.black, 6, 2);
  // Chispa diminuta en la puerta, con el carrito vacío, mirando hacia dentro
  const C = { x: 1006, y: 1190, s: 0.28, flip: true, lean: 10 };
  const hand = G(C, ...CH_POSES.empuja.hand);
  add(ly, carrito({ x: hand[0], y: hand[1], s: 0.28, flip: true }));
  add(ly, chispaP('empuja', { ...C, expr: 'euforia', look: [-3, 0] }));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 3 · Parada 1: la música
S[3] = async (M) => {
  const ly = L();
  add(ly, chrome(3, 'red'));
  add(ly, stopHeader(1, 'PARADA 1: LA MÚSICA'));
  let y = title(ly, [[h('La música va despacio.')], [h('Tú también.')]], 72);
  y += 24 + 38 * 0.8;
  y = (await para(ly, M, [r('En un estudio clásico, con música lenta la gente caminaba más despacio y gastaba más que con música rápida.')], { y })).next + 16;
  y = (await para(ly, M, [r('Más tiempo en el pasillo = más cosas en el carrito.')], { y })).next;
  const sceneTop = y;
  // altavoz colgado y notas que bajan flotando
  add(ly, P.altavoz(110, sceneTop + 70, 0.8, sceneTop - 10));
  ly.black += P.nota(200, sceneTop + 70, 0.9, -10) + P.nota(256, sceneTop + 130, 0.85, 8, true) + P.nota(214, sceneTop + 196, 0.75, -6);
  // Chispa en cámara lenta, embelesada, con el carrito a medio llenar
  const C = { x: 200, y: 1030, s: 0.75, lean: 4 };
  const hand = G(C, ...CH_POSES.empujaLenta.hand);
  const cs = 0.75;
  ly.black += shadowEllipse(C.x + 150, 1132, 250, 10, INK.black, 7, 2.4);
  const carga = cargaMedia().map((c) => P.tf(c, `translate(${hand[0]} ${hand[1]}) scale(${cs})`));
  for (const c of carga) add(ly, c);
  add(ly, P.botella(hand[0] + 200 * cs, hand[1] - 34 * cs, 34 * cs, 92 * cs, 'red', 32)); // uno más, cayendo dentro
  add(ly, carrito({ x: hand[0], y: hand[1], s: cs }));
  add(ly, chispaP('empujaLenta', { ...C, expr: 'feliz' }));
  ly.black += nodArcs(C.x, C.y - 150 * C.s, 0.6);
  const pc = await pausaCorner(M, { pose: 'muestra', prop: P.listaMini, expr: 'neutral', look: [-6, 2], quote: '«Entra con lista. Sal cuando la acabes.»', anchor: 880 });
  add(ly, pc.layers);
  add(ly, sourceLine([[m('Fuente: Milliman (1982), '), mi('Journal of Marketing'), m('.')]]));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};
function nodArcs(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${INK.black}" stroke-width="5" stroke-linecap="round">` +
    `<path d="M-130 30 Q-138 8 -130 -14"/><path d="M-150 34 Q-160 8 -150 -18"/><path d="M130 30 Q138 8 130 -14"/><path d="M150 34 Q160 8 150 -18"/></g>`;
}


// ------------------------------------------------------------------ 4 · Parada 2: lo básico, al fondo
S[4] = async (M) => {
  const ly = L();
  add(ly, chrome(4, 'red'));
  add(ly, stopHeader(2, 'PARADA 2: LO BÁSICO, AL FONDO'));
  let y = title(ly, [[h('El pan está al fondo.')], [h('Por algo.')]], 72);
  y += 24 + 38 * 0.8;
  y = (await para(ly, M, [r('Pan, leche, huevos: lo que compras siempre suele estar lejos de la entrada. Para llegar, cruzas medio súper… y Chispa va llenando el carrito.')], { y })).next;
  const FLOOR = 1132;
  // el pan, al fondo del todo (izquierda)
  add(ly, P.mostradorPan(64, FLOOR));
  // la ruta azul entra por la derecha y da un rodeo en S antes de llegar al pan
  ly.blue += `<path d="M640 ${FLOOR - 40} C600 ${FLOOR - 40} 600 ${FLOOR + 6} 540 ${FLOOR + 6} C470 ${FLOOR + 6} 470 ${FLOOR - 40} 400 ${FLOOR - 40} C330 ${FLOOR - 40} 330 ${FLOOR + 6} 260 ${FLOOR + 6} C210 ${FLOOR + 6} 210 ${FLOOR - 20} 186 ${FLOOR - 20}" fill="none" stroke="${INK.blue}" stroke-width="7" stroke-dasharray="18 14" stroke-linecap="round"/>`;
  // Chispa a medio camino, empujando hacia la izquierda un carrito ya lleno
  const C = { x: 540, y: 1012, s: 0.7, flip: true, lean: 6 };
  const hand = G(C, ...CH_POSES.empuja.hand);
  ly.black += shadowEllipse(C.x - 120, FLOOR, 240, 9, INK.black, 7, 2.3);
  const cs = 0.7;
  for (const c of cargaLlena()) add(ly, P.tf(c, `translate(${hand[0]} ${hand[1]}) scale(${-cs} ${cs})`));
  add(ly, carrito({ x: hand[0], y: hand[1], s: cs, flip: true }));
  add(ly, chispaP('empuja', { ...C, expr: 'feliz', sweatIdx: [1] }));
  const pc = await pausaCorner(M, { expr: 'esceptico', look: [-8, 6], quote: '«Ve directamente a lo que necesitas. Sin pasear pasillos.»', anchor: 900 });
  add(ly, pc.layers);
  add(ly, sourceLine([[m('Práctica habitual en la distribución de tiendas.')]]));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 5 · Parada 3: el estante
S[5] = async (M) => {
  const ly = L();
  add(ly, chrome(5, 'red'));
  add(ly, stopHeader(3, 'PARADA 3: EL ESTANTE'));
  let y = title(ly, [[h('Lo que ves primero')], [h('no es casualidad.')]], 68);
  y += 24 + 38 * 0.8;
  y = (await para(ly, M, [r('Las marcas compiten por estar donde más miras y con más paquetes de frente: cuanto más lo ves, más lo eliges.')], { y })).next + 16;
  y = (await para(ly, M, [b('Dato:'), r(' el punto que más se mira no está a la altura de los ojos, sino un poco por debajo.')], { y })).next;
  // estante: dos montantes + 4 baldas
  const X0s = 70, X1s = 370, FLOOR = 1140, yb = [828, 916, 1004, 1092];
  ly.black += `<rect x="${X0s}" y="790" width="8" height="${FLOOR - 790}" fill="${INK.black}"/><rect x="${X1s - 8}" y="790" width="8" height="${FLOOR - 790}" fill="${INK.black}"/>`;
  for (const yy of yb) ly.black += P.balda(X0s, X1s, yy);
  // balda alta: 2 distintos
  add(ly, P.caja(140, yb[0], 56, 50, 'black')); add(ly, P.lata(280, yb[0], 40, 46, 'black'));
  // a la altura de los ojos: 2 distintos
  add(ly, P.botella(130, yb[1], 28, 70, 'black')); add(ly, P.caja(270, yb[1], 70, 60, 'black'));
  // un poco por debajo: 5 rojos idénticos de frente
  for (let i = 0; i < 5; i++) add(ly, P.caja(108 + i * 56, yb[2], 44, 66, 'red'));
  // balda baja
  add(ly, P.lata(160, yb[3], 40, 50, 'black'));
  // Chispa frente al estante, mirando la fila roja
  const C = { x: 520, y: 1012, s: 0.75, flip: true };
  ly.black += shadowEllipse(C.x - 6, FLOOR - 4, 110, 9, INK.black, 7, 2.3);
  add(ly, chispaP('alcanza', { ...C, expr: 'euforia', look: [-4, 4], limbs: { armR: [[150, -10], [206, -46]], armL: [[-130, 62], [-122, 90]] } }));
  // línea de mirada: cono de dos trazos discontinuos, del ojo a la fila roja (sin punta)
  const eyeP = G(C, 18, -4);
  ly.black += strokeP(`M${f(eyeP[0] - 24)} ${f(eyeP[1] - 2)} L376 ${yb[2] - 62} M${f(eyeP[0] - 24)} ${f(eyeP[1] + 4)} L376 ${yb[2] - 4}`, INK.black, 3.5, 'stroke-dasharray="8 8" stroke-linecap="round"');
  const pc = await pausaCorner(M, { expr: 'neutral', look: [0, -9], quote: '«Antes de coger nada, mira arriba y abajo.»', anchor: 900 });
  add(ly, pc.layers);
  add(ly, sourceLine([[m('Fuentes: Chandon et al. (2009), '), mi('Journal of Marketing'), m(';')], [m('Chen et al. (2021), '), mi('Journal of Marketing Research'), m('.')]]));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 6 · Parada 4: el cartel
S[6] = async (M) => {
  const ly = L();
  add(ly, chrome(6, 'red'));
  add(ly, stopHeader(4, 'PARADA 4: EL CARTEL'));
  let y = title(ly, [[h('El cartel de oferta')], [h('vende… aunque no')], [h('haya oferta.')]], 64);
  y += 24 + 38 * 0.8;
  y = (await para(ly, M, [r('Un cartel llamativo hace subir las ventas incluso cuando el precio no ha bajado. Chispa ve el cartel y entiende «barato».')], { y })).next;
  const FLOOR = 1140, yb = 1010;
  // balda corta con dos envases idénticos y dos etiquetas mudas idénticas
  ly.black += P.balda(70, 400, yb, 8);
  ly.black += `<rect x="90" y="${yb}" width="8" height="${FLOOR - yb}" fill="${INK.black}"/><rect x="372" y="${yb}" width="8" height="${FLOOR - yb}" fill="${INK.black}"/>`;
  add(ly, P.botella(160, yb, 46, 120, 'black')); add(ly, P.botella(310, yb, 46, 120, 'black'));
  ly.black += P.etiquetaMuda(160, yb + 14) + P.etiquetaMuda(310, yb + 14);
  add(ly, P.cartelEstallido(330, 846, 100, 'OFERTA'));
  // Chispa hipnotizada, brazos al frente
  const C = { x: 530, y: 1010, s: 0.75, flip: true, lean: 6 };
  ly.black += shadowEllipse(C.x, FLOOR - 4, 110, 9, INK.black, 7, 2.3);
  add(ly, chispaP('zombi', { ...C, expr: 'espiral', sweatIdx: [1] }));
  const pc = await pausaCorner(M, { pose: 'lupa', prop: P.lupa, expr: 'esceptico', look: [-8, 6], quote: '«Mira el precio, no el cartel.»', anchor: 880 });
  add(ly, pc.layers);
  add(ly, sourceLine([[m('Fuente: Inman, McAlister y Hoyer (1990),')], [mi('Journal of Consumer Research'), m('.')]]));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 7 · Parada 5: la segunda unidad
S[7] = async (M) => {
  const ly = L();
  add(ly, chrome(7, 'red'));
  add(ly, stopHeader(5, 'PARADA 5: LA SEGUNDA UNIDAD'));
  let y = title(ly, [[h('«2.ª unidad al 50 %»')], [h('no es un 50 %')], [h('de descuento.')]], 64);
  y += 24 + 48 * 0.8;
  add(ly, richText({ x: X0, y, lines: [[h('4 € + 2 € = 6 € por las dos → 3 € cada una.')], [h('Es un '), h('25 %', 'blue'), h('.')]].map((ln) => ln.map((sp) => ({ ...sp, t: nb(sp.t) }))), size: 48, lh: 1.08, ls: -0.005 }));
  y += 48 * 1.08 + 24 + 38;
  y = (await para(ly, M, [r('Y solo ahorras si de verdad ibas a usar las dos.')], { y })).next;
  // escena: cartel detrás y Chispa con un envase idéntico en cada mano
  ly.red += sign(300, 788, -4, nb('2.ª UNIDAD AL 50 %'), { w: 470, h: 92, size: 54 });
  const C = { x: 300, y: 1016, s: 0.8 };
  ly.black += shadowEllipse(C.x, 1132, 120, 9, INK.black, 7, 2.3);
  add(ly, chispa({ ...C, expr: 'euforia', pose: 'hold', sweatIdx: [1] }));
  const hl = G(C, -120, -26), hr = G(C, 118, -28);
  add(ly, P.botella(hl[0], hl[1] + 12, 34, 92, 'red', -10)); add(ly, P.botella(hr[0], hr[1] + 12, 34, 92, 'red', 10));
  ly.black += burst(C.x + 6, C.y - 130 * C.s + 4, 0.7);
  const pc = await pausaCorner(M, { expr: 'neutral', look: [-4, -8], quote: '«¿Necesitas dos? Si no, no es ahorro.»', anchor: 900 });
  add(ly, pc.layers);
  add(ly, sourceLine([[m(nb('Cálculo: (4 € + 2 €) ÷ 2 = 3 € por unidad.'))]]));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 8 · Parada 6: la reduflación
S[8] = async (M) => {
  const ly = L();
  add(ly, chrome(8, 'red'));
  add(ly, stopHeader(6, 'PARADA 6: LA REDUFLACIÓN'));
  let y = title(ly, [[h('Mismo precio.')], [h('Menos producto.')]], 72);
  y += 24 + 38 * 0.8;
  y = (await para(ly, M, [r('El envase parece igual, pero trae menos. Es legal si el peso aparece en la etiqueta… y Chispa nunca mira el peso.')], { y })).next;
  const FLOOR = 1140, yb = 1060;
  ly.black += P.balda(70, 380, yb, 8);
  ly.black += `<rect x="90" y="${yb}" width="8" height="${FLOOR - yb}" fill="${INK.black}"/><rect x="352" y="${yb}" width="8" height="${FLOOR - yb}" fill="${INK.black}"/>`;
  add(ly, P.envaseCorte(150, yb, 120, 190, 1));
  add(ly, P.envaseCorte(300, yb, 120, 190, 0.7));
  ly.black += P.etiquetaMuda(150, yb - 240) + P.etiquetaMuda(300, yb - 240);
  // Chispa se lleva otra caja (la de menos) bajo el brazo, ojos cerrados
  const C = { x: 510, y: 1010, s: 0.7 };
  ly.black += shadowEllipse(C.x, FLOOR - 4, 110, 9, INK.black, 7, 2.3);
  const hb = G(C, 150, 40);
  add(ly, chispaP('abraza', { ...C, expr: 'feliz' }));
  add(ly, P.envaseCorte(hb[0] + 8, hb[1] + 46, 70, 100, 0.7));
  ly.black += `<circle cx="${f(G(C, 186, 18)[0])}" cy="${f(G(C, 186, 18)[1])}" r="5" fill="${INK.black}"/>`;
  const pc = await pausaCorner(M, { pose: 'lupa', prop: P.lupa, expr: 'neutral', look: [-8, 4], quote: '«Compara el precio por kilo o por litro.»', anchor: 880 });
  add(ly, pc.layers);
  add(ly, sourceLine([[m('Reduflación: menos cantidad por el mismo precio.')]]));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 9 · Parada 7: la caja
S[9] = async (M) => {
  const ly = L();
  add(ly, chrome(9, 'red'));
  add(ly, stopHeader(7, 'PARADA 7: LA CAJA'));
  let y = title(ly, [[h('La última trampa')], [h('está en la cola.')]], 72);
  y += 24 + 38 * 0.8;
  y = (await para(ly, M, [r('Dulces y snacks junto a la caja, justo cuando esperas y te puede el cansancio. En supermercados británicos que los quitaron de ahí, se compraron bastantes menos.')], { y })).next;
  const FLOOR = 1140;
  add(ly, P.mostradorCaja(400, 620, 1010, FLOOR));
  add(ly, P.expositorSnacks(300, 382, 880, FLOOR));
  // Chispa en la cola, carrito lleno detrás (cortado por el borde)
  const C = { x: 190, y: 1020, s: 0.72 };
  const cart = { x: C.x - 130, y: 1004 };
  for (const c of cargaLlena()) add(ly, P.clipLayers(P.tf(c, `translate(${cart.x} ${cart.y}) scale(-0.7 0.7)`), 0, 0, 1080, 1350));
  add(ly, carrito({ x: cart.x, y: cart.y, s: 0.7, flip: true }));
  ly.black += shadowEllipse(C.x, FLOOR - 4, 110, 9, INK.black, 7, 2.3);
  add(ly, chispaP('pica', { ...C, expr: 'neutral', look: [6, 3], limbs: { armR: [[140, 60], [172, 52]] } }));
  // correa en tirón: del asa de la taza de Pausa al tobillo de Chispa (Pausa llega a tiempo)
  const pc = await pausaCorner(M, { expr: 'esceptico', look: [-8, 6], quote: '«La cola no es un pasillo más.»', anchor: 900 });
  add(ly, pc.layers);
  const Pz = { x: 866, y: 1046, s: 0.7, flip: true };
  const mugH = G(Pz, 236, 86), ankle = G(C, 40, 112);
  ly.black += strokeP(`M${f(mugH[0])} ${f(mugH[1])} L${f(ankle[0])} ${f(ankle[1])}`, W, 10) + P.correaTensa(mugH, ankle);
  add(ly, sourceLine([[m('Fuente: Ejlerskov et al. (2018), '), mi('PLOS Medicine'), m('.')]]));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 10 · La lista de la compra de Pausa
S[10] = async (M) => {
  const ly = L();
  add(ly, chrome(10, 'blue'));
  const sheet = { x0: 104, y0: 160, x1: 900, y1: 1196, first: 384, gap: 104 };
  const items = ['Entra con lista y sal al acabarla.', 'Ve directamente a lo básico.', 'Mira arriba y abajo.', 'Precio, no cartel.', '¿Necesitas dos?', 'Precio por kilo.', 'En la caja, nada nuevo.'];
  const content = L();
  add(content, P.listaCompra({ ...sheet, rot: 0 }));
  const mx = 104 + 110;
  add(content, richText({ x: mx + 24, y: 268, lines: [[h('La lista de la compra')], [h('de '), h('Pausa', 'blue')]], size: 64, lh: 0.98, ls: -0.01 }));
  const rnd = P.rand(9);
  items.forEach((t, i) => {
    const line = sheet.first + sheet.gap * (i + 1), base = line - 14;
    add(content, stopBadge(104 + 55, base - 14, i + 1, { r: 22, size: 28 }));
    content.black += P.casilla(mx + 22, base, 40, -3 + rnd() * 6);
    add(content, richText({ x: mx + 82, y: base - 2, lines: [[r(t)]], size: 42 }));
  });
  add(ly, P.tf(content, `rotate(-1.5 502 678)`));
  // Pausa satisfecha, fuera de la hoja, en la esquina (pisa solo el borde)
  const Pz = { x: 966, y: 1136, s: 0.46, flip: true };
  ly.black += shadowEllipse(Pz.x, 1198, 96, 7, INK.black, 6, 2);
  add(ly, pausa({ ...Pz, expr: 'feliz', pose: 'sit' }));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ 11 · Tu turno
S[11] = async (M) => {
  const ly = L();
  add(ly, chrome(11, 'plum', '@dinero_irracional'));
  const t = await M.wrap([h('¿En qué parada cae tu '), h('Chispa', 'red'), h(' siempre?')], CW, 92);
  add(ly, richText({ x: X0, y: 232, lines: t, size: 92, lh: 0.96, ls: -0.012 }));
  for (let i = 0; i < 7; i++) add(ly, stopBadge(168 + i * 124, 470, i + 1, { r: 40, size: 50 }));
  add(ly, richText({ x: 540, y: 600, lines: [[h('Comenta el número.')]], size: 60, anchor: 'middle' }));
  add(ly, P.chincheta(92, 684, 1.3));
  add(ly, richText({ x: 136, y: 702, lines: [[r('Guárdalo para tu próxima compra.')]], size: 38 }));
  ly.black += P.avionPapel(92, 750, 1.1);
  add(ly, richText({ x: 136, y: 764, lines: [[r('Envíaselo a quien «solo iba a por pan».')]], size: 38 }));
  // Chispa sale solo con el pan, como un trofeo; Pausa brinda
  const C = { x: 300, y: 1236 - 122 * 1.0 - 2, s: 1.0 };
  add(ly, chispaP('trofeo', { ...C, expr: 'euforia', look: [0, -1], sweat: 2 }));
  const hd = G(C, ...CH_POSES.trofeo.hand);
  add(ly, P.baguette(hd[0] + 22, hd[1] - 46, 150, 28, -64));
  ly.black += burst(C.x - 30, C.y - 130 * C.s - 10, 0.9);
  const Pz = { x: 760, y: 1200 - 135 * 1.1, s: 1.1 };
  ly.black += shadowEllipse(Pz.x + 10, 1196, 230, 13, INK.black, 7, 2.8);
  add(ly, pausa({ ...Pz, expr: 'brindis', pose: 'brindis', look: [0, 6] }));
  return riso(1080, 1350, { layers: ly, paper: PAPERS.niebla });
};

// ------------------------------------------------------------------ main
(async () => {
  const which = process.argv.slice(2).map(Number).filter(Boolean);
  const list = which.length ? which : Array.from({ length: TOTAL }, (_, i) => i + 1);
  const M = await measurer();
  const jobs = [];
  for (const n of list) if (S[n]) jobs.push({ name: `slide-${String(n).padStart(2, '0')}`, svg: await S[n](M), w: 1080, h: 1350, dir: OUT });
  await M.close();
  await render(jobs);
  if (!which.length) {
    const { execFileSync } = require('child_process');
    execFileSync('python3', ['-I', path.join(OUT, 'overview.py')], { stdio: 'inherit', cwd: OUT });
  }
})().catch((e) => { console.error(e); process.exit(1); });

module.exports = { S };
