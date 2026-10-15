# Versions EN et PT des compositions finales (même structure, mêmes temps).
import re
T = {
 'en': {
  "M('<b>01</b>Méditation du jour')": "M('<b>01</b>Daily devotional')",
  "M('<b>02</b>La Bible')": "M('<b>02</b>The Bible')",
  "M('<b>03</b>Podcasts')": "M('<b>03</b>Explore')",
  "M('<b>04</b>Mur de prière')": "M('<b>04</b>Prayer wall')",
  "M('<b>05</b>Grandir')": "M('<b>05</b>Grow')",
  "M('Lis<span class=\"pt\">.</span>')": "M('Read<span class=\"pt\">.</span>')",
  "M('Écoute<span class=\"pt\">.</span>')": "M('Listen<span class=\"pt\">.</span>')",
  "M('Prie<span class=\"pt\">.</span>')": "M('Pray<span class=\"pt\">.</span>')",
  "M('Grandis<span class=\"pt\">.</span>')": "M('Grow<span class=\"pt\">.</span>')",
  "M('La Bible')": "M('The Bible')",
  "M('Méditations &amp; podcasts')": "M('Audio Bible &amp; soaking')",
  "M('Le mur de prière')": "M('The prayer wall')",
  "M('Plans &amp; études')": "M('Plans &amp; studies')",
  "M('Chaque jour,')": "M('Every day,')",
  "M('une <em>Parole</em>')": "M('a <em>Word</em>')",
  "M('pour toi.')": "M('for you.')",
  "mots('La méditation audio de Pasteur Jack, un passage et une prière, en quelques minutes.')": "mots('A devotional from Pastor Jack, a passage and a prayer, in just a few minutes.')",
  "21 jours de suite<small>Ta série de méditations</small>": "21 days in a row<small>Your devotional streak</small>",
  "La voix de Pasteur Jack<small>Même écran verrouillé</small>": "Audio Bible<small>Even with the screen locked</small>",
  "M('Toute la <em>Bible</em>.')": "M('The whole <em>Bible</em>.')",
  "M('Lue, écoutée,')": "M('Read, heard,')",
  "M('étudiée.')": "M('studied.')",
  "Bible audio, chapitre après chapitre": "Audio Bible, chapter after chapter",
  "Lexique grec et hébreu": "Greek and Hebrew lexicon",
  "Références croisées et commentaires": "Cross-references and commentary",
  "M('Écoute')}<br>${M('<em>partout</em>.')": "M('Explore')}<br>${M('<em>the Word</em>.')",
  "M('Écoute <em>partout</em>.')": "M('Explore <em>the Word</em>.')",
  "mots('Enseignements et épisodes qui s\\'enchaînent, même en voiture.')": "mots('People, places, timeline and lexicon, to understand every page.')",
  "${ic('cadenas')}</span><span>Écran verrouillé<small>La lecture continue</small>": "${ic('livre')}</span><span>People &amp; places<small>Who\\'s who in the Bible</small>",
  "${ic('dl')}</span><span>Hors connexion<small>Télécharge tes épisodes</small>": "${ic('lien')}</span><span>Bible timeline<small>Every era, in order</small>",
  "M('Ne prie plus')": "M('Never pray')",
  "M('<em>jamais</em> seul.')": "M('<em>alone</em> again.')",
  "mots('Partage ton sujet et porte celui des autres, avec toute la communauté.')": "mots('Share your request and carry others in prayer, with the whole community.')",
  "Je prie · <span id=\"cpt\">120</span><small>pour le sujet de Sophie</small>": "Praying · <span id=\"cpt\">120</span><small>for Sophie\\'s request</small>",
  "M('Plans · Études · <em>Formations</em>')": "M('Plans · Studies · <em>Courses</em>')",
  "M('Plans · Études')": "M('Plans · Studies')",
  "M('· <em>Formations</em>')": "M('· <em>Courses</em>')",
  "mots('Et des temps de')} ${M('<em>repos</em>')}<br>${mots('dans Sa présence.')": "mots('And times of')} ${M('<em>rest</em>')}<br>${mots('in His presence.')",
  "mots('Et des temps')}<br>${mots('de')} ${M('<em>repos</em>')}<br>${mots('dans Sa présence.')": "mots('And times')}<br>${mots('of')} ${M('<em>rest</em>')}<br>${mots('in His presence.')",
  "Musique soaking</span>": "Soaking music</span>",
  "Ambiance sonore</span>": "Ambient sounds</span>",
  "« Arrêtez, et sachez que je suis Dieu… »": "“Be still, and know that I am God…”",
  "Psaume 46:11": "Psalm 46:10",
  "M('Une seule app.')": "M('One app.')",
  "M('Toute ta <em>vie</em> avec Dieu.')": "M('Your whole <em>life</em> with God.')",
  "M('Toute ta <em>vie</em>')": "M('Your whole <em>life</em>')",
  "M('avec Dieu.')": "M('with God.')",
  "M('Disponible en')": "M('Available in')",
  ">français</span>": ">French</span>", ">anglais</span>": ">English</span>", ">portugais</span>": ">Portuguese</span>",
  "Ton temps avec Jésus": "Your time with Jesus",
  "Télécharge l'app gratuitement": "Download the app for free",
  "['Je prie', 'Amen', 'Je prie', 'Je prie pour toi', 'Amen', 'Je prie', 'Dieu est fidèle', 'Je prie', 'Amen']": "['Praying', 'Amen', 'Praying', 'Praying for you', 'Amen', 'Praying', 'God is faithful', 'Praying', 'Amen']",
 },
 'pt': {
  "M('<b>01</b>Méditation du jour')": "M('<b>01</b>Devocional do dia')",
  "M('<b>02</b>La Bible')": "M('<b>02</b>A Bíblia')",
  "M('<b>03</b>Podcasts')": "M('<b>03</b>Explorar')",
  "M('<b>04</b>Mur de prière')": "M('<b>04</b>Mural de oração')",
  "M('<b>05</b>Grandir')": "M('<b>05</b>Crescer')",
  "M('Lis<span class=\"pt\">.</span>')": "M('Leia<span class=\"pt\">.</span>')",
  "M('Écoute<span class=\"pt\">.</span>')": "M('Ouça<span class=\"pt\">.</span>')",
  "M('Prie<span class=\"pt\">.</span>')": "M('Ore<span class=\"pt\">.</span>')",
  "M('Grandis<span class=\"pt\">.</span>')": "M('Cresça<span class=\"pt\">.</span>')",
  "M('La Bible')": "M('A Bíblia')",
  "M('Méditations &amp; podcasts')": "M('Bíblia em áudio &amp; soaking')",
  "M('Le mur de prière')": "M('O mural de oração')",
  "M('Plans &amp; études')": "M('Planos &amp; estudos')",
  "M('Chaque jour,')": "M('Todo dia,')",
  "M('une <em>Parole</em>')": "M('uma <em>Palavra</em>')",
  "M('pour toi.')": "M('para você.')",
  "mots('La méditation audio de Pasteur Jack, un passage et une prière, en quelques minutes.')": "mots('Um devocional do Pastor Jack, uma passagem e uma oração, em poucos minutos.')",
  "21 jours de suite<small>Ta série de méditations</small>": "21 dias seguidos<small>Sua sequência de devocionais</small>",
  "La voix de Pasteur Jack<small>Même écran verrouillé</small>": "Bíblia em áudio<small>Mesmo com a tela bloqueada</small>",
  "M('Toute la <em>Bible</em>.')": "M('A <em>Bíblia</em> inteira.')",
  "M('Lue, écoutée,')": "M('Lida, ouvida,')",
  "M('étudiée.')": "M('estudada.')",
  "Bible audio, chapitre après chapitre": "Bíblia em áudio, capítulo após capítulo",
  "Lexique grec et hébreu": "Léxico grego e hebraico",
  "Références croisées et commentaires": "Referências cruzadas e comentários",
  "M('Écoute')}<br>${M('<em>partout</em>.')": "M('Explore')}<br>${M('<em>a Palavra</em>.')",
  "M('Écoute <em>partout</em>.')": "M('Explore <em>a Palavra</em>.')",
  "mots('Enseignements et épisodes qui s\\'enchaînent, même en voiture.')": "mots('Personagens, lugares, linha do tempo e léxico, para entender cada página.')",
  "${ic('cadenas')}</span><span>Écran verrouillé<small>La lecture continue</small>": "${ic('livre')}</span><span>Personagens &amp; lugares<small>Quem é quem na Bíblia</small>",
  "${ic('dl')}</span><span>Hors connexion<small>Télécharge tes épisodes</small>": "${ic('lien')}</span><span>Linha do tempo<small>Cada época, em ordem</small>",
  "M('Ne prie plus')": "M('Nunca mais ore')",
  "M('<em>jamais</em> seul.')": "M('<em>sozinho</em>.')",
  "mots('Partage ton sujet et porte celui des autres, avec toute la communauté.')": "mots('Compartilhe seu pedido e leve o dos outros em oração, com toda a comunidade.')",
  "Je prie · <span id=\"cpt\">120</span><small>pour le sujet de Sophie</small>": "Orando · <span id=\"cpt\">120</span><small>pelo pedido da Sophie</small>",
  "M('Plans · Études · <em>Formations</em>')": "M('Planos · Estudos · <em>Cursos</em>')",
  "M('Plans · Études')": "M('Planos · Estudos')",
  "M('· <em>Formations</em>')": "M('· <em>Cursos</em>')",
  "mots('Et des temps de')} ${M('<em>repos</em>')}<br>${mots('dans Sa présence.')": "mots('E momentos de')} ${M('<em>descanso</em>')}<br>${mots('na Sua presença.')",
  "mots('Et des temps')}<br>${mots('de')} ${M('<em>repos</em>')}<br>${mots('dans Sa présence.')": "mots('E momentos')}<br>${mots('de')} ${M('<em>descanso</em>')}<br>${mots('na Sua presença.')",
  "Musique soaking</span>": "Música soaking</span>",
  "Ambiance sonore</span>": "Sons ambientes</span>",
  "« Arrêtez, et sachez que je suis Dieu… »": "“Ficai quietos, e sabei que eu sou Deus…”",
  "Psaume 46:11": "Salmos 46:10",
  "M('Une seule app.')": "M('Um só app.')",
  "M('Toute ta <em>vie</em> avec Dieu.')": "M('Toda a sua <em>vida</em> com Deus.')",
  "M('Toute ta <em>vie</em>')": "M('Toda a sua <em>vida</em>')",
  "M('avec Dieu.')": "M('com Deus.')",
  "M('Disponible en')": "M('Disponível em')",
  ">français</span>": ">francês</span>", ">anglais</span>": ">inglês</span>", ">portugais</span>": ">português</span>",
  "Ton temps avec Jésus": "Seu tempo com Jesus",
  "Télécharge l'app gratuitement": "Baixe o app gratuitamente",
  "['Je prie', 'Amen', 'Je prie', 'Je prie pour toi', 'Amen', 'Je prie', 'Dieu est fidèle', 'Je prie', 'Amen']": "['Estou orando', 'Amém', 'Estou orando', 'Orando por você', 'Amém', 'Estou orando', 'Deus é fiel', 'Estou orando', 'Amém']",
 },
}
MOTS = {
 'en': ['Meditate', 'Read', 'Listen', 'Pray', 'Share', 'Study', 'Memorize', 'Discover', 'Walk', 'Grow', 'Believe', 'Hope', 'Love', 'Together', 'With Him'],
 'pt': ['Medite', 'Leia', 'Ouça', 'Ore', 'Compartilhe', 'Estude', 'Memorize', 'Descubra', 'Avance', 'Cresça', 'Creia', 'Espere', 'Ame', 'Juntos', 'Com Ele'],
}
COMMUN = {
 # Scène 03 : les podcasts n'existent qu'en français → explorer la Bible
 "${phone('pD', 'podcasts-plein', 'podcasts',": "${phone('pD', 'personnages-plein', 'ecole',",
 '<div class="eq" id="eq"': '<div class="eq" id="eq" hidden',
 "const ecr = ['accueil', 'mur', 'podcasts',": "const ecr = ['accueil', 'mur', 'personnages',",
 'id="mgi2" src="a/podcasts.jpg"><img class="nav mg" id="mgn2" src="a/podcasts-nav.jpg"': 'id="mgi2" src="a/bible.jpg"><img class="nav mg" id="mgn2" src="a/bible-nav.jpg"',
}
def traduire(src, dst, L, taille):
    s = open(src).read()
    for a, b in list(COMMUN.items()) + list(T[L].items()):
        if a in s: s = s.replace(a, b)
    # Mots du montage
    def mot(m):
        j = int(m.group(1)); w = MOTS[L][j]
        fs = '' if len(w) <= 8 else f' style="font-size:{round(taille * 8 / len(w))}px"'
        inner = f'<span class="i">{w}<span class="pt">.</span></span>' if j % 2 == 0 else f'<span class="i" style="color:transparent;-webkit-text-stroke:3px #CAF000">{w}</span>'
        return f'<div class="mgm" id="mgw{j}"{fs}><span class="m">{inner}</span></div>'
    s, n = re.subn(r'<div class="mgm" id="mgw(\d+)"><span class="m"><span class="i"[^>]*>.*?</span></span></div>', mot, s)
    assert n == 15, n
    s = re.sub(r'(?<=["(])a/', f'a-{L}/', s)
    s = s.replace('<html lang="fr">', f'<html lang="{L}">')
    open(dst, 'w').write(s)
    # Contrôle : plus de texte français connu
    for fr in ['Méditation', 'prière', 'Télécharge', 'Disponible', 'Toute', 'Grandir', 'Jésus', 'Écoute', 'repos', 'Psaume', 'Partage', 'podcasts']:
        if fr in s: print(L, dst, 'RESTE:', fr, s[s.index(fr)-60:s.index(fr)+40].replace('\n', ' '))
for L in ['en', 'pt']:
    traduire('final-16x9.html', f'final-16x9-{L}.html', L, 190)
    traduire('final-9x16.html', f'final-9x16-{L}.html', L, 170)
print('ok')
