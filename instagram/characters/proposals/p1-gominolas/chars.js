// «Gominolas» — construcción reutilizable de Mapi (Sistema 1) y Capi (Sistema 2).
// Cada personaje es una mitad de cerebro-gominola. Coordenadas locales:
// origen = centro de la base del cuerpo (los pies cuelgan por debajo de y=0).
// Todas las piezas (cuerpo, pliegues, ojos, bocas, brazos, accesorios) se
// definen una vez aquí y se combinan en cada escena.

const P = {
  ink: '#33203A',      // contorno: ciruela muy oscura (no negro)
  red: '#EE3D5B',      // Mapi — rojo cereza
  redShade: '#C2244A',
  redLight: '#FF8296',
  blue: '#4F86E8',     // Capi — azul gominola
  blueShade: '#3361C4',
  blueLight: '#93BAFF',
  blush: '#FF9BB5',
  white: '#FFFFFF',
  mug: '#FFE27A',      // taza amarilla mantequilla
  mugShade: '#F2BE3C',
  sweat: '#8FD8F7',
};

let uid = 0;
const id = (p) => `${p}${++uid}`;

const OUT = 9;      // contorno exterior
const IN = 5;       // líneas interiores (pliegues)
const FINE = 4;

// ---------- CUERPOS ----------
// Mapi: hemisferio izquierdo. Lado plano (interior) a la derecha. Lóbulos
// irregulares, con «remolinos» despeinados arriba.
const MAPI_BODY = `M 34 -4
 C 66 -12 82 -80 84 -140
 C 100 -150 102 -182 82 -192
 C 86 -214 64 -232 44 -222
 C 40 -244 14 -254 -2 -240
 C -12 -258 -42 -262 -52 -242
 C -66 -256 -96 -252 -100 -228
 C -122 -230 -140 -208 -130 -188
 C -152 -180 -160 -150 -144 -134
 C -164 -120 -162 -90 -140 -82
 C -154 -62 -142 -36 -116 -34
 C -112 -14 -90 -4 -66 -6
 C -30 -2 4 0 34 -4 Z`;

// Capi: hemisferio derecho. Lado plano a la izquierda. Más grande y con el
// peso abajo (forma de pera: asentado, tranquilo), lóbulos amplios y ordenados.
const CAPI_BODY = `M -80 0
 C -110 -12 -122 -60 -120 -112
 C -118 -156 -116 -196 -98 -214
 C -90 -224 -76 -228 -62 -222
 C -50 -250 -10 -258 10 -238
 C 30 -258 72 -252 82 -226
 C 110 -228 134 -206 130 -180
 C 158 -170 174 -140 162 -114
 C 190 -98 194 -58 174 -40
 C 178 -10 140 6 100 4
 C 40 6 -40 8 -80 0 Z`;

// Pliegues (circunvoluciones). Los principales nacen en las muescas del
// contorno (así se lee «cerebro» incluso a 150 px) y van en tinta fina; los
// secundarios van en el tono de sombra.
// Mapi: cortos, torcidos, cada uno hacia un lado (desordenados).
const MAPI_CREASES = [
  'M 82 -192 C 70 -186 66 -174 72 -164',
  'M 44 -222 C 40 -208 28 -204 22 -194 C 18 -186 24 -178 32 -180',
  'M -2 -240 C -4 -226 -16 -222 -14 -210',
  'M -52 -242 C -46 -230 -54 -220 -66 -220 C -76 -220 -80 -210 -74 -202',
  'M -100 -228 C -96 -216 -102 -208 -110 -206',
  'M -130 -188 C -118 -184 -110 -174 -116 -164',
  'M -144 -134 C -132 -136 -124 -128 -126 -118',
  'M -140 -82 C -128 -84 -120 -76 -124 -66',
  'M -116 -34 C -108 -40 -98 -38 -94 -30',
];
const MAPI_FOLDS = [
  'M 54 -150 C 62 -140 58 -128 66 -120',
  'M -30 -196 C -22 -204 -10 -200 -8 -190',
  'M 30 -40 C 40 -44 50 -38 50 -28',
];
// Capi: largos, paralelos, todos con la misma curvatura (ordenados).
const CAPI_CREASES = [
  'M -62 -222 C -52 -206 -34 -200 -16 -202',
  'M 10 -238 C 14 -222 28 -214 46 -214',
  'M 82 -226 C 84 -210 96 -200 112 -198',
  'M 130 -180 C 126 -164 132 -150 148 -146',
  'M 162 -114 C 154 -100 156 -84 168 -78',
  'M 174 -40 C 162 -36 152 -26 152 -14',
  'M -40 -178 C -14 -190 22 -190 48 -180 C 70 -172 92 -174 108 -184',
];
const CAPI_FOLDS = [
  'M -96 -186 C -86 -176 -86 -164 -96 -154',
  'M -60 -196 C -40 -202 -16 -200 0 -194',
  'M 156 -54 C 162 -46 162 -36 156 -28',

];

// Mechón-muelle de Mapi: un pliegue que se le ha «soltado».
const MAPI_CURL = (wild = 0) => `M -42 -236
 C -48 ${-262 - wild} -18 ${-280 - wild} -10 ${-266 - wild}
 C -4 ${-254 - wild} -26 ${-250 - wild} -22 ${-268 - wild}
 C -18 ${-290 - wild} 12 ${-298 - wild} 20 ${-282 - wild}`;

function bodyGroup(path, base, shade, light, folds, opts = {}) {
  const creases = opts.creases || [];
  const cid = id('clip');
  const shadeShift = opts.shadeShift || [-10, -12];
  return `
  <defs><clipPath id="${cid}"><path d="${path}"/></clipPath></defs>
  <path d="${path}" fill="${shade}"/>
  <g clip-path="url(#${cid})">
    <path d="${path}" fill="${base}" transform="translate(${shadeShift[0]} ${shadeShift[1]})"/>
    ${folds.map(f => `<path d="${f}" fill="none" stroke="${shade}" stroke-width="${IN + 1}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    ${opts.shine || ''}
    ${creases.map(f => `<path d="${f}" fill="none" stroke="${P.ink}" stroke-width="${IN}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
  </g>
  <path d="${path}" fill="none" stroke="${P.ink}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
}

// ---------- OJOS ----------
// eye(x,y,{rx,ry,look:[dx,dy],lid:0..1 (porción tapada),lidTilt, shine})
function eye(x, y, o = {}) {
  const rx = o.rx || 15, ry = o.ry || 19;
  const [lx, ly] = o.look || [0, 0];
  const lid = o.lid || 0;
  const tilt = o.lidTilt || 0;
  const g = [];
  const eyeId = id('eye');
  const lidY = y - ry + lid * 2 * ry;
  // párpado: semiplano por debajo de una curva suave (evita halos de recorte)
  const lidPath = `M ${x - rx - 6} ${lidY + tilt} Q ${x} ${lidY - 3} ${x + rx + 6} ${lidY - tilt}`;
  g.push(`<defs><clipPath id="${eyeId}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/></clipPath>`);
  if (lid > 0) g.push(`<clipPath id="${eyeId}l">${'<path d="' + lidPath + ` L ${x + rx + 6} ${y + ry + 6} L ${x - rx - 6} ${y + ry + 6} Z"/>`}</clipPath>`);
  g.push('</defs>');
  if (lid > 0) g.push(`<g clip-path="url(#${eyeId}l)">`);
  g.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${P.ink}"/>`);
  g.push(`<g clip-path="url(#${eyeId})">`);
  // brillo inferior del iris (caramelo)
  g.push(`<ellipse cx="${x + lx}" cy="${y + ry * 0.62 + ly}" rx="${rx * 0.78}" ry="${ry * 0.4}" fill="${o.glow || '#7B3A6E'}"/>`);
  if (o.sparkle !== false) {
    const hy = lid > 0 ? Math.max(y - ry * 0.38, lidY + rx * 0.42 + 1) : y - ry * 0.38;
    g.push(`<circle cx="${x + rx * 0.3 + lx}" cy="${hy + ly}" r="${rx * 0.4}" fill="#fff"/>`);
    g.push(`<circle cx="${x - rx * 0.36 + lx}" cy="${y + ry * 0.36 + ly}" r="${rx * 0.17}" fill="#fff"/>`);
  }
  g.push('</g>');
  if (lid > 0) g.push('</g>');
  if (lid > 0) {
    g.push(`<path d="${lidPath.replace(`M ${x - rx - 6}`, `M ${x - rx - 4}`).replace(`${x + rx + 6} ${lidY - tilt}`, `${x + rx + 4} ${lidY - tilt}`)}" fill="none" stroke="${P.ink}" stroke-width="${FINE + 2}" stroke-linecap="round"/>`);
  }
  return g.join('');
}

// ojos cerrados felices ^ ^
const happyEye = (x, y, w = 15) => `<path d="M ${x - w} ${y + 5} C ${x - w * 0.6} ${y - 12} ${x + w * 0.6} ${y - 12} ${x + w} ${y + 5}" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>`;

const brow = (x, y, angle, len = 18, curve = -4) => {
  const r = angle * Math.PI / 180;
  const dx = Math.cos(r) * len / 2, dy = Math.sin(r) * len / 2;
  return `<path d="M ${x - dx} ${y - dy} Q ${x} ${y + curve} ${x + dx} ${y + dy}" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`;
};

const blush = (x, y, w = 15) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.55}" fill="${P.blush}" opacity="0.9"/>`;

// ---------- CARAS ----------
// Mapi: ojos enormes, muy separados, bajos. Centro de cara (fx, fy).
function mapiFace(expr = 'neutral') {
  const fx = -34, fy = -114, ex = 42;
  const L = fx - ex, R = fx + ex;
  const g = [];
  const glow = '#8E2348';
  if (expr === 'neutral') {
    g.push(eye(L, fy, { rx: 20, ry: 26, look: [3, 0], glow }));
    g.push(eye(R, fy, { rx: 20, ry: 26, look: [3, 0], glow }));
    g.push(brow(L, fy - 36, -8), brow(R, fy - 36, 8));
    g.push(`<path d="M ${fx - 9} ${fy + 26} C ${fx - 4} ${fy + 33} ${fx + 4} ${fy + 33} ${fx + 9} ${fy + 26}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  } else if (expr === 'alarm') {
    // pupilas temblorosas: brillo duplicado y desplazado + marcas de vibración
    for (const x of [L, R]) {
      g.push(eye(x, fy - 2, { rx: 23, ry: 30, look: [0, -2], glow }));
      g.push(`<circle cx="${x + 1}" cy="${fy - 14}" r="9" fill="#fff" opacity="0.45"/>`);
      g.push(`<path d="${x === L ? `M ${x - 32} ${fy - 14} q -5 7 0 14` : `M ${x + 32} ${fy - 14} q 5 7 0 14`}" fill="none" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/>`);
    }
    // cejas de preocupación (extremos interiores arriba; nunca de enfado)
    g.push(brow(L, fy - 46, -20, 22, 3), brow(R, fy - 46, 20, 22, 3));
    // boca abierta, temblorosa
    g.push(`<path d="M ${fx - 16} ${fy + 26} q 4 -6 8 0 t 8 0 t 8 0 t 8 0 C ${fx + 18} ${fy + 40} ${fx + 12} ${fy + 52} ${fx} ${fy + 52} C ${fx - 12} ${fy + 52} ${fx - 18} ${fy + 40} ${fx - 16} ${fy + 26} Z" fill="${P.ink}" stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"/>`);
    g.push(`<path d="M ${fx - 8} ${fy + 46} C ${fx - 4} ${fy + 40} ${fx + 4} ${fy + 40} ${fx + 8} ${fy + 46} C ${fx + 4} ${fy + 50} ${fx - 4} ${fy + 50} ${fx - 8} ${fy + 46} Z" fill="#FF6F8A"/>`);
  } else if (expr === 'euphoria') {
    // ojos estrellados de compra
    for (const x of [L, R]) {
      g.push(eye(x, fy, { rx: 22, ry: 28, look: [0, 0], glow, sparkle: false }));
      g.push(star(x, fy - 1, 12, 5.2, '#FFE27A'));
      g.push(`<circle cx="${x + 9}" cy="${fy - 13}" r="3.4" fill="#fff"/>`);
    }
    g.push(brow(L, fy - 44, -14), brow(R, fy - 44, 14));
    g.push(openSmile(fx, fy + 20, 22, 20));
  } else if (expr === 'happy') {
    g.push(happyEye(L, fy, 16), happyEye(R, fy, 16));
    g.push(openSmile(fx, fy + 20, 15, 15));
  } else if (expr === 'skeptic') {
    // Mapi escéptica (poco habitual): un ojo entornado, boca de lado
    g.push(eye(L, fy, { rx: 20, ry: 26, look: [5, 2], glow, lid: 0.42, lidColor: P.red, lidTilt: -3 }));
    g.push(eye(R, fy - 2, { rx: 20, ry: 26, look: [5, 2], glow }));
    g.push(brow(L, fy - 32, 6, 20, 0), brow(R, fy - 44, -14, 20, -6));
    g.push(`<path d="M ${fx - 10} ${fy + 30} C ${fx - 2} ${fy + 26} ${fx + 6} ${fy + 26} ${fx + 14} ${fy + 22}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  } else if (expr === 'panic') {
    // llorando/agobio: ojos brillantes con lágrima en el borde
    g.push(eye(L, fy, { rx: 22, ry: 28, look: [0, 2], glow }));
    g.push(eye(R, fy, { rx: 22, ry: 28, look: [0, 2], glow }));
    g.push(`<path d="M ${L - 14} ${fy + 18} q 14 8 28 0" fill="none" stroke="${P.sweat}" stroke-width="6" stroke-linecap="round"/>`);
    g.push(`<path d="M ${R - 14} ${fy + 18} q 14 8 28 0" fill="none" stroke="${P.sweat}" stroke-width="6" stroke-linecap="round"/>`);
    g.push(brow(L, fy - 40, 22, 20, 2), brow(R, fy - 40, -22, 20, 2));
    g.push(wobblyMouth(fx, fy + 32, 16));
  }
  if (expr !== 'skeptic') g.push(blush(L - 6, fy + 30), blush(R + 6, fy + 30));
  else g.push(blush(R + 6, fy + 30));
  return g.join('');
}

// Capi: ojos más juntos, párpados a media asta.
function capiFace(expr = 'neutral') {
  const fx = 40, fy = -108, ex = 40;
  const L = fx - ex, R = fx + ex;
  const g = [];
  const glow = '#3C3F8F';
  if (expr === 'neutral') {
    g.push(eye(L, fy, { rx: 18, ry: 22, look: [-3, 4], glow, lid: 0.5, lidColor: P.blue, lidTilt: 1 }));
    g.push(eye(R, fy, { rx: 18, ry: 22, look: [-3, 4], glow, lid: 0.5, lidColor: P.blue, lidTilt: -1 }));
    g.push(`<path d="M ${fx - 8} ${fy + 30} L ${fx + 8} ${fy + 30}" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  } else if (expr === 'alarm') {
    // la «alarma» de Capi: ojos abiertos de golpe, pero contenido
    // ojos en blanco con pupila diminuta: el susto de quien nunca se altera
    for (const x of [L, R]) {
      g.push(`<ellipse cx="${x}" cy="${fy - 2}" rx="19" ry="23" fill="#fff" stroke="${P.ink}" stroke-width="5.5"/>`);
      g.push(`<circle cx="${x}" cy="${fy}" r="5.5" fill="${P.ink}"/>`);
    }
    g.push(brow(L, fy - 38, -14, 18, -3), brow(R, fy - 38, 14, 18, -3));
    g.push(`<ellipse cx="${fx}" cy="${fy + 33}" rx="7" ry="9" fill="${P.ink}"/>`);
  } else if (expr === 'happy') {
    g.push(happyEye(L, fy + 2, 14), happyEye(R, fy + 2, 14));
    g.push(`<path d="M ${fx - 12} ${fy + 26} C ${fx - 6} ${fy + 36} ${fx + 6} ${fy + 36} ${fx + 12} ${fy + 26}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  } else if (expr === 'skeptic') {
    // «¿en serio?»: un párpado más caído, ceja levantada, boca torcida
    g.push(eye(L, fy, { rx: 18, ry: 22, look: [-5, 3], glow, lid: 0.62, lidColor: P.blue, lidTilt: 2 }));
    g.push(eye(R, fy - 2, { rx: 18, ry: 22, look: [-5, 3], glow, lid: 0.3, lidColor: P.blue, lidTilt: -2 }));
    g.push(brow(R, fy - 36, -16, 20, -6));
    g.push(`<path d="M ${fx - 12} ${fy + 30} C ${fx - 4} ${fy + 32} ${fx + 4} ${fy + 30} ${fx + 12} ${fy + 24}" fill="none" stroke="${P.ink}" stroke-width="5.5" stroke-linecap="round"/>`);
  } else if (expr === 'sip') {
    g.push(happyEye(L, fy + 4, 13).replace('C', 'C'), '');
    g.push(`<path d="M ${L - 14} ${fy + 2} C ${L - 6} ${fy + 9} ${L + 6} ${fy + 9} ${L + 14} ${fy + 2}" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`);
  }
  if (expr === 'sip') {
    // sólo un ojo cerrado (el otro tapado por la taza en la escena)
    return `<path d="M ${L - 14} ${fy + 2} C ${L - 6} ${fy + 9} ${L + 6} ${fy + 9} ${L + 14} ${fy + 2}" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>
      <path d="M ${R - 14} ${fy + 2} C ${R - 6} ${fy + 9} ${R + 6} ${fy + 9} ${R + 14} ${fy + 2}" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>
      ${blush(L - 4, fy + 26, 13)}${blush(R + 4, fy + 26, 13)}`;
  }
  g.push(blush(L - 4, fy + 28, 13), blush(R + 4, fy + 28, 13));
  return g.join('');
}

function star(cx, cy, R, r, fill) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'} ${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/>`;
}

function openSmile(x, y, w, h) {
  return `<path d="M ${x - w} ${y} C ${x - w * 0.7} ${y + h * 1.3} ${x + w * 0.7} ${y + h * 1.3} ${x + w} ${y} C ${x + w * 0.4} ${y + 3} ${x - w * 0.4} ${y + 3} ${x - w} ${y} Z" fill="${P.ink}" stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M ${x - w * 0.5} ${y + h * 0.75} C ${x - w * 0.2} ${y + h * 0.45} ${x + w * 0.2} ${y + h * 0.45} ${x + w * 0.5} ${y + h * 0.75} C ${x + w * 0.25} ${y + h * 0.98} ${x - w * 0.25} ${y + h * 0.98} ${x - w * 0.5} ${y + h * 0.75} Z" fill="#FF6F8A"/>`;
}

function wobblyMouth(x, y, w) {
  return `<path d="M ${x - w} ${y} q ${w / 4} -7 ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0" fill="none" stroke="${P.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ---------- EXTREMIDADES ----------
// Brazo/pierna de gominola: una «salchicha» con extremo redondo.
function limb(x1, y1, x2, y2, w, fill) {
  const dx = x2 - x1, dy = y2 - y1;
  const mx = (x1 + x2) / 2 - dy * 0.12, my = (y1 + y2) / 2 + dx * 0.12;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  return `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="${w + OUT * 1.6}" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;
}

function sweatDrop(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M 0 -18 C 6 -8 13 0 13 8 C 13 16 7 21 0 21 C -7 21 -13 16 -13 8 C -13 0 -6 -8 0 -18 Z" fill="${P.sweat}" stroke="${P.ink}" stroke-width="4.5" stroke-linejoin="round"/>
  <path d="M -5 6 C -5 2 -3 -1 -1 -3" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></g>`;
}

// Taza humeante de Capi (local: centro de la base de la taza)
function mug(x, y, s = 1, opts = {}) {
  const steam = opts.steam !== false ? `
    <path d="M -14 -66 C -24 -78 -4 -86 -14 -100" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.95"/>
    <path d="M 8 -70 C -2 -84 18 -92 8 -110" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.95"/>` : '';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${steam}
    <path d="M 26 -44 C 50 -46 50 -14 24 -16" fill="none" stroke="${P.ink}" stroke-width="15" stroke-linecap="round"/>
    <path d="M 26 -44 C 50 -46 50 -14 24 -16" fill="none" stroke="${P.mug}" stroke-width="6" stroke-linecap="round"/>
    <path d="M -30 -56 L 30 -56 C 30 -30 28 -8 18 0 L -18 0 C -28 -8 -30 -30 -30 -56 Z" fill="${P.mug}"/>
    <path d="M 14 -56 L 30 -56 C 30 -30 28 -8 18 0 L 4 0 C 14 -10 16 -30 14 -56 Z" fill="${P.mugShade}"/>
    <ellipse cx="0" cy="-56" rx="30" ry="7" fill="#8A4B2E"/>
    <path d="M -30 -56 L 30 -56 C 30 -30 28 -8 18 0 L -18 0 C -28 -8 -30 -30 -30 -56 Z" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="0" cy="-56" rx="30" ry="7" fill="none" stroke="${P.ink}" stroke-width="5"/>
    <path d="M -20 -44 L -20 -20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
  </g>`;
}

// ---------- PERSONAJES COMPLETOS ----------
// pose: { arms: [[x1,y1,x2,y2],...] , legs: [...] }  (coords locales)
const MAPI_POSES = {
  stand: {
    arms: [[-136, -70, -160, -36], [74, -70, 100, -40]],
    legs: [[-60, -4, -62, 18], [24, -4, 26, 18]],
  },
  panic: {
    arms: [[-138, -86, -176, -134], [76, -90, 110, -140]],
    legs: [[-60, -4, -76, 18], [24, -4, 38, 18]],
  },
  run: {
    arms: [[-136, -76, -176, -56], [76, -80, 112, -108]],
    legs: [[-56, -4, -92, 4], [20, -4, 38, 24]],
  },
  cheer: {
    arms: [[-138, -90, -168, -144], [76, -94, 104, -150]],
    legs: [[-60, -4, -64, 18], [24, -4, 28, 18]],
  },
  hips: {
    arms: [[-138, -66, -158, -84], [76, -66, 100, -84]],
    legs: [[-60, -4, -62, 18], [24, -4, 26, 18]],
  },
};
const CAPI_POSES = {
  stand: {
    arms: [[-112, -70, -132, -34], [184, -60, 204, -26]],
    legs: [[-50, 2, -52, 22], [104, 2, 106, 22]],
  },
  mug: { // el brazo exterior sujeta la taza en el costado
    arms: [[-112, -70, -132, -34], [178, -78, 184, -48]],
    legs: [[-50, 2, -52, 22], [104, 2, 106, 22]],
  },
  cross: {
    arms: [[-110, -62, -40, -40], [184, -60, 110, -40]],
    legs: [[-50, 2, -52, 22], [104, 2, 106, 22]],
  },
  point: {
    arms: [[-112, -84, -152, -114], [184, -60, 204, -26]],
    legs: [[-50, 2, -52, 22], [104, 2, 106, 22]],
  },
  shrug: {
    arms: [[-112, -74, -148, -92], [184, -70, 220, -90]],
    legs: [[-50, 2, -52, 22], [104, 2, 106, 22]],
  },
};

const mapiShine = `<path d="M -126 -150 C -124 -170 -110 -188 -92 -196" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
  <circle cx="-134" cy="-128" r="5.5" fill="#fff" opacity="0.9"/>`;
const capiShine = `<path d="M 100 -218 C 118 -214 132 -200 136 -184" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.85"/>
  <circle cx="144" cy="-166" r="5.5" fill="#fff" opacity="0.85"/>`;

function mapi(o = {}) {
  const expr = o.expr || 'neutral';
  const pose = Object.assign({}, MAPI_POSES[o.pose || 'stand'], o.custom || {});
  const g = [];
  const limbs = (arr, w) => arr.map(a => limb(...a, w, P.red)).join('');
  if (o.behind) g.push(o.behind);
  g.push(limbs(pose.legs, 20));
  // pelos sueltos: dos pliegues que se le han «despeinado»
  g.push(`<path d="M -30 -252 C -40 -270 -22 -276 -30 -296 M -10 -246 C -4 -262 14 -262 12 -280" fill="none" stroke="${P.ink}" stroke-width="5" stroke-linecap="round"/>`);

  g.push(bodyGroup(MAPI_BODY, P.red, P.redShade, P.redLight, MAPI_FOLDS, { creases: MAPI_CREASES, shine: mapiShine, shadeShift: [-12, -12] }));
  g.push(mapiFace(expr));
  if (o.beforeArms) g.push(o.beforeArms);
  if (!o.noArms) g.push(limbs(pose.arms, 18));
  if (o.sweat) {
    g.push(sweatDrop(-166, -196, 0.9, -20), sweatDrop(100, -214, 0.75, 20));
    if (o.sweat > 1) g.push(sweatDrop(-178, -140, 0.6, -30));
  }
  if (o.extra) g.push(o.extra);
  return wrap(g.join(''), o);
}

function capi(o = {}) {
  const expr = o.expr || 'neutral';
  const poseName = o.pose || 'stand';
  const pose = Object.assign({}, CAPI_POSES[poseName], o.custom || {});
  const g = [];
  const limbs = (arr, w) => arr.map(a => limb(...a, w, P.blue)).join('');
  if (o.behind) g.push(o.behind);
  g.push(limbs(pose.legs, 24));
  g.push(bodyGroup(CAPI_BODY, P.blue, P.blueShade, P.blueLight, CAPI_FOLDS, { creases: CAPI_CREASES, shine: capiShine, shadeShift: [12, -12] }));
  g.push(`<g transform="translate(40 -100) scale(1.2) translate(-40 100)">${capiFace(expr)}</g>`);
  if (poseName === 'mug') {
    g.push(mug(204, -8, 0.95));
    g.push(limbs(pose.arms, 20));
  } else {
    if (o.beforeArms) g.push(o.beforeArms);
    if (!o.noArms) g.push(limbs(pose.arms, 20));
  }
  if (o.extra) g.push(o.extra);
  return wrap(g.join(''), o);
}

function wrap(inner, o) {
  const x = o.x || 0, y = o.y || 0, s = o.s || 1, r = o.r || 0, flip = o.flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s * flip} ${s})">${inner}</g>`;
}

module.exports = { MAPI_CREASES, CAPI_CREASES, P, mapi, capi, mug, sweatDrop, star, limb, MAPI_BODY, CAPI_BODY, MAPI_FOLDS, CAPI_FOLDS, bodyGroup, mapiFace, capiFace, MAPI_CURL, OUT, blush, eye, happyEye, mapiShine, capiShine };
