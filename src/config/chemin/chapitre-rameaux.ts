import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 42 — L'entrée à Jérusalem et le temple (Matthieu 21, Marc 12). 8 étapes. */
export const CHAPITRE_RAMEAUX: CheminChapitre = {
  id: 42,
  nom: "L'entrée à Jérusalem",
  livre: "Matthieu 21, Marc 12",
  accent: "#4ADE80",
  decor: "/img/chemin/decor-42.jpg",
  sentier: [{ x: 53.9, y: 94 }, { x: 48.2, y: 84.3 }, { x: 51.1, y: 74.6 }, { x: 62.2, y: 64.9 }, { x: 40.6, y: 55 }, { x: 40.3, y: 45.3 }, { x: 41.8, y: 35.6 }, { x: 44.4, y: 26 }],
  fallback: ["#0e401f", "#155c2d", "#051c0d"],
  carte: {
    id: "zachee",
    nom: "Zachée",
    titre: "Descends vite, aujourd'hui",
    rarete: "epique",
    image: "/img/chemin/cartes/zachee.jpg",
  },
  etapes: [
    {
      recit:
        "Lorsqu'ils approchèrent de Jérusalem, du côté du mont des Oliviers, Jésus envoya deux disciples : « Allez au village qui est devant vous ; vous trouverez une ânesse attachée et un ânon avec elle. Détachez-les et amenez-les-moi. Si quelqu'un vous dit quelque chose, répondez : Le Seigneur en a besoin. »",
      ref: "Matthieu 21:1-3",
      exercices: [
        { type: "qcm", q: "Que doivent aller chercher les deux disciples ?", choix: ["Une ânesse et son ânon", "Un cheval", "Une barque", "Des rameaux"], bonne: 0 },
        { type: "qcm", q: "Que doivent-ils répondre si on les interroge ?", choix: ["« Le Seigneur en a besoin »", "« Nous les rendrons demain »", "« C'est pour la fête »", "Rien"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "De quel côté approchent-ils de Jérusalem ?", choix: ["Du mont des Oliviers", "Du désert", "De la mer", "Du nord"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Cela arriva afin que s'accomplît ce qui avait été annoncé par le prophète : « Dites à la fille de Sion : Voici, ton roi vient à toi, plein de douceur, et monté sur un âne, sur un ânon, le petit d'une ânesse. »",
      ref: "Matthieu 21:4-5",
      exercices: [
        { type: "qcm", q: "Quel prophète est accompli ce jour-là ?", choix: ["Zacharie", "Ésaïe", "Michée", "Malachie"], bonne: 0, ref: "Zacharie 9:9", niveau: "moyen" },
        { type: "qcm", q: "Comment le roi annoncé entre-t-il ?", choix: ["Plein de douceur, monté sur un ânon", "Sur un char", "À pied, sans être vu", "Porté par la foule"], bonne: 0 },
        { type: "vf", q: "Un roi vainqueur entrait normalement à cheval, pas sur un ânon.", vrai: true, niveau: "expert" },
      ],
    },
    {
      recit:
        "La plupart des gens de la foule étendirent leurs vêtements sur le chemin ; d'autres coupèrent des branches d'arbres et les répandirent sur la route. Ceux qui précédaient et ceux qui suivaient criaient : « Hosanna au Fils de David ! Béni soit celui qui vient au nom du Seigneur ! Hosanna dans les lieux très hauts ! »",
      ref: "Matthieu 21:8-9",
      exercices: [
        { type: "verset", ref: "Matthieu 21:9", texte: "Béni soit celui qui vient au nom du Seigneur" },
        { type: "qcm", q: "Que met la foule sur le chemin ?", choix: ["Ses vêtements et des branches", "Des fleurs", "Du sable", "Des tapis du temple"], bonne: 0 },
        { type: "qcm", q: "Quel titre la foule donne-t-elle à Jésus ?", choix: ["Fils de David", "Roi des nations", "Fils de l'homme", "Prophète d'Israël"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus entra dans le temple de Dieu. Il chassa tous ceux qui vendaient et achetaient, renversa les tables des changeurs et les sièges des vendeurs de pigeons. « Il est écrit : Ma maison sera appelée une maison de prière. Mais vous, vous en faites une caverne de voleurs. »",
      ref: "Matthieu 21:12-13",
      exercices: [
        { type: "qcm", q: "Que renverse Jésus dans le temple ?", choix: ["Les tables des changeurs et les sièges des vendeurs", "L'autel", "Les colonnes", "Les portes"], bonne: 0 },
        { type: "trou", texte: "« Ma maison sera appelée une maison de ___. »", reponse: "prière", leurres: ["justice", "gloire", "paix"], niveau: "moyen" },
        { type: "vf", q: "Jésus s'en prend au commerce installé dans la cour du temple.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Des aveugles et des boiteux s'approchèrent de lui dans le temple, et il les guérit. Mais les principaux sacrificateurs furent indignés en voyant les enfants qui criaient dans le temple : « Hosanna au Fils de David ! » — « Entends-tu ce qu'ils disent ? » Jésus leur répondit : « Oui. N'avez-vous jamais lu : Tu as tiré des louanges de la bouche des enfants ? »",
      ref: "Matthieu 21:14-16",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qui crie « Hosanna » dans le temple ?", choix: ["Les enfants", "Les prêtres", "Les soldats", "Les marchands"], bonne: 0 },
        { type: "qcm", q: "Que fait Jésus dans le temple après avoir chassé les marchands ?", choix: ["Il guérit des aveugles et des boiteux", "Il enseigne la loi", "Il offre un sacrifice", "Il s'en va"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Par quel texte Jésus répond-il aux sacrificateurs indignés ?", choix: ["« Tu as tiré des louanges de la bouche des enfants »", "« Ma maison est une maison de prière »", "« Vous êtes des sépulcres blanchis »", "« Rendez à César »"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Les pharisiens envoyèrent leurs disciples avec les hérodiens pour le surprendre par ses propres paroles : « Est-il permis, ou non, de payer le tribut à César ? » Jésus, connaissant leur méchanceté, dit : « Montrez-moi la monnaie du tribut. De qui sont cette effigie et cette inscription ? » — « De César. » — « Rendez donc à César ce qui est à César, et à Dieu ce qui est à Dieu. »",
      ref: "Matthieu 22:15-22",
      exercices: [
        { type: "verset", ref: "Matthieu 22:21", texte: "Rendez à César ce qui est à César et à Dieu ce qui est à Dieu" },
        { type: "qcm", q: "Quel piège lui tend-on ?", choix: ["Une question sur l'impôt à César", "Une question sur le sabbat", "Une accusation de blasphème", "Une question sur le divorce"], bonne: 0 },
        { type: "qcm", q: "Que demande Jésus avant de répondre ?", choix: ["Qu'on lui montre la monnaie du tribut", "Un délai", "Le témoignage des scribes", "Le rouleau de la loi"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Un docteur de la loi lui demanda : « Maître, quel est le plus grand commandement de la loi ? » Jésus répondit : « Tu aimeras le Seigneur ton Dieu de tout ton cœur, de toute ton âme et de toute ta pensée. C'est le premier et le plus grand commandement. Et voici le second, qui lui est semblable : Tu aimeras ton prochain comme toi-même. De ces deux commandements dépendent toute la loi et les prophètes. »",
      ref: "Matthieu 22:34-40",
      exercices: [
        { type: "verset", ref: "Matthieu 22:37", texte: "Tu aimeras le Seigneur ton Dieu de tout ton cœur" },
        { type: "qcm", q: "Quel est le second commandement, semblable au premier ?", choix: ["« Tu aimeras ton prochain comme toi-même »", "« Tu ne tueras point »", "« Honore ton père et ta mère »", "« Souviens-toi du sabbat »"], bonne: 0 },
        { type: "qcm", q: "Que dépend de ces deux commandements ?", choix: ["Toute la loi et les prophètes", "Le temple seulement", "Les dix commandements", "Les sacrifices"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus s'assit vis-à-vis du tronc du temple et regardait comment la foule y mettait de l'argent. Beaucoup de riches y mettaient beaucoup. Il vint une pauvre veuve qui y mit deux petites pièces. Il appela ses disciples : « Cette pauvre veuve a donné plus que tous ceux qui ont mis dans le tronc ; car tous ont donné de leur superflu, mais elle a mis tout ce qu'elle possédait, tout ce qu'elle avait pour vivre. »",
      ref: "Marc 12:41-44",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qu'a donné la pauvre veuve ?", choix: ["Deux petites pièces — tout ce qu'elle avait pour vivre", "Un talent d'argent", "Un agneau", "Rien, elle n'avait rien"], bonne: 0 },
        { type: "qcm", q: "Pourquoi Jésus dit-il qu'elle a donné le plus ?", choix: ["Les autres donnaient de leur superflu, elle a tout donné", "Elle a donné en premier", "Elle a prié plus longtemps", "Elle était la plus âgée"], bonne: 0 },
        { type: "ordre", consigne: "Remets cette semaine dans l'ordre :", items: ["L'entrée sur l'ânon et les rameaux", "Les tables renversées dans le temple", "« Rendez à César ce qui est à César »", "L'offrande de la pauvre veuve"] },
      ],
    },
  ],
};
