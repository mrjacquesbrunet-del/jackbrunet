import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 24 — Jérémie (Jérémie 1, 18, 29, 31, 38). 8 étapes. */
export const CHAPITRE_JEREMIE: CheminChapitre = {
  id: 24,
  nom: "Jérémie",
  livre: "Jérémie 1-38",
  accent: "#D97706",
  decor: "/img/chemin/decor-24.jpg",
  sentier: [{ x: 41.5, y: 94 }, { x: 59.4, y: 84.3 }, { x: 69.9, y: 74.6 }, { x: 62.5, y: 64.9 }, { x: 39.2, y: 55 }, { x: 45.7, y: 45.3 }, { x: 58.7, y: 35.6 }, { x: 52, y: 26 }],
  fallback: ["#4a3308", "#6b4a0e", "#221703"],
  carte: {
    id: "jeremie",
    nom: "Jérémie",
    titre: "Le prophète qui pleure",
    rarete: "legendaire",
    image: "/img/chemin/cartes/jeremie.jpg",
  },
  etapes: [
    {
      recit:
        "La parole de l'Éternel me fut adressée : « Avant que je t'eusse formé dans le ventre de ta mère, je te connaissais ; avant que tu fusses sorti de son sein, je t'avais consacré, je t'avais établi prophète des nations. » Je répondis : « Ah ! Seigneur Éternel ! voici, je ne sais point parler, car je suis un enfant. »",
      ref: "Jérémie 1:4-6",
      exercices: [
        { type: "verset", ref: "Jérémie 1:5", texte: "Avant que je t'eusse formé je te connaissais" },
        { type: "qcm", q: "Quelle objection Jérémie oppose-t-il à son appel ?", choix: ["Il ne sait pas parler, il est un enfant", "Il est trop vieux", "Il a peur du roi", "Il doit garder ses champs"], bonne: 0 },
        { type: "qcm", q: "Pour quoi Dieu l'a-t-il établi ?", choix: ["Prophète des nations", "Roi de Juda", "Sacrificateur du temple", "Scribe du palais"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel me dit : « Ne dis pas : Je suis un enfant. Car tu iras vers tous ceux auprès de qui je t'enverrai, et tu diras tout ce que je t'ordonnerai. Ne les crains point, car je suis avec toi pour te délivrer. » Puis l'Éternel étendit sa main et toucha ma bouche : « Voici, je mets mes paroles dans ta bouche. »",
      ref: "Jérémie 1:7-10",
      exercices: [
        { type: "qui", indices: ["Dieu me connaissait avant ma naissance.", "Je dis que je suis trop jeune pour parler.", "Je vois une branche d'amandier qui veille.", "On me descend dans une citerne de boue."], reponse: "Jérémie", leurres: ["Ésaïe", "Daniel", "Amos"] },
        { type: "qcm", q: "Comment Dieu répond-il à son objection ?", choix: ["Il touche sa bouche et y met ses paroles", "Il lui donne un porte-parole", "Il attend qu'il grandisse", "Il choisit quelqu'un d'autre"], bonne: 0 },
        { type: "trou", texte: "« Ne les crains point, car je suis ___ toi pour te délivrer. »", reponse: "avec", leurres: ["contre", "loin de", "devant"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel me dit : « Descends dans la maison du potier. » J'y descendis, et voici, il travaillait sur le tour. Le vase qu'il faisait ne réussit pas, comme il arrive à l'argile dans la main du potier ; il en refit un autre, comme il trouva bon. « Ne puis-je pas agir envers vous comme ce potier, maison d'Israël ? »",
      ref: "Jérémie 18:1-6",
      exercices: [
        { type: "qcm", q: "Où Dieu envoie-t-il Jérémie pour lui parler en images ?", choix: ["Dans la maison du potier", "Au marché", "Sur la muraille", "Au temple"], bonne: 0 },
        { type: "qcm", q: "Que fait le potier quand le vase est manqué ?", choix: ["Il en refait un autre avec la même argile", "Il jette l'argile", "Il arrête son travail", "Il achète une autre argile"], bonne: 0 },
        { type: "vf", q: "L'image du potier annonce que Dieu peut refaire son peuple.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jérémie écrivit aux exilés de Babylone : « Bâtissez des maisons et habitez-les ; plantez des jardins et mangez-en les fruits. Recherchez le bien de la ville où je vous ai menés en captivité, et priez l'Éternel en sa faveur, parce que votre bonheur dépend du sien. »",
      ref: "Jérémie 29:4-7",
      exercices: [
        { type: "qcm", q: "Que Dieu demande-t-il aux exilés à Babylone ?", choix: ["De s'y installer et de rechercher le bien de la ville", "De se révolter", "De ne rien construire", "De rentrer immédiatement"], bonne: 0 },
        { type: "vf", q: "Il leur est demandé de prier pour la ville de leurs vainqueurs.", vrai: true, niveau: "moyen" },
        { type: "qcm", q: "Combien d'années dure l'exil selon la même lettre ?", choix: ["Soixante-dix ans", "Quarante ans", "Sept ans", "Cent ans"], bonne: 0, ref: "Jérémie 29:10", niveau: "expert" },
      ],
    },
    {
      recit:
        "« Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance. Vous m'invoquerez, et vous partirez ; vous me prierez, et je vous exaucerai. Vous me chercherez, et vous me trouverez, si vous me cherchez de tout votre cœur. »",
      ref: "Jérémie 29:11-13",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Jérémie 29:11", texte: "Je connais les projets que j'ai formés sur vous projets de paix et non de malheur" },
        { type: "qcm", q: "À qui cette promesse est-elle d'abord adressée ?", choix: ["Aux exilés de Babylone", "Aux prêtres du temple", "Au roi de Juda", "Aux nations voisines"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« Vous me chercherez, et vous me trouverez, si vous me cherchez de tout votre ___. »", reponse: "cœur", leurres: ["temps", "peuple", "pouvoir"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Voici, les jours viennent, dit l'Éternel, où je ferai avec la maison d'Israël une alliance nouvelle. Je mettrai ma loi au dedans d'eux, je l'écrirai dans leur cœur ; je serai leur Dieu, et ils seront mon peuple. Je pardonnerai leur iniquité, et je ne me souviendrai plus de leur péché. »",
      ref: "Jérémie 31:31-34",
      exercices: [
        { type: "qcm", q: "Où sera écrite la loi de l'alliance nouvelle ?", choix: ["Dans leur cœur", "Sur des tables de pierre", "Sur les portes du temple", "Dans un rouleau scellé"], bonne: 0 },
        { type: "qcm", q: "Que promet Dieu au sujet du péché ?", choix: ["De le pardonner et de ne plus s'en souvenir", "De le punir enfin", "De l'inscrire au livre", "De l'oublier un an sur sept"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le Nouveau Testament reprend cette promesse d'alliance nouvelle.", vrai: true, ref: "Hébreux 8:8", niveau: "expert" },
      ],
    },
    {
      recit:
        "Les chefs dirent au roi : « Que cet homme soit mis à mort, car il décourage les hommes de guerre. » On prit Jérémie et on le descendit avec des cordes dans la citerne de Malkija : il n'y avait point d'eau, mais de la boue, et Jérémie enfonça dans la boue.",
      ref: "Jérémie 38:1-6",
      exercices: [
        { type: "qcm", q: "Où Jérémie est-il jeté ?", choix: ["Dans une citerne pleine de boue", "En prison à Babylone", "Dans une fosse aux lions", "Au fond d'un puits d'eau"], bonne: 0 },
        { type: "qcm", q: "De quoi l'accusent les chefs ?", choix: ["De décourager les hommes de guerre", "De voler le trésor", "D'adorer des idoles", "De fuir la ville"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jérémie était bien accueilli par les chefs de Jérusalem.", vrai: false },
      ],
    },
    {
      recit:
        "Ébed-Mélec, l'Éthiopien, alla trouver le roi : « Ces hommes ont mal agi en jetant Jérémie dans la citerne ; il mourra de faim là où il est. » Le roi lui ordonna de prendre trente hommes. Ébed-Mélec descendit de vieux lambeaux et des haillons pour que les cordes ne blessent pas les aisselles du prophète, et on le tira dehors.",
      ref: "Jérémie 38:7-13",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qui sauve Jérémie de la citerne ?", choix: ["Ébed-Mélec, l'Éthiopien", "Le roi lui-même", "Baruc, son secrétaire", "Un soldat babylonien"], bonne: 0 },
        { type: "qcm", q: "Quel détail montre sa délicatesse ?", choix: ["Il glisse des haillons sous les cordes pour ne pas blesser Jérémie", "Il descend lui-même dans la boue", "Il paie une rançon", "Il vient de nuit"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets la vie de Jérémie dans l'ordre :", items: ["« Avant que je t'eusse formé, je te connaissais »", "La maison du potier", "La lettre aux exilés de Babylone", "La citerne de boue et le secours d'Ébed-Mélec"] },
      ],
    },
  ],
};
