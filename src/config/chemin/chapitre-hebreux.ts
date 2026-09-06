import type { CheminChapitre } from "@/lib/chemin";

/** La lettre aux Hébreux (Hébreux 1-13). 8 étapes. */
export const CHAPITRE_HEBREUX: CheminChapitre = {
  id: 54,
  nom: "La lettre aux Hébreux",
  livre: "Hébreux 1-13",
  accent: "#FCA5A5",
  decor: "/img/chemin/decor-54.jpg",
  sentier: [{ x: 51.3, y: 94 }, { x: 60.1, y: 84.3 }, { x: 56.5, y: 74.6 }, { x: 47.3, y: 64.9 }, { x: 56.2, y: 55 }, { x: 53.9, y: 45.3 }, { x: 46.3, y: 35.6 }, { x: 46.9, y: 26 }],
  fallback: ["#4a2020", "#6b2f2f", "#220e0e"],
  carte: {
    id: "henoc",
    nom: "Hénoc",
    titre: "Il marcha avec Dieu",
    rarete: "epique",
    image: "/img/chemin/cartes/henoc.jpg",
  },
  etapes: [
    {
      recit:
        "« Après avoir autrefois, à plusieurs reprises et de plusieurs manières, parlé à nos pères par les prophètes, Dieu, dans ces derniers temps, nous a parlé par le Fils, qu'il a établi héritier de toutes choses, par lequel il a aussi créé le monde. Le Fils est le reflet de sa gloire et l'empreinte de sa personne. »",
      ref: "Hébreux 1:1-3",
      exercices: [
        { type: "qcm", q: "Comment Dieu avait-il parlé autrefois ?", choix: ["Par les prophètes, à plusieurs reprises et de plusieurs manières", "Par un seul livre", "Par des songes uniquement", "Il ne parlait pas"], bonne: 0 },
        { type: "qcm", q: "Comment le Fils est-il décrit dans ces premiers versets ?", choix: ["Le reflet de sa gloire et l'empreinte de sa personne", "Un grand prophète", "Un ange puissant", "Le premier des hommes"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La lettre commence par comparer l'ancienne et la nouvelle façon dont Dieu parle.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Car la parole de Dieu est vivante et efficace, plus tranchante qu'une épée quelconque à deux tranchants, pénétrante jusqu'à partager âme et esprit, jointures et moelles ; elle juge les sentiments et les pensées du cœur. Nulle créature n'est cachée devant lui, mais tout est à nu et à découvert aux yeux de celui à qui nous devons rendre compte. »",
      ref: "Hébreux 4:12-13",
      exercices: [
        { type: "verset", ref: "Hébreux 4:12", texte: "La parole de Dieu est vivante et efficace" },
        { type: "qcm", q: "À quoi la parole de Dieu est-elle comparée ?", choix: ["À une épée à deux tranchants", "À un marteau seulement", "À une lampe", "À un miroir"], bonne: 0 },
        { type: "qcm", q: "Que juge-t-elle ?", choix: ["Les sentiments et les pensées du cœur", "Les actes seulement", "Les paroles", "Les nations"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Nous n'avons pas un souverain sacrificateur qui ne puisse compatir à nos faiblesses ; au contraire, il a été tenté comme nous en toutes choses, sans commettre de péché. Approchons-nous donc avec assurance du trône de la grâce, afin d'obtenir miséricorde et de trouver grâce, pour être secourus dans nos besoins. »",
      ref: "Hébreux 4:14-16",
      exercices: [
        { type: "verset", ref: "Hébreux 4:16", texte: "Approchons-nous avec assurance du trône de la grâce" },
        { type: "qcm", q: "Pourquoi ce souverain sacrificateur peut-il compatir ?", choix: ["Il a été tenté comme nous en toutes choses", "Il est très ancien", "Il connaît la loi", "Il a beaucoup souffert au temple"], bonne: 0 },
        { type: "qcm", q: "Comment le texte appelle-t-il le trône dont il parle ?", choix: ["Le trône de la grâce", "Le trône du jugement", "Le trône de gloire", "Le trône de David"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'ancienne alliance avait un sanctuaire terrestre, des sacrifices répétés chaque année, un souverain sacrificateur qui entrait seul une fois l'an derrière le voile. « Mais Christ est venu comme souverain sacrificateur des biens à venir. Il est entré une fois pour toutes dans le lieu très saint, non avec le sang des boucs et des veaux, mais avec son propre sang, ayant obtenu une rédemption éternelle. »",
      ref: "Hébreux 9:11-12",
      exercices: [
        { type: "qcm", q: "Quelle différence la lettre souligne-t-elle ?", choix: ["Une fois pour toutes, au lieu de sacrifices répétés chaque année", "Un temple plus grand", "Des prêtres plus nombreux", "Un voile plus épais"], bonne: 0 },
        { type: "trou", texte: "Il est entré une fois pour toutes, ayant obtenu une rédemption ___.", reponse: "éternelle", leurres: ["nouvelle", "parfaite", "promise"], niveau: "moyen" },
        { type: "vf", q: "Le voile du temple s'était déchiré à la mort de Jésus.", vrai: true, ref: "Matthieu 27:51", niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas. Par la foi, nous reconnaissons que le monde a été formé par la parole de Dieu. C'est par la foi qu'Hénoc fut enlevé, et on ne le trouva plus, parce que Dieu l'avait enlevé ; car, avant son enlèvement, il avait reçu le témoignage qu'il était agréable à Dieu. Or, sans la foi il est impossible de lui être agréable. »",
      ref: "Hébreux 11:1-6",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Hébreux 11:1", texte: "La foi est une ferme assurance des choses qu'on espère" },
        { type: "qui", indices: ["On dit de moi que je marchai avec Dieu.", "La Genèse ne raconte pas ma mort.", "Dieu m'a pris, et on ne me trouva plus.", "Hébreux 11 me cite juste après Abel et Noé."], reponse: "Hénoc", leurres: ["Mathusalem", "Lémec", "Seth"] },
        { type: "qcm", q: "Que dit le texte de celui qui n'a pas la foi ?", choix: ["Il est impossible d'être agréable à Dieu sans elle", "Il sera puni", "Il n'entendra pas", "Il reste sous la loi"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le chapitre déroule ensuite toute la galerie : Abel, Noé, Abraham qui partit sans savoir où il allait, Sara, Isaac, Jacob, Joseph, Moïse qui préféra être maltraité avec le peuple de Dieu, la traversée de la mer Rouge, les murailles de Jéricho, Rahab, Gédéon, Samson, David, Samuel et les prophètes. « Tous ceux-là sont morts dans la foi, sans avoir obtenu les choses promises ; mais ils les ont vues et saluées de loin. »",
      ref: "Hébreux 11:8-40",
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui frappe chez ces témoins ?", choix: ["Ils sont morts sans avoir reçu la promesse, mais l'ont saluée de loin", "Ils ont tous été récompensés de leur vivant", "Ils étaient tous rois", "Ils n'ont jamais douté"], bonne: 0 },
        { type: "qcm", q: "Comment Abraham est-il décrit ?", choix: ["Il partit sans savoir où il allait", "Il exigea un signe", "Il refusa d'abord", "Il resta à Charan"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets ces témoins dans l'ordre où Hébreux 11 les cite :", items: ["Abel", "Hénoc", "Noé", "Abraham"] },
      ],
    },
    {
      recit:
        "« Nous donc aussi, puisque nous sommes environnés d'une si grande nuée de témoins, rejetons tout fardeau et le péché qui nous enveloppe si facilement, et courons avec persévérance dans la carrière qui nous est ouverte, ayant les regards sur Jésus, le chef et le consommateur de la foi. »",
      ref: "Hébreux 12:1-2",
      exercices: [
        { type: "verset", ref: "Hébreux 12:1", texte: "Courons avec persévérance dans la carrière qui nous est ouverte" },
        { type: "qcm", q: "À quoi la vie est-elle comparée ici ?", choix: ["À une course dans un stade, entourée de témoins", "À un combat", "À un voyage en mer", "À une moisson"], bonne: 0 },
        { type: "qcm", q: "Sur qui faut-il avoir les regards ?", choix: ["Sur Jésus, chef et consommateur de la foi", "Sur les témoins", "Sur la ligne d'arrivée", "Sur soi-même"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« N'oubliez pas l'hospitalité ; car, en l'exerçant, quelques-uns ont logé des anges sans le savoir. Souvenez-vous des prisonniers, comme si vous étiez aussi prisonniers. Ne vous livrez pas à l'amour de l'argent ; contentez-vous de ce que vous avez, car Dieu lui-même a dit : Je ne te délaisserai point, et je ne t'abandonnerai point. Jésus-Christ est le même hier, aujourd'hui, et éternellement. »",
      ref: "Hébreux 13:1-8",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Hébreux 13:8", texte: "Jésus-Christ est le même hier aujourd'hui et éternellement" },
        { type: "qcm", q: "Que dit le texte de l'hospitalité ?", choix: ["Quelques-uns ont logé des anges sans le savoir", "Elle est réservée aux riches", "Elle est facultative", "Elle remplace la prière"], bonne: 0 },
        { type: "vf", q: "La promesse « je ne te délaisserai point » avait déjà été dite à Josué.", vrai: true, ref: "Josué 1:5", niveau: "expert" },
      ],
    },
  ],
};
