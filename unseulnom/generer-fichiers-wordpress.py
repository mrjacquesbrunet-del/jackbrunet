#!/usr/bin/env python3
"""
Genere les fichiers a coller dans WordPress a partir des pages sources.

    python3 generer-fichiers-wordpress.py            # les deux pages
    python3 generer-fichiers-wordpress.py agenda     # une seule

Deux pages sont produites :

  accueil    accueil.html -> wordpress-accueil/     (la page d'accueil)
  evenement  index.html   -> wordpress-3-parties/   (la page Avignon)
  agenda     agenda.html  -> wordpress-agenda/      (les dates a venir)

Pour chacune :
  1-HTML.txt              -> onglet HTML du bloc
  2-CSS.txt               -> onglet CSS du bloc
  3-JAVASCRIPT.txt        -> "CSS et JS personnalises"
  1-HTML-AVEC-SCRIPT.txt  -> HTML + script en un seul bloc
  ..-a-coller.html        -> version tout-en-un

Trois transformations sont appliquees a la volee :

1. ASCII pur. Les accents deviennent des entites HTML dans le HTML, et sont
   translitteres dans les commentaires CSS et JavaScript. C'est ce qui evite
   les caracteres casses ("DAcsinscription") quand l'editeur de texte se
   trompe d'encodage au copier-coller.

2. Images vers la mediatheque. Les chemins "images/xxx.webp" deviennent des
   URL completes du site (voir URL_MEDIAS). Le logo, lui, est vectoriel et
   integre dans le CSS : il n'y a rien a envoyer pour lui.

3. Retrait des reperes non fournis. La video de fond et les quatre photos
   d'ambiance ne sont pas encore livrees : leurs balises sont retirees plutot
   que laissees en liens morts, qui declencheraient une erreur a chaque visite.
   Elles reviendront automatiquement dans les fichiers le jour ou les vraies
   URL remplaceront les reperes VOTRE_... dans index.html.
"""

import re
import sys
import unicodedata
from pathlib import Path

RACINE = Path(__file__).resolve().parent

PAGES = {
    "accueil": {
        "source": "accueil.html",
        "sortie": "wordpress-accueil",
        "seul": "accueil-a-coller-dans-wordpress.html",
        "generique": None,
    },
    "evenement": {
        "source": "index.html",
        "sortie": "wordpress-3-parties",
        "seul": "a-coller-dans-wordpress.html",
        "generique": "index-wordpress.html",
    },
    "agenda": {
        "source": "agenda.html",
        "sortie": "wordpress-agenda",
        "seul": "agenda-a-coller-dans-wordpress.html",
        "generique": None,
    },
}

# Les deux adresses de la rubrique evenement.
#
#   URL_EVENEMENT : la page parente, celle qui liste les dates a venir.
#   URL_VILLE     : la fiche de la prochaine ville.
#
# Apres Tarbes, il suffira de changer URL_VILLE (evenement/marseille,
# puis evenement/bordeaux...) : les liens « Reserver » des trois pages
# suivent tout seuls.
URL_EVENEMENT = "https://unseulnom.org/evenement/"
URL_VILLE = "https://unseulnom.org/evenement/tarbes/"

URL_MEDIAS = "https://unseulnom.org/wp-content/uploads/2026/07"
URL_2026_04 = "https://unseulnom.org/wp-content/uploads/2026/04"
URL_2026_10 = "https://unseulnom.org/wp-content/uploads/2026/10"

# WordPress a retire les traits d'union des noms de fichiers a l'envoi :
# programme-1.webp est servi sous programme1.webp.
RENOMMAGES = {
    "programme-1.webp": "programme1.webp",
    "programme-2.webp": "programme2.webp",
    "programme-3.webp": "programme3.webp",
    "programme-4.webp": "programme4.webp",
}

# Images deja presentes dans la mediatheque : on pointe dessus au lieu d'en
# envoyer de nouvelles. Ce sont les affiches des editions passees, et c'est
# la taille intermediaire generee par WordPress qui est utilisee (768 px de
# large, soit quatre fois plus legere que l'originale, largement assez pour
# une vignette).
ADRESSES = {
    "edition-paris.webp":     URL_2026_04 + "/conference-Un-seul-nom-1-768x948.jpg",
    "edition-croissy.webp":   URL_2026_04 + "/conference-Un-seul-nom-3-768x954.jpg",
    "edition-wasquehal.webp": URL_2026_04 + "/conference-Un-seul-nom-4-768x945.jpg",
    "edition-perpignan.webp": URL_2026_04 + "/conference-Un-seul-nom-5-768x950.jpg",
    # Envoyes en octobre 2026, pas avec les premieres images : WordPress
    # range les fichiers par mois d'envoi, le dossier n'est pas le meme.
    "teaserposter.webp":      URL_2026_10 + "/teaserposter.webp",
    "affichepau.webp":        URL_2026_10 + "/affichepau.webp",
    "afficheformation.webp":  URL_2026_10 + "/afficheformation.webp",
    "affichetarbes.webp":     URL_2026_10 + "/affichetarbes.webp",
    "afficheavignon.webp":    URL_2026_10 + "/afficheavignon.webp",
    "affichemadagascar.webp": URL_2026_10 + "/affichemadagascar.webp",
    "jack.webp":              URL_2026_10 + "/jack.webp",
    "chrisstarbes.webp":      URL_2026_10 + "/chrisstarbes.webp",
    "briman.webp":            URL_2026_10 + "/briman.webp",
    "juan.webp":              URL_2026_10 + "/juan.webp",
    "affichetarbeslarge.webp": URL_2026_10 + "/affichetarbeslarge.webp",
    # L'image d'attente du film de la carte, en tete de la page a venir.
    "carteposter.webp":       URL_2026_10 + "/carteposter.webp",
    # La photo du bandeau « Evangelisation et Guerison » : la precedente
    # montrait Yannis Gautier, qui ne sera pas a Tarbes.
    "evangelisation.webp":    URL_2026_10 + "/evangelisation.webp",
}

# Ponctuation typographique et filets -> equivalent ASCII
PONCTUATION = {
    "’": "'", "‘": "'", "“": '"', "”": '"',
    "–": "-", "—": "-", "…": "...",
    "«": '"', "»": '"',
    " ": " ", " ": " ",
    "→": "->", "►": ">", "◄": "<",
    "═": "=", "─": "-", "━": "-", "│": "|",
}


def en_ascii(texte):
    """Translittere en ASCII pur (pour les commentaires CSS et JS)."""
    for source, cible in PONCTUATION.items():
        texte = texte.replace(source, cible)
    texte = unicodedata.normalize("NFKD", texte)
    texte = "".join(c for c in texte if not unicodedata.combining(c))
    return "".join(c if ord(c) < 128 else "?" for c in texte)


def en_entites(texte):
    """Remplace tout caractere non-ASCII par son entite HTML numerique."""
    return "".join(c if ord(c) < 128 else "&#%d;" % ord(c) for c in texte)


# Un caractere qui, juste avant un "/", annonce une expression reguliere et
# non une division. Sert au decoupage du JavaScript ci-dessous.
AVANT_REGEX = set("(,=:[!&|?{};+-*%~^") | {""}


def decouper_js(js):
    """Decoupe le JavaScript en morceaux (type, texte).

    Types produits : "chaine" pour le contenu des guillemets, "code" pour
    tout le reste (code, commentaires, expressions regulieres). On distingue
    les deux parce qu'ils ne se traitent pas pareil : dans une chaine le
    texte est lu par le visiteur, ailleurs il ne l'est pas.
    """
    morceaux = []
    tampon = []
    i, n = 0, len(js)
    precedent = ""

    def vider():
        if tampon:
            morceaux.append(("code", "".join(tampon)))
            del tampon[:]

    while i < n:
        c = js[i]
        suivant = js[i + 1] if i + 1 < n else ""

        if c == "/" and suivant == "/":                      # commentaire //
            fin = js.find("\n", i)
            fin = n if fin == -1 else fin
            tampon.append(js[i:fin]); i = fin; continue

        if c == "/" and suivant == "*":                      # commentaire /* */
            fin = js.find("*/", i + 2)
            fin = n if fin == -1 else fin + 2
            tampon.append(js[i:fin]); i = fin; continue

        if c == "/" and precedent in AVANT_REGEX:            # /expression/
            j = i + 1
            while j < n and js[j] != "\n":
                if js[j] == "\\":
                    j += 2; continue
                if js[j] == "[":
                    while j < n and js[j] != "]":
                        j += 2 if js[j] == "\\" else 1
                if js[j] == "/":
                    j += 1; break
                j += 1
            tampon.append(js[i:j]); i = j
            precedent = "/"
            continue

        if c in "'\"`":                                      # chaine
            j = i + 1
            while j < n:
                if js[j] == "\\":
                    j += 2; continue
                if js[j] == c:
                    break
                j += 1
            vider()
            morceaux.append(("code", c))
            morceaux.append(("chaine", js[i + 1:j]))
            morceaux.append(("code", js[j:j + 1]))
            i = j + 1
            precedent = c
            continue

        tampon.append(c)
        if not c.isspace():
            precedent = c
        i += 1

    vider()
    return morceaux


def js_en_ascii(js):
    """Rend le JavaScript ASCII sans abimer le francais affiche.

    Les commentaires sont translitteres (personne ne les lit sur le site),
    mais le texte des chaines de caracteres est echappe en \\uXXXX : le
    fichier reste en ASCII pur et le visiteur voit malgre tout
    "Je reserve ma place" avec son accent.
    """
    morceaux = decouper_js(js)
    assert "".join(t for _, t in morceaux) == js, "decoupage du JavaScript errone"
    return "".join(
        "".join(c if ord(c) < 128 else "\\u%04x" % ord(c) for c in texte)
        if genre == "chaine" else en_ascii(texte)
        for genre, texte in morceaux
    )


def vers_evenement(texte):
    """Pointe les liens sur les adresses reelles des deux pages.

    L'adresse de la ville est mise de cote le temps de reecrire celle de
    la page parente : sans cela, la page parente etant le debut de
    l'adresse de la ville, la seconde reecriture abimerait la premiere.
    """
    jeton = "@@URL-VILLE@@"
    texte = texte.replace("https://unseulnom.org/evenement/tarbes/", jeton)
    texte = texte.replace("https://unseulnom.org/evenement/", URL_EVENEMENT)
    return texte.replace(jeton, URL_VILLE)


def vers_mediatheque(texte, base=URL_MEDIAS):
    """Reecrit les chemins images/xxx.webp vers la mediatheque WordPress."""
    def remplace(m):
        nom = m.group(1)
        if nom in ADRESSES:
            return '"%s"' % ADRESSES[nom]
        return '"%s/%s"' % (base, RENOMMAGES.get(nom, nom))
    return re.sub(r'"images/([^"]+)"', remplace, texte)


def sans_reperes(html):
    """Retire les balises qui pointent encore vers un fichier non fourni."""
    # La video de fond : on garde un repere de remplacement.
    html = re.sub(
        r'^[ \t]*<source src="VOTRE_VIDEO[^"]*"[^>]*/>[ \t]*\n',
        "      <!-- VIDEO -->\n", html, flags=re.M)
    # Les photos d'ambiance : le bloc entier disparait.
    html = re.sub(
        r'^[ \t]*<div class="usn-side[^"]*"[^>]*>\s*'
        r'<img src="VOTRE_PHOTO_AMBIANCE[^>]*>\s*</div>[ \t]*\n',
        "", html, flags=re.M)
    reste = re.findall(r"VOTRE_[A-Z_0-9]+", html)
    if reste:
        print("  reperes encore presents : %s" % ", ".join(sorted(set(reste))))
    return html


def extraire(source, balise, nom_source):
    """Recupere le contenu entre <balise> et </balise> (premiere occurrence)."""
    m = re.search(r"<%s>\n(.*?)\n</%s>" % (balise, balise), source, re.S)
    if not m:
        raise SystemExit("balise <%s> introuvable dans %s" % (balise, nom_source))
    return m.group(1)


def extraire_section(source, nom_source):
    m = re.search(r'<section id="usn-[a-z]+">', source)
    if not m:
        raise SystemExit("aucune <section id=\"usn-...\"> dans %s" % nom_source)
    fin = source.index("</section>", m.start()) + len("</section>")
    section = source[m.start():fin]
    # La decoupe s'arrete a la PREMIERE fermeture : une <section> imbriquee
    # couperait donc la page en deux, sans rien signaler. On refuse plutot
    # que de produire un fichier tronque. Utilisez <div> a l'interieur.
    if re.search(r"<section\b", section[m.end() - m.start():]):
        raise SystemExit(
            "%s : une <section> imbriquee coupe la page. Remplacez-la par "
            "un <div>." % nom_source)
    return section


def verifier(css):
    """Un saut de ligne dans une url("...") casse la feuille de style."""
    for m in re.finditer(r'url\("([^"]*)"\)', css):
        if "\n" in m.group(1):
            raise SystemExit("url() contient un saut de ligne : CSS invalide")


def verifier_javascript(nom, js):
    """Refuse un script qui contient une esperluette.

    WordPress retouche la typographie de tout ce qu'on lui confie. Sur du
    texte c'est utile ; sur du code c'est destructeur : il remplace
    l'esperluette par son entite HTML, et le navigateur s'arrete sur une
    erreur de syntaxe. Tout le script meurt, pas seulement la ligne.

    Constate deux fois : le 20 octobre 2026 dans le bloc HTML de la page
    « A venir » (trois « et » logiques sur six abimes, carrousel vide),
    puis le 26 dans l'onglet JavaScript de l'extension (trente-deux
    caracteres abimes). Aucun des deux endroits n'est a l'abri, et c'est
    pourquoi la regle n'est pas « poser le script ailleurs » mais « ne
    jamais ecrire d'esperluette dedans ».

    Le remplacement se fait dans le fichier source, a la main : l'operateur
    « et » logique s'ecrit « a ? b : false ». Mieux vaut un refus ici
    qu'une page muette en ligne.
    """
    if "&" in js:
        lignes = [l.strip() for l in js.split("\n") if "&" in l]
        raise SystemExit(
            "%s : %d esperluette(s) dans le script.\n"
            "WordPress les transformera en entites HTML et le script ne\n"
            "demarrera pas. Remplace « a et b » par « a ? b : false ».\n"
            "Lignes en cause :\n  %s"
            % (nom, js.count("&"), "\n  ".join(lignes[:8])))


def construire(nom, page):
    chemin = RACINE / page["source"]
    source = chemin.read_text(encoding="utf-8")

    css = en_ascii(extraire(source, "style", page["source"]))
    js = js_en_ascii(extraire(source, "script", page["source"]))
    section = sans_reperes(extraire_section(source, page["source"]))
    html = en_entites(vers_evenement(vers_mediatheque(section)))
    verifier(css)
    # Avant d'ecrire quoi que ce soit : un script qui ne demarrera pas en
    # ligne ne doit pas arriver jusqu'au disque.
    verifier_javascript(nom, js)

    sortie = RACINE / page["sortie"]
    sortie.mkdir(exist_ok=True)
    fichiers = {
        sortie / "1-HTML.txt": html + "\n",
        sortie / "2-CSS.txt": css + "\n",
        sortie / "3-JAVASCRIPT.txt": js + "\n",
        RACINE / page["seul"]: "<style>\n" + css + "\n</style>\n\n" + html + "\n",
    }
    if page["generique"]:
        # Version generique : l'adresse de la mediatheque reste a remplacer.
        generique = en_entites(vers_evenement(vers_mediatheque(section, "__URL_IMAGES__")))
        fichiers[RACINE / page["generique"]] = (
            "<style>\n" + css + "\n</style>\n\n" + generique + "\n")

    # Les fichiers d'avant, qui melaient le HTML et le script : ils menent
    # droit dans le mur decrit ci-dessus, mieux vaut qu'ils disparaissent
    # que de rester a trainer sur le disque.
    perime = sortie / "1-HTML-AVEC-SCRIPT.txt"
    if perime.exists():
        perime.unlink()

    print("== %s (%s)" % (nom, page["source"]))
    for chemin_sortie, contenu in fichiers.items():
        chemin_sortie.write_text(contenu, encoding="ascii")
        print("   %7d octets  %s" % (chemin_sortie.stat().st_size,
                                     chemin_sortie.relative_to(RACINE)))


EN_TETE_JS = """/* =====================================================================
   UN SEUL NOM — LE JAVASCRIPT DU SITE

   Un seul fichier pour les trois pages. Il se colle dans l'onglet
   JavaScript de l'extension « CSS et JS personnalises ».

   Il ne contient pas une seule esperluette, et ce n'est pas un hasard :
   WordPress les remplace par leur entite HTML, ce qui arreterait le
   navigateur sur une erreur de syntaxe. L'operateur « et » logique est
   donc ecrit « a ? b : false » d'un bout a l'autre du fichier.

   Les trois scripts sont independants et commencent chacun par une
   garde : s'il ne trouve pas la page qu'il sert, il s'arrete aussitot
   et ne touche a rien. Le fichier peut donc etre injecte sur toutes les
   pages du site sans risque.

   GENERE PAR generer-fichiers-wordpress.py — ne pas modifier a la main.
   ===================================================================== */

"""

SEPARATEUR_JS = """

/* =====================================================================
   %s
   ===================================================================== */

"""


def main():
    voulues = sys.argv[1:] or list(PAGES)
    for nom in voulues:
        if nom not in PAGES:
            raise SystemExit("page inconnue : %s (au choix : %s)"
                             % (nom, ", ".join(PAGES)))
        construire(nom, PAGES[nom])

    # Le fichier unique, seulement quand toutes les pages ont ete faites :
    # sinon il ne porterait qu'une partie du site.
    if set(voulues) == set(PAGES):
        morceaux = [en_ascii(EN_TETE_JS)]
        for nom, page in PAGES.items():
            js = (RACINE / page["sortie"] / "3-JAVASCRIPT.txt").read_text(encoding="ascii")
            morceaux.append(SEPARATEUR_JS % en_ascii(
                "Page %s (%s)" % (nom, page["source"])))
            morceaux.append(js.strip() + "\n")
        tout = "".join(morceaux)
        # Le meme controle que page par page, applique au fichier reuni :
        # c'est lui que l'on colle en ligne, c'est donc lui qui compte.
        verifier_javascript("le fichier reuni", tout)
        chemin = RACINE / "wordpress-javascript-du-site.txt"
        chemin.write_text(tout, encoding="ascii")
        print("== le javascript des trois pages, en un seul fichier")
        print("   %7d octets  %s" % (chemin.stat().st_size, chemin.name))


if __name__ == "__main__":
    main()
