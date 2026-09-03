import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 12 — Samson (Juges 13-16). 8 étapes. */
export const CHAPITRE_SAMSON: CheminChapitre = {
  id: 12,
  nom: "Samson",
  livre: "Juges 13-16",
  accent: "#E11D48",
  decor: "/img/chemin/decor-12.jpg",
  sentier: [{ x: 54.4, y: 94 }, { x: 53.5, y: 84.3 }, { x: 53.1, y: 74.6 }, { x: 61.3, y: 64.9 }, { x: 58.6, y: 55 }, { x: 60.9, y: 45.3 }, { x: 53.6, y: 35.6 }, { x: 56.5, y: 26 }],
  fallback: ["#4a0d1c", "#6b1329", "#22040c"],
  carte: {
    id: "samson",
    nom: "Samson",
    titre: "La force du naziréen",
    rarete: "legendaire",
    image: "/img/chemin/cartes/samson.jpg",
  },
  etapes: [
    {
      recit:
        "Les enfants d'Israël furent livrés entre les mains des Philistins pendant quarante ans. Il y avait un homme de Tsorea, nommé Manoach ; sa femme était stérile. L'ange de l'Éternel lui apparut : « Tu vas devenir enceinte et tu enfanteras un fils. Le rasoir ne passera point sur sa tête, car cet enfant sera naziréen de Dieu dès le ventre de sa mère. »",
      ref: "Juges 13:1-7",
      exercices: [
        { type: "qcm", q: "Que promet l'ange à la femme de Manoach ?", choix: ["Un fils, naziréen de Dieu dès sa naissance", "Une longue vie", "La fin de la famine", "Un troupeau nombreux"], bonne: 0 },
        { type: "qcm", q: "Quel peuple domine alors Israël ?", choix: ["Les Philistins", "Les Madianites", "Les Moabites", "Les Amalécites"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quelle règle du naziréen est nommée pour l'enfant ?", choix: ["Le rasoir ne passera pas sur sa tête", "Il ne portera pas d'armes", "Il ne quittera pas Tsorea", "Il ne se mariera pas"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'enfant naquit et on l'appela Samson. Il grandit, et l'Éternel le bénit ; l'esprit de l'Éternel commença à l'agiter. Samson descendit à Thimna et y remarqua une femme parmi les filles des Philistins. Il dit à son père et à sa mère : « Prenez-la pour ma femme. »",
      ref: "Juges 13-14",
      exercices: [
        { type: "qui", indices: ["Ma mère était stérile jusqu'à ce qu'un ange lui parle.", "Le rasoir n'a jamais passé sur ma tête.", "Je déchire un lion comme on déchire un chevreau.", "Je meurs entre deux colonnes d'un temple."], reponse: "Samson", leurres: ["Gédéon", "Saül", "Jephté"] },
        { type: "qcm", q: "Où Samson remarque-t-il une femme ?", choix: ["À Thimna, chez les Philistins", "À Gaza", "À Béthléem", "À Silo"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Ses parents approuvaient d'emblée ce mariage.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comme il descendait à Thimna, un jeune lion rugissant vint à sa rencontre. L'esprit de l'Éternel saisit Samson : il déchira le lion comme on déchire un chevreau, sans avoir rien dans la main. Quelque temps après, il se détourna pour voir le cadavre du lion : il y avait un essaim d'abeilles et du miel dans le corps de l'animal.",
      ref: "Juges 14:5-9",
      exercices: [
        { type: "qcm", q: "Que trouve Samson dans le corps du lion ?", choix: ["Un essaim d'abeilles et du miel", "Un trésor", "Des ossements de brebis", "Rien du tout"], bonne: 0 },
        { type: "vf", q: "Samson tue le lion avec une épée.", vrai: false, niveau: "moyen" },
        { type: "qcm", q: "Qu'est-ce qui saisit Samson au moment du combat ?", choix: ["L'esprit de l'Éternel", "La colère de son père", "La peur", "Un songe"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Au festin, Samson proposa une énigme aux trente compagnons : « De celui qui mange est sorti ce qui se mange, et du fort est sorti le doux. » Pendant trois jours ils ne purent l'expliquer. Ils pressèrent la femme de Samson, qui pleura devant lui jusqu'au septième jour, et il la lui expliqua ; elle la répéta aux siens.",
      ref: "Juges 14:12-18",
      coffre: true,
      exercices: [
        { type: "trou", texte: "« De celui qui mange est sorti ce qui se mange, et du fort est sorti le ___. »", reponse: "doux", leurres: ["fort", "miel", "lion"], niveau: "moyen" },
        { type: "qcm", q: "Comment les Philistins trouvent-ils la réponse ?", choix: ["Ils font pression sur la femme de Samson", "Ils suivent Samson jusqu'au lion", "Ils achètent un devin", "Ils tirent au sort"], bonne: 0 },
        { type: "qcm", q: "Combien de jours durait le festin ?", choix: ["Sept jours", "Trois jours", "Un jour", "Trente jours"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Les Philistins montèrent contre Juda pour se saisir de Samson. Trois mille hommes de Juda le lièrent de deux cordes neuves. Quand il arriva à Léchi, l'esprit de l'Éternel le saisit : les cordes devinrent comme du lin brûlé au feu. Il trouva une mâchoire d'âne fraîche, étendit la main, la saisit et frappa mille hommes.",
      ref: "Juges 15:9-16",
      exercices: [
        { type: "qcm", q: "Avec quelle arme improvisée Samson frappe-t-il mille hommes ?", choix: ["Une mâchoire d'âne", "Une fronde", "Un pieu de tente", "Une branche d'olivier"], bonne: 0 },
        { type: "qcm", q: "Comment était-il attaché ?", choix: ["Par deux cordes neuves", "Par des chaînes d'airain", "Par sept cordes fraîches", "Par une corde de char"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Qui l'a livré aux Philistins ?", choix: ["Des hommes de Juda, son propre peuple", "Sa mère", "Les Madianites", "Le roi de Gaza"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Après cela, Samson aima une femme dans la vallée de Sorek : elle se nommait Delila. Les princes des Philistins lui dirent : « Flatte-le pour savoir d'où lui vient sa grande force, et nous te donnerons chacun mille et cent sicles d'argent. » Trois fois Samson la trompa ; trois fois elle découvrit qu'il avait menti.",
      ref: "Juges 16:4-14",
      exercices: [
        { type: "qcm", q: "Que promettent les princes philistins à Delila ?", choix: ["De l'argent, mille et cent sicles chacun", "Une maison à Gaza", "La liberté de son père", "Un troupeau"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de fois Samson lui donne-t-il une fausse réponse ?", choix: ["Trois fois", "Une fois", "Sept fois", "Il ne ment jamais"], bonne: 0 },
        { type: "trou", texte: "Delila habitait la vallée de ___.", reponse: "Sorek", leurres: ["Élah", "Hinnom", "Jizreel"], niveau: "expert" },
      ],
    },
    {
      recit:
        "Delila le pressa chaque jour, et son âme s'impatienta à la mort. Il lui ouvrit tout son cœur : « Le rasoir n'a point passé sur ma tête, car je suis naziréen de Dieu dès le ventre de ma mère. Si j'étais rasé, ma force m'abandonnerait. » Elle l'endormit sur ses genoux, fit raser les sept tresses de sa tête, et l'Éternel s'était retiré de lui.",
      ref: "Juges 16:15-21",
      exercices: [
        { type: "qcm", q: "D'où venait la force de Samson ?", choix: ["De sa consécration à Dieu, signifiée par ses cheveux", "De ses muscles seuls", "D'une amulette", "Du miel du lion"], bonne: 0 },
        { type: "qcm", q: "Combien de tresses avait-il ?", choix: ["Sept", "Trois", "Douze", "Deux"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Ce sont les cheveux eux-mêmes qui étaient magiques.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les Philistins le saisirent, lui crevèrent les yeux et le lièrent à Gaza. Mais les cheveux de sa tête recommencèrent à croître. Au festin de Dagon, on le fit venir pour s'amuser de lui. Samson, appuyé sur les deux colonnes du milieu, pria : « Seigneur Éternel, souviens-toi de moi, je te prie ! » Il les ébranla, et la maison tomba.",
      ref: "Juges 16:21-30",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets la vie de Samson dans l'ordre :", items: ["L'ange annonce sa naissance à sa mère", "Il déchire le lion sur la route de Thimna", "Delila découvre le secret de sa force", "Les deux colonnes du temple de Dagon"] },
        { type: "verset", ref: "Juges 16:28", texte: "Souviens-toi de moi, je te prie", niveau: "moyen" },
        { type: "qcm", q: "Comment Samson meurt-il ?", choix: ["En renversant les colonnes du temple sur lui et ses ennemis", "D'une flèche philistine", "De faim en prison", "Noyé dans le torrent"], bonne: 0 },
      ],
    },
  ],
};
