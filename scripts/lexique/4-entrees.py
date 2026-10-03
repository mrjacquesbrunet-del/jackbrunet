"""Étape 3 : assemble les entrées du lexique (sans les définitions françaises).

Entrées : mots du NT grec (TBESG) et de l'AT hébreu/araméen (TBESH) réellement
employés, avec :
  - lemme, translittération, prononciation (Strong 1890), morphologie ;
  - traductions dans la Segond (lemmes français + nombre) ;
  - parentés (dérivé de / mots dérivés) ;
  - concordance : [livre, chapitre, verset, [[début, fin], …]] dans le texte LSG.
Écrit : entrees.json (pour la traduction) et conc.json.
"""
import json, os, re, html
from collections import Counter, defaultdict

ICI = os.path.dirname(os.path.abspath(__file__))
V = json.load(open(f"{ICI}/corpus.json"))
L = json.load(open(f"{ICI}/liens.json"))

def lexique(f, prefixe):
    out = {}
    for ln in open(f, encoding="utf-8"):
        col = ln.rstrip("\n").split("\t")
        if len(col) < 8 or not re.match(rf"^{prefixe}\d", col[0]):
            continue
        # dStrong (« H0430G = a Name of ») : le code employé dans les textes balisés.
        uid = col[1].split("=")[0].strip()
        if not re.match(rf"^{prefixe}\d{{4}}[A-Za-z]?$", uid):
            continue
        out.setdefault(uid, {"lemme": col[3].strip(), "translit": col[4].strip(), "morph": col[5].strip(),
                             "gloss": col[6].strip(), "def": col[7].strip(), "uni": col[2].strip(),
                             "rel": col[1].split("=", 1)[1].strip() if "=" in col[1] else ""})
    return out

LEX = {}
LEX.update(lexique(f"{ICI}/step/Lexicons/TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt", "G"))
LEX.update(lexique(f"{ICI}/step/Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt", "H"))

def charger_os(f):
    s = open(f).read()
    return json.loads(s[s.index("{"):s.rindex("}") + 1])
OS = {}
OS.update(charger_os(f"{ICI}/os-strongs-greek-dictionary.js"))
OS.update(charger_os(f"{ICI}/os-strongs-hebrew-dictionary.js"))

def base(code):
    """G0026 / H7462B → G26 / H7462 (clé Open Scriptures)."""
    m = re.match(r"([GH])0*(\d+)", code)
    return f"{m.group(1)}{m.group(2)}" if m else code

# Mots outils de STEP (préfixes/suffixes hébreux H9xxx) : pas d'entrée de lexique.
def est_entree(code):
    return code in LEX and not re.match(r"H9\d{3}", code)

OUTILS = set("""le la les l’ un une des du de d’ à au aux et ou ni mais car donc or ce cet cette ces c’ ça cela ceci il ils elle elles lui leur leurs
eux se s’ en y ne n’ pas point que qu’ qui quoi dont où son sa ses mon ma mes ton ta tes notre nos votre vos je j’ me m’ moi te t’ toi nous vous
on dans par pour sur sous avec sans vers chez être avoir""".split())

import simplemma
PRONOMS = re.compile(r"-(vous|nous|moi|toi|le|la|les|lui|leur|en|y|je|tu|il|elle|ils|elles|on|t-il|t-elle|ce)$")
def canon(lem):
    """« aimez-vous » → « aimer » ; « dit-il » → « dire »."""
    if PRONOMS.search(lem):
        return simplemma.lemmatize(PRONOMS.sub("", lem), lang="fr")
    return lem

occ = defaultdict(list)          # code → [(b,c,v,[[s,e]…])]
trad = defaultdict(Counter)      # code → lemmes français
formes = defaultdict(lambda: defaultdict(Counter))  # code → lemme → formes
for x, links in zip(V, L):
    par_src = defaultdict(list)
    for i, j in links:
        par_src[i].append(j)
    vus = {}
    for i, s in enumerate(x["src"]):
        code = s["code"]
        if not est_entree(code):
            continue
        js = sorted(set(par_src.get(i, [])))
        plein = re.search(r":(N|V|A|Adv)", LEX[code]["morph"]) and not LEX[code]["morph"].startswith("N:")
        if plein:
            # Garde-fous : un mot ordinaire n'est ni un nom propre français ni un mot outil.
            js = [j for j in js if not x["fr"][j]["l"][:1].isupper() and x["fr"][j]["l"].lower() not in OUTILS]
        elif LEX[code]["morph"].startswith("N:"):
            # Un nom propre se traduit par un nom propre (« Syrte », pas « abaissa »).
            js = [j for j in js if x["fr"][j]["t"][:1].isupper()]
        spans = [[x["fr"][j]["s"], x["fr"][j]["e"]] for j in js]
        cle = (x["b"], x["c"], x["v"])
        lem = " ".join(canon(x["fr"][j]["l"]) for j in js)
        if code in vus:
            vus[code][3].extend(spans)
        else:
            vus[code] = [x["b"], x["c"], x["v"], spans, lem]
            occ[code].append(vus[code])
        if js:
            trad[code][lem] += 1
            formes[code][lem][" ".join(x["fr"][j]["t"].lower() for j in js)] += 1

# Participes rangés avec leur verbe (« aimé » → « aimer ») quand le verbe
# figure aussi parmi les traductions de ce mot.
PART = re.compile(r"^(.+?)(é|ée|és|ées|i|ie|is|ies|u|ue|us|ues)$")
for code, cpt in trad.items():
    fusion = {}
    for lem in list(cpt):
        m = PART.match(lem)
        if not m or " " in lem:
            continue
        for fin in ("er", "ir", "re", "oir"):
            v = m.group(1) + fin
            if v != lem and v in cpt:
                fusion[lem] = v
                break
    for a, b in fusion.items():
        cpt[b] += cpt.pop(a)
    for o in occ[code]:
        if o[4] in fusion:
            o[4] = fusion[o[4]]

for code, lst in occ.items():
    for o in lst:
        o[3] = sorted({tuple(sp) for sp in o[3]})
        o[3] = [list(sp) for sp in o[3]]

def libelle_lemme(code, lem):
    """Lemme affiché : le lemme français, sauf noms propres (forme du texte)."""
    return lem

entrees = {}
for code in sorted(occ):
    lx = LEX[code]
    o = OS.get(base(code), {})
    deriv = re.findall(r"[GH]\d+", o.get("derivation", ""))
    t = [[lem, n] for lem, n in trad[code].most_common(12) if n >= 1]
    entrees[code] = {
        "lemme": lx["lemme"], "translit": lx["translit"],
        "pron": o.get("pron", ""), "morph": lx["morph"], "gloss_en": lx["gloss"],
        "def_en": lx["def"], "strong_def": (o.get("strongs_def") or "").strip(),
        "kjv": (o.get("kjv_def") or "").strip(), "deriv_os": deriv,
        "nb": len(occ[code]), "trad": t,
    }

# Parentés : « dérivé de » (Open Scriptures) ramené aux codes étendus employés.
par_base = defaultdict(list)
for code in entrees:
    par_base[base(code)].append(code)
for code, e in entrees.items():
    e["derive_de"] = [c for b in e.pop("deriv_os") for c in par_base.get(b, []) if c != code][:6]
for code, e in entrees.items():
    e.setdefault("derives", [])
for code, e in entrees.items():
    for p in e["derive_de"]:
        if code not in entrees[p]["derives"]:
            entrees[p]["derives"].append(code)

json.dump(entrees, open(f"{ICI}/entrees.json", "w"), ensure_ascii=False)
json.dump(occ, open(f"{ICI}/conc.json", "w"), ensure_ascii=False, separators=(",", ":"))
noms = sum(1 for e in entrees.values() if e["morph"].startswith("N:"))
print(f"entrées: {len(entrees)} (grec {sum(c[0]=='G' for c in entrees)}, hébreu/araméen {sum(c[0]=='H' for c in entrees)}), dont noms propres {noms}")
print("occurrences:", sum(len(v) for v in occ.values()))
