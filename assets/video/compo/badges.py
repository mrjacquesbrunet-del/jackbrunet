# Fin des vidéos FR : badges App Store / Google Play à la place du texte.
APPLE = '<svg viewBox="0 0 24 24" style="width:46px;height:46px;fill:#fff;flex:none"><path d="M17.05 12.53c-.03-2.4 1.96-3.55 2.05-3.61-1.12-1.63-2.86-1.86-3.47-1.88-1.47-.15-2.88.87-3.63.87-.75 0-1.9-.85-3.13-.83-1.6.02-3.09.94-3.92 2.38-1.68 2.9-.43 7.2 1.2 9.55.8 1.15 1.75 2.45 3 2.4 1.2-.05 1.66-.78 3.11-.78 1.45 0 1.86.78 3.13.75 1.3-.02 2.12-1.17 2.9-2.33.92-1.33 1.3-2.63 1.32-2.7-.03-.01-2.53-.97-2.56-3.82zM14.66 5.5c.66-.8 1.1-1.9.98-3-.95.04-2.1.63-2.78 1.43-.61.7-1.15 1.83-1 2.9 1.05.08 2.13-.53 2.8-1.33z"/></svg>'
PLAY = '<svg viewBox="0 0 24 24" style="width:42px;height:42px;flex:none"><polygon points="4,2.4 4,21.6 13.3,12" fill="#00C3FF"/><polygon points="4,2.4 16,9.3 13.3,12" fill="#00E676"/><polygon points="4,21.6 13.3,12 16,14.7" fill="#FF3D57"/><polygon points="16,9.3 20.6,12 16,14.7 13.3,12" fill="#FFD400"/></svg>'
def badge(icone, haut, bas):
    return ('<span style="display:inline-flex;align-items:center;gap:14px;height:88px;padding:0 30px 0 22px;border-radius:18px;background:#000;'
            'border:2px solid #A6A6A6;color:#fff;text-align:left;vertical-align:middle">' + icone +
            f'<span style="display:block;line-height:1.05"><span style="display:block;font-size:17px;font-weight:500;letter-spacing:.02em">{haut}</span>'
            f'<span style="display:block;font-size:33px;font-weight:600;letter-spacing:-.01em">{bas}</span></span></span>')
BADGES = badge(APPLE, "Télécharger dans", "l'App Store") + '<span style="display:inline-block;width:22px"></span>' + badge(PLAY, 'DISPONIBLE SUR', 'Google Play')
URL = '<div style="margin-top:26px;font-size:24px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:rgba(243,243,237,.55)">jackbrunet.com</div>'
for f, ancien, top in [
    ('final-16x9.html', '<div id="s9s" class="abs" style="left:0;right:0;top:810px;text-align:center;font-size:26px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:rgba(243,243,237,.6)">App Store &nbsp;·&nbsp; Google Play &nbsp;·&nbsp; jackbrunet.com</div>', 790),
    ('final-9x16.html', '<div id="s9s" class="abs" style="left:0;right:0;top:1230px;text-align:center;font-size:26px;font-weight:600;letter-spacing:.24em;line-height:1.9;text-transform:uppercase;color:rgba(243,243,237,.6)">App Store &nbsp;·&nbsp; Google Play<br>jackbrunet.com</div>', 1210),
]:
    s = open(f).read()
    assert ancien in s, f
    s = s.replace(ancien, f'<div id="s9s" class="abs" style="left:0;right:0;top:{top}px;text-align:center">{BADGES}{URL}</div>')
    open(f, 'w').write(s)
print('ok')
