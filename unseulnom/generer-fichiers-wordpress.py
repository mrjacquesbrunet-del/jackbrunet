#!/usr/bin/env python3
"""
Genere les fichiers a coller dans WordPress a partir de index.html.

    python3 generer-fichiers-wordpress.py

Produit :
  wordpress-3-parties/1-HTML.txt              -> onglet HTML du bloc
  wordpress-3-parties/2-CSS.txt               -> onglet CSS du bloc
  wordpress-3-parties/3-JAVASCRIPT.txt        -> "CSS et JS personnalises"
  wordpress-3-parties/1-HTML-AVEC-SCRIPT.txt  -> HTML + script en un seul bloc
  a-coller-dans-wordpress.html                -> version tout-en-un

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
import unicodedata
from pathlib import Path

RACINE = Path(__file__).resolve().parent
SOURCE = RACINE / "index.html"
SORTIE = RACINE / "wordpress-3-parties"

URL_MEDIAS = "https://unseulnom.org/wp-content/uploads/2026/07"

# WordPress a retire les traits d'union des noms de fichiers a l'envoi :
# programme-1.webp est servi sous programme1.webp.
RENOMMAGES = {
    "programme-1.webp": "programme1.webp",
    "programme-2.webp": "programme2.webp",
    "programme-3.webp": "programme3.webp",
    "programme-4.webp": "programme4.webp",
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


def vers_mediatheque(texte, base=URL_MEDIAS):
    """Reecrit les chemins images/xxx.webp vers la mediatheque WordPress."""
    def remplace(m):
        nom = RENOMMAGES.get(m.group(1), m.group(1))
        return '"%s/%s"' % (base, nom)
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


def extraire(source, balise):
    """Recupere le contenu entre <balise> et </balise> (premiere occurrence)."""
    m = re.search(r"<%s>\n(.*?)\n</%s>" % (balise, balise), source, re.S)
    if not m:
        raise SystemExit("balise <%s> introuvable dans index.html" % balise)
    return m.group(1)


def extraire_section(source):
    debut = source.index('<section id="usn-event">')
    fin = source.index("</section>", debut) + len("</section>")
    return source[debut:fin]


def verifier(css):
    """Un saut de ligne dans une url("...") casse la feuille de style."""
    for m in re.finditer(r'url\("([^"]*)"\)', css):
        if "\n" in m.group(1):
            raise SystemExit("url() contient un saut de ligne : CSS invalide")


def main():
    source = SOURCE.read_text(encoding="utf-8")

    css = en_ascii(extraire(source, "style"))
    js = js_en_ascii(extraire(source, "script"))
    section = sans_reperes(extraire_section(source))
    html = en_entites(vers_mediatheque(section))
    # Version generique : l'adresse de la mediatheque reste a remplacer.
    html_generique = en_entites(vers_mediatheque(section, "__URL_IMAGES__"))
    verifier(css)

    SORTIE.mkdir(exist_ok=True)
    fichiers = {
        SORTIE / "1-HTML.txt": html + "\n",
        SORTIE / "2-CSS.txt": css + "\n",
        SORTIE / "3-JAVASCRIPT.txt": js + "\n",
        SORTIE / "1-HTML-AVEC-SCRIPT.txt": html + "\n\n<script>\n" + js + "\n</script>\n",
        RACINE / "a-coller-dans-wordpress.html":
            "<style>\n" + css + "\n</style>\n\n" + html
            + "\n\n<script>\n" + js + "\n</script>\n",
        RACINE / "index-wordpress.html":
            "<style>\n" + css + "\n</style>\n\n" + html_generique
            + "\n\n<script>\n" + js + "\n</script>\n",
    }
    for chemin, contenu in fichiers.items():
        chemin.write_text(contenu, encoding="ascii")
        print("%7d octets  %s" % (chemin.stat().st_size, chemin.name))


if __name__ == "__main__":
    main()
