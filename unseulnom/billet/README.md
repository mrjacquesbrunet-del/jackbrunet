# Billet PDF — Un Seul Nom · Avignon

`billet-un-seul-nom-avignon.pdf` — format **A5 portrait** (148 × 210 mm),
à joindre au mail de confirmation d'inscription.

- Charte bleu-blanc-rouge, mêmes polices que la page événement.
- Le texte est **vectorisé** : le billet s'affiche à l'identique partout et
  s'imprime net, sans dépendre des polices installées sur l'appareil.
- Le QR code renvoie vers **unseulnom.org**.

Deux versions PNG accompagnent le PDF, générées depuis celui-ci :

| Fichier | Taille | Usage |
|---|---|---|
| `billet-un-seul-nom-avignon.png` | 1751 × 2483 px (300 dpi) | impression, flyer |
| `billet-un-seul-nom-avignon-web.png` | 876 × 1242 px (150 dpi) | web, réseaux sociaux, corps d'e-mail |

## Modifier le billet

Éditez `generer-billet.py` (le HTML est dedans), puis relancez la génération
avec Chromium. Les infos à changer : ville, date, horaires, lieu, intervenants.

## À savoir

Ce billet est **le même pour tout le monde** : un PDF joint à un envoi Brevo
ne peut pas porter de numéro unique par personne. Il vaut donc invitation,
pas titre nominatif — ce qui convient à une entrée libre.
