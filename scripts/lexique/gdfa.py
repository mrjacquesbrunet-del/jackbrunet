def gdfa(f, r):
    """grow-diag-final-and (Koehn)."""
    inter, union = f & r, f | r
    al = set(inter)
    voisins = [(-1, 0), (0, -1), (1, 0), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]
    ajout = True
    while ajout:
        ajout = False
        for (i, j) in sorted(al):
            for di, dj in voisins:
                ni, nj = i + di, j + dj
                if (ni, nj) in union and (ni, nj) not in al:
                    if not any(a == ni for a, _ in al) or not any(b == nj for _, b in al):
                        al.add((ni, nj)); ajout = True
    for (i, j) in sorted(union):
        if (i, j) not in al and not any(a == i for a, _ in al) and not any(b == j for _, b in al):
            al.add((i, j))
    return al
