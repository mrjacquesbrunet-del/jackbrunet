import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 40 — Les rencontres (Jean 3, 4, 8 ; Luc 7, 19). 8 étapes. */
export const CHAPITRE_RENCONTRES: CheminChapitre = {
  id: 40,
  nom: "Les rencontres",
  livre: "Jean 3-8, Luc 19",
  accent: "#F0ABFC",
  decor: "/img/chemin/decor-40.jpg",
  sentier: [{ x: 61.3, y: 94 }, { x: 64.1, y: 84.3 }, { x: 55.8, y: 74.6 }, { x: 35.9, y: 64.9 }, { x: 47.4, y: 55 }, { x: 31.5, y: 45.3 }, { x: 52.7, y: 35.6 }, { x: 52.2, y: 26 }],
  fallback: ["#3f1046", "#5a1865", "#1b0720"],
  carte: {
    id: "samaritaine",
    nom: "La Samaritaine",
    titre: "Elle a laissé sa cruche",
    rarete: "epique",
    image: "/img/chemin/cartes/samaritaine.jpg",
  },
  etapes: [
    {
      recit:
        "Il y avait un pharisien nommé Nicodème, chef des Juifs, qui vint de nuit trouver Jésus : « Rabbi, nous savons que tu es un docteur venu de Dieu. » Jésus répondit : « En vérité, je te le dis, si un homme ne naît de nouveau, il ne peut voir le royaume de Dieu. » — « Comment un homme peut-il naître quand il est vieux ? »",
      ref: "Jean 3:1-4",
      exercices: [
        { type: "qcm", q: "À quel moment Nicodème vient-il ?", choix: ["De nuit", "Au matin", "Le jour du sabbat", "Pendant une fête"], bonne: 0 },
        { type: "qcm", q: "Que faut-il pour voir le royaume de Dieu ?", choix: ["Naître de nouveau", "Connaître la loi", "Offrir un sacrifice", "Être de la maison de David"], bonne: 0 },
        { type: "qcm", q: "Quelle était la position de Nicodème ?", choix: ["Pharisien et chef des Juifs", "Publicain", "Soldat romain", "Berger"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle. Dieu, en effet, n'a pas envoyé son Fils dans le monde pour qu'il juge le monde, mais pour que le monde soit sauvé par lui. »",
      ref: "Jean 3:16-17",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Jean 3:16", texte: "Dieu a tant aimé le monde qu'il a donné son Fils unique" },
        { type: "qcm", q: "Pourquoi le Fils a-t-il été envoyé, selon le verset 17 ?", choix: ["Pour que le monde soit sauvé par lui", "Pour juger le monde", "Pour rassembler Israël seulement", "Pour bâtir un temple"], bonne: 0 },
        { type: "vf", q: "Ce verset est prononcé au cours d'une conversation de nuit.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus, fatigué du voyage, était assis au bord du puits de Jacob, en Samarie. Il était environ la sixième heure. Une femme de Samarie vint puiser de l'eau. « Donne-moi à boire. » Elle lui dit : « Comment toi, qui es Juif, me demandes-tu à boire, à moi qui suis une femme samaritaine ? » — les Juifs n'ayant pas de relations avec les Samaritains.",
      ref: "Jean 4:5-9",
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui étonne la femme ?", choix: ["Qu'un Juif parle à une Samaritaine", "Qu'il soit seul", "Qu'il ait soif", "Qu'il connaisse son nom"], bonne: 0 },
        { type: "qcm", q: "Près de quel puits la scène se passe-t-elle ?", choix: ["Le puits de Jacob", "Le puits de Beer-Schéba", "La piscine de Siloé", "La source de Gihon"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "À quelle heure Jésus est-il assis là ?", choix: ["Environ la sixième heure, en plein midi", "À l'aube", "Au coucher du soleil", "À minuit"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "« Quiconque boit de cette eau aura encore soif ; mais celui qui boira de l'eau que je lui donnerai n'aura jamais soif : elle deviendra en lui une source d'eau qui jaillit jusque dans la vie éternelle. » Puis il lui parla de sa vie comme s'il l'avait toujours connue. Elle laissa sa cruche, s'en alla dans la ville et dit aux gens : « Venez voir un homme qui m'a dit tout ce que j'ai fait. »",
      ref: "Jean 4:13-29",
      exercices: [
        { type: "qui", indices: ["Je viens puiser de l'eau en plein midi, quand il n'y a personne.", "Un Juif me parle, ce qui ne se fait pas.", "Il me dit tout ce que j'ai fait.", "Je laisse ma cruche et je cours le dire à la ville."], reponse: "La Samaritaine", leurres: ["Marthe", "Marie de Béthanie", "Marie-Madeleine"] },
        { type: "qcm", q: "Que devient l'eau que Jésus donne ?", choix: ["Une source qui jaillit jusque dans la vie éternelle", "Un fleuve dans le désert", "Un puits dans la ville", "Une pluie sur les champs"], bonne: 0 },
        { type: "qcm", q: "Que laisse-t-elle derrière elle en partant ?", choix: ["Sa cruche", "Son manteau", "Ses sandales", "Son argent"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les scribes et les pharisiens amenèrent une femme surprise en adultère : « Moïse nous a ordonné de lapider de telles femmes ; et toi, que dis-tu ? » Ils parlaient ainsi pour l'éprouver. Jésus se baissa et écrivait avec le doigt sur la terre. Comme ils continuaient à l'interroger, il se releva : « Que celui de vous qui est sans péché jette le premier la pierre contre elle. »",
      ref: "Jean 8:3-7",
      exercices: [
        { type: "verset", ref: "Jean 8:7", texte: "Que celui de vous qui est sans péché jette le premier la pierre" },
        { type: "qcm", q: "Pourquoi lui amènent-ils cette femme ?", choix: ["Pour l'éprouver et pouvoir l'accuser", "Pour qu'il la guérisse", "Pour lui demander conseil", "Pour la lui confier"], bonne: 0 },
        { type: "qcm", q: "Que fait Jésus avant de répondre ?", choix: ["Il se baisse et écrit sur la terre", "Il prie tout haut", "Il s'en va", "Il appelle ses disciples"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils se retirèrent un à un, en commençant par les plus âgés. Jésus resta seul avec la femme. Il se releva : « Femme, où sont ceux qui t'accusaient ? Personne ne t'a-t-il condamnée ? » — « Non, Seigneur. » — « Je ne te condamne pas non plus : va, et ne pèche plus. »",
      ref: "Jean 8:9-11",
      exercices: [
        { type: "qcm", q: "Dans quel ordre les accusateurs s'en vont-ils ?", choix: ["Un à un, en commençant par les plus âgés", "Tous ensemble", "Les jeunes d'abord", "Ils restent"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que dit Jésus à la femme ?", choix: ["« Je ne te condamne pas non plus : va, et ne pèche plus »", "« Retourne chez toi »", "« Tu es pardonnée, tout va bien »", "« Va au temple »"], bonne: 0 },
        { type: "vf", q: "Jésus lui dit à la fois qu'il ne la condamne pas et de ne plus pécher.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus entra dans Jéricho. Un homme riche nommé Zachée, chef des publicains, cherchait à voir qui était Jésus ; mais il ne le pouvait pas à cause de la foule, car il était de petite taille. Il courut en avant et monta sur un sycomore pour le voir. Jésus, arrivé à cet endroit, leva les yeux : « Zachée, hâte-toi de descendre ; car il faut que je demeure aujourd'hui dans ta maison. »",
      ref: "Luc 19:1-6",
      exercices: [
        { type: "qcm", q: "Pourquoi Zachée monte-t-il dans un arbre ?", choix: ["Il est de petite taille et la foule l'empêche de voir", "Pour se cacher", "Pour cueillir des fruits", "Pour appeler Jésus"], bonne: 0 },
        { type: "qcm", q: "Quel arbre est nommé ?", choix: ["Un sycomore", "Un figuier", "Un olivier", "Un palmier"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel était le métier de Zachée ?", choix: ["Chef des publicains", "Pharisien", "Marchand de tissus", "Berger"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Tous murmuraient : « Il est allé loger chez un homme pécheur. » Mais Zachée se tint devant le Seigneur : « Voici, Seigneur, je donne aux pauvres la moitié de mes biens ; et si j'ai fait tort de quelque chose à quelqu'un, je lui rends le quadruple. » Jésus lui dit : « Le salut est entré aujourd'hui dans cette maison. Car le Fils de l'homme est venu chercher et sauver ce qui était perdu. »",
      ref: "Luc 19:7-10",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Luc 19:10", texte: "Le Fils de l'homme est venu chercher et sauver ce qui était perdu" },
        { type: "qcm", q: "Que décide Zachée ?", choix: ["Donner la moitié aux pauvres et rendre le quadruple", "Quitter son métier seulement", "Bâtir une synagogue", "Suivre Jésus en Galilée"], bonne: 0 },
        { type: "ordre", consigne: "Remets ces rencontres dans l'ordre du chapitre :", items: ["Nicodème, de nuit", "La Samaritaine au puits", "La femme que l'on accusait", "Zachée dans son sycomore"] },
      ],
    },
  ],
};
