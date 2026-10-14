const { chromium } = require('playwright-core');
const fs = require('fs');
const [,, compo, sortie, mode, fpsArg, W = '1920', H = '1080'] = process.argv;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files', '--disable-gpu-vsync'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('ERREUR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('console', m.text()); });
  await p.goto('file://' + compo);
  await p.evaluate(() => window.pret);
  fs.mkdirSync(sortie, { recursive: true });
  if (mode === 'stills') {
    const ts = fpsArg.split(',').map(Number);
    for (const t of ts) { await p.evaluate((t) => window.seek(t), t); await p.waitForTimeout(80); await p.screenshot({ path: `${sortie}/t${String(t).replace('.', '_')}.jpg`, quality: 85, type: 'jpeg' }); }
  } else {
    const fps = +fpsArg, D = await p.evaluate(() => window.DUREE), n = Math.ceil(D * fps);
    const debut = Date.now();
    for (let i = 0; i < n; i++) {
      await p.evaluate((t) => window.seek(t), i / fps);
      await p.screenshot({ path: `${sortie}/${String(i).padStart(5, '0')}.jpg`, quality: 93, type: 'jpeg' });
      if (i % 300 === 0) console.log('image', i, '/', n, Math.round((Date.now() - debut) / 1000) + 's');
    }
  }
  await b.close();
})();
