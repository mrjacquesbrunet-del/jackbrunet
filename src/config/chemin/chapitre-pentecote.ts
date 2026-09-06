import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 46 — L'ascension et la Pentecôte (Actes 1-2). 8 étapes. */
export const CHAPITRE_PENTECOTE: CheminChapitre = {
  id: 46,
  nom: "La Pentecôte",
  livre: "Actes 1-2",
  accent: "#FB7185",
  decor: "/img/chemin/decor-46.jpg",
  sentier: [{ x: 47.4, y: 94 }, { x: 50.6, y: 84.3 }, { x: 65.8, y: 74.6 }, { x: 43.2, y: 64.9 }, { x: 59.4, y: 55 }, { x: 47.4, y: 45.3 }, { x: 63.6, y: 35.6 }, { x: 49, y: 26 }],
  fallback: ["#4a1523", "#6b2034", "#220a10"],
  carte: {
    id: "pierre",
    nom: "Pierre",
    titre: "Celui qui s'est relevé",
    rarete: "legendaire",
    image: "/img/chemin/cartes/pierre.jpg",
  },
  etapes: [
    {
      recit:
        "Pendant quarante jours après sa passion, Jésus se montra vivant à ses apôtres par plusieurs preuves, et leur parla du royaume de Dieu. Il leur recommanda de ne pas s'éloigner de Jérusalem, mais d'attendre ce que le Père avait promis : « Jean a baptisé d'eau, mais vous, dans peu de jours, vous serez baptisés du Saint-Esprit. »",
      ref: "Actes 1:1-5",
      exercices: [
        { type: "qcm", q: "Combien de jours Jésus se montre-t-il vivant après sa passion ?", choix: ["Quarante", "Trois", "Sept", "Cinquante"], bonne: 0 },
        { type: "qcm", q: "Que doivent faire les apôtres à Jérusalem ?", choix: ["Attendre la promesse du Père", "Bâtir une église", "Partir aussitôt en mission", "Choisir un roi"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le baptême promis est celui du Saint-Esprit.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils lui demandèrent : « Seigneur, est-ce en ce temps que tu rétabliras le royaume d'Israël ? » Il leur répondit : « Ce n'est pas à vous de connaître les temps ou les moments. Mais vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins à Jérusalem, dans toute la Judée, dans la Samarie, et jusqu'aux extrémités de la terre. » Après avoir dit cela, il fut élevé pendant qu'ils le regardaient, et une nuée le déroba à leurs yeux.",
      ref: "Actes 1:6-9",
      exercices: [
        { type: "verset", ref: "Actes 1:8", texte: "Vous serez mes témoins jusqu'aux extrémités de la terre" },
        { type: "ordre", consigne: "Remets les cercles du témoignage dans l'ordre du verset :", items: ["Jérusalem", "Toute la Judée", "La Samarie", "Jusqu'aux extrémités de la terre"] },
        { type: "qcm", q: "Que répond Jésus à la question sur les temps ?", choix: ["Ce n'est pas à eux de les connaître", "Ce sera dans sept ans", "Jamais", "Il donne une date"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comme ils avaient les regards fixés vers le ciel pendant qu'il s'en allait, deux hommes vêtus de blanc leur apparurent : « Hommes Galiléens, pourquoi vous arrêtez-vous à regarder au ciel ? Ce Jésus, qui a été enlevé au ciel du milieu de vous, viendra de la même manière que vous l'avez vu allant au ciel. »",
      ref: "Actes 1:10-11",
      exercices: [
        { type: "qcm", q: "Que disent les deux hommes vêtus de blanc ?", choix: ["Que Jésus reviendra de la même manière", "Qu'il ne reviendra pas", "De rentrer chez eux", "De bâtir un temple"], bonne: 0 },
        { type: "qcm", q: "Que faisaient les apôtres à ce moment ?", choix: ["Ils regardaient le ciel", "Ils priaient à genoux", "Ils redescendaient déjà", "Ils dormaient"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "L'ascension a lieu depuis le mont des Oliviers.", vrai: true, ref: "Actes 1:12", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils montèrent dans la chambre haute et persévéraient tous d'un commun accord dans la prière, avec les femmes, Marie mère de Jésus, et les frères de Jésus. Ils étaient environ cent vingt. Pierre proposa de remplacer Judas ; le sort tomba sur Matthias, qui fut associé aux onze apôtres.",
      ref: "Actes 1:12-26",
      exercices: [
        { type: "qcm", q: "Combien de personnes environ étaient réunies ?", choix: ["Cent vingt", "Douze", "Trois mille", "Cinq cents"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qui est choisi pour remplacer Judas ?", choix: ["Matthias", "Barnabas", "Étienne", "Marc"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que faisaient-ils tous ensemble en attendant ?", choix: ["Ils persévéraient dans la prière", "Ils prêchaient déjà", "Ils se cachaient sans rien faire", "Ils partageaient leurs biens"], bonne: 0 },
      ],
    },
    {
      recit:
        "Le jour de la Pentecôte, ils étaient tous ensemble dans le même lieu. Tout à coup il vint du ciel un bruit comme celui d'un vent impétueux, et il remplit toute la maison. Des langues semblables à des langues de feu leur apparurent, séparées les unes des autres, et se posèrent sur chacun d'eux. Et ils furent tous remplis du Saint-Esprit, et se mirent à parler en d'autres langues.",
      ref: "Actes 2:1-4",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quels deux signes accompagnent la Pentecôte ?", choix: ["Un vent impétueux et des langues de feu", "Un tremblement de terre et une nuée", "Une colombe et une voix", "Un éclair et une pluie"], bonne: 0 },
        { type: "qcm", q: "Sur qui se posent les langues de feu ?", choix: ["Sur chacun d'eux", "Sur Pierre seulement", "Sur les douze seuls", "Sur la maison"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quelle fête juive est-ce ?", choix: ["La Pentecôte, cinquante jours après la Pâque", "Les Tentes", "La Dédicace", "Le Grand Pardon"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Il y avait à Jérusalem des Juifs de toutes les nations qui sont sous le ciel. La multitude fut confondue, parce que chacun les entendait parler dans sa propre langue. « Ces gens qui parlent ne sont-ils pas tous Galiléens ? Comment les entendons-nous chacun dans la langue où nous sommes nés ? » D'autres se moquaient : « Ils sont pleins de vin doux. »",
      ref: "Actes 2:5-13",
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui confond la foule ?", choix: ["Chacun les entend dans sa propre langue", "Le bruit du vent", "Le feu sur la maison", "Le nombre des disciples"], bonne: 0 },
        { type: "qcm", q: "Que disent ceux qui se moquent ?", choix: ["« Ils sont pleins de vin doux »", "« Ce sont des sorciers »", "« Ce sont des étrangers »", "« Ils mentent »"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Ce jour-là, la barrière des langues est renversée, à l'inverse de Babel.", vrai: true, ref: "Genèse 11:7", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Alors Pierre, se présentant avec les onze, éleva la voix : « Hommes d'Israël, écoutez ces paroles ! Ce Jésus, Dieu l'a ressuscité ; nous en sommes tous témoins. Qu'il sache donc avec certitude, toute la maison d'Israël, que Dieu a fait Seigneur et Christ ce Jésus que vous avez crucifié. »",
      ref: "Actes 2:14-36",
      exercices: [
        { type: "qui", indices: ["J'ai renié mon Maître trois fois dans une cour.", "Il m'a demandé trois fois si je l'aimais.", "Le jour de la Pentecôte, je parle devant toute la ville.", "Trois mille personnes croient ce jour-là."], reponse: "Pierre", leurres: ["Jean", "Étienne", "Matthias"] },
        { type: "qcm", q: "Que proclame Pierre au sujet de Jésus ?", choix: ["Que Dieu l'a fait Seigneur et Christ", "Qu'il reviendra demain", "Qu'il était un prophète seulement", "Qu'il faut le venger"], bonne: 0 },
        { type: "vf", q: "C'est le même Pierre qui, quelques semaines plus tôt, avait renié Jésus.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ayant entendu ce discours, ils eurent le cœur vivement touché : « Hommes frères, que ferons-nous ? » — « Repentez-vous, et que chacun de vous soit baptisé au nom de Jésus-Christ, pour le pardon de vos péchés ; et vous recevrez le don du Saint-Esprit. » Ceux qui acceptèrent sa parole furent baptisés ; environ trois mille âmes furent ajoutées ce jour-là. Ils persévéraient dans l'enseignement des apôtres, dans la communion fraternelle, dans la fraction du pain et dans les prières.",
      ref: "Actes 2:37-42",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Combien de personnes sont ajoutées ce jour-là ?", choix: ["Environ trois mille", "Cent vingt", "Cinq cents", "Douze"], bonne: 0 },
        { type: "ordre", consigne: "Remets les quatre choses auxquelles ils persévéraient :", items: ["L'enseignement des apôtres", "La communion fraternelle", "La fraction du pain", "Les prières"] },
        { type: "qcm", q: "Que répond Pierre à « que ferons-nous ? »", choix: ["« Repentez-vous et soyez baptisés »", "« Attendez encore »", "« Retournez au temple »", "« Suivez la loi »"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
