"""Étape 2 bis : alignement guidé par les gloses anglaises de STEPBible.
1) on aligne les gloses anglaises (mots pleins) avec les lemmes français ;
2) on en tire, pour chaque Strong, des « a priori » vers le français ;
3) on réaligne les Strong avec ces a priori (eflomal LEX priors)."""
import json, os, re, tempfile, io
from collections import Counter, defaultdict
import eflomal, simplemma

ICI = os.path.dirname(os.path.abspath(__file__))
V = json.load(open(f"{ICI}/corpus.json"))
trg = [" ".join(t["l"].lower().replace(" ", "_") for t in x["fr"]) or "∅" for x in V]

VIDES = set("""a an the of to in on at by for from with into upon unto and or but nor not no he him his she her it its they them their
we us our you your i me my mine this that these those who whom which what is are was were be been being am do does did have has had
shall will would should may might can could let as so then there here thus also even all any some o oh""".split())
def gloss_mots(g):
    g = re.sub(r"\[[^\]]*\]|<[^>]*>|\([^)]*\)", " ", g.lower())
    ws = [w for w in re.findall(r"[a-z]+", g) if w not in VIDES]
    return [simplemma.lemmatize(w, lang="en") for w in ws]

src_g = []
for x in V:
    toks = []
    for s in x["src"]:
        toks += gloss_mots(s["gloss"])
    src_g.append(" ".join(toks) or "∅")

d = tempfile.mkdtemp()
def lire(f):
    return [set(tuple(map(int, p.split("-"))) for p in ln.split()) for ln in open(f)]

al = eflomal.Aligner(model=3, n_samplers=4)
al.align(src_g, trg, links_filename_fwd=f"{d}/gf", links_filename_rev=f"{d}/gr")
GF, GR = lire(f"{d}/gf"), lire(f"{d}/gr")
paires = Counter(); freq_g = Counter()
for sg, tg, f, r in zip(src_g, trg, GF, GR):
    s = sg.split(); t = tg.split()
    for w in s: freq_g[w] += 1
    for i, j in f & r:
        paires[(s[i], t[j])] += 1
p_g = defaultdict(dict)
for (g, f), n in paires.items():
    p_g[g][f] = n / freq_g[g]

# A priori Strong → français, à partir des gloses de chaque Strong.
gl_par_code = defaultdict(Counter)
for x in V:
    for s in x["src"]:
        for w in gloss_mots(s["gloss"]):
            gl_par_code[s["code"]][w] += 1
priors = []
for code, gc in gl_par_code.items():
    tot = sum(gc.values())
    score = Counter()
    for g, n in gc.items():
        for f, p in p_g.get(g, {}).items():
            score[f] += (n / tot) * p
    for f, sc in score.most_common(6):
        if sc >= 0.05:
            priors.append(f"LEX\t{code}\t{f}\t{min(sc, 1.0) * 5:.3f}")
print("a priori:", len(priors))
open(f"{ICI}/priors.txt", "w").write("\n".join(priors) + "\n")

src = [" ".join(s["code"] for s in x["src"]) or "∅" for x in V]
al = eflomal.Aligner(model=3, n_samplers=4)
al.align(src, trg, links_filename_fwd=f"{d}/fwd", links_filename_rev=f"{d}/rev",
         priors_input=io.StringIO("\n".join(priors) + "\n"))
F, R = lire(f"{d}/fwd"), lire(f"{d}/rev")

import importlib.util
spec = importlib.util.spec_from_file_location("a1", f"{ICI}/gdfa.py"); a1 = importlib.util.module_from_spec(spec); spec.loader.exec_module(a1)
out = [sorted(a1.gdfa(f, r)) if x["src"] and x["fr"] else [] for x, f, r in zip(V, F, R)]
json.dump(out, open(f"{ICI}/liens.json", "w"))
print("liens:", sum(len(o) for o in out))
