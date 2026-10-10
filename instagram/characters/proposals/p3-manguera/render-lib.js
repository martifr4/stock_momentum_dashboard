// Render helper: writes the SVG next to the PNG and rasterises it with Playwright.
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

let browser;
async function render(svg, w, h, outPng, opts = {}) {
  if (!browser) browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: opts.dpr || 1 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}</style></head><body>${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const el = await page.$('svg');
  await el.screenshot({ path: outPng, omitBackground: !!opts.transparent });
  await page.close();
}
async function done() { if (browser) await browser.close(); }
function writeSvg(file, svg) { fs.writeFileSync(file, `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`); }
module.exports = { render, done, writeSvg };
