#!/usr/bin/env python3
"""Genere la lettre d'invitation aux pasteurs et responsables (A4 portrait).

    python3 generer-lettre.py

Produit lettre-un-seul-nom-avignon.pdf et son apercu PNG, dans ce dossier.

La mise en page reprend la charte de la page evenement : bandeau tricolore,
en-tete noir avec le logo vectoriel, titre Archivo tres large, accents bleu
et rouge, texte noir sur blanc.
"""

import base64
import pathlib
import subprocess

import qrcode

RACINE = pathlib.Path(__file__).resolve().parent
SCRATCH = pathlib.Path(
    "/tmp/claude-0/-home-user-jackbrunet/3053e314-abed-5e5c-8c07-dd7522061207/scratchpad"
)
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

LIEN_QR = "https://unseulnom.org/evenement/"
COURRIEL = "75unseulnomjesus@gmail.com"

# La date affichee en haut a droite. A changer avant chaque envoi.
DATE_LETTRE = "Avignon, le 12 ao\u00fbt 2026"


def qr_base64(lien):
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                         box_size=10, border=0)
    code.add_data(lien)
    code.make(fit=True)
    fichier = SCRATCH / "qr-lettre.png"
    code.make_image(fill_color="#0C0B0A", back_color="white").save(fichier)
    return base64.b64encode(fichier.read_bytes()).decode()


def logo_blanc():
    """Le meme logo vectoriel que la page evenement, en blanc."""
    return (SCRATCH / "uri_blanc.txt").read_text().strip()


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
    <div class="ville">Avignon</div>
    <div class="accroche">&Eacute;vang&eacute;lisation &amp; Gu&eacute;rison</div>
  </div>
  <div class="quand">
    <div class="j">Samedi<br>17 octobre 2026</div>
    <div class="h">Portes 15h00 &middot; Conf&eacute;rence 16h00</div>
  </div>
</div>

<div class="corps">
  <div class="date">__DATE__</div>

  <div class="appel">Chers pasteurs, chers leaders, chers fr&egrave;res et s&oelig;urs,</div>

  <p>Que la paix et la gr&acirc;ce de notre Seigneur J&eacute;sus-Christ soient avec vous
  et vos communaut&eacute;s.</p>

  <p>C'est avec joie et foi que nous vous invitons &agrave; un grand &eacute;v&eacute;nement
  d'&eacute;vang&eacute;lisation, de gu&eacute;rison et de r&eacute;veil, qui se tiendra le
  <strong>samedi 17 octobre 2026 au parc des expos d'Avignon</strong>.</p>

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

  <div class="infos">
    <h2>Informations pratiques</h2>
    <div class="ligne"><b>Date&nbsp;:</b> samedi 17 octobre 2026.</div>
    <div class="ligne"><b>Lieu&nbsp;:</b> parc des expos d'Avignon,
      800 chemin des F&eacute;lons, 84140 Montfavet.</div>
    <div class="ligne"><b>Horaires&nbsp;:</b> ouverture des portes &agrave; 15h00,
      d&eacute;but de la conf&eacute;rence &agrave; 16h00.</div>
    <div class="ligne"><b>Pr&eacute;dication&nbsp;:</b> Yannis Gautier et Chriss Campion.
      <b>Louange&nbsp;:</b> Patcha&iuml; Reyes, Nikita Heugebaert et Ruben Debard.</div>
    <div class="ligne"><b>Objectifs&nbsp;:</b> &eacute;vang&eacute;lisation et gu&eacute;rison.</div>
  </div>

  <p>Nous prions afin que cet &eacute;v&eacute;nement soit un temps de r&eacute;veil spirituel
  et que de nombreuses &acirc;mes trouvent, en J&eacute;sus-Christ, le salut et la
  restauration. Nous restons &agrave; votre disposition pour toute information
  compl&eacute;mentaire.</p>

  <div class="fin">
    <div class="salut">Restez b&eacute;ni&nbsp;!</div>
    <div class="signataires">
      <b>Chriss Campion</b><br>
      <b>Yannis Gautier</b><br>
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
    <div class="u">Scannez le code pour r&eacute;server</div>
  </div>
</div>

<div class="drapeau"><i class="b"></i><i class="w"></i><i class="r"></i></div>
</body></html>"""


def main():
    html = (HTML
            .replace("__FONTS__", (SCRATCH / "fonts-inline.css").read_text(encoding="utf-8"))
            .replace("__LOGO__", logo_blanc())
            .replace("__QR__", qr_base64(LIEN_QR))
            .replace("__COURRIEL__", COURRIEL)
            .replace("__DATE__", DATE_LETTRE))

    source = SCRATCH / "lettre.html"
    source.write_text(html, encoding="utf-8")

    pdf = RACINE / "lettre-un-seul-nom-avignon.pdf"
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
    apercu = RACINE / "lettre-un-seul-nom-avignon.png"
    subprocess.run(["pdftoppm", "-png", "-r", "150", "-singlefile",
                    str(pdf), str(apercu.with_suffix(""))],
                   check=True, capture_output=True)

    for f in (pdf, apercu):
        print("%8d octets  %s" % (f.stat().st_size, f.name))


if __name__ == "__main__":
    main()
