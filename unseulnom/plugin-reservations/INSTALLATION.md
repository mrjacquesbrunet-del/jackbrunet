# Réservation des places — installation

Module WordPress qui gère les places de l'événement : compteur partagé,
limite par réservation, liste des inscrits et export CSV.

## Pourquoi un module serveur

Un compteur écrit dans la page ne peut pas fonctionner : chaque visiteur
verrait son propre chiffre, et rien n'empêcherait de dépasser la capacité.
Le décompte doit vivre sur le serveur, partagé par tous.

L'incrément est **atomique** : si deux personnes réservent les dernières places
au même instant, la base de données n'en accepte qu'une. Vérifié par simulation —
80 demandes simultanées pour 192 places sur une capacité de 50 : exactement
50 places attribuées, aucun dépassement.

---

## Une adresse, une réservation (version 1.1)

À Avignon, **1300 places réservées pour environ 450 personnes présentes**.
En cause : beaucoup n'avaient pas reçu le courriel de confirmation et se
sont réinscrites, parfois plusieurs fois. Le compteur ne voulait plus rien
dire, et la salle avait été choisie sur un chiffre faux.

Depuis la 1.1, une adresse déjà inscrite **pour la ville en cours** est
refusée, avec ce message :

> Tu es déjà inscrit avec cette adresse : 2 place(s) sont réservées à ton
> nom. Si tu n'as pas reçu la confirmation, regarde dans tes courriers
> indésirables.

Il s'affiche en bleu, pas en rouge : ce n'est pas un échec, la place est
bien prise.

Le refus arrive **avant** le décompte : une tentative en double ne consomme
aucune place. Et il ne porte que sur la ville en cours — quelqu'un qui est
venu à Avignon peut s'inscrire à Tarbes.

**Le contact part quand même dans Brevo.** La place est bien prise —
c'est pour cela qu'on refuse — mais si quelqu'un revient, c'est le plus
souvent qu'il n'a jamais reçu la confirmation. Or la seule raison
possible, c'est qu'il ne soit pas dans Brevo : l'envoi de la première
fois a échoué sans que personne le sache. Le refuser sans rien envoyer
le condamnait à ne jamais rien recevoir, à chaque essai.

Brevo ne crée pas de doublon : une adresse déjà connue est mise à jour,
pas ajoutée une seconde fois. L'envoi ne coûte donc rien, et il ferme
le trou.

> **Rien n'est envoyé quand la salle est complète.** L'automatisation
> Brevo expédie le billet : personne ne doit recevoir un billet pour une
> place qu'il n'a pas obtenue.

> **Ce que cela ne règle pas.** Le contact est désormais garanti présent
> dans Brevo. Que le courriel de confirmation soit *renvoyé* dépend du
> réglage de l'automatisation côté Brevo : « à chaque soumission du
> formulaire » le renvoie, « à la création du contact » ne le renvoie
> pas. C'est le seul point à vérifier dans Brevo.

---

## Changer de ville (version 1.1)

Le compteur est unique : tant qu'il affiche les places de l'édition
précédente, la suivante reste bloquée à « complet ». La version 1.1 ajoute
donc le passage d'une ville à l'autre.

**Réservations** → section *Passer à la ville suivante* : tape le nom
(« Tarbes 2026 »), valide. Le compteur repart de zéro et les inscriptions
se rouvrent.

**Rien n'est effacé.** Chaque réservation porte le nom de la ville pour
laquelle elle a été prise. Les inscrits des éditions précédentes restent en
base, restent exportables, et ne comptent plus dans les places restantes.
Deux boutons d'export : la ville en cours, ou toutes les villes.

Les réservations prises avant la 1.1 n'avaient pas de ville : la mise à
jour les regroupe sous « Edition precedente ».

> Exporte le CSV de la ville en cours **avant** de basculer. Rien ne sera
> perdu, mais c'est la bonne habitude.

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
| **Maximum par réservation** | `4` | Nombre de places qu'une même réservation peut prendre. |
| **Inscriptions ouvertes** | coché | Décocher ferme les inscriptions sans toucher au compteur. |

Ces valeurs se modifient à tout moment, même après l'ouverture des inscriptions.

## Étape 3 — Mettre la page à jour

Remplacer le contenu des onglets **HTML** et **CSS** du bloc de la page par
`1-HTML-tarbes.txt` et `2-CSS-tarbes.txt`, et le JavaScript dans « CSS et JS
personnalisés » par `wordpress-javascript-du-site.txt`.

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
