# Vidéo de fond de la page Avignon

`teaser-web.mp4` est la version allégée du teaser, préparée pour servir de
fond au héros de la page événement.

| | Fichier d'origine | Version web |
|---|---|---|
| Poids | 29,3 Mo | **3,4 Mo** |
| Définition | 1920 × 1080 | 1280 × 720 |
| Piste audio | oui (320 kb/s) | oui, réencodée en 128 kb/s |
| Durée | 23 s | 23 s |

Trois raisons à ces choix :

- **Le poids.** C'est ce que chaque visiteur télécharge, téléphone compris.
  29 Mo pour un fond de page, c'est huit fois trop.
- **Le son.** Aucun navigateur ne lance seul une vidéo qui parle. Elle démarre
  donc muette, et un bouton « Activer le son » en bas de la bande rend la main
  au visiteur. La piste audio est conservée mais réencodée : 128 kb/s au lieu
  de 320, soit 0,4 Mo au total.
- **La définition.** À 1280 px de large, la différence est invisible en fond
  de page, mais le fichier pèse quatre fois moins.

La commande utilisée :

```
ffmpeg -i Teaser-1.mp4 -vf "scale=1280:-2" \
       -c:v libx264 -profile:v high -preset slow -crf 27 -pix_fmt yuv420p \
       -c:a aac -b:a 128k -ac 2 -movflags +faststart teaser-web.mp4
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

## Le bouton « Activer le son »

Il se place tout seul au-dessus du compte à rebours, à droite. S'il n'y a
**pas de piste audio** dans le fichier servi, le script le retire de la page
plutôt que de promettre un son qui n'existe pas — la détection se fait après
le chargement de la vidéo, en interrogeant les trois indicateurs que les
navigateurs exposent (aucun n'est disponible partout).
