import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 29 — Esdras et Néhémie, le retour (Esdras 1-3, Néhémie 1-8). 8 étapes. */
export const CHAPITRE_NEHEMIE: CheminChapitre = {
  id: 29,
  nom: "Néhémie",
  livre: "Esdras 1 - Néhémie 8",
  accent: "#FCA5A5",
  decor: "/img/chemin/decor-29.jpg",
  sentier: [{ x: 47.7, y: 94 }, { x: 48.6, y: 84.3 }, { x: 54.4, y: 74.6 }, { x: 41.5, y: 64.9 }, { x: 50.5, y: 55 }, { x: 39.7, y: 45.3 }, { x: 44.1, y: 35.6 }, { x: 48.1, y: 26 }],
  fallback: ["#4a2424", "#6b3535", "#221010"],
  carte: {
    id: "nehemie",
    nom: "Néhémie",
    titre: "Le bâtisseur de la muraille",
    rarete: "epique",
    image: "/img/chemin/cartes/nehemie.jpg",
  },
  etapes: [
    {
      recit:
        "La première année de Cyrus, roi de Perse, l'Éternel réveilla l'esprit du roi, qui fit publier dans tout son royaume : « Qui d'entre vous est de son peuple ? Qu'il monte à Jérusalem et bâtisse la maison de l'Éternel. » Cyrus rendit aussi les ustensiles que Nebucadnetsar avait emportés du temple.",
      ref: "Esdras 1",
      exercices: [
        { type: "qcm", q: "Quel roi autorise le retour des exilés ?", choix: ["Cyrus, roi de Perse", "Nebucadnetsar", "Darius", "Assuérus"], bonne: 0 },
        { type: "qcm", q: "Que rend-il en plus de la permission ?", choix: ["Les ustensiles emportés du temple", "Des soldats", "De l'or de son trésor personnel", "Des chevaux"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "L'exil à Babylone se termine par un édit d'un roi étranger.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Quand les ouvriers posèrent les fondements du temple, les sacrificateurs et les Lévites louèrent l'Éternel : « Car il est bon, car sa miséricorde dure à toujours ! » Mais beaucoup d'anciens qui avaient vu la première maison pleuraient à haute voix, tandis que d'autres poussaient des cris de joie : on ne pouvait distinguer les cris des pleurs.",
      ref: "Esdras 3:10-13",
      exercices: [
        { type: "qcm", q: "Pourquoi certains pleurent-ils à la pose des fondements ?", choix: ["Ils avaient connu le premier temple, bien plus grand", "Le chantier était mal fait", "Ils avaient perdu leur maison", "Ils regrettaient Babylone"], bonne: 0 },
        { type: "trou", texte: "« Car il est bon, car sa ___ dure à toujours ! »", reponse: "miséricorde", leurres: ["parole", "gloire", "justice"], niveau: "moyen" },
        { type: "vf", q: "On ne pouvait distinguer les cris de joie des pleurs.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Néhémie était échanson du roi à Suse. Des hommes venus de Juda lui dirent : « Ceux qui sont restés là-bas sont dans une grande misère ; la muraille de Jérusalem est en ruines et ses portes consumées par le feu. » Lorsque j'entendis ces choses, je m'assis, je pleurai, et je fus plusieurs jours dans la désolation ; je jeûnai et je priai.",
      ref: "Néhémie 1:1-4",
      exercices: [
        { type: "qui", indices: ["Je sers le vin au roi de Perse.", "J'apprends que la muraille de ma ville est en ruines.", "Je fais le tour des décombres de nuit, en secret.", "Je bâtis d'une main et je tiens une arme de l'autre."], reponse: "Néhémie", leurres: ["Esdras", "Zorobabel", "Mardochée"] },
        { type: "qcm", q: "Quel était le métier de Néhémie ?", choix: ["Échanson du roi", "Scribe", "Maçon", "Prêtre"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quelle est sa première réaction à la nouvelle ?", choix: ["Il pleure, jeûne et prie plusieurs jours", "Il part aussitôt", "Il écrit une lettre", "Il rassemble une armée"], bonne: 0 },
      ],
    },
    {
      recit:
        "Le roi lui dit : « Pourquoi as-tu mauvais visage ? Ce ne peut être qu'un chagrin de cœur. » Je fus saisi d'une grande crainte, et je répondis : « Que le roi vive éternellement ! Comment n'aurais-je pas mauvais visage, lorsque la ville où sont les sépulcres de mes pères est détruite ? » — « Que demandes-tu ? » Je priai le Dieu des cieux, et je fis ma demande au roi.",
      ref: "Néhémie 2:1-8",
      exercices: [
        { type: "qcm", q: "Que fait Néhémie juste avant de répondre au roi ?", choix: ["Il prie le Dieu des cieux", "Il consulte ses amis", "Il demande un délai", "Il se tait"], bonne: 0 },
        { type: "qcm", q: "Que demande-t-il au roi ?", choix: ["D'aller rebâtir la ville de ses pères", "De l'or", "Un poste plus élevé", "De rentrer chez lui"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Néhémie avait peur en parlant au roi.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Arrivé à Jérusalem, Néhémie y resta trois jours sans rien dire à personne. Puis il sortit de nuit avec quelques hommes et examina les murailles en ruines et les portes brûlées. Alors il dit aux chefs : « Vous voyez le malheur où nous sommes. Venez, rebâtissons la muraille de Jérusalem, et nous ne serons plus dans l'opprobre. »",
      ref: "Néhémie 2:11-18",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que fait Néhémie avant de parler aux chefs ?", choix: ["Il inspecte les ruines de nuit, en secret", "Il convoque une assemblée", "Il fait un sacrifice", "Il compte le peuple"], bonne: 0 },
        { type: "qcm", q: "Combien de jours attend-il en arrivant ?", choix: ["Trois", "Sept", "Un", "Quarante"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Quel mot d'ordre lance-t-il ?", choix: ["« Venez, rebâtissons la muraille »", "« Fuyons cette ville »", "« Attendons le roi »", "« Bâtissons d'abord le temple »"], bonne: 0 },
      ],
    },
    {
      recit:
        "Sanballat et Tobija se moquèrent : « Que font ces Juifs impuissants ? Si même un renard montait, il renverserait leur muraille de pierres ! » Puis ils complotèrent de venir combattre. Néhémie plaça des gardes jour et nuit, et le peuple travailla : d'une main à l'ouvrage, l'autre tenant une arme. Le peuple avait à cœur de travailler.",
      ref: "Néhémie 4",
      exercices: [
        { type: "qcm", q: "Comment le peuple travaille-t-il sous la menace ?", choix: ["D'une main à l'ouvrage, l'autre tenant une arme", "En travaillant seulement la nuit", "En cessant le travail", "En payant des mercenaires"], bonne: 0 },
        { type: "qcm", q: "Comment les adversaires attaquent-ils d'abord ?", choix: ["Par la moquerie", "Par les armes", "Par la famine", "Par un procès"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment le texte explique-t-il la réussite ?", choix: ["Le peuple avait à cœur de travailler", "Les murs étaient déjà debout", "Les ennemis ont renoncé d'eux-mêmes", "Le roi a envoyé une armée"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "La muraille fut achevée en cinquante-deux jours. Lorsque tous nos ennemis l'apprirent, toutes les nations qui étaient autour de nous furent dans la crainte : elles reconnurent que cet ouvrage s'était accompli par la volonté de notre Dieu.",
      ref: "Néhémie 6:15-16",
      exercices: [
        { type: "qcm", q: "En combien de jours la muraille est-elle achevée ?", choix: ["Cinquante-deux jours", "Sept ans", "Quarante jours", "Trois mois"], bonne: 0 },
        { type: "qcm", q: "Qu'en concluent les nations voisines ?", choix: ["Que l'ouvrage vient de Dieu", "Que les Juifs sont riches", "Que le roi les protège", "Que la muraille est fragile"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Les adversaires ont réussi à interrompre le chantier.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Tout le peuple se rassembla comme un seul homme. Esdras le scribe apporta le livre de la loi et le lut depuis le matin jusqu'au milieu du jour ; les oreilles de tout le peuple étaient attentives. Les Lévites expliquaient le sens, et le peuple pleurait en entendant. Néhémie leur dit : « Ne vous affligez pas, car la joie de l'Éternel sera votre force. »",
      ref: "Néhémie 8:1-12",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Néhémie 8:10", texte: "La joie de l'Éternel sera votre force" },
        { type: "qcm", q: "Que fait Esdras devant tout le peuple ?", choix: ["Il lit et fait expliquer le livre de la loi", "Il offre un sacrifice", "Il couronne un roi", "Il compte les familles"], bonne: 0 },
        { type: "ordre", consigne: "Remets le retour d'exil dans l'ordre :", items: ["L'édit de Cyrus", "Les fondements du temple posés", "Néhémie rebâtit la muraille", "Esdras lit la loi devant tout le peuple"] },
      ],
    },
  ],
};
