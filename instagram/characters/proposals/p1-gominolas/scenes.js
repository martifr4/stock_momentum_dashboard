// Escenas de la propuesta «Gominolas». Cada escena devuelve {w, h, body}.
const C = require('./chars.js');
const { P, mapi, capi, sweatDrop, star } = C;

const BG = { mint: '#CDEFDF', lilac: '#E2DAFF', butter: '#FFEDB0', sky: '#D3E9FF', peach: '#FFD9CC' };
const SHADOW = { mint: '#A9DEC6', lilac: '#C9BDF5', butter: '#F5D98A', sky: '#B4D5F7', peach: '#F7BDAA' };
const FONT = "font-family:'Fredoka',sans-serif";

// ---------- ACCESORIOS ----------
function ground(x, y, w, color) {
  return `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.14}" fill="${color}"/>`;
}

// Bolsa de la compra colgando de la mano (hx,hy)
function bag(hx, hy, color, shade, rot = 0, label = '') {
  return `<g transform="translate(${hx} ${hy}) rotate(${rot})">
    <path d="M -18 34 C -18 0 18 0 18 34" fill="none" stroke="${P.ink}" stroke-width="13" stroke-linecap="round"/>
    <path d="M -18 34 C -18 0 18 0 18 34" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M -42 30 L 42 30 L 48 118 C 48 124 44 128 38 128 L -38 128 C -44 128 -48 124 -48 118 Z" fill="${color}"/>
    <path d="M 22 30 L 42 30 L 48 118 C 48 124 44 128 38 128 L 26 128 Z" fill="${shade}"/>
    <path d="M -42 30 L 42 30 L 48 118 C 48 124 44 128 38 128 L -38 128 C -44 128 -48 124 -48 118 Z" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/>
    ${label}
  </g>`;
}

function priceTag(x, y, rot, text, size = 1) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${size})">
    <path d="M -58 3 C -80 -10 -96 -30 -90 -54" fill="none" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/>
    <path d="M -46 -28 L 76 -28 C 84 -28 90 -22 90 -14 L 90 20 C 90 28 84 34 76 34 L -46 34 L -76 3 Z" fill="#FFE27A" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="-50" cy="3" r="6.5" fill="${P.ink}"/>
    <text x="22" y="17" text-anchor="middle" style="${FONT};font-weight:700;font-size:40px" fill="${P.ink}">${text}</text>
  </g>`;
}

function coin(x, y, r = 22, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <ellipse cx="0" cy="0" rx="${r}" ry="${r}" fill="#FFD23F" stroke="${P.ink}" stroke-width="6"/>
    <ellipse cx="0" cy="0" rx="${r * 0.58}" ry="${r * 0.58}" fill="none" stroke="#E9A92A" stroke-width="4"/>
    <text x="0" y="${r * 0.32}" text-anchor="middle" style="${FONT};font-weight:700;font-size:${r * 0.95}px" fill="#C9831A">€</text>
    <path d="M ${-r * 0.55} ${-r * 0.35} C ${-r * 0.45} ${-r * 0.6} ${-r * 0.25} ${-r * 0.72} 0 ${-r * 0.75}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  </g>`;
}

// Monedero de boquilla (kiss-lock), abierto. Dibujado boca abajo si rot≈180.
function purse(x, y, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M -62 -14 C -70 36 -42 64 0 64 C 42 64 70 36 62 -14 Z" fill="#9C6BE6"/>
    <path d="M 30 -14 L 62 -14 C 70 36 42 64 0 64 C 30 50 40 20 30 -14 Z" fill="#7646C4"/>
    <path d="M -62 -14 C -70 36 -42 64 0 64 C 42 64 70 36 62 -14 Z" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/>
    <ellipse cx="0" cy="-16" rx="56" ry="13" fill="${P.ink}"/>
    <path d="M -64 -16 C -50 -40 -16 -42 -4 -30" fill="none" stroke="${P.ink}" stroke-width="14" stroke-linecap="round"/>
    <path d="M 64 -16 C 50 -40 16 -42 4 -30" fill="none" stroke="${P.ink}" stroke-width="14" stroke-linecap="round"/>
    <path d="M -64 -16 C -50 -40 -16 -42 -4 -30" fill="none" stroke="#E9EDF7" stroke-width="6" stroke-linecap="round"/>
    <path d="M 64 -16 C 50 -40 16 -42 4 -30" fill="none" stroke="#E9EDF7" stroke-width="6" stroke-linecap="round"/>
    <circle cx="-4" cy="-32" r="7" fill="#E9EDF7" stroke="${P.ink}" stroke-width="4.5"/>
    <circle cx="4" cy="-32" r="7" fill="#E9EDF7" stroke="${P.ink}" stroke-width="4.5"/>
    <path d="M -40 20 C -38 36 -28 46 -16 50" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  </g>`;
}

// Bocadillo redondo con cola. (x,y) = centro; tail = punta de la cola.
function bubble(x, y, w, h, tail, lines, o = {}) {
  const r = Math.min(h / 2, 46);
  const fs = o.fs || 46;
  const [tx, ty] = tail;
  const bx = Math.max(x - w / 2 + r + 10, Math.min(x + w / 2 - r - 10, tx));
  const by = ty > y ? y + h / 2 - 2 : y - h / 2 + 2;
  const fill = o.fill || '#fff';
  const tailPath = `M ${bx - 22} ${by} Q ${(bx + tx) / 2 - 6} ${(by + ty) / 2} ${tx} ${ty} Q ${(bx + tx) / 2 + 12} ${(by + ty) / 2} ${bx + 22} ${by} Z`;
  const rect = `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${r}" ry="${r}"/>`;
  const lh = fs * 1.12;
  const y0 = y - ((lines.length - 1) * lh) / 2 + fs * 0.35;
  return `<g>
    <g fill="${P.ink}" transform="translate(6 7)">${rect}<path d="${tailPath}"/></g>
    <g fill="${fill}" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round">${rect}<path d="${tailPath}"/></g>
    <path d="M ${bx - 18} ${by} L ${bx + 18} ${by}" stroke="${fill}" stroke-width="9"/>
    ${lines.map((l, i) => `<text x="${x}" y="${y0 + i * lh}" text-anchor="middle" style="${FONT};font-weight:600;font-size:${fs}px" fill="${o.color || P.ink}">${l}</text>`).join('')}
  </g>`;
}

// Filtro de pegatina: contorno blanco grueso alrededor de todo el grupo
function stickerFilter(idName, r = 10, shadow = true) {
  return `<filter id="${idName}" x="-20%" y="-20%" width="140%" height="140%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d"/>
    <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="white"/>
    ${shadow ? `<feOffset in="d" dx="0" dy="${r * 0.6}" result="so"/><feFlood flood-color="${P.ink}" flood-opacity="0.18"/><feComposite in2="so" operator="in" result="sh"/>` : ''}
    <feMerge>${shadow ? '<feMergeNode in="sh"/>' : ''}<feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

// Abrazo: las dos mitades encajan por su lado plano y forman un cerebro-corazón.
function hug(o = {}) {
  const tilt = o.tilt == null ? 5 : o.tilt;
  const exprM = o.exprM || 'happy', exprC = o.exprC || 'happy';
  // brazos que cruzan la costura (se dibujan por encima de ambos cuerpos)
  const armC = C.limb(6, -64, -58, -50, 20, P.blue);   // Capi rodea a Mapi por abajo
  const armM = C.limb(-4, -150, 64, -170, 18, P.red);  // Mapi pasa el brazo por el hombro de Capi
  const heart = o.heart === false ? '' : `<path d="M 0 -268 C -10 -282 -30 -278 -30 -262 C -30 -246 -10 -236 0 -224 C 10 -236 30 -246 30 -262 C 30 -278 10 -282 0 -268 Z" fill="#FF6F8A" stroke="${P.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M -18 -264 C -18 -270 -14 -273 -10 -273" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
  return `<g transform="translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})">
    <g transform="rotate(${tilt})">
      ${capi({ x: 112, y: 0, s: 0.96, expr: exprC, noArms: true })}
      ${C.limb(286, -62, 308, -30, 19, P.blue)}
    </g>
    <g transform="rotate(${-tilt})">
      ${mapi({ x: -80, y: 0, s: 1, expr: exprM, noArms: true })}
      ${C.limb(-216, -70, -240, -40, 18, P.red)}
    </g>
    <g transform="rotate(${-tilt})">${armC}</g>
    <g transform="rotate(${-tilt})">${armM}</g>
    <g transform="translate(0 -12)">${heart}</g>
  </g>`;
}

function logo(x, y, size = 1, color = P.ink) {
  return `<g transform="translate(${x} ${y})">
    ${hug({ x: -62 * size, y: 16 * size, s: 0.16 * size, heart: false })}
    <text x="${0}" y="${4 * size}" style="${FONT};font-weight:600;font-size:${30 * size}px;letter-spacing:0.5px" fill="${color}">Dinero Irracional</text>
  </g>`;
}

module.exports = {
  // ---------- HERO ----------
  hero: () => {
    const W = 1080, H = 1350;
    const bagL = bag(0, 0, '#FFE27A', '#F2BE3C', 14,
      `<text x="0" y="96" text-anchor="middle" style="${FONT};font-weight:700;font-size:34px" fill="${P.ink}">%</text>`);
    const bagR = bag(0, 0, '#9EE6C4', '#6CCBA0', -14,
      `<path d="M 0 98 C -10 90 -20 82 -20 72 C -20 62 -6 60 0 70 C 6 60 20 62 20 72 C 20 82 10 90 0 98 Z" fill="#FF6F8A" stroke="${P.ink}" stroke-width="5" stroke-linejoin="round"/>`);
    const mapiArms = { arms: [[-138, -82, -184, -100], [76, -100, 100, -178]], legs: [[-60, -4, -84, 10], [22, -4, 30, 20]] };
    const m = mapi({
      x: 372, y: 1040, s: 1.32, r: -6, expr: 'euphoria', sweat: 2, custom: mapiArms,
      beforeArms: `<g transform="translate(-186 -100)">${bagL}</g><g transform="translate(100 -178)">${bagR}</g>`,
    });
    const c = capi({ x: 796, y: 1025, s: 1.13, expr: 'skeptic', pose: 'mug' });
    // líneas de velocidad de Mapi
    const speed = `<g stroke="${P.ink}" stroke-width="7" stroke-linecap="round" opacity="0.9">
      <path d="M 60 840 L 100 840"/><path d="M 44 884 L 76 884"/></g>`;
    return {
      w: W, h: H,
      body: `<rect width="${W}" height="${H}" fill="${BG.mint}"/>
      <!-- motitas de fondo -->
      <g fill="${SHADOW.mint}">
        <circle cx="120" cy="170" r="10"/><circle cx="960" cy="140" r="14"/><circle cx="1000" cy="560" r="8"/>
        <circle cx="70" cy="560" r="12"/><circle cx="540" cy="70" r="8"/>
      </g>
      ${ground(372, 1070, 170, SHADOW.mint)}
      ${ground(810, 1058, 210, SHADOW.mint)}
      ${speed}
      ${c}
      ${m}
      ${priceTag(160, 620, -14, '−70 %', 0.95)}
      ${bubble(400, 380, 560, 170, [420, 590], ['¡Pero estaba', 'rebajado!'], { fs: 58 })}
      ${bubble(830, 610, 300, 110, [800, 730], ['Mapi, no.'], { fs: 50, fill: '#fff' })}
      <text x="540" y="1200" text-anchor="middle" style="${FONT};font-weight:600;font-size:40px" fill="${P.ink}">Dos mitades de un mismo cerebro.</text>
      <text x="540" y="1252" text-anchor="middle" style="${FONT};font-weight:500;font-size:34px" fill="${P.ink}" opacity="0.7">Una compra primero. La otra piensa después.</text>
      ${logo(540 - 110, 160, 1)}
      `,
    };
  },
};

module.exports.avatar = () => ({
  w: 640, h: 640, outW: 320, outH: 320,
  body: `<defs>${stickerFilter('stk', 9)}</defs>
  <rect width="640" height="640" fill="${BG.butter}"/>
  <circle cx="320" cy="320" r="300" fill="${BG.butter}"/>
  <g filter="url(#stk)">${hug({ x: 300, y: 458, s: 0.98 })}</g>`,
});
module.exports._hugtest = () => ({
  w: 1080, h: 700,
  body: `<defs>${stickerFilter('stk', 12)}</defs><rect width="1080" height="700" fill="${BG.butter}"/>
  <g filter="url(#stk)">${hug({ x: 520, y: 560, s: 1.4 })}</g>`,
});
module.exports.expressions = () => {
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
    { expr: 'neutral', pose: 'mug' },
    { expr: 'alarm', pose: 'shrug', extra: `<g stroke="${P.ink}" stroke-width="6" stroke-linecap="round"><path d="M -40 -292 L -48 -318"/><path d="M 40 -300 L 40 -328"/><path d="M 116 -286 L 128 -310"/></g>` },
    { expr: 'happy', pose: 'mug' },
    { expr: 'skeptic', pose: 'point' },
  ];
  const row = (y, who, states, color, light) => {
    const panel = `<rect x="${x0}" y="${y}" width="${4 * cw + 3 * gap}" height="${ch}" rx="40" fill="#fff" stroke="${P.ink}" stroke-width="6"/>`;
    const seps = [1, 2, 3].map(i => { const sx = x0 + i * (cw + gap) - gap / 2; return `<path d="M ${sx} ${y + 40} L ${sx} ${y + ch - 110}" stroke="${light}" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 14"/>`; }).join('');
    return panel + seps + states.map((st, i) => {
      const x = x0 + i * (cw + gap);
      const ch2 = who === 'm'
        ? mapi(Object.assign({ x: x + cw / 2 + 16, y: y + 320, s: 0.8 }, st))
        : capi(Object.assign({ x: x + cw / 2 - (st.pose === 'mug' ? 34 : 34), y: y + 318, s: st.pose === 'mug' ? 0.6 : 0.63 }, st));
      return `${ground(x + cw / 2, y + 334, 86, light)}
      ${ch2}
      <rect x="${x + 22}" y="${y + ch - 76}" width="${cw - 44}" height="54" rx="27" fill="${color}"/>
      <text x="${x + cw / 2}" y="${y + ch - 38}" text-anchor="middle" style="${FONT};font-weight:600;font-size:30px" fill="#fff">${labels[i]}</text>`;
    }).join('');
  };
  const head = (y, name, sub, color) => `<circle cx="${x0 + 18}" cy="${y - 12}" r="14" fill="${color}" stroke="${P.ink}" stroke-width="5"/>
    <text x="${x0 + 46}" y="${y}" style="${FONT};font-weight:700;font-size:40px" fill="${P.ink}">${name}</text>
    <text x="${x0 + 46 + name.length * 22.5 + 14}" y="${y}" style="${FONT};font-weight:500;font-size:28px" fill="${P.ink}" opacity="0.65">${sub}</text>`;
  return {
    w: W, h: H,
    body: `<rect width="${W}" height="${H}" fill="${BG.lilac}"/>
    <text x="${x0}" y="98" style="${FONT};font-weight:700;font-size:58px" fill="${P.ink}">Hoja de expresiones</text>
    ${logo(W - x0 - 300, 92, 0.9)}
    ${head(184, 'Mapi', 'Sistema 1 · rápido, emocional', P.red)}
    ${row(212, 'm', mapiStates, P.red, '#FFE0E6')}
    ${head(730, 'Capi', 'Sistema 2 · lento, deliberado', P.blue)}
    ${row(758, 'c', capiStates, P.blue, '#DCE8FF')}
    <text x="${W / 2}" y="${H - 50}" text-anchor="middle" style="${FONT};font-weight:500;font-size:26px" fill="${P.ink}" opacity="0.6">Propuesta 1 · «Gominolas»</text>`,
  };
};

module.exports['cover-mock'] = () => {
  const W = 1080, H = 1350;
  // cartera boca abajo: la abertura (lado derecho de la cartera) mira al suelo
  const wal = purse(150, -246, 168);
  const m = mapi({
    x: 350, y: 1170, s: 1.42, r: 3, expr: 'alarm',
    extra: `${sweatDrop(-166, -196, 0.9, -20)}${sweatDrop(-182, -140, 0.6, -30)}`,
    custom: { arms: [[-138, -90, -178, -58], [76, -100, 112, -186]], legs: [[-60, -4, -70, 18], [24, -4, 34, 18]] },
    beforeArms: wal,
  });
  const c = capi({ x: 812, y: 1160, s: 1.06, expr: 'skeptic', pose: 'mug' });
  // monedas que caen desde la boca de la cartera (en coords de escena)
  const coins = [
    [598, 862, 22, 10], [574, 950, 24, -20], [620, 1030, 20, 30], [586, 1112, 22, 0],
  ].map(a => coin(...a)).join('');
  const fallLines = `<g stroke="${P.ink}" stroke-width="5" stroke-linecap="round" opacity="0.85">
    <path d="M 630 900 L 630 924"/><path d="M 544 990 L 544 1014"/><path d="M 652 1074 L 652 1096"/></g>`;
  const title = `
    <g filter="url(#stk)">
      <g transform="translate(190 330) rotate(-8)">
        <circle cx="0" cy="0" r="124" fill="${P.red}" stroke="${P.ink}" stroke-width="9"/>
        <path d="M -82 -42 C -70 -78 -40 -98 -8 -102" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.9"/>
        <text x="0" y="70" text-anchor="middle" style="${FONT};font-weight:700;font-size:210px" fill="#fff">7</text>
      </g>
    </g>
    <text x="352" y="306" style="${FONT};font-weight:700;font-size:128px" fill="${P.ink}">sesgos</text>
    <text x="356" y="406" style="${FONT};font-weight:600;font-size:72px" fill="${P.ink}">que te <tspan fill="${P.red}">vacían</tspan></text>
    <path d="M 600 428 q 23 -13 46 0 t 46 0 t 46 0 t 46 0" fill="none" stroke="${P.red}" stroke-width="7" stroke-linecap="round"/>
    <text x="540" y="548" text-anchor="middle" style="${FONT};font-weight:600;font-size:80px" fill="${P.ink}">la cuenta cada mes</text>`;
  return {
    w: W, h: H,
    body: `<defs>${stickerFilter('stk', 10)}</defs>
    <rect width="${W}" height="${H}" fill="${BG.butter}"/>
    <g fill="${SHADOW.butter}"><circle cx="980" cy="660" r="12"/><circle cx="90" cy="700" r="9"/><circle cx="1010" cy="120" r="8"/></g>
    ${logo(80 + 62, 112, 0.85)}
    ${title}
    ${ground(350, 1172, 180, SHADOW.butter)}
    ${ground(846, 1160, 176, SHADOW.butter)}
    <g transform="translate(0 -24)">
    ${fallLines}
    ${c}
    ${m}
    ${coins}
    ${bubble(876, 760, 340, 150, [850, 866], ['Espera…', 'déjame pensarlo.'], { fs: 38 })}
    </g>
    <g transform="translate(${W - 72} ${H - 60})">
      <rect x="-232" y="-40" width="232" height="66" rx="33" fill="${P.ink}"/>
      <text x="-116" y="6" text-anchor="middle" style="${FONT};font-weight:600;font-size:32px" fill="#fff">Desliza  →</text>
    </g>`,
  };
};

module.exports['check-150px'] = () => {
  const av = module.exports.avatar();
  // 150 px: avatar circular + cada personaje a 150 px de ancho + siluetas
  const m = mapi({ x: 0, y: 0, s: 1, expr: 'neutral', sweat: 1 });
  const c = capi({ x: 0, y: 0, s: 1, expr: 'neutral', pose: 'mug' });
  const sil = (g) => `<g filter="url(#sil)">${g}</g>`;
  return {
    w: 1000, h: 420,
    body: `<defs><clipPath id="cc"><circle cx="75" cy="75" r="75"/></clipPath>
      <filter id="sil"><feFlood flood-color="#33203A"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs>
      <rect width="1000" height="420" fill="#fff"/>
      <g transform="translate(20 20)"><g clip-path="url(#cc)"><g transform="scale(${150 / 640})">${av.body.replace('<defs>', '<defs>')}</g></g></g>
      <g transform="translate(270 190) scale(${150 / 360})">${m}</g>
      <g transform="translate(470 190) scale(${150 / 400})">${c}</g>
      <g transform="translate(270 400) scale(${150 / 360})">${sil(m)}</g>
      <g transform="translate(470 400) scale(${150 / 400})">${sil(c)}</g>
      <g transform="translate(780 400) scale(0.7)">${sil(hug({}))}</g>`,
  };
};
module.exports._lib = { BG, SHADOW, bag, priceTag, coin, purse, bubble, stickerFilter, hug, logo, ground };
