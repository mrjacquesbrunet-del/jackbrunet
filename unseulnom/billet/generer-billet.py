#!/usr/bin/env python3
"""Genere le billet universel de l'evenement (A5 portrait).

    python3.13 generer-billet.py

Produit le PDF et ses deux apercus PNG dans ce dossier.

UN BILLET UNIVERSEL. Le meme pour tout le monde : il vaut invitation, pas
titre nominatif. C'est ce qui permet de le joindre tel quel au courriel de
confirmation, de l'imprimer par paquets pour les eglises, et de le faire
suivre. L'entree est libre ; c'est la reservation en ligne qui compte les
places, pas ce papier.

LE STYLE SUIT LA FICHE DE LA VILLE. L'affiche occupe tout le haut du
billet, exactement comme en tete de la page de l'evenement : celui qui
recoit le billet reconnait du premier coup d'oeil ce qu'il a deja vu sur
le site et sur les reseaux.
"""

import base64
import mimetypes
import pathlib
import subprocess
import tempfile

import qrcode

RACINE = pathlib.Path(__file__).resolve().parent
# Les polices et le logo vivent DANS LE DEPOT : un dossier de travail
# temporaire se fait nettoyer, et le script ne sait alors plus produire
# un billet.
CHARTE = RACINE.parent / "charte"
IMAGES = RACINE.parent / "images"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

# ---------------------------------------------------------------------
# LA VILLE
#
# Seul bloc a changer d'une edition a l'autre.
# ---------------------------------------------------------------------
VILLE = {
    "nom":         "Tarbes",
    "sortie":      "billet-un-seul-nom-tarbes",
    "affiche":     "affichetarbeslarge.webp",
    "date":        "Samedi 12 décembre 2026",
    "ouverture":   "15h00",
    "conference":  "16h00",
    "lieu":        "Château d'Orleix",
    "adresse":     "13 bis rue des Platanes, 65800 Orleix",
    "predication": "Jack Brunet &middot; Chriss Campion",
    "louange":     "Briman Heugebaert &middot; Juan Antonio",
    "lien_qr":     "https://unseulnom.org/evenement/tarbes/",
}


def qr_base64(lien):
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                         box_size=10, border=0)
    code.add_data(lien)
    code.make(fit=True)
    fichier = pathlib.Path(tempfile.mkdtemp(prefix="usn-qr-")) / "qr.png"
    code.make_image(fill_color="#0C0B0A", back_color="white").save(fichier)
    return base64.b64encode(fichier.read_bytes()).decode()


def image_uri(nom):
    chemin = IMAGES / nom
    type_mime = mimetypes.guess_type(chemin.name)[0] or "image/webp"
    return "data:%s;base64,%s" % (type_mime,
                                  base64.b64encode(chemin.read_bytes()).decode())


HTML = """<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Billet</title><style>
__FONTS__
@page { size: A5 portrait; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bleu: #1B2FC4; --rouge: #E4262B; --encre: #0C0B0A;
  --papier: #F4F5F9; --trait: #E2E4EE; --gris: #55565E;
  --titre: 'Archivo', sans-serif; --texte: 'Inter', sans-serif;
}
body {
  width: 148mm; height: 210mm; font-family: var(--texte); color: var(--encre);
  background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  display: flex; flex-direction: column;
}
.drapeau { display: flex; height: 4.5mm; flex: none; }
.drapeau i { flex: 1; }
.drapeau .b { background: var(--bleu); }
.drapeau .w { background: #fff; }
.drapeau .r { background: var(--rouge); }

/* ---- L'AFFICHE, EN TETE, COMME SUR LA PAGE DE L'EVENEMENT ----
   Elle garde toute sa largeur et n'est recadree que du haut et du bas :
   l'affiche porte des visages et des noms qui touchent les bords
   lateraux, les rogner en couperait des morceaux.

   Rien n'est ecrit par-dessus. Une premiere version y posait « UN SEUL
   NOM / TARBES » en grand : l'affiche le dit deja, en plus beau, et les
   deux se repetaient. */
.affiche { position: relative; flex: none; background: var(--encre); height: 57mm; overflow: hidden; }
.affiche img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center 42%; }
/* ---- la date ---- */
.date {
  flex: none; background: var(--papier); border-bottom: 1px solid var(--trait);
  padding: 4.5mm 9mm; text-align: center;
}
.date .d {
  font-family: var(--titre); font-stretch: 125%; font-weight: 800;
  font-size: 15pt; text-transform: uppercase;
}
.date .p { font-size: 8.6pt; color: var(--gris); margin-top: .8mm; }

/* ---- le corps ---- */
.corps { flex: 1; padding: 5.5mm 9mm 0; display: flex; flex-direction: column; }
.rangee { display: flex; gap: 3mm; flex: none; }
.case { flex: 1; border: 1px solid var(--trait); border-radius: 2.5mm; padding: 3mm 2mm; text-align: center; }
.case .k { font-size: 6pt; letter-spacing: .18em; text-transform: uppercase; color: var(--bleu); font-weight: 800; }
.case .v { font-family: var(--titre); font-stretch: 110%; font-weight: 800; font-size: 12pt; margin-top: 1.2mm; }

.lieu { margin-top: 4.5mm; border-left: 2.5px solid var(--rouge); padding-left: 3.5mm; flex: none; }
.lieu .k { font-size: 6pt; letter-spacing: .18em; text-transform: uppercase; color: var(--bleu); font-weight: 800; }
.lieu .v { font-weight: 700; font-size: 11pt; margin-top: .8mm; }
.lieu .a { font-size: 9pt; color: var(--gris); }

.ligne { display: flex; align-items: baseline; gap: 3mm; margin-top: 3mm; flex: none; }
.ligne .k {
  font-size: 6pt; letter-spacing: .16em; text-transform: uppercase;
  color: var(--bleu); font-weight: 800; width: 22mm; flex: none;
}
.ligne .v { font-size: 9.6pt; }

.libre { margin-top: 4.5mm; flex: none; }
.libre span {
  display: inline-block; background: var(--rouge); color: #fff; font-weight: 800;
  font-size: 7.4pt; letter-spacing: .14em; text-transform: uppercase;
  padding: 1.4mm 3.2mm; border-radius: 99px;
}

.phrase { margin-top: auto; padding: 5mm 2mm 5mm; text-align: center; flex: none; }
.phrase .q {
  font-family: var(--titre); font-stretch: 115%; font-weight: 800;
  font-size: 12pt; line-height: 1.18; text-transform: uppercase;
}
.phrase .q b { color: var(--bleu); font-weight: 800; }
.phrase .n { font-size: 8.2pt; color: var(--gris); margin-top: 2mm; }

/* ---- le talon ---- */
.talon {
  flex: none; border-top: 1.2px dashed #B9BDCE;
  padding: 4.5mm 9mm 5mm; display: flex; align-items: center; gap: 4.5mm;
}
.talon img { width: 20mm; height: 20mm; flex: none; }
.talon .t {
  font-family: var(--titre); font-stretch: 115%; font-weight: 800;
  font-size: 11pt; text-transform: uppercase;
}
.talon .s { font-size: 8.2pt; color: var(--gris); margin-top: 1mm; line-height: 1.45; }
.talon .s b { color: var(--encre); font-weight: 700; }
</style></head><body>

<div class="drapeau"><i class="b"></i><i class="w"></i><i class="r"></i></div>

<div class="affiche">
  <img src="__AFFICHE__" alt="Un Seul Nom __VILLE__">
</div>

<div class="date">
  <div class="d">__DATE__</div>
  <div class="p">Une apr&egrave;s-midi ouverte &agrave; tous</div>
</div>

<div class="corps">
  <div class="rangee">
    <div class="case"><div class="k">Ouverture</div><div class="v">__OUVERTURE__</div></div>
    <div class="case"><div class="k">Conf&eacute;rence</div><div class="v">__CONFERENCE__</div></div>
    <div class="case"><div class="k">Entr&eacute;e</div><div class="v">Libre</div></div>
  </div>

  <div class="lieu">
    <div class="k">Lieu</div>
    <div class="v">__LIEU__</div>
    <div class="a">__ADRESSE__</div>
  </div>

  <div class="ligne"><div class="k">Pr&eacute;dication</div><div class="v">__PREDICATION__</div></div>
  <div class="ligne"><div class="k">Louange</div><div class="v">__LOUANGE__</div></div>

  <div class="libre"><span>Entr&eacute;e libre &middot; Invite autour de toi</span></div>

  <div class="phrase">
    <div class="q">Viens tel que tu es,<br>repars transform&eacute; par<br><b>un seul nom&nbsp;: J&eacute;sus-Christ.</b></div>
    <div class="n">Une apr&egrave;s-midi d'&eacute;vang&eacute;lisation et de gu&eacute;rison, ouverte &agrave; tous.</div>
  </div>
</div>

<div class="talon">
  <img src="data:image/png;base64,__QR__" alt="unseulnom.org">
  <div>
    <div class="t">Ton invitation</div>
    <div class="s">Pr&eacute;sente ce billet &agrave; l'entr&eacute;e, sur ton t&eacute;l&eacute;phone ou imprim&eacute;.<br>
      Scanne le code pour <b>r&eacute;server ta place</b> sur <b>unseulnom.org</b></div>
  </div>
</div>

<div class="drapeau"><i class="b"></i><i class="w"></i><i class="r"></i></div>
</body></html>"""


def main():
    html = HTML
    remplacements = {
        "__FONTS__":       (CHARTE / "polices.css").read_text(encoding="utf-8"),
        "__AFFICHE__":     image_uri(VILLE["affiche"]),
        "__QR__":          qr_base64(VILLE["lien_qr"]),
        "__VILLE__":       VILLE["nom"],
        "__DATE__":        VILLE["date"],
        "__OUVERTURE__":   VILLE["ouverture"],
        "__CONFERENCE__":  VILLE["conference"],
        "__LIEU__":        VILLE["lieu"],
        "__ADRESSE__":     VILLE["adresse"],
        "__PREDICATION__": VILLE["predication"],
        "__LOUANGE__":     VILLE["louange"],
    }
    for cle, valeur in remplacements.items():
        html = html.replace(cle, valeur)

    reste = [c for c in remplacements if c in html]
    if reste:
        raise SystemExit("Reperes non remplaces : %s" % ", ".join(reste))

    travail = pathlib.Path(tempfile.mkdtemp(prefix="usn-billet-"))
    source = travail / "billet.html"
    source.write_text(html, encoding="utf-8")

    pdf = RACINE / (VILLE["sortie"] + ".pdf")
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                    "--no-pdf-header-footer", "--print-to-pdf=%s" % pdf,
                    source.as_uri()], check=True, capture_output=True)

    # Un billet tient sur une page. S'il deborde, mieux vaut s'en
    # apercevoir ici que devant l'imprimante.
    info = subprocess.run(["pdfinfo", str(pdf)], check=True,
                          capture_output=True, text=True).stdout
    pages = int(next(l for l in info.splitlines()
                     if l.startswith("Pages:")).split()[1])
    if pages != 1:
        raise SystemExit("Le billet fait %d pages. Reduisez le contenu." % pages)

    # Les deux apercus sont tires du PDF lui-meme : ils montrent
    # exactement ce qui sortira de l'imprimante.
    sorties = []
    for suffixe, resolution in (("", 300), ("-web", 150)):
        png = RACINE / (VILLE["sortie"] + suffixe + ".png")
        subprocess.run(["pdftoppm", "-png", "-r", str(resolution), "-singlefile",
                        str(pdf), str(png.with_suffix(""))],
                       check=True, capture_output=True)
        sorties.append(png)

    for f in [pdf] + sorties:
        print("%8d octets  %s" % (f.stat().st_size, f.name))


if __name__ == "__main__":
    main()
