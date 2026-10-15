# Fin des vidéos FR : badges + vraies notes des stores (captures de Jack, 15/10/2026).
import re
exec(open('badges.py').read().split("for f, ancien, top in")[0])
NOTES = {'apple': (4.8, '4,8', '74 notes'), 'google': (5.0, '5,0', '347 avis')}
def etoiles(note):
    pct = note / 5 * 100
    return ('<span style="position:relative;display:inline-block;font-size:24px;letter-spacing:2px;line-height:1">'
            '<span style="color:rgba(243,243,237,.22)">★★★★★</span>'
            f'<span style="position:absolute;left:0;top:0;width:{pct:.0f}%;overflow:hidden;white-space:nowrap;color:#CAF000">★★★★★</span></span>')
def colonne(badge_html, cle):
    note, txt, nb = NOTES[cle]
    return ('<span style="display:inline-flex;flex-direction:column;align-items:center;gap:12px;vertical-align:top;margin:0 11px">' + badge_html +
            f'<span style="display:inline-flex;align-items:center;gap:10px">{etoiles(note)}'
            f'<span style="font-size:22px;font-weight:700;color:#F3F3ED">{txt}</span>'
            f'<span style="font-size:20px;font-weight:500;color:rgba(243,243,237,.55)">· {nb}</span></span></span>')
CONTENU = colonne(badge(APPLE, "Télécharger dans", "l'App Store"), 'apple') + colonne(badge(PLAY, 'DISPONIBLE SUR', 'Google Play'), 'google') + URL
for f in ['final-16x9.html', 'final-9x16.html']:
    s = open(f).read()
    s, n = re.subn(r'(<div id="s9s" class="abs" style="[^"]*">).*?(</div>\n</div>`;)', lambda m: m.group(1) + CONTENU + '</div>\n</div>`;', s, flags=re.S)
    if n != 1:
        # repli : la fin de S9 n'est pas suivie directement de `; (scène S10 après)
        a = s.index('<div id="s9s"'); b = s.index('jackbrunet.com</div></div>', a) + len('jackbrunet.com</div></div>')
        tete = s[a:s.index('>', a) + 1]
        s = s[:a] + tete + CONTENU + '</div>' + s[b:]
    open(f, 'w').write(s)
print('ok')
