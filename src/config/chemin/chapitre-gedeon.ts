import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 11 — Gédéon (Juges 6-8). 8 étapes. */
export const CHAPITRE_GEDEON: CheminChapitre = {
  id: 11,
  nom: "Gédéon",
  livre: "Juges 6-8",
  accent: "#FDE047",
  decor: "/img/chemin/decor-11.jpg",
  sentier: [{ x: 59.2, y: 94 }, { x: 48.9, y: 84.3 }, { x: 49.5, y: 74.6 }, { x: 53.7, y: 64.9 }, { x: 59.3, y: 55 }, { x: 41.3, y: 45.3 }, { x: 46.9, y: 35.6 }, { x: 58, y: 26 }],
  fallback: ["#4a3f0d", "#6b5a13", "#221c04"],
  carte: {
    id: "gedeon",
    nom: "Gédéon",
    titre: "Les torches dans les cruches",
    rarete: "legendaire",
    image: "/img/chemin/cartes/gedeon.jpg",
  },
  etapes: [
    {
      recit:
        "Après Josué vinrent les juges. Les enfants d'Israël firent ce qui déplaît à l'Éternel, et il les livra sept ans entre les mains de Madian. Les Madianites montaient avec leurs troupeaux, détruisaient les récoltes et ne laissaient rien à manger. Israël devint très malheureux, et les enfants d'Israël crièrent à l'Éternel.",
      ref: "Juges 6:1-6",
      exercices: [
        { type: "qcm", q: "Quel peuple opprime Israël au temps de Gédéon ?", choix: ["Madian", "Babylone", "Les Philistins", "L'Assyrie"], bonne: 0 },
        { type: "qcm", q: "Combien d'années dure cette oppression ?", choix: ["Sept ans", "Quarante ans", "Trois ans", "Vingt ans"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Les Madianites détruisaient les récoltes d'Israël.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'ange de l'Éternel vint s'asseoir sous un térébinthe, à Ophra. Gédéon battait du froment au pressoir, pour le mettre à l'abri de Madian. L'ange lui apparut et dit : « L'Éternel est avec toi, vaillant héros ! » Gédéon répondit : « Ah ! si l'Éternel est avec nous, pourquoi tout cela nous est-il arrivé ? »",
      ref: "Juges 6:11-16",
      exercices: [
        { type: "qui", indices: ["Je bats le blé caché dans un pressoir, par peur de l'ennemi.", "Un ange m'appelle « vaillant héros » alors que je me crois le plus petit.", "Je demande un signe avec une toison de laine.", "Je descends contre Madian avec trois cents hommes."], reponse: "Gédéon", leurres: ["Barak", "Jephté", "Othniel"] },
        { type: "qcm", q: "Que fait Gédéon quand l'ange l'appelle ?", choix: ["Il bat du blé au pressoir, caché de Madian", "Il garde les troupeaux", "Il répare la muraille", "Il dort sous un térébinthe"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment l'ange l'appelle-t-il ?", choix: ["« Vaillant héros »", "« Serviteur fidèle »", "« Fils de la promesse »", "« Prophète d'Israël »"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Gédéon dit : « Comment délivrerais-je Israël ? Ma famille est la plus pauvre en Manassé, et je suis le plus petit dans la maison de mon père. » L'Éternel lui dit : « Mais je serai avec toi, et tu battras Madian comme un seul homme. »",
      ref: "Juges 6:15-16",
      exercices: [
        { type: "trou", texte: "« Je suis le plus ___ dans la maison de mon père. »", reponse: "petit", leurres: ["fort", "sage", "âgé"], niveau: "moyen" },
        { type: "qcm", q: "Quelle est la réponse de Dieu à son objection ?", choix: ["« Je serai avec toi »", "« Prends ton frère avec toi »", "« Attends encore sept ans »", "« Va chercher un roi »"], bonne: 0 },
        { type: "qcm", q: "De quelle tribu est Gédéon ?", choix: ["Manassé", "Juda", "Benjamin", "Lévi"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Cette nuit-là, l'Éternel dit à Gédéon de renverser l'autel de Baal qui était à son père et d'abattre le pieu sacré qui était dessus. Gédéon prit dix hommes et le fit pendant la nuit, car il craignait la maison de son père. Au matin, les gens de la ville voulurent le faire mourir. Son père répondit : « Si Baal est un dieu, qu'il se défende lui-même ! »",
      ref: "Juges 6:25-32",
      exercices: [
        { type: "qcm", q: "Que Gédéon renverse-t-il d'abord ?", choix: ["L'autel de Baal chez son père", "La tour de la ville", "Le pressoir", "Le camp de Madian"], bonne: 0 },
        { type: "qcm", q: "Que répond son père à ceux qui veulent le tuer ?", choix: ["« Si Baal est un dieu, qu'il se défende lui-même »", "« Prenez-le, il a péché »", "« Il paiera une amende »", "« Chassez-le de la ville »"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Gédéon agit en plein jour, devant toute la ville.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Gédéon dit à Dieu : « Je vais mettre une toison de laine dans l'aire. Si la rosée est sur la toison seule et que tout le terrain reste sec, je connaîtrai que tu délivres Israël par ma main. » Il en fut ainsi : il pressa la toison et en fit sortir plein une coupe d'eau. Puis il demanda le contraire — la toison sèche et le sol couvert de rosée — et Dieu le fit encore.",
      ref: "Juges 6:36-40",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel objet Gédéon utilise-t-il pour demander un signe ?", choix: ["Une toison de laine", "Un bâton fendu", "Une pierre blanche", "Une lampe"], bonne: 0 },
        { type: "qcm", q: "Combien de fois demande-t-il le signe ?", choix: ["Deux fois, en inversant la demande", "Une seule fois", "Trois fois", "Sept fois"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que fait-il de la toison mouillée ?", choix: ["Il la presse et en tire plein une coupe d'eau", "Il la brûle en offrande", "Il l'étend sur l'autel", "Il la donne à son père"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'Éternel dit à Gédéon : « Le peuple que tu as avec toi est trop nombreux ; Israël pourrait dire : c'est ma main qui m'a délivré. » Vingt-deux mille s'en retournèrent : il en resta dix mille. Puis Dieu les fit descendre à l'eau et retint seulement ceux qui lapaient l'eau dans leur main. Ils étaient trois cents.",
      ref: "Juges 7:1-8",
      exercices: [
        { type: "qcm", q: "Combien d'hommes restent finalement à Gédéon ?", choix: ["Trois cents", "Dix mille", "Mille", "Sept mille"], bonne: 0 },
        { type: "qcm", q: "Pourquoi Dieu réduit-il l'armée ?", choix: ["Pour qu'Israël ne dise pas : « c'est ma main qui m'a délivré »", "Parce qu'il manquait des armes", "Pour aller plus vite", "Pour éviter la famine"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment les trois cents sont-ils choisis ?", choix: ["Ils lapent l'eau dans leur main", "Ils traversent le fleuve les premiers", "Ils sont tirés au sort", "Ce sont les plus jeunes"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Gédéon partagea les trois cents hommes en trois corps. Il leur remit à tous des trompettes et des cruches vides, avec des flambeaux dans les cruches. Au début de la veille du milieu, ils sonnèrent des trompettes et brisèrent les cruches. Les trois cents crièrent : « Épée pour l'Éternel et pour Gédéon ! » Tout le camp se mit à courir et à fuir.",
      ref: "Juges 7:16-22",
      exercices: [
        { type: "qcm", q: "Que contenaient les cruches des trois cents ?", choix: ["Des flambeaux allumés", "De l'huile", "Des pierres", "De l'eau du torrent"], bonne: 0 },
        { type: "trou", texte: "Ils crièrent : « Épée pour l'Éternel et pour ___ ! »", reponse: "Gédéon", leurres: ["Israël", "Josué", "Manassé"], niveau: "moyen" },
        { type: "vf", q: "Les trois cents ont attaqué à l'épée avant de sonner de la trompette.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les hommes d'Israël dirent à Gédéon : « Domine sur nous, toi, ton fils et le fils de ton fils. » Gédéon leur répondit : « Je ne dominerai point sur vous, et mon fils ne dominera point sur vous ; c'est l'Éternel qui dominera sur vous. » Le pays fut en repos pendant quarante ans.",
      ref: "Juges 8:22-28",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets l'histoire de Gédéon dans l'ordre :", items: ["L'ange le trouve battant le blé au pressoir", "Il renverse l'autel de Baal pendant la nuit", "Le signe de la toison", "Trois cents hommes, les trompettes et les cruches"] },
        { type: "qcm", q: "Que répond Gédéon quand on lui offre de régner ?", choix: ["« C'est l'Éternel qui dominera sur vous »", "« Seulement pour quarante ans »", "« Choisissez mon fils »", "« Je le veux bien »"], bonne: 0 },
        { type: "qcm", q: "Combien d'années le pays est-il en repos ensuite ?", choix: ["Quarante ans", "Sept ans", "Vingt ans", "Cent ans"], bonne: 0, niveau: "expert" },
      ],
    },
  ],
};
