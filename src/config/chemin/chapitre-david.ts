import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 15 — David et Goliath (1 Samuel 16-17). 8 étapes. */
export const CHAPITRE_DAVID: CheminChapitre = {
  id: 15,
  nom: "David et Goliath",
  livre: "1 Samuel 16-17",
  accent: "#F97316",
  decor: "/img/chemin/decor-15.jpg",
  sentier: [{ x: 56.3, y: 94 }, { x: 62.5, y: 84.3 }, { x: 77.7, y: 74.6 }, { x: 68.1, y: 64.9 }, { x: 46.8, y: 55 }, { x: 45.1, y: 45.3 }, { x: 54.9, y: 35.6 }, { x: 44.5, y: 26 }],
  fallback: ["#4a2405", "#6b350b", "#221002"],
  carte: {
    id: "david",
    nom: "David",
    titre: "Le berger à la fronde",
    rarete: "legendaire",
    image: "/img/chemin/cartes/david.jpg",
  },
  etapes: [
    {
      recit:
        "L'Éternel dit à Samuel : « Jusqu'à quand pleureras-tu sur Saül, que j'ai rejeté ? Remplis ta corne d'huile et va : je t'envoie chez Isaï, de Bethléem, car j'ai vu parmi ses fils celui que je désire pour roi. » Samuel partit et invita Isaï et ses fils au sacrifice.",
      ref: "1 Samuel 16:1-5",
      exercices: [
        { type: "qcm", q: "Chez qui Samuel est-il envoyé pour oindre un roi ?", choix: ["Chez Isaï, à Bethléem", "Chez Saül, à Guibea", "Chez Boaz, à Moab", "Chez Éli, à Silo"], bonne: 0 },
        { type: "qcm", q: "Que doit emporter Samuel ?", choix: ["Une corne d'huile", "Un rouleau de la loi", "Une épée", "Un agneau seulement"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Saül était encore roi à ce moment-là.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Quand Samuel vit Éliab, il se dit : « Certainement, l'oint de l'Éternel est ici devant lui. » Mais l'Éternel dit à Samuel : « Ne prends point garde à son apparence et à la hauteur de sa taille, car je l'ai rejeté. L'Éternel ne considère pas ce que l'homme considère : l'homme regarde à ce qui frappe les yeux, mais l'Éternel regarde au cœur. »",
      ref: "1 Samuel 16:6-7",
      exercices: [
        { type: "verset", ref: "1 Samuel 16:7", texte: "L'homme regarde à ce qui frappe les yeux mais l'Éternel regarde au cœur", niveau: "moyen" },
        { type: "qcm", q: "Pourquoi Éliab n'est-il pas choisi ?", choix: ["Dieu ne regarde pas l'apparence mais le cœur", "Il est trop jeune", "Il n'est pas de Bethléem", "Il refuse la royauté"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce qui avait impressionné Samuel chez Éliab ?", choix: ["Son apparence et sa haute taille", "Sa parole", "Son courage au combat", "Sa richesse"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Isaï fit passer ses sept fils devant Samuel, et Samuel dit : « L'Éternel n'a choisi aucun d'eux. Sont-ce là tous tes fils ? » — « Il reste encore le plus jeune, il fait paître les brebis. » On le fit venir : il était blond, avec de beaux yeux et une belle figure. L'Éternel dit : « Lève-toi, oins-le, car c'est lui ! »",
      ref: "1 Samuel 16:10-13",
      exercices: [
        { type: "qui", indices: ["Je suis le plus jeune de huit frères.", "Je garde les brebis pendant qu'on cherche un roi.", "J'abats un géant avec une pierre.", "Je deviendrai roi d'Israël."], reponse: "David", leurres: ["Jonathan", "Éliab", "Absalom"] },
        { type: "qcm", q: "Que faisait David quand Samuel le demande ?", choix: ["Il gardait les brebis", "Il combattait les Philistins", "Il étudiait la loi", "Il travaillait la vigne"], bonne: 0 },
        { type: "qcm", q: "Combien de frères passent devant Samuel avant David ?", choix: ["Sept", "Trois", "Douze", "Deux"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'esprit de l'Éternel se retira de Saül, et un mauvais esprit l'agitait. Ses serviteurs proposèrent de chercher un homme sachant jouer de la harpe. On amena David, fils d'Isaï. Lorsque l'esprit mauvais était sur Saül, David prenait la harpe et jouait de sa main : Saül respirait plus à l'aise et se trouvait soulagé.",
      ref: "1 Samuel 16:14-23",
      exercices: [
        { type: "qcm", q: "De quel instrument David joue-t-il devant Saül ?", choix: ["La harpe", "La trompette", "Le tambourin", "La flûte"], bonne: 0 },
        { type: "vf", q: "David est entré au service du roi bien avant de combattre Goliath.", vrai: true, niveau: "moyen" },
        { type: "qcm", q: "Quel effet la musique de David a-t-elle sur Saül ?", choix: ["Il respire plus à l'aise et se trouve soulagé", "Il s'endort trois jours", "Il devient furieux", "Il chante avec lui"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les Philistins se rassemblèrent dans la vallée des térébinthes. De leur camp sortit un homme de Gath nommé Goliath, haut de six coudées et un empan. Il criait chaque matin et chaque soir : « Choisissez un homme qui descende contre moi ! » Saül et tout Israël furent effrayés et eurent une grande peur, quarante jours durant.",
      ref: "1 Samuel 17:1-11",
      coffre: true,
      exercices: [
        { type: "qcm", q: "D'où vient Goliath ?", choix: ["De Gath", "De Gaza", "D'Askalon", "D'Ekron"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de jours le géant défie-t-il Israël ?", choix: ["Quarante jours", "Sept jours", "Trois jours", "Un seul jour"], bonne: 0, niveau: "expert" },
        { type: "trou", texte: "Les deux armées se font face dans la vallée des ___.", reponse: "térébinthes", leurres: ["oliviers", "cèdres", "palmiers"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Isaï envoya David porter du pain et du fromage à ses frères au camp. David entendit le défi du Philistin : « Qui est ce Philistin incirconcis, pour insulter l'armée du Dieu vivant ? » Éliab s'irrita contre lui : « Pourquoi es-tu descendu ? » On rapporta ses paroles à Saül, qui le fit venir.",
      ref: "1 Samuel 17:17-31",
      exercices: [
        { type: "qcm", q: "Pourquoi David vient-il au camp ?", choix: ["Porter des vivres à ses frères", "S'engager comme soldat", "Chanter devant l'armée", "Apporter un message du roi"], bonne: 0 },
        { type: "qcm", q: "Comment son frère Éliab réagit-il ?", choix: ["Il s'irrite contre lui", "Il l'encourage", "Il l'arme lui-même", "Il le ramène à Bethléem"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qu'est-ce qui indigne David dans le défi de Goliath ?", choix: ["Qu'il insulte l'armée du Dieu vivant", "Qu'il soit si grand", "Qu'il parle trop fort", "Qu'il vienne le matin"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "David dit à Saül : « Ton serviteur a tué le lion et l'ours ; ce Philistin sera comme l'un d'eux. L'Éternel me délivrera de la main de ce Philistin. » Saül lui fit revêtir son armure ; David essaya de marcher et ne put : « Je ne puis marcher avec cela, je n'y suis pas accoutumé. » Il s'en débarrassa.",
      ref: "1 Samuel 17:32-40",
      exercices: [
        { type: "qcm", q: "Quelles bêtes David dit-il avoir déjà tuées ?", choix: ["Un lion et un ours", "Un loup et un lion", "Un sanglier", "Un serpent"], bonne: 0 },
        { type: "qcm", q: "Pourquoi refuse-t-il l'armure de Saül ?", choix: ["Il n'y est pas accoutumé et ne peut marcher", "Elle est trop petite", "Elle est rouillée", "Saül la lui reprend"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de pierres David prend-il au torrent ?", choix: ["Cinq", "Trois", "Une seule", "Sept"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Le Philistin s'avança en méprisant David. David lui dit : « Tu marches contre moi avec l'épée, la lance et le javelot ; et moi je marche contre toi au nom de l'Éternel des armées. » Il mit la main dans sa gibecière, en tira une pierre et la lança avec sa fronde : elle frappa le Philistin au front. Goliath tomba le visage contre terre.",
      ref: "1 Samuel 17:41-51",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets l'histoire dans l'ordre :", items: ["Samuel oint le plus jeune fils d'Isaï", "David joue de la harpe devant Saül", "Goliath défie Israël quarante jours", "Une pierre de la fronde abat le géant"] },
        { type: "verset", ref: "1 Samuel 17:45", texte: "Je marche contre toi au nom de l'Éternel des armées", niveau: "moyen" },
        { type: "qcm", q: "Où la pierre frappe-t-elle Goliath ?", choix: ["Au front", "À la poitrine", "À la jambe", "À l'épaule"], bonne: 0 },
      ],
    },
  ],
};
