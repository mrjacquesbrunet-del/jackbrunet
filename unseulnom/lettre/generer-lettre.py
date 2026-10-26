#!/usr/bin/env python3
"""Genere la lettre d'invitation aux pasteurs et responsables (A4 portrait).

    python3 generer-lettre.py

Produit lettre-un-seul-nom-avignon.pdf et son apercu PNG, dans ce dossier.

La mise en page reprend la charte de la page evenement : bandeau tricolore,
en-tete noir avec le logo vectoriel, titre Archivo tres large, accents bleu
et rouge, texte noir sur blanc.
"""

import base64
import io
import pathlib
import subprocess
import tempfile

import qrcode

RACINE = pathlib.Path(__file__).resolve().parent
# Les polices et le logo vivent DANS LE DEPOT, et non dans un dossier de
# travail temporaire. La premiere version les y cherchait : le dossier a
# ete nettoye, et le script ne savait plus produire une lettre.
CHARTE = RACINE.parent / "charte"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

COURRIEL = "75unseulnomjesus@gmail.com"

# ---------------------------------------------------------------------
# LA VILLE
#
# C'est le seul bloc a changer d'une edition a l'autre. Le reste de la
# lettre ne bouge pas : c'est la meme invitation, la meme charte, et le
# meme pied de page.
# ---------------------------------------------------------------------
VILLE = {
    "nom":        "Tarbes",
    "sortie":     "lettre-un-seul-nom-tarbes",
    "date_jour":  "Samedi<br>12 d\u00e9cembre 2026",
    "date_texte": "samedi 12 d\u00e9cembre 2026",
    "horaires":   "Ouverture \u00e0 15h00 &middot; Conf\u00e9rence 16h00",
    "lieu":       "ch\u00e2teau d'Orleix, 13 bis rue des Platanes, 65800 Orleix",
    "lieu_court": "ch\u00e2teau d'Orleix, pr\u00e8s de Tarbes",
    "predication": "Jack Brunet et Chriss Campion",
    "louange":    "Briman Heugebaert et Juan Antonio",
    "places":     "400",
    "lien_qr":    "https://unseulnom.org/evenement/tarbes/",
    "date_lettre": "Tarbes, le 26 octobre 2026",
}


def qr_base64(lien):
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                         box_size=10, border=0)
    code.add_data(lien)
    code.make(fit=True)
    tampon = io.BytesIO()
    code.make_image(fill_color="#0C0B0A", back_color="white").save(tampon, format="PNG")
    return base64.b64encode(tampon.getvalue()).decode()


def logo_blanc():
    """Le meme logo vectoriel que la page evenement, en blanc."""
    return (CHARTE / "logo-blanc.txt").read_text(encoding="utf-8").strip()


HTML = """<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Lettre d'invitation</title><style>
__FONTS__
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bleu: #1B2FC4; --rouge: #E4262B; --encre: #0C0B0A;
  --papier: #F4F5F9; --trait: #E2E4EE; --gris: #55565E;
  --titre: 'Archivo', sans-serif; --texte: 'Inter', sans-serif;
}
body {
  width: 210mm; height: 297mm; background: #fff; color: var(--encre);
  font-family: var(--texte); font-size: 9.3pt; line-height: 1.52;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  display: flex; flex-direction: column;
}

/* ---- bandeau tricolore ---- */
.drapeau { display: flex; height: 4mm; flex: none; }
.drapeau i { flex: 1; }
.drapeau .b { background: var(--bleu); }
.drapeau .w { background: #fff; }
.drapeau .r { background: var(--rouge); }

/* ---- en-tete noir, echo du haut de la page evenement ---- */
.entete {
  flex: none; background: var(--encre); color: #fff;
  padding: 7mm 16mm 6.5mm; display: flex; align-items: center; gap: 7mm;
}
.entete .logo { width: 21mm; height: 21mm; flex: none;
  background: center / contain no-repeat url("__LOGO__"); }
.entete .marque {
  font-family: var(--titre); font-stretch: 125%; font-weight: 800;
  font-size: 8pt; letter-spacing: .34em; text-transform: uppercase;
  color: rgba(255,255,255,.72);
}
.entete .ville {
  font-family: var(--titre); font-stretch: 125%; font-weight: 900;
  font-size: 30pt; line-height: .92; text-transform: uppercase; margin-top: 1.2mm;
}
.entete .accroche {
  color: #FF6B6E; font-weight: 700; font-size: 9pt; letter-spacing: .06em;
  text-transform: uppercase; margin-top: 2mm;
}
.entete .quand { margin-left: auto; text-align: right; flex: none; }
.entete .quand .j {
  font-family: var(--titre); font-stretch: 112%; font-weight: 800;
  font-size: 12.5pt; text-transform: uppercase; line-height: 1.15;
}
.entete .quand .h { font-size: 8.4pt; color: rgba(255,255,255,.68); margin-top: 1.5mm; }

/* ---- corps de la lettre ---- */
.corps { flex: 1; padding: 6mm 16mm 0; display: flex; flex-direction: column; }
.date { text-align: right; font-size: 8.4pt; color: var(--gris); }
.appel { font-weight: 600; font-size: 9.6pt; margin-top: 4mm; }
p { margin-top: 3mm; text-align: justify; }
strong { font-weight: 700; }
.souligne { color: var(--bleu); font-weight: 700; }

/* ---- informations pratiques ----
   Volontairement sobre : pas de tableau ni de pastilles, seulement un
   retrait et un filet rouge. On est dans une lettre, pas dans une fiche. */
.infos { margin: 4.5mm 0 1mm; padding-left: 6mm; border-left: 2px solid var(--rouge); }
.infos h2 { font-weight: 700; font-size: 9.6pt; margin-bottom: 2.5mm; }
.ligne { margin-top: 1.6mm; }
.ligne b { font-weight: 700; }
.ligne em { font-style: normal; color: var(--gris); }

/* ---- signature ---- */
.fin { margin-top: 5mm; }
.salut { font-weight: 700; font-size: 9.8pt; }
.signataires { margin-top: 3mm; font-size: 9.6pt; line-height: 1.6; }
.signataires b { font-weight: 700; }
.signataires span { color: var(--gris); }

/* ---- pied de page ---- */
.pied {
  flex: none; background: var(--encre); color: #fff;
  padding: 5mm 16mm; display: flex; align-items: center; gap: 6mm;
}
.pied img { width: 18mm; height: 18mm; flex: none;
  background: #fff; padding: 1.5mm; border-radius: 1.5mm; }
.pied .t {
  font-family: var(--titre); font-stretch: 115%; font-weight: 800;
  font-size: 10.5pt; text-transform: uppercase;
}
.pied .s { font-size: 8.4pt; color: rgba(255,255,255,.72); margin-top: 1.5mm; line-height: 1.6; }
.pied .s b { color: #fff; font-weight: 700; }
.pied .cta { margin-left: auto; text-align: right; flex: none; }
.pied .cta .p {
  display: inline-block; background: var(--rouge); color: #fff;
  font-weight: 800; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase;
  padding: 2mm 4.5mm; border-radius: 99px;
}
.pied .cta .u { font-size: 8pt; color: rgba(255,255,255,.72); margin-top: 2mm; }
</style></head><body>

<div class="drapeau"><i class="b"></i><i class="w"></i><i class="r"></i></div>

<div class="entete">
  <div class="logo"></div>
  <div>
    <div class="marque">Un Seul Nom</div>
    <div class="ville">__VILLE__</div>
    <div class="accroche">&Eacute;vang&eacute;lisation &amp; Gu&eacute;rison</div>
  </div>
  <div class="quand">
    <div class="j">__DATE_JOUR__</div>
    <div class="h">__HORAIRES__</div>
  </div>
</div>

<div class="corps">
  <div class="date">__DATE__</div>

  <div class="appel">Chers pasteurs, chers leaders, chers fr&egrave;res et s&oelig;urs,</div>

  <p>Que la paix et la gr&acirc;ce de notre Seigneur J&eacute;sus-Christ soient avec vous
  et vos communaut&eacute;s.</p>

  <p>C'est avec joie et foi que nous vous invitons &agrave; un grand &eacute;v&eacute;nement
  d'&eacute;vang&eacute;lisation, de gu&eacute;rison et de r&eacute;veil, qui se tiendra le
  <strong>__DATE_TEXTE__ au __LIEU_COURT__</strong>. Nous &eacute;crivons aux
  &eacute;glises de Tarbes, de Pau et de toute la r&eacute;gion&nbsp;: Hautes-Pyr&eacute;n&eacute;es,
  B&eacute;arn, Gers et Haute-Garonne.</p>

  <p>Cet &eacute;v&eacute;nement a pour but d'annoncer l'&Eacute;vangile &agrave; ceux qui ont
  besoin de rencontrer J&eacute;sus : personnes non-croyantes, malades, ou en recherche de
  libert&eacute;. Nous croyons que Dieu agira puissamment pour toucher les c&oelig;urs et
  transformer des vies. Nous souhaitons encourager tout particuli&egrave;rement les pasteurs et
  responsables &agrave; &ecirc;tre pr&eacute;sents et &agrave; mobiliser leurs &eacute;glises,
  en venant avec des &acirc;mes nouvelles : une personne &agrave; inviter, une vie &agrave;
  conduire &agrave; Christ ou une personne ayant besoin de gu&eacute;rison. Ensemble, unis,
  nous pouvons voir un grand fruit pour le Royaume de Dieu.</p>

  <p>Nous tenons &agrave; pr&eacute;ciser que toutes les personnes qui donneront leur vie
  &agrave; J&eacute;sus, ou recevront gu&eacute;rison et d&eacute;livrance,
  <span class="souligne">repartiront avec ceux qui les auront invit&eacute;es, dans leurs
  &eacute;glises locales</span>, afin d'&ecirc;tre accompagn&eacute;es et affermies dans la foi.
  Notre d&eacute;sir est de renforcer l'&Eacute;glise locale et de travailler dans une
  v&eacute;ritable unit&eacute;.</p>

  <p>Cet &eacute;v&eacute;nement est une opportunit&eacute; pour l'&Eacute;glise de se lever
  ensemble, d'&ecirc;tre lumi&egrave;re et sel, et d'apporter l'esp&eacute;rance de Christ
  l&agrave; o&ugrave; elle est le plus n&eacute;cessaire.</p>

  <p><strong>L'entr&eacute;e est libre, mais la place se r&eacute;serve.</strong> La salle
  compte <strong>__PLACES__ places</strong>, et nous les ouvrons &agrave; la
  r&eacute;servation sur <strong>unseulnom.org</strong>. Nous vous demandons d'inviter vos
  membres &agrave; <span class="souligne">r&eacute;server une place par personne</span>,
  m&ecirc;me pour celles qu'ils am&egrave;nent&nbsp;: c'est ce qui nous permet de
  pr&eacute;parer l'accueil, les &eacute;quipes de pri&egrave;re et le suivi. Une
  r&eacute;servation ne prend pas une minute, et le billet arrive par courriel.</p>

  <div class="infos">
    <h2>Informations pratiques</h2>
    <div class="ligne"><b>Date&nbsp;:</b> __DATE_TEXTE__.</div>
    <div class="ligne"><b>Lieu&nbsp;:</b> __LIEU__.</div>
    <div class="ligne"><b>Horaires&nbsp;:</b> ouverture des portes &agrave; 15h00,
      d&eacute;but de la conf&eacute;rence &agrave; 16h00.</div>
    <div class="ligne"><b>Pr&eacute;dication&nbsp;:</b> __PREDICATION__.
      <b>Louange&nbsp;:</b> __LOUANGE__.</div>
    <div class="ligne"><b>Places&nbsp;:</b> entr&eacute;e libre, __PLACES__ places
      &agrave; r&eacute;server sur <b>unseulnom.org</b>.</div>
  </div>

  <p>Nous prions afin que cet &eacute;v&eacute;nement soit un temps de r&eacute;veil spirituel
  et que de nombreuses &acirc;mes trouvent, en J&eacute;sus-Christ, le salut et la
  restauration. Nous restons &agrave; votre disposition pour toute information
  compl&eacute;mentaire.</p>

  <div class="fin">
    <div class="salut">Restez b&eacute;ni&nbsp;!</div>
    <div class="signataires">
      <b>Jack Brunet</b><br>
      <b>Chriss Campion</b><br>
      <span>Toute l'&eacute;quipe d'Un Seul Nom</span>
    </div>
  </div>
</div>

<div class="pied">
  <img src="data:image/png;base64,__QR__" alt="unseulnom.org">
  <div>
    <div class="t">Mobilisez votre &eacute;glise</div>
    <div class="s">Toutes les infos et les inscriptions sur <b>unseulnom.org</b><br>
      &Eacute;crivez-nous&nbsp;: <b>__COURRIEL__</b></div>
  </div>
  <div class="cta">
    <div class="p">Entr&eacute;e libre</div>
    <div class="u">Scannez le code pour r&eacute;server votre place</div>
  </div>
</div>

<div class="drapeau"><i class="b"></i><i class="w"></i><i class="r"></i></div>
</body></html>"""


def main():
    html = HTML
    remplacements = {
        "__FONTS__":      (CHARTE / "polices.css").read_text(encoding="utf-8"),
        "__LOGO__":       logo_blanc(),
        "__QR__":         qr_base64(VILLE["lien_qr"]),
        "__COURRIEL__":   COURRIEL,
        "__DATE__":       VILLE["date_lettre"],
        "__VILLE__":      VILLE["nom"],
        "__DATE_JOUR__":  VILLE["date_jour"],
        "__DATE_TEXTE__": VILLE["date_texte"],
        "__HORAIRES__":   VILLE["horaires"],
        "__LIEU__":       VILLE["lieu"],
        "__LIEU_COURT__": VILLE["lieu_court"],
        "__PREDICATION__": VILLE["predication"],
        "__LOUANGE__":    VILLE["louange"],
        "__PLACES__":     VILLE["places"],
    }
    for cle, valeur in remplacements.items():
        html = html.replace(cle, valeur)

    # Un repere oublie se verrait sur la lettre imprimee. Mieux vaut
    # s'arreter ici.
    reste = [c for c in remplacements if c in html]
    if reste:
        raise SystemExit("Reperes non remplaces : %s" % ", ".join(reste))

    travail = pathlib.Path(tempfile.mkdtemp(prefix="usn-lettre-"))
    source = travail / "lettre.html"
    source.write_text(html, encoding="utf-8")

    pdf = RACINE / (VILLE["sortie"] + ".pdf")
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                    "--no-pdf-header-footer", "--print-to-pdf=%s" % pdf,
                    source.as_uri()], check=True, capture_output=True)

    # Une lettre d'invitation tient sur une page. Si le texte deborde, mieux
    # vaut s'en apercevoir ici que devant l'imprimante.
    pages = subprocess.run(["pdfinfo", str(pdf)], check=True,
                           capture_output=True, text=True).stdout
    nombre = int(next(l for l in pages.splitlines()
                      if l.startswith("Pages:")).split()[1])
    if nombre != 1:
        raise SystemExit(
            "La lettre fait %d pages. Reduisez le texte ou la taille de "
            "police dans la feuille de style." % nombre)

    # L'apercu est tire du PDF lui-meme, pour montrer exactement ce qui
    # sortira de l'imprimante.
    apercu = RACINE / (VILLE["sortie"] + ".png")
    subprocess.run(["pdftoppm", "-png", "-r", "150", "-singlefile",
                    str(pdf), str(apercu.with_suffix(""))],
                   check=True, capture_output=True)

    for f in (pdf, apercu):
        print("%8d octets  %s" % (f.stat().st_size, f.name))


if __name__ == "__main__":
    main()
