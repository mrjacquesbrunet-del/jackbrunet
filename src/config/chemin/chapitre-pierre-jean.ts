import type { CheminChapitre } from "@/lib/chemin";

/**
 * Les lettres de Pierre, de Jean et de Jude
 * (1-2 Pierre, 1-3 Jean, Jude). 8 étapes.
 */
export const CHAPITRE_PIERRE_JEAN: CheminChapitre = {
  id: 55,
  nom: "Pierre, Jean et Jude",
  livre: "1 Pierre à Jude",
  accent: "#67E8F9",
  decor: "/img/chemin/decor-55.jpg",
  sentier: [{ x: 53.2, y: 94 }, { x: 54.6, y: 84.3 }, { x: 44.2, y: 74.6 }, { x: 45.1, y: 64.9 }, { x: 41.1, y: 55 }, { x: 33.6, y: 45.3 }, { x: 42.3, y: 35.6 }, { x: 38.2, y: 26 }],
  fallback: ["#0a3a44", "#105461", "#03191d"],
  carte: {
    id: "marc",
    nom: "Marc",
    titre: "Le compagnon repris",
    rarete: "epique",
    image: "/img/chemin/cartes/marc.jpg",
  },
  etapes: [
    {
      recit:
        "Pierre écrit à des chrétiens dispersés et persécutés : « Béni soit Dieu, qui, selon sa grande miséricorde, nous a régénérés pour une espérance vivante par la résurrection de Jésus-Christ, pour un héritage qui ne se peut ni corrompre, ni souiller, ni flétrir. C'est là ce qui fait votre joie, quoique maintenant, puisqu'il le faut, vous soyez attristés pour un peu de temps par diverses épreuves. »",
      ref: "1 Pierre 1:3-6",
      exercices: [
        { type: "qcm", q: "Sur quoi repose l'espérance vivante ?", choix: ["La résurrection de Jésus-Christ", "La loi", "Les promesses aux pères", "La force des croyants"], bonne: 0 },
        { type: "qcm", q: "Comment l'héritage est-il décrit ?", choix: ["Il ne peut ni se corrompre, ni se souiller, ni se flétrir", "Il est réservé aux anciens", "Il est partagé", "Il est caché"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Pierre écrit à des gens qui traversent des épreuves.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Approchez-vous de lui, pierre vivante, rejetée par les hommes mais choisie et précieuse devant Dieu ; et vous-mêmes, comme des pierres vivantes, édifiez-vous pour former une maison spirituelle. Vous êtes une race élue, un sacerdoce royal, une nation sainte, un peuple acquis, afin que vous annonciez les vertus de celui qui vous a appelés des ténèbres à son admirable lumière. »",
      ref: "1 Pierre 2:4-9",
      exercices: [
        { type: "verset", ref: "1 Pierre 2:9", texte: "Vous êtes une race élue un sacerdoce royal une nation sainte" },
        { type: "qcm", q: "À quoi les croyants sont-ils comparés ?", choix: ["À des pierres vivantes bâties en maison spirituelle", "À des colonnes de marbre", "À des arbres", "À des lampes"], bonne: 0 },
        { type: "qcm", q: "D'où et vers quoi ont-ils été appelés ?", choix: ["Des ténèbres à son admirable lumière", "De l'exil au pays", "De la loi à la liberté", "De la mer à la terre"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous. Soyez sobres, veillez. Votre adversaire, le diable, rôde comme un lion rugissant, cherchant qui il dévorera. Résistez-lui avec une foi ferme, sachant que les mêmes souffrances sont imposées à vos frères dans le monde. »",
      ref: "1 Pierre 5:6-9",
      exercices: [
        { type: "verset", ref: "1 Pierre 5:7", texte: "Déchargez-vous sur lui de tous vos soucis car lui-même prend soin de vous" },
        { type: "qcm", q: "Comment résister à l'adversaire, selon Pierre ?", choix: ["Avec une foi ferme", "En fuyant", "En se cachant", "En criant"], bonne: 0 },
        { type: "qcm", q: "Quelle consolation Pierre ajoute-t-il ?", choix: ["Les mêmes souffrances sont imposées aux frères dans le monde", "L'épreuve sera courte", "Ils seront riches", "Personne ne souffrira deux fois"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À la fin de sa lettre, Pierre salue : « Marc, mon fils. » Ce Marc avait autrefois abandonné Paul et Barnabas en pleine mission, ce qui les avait séparés. Paul lui-même écrira plus tard : « Prends Marc et amène-le avec toi, car il m'est utile pour le ministère. » L'homme qu'on avait jugé défaillant devint le compagnon des deux apôtres, et l'auteur du deuxième Évangile.",
      ref: "1 Pierre 5:13",
      exercices: [
        { type: "qui", indices: ["J'abandonne une mission en cours de route.", "Je suis la cause d'une séparation entre deux apôtres.", "Paul redemande plus tard qu'on m'amène.", "J'écris le plus court des quatre Évangiles."], reponse: "Marc", leurres: ["Luc", "Tite", "Démas"] },
        { type: "qcm", q: "Que Paul écrit-il de Marc à la fin de sa vie ?", choix: ["« Il m'est utile pour le ministère »", "« Qu'il reste où il est »", "« Je ne le connais plus »", "« Qu'il se repente »"], bonne: 0, ref: "2 Timothée 4:11" },
        { type: "vf", q: "Un échec de départ n'a pas mis fin au service de Marc.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jean commence sa première lettre par ce qu'il a lui-même touché : « Ce qui était dès le commencement, ce que nous avons entendu, ce que nous avons vu de nos yeux, ce que nous avons contemplé et que nos mains ont touché, concernant la parole de vie — nous vous l'annonçons, afin que vous aussi vous soyez en communion avec nous. Dieu est lumière, et il n'y a point en lui de ténèbres. »",
      ref: "1 Jean 1:1-5",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Sur quoi Jean fonde-t-il son témoignage ?", choix: ["Ce qu'il a entendu, vu et touché lui-même", "Une révélation reçue seul", "Les écrits des autres", "Une tradition"], bonne: 0 },
        { type: "trou", texte: "« Dieu est ___, et il n'y a point en lui de ténèbres. »", reponse: "lumière", leurres: ["amour", "esprit", "vérité"], niveau: "moyen" },
        { type: "vf", q: "C'est le même Jean qui avait couru au tombeau et reçu les visions de Patmos.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité. Voyez quel amour le Père nous a témoigné, pour que nous soyons appelés enfants de Dieu ! Et nous le sommes. »",
      ref: "1 Jean 1:9 - 3:1",
      exercices: [
        { type: "verset", ref: "1 Jean 1:9", texte: "Si nous confessons nos péchés il est fidèle et juste pour nous les pardonner" },
        { type: "qcm", q: "Que faut-il faire selon ce verset ?", choix: ["Confesser ses péchés", "Les compenser", "Les oublier", "Les cacher"], bonne: 0 },
        { type: "qcm", q: "Comment Jean appelle-t-il les croyants ?", choix: ["Enfants de Dieu", "Serviteurs", "Amis du Père", "Héritiers de la loi"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Bien-aimés, aimons-nous les uns les autres ; car l'amour est de Dieu, et quiconque aime est né de Dieu et connaît Dieu. Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour. Si quelqu'un dit : J'aime Dieu, et qu'il haïsse son frère, c'est un menteur ; car celui qui n'aime pas son frère qu'il voit, comment peut-il aimer Dieu qu'il ne voit pas ? »",
      ref: "1 Jean 4:7-20",
      exercices: [
        { type: "verset", ref: "1 Jean 4:8", texte: "Dieu est amour" },
        { type: "qcm", q: "Quel test Jean donne-t-il de l'amour de Dieu ?", choix: ["L'amour du frère qu'on voit", "La longueur des prières", "La connaissance des Écritures", "Les dons faits au temple"], bonne: 0 },
        { type: "qcm", q: "Que dit Jean de celui qui n'aime pas ?", choix: ["Il n'a pas connu Dieu", "Il sera repris plus tard", "Il doit jeûner", "Il n'a pas encore compris"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jude, autre frère de Jésus, écrit une lettre brève et vive contre ceux qui changent la grâce en licence : « Combattez pour la foi qui a été transmise aux saints une fois pour toutes. » Et il termine par une bénédiction qui referme presque tout le Nouveau Testament : « À celui qui peut vous préserver de toute chute et vous faire paraître devant sa gloire irrépréhensibles et dans l'allégresse, à Dieu seul, notre Sauveur, soient gloire, majesté, force et puissance. »",
      ref: "Jude 1:3-25",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qui est Jude, selon sa propre lettre ?", choix: ["Le frère de Jacques", "Un apôtre des douze", "Un ancien d'Éphèse", "Un disciple de Paul"], bonne: 0, ref: "Jude 1:1", niveau: "moyen" },
        { type: "trou", texte: "« Combattez pour la ___ qui a été transmise aux saints une fois pour toutes. »", reponse: "foi", leurres: ["vérité", "paix", "loi"], niveau: "moyen" },
        { type: "ordre", consigne: "Remets ces lettres dans l'ordre où tu les as lues :", items: ["1 Pierre : les pierres vivantes", "2 Timothée : « Prends Marc »", "1 Jean : « Dieu est amour »", "Jude : « Combattez pour la foi »"] },
      ],
    },
  ],
};
