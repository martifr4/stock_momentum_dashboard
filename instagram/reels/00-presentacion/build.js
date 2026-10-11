// Reel 00 · build. Uso:
//   node build.js layout                      mide subtítulos y medidas (layout.json en scratch)
//   node build.js frames [a-b] [--only=0,20]  renderiza fotogramas (scratch, fuera del repo)
//   node build.js stills 0,20,330 [dir]       fotogramas sueltos a una carpeta de revisión
//   node build.js encode                      reel.mp4 + cover + cover-grid + contact sheet + preview
//   node build.js all                         todo lo anterior
// Los fotogramas van a REEL_FRAMES (por defecto el scratchpad de la sesión). Nunca al repo.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = require('../../characters/riso/riso.js');
const { RENDER } = require('../../characters/riso/anim/index.js');
const scene = require('./scene.js');

const OUT = __dirname;
const SCRATCH = process.env.REEL_SCRATCH || '/tmp/claude-0/-home-user-stock-momentum-dashboard/1bc5c2b5-f9cc-5ad3-b1d1-7ad18c5dedd4/scratchpad';
const FRAMES_DIR = process.env.REEL_FRAMES || path.join(SCRATCH, 'reel00-frames');
const TEX = path.join(SCRATCH, 'reel00-tex');
const LAYOUT = path.join(SCRATCH, 'reel00-layout.json');
const W = scene.WIDTH, H = scene.HEIGHT, N = scene.FRAMES;

async function layout() {
  const M = await R.measurer();
  const lay = await scene.prepare(M);
  await M.close();
  fs.writeFileSync(LAYOUT, JSON.stringify(lay));
  console.log('layout ok · tamaños:', lay.cards.map((c) => `${c.id}:${c.size}${c.size !== c.sizeIn ? '(<' + c.sizeIn + ')' : ''}`).join(' '));
  console.log('ticket total:', lay.labelSize, lay.amountSize, '· fuera de zona segura:', lay.safe.length ? lay.safe : 'ninguno');
}
async function template() { return RENDER.prepareTemplate(TEX, { w: W, h: H, paper: R.PAPERS.niebla }); }

async function frames(range, only, outDir = FRAMES_DIR) {
  const tpl = await template();
  const res = await RENDER.renderFrames({ scene: path.join(OUT, 'scene.js'), layout: LAYOUT, template: tpl, w: W, h: H, outDir, frames: range, only, workers: 4, chunk: 24 });
  console.log(`frames ${only ? only.length : range[1] - range[0] + 1}: ${res.rendered} dibujados, ${res.copied} copiados, ${res.seconds.toFixed(1)} s`);
  return res;
}

async function cover() {
  // portada dedicada: estado de f20 + título a 150 px, sin monedas por encima de y 640, sin temblor ni «¡CLAC!»
  const tpl = await template();
  await scene.setup({ layout: LAYOUT });
  const pg = await RENDER.openPage(tpl, W, H);
  await pg.draw(scene.frame(20, { cover: true, minY: 640 }));
  await pg.shot(path.join(OUT, 'cover.png'));
  await pg.close();
  execFileSync('python3', ['-I', '-c', `from PIL import Image; im=Image.open('${path.join(OUT, 'cover.png')}'); im.crop((0,285,1080,1635)).save('${path.join(OUT, 'cover-grid.png')}', optimize=True)`]);
}

function encode() {
  const t0 = Date.now();
  RENDER.encode(FRAMES_DIR, path.join(OUT, 'reel.mp4'));
  RENDER.preview(path.join(OUT, 'reel.mp4'), path.join(OUT, 'preview-540.mp4'), 540);
  RENDER.contactSheet(FRAMES_DIR, path.join(OUT, 'contact-sheet.png'), { total: N, every: 60, cols: 7, thumbW: 216 });
  console.log('encode', ((Date.now() - t0) / 1000).toFixed(1), 's');
}

(async () => {
  const [cmd, a1, a2] = process.argv.slice(2);
  const t0 = Date.now();
  const only = (process.argv.find((x) => x.startsWith('--only=')) || '').slice(7);
  if (cmd === 'layout' || cmd === 'all') await layout();
  if (cmd === 'frames') {
    const rg = a1 && /^\d+-\d+$/.test(a1) ? a1.split('-').map(Number) : [0, N - 1];
    await frames(rg, only ? only.split(',').map(Number) : null);
  }
  if (cmd === 'stills') await frames(null, a1.split(',').map(Number), a2 || path.join(SCRATCH, 'review'));
  if (cmd === 'all') await frames([0, N - 1]);
  if (cmd === 'cover' || cmd === 'all' || cmd === 'encode') await cover();
  if (cmd === 'encode' || cmd === 'all') encode();
  console.log('total', ((Date.now() - t0) / 1000).toFixed(1), 's');
})().catch((e) => { console.error(e); process.exit(1); });
