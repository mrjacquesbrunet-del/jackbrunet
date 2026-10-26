# Flyer d'invitation — Tarbes 2026

`flyer-invitation-tarbes.pdf` — **A5 portrait, recto-verso**, à imprimer
et à distribuer.

| Fichier | Usage |
|---|---|
| `flyer-invitation-tarbes.pdf` | le fichier pour l'imprimeur et pour toi |
| `flyer-invitation-tarbes-recto.png` | aperçu du recto |
| `flyer-invitation-tarbes-verso.png` | aperçu du verso |

## Pour qui, et pourquoi il ne ressemble pas à l'affiche

Ce flyer s'adresse à **quelqu'un qui n'est jamais entré dans une
église**. Ce n'est ni l'affiche, ni la lettre aux pasteurs : le public
n'est pas le même, donc l'objet n'est pas le même.

Trois règles commandent tout le reste.

### 1. Aucun visage

Des portraits de prédicateurs rassurent ceux qui connaissent déjà le
milieu, et **font fuir les autres** : on croit voir une affiche de
meeting, ou pire. Le flyer est entièrement typographique.

### 2. Aucun mot de jargon, mais le sujet est nommé

« Évangélisation », « guérison », « délivrance », « réveil » ne veulent
rien dire à qui n'a pas grandi dedans, et sonnent inquiétant. Ils ne
sont pas sur le recto.

En revanche **le sujet, lui, est nommé**. Le titre disait d'abord
*« Et si c'était vrai ? »* — vrai *quoi* ? Aucun antécédent, ni Dieu ni
rien d'autre sur tout le recto. Un inconnu y lisait une secte, un film
ou une publicité, et jetait le papier : **quatre personnes sur cinq ne
retournent jamais un flyer.**

Le titre est donc **« Et si Dieu existait vraiment ? »**. Toujours une
question, toujours sans jargon — mais il sait en deux secondes de quoi
on parle, et il peut décider.

Au-dessus, une ligne dit à qui l'on s'adresse : *pour ceux qui
cherchent, pour ceux qui souffrent, pour ceux qui doutent, pour ceux
qui n'osent pas*. Une question intrigue ; elle n'adresse personne.

### 3. Nommer ce que les gens vivent, avant de nommer la réponse

Le bloc noir du verso est une liste en deux colonnes, sans verbe :

| | |
|---|---|
| Face au doute | une rencontre |
| Face à la peur | une paix |
| Face à la tristesse | une joie |
| Face à la maladie | une guérison |
| Face à une vie sans direction | un avenir |

Chaque ligne nomme d'abord **ce que la personne vit**, puis ce qu'on
vient y opposer. Elle se reconnaît à gauche avant de lire la droite.

Et les mots du milieu — **miracles, guérison, libération** — sont dits
en clair. Les cacher pour ne pas effrayer reviendrait à inviter les
gens sans leur dire où ils vont, et celui qui le découvre sur place se
sent piégé.

Enfin, ce qui se passera et **combien de temps ça dure** : *« De la
musique, des gens qui racontent ce qui leur est arrivé, et une prière
pour ceux qui la demandent. Deux heures. »*

> **« Deux heures » vaut tout le reste du paragraphe.** Ce qui retient
> quelqu'un qui hésite, ce n'est pas le doute : c'est la peur de rester
> coincé. Un chiffre borne l'engagement mieux qu'aucune promesse.

> **Pourquoi Lourdes n'est pas mentionné.** C'était tentant : à vingt
> minutes de là, des millions de personnes viennent chercher une
> guérison. Mais Lourdes est catholique et Un Seul Nom est évangélique.
> S'y adosser ferait passer l'événement pour ce qu'il n'est pas, et
> ce malentendu-là coûterait plus cher qu'il ne rapporterait.

### 4. Dire ce qu'on ne demandera pas

Ce qui retient quelqu'un dehors, ce n'est pas le manque d'envie. C'est
la peur d'être coincé, de devoir payer, de devoir parler, de ne pas
pouvoir partir. Le verso répond à ces quatre peurs **avant qu'elles ne
soient formulées** :

- *On ne te demandera rien* — ni argent, ni engagement, ni de te lever
- *Tu pars quand tu veux* — personne ne te retiendra
- *Tu viens comme tu es* — seul ou accompagné

C'est la partie la plus importante du flyer, et la plus facile à
supprimer par réflexe. Ne la supprime pas.

> **Ce n'est pas une soirée.** Ça commence à 16h : on dit « un
> après-midi » ou « un rendez-vous », jamais « une soirée ».

## À l'impression

- **A5, recto-verso, pelliculage mat de préférence** : le fond sombre
  marque les traces de doigts en brillant.
- Le recto est une grande aplat sombre : demande un **papier 300 g**,
  sinon on voit le verso par transparence.
- Pas de fond perdu à prévoir, le fichier est déjà au format fini.

> Le mot « vrai » est d'une seule couleur et non d'un dégradé. Un
> dégradé enfermé dans une lettre ne passe pas en PDF — Chromium
> repeint alors la boîte du mot — et se convertit mal en quadrichromie.

## Changer de ville

Tout est dans le bloc `VILLE`, en haut de `generer-flyer.py` :

```
python3.13 generer-flyer.py
```

> Le script s'arrête si le flyer ne fait pas exactement deux pages, ou
> si un repère n'a pas été remplacé.
