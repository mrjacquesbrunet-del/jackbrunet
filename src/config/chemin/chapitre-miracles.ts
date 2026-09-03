import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 36 — La tempête, le démoniaque et la fille de Jaïrus (Marc 4-5). 8 étapes. */
export const CHAPITRE_MIRACLES: CheminChapitre = {
  id: 36,
  nom: "La tempête apaisée",
  livre: "Marc 4-5",
  accent: "#38BDF8",
  decor: "/img/chemin/decor-36.jpg",
  sentier: [{ x: 49.5, y: 94 }, { x: 62.4, y: 84.3 }, { x: 65.6, y: 74.6 }, { x: 56.7, y: 64.9 }, { x: 48, y: 55 }, { x: 65.8, y: 45.3 }, { x: 42.9, y: 35.6 }, { x: 54.7, y: 26 }],
  fallback: ["#0b2c4a", "#11416b", "#031321"],
  carte: {
    id: "jairus",
    nom: "Jaïrus",
    titre: "Le père qui a cru",
    rarete: "epique",
    image: "/img/chemin/cartes/jairus.jpg",
  },
  etapes: [
    {
      recit:
        "Ce jour-là, sur le soir, Jésus dit : « Passons à l'autre bord. » Ils le prirent dans la barque. Il s'éleva un grand tourbillon, et les flots se jetaient dans la barque, au point qu'elle se remplissait déjà. Et lui, il dormait à la poupe sur le coussin.",
      ref: "Marc 4:35-38",
      exercices: [
        { type: "qcm", q: "Que fait Jésus pendant la tempête ?", choix: ["Il dort à la poupe sur le coussin", "Il rame", "Il prie debout", "Il écope l'eau"], bonne: 0 },
        { type: "qcm", q: "À quel moment de la journée partent-ils ?", choix: ["Sur le soir", "Au matin", "À midi", "En pleine nuit"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La barque se remplissait vraiment d'eau.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils le réveillèrent : « Maître, ne t'inquiètes-tu pas de ce que nous périssons ? » S'étant réveillé, il menaça le vent et dit à la mer : « Silence ! tais-toi ! » Le vent cessa, et il y eut un grand calme. Puis il leur dit : « Pourquoi avez-vous ainsi peur ? Comment n'avez-vous point de foi ? » Ils furent saisis d'une grande frayeur et se dirent : « Quel est donc celui-ci, à qui obéissent même le vent et la mer ? »",
      ref: "Marc 4:39-41",
      exercices: [
        { type: "verset", ref: "Marc 4:39", texte: "Silence tais-toi" },
        { type: "qcm", q: "Que demandent les disciples après le miracle ?", choix: ["« Quel est donc celui-ci, à qui obéissent le vent et la mer ? »", "« Rentrons chez nous »", "« Fais-le encore »", "« Qui a causé la tempête ? »"], bonne: 0 },
        { type: "qcm", q: "Que reproche Jésus à ses disciples ?", choix: ["Leur peur et leur manque de foi", "De l'avoir réveillé", "D'avoir mal ramé", "D'être partis trop tard"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils arrivèrent au pays des Gadaréniens. Aussitôt sortit des sépulcres un homme possédé d'un esprit impur. Il avait sa demeure dans les tombeaux, et personne ne pouvait plus le lier, même avec une chaîne. Nuit et jour il criait et se meurtrissait avec des pierres. Ayant vu Jésus de loin, il accourut et se prosterna devant lui.",
      ref: "Marc 5:1-6",
      exercices: [
        { type: "qcm", q: "Où vivait cet homme ?", choix: ["Dans les tombeaux", "Dans une grotte du désert", "Sur un bateau", "Dans la ville"], bonne: 0 },
        { type: "qcm", q: "Que faisait-il nuit et jour ?", choix: ["Il criait et se blessait avec des pierres", "Il dormait", "Il travaillait", "Il chantait"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "On avait réussi à le maîtriser avec des chaînes.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus lui demanda : « Quel est ton nom ? » — « Légion est mon nom, car nous sommes plusieurs. » Les esprits impurs entrèrent dans un troupeau de pourceaux, qui se précipitèrent dans la mer. Les gens vinrent et virent le démoniaque assis, vêtu et dans son bon sens ; et ils furent saisis de crainte. Ils supplièrent Jésus de quitter leur territoire.",
      ref: "Marc 5:7-17",
      exercices: [
        { type: "qcm", q: "Dans quel état l'homme est-il retrouvé ?", choix: ["Assis, vêtu et dans son bon sens", "Encore agité", "Endormi", "Disparu"], bonne: 0 },
        { type: "qcm", q: "Que demandent les habitants à Jésus ?", choix: ["De quitter leur territoire", "De rester chez eux", "De guérir d'autres malades", "De payer les pourceaux"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel nom donne l'esprit impur ?", choix: ["Légion", "Baal", "Abaddon", "Il ne répond pas"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'homme guéri demanda la permission de rester avec Jésus. Jésus ne le lui permit pas, mais lui dit : « Va dans ta maison, vers les tiens, et raconte-leur tout ce que le Seigneur t'a fait, et comment il a eu pitié de toi. » Il s'en alla, et se mit à publier dans la Décapole tout ce que Jésus avait fait pour lui.",
      ref: "Marc 5:18-20",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que demande l'homme guéri ?", choix: ["De rester avec Jésus", "De l'argent", "Une maison", "Un signe"], bonne: 0 },
        { type: "qcm", q: "Que lui répond Jésus ?", choix: ["D'aller raconter aux siens ce que le Seigneur a fait", "De se taire", "De le suivre en Galilée", "D'attendre un an"], bonne: 0 },
        { type: "qcm", q: "Dans quelle région va-t-il l'annoncer ?", choix: ["La Décapole", "La Judée", "La Samarie", "La Galilée"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Un chef de la synagogue, nommé Jaïrus, se jeta à ses pieds : « Ma petite fille est à l'extrémité ; viens, impose-lui les mains, afin qu'elle soit sauvée et qu'elle vive. » Jésus s'en alla avec lui, et une grande foule le suivait et le pressait.",
      ref: "Marc 5:21-24",
      exercices: [
        { type: "qui", indices: ["Je suis chef de la synagogue.", "Je me jette aux pieds de Jésus pour ma fille mourante.", "On vient me dire qu'il est trop tard.", "J'entends : « Ne crains pas, crois seulement »."], reponse: "Jaïrus", leurres: ["Nicodème", "Zachée", "Simon"] },
        { type: "qcm", q: "Quelle est la fonction de Jaïrus ?", choix: ["Chef de la synagogue", "Publicain", "Centurion", "Pharisien"], bonne: 0 },
        { type: "qcm", q: "Que demande-t-il pour sa fille ?", choix: ["Que Jésus vienne lui imposer les mains", "De l'argent pour un médecin", "Une prière à distance", "Un remède"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Une femme malade depuis douze ans, qui avait dépensé tout son bien chez les médecins sans aucun soulagement, se dit : « Si je puis seulement toucher ses vêtements, je serai guérie. » Elle toucha son vêtement par derrière, et à l'instant elle fut guérie. Jésus se retourna : « Qui a touché mes vêtements ? » Il lui dit : « Ma fille, ta foi t'a sauvée ; va en paix. »",
      ref: "Marc 5:25-34",
      exercices: [
        { type: "qcm", q: "Depuis combien de temps cette femme était-elle malade ?", choix: ["Douze ans", "Trois ans", "Sept ans", "Quarante ans"], bonne: 0 },
        { type: "verset", ref: "Marc 5:34", texte: "Ma fille ta foi t'a sauvée va en paix", niveau: "moyen" },
        { type: "qcm", q: "Que dit-elle en elle-même avant de le toucher ?", choix: ["« Si je puis seulement toucher ses vêtements, je serai guérie »", "« Il ne me verra pas »", "« Je vais lui parler »", "« Il est trop tard »"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "On vint dire à Jaïrus : « Ta fille est morte ; pourquoi importuner davantage le maître ? » Jésus dit au chef : « Ne crains pas, crois seulement. » Arrivé à la maison, il dit : « L'enfant n'est pas morte, mais elle dort. » Ils se moquaient de lui. Il prit la main de l'enfant : « Talitha koumi » — « Jeune fille, lève-toi ! » Aussitôt elle se leva et marcha.",
      ref: "Marc 5:35-43",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Marc 5:36", texte: "Ne crains pas crois seulement" },
        { type: "qcm", q: "Que veut dire « Talitha koumi » ?", choix: ["« Jeune fille, lève-toi »", "« Sois guérie »", "« Que la paix soit »", "« Ouvre-toi »"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets ces quatre scènes dans l'ordre :", items: ["La tempête apaisée sur le lac", "L'homme des tombeaux délivré", "La femme qui touche son vêtement", "La fille de Jaïrus relevée"] },
      ],
    },
  ],
};
