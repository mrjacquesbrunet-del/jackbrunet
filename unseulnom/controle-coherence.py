#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verifie qu'une ville dit la meme chose partout sur le site.

    python3 controle-coherence.py            # toutes les villes connues
    python3 controle-coherence.py limours    # une seule

POURQUOI CE FICHIER EXISTE.

Une ville figure a sept endroits : sa propre page, la carte du carrousel
de « evenement », la ligne de son calendrier, la frise de l'accueil, les
menus de l'accueil et des actualites, la liste des prochains rendez-vous
et deux bandeaux defilants. Rien ne relie ces endroits entre eux : ce
sont sept textes ecrits a la main dans trois fichiers.

Le 19 novembre, Limours portait son affiche et ses quatre noms dans le
carrousel, et « intervenants a annoncer » trente centimetres plus bas,
dans le calendrier de la meme page. La page se contredisait elle-meme et
personne ne l'avait vu, parce que les deux blocs ne se voient jamais a
l'ecran en meme temps.

Ce controle lit les fichiers produits pour WordPress — ceux qui partent
vraiment en ligne, pas les sources — et refuse de se taire tant que les
sept endroits ne disent pas la meme chose.
"""

import html
import io
import os
import re
import sys

RACINE = os.path.dirname(os.path.abspath(__file__))

SORTIES = {
    "accueil":    "wordpress-accueil/1-HTML-accueil.txt",
    "tarbes":     "wordpress-tarbes/1-HTML-tarbes.txt",
    "limours":    "wordpress-limours/1-HTML-limours.txt",
    "evenement":  "wordpress-evenement/1-HTML-evenement.txt",
    "actualites": "wordpress-actualites/1-HTML-actualites.txt",
}

# Ce que chaque ville doit dire, et nulle part autre chose.
VILLES = {
    "tarbes": {
        "page": "tarbes",
        "date": "12 décembre 2026",
        "evenement": "Tarbes 2026",
        "intervenants": ["Jack Brunet", "Chriss Campion",
                         "Briman Heugebaert", "Juan Antonio"],
        "lien": "unseulnom.org/evenement/tarbes/",
    },
    "limours": {
        "page": "limours",
        "date": "2 janvier 2027",
        "evenement": "Limours 2027",
        "intervenants": ["Chriss Campion", "Noé Mallet", "Linoï Chabot"],
        "lien": "unseulnom.org/evenement/limours/",
    },
}

# Les noms qui ont ete retires et qui ne doivent plus reapparaitre. Un
# nom supprime a un endroit et oublie a un autre est exactement le genre
# de faute que ce fichier existe pour attraper.
BANNIS = {
    "limours": ["Chorale de Limours"],
}


def lire(chemin):
    """Le texte d'un fichier, entites HTML resolues.

    Le generateur ecrit les accents en entites NUMERIQUES (&#233;) tandis
    que les sources les portent tantot en clair, tantot en entites
    NOMMEES (&eacute;). Comparer les trois formes a la main, c'est se
    tromper : une premiere version de ce controle a declare « Noe Mallet »
    absent de la page de Limours, ou il etait bel et bien. On decode donc
    tout avant de comparer quoi que ce soit.
    """
    brut = io.open(os.path.join(RACINE, chemin), encoding="utf-8",
                   errors="replace").read()
    return html.unescape(brut)


def controler(cle, ville, fautes):
    print("\n== %s" % cle.upper())
    textes = {nom: lire(p) for nom, p in SORTIES.items()}
    sienne = textes[ville["page"]]

    def dire(ok, texte):
        print(("   ok    " if ok else "   FAUX  ") + texte)
        if not ok:
            fautes.append("%s : %s" % (cle, texte))

    # 1. La date, la meme partout ou la ville est nommee.
    jour, mois, annee = ville["date"].split()
    autres = re.compile(r"\d{1,2} %s %s" % (mois, annee))
    for nom, t in textes.items():
        if cle.capitalize() not in t:
            continue
        fausses = set(autres.findall(t)) - {ville["date"]}
        dire(not fausses, "date dans %-11s %s"
             % (nom, ville["date"] if not fausses else "AUSSI " + ", ".join(fausses)))

    # 2. Le nom de l'evenement, le meme dans la page et dans l'envoi Brevo.
    #    S'ils divergent, les places sont comptees sur une ville et les
    #    contacts ranges dans une autre, sans la moindre erreur visible.
    page = re.search(r'data-usn-evenement="([^"]+)"', sienne)
    brevo = re.search(r'name="VILLE" value="([^"]+)"', sienne)
    dire(page is not None and brevo is not None
         and page.group(1) == brevo.group(1) == ville["evenement"],
         "reservations  page=%r brevo=%r attendu=%r"
         % (page and page.group(1), brevo and brevo.group(1), ville["evenement"]))

    # 3. Les intervenants : tous sur sa page, tous sur la page « evenement ».
    for nom in ("evenement", ville["page"]):
        manquants = [q for q in ville["intervenants"] if q not in textes[nom]]
        dire(not manquants, "intervenants dans %-11s %s"
             % (nom, "les %d" % len(ville["intervenants"])
                if not manquants else "MANQUE " + ", ".join(manquants)))

    # 4. Ce qui a ete retire ne doit revenir nulle part.
    for banni in BANNIS.get(cle, []):
        restants = [n for n, t in textes.items() if banni in t]
        dire(not restants, "retire : %-22s %s"
             % (banni, "absent partout" if not restants
                else "ENCORE DANS " + ", ".join(restants)))

    # 5. Sa page doit etre atteignable depuis le reste du site.
    depuis = [n for n, t in textes.items()
              if ville["lien"] in t and n != ville["page"]]
    dire(len(depuis) >= 2, "liens vers sa page depuis : %s"
         % (", ".join(depuis) or "NULLE PART"))


def main():
    voulues = [a.lower() for a in sys.argv[1:]] or list(VILLES)
    inconnues = [v for v in voulues if v not in VILLES]
    if inconnues:
        raise SystemExit("ville inconnue : %s (au choix : %s)"
                         % (", ".join(inconnues), ", ".join(VILLES)))

    manquants = [p for p in SORTIES.values()
                 if not os.path.exists(os.path.join(RACINE, p))]
    if manquants:
        raise SystemExit("fichiers absents, lance d'abord "
                         "generer-fichiers-wordpress.py :\n  %s"
                         % "\n  ".join(manquants))

    fautes = []
    for cle in voulues:
        controler(cle, VILLES[cle], fautes)

    print()
    if fautes:
        print("%d anomalie(s) :" % len(fautes))
        for f in fautes:
            print("  - %s" % f)
        raise SystemExit(1)
    print("Tout coincide.")


if __name__ == "__main__":
    main()
