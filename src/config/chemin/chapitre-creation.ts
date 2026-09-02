import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 1 — La Création (Genèse 1-3). 10 étapes. */
export const CHAPITRE_CREATION: CheminChapitre = {
  id: 1,
  nom: "La Création",
  livre: "Genèse 1-3",
  accent: "#4ADE80",
  decor: "/img/chemin/decor-1.jpg",
  fallback: ["#0b3d2e", "#14532d", "#052e16"],
  carte: {
    id: "creation",
    nom: "La Création",
    titre: "Au commencement",
    rarete: "legendaire",
    image: "/img/chemin/cartes/creation.jpg",
  },
  etapes: [
    {
      recit:
        "Au commencement, Dieu créa les cieux et la terre. La terre était informe et vide, les ténèbres couvraient l'abîme, et l'Esprit de Dieu se mouvait au-dessus des eaux. Dieu dit : « Que la lumière soit ! » Et la lumière fut. Ce fut le premier jour.",
      ref: "Genèse 1:1-5",
      exercices: [
        { type: "qcm", q: "Quelles sont les toutes premières paroles de la Bible ?", choix: ["Au commencement", "Que la lumière soit", "Dieu est amour", "Il était une fois"], bonne: 0 },
        { type: "trou", texte: "Dieu dit : « Que la ___ soit ! » Et elle fut.", reponse: "lumière", leurres: ["terre", "mer", "vie"] },
        { type: "vf", q: "L'Esprit de Dieu se mouvait au-dessus des eaux.", vrai: true },
      ],
    },
    {
      recit:
        "Le deuxième jour, Dieu sépara les eaux d'en bas des eaux d'en haut : il appela l'étendue « ciel ». Le troisième jour, il rassembla les mers et fit paraître la terre sèche, puis la couvrit de verdure, d'herbes et d'arbres fruitiers portant leur semence.",
      ref: "Genèse 1:6-13",
      exercices: [
        { type: "qcm", q: "Qu'est-ce que Dieu crée le troisième jour ?", choix: ["La terre sèche et la végétation", "Les étoiles", "Les poissons", "L'homme"], bonne: 0 },
        { type: "ordre", consigne: "Remets ces créations dans l'ordre des jours :", items: ["La lumière", "Le ciel", "La terre et les plantes"] },
        { type: "vf", q: "Les arbres ont été créés avant la lumière.", vrai: false },
      ],
    },
    {
      recit:
        "Le quatrième jour, Dieu fit les deux grands luminaires : le soleil pour présider au jour, la lune pour présider à la nuit. Il fit aussi les étoiles, pour séparer la lumière des ténèbres et marquer les temps, les jours et les années.",
      ref: "Genèse 1:14-19",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Pourquoi Dieu crée-t-il les astres ?", choix: ["Pour marquer les temps, les jours et les années", "Pour décorer le ciel", "Pour guider les bateaux", "Pour éclairer l'Éden seulement"], bonne: 0 },
        { type: "trou", texte: "Le grand luminaire préside au jour, le petit préside à la ___.", reponse: "nuit", leurres: ["mer", "terre", "pluie"] },
        { type: "vf", q: "Le soleil et la lune sont créés le quatrième jour.", vrai: true },
      ],
    },
    {
      recit:
        "Le cinquième jour, Dieu remplit les mers de poissons et les cieux d'oiseaux. Il les bénit en disant : « Soyez féconds, multipliez-vous, et remplissez les eaux des mers ; et que les oiseaux multiplient sur la terre. »",
      ref: "Genèse 1:20-23",
      exercices: [
        { type: "qcm", q: "Que crée Dieu le cinquième jour ?", choix: ["Les poissons et les oiseaux", "Les animaux terrestres", "L'homme et la femme", "Les plantes"], bonne: 0 },
        { type: "vf", q: "Dieu bénit les poissons et les oiseaux.", vrai: true },
        { type: "trou", texte: "« Soyez féconds, ___-vous, et remplissez les eaux des mers. »", reponse: "multipliez", leurres: ["reposez", "cachez", "nourrissez"] },
      ],
    },
    {
      recit:
        "Le sixième jour, Dieu fit les animaux de la terre, puis il dit : « Faisons l'homme à notre image, selon notre ressemblance. » Dieu créa l'homme à son image, homme et femme il les créa, et il les bénit pour dominer sur la création.",
      ref: "Genèse 1:24-31",
      exercices: [
        { type: "qcm", q: "À l'image de qui l'homme est-il créé ?", choix: ["De Dieu", "Des anges", "Des animaux", "De la terre"], bonne: 0 },
        { type: "trou", texte: "« Faisons l'homme à notre ___, selon notre ressemblance. »", reponse: "image", leurres: ["force", "gloire", "pensée"] },
        { type: "vf", q: "L'homme et les animaux terrestres sont créés le même jour.", vrai: true },
      ],
    },
    {
      recit:
        "Dieu vit tout ce qu'il avait fait : et voici, cela était très bon. Le septième jour, Dieu acheva son œuvre et se reposa. Il bénit le septième jour et le sanctifia — le jour du repos.",
      ref: "Genèse 1:31-2:3",
      exercices: [
        { type: "qcm", q: "Que fait Dieu le septième jour ?", choix: ["Il se repose et sanctifie ce jour", "Il crée les étoiles", "Il plante l'Éden", "Il crée la femme"], bonne: 0 },
        { type: "vf", q: "Après la création, Dieu déclara que tout était « très bon ».", vrai: true },
        { type: "ordre", consigne: "Remets ces étapes dans l'ordre :", items: ["Poissons et oiseaux", "Animaux et l'homme", "Le repos de Dieu"] },
      ],
    },
    {
      recit:
        "L'Éternel Dieu planta un jardin en Éden et y plaça l'homme pour le cultiver et le garder. Au milieu du jardin : l'arbre de la vie et l'arbre de la connaissance du bien et du mal. Dieu commanda : « Tu pourras manger de tous les arbres, mais tu ne mangeras pas de l'arbre de la connaissance du bien et du mal. »",
      ref: "Genèse 2:8-17",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quels sont les deux arbres au milieu du jardin ?", choix: ["L'arbre de vie et celui de la connaissance du bien et du mal", "Le figuier et l'olivier", "Le cèdre et le palmier", "La vigne et le grenadier"], bonne: 0 },
        { type: "trou", texte: "Dieu plaça l'homme dans le jardin pour le cultiver et le ___.", reponse: "garder", leurres: ["vendre", "quitter", "mesurer"] },
        { type: "vf", q: "Dieu interdit de manger de tous les arbres du jardin.", vrai: false },
      ],
    },
    {
      recit:
        "L'Éternel Dieu dit : « Il n'est pas bon que l'homme soit seul ; je lui ferai une aide semblable à lui. » Il fit tomber un profond sommeil sur Adam, prit une de ses côtes et en forma la femme. Adam s'écria : « Voici l'os de mes os et la chair de ma chair ! »",
      ref: "Genèse 2:18-25",
      exercices: [
        { type: "qcm", q: "Pourquoi Dieu crée-t-il la femme ?", choix: ["« Il n'est pas bon que l'homme soit seul »", "Pour cultiver le jardin", "Pour nommer les animaux", "Parce qu'Adam l'a demandé"], bonne: 0 },
        { type: "trou", texte: "« Voici l'os de mes os et la ___ de ma chair ! »", reponse: "chair", leurres: ["joie", "vie", "force"] },
        { type: "vf", q: "La femme est formée à partir d'une côte d'Adam.", vrai: true },
      ],
    },
    {
      recit:
        "Le serpent, le plus rusé des animaux, dit à la femme : « Dieu a-t-il réellement dit… ? Vous ne mourrez point ! » La femme vit que l'arbre était bon à manger et agréable à la vue : elle prit du fruit, en mangea, et en donna aussi à son mari. Alors leurs yeux s'ouvrirent et ils se cachèrent loin de Dieu.",
      ref: "Genèse 3:1-8",
      exercices: [
        { type: "qcm", q: "Quelle est la première question du serpent ?", choix: ["« Dieu a-t-il réellement dit… ? »", "« Où es-tu ? »", "« Pourquoi as-tu peur ? »", "« Veux-tu être riche ? »"], bonne: 0 },
        { type: "vf", q: "Adam et Ève se cachèrent loin de la face de Dieu.", vrai: true },
        { type: "ordre", consigne: "Remets la chute dans l'ordre :", items: ["Le serpent sème le doute", "La femme mange du fruit", "Ils se cachent de Dieu"] },
      ],
    },
    {
      recit:
        "Dieu appela : « Où es-tu ? » Le péché a un prix : la souffrance, le sol maudit, la sortie du jardin. Mais dès ce jour, Dieu annonce l'espérance : la postérité de la femme écrasera la tête du serpent — première promesse du Sauveur. Et l'Éternel fit lui-même des habits pour les couvrir.",
      ref: "Genèse 3:9-24",
      exercices: [
        { type: "qcm", q: "Quelle promesse Dieu fait-il en Genèse 3:15 ?", choix: ["La postérité de la femme écrasera le serpent", "Un déluge viendra", "Abraham aura un fils", "Le temple sera bâti"], bonne: 0 },
        { type: "trou", texte: "Dieu appela l'homme et lui dit : « ___ es-tu ? »", reponse: "Où", leurres: ["Qui", "Pourquoi", "Comment"] },
        { type: "vf", q: "Malgré la faute, Dieu couvre lui-même Adam et Ève.", vrai: true },
      ],
    },
  ],
};
