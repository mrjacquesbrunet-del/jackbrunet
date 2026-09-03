import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 44 — La croix (Matthieu 26-27, Luc 23, Jean 19). 8 étapes. */
export const CHAPITRE_CROIX: CheminChapitre = {
  id: 44,
  nom: "La croix",
  livre: "Luc 22-23, Jean 19",
  accent: "#B91C1C",
  decor: "/img/chemin/decor-44.jpg",
  sentier: [{ x: 63.4, y: 94 }, { x: 58.5, y: 84.3 }, { x: 61.7, y: 74.6 }, { x: 49.9, y: 64.9 }, { x: 59.5, y: 55 }, { x: 45, y: 45.3 }, { x: 60.9, y: 35.6 }, { x: 41.5, y: 26 }],
  fallback: ["#3d0c0c", "#581414", "#1a0404"],
  carte: {
    id: "simon-cyrene",
    nom: "Simon de Cyrène",
    titre: "Celui qui a porté le bois",
    rarete: "epique",
    image: "/img/chemin/cartes/simon-cyrene.jpg",
  },
  etapes: [
    {
      recit:
        "Pierre suivait de loin. Assis dans la cour du souverain sacrificateur, une servante lui dit : « Toi aussi, tu étais avec Jésus. » Il le nia : « Je ne sais ce que tu veux dire. » Une autre le dit encore, et il le nia avec serment. Peu après, ceux qui étaient là dirent : « Ton langage te fait reconnaître. » Il se mit à faire des imprécations : « Je ne connais pas cet homme. » Aussitôt le coq chanta.",
      ref: "Matthieu 26:69-74",
      exercices: [
        { type: "qcm", q: "Combien de fois Pierre renie-t-il Jésus ?", choix: ["Trois fois", "Une fois", "Deux fois", "Sept fois"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce qui le trahit la troisième fois ?", choix: ["Son langage, son accent de Galilée", "Son vêtement", "Un témoin", "Sa peur"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel signe suit immédiatement ?", choix: ["Le chant du coq", "Un tremblement de terre", "Le lever du soleil", "Le silence"], bonne: 0 },
      ],
    },
    {
      recit:
        "Pierre se souvint de la parole que Jésus avait dite : « Avant que le coq chante, tu me renieras trois fois. » Et, étant sorti, il pleura amèrement.",
      ref: "Matthieu 26:75",
      exercices: [
        { type: "qcm", q: "Que fait Pierre après le chant du coq ?", choix: ["Il sort et pleure amèrement", "Il s'enfuit du pays", "Il retourne pêcher", "Il entre au tribunal"], bonne: 0 },
        { type: "vf", q: "Luc précise que le Seigneur, à cet instant, s'est tourné et l'a regardé.", vrai: true, ref: "Luc 22:61", niveau: "expert" },
        { type: "vf", q: "Ce reniement met un terme définitif à la place de Pierre.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "On conduisit Jésus devant Pilate. « Es-tu le roi des Juifs ? » — « Tu le dis. » Pilate dit aux principaux sacrificateurs et à la foule : « Je ne trouve rien de coupable en cet homme. » Il l'envoya à Hérode, qui le renvoya. Pilate leur dit : « Vous m'avez amené cet homme comme excitant le peuple à la révolte ; je ne l'ai trouvé coupable d'aucune des choses dont vous l'accusez. »",
      ref: "Luc 23:1-15",
      exercices: [
        { type: "qcm", q: "Quel est le verdict répété de Pilate ?", choix: ["Il ne trouve rien de coupable en lui", "Il le condamne aussitôt", "Il le renvoie libre", "Il refuse de juger"], bonne: 0 },
        { type: "qcm", q: "À qui Pilate envoie-t-il Jésus au milieu du procès ?", choix: ["À Hérode", "Au sanhédrin", "À Caïphe", "À César"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le procès est mené la nuit et au matin, en plusieurs étapes.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À chaque fête, Pilate relâchait un prisonnier. « Lequel voulez-vous que je vous relâche : Barabbas, ou Jésus qu'on appelle Christ ? » Ils crièrent : « Barabbas ! » — « Que ferai-je donc de Jésus ? » — « Qu'il soit crucifié ! » — « Mais quel mal a-t-il fait ? » Ils criaient encore plus fort. Pilate prit de l'eau, se lava les mains devant la foule et le livra pour être crucifié.",
      ref: "Matthieu 27:15-26",
      exercices: [
        { type: "qcm", q: "Qui la foule demande-t-elle à voir relâché ?", choix: ["Barabbas", "Jean-Baptiste", "Simon", "Judas"], bonne: 0 },
        { type: "qcm", q: "Que fait Pilate devant la foule ?", choix: ["Il se lave les mains", "Il déchire ses vêtements", "Il quitte la ville", "Il fait taire la foule"], bonne: 0 },
        { type: "vf", q: "Pilate a condamné un homme qu'il jugeait innocent.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comme ils l'emmenaient, ils prirent un certain Simon de Cyrène, qui revenait des champs, et ils le chargèrent de la croix pour qu'il la porte derrière Jésus. Il était suivi d'une grande multitude et de femmes qui se frappaient la poitrine et se lamentaient sur lui.",
      ref: "Luc 23:26-27",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Je viens d'Afrique, de Cyrène.", "Je revenais simplement des champs.", "On me force à porter un bois qui n'est pas le mien.", "Mes fils seront connus dans l'Église."], reponse: "Simon de Cyrène", leurres: ["Joseph d'Arimathée", "Nicodème", "Barabbas"] },
        { type: "qcm", q: "D'où revenait Simon quand on l'a réquisitionné ?", choix: ["Des champs", "Du temple", "Du marché", "De Galilée"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que dit Jésus aux femmes qui se lamentent ?", choix: ["« Ne pleurez pas sur moi, pleurez sur vous et sur vos enfants »", "« Rentrez chez vous »", "« Priez pour moi »", "Il ne dit rien"], bonne: 0, ref: "Luc 23:28", niveau: "expert" },
      ],
    },
    {
      recit:
        "Lorsqu'ils furent arrivés au lieu appelé Crâne, ils le crucifièrent là, ainsi que deux malfaiteurs, l'un à droite, l'autre à gauche. Jésus dit : « Père, pardonne-leur, car ils ne savent ce qu'ils font. » Ils se partagèrent ses vêtements en tirant au sort.",
      ref: "Luc 23:33-34",
      exercices: [
        { type: "verset", ref: "Luc 23:34", texte: "Père pardonne-leur car ils ne savent ce qu'ils font" },
        { type: "qcm", q: "Comment s'appelle le lieu ?", choix: ["Le Crâne, ou Golgotha", "Gethsémané", "Siloé", "Béthesda"], bonne: 0 },
        { type: "vf", q: "Le partage des vêtements par le sort avait été annoncé dans le psaume 22.", vrai: true, ref: "Psaumes 22:18", niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'un des malfaiteurs l'injuriait ; l'autre le reprenait : « Pour nous, c'est justice, mais celui-ci n'a rien fait de mal. » Puis il dit : « Jésus, souviens-toi de moi quand tu viendras dans ton règne. » Jésus lui répondit : « Je te le dis en vérité, aujourd'hui tu seras avec moi dans le paradis. »",
      ref: "Luc 23:39-43",
      exercices: [
        { type: "verset", ref: "Luc 23:43", texte: "Aujourd'hui tu seras avec moi dans le paradis" },
        { type: "qcm", q: "Que demande le second malfaiteur ?", choix: ["« Souviens-toi de moi quand tu viendras dans ton règne »", "« Descends de la croix »", "« Sauve-nous tous »", "« Prie pour moi »"], bonne: 0 },
        { type: "qcm", q: "Que reconnaît cet homme au sujet de Jésus ?", choix: ["Qu'il n'a rien fait de mal", "Qu'il est un prophète", "Qu'il est innocent des vols", "Rien"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Depuis la sixième heure jusqu'à la neuvième, il y eut des ténèbres sur toute la terre. Jésus dit : « Tout est accompli. » Puis, criant d'une voix forte : « Père, je remets mon esprit entre tes mains », il rendit l'esprit. Le voile du temple se déchira en deux, depuis le haut jusqu'en bas. Le centenier, voyant ce qui était arrivé, glorifia Dieu : « Certainement, cet homme était juste. » Joseph d'Arimathée obtint le corps et le déposa dans un sépulcre neuf taillé dans le roc.",
      ref: "Luc 23:44-53",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Jean 19:30", texte: "Tout est accompli" },
        { type: "qcm", q: "Qu'arrive-t-il au voile du temple ?", choix: ["Il se déchire en deux, du haut en bas", "Il prend feu", "Il est enlevé", "Rien"], bonne: 0 },
        { type: "ordre", consigne: "Remets ce jour dans l'ordre :", items: ["Pierre renie et le coq chante", "Pilate se lave les mains", "Simon de Cyrène porte le bois", "« Tout est accompli »"] },
      ],
    },
  ],
};
