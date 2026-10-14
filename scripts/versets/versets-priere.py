# Versets sur la prière, extraits des Bibles de l'app (texte exact) :
# Louis Segond (fr), World English Bible (en), Bíblia Livre (pt).
# Usage : python3 scripts/versets/versets-priere.py > src/data/versets-priere.json
import json, sys

# (livre, chapitre, verset LSG, verset version anglaise/portugaise si différent)
REFS = [
    (50, 4, 6), (52, 5, 17), (40, 7, 7), (41, 11, 24), (59, 5, 16), (24, 33, 3),
    (19, 145, 18), (62, 5, 14), (58, 4, 16), (45, 8, 26), (51, 4, 2), (49, 6, 18),
    (60, 5, 7), (48, 6, 2), (14, 7, 14), (42, 18, 1), (23, 65, 24), (40, 6, 6),
    (40, 18, 20), (43, 15, 7), (43, 16, 24), (45, 12, 12), (24, 29, 12), (40, 21, 22),
    (43, 14, 13), (42, 11, 9), (59, 1, 5), (54, 2, 1), (19, 116, 1), (40, 26, 41),
    (19, 55, 23, 22), (19, 62, 9, 8), (19, 5, 4, 3),
]
DOSSIERS = {"fr": "public/bible", "en": "public/bible/web", "pt": "public/bible/blivre"}

livres = {}
def livre(lang, b):
    k = (lang, b)
    if k not in livres:
        livres[k] = json.load(open(f"{DOSSIERS[lang]}/{b}.json"))
    return livres[k]

out = []
for r in REFS:
    b, c, v = r[0], r[1], r[2]
    item = {}
    for lang in ("fr", "en", "pt"):
        vv = v if lang == "fr" or len(r) < 4 else r[3]
        L = livre(lang, b)
        t = " ".join(L["chapters"][c - 1][vv - 1].split())
        item[lang] = {"texte": t, "ref": f"{L['name']} {c}:{vv}"}
    # Seulement des versets courts : ils tiennent dans la petite carte du mur.
    if len(item["fr"]["texte"]) <= 150:
        out.append(item)
json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
