"""Construit les « versets liés » du lecteur Bible.

1. Références croisées : base OpenBible.info (licence CC BY), recalée sur la
   numérotation de la Segond de l'app (Psaumes avec titres numérotés, Job 38-41,
   Ecclésiaste, Osée, Jonas, Michée, Nahum…). On garde, par verset, les
   références les mieux notées (votes >= MIN_VOTES, au plus MAX_PAR_VERSET).
   Source : https://a.openbible.info/data/cross-references.zip
   (copie : https://raw.githubusercontent.com/scrollmapper/bible_databases/master/sources/extras/cross_references.txt)
2. Récits parallèles : content/paralleles.json (rédigé à la main), contrôlé :
   bornes de chaque passage et présence du mot-clé dans chaque passage.

Produit :
  public/bible/liens/<livre>.json : { "c:v": [[livre, c, v] ou [livre, c, v, vFin], …] }
  public/bible/paralleles.json    : { groupes: [{ titre, p: [[livre, c1, v1, c2, v2], …] }] }

Usage : python3 scripts/build-liens.py chemin/vers/cross_references.txt
"""
import json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN_VOTES = 3
MAX_PAR_VERSET = 8

INDEX = json.load(open(f"{ROOT}/public/bible/index.json"))
NOM = {b["id"]: b["name"] for b in INDEX}
ID_PAR_NOM = {b["name"]: b["id"] for b in INDEX}
TXT = {b: json.load(open(f"{ROOT}/public/bible/{b}.json"))["chapters"] for b in range(1, 67)}
NV = {b: [len(c) for c in TXT[b]] for b in TXT}

OSIS = "Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev".split()
LIVRE = {a: i for i, a in enumerate(OSIS, 1)}

# Psaumes : nombre de versets de titre que la Segond numérote en plus.
PS_DECALAGE = {3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 12: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 30: 1, 31: 1, 34: 1, 36: 1, 38: 1, 39: 1, 40: 1, 41: 1, 42: 1, 44: 1, 45: 1, 46: 1, 47: 1, 48: 1, 49: 1, 51: 2, 52: 2, 53: 1, 54: 2, 55: 1, 56: 1, 57: 1, 58: 1, 59: 1, 60: 2, 61: 1, 62: 1, 63: 1, 64: 1, 65: 1, 67: 1, 68: 1, 69: 1, 70: 1, 75: 1, 76: 1, 77: 1, 80: 1, 81: 1, 83: 1, 84: 1, 85: 1, 88: 1, 89: 1, 92: 1, 102: 1, 108: 1, 140: 1, 142: 1}


def vers_lsg(b, c, v):
    """Référence en numérotation anglaise → numérotation de la Segond de l'app."""
    if b == 19: v += PS_DECALAGE.get(c, 0)
    elif b == 2 and c == 8: c, v = (7, 25 + v) if v <= 4 else (8, v - 4)
    elif b == 3 and c == 6: c, v = (5, 19 + v) if v <= 7 else (6, v - 7)
    elif b == 4 and c == 29 and v == 40: c, v = 30, 1
    elif b == 4 and c == 30: v += 1
    elif b == 9 and c == 23 and v == 29: c, v = 24, 1
    elif b == 9 and c == 24: v += 1
    elif b == 11 and c == 22 and v >= 44: v += 1
    elif b == 14 and c == 14: c, v = (13, 23) if v == 1 else (14, v - 1)
    elif b == 18 and c == 38 and v >= 39: c, v = 39, v - 38
    elif b == 18 and c == 39: v += 3
    elif b == 18 and c == 40: c, v = (39, 33 + v) if v <= 5 else (40, v - 5)
    elif b == 18 and c == 41: c, v = (40, 19 + v) if v <= 9 else (41, v - 9)
    elif b == 21 and c == 5: c, v = (4, 17) if v == 1 else (5, v - 1)
    elif b == 21 and c == 11 and v >= 9: c, v = 12, v - 8
    elif b == 21 and c == 12: v += 2
    elif b == 22 and c == 6 and v == 13: c, v = 7, 1
    elif b == 22 and c == 7: v += 1
    elif b == 23 and c == 9: c, v = (8, 23) if v == 1 else (9, v - 1)
    elif b == 23 and c == 64: c, v = (63, 19) if v == 1 else (64, v - 1)
    elif b == 26 and c == 20 and v >= 45: c, v = 21, v - 44
    elif b == 26 and c == 21: v += 5
    elif b == 28 and c == 1 and v >= 10: c, v = 2, v - 9
    elif b == 28 and c == 2: v += 2
    elif b == 28 and c == 11 and v == 12: c, v = 12, 1
    elif b == 28 and c == 12: v += 1
    elif b == 32 and c == 1 and v == 17: c, v = 2, 1
    elif b == 32 and c == 2: v += 1
    elif b == 33 and c == 5: c, v = (4, 14) if v == 1 else (5, v - 1)
    elif b == 34 and c == 1 and v == 15: c, v = 2, 1
    elif b == 34 and c == 2: v += 1
    elif b == 44 and c == 19 and v == 41: v = 40
    elif b == 47 and c == 13 and v >= 13: v -= 1
    if c < 1 or c > len(NV[b]) or v < 1 or v > NV[b][c - 1]: return None
    return (b, c, v)


def osis(r):
    livre, c, v = r.split(".")
    return vers_lsg(LIVRE[livre], int(c), int(v))


def croisees(chemin):
    par_verset = {}
    for ln in open(chemin, encoding="utf8").read().splitlines()[1:]:
        de, vers, votes = ln.split("\t")
        votes = int(votes)
        if votes < MIN_VOTES: continue
        a = osis(de)
        debut, _, fin = vers.partition("-")
        b = osis(debut)
        if not a or not b or a == b: continue
        cible = list(b)
        if fin:
            f = osis(fin)
            if f and f[0] == b[0] and f[1] == b[1] and f[2] > b[2]: cible.append(f[2])
        par_verset.setdefault(a, []).append((votes, cible))
    sortie = {b: {} for b in range(1, 67)}
    total = 0
    for (b, c, v), refs in par_verset.items():
        refs.sort(key=lambda x: -x[0])
        vus, garde = set(), []
        for _, cible in refs:
            k = tuple(cible[:3])
            if k in vus: continue
            vus.add(k); garde.append(cible)
            if len(garde) == MAX_PAR_VERSET: break
        sortie[b][f"{c}:{v}"] = garde
        total += len(garde)
    os.makedirs(f"{ROOT}/public/bible/liens", exist_ok=True)
    for b, d in sortie.items():
        json.dump(d, open(f"{ROOT}/public/bible/liens/{b}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"références croisées : {total} liens sur {len(par_verset)} versets")


def norm(s):
    s = s.replace("’", "'")
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()


def paralleles():
    src = json.load(open(f"{ROOT}/content/paralleles.json"))
    rx = re.compile(r"^((?:[1-3] )?[^\d]+?) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$")
    erreurs, groupes = [], []
    for g in src["groupes"]:
        ps = []
        for p in g["passages"]:
            m = rx.match(p)
            b = m and ID_PAR_NOM.get(m.group(1))
            if not b:
                erreurs.append(f"{g['titre']} : référence illisible « {p} »"); continue
            c1, v1 = int(m.group(2)), int(m.group(3))
            c2 = int(m.group(4)) if m.group(4) else c1
            v2 = int(m.group(5)) if m.group(5) else v1
            ok = 1 <= c1 <= c2 <= len(NV[b]) and 1 <= v1 <= NV[b][c1 - 1] and 1 <= v2 <= NV[b][c2 - 1] and (c1, v1) <= (c2, v2)
            if not ok:
                erreurs.append(f"{g['titre']} : hors limites « {p} »"); continue
            texte = " ".join(
                " ".join(TXT[b][c - 1][(v1 - 1 if c == c1 else 0):(v2 if c == c2 else None)]) for c in range(c1, c2 + 1))
            if not any(norm(k) in norm(texte) for k in g["cle"].split("|")):
                erreurs.append(f"{g['titre']} : mot-clé « {g['cle']} » absent de « {p} »")
            ps.append([b, c1, v1, c2, v2])
        groupes.append({"titre": g["titre"], "p": ps})
    if erreurs:
        print("\n".join(erreurs)); sys.exit(1)
    json.dump({"groupes": groupes}, open(f"{ROOT}/public/bible/paralleles.json", "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"récits parallèles : {len(groupes)} groupes, {sum(len(g['p']) for g in groupes)} passages")


if __name__ == "__main__":
    paralleles()
    if len(sys.argv) > 1: croisees(sys.argv[1])
