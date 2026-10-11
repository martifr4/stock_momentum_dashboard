// Worker de render: una página Playwright, DOM actualizado por fotograma, dibujos repetidos copiados.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { openPage } = require('./renderer.js');

(async () => {
  const [cfgPath, idxS, nS] = process.argv.slice(2);
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const idx = +idxS, n = +nS;
  const scene = require(cfg.scene);
  if (scene.setup) await scene.setup(cfg);
  const pg = await openPage(cfg.template, cfg.w, cfg.h);
  const name = (t) => path.join(cfg.outDir, `f${String(t).padStart(4, '0')}.png`);
  const stats = { rendered: 0, copied: 0 };
  for (let c = idx; c < cfg.chunks.length; c += n) {
    let lastHash = null, lastFile = null;
    for (const t of cfg.chunks[c]) {
      const parts = scene.frame(t);
      const hash = crypto.createHash('sha1').update(parts.defs + '|' + parts.blue + '|' + parts.red + '|' + parts.black).digest('hex');
      if (hash === lastHash) { fs.copyFileSync(lastFile, name(t)); stats.copied++; continue; }
      await pg.draw(parts);
      await pg.shot(name(t));
      stats.rendered++;
      lastHash = hash; lastFile = name(t);
    }
  }
  await pg.close();
  if (process.send) process.send({ stats });
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
