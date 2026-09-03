import type { CheminChapitre } from "@/lib/chemin";

/**
 * Chapitre 30 — L'attente du Messie (Malachie, Psaumes, Zacharie).
 * Le pont entre les deux Testaments : ce que l'Ancien attendait, et que le
 * Nouveau va raconter. 8 étapes.
 */
export const CHAPITRE_ATTENTE: CheminChapitre = {
  id: 30,
  nom: "L'attente du Messie",
  livre: "Psaumes, Zacharie, Malachie",
  accent: "#FDE68A",
  decor: "/img/chemin/decor-30.jpg",
  sentier: [{ x: 61.6, y: 94 }, { x: 47.9, y: 84.3 }, { x: 30, y: 74.6 }, { x: 51.2, y: 64.9 }, { x: 38.9, y: 55 }, { x: 56.1, y: 45.3 }, { x: 50.5, y: 35.6 }, { x: 50.5, y: 26 }],
  fallback: ["#3d3410", "#584c18", "#1a1606"],
  carte: {
    id: "malachie",
    nom: "Malachie",
    titre: "La dernière voix avant l'aube",
    rarete: "epique",
    image: "/img/chemin/cartes/malachie.jpg",
  },
  etapes: [
    {
      recit:
        "David avait chanté : « L'Éternel est mon berger : je ne manquerai de rien. Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles. Quand je marche dans la vallée de l'ombre de la mort, je ne crains aucun mal, car tu es avec moi. »",
      ref: "Psaumes 23",
      exercices: [
        { type: "verset", ref: "Psaumes 23:1", texte: "L'Éternel est mon berger je ne manquerai de rien" },
        { type: "qcm", q: "Pourquoi le psalmiste ne craint-il aucun mal dans la vallée ?", choix: ["Parce que Dieu est avec lui", "Parce qu'il est armé", "Parce que la vallée est courte", "Parce qu'il n'est pas seul en chemin"], bonne: 0 },
        { type: "qcm", q: "Qui a composé ce psaume ?", choix: ["David", "Salomon", "Asaph", "Moïse"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Un psaume de David disait aussi : « Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ? Tous ceux qui me voient se moquent de moi. Ils ont percé mes mains et mes pieds ; ils se partagent mes vêtements, ils tirent au sort ma tunique. »",
      ref: "Psaumes 22:1-18",
      exercices: [
        { type: "qcm", q: "Par quels mots ce psaume commence-t-il ?", choix: ["« Mon Dieu, mon Dieu, pourquoi m'as-tu abandonné ? »", "« L'Éternel est mon berger »", "« Louez l'Éternel »", "« Heureux l'homme »"], bonne: 0 },
        { type: "vf", q: "Jésus reprendra ces mots sur la croix.", vrai: true, ref: "Matthieu 27:46", niveau: "moyen" },
        { type: "qcm", q: "Quel détail y est annoncé des siècles à l'avance ?", choix: ["Le partage des vêtements et le sort tiré sur la tunique", "Le tombeau vide", "La fuite en Égypte", "L'étoile des mages"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Zacharie annonça : « Sois transportée d'allégresse, fille de Sion ! Voici, ton roi vient à toi ; il est juste et victorieux, il est humble et monté sur un âne, sur un ânon, le petit d'une ânesse. »",
      ref: "Zacharie 9:9",
      exercices: [
        { type: "qcm", q: "Comment le roi annoncé entre-t-il dans sa ville ?", choix: ["Humble, monté sur un ânon", "Sur un char de guerre", "À la tête d'une armée", "Porté sur un trône"], bonne: 0 },
        { type: "vf", q: "Jésus accomplira ce texte le jour des Rameaux.", vrai: true, ref: "Matthieu 21:5", niveau: "moyen" },
        { type: "trou", texte: "« Il est juste et victorieux, il est ___ et monté sur un âne. »", reponse: "humble", leurres: ["fort", "riche", "grand"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Zacharie annonça encore le prix de la trahison : « Ils pesèrent pour mon salaire trente sicles d'argent. » Et : « Ils tourneront les regards vers moi, celui qu'ils ont percé ; ils pleureront sur lui comme on pleure sur un fils unique. »",
      ref: "Zacharie 11:12 - 12:10",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel prix est annoncé chez Zacharie ?", choix: ["Trente sicles d'argent", "Trois cents deniers", "Cinq talents", "Un sicle d'or"], bonne: 0 },
        { type: "vf", q: "Ce sera le prix payé à Judas.", vrai: true, ref: "Matthieu 26:15", niveau: "moyen" },
        { type: "qcm", q: "Que dit encore Zacharie de celui qui vient ?", choix: ["On regardera vers celui qu'on a percé", "Il régnera mille ans", "Il ne mourra jamais", "Il viendra dans le feu"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Malachie, le dernier des prophètes, écrivit : « Voici, j'enverrai mon messager ; il préparera le chemin devant moi. Et soudain entrera dans son temple le Seigneur que vous cherchez, le messager de l'alliance que vous désirez. »",
      ref: "Malachie 3:1",
      exercices: [
        { type: "qui", indices: ["Je suis le dernier prophète de l'Ancien Testament.", "J'annonce un messager qui préparera le chemin.", "Je parle du soleil de la justice qui se lèvera.", "Après moi, quatre siècles de silence."], reponse: "Malachie", leurres: ["Zacharie", "Aggée", "Joël"] },
        { type: "qcm", q: "Que fera le messager annoncé ?", choix: ["Préparer le chemin devant le Seigneur", "Bâtir le temple", "Régner sur Israël", "Rassembler les exilés"], bonne: 0 },
        { type: "vf", q: "Ce messager sera Jean-Baptiste.", vrai: true, ref: "Marc 1:2", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Malachie annonça encore : « Pour vous qui craignez mon nom, se lèvera le soleil de la justice, et la guérison sera sous ses ailes. Voici, je vous enverrai Élie, le prophète, avant que le jour de l'Éternel arrive. »",
      ref: "Malachie 4:2-5",
      exercices: [
        { type: "qcm", q: "Quelle image Malachie emploie-t-il pour celui qui vient ?", choix: ["Le soleil de la justice", "Le lion de Juda", "La pierre angulaire", "L'étoile du matin"], bonne: 0 },
        { type: "trou", texte: "« La ___ sera sous ses ailes. »", reponse: "guérison", leurres: ["paix", "lumière", "justice"], niveau: "moyen" },
        { type: "qcm", q: "Quel prophète est annoncé avant le jour de l'Éternel ?", choix: ["Élie", "Moïse", "Ésaïe", "Samuel"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Puis vinrent environ quatre siècles sans prophète. Le peuple revint d'exil, rebâtit le temple, vécut sous les Perses, sous les Grecs, puis sous Rome. Les synagogues lisaient les rouleaux, et l'espérance restait : un jour viendrait celui que Moïse et les prophètes avaient annoncé.",
      ref: "Malachie 4:4-6",
      exercices: [
        { type: "qcm", q: "Combien de temps s'écoule environ entre Malachie et Jean-Baptiste ?", choix: ["Environ quatre siècles", "Quarante ans", "Mille ans", "Un siècle"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets les empires traversés dans l'ordre :", items: ["Babylone", "La Perse", "La Grèce", "Rome"] },
        { type: "vf", q: "Pendant ce temps, aucun prophète ne parle en Israël.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Tout l'Ancien Testament tend vers un seul point : la Création, Abraham, la Pâque, la loi, le roi selon le cœur de Dieu, le serviteur souffrant, l'alliance nouvelle écrite dans les cœurs, le berger qui cherche la brebis perdue, l'enfant de Bethléhem. La route est prête. Il ne manque plus que celui qui vient la marcher.",
      ref: "Ésaïe 40:3-5",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets ces annonces dans l'ordre où tu les as rencontrées :", items: ["« Un enfant nous est né » — Ésaïe", "« Une alliance nouvelle » — Jérémie", "« Un cœur nouveau » — Ézéchiel", "« Ton roi vient, humble et monté sur un ânon » — Zacharie"] },
        { type: "qcm", q: "Où le Messie devait-il naître, selon Michée ?", choix: ["À Bethléhem", "À Jérusalem", "À Nazareth", "En Égypte"], bonne: 0, ref: "Michée 5:2" },
        { type: "qcm", q: "Qu'annonçait Ésaïe du serviteur ?", choix: ["Qu'il serait blessé pour nos péchés", "Qu'il régnerait par la force", "Qu'il ne viendrait jamais", "Qu'il serait un roi guerrier"], bonne: 0, ref: "Ésaïe 53:5", niveau: "moyen" },
      ],
    },
  ],
};
