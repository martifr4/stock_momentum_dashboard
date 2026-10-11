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
const SCRATCH = process.env.REEL_SCRATCH || '/tmp/claude-0/-home-user-stock-momentum-dashboard/78867374-d319-526b-9188-4424541604ab/scratchpad';
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
  await pg.draw(scene.frame(20, { cover: true, minY: 640, story: true }));
  await pg.shot(path.join(OUT, 'cover.png'));
  await pg.close();
  // cuadrícula del perfil: 3:4 (1080 × 1440, la actual de Instagram) y 4:5 (1080 × 1350) como respaldo
  execFileSync('python3', ['-I', '-c', `from PIL import Image; im=Image.open('${path.join(OUT, 'cover.png')}'); im.crop((0,240,1080,1680)).save('${path.join(OUT, 'cover-grid.png')}', optimize=True); im.crop((0,285,1080,1635)).save('${path.join(OUT, 'cover-grid-4x5.png')}', optimize=True)`]);
}

// captions.srt (ronda 4): bloque nuevo N1–N5 (texto del storyboard-opening § 11) + c3…c22 (textos del SRT anterior, +234 f).
// Idempotente: de los bloques existentes se leen solo los 20 últimos (c3…c22), con o sin la apertura nueva.
function srt() {
  const src = fs.readFileSync(path.join(OUT, 'captions.srt'), 'utf8').trim().split(/\n\s*\n/).slice(-20);
  const ts = (fr) => { const ms = Math.round((fr / 30) * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  const NEWTXT = ['Daniel Kahneman,\nNobel de Economía,', 'explicó que decides\ncon dos sistemas.', 'Sistema 1:\nrápido e impulsivo.', 'Sistema 2:\nlento y reflexivo.', 'Pausa será el 2.\nChispa, el 1.'];
  const out = scene.NEW_CARDS.map(([id, a, b], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${NEWTXT[i]}`);
  const byId = Object.fromEntries(scene.CARDS.map((c) => [c.id, c]));
  src.forEach((blk, i) => {
    const txt = blk.split('\n').slice(2).join('\n'), c = byId['c' + (i + 3)];
    out.push(`${i + 6}\n${ts(scene.outOf(c.in))} --> ${ts(scene.outOf(c.out))}\n${txt}`);
  });
  fs.writeFileSync(path.join(OUT, 'captions.srt'), out.join('\n\n') + '\n');
  console.log('captions.srt', out.length, 'subtítulos');
}

function encode() {
  const t0 = Date.now();
  RENDER.encode(FRAMES_DIR, path.join(OUT, 'reel.mp4'), { crf: 21 }); // ronda 3: crf 21 ≈ 26 MB (crf 18 daba 34 MB)
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
  if (cmd === 'cover' || cmd === 'all') await cover(); // ronda 4: 'encode' ya no regenera la portada (no cambia)
  if (cmd === 'srt' || cmd === 'encode' || cmd === 'all') srt();
  if (cmd === 'sfx' || cmd === 'encode' || cmd === 'all') { fs.writeFileSync(path.join(OUT, 'sfx-cues.json'), JSON.stringify({ fps: 30, frames: N, cues: scene.sfxCues() }, null, 1)); console.log('sfx-cues.json'); }
  if (cmd === 'encode' || cmd === 'all') encode();
  console.log('total', ((Date.now() - t0) / 1000).toFixed(1), 's');
})().catch((e) => { console.error(e); process.exit(1); });
