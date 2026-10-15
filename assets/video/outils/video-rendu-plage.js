// Rend les images [debut, fin) d'une composition, numérotées à partir de 0.
const { chromium } = require('playwright-core');
const fs = require('fs');
const [,, compo, sortie, debutArg, finArg, W, H] = process.argv;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  await p.goto('file://' + compo);
  await p.evaluate(() => window.pret);
  fs.mkdirSync(sortie, { recursive: true });
  const fps = 60, D = await p.evaluate(() => window.DUREE);
  const debut = +debutArg, fin = Math.min(+finArg, Math.ceil(D * fps));
  for (let i = 0; i < debut; i += 30) await p.evaluate((t) => window.seek(t), i / fps);
  for (let i = debut; i < fin; i++) {
    await p.evaluate((t) => window.seek(t), i / fps);
    await p.screenshot({ path: `${sortie}/${String(i - debut).padStart(5, '0')}.jpg`, quality: 93, type: 'jpeg' });
  }
  console.log('ok', sortie, fin - debut);
  await b.close();
})();
