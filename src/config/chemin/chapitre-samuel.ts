import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 14 — Samuel (1 Samuel 1-8). 8 étapes. */
export const CHAPITRE_SAMUEL: CheminChapitre = {
  id: 14,
  nom: "Samuel",
  livre: "1 Samuel 1-8",
  accent: "#60A5FA",
  decor: "/img/chemin/decor-14.jpg",
  sentier: [{ x: 55, y: 94 }, { x: 58.1, y: 84.3 }, { x: 41.7, y: 74.6 }, { x: 53.2, y: 64.9 }, { x: 51.6, y: 55 }, { x: 51, y: 45.3 }, { x: 45.9, y: 35.6 }, { x: 50.8, y: 26 }],
  fallback: ["#132f52", "#1d456f", "#081426"],
  carte: {
    id: "samuel",
    nom: "Samuel",
    titre: "L'enfant qui écoute",
    rarete: "legendaire",
    image: "/img/chemin/cartes/samuel.jpg",
  },
  etapes: [
    {
      recit:
        "Il y avait un homme d'Éphraïm nommé Elkana. Il avait deux femmes : Anne, qui n'avait point d'enfants, et Peninna, qui en avait. Chaque année ils montaient à Silo pour se prosterner devant l'Éternel. Sa rivale l'irritait pour la fâcher, parce que l'Éternel l'avait rendue stérile. Anne pleurait et ne mangeait point.",
      ref: "1 Samuel 1:1-8",
      exercices: [
        { type: "qcm", q: "Pourquoi Anne pleure-t-elle ?", choix: ["Elle n'a pas d'enfant", "Son mari est parti", "Elle a perdu ses troupeaux", "Elle est malade"], bonne: 0 },
        { type: "qcm", q: "Où la famille monte-t-elle chaque année ?", choix: ["À Silo", "À Jérusalem", "À Béthel", "À Hébron"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment s'appelle le mari d'Anne ?", choix: ["Elkana", "Éli", "Isaï", "Manoach"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'âme pleine d'amertume, Anne pria l'Éternel et versa des pleurs : « Si tu donnes à ta servante un enfant mâle, je le consacrerai à l'Éternel pour tous les jours de sa vie. » Elle parlait dans son cœur, ses lèvres remuaient sans qu'on entende sa voix ; Éli le sacrificateur la crut ivre. « Non, dit-elle, je répands mon âme devant l'Éternel. »",
      ref: "1 Samuel 1:9-18",
      exercices: [
        { type: "qcm", q: "Que promet Anne si Dieu lui donne un fils ?", choix: ["De le consacrer à l'Éternel toute sa vie", "De bâtir un autel", "De donner sa fortune", "De jeûner un an"], bonne: 0 },
        { type: "qcm", q: "Pourquoi Éli la croit-il ivre ?", choix: ["Ses lèvres remuent sans qu'on entende sa voix", "Elle chante fort", "Elle titube", "Elle rit sans raison"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qui est Éli ?", choix: ["Le sacrificateur de Silo", "Le roi d'Israël", "Le mari de Peninna", "Un prophète de Juda"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Anne devint enceinte et enfanta un fils. Elle l'appela Samuel, « car, dit-elle, je l'ai demandé à l'Éternel ». Quand il fut sevré, elle le mena à Silo : « C'est pour cet enfant que je priais. L'Éternel a exaucé la prière que je lui adressais ; aussi je veux le prêter à l'Éternel pour toute sa vie. »",
      ref: "1 Samuel 1:20-28",
      exercices: [
        { type: "qui", indices: ["Ma mère m'a demandé à Dieu dans les larmes.", "Je sers dans le sanctuaire dès mon enfance.", "Une voix m'appelle trois fois pendant la nuit.", "J'oindrai deux rois d'Israël."], reponse: "Samuel", leurres: ["Éli", "Samson", "Élie"] },
        { type: "trou", texte: "Anne l'appela Samuel, car elle l'avait ___ à l'Éternel.", reponse: "demandé", leurres: ["promis", "voué", "donné"], niveau: "moyen" },
        { type: "vf", q: "Anne garde son fils avec elle et le confie plus tard, adulte.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les fils d'Éli, Hophni et Phinées, étaient des hommes pervers : ils ne connaissaient point l'Éternel et méprisaient les offrandes. Éli, très vieux, les reprit : « Pourquoi agissez-vous ainsi ? » Mais ils n'écoutèrent point la voix de leur père. Le jeune Samuel, lui, grandissait, et il était agréable à l'Éternel et aux hommes.",
      ref: "1 Samuel 2:12-26",
      exercices: [
        { type: "qcm", q: "Comment s'appellent les deux fils d'Éli ?", choix: ["Hophni et Phinées", "Nadab et Abihu", "Jonathan et Abner", "Joab et Abisaï"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Que reproche-t-on aux fils d'Éli ?", choix: ["Ils méprisent les offrandes et ne connaissent pas l'Éternel", "Ils désertent la guerre", "Ils volent les troupeaux", "Ils refusent de se marier"], bonne: 0 },
        { type: "vf", q: "Éli a réprimandé ses fils, mais ils ne l'ont pas écouté.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "La parole de l'Éternel était rare en ce temps-là. Samuel était couché dans le temple, où était l'arche, et la lampe de Dieu n'était pas encore éteinte. L'Éternel appela : « Samuel ! » Il courut vers Éli : « Me voici. » — « Je n'ai point appelé, retourne te coucher. » Cela arriva trois fois.",
      ref: "1 Samuel 3:1-8",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Combien de fois Samuel court-il vers Éli ?", choix: ["Trois fois", "Une fois", "Sept fois", "Deux fois"], bonne: 0 },
        { type: "qcm", q: "Que dit le texte de la parole de Dieu en ce temps-là ?", choix: ["Elle était rare", "Elle était partout", "Elle était écrite chaque jour", "Elle avait cessé pour toujours"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qu'est-ce qui brûlait encore dans le sanctuaire ?", choix: ["La lampe de Dieu", "Le feu de l'autel", "L'encens du matin", "Un flambeau d'Éli"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Éli comprit que c'était l'Éternel qui appelait l'enfant : « Va te coucher ; et si l'on t'appelle, tu diras : Parle, Éternel, car ton serviteur écoute. » L'Éternel vint et appela comme les autres fois. Samuel répondit : « Parle, car ton serviteur écoute. » Tout Israël, de Dan jusqu'à Beer-Schéba, reconnut que Samuel était prophète.",
      ref: "1 Samuel 3:9-21",
      exercices: [
        { type: "verset", ref: "1 Samuel 3:10", texte: "Parle, car ton serviteur écoute" },
        { type: "qcm", q: "Qui apprend à Samuel comment répondre ?", choix: ["Éli", "Sa mère Anne", "Un ange", "Elkana"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Tout Israël reconnut Samuel comme prophète, depuis Dan jusqu'à ___.", reponse: "Beer-Schéba", leurres: ["Jéricho", "Silo", "Gaza"], niveau: "expert" },
      ],
    },
    {
      recit:
        "Israël sortit contre les Philistins et fut battu. On alla chercher l'arche de l'alliance à Silo, croyant qu'elle sauverait. Les Philistins la prirent, et les deux fils d'Éli périrent. Quand Éli apprit que l'arche était prise, il tomba de son siège et mourut. Sa belle-fille appela son enfant Icabod : « La gloire est bannie d'Israël. »",
      ref: "1 Samuel 4",
      exercices: [
        { type: "qcm", q: "Que fait Israël pour gagner la bataille ?", choix: ["Il fait venir l'arche de l'alliance au camp", "Il jeûne sept jours", "Il achète des chars", "Il fuit dans les montagnes"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que signifie le nom Icabod ?", choix: ["La gloire est bannie", "Dieu a répondu", "Fils de la douleur", "Le rocher du salut"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "L'arche a protégé Israël parce qu'elle était là.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Samuel jugea Israël toute sa vie. Devenu vieux, il établit ses fils comme juges, mais ils se détournèrent vers le gain. Les anciens vinrent lui dire : « Établis sur nous un roi pour nous juger, comme il y en a chez toutes les nations. » Cela déplut à Samuel. L'Éternel lui dit : « Écoute leur voix ; ce n'est pas toi qu'ils rejettent, c'est moi. »",
      ref: "1 Samuel 8",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets l'histoire de Samuel dans l'ordre :", items: ["La prière d'Anne à Silo", "L'enfant est prêté à l'Éternel", "« Parle, car ton serviteur écoute »", "Israël réclame un roi"] },
        { type: "qcm", q: "Que demande le peuple à Samuel devenu vieux ?", choix: ["Un roi, comme les autres nations", "Un nouveau temple", "La guerre contre Moab", "Le partage du pays"], bonne: 0 },
        { type: "qcm", q: "Que répond l'Éternel à Samuel blessé par cette demande ?", choix: ["« Ce n'est pas toi qu'ils rejettent, c'est moi »", "« Refuse-leur cela »", "« Choisis ton propre fils »", "« Quitte le pays »"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
