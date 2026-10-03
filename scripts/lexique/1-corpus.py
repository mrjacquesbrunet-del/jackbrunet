"""Étape 1 : lit TAGNT / TAHOT (STEPBible, CC BY) et la Segond de l'app,
ramène tout dans la numérotation LSG et écrit corpus.json :
  versets: [{b,c,v, src:[{code, mot, translit, gloss}], fr:[{t, l, s, e}]}]
"""
import json, os, re, glob, importlib.util, unicodedata
import simplemma

ICI = os.path.dirname(os.path.abspath(__file__))
ROOT = "/home/user/jackbrunet"
STEP = f"{ICI}/step/Translators Amalgamated OT+NT"

spec = importlib.util.spec_from_file_location("liens", f"{ROOT}/scripts/build-liens.py")
liens = importlib.util.module_from_spec(spec)
spec.loader.exec_module(liens)
TXT, NV = liens.TXT, liens.NV

STEP_LIVRES = "Gen Exo Lev Num Deu Jos Jdg Rut 1Sa 2Sa 1Ki 2Ki 1Ch 2Ch Ezr Neh Est Job Psa Pro Ecc Sng Isa Jer Lam Ezk Dan Hos Jol Amo Oba Jon Mic Nam Hab Zep Hag Zec Mal Mat Mrk Luk Jhn Act Rom 1Co 2Co Gal Eph Php Col 1Th 2Th 1Ti 2Ti Tit Phm Heb Jas 1Pe 2Pe 1Jn 2Jn 3Jn Jud Rev".split()
LIVRE = {a: i for i, a in enumerate(STEP_LIVRES, 1)}

REF = re.compile(r"^([1-3]?[A-Z][a-z]{1,2})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=(\S*)")


def vers_lsg(b, c, v, hc, hv):
    if b == 19:  # Psaumes : la Segond suit la numérotation hébraïque (titres numérotés)
        c, v = (hc, hv) if hc else (c, max(v, 1))
        if c <= len(NV[b]) and 1 <= v <= NV[b][c - 1]:
            return (b, c, v)
        return None
    if v == 0:
        v = 1
    return liens.vers_lsg(b, c, v)


def lire_step():
    par_verset = {}
    inconnus = set()
    for f in sorted(glob.glob(f"{STEP}/TAGNT*.txt")) + sorted(glob.glob(f"{STEP}/TAHOT*.txt")):
        grec = "TAGNT" in f
        for ln in open(f, encoding="utf-8"):
            m = REF.match(ln)
            if not m:
                continue
            livre, c, v, hc, hv, n, typ = m.groups()
            if livre not in LIVRE:
                inconnus.add(livre)
                continue
            b = LIVRE[livre]
            col = ln.rstrip("\n").split("\t")
            cible = vers_lsg(b, int(c), int(v), int(hc) if hc else None, int(hv) if hv else None)
            if not cible:
                continue
            mots = par_verset.setdefault(cible, [])
            if grec:
                # Mot absent du texte reçu ET du texte critique : on l'ignore.
                if not re.search(r"[NK]", typ, re.I):
                    continue
                gm = re.match(r"(\S+) \((.*)\)", col[1])
                code = col[3].split("=")[0]
                lemme = col[4].split("=")[0] if len(col) > 4 else ""
                mots.append({"code": code, "mot": gm.group(1) if gm else col[1], "lemme": lemme,
                             "translit": gm.group(2) if gm else "", "gloss": col[2]})
            else:
                codes = re.split(r"[/\\]", col[4])
                glosses = col[3].split("/")
                translit = col[2].split("/")
                hebr = re.split(r"[/\\]", col[1])
                for i, cd in enumerate(codes):
                    cd = cd.strip("{} ")
                    if not cd.startswith("H"):
                        continue
                    mots.append({"code": cd, "mot": hebr[i] if i < len(hebr) else "",
                                 "translit": translit[i] if i < len(translit) else "",
                                 "gloss": glosses[i].strip() if i < len(glosses) else ""})
    return par_verset, inconnus


LETTRE = "A-Za-zÀ-ÖØ-öø-ÿŒœÆæ"
TOK = re.compile(rf"aujourd’hui|[{LETTRE}]+(?:-[{LETTRE}]+)*’?|\d+", re.I)


MINUSCULES = set()


def tokens_fr(texte):
    out = []
    for m in TOK.finditer(texte):
        t = m.group(0)
        s = m.start()
        # Traits d'union : on garde les noms propres (Bath-Schéba), on coupe le reste (dit-il).
        parts = [(t, s)]
        if "-" in t and not t[0].isupper():
            parts, pos = [], s
            for p in t.split("-"):
                parts.append((p, pos))
                pos += len(p) + 1
        for p, ps in parts:
            if not p:
                continue
            low = p.lower()
            if low.endswith("’"):
                lem = low
            elif p[0].isupper() and low not in MINUSCULES:
                lem = simplemma.lemmatize(low, lang="fr")
                if lem == low:
                    lem = p  # nom propre
            else:
                lem = simplemma.lemmatize(low, lang="fr")
            out.append({"t": p, "l": lem, "s": ps, "e": ps + len(p)})
    return out


def main():
    par_verset, inconnus = lire_step()
    print("livres inconnus:", inconnus)
    # Un mot qu'on trouve aussi en minuscules n'est pas un nom propre
    # (majuscules de début de vers dans la poésie : « Selon », « Car »…).
    for b in range(1, 67):
        for vs in TXT[b]:
            for texte in vs:
                for m in TOK.finditer(texte):
                    if m.group(0)[0].islower():
                        MINUSCULES.add(m.group(0).lower())
    versets, manquants = [], 0
    for b in range(1, 67):
        for c, vs in enumerate(TXT[b], 1):
            for v, texte in enumerate(vs, 1):
                src = par_verset.get((b, c, v), [])
                if not src:
                    manquants += 1
                versets.append({"b": b, "c": c, "v": v, "src": src, "fr": tokens_fr(texte)})
    total = len(versets)
    print(f"versets LSG: {total}, sans texte source: {manquants}")
    json.dump(versets, open(f"{ICI}/corpus.json", "w"), ensure_ascii=False)


if __name__ == "__main__":
    main()
