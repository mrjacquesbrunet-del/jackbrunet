import type { CheminChapitre } from "@/lib/chemin";

/**
 * Chapitre 50 — Paul prisonnier jusqu'à Rome, et ses lettres
 * (Actes 21-28, Romains, 1 Corinthiens, Éphésiens, Philippiens). 8 étapes.
 */
export const CHAPITRE_ROME: CheminChapitre = {
  id: 50,
  nom: "Jusqu'à Rome",
  livre: "Actes 21-28, les lettres",
  accent: "#D8B4FE",
  decor: "/img/chemin/decor-50.jpg",
  sentier: [{ x: 64.2, y: 94 }, { x: 60.5, y: 84.3 }, { x: 67.2, y: 74.6 }, { x: 46.5, y: 64.9 }, { x: 65, y: 55 }, { x: 46.9, y: 45.3 }, { x: 50.8, y: 35.6 }, { x: 50.5, y: 26 }],
  fallback: ["#33204a", "#4b306b", "#150d22"],
  carte: {
    id: "timothee",
    nom: "Timothée",
    titre: "Le fils dans la foi",
    rarete: "epique",
    image: "/img/chemin/cartes/timothee.jpg",
  },
  etapes: [
    {
      recit:
        "À Jérusalem, la foule s'ameuta contre Paul dans le temple. Le tribun le fit arrêter et lier de deux chaînes. Paul demanda la permission de parler au peuple et raconta sa conversion sur le chemin de Damas. Apprenant qu'il était citoyen romain, le tribun eut peur de l'avoir fait lier.",
      ref: "Actes 21:27 - 22:29",
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui protège Paul de la flagellation ?", choix: ["Sa citoyenneté romaine", "Sa richesse", "L'intervention du sanhédrin", "Un ami au palais"], bonne: 0 },
        { type: "qcm", q: "Que raconte Paul à la foule ?", choix: ["Sa conversion sur le chemin de Damas", "L'histoire d'Israël", "Ses voyages", "Rien"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Paul a été arrêté dans le temple de Jérusalem.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comparaissant devant le gouverneur Félix, puis devant Festus, Paul se défendit. Festus proposa de le juger à Jérusalem. Paul répondit : « Je suis devant le tribunal de César, c'est là que je dois être jugé. J'en appelle à César. » Festus déclara : « Tu en as appelé à César ; tu iras devant César. »",
      ref: "Actes 25:8-12",
      exercices: [
        { type: "qcm", q: "Quel droit Paul utilise-t-il ?", choix: ["Le droit d'en appeler à César", "Le droit d'asile", "Le droit de fuite", "Le droit de silence"], bonne: 0 },
        { type: "qcm", q: "Devant quels gouverneurs comparaît-il ?", choix: ["Félix puis Festus", "Pilate puis Hérode", "Gallion seul", "Le tribun seul"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "C'est cet appel qui l'emmènera jusqu'à Rome.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le voyage par mer fut périlleux. Un vent d'ouragan, l'Euraquilon, emporta le navire. Pendant plusieurs jours on ne vit ni soleil ni étoiles ; toute espérance de se sauver était perdue. Paul se leva : « Je vous exhorte à prendre courage ; car aucun de vous ne périra. Cette nuit, un ange du Dieu à qui j'appartiens et que je sers m'est apparu : Ne crains point, Paul ; il faut que tu comparaisses devant César. »",
      ref: "Actes 27:14-24",
      exercices: [
        { type: "qcm", q: "Que promet Paul aux passagers en pleine tempête ?", choix: ["Qu'aucun d'eux ne périra", "Que le navire arrivera intact", "Qu'ils rentreront chez eux", "Rien"], bonne: 0 },
        { type: "qcm", q: "Comment s'appelle le vent qui emporte le navire ?", choix: ["L'Euraquilon", "Le sirocco", "Le Zéphyr", "Le khamsin"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Comment Paul se décrit-il devant l'équipage ?", choix: ["Appartenant à Dieu et le servant", "Comme un prisonnier romain", "Comme un marin", "Comme un juge"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le navire se brisa sur l'île de Malte, mais tous parvinrent à terre sains et saufs. Les habitants allumèrent un grand feu. Paul ayant ramassé un tas de broussailles, une vipère en sortit par l'effet de la chaleur et s'attacha à sa main. Il la secoua dans le feu et n'éprouva aucun mal. Il guérit ensuite le père du principal de l'île, et beaucoup de malades.",
      ref: "Actes 28:1-9",
      exercices: [
        { type: "qcm", q: "Sur quelle île le navire fait-il naufrage ?", choix: ["Malte", "Chypre", "Crète", "Rhodes"], bonne: 0 },
        { type: "qcm", q: "Combien de passagers survivent ?", choix: ["Tous", "La moitié", "Paul seul", "Le texte ne le dit pas"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La morsure de la vipère n'a eu aucun effet sur Paul.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Arrivé à Rome, Paul obtint la permission de demeurer à part, avec un soldat qui le gardait. Il resta deux ans entiers dans une maison qu'il avait louée, recevant tous ceux qui venaient le voir, prêchant le royaume de Dieu et enseignant ce qui concerne le Seigneur Jésus-Christ, avec toute liberté et sans obstacle.",
      ref: "Actes 28:16-31",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Comment le livre des Actes se termine-t-il ?", choix: ["Paul prêche à Rome deux ans, sans obstacle", "Paul est libéré", "Paul meurt", "Paul retourne à Jérusalem"], bonne: 0 },
        { type: "qcm", q: "Dans quelles conditions vit-il à Rome ?", choix: ["Dans une maison louée, gardé par un soldat", "Dans un cachot", "Libre de circuler", "Chez un ami"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le livre des Actes s'achève sans dire ce qu'il advint de Paul.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Aux Romains, Paul écrivit : « Tous ont péché et sont privés de la gloire de Dieu ; et ils sont gratuitement justifiés par sa grâce, par le moyen de la rédemption qui est en Jésus-Christ. » Et encore : « Il n'y a maintenant aucune condamnation pour ceux qui sont en Jésus-Christ. »",
      ref: "Romains 3:23-24",
      exercices: [
        { type: "verset", ref: "Romains 3:23", texte: "Tous ont péché et sont privés de la gloire de Dieu" },
        { type: "qcm", q: "Comment sommes-nous justifiés, selon ce verset ?", choix: ["Gratuitement, par sa grâce", "Par les œuvres de la loi", "Par les sacrifices", "Par la circoncision"], bonne: 0 },
        { type: "vf", q: "Paul écrit qu'il n'y a plus aucune condamnation pour ceux qui sont en Christ.", vrai: true, ref: "Romains 8:1", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Aux Corinthiens, il écrivit : « Quand je parlerais les langues des hommes et des anges, si je n'ai pas l'amour, je suis un airain qui résonne. L'amour est patient, il est plein de bonté ; il n'est point envieux ; il ne cherche point son intérêt, il ne s'irrite point. Il excuse tout, il croit tout, il espère tout, il supporte tout. L'amour ne périt jamais. »",
      ref: "1 Corinthiens 13:1-8",
      exercices: [
        { type: "verset", ref: "1 Corinthiens 13:4", texte: "L'amour est patient il est plein de bonté" },
        { type: "qcm", q: "Que vaut le don des langues sans l'amour ?", choix: ["Un airain qui résonne", "Un trésor caché", "Un don parfait", "Un signe suffisant"], bonne: 0 },
        { type: "qcm", q: "Que dit Paul de la fin de l'amour ?", choix: ["« L'amour ne périt jamais »", "Qu'il passe avec le temps", "Qu'il cède à la foi", "Qu'il finit avec la mort"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "De sa prison, il écrivit aux Philippiens : « Réjouissez-vous toujours dans le Seigneur ; je le répète, réjouissez-vous. Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières, avec des actions de grâces. Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ. Je puis tout par celui qui me fortifie. »",
      ref: "Philippiens 4:4-13",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Philippiens 4:13", texte: "Je puis tout par celui qui me fortifie" },
        { type: "qcm", q: "D'où Paul écrit-il cette lettre pleine de joie ?", choix: ["De prison", "D'Éphèse", "D'Antioche", "De Corinthe"], bonne: 0 },
        { type: "qcm", q: "Que fait la paix de Dieu, selon ce texte ?", choix: ["Elle garde les cœurs et les pensées", "Elle supprime les épreuves", "Elle donne la richesse", "Elle explique tout"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
