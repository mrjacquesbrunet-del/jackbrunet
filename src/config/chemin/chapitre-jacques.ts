import type { CheminChapitre } from "@/lib/chemin";

/**
 * La lettre de Jacques (Jacques 1-5). 8 étapes.
 * L'`id` est la clé de sauvegarde et ne bouge jamais ; le numéro affiché au
 * joueur est la position dans la route (voir `numeroChapitre`).
 */
export const CHAPITRE_JACQUES: CheminChapitre = {
  id: 53,
  nom: "La lettre de Jacques",
  livre: "Jacques 1-5",
  accent: "#BEF264",
  decor: "/img/chemin/decor-53.jpg",
  sentier: [{ x: 61.1, y: 94 }, { x: 49.8, y: 84.3 }, { x: 63.5, y: 74.6 }, { x: 43.8, y: 64.9 }, { x: 48.4, y: 55 }, { x: 54.5, y: 45.3 }, { x: 36.3, y: 35.6 }, { x: 51.9, y: 26 }],
  fallback: ["#33420a", "#4a5e10", "#161d04"],
  carte: {
    id: "jacques-frere",
    nom: "Jacques",
    titre: "La foi qui se voit",
    rarete: "epique",
    image: "/img/chemin/cartes/jacques-frere.jpg",
  },
  etapes: [
    {
      recit:
        "Jacques, frère de Jésus, ne crut pas en lui de son vivant. Après la résurrection, il devint l'un des piliers de l'Église de Jérusalem. Il écrit : « Jacques, serviteur de Dieu et du Seigneur Jésus-Christ, aux douze tribus qui sont dans la dispersion, salut ! Mes frères, regardez comme un sujet de joie complète les diverses épreuves auxquelles vous pouvez être exposés, sachant que l'épreuve de votre foi produit la patience. »",
      ref: "Jacques 1:1-4",
      exercices: [
        { type: "qui", indices: ["Je suis le frère de Jésus.", "De son vivant, je ne croyais pas en lui.", "Je deviens un pilier de l'Église de Jérusalem.", "J'écris que la foi sans les œuvres est morte."], reponse: "Jacques", leurres: ["Jude", "Barnabas", "Silas"] },
        { type: "qcm", q: "Comment Jacques se présente-t-il ?", choix: ["Serviteur de Dieu et du Seigneur Jésus-Christ", "Frère du Seigneur", "Apôtre de Jérusalem", "Ancien du temple"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que produit l'épreuve de la foi ?", choix: ["La patience", "La richesse", "La sagesse aussitôt", "Le repos"], bonne: 0 },
      ],
    },
    {
      recit:
        "« Si quelqu'un d'entre vous manque de sagesse, qu'il la demande à Dieu, qui donne à tous simplement et sans reproche, et elle lui sera donnée. Mais qu'il la demande avec foi, sans douter ; car celui qui doute est semblable au flot de la mer, agité par le vent et poussé de côté et d'autre. »",
      ref: "Jacques 1:5-8",
      exercices: [
        { type: "verset", ref: "Jacques 1:5", texte: "Si quelqu'un manque de sagesse qu'il la demande à Dieu" },
        { type: "qcm", q: "Comment Dieu donne-t-il la sagesse ?", choix: ["Simplement et sans reproche", "Avec réticence", "Une seule fois", "À ceux qui la méritent"], bonne: 0 },
        { type: "qcm", q: "À quoi celui qui doute est-il comparé ?", choix: ["Au flot de la mer agité par le vent", "À un arbre sans racine", "À une lampe éteinte", "À un champ sec"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Mettez en pratique la parole, et ne vous bornez pas à l'écouter, en vous trompant vous-mêmes par de faux raisonnements. Car si quelqu'un écoute la parole et ne la met pas en pratique, il est semblable à un homme qui regarde dans un miroir son visage naturel, et qui, après s'être regardé, s'en va et oublie aussitôt quel il était. »",
      ref: "Jacques 1:22-25",
      exercices: [
        { type: "verset", ref: "Jacques 1:22", texte: "Mettez en pratique la parole et ne vous bornez pas à l'écouter" },
        { type: "qcm", q: "À qui ressemble celui qui écoute sans pratiquer ?", choix: ["À un homme qui se regarde au miroir puis s'oublie", "À un serviteur endormi", "À un semeur sans grain", "À un veilleur aveugle"], bonne: 0 },
        { type: "qcm", q: "Quelle est la religion pure devant Dieu, selon la fin du chapitre ?", choix: ["Visiter les orphelins et les veuves dans leur affliction", "Jeûner souvent", "Offrir beaucoup", "Prier en public"], bonne: 0, ref: "Jacques 1:27", niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Mes frères, que votre foi ne s'allie pas à des considérations de personnes. Si dans votre assemblée entre un homme avec un anneau d'or et un habit magnifique, et qu'il entre aussi un pauvre avec un habit malpropre, et que vous disiez au riche : Toi, assieds-toi ici à cette place d'honneur ! et que vous disiez au pauvre : Toi, tiens-toi là debout ! ne faites-vous pas en vous-mêmes une distinction, et ne jugez-vous pas sur de mauvais principes ? »",
      ref: "Jacques 2:1-4",
      exercices: [
        { type: "qcm", q: "Que dénonce Jacques dans l'assemblée ?", choix: ["Le favoritisme envers le riche et le mépris du pauvre", "Le bruit", "Le manque de prière", "Les longues réunions"], bonne: 0 },
        { type: "qcm", q: "Comment reconnaît-on l'homme riche dans l'exemple ?", choix: ["Un anneau d'or et un habit magnifique", "Une couronne", "Un serviteur", "Un cheval"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jacques appelle « loi royale » le commandement d'aimer son prochain comme soi-même.", vrai: true, ref: "Jacques 2:8", niveau: "expert" },
      ],
    },
    {
      recit:
        "« Que sert-il à quelqu'un de dire qu'il a la foi, s'il n'a pas les œuvres ? Si un frère ou une sœur sont nus et manquent de la nourriture de chaque jour, et que l'un de vous leur dise : Allez en paix, chauffez-vous et vous rassasiez ! et que vous ne leur donniez pas ce qui est nécessaire au corps, à quoi cela sert-il ? Il en est ainsi de la foi : si elle n'a pas les œuvres, elle est morte en elle-même. »",
      ref: "Jacques 2:14-17",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Jacques 2:17", texte: "La foi si elle n'a pas les œuvres est morte en elle-même" },
        { type: "qcm", q: "Quel exemple concret Jacques donne-t-il ?", choix: ["Souhaiter du bien à un frère nu et affamé sans rien lui donner", "Prier sans jeûner", "Chanter sans écouter", "Bâtir sans plan"], bonne: 0 },
        { type: "vf", q: "Jacques oppose la foi et les œuvres comme deux chemins au choix.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Nous bronchons tous de plusieurs manières. Si quelqu'un ne bronche point en paroles, c'est un homme parfait. Voici, nous mettons le mors dans la bouche des chevaux pour qu'ils nous obéissent, et nous dirigeons ainsi leur corps tout entier. Voici, même les navires, si grands qu'ils soient, sont dirigés par un très petit gouvernail. De même, la langue est un petit membre, et elle se vante de grandes choses. Voici, comme un petit feu peut embraser une grande forêt ! »",
      ref: "Jacques 3:1-6",
      exercices: [
        { type: "qcm", q: "À quoi Jacques compare-t-il la langue ?", choix: ["Au mors du cheval, au gouvernail, au petit feu", "À une épée", "À une clef", "À une lampe"], bonne: 0 },
        { type: "trou", texte: "« Comme un petit ___ peut embraser une grande forêt ! »", reponse: "feu", leurres: ["vent", "mot", "cri"], niveau: "moyen" },
        { type: "qcm", q: "Que dit Jacques de celui qui ne bronche pas en paroles ?", choix: ["C'est un homme parfait", "C'est un homme rare", "C'est un homme muet", "Il n'en existe pas"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« D'où viennent les luttes, et d'où viennent les querelles parmi vous ? N'est-ce pas de vos passions qui combattent dans vos membres ? Vous ne possédez pas, parce que vous ne demandez pas. Vous demandez, et vous ne recevez pas, parce que vous demandez mal. Dieu résiste aux orgueilleux, mais il fait grâce aux humbles. Humiliez-vous devant le Seigneur, et il vous élèvera. »",
      ref: "Jacques 4:1-10",
      exercices: [
        { type: "verset", ref: "Jacques 4:10", texte: "Humiliez-vous devant le Seigneur et il vous élèvera" },
        { type: "qcm", q: "D'où viennent les querelles, selon Jacques ?", choix: ["Des passions qui combattent au dedans", "Des ennemis du dehors", "Du manque d'argent", "Des faux docteurs"], bonne: 0 },
        { type: "qcm", q: "À qui Dieu fait-il grâce ?", choix: ["Aux humbles", "Aux savants", "Aux forts", "Aux anciens"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Prenez, mes frères, pour modèles de souffrance et de patience les prophètes. Voici, l'agriculteur attend le précieux fruit de la terre, prenant patience à son égard, jusqu'à ce qu'il ait reçu les pluies de la première et de l'arrière-saison. Quelqu'un parmi vous est-il malade ? Qu'il appelle les anciens de l'Église, et que les anciens prient pour lui. La prière fervente du juste a une grande efficace. Élie était un homme de la même nature que nous : il pria avec instance pour qu'il ne plût point. »",
      ref: "Jacques 5:7-18",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Jacques 5:16", texte: "La prière fervente du juste a une grande efficace" },
        { type: "qcm", q: "Quel exemple de prière Jacques donne-t-il ?", choix: ["Élie, « un homme de la même nature que nous »", "Moïse au Sinaï", "Daniel dans la fosse", "Anne à Silo"], bonne: 0 },
        { type: "ordre", consigne: "Remets les grandes leçons de Jacques dans l'ordre de la lettre :", items: ["L'épreuve produit la patience", "Mettre en pratique, pas seulement écouter", "La foi sans les œuvres est morte", "La langue, ce petit feu"] },
      ],
    },
  ],
};
