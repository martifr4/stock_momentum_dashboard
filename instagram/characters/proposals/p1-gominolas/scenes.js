// Escenas de la propuesta «Gominolas» (ronda 2). Cada escena devuelve {w, h, body}.
const C = require('./chars.js');
const { P, mapi, capi, sweatDrop } = C;

const BG = { mint: '#CDEFDF', lilac: '#E2DAFF', butter: '#FFEDB0', sky: '#D3E9FF', peach: '#FFD9CC' };
const SHADOW = { mint: '#A9DEC6', lilac: '#C9BDF5', butter: '#F5D98A', sky: '#B4D5F7', peach: '#F7BDAA' };
const FONT = "font-family:'Fredoka',sans-serif";

// ---------- ACCESORIOS ----------
const ground = (x, y, w, color) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.14}" fill="${color}"/>`;

// Bolsa colgando de la mano (origen = mano). `tag` se dibuja colgando del asa.
function bag(color, shade, rot = 0, label = '', tag = '') {
  return `<g transform="rotate(${rot})">
    ${tag}
    <path d="M -18 34 C -18 0 18 0 18 34" fill="none" stroke="${P.ink}" stroke-width="13" stroke-linecap="round"/>
    <path d="M -18 34 C -18 0 18 0 18 34" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M -42 30 L 42 30 L 48 118 C 48 124 44 128 38 128 L -38 128 C -44 128 -48 124 -48 118 Z" fill="${color}"/>
    <path d="M 22 30 L 42 30 L 48 118 C 48 124 44 128 38 128 L 26 128 Z" fill="${shade}"/>
    <path d="M -42 30 L 42 30 L 48 118 C 48 124 44 128 38 128 L -38 128 C -44 128 -48 124 -48 118 Z" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/>
    ${label}
  </g>`;
}
// Etiqueta de precio; el cordel sale de (sx,sy) en coords locales de la etiqueta
function priceTag(x, y, rot, text, size = 1, string = null) {
  const str = string ? `<path d="${string}" fill="none" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/>` : '';
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${size})">
    ${str}
    <path d="M -46 -28 L 76 -28 C 84 -28 90 -22 90 -14 L 90 20 C 90 28 84 34 76 34 L -46 34 L -76 3 Z" fill="#FFE27A" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="-50" cy="3" r="6.5" fill="${P.ink}"/>
    <text x="22" y="17" text-anchor="middle" style="${FONT};font-weight:700;font-size:40px" fill="${P.ink}">${text}</text>
  </g>`;
}
function coin(x, y, r = 22, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <circle r="${r}" fill="#FFD23F" stroke="${P.ink}" stroke-width="6"/>
    <circle r="${r * 0.58}" fill="none" stroke="#E9A92A" stroke-width="4"/>
    <text x="0" y="${r * 0.32}" text-anchor="middle" style="${FONT};font-weight:700;font-size:${r * 0.95}px" fill="#C9831A">€</text>
    <path d="M ${-r * 0.55} ${-r * 0.35} C ${-r * 0.45} ${-r * 0.6} ${-r * 0.25} ${-r * 0.72} 0 ${-r * 0.75}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  </g>`;
}
// Monedero de boquilla rectangular, abierto, boca abajo (el cierre mira al suelo).
// Origen = centro del cuerpo. Dibujado derecho y girado 180°.
function purse(x, y, rot = 180) {
  const metal = '#E9EDF7';
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M -58 -24 L 58 -24 L 58 44 C 58 54 52 60 42 60 L -42 60 C -52 60 -58 54 -58 44 Z" fill="#9C6BE6"/>
    <path d="M 30 -24 L 58 -24 L 58 44 C 58 54 52 60 42 60 L 30 60 Z" fill="#7646C4"/>
    <path d="M -58 -24 L 58 -24 L 58 44 C 58 54 52 60 42 60 L -42 60 C -52 60 -58 54 -58 44 Z" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M -40 4 L 40 4 M -40 22 L 26 22" stroke="#B994F2" stroke-width="5" stroke-linecap="round"/>
    <!-- boquilla abierta: dos mandíbulas metálicas separadas -->
    <ellipse cx="0" cy="-26" rx="54" ry="12" fill="${P.ink}"/>
    <path d="M -60 -24 C -60 -46 -36 -62 -10 -66" fill="none" stroke="${P.ink}" stroke-width="15" stroke-linecap="round"/>
    <path d="M 60 -24 C 60 -46 36 -62 10 -66" fill="none" stroke="${P.ink}" stroke-width="15" stroke-linecap="round"/>
    <path d="M -60 -24 C -60 -46 -36 -62 -10 -66" fill="none" stroke="${metal}" stroke-width="7" stroke-linecap="round"/>
    <path d="M 60 -24 C 60 -46 36 -62 10 -66" fill="none" stroke="${metal}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="-10" cy="-70" r="9" fill="#FFD23F" stroke="${P.ink}" stroke-width="5"/>
    <circle cx="10" cy="-70" r="9" fill="#FFD23F" stroke="${P.ink}" stroke-width="5"/>
  </g>`;
}
// Bocadillo redondo con cola
function bubble(x, y, w, h, tail, lines, o = {}) {
  const r = Math.min(h / 2, 46), fs = o.fs || 46, [tx, ty] = tail;
  const bx = Math.max(x - w / 2 + r + 10, Math.min(x + w / 2 - r - 10, tx));
  const by = ty > y ? y + h / 2 - 2 : y - h / 2 + 2;
  const tailPath = `M ${bx - 22} ${by} Q ${(bx + tx) / 2 - 6} ${(by + ty) / 2} ${tx} ${ty} Q ${(bx + tx) / 2 + 12} ${(by + ty) / 2} ${bx + 22} ${by} Z`;
  const rect = `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${r}" ry="${r}"/>`;
  const lh = fs * 1.12, y0 = y - ((lines.length - 1) * lh) / 2 + fs * 0.35;
  return `<g>
    <g fill="${P.ink}" transform="translate(6 7)">${rect}<path d="${tailPath}"/></g>
    <g fill="#fff" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round">${rect}<path d="${tailPath}"/></g>
    <path d="M ${bx - 18} ${by} L ${bx + 18} ${by}" stroke="#fff" stroke-width="9"/>
    ${lines.map((l, i) => `<text x="${x}" y="${y0 + i * lh}" text-anchor="middle" style="${FONT};font-weight:600;font-size:${fs}px" fill="${P.ink}">${l}</text>`).join('')}
  </g>`;
}
function stickerFilter(idName, r = 10, shadow = true) {
  return `<filter id="${idName}" x="-20%" y="-20%" width="140%" height="140%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d"/>
    <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="white"/>
    ${shadow ? `<feOffset in="d" dx="0" dy="${r * 0.6}" result="so"/><feFlood flood-color="${P.ink}" flood-opacity="0.18"/><feComposite in2="so" operator="in" result="sh"/>` : ''}
    <feMerge>${shadow ? '<feMergeNode in="sh"/>' : ''}<feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

// ---------- ABRAZO: un solo cerebro ----------
// Los dos cuerpos se solapan; primero se pintan los dos contornos gruesos, luego
// los dos rellenos encima → el contorno interior desaparece y queda UNA silueta
// cerrada. La costura es una cisura fina (el contorno de Mapi recortado dentro de Capi).
let hugN = 0;
function hug(o = {}) {
  const n = ++hugN;
  const mT = 'translate(-62 0) scale(0.94)';
  const cT = 'translate(92 0) scale(1.0)';
  const exprM = o.exprM || 'happy', exprC = o.exprC || 'happy';
  const heart = o.heart === false ? '' : `<g transform="translate(-14 -282)">
    <path d="M 0 0 C -10 -14 -30 -10 -30 6 C -30 22 -10 32 0 44 C 10 32 30 22 30 6 C 30 -10 10 -14 0 0 Z" fill="${P.mouth}" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M -18 4 C -18 -2 -14 -5 -10 -5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>`;
  const legs = `<g transform="${mT}">${C.limb(-34, -4, -38, 18, 20, P.red)}</g>
    <g transform="${cT}">${C.limb(70, -2, 72, 20, 24, P.blue)}${C.limb(-40, -2, -40, 20, 24, P.blue)}</g>`;
  return `<g transform="translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})">
    <defs><clipPath id="hugc${n}"><path d="${C.CAPI_BODY}" transform="${cT}"/></clipPath></defs>
    ${legs}
    <g transform="${mT}">${C.curl()}</g>
    <path d="${C.MAPI_BODY}" transform="${mT}" fill="none" stroke="${P.ink}" stroke-width="${C.OUT * 2 / 0.94}" stroke-linejoin="round"/>
    <path d="${C.CAPI_BODY}" transform="${cT}" fill="none" stroke="${P.ink}" stroke-width="${C.OUT * 2}" stroke-linejoin="round"/>
    <g transform="${cT}">${C.capiBody({ noOutline: true })}</g>
    <g transform="${mT}">${C.mapiBody({ noOutline: true })}</g>
    <g clip-path="url(#hugc${n})"><path d="${C.MAPI_BODY}" transform="${mT}" fill="none" stroke="${P.ink}" stroke-width="${C.IN + 1}"/></g>
    <g transform="${mT}">${C.mapiFace(exprM)}</g>
    <g transform="${cT} translate(20 4)">${C.capiFace(exprC)}</g>
    <g transform="${mT}">${C.limb(-100, -76, -126, -46, 18, P.red)}</g>
    <g transform="${cT}">${C.limb(160, -66, 182, -34, 20, P.blue)}</g>
    ${heart}
  </g>`;
}

function logo(x, y, size = 1, color = P.ink) {
  return `<g transform="translate(${x} ${y})">
    ${hug({ x: -50 * size, y: 15 * size, s: 0.14 * size, heart: false })}
    <text x="0" y="${4 * size}" style="${FONT};font-weight:600;font-size:${30 * size}px;letter-spacing:0.5px" fill="${color}">Dinero Irracional</text>
  </g>`;
}

module.exports = {
  // ---------- HERO ----------
  hero: () => {
    const W = 1080, H = 1350;
    // la etiqueta va atada al asa de la bolsa amarilla y sale volando hacia atrás
    const flyingTag = priceTag(-78, -52, -24, '−70 %', 0.62, 'M 92 6 C 110 14 124 40 130 58');
    const bagL = bag('#FFE27A', '#F2BE3C', 10, `<text x="0" y="96" text-anchor="middle" style="${FONT};font-weight:700;font-size:34px" fill="${P.ink}">%</text>`, flyingTag);
    const bagR = bag('#9EE6C4', '#6CCBA0', -12,
      `<path d="M 0 98 C -10 90 -20 82 -20 72 C -20 62 -6 60 0 70 C 6 60 20 62 20 72 C 20 82 10 90 0 98 Z" fill="${P.mouth}" stroke="${P.ink}" stroke-width="5" stroke-linejoin="round"/>`);
    const m = mapi({
      x: 344, y: 1036, s: 1.3, r: -8, expr: 'euphoria', sweat: 2,
      custom: { arms: [[-100, -92, -150, -108], [100, -100, 118, -172]] },
      beforeArms: `<g transform="translate(-150 -108)">${bagL}</g><g transform="translate(118 -172)">${bagR}</g>`,
    });
    const c = capi({ x: 784, y: 1022, s: 1.0, expr: 'skeptic', pose: 'mug' });
    const speed = `<g stroke="${P.ink}" stroke-width="7" stroke-linecap="round"><path d="M 30 1000 L 70 1000"/><path d="M 22 1040 L 52 1040"/></g>`;
    return {
      w: W, h: H,
      body: `<rect width="${W}" height="${H}" fill="${BG.mint}"/>
      <g fill="${SHADOW.mint}"><circle cx="120" cy="250" r="10"/><circle cx="960" cy="200" r="14"/><circle cx="1000" cy="520" r="8"/><circle cx="560" cy="60" r="8"/></g>
      ${logo(540 - 120, 130, 1)}
      ${ground(344, 1066, 160, SHADOW.mint)}
      ${ground(790, 1046, 190, SHADOW.mint)}
      ${speed}
      ${c}
      ${m}
      ${bubble(400, 360, 560, 170, [380, 580], ['¡Pero estaba', 'rebajado!'], { fs: 58 })}
      ${bubble(820, 640, 300, 110, [790, 800], ['Mapi, no.'], { fs: 50 })}
      <text x="540" y="1190" text-anchor="middle" style="${FONT};font-weight:600;font-size:40px" fill="${P.ink}">Dos formas de pensar, un mismo cerebro.</text>
      <text x="540" y="1242" text-anchor="middle" style="${FONT};font-weight:500;font-size:34px" fill="${P.ink}" opacity="0.7">Uno compra primero. El otro piensa después.</text>`,
    };
  },

  // ---------- HOJA DE EXPRESIONES ----------
  expressions: () => {
    const W = 1080, H = 1350;
    const cw = 240, ch = 430, gap = 16, x0 = (W - (4 * cw + 3 * gap)) / 2;
    const labels = ['Neutral', '¡Alarma!', 'Feliz', '¿En serio?'];
    const mapiStates = [
      { expr: 'neutral', pose: 'stand' },
      { expr: 'alarm', pose: 'panic', sweat: 2 },
      { expr: 'happy', pose: 'cheer' },
      { expr: 'skeptic', pose: 'hips' },
    ];
    const capiStates = [
      { expr: 'neutral', pose: 'mug', dx: -30, s: 0.56 },
      { expr: 'alarm', pose: 'shrug', dx: 0, s: 0.56 },
      { expr: 'happy', pose: 'mug', dx: -30, s: 0.56 },
      { expr: 'skeptic', pose: 'point', dx: 10, s: 0.56 },
    ];
    const row = (y, who, states, color, light) => {
      const panel = `<rect x="${x0}" y="${y}" width="${4 * cw + 3 * gap}" height="${ch}" rx="40" fill="#fff" stroke="${P.ink}" stroke-width="6"/>`;
      return panel + states.map((st, i) => {
        const x = x0 + i * (cw + gap);
        const fig = who === 'm'
          ? mapi(Object.assign({ x: x + cw / 2 + 4, y: y + 318, s: 0.78 }, st))
          : capi(Object.assign({ x: x + cw / 2 + st.dx, y: y + 318 }, st));
        return `${ground(x + cw / 2, y + 334, 92, light)}${fig}
        <rect x="${x + 22}" y="${y + ch - 76}" width="${cw - 44}" height="54" rx="27" fill="${color}"/>
        <text x="${x + cw / 2}" y="${y + ch - 38}" text-anchor="middle" style="${FONT};font-weight:600;font-size:30px" fill="#fff">${labels[i]}</text>`;
      }).join('');
    };
    const head = (y, name, sub, color) => `<circle cx="${x0 + 18}" cy="${y - 12}" r="14" fill="${color}" stroke="${P.ink}" stroke-width="5"/>
      <text x="${x0 + 46}" y="${y}" style="${FONT};font-weight:700;font-size:40px" fill="${P.ink}">${name}<tspan dx="16" style="font-weight:500;font-size:28px" fill-opacity="0.65">${sub}</tspan></text>`;
    return {
      w: W, h: H,
      body: `<rect width="${W}" height="${H}" fill="${BG.lilac}"/>
      <text x="${x0}" y="98" style="${FONT};font-weight:700;font-size:58px" fill="${P.ink}">Hoja de expresiones</text>
      ${logo(W - x0 - 270, 92, 0.9)}
      ${head(184, 'Mapi', 'Sistema 1 · rápido, emocional', P.red)}
      ${row(212, 'm', mapiStates, P.red, '#FFE0E6')}
      ${head(730, 'Capi', 'Sistema 2 · lento, deliberado', P.blue)}
      ${row(758, 'c', capiStates, P.blue, '#DCE5FA')}
      <text x="${W / 2}" y="${H - 50}" text-anchor="middle" style="${FONT};font-weight:500;font-size:26px" fill="${P.ink}" opacity="0.6">Propuesta 1 · «Gominolas» · ronda 2</text>`,
    };
  },

  // ---------- PORTADA ----------
  'cover-mock': () => {
    const W = 1080, H = 1350;
    const m = mapi({
      x: 330, y: 1150, s: 1.32, r: 4, expr: 'alarm',
      custom: { arms: [[-100, -96, -138, -52], [100, -104, 124, -186]], rigid: true },
      extra: `${sweatDrop(-126, -214, 0.9, -20)}${sweatDrop(-140, -160, 0.6, -30)}`,
      beforeArms: purse(156, -232, 172),
    });
    const c = capi({ x: 800, y: 1140, s: 0.94, expr: 'skeptic', pose: 'mug' });
    const coins = [[566, 900, 22, 10], [540, 990, 24, -20], [590, 1060, 20, 30], [556, 1128, 20, 0]].map(a => coin(...a)).join('');
    const fall = `<g stroke="${P.ink}" stroke-width="5" stroke-linecap="round"><path d="M 600 930 L 600 954"/><path d="M 506 1020 L 506 1044"/><path d="M 620 1094 L 620 1114"/></g>`;
    const title = `
      <g filter="url(#stk)"><g transform="translate(190 330) rotate(-8)">
        <circle r="124" fill="${P.red}" stroke="${P.ink}" stroke-width="9"/>
        <path d="M -82 -42 C -70 -78 -40 -98 -8 -102" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.9"/>
        <text x="0" y="70" text-anchor="middle" style="${FONT};font-weight:700;font-size:210px" fill="#fff">7</text>
      </g></g>
      <text x="352" y="306" style="${FONT};font-weight:700;font-size:128px" fill="${P.ink}">sesgos</text>
      <text x="356" y="406" style="${FONT};font-weight:600;font-size:72px" fill="${P.ink}">que te <tspan fill="${P.redShade}">vacían</tspan></text>
      <path d="M 600 428 q 23 -13 46 0 t 46 0 t 46 0 t 46 0" fill="none" stroke="${P.redShade}" stroke-width="7" stroke-linecap="round"/>
      <text x="540" y="548" text-anchor="middle" style="${FONT};font-weight:600;font-size:80px" fill="${P.ink}">la cuenta cada mes</text>`;
    return {
      w: W, h: H,
      body: `<defs>${stickerFilter('stk', 10)}</defs>
      <rect width="${W}" height="${H}" fill="${BG.butter}"/>
      <g fill="${SHADOW.butter}"><circle cx="980" cy="640" r="12"/><circle cx="80" cy="680" r="9"/><circle cx="1010" cy="120" r="8"/></g>
      ${logo(80 + 50, 112, 0.85)}
      ${title}
      ${ground(330, 1176, 165, SHADOW.butter)}
      ${ground(806, 1162, 180, SHADOW.butter)}
      ${fall}${c}${m}${coins}
      ${bubble(850, 770, 340, 150, [830, 900], ['Espera…', 'déjame pensarlo.'], { fs: 38 })}
      <g transform="translate(${W - 72} ${H - 60})">
        <rect x="-232" y="-40" width="232" height="66" rx="33" fill="${P.ink}"/>
        <text x="-116" y="6" text-anchor="middle" style="${FONT};font-weight:600;font-size:32px" fill="#fff">Desliza  →</text>
      </g>`,
    };
  },

  // ---------- AVATAR ----------
  avatar: () => ({
    w: 640, h: 640, outW: 320, outH: 320,
    body: `<defs>${stickerFilter('stk', 9)}</defs>
    <rect width="640" height="640" fill="${BG.butter}"/>
    <g filter="url(#stk)">${hug({ x: 304, y: 462, s: 1.12 })}</g>`,
  }),
};

// ---------- PRUEBA A 150 px + VALORES EN GRIS ----------
module.exports['check-150px'] = () => {
  const av = module.exports.avatar();
  const m = mapi({ expr: 'neutral', sweat: 1 });
  const c = capi({ expr: 'neutral', pose: 'mug' });
  const sil = (g) => `<g filter="url(#sil)">${g}</g>`;
  const gray = (g) => `<g filter="url(#gray)">${g}</g>`;
  return {
    w: 1180, h: 640,
    body: `<defs><clipPath id="cc"><circle cx="75" cy="75" r="75"/></clipPath>
      <filter id="sil"><feFlood flood-color="#33203A"/><feComposite in2="SourceAlpha" operator="in"/></filter>
      <filter id="gray"><feColorMatrix type="saturate" values="0"/></filter></defs>
      <rect width="1180" height="640" fill="#fff"/>
      <text x="20" y="40" style="${FONT};font-weight:600;font-size:24px" fill="${P.ink}">Avatar y personajes a 150 px · siluetas · valores en gris</text>
      <g transform="translate(20 70)"><g clip-path="url(#cc)"><g transform="scale(${150 / 640})">${av.body}</g></g></g>
      <g transform="translate(270 240) scale(${150 / 280})">${m}</g>
      <g transform="translate(480 240) scale(${150 / 440})">${c}</g>
      <g transform="translate(270 430) scale(${150 / 280})">${sil(m)}</g>
      <g transform="translate(480 430) scale(${150 / 440})">${sil(c)}</g>
      <g transform="translate(270 620) scale(${150 / 280})">${gray(m)}</g>
      <g transform="translate(480 620) scale(${150 / 440})">${gray(c)}</g>
      <g transform="translate(860 330) scale(0.7)">${sil(hug({ heart: false }))}</g>
      <g transform="translate(860 610) scale(0.7)">${gray(hug({ heart: false }))}</g>`,
  };
};
module.exports._lib = { BG, SHADOW, bag, priceTag, coin, purse, bubble, stickerFilter, hug, logo, ground };
