import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 20 — Élisée (2 Rois 2-6). 8 étapes. */
export const CHAPITRE_ELISEE: CheminChapitre = {
  id: 20,
  nom: "Élisée",
  livre: "2 Rois 2-6",
  accent: "#2DD4BF",
  decor: "/img/chemin/decor-20.jpg",
  sentier: [{ x: 47.8, y: 94 }, { x: 50.3, y: 84.3 }, { x: 52.2, y: 74.6 }, { x: 42.6, y: 64.9 }, { x: 53, y: 55 }, { x: 49.5, y: 45.3 }, { x: 48.7, y: 35.6 }, { x: 52.7, y: 26 }],
  fallback: ["#0a3f39", "#105a51", "#031c19"],
  carte: {
    id: "elisee",
    nom: "Élisée",
    titre: "La double portion",
    rarete: "legendaire",
    image: "/img/chemin/cartes/elisee.jpg",
  },
  etapes: [
    {
      recit:
        "Élie trouva Élisée qui labourait avec douze paires de bœufs. Il passa près de lui et jeta sur lui son manteau. Élisée quitta les bœufs, courut après Élie et dit : « Laisse-moi embrasser mon père et ma mère, et je te suivrai. » Il revint, immola une paire de bœufs, la fit cuire avec l'attelage et suivit Élie comme serviteur.",
      ref: "1 Rois 19:19-21",
      exercices: [
        { type: "qcm", q: "Que faisait Élisée quand Élie l'appelle ?", choix: ["Il labourait avec douze paires de bœufs", "Il gardait les brebis", "Il pêchait", "Il bâtissait une maison"], bonne: 0 },
        { type: "qcm", q: "Quel geste marque l'appel d'Élisée ?", choix: ["Élie jette son manteau sur lui", "Élie lui donne une fiole d'huile", "Élie lui remet un rouleau", "Élie lui impose les mains"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que fait Élisée de son attelage ?", choix: ["Il l'immole et le fait cuire : il ne revient pas en arrière", "Il le vend", "Il le confie à son père", "Il l'emmène avec lui"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Le jour où l'Éternel enleva Élie, Élisée refusa de le quitter. Élie dit : « Demande ce que tu veux que je fasse pour toi. » Élisée répondit : « Qu'il y ait sur moi une double portion de ton esprit. » — « Tu demandes une chose difficile ; si tu me vois quand je serai enlevé, il en sera ainsi. »",
      ref: "2 Rois 2:1-10",
      exercices: [
        { type: "qui", indices: ["Je laboure quand un manteau tombe sur mes épaules.", "Je demande une double portion de l'esprit de mon maître.", "Je vois un char de feu emporter celui que je suivais.", "Je frappe le Jourdain avec son manteau et l'eau se partage."], reponse: "Élisée", leurres: ["Élie", "Guéhazi", "Michée"] },
        { type: "qcm", q: "Que demande Élisée à Élie ?", choix: ["Une double portion de son esprit", "Son manteau seulement", "Une place dans le palais", "De rester en vie"], bonne: 0 },
        { type: "trou", texte: "Élie répond : « Tu demandes une chose ___. »", reponse: "difficile", leurres: ["simple", "juste", "sage"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comme ils continuaient à marcher en parlant, voici, un char de feu et des chevaux de feu les séparèrent l'un de l'autre, et Élie monta au ciel dans un tourbillon. Élisée le regardait en criant : « Mon père ! mon père ! Char d'Israël et sa cavalerie ! » Il ramassa le manteau tombé, frappa les eaux du Jourdain, et elles se partagèrent.",
      ref: "2 Rois 2:11-14",
      exercices: [
        { type: "qcm", q: "Comment Élie quitte-t-il la terre ?", choix: ["Enlevé au ciel dans un tourbillon, avec un char de feu", "Il meurt de vieillesse", "Il disparaît dans le désert", "Il est tué par Jézabel"], bonne: 0 },
        { type: "qcm", q: "Que ramasse Élisée ?", choix: ["Le manteau tombé d'Élie", "Une fiole d'huile", "Un bâton", "Une pierre du Carmel"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le Jourdain se partage aussi devant Élisée.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Une femme de la troupe des prophètes cria à Élisée : « Ton serviteur, mon mari, est mort, et le créancier vient prendre mes deux enfants. » — « Que possèdes-tu ? » — « Rien, sinon un vase d'huile. » Il lui dit d'emprunter des vases vides à tous ses voisins et de verser. Elle versa jusqu'à ce qu'il n'y eût plus de vase : l'huile s'arrêta.",
      ref: "2 Rois 4:1-7",
      exercices: [
        { type: "qcm", q: "Que possédait la veuve endettée ?", choix: ["Un seul vase d'huile", "Un champ", "Deux brebis", "Un peu d'argent"], bonne: 0 },
        { type: "qcm", q: "Quand l'huile s'arrête-t-elle de couler ?", choix: ["Quand il n'y a plus de vase à remplir", "Au bout de sept jours", "Quand elle cesse de prier", "Au lever du soleil"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Élisée demande à la veuve d'emprunter beaucoup de vases vides.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Une femme de Sunem fit bâtir sur le toit une petite chambre pour Élisée, avec un lit, une table, un siège et un chandelier. Pour la remercier, il lui annonça un fils. L'enfant grandit, puis mourut sur les genoux de sa mère. Elle courut jusqu'au Carmel. Élisée monta, se coucha sur l'enfant, et l'enfant éternua sept fois et ouvrit les yeux.",
      ref: "2 Rois 4:8-37",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que la Sunamite prépare-t-elle pour Élisée ?", choix: ["Une petite chambre sur le toit", "Un champ", "Un âne", "Un repas chaque jour"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que contient la chambre ?", choix: ["Un lit, une table, un siège et un chandelier", "Un autel", "Des livres", "Rien"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Combien de fois l'enfant éternue-t-il ?", choix: ["Sept fois", "Trois fois", "Une fois", "Douze fois"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Naaman, chef de l'armée de Syrie, était lépreux. Une petite servante israélite dit à sa maîtresse : « Oh ! si mon seigneur était auprès du prophète qui est à Samarie, il le guérirait ! » Naaman vint avec ses chars. Élisée ne sortit même pas : il envoya dire : « Va, lave-toi sept fois dans le Jourdain, et tu seras pur. »",
      ref: "2 Rois 5:1-10",
      exercices: [
        { type: "qcm", q: "Qui parle la première de la guérison possible de Naaman ?", choix: ["Une petite servante israélite", "Le roi de Syrie", "Élisée lui-même", "Un médecin"], bonne: 0 },
        { type: "qcm", q: "Que doit faire Naaman pour être guéri ?", choix: ["Se laver sept fois dans le Jourdain", "Offrir un sacrifice", "Payer dix talents d'argent", "Jeûner sept jours"], bonne: 0 },
        { type: "vf", q: "Élisée sort en personne accueillir le grand général.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Naaman se mit en colère : « Les fleuves de Damas ne valent-ils pas mieux que toutes les eaux d'Israël ? » Ses serviteurs lui dirent : « Si le prophète t'avait demandé une chose difficile, ne l'aurais-tu pas faite ? » Il descendit alors, se plongea sept fois dans le Jourdain, et sa chair redevint comme celle d'un jeune enfant.",
      ref: "2 Rois 5:11-15",
      exercices: [
        { type: "qcm", q: "Pourquoi Naaman se met-il d'abord en colère ?", choix: ["Le remède lui paraît trop simple et indigne de lui", "Le prix est trop élevé", "Le voyage est trop long", "Élisée l'insulte"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qui le convainc d'obéir ?", choix: ["Ses propres serviteurs", "Le roi d'Israël", "Sa femme", "Guéhazi"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Sa chair redevint comme celle d'un jeune ___.", reponse: "enfant", leurres: ["homme", "soldat", "roi"], niveau: "expert" },
      ],
    },
    {
      recit:
        "Le roi de Syrie envoya une grande armée cerner la ville où était Élisée. Le serviteur du prophète se leva de bon matin et vit les chevaux et les chars : « Ah ! mon seigneur, comment ferons-nous ? » — « Ne crains point, car ceux qui sont avec nous sont en plus grand nombre que ceux qui sont avec eux. » Élisée pria, l'Éternel ouvrit les yeux du serviteur : la montagne était pleine de chevaux et de chars de feu.",
      ref: "2 Rois 6:8-17",
      coffre: true,
      exercices: [
        { type: "verset", ref: "2 Rois 6:16", texte: "Ceux qui sont avec nous sont en plus grand nombre que ceux qui sont avec eux", niveau: "moyen" },
        { type: "qcm", q: "Que voit le serviteur quand Dieu lui ouvre les yeux ?", choix: ["La montagne pleine de chevaux et de chars de feu", "L'armée syrienne en fuite", "Un ange à la porte", "Un mur de flammes"], bonne: 0 },
        { type: "ordre", consigne: "Remets le ministère d'Élisée dans l'ordre :", items: ["Le manteau d'Élie tombe sur ses épaules", "Le char de feu et la double portion", "L'huile de la veuve ne s'arrête pas", "Naaman se plonge sept fois dans le Jourdain"] },
      ],
    },
  ],
};
