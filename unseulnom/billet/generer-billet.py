#!/usr/bin/env python3
"""Génère le billet PDF de l'événement Un Seul Nom (A5 portrait)."""
import base64, pathlib

SCRATCH = pathlib.Path("/tmp/claude-0/-home-user-jackbrunet/3053e314-abed-5e5c-8c07-dd7522061207/scratchpad")
fonts = (SCRATCH / "fonts-inline.css").read_text(encoding="utf-8")
qr = (SCRATCH / "qr.b64").read_text().strip()

HTML = """<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><style>
__FONTS__
@page { size: A5 portrait; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --blue: #1B2FC4; --red: #E4262B; --ink: #0C0B0A; --paper: #F4F5F9;
  --disp: 'Archivo', sans-serif; --sub: 'Inter', sans-serif;
}
body {
  width: 148mm; height: 210mm; font-family: var(--sub); color: var(--ink);
  background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  display: flex; flex-direction: column;
}
.flag { display: flex; height: 5mm; }
.flag i { flex: 1; }
.flag .b { background: var(--blue); } .flag .w { background: #fff; } .flag .r { background: var(--red); }

.head {
  background: var(--ink); color: #fff; padding: 9mm 10mm 8mm; text-align: center;
}
.brand { font-family: var(--disp); font-stretch: 125%; font-weight: 800;
  font-size: 10pt; letter-spacing: .34em; text-transform: uppercase; }
.city { font-family: var(--disp); font-stretch: 125%; font-weight: 900;
  font-size: 44pt; line-height: .95; text-transform: uppercase; margin-top: 3mm; }
.tag { color: #FF6B6E; font-weight: 700; font-size: 11pt; letter-spacing: .04em;
  text-transform: uppercase; margin-top: 2mm; }

.date {
  background: var(--paper); border-bottom: 1px solid #E2E4EE;
  padding: 6mm 10mm; text-align: center;
}
.date .d { font-family: var(--disp); font-stretch: 125%; font-weight: 800;
  font-size: 17pt; text-transform: uppercase; }
.date .p { font-size: 9.5pt; color: #555; margin-top: 1mm; }

.body { flex: 1; padding: 7mm 10mm 0; }
.row { display: flex; gap: 4mm; }
.box { flex: 1; border: 1px solid #E2E4EE; border-radius: 3mm; padding: 4mm; text-align: center; }
.box .k { font-size: 6.6pt; letter-spacing: .18em; text-transform: uppercase; color: var(--blue); font-weight: 800; }
.box .v { font-family: var(--disp); font-stretch: 110%; font-weight: 800; font-size: 13pt; margin-top: 1.5mm; }

.place { margin-top: 5mm; border-left: 3px solid var(--red); padding-left: 4mm; }
.place .k { font-size: 6.6pt; letter-spacing: .18em; text-transform: uppercase; color: var(--blue); font-weight: 800; }
.place .v { font-weight: 700; font-size: 11.5pt; margin-top: 1mm; }
.place .a { font-size: 9.5pt; color: #555; }

.line { display: flex; align-items: baseline; gap: 3mm; margin-top: 3.5mm; }
.line .k { font-size: 6.6pt; letter-spacing: .16em; text-transform: uppercase;
  color: var(--blue); font-weight: 800; width: 24mm; flex: none; }
.line .v { font-size: 10pt; }

.quote { margin-top: 7mm; text-align: center; padding: 0 4mm; }
.quote .q { font-family: var(--disp); font-stretch: 115%; font-weight: 800;
  font-size: 13pt; line-height: 1.15; text-transform: uppercase; }
.quote .q b { color: var(--blue); font-weight: 800; }
.quote .n { font-size: 8.6pt; color: #555; margin-top: 2.5mm; }

.stub {
  border-top: 1.2px dashed #B9BDCE; margin-top: 6mm;
  padding: 5mm 10mm 6mm; display: flex; align-items: center; gap: 5mm;
}
.stub img { width: 22mm; height: 22mm; }
.stub .t { font-family: var(--disp); font-stretch: 115%; font-weight: 800;
  font-size: 12pt; text-transform: uppercase; }
.stub .s { font-size: 8.6pt; color: #555; margin-top: 1mm; line-height: 1.45; }
.free { display: inline-block; background: var(--red); color: #fff; font-weight: 800;
  font-size: 8pt; letter-spacing: .14em; text-transform: uppercase;
  padding: 1.4mm 3mm; border-radius: 99px; }
</style></head><body>

<div class="flag"><i class="b"></i><i class="w"></i><i class="r"></i></div>

<div class="head">
  <div class="brand">Un Seul Nom</div>
  <div class="city">Avignon</div>
  <div class="tag">Évangélisation &amp; Guérison</div>
</div>

<div class="date">
  <div class="d">Samedi 17 octobre 2026</div>
  <div class="p">Une après-midi ouverte à tous</div>
</div>

<div class="body">
  <div class="row">
    <div class="box"><div class="k">Ouverture</div><div class="v">15h00</div></div>
    <div class="box"><div class="k">Conférence</div><div class="v">16h00</div></div>
    <div class="box"><div class="k">Entrée</div><div class="v">Libre</div></div>
  </div>

  <div class="place">
    <div class="k">Lieu</div>
    <div class="v">Parc des expositions d'Avignon</div>
    <div class="a">800 chemin des Félons, 84140 Montfavet</div>
  </div>

  <div class="line"><div class="k">Prédication</div><div class="v">Yannis Gautier &middot; Chriss Campion</div></div>
  <div class="line"><div class="k">Louange</div><div class="v">Patchaï Reyes &middot; Nikita Heugebaert &middot; Ruben Debard</div></div>

  <div style="margin-top:5mm"><span class="free">Entrée libre &middot; Invite autour de toi</span></div>

  <div class="quote">
    <div class="q">Viens tel que tu es,<br>repars transformé par<br><b>un seul nom : Jésus-Christ.</b></div>
    <div class="n">Une après-midi d'évangélisation et de guérison, ouverte à tous.</div>
  </div>
</div>

<div class="stub">
  <img src="data:image/png;base64,__QR__" alt="unseulnom.org">
  <div>
    <div class="t">Ton invitation</div>
    <div class="s">Présente ce billet à l'entrée, sur ton téléphone ou imprimé.<br>
      Toutes les infos sur <strong>unseulnom.org</strong></div>
  </div>
</div>

<div class="flag"><i class="b"></i><i class="w"></i><i class="r"></i></div>
</body></html>"""

html = HTML.replace("__FONTS__", fonts).replace("__QR__", qr)
(SCRATCH / "billet.html").write_text(html, encoding="utf-8")
print("HTML du billet écrit")
