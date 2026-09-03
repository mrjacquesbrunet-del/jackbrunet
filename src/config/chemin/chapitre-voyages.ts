import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 49 — Les voyages de Paul (Actes 13-20). 8 étapes. */
export const CHAPITRE_VOYAGES: CheminChapitre = {
  id: 49,
  nom: "Les voyages de Paul",
  livre: "Actes 13-20",
  accent: "#22D3EE",
  decor: "/img/chemin/decor-49.jpg",
  sentier: [{ x: 58.7, y: 94 }, { x: 66.7, y: 84.3 }, { x: 73.1, y: 74.6 }, { x: 63.3, y: 64.9 }, { x: 45.4, y: 55 }, { x: 57.8, y: 45.3 }, { x: 47.3, y: 35.6 }, { x: 41.9, y: 26 }],
  fallback: ["#06404a", "#0a5c6b", "#021c21"],
  carte: {
    id: "lydie",
    nom: "Lydie",
    titre: "La marchande de pourpre",
    rarete: "epique",
    image: "/img/chemin/cartes/lydie.jpg",
  },
  etapes: [
    {
      recit:
        "Dans l'Église d'Antioche, pendant qu'ils servaient le Seigneur et qu'ils jeûnaient, le Saint-Esprit dit : « Mettez-moi à part Barnabas et Saul pour l'œuvre à laquelle je les ai appelés. » Après avoir jeûné et prié, ils leur imposèrent les mains et les laissèrent partir. C'est à Antioche que les disciples furent pour la première fois appelés chrétiens.",
      ref: "Actes 13:1-3",
      exercices: [
        { type: "qcm", q: "D'où part le premier voyage missionnaire ?", choix: ["D'Antioche", "De Jérusalem", "De Damas", "De Rome"], bonne: 0 },
        { type: "qcm", q: "Où les disciples ont-ils été appelés « chrétiens » pour la première fois ?", choix: ["À Antioche", "À Jérusalem", "À Éphèse", "À Corinthe"], bonne: 0, ref: "Actes 11:26", niveau: "moyen" },
        { type: "qcm", q: "Qui part avec Saul ?", choix: ["Barnabas", "Pierre", "Silas", "Timothée"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À Lystre, ils guérirent un homme impotent de naissance. La foule s'écria : « Les dieux, sous une forme humaine, sont descendus vers nous ! » Ils appelaient Barnabas Jupiter et Paul Mercure, et voulurent leur offrir un sacrifice. Les apôtres déchirèrent leurs vêtements et se précipitèrent vers la foule : « Pourquoi agissez-vous de la sorte ? Nous aussi, nous sommes des hommes de la même nature que vous. »",
      ref: "Actes 14:8-15",
      exercices: [
        { type: "qcm", q: "Que veut faire la foule de Lystre ?", choix: ["Leur offrir un sacrifice comme à des dieux", "Les lapider", "Les chasser", "Les couronner"], bonne: 0 },
        { type: "qcm", q: "Comment Paul et Barnabas réagissent-ils ?", choix: ["Ils déchirent leurs vêtements et refusent", "Ils acceptent en silence", "Ils s'enfuient", "Ils demandent de l'argent"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La même foule finit par lapider Paul.", vrai: true, ref: "Actes 14:19", niveau: "expert" },
      ],
    },
    {
      recit:
        "Des hommes venus de Judée enseignaient : « Si vous n'êtes circoncis selon le rite de Moïse, vous ne pouvez être sauvés. » Les apôtres et les anciens se réunirent à Jérusalem. Pierre dit : « C'est par la grâce du Seigneur Jésus que nous croyons être sauvés, de la même manière qu'eux. » On décida de ne pas imposer aux païens le fardeau de la loi.",
      ref: "Actes 15:1-11",
      exercices: [
        { type: "qcm", q: "Quelle question divise l'Église naissante ?", choix: ["Faut-il imposer la circoncision et la loi aux païens ?", "Faut-il payer l'impôt ?", "Faut-il un temple ?", "Qui dirigera l'Église ?"], bonne: 0 },
        { type: "qcm", q: "Que conclut l'assemblée de Jérusalem ?", choix: ["On n'impose pas aux païens le fardeau de la loi", "On l'impose à tous", "On attend un signe", "On sépare les Églises"], bonne: 0 },
        { type: "trou", texte: "« C'est par la ___ du Seigneur Jésus que nous croyons être sauvés. »", reponse: "grâce", leurres: ["loi", "foi", "parole"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Pendant la nuit, Paul eut une vision : un Macédonien le priait, disant : « Passe en Macédoine, secours-nous ! » Aussitôt ils cherchèrent à partir pour la Macédoine, concluant que le Seigneur les appelait à y annoncer la bonne nouvelle. Ainsi l'Évangile passa d'Asie en Europe.",
      ref: "Actes 16:9-10",
      exercices: [
        { type: "qcm", q: "Que voit Paul en vision ?", choix: ["Un Macédonien qui le supplie de venir", "Un ange", "Une lumière", "Un navire"], bonne: 0 },
        { type: "qcm", q: "Quelle est la portée de ce passage ?", choix: ["L'Évangile passe d'Asie en Europe", "Paul rentre à Jérusalem", "Paul est arrêté", "Barnabas le quitte"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "C'est une vision de nuit qui oriente ce voyage.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le jour du sabbat, ils sortirent de Philippes vers une rivière, où ils supposaient qu'était un lieu de prière. Une femme nommée Lydie, marchande de pourpre de la ville de Thyatire, craignant Dieu, écoutait. Le Seigneur lui ouvrit le cœur pour qu'elle fût attentive à ce que disait Paul. Après avoir été baptisée avec sa famille, elle les pressa : « Entrez dans ma maison et demeurez-y. »",
      ref: "Actes 16:13-15",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Je viens de Thyatire et je vends la pourpre.", "J'écoute au bord d'une rivière un jour de sabbat.", "Le Seigneur m'ouvre le cœur.", "J'ouvre ma maison aux missionnaires."], reponse: "Lydie", leurres: ["Priscille", "Dorcas", "Phœbé"] },
        { type: "qcm", q: "Que vendait Lydie ?", choix: ["De la pourpre", "Du blé", "Des parfums", "Des tissus de lin"], bonne: 0 },
        { type: "qcm", q: "Qui ouvre son cœur, selon le texte ?", choix: ["Le Seigneur", "Paul par son éloquence", "Sa famille", "Elle-même"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À Philippes, Paul et Silas furent battus de verges et jetés en prison, les pieds dans les ceps. Vers le milieu de la nuit, ils priaient et chantaient les louanges de Dieu, et les prisonniers les entendaient. Tout à coup il se fit un grand tremblement de terre : les portes s'ouvrirent et les liens de tous furent rompus. Le geôlier tomba tremblant : « Que faut-il que je fasse pour être sauvé ? »",
      ref: "Actes 16:22-30",
      exercices: [
        { type: "qcm", q: "Que font Paul et Silas en prison, à minuit ?", choix: ["Ils prient et chantent les louanges de Dieu", "Ils dorment", "Ils forcent la porte", "Ils se plaignent"], bonne: 0 },
        { type: "qcm", q: "Que demande le geôlier ?", choix: ["« Que faut-il que je fasse pour être sauvé ? »", "« Qui a ouvert les portes ? »", "« Partez vite »", "« Qui êtes-vous ? »"], bonne: 0 },
        { type: "vf", q: "Aucun prisonnier ne s'est enfui malgré les portes ouvertes.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À Athènes, Paul, au milieu de l'Aréopage, dit : « Hommes Athéniens, je vous trouve à tous égards extrêmement religieux. Car, en parcourant votre ville, j'ai vu un autel avec cette inscription : À un dieu inconnu. Ce que vous adorez sans le connaître, c'est ce que je vous annonce. Le Dieu qui a fait le monde ne réside pas dans des temples faits de main d'homme. Il n'est pas loin de chacun de nous : en lui nous avons la vie, le mouvement et l'être. »",
      ref: "Actes 17:22-28",
      exercices: [
        { type: "qcm", q: "Quel autel Paul remarque-t-il à Athènes ?", choix: ["Un autel « À un dieu inconnu »", "Un autel de Zeus", "Un autel vide", "Un autel du temple"], bonne: 0 },
        { type: "verset", ref: "Actes 17:28", texte: "En lui nous avons la vie le mouvement et l'être", niveau: "moyen" },
        { type: "qcm", q: "Comment Paul commence-t-il son discours ?", choix: ["Par ce qu'il a observé chez eux", "Par une condamnation", "Par un miracle", "Par une citation de Moïse"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À Milet, Paul fit venir les anciens d'Éphèse : « Vous savez de quelle manière je me suis conduit avec vous, servant le Seigneur en toute humilité, avec larmes. Je n'ai rien caché de ce qui vous était utile. Maintenant je vais à Jérusalem, ne sachant pas ce qui m'y arrivera ; mais je ne fais pour moi-même aucun cas de ma vie, pourvu que j'accomplisse ma course avec joie. » Puis, s'étant mis à genoux, il pria avec eux tous. Ils fondaient tous en larmes et embrassaient Paul.",
      ref: "Actes 20:17-38",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que dit Paul aux anciens d'Éphèse ?", choix: ["Qu'il ne fait aucun cas de sa vie, pourvu qu'il achève sa course", "Qu'il revient bientôt", "Qu'il abandonne", "Qu'il part à Rome en vainqueur"], bonne: 0 },
        { type: "verset", ref: "Actes 20:35", texte: "Il y a plus de bonheur à donner qu'à recevoir", niveau: "moyen" },
        { type: "ordre", consigne: "Remets les voyages dans l'ordre :", items: ["L'envoi depuis Antioche", "L'assemblée de Jérusalem", "L'appel de la Macédoine et Lydie", "Les adieux aux anciens d'Éphèse"] },
      ],
    },
  ],
};
