// Motor de animación «Riso» — pipeline de render.
// 1) bakeTextures + plantilla HTML (una vez). 2) N workers Playwright: una página por worker, se actualiza
//    el DOM por fotograma (no se recarga) y se deduplican los dibujos repetidos (animación en «dos»).
// 3) ffmpeg (H.264, yuv420p, 30 fps, crf 18, preset slow, faststart). 4) portada, hoja de contactos, preview.
const fs = require('fs');
const path = require('path');
const { fork, execFileSync } = require('child_process');
const R = require('../riso.js');
const TX = require('./texture.js');

const MISREG = { blue: [3.5, 2.5, 0.12], red: [-2, -1, -0.06], black: [0, 0, 0] };

function templateHtml(w, h, { misreg = MISREG } = {}) {
  const plate = (k, filt) => { const [dx, dy, r] = misreg[k]; return `<g style="mix-blend-mode:multiply" filter="url(#${filt})"><g transform="translate(${dx} ${dy}) rotate(${r} ${w / 2} ${h / 2})" id="p_${k}"></g></g>`; };
  const prime = ['800 96px "Bricolage Grotesque"', '600 40px "Bricolage Grotesque"', '500 40px "DM Mono"', 'italic 500 40px "DM Mono"'];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${R.FONTS_CSS} html,body{margin:0;background:#fff;overflow:hidden}
  #prime span{font-size:20px}</style></head><body>
<svg id="svg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">
<defs>${TX.plateFilters(w, h)}</defs><defs id="dyn"></defs>
<image href="paper.png" x="0" y="0" width="${w}" height="${h}"/>
${plate('blue', 'inkBlue')}${plate('red', 'inkRed')}${plate('black', 'inkBlack')}
</svg>
<div id="prime" style="position:absolute;left:-9999px;top:0">
<span style="font-family:'Bricolage Grotesque';font-weight:800;font-stretch:75%;font-variation-settings:'opsz' 96">Aa¿¡«»…−0123456789 €</span>
<span style="font-family:'Bricolage Grotesque';font-weight:600;font-stretch:88%">Aa</span>
<span style="font-family:'DM Mono';font-weight:500">Aa0123456789,:€</span>
<span style="font-family:'DM Mono';font-weight:500;font-style:italic">Aa0123456789,:€ áéíóú</span></div>
<script>window.__prime = ${JSON.stringify(prime)};</script>
</body></html>`;
}

async function prepareTemplate(dir, { w = 1080, h = 1920, paper, force = false } = {}) {
  if (force || !fs.existsSync(path.join(dir, 'paper.png'))) await TX.bake(dir, { w, h, paper });
  fs.writeFileSync(path.join(dir, 'template.html'), templateHtml(w, h));
  return path.join(dir, 'template.html');
}

// abre una página lista para pintar fotogramas: setFrame({defs, blue, red, black}) → png
async function openPage(templatePath, w, h) {
  const { chromium } = require('/opt/node-tools/node_modules/playwright');
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto('file://' + templatePath, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { for (const p of window.__prime) await document.fonts.load(p); await document.fonts.ready; });
  // espera a que las texturas de feImage estén decodificadas
  await page.waitForTimeout(400);
  async function draw(parts) {
    await page.evaluate((p) => {
      document.getElementById('dyn').innerHTML = p.defs || '';
      document.getElementById('p_blue').innerHTML = p.blue || '';
      document.getElementById('p_red').innerHTML = p.red || '';
      document.getElementById('p_black').innerHTML = p.black || '';
    }, parts);
  }
  // captura CDP con zlib rápido: PNG sin pérdida, ≈ 3× más rápida que page.screenshot
  const cdp = await page.context().newCDPSession(page);
  async function shot(file) {
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
  }
  return { browser, page, draw, shot, close: () => browser.close() };
}

// render paralelo. cfg: { scene (ruta módulo), frames: [a, b] (incl.), outDir, workers, chunk, template, w, h, only: [t…] }
async function renderFrames(cfg) {
  const t0 = Date.now();
  fs.mkdirSync(cfg.outDir, { recursive: true });
  const list = cfg.only || Array.from({ length: cfg.frames[1] - cfg.frames[0] + 1 }, (_, i) => cfg.frames[0] + i);
  const chunk = cfg.chunk || 30, chunks = [];
  for (let i = 0; i < list.length; i += chunk) chunks.push(list.slice(i, i + chunk));
  const nW = Math.min(cfg.workers || 4, chunks.length);
  const cfgPath = path.join(cfg.outDir, `_cfg_${process.pid}.json`);
  fs.writeFileSync(cfgPath, JSON.stringify({ ...cfg, chunks }));
  const stats = { rendered: 0, copied: 0 };
  await Promise.all(Array.from({ length: nW }, (_, k) => new Promise((res, rej) => {
    const ch = fork(path.join(__dirname, 'worker.js'), [cfgPath, String(k), String(nW)], { stdio: 'inherit' });
    ch.on('message', (m) => { if (m && m.stats) { stats.rendered += m.stats.rendered; stats.copied += m.stats.copied; } });
    ch.on('exit', (code) => (code === 0 ? res() : rej(new Error('worker ' + k + ' exit ' + code))));
  })));
  fs.unlinkSync(cfgPath);
  return { ...stats, seconds: (Date.now() - t0) / 1000 };
}

function encode(framesDir, outFile, { fps = 30, crf = 18, preset = 'slow', pattern = 'f%04d.png' } = {}) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(framesDir, pattern),
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', preset, '-crf', String(crf),
    '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', String(fps),
    '-movflags', '+faststart', '-an', outFile], { stdio: 'inherit' });
}
function preview(inFile, outFile, width = 540) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', inFile, '-vf', `scale=${width}:-2:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-movflags', '+faststart', '-an', outFile], { stdio: 'inherit' });
}
// hoja de contactos: un fotograma cada `every` fotogramas, con su código de tiempo (Python + PIL)
function contactSheet(framesDir, outFile, { total, every = 60, cols = 7, thumbW = 216, fps = 30 } = {}) {
  const py = path.join(__dirname, 'contact_sheet.py');
  execFileSync('python3', ['-I', py, framesDir, outFile, String(total), String(every), String(cols), String(thumbW), String(fps)], { stdio: 'inherit' });
}

module.exports = { MISREG, templateHtml, prepareTemplate, openPage, renderFrames, encode, preview, contactSheet };
