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

### 2. Aucun mot de jargon sur le recto

« Évangélisation », « guérison », « délivrance », « réveil » ne veulent
rien dire à qui n'a pas grandi dedans, et sonnent inquiétant. Ils n'y
sont pas. Le recto pose une question — *Et si c'était vrai ?* — et ne
promet rien d'autre que de venir voir.

### 3. Dire ce qu'on ne demandera pas

Ce qui retient quelqu'un dehors, ce n'est pas le manque d'envie. C'est
la peur d'être coincé, de devoir payer, de devoir parler, de ne pas
pouvoir partir. Le verso répond à ces quatre peurs **avant qu'elles ne
soient formulées** :

- *On ne te demandera rien* — ni argent, ni engagement, ni de te lever
- *Tu pars quand tu veux* — personne ne te retiendra
- *Tu repars avec tes questions* — du temps pour parler, ou pas

C'est la partie la plus importante du flyer, et la plus facile à
supprimer par réflexe. Ne la supprime pas.

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
