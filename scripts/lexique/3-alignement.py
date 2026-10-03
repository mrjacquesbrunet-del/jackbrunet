"""Étape 2 ter : vote de plusieurs alignements (avec a priori des gloses)."""
import json, os, io, tempfile, importlib.util
from collections import Counter
import eflomal
ICI = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("g", f"{ICI}/gdfa.py"); g = importlib.util.module_from_spec(spec); spec.loader.exec_module(g)
V = json.load(open(f"{ICI}/corpus.json"))
trg = [" ".join(t["l"].lower().replace(" ", "_") for t in x["fr"]) or "∅" for x in V]
src = [" ".join(s["code"] for s in x["src"]) or "∅" for x in V]
priors = open(f"{ICI}/priors.txt").read()
N = 5
votes = [Counter() for _ in V]
d = tempfile.mkdtemp()
def lire(f):
    return [set(tuple(map(int, p.split("-"))) for p in ln.split()) for ln in open(f)]
for k in range(N):
    al = eflomal.Aligner(model=3, n_samplers=3)
    al.align(src, trg, links_filename_fwd=f"{d}/f", links_filename_rev=f"{d}/r", priors_input=io.StringIO(priors))
    for vt, x, f, r in zip(votes, V, lire(f"{d}/f"), lire(f"{d}/r")):
        if x["src"] and x["fr"]:
            vt.update(g.gdfa(f, r))
    print("passe", k + 1, flush=True)
out = []
for vt in votes:
    garde = {l for l, n in vt.items() if n * 2 > N}
    # Un mot source sans lien majoritaire : son lien le plus voté (s'il a au moins 2 voix).
    couverts = {i for i, _ in garde}
    meilleurs = {}
    for (i, j), n in vt.items():
        if i not in couverts and n >= 2 and n > meilleurs.get(i, (0, 0))[1]:
            meilleurs[i] = (j, n)
    garde |= {(i, j) for i, (j, _) in meilleurs.items()}
    out.append(sorted(garde))
json.dump(out, open(f"{ICI}/liens.json", "w"))
print("liens:", sum(len(o) for o in out))
