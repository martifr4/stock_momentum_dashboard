// Builds comparison boards of the three character proposals.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'proposals');
const P = [
  ['p1-gominolas', '1 · Gominolas', 'Kawaii pegatina'],
  ['p2-riso', '2 · Riso', 'Geométrico, risografía'],
  ['p3-manguera', '3 · Manguera', 'Cartoon años 30'],
];
const img = (d, f) => 'data:image/png;base64,' + fs.readFileSync(path.join(root, d, f)).toString('base64');
const row = ([d, t, s]) => `<section><h2>${t} <small>${s}</small></h2><div class="r">
  ${['hero.png', 'cover-mock.png', 'expressions.png'].map(f => `<img class="p" src="${img(d, f)}">`).join('')}
  <div class="av"><img src="${img(d, 'avatar.png')}"><img class="s" src="${img(d, 'avatar.png')}"><span>320 · 110 px</span></div></div></section>`;
const css = `body{margin:0;background:#1d1b19;color:#eee;font-family:Inter;padding:32px;width:1640px}
h2{font-size:30px;margin:8px 0 14px}small{font-weight:400;color:#aaa;font-size:20px;margin-left:10px}
.r{display:flex;gap:20px;align-items:flex-start}.p{width:360px;border-radius:6px}
.av{display:flex;flex-direction:column;gap:14px;align-items:center}.av img{width:240px;border-radius:50%}.av img.s{width:110px}
.av span{color:#999;font-size:16px}section{margin-bottom:30px}`;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1704, height: 100 } });
  for (const p of P) {
    await pg.setContent(`<style>${css}</style>${row(p)}`);
    await pg.screenshot({ path: path.join(__dirname, `board-${p[0]}.png`), fullPage: true });
  }
  await pg.setContent(`<style>${css}</style>${P.map(row).join('')}`);
  await pg.screenshot({ path: path.join(__dirname, 'board-all.png'), fullPage: true });
  await b.close();
})();
