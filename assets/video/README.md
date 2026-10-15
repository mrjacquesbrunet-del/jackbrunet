# Vidéo de présentation RHEMA

Six versions, 60 i/s, 1 min 08 :

| Langue | YouTube 16:9 (1920 × 1080) | Vertical 9:16 (1080 × 1920, Reels, TikTok, Shorts) |
| --- | --- | --- |
| Français | `RHEMA-youtube-16x9-HD.mp4` | `RHEMA-vertical-9x16-HD.mp4` |
| Anglais | `RHEMA-youtube-16x9-EN-HD.mp4` | `RHEMA-vertical-9x16-EN-HD.mp4` |
| Portugais | `RHEMA-youtube-16x9-PT-HD.mp4` | `RHEMA-vertical-9x16-PT-HD.mp4` |

Versions FR : badges App Store / Google Play et notes (4,8 · 74 notes ; 5,0 · 347 avis, relevées le 15/10/2026).
Versions EN/PT : scène « Explore the Word / Explore a Palavra » à la place des podcasts (réservés au français).
- `musique-presentation.mp3` et `sfx/` : musique et sound design (Magnific), calés selon `sfx/reperes.json`.

## Refaire le rendu

- `compo/final-16x9.html` et `compo/final-9x16.html` : compositions animées (GSAP), générées par
  `compo/construire.py` à partir de `compo/index.html` et `compo/vertical.html`, puis `badges.py` et `notes.py` (fin FR).
- `compo/final-*-en.html` / `-pt.html` : versions traduites, générées par `compo/traduire.py` ; images dans `a-en/` et `a-pt/`.
- `compo/a/` : captures de l'app, polices, logo, GSAP.
- `outils/video-ecrans.js` : captures HD des écrans (app compilée servie en local, données de démo).
- `outils/video-rendu.js` : rendu image par image (Playwright) ; `outils/video-rendu-plage.js` : une plage d'images ;
  `outils/rendre.sh` : rendu + encodage + son ; `outils/assembler.py` : recoller des plages corrigées.
- `outils/video-ecrans.js` : `LANGUE=en|pt` pour les captures traduites.
- `outils/mixage2.py` : mixage musique + effets selon `sfx/reperes.json`.
