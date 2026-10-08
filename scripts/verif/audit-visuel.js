// Outil de vérification visuelle (app, mode aperçu).
// Usage : npm run build:app ; servir out/ sur le port 8901 ; puis
//   node scripts/verif/audit-visuel.js <dossier> fr "$(cat scripts/verif/pages.txt)"
//   python3 scripts/verif/analyse-audit.py <dossier> fr
// (playwright-core + Chromium requis ; <dossier>/audit est créé.)
//
// Outil de vérification visuelle : pour chaque page, captures du haut et du bas,
// couleur du fond derrière la page (visible au rebond), textes coincés sous la
// barre du haut, erreurs JavaScript. L'analyse des pixels est faite ensuite.
const { chromium } = require('playwright-core');
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const fs = require('fs');
const S = process.argv[2], LANG = process.argv[3] || 'fr', PAGES = process.argv[4].split(',');
const U = '00000000-0000-0000-0000-000000000001';
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const session = { access_token: 'x', token_type: 'bearer', expires_in: 31536000, expires_at: Math.floor(Date.now()/1000)+31536000, refresh_token: 'y', user: { id: U, email: 'marie@test.fr', aud: 'authenticated', role: 'authenticated', user_metadata: {} } };
  await ctx.addInitScript(([s, l]) => { localStorage.setItem('jb.langue', l); localStorage.setItem('sb-gymddrjmlhjhjlnuedma-auth-token', JSON.stringify(s)); localStorage.setItem('jb.onboarded','1'); localStorage.setItem('jb.news.games.v2','1'); localStorage.setItem('jb.news.formation.v2','1'); sessionStorage.setItem('jb.appPreview','1'); }, [session, LANG]);
  await ctx.route(/supabase\.co/, (r) => { const u = r.request().url(); const obj = (r.request().headers()['accept'] || '').includes('vnd.pgrst.object');
    const j = (d) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(obj && Array.isArray(d) ? (d[0] ?? null) : d) });
    if (u.includes('/auth/v1/user')) return j(session.user);
    if (u.includes('/rest/v1/profiles')) return j([{ id: U, pseudo: 'Marie Dupont', avatar_url: null }]);
    if (u.includes('/rest/v1/')) return j([]); return r.abort(); });
  await ctx.route(/github\.io|jackbrunet\.com|youtube|ytimg/, r => r.abort());
  fs.mkdirSync(`${S}/audit`, { recursive: true });
  const out = [];
  const p = await ctx.newPage();
  let erreurs = [];
  p.on('pageerror', e => erreurs.push(e.message.slice(0, 100)));
  for (const pg of PAGES) {
    erreurs = [];
    await p.goto('http://127.0.0.1:8901' + pg, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(2600);
    const nom = pg.replace(/[\/?=&]/g, '_') || 'racine';
    const haut = await p.evaluate(() => {
      const barre = document.querySelector('[data-profil-menu-btn]')?.closest('.fixed');
      const rang = barre?.querySelector('.pointer-events-auto');
      const bas = rang ? rang.getBoundingClientRect().bottom : 0;
      const chev = [];
      if (bas) document.querySelectorAll('h1,h2,h3,p,a,button,label,input,span').forEach((e) => {
        if (barre.contains(e) || e.closest('[role=dialog]')) return;
        const rc = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        if (rc.height < 6 || rc.width < 6 || rc.top >= bas - 1 || rc.bottom <= 2 || cs.visibility === 'hidden' || +cs.opacity < 0.1) return;
        const t = (e.innerText || e.getAttribute('placeholder') || '').trim();
        if (!t || e.children.length > 2) return;
        chev.push(t.slice(0, 30) + '@' + Math.round(rc.top));
      });
      return { fond: getComputedStyle(document.documentElement).backgroundColor, barreBas: Math.round(bas), chev: chev.slice(0, 5) };
    });
    await p.screenshot({ path: `${S}/audit/H${nom}.png` });
    await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(900);
    const bas = await p.evaluate(() => {
      const nav = document.querySelector('.bottom-nav');
      return { fond: getComputedStyle(document.documentElement).backgroundColor, navTop: Math.round(nav ? nav.getBoundingClientRect().top : innerHeight), docH: document.documentElement.scrollHeight };
    });
    await p.screenshot({ path: `${S}/audit/B${nom}.png` });
    out.push({ page: pg, nom, haut, bas, js: [...new Set(erreurs)] });
  }
  fs.writeFileSync(`${S}/audit/mesures-${LANG}.json`, JSON.stringify(out));
  await ctx.close(); await b.close();
})();
