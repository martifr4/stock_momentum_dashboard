// Motor de animación «Riso» — texturas precocinadas.
// En vez de ejecutar feTurbulence en cada fotograma, se renderizan UNA vez a PNG (semillas fijas de la biblia:
// azul 3, rojo 21, negro 41; papel 8, fibra 13) y cada plancha las compone con feImage:
//   warp_<k>.png  → mapa de desplazamiento (bordes irregulares)  [opaco]
//   speck_<k>.png → motas + lavado (blanco con alfa), se recortan a la tinta  [RGBA]
//   paper.png     → papel + grano + fibra  [opaco]
// variants > 1 genera juegos con semillas desplazadas para «hervir» el grano en dos (opcional).
const fs = require('fs');
const path = require('path');
const R = require('../riso.js');

const SEEDS = { blue: 3, red: 21, black: 41, paper: 8, fiber: 13 };
const PLATE = { blue: { rough: 2.2, speck: 1 }, red: { rough: 2.2, speck: 1 }, black: { rough: 1.4, speck: 0.55 } };

function svgDoc(w, h, body, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
}
const region = (w, h) => `filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB"`;

async function bake(dir, { w = 1080, h = 1920, paper = R.PAPERS.niebla, grain = 1, variants = 1 } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const { chromium } = require('/opt/node-tools/node_modules/playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const shot = async (svg, file, transparent) => {
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}</style></head><body>${svg}</body></html>`);
    await page.screenshot({ path: path.join(dir, file), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  };
  for (let v = 0; v < variants; v++) {
    const sfx = variants > 1 ? `_${v}` : '';
    const dv = v * 100;
    // papel (idéntico a riso(): base + grano multiply 0,5 + fibra 0,12)
    const pdefs = `<filter id="paper" ${region(w, h)}><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="${SEEDS.paper + dv}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.25  0 0 0 0 0.3  0 0 0 -1.1 0.62"/></filter>` +
      `<filter id="fiber" ${region(w, h)}><feTurbulence type="fractalNoise" baseFrequency="0.02 0.4" numOctaves="2" seed="${SEEDS.fiber + dv}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 -1.4 0.72"/></filter>`;
    await shot(svgDoc(w, h, `<rect width="${w}" height="${h}" fill="${paper}"/><g style="mix-blend-mode:multiply"><rect width="${w}" height="${h}" fill="#fff" filter="url(#paper)" opacity="${0.5 * Math.min(1, grain + 0.1)}"/><rect width="${w}" height="${h}" fill="#fff" filter="url(#fiber)" opacity="0.12"/></g>`, pdefs), `paper${sfx}.png`, false);
    for (const k of ['blue', 'red', 'black']) {
      const seed = SEEDS[k] + dv, sp = PLATE[k].speck * grain;
      const wdefs = `<filter id="w" ${region(w, h)}><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1"/></filter>`;
      await shot(svgDoc(w, h, `<rect width="${w}" height="${h}" fill="#000" filter="url(#w)"/>`, wdefs), `warp_${k}${sfx}.png`, false);
      const sdefs = `<filter id="s" ${region(w, h)}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed + 11}" result="grain"/>
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${-6 * sp} 0 0 0 ${2.45 * sp}" result="speck"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="${seed + 5}" result="wash"/>
        <feColorMatrix in="wash" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${-0.8 * sp} 0 0 0 ${0.44 * sp}" result="washA"/>
        <feMerge><feMergeNode in="speck"/><feMergeNode in="washA"/></feMerge></filter>`;
      await shot(svgDoc(w, h, `<rect width="${w}" height="${h}" fill="#000" filter="url(#s)"/>`, sdefs), `speck_${k}${sfx}.png`, true);
    }
  }
  await browser.close();
}

// filtros de plancha que usan las texturas precocinadas (rutas relativas a la plantilla)
function plateFilters(w, h, sfx = '') {
  let s = '';
  for (const [k, id] of [['blue', 'inkBlue'], ['red', 'inkRed'], ['black', 'inkBlack']]) {
    s += `<filter id="${id}${sfx}" ${region(w, h)}>
      <feImage href="warp_${k}${sfx}.png" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="${PLATE[k].rough}" xChannelSelector="R" yChannelSelector="G" result="rough"/>
      <feImage href="speck_${k}${sfx}.png" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="spk"/>
      <feComposite in="spk" in2="rough" operator="in" result="spkIn"/>
      <feMerge><feMergeNode in="rough"/><feMergeNode in="spkIn"/></feMerge></filter>`;
  }
  return s;
}

module.exports = { SEEDS, PLATE, bake, plateFilters };
