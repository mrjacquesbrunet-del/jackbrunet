import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 1 — La Création (Genèse 1-3). 10 étapes. */
export const CHAPITRE_CREATION: CheminChapitre = {
  id: 1,
  nom: "La Création",
  livre: "Genèse 1-3",
  accent: "#4ADE80",
  decor: "/img/chemin/decor-1.jpg",
  sentier: [{ x: 50.2, y: 93 }, { x: 43.9, y: 83.9 }, { x: 58.5, y: 74.8 }, { x: 71.9, y: 65.7 }, { x: 71.1, y: 56.6 }, { x: 42.5, y: 47.4 }, { x: 54.7, y: 38.3 }, { x: 50.2, y: 29.2 }, { x: 48.5, y: 20.1 }, { x: 59.9, y: 11 }],
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
        { type: "vf", q: "Dieu sépara la lumière d'avec les ténèbres dès le premier jour.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le deuxième jour, Dieu sépara les eaux d'en bas des eaux d'en haut : il appela l'étendue « ciel ». Le troisième jour, il rassembla les mers et fit paraître la terre sèche, puis la couvrit de verdure, d'herbes et d'arbres fruitiers portant leur semence.",
      ref: "Genèse 1:6-13",
      exercices: [
        { type: "ordre", consigne: "Remets les trois premiers jours dans l'ordre :", items: ["La lumière", "L'étendue appelée ciel", "La terre sèche et la végétation"] },
        { type: "qcm", q: "Que sépare l'étendue créée le deuxième jour ?", choix: ["Les eaux d'en bas et les eaux d'en haut", "Le jour et la nuit", "La mer et le désert", "Les plantes et les arbres"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Les arbres fruitiers portent leur semence en eux-mêmes.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le quatrième jour, Dieu fit les deux grands luminaires : le soleil pour présider au jour, la lune pour présider à la nuit. Il fit aussi les étoiles, pour séparer la lumière des ténèbres et marquer les temps, les jours et les années.",
      ref: "Genèse 1:14-19",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Genèse 1:1", texte: "Au commencement Dieu créa les cieux et la terre", niveau: "moyen" },
        { type: "qcm", q: "Pourquoi Dieu crée-t-il les astres ?", choix: ["Pour marquer les temps, les jours et les années", "Pour décorer le ciel", "Pour guider les bateaux", "Pour éclairer l'Éden seulement"], bonne: 0 },
        { type: "trou", texte: "Le grand luminaire préside au jour, le petit préside à la ___.", reponse: "nuit", leurres: ["mer", "terre", "pluie"] },
      ],
    },
    {
      recit:
        "Le cinquième jour, Dieu remplit les mers de poissons et les cieux d'oiseaux. Il les bénit en disant : « Soyez féconds, multipliez-vous, et remplissez les eaux des mers ; et que les oiseaux multiplient sur la terre. »",
      ref: "Genèse 1:20-23",
      exercices: [
        { type: "qcm", q: "Que crée Dieu le cinquième jour ?", choix: ["Les poissons et les oiseaux", "Les animaux terrestres", "L'homme et la femme", "Les plantes"], bonne: 0 },
        { type: "trou", texte: "« Soyez féconds, ___-vous, et remplissez les eaux des mers. »", reponse: "multipliez", leurres: ["reposez", "cachez", "nourrissez"] },
        { type: "vf", q: "Les grands animaux marins sont créés avant les animaux de la terre ferme.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le sixième jour, Dieu fit les animaux de la terre, puis il dit : « Faisons l'homme à notre image, selon notre ressemblance. » Dieu créa l'homme à son image, homme et femme il les créa, et il les bénit pour dominer sur la création.",
      ref: "Genèse 1:24-31",
      exercices: [
        { type: "qui", indices: ["Je suis formé de la poussière de la terre.", "Dieu souffle dans mes narines un souffle de vie.", "Je donne leur nom à tous les animaux.", "Je suis le premier homme."], reponse: "Adam", leurres: ["Noé", "Abel", "Caïn"], niveau: "moyen" },
        { type: "qcm", q: "À l'image de qui l'homme est-il créé ?", choix: ["De Dieu", "De la terre", "Des anges", "Des animaux"], bonne: 0 },
        { type: "vf", q: "Homme et femme sont créés le même jour.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dieu vit tout ce qu'il avait fait : et voici, cela était très bon. Le septième jour, Dieu acheva son œuvre et se reposa. Il bénit le septième jour et le sanctifia — le jour du repos.",
      ref: "Genèse 1:31-2:3",
      exercices: [
        { type: "trou", texte: "Dieu vit tout ce qu'il avait fait, et voici, cela était très ___.", reponse: "bon", leurres: ["grand", "beau", "vaste"] },
        { type: "qcm", q: "Que fait Dieu du septième jour ?", choix: ["Il le bénit et le sanctifie", "Il crée les anges", "Il plante l'Éden", "Il donne la loi"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que signifie que Dieu « sanctifie » le septième jour ?", choix: ["Il le met à part pour lui", "Il le raccourcit", "Il l'oublie", "Il le donne aux animaux"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'Éternel Dieu planta un jardin en Éden et y plaça l'homme pour le cultiver et le garder. Au milieu du jardin : l'arbre de la vie et l'arbre de la connaissance du bien et du mal. Dieu commanda : « Tu pourras manger de tous les arbres, mais tu ne mangeras pas de l'arbre de la connaissance du bien et du mal. »",
      ref: "Genèse 2:8-17",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel arbre l'homme ne doit-il pas toucher ?", choix: ["L'arbre de la connaissance du bien et du mal", "L'arbre de vie", "Le figuier", "L'olivier"], bonne: 0 },
        { type: "qcm", q: "Combien de fleuves sortent d'Éden pour arroser le jardin ?", choix: ["Quatre", "Deux", "Sept", "Un seul"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Lequel de ces fleuves n'est PAS cité en Genèse 2 ?", choix: ["Le Jourdain", "Le Pischon", "Le Guihon", "L'Euphrate"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'Éternel Dieu dit : « Il n'est pas bon que l'homme soit seul ; je lui ferai une aide semblable à lui. » Il fit tomber un profond sommeil sur Adam, prit une de ses côtes et en forma la femme. Adam s'écria : « Voici l'os de mes os et la chair de ma chair ! »",
      ref: "Genèse 2:18-25",
      exercices: [
        { type: "verset", ref: "Genèse 2:24", texte: "L'homme quittera son père et sa mère et s'attachera à sa femme", niveau: "expert" },
        { type: "qcm", q: "Que dit Dieu avant de créer la femme ?", choix: ["Il n'est pas bon que l'homme soit seul", "Que la lumière soit", "Soyez féconds", "Où es-tu ?"], bonne: 0 },
        { type: "vf", q: "C'est l'homme qui donne leur nom aux animaux.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le serpent, le plus rusé des animaux, dit à la femme : « Dieu a-t-il réellement dit… ? Vous ne mourrez point ! » La femme vit que l'arbre était bon à manger et agréable à la vue : elle prit du fruit, en mangea, et en donna aussi à son mari. Alors leurs yeux s'ouvrirent et ils se cachèrent loin de Dieu.",
      ref: "Genèse 3:1-8",
      exercices: [
        { type: "qui", indices: ["Je suis le plus rusé des animaux des champs.", "Je pose une question sur ce que Dieu a vraiment dit.", "Je promets que vos yeux s'ouvriront.", "Je serai maudit et je ramperai sur mon ventre."], reponse: "Le serpent", leurres: ["Le lion", "L'aigle", "Le bélier"], niveau: "moyen" },
        { type: "qcm", q: "Que promet le serpent à la femme ?", choix: ["Vous serez comme des dieux, connaissant le bien et le mal", "Vous vivrez cent ans", "Vous quitterez le jardin", "Vous aurez beaucoup d'enfants"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que font l'homme et la femme juste après avoir mangé ?", choix: ["Ils cousent des feuilles de figuier", "Ils s'enfuient du jardin", "Ils prient", "Ils plantent un arbre"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Dieu appela : « Où es-tu ? » Le péché a un prix : la souffrance, le sol maudit, la sortie du jardin. Mais dès ce jour, Dieu annonce l'espérance : la postérité de la femme écrasera la tête du serpent — première promesse du Sauveur. Et l'Éternel fit lui-même des habits pour les couvrir.",
      ref: "Genèse 3:9-24",
      exercices: [
        { type: "ordre", consigne: "Remets la fin du récit dans l'ordre :", items: ["Dieu appelle : « Où es-tu ? »", "Dieu annonce la promesse à la postérité de la femme", "Dieu fait des habits de peau", "L'homme est chassé du jardin"] },
        { type: "qcm", q: "Quelle promesse Dieu fait-il en Genèse 3:15 ?", choix: ["La postérité de la femme écrasera la tête du serpent", "Un déluge viendra", "Abraham aura un fils", "Le temple sera bâti"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Qui garde le chemin de l'arbre de vie ?", choix: ["Des chérubins et une épée flamboyante", "Un ange seul", "Un mur de pierre", "Un fleuve"], bonne: 0, niveau: "expert" },
      ],
    },
  ],
};
