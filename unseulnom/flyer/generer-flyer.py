#!/usr/bin/env python3
"""Genere le flyer d'invitation, recto-verso (A5 portrait).

    python3.13 generer-flyer.py

POUR QUI. Pour quelqu'un qui n'est jamais entre dans une eglise. Ce
n'est pas le meme objet que l'affiche ni que la lettre aux pasteurs.

TROIS REGLES, ET ELLES COMMANDENT TOUT LE RESTE.

1. AUCUN VISAGE. Des portraits de predicateurs rassurent ceux qui
   connaissent deja le milieu, et font fuir les autres : on croit voir
   une affiche de meeting, ou pire. Le flyer est entierement
   typographique.

2. AUCUN MOT DE JARGON SUR LE RECTO. « Evangelisation », « guerison »,
   « delivrance », « reveil » ne veulent rien dire a qui n'a pas
   grandi dedans, et sonnent inquietant. Ils ne sont pas employes.

3. DIRE CE QU'ON NE DEMANDERA PAS. Ce qui retient quelqu'un dehors,
   ce n'est pas le manque d'envie : c'est la peur d'etre coince, de
   devoir payer, de devoir parler, de ne pas pouvoir partir. Le verso
   repond a ces quatre peurs avant qu'elles ne soient formulees.
"""

import base64
import io
import pathlib
import subprocess
import tempfile

import qrcode
from PIL import Image

RACINE = pathlib.Path(__file__).resolve().parent
CHARTE = RACINE.parent / "charte"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

# ---------------------------------------------------------------------
# LA COULEUR DU RECTO
#
# « aube »  : fond noir, et la chaleur monte du BAS comme un lever de
#             jour. Le degrade de la marque garde son orange, et le
#             haut reste un vrai noir.
# « creme » : fond ivoire, texte noir, un seul mot en orange. Calme,
#             sobre, sans rien du code « soiree ».
#
# La premiere version etalait le degrade sur toute la page : on n'en
# percevait plus que le milieu — un prune d'aubergine — et le haut
# tournait a l'ocre sale. Le degrade de la marque est fait pour une
# BANDE, ou l'on voit les cinq couleurs d'un coup, pas pour un lavis.
# ---------------------------------------------------------------------
VARIANTE = "aube"

VILLE = {
    "nom":       "Tarbes",
    "sortie":    "flyer-invitation-tarbes",
    "date":      "Samedi 12 décembre 2026",
    "date_court": "12.12.26",
    "horaires":  "Portes 15h &middot; Début 16h",
    "lieu":      "Château d'Orleix",
    "adresse":   "13 bis rue des Platanes, 65800 Orleix",
    "lien_qr":   "https://unseulnom.org/evenement/tarbes/",
}


def qr_base64(lien):
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                         box_size=10, border=0)
    code.add_data(lien)
    code.make(fit=True)
    tampon = io.BytesIO()
    code.make_image(fill_color="#0C0B0A", back_color="white").save(tampon, format="PNG")
    return base64.b64encode(tampon.getvalue()).decode()


HTML = """<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Invitation</title><style>
__FONTS__
@page { size: A5 portrait; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --or: #F7941D; --rouge: #E4262B; --magenta: #C9268F; --violet: #6B2FB5; --bleu: #1B2FC4;
  --encre: #0C0B0A; --nuit: #121212; --creme: #F0EEE7; --gris: #5C5B54; --trait: #D8D4C8;
  --titre: 'Archivo', sans-serif; --serif: 'Instrument Serif', Georgia, serif;
  --texte: 'Inter', sans-serif;
  /* 90 DEGRES, ET NON 100. Sur le ruban du bas — 124 mm de large pour
     2,4 mm de haut — un axe incline de 10 degres traverse la hauteur
     en quelques millimetres : on ne voyait plus un degrade mais une
     cassure nette du bleu a l'orange. A 90 degres il court d'un bord
     a l'autre, comme prevu. */
  --degrade: linear-gradient(90deg, var(--or) 0%, var(--rouge) 28%, var(--magenta) 55%, var(--violet) 78%, var(--bleu) 100%);
}
body { font-family: var(--texte); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 148mm; height: 210mm; overflow: hidden; page-break-after: always; }
.page:last-child { page-break-after: auto; }

/* ================= RECTO ================= */
/* --- LE LEVER DE JOUR, SANS UN SEUL FLOU ---

   La premiere version posait quatre disques et leur appliquait
   « filter: blur(30mm) ». Un flou n'est pas une forme : le navigateur
   doit le CALCULER en pixels, donc le rasteriser, et c'est ce qui
   donnait une page molle, bruitee, qui aurait bande a l'impression.

   Ce sont maintenant des degrades radiaux empiles. Ils ne sont jamais
   rasterises : ils partent dans le PDF comme des degrades, et
   l'imprimeur les sort a sa propre definition, nets a n'importe quelle
   taille. Meme image, et plus un pixel. */
.recto {
  color: var(--creme); display: flex; flex-direction: column;
  background:
    radial-gradient(118% 62% at 46% 112%, rgba(247,148,29,.92) 0%, rgba(247,148,29,.42) 34%, rgba(247,148,29,0) 68%),
    radial-gradient(96% 52% at 16% 106%, rgba(228,38,43,.78) 0%, rgba(228,38,43,.30) 40%, rgba(228,38,43,0) 72%),
    radial-gradient(86% 58% at 96% 74%, rgba(201,38,143,.46) 0%, rgba(201,38,143,.16) 42%, rgba(201,38,143,0) 74%),
    radial-gradient(104% 64% at 4% -12%, rgba(27,47,196,.34) 0%, rgba(27,47,196,.12) 44%, rgba(27,47,196,0) 76%),
    #07070A;
}

/* --- LA VERSION CREME --- */
.recto.creme {
  color: var(--encre);
  background:
    radial-gradient(118% 62% at 46% 112%, rgba(247,148,29,.30) 0%, rgba(247,148,29,.10) 38%, rgba(247,148,29,0) 70%),
    radial-gradient(90% 54% at 92% 80%, rgba(201,38,143,.16) 0%, rgba(201,38,143,0) 68%),
    var(--creme);
}
.recto.creme .marque .mot { color: rgba(12,11,10,.6); }
.recto.creme .marque .rond { background-image: url("__LOGO_NOIR__"); }
.recto.creme .sous { color: var(--gris); }
.recto.creme .quand { border-top-color: var(--trait); }
.recto.creme .quand .l { color: var(--gris); }
/* PAS DE GRAIN. Un bruit d'ecran est fait pour un ecran : a
   l'impression il devient du sable, il moire sur les aplats sombres,
   et aucun imprimeur ne le rattrape. Il est retire, pas attenue. */
.recto .dedans { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; padding: 16mm 14mm 14mm; }

.marque { display: flex; align-items: center; gap: 4mm; }
.marque .rond { width: 13mm; height: 13mm; background: center/contain no-repeat url("__LOGO__"); flex: none; }
.marque .mot {
  font-family: var(--titre); font-weight: 800; font-size: 7.6pt;
  letter-spacing: .3em; text-transform: uppercase; color: rgba(240,238,231,.72);
}

/* NEUF BLOCS DE TEXTE SUR UN RECTO, C'EST SEPT DE TROP.

   A chaque correction j'ai ajoute une ligne, et le recto a fini
   charge : logo, nom, « pour ceux qui... » sur deux lignes, le titre,
   trois lignes de sous-titre, un filet, la date, le lieu, la pastille.

   Un recto se lit en deux secondes. On n'y garde que trois choses :
   CE DONT IL S'AGIT, QUAND, et QUE C'EST GRATUIT. Le reste appartient
   au verso, ou nulle part.

   La ligne « pour ceux qui cherchent... » est partie : le bloc
   « Face a » du verso dit la meme chose, mieux, et le titre se charge
   deja de designer qui se sent concerne. */
.question {
  margin-top: auto;
  /* LE TITRE NOMME SON SUJET.

     Il disait « Et si c'etait vrai ? ». Vrai QUOI ? Aucun antecedent,
     ni « Dieu » ni rien d'autre sur tout le recto. Un inconnu y lisait
     une secte, un film ou une pub, et jetait le papier : quatre
     personnes sur cinq ne retournent jamais un flyer.

     La forme reste une question, et elle reste sans jargon. Mais il
     sait en deux secondes de quoi on parle, et il peut decider. */
  font-family: var(--titre); font-stretch: 125%; font-weight: 900;
  font-size: 41pt; line-height: .94; letter-spacing: -.03em; text-transform: uppercase;
}
/* LE MOT ACCENTUE EST D'UNE SEULE COULEUR, PAS D'UN DEGRADE.

   Un degrade enferme dans la lettre marche a l'ecran, mais pas au
   passage en PDF : Chromium repeint alors la BOITE du mot, et un
   rectangle fantome apparaissait autour de « vrai ». Un aplat, lui,
   passe partout — et se convertit proprement en quadrichromie chez
   l'imprimeur, ce qu'un degrade dans une lettre ne fait jamais bien. */
.question b {
  font-family: var(--serif); font-weight: 400; font-size: 1.16em;
  letter-spacing: 0; text-transform: none; color: var(--or);
}
/* LES COUPURES SONT CHOISIES, PAS SUBIES.
   Laisse libre, la ligne cassait « par soi- / meme ». Une cesure au
   milieu d'un mot compose se remarque, et elle fait trebucher. Les
   trois lignes sont donc posees a la main : on coupe apres un groupe
   de sens, jamais a l'interieur. Sur un texte de trois lignes, c'est
   a la portee de n'importe qui et ca se voit tout de suite. */
.sous {
  margin-top: 7mm; font-size: 12.5pt; line-height: 1.5; color: rgba(240,238,231,.88);
}

/* Un filet qui separe ce que l'espace separe deja n'est qu'un trait de
   plus. Il est parti. */
.quand { margin-top: 12mm; }
/* La date tient sur UNE ligne. A 19 points elle passait a la ligne et
   « 2026 » se retrouvait seul en dessous : une date coupee en deux se
   lit deux fois moins vite. */
.quand .j {
  font-family: var(--titre); font-stretch: 112%; font-weight: 900;
  font-size: 17pt; text-transform: uppercase; letter-spacing: -.015em;
  white-space: nowrap;
}
.quand .l { margin-top: 2mm; font-size: 11pt; color: rgba(240,238,231,.74); }
/* Apres la question, c'est le message le plus important de la page :
   que ca ne coute rien. Il merite mieux que 9 points. */
.libre {
  display: inline-block; margin-top: 8mm; padding: 3.4mm 8mm; border-radius: 99px;
  background: var(--degrade); color: #fff;
  font-weight: 800; font-size: 11pt; letter-spacing: .14em; text-transform: uppercase;
}

/* ================= VERSO ================= */
.verso { background: var(--creme); color: var(--encre); display: flex; flex-direction: column; padding: 14mm 14mm 12mm; }
.verso h2 {
  font-family: var(--titre); font-stretch: 118%; font-weight: 900;
  font-size: 19pt; line-height: 1.08; letter-spacing: -.02em; text-transform: uppercase;
  max-width: 118mm;
}
/* La reponse est dans le titre, en romane : la question et sa reponse
   se lisent d'un seul mouvement, au lieu d'un titre puis d'une phrase
   d'introduction que personne ne lit. */
.verso h2 em {
  font-family: var(--serif); font-style: normal; font-weight: 400;
  font-size: 1.18em; text-transform: none; letter-spacing: 0; color: var(--rouge);
}

/* FACE A QUOI, ET QUOI A LA PLACE.

   Une liste en deux colonnes, sans verbe. Chaque ligne nomme d'abord
   ce que la personne vit — le doute, la peur, la tristesse, la maladie
   — puis ce qu'on vient y opposer. Elle se reconnait a gauche avant de
   lire la droite.

   Les mots du milieu (miracles, guerison, liberation) sont dits en
   clair : les cacher pour ne pas effrayer reviendrait a inviter les
   gens sans leur dire ou ils vont. */
.face {
  flex: none; margin-top: 7mm; padding: 6.5mm 7mm; border-radius: 3.5mm;
  background:
    linear-gradient(100deg, rgba(247,148,29,.32) 0%, rgba(247,148,29,.17) 58%, rgba(247,148,29,.09) 100%),
    #FBF9F4;
  color: var(--encre);
}
.face table { width: 100%; border-collapse: collapse; }
.face td { padding: 1.6mm 0; vertical-align: baseline; }
/* LES FILETS DU TABLEAU ONT SAUTE. Quatre traits horizontaux entre
   cinq lignes deja separees par l'alignement, la couleur et la
   graisse : ils ne separaient rien que l'espace ne separait pas, et
   ils donnaient au pave la mine d'un tableau de tarifs. Sans eux
   c'est une declaration. Les cellules respirent un peu plus pour
   faire le travail que les traits faisaient mal.

   Et la colonne de gauche est remontee de .74 a .86 d'opacite : a
   .74 contre un orange plein a 800, elle perdait de dix longueurs,
   si bien qu'on lisait cinq promesses AVANT ce a quoi elles
   repondent. C'est exactement l'ordre inverse de celui qu'on veut :
   le lecteur doit d'abord se reconnaitre. */
.face .g { font-size: 10pt; color: var(--gris); }
.face .d {
  text-align: right; font-family: var(--titre); font-weight: 800;
  font-size: 13pt; color: var(--rouge); white-space: nowrap;
}
/* LE DEROULE EST SORTI DU PAVE, ET C'EST LA VRAIE REPONSE A
   « C'EST TROP CHARGE ».

   Le rectangle noir faisait 86 mm de haut, 47 % de la hauteur utile,
   contre 23 mm pour le titre : quatre fois le bloc principal. Un
   aplat noir sur fond ivoire bat n'importe quelle typographie, donc
   on lisait la grille AVANT la phrase qui s'adresse a la personne.
   L'ordre du document etait retourne par la seule force d'une
   surface.

   Or ce n'est pas le TEXTE qui pesait, c'est l'ENCRE. Le pave tenait
   deux choses de nature differente : cinq lignes qui frappent, et un
   paragraphe qui explique. En sortant le paragraphe sur l'ivoire, on
   ne coupe pas un mot et la masse noire tombe de moitie. Le pave
   redevient ce qu'il aurait toujours du etre : une declaration, pas
   un encadre fourre-tout. */
.deroule {
  flex: none; margin-top: 5mm; font-size: 10pt; line-height: 1.5; color: var(--gris);
}
.deroule strong { color: var(--encre); font-weight: 700; }
/* QUATRE MOTS QUI TOMBENT, PUIS LA MUSIQUE.

   Ce paragraphe faisait quatre lignes et disait : « On y parlera de
   miracles, de guerison, de liberation — pas comme d'une idee, comme
   de choses qui arrivent. De la musique, des gens qui racontent ce
   qui leur est arrive, une priere si tu la demandes. »

   Le defaut n'est pas la longueur, c'est la SYNTAXE. « Pas comme
   d'une idee, comme de choses qui arrivent » demande au lecteur de
   tenir deux comparaisons en suspens pour comprendre une nuance de
   degre. Ecrit a la table, ca se suit ; debout, avec un papier qu'on
   n'a pas demande, ca decroche. Et une phrase qu'on decroche est une
   phrase perdue, pas une phrase lue a moitie.

   Quatre noms detaches font le meme travail sans rien demander :
   chacun est un point d'arret, et le lecteur en attrape au moins un
   qui le concerne. On ne gagne pas en nuance, on gagne en prise.

   Le gospel ferme la ligne parce que c'est le seul element du
   programme qu'un non-croyant trouve deja desirable : il en a
   entendu, il sait que c'est beau, et ca ne lui demande rien.

   Mais on annonce « une musique TYPE gospel », pas « du gospel », et
   la nuance est une question d'honnetete. « Du gospel » fait
   attendre une chorale ; ce qui attend le lecteur est de la louange
   dans cette couleur-la. Promettre une chorale a quelqu'un qui vient
   pour elle, c'est le perdre a la premiere note — et c'est
   exactement le genre de petit mensonge qui coute un retour.
   « Type » a l'air plus faible sur le papier ; il tient devant les
   faits, et le mot « louange » reste dehors.

   « Reste le temps que tu veux » a saute : trois phrases la
   disaient deja autrement, et une permission repetee cesse d'etre
   une liberte. */
/* LA DUREE N'EST PAS ANNONCEE, ET C'EST VOULU.

   Une premiere version disait « Deux heures ». C'etait faux : ca dure
   bien plus. Annoncer deux heures et en faire quatre trahit
   exactement la confiance que le reste du flyer construit, et
   quelqu'un qui s'est senti retenu ne revient jamais.

   La permission vit ICI et nulle part ailleurs. Elle a un temps
   cohabite avec un « repartir quand tu veux » trois lignes plus bas :
   dite deux fois en six lignes, elle cesse d'etre une liberte et
   devient un signal, on s'attend a ce que le lecteur veuille sortir.
   Elle est donc restee dans le bloc noir, au milieu de ce qui se
   passe, et la ligne du bas sert maintenant a autre chose. */


/* LA LIGNE QUI PORTE LE NOM.

   Tout le flyer s'appelle « Un Seul Nom » et ne disait nulle part
   POURQUOI. Un lecteur qui n'a jamais mis les pieds dans une eglise
   lisait la marque sans jamais apprendre ce qu'elle veut dire, et le
   verso enumerait cinq reponses (une rencontre, une paix, une joie,
   une guerison, un avenir) sans jamais nommer d'ou elles viennent.
   C'etait le trou du document : le nom de l'evenement etait un
   decor.

   Cette ligne a d'abord essaye deux autres choses, toutes deux
   ratees, et les deux ratages disent la meme chose.

   1. « On ne te demandera rien : ni argent, ni engagement, ni de te
      lever, ni de parler. » Quatre negations dans un encadre a filet
      rouge, le seul passage ecrit comme une mention legale. Nier une
      accusation que personne n'a portee, c'est la planter : qui ne
      pensait pas qu'on allait lui demander de l'argent y pensait
      ensuite.

   2. « Tu peux t'asseoir au fond [...] c'est deja beaucoup. » La
      permission etait juste, la chute non : elle felicitait le
      lecteur d'un effort minimum. Feliciter quelqu'un d'etre venu
      s'asseoir, c'est lui dire que venir coute cher, donc que la
      chose ne vaut pas mieux que ce qu'elle coute. La barre
      descendait si bas qu'elle emportait l'envie avec elle.

   Les deux versions occupaient la meilleure place du verso — juste
   sous le bloc noir, juste avant l'adresse — pour LEVER UN
   OBSTACLE. Or l'obstacle etait deja leve dans le bloc noir. Cette
   place ne doit pas rassurer : elle doit donner la raison de venir.

   D'ou un CONTRASTE, et non une question. Trois choses que le
   lecteur a reellement essayees sont nommees — la religion, les
   valeurs, l'effort — et les TROIS gagnent. Un cadre, des reperes,
   des resultats : ce sont de vraies reussites, pas des consolations.
   Celui qui les a cherchees n'est pas traite en imbecile, et on ne
   gagne personne en demolissant ce qu'il a tente.

   Une version disait « des regles » et « de la fatigue ». C'etait
   deux fois le meme defaut : on faisait perdre les deux premiers pour
   que le troisieme gagne. Un lecteur qui tient a sa discipline ou a
   ses efforts se sentait vise, et un argument qui a besoin d'abaisser
   l'autre camp pour tenir n'est pas un argument. Concede-lui tout :
   le contraste n'en est que plus net, parce qu'il ne porte plus sur
   la QUALITE de ce qu'il a trouve mais sur sa NATURE.

   Le pivot est dans le VERBE. Un cadre, on s'y range ; des reperes,
   on les suit ; des resultats, on les produit. Trois choses dont le
   lecteur reste l'auteur, et qui le laissent exactement le meme
   homme. « Transforme » est le premier verbe de la page dont il n'est
   plus l'auteur mais l'objet : quelqu'un d'autre agit. Tout l'ecart
   est la, et le « Mais » le fait entendre avant meme qu'on l'ait
   compris.

   Et le Nom arrive en dernier, en reponse a une phrase que le lecteur
   a deja approuvee. Pas une affirmation a croire d'emblee : la fin
   d'un raisonnement qu'il vient de suivre. */
.nom {
  text-align: center; font-family: var(--serif);
}
/* LE CENTRAGE EST CALCULE, PAS REGLE A LA MAIN.
   « .milieu » prend tout l'espace qui reste entre le deroule et le
   pied, et y centre la ligne du Nom. Une marge fixe aurait l'air
   juste sur ce texte-ci et faux des que le deroule gagne ou perd une
   ligne ; la, l'equilibre se refait tout seul. */
.milieu { flex: 1; display: flex; align-items: center; justify-content: center; }
.nom .q { font-size: 13pt; line-height: 1.3; color: var(--gris); }
.nom .r { margin-top: 2mm; font-size: 17pt; line-height: 1.25; color: var(--encre); }
.nom .r em { font-style: normal; color: var(--rouge); }

/* LA DATE PREND TOUTE LA LARGEUR. A 17pt, serree contre le QR dans
   les 94 mm restants, « SAMEDI 12 DECEMBRE 2026 » passait a la ligne
   et laissait un « 2026 » orphelin. Elle occupe donc sa propre
   bande, sur les 124 mm pleins, et le QR ne partage plus que
   l'adresse. */
/* LE PIED : TOUT CE QUI N'EST PAS L'ARGUMENT, ET QUI DOIT SE VOIR
   COMME TEL.

   Date, lieu, adresse, horaires, QR : ce sont des renseignements. On
   les prend quand on a deja decide, jamais avant. La date etait
   montee a 17pt, au rang de la ligne du Nom — deux choses de poids
   egal, dont une seule merite ce poids. Elle redescend a 13pt et le
   bloc entier devient un pied : present, lisible, et manifestement
   secondaire. Ce qu'on gagne en millimetres va en air autour du
   Nom.

   LE QR PASSE DE 24 A 16 MM, et ce n'est pas un pari. Le code tient
   en version 3, soit 29 modules de cote : a 16 mm chaque module fait
   0,55 mm, largement au-dessus des 0,4 mm sous lesquels un telephone
   commence a peiner. On pouvait donc le reduire d'un tiers sans rien
   risquer — ce qui n'aurait pas ete vrai avec une adresse plus
   longue.

   LE RUBAN REVIENT, et mieux pose qu'avant. Il avait 4 mm d'air
   au-dessus et 2,5 mm en dessous : plus pres de la ligne qu'il
   suivait que du bloc qu'il separait, donc lu comme un ornement
   accroche au bas de page. Les valeurs sont inversees — 4,5 mm
   au-dessus, 3,5 en dessous — et il redevient ce qu'il est : la
   signature de couleur de la marque, qui n'appartient a aucun des
   deux blocs. */
.pied { flex: none; padding-top: 5mm; }
.pratique { display: flex; gap: 6mm; align-items: flex-start; }
.pratique .infos { flex: 1; }
.pratique .k {
  font-size: 8pt; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--gris);
}
.pratique .v { margin-top: .8mm; font-family: var(--titre); font-weight: 900; font-size: 13pt; line-height: 1.1; text-transform: uppercase; }
.pratique .a { margin-top: 1.8mm; font-size: 10pt; line-height: 1.45; color: var(--gris); }
.pratique .code { flex: none; text-align: center; }
.pratique .code img { width: 16mm; height: 16mm; display: block; }
.pratique .code span { display: block; margin-top: 1.4mm; font-size: 8pt; font-weight: 700; color: var(--gris); }

/* « flex: none » n'est pas decoratif : le verso est une colonne
   flexible, et un bloc vide de 2,4 mm s'y fait ecraser a zero. Le
   ruban etait bien la, haut de rien du tout. */
.ruban { flex: none; margin-top: 4.5mm; height: 2.4mm; border-radius: 99px; background: var(--degrade); }

.fin { margin-top: 3.5mm; text-align: center; }
.deja { font-size: 8pt; color: var(--gris); }
.deja i { font-style: normal; opacity: .55; margin: 0 1mm; }
.deja b { font-family: var(--titre); font-weight: 800; color: var(--encre); letter-spacing: .02em; }
</style></head><body>

<!-- ======================= RECTO ======================= -->
<div class="page recto __VARIANTE__">
  <div class="dedans">

    <div class="marque">
      <div class="rond"></div>
      <div class="mot">Un Seul Nom</div>
    </div>

    <div class="question">Et si <b>Dieu</b><br>existait<br>vraiment&nbsp;?</div>

    <p class="sous">
      Un apr&egrave;s-midi pour venir voir<br>
      par soi-m&ecirc;me. Sans rien conna&icirc;tre,<br>
      sans rien devoir.
    </p>

    <div class="quand">
      <div class="j">__DATE__</div>
      <div class="l">__LIEU__, __VILLE__ &middot; __HORAIRES__</div>
    </div>

    <div><span class="libre">Entr&eacute;e libre</span></div>
  </div>
</div>

<!-- ======================= VERSO ======================= -->
<div class="page verso">

  <h2>Tu n'es jamais entr&eacute; dans une &eacute;glise&nbsp;?<br><em>C'est exactement pour toi.</em></h2>

  <div class="face">
    <table>
      <tr><td class="g">Face au doute</td><td class="d">une rencontre</td></tr>
      <tr><td class="g">Face &agrave; la peur</td><td class="d">une paix</td></tr>
      <tr><td class="g">Face &agrave; la tristesse</td><td class="d">une joie</td></tr>
      <tr><td class="g">Face &agrave; la maladie</td><td class="d">une gu&eacute;rison</td></tr>
      <tr><td class="g">Face &agrave; une vie sans direction</td><td class="d">un avenir</td></tr>
    </table>
  </div>

  <p class="deroule">
    On parlera d'<strong>espoir</strong>. De <strong>libert&eacute;</strong>.
    De <strong>gu&eacute;rison</strong>. De <strong>miracles</strong>.<br>
    Le tout port&eacute; par une <strong>musique type gospel</strong>.
  </p>

  <div class="milieu">
   <div class="nom">
    <p class="q">
      La religion donne un cadre. Les valeurs, des rep&egrave;res.<br>
      Les efforts, des r&eacute;sultats.
    </p>
    <p class="r"><em>Mais un seul Nom transforme. J&eacute;sus-Christ.</em></p>
   </div>
  </div>

  <div class="pied">
    <div class="pratique">
      <div class="infos">
        <div class="k">Rendez-vous</div>
        <div class="v">__DATE__</div>
        <div class="a"><strong>__LIEU__</strong><br>__ADRESSE__<br>__HORAIRES__</div>
      </div>
      <div class="code">
        <img src="data:image/png;base64,__QR__" alt="">
        <span>R&eacute;serve ta place</span>
      </div>
    </div>

    <div class="ruban"></div>

  <!-- LA PREUVE, ET RIEN D'AUTRE.
       Savoir que d'autres y sont alles rassure plus que toutes les
       promesses de la page. Ce sont des villes, verifiables, pas des
       chiffres. -->
    <div class="fin">
      <p class="deja">D&eacute;j&agrave; v&eacute;cu &agrave; Paris, Pau, Perpignan et Avignon <i>&middot;</i> <b>unseulnom.org</b></p>
    </div>
  </div>
</div>

</body></html>"""


def verifier_debordement(source):
    """Refuse une page dont le contenu sort du cadre.

    Le controle de pagination plus bas ne voit rien : « .page » est une
    colonne de hauteur fixe, donc un texte trop long est SILENCIEUSEMENT
    rogne par le navigateur. Le PDF fait toujours ses deux pages, et la
    derniere ligne a simplement disparu. C'est arrive une fois, et ca ne
    se voit qu'en regardant l'image.

    On mesure donc le bas reel de chaque element contre la zone de texte
    de sa page (bord moins marge interieure), et on s'arrete net.
    """
    from playwright.sync_api import sync_playwright

    mesure = """() => Array.from(document.querySelectorAll('.page')).map(function (p) {
      var st = getComputedStyle(p), r = p.getBoundingClientRect();
      var plancher = r.bottom - parseFloat(st.paddingBottom);
      var bas = 0, coupable = '';
      p.querySelectorAll('*').forEach(function (el) {
        var q = el.getBoundingClientRect();
        if (q.height > 0 && q.bottom > bas) { bas = q.bottom; coupable = el.className || el.tagName; }
      });
      return { depasse: bas - plancher, coupable: String(coupable) };
    })"""

    with sync_playwright() as pw:
        nav = pw.chromium.launch(executable_path=CHROME)
        onglet = nav.new_page()
        onglet.goto(source.as_uri())
        onglet.wait_for_timeout(400)
        pages = onglet.evaluate(mesure)
        nav.close()

    for numero, page in enumerate(pages, 1):
        mm = page["depasse"] * 25.4 / 96.0
        cote = "recto" if numero == 1 else "verso"
        if mm > 0.2:
            raise SystemExit(
                "Le %s deborde de %.1f mm (dernier element : %s). "
                "Le PDF sortirait avec le bas rogne." % (cote, mm, page["coupable"]))
        print("  %-5s  %5.1f mm d'air sous le dernier element" % (cote, -mm))


def main():
    html = HTML
    pieces = {
        "__FONTS__":    (CHARTE / "polices.css").read_text(encoding="utf-8"),
        "__LOGO__":     (CHARTE / "logo-blanc.txt").read_text(encoding="utf-8").strip(),
        "__LOGO_NOIR__": (CHARTE / "logo-noir.txt").read_text(encoding="utf-8").strip(),
        "__VARIANTE__": "creme" if VARIANTE == "creme" else "",
        "__QR__":       qr_base64(VILLE["lien_qr"]),
        "__VILLE__":    VILLE["nom"],
        "__DATE__":     VILLE["date"],
        "__HORAIRES__": VILLE["horaires"],
        "__LIEU__":     VILLE["lieu"],
        "__ADRESSE__":  VILLE["adresse"],
    }
    for cle, valeur in pieces.items():
        html = html.replace(cle, valeur)
    reste = [c for c in pieces if c in html]
    if reste:
        raise SystemExit("Reperes non remplaces : %s" % ", ".join(reste))

    travail = pathlib.Path(tempfile.mkdtemp(prefix="usn-flyer-"))
    source = travail / "flyer.html"
    source.write_text(html, encoding="utf-8")
    verifier_debordement(source)

    suffixe = "" if VARIANTE == "aube" else "-" + VARIANTE
    pdf = RACINE / (VILLE["sortie"] + suffixe + ".pdf")
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                    "--no-pdf-header-footer", "--print-to-pdf=%s" % pdf,
                    source.as_uri()], check=True, capture_output=True)

    info = subprocess.run(["pdfinfo", str(pdf)], check=True, capture_output=True, text=True).stdout
    pages = int(next(l for l in info.splitlines() if l.startswith("Pages:")).split()[1])
    if pages != 2:
        raise SystemExit("Le flyer fait %d page(s), il en faut 2 (recto et verso)." % pages)

    sorties = [pdf]
    for numero, nom in ((1, "-recto"), (2, "-verso")):
        png = RACINE / (VILLE["sortie"] + suffixe + nom + ".png")
        subprocess.run(["pdftoppm", "-png", "-r", "150", "-f", str(numero), "-l", str(numero),
                        "-singlefile", str(pdf), str(png.with_suffix(""))],
                       check=True, capture_output=True)
        sorties.append(png)

    # UNE SECONDE VERSION, A PLAT, POUR LES IMPRIMEURS DIFFICILES.
    #
    # Chromium embarque les polices variables en « Type 3 ». C'est du
    # vectoriel, et cela sort net sur toute machine moderne — mais
    # certains ateliers refusent le Type 3 par principe. Cette version
    # ne contient plus une seule police : chaque page est une image a
    # 600 points par pouce, soit au-dessus de ce que demande n'importe
    # quelle presse offset. Rien ne peut plus etre substitue.
    pages = []
    for numero in (1, 2):
        brut = travail / ("page%d" % numero)
        subprocess.run(["pdftoppm", "-png", "-r", "600", "-f", str(numero), "-l", str(numero),
                        "-singlefile", str(pdf), str(brut)], check=True, capture_output=True)
        pages.append(Image.open(str(brut) + ".png").convert("RGB"))
    plat = RACINE / (VILLE["sortie"] + suffixe + "-600dpi.pdf")
    pages[0].save(plat, save_all=True, append_images=pages[1:], resolution=600.0)
    sorties.append(plat)

    for f in sorties:
        print("%8d octets  %s" % (f.stat().st_size, f.name))


if __name__ == "__main__":
    main()
