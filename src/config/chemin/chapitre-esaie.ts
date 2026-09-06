import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 22 — Ésaïe (Ésaïe 6, 9, 40, 53). 8 étapes. */
export const CHAPITRE_ESAIE: CheminChapitre = {
  id: 22,
  nom: "Ésaïe",
  livre: "Ésaïe 6-53",
  accent: "#FB7185",
  decor: "/img/chemin/decor-22.jpg",
  sentier: [{ x: 69, y: 94 }, { x: 59.4, y: 84.3 }, { x: 58, y: 74.6 }, { x: 54.4, y: 64.9 }, { x: 39.9, y: 55 }, { x: 45.2, y: 45.3 }, { x: 51.3, y: 35.6 }, { x: 42.7, y: 26 }],
  fallback: ["#4a1420", "#6b1e2f", "#22080e"],
  carte: {
    id: "esaie",
    nom: "Ésaïe",
    titre: "Le prophète du Messie",
    rarete: "legendaire",
    image: "/img/chemin/cartes/esaie.jpg",
  },
  etapes: [
    {
      recit:
        "L'année de la mort du roi Ozias, je vis le Seigneur assis sur un trône très élevé, et les pans de sa robe remplissaient le temple. Des séraphins criaient l'un à l'autre : « Saint, saint, saint est l'Éternel des armées ! toute la terre est pleine de sa gloire. » Les portes furent ébranlées et la maison remplie de fumée.",
      ref: "Ésaïe 6:1-4",
      exercices: [
        { type: "qcm", q: "Que crient les séraphins ?", choix: ["« Saint, saint, saint est l'Éternel des armées »", "« Gloire à Dieu au plus haut des cieux »", "« Qui est comme l'Éternel ? »", "« Amen, amen »"], bonne: 0 },
        { type: "verset", ref: "Ésaïe 6:3", texte: "Toute la terre est pleine de sa gloire", niveau: "moyen" },
        { type: "qcm", q: "En quelle année Ésaïe reçoit-il cette vision ?", choix: ["L'année de la mort du roi Ozias", "L'année du retour d'exil", "L'année de la chute de Jérusalem", "L'année du couronnement d'Ézéchias"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Je dis : « Malheur à moi ! je suis perdu, car je suis un homme dont les lèvres sont impures, et mes yeux ont vu le Roi, l'Éternel des armées. » Alors l'un des séraphins vola vers moi, tenant une pierre ardente prise sur l'autel avec des pincettes. Il en toucha ma bouche : « Ton iniquité est enlevée, ton péché est expié. »",
      ref: "Ésaïe 6:5-7",
      exercices: [
        { type: "qcm", q: "Quelle est la première réaction d'Ésaïe devant Dieu ?", choix: ["« Malheur à moi ! je suis perdu »", "Il se réjouit aussitôt", "Il demande un signe", "Il s'enfuit du temple"], bonne: 0 },
        { type: "qcm", q: "Comment ses lèvres sont-elles purifiées ?", choix: ["Par une pierre ardente prise sur l'autel", "Par de l'eau du temple", "Par de l'huile", "Par un rouleau qu'il mange"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Ésaïe se déclare digne de voir Dieu.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "J'entendis la voix du Seigneur disant : « Qui enverrai-je, et qui marchera pour nous ? » Je répondis : « Me voici, envoie-moi. » Il dit : « Va, et dis à ce peuple : Vous entendrez et vous ne comprendrez point ; vous verrez et vous ne saisirez point. »",
      ref: "Ésaïe 6:8-10",
      exercices: [
        { type: "verset", ref: "Ésaïe 6:8", texte: "Me voici envoie-moi" },
        { type: "qui", indices: ["Je vois le Seigneur sur un trône, les pans de sa robe remplissent le temple.", "Une pierre ardente touche mes lèvres.", "Je réponds : « Me voici, envoie-moi ».", "J'annonce un enfant appelé Prince de la paix."], reponse: "Ésaïe", leurres: ["Jérémie", "Ézéchiel", "Daniel"] },
        { type: "qcm", q: "Que Dieu demande-t-il avant qu'Ésaïe réponde ?", choix: ["« Qui enverrai-je, et qui marchera pour nous ? »", "« Veux-tu être prophète ? »", "« Es-tu digne ? »", "« Qui est comme moi ? »"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le peuple qui marchait dans les ténèbres voit une grande lumière ; sur ceux qui habitaient le pays de l'ombre de la mort une lumière resplendit. Car un enfant nous est né, un fils nous est donné, et la domination reposera sur son épaule. On l'appellera Admirable, Conseiller, Dieu puissant, Père éternel, Prince de la paix.",
      ref: "Ésaïe 9:1-6",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Ésaïe 9:6", texte: "Un enfant nous est né un fils nous est donné" },
        { type: "qcm", q: "Quel nom N'EST PAS donné à l'enfant annoncé ?", choix: ["Roi des rois", "Admirable", "Prince de la paix", "Dieu puissant"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Que voit le peuple qui marchait dans les ténèbres ?", choix: ["Une grande lumière", "Une armée", "Un temple neuf", "Une étoile filante"], bonne: 0 },
      ],
    },
    {
      recit:
        "« Consolez, consolez mon peuple, dit votre Dieu. » Une voix crie : « Préparez au désert le chemin de l'Éternel, aplanissez dans les lieux arides une route pour notre Dieu. Toute vallée sera élevée, toute montagne et toute colline seront abaissées. »",
      ref: "Ésaïe 40:1-5",
      exercices: [
        { type: "qcm", q: "Que crie la voix dans le désert ?", choix: ["« Préparez le chemin de l'Éternel »", "« Fuyez la ville »", "« Le jour est venu »", "« Bâtissez le temple »"], bonne: 0 },
        { type: "vf", q: "Jean-Baptiste reprendra ces mots pour se décrire lui-même.", vrai: true, ref: "Jean 1:23", niveau: "moyen" },
        { type: "trou", texte: "« Consolez, consolez mon ___, dit votre Dieu. »", reponse: "peuple", leurres: ["fils", "temple", "serviteur"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent leur vol comme les aigles ; ils courent et ne se lassent point, ils marchent et ne se fatiguent point. L'Éternel est le Dieu d'éternité : il ne se fatigue point, il ne se lasse point, on ne peut sonder son intelligence.",
      ref: "Ésaïe 40:28-31",
      exercices: [
        { type: "verset", ref: "Ésaïe 40:31", texte: "Ceux qui se confient en l'Éternel renouvellent leur force" },
        { type: "qcm", q: "À quel oiseau leur vol est-il comparé ?", choix: ["L'aigle", "La colombe", "L'hirondelle", "Le corbeau"], bonne: 0 },
        { type: "qcm", q: "Que dit le texte de l'Éternel lui-même ?", choix: ["Il ne se fatigue point et ne se lasse point", "Il se repose le septième jour", "Il attend le retour du peuple", "Il change d'avis"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Il était méprisé et abandonné des hommes, homme de douleur et habitué à la souffrance. Cependant, ce sont nos souffrances qu'il a portées, c'est de nos douleurs qu'il s'est chargé ; et nous l'avons considéré comme puni, frappé de Dieu et humilié.",
      ref: "Ésaïe 53:1-4",
      exercices: [
        { type: "qcm", q: "Comment le serviteur est-il décrit ?", choix: ["Méprisé, homme de douleur, habitué à la souffrance", "Puissant et redouté", "Riche et honoré", "Inconnu de tous"], bonne: 0 },
        { type: "qcm", q: "De quoi s'est-il chargé ?", choix: ["De nos souffrances et de nos douleurs", "Du trône d'Israël", "Du service du temple", "Des dettes du peuple"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Ce chapitre est écrit des siècles avant la venue de Jésus.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Mais il était blessé pour nos péchés, brisé pour nos iniquités ; le châtiment qui nous donne la paix est tombé sur lui, et c'est par ses meurtrissures que nous sommes guéris. Nous étions tous errants comme des brebis, chacun suivait sa propre voie ; et l'Éternel a fait retomber sur lui l'iniquité de nous tous.",
      ref: "Ésaïe 53:5-6",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Ésaïe 53:5", texte: "C'est par ses meurtrissures que nous sommes guéris" },
        { type: "qcm", q: "À quoi le peuple est-il comparé ?", choix: ["À des brebis errantes", "À un troupeau de bœufs", "À des oiseaux migrateurs", "À un champ desséché"], bonne: 0 },
        { type: "ordre", consigne: "Remets le livre d'Ésaïe dans l'ordre :", items: ["La vision du trône et la pierre ardente", "« Un enfant nous est né »", "« Préparez le chemin de l'Éternel »", "Le serviteur blessé pour nos péchés"] },
      ],
    },
  ],
};
