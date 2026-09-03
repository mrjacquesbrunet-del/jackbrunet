import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 28 — Esther (Esther 1-9). 8 étapes. */
export const CHAPITRE_ESTHER: CheminChapitre = {
  id: 28,
  nom: "Esther",
  livre: "Esther 1-9",
  accent: "#F472B6",
  decor: "/img/chemin/decor-28.jpg",
  sentier: [{ x: 41.2, y: 94 }, { x: 53.8, y: 84.3 }, { x: 61.5, y: 74.6 }, { x: 51.9, y: 64.9 }, { x: 42.2, y: 55 }, { x: 37.1, y: 45.3 }, { x: 59.6, y: 35.6 }, { x: 56.2, y: 26 }],
  fallback: ["#4a1030", "#6b1846", "#220716"],
  carte: {
    id: "esther",
    nom: "Esther",
    titre: "La reine du temps voulu",
    rarete: "legendaire",
    image: "/img/chemin/cartes/esther.jpg",
  },
  etapes: [
    {
      recit:
        "Le roi Assuérus régnait depuis l'Inde jusqu'à l'Éthiopie sur cent vingt-sept provinces. Au troisième an de son règne il donna un festin de cent quatre-vingts jours. Il ordonna à la reine Vasthi de paraître devant les convives ; elle refusa. Le roi s'irrita, et Vasthi fut écartée du trône.",
      ref: "Esther 1",
      exercices: [
        { type: "qcm", q: "Sur combien de provinces règne Assuérus ?", choix: ["Cent vingt-sept", "Douze", "Soixante-dix", "Mille"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Pourquoi la reine Vasthi est-elle écartée ?", choix: ["Elle a refusé de paraître devant les convives", "Elle a quitté le palais", "Elle a comploté", "Elle est tombée malade"], bonne: 0 },
        { type: "vf", q: "L'histoire d'Esther se passe en Perse, pendant l'exil.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Mardochée, Juif de Suse, élevait Hadassa — c'est-à-dire Esther — fille de son oncle, car elle n'avait plus ni père ni mère. La jeune fille était belle de taille et belle de figure. Elle fut conduite au palais et gagna la faveur de tous. Le roi l'aima plus que toutes les autres et posa la couronne royale sur sa tête. Esther n'avait pas fait connaître son peuple.",
      ref: "Esther 2:5-20",
      exercices: [
        { type: "qui", indices: ["Je suis orpheline, élevée par mon cousin.", "Je deviens reine sans dire d'où je viens.", "Je jeûne trois jours avant d'entrer chez le roi.", "Je dis : « Si je péris, je péris. »"], reponse: "Esther", leurres: ["Vasthi", "Ruth", "Débora"] },
        { type: "qcm", q: "Qui a élevé Esther ?", choix: ["Mardochée, son cousin", "Sa tante", "Le roi lui-même", "Une servante du palais"], bonne: 0 },
        { type: "qcm", q: "Que cache Esther en devenant reine ?", choix: ["Son peuple et sa naissance", "Son âge", "Son nom", "Sa fortune"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Haman, élevé au-dessus de tous les chefs, exigeait qu'on se prosternât devant lui. Mardochée ne fléchissait pas le genou. Haman, plein de fureur, ne se contenta pas de frapper Mardochée seul : il résolut de détruire tous les Juifs du royaume. On tira le sort — le pour — pour fixer le jour.",
      ref: "Esther 3",
      exercices: [
        { type: "qcm", q: "Pourquoi Haman veut-il détruire les Juifs ?", choix: ["Parce que Mardochée refuse de se prosterner devant lui", "Parce qu'ils ne paient pas l'impôt", "Sur ordre du roi", "Parce qu'ils ont volé"], bonne: 0 },
        { type: "qcm", q: "Comment le jour du massacre est-il fixé ?", choix: ["Par le sort, le « pour »", "Par le calendrier du temple", "Par un songe", "Par vote des chefs"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Haman voulait s'en prendre à Mardochée seul.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Mardochée fit dire à Esther : « Ne t'imagine pas que tu échapperas seule d'entre tous les Juifs parce que tu es dans la maison du roi. Si tu te tais, le secours viendra d'ailleurs, mais toi et la maison de ton père vous périrez. Et qui sait si ce n'est pas pour un temps comme celui-ci que tu es parvenue à la royauté ? »",
      ref: "Esther 4:12-14",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Esther 4:14", texte: "Qui sait si ce n'est pas pour un temps comme celui-ci que tu es parvenue à la royauté" },
        { type: "qcm", q: "Que dit Mardochée si Esther se tait ?", choix: ["Le secours viendra d'ailleurs, mais elle périra", "Tout sera perdu à jamais", "Il ira lui-même chez le roi", "Il quittera le pays"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel danger court Esther en allant chez le roi ?", choix: ["Entrer sans être appelée est puni de mort", "Elle sera reconnue à son accent", "Elle sera chassée du palais", "Elle perdra sa couronne"], bonne: 0 },
      ],
    },
    {
      recit:
        "Esther répondit : « Rassemble tous les Juifs qui se trouvent à Suse, et jeûnez pour moi : ne mangez ni ne buvez pendant trois jours, ni la nuit ni le jour. Moi aussi je jeûnerai de même avec mes servantes ; puis j'entrerai chez le roi malgré la loi. Et si je péris, je péris ! »",
      ref: "Esther 4:15-17",
      exercices: [
        { type: "qcm", q: "Que demande Esther avant d'aller chez le roi ?", choix: ["Un jeûne de trois jours pour tous les Juifs de Suse", "Une armée", "L'accord de Haman", "Une lettre de Mardochée"], bonne: 0 },
        { type: "trou", texte: "« Et si je péris, je ___ ! »", reponse: "péris", leurres: ["fuis", "prie", "reviens"], niveau: "moyen" },
        { type: "vf", q: "Esther agit sans hésiter dès le premier message.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le troisième jour, Esther se revêtit de ses habits royaux et se présenta dans la cour intérieure. Dès que le roi la vit, elle trouva grâce à ses yeux : il lui tendit le sceptre d'or. « Que veux-tu, reine Esther ? Quand ce serait la moitié du royaume, elle te serait donnée. » Elle demanda seulement que le roi et Haman viennent à un festin.",
      ref: "Esther 5:1-8",
      exercices: [
        { type: "qcm", q: "Quel signe montre qu'Esther est reçue ?", choix: ["Le roi lui tend le sceptre d'or", "Les gardes s'écartent", "On sonne de la trompette", "Haman s'incline"], bonne: 0 },
        { type: "qcm", q: "Que demande Esther d'abord ?", choix: ["Que le roi et Haman viennent à un festin", "La tête de Haman", "Le salut des Juifs", "De rentrer chez elle"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que lui offre le roi ?", choix: ["Jusqu'à la moitié du royaume", "Une province", "Un palais", "Sa protection seule"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Cette nuit-là, le roi ne put dormir. Il se fit lire les chroniques : on y avait écrit que Mardochée avait dénoncé un complot et n'avait rien reçu. Haman entrait justement pour demander qu'on pende Mardochée. Le roi lui demanda : « Que faut-il faire pour l'homme que le roi veut honorer ? » Haman, croyant qu'il s'agissait de lui, proposa les plus grands honneurs — et dut les rendre à Mardochée.",
      ref: "Esther 6",
      exercices: [
        { type: "qcm", q: "Qu'apprend le roi pendant sa nuit sans sommeil ?", choix: ["Que Mardochée l'a sauvé d'un complot sans récompense", "Que Haman complote", "Qu'Esther est juive", "Que le trésor est vide"], bonne: 0 },
        { type: "qcm", q: "Pourquoi Haman propose-t-il de si grands honneurs ?", choix: ["Il croit que c'est lui que le roi veut honorer", "Il veut piéger Mardochée", "Il obéit à un conseiller", "Il veut plaire à Esther"], bonne: 0 },
        { type: "vf", q: "Le nom de Dieu n'est jamais prononcé dans le livre d'Esther.", vrai: true, niveau: "expert" },
      ],
    },
    {
      recit:
        "Au second festin, Esther dit : « Si j'ai trouvé grâce à tes yeux, ô roi, accorde-moi la vie — voilà ma demande — et la vie de mon peuple. Nous sommes vendus pour être détruits. » — « Qui est celui-là ? » — « Cet oppresseur, c'est Haman ! » Haman fut pendu au bois qu'il avait dressé pour Mardochée, et les Juifs furent délivrés. On institua la fête de Pourim.",
      ref: "Esther 7-9",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Comment Haman meurt-il ?", choix: ["Pendu au bois qu'il avait dressé pour Mardochée", "Chassé du royaume", "Tué au combat", "De maladie"], bonne: 0 },
        { type: "qcm", q: "Quelle fête est instituée en mémoire de cette délivrance ?", choix: ["Pourim", "La Pâque", "Les Tentes", "La Pentecôte"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets le livre d'Esther dans l'ordre :", items: ["Vasthi est écartée du trône", "Esther devient reine sans dire son peuple", "Haman obtient l'édit contre les Juifs", "« Si je péris, je péris » et la délivrance"] },
      ],
    },
  ],
};
