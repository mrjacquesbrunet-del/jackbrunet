import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 2 — Noé (Genèse 6-9). 8 étapes. */
export const CHAPITRE_NOE: CheminChapitre = {
  id: 2,
  nom: "Noé",
  livre: "Genèse 6-9",
  accent: "#38BDF8",
  decor: "/img/chemin/decor-2.jpg",
  fallback: ["#0c2f4a", "#123a5c", "#081f33"],
  carte: {
    id: "noe",
    nom: "Noé",
    titre: "Le bâtisseur de l'arche",
    rarete: "legendaire",
    image: "/img/chemin/cartes/noe.jpg",
  },
  etapes: [
    {
      recit:
        "La terre était corrompue et remplie de violence. Mais Noé trouva grâce aux yeux de l'Éternel : c'était un homme juste et intègre, qui marchait avec Dieu.",
      ref: "Genèse 6:5-9",
      exercices: [
        { type: "qcm", q: "Pourquoi Noé est-il épargné ?", choix: ["Il trouva grâce aux yeux de l'Éternel", "Il était le plus fort", "Il était riche", "Il savait naviguer"], bonne: 0 },
        { type: "trou", texte: "Noé était un homme juste et intègre : il ___ avec Dieu.", reponse: "marchait", leurres: ["parlait", "chantait", "courait"] },
        { type: "vf", q: "À l'époque de Noé, la terre était remplie de violence.", vrai: true },
      ],
    },
    {
      recit:
        "Dieu dit à Noé : « Fais-toi une arche de bois de gopher. » Trois cents coudées de long, cinquante de large, trente de haut ; trois étages, une porte sur le côté. Noé fit tout ce que Dieu lui avait ordonné.",
      ref: "Genèse 6:14-22",
      exercices: [
        { type: "qcm", q: "En quel bois l'arche est-elle construite ?", choix: ["Bois de gopher", "Cèdre du Liban", "Olivier", "Acacia"], bonne: 0 },
        { type: "vf", q: "L'arche mesurait trois cents coudées de longueur.", vrai: true },
        { type: "trou", texte: "Noé fit tout ce que Dieu lui avait ___.", reponse: "ordonné", leurres: ["montré", "caché", "promis"] },
      ],
    },
    {
      recit:
        "Les animaux vinrent vers Noé : deux par deux, mâle et femelle — et sept paires des animaux purs et des oiseaux. Noé, sa femme, ses trois fils et leurs femmes entrèrent dans l'arche, et l'Éternel ferma la porte sur lui.",
      ref: "Genèse 7:1-16",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qui ferme la porte de l'arche ?", choix: ["L'Éternel lui-même", "Noé", "Sem", "Un ange"], bonne: 0 },
        { type: "trou", texte: "Les animaux entrèrent ___ par deux vers Noé.", reponse: "deux", leurres: ["dix", "trois", "sept"] },
        { type: "vf", q: "Huit personnes entrèrent dans l'arche.", vrai: true },
      ],
    },
    {
      recit:
        "Les écluses des cieux s'ouvrirent : la pluie tomba quarante jours et quarante nuits. Les eaux grossirent et couvrirent même les hautes montagnes. Mais Dieu se souvint de Noé : les eaux dominèrent la terre cent cinquante jours, puis commencèrent à baisser.",
      ref: "Genèse 7:17-8:3",
      exercices: [
        { type: "qcm", q: "Combien de temps la pluie tomba-t-elle ?", choix: ["40 jours et 40 nuits", "7 jours", "100 jours", "1 an exactement"], bonne: 0 },
        { type: "vf", q: "Pendant le déluge, Dieu oublia Noé.", vrai: false },
        { type: "ordre", consigne: "Remets le déluge dans l'ordre :", items: ["La pluie tombe 40 jours", "Les eaux couvrent les montagnes", "Les eaux baissent"] },
      ],
    },
    {
      recit:
        "L'arche s'arrêta sur les montagnes d'Ararat. Noé lâcha un corbeau, puis une colombe : elle revint d'abord sans rien, puis rapporta une feuille d'olivier toute fraîche — la terre renaissait. La troisième fois, elle ne revint plus.",
      ref: "Genèse 8:4-12",
      exercices: [
        { type: "qcm", q: "Que rapporte la colombe à Noé ?", choix: ["Une feuille d'olivier", "Une branche de figuier", "Un rameau de vigne", "Un brin d'herbe"], bonne: 0 },
        { type: "trou", texte: "L'arche s'arrêta sur les montagnes d'___.", reponse: "Ararat", leurres: ["Horeb", "Sion", "Carmel"] },
        { type: "vf", q: "Le premier oiseau lâché par Noé est la colombe.", vrai: false },
      ],
    },
    {
      recit:
        "Dieu dit : « Sors de l'arche ! » Noé sortit avec les siens et tous les animaux. Il bâtit un autel à l'Éternel et offrit un sacrifice. L'Éternel dit en son cœur : « Tant que la terre subsistera, les semailles et la moisson, le froid et la chaleur, l'été et l'hiver, le jour et la nuit ne cesseront point. »",
      ref: "Genèse 8:15-22",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que fait Noé en premier en sortant de l'arche ?", choix: ["Il bâtit un autel et offre un sacrifice", "Il plante une vigne", "Il construit une maison", "Il compte les animaux"], bonne: 0 },
        { type: "trou", texte: "« Tant que la terre subsistera, les semailles et la ___… ne cesseront point. »", reponse: "moisson", leurres: ["pluie", "tempête", "famine"] },
        { type: "vf", q: "Dieu promet que le rythme des saisons ne cessera pas.", vrai: true },
      ],
    },
    {
      recit:
        "Dieu établit son alliance avec Noé et toute la création : « Je mets mon arc dans la nue : il sera le signe de l'alliance entre moi et la terre. Les eaux ne deviendront plus un déluge pour détruire toute chair. »",
      ref: "Genèse 9:8-17",
      exercices: [
        { type: "qcm", q: "Quel est le signe de l'alliance avec Noé ?", choix: ["L'arc-en-ciel", "Une colonne de feu", "Une étoile", "Le sel"], bonne: 0 },
        { type: "vf", q: "Dieu promet de ne plus détruire toute chair par un déluge.", vrai: true },
        { type: "trou", texte: "« Je mets mon ___ dans la nue : il sera le signe de l'alliance. »", reponse: "arc", leurres: ["nom", "trône", "feu"] },
      ],
    },
    {
      recit:
        "L'histoire de Noé nous apprend qu'un seul homme qui marche avec Dieu peut changer le cours du monde. Dieu voit, Dieu avertit, Dieu sauve — et ses promesses tiennent encore aujourd'hui, chaque fois qu'un arc-en-ciel traverse le ciel.",
      ref: "Genèse 6-9",
      exercices: [
        { type: "ordre", consigne: "Remets l'histoire de Noé dans l'ordre :", items: ["La construction de l'arche", "Le déluge", "La colombe et l'olivier", "L'alliance de l'arc-en-ciel"] },
        { type: "qcm", q: "Combien de fils Noé avait-il ?", choix: ["Trois : Sem, Cham et Japhet", "Deux : Caïn et Abel", "Quatre", "Un seul"], bonne: 0 },
        { type: "vf", q: "Noé marchait avec Dieu.", vrai: true },
      ],
    },
  ],
};
