import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 18 — Salomon (1 Rois 3-11). 8 étapes. */
export const CHAPITRE_SALOMON: CheminChapitre = {
  id: 18,
  nom: "Salomon",
  livre: "1 Rois 3-11",
  accent: "#EAB308",
  decor: "/img/chemin/decor-18.jpg",
  sentier: [{ x: 50.3, y: 94 }, { x: 58.1, y: 84.3 }, { x: 50.9, y: 74.6 }, { x: 56.2, y: 64.9 }, { x: 50, y: 55 }, { x: 46.7, y: 45.3 }, { x: 52.4, y: 35.6 }, { x: 46, y: 26 }],
  fallback: ["#4a3c05", "#6b570b", "#221b02"],
  carte: {
    id: "salomon",
    nom: "Salomon",
    titre: "Le roi qui demanda la sagesse",
    rarete: "legendaire",
    image: "/img/chemin/cartes/salomon.jpg",
  },
  etapes: [
    {
      recit:
        "À Gabaon, l'Éternel apparut en songe à Salomon pendant la nuit : « Demande ce que tu veux que je te donne. » Salomon répondit : « Je ne suis qu'un jeune homme, je ne sais pas me conduire. Accorde donc à ton serviteur un cœur intelligent pour juger ton peuple, pour discerner le bien du mal. »",
      ref: "1 Rois 3:5-9",
      exercices: [
        { type: "qcm", q: "Que demande Salomon à Dieu ?", choix: ["Un cœur intelligent pour juger le peuple", "De longs jours", "La richesse", "La victoire sur ses ennemis"], bonne: 0 },
        { type: "qui", indices: ["Je suis le fils de David et de Bath-Schéba.", "Dieu m'offre ce que je veux et je demande la sagesse.", "Je tranche entre deux femmes et un seul enfant.", "Je bâtis le temple de Jérusalem."], reponse: "Salomon", leurres: ["Absalom", "Roboam", "Nathan"] },
        { type: "qcm", q: "Où Dieu lui apparaît-il en songe ?", choix: ["À Gabaon", "À Jérusalem", "À Hébron", "Au Carmel"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Cette parole plut au Seigneur : « Parce que tu n'as demandé ni une longue vie, ni les richesses, ni la mort de tes ennemis, mais l'intelligence pour juger, je te donne un cœur sage et intelligent. Je te donne en outre ce que tu n'as pas demandé : les richesses et la gloire. »",
      ref: "1 Rois 3:10-14",
      exercices: [
        { type: "qcm", q: "Que Dieu ajoute-t-il à la sagesse de Salomon ?", choix: ["Les richesses et la gloire", "Une armée invincible", "Un fils unique", "Un royaume sans fin"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Dieu reproche à Salomon d'avoir mal demandé.", vrai: false },
        { type: "qcm", q: "Quelles trois choses Salomon n'a-t-il PAS demandées ?", choix: ["Une longue vie, les richesses, la mort de ses ennemis", "La paix, le temple, un fils", "La guerre, l'or, la gloire", "Le trône, l'arche, la loi"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Deux femmes vinrent au roi, se disputant un enfant vivant. Salomon dit : « Apportez-moi une épée, et partagez en deux l'enfant. » L'une s'écria : « Donnez-lui l'enfant vivant, et ne le tuez point ! » L'autre dit : « Qu'il ne soit ni à moi ni à toi ; coupez ! » Le roi reconnut la vraie mère à sa compassion.",
      ref: "1 Rois 3:16-28",
      exercices: [
        { type: "qcm", q: "Comment Salomon reconnaît-il la vraie mère ?", choix: ["Elle renonce à l'enfant pour qu'il vive", "Elle jure sur l'autel", "Elle décrit l'enfant", "Un témoin la désigne"], bonne: 0 },
        { type: "qcm", q: "Que propose le roi pour trancher ?", choix: ["De partager l'enfant en deux", "De tirer au sort", "D'attendre un an", "De confier l'enfant au temple"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Salomon avait réellement l'intention de partager l'enfant.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dieu donna à Salomon une sagesse comme le sable qui est au bord de la mer. Il prononça trois mille sentences et composa mille cinq cantiques. Il parla des arbres, depuis le cèdre du Liban jusqu'à l'hysope, ainsi que des animaux, des oiseaux, des reptiles et des poissons. On venait de tous les peuples pour l'entendre.",
      ref: "1 Rois 4:29-34",
      exercices: [
        { type: "qcm", q: "À quoi la sagesse de Salomon est-elle comparée ?", choix: ["Au sable au bord de la mer", "Aux étoiles du ciel", "Au cèdre du Liban", "À l'or d'Ophir"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de sentences prononce-t-il ?", choix: ["Trois mille", "Mille", "Sept cents", "Dix mille"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Des gens venaient de tous les peuples pour écouter sa sagesse.", vrai: true },
      ],
    },
    {
      recit:
        "Salomon bâtit la maison de l'Éternel à Jérusalem. Le bois de cèdre venait du Liban, envoyé par Hiram roi de Tyr. La pierre était taillée à la carrière : on n'entendit ni marteau, ni hache, ni aucun instrument de fer dans la maison pendant qu'on la bâtissait. Il mit sept ans à l'achever.",
      ref: "1 Rois 6",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui frappe pendant la construction du temple ?", choix: ["On n'entend aucun outil de fer sur le chantier", "Il est bâti en un jour", "Il est bâti sans fondations", "Personne n'y travaille"], bonne: 0 },
        { type: "qcm", q: "Combien d'années dure la construction ?", choix: ["Sept ans", "Quarante ans", "Trois ans", "Vingt ans"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel roi fournit le bois de cèdre ?", choix: ["Hiram, roi de Tyr", "Pharaon", "Nachasch", "Achisch"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Quand les sacrificateurs sortirent du sanctuaire, la nuée remplit la maison de l'Éternel : ils ne purent y rester pour faire le service. Salomon pria, les mains étendues vers le ciel : « Mais quoi ! Dieu habiterait-il véritablement sur la terre ? Les cieux et les cieux des cieux ne peuvent te contenir : combien moins cette maison que je t'ai bâtie ! »",
      ref: "1 Rois 8:10-30",
      exercices: [
        { type: "qcm", q: "Que se passe-t-il quand le temple est consacré ?", choix: ["La nuée remplit la maison de l'Éternel", "Un tremblement de terre", "Le feu tombe du ciel", "Une éclipse"], bonne: 0 },
        { type: "trou", texte: "« Les cieux et les cieux des cieux ne peuvent te ___. »", reponse: "contenir", leurres: ["cacher", "atteindre", "louer"], niveau: "moyen" },
        { type: "qcm", q: "Dans quelle position Salomon prie-t-il ?", choix: ["Les mains étendues vers le ciel", "Le visage contre terre seulement", "Assis sur son trône", "En marchant autour de l'autel"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "La reine de Séba vint éprouver Salomon par des énigmes. Elle vit toute sa sagesse, la maison qu'il avait bâtie, la table, les serviteurs et les holocaustes : elle fut hors d'elle-même. « On ne m'en avait pas dit la moitié ! Ta sagesse et ta prospérité surpassent ce que la renommée m'a fait connaître. »",
      ref: "1 Rois 10:1-13",
      exercices: [
        { type: "qcm", q: "Pourquoi la reine de Séba vient-elle ?", choix: ["Éprouver Salomon par des énigmes", "Demander une alliance militaire", "Réclamer un tribut", "Se réfugier chez lui"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« On ne m'en avait pas dit la ___ ! »", reponse: "moitié", leurres: ["vérité", "raison", "suite"], niveau: "moyen" },
        { type: "vf", q: "Elle repart déçue de sa visite.", vrai: false },
      ],
    },
    {
      recit:
        "Salomon aima beaucoup de femmes étrangères. Au temps de sa vieillesse, elles inclinèrent son cœur vers d'autres dieux, et son cœur ne fut point tout entier à l'Éternel. Dieu lui dit : « Puisque tu n'as pas gardé mon alliance, je déchirerai le royaume et je le donnerai à ton serviteur — mais pas de ton vivant, à cause de David ton père. »",
      ref: "1 Rois 11:1-13",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui détourne le cœur de Salomon ?", choix: ["Ses femmes étrangères et leurs dieux", "L'argent du temple", "La guerre", "Une famine"], bonne: 0 },
        { type: "qcm", q: "Quelle sera la conséquence pour le royaume ?", choix: ["Il sera déchiré et divisé", "Il sera détruit aussitôt", "Il doublera de taille", "Il sera vendu à Tyr"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets le règne de Salomon dans l'ordre :", items: ["Le songe de Gabaon : il demande la sagesse", "Le jugement des deux femmes", "La construction du temple", "Son cœur se détourne dans sa vieillesse"] },
      ],
    },
  ],
};
