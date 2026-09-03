import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 41 — Lazare (Jean 11). 8 étapes. */
export const CHAPITRE_LAZARE: CheminChapitre = {
  id: 41,
  nom: "Lazare",
  livre: "Jean 11",
  accent: "#FDBA74",
  decor: "/img/chemin/decor-41.jpg",
  sentier: [{ x: 48.8, y: 94 }, { x: 60.2, y: 84.3 }, { x: 67.8, y: 74.6 }, { x: 47.8, y: 64.9 }, { x: 48, y: 55 }, { x: 65.2, y: 45.3 }, { x: 42.2, y: 35.6 }, { x: 49.1, y: 26 }],
  fallback: ["#4a2f10", "#6b4518", "#221406"],
  carte: {
    id: "lazare",
    nom: "Lazare",
    titre: "Sorti du tombeau",
    rarete: "legendaire",
    image: "/img/chemin/cartes/lazare.jpg",
  },
  etapes: [
    {
      recit:
        "Il y avait un homme malade, Lazare, de Béthanie, le village de Marie et de Marthe sa sœur. Les sœurs envoyèrent dire à Jésus : « Seigneur, voici, celui que tu aimes est malade. » Ayant appris cela, Jésus resta encore deux jours dans le lieu où il était.",
      ref: "Jean 11:1-6",
      exercices: [
        { type: "qcm", q: "Comment les sœurs annoncent-elles la maladie ?", choix: ["« Celui que tu aimes est malade »", "« Notre frère va mourir »", "« Viens vite, il est perdu »", "« Guéris-le à distance »"], bonne: 0 },
        { type: "qcm", q: "Que fait Jésus en apprenant la nouvelle ?", choix: ["Il reste encore deux jours là où il est", "Il part aussitôt", "Il envoie un disciple", "Il prie et guérit à distance"], bonne: 0 },
        { type: "qcm", q: "Comment s'appellent les deux sœurs ?", choix: ["Marthe et Marie", "Marie et Salomé", "Anne et Jeanne", "Marthe et Élisabeth"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ensuite il dit : « Retournons en Judée. » — « Rabbi, lui dirent les disciples, les Juifs tout récemment cherchaient à te lapider, et tu retournes là-bas ! » Thomas dit aux autres disciples : « Allons aussi, afin de mourir avec lui. »",
      ref: "Jean 11:7-16",
      exercices: [
        { type: "qcm", q: "Pourquoi les disciples s'inquiètent-ils du retour en Judée ?", choix: ["On cherchait tout récemment à le lapider", "La route est longue", "Il y a la famine", "Ils n'ont pas d'argent"], bonne: 0 },
        { type: "qcm", q: "Qui propose d'aller mourir avec lui ?", choix: ["Thomas", "Pierre", "Jean", "Philippe"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jésus revient en Judée en sachant le danger.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus, à son arrivée, trouva que Lazare était déjà depuis quatre jours dans le sépulcre. Béthanie était près de Jérusalem, à quinze stades environ, et beaucoup de Juifs étaient venus consoler Marthe et Marie. Dès que Marthe apprit que Jésus arrivait, elle alla au-devant de lui.",
      ref: "Jean 11:17-20",
      exercices: [
        { type: "qcm", q: "Depuis combien de jours Lazare est-il au sépulcre ?", choix: ["Quatre jours", "Un jour", "Trois jours", "Sept jours"], bonne: 0 },
        { type: "qcm", q: "Laquelle des deux sœurs va au-devant de Jésus ?", choix: ["Marthe", "Marie", "Les deux ensemble", "Aucune"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "À quelle distance de Jérusalem se trouve Béthanie ?", choix: ["Quinze stades environ", "Une journée de marche", "Trois lieues", "Quarante stades"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Marthe dit : « Seigneur, si tu eusses été ici, mon frère ne serait pas mort. Mais maintenant même, je sais que tout ce que tu demanderas à Dieu, Dieu te l'accordera. » — « Ton frère ressuscitera. » — « Je sais qu'il ressuscitera à la résurrection, au dernier jour. »",
      ref: "Jean 11:21-24",
      exercices: [
        { type: "qcm", q: "Quel reproche doux Marthe adresse-t-elle à Jésus ?", choix: ["« Si tu eusses été ici, mon frère ne serait pas mort »", "« Tu nous as oubliés »", "« Pourquoi si tard ? »", "Elle ne dit rien"], bonne: 0 },
        { type: "qcm", q: "Que croit-elle malgré tout ?", choix: ["Que Dieu accordera à Jésus ce qu'il demandera", "Que Lazare dort", "Que tout est fini", "Qu'il faut attendre le sabbat"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quand pense-t-elle que son frère ressuscitera ?", choix: ["Au dernier jour", "Ce jour même", "Dans trois jours", "Elle n'y croit pas"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus lui dit : « Je suis la résurrection et la vie. Celui qui croit en moi vivra, quand même il serait mort ; et quiconque vit et croit en moi ne mourra jamais. Crois-tu cela ? » Elle lui dit : « Oui, Seigneur, je crois que tu es le Christ, le Fils de Dieu, qui devait venir dans le monde. »",
      ref: "Jean 11:25-27",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Jean 11:25", texte: "Je suis la résurrection et la vie" },
        { type: "qcm", q: "Que répond Marthe à la question « Crois-tu cela ? »", choix: ["« Oui, Seigneur, je crois que tu es le Christ »", "« Je ne sais pas »", "« Montre-le-moi »", "Elle se tait"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce que Jésus déplace dans la foi de Marthe ?", choix: ["De la résurrection au dernier jour à sa personne, maintenant", "De la loi à la grâce", "Du temple à la maison", "De la prière au jeûne"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Marie vint où était Jésus et tomba à ses pieds en pleurant. Jésus, la voyant pleurer, elle et les Juifs venus avec elle, frémit en son esprit et fut tout ému. « Où l'avez-vous mis ? » — « Seigneur, viens et vois. » Jésus pleura. Les Juifs dirent : « Voyez comme il l'aimait ! »",
      ref: "Jean 11:32-36",
      exercices: [
        { type: "verset", ref: "Jean 11:35", texte: "Jésus pleura" },
        { type: "qcm", q: "Quel est le plus court verset de la Bible en français ?", choix: ["« Jésus pleura »", "« Il est écrit »", "« Suis-moi »", "« Amen »"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que disent les Juifs en le voyant pleurer ?", choix: ["« Voyez comme il l'aimait ! »", "« Il est trop tard »", "« Pourquoi n'est-il pas venu ? »", "Ils se taisent"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus vint au sépulcre : c'était une grotte, et une pierre était placée devant. « Ôtez la pierre. » Marthe dit : « Seigneur, il sent déjà, car il y a quatre jours qu'il est là. » Jésus lui dit : « Ne t'ai-je pas dit que si tu crois, tu verras la gloire de Dieu ? »",
      ref: "Jean 11:38-40",
      exercices: [
        { type: "qcm", q: "Qu'objecte Marthe à l'ordre d'ôter la pierre ?", choix: ["Que le corps sent déjà après quatre jours", "Que la pierre est trop lourde", "Qu'il faut l'avis des anciens", "Que c'est le sabbat"], bonne: 0 },
        { type: "trou", texte: "« Si tu crois, tu verras la ___ de Dieu. »", reponse: "gloire", leurres: ["main", "paix", "loi"], niveau: "moyen" },
        { type: "vf", q: "Le tombeau était une grotte fermée par une pierre.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ayant dit cela, il cria d'une voix forte : « Lazare, sors ! » Et le mort sortit, les pieds et les mains liés de bandes, et le visage enveloppé d'un linge. Jésus leur dit : « Déliez-le, et laissez-le aller. » Beaucoup de ceux qui étaient venus crurent en lui.",
      ref: "Jean 11:43-45",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Mes sœurs envoient dire que je suis malade.", "Je reste quatre jours dans le tombeau.", "Une voix forte m'appelle par mon nom.", "Je sors encore enveloppé de bandes."], reponse: "Lazare", leurres: ["Jaïrus", "Nicodème", "Thomas"] },
        { type: "qcm", q: "Que dit Jésus à ceux qui regardent ?", choix: ["« Déliez-le, et laissez-le aller »", "« Ne dites rien à personne »", "« Refermez le tombeau »", "« Suivez-moi »"], bonne: 0 },
        { type: "ordre", consigne: "Remets cette histoire dans l'ordre :", items: ["Le message des sœurs à Jésus", "« Je suis la résurrection et la vie »", "« Jésus pleura »", "« Lazare, sors ! »"] },
      ],
    },
  ],
};
