import type { CheminChapitre } from "@/lib/chemin";

/**
 * Les lettres de Paul (Romains, 1 Corinthiens, Galates, Éphésiens,
 * Philippiens, 1 Thessaloniciens, Philémon). 8 étapes.
 * L'`id` est la clé de sauvegarde et ne bouge jamais ; le numéro affiché au
 * joueur est la position dans la route (voir `numeroChapitre`).
 */
export const CHAPITRE_LETTRES_PAUL: CheminChapitre = {
  id: 52,
  nom: "Les lettres de Paul",
  livre: "Romains à Philémon",
  accent: "#93C5FD",
  decor: "/img/chemin/decor-52.jpg",
  sentier: [{ x: 52.5, y: 94 }, { x: 62.1, y: 84.3 }, { x: 62.4, y: 74.6 }, { x: 56.6, y: 64.9 }, { x: 34, y: 55 }, { x: 56.9, y: 45.3 }, { x: 48, y: 35.6 }, { x: 47.7, y: 26 }],
  fallback: ["#152c4a", "#20416b", "#081422"],
  carte: {
    id: "onesime",
    nom: "Onésime",
    titre: "L'esclave reçu comme un frère",
    rarete: "epique",
    image: "/img/chemin/cartes/onesime.jpg",
  },
  etapes: [
    {
      recit:
        "Aux Romains, Paul posa d'abord le diagnostic : « Il n'y a point de juste, pas même un seul. Tous ont péché et sont privés de la gloire de Dieu. » Puis le remède : « Et ils sont gratuitement justifiés par sa grâce, par le moyen de la rédemption qui est en Jésus-Christ. »",
      ref: "Romains 3:10-24",
      exercices: [
        { type: "verset", ref: "Romains 3:23", texte: "Tous ont péché et sont privés de la gloire de Dieu" },
        { type: "qcm", q: "Comment l'homme est-il justifié, selon Paul ?", choix: ["Gratuitement, par la grâce, en Jésus-Christ", "Par les œuvres de la loi", "Par la circoncision", "Par les sacrifices du temple"], bonne: 0 },
        { type: "qcm", q: "Combien de justes Paul compte-t-il par lui-même ?", choix: ["Pas même un seul", "Quelques-uns", "Les fils d'Abraham", "Ceux qui gardent la loi"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Il n'y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ. Nous savons que toutes choses concourent au bien de ceux qui aiment Dieu. Qui nous séparera de l'amour de Christ ? Sera-ce la tribulation, ou l'angoisse, ou la persécution, ou la faim ? Car j'ai l'assurance que ni la mort ni la vie, ni les choses présentes ni les choses à venir, ne pourront nous séparer de l'amour de Dieu manifesté en Jésus-Christ notre Seigneur. »",
      ref: "Romains 8:1-39",
      exercices: [
        { type: "verset", ref: "Romains 8:1", texte: "Il n'y a maintenant aucune condamnation pour ceux qui sont en Jésus-Christ" },
        { type: "qcm", q: "Que dit Paul de ce qui peut nous séparer de l'amour de Dieu ?", choix: ["Rien, ni la mort ni la vie", "La persécution seule", "Le péché grave", "L'exil"], bonne: 0 },
        { type: "trou", texte: "« Toutes choses concourent au ___ de ceux qui aiment Dieu. »", reponse: "bien", leurres: ["salut", "repos", "jugement"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Aux Corinthiens divisés, Paul écrivit : « Quand je parlerais les langues des hommes et des anges, si je n'ai pas l'amour, je suis un airain qui résonne. L'amour est patient, il est plein de bonté ; il n'est point envieux, il ne se vante point, il ne s'enfle point d'orgueil ; il ne cherche point son intérêt, il ne s'irrite point, il ne soupçonne point le mal. Il excuse tout, il croit tout, il espère tout, il supporte tout. L'amour ne périt jamais. »",
      ref: "1 Corinthiens 13:1-8",
      exercices: [
        { type: "verset", ref: "1 Corinthiens 13:4", texte: "L'amour est patient il est plein de bonté" },
        { type: "qcm", q: "Que vaut le don des langues sans l'amour ?", choix: ["Un airain qui résonne", "Un trésor caché", "Un don parfait", "Un signe suffisant"], bonne: 0 },
        { type: "qcm", q: "Que reste-t-il à la fin, selon le dernier verset du chapitre ?", choix: ["La foi, l'espérance, l'amour — et le plus grand est l'amour", "La connaissance", "Les langues", "La prophétie"], bonne: 0, ref: "1 Corinthiens 13:13", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Aux Galates tentés de revenir sous la loi : « C'est pour la liberté que Christ nous a affranchis. Demeurez donc fermes, et ne vous laissez pas mettre de nouveau sous le joug de la servitude. » Et il décrivit ce que l'Esprit fait pousser : « Le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance. »",
      ref: "Galates 5:1-23",
      exercices: [
        { type: "verset", ref: "Galates 5:22", texte: "Le fruit de l'Esprit c'est l'amour la joie la paix", niveau: "moyen" },
        { type: "qcm", q: "Le texte parle-t-il des fruits ou du fruit de l'Esprit ?", choix: ["Du fruit, au singulier : un seul fruit à neuf facettes", "Des fruits, au pluriel", "Des dons", "Des œuvres"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Pourquoi Christ nous a-t-il affranchis ?", choix: ["Pour la liberté", "Pour la loi", "Pour le temple", "Pour la circoncision"], bonne: 0 },
      ],
    },
    {
      recit:
        "Aux Éphésiens : « C'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu. Ce n'est point par les œuvres, afin que personne ne se glorifie. » Puis : « Revêtez-vous de toutes les armes de Dieu : la vérité pour ceinture, la justice pour cuirasse, le zèle de l'Évangile pour chaussure, la foi pour bouclier, le salut pour casque, et l'épée de l'Esprit, qui est la parole de Dieu. »",
      ref: "Éphésiens 2:8-9",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Éphésiens 2:8", texte: "C'est par la grâce que vous êtes sauvés par le moyen de la foi" },
        { type: "ordre", consigne: "Remets les armes de Dieu dans l'ordre du texte :", items: ["La vérité pour ceinture", "La justice pour cuirasse", "La foi pour bouclier", "L'épée de l'Esprit"], ref: "Éphésiens 6:14-17" },
        { type: "qcm", q: "Qu'est-ce que l'épée de l'Esprit ?", choix: ["La parole de Dieu", "La prière", "La foi", "Le zèle"], bonne: 0, ref: "Éphésiens 6:17", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Aux Philippiens, depuis sa prison : « Réjouissez-vous toujours dans le Seigneur ; je le répète, réjouissez-vous. Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières, avec des actions de grâces. Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ. J'ai appris à être content de l'état où je me trouve. Je puis tout par celui qui me fortifie. »",
      ref: "Philippiens 4:4-13",
      exercices: [
        { type: "verset", ref: "Philippiens 4:13", texte: "Je puis tout par celui qui me fortifie" },
        { type: "qcm", q: "D'où Paul écrit-il cette lettre pleine de joie ?", choix: ["De prison", "D'Éphèse en liberté", "D'Antioche", "De Corinthe"], bonne: 0 },
        { type: "qcm", q: "Que dit-il avoir appris ?", choix: ["À être content de l'état où il se trouve", "À prêcher", "À se taire", "À voyager seul"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Aux Thessaloniciens inquiets pour leurs morts : « Nous ne voulons pas que vous soyez dans l'ignorance au sujet de ceux qui dorment, afin que vous ne vous affligiez pas comme les autres qui n'ont point d'espérance. Car le Seigneur lui-même descendra du ciel, et les morts en Christ ressusciteront premièrement. Consolez-vous donc les uns les autres par ces paroles. »",
      ref: "1 Thessaloniciens 4:13-18",
      exercices: [
        { type: "qcm", q: "Quelle inquiétude Paul apaise-t-il ?", choix: ["Le sort de ceux qui sont morts avant le retour du Seigneur", "La persécution", "La pauvreté", "Les divisions"], bonne: 0 },
        { type: "trou", texte: "« Afin que vous ne vous affligiez pas comme les autres qui n'ont point d'___. »", reponse: "espérance", leurres: ["foi", "amour", "repos"], niveau: "moyen" },
        { type: "qcm", q: "Comment Paul termine-t-il ce passage ?", choix: ["« Consolez-vous les uns les autres par ces paroles »", "« Craignez ce jour »", "« Tenez-vous prêts à fuir »", "« N'en parlez à personne »"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "La plus courte lettre est aussi la plus personnelle. Onésime, esclave, s'était enfui de chez Philémon et avait rencontré Paul en prison. Paul le renvoie avec ce billet : « Je te prie pour mon enfant, que j'ai engendré étant dans les chaînes, Onésime. Je te le renvoie, lui, mes propres entrailles. Reçois-le non plus comme un esclave, mais comme un frère bien-aimé. S'il t'a fait quelque tort, ou s'il te doit quelque chose, mets-le sur mon compte. »",
      ref: "Philémon 1:10-18",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["J'étais esclave et je me suis enfui.", "Je rencontre en prison celui qui va me changer.", "On me renvoie chez mon maître avec une lettre.", "Mon nom veut dire « utile »."], reponse: "Onésime", leurres: ["Tychique", "Épaphras", "Démas"] },
        { type: "qcm", q: "Comment Paul demande-t-il qu'Onésime soit reçu ?", choix: ["Non plus comme un esclave, mais comme un frère bien-aimé", "Comme un serviteur pardonné", "Comme un étranger", "Comme un invité pour un jour"], bonne: 0 },
        { type: "qcm", q: "Que propose Paul pour la dette d'Onésime ?", choix: ["Qu'on la mette sur son propre compte", "Qu'on l'oublie", "Qu'Onésime travaille pour la rembourser", "Il n'en parle pas"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
