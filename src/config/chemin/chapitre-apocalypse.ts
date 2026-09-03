import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 51 — L'Apocalypse (Apocalypse 1-22). 8 étapes. */
export const CHAPITRE_APOCALYPSE: CheminChapitre = {
  id: 51,
  nom: "L'Apocalypse",
  livre: "Apocalypse 1-22",
  accent: "#FDE047",
  decor: "/img/chemin/decor-51.jpg",
  sentier: [{ x: 58.6, y: 94 }, { x: 56.8, y: 84.3 }, { x: 43.2, y: 74.6 }, { x: 60.2, y: 64.9 }, { x: 62, y: 55 }, { x: 44.9, y: 45.3 }, { x: 48.1, y: 35.6 }, { x: 59.9, y: 26 }],
  fallback: ["#4a3f05", "#6b5b0b", "#221c02"],
  carte: {
    id: "jean",
    nom: "Jean",
    titre: "Le voyant de Patmos",
    rarete: "legendaire",
    image: "/img/chemin/cartes/jean.jpg",
  },
  etapes: [
    {
      recit:
        "« Moi Jean, votre frère et votre compagnon dans la tribulation, j'étais dans l'île appelée Patmos, à cause de la parole de Dieu et du témoignage de Jésus. Je fus ravi en esprit au jour du Seigneur, et j'entendis derrière moi une voix forte, comme le son d'une trompette, disant : Ce que tu vois, écris-le dans un livre. »",
      ref: "Apocalypse 1:9-11",
      exercices: [
        { type: "qui", indices: ["J'étais pêcheur sur le lac avec mon frère Jacques.", "J'ai vu la transfiguration sur la montagne.", "J'ai couru le premier au tombeau.", "Vieillard, je reçois des visions dans une île."], reponse: "Jean", leurres: ["Pierre", "Paul", "Jacques"] },
        { type: "qcm", q: "Sur quelle île Jean reçoit-il ces visions ?", choix: ["Patmos", "Chypre", "Malte", "Crète"], bonne: 0 },
        { type: "qcm", q: "Pourquoi s'y trouve-t-il ?", choix: ["À cause de la parole de Dieu et du témoignage de Jésus", "Pour du commerce", "Pour se reposer", "Il y est né"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Ne crains point ! Je suis le premier et le dernier, et le vivant. J'étais mort ; et voici, je suis vivant aux siècles des siècles. Je tiens les clefs de la mort et du séjour des morts. »",
      ref: "Apocalypse 1:17-18",
      exercices: [
        { type: "verset", ref: "Apocalypse 1:18", texte: "J'étais mort et voici je suis vivant aux siècles des siècles" },
        { type: "qcm", q: "Comment celui qui parle se désigne-t-il ?", choix: ["Le premier et le dernier, et le vivant", "Le roi des rois seulement", "L'agneau", "Le témoin fidèle"], bonne: 0 },
        { type: "qcm", q: "Quelles clefs dit-il tenir ?", choix: ["Celles de la mort et du séjour des morts", "Celles du temple", "Celles du royaume", "Celles des sept Églises"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Aux sept Églises furent adressées sept lettres. À Éphèse : « Tu as abandonné ton premier amour. » À Sardes : « Tu passes pour être vivant, et tu es mort. » À Laodicée : « Tu es tiède : je te vomirai de ma bouche. Voici, je me tiens à la porte, et je frappe. Si quelqu'un entend ma voix et ouvre la porte, j'entrerai chez lui, je souperai avec lui, et lui avec moi. »",
      ref: "Apocalypse 2-3",
      exercices: [
        { type: "verset", ref: "Apocalypse 3:20", texte: "Je me tiens à la porte et je frappe" },
        { type: "qcm", q: "Combien d'Églises reçoivent une lettre ?", choix: ["Sept", "Douze", "Trois", "Quatre"], bonne: 0 },
        { type: "qcm", q: "Que reproche-t-on à l'Église d'Éphèse ?", choix: ["D'avoir abandonné son premier amour", "D'être trop petite", "De ne pas travailler", "D'être divisée"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jean vit un livre scellé de sept sceaux, et un ange criant : « Qui est digne d'ouvrir le livre ? » Personne ne pouvait l'ouvrir, et Jean pleurait beaucoup. Alors un des anciens lui dit : « Ne pleure point ; voici, le lion de la tribu de Juda a vaincu pour ouvrir le livre. » Et Jean vit, au milieu du trône, un agneau qui était là comme immolé.",
      ref: "Apocalypse 5:1-6",
      exercices: [
        { type: "qcm", q: "Pourquoi Jean pleure-t-il ?", choix: ["Personne n'est digne d'ouvrir le livre", "Il a perdu la vision", "Il est seul", "Le livre est vide"], bonne: 0 },
        { type: "qcm", q: "Qui est annoncé comme le lion de Juda, mais apparaît comme un agneau ?", choix: ["Celui qui a vaincu, l'agneau immolé", "Un ange", "Un ancien", "David"], bonne: 0 },
        { type: "vf", q: "Le vainqueur apparaît sous les traits d'un agneau immolé, non d'un lion.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Après cela, je regardai, et voici, une grande foule que personne ne pouvait compter, de toute nation, de toute tribu, de tout peuple et de toute langue. Ils se tenaient devant le trône, revêtus de robes blanches, et des palmes dans leurs mains. Et ils criaient d'une voix forte : Le salut est à notre Dieu qui est assis sur le trône, et à l'agneau ! »",
      ref: "Apocalypse 7:9-10",
      coffre: true,
      exercices: [
        { type: "qcm", q: "D'où vient cette grande foule ?", choix: ["De toute nation, tribu, peuple et langue", "D'Israël seulement", "Des sept Églises", "De Jérusalem"], bonne: 0 },
        { type: "qcm", q: "Que tiennent-ils dans leurs mains ?", choix: ["Des palmes", "Des couronnes", "Des harpes", "Des livres"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Personne ne pouvait faire quoi, à propos de cette foule ?", choix: ["La compter", "L'approcher", "L'entendre", "La nommer"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Puis je vis un nouveau ciel et une nouvelle terre ; car le premier ciel et la première terre avaient disparu, et la mer n'était plus. Et je vis descendre du ciel, d'auprès de Dieu, la ville sainte, la nouvelle Jérusalem, préparée comme une épouse qui s'est parée pour son époux. »",
      ref: "Apocalypse 21:1-2",
      exercices: [
        { type: "qcm", q: "Que voit Jean après le premier ciel et la première terre ?", choix: ["Un nouveau ciel et une nouvelle terre", "Un désert", "Un temple seul", "Un trône vide"], bonne: 0 },
        { type: "qcm", q: "À quoi la nouvelle Jérusalem est-elle comparée ?", choix: ["À une épouse parée pour son époux", "À une forteresse", "À un jardin", "À un navire"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La ville descend du ciel, elle n'est pas bâtie par les hommes.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Voici, le tabernacle de Dieu est avec les hommes ! Il habitera avec eux, et ils seront son peuple, et Dieu lui-même sera avec eux. Il essuiera toute larme de leurs yeux, et la mort ne sera plus ; il n'y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu. » Et celui qui était assis sur le trône dit : « Voici, je fais toutes choses nouvelles. »",
      ref: "Apocalypse 21:3-5",
      exercices: [
        { type: "verset", ref: "Apocalypse 21:4", texte: "Il essuiera toute larme de leurs yeux et la mort ne sera plus" },
        { type: "qcm", q: "Que déclare celui qui est assis sur le trône ?", choix: ["« Je fais toutes choses nouvelles »", "« Tout est fini »", "« Le temps est court »", "« Venez à moi »"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce qui disparaît dans cette promesse ?", choix: ["La mort, le deuil, le cri et la douleur", "La nuit seulement", "La mer seulement", "Les nations"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'ange montra à Jean un fleuve d'eau de la vie, limpide comme du cristal, qui sortait du trône. Au milieu de la place de la ville et sur les deux bords du fleuve, il y avait un arbre de vie, et les feuilles de l'arbre servaient à la guérison des nations. Il n'y aura plus de nuit ; et le Seigneur Dieu les éclairera. Celui qui atteste ces choses dit : « Oui, je viens bientôt. » Amen ! Viens, Seigneur Jésus !",
      ref: "Apocalypse 22:1-20",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel arbre du premier livre de la Bible reparaît ici ?", choix: ["L'arbre de vie", "Le figuier", "L'olivier", "Le cèdre"], bonne: 0, ref: "Genèse 2:9" },
        { type: "qcm", q: "Par quels mots la Bible se termine-t-elle presque ?", choix: ["« Viens, Seigneur Jésus ! »", "« Amen, alléluia »", "« Que la grâce soit avec vous »", "« Tout est accompli »"], bonne: 0 },
        { type: "ordre", consigne: "Remets tout le Chemin dans l'ordre — de la première page à la dernière :", items: ["Un jardin, un arbre de vie, un fleuve", "Une promesse faite à Abraham", "Un enfant né à Bethléhem", "Une ville où l'arbre de vie reparaît"] },
      ],
    },
  ],
};
