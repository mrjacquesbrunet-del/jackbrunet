// Captures HD des écrans pour la vidéo de présentation.
const { chromium } = require('playwright-core');
const fs = require('fs');
const S = process.argv[2];
const L = process.env.LANGUE || 'fr';
const OUT = S + '/video/ecrans' + (L === 'fr' ? '' : '-' + L);
fs.mkdirSync(OUT, { recursive: true });
const O = '/home/user/jackbrunet/out';
const ME = '11111111-1111-4111-8111-111111111111';
const h = (n) => new Date(Date.now() - n * 3600e3).toISOString();
const profils = {
  [ME]: { id: ME, pseudo: 'Daniel', avatar_url: null, verified: false, streak_days: 12 },
  jack: { id: 'jack', pseudo: 'Pasteur Jack Brunet', avatar_url: '/img/jack-avatar.webp', verified: true, streak_days: 120 },
  sophie: { id: 'sophie', pseudo: 'Sophie M.', avatar_url: '/img/auteure-josy.webp', streak_days: 20 },
  danielle: { id: 'danielle', pseudo: 'Danielle', avatar_url: null, streak_days: 8 },
  ettien: { id: 'ettien', pseudo: 'Ettien', avatar_url: null }, gabriel: { id: 'gabriel', pseudo: 'Gabriel', avatar_url: null },
  marc: { id: 'marc', pseudo: 'Marc', avatar_url: null }, lea: { id: 'lea', pseudo: 'Léa', avatar_url: null },
  paul: { id: 'paul', pseudo: 'Paul K.', avatar_url: null }, ruth: { id: 'ruth', pseudo: 'Ruth', avatar_url: null },
  eli: { id: 'eli', pseudo: 'Élie', avatar_url: null }, noemie: { id: 'noemie', pseudo: 'Noémie', avatar_url: null },
};
const TXT = {
  fr: ["Je demande la prière pour mon fils de 5 ans. Il ne parle pas encore et nous attendons un rendez-vous chez un spécialiste. Nous croyons à l'intervention de Dieu dans sa vie. Merci de prier avec nous.", "Merci Seigneur ! Après trois mois de recherche, je commence mon nouveau travail lundi. Dieu est fidèle.", "Priez pour ma maman qui est hospitalisée depuis une semaine. Que la paix de Dieu remplisse sa chambre.", "Priez pour mes examens de fin d'année, j'ai beaucoup de stress.", 'Je prie pour vous.', 'Amen, je prie pour elle.'],
  en: ["Please pray for my 5-year-old son. He is not speaking yet and we are waiting for an appointment with a specialist. We believe God will move in his life. Thank you for praying with us.", "Thank you Lord! After three months of searching, I start my new job on Monday. God is faithful.", "Please pray for my mom, who has been in the hospital for a week. May God's peace fill her room.", "Pray for my final exams, I'm very stressed.", "I'm praying for you.", "Amen, praying for her."],
  pt: ["Peço oração pelo meu filho de 5 anos. Ele ainda não fala e estamos esperando uma consulta com um especialista. Cremos que Deus vai agir na vida dele. Obrigada por orar conosco.", "Obrigado, Senhor! Depois de três meses procurando, começo no meu novo emprego na segunda-feira. Deus é fiel.", "Orem pela minha mãe, que está internada há uma semana. Que a paz de Deus encha o quarto dela.", "Orem pelas minhas provas de fim de ano, estou muito ansiosa.", "Estou orando por vocês.", "Amém, orando por ela."],
}[L];
const prieres = [
  { id: 'pr1', author_id: 'sophie', body: TXT[0], visibility: 'public', answered: false, created_at: h(2) },
  { id: 'pr3', author_id: 'marc', body: TXT[1], visibility: 'public', answered: true, created_at: h(9) },
  { id: 'pr2', author_id: 'danielle', body: TXT[2], visibility: 'public', answered: false, created_at: h(20) },
  { id: 'pr4', author_id: 'lea', body: TXT[3], visibility: 'public', answered: false, created_at: h(30) },
];
const rx = [];
const ajoute = (pid, type, n) => { for (let i = 0; i < n; i++) rx.push({ prayer_id: pid, user_id: 'u' + pid + type + i, type }); };
ajoute('pr1', 'pray', 132); ajoute('pr1', 'heart', 48); ajoute('pr2', 'pray', 85); ajoute('pr2', 'heart', 24); ajoute('pr3', 'pray', 40); ajoute('pr3', 'heart', 61); ajoute('pr4', 'pray', 12);
const comms = [];
for (let i = 0; i < 22; i++) comms.push({ id: 'c1-' + i, prayer_id: 'pr1', author_id: 'paul', body: TXT[4], created_at: h(1.5 - i * 0.01), parent_id: null });
for (let i = 0; i < 7; i++) comms.push({ id: 'c2-' + i, prayer_id: 'pr2', author_id: 'ruth', body: TXT[5], created_at: h(7 - i * 0.1), parent_id: null });
const tops = [['ettien', 46], ['gabriel', 42], ['sophie', 38], ['marc', 34], ['danielle', 31], ['lea', 27], ['paul', 22], ['ruth', 18], ['eli', 15], ['noemie', 11]].map(([user_id, score]) => ({ user_id, score }));
const titres = ['La foi qui déplace les montagnes', 'Quand Dieu se tait', 'Le pouvoir de la louange', 'Pardonner sans condition', 'Ton identité en Christ', "Marcher par l'Esprit", "Vaincre l'anxiété", 'La prière qui change tout'];
const shows = [{ id: 's1', title: 'RHEMA du jour', author: 'Pasteur Jack Brunet', description: 'Des messages courts pour nourrir ta foi chaque jour.', category: 'Enseignements', cover_path: '/img/podcast/rhema-du-jour.jpg', position: 0 }];
const eps = titres.map((t, i) => ({ id: 'p' + i, title: t, description: 'Un message pour fortifier ta foi.', path: 'ep' + i + '.mp3', created_at: new Date(Date.now() - i * 4 * 864e5).toISOString(), show_id: 's1' }));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const user = { id: ME, aud: 'authenticated', role: 'authenticated', email: 'demo@example.com', app_metadata: {}, user_metadata: {} };
  const session = { access_token: 'x.eyJzdWIiOiIxIn0.x', token_type: 'bearer', expires_in: 3e7, expires_at: Math.floor(Date.now() / 1000) + 3e7, refresh_token: 'd', user };
  await ctx.addInitScript((session) => {
    localStorage.setItem('sb-gymddrjmlhjhjlnuedma-auth-token', JSON.stringify(session));
    localStorage.setItem('jb.onboarded', '1'); localStorage.setItem('lumiere:popup-dismissed', '1'); localStorage.setItem('jb.usage.opens', '1');
    sessionStorage.setItem('jb.appPreview', '1');
    const ds = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const dates = Array.from({ length: 21 }, (_, i) => ds(i));
    localStorage.setItem('jb.engagement.v1', JSON.stringify({ streak: 21, best: 21, lastVisit: ds(0), lastStreakDay: ds(0), freezeWeek: null, previousStreak: 0, completedDates: dates, favorites: [] }));
    localStorage.setItem('jb.podcast.pos.v1', JSON.stringify({ p2: 640 })); localStorage.setItem('jb.podcast.dernier.v1', 'p2');
    const d = {}; ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'].forEach((k, i) => d[k] = [420, 1500, 1820, 380, 2400, 510, 1300, 2900][i]); localStorage.setItem('jb.podcast.dur.v1', JSON.stringify(d));
  }, session);
  await ctx.addInitScript((L) => localStorage.setItem('jb.langue', L), L);
  await ctx.route(/supabase\.co/, (r) => {
    const u = new URL(r.request().url());
    const un = /vnd.pgrst.object/.test(r.request().headers()['accept'] || '');
    const j = (d) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(un && Array.isArray(d) ? d[0] ?? null : d) });
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
    const p = u.pathname, q = decodeURIComponent(u.search);
    if (p.startsWith('/auth/v1/user')) return j(user);
    if (p === '/rest/v1/prayers') return j(q.includes('pinned=eq.true') ? [] : prieres);
    if (p === '/rest/v1/profiles') {
      const m = q.match(/id=in\.\(([^)]*)\)/); if (m) return j(m[1].split(',').map((x) => profils[x.replace(/"/g, '')]).filter(Boolean));
      const e = q.match(/id=eq\.([^&]*)/); if (e) return j([profils[e[1]] || profils[ME]]);
      return j([]);
    }
    if (p === '/rest/v1/prayer_reactions') return j(rx);
    if (p === '/rest/v1/prayer_comments') return j(comms);
    if (p === '/rest/v1/rpc/top_intercessors') return j(tops);
    if (p === '/rest/v1/podcast_shows') return j(shows);
    if (p === '/rest/v1/podcasts') return j(eps);
    if (p === '/rest/v1/rpc/podcasts_populaires') return j([{ podcast_id: 'p1', ecoutes: 212 }, { podcast_id: 'p0', ecoutes: 164 }, { podcast_id: 'p3', ecoutes: 131 }, { podcast_id: 'p5', ecoutes: 88 }]);
    if (p.startsWith('/storage/')) return r.abort();
    return j([]);
  });
  await ctx.route(/github\.io|onesignal|ebible/, (r) => r.abort());
  await ctx.route(/https:\/\/jackbrunet\.com\//, r => { const f = O + new URL(r.request().url()).pathname; return fs.existsSync(f) ? r.fulfill({ path: f, headers: { 'access-control-allow-origin': '*' } }) : r.fulfill({ status: 404 }); });
  const pg = await ctx.newPage();
  pg.on('dialog', d => d.dismiss().catch(() => {}));
  const ecrans = [
    ['accueil', '/', true], ['meditation', '/devotionnel/', true], ['bible', '/bible/?livre=43&chap=3', true],
    ['podcasts', '/ecouter/', true], ['mur', '/communaute/', true], ['plans', '/plans/', true],
    ['ecole', '/ecole/', true], ['lexique', '/ecole/lexique/', false], ['chronologie', '/ecole/chronologie/', false],
    ['soaking', '/soaking/', false], ['personnages', '/ecole/personnages/', true],
  ];
  const seul = process.argv[3];
  for (const [n, u, plein] of ecrans) {
    if (seul && seul !== n) continue;
    await pg.goto('http://127.0.0.1:8901' + u, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {});
    await pg.waitForTimeout(4500);
    await pg.screenshot({ path: `${OUT}/${n}.png` });
    if (plein) {
      const navH = await pg.evaluate(() => { const n = document.querySelector('.bottom-nav'); return n ? Math.round(innerHeight - n.getBoundingClientRect().top) : 0; });
      fs.writeFileSync(`${OUT}/${n}.nav.txt`, String(navH));
      await pg.addStyleTag({ content: '.bottom-nav{display:none!important}' });
      await pg.screenshot({ path: `${OUT}/${n}-plein.png`, fullPage: true });
    }
    console.log('ok', n);
  }
  await b.close();
})();
