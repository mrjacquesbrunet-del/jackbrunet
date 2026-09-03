import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 3 — Abraham (Genèse 12-22). 10 étapes. */
export const CHAPITRE_ABRAHAM: CheminChapitre = {
  id: 3,
  nom: "Abraham",
  livre: "Genèse 12-22",
  accent: "#FBBF24",
  decor: "/img/chemin/decor-3.jpg",
  sentier: [{ x: 55.5, y: 94 }, { x: 49.7, y: 85.9 }, { x: 68.6, y: 77.8 }, { x: 54.6, y: 69.7 }, { x: 68.6, y: 61.6 }, { x: 54.6, y: 53.4 }, { x: 57.7, y: 45.3 }, { x: 43.7, y: 37.2 }, { x: 57.7, y: 29.1 }, { x: 44.2, y: 21 }],
  fallback: ["#3d2a10", "#5a3f18", "#1f1408"],
  carte: {
    id: "abraham",
    nom: "Abraham",
    titre: "Le père des croyants",
    rarete: "legendaire",
    image: "/img/chemin/cartes/abraham.jpg",
  },
  etapes: [
    {
      recit:
        "L'Éternel dit à Abram : « Va-t'en de ton pays, de ta patrie et de la maison de ton père, dans le pays que je te montrerai. Je ferai de toi une grande nation, et je te bénirai. » Abram partit, comme l'Éternel le lui avait dit. Il avait soixante-quinze ans.",
      ref: "Genèse 12:1-5",
      exercices: [
        { type: "qcm", q: "Que Dieu demande-t-il à Abram ?", choix: ["De quitter son pays pour un pays qu'il lui montrera", "De bâtir un temple", "De rassembler une armée", "De rester chez son père"], bonne: 0 },
        { type: "trou", texte: "« Je ferai de toi une grande ___, et je te bénirai. »", reponse: "nation", leurres: ["ville", "armée", "maison"] },
        { type: "qcm", q: "Quel âge a Abram lorsqu'il part ?", choix: ["75 ans", "40 ans", "100 ans", "60 ans"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Abram traversa le pays jusqu'à Sichem. L'Éternel lui apparut et dit : « Je donnerai ce pays à ta postérité. » Abram bâtit là un autel à l'Éternel. Plus tard il vint habiter parmi les chênes de Mamré, à Hébron, et y bâtit encore un autel.",
      ref: "Genèse 12:6-9 · 13:18",
      exercices: [
        { type: "qcm", q: "Que fait Abram là où Dieu lui apparaît ?", choix: ["Il bâtit un autel", "Il creuse un puits", "Il plante une vigne", "Il construit une ville"], bonne: 0 },
        { type: "trou", texte: "Abram vint habiter parmi les ___ de Mamré.", reponse: "chênes", leurres: ["oliviers", "palmiers", "cèdres"], niveau: "moyen" },
        { type: "vf", q: "Dieu promet le pays à Abram lui-même, et non à sa descendance.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les troupeaux d'Abram et ceux de Lot étaient trop nombreux : leurs bergers se disputaient. Abram dit à Lot : « Qu'il n'y ait pas de querelle entre nous, car nous sommes frères. Sépare-toi de moi : si tu vas à gauche, j'irai à droite. » Lot choisit la plaine du Jourdain, bien arrosée, et dressa ses tentes jusqu'à Sodome.",
      ref: "Genèse 13:5-12",
      exercices: [
        { type: "qui", indices: ["Je suis le neveu d'Abram.", "Nos bergers se disputent parce que nos troupeaux sont trop nombreux.", "On me laisse choisir en premier.", "Je choisis la plaine du Jourdain et je m'approche de Sodome."], reponse: "Lot", leurres: ["Isaac", "Ismaël", "Éliézer"], niveau: "moyen" },
        { type: "qcm", q: "Qui laisse l'autre choisir sa part de pays ?", choix: ["Abram laisse choisir Lot", "Lot laisse choisir Abram", "Ils tirent au sort", "Un roi décide pour eux"], bonne: 0 },
        { type: "vf", q: "Abram propose la séparation pour éviter la querelle.", vrai: true },
      ],
    },
    {
      recit:
        "Comme Abram revenait de délivrer Lot, Melchisédek, roi de Salem et sacrificateur du Dieu Très-Haut, vint à sa rencontre. Il apporta du pain et du vin, et il le bénit en disant : « Béni soit Abram par le Dieu Très-Haut, maître du ciel et de la terre ! » Abram lui donna la dîme de tout.",
      ref: "Genèse 14:17-20",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qui est Melchisédek ?", choix: ["Roi de Salem et sacrificateur du Dieu Très-Haut", "Un roi de Sodome", "Le frère d'Abram", "Un prophète d'Égypte"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qu'apporte Melchisédek à Abram ?", choix: ["Du pain et du vin", "De l'or et de l'encens", "Un agneau", "Une épée"], bonne: 0, niveau: "expert" },
        { type: "trou", texte: "Abram donna à Melchisédek la ___ de tout.", reponse: "dîme", leurres: ["moitié", "part", "récolte"], niveau: "expert" },
      ],
    },
    {
      recit:
        "L'Éternel conduisit Abram dehors et dit : « Regarde vers le ciel, et compte les étoiles, si tu peux les compter. Telle sera ta postérité. » Abram eut confiance en l'Éternel, qui le lui imputa à justice.",
      ref: "Genèse 15:1-6",
      exercices: [
        { type: "verset", ref: "Genèse 15:6", texte: "Abram eut confiance en l'Éternel qui le lui imputa à justice", niveau: "expert" },
        { type: "qcm", q: "À quoi Dieu compare-t-il la descendance d'Abram ?", choix: ["Aux étoiles du ciel", "Aux vagues de la mer", "Aux arbres de la forêt", "Aux nuages"], bonne: 0 },
        { type: "vf", q: "Abram a déjà un fils au moment de cette promesse.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dieu dit encore : « Je suis le Dieu tout-puissant. Marche devant ma face et sois intègre. Tu ne t'appelleras plus Abram, mais ton nom sera Abraham, car je te rends père d'une multitude de nations. » Et Saraï fut appelée Sara.",
      ref: "Genèse 17:1-15",
      exercices: [
        { type: "qcm", q: "Que signifie le nouveau nom d'Abraham ?", choix: ["Père d'une multitude de nations", "Ami de Dieu", "Homme de la promesse", "Serviteur fidèle"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets ces moments dans l'ordre :", items: ["Dieu appelle Abram à partir", "Dieu promet une postérité nombreuse comme les étoiles", "Abram devient Abraham"] },
        { type: "qcm", q: "Quel nouveau nom Saraï reçoit-elle ?", choix: ["Sara", "Rebecca", "Rachel", "Milca"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Trois hommes se présentèrent devant la tente d'Abraham, aux chênes de Mamré. Il courut au-devant d'eux et les fit manger. L'un d'eux dit : « Je reviendrai vers toi à cette même époque, et voici, Sara ta femme aura un fils. » Sara, qui écoutait derrière la tente, rit en elle-même, car elle était âgée.",
      ref: "Genèse 18:1-15",
      exercices: [
        { type: "qcm", q: "Pourquoi Sara rit-elle ?", choix: ["Elle est bien trop âgée pour avoir un enfant", "Elle ne croit pas aux visiteurs", "Elle est heureuse d'entendre la nouvelle", "Elle se moque d'Abraham"], bonne: 0 },
        { type: "trou", texte: "« Y a-t-il rien qui soit ___ à l'Éternel ? »", reponse: "étonnant", leurres: ["défendu", "caché", "utile"], niveau: "expert" },
        { type: "vf", q: "Sara écoutait à l'entrée de la tente, derrière les visiteurs.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel se souvint de Sara comme il l'avait dit, et elle enfanta un fils à Abraham dans sa vieillesse, au temps fixé. Abraham l'appela Isaac. Sara dit : « Dieu m'a fait un sujet de rire ; quiconque l'apprendra rira de moi. »",
      ref: "Genèse 21:1-7",
      exercices: [
        { type: "qcm", q: "Comment Abraham appelle-t-il son fils ?", choix: ["Isaac", "Ismaël", "Jacob", "Éliézer"], bonne: 0 },
        { type: "qcm", q: "Que veut dire le nom d'Isaac ?", choix: ["Il rit", "Dieu entend", "Fils de la promesse", "Don de Dieu"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Quel âge a Abraham à la naissance d'Isaac ?", choix: ["Cent ans", "Soixante-quinze ans", "Quatre-vingts ans", "Cent vingt ans"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Dieu mit Abraham à l'épreuve : « Prends ton fils, ton unique, celui que tu aimes, et offre-le en holocauste sur la montagne que je te dirai. » Abraham se leva de bon matin. Comme il levait le couteau, l'ange de l'Éternel l'arrêta. Abraham vit alors un bélier retenu par les cornes dans un buisson, et l'offrit à la place de son fils.",
      ref: "Genèse 22:1-14",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets l'épreuve dans l'ordre :", items: ["Dieu demande le sacrifice d'Isaac", "Abraham part de bon matin", "L'ange arrête sa main", "Un bélier est offert à la place"] },
        { type: "qcm", q: "Qu'Abraham trouve-t-il pour remplacer son fils ?", choix: ["Un bélier retenu par les cornes", "Un agneau apporté par l'ange", "Une colombe", "Un jeune taureau"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel nom Abraham donne-t-il à ce lieu ?", choix: ["L'Éternel pourvoira", "Béthel", "Mamré", "Salem"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'ange de l'Éternel appela une seconde fois : « Parce que tu as fait cela et que tu n'as pas refusé ton fils, je te bénirai. Je multiplierai ta postérité comme les étoiles du ciel et comme le sable qui est sur le bord de la mer. Toutes les nations de la terre seront bénies en ta postérité. »",
      ref: "Genèse 22:15-18",
      exercices: [
        { type: "qcm", q: "À quoi la postérité d'Abraham est-elle comparée ici ?", choix: ["Aux étoiles du ciel et au sable de la mer", "Aux montagnes et aux fleuves", "Aux troupeaux et aux tentes", "Aux arbres du jardin"], bonne: 0 },
        { type: "trou", texte: "« Toutes les ___ de la terre seront bénies en ta postérité. »", reponse: "nations", leurres: ["familles", "villes", "tribus"], niveau: "moyen" },
        { type: "vf", q: "Cette promesse dépasse la seule famille d'Abraham : elle vise toutes les nations.", vrai: true, niveau: "moyen" },
      ],
    },
  ],
};
