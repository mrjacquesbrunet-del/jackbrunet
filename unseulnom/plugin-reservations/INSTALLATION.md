# Réservation des places — installation

Module WordPress qui gère les places de l'événement : compteur partagé,
limite par personne, liste des inscrits et export CSV.

## Pourquoi un module serveur

Un compteur écrit dans la page ne peut pas fonctionner : chaque visiteur
verrait son propre chiffre, et rien n'empêcherait de dépasser la capacité.
Le décompte doit vivre sur le serveur, partagé par tous.

L'incrément est **atomique** : si deux personnes réservent les dernières places
au même instant, la base de données n'en accepte qu'une. Vérifié par simulation —
80 demandes simultanées pour 192 places sur une capacité de 50 : exactement
50 places attribuées, aucun dépassement.

---

## Étape 1 — Installer le module

1. **Extensions → Ajouter une extension → Téléverser une extension**
2. Choisir `un-seul-nom-reservations.zip`
3. **Installer maintenant**, puis **Activer**

Un menu **« Réservations »** apparaît dans la colonne de gauche.

## Étape 2 — Régler les places

**Réservations** → section *Réglages* :

| Réglage | Valeur conseillée | À quoi ça sert |
|---|---|---|
| **Places ouvertes** | `650` | Total accepté, **surbooking compris**. Salle de 500 + 30 % de marge pour les absents. |
| **Maximum par personne** | `4` | Nombre de places par réservation. |
| **Inscriptions ouvertes** | coché | Décocher ferme les inscriptions sans toucher au compteur. |

Ces valeurs se modifient à tout moment, même après l'ouverture des inscriptions.

## Étape 3 — Mettre la page à jour

Remplacer le contenu des onglets **HTML** et **CSS** du bloc de la page par
`1-HTML.txt` et `2-CSS.txt`, et le JavaScript dans « CSS et JS personnalisés »
par `3-JAVASCRIPT.txt`.

---

## Ce que voit le visiteur

- **« 312 places restantes »** avec une jauge de progression
- un choix **1 à 4 places**, ramené à ce qu'il reste (s'il ne reste que 2
  places, seuls 1 et 2 sont proposés)
- **« Complet »** et bouton désactivé quand tout est réservé
- un message d'erreur clair si les dernières places viennent d'être prises

**Si le module n'est pas installé**, le compteur reste masqué et le formulaire
continue de fonctionner comme avant, en simple envoi vers Brevo.

## Ce que reçoit l'organisateur

- Le tableau **Réservations** : places ouvertes, réservées, restantes, et la
  liste des inscrits
- Un bouton **Exporter tout en CSV** (ouvrable dans Excel), pratique pour
  l'émargement à l'entrée
- Le contact part **aussi dans Brevo**, pour la newsletter et le mail de
  confirmation avec le billet PDF

> L'envoi vers Brevo n'a lieu **que si la réservation est acceptée** : personne
> ne reçoit de confirmation pour une place qu'il n'a pas obtenue.

---

## Bon à savoir

**Le surbooking se règle en une saisie.** Passer de 650 à 700 se fait dans le
champ « Places ouvertes », sans toucher au code.

**Le nombre affiché est celui des places ouvertes**, pas la capacité de la
salle. Les visiteurs voient donc « il reste X places sur 650 ».

**Annuler une réservation** n'est pas prévu dans cette version : les places ne
se libèrent pas toutes seules. Si le besoin se présente, cela peut être ajouté.

**Sauvegarde** : les réservations vivent dans deux tables de la base
(`wp_usn_reservations` et `wp_usn_compteur`). Elles sont incluses dans toute
sauvegarde standard du site. Pensez à exporter le CSV avant l'événement.
