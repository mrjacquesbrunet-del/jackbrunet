"""Étape 4 : fichiers du dépôt.
  content/lexique/source/<tranche>.json : entrées à traduire (anglais nettoyé,
      références en français, traductions de la Segond) — tranche = G00…G56, H00…H87
  public/lexique/conc/<tranche>.json    : concordance { code: [[b,c,v,s1,e1,s2,e2…], …] }
"""
import json, os, re, html
from collections import defaultdict

ICI = os.path.dirname(os.path.abspath(__file__))
ROOT = "/home/user/jackbrunet"
E = json.load(open(f"{ICI}/entrees.json"))
C = json.load(open(f"{ICI}/conc.json"))

STEP = "Gen Exo Lev Num Deu Jos Jdg Rut 1Sa 2Sa 1Ki 2Ki 1Ch 2Ch Ezr Neh Est Job Psa Pro Ecc Sng Isa Jer Lam Ezk Dan Hos Jol Amo Oba Jon Mic Nam Hab Zep Hag Zec Mal Mat Mrk Luk Jhn Act Rom 1Co 2Co Gal Eph Php Col 1Th 2Th 1Ti 2Ti Tit Phm Heb Jas 1Pe 2Pe 1Jn 2Jn 3Jn Jud Rev".split()
NOM = {b["id"]: b["name"] for b in json.load(open(f"{ROOT}/public/bible/index.json"))}
FR = {a: NOM[i] for i, a in enumerate(STEP, 1)}


def refs_fr(t):
    t = re.sub(r"\b([1-3]?[A-Z][a-z]{1,2})\.(\d+)[.:](\d+)", lambda m: f"{FR.get(m.group(1), m.group(1))} {m.group(2)}:{m.group(3)}" if m.group(1) in FR else m.group(0), t)
    return t


def propre(d):
    d = re.sub(r"<ref='[^']*'>([^<]*)</ref>", r"\1", d)
    d = re.sub(r"<BR\s*/?>|<br\s*/?>", "\n", d, flags=re.I)
    d = re.sub(r"<[^>]+>", "", d)
    d = html.unescape(d)
    d = re.sub(r"\(AS\)\s*$", "", d.strip())
    d = re.sub(r"[ \t]+", " ", d)
    d = re.sub(r"\n\s*", "\n", d).strip()
    return refs_fr(d)


def tranche(code):
    m = re.match(r"([GH])(\d{2})", code)
    return m.group(1) + m.group(2)


src = defaultdict(dict)
for code, e in E.items():
    src[tranche(code)][code] = {
        "lemme": e["lemme"], "translit": e["translit"], "morph": e["morph"],
        "nom": e["morph"].startswith("N:"), "gloss": e["gloss_en"], "def": propre(e["def_en"]),
        "trad": [t for t in e["trad"] if t[1] >= 1][:6],
        "pron": e["pron"], "de": e["derive_de"], "derives": e["derives"][:24], "nb": e["nb"],
    }
os.makedirs(f"{ROOT}/content/lexique/source", exist_ok=True)
for t, d in src.items():
    json.dump(d, open(f"{ROOT}/content/lexique/source/{t}.json", "w"), ensure_ascii=False, separators=(",", ":"))

conc = defaultdict(dict)
for code, lst in C.items():
    # [livre, chapitre, verset, n° de la traduction (dans « trad », -1 sinon), début, fin, …]
    tops = [t[0] for t in E[code]["trad"][:6]]
    conc[tranche(code)][code] = [[b, c, v, tops.index(lem) if lem in tops else -1] + [n for sp in spans for n in sp]
                                 for b, c, v, spans, lem in lst]
os.makedirs(f"{ROOT}/public/lexique/conc", exist_ok=True)
for t, d in conc.items():
    json.dump(d, open(f"{ROOT}/public/lexique/conc/{t}.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("tranches:", len(src), "conc:", len(conc))
