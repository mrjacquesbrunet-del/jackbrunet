import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 16 — Saül, le premier roi (1 Samuel 9-15). 8 étapes. */
export const CHAPITRE_SAUL: CheminChapitre = {
  id: 16,
  nom: "Saül",
  livre: "1 Samuel 9-15",
  accent: "#94A3B8",
  decor: "/img/chemin/decor-16.jpg",
  sentier: [{ x: 65.4, y: 94 }, { x: 49.9, y: 84.3 }, { x: 45.5, y: 74.6 }, { x: 46.4, y: 64.9 }, { x: 65.4, y: 55 }, { x: 42.4, y: 45.3 }, { x: 59.1, y: 35.6 }, { x: 44, y: 26 }],
  fallback: ["#2b3440", "#3f4c5c", "#131a21"],
  carte: {
    id: "saul",
    nom: "Saül",
    titre: "Le premier roi d'Israël",
    rarete: "epique",
    image: "/img/chemin/cartes/saul.jpg",
  },
  etapes: [
    {
      recit:
        "Il y avait un homme de Benjamin nommé Kis. Il avait un fils du nom de Saül, jeune et beau : aucun des enfants d'Israël n'était plus beau que lui, et il les dépassait tous de la tête. Les ânesses de Kis s'égarèrent, et Kis dit à Saül : « Prends avec toi un des serviteurs et va chercher les ânesses. »",
      ref: "1 Samuel 9:1-4",
      exercices: [
        { type: "qcm", q: "Que cherche Saül quand il rencontre Samuel ?", choix: ["Les ânesses égarées de son père", "Un trésor", "Un troupeau volé", "Son frère perdu"], bonne: 0 },
        { type: "qcm", q: "De quelle tribu est Saül ?", choix: ["Benjamin", "Juda", "Éphraïm", "Manassé"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Saül dépassait tout le peuple de la tête.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel avait averti Samuel la veille : « Demain je t'enverrai un homme du pays de Benjamin, et tu l'oindras pour chef de mon peuple d'Israël. » Samuel prit une fiole d'huile, la répandit sur la tête de Saül et le baisa : « L'Éternel ne t'a-t-il pas oint pour chef de son héritage ? »",
      ref: "1 Samuel 9:15 - 10:1",
      exercices: [
        { type: "qui", indices: ["Je pars chercher les ânesses de mon père et je reviens roi.", "Je dépasse tout le peuple de la tête.", "Je me cache dans les bagages le jour de mon élection.", "Je perds le royaume pour avoir désobéi."], reponse: "Saül", leurres: ["Jonathan", "Abner", "Isaï"] },
        { type: "qcm", q: "Avec quoi Samuel consacre-t-il Saül ?", choix: ["Une fiole d'huile", "Une couronne d'or", "Un anneau", "De l'eau du Jourdain"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qui avait averti Samuel la veille ?", choix: ["L'Éternel lui-même", "Les anciens d'Israël", "Kis, le père de Saül", "Un ange à Silo"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Samuel convoqua le peuple à Mitspa. On tira au sort : la tribu de Benjamin fut désignée, puis la famille de Matri, puis Saül. On le chercha, mais on ne le trouva point : il s'était caché parmi les bagages. On courut le tirer de là, et il dépassait tout le peuple de la tête. « Voyez celui que l'Éternel a choisi ! » Et tout le peuple poussa des cris : « Vive le roi ! »",
      ref: "1 Samuel 10:17-24",
      exercices: [
        { type: "qcm", q: "Où se cache Saül le jour de sa proclamation ?", choix: ["Parmi les bagages", "Dans une grotte", "Chez son père", "Derrière l'autel"], bonne: 0 },
        { type: "qcm", q: "Comment le roi est-il désigné devant le peuple ?", choix: ["Par le sort, tribu après famille", "Par un vote", "Par combat singulier", "Par ordre de naissance"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Samuel convoqua tout le peuple à ___.", reponse: "Mitspa", leurres: ["Silo", "Guilgal", "Béthel"], niveau: "expert" },
      ],
    },
    {
      recit:
        "Nachasch l'Ammonite assiégea Jabès en Galaad et voulut leur crever à tous l'œil droit. Quand Saül apprit la nouvelle, l'esprit de Dieu le saisit et il entra dans une grande colère. Il rassembla le peuple, marcha de nuit et battit les Ammonites au petit matin. Le peuple dit : « Confirmons la royauté à Guilgal. »",
      ref: "1 Samuel 11",
      exercices: [
        { type: "qcm", q: "Quelle ville Saül délivre-t-il en premier ?", choix: ["Jabès en Galaad", "Jéricho", "Béthel", "Gath"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel peuple assiégeait cette ville ?", choix: ["Les Ammonites", "Les Philistins", "Les Moabites", "Les Amalécites"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Après cette victoire, la royauté de Saül est confirmée à Guilgal.", vrai: true },
      ],
    },
    {
      recit:
        "À Guilgal, Saül attendit sept jours l'arrivée de Samuel. Le peuple se dispersait ; alors Saül offrit lui-même l'holocauste. Samuel arriva : « Qu'as-tu fait ? Tu as agi en insensé. Maintenant ton règne ne durera point. L'Éternel s'est choisi un homme selon son cœur. »",
      ref: "1 Samuel 13:8-14",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quelle faute Saül commet-il à Guilgal ?", choix: ["Il offre lui-même le sacrifice sans attendre Samuel", "Il fuit devant les Philistins", "Il refuse de combattre", "Il compte le peuple"], bonne: 0 },
        { type: "trou", texte: "« L'Éternel s'est choisi un homme selon son ___. »", reponse: "cœur", leurres: ["rang", "âge", "peuple"], niveau: "moyen" },
        { type: "qcm", q: "Combien de jours Saül a-t-il attendu ?", choix: ["Sept", "Trois", "Quarante", "Un"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Jonathan, fils de Saül, dit à son écuyer : « Rien n'empêche l'Éternel de sauver par un petit nombre comme par un grand. » Ils montèrent seuls au poste des Philistins et en abattirent une vingtaine. L'épouvante se répandit dans le camp ennemi et la terre trembla : ce fut une terreur de Dieu.",
      ref: "1 Samuel 14:1-15",
      exercices: [
        { type: "verset", ref: "1 Samuel 14:6", texte: "Rien n'empêche l'Éternel de sauver par un petit nombre comme par un grand", niveau: "moyen" },
        { type: "qcm", q: "Qui monte seul avec son écuyer contre le poste philistin ?", choix: ["Jonathan, le fils de Saül", "Saül lui-même", "David", "Abner"], bonne: 0 },
        { type: "qcm", q: "Qu'arrive-t-il dans le camp philistin ?", choix: ["L'épouvante s'y répand et la terre tremble", "Un incendie éclate", "Ils demandent la paix", "Ils reçoivent des renforts"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Samuel dit à Saül : « Va, frappe Amalek, et dévoue par interdit tout ce qui lui appartient. » Mais Saül épargna le roi Agag et le meilleur du bétail. Samuel vint : « Qu'est-ce donc que ce bêlement de brebis qui parvient à mes oreilles ? » Saül répondit : « Le peuple a épargné le meilleur, pour le sacrifier à l'Éternel. »",
      ref: "1 Samuel 15:1-21",
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui trahit la désobéissance de Saül ?", choix: ["Le bêlement des brebis épargnées", "Une lettre interceptée", "Le témoignage d'Agag", "Un songe de Samuel"], bonne: 0 },
        { type: "qcm", q: "Comment Saül se justifie-t-il ?", choix: ["« Le peuple a épargné le meilleur pour le sacrifier »", "« J'ai oublié l'ordre »", "« Samuel a mal parlé »", "« L'armée était trop faible »"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment s'appelle le roi d'Amalek épargné ?", choix: ["Agag", "Nachasch", "Achisch", "Hadad"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Samuel dit : « L'Éternel trouve-t-il du plaisir aux holocaustes autant qu'à l'obéissance à sa voix ? Voici, l'obéissance vaut mieux que les sacrifices. Puisque tu as rejeté la parole de l'Éternel, il te rejette aussi comme roi. » Samuel n'alla plus voir Saül jusqu'au jour de sa mort, mais il pleurait sur lui.",
      ref: "1 Samuel 15:22-35",
      coffre: true,
      exercices: [
        { type: "verset", ref: "1 Samuel 15:22", texte: "L'obéissance vaut mieux que les sacrifices" },
        { type: "ordre", consigne: "Remets le règne de Saül dans l'ordre :", items: ["Il cherche les ânesses et rencontre Samuel", "Il se cache parmi les bagages à Mitspa", "Il offre le sacrifice sans attendre à Guilgal", "Il épargne Agag et perd le royaume"] },
        { type: "qcm", q: "Pourquoi Saül est-il rejeté comme roi ?", choix: ["Il a rejeté la parole de l'Éternel", "Il a perdu une bataille", "Il était trop vieux", "Il a quitté Israël"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
