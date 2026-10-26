#!/usr/bin/env python3
"""Genere la banniere d'en-tete du courriel (2400 x 880).

    python3.13 generer-banniere.py

L'AFFICHE N'EST PAS RECADREE. Elle fait 1600 sur 900, la banniere 2400
sur 880 : un recadrage ne gardait que la moitie de sa hauteur, et il
coupait les tetes de ceux qui sont en haut. On ne coupe pas la tete des
intervenants pour faire tenir un format.

Elle est donc posee entiere, a droite, et le texte prend la place a
gauche. Rien n'est ecrit par-dessus : l'affiche dit deja le nom de la
ville, en plus beau. La banniere ajoute ce qu'elle ne met pas en avant
— QUAND et OU.

Le fichier sort a la taille demandee par Brevo pour un en-tete, et le
texte est rendu a 2400 pixels : il reste net sur un ecran a forte
densite, ou une image de 600 pixels de large bave.
"""

import base64
import io
import pathlib
import subprocess
import tempfile

from PIL import Image

RACINE = pathlib.Path(__file__).resolve().parent
CHARTE = RACINE.parent / "charte"
IMAGES = RACINE.parent / "images"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

LARGEUR = 2400
HAUTEUR = 880
MARGE   = 46           # l'air autour de l'affiche, a droite

VILLE = {
    "nom":     "Tarbes",
    "sortie":  "banniere-mail-tarbes",
    "affiche": "affichetarbeslarge.webp",
    "quand":   "Samedi 12 décembre 2026",
    "ou":      "Château d'Orleix &middot; 65800 Orleix",
    "heures":  "Portes 15h &middot; Conf&eacute;rence 16h",
    "cle":     "&Eacute;vang&eacute;lisation &amp; Gu&eacute;rison",
}


def affiche_uri(nom, hauteur):
    """L'affiche ENTIERE, mise a la hauteur voulue. Rien n'est coupe."""
    image = Image.open(IMAGES / nom).convert("RGB")
    largeur = round(image.width * hauteur / image.height)
    image = image.resize((largeur, hauteur), Image.LANCZOS)
    tampon = io.BytesIO()
    image.save(tampon, format="PNG")
    return "data:image/png;base64," + base64.b64encode(tampon.getvalue()).decode(), largeur


HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
__FONTS__
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:__L__px; height:__H__px; overflow:hidden; }
.cadre {
  position:relative; width:__L__px; height:__H__px; display:flex; flex-direction:column;
  /* Le fond reprend le degrade de l'affiche, en plus sombre : elle s'y
     pose sans decoupe visible. */
  background:
    radial-gradient(120% 140% at 82% 50%, #4a1038 0%, #1a0a1e 55%, #0C0B0A 100%);
}
.drapeau { display:flex; height:12px; flex:none; }
.drapeau i { flex:1; display:block; }
.drapeau .b { background:#1B2FC4; } .drapeau .w { background:#fff; } .drapeau .r { background:#E4262B; }

.corps { flex:1; display:flex; align-items:center; gap:__MARGE__px; padding:0 __MARGE__px 0 86px; }

.texte { flex:1; color:#fff; min-width:0; }
.cle {
  font-family:'Inter',sans-serif; font-size:25px; font-weight:700;
  letter-spacing:.3em; text-transform:uppercase; color:#FF6B6E;
}
.quand {
  margin-top:20px; font-family:'Archivo',sans-serif; font-stretch:125%; font-weight:900;
  font-size:86px; line-height:.96; text-transform:uppercase; letter-spacing:-.025em;
}
.ou { margin-top:26px; font-family:'Inter',sans-serif; font-size:31px; line-height:1.5; color:rgba(255,255,255,.76); }
.ou b { display:block; color:#fff; font-weight:700; font-size:34px; margin-bottom:4px; }

.affiche { flex:none; display:block; border-radius:10px; box-shadow:0 18px 50px rgba(0,0,0,.45); }
</style></head><body>
<div class="cadre">
  <div class="drapeau"><i class="b"></i><i class="w"></i><i class="r"></i></div>
  <div class="corps">
    <div class="texte">
      <div class="cle">__CLE__</div>
      <div class="quand">__QUAND__</div>
      <div class="ou"><b>__OU__</b>__HEURES__</div>
    </div>
    <img class="affiche" src="__AFFICHE__" width="__LA__" height="__HA__" alt="">
  </div>
  <div class="drapeau"><i class="b"></i><i class="w"></i><i class="r"></i></div>
</div>
</body></html>"""


def main():
    # L'affiche prend toute la hauteur disponible, moins l'air autour.
    haut_affiche = HAUTEUR - 24 - 2 * MARGE
    uri, large_affiche = affiche_uri(VILLE["affiche"], haut_affiche)

    html = HTML
    pieces = {
        "__FONTS__":   (CHARTE / "polices.css").read_text(encoding="utf-8"),
        "__AFFICHE__": uri,
        "__L__":       str(LARGEUR),
        "__H__":       str(HAUTEUR),
        "__LA__":      str(large_affiche),
        "__HA__":      str(haut_affiche),
        "__MARGE__":   str(MARGE),
        "__CLE__":     VILLE["cle"],
        "__QUAND__":   VILLE["quand"],
        "__OU__":      VILLE["ou"],
        "__HEURES__":  VILLE["heures"],
    }
    for cle, valeur in pieces.items():
        html = html.replace(cle, valeur)
    reste = [c for c in pieces if c in html]
    if reste:
        raise SystemExit("Reperes non remplaces : %s" % ", ".join(reste))

    travail = pathlib.Path(tempfile.mkdtemp(prefix="usn-banniere-"))
    source = travail / "b.html"
    source.write_text(html, encoding="utf-8")

    # Le rendu passe par Playwright plutot que par « --screenshot » de
    # Chromium : celui-ci echouait sans un mot, et une capture muette
    # est pire qu'une erreur.
    from playwright.sync_api import sync_playwright

    brut = travail / "brut.png"
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox", "--disable-gpu"])
        page = nav.new_page(viewport={"width": LARGEUR, "height": HAUTEUR}, device_scale_factor=1)
        page.goto(source.as_uri())
        page.wait_for_timeout(700)
        page.screenshot(path=str(brut))
        nav.close()

    image = Image.open(brut).convert("RGB")
    if image.size != (LARGEUR, HAUTEUR):
        raise SystemExit("Taille obtenue : %dx%d, attendue %dx%d" % (image.size + (LARGEUR, HAUTEUR)))

    png = RACINE / (VILLE["sortie"] + ".png")
    image.save(png, format="PNG", optimize=True)

    # Le JPEG pour le courriel : un en-tete ne doit pas peser.
    jpg = RACINE / (VILLE["sortie"] + ".jpg")
    image.save(jpg, format="JPEG", quality=88, optimize=True, progressive=True)

    for f in (png, jpg):
        im = Image.open(f)
        print("%8d octets  %-34s %dx%d" % (f.stat().st_size, f.name, im.size[0], im.size[1]))


if __name__ == "__main__":
    main()
