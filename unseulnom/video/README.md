# Vidéo de fond de la page Avignon

`teaser-web.mp4` est la version allégée du teaser, préparée pour servir de
fond au héros de la page événement.

| | Fichier d'origine | Version web |
|---|---|---|
| Poids | 29,3 Mo | **3,4 Mo** |
| Définition | 1920 × 1080 | 1280 × 720 |
| Piste audio | oui (320 kb/s) | **aucune** |
| Durée | 23 s | 23 s |

Trois raisons à ces choix :

- **Le poids.** C'est ce que chaque visiteur télécharge, téléphone compris.
  29 Mo pour un fond de page, c'est huit fois trop.
- **Le son.** Les navigateurs refusent de lancer une vidéo avec piste audio
  sans un geste de l'utilisateur. Retirer la piste garantit que la lecture
  démarre toute seule — et la vidéo est de toute façon muette à l'écran.
- **La définition.** À 1280 px de large, la différence est invisible en fond
  de page, mais le fichier pèse quatre fois moins.

La commande utilisée :

```
ffmpeg -i Teaser-1.mp4 -an -vf "scale=1280:-2" \
       -c:v libx264 -profile:v high -preset slow -crf 27 \
       -pix_fmt yuv420p -movflags +faststart teaser-web.mp4
```

`-movflags +faststart` déplace l'index au début du fichier : la lecture peut
commencer avant la fin du téléchargement.

## Dans la page

`index.html` déclare **deux sources**, dans cet ordre :

```html
<source src="…/2026/08/teaser-web.mp4" type="video/mp4" />
<source src="…/2026/08/Teaser-1.mp4"  type="video/mp4" />
```

Le navigateur prend la première qui répond. Tant que `teaser-web.mp4` n'est
pas dans la médiathèque, c'est le fichier d'origine qui s'affiche ; dès qu'il
y est, la page passe toute seule à la version légère, sans retoucher le code.

Une fois `teaser-web.mp4` en ligne et vérifié, la seconde ligne peut être
retirée et le fichier de 29 Mo supprimé de la médiathèque.
