# Construit les compositions finales calées sur la musique (fiche reperes.json).
ECR = [('accueil','accueil'),('bible','bible'),('podcasts','podcasts'),('mur','mur'),('plans','plans'),('ecole','ecole'),('personnages','ecole'),('chronologie','ecole'),('lexique','bible'),('soaking','accueil')]
MOTS = ['Médite','Lis','Écoute','Prie','Partage','Étudie','Mémorise','Découvre','Avance','Grandis','Crois','Espère','Aime','Ensemble','Avec Lui']
PAIRES = '[[0, 9], [1, 7], [2, 0], [3, 9], [3, 1], [5, 8], [8, 1], [6, 7], [4, 7], [4, 5], [1, 3], [9, 0], [3, 2], [3, 4], [0, 9]]'
VERSET = '<div id="s7v" style="margin-top:{mt}px;font-family:Playfair;font-style:italic;font-size:{fs}px;color:var(--creme)">« Arrêtez, et sachez que je suis Dieu… »<div style="font-family:Archivo;font-style:normal;font-size:{rs}px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--lime);margin-top:14px">Psaume 46:11</div></div>'

def rep(s, a, b, n=1):
    assert s.count(a) >= 1, a[:80]
    return s.replace(a, b, n)

def build(src, dst, geo):
    s = open(src).read()
    # — Montage rapide : 15 mots
    imgs = ''.join(f'<img class="c mg" id="mgi{i}" src="a/{e}.jpg"><img class="nav mg" id="mgn{i}" src="a/{n}-nav.jpg">' for i,(e,n) in enumerate(ECR))
    mots = ''.join(f'<div class="mgm" id="mgw{j}">' + (f'<span class="m"><span class="i">{w}<span class="pt">.</span></span></span>' if j % 2 == 0 else f'<span class="m"><span class="i" style="color:transparent;-webkit-text-stroke:3px #CAF000">{w}</span></span>') + '</div>' for j, w in enumerate(MOTS))
    markup = f'''
<!-- S10 montage rapide (final de la musique) -->
<div class="scene" id="s10">
  <div id="mgPulse" class="abs" style="{geo['pulse']}"></div>
  <div class="abs" style="{geo['mots']}">{mots}</div>
  <div id="pMw" class="abs" style="left:0;top:0;width:100%;height:100%">
    <div class="phone" id="pM" data-x="{geo['px']}" data-y="{geo['py']}" data-s="{geo['ps']}">
      <div class="scr"><div class="sb" style="background:#0c0c0a;color:#F3F3ED"><span>9:41</span><span class="bat"></span></div><div class="island"></div>{imgs}</div><div class="shine"></div></div>
  </div>
</div>'''
    s = rep(s, '`;\n\n/* Cartes en orbite', markup + '`;\n\n/* Cartes en orbite')
    s = rep(s, '</style>', f".mgm{{position:absolute;left:0;right:0;{geo['motcss']};font-weight:900;letter-spacing:-.04em;line-height:1;white-space:nowrap}}.mgm .pt{{color:var(--lime)}}\n</style>")
    # — Verset dans la pause
    s = rep(s, '''      <span class="pill">${ic('son').replace('class="s"', 'class="s" style="stroke:#CAF000"')}Ambiance sonore</span>
    </div>''', '''      <span class="pill">${ic('son').replace('class="s"', 'class="s" style="stroke:#CAF000"')}Ambiance sonore</span>
    </div>
    ''' + VERSET.format(**geo['verset']))
    s = rep(s, geo['s7top'][0], geo['s7top'][1])
    # — Calage : chaque bloc de scène a son segment (temps d'origine → temps musical)
    patch = '''const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
/* Calage sur la musique (assets/video/sfx/reperes.json) : chaque scène est
   écrite en « temps d'origine » puis placée sur sa mesure. */
const SEGS = []; let cur = null, brut = false;
const seg = (o0, o1, n0, n1) => { cur = [o0, o1, n0, n1]; SEGS.push(cur); };
const T = (v) => cur.at(2) + (v - cur.at(0)) * (cur.at(3) - cur.at(2)) / (cur.at(1) - cur.at(0));
const Tinv = (m) => { for (const [o0, o1, n0, n1] of SEGS) if (m >= n0 && m < n1) return o0 + (m - n0) * (o1 - o0) / (n1 - n0); return m < 1 ? 0 : 99; };
['to', 'fromTo', 'set'].forEach((fn) => {
  const o = tl[fn].bind(tl);
  tl[fn] = (...args) => {
    const i = args.length - 1, pos = args[i];
    if (!brut && cur && typeof pos === 'number') {
      const v = args[i - 1];
      if (v && v.duration >= 2) v.duration *= (cur.at(3) - cur.at(2)) / (cur.at(1) - cur.at(0));
      args[i] = T(pos);
    }
    return o(...args);
  };
});'''
    s = rep(s, "const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });", patch)
    SEG = {
        '/* S0 — intro (0 → 4) */': 'seg(0, 4, .75, 4.9);',
        '/* S1 — mots sur le temps (4 → 8) */': 'seg(4, 8.05, 4.9, 8.9);',
        '/* S2 — accueil (8 → 14) */': 'seg(8.05, 14, 8.9, 14.9);',
        '/* S3 — bible (14 → 20) */': 'seg(14, 20.05, 14.9, 20.9);',
        '/* S4 — podcasts (20 → 26) */': 'seg(20.05, 26.05, 20.9, 26.9);',
        '/* S5 — mur de prière (26 → 32) */': 'seg(26.05, 32.1, 36.9, 40.9);',
        '/* S6 — grandir (32 → 37) */': 'seg(32.1, 37.1, 26.9, 32.9);',
        '/* S7 — repos (37 → 41) */': 'seg(37.1, 41.0, 32.9, 36.9);',
        "/* S8 — mur d'écrans (41 → 46) */": 'seg(41.0, 45.5, 40.9, 47.9);',
        '/* S9 — fin (46 → 50) */': 'seg(46.0, 50.4, 64.2, 67.4);',
    }
    for k, v in SEG.items():
        s = rep(s, k, k + '\n' + v)
    # Transitions remplacées : plus de rideau mur → grandir, plus de flash repos → huit
    s = rep(s, 'wipe(32.1);\n', '')
    s = rep(s, "tl.to('#flash', { opacity: .85, duration: .12, ease: 'none' }, 40.98);\ntl.to('#flash', { opacity: 0, duration: .5, ease: 'power2.out' }, 41.1);\n", '')
    # Mur de prière dans la pause : la puce « Je prie » sort avec la notification (36,9 s)
    s = rep(s, "pop('#s5c1', 27.6);", "pop('#s5c1', 26.1);")
    s = rep(s, "ease: 'power1.out', onUpdate: () => { $('#cpt').textContent = Math.round(cpt.v); } }, 27.9);", "ease: 'power1.out', onUpdate: () => { $('#cpt').textContent = Math.round(cpt.v); } }, 26.6);")
    raw = '''
/* Transitions sur les mesures (temps musical brut) */
brut = true;
wipe(26.9);
tl.fromTo('#s7v', { autoAlpha: 0, y: 20, filter: 'blur(12px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' }, 34.9);
tl.to('#flash', { opacity: .85, duration: .1, ease: 'none' }, 40.8);
tl.to('#flash', { opacity: 0, duration: .55, ease: 'power2.out' }, 40.9);
/* S10 — montage rapide sur le final (48,9 → 64,2) */
const B0 = 48.9;
const PAIRES = ''' + PAIRES + ''';
show('#s10', B0, 64.3);
gsap.set('.mg', { autoAlpha: 0 });
gsap.set('.mgm .i', { yPercent: 140 });
tl.fromTo('#pM', { y: 1100, rotationX: -30 }, { y: 0, rotationX: 0, duration: .7 }, B0);
for (let k = 0; k < 30; k++) {
  const t = B0 + k * .5, e = PAIRES.at(Math.floor(k / 2)).at(k % 2);
  tl.set('.mg', { autoAlpha: 0 }, t);
  tl.set(['#mgi' + e, '#mgn' + e], { autoAlpha: 1 }, t);
  if (k > 0) tl.fromTo('#pMw', { scale: 1.035, rotation: k % 2 ? -1.6 : 1.6 }, { scale: 1, rotation: 0, duration: .42, ease: 'power3.out', immediateRender: false }, t);
  tl.fromTo('#mgPulse', { autoAlpha: .55, scale: .9 }, { autoAlpha: 0, scale: 1.25, duration: .45, ease: 'power2.out', immediateRender: false }, t);
  if (k % 2 === 0) {
    const w = '#mgw' + (k / 2) + ' .i';
    tl.fromTo(w, { yPercent: 140, skewY: 6 }, { yPercent: 0, skewY: 0, duration: .32, ease: 'expo.out', immediateRender: false }, t);
    tl.to(w, { yPercent: -140, duration: .2, ease: 'expo.in' }, k < 28 ? t + .78 : 63.9);
  }
}
tl.to('#pMw', { scale: 2.6, autoAlpha: 0, filter: 'blur(14px)', duration: .32, ease: 'expo.in' }, 63.9);
tl.set({}, {}, 67.7);
brut = false;
'''
    s = rep(s, '\nconst DUREE = 50.4;', raw + '\nconst DUREE = 67.7;')
    s = rep(s, 'window.seek = (t) => { tl.seek(t, false); ambiance(t); };', 'window.seek = (t) => { tl.seek(t, false); ambiance(Tinv(t)); };')
    # La fin d'origine posait tl.set({}, {}, 50.4) : sans effet une fois calée.
    open(dst, 'w').write(s)

build('index.html', 'final-16x9.html', dict(px=1390, py=540, ps=1.04,
    pulse='left:1390px;top:540px;width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;background:radial-gradient(circle,rgba(202,240,0,.35),rgba(202,240,0,0) 65%)',
    mots='left:130px;top:0;width:900px;height:1080px', motcss='top:450px;font-size:190px;text-align:left',
    verset=dict(mt=58, fs=44, rs=18), s7top=('id="s7in" style="left:0;right:0;top:330px;', 'id="s7in" style="left:0;right:0;top:250px;')))
build('vertical.html', 'final-9x16.html', dict(px=540, py=1240, ps=1.0,
    pulse='left:540px;top:1240px;width:1000px;height:1000px;margin:-500px 0 0 -500px;border-radius:50%;background:radial-gradient(circle,rgba(202,240,0,.35),rgba(202,240,0,0) 65%)',
    mots='left:0;top:0;width:1080px;height:800px', motcss='top:330px;font-size:170px;text-align:center',
    verset=dict(mt=70, fs=46, rs=20), s7top=('id="s7in" style="left:0;right:0;top:640px;', 'id="s7in" style="left:0;right:0;top:520px;')))
print('ok')
