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

RACINE = pathlib.Path(__file__).resolve().parent
CHARTE = RACINE.parent / "charte"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

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
  --degrade: linear-gradient(100deg, var(--or) 0%, var(--rouge) 34%, var(--magenta) 62%, var(--violet) 84%, var(--bleu) 100%);
}
body { font-family: var(--texte); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 148mm; height: 210mm; overflow: hidden; page-break-after: always; }
.page:last-child { page-break-after: auto; }

/* ================= RECTO ================= */
.recto { background: var(--nuit); color: var(--creme); display: flex; flex-direction: column; }
/* La lumiere du fond : c'est le degrade de la marque, etale et flou.
   Il remplace l'image — rien a photographier, rien a recadrer. */
.lueur { position: absolute; inset: 0; pointer-events: none; }
.lueur i { position: absolute; display: block; border-radius: 50%; filter: blur(34mm); }
.l1 { width: 120mm; height: 120mm; left: -34mm; top: -28mm; background: rgba(247,148,29,.52); }
.l2 { width: 118mm; height: 118mm; right: -40mm; top: 18mm; background: rgba(201,38,143,.50); }
.l3 { width: 130mm; height: 130mm; left: -10mm; bottom: -56mm; background: rgba(27,47,196,.46); }
.grain {
  position: absolute; inset: 0; pointer-events: none; opacity: .16; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23b)'/%3E%3C/svg%3E");
  background-size: 50mm 50mm;
}
.recto .dedans { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; padding: 15mm 13mm 13mm; }

.marque { display: flex; align-items: center; gap: 4mm; }
.marque .rond { width: 13mm; height: 13mm; background: center/contain no-repeat url("__LOGO__"); flex: none; }
.marque .mot {
  font-family: var(--titre); font-weight: 800; font-size: 7.6pt;
  letter-spacing: .3em; text-transform: uppercase; color: rgba(240,238,231,.72);
}

.question {
  margin-top: auto;
  font-family: var(--titre); font-stretch: 125%; font-weight: 900;
  font-size: 47pt; line-height: .92; letter-spacing: -.03em; text-transform: uppercase;
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
.sous {
  margin-top: 7mm; font-size: 12.5pt; line-height: 1.5; color: rgba(240,238,231,.82);
  max-width: 92mm;
}

.quand { margin-top: 11mm; padding-top: 6mm; border-top: 1px solid rgba(240,238,231,.22); }
.quand .j {
  font-family: var(--titre); font-stretch: 118%; font-weight: 900;
  font-size: 19pt; text-transform: uppercase; letter-spacing: -.01em;
}
.quand .l { margin-top: 2mm; font-size: 11pt; color: rgba(240,238,231,.74); }
.libre {
  display: inline-block; margin-top: 7mm; padding: 2.6mm 6mm; border-radius: 99px;
  background: var(--degrade); color: #fff;
  font-weight: 800; font-size: 9pt; letter-spacing: .14em; text-transform: uppercase;
}

/* ================= VERSO ================= */
.verso { background: var(--creme); color: var(--encre); display: flex; flex-direction: column; padding: 14mm 13mm 12mm; }
.verso h2 {
  font-family: var(--titre); font-stretch: 118%; font-weight: 900;
  font-size: 23pt; line-height: 1.02; letter-spacing: -.02em; text-transform: uppercase;
  max-width: 108mm;
}
.verso .intro { margin-top: 5mm; font-size: 11pt; line-height: 1.6; color: var(--gris); max-width: 108mm; }

.promesses { margin-top: 8mm; }
.promesse { display: flex; gap: 4.5mm; padding: 4mm 0; border-top: 1px solid var(--trait); }
.promesse:last-child { border-bottom: 1px solid var(--trait); }
.promesse .pastille {
  flex: none; width: 7mm; height: 7mm; border-radius: 50%; margin-top: .6mm;
  background: var(--degrade);
}
.promesse b { display: block; font-family: var(--titre); font-weight: 800; font-size: 11.6pt; }
.promesse p { margin-top: 1.4mm; font-size: 10.2pt; line-height: 1.52; color: var(--gris); }

.pratique { margin-top: auto; padding-top: 7mm; display: flex; gap: 6mm; align-items: flex-end; }
.pratique .infos { flex: 1; }
.pratique .k {
  font-size: 7pt; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--gris);
}
.pratique .v { font-family: var(--titre); font-weight: 900; font-size: 15pt; line-height: 1.1; text-transform: uppercase; }
.pratique .a { margin-top: 1.6mm; font-size: 10pt; line-height: 1.45; color: var(--gris); }
.pratique .code { flex: none; text-align: center; }
.pratique .code img { width: 27mm; height: 27mm; display: block; }
.pratique .code span { display: block; margin-top: 2mm; font-size: 8pt; font-weight: 700; color: var(--gris); }

/* « flex: none » n'est pas decoratif : le verso est une colonne
   flexible, et un bloc vide de 2,4 mm s'y fait ecraser a zero. Le
   ruban etait bien la, haut de rien du tout. */
.ruban { flex: none; margin-top: 7mm; height: 2.4mm; border-radius: 99px; background: var(--degrade); }
.site { flex: none; margin-top: 4mm; text-align: center; font-family: var(--titre); font-weight: 800; font-size: 11pt; letter-spacing: .04em; }
</style></head><body>

<!-- ======================= RECTO ======================= -->
<div class="page recto">
  <div class="lueur"><i class="l1"></i><i class="l2"></i><i class="l3"></i></div>
  <div class="grain"></div>
  <div class="dedans">

    <div class="marque">
      <div class="rond"></div>
      <div class="mot">Un Seul Nom</div>
    </div>

    <div class="question">Et si<br>c'&eacute;tait <b>vrai</b>&nbsp;?</div>

    <p class="sous">
      Une soir&eacute;e pour venir voir par soi-m&ecirc;me. Sans rien conna&icirc;tre,
      sans rien devoir, sans rien promettre.
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

  <h2>Tu n'es jamais entr&eacute; dans une &eacute;glise&nbsp;?</h2>
  <p class="intro">
    Alors c'est exactement pour toi. Cette soir&eacute;e n'est pas faite pour
    ceux qui savent d&eacute;j&agrave;. Elle est faite pour ceux qui se posent des
    questions et qui n'ont personne &agrave; qui les poser.
  </p>

  <div class="promesses">
    <div class="promesse">
      <div class="pastille"></div>
      <div>
        <b>On ne te demandera rien</b>
        <p>Ni argent, ni engagement, ni de te lever, ni de parler. Tu peux rester
        assis et &eacute;couter, c'est tout.</p>
      </div>
    </div>
    <div class="promesse">
      <div class="pastille"></div>
      <div>
        <b>Tu pars quand tu veux</b>
        <p>Personne ne te retiendra, personne ne te courra apr&egrave;s. Viens accompagn&eacute;
        si tu pr&eacute;f&egrave;res.</p>
      </div>
    </div>
    <div class="promesse">
      <div class="pastille"></div>
      <div>
        <b>Tu repars avec tes questions</b>
        <p>Il y aura de la musique, des histoires vraies, et du temps pour parler
        &agrave; quelqu'un si tu en as envie. Ou pas.</p>
      </div>
    </div>
  </div>

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
  <div class="site">unseulnom.org</div>
</div>

</body></html>"""


def main():
    html = HTML
    pieces = {
        "__FONTS__":    (CHARTE / "polices.css").read_text(encoding="utf-8"),
        "__LOGO__":     (CHARTE / "logo-blanc.txt").read_text(encoding="utf-8").strip(),
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

    pdf = RACINE / (VILLE["sortie"] + ".pdf")
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                    "--no-pdf-header-footer", "--print-to-pdf=%s" % pdf,
                    source.as_uri()], check=True, capture_output=True)

    info = subprocess.run(["pdfinfo", str(pdf)], check=True, capture_output=True, text=True).stdout
    pages = int(next(l for l in info.splitlines() if l.startswith("Pages:")).split()[1])
    if pages != 2:
        raise SystemExit("Le flyer fait %d page(s), il en faut 2 (recto et verso)." % pages)

    sorties = [pdf]
    for numero, nom in ((1, "-recto"), (2, "-verso")):
        png = RACINE / (VILLE["sortie"] + nom + ".png")
        subprocess.run(["pdftoppm", "-png", "-r", "150", "-f", str(numero), "-l", str(numero),
                        "-singlefile", str(pdf), str(png.with_suffix(""))],
                       check=True, capture_output=True)
        sorties.append(png)

    for f in sorties:
        print("%8d octets  %s" % (f.stat().st_size, f.name))


if __name__ == "__main__":
    main()
