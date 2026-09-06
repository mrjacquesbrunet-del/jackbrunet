"""Relève le sentier PEINT dans un décor du Chemin (tracé continu).

Le seuil par ligne se laissait piéger par un champ de blé ou un mur éclairé.
Ici on note chaque pixel (« est-ce du sable clair et chaud ? », normalisé
ligne par ligne pour que les cartes de nuit marchent aussi), puis on cherche
par programmation dynamique le tracé CONTINU de la ligne du bas jusqu'à la
ligne du haut qui maximise cette note — un chemin ne se téléporte pas.
"""
import sys, json
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def note(path, flou=9):
    im = Image.open(path).convert("RGB").filter(ImageFilter.GaussianBlur(flou))
    a = np.asarray(im).astype(np.float32)
    lum = a.mean(axis=2)
    chaud = a[:, :, 0] - a[:, :, 2]           # sable : rouge >> bleu
    # normalisation PAR LIGNE : sur une carte de nuit, le chemin reste le plus
    # clair de sa ligne même s'il est sombre dans l'absolu.
    z = (lum - lum.mean(axis=1, keepdims=True)) / (lum.std(axis=1, keepdims=True) + 1e-6)
    c = (chaud - chaud.mean(axis=1, keepdims=True)) / (chaud.std(axis=1, keepdims=True) + 1e-6)
    return z + 0.6 * c, im.size

def trace(path, y0=95.0, y1=25.0, pas=3, saut=4):
    s, (W, H) = note(path)
    ya, yb = int(y1 / 100 * (H - 1)), int(y0 / 100 * (H - 1))
    lignes = list(range(yb, ya - 1, -pas))     # du bas vers le haut
    acc = s[lignes[0]].copy()
    prov = []
    for y in lignes[1:]:
        best = np.full(W, -1e9, np.float32)
        argb = np.zeros(W, np.int32)
        for d in range(-saut, saut + 1):
            dec = np.roll(acc, d)
            if d > 0: dec[:d] = -1e9
            elif d < 0: dec[d:] = -1e9
            m = dec > best
            best[m] = dec[m]
            argb[m] = np.arange(W)[m] - d
        acc = best + s[y]
        prov.append(argb)
    x = int(np.argmax(acc))
    xs = [x]
    for argb in reversed(prov):
        x = int(argb[x]); xs.append(x)
    xs.reverse()                                # xs[i] ↔ lignes[i], bas → haut
    return xs, lignes, (W, H)

def points(path, n=8, **kw):
    xs, lignes, (W, H) = trace(path, **kw)
    idx = np.linspace(0, len(lignes) - 1, n).round().astype(int)
    return [[round(xs[i] / W * 100, 1), round(lignes[i] / (H - 1) * 100, 1)] for i in idx]

def apercu(path, pts, sortie):
    im = Image.open(path).convert("RGB")
    W, H = im.size
    d = ImageDraw.Draw(im)
    for i, p in enumerate(pts):
        x, y = p[0] / 100 * W, p[1] / 100 * H
        r = W * 0.07
        d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 60, 60), width=10)
    im.resize((W // 3, H // 3)).save(sortie, quality=88)

if __name__ == "__main__":
    f = sys.argv[1]
    kw = {k: float(v) for k, v in (a.split("=") for a in sys.argv[2:])}
    if "n" in kw: kw["n"] = int(kw["n"])
    if "pas" in kw: kw["pas"] = int(kw["pas"])
    if "saut" in kw: kw["saut"] = int(kw["saut"])
    pts = points(f, **kw)
    print(json.dumps(pts))
    apercu(f, pts, f.rsplit(".", 1)[0] + "-check.jpg")
