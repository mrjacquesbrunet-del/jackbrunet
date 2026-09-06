import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 35 — Le sermon sur la montagne (Matthieu 5-7). 8 étapes. */
export const CHAPITRE_SERMON: CheminChapitre = {
  id: 35,
  nom: "Le sermon sur la montagne",
  livre: "Matthieu 5-7",
  accent: "#86EFAC",
  decor: "/img/chemin/decor-35.jpg",
  sentier: [{ x: 54.4, y: 94 }, { x: 46.6, y: 84.3 }, { x: 50.9, y: 74.6 }, { x: 52.5, y: 64.9 }, { x: 41.5, y: 55 }, { x: 56.9, y: 45.3 }, { x: 53.3, y: 35.6 }, { x: 59.7, y: 26 }],
  fallback: ["#12401f", "#1b5c2d", "#061c0d" ],
  carte: {
    id: "matthieu",
    nom: "Matthieu",
    titre: "Le publicain qui s'est levé",
    rarete: "epique",
    image: "/img/chemin/cartes/matthieu.jpg",
  },
  etapes: [
    {
      recit:
        "Voyant la foule, Jésus monta sur la montagne ; et, après qu'il se fut assis, ses disciples s'approchèrent de lui. Puis, ouvrant la bouche, il les enseigna : « Heureux les pauvres en esprit, car le royaume des cieux est à eux ! Heureux les affligés, car ils seront consolés ! Heureux les débonnaires, car ils hériteront la terre ! »",
      ref: "Matthieu 5:1-5",
      exercices: [
        { type: "qcm", q: "Comment appelle-t-on ces phrases en « Heureux… » ?", choix: ["Les Béatitudes", "Les Commandements", "Les Paraboles", "Les Psaumes"], bonne: 0 },
        { type: "trou", texte: "« Heureux les ___, car ils seront consolés ! »", reponse: "affligés", leurres: ["justes", "humbles", "doux"], niveau: "moyen" },
        { type: "qcm", q: "À qui appartient le royaume des cieux, selon la première béatitude ?", choix: ["Aux pauvres en esprit", "Aux justes", "Aux savants", "Aux forts"], bonne: 0 },
      ],
    },
    {
      recit:
        "« Heureux ceux qui ont faim et soif de la justice, car ils seront rassasiés ! Heureux les miséricordieux, car ils obtiendront miséricorde ! Heureux ceux qui ont le cœur pur, car ils verront Dieu ! Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu ! Heureux ceux qui sont persécutés pour la justice ! »",
      ref: "Matthieu 5:6-12",
      exercices: [
        { type: "qcm", q: "Que recevront ceux qui ont le cœur pur ?", choix: ["Ils verront Dieu", "Ils hériteront la terre", "Ils seront consolés", "Ils seront rassasiés"], bonne: 0 },
        { type: "qcm", q: "Comment seront appelés ceux qui procurent la paix ?", choix: ["Fils de Dieu", "Justes", "Bienheureux", "Serviteurs"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets ces béatitudes dans l'ordre du texte :", items: ["Heureux les pauvres en esprit", "Heureux les affligés", "Heureux ceux qui ont faim et soif de la justice", "Heureux ceux qui procurent la paix"] },
      ],
    },
    {
      recit:
        "« Vous êtes le sel de la terre. Mais si le sel perd sa saveur, avec quoi la lui rendra-t-on ? Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée ; et on n'allume pas une lampe pour la mettre sous le boisseau, mais on la met sur le chandelier, et elle éclaire tous ceux qui sont dans la maison. »",
      ref: "Matthieu 5:13-16",
      exercices: [
        { type: "verset", ref: "Matthieu 5:14", texte: "Vous êtes la lumière du monde" },
        { type: "qcm", q: "Où met-on la lampe, selon Jésus ?", choix: ["Sur le chandelier, pour éclairer toute la maison", "Sous le boisseau", "À la porte", "Dans un coffre"], bonne: 0 },
        { type: "qcm", q: "À quoi une ville sur une montagne est-elle comparée ?", choix: ["À ce qui ne peut être caché", "À une forteresse", "À un temple", "À un phare éteint"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Vous avez appris qu'il a été dit : Œil pour œil, et dent pour dent. Mais moi, je vous dis de ne pas résister au méchant. Vous avez appris qu'il a été dit : Tu aimeras ton prochain et tu haïras ton ennemi. Mais moi je vous dis : Aimez vos ennemis, bénissez ceux qui vous maudissent, et priez pour ceux qui vous persécutent. »",
      ref: "Matthieu 5:38-45",
      exercices: [
        { type: "verset", ref: "Matthieu 5:44", texte: "Aimez vos ennemis et priez pour ceux qui vous persécutent" },
        { type: "qcm", q: "Quelle formule Jésus répète-t-il dans ce passage ?", choix: ["« Vous avez appris… mais moi je vous dis »", "« En vérité, en vérité »", "« Il est écrit »", "« Que celui qui a des oreilles entende »"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Pourquoi aimer ses ennemis, selon le texte ?", choix: ["Pour être fils du Père qui fait lever son soleil sur tous", "Pour être récompensé sur terre", "Pour éviter les procès", "Pour être admiré"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Quand tu fais l'aumône, que ta main gauche ne sache pas ce que fait ta droite. Quand tu pries, entre dans ta chambre, ferme ta porte, et prie ton Père qui est là dans le lieu secret ; et ton Père, qui voit dans le secret, te le rendra. Ne multipliez pas de vaines paroles : votre Père sait de quoi vous avez besoin avant que vous le lui demandiez. »",
      ref: "Matthieu 6:1-8",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Comment faut-il faire l'aumône ?", choix: ["Sans que la main gauche sache ce que fait la droite", "Devant l'assemblée", "Au son de la trompette", "Une fois par an"], bonne: 0 },
        { type: "qcm", q: "Que dit Jésus des longues prières ?", choix: ["Le Père sait déjà ce dont on a besoin", "Il faut prier trois heures", "Il faut prier en public", "Il faut répéter les mots"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jésus recommande de prier pour être vu des hommes.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Voici donc comment vous devez prier : Notre Père qui es aux cieux ! Que ton nom soit sanctifié ; que ton règne vienne ; que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd'hui notre pain quotidien ; pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés. »",
      ref: "Matthieu 6:9-13",
      exercices: [
        { type: "verset", ref: "Matthieu 6:10", texte: "Que ta volonté soit faite sur la terre comme au ciel" },
        { type: "ordre", consigne: "Remets les demandes du Notre Père dans l'ordre :", items: ["Que ton nom soit sanctifié", "Que ton règne vienne", "Donne-nous notre pain quotidien", "Pardonne-nous nos offenses"] },
        { type: "qcm", q: "À quelle condition le pardon est-il lié dans cette prière ?", choix: ["Au pardon que nous accordons aux autres", "Au nombre de prières", "Aux offrandes données", "Au jeûne"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Ne vous inquiétez pas pour votre vie. Regardez les oiseaux du ciel : ils ne sèment ni ne moissonnent, et votre Père céleste les nourrit. Ne valez-vous pas beaucoup plus qu'eux ? Considérez comment croissent les lis des champs : Salomon même, dans toute sa gloire, n'a pas été vêtu comme l'un d'eux. Cherchez premièrement le royaume et la justice de Dieu, et toutes ces choses vous seront données par-dessus. »",
      ref: "Matthieu 6:25-34",
      exercices: [
        { type: "verset", ref: "Matthieu 6:33", texte: "Cherchez premièrement le royaume et la justice de Dieu" },
        { type: "qcm", q: "À quoi Jésus compare-t-il notre souci du lendemain ?", choix: ["Aux oiseaux nourris et aux lis vêtus", "Aux fourmis", "Aux étoiles", "Aux moissonneurs"], bonne: 0 },
        { type: "qcm", q: "Quel roi est cité pour sa gloire ?", choix: ["Salomon", "David", "Hérode", "Ézéchias"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Ce n'est pas celui qui me dit : Seigneur, Seigneur ! qui entrera dans le royaume, mais celui qui fait la volonté de mon Père. Quiconque entend ces paroles et les met en pratique sera semblable à un homme prudent qui a bâti sa maison sur le roc : la pluie est tombée, les torrents sont venus, les vents ont soufflé, et la maison n'est point tombée, car elle était fondée sur le roc. »",
      ref: "Matthieu 7:21-27",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Sur quoi l'homme prudent bâtit-il sa maison ?", choix: ["Sur le roc", "Sur le sable", "Sur la colline", "Sur des pierres taillées"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce qui distingue les deux bâtisseurs ?", choix: ["Mettre en pratique les paroles entendues", "La taille de la maison", "Le prix des matériaux", "Le temps de construction"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qui entrera dans le royaume, selon Jésus ?", choix: ["Celui qui fait la volonté du Père", "Celui qui dit « Seigneur, Seigneur »", "Celui qui prophétise", "Celui qui chasse les démons"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
