# Vidéo de présentation RHEMA

- `RHEMA-youtube-16x9-HD.mp4` : 1920 × 1080, 60 i/s, 1 min 08 (YouTube).
- `RHEMA-vertical-9x16-HD.mp4` : 1080 × 1920, 60 i/s, 1 min 08 (Reels, TikTok, Shorts).
- `musique-presentation.mp3` et `sfx/` : musique et sound design (Magnific), calés selon `sfx/reperes.json`.

## Refaire le rendu

- `compo/final-16x9.html` et `compo/final-9x16.html` : compositions animées (GSAP), générées par
  `compo/construire.py` à partir de `compo/index.html` et `compo/vertical.html`.
- `compo/a/` : captures de l'app, polices, logo, GSAP.
- `outils/video-ecrans.js` : captures HD des écrans (app compilée servie en local, données de démo).
- `outils/video-rendu.js` : rendu image par image (Playwright) ; `outils/rendre.sh` : rendu + encodage + son.
- `outils/mixage2.py` : mixage musique + effets selon `sfx/reperes.json`.
