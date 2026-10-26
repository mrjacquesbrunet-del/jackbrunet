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
  flex: none; margin-top: 5mm; padding: 5mm 6mm; border-radius: 3.5mm;
  background: var(--encre); color: var(--creme);
}
.face table { width: 100%; border-collapse: collapse; }
.face td { padding: 1.5mm 0; vertical-align: baseline; }
.face tr + tr td { border-top: 1px solid rgba(240,238,231,.14); }
.face .g { font-size: 10.6pt; color: rgba(240,238,231,.74); }
.face .d {
  text-align: right; font-family: var(--titre); font-weight: 800;
  font-size: 12.6pt; color: var(--or); white-space: nowrap;
}
.face p { margin-top: 4mm; font-size: 9.8pt; line-height: 1.5; color: rgba(240,238,231,.8); }
/* LA DUREE N'EST PAS ANNONCEE, ET C'EST VOULU.

   Une premiere version disait « Deux heures ». C'etait faux : ca dure
   bien plus. Annoncer deux heures et en faire quatre trahit
   exactement la confiance que le reste du flyer construit, et
   quelqu'un qui s'est senti retenu ne revient jamais.

   Mais la permission de repartir ne se donne QU'UNE FOIS. Elle etait
   ecrite ici (« Reste le temps que tu veux ») ET trois lignes plus
   bas (« repartir quand tu veux »). Dite deux fois en six lignes,
   elle cesse d'etre une liberte et devient un signal : on s'attend a
   ce que le lecteur veuille sortir. Elle ne vit donc plus qu'en bas
   de page, et le bloc noir se termine sur ce qui se passe, pas sur
   la porte. */
.face .combien { margin-top: 2.2mm; padding-top: 2.2mm; border-top: 1px solid rgba(240,238,231,.14); }
.face strong { color: var(--creme); font-weight: 700; }

/* NIER UNE ACCUSATION QUE PERSONNE N'A PORTEE, C'EST LA PLANTER.

   Cette phrase disait : « On ne te demandera rien. Ni argent, ni
   engagement, ni de te lever, ni de parler. » Quatre negations a la
   file, dans un encadre a filet rouge — le seul passage du flyer
   ecrit sur le ton d'une mention legale.

   Deux defauts. Le ton d'abord : on se justifie, donc on a quelque
   chose a se faire pardonner, et le lecteur se demande quoi. Et le
   fond ensuite : elle INTRODUIT des craintes que beaucoup n'avaient
   pas. Qui pensait qu'on allait lui demander de l'argent y pense
   maintenant.

   La meme chose, dite a l'endroit : non plus ce qui n'arrivera PAS,
   mais ce qu'il a le droit de faire. « S'asseoir au fond » est le
   detail qui compte — c'est exactement ce que fait quelqu'un qui a
   peur, et le lui permettre vaut toutes les promesses.

   NE JAMAIS FELICITER LE LECTEUR D'UN EFFORT MINIMUM.

   La chute disait : « C'est deja beaucoup. » Elle notait le lecteur.
   Et feliciter quelqu'un d'etre simplement venu s'asseoir, c'est lui
   dire que venir coute cher — donc que la chose ne vaut pas mieux que
   ce qu'il en coute. On abaissait la barre au point de retirer
   l'envie : si rester un peu est « deja beaucoup », c'est que
   l'apres-midi s'endure.

   La chute ne juge donc plus l'effort, elle parie sur ce qui va se
   passer. La permission vient d'abord (tu es libre de sortir), la
   confiance ensuite (tu ne voudras pas). Le pari est tenu par celui
   qui invite, pas par celui qui vient : aucune pression ne retombe
   sur le lecteur. */
.rassure {
  flex: none; margin-top: 6mm; text-align: center;
  font-family: var(--serif); font-size: 15pt; line-height: 1.35; color: var(--encre);
}
.rassure em { font-style: normal; color: var(--rouge); }

.pratique { flex: none; margin-top: auto; padding-top: 4mm; display: flex; gap: 6mm; align-items: flex-end; }
.pratique .infos { flex: 1; }
.pratique .k {
  font-size: 7pt; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--gris);
}
.pratique .v { font-family: var(--titre); font-weight: 900; font-size: 15pt; line-height: 1.1; text-transform: uppercase; }
.pratique .a { margin-top: 1.4mm; font-size: 9.6pt; line-height: 1.4; color: var(--gris); }
.pratique .code { flex: none; text-align: center; }
.pratique .code img { width: 24mm; height: 24mm; display: block; }
.pratique .code span { display: block; margin-top: 2mm; font-size: 8pt; font-weight: 700; color: var(--gris); }

/* « flex: none » n'est pas decoratif : le verso est une colonne
   flexible, et un bloc vide de 2,4 mm s'y fait ecraser a zero. Le
   ruban etait bien la, haut de rien du tout. */
.ruban { flex: none; margin-top: 4mm; height: 2.4mm; border-radius: 99px; background: var(--degrade); }
.fin { flex: none; margin-top: 3.5mm; text-align: center; }
.viens {
  font-family: var(--serif); font-size: 16pt; line-height: 1.1; color: var(--rouge);
}
.deja { margin-top: 2mm; font-size: 8.6pt; color: var(--gris); }
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
    <p>
      On y parlera de <strong>miracles</strong>, de <strong>gu&eacute;rison</strong>, de
      <strong>lib&eacute;ration</strong>. Pas comme d'une id&eacute;e&nbsp;: comme de
      choses qui arrivent.
    </p>
    <p class="combien">
      De la musique, des gens qui racontent ce qui leur est arriv&eacute;, et une
      pri&egrave;re pour ceux qui la demandent.
    </p>
  </div>

  <p class="rassure">
    Tu peux t'asseoir au fond, &eacute;couter,<br>
    et repartir quand tu veux.<br>
    <em>Tu risques juste de ne pas en avoir envie.</em>
  </p>

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

  <!-- LA DERNIERE PHRASE.
       Un flyer qui s'arrete sur une adresse de site s'arrete sur rien.
       Quatre mots, aucune pression, et c'est celle qui reste quand le
       papier est deja dans la poche.

       Et la preuve, juste en dessous : savoir que d'autres y sont
       alles rassure plus que toutes les promesses de la page. Ce sont
       des villes, verifiables, pas des chiffres. -->
  <div class="fin">
    <p class="viens">Viens. Tu verras bien.</p>
    <p class="deja">D&eacute;j&agrave; v&eacute;cu &agrave; Paris, Pau, Perpignan et Avignon <i>&middot;</i> <b>unseulnom.org</b></p>
  </div>
</div>

</body></html>"""


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
