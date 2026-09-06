import type { CheminChapitre } from "@/lib/chemin";

/**
 * Les Psaumes. 8 étapes.
 * Placé juste après David roi : c'est là que le psautier prend sa source.
 * L'`id` est la clé de sauvegarde et ne bouge jamais ; le numéro affiché au
 * joueur est la position dans la route (voir `numeroChapitre`).
 */
export const CHAPITRE_PSAUMES: CheminChapitre = {
  id: 56,
  nom: "Les Psaumes",
  livre: "Psaumes 1-150",
  accent: "#7DD3FC",
  decor: "/img/chemin/decor-56.jpg",
  sentier: [{ x: 53.7, y: 94 }, { x: 67.2, y: 84.3 }, { x: 56.3, y: 74.6 }, { x: 37.3, y: 64.9 }, { x: 57.3, y: 55 }, { x: 50.2, y: 45.3 }, { x: 43.1, y: 35.6 }, { x: 47.7, y: 26 }],
  fallback: ["#0d3350", "#144a72", "#051624"],
  carte: {
    id: "asaph",
    nom: "Asaph",
    titre: "Le chef des chantres",
    rarete: "epique",
    image: "/img/chemin/cartes/asaph.jpg",
  },
  etapes: [
    {
      recit:
        "Le psautier s'ouvre sur deux chemins. « Heureux l'homme qui ne marche pas selon le conseil des méchants, mais qui trouve son plaisir dans la loi de l'Éternel, et qui la médite jour et nuit ! Il est comme un arbre planté près d'un courant d'eau, qui donne son fruit en sa saison, et dont le feuillage ne se flétrit point. »",
      ref: "Psaumes 1:1-3",
      exercices: [
        { type: "verset", ref: "Psaumes 1:3", texte: "Il est comme un arbre planté près d'un courant d'eau" },
        { type: "qcm", q: "À quoi l'homme heureux est-il comparé ?", choix: ["À un arbre planté près d'un courant d'eau", "À un rocher", "À un oiseau", "À une lampe"], bonne: 0 },
        { type: "qcm", q: "À quoi les méchants sont-ils comparés dans le même psaume ?", choix: ["À la paille que le vent dissipe", "À un arbre sec", "À un torrent", "À un mur qui tombe"], bonne: 0, ref: "Psaumes 1:4", niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Les cieux racontent la gloire de Dieu, et l'étendue manifeste l'œuvre de ses mains. Le jour en instruit un autre jour, la nuit en donne connaissance à une autre nuit. Ce n'est pas un langage, ce ne sont pas des paroles dont le son ne soit point entendu : leur retentissement parcourt toute la terre. La loi de l'Éternel est parfaite, elle restaure l'âme. »",
      ref: "Psaumes 19:1-7",
      exercices: [
        { type: "verset", ref: "Psaumes 19:1", texte: "Les cieux racontent la gloire de Dieu" },
        { type: "qcm", q: "Quelles sont les deux voix de ce psaume ?", choix: ["La création, puis la loi de l'Éternel", "Le temple et le roi", "Le passé et l'avenir", "La mer et la montagne"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que dit le psaume de la loi de l'Éternel ?", choix: ["Elle est parfaite et restaure l'âme", "Elle est lourde à porter", "Elle est réservée aux prêtres", "Elle sera abolie"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« L'Éternel est mon berger : je ne manquerai de rien. Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles. Il restaure mon âme, il me conduit dans les sentiers de la justice, à cause de son nom. »",
      ref: "Psaumes 23:1-3",
      exercices: [
        { type: "verset", ref: "Psaumes 23:1", texte: "L'Éternel est mon berger je ne manquerai de rien" },
        { type: "qcm", q: "Quelle image ouvre ce psaume ?", choix: ["Le berger", "Le roi", "Le rocher", "Le bouclier"], bonne: 0 },
        { type: "vf", q: "Jésus reprendra cette image en se disant le bon berger.", vrai: true, ref: "Jean 10:11", niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Quand je marche dans la vallée de l'ombre de la mort, je ne crains aucun mal, car tu es avec moi : ta houlette et ton bâton me rassurent. Tu dresses devant moi une table, en face de mes adversaires ; tu oins d'huile ma tête, et ma coupe déborde. Oui, le bonheur et la grâce m'accompagneront tous les jours de ma vie, et j'habiterai dans la maison de l'Éternel jusqu'à la fin de mes jours. »",
      ref: "Psaumes 23:4-6",
      exercices: [
        { type: "verset", ref: "Psaumes 23:4", texte: "Je ne crains aucun mal car tu es avec moi" },
        { type: "qcm", q: "Pourquoi le psalmiste ne craint-il rien dans la vallée ?", choix: ["Parce que Dieu est avec lui", "Parce que la vallée est courte", "Parce qu'il est armé", "Parce qu'il n'est pas seul en chemin"], bonne: 0 },
        { type: "trou", texte: "« Tu oins d'huile ma tête, et ma coupe ___. »", reponse: "déborde", leurres: ["se remplit", "se vide", "attend"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Après la visite de Nathan, David écrivit : « Ô Dieu, aie pitié de moi dans ta bonté ; selon ta grande miséricorde, efface mes transgressions. Lave-moi complètement de mon iniquité. Car je reconnais mes transgressions, et mon péché est constamment devant moi. Ô Dieu, crée en moi un cœur pur, renouvelle en moi un esprit bien disposé. Les sacrifices qui sont agréables à Dieu, c'est un esprit brisé : ô Dieu, tu ne dédaignes pas un cœur brisé et contrit. »",
      ref: "Psaumes 51:1-19",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Psaumes 51:10", texte: "Ô Dieu crée en moi un cœur pur" },
        { type: "qcm", q: "Après quel événement ce psaume est-il écrit ?", choix: ["La faute de David et la visite de Nathan", "La mort de Saül", "La prise de Jérusalem", "La fuite devant Absalom"], bonne: 0 },
        { type: "qcm", q: "Quel sacrifice Dieu ne dédaigne pas, selon ce psaume ?", choix: ["Un cœur brisé et contrit", "Un taureau sans défaut", "Un jeûne de sept jours", "Une offrande d'or"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant. Je dis à l'Éternel : Mon refuge et ma forteresse, mon Dieu en qui je me confie ! Il te couvrira de ses plumes, et tu trouveras un refuge sous ses ailes. Tu ne craindras ni les terreurs de la nuit, ni la flèche qui vole de jour. »",
      ref: "Psaumes 91:1-5",
      exercices: [
        { type: "verset", ref: "Psaumes 91:1", texte: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant" },
        { type: "qcm", q: "Quelles images de protection ce psaume emploie-t-il ?", choix: ["L'abri, la forteresse, les ailes", "L'épée et le bouclier seuls", "La montagne", "Le navire"], bonne: 0 },
        { type: "vf", q: "Le tentateur citera ce psaume à Jésus dans le désert.", vrai: true, ref: "Matthieu 4:6", niveau: "expert" },
      ],
    },
    {
      recit:
        "« Mon âme, bénis l'Éternel, et n'oublie aucun de ses bienfaits ! C'est lui qui pardonne toutes tes iniquités, qui guérit toutes tes maladies. Autant l'orient est éloigné de l'occident, autant il éloigne de nous nos transgressions. Comme un père a compassion de ses enfants, l'Éternel a compassion de ceux qui le craignent ; car il sait de quoi nous sommes formés, il se souvient que nous sommes poussière. »",
      ref: "Psaumes 103:1-14",
      exercices: [
        { type: "verset", ref: "Psaumes 103:12", texte: "Autant l'orient est éloigné de l'occident autant il éloigne de nous nos transgressions" },
        { type: "qcm", q: "À quoi la compassion de Dieu est-elle comparée ?", choix: ["À celle d'un père pour ses enfants", "À celle d'un roi pour son peuple", "À celle d'un maître pour ses serviteurs", "À celle d'un berger pour ses brebis"], bonne: 0 },
        { type: "qcm", q: "De quoi Dieu se souvient-il à notre sujet ?", choix: ["Que nous sommes poussière", "Que nous sommes forts", "Que nous sommes nombreux", "Que nous avons péché"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le psautier finit comme il avait commencé : par un homme devant Dieu, mais cette fois la voix est celle de tout ce qui vit. « Louez Dieu dans son sanctuaire ! Louez-le au son de la trompette, louez-le avec le luth et la harpe, louez-le avec le tambourin, louez-le avec les cymbales sonores ! Que tout ce qui respire loue l'Éternel ! »",
      ref: "Psaumes 150:1-6",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Psaumes 150:6", texte: "Que tout ce qui respire loue l'Éternel" },
        { type: "qui", indices: ["Je suis lévite et chef des chantres au temple.", "David m'établit devant l'arche pour célébrer l'Éternel.", "Douze psaumes portent mon nom.", "Dans l'un d'eux, j'avoue avoir failli glisser en voyant prospérer les méchants."], reponse: "Asaph", leurres: ["Héman", "Jedouthun", "Éthan"] },
        { type: "ordre", consigne: "Remets ces psaumes dans l'ordre du psautier :", items: ["« Heureux l'homme… » — Psaume 1", "« L'Éternel est mon berger » — Psaume 23", "« Crée en moi un cœur pur » — Psaume 51", "« Que tout ce qui respire loue l'Éternel » — Psaume 150"] },
      ],
    },
  ],
};
