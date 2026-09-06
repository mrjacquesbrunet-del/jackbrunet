import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 26 — Daniel (Daniel 1-6). 8 étapes. */
export const CHAPITRE_DANIEL: CheminChapitre = {
  id: 26,
  nom: "Daniel",
  livre: "Daniel 1-6",
  accent: "#818CF8",
  decor: "/img/chemin/decor-26.jpg",
  sentier: [{ x: 66.9, y: 94 }, { x: 55.2, y: 84.3 }, { x: 60, y: 74.6 }, { x: 44.2, y: 64.9 }, { x: 60.1, y: 55 }, { x: 76.4, y: 45.3 }, { x: 59.7, y: 35.6 }, { x: 52.5, y: 26 }],
  fallback: ["#20244a", "#31376b", "#0d0f22"],
  carte: {
    id: "daniel",
    nom: "Daniel",
    titre: "Celui que les lions n'ont pas touché",
    rarete: "legendaire",
    image: "/img/chemin/cartes/daniel.jpg",
  },
  etapes: [
    {
      recit:
        "Nebucadnetsar, roi de Babylone, fit venir de jeunes Israélites de race royale, beaux de figure et instruits, pour les former trois ans à la langue des Chaldéens. Parmi eux se trouvaient Daniel, Hanania, Mischaël et Azaria. Le chef des eunuques leur donna d'autres noms : Beltschatsar, Schadrac, Méschac et Abed-Nego.",
      ref: "Daniel 1:1-7",
      exercices: [
        { type: "qcm", q: "Pourquoi ces jeunes sont-ils emmenés à Babylone ?", choix: ["Pour être formés au service du roi", "Pour être vendus", "Pour bâtir la ville", "Pour servir dans l'armée"], bonne: 0 },
        { type: "qcm", q: "Quels sont les noms babyloniens des trois compagnons de Daniel ?", choix: ["Schadrac, Méschac et Abed-Nego", "Éliphaz, Bildad et Tsophar", "Hanania, Mischaël et Azaria", "Gaspard, Melchior et Balthazar"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien d'années dure leur formation ?", choix: ["Trois ans", "Sept ans", "Un an", "Dix ans"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Daniel résolut de ne pas se souiller par les mets du roi ni par son vin. Il proposa une épreuve de dix jours : de l'eau et des légumes seulement. Au bout de dix jours, leur mine était meilleure et leur chair plus grasse que celle des jeunes gens qui mangeaient les mets du roi. Dieu leur accorda science et intelligence.",
      ref: "Daniel 1:8-17",
      exercices: [
        { type: "qcm", q: "Que demande Daniel à la place des mets du roi ?", choix: ["De l'eau et des légumes", "Du pain seulement", "Rien du tout", "De la viande d'Israël"], bonne: 0 },
        { type: "qcm", q: "Combien de jours dure l'épreuve ?", choix: ["Dix jours", "Trois jours", "Quarante jours", "Sept jours"], bonne: 0, niveau: "moyen" },
        { type: "qui", indices: ["Je refuse les mets du roi pour rester fidèle.", "J'explique un songe que personne ne peut retrouver.", "Je prie trois fois par jour, fenêtres ouvertes.", "Je passe une nuit entière parmi les lions."], reponse: "Daniel", leurres: ["Néhémie", "Esdras", "Mardochée"] },
      ],
    },
    {
      recit:
        "Le roi fit un songe et exigea que ses sages lui disent le songe lui-même avant de l'expliquer — sinon ils mourraient tous. Daniel demanda un délai et pria avec ses compagnons. Le secret lui fut révélé pendant la nuit. Il bénit Dieu : « Il révèle ce qui est profond et caché, il connaît ce qui est dans les ténèbres, et la lumière demeure avec lui. »",
      ref: "Daniel 2:1-23",
      exercices: [
        { type: "qcm", q: "Qu'exige le roi de ses sages ?", choix: ["Qu'ils lui disent le songe avant de l'expliquer", "Qu'ils bâtissent une statue", "Qu'ils quittent la ville", "Qu'ils jeûnent sept jours"], bonne: 0 },
        { type: "qcm", q: "Comment Daniel obtient-il le secret ?", choix: ["Par la prière avec ses compagnons, révélé la nuit", "En interrogeant les mages", "En lisant les archives", "En observant les astres"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« Il connaît ce qui est dans les ténèbres, et la ___ demeure avec lui. »", reponse: "lumière", leurres: ["nuit", "gloire", "paix"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Daniel expliqua le songe : une grande statue à la tête d'or, la poitrine d'argent, le ventre d'airain, les jambes de fer et les pieds mêlés de fer et d'argile. Une pierre se détacha sans le secours d'aucune main, frappa les pieds et brisa la statue ; puis elle devint une grande montagne qui remplit toute la terre.",
      ref: "Daniel 2:31-45",
      exercices: [
        { type: "ordre", consigne: "Remets les matériaux de la statue, de la tête aux pieds :", items: ["La tête d'or", "La poitrine d'argent", "Le ventre d'airain", "Les jambes de fer et les pieds d'argile"] },
        { type: "qcm", q: "Qu'est-ce qui brise la statue ?", choix: ["Une pierre détachée sans le secours d'aucune main", "Un tremblement de terre", "Une armée", "Le feu du ciel"], bonne: 0 },
        { type: "qcm", q: "Que devient cette pierre ?", choix: ["Une grande montagne qui remplit toute la terre", "Un autel", "Une ville", "Poussière"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le roi dressa une statue d'or et ordonna à tous de se prosterner au son des instruments. Schadrac, Méschac et Abed-Nego refusèrent : « Notre Dieu que nous servons peut nous délivrer de la fournaise ardente. Et même s'il ne le faisait pas, sache, ô roi, que nous ne servirons pas tes dieux. »",
      ref: "Daniel 3:1-18",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que refusent les trois compagnons ?", choix: ["De se prosterner devant la statue d'or", "De manger les mets du roi", "De servir à la cour", "De prier en public"], bonne: 0 },
        { type: "qcm", q: "Que répondent-ils au roi ?", choix: ["« Même s'il ne nous délivre pas, nous ne servirons pas tes dieux »", "« Nous obéirons cette fois »", "« Donne-nous trois jours »", "« Notre Dieu nous délivrera sûrement »"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Leur fidélité ne dépendait pas d'être sauvés.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "La fournaise fut chauffée sept fois plus qu'à l'ordinaire, et la flamme tua ceux qui les y jetèrent. Le roi se leva effrayé : « N'avons-nous pas jeté trois hommes liés ? Voici, j'en vois quatre qui marchent au milieu du feu, sans blessure, et la figure du quatrième ressemble à celle d'un fils des dieux. » Pas un cheveu de leur tête n'avait été brûlé, et ils ne sentaient pas le feu.",
      ref: "Daniel 3:19-27",
      exercices: [
        { type: "qcm", q: "Combien d'hommes le roi voit-il dans la fournaise ?", choix: ["Quatre, alors qu'on n'en a jeté que trois", "Trois", "Un seul", "Sept"], bonne: 0 },
        { type: "qcm", q: "Combien de fois la fournaise est-elle chauffée plus que d'ordinaire ?", choix: ["Sept fois", "Trois fois", "Deux fois", "Dix fois"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Dans quel état sortent-ils ?", choix: ["Pas un cheveu brûlé, sans même l'odeur du feu", "Brûlés mais vivants", "Évanouis", "Aveuglés"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Sous le roi Darius, des chefs jaloux firent signer un édit : quiconque adresserait une prière à un autre qu'au roi pendant trente jours serait jeté aux lions. Daniel, l'ayant appris, monta dans sa maison où les fenêtres étaient ouvertes du côté de Jérusalem, et trois fois par jour il se mettait à genoux et priait, comme il le faisait auparavant.",
      ref: "Daniel 6:1-11",
      exercices: [
        { type: "qcm", q: "Que fait Daniel quand l'édit est signé ?", choix: ["Il continue de prier trois fois par jour, fenêtres ouvertes", "Il prie en cachette", "Il cesse de prier un mois", "Il fuit la ville"], bonne: 0 },
        { type: "qcm", q: "Combien de jours dure l'interdiction ?", choix: ["Trente jours", "Sept jours", "Trois jours", "Un an"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Pourquoi les chefs ont-ils fait signer cet édit ?", choix: ["Par jalousie, pour piéger Daniel", "Pour honorer le roi", "Pour économiser le trésor", "Sur ordre des prêtres"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "On jeta Daniel dans la fosse aux lions et on scella la pierre. Le roi passa la nuit à jeun, sans sommeil. Au point du jour il cria : « Daniel, ton Dieu a-t-il pu te délivrer ? » Daniel répondit : « Mon Dieu a envoyé son ange et fermé la gueule des lions, parce que j'ai été trouvé innocent devant lui. » On le retira sain et sauf.",
      ref: "Daniel 6:16-24",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Comment Daniel explique-t-il d'être sauvé ?", choix: ["Dieu a envoyé son ange fermer la gueule des lions", "Les lions n'avaient pas faim", "Il s'est caché dans un coin", "Le roi a fait retirer les lions"], bonne: 0 },
        { type: "qcm", q: "Comment le roi passe-t-il la nuit ?", choix: ["À jeun et sans sommeil", "En festin", "En prière au temple", "En voyage"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets le livre de Daniel dans l'ordre :", items: ["Le refus des mets du roi", "Le songe de la grande statue", "La fournaise ardente", "La fosse aux lions"] },
      ],
    },
  ],
};
