// Render de la propuesta «Gominolas».
// Uso: node render.js [escena ...]   (sin argumentos = todas)
// Genera <escena>.svg y <escena>.png en esta carpeta.
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const scenes = require('./scenes.js');

const FONT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');";

async function main() {
  const want = process.argv.slice(2);
  const names = want.length ? want : Object.keys(scenes).filter(n => !n.startsWith('_'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const name of names) {
    const sc = scenes[name]();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sc.w} ${sc.h}" width="${sc.w}" height="${sc.h}">
<style>${FONT_CSS} text{font-family:'Fredoka',sans-serif;}</style>
${sc.body}
</svg>`;
    const out = sc.file || name;
    fs.writeFileSync(path.join(__dirname, `${out}.svg`), svg);
    const outW = sc.outW || sc.w, outH = sc.outH || sc.h;
    const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap">
<style>html,body{margin:0;padding:0;background:transparent}#c{width:${outW}px;height:${outH}px}#c svg{width:${outW}px;height:${outH}px;display:block}</style>
</head><body><div id="c">${svg}</div></body></html>`;
    await page.setViewportSize({ width: outW, height: outH });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => { await document.fonts.load('600 40px Fredoka'); await document.fonts.load('700 40px Fredoka'); });
    await page.waitForTimeout(200);
    await page.locator('#c').screenshot({ path: path.join(__dirname, `${out}.png`), omitBackground: !!sc.transparent });
    console.log('ok', out);
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
