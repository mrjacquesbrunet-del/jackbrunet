# Brevo — une liste par ville

**Objectif :** à chaque événement, retrouver tous ses contacts dans une
liste Brevo à son nom, comme pour Avignon. Avec le nombre de places.

---

## Ce qu'il me faut : une clé API

**Oui, il m'en faut une.** C'est la seule chose qui manque, et c'est la
seule que je ne peux pas fabriquer moi-même.

Le formulaire Brevo — celui que la page utilisait jusqu'ici — ne sait
déposer que dans **la liste qui lui est attachée**, toujours la même. Il
ne peut pas en créer une par ville. Seule l'API le peut.

### Où la prendre

1. Se connecter à Brevo
2. En haut à droite, le nom du compte → **SMTP et API**
3. Onglet **Clés API** → **Générer une nouvelle clé API**
4. Nom : `Site Un Seul Nom`
5. Copier la clé — elle commence par `xkeysib-`

> **Elle ne s'affiche qu'une fois.** Copie-la tout de suite.

### Où la coller

**Réservations → Réglages → Clé API Brevo**, puis **Enregistrer**.

> **Jamais dans la page.** Cette clé ouvre tout ton compte Brevo, et une
> page est lisible par n'importe qui avec un clic droit. Elle va dans le
> module, côté serveur, où personne ne peut la lire. C'est pour cela
> qu'elle se colle dans l'écran Réservations et nulle part ailleurs.

---

## Ce qui se passe ensuite, tout seul

| Quand | Ce que fait le module |
|---|---|
| Tu ouvres une ville (« Tarbes 2026 ») | Il crée la liste **« Un Seul Nom - Tarbes 2026 »** dans Brevo |
| Quelqu'un réserve | Il le dépose dans cette liste, avec `NOM`, `VILLE`, `PLACES`, `SOURCE` |
| Quelqu'un revient alors qu'il est déjà inscrit | Il le dépose **quand même** — voir plus bas |
| La salle est complète | Il n'envoie **rien** |

Les attributs `NOM`, `VILLE`, `PLACES` et `SOURCE` sont créés
automatiquement au premier envoi. Tu n'as rien à préparer dans Brevo.

### Pourquoi déposer quelqu'un qu'on refuse

Celui qui revient s'inscrire le fait presque toujours parce qu'il n'a
jamais reçu la confirmation. Or la seule explication possible, c'est
qu'il **ne soit pas chez Brevo** : l'envoi de la première fois a échoué
sans que personne le sache. Le refuser sans rien envoyer le condamnait à
ne jamais rien recevoir, à chaque essai. C'est Avignon.

Brevo ne crée pas de doublon : une adresse déjà connue est mise à jour.

### Pourquoi ne rien envoyer quand c'est complet

L'automatisation Brevo expédie le billet. Personne ne doit recevoir un
billet pour une place qu'il n'a pas obtenue.

---

## Ce que ça change pour toi

**Tu sais enfin quand un envoi échoue.** C'est le vrai défaut d'avant :
la page envoyait le contact dans un cadre invisible et **personne ne
lisait jamais la réponse**. Un échec passait inaperçu. Maintenant,
l'écran **Réservations** affiche le dernier envoi, en vert s'il est
passé, en rouge avec le message d'erreur sinon.

**Tu retrouves chaque ville séparément**, dans Brevo comme dans le
module :

- **Dans Brevo** : la liste « Un Seul Nom - Tarbes 2026 »
- **Dans le module** : le bouton *Exporter la ville en cours* en CSV

---

## Sans clé API

Rien ne casse. La page continue d'envoyer les contacts au formulaire
Brevo comme avant. Mais :

- toutes les villes arrivent dans la même liste
- le nombre de places n'arrive pas
- personne n'est prévenu quand un envoi échoue

Les deux ne tournent jamais en même temps : dès que la clé est là, la
page se tait et laisse le serveur faire. Sinon le contact arriverait
deux fois, et la seconde sans sa ville ni ses places.

---

## Le point qui reste, et c'est le plus important

**La délivrabilité.** À Avignon, 1300 inscrits et 450 présents, parce
que les courriels n'arrivaient pas. Une liste bien rangée ne change rien
à cela : si le message part dans les indésirables, il part dans les
indésirables.

Ce qui le règle, c'est l'**authentification du domaine** :

1. Brevo → **Expéditeurs, domaines et IP dédiées** → onglet **Domaines**
2. Ajouter `unseulnom.org` → Brevo donne deux ou trois lignes à copier
   (DKIM, DMARC)
3. Les coller chez le bureau d'enregistrement du domaine, dans la zone DNS
4. Revenir sur Brevo et cliquer **Vérifier**

Tant que le domaine n'est pas authentifié, les messages partent au nom
de Brevo et non au tien, et les boîtes s'en méfient. C'est le seul point
que je ne peux pas faire d'ici : il se passe chez ton hébergeur de nom
de domaine.

**Et un réglage à vérifier dans l'automatisation :** « à chaque
soumission du formulaire » renvoie la confirmation à celui qui revient,
« à la création du contact » ne la renvoie pas. Si tu veux que ceux qui
n'ont rien reçu le reçoivent enfin, c'est le premier qu'il faut.
