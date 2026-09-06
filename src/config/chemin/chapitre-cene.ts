import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 43 — La Cène et Gethsémané (Jean 13, Matthieu 26). 8 étapes. */
export const CHAPITRE_CENE: CheminChapitre = {
  id: 43,
  nom: "La Cène",
  livre: "Jean 13-17, Matthieu 26",
  accent: "#C4B5FD",
  decor: "/img/chemin/decor-43.jpg",
  sentier: [{ x: 48.4, y: 94 }, { x: 53.7, y: 84.3 }, { x: 51.7, y: 74.6 }, { x: 51.7, y: 64.9 }, { x: 51.5, y: 55 }, { x: 59.4, y: 45.3 }, { x: 50.9, y: 35.6 }, { x: 41.3, y: 26 }],
  fallback: ["#2d2450", "#413570", "#120e26"],
  carte: {
    id: "marie-bethanie",
    nom: "Marie de Béthanie",
    titre: "Le parfum répandu",
    rarete: "epique",
    image: "/img/chemin/cartes/marie-bethanie.jpg",
  },
  etapes: [
    {
      recit:
        "Six jours avant la Pâque, à Béthanie, Marie prit un parfum de nard pur de grand prix, en oignit les pieds de Jésus et les essuya avec ses cheveux ; la maison fut remplie de l'odeur du parfum. Judas dit : « Pourquoi n'a-t-on pas vendu ce parfum trois cents deniers, pour les donner aux pauvres ? » Jésus dit : « Laisse-la garder ce parfum pour le jour de ma sépulture. »",
      ref: "Jean 12:1-8",
      exercices: [
        { type: "qui", indices: ["Je suis la sœur de Marthe et de Lazare.", "Je m'assieds aux pieds du Maître pour l'écouter.", "Je brise un vase de parfum de grand prix.", "J'essuie ses pieds avec mes cheveux."], reponse: "Marie de Béthanie", leurres: ["Marie-Madeleine", "La Samaritaine", "Marthe"] },
        { type: "qcm", q: "Que vaut le parfum, selon Judas ?", choix: ["Trois cents deniers", "Trente sicles", "Un talent", "Deux deniers"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment Jésus défend-il ce geste ?", choix: ["Elle garde ce parfum pour le jour de sa sépulture", "Elle est riche", "C'est un usage de la fête", "Il ne dit rien"], bonne: 0 },
      ],
    },
    {
      recit:
        "Avant la fête de Pâque, Jésus, sachant que son heure était venue, ayant aimé les siens qui étaient dans le monde, les aima jusqu'à la fin. Il se leva de table, ôta ses vêtements, prit un linge dont il se ceignit, versa de l'eau dans un bassin et se mit à laver les pieds des disciples.",
      ref: "Jean 13:1-5",
      exercices: [
        { type: "qcm", q: "Que fait Jésus au début du repas ?", choix: ["Il lave les pieds de ses disciples", "Il rompt le pain", "Il chante un psaume", "Il annonce sa mort"], bonne: 0 },
        { type: "trou", texte: "« Ayant aimé les siens, il les aima jusqu'à la ___. »", reponse: "fin", leurres: ["mort", "croix", "gloire"], niveau: "moyen" },
        { type: "vf", q: "Laver les pieds était le travail du serviteur le plus bas de la maison.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Il vint à Simon Pierre, qui lui dit : « Toi, Seigneur, tu me laves les pieds ! » — « Ce que je fais, tu ne le comprends pas maintenant, mais tu le comprendras bientôt. » — « Non, jamais tu ne me laveras les pieds. » — « Si je ne te lave, tu n'auras point de part avec moi. » — « Seigneur, non seulement les pieds, mais encore les mains et la tête ! »",
      ref: "Jean 13:6-10",
      exercices: [
        { type: "qcm", q: "Quelle est la première réaction de Pierre ?", choix: ["Il refuse d'être lavé par son Maître", "Il accepte aussitôt", "Il veut laver les autres", "Il se tait"], bonne: 0 },
        { type: "qcm", q: "Que répond Jésus à son refus ?", choix: ["« Si je ne te lave, tu n'auras point de part avec moi »", "« Comme tu voudras »", "« Tu comprendras au matin »", "« Sors d'ici »"], bonne: 0 },
        { type: "qcm", q: "Que demande alors Pierre ?", choix: ["Les mains et la tête aussi", "Un signe", "Un délai", "Rien de plus"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ayant repris ses vêtements, il leur dit : « Comprenez-vous ce que je vous ai fait ? Vous m'appelez Maître et Seigneur, et vous dites bien, car je le suis. Si donc je vous ai lavé les pieds, moi le Seigneur et le Maître, vous devez aussi vous laver les pieds les uns aux autres. Je vous ai donné un exemple, afin que vous fassiez comme je vous ai fait. »",
      ref: "Jean 13:12-17",
      exercices: [
        { type: "qcm", q: "Pourquoi Jésus a-t-il lavé leurs pieds ?", choix: ["Pour leur donner un exemple à imiter", "Parce qu'ils étaient sales", "Pour un rite de la Pâque", "Pour les éprouver"], bonne: 0 },
        { type: "verset", ref: "Jean 13:34", texte: "Aimez-vous les uns les autres comme je vous ai aimés", niveau: "moyen" },
        { type: "vf", q: "Jésus dit que le serviteur n'est pas plus grand que son maître.", vrai: true, ref: "Jean 13:16", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Pendant qu'ils mangeaient, Jésus prit du pain ; après avoir rendu grâces, il le rompit et le donna aux disciples : « Prenez, mangez, ceci est mon corps. » Il prit ensuite une coupe et, après avoir rendu grâces, il la leur donna : « Buvez-en tous ; car ceci est mon sang, le sang de l'alliance, qui est répandu pour plusieurs, pour la rémission des péchés. »",
      ref: "Matthieu 26:26-28",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Matthieu 26:26", texte: "Prenez mangez ceci est mon corps" },
        { type: "qcm", q: "Comment Jésus appelle-t-il la coupe ?", choix: ["Le sang de l'alliance, répandu pour la rémission des péchés", "La coupe de la Pâque", "Le vin nouveau", "La coupe du royaume"], bonne: 0 },
        { type: "vf", q: "Jérémie avait annoncé une alliance nouvelle des siècles plus tôt.", vrai: true, ref: "Jérémie 31:31", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus leur dit : « Cette nuit même, vous serez tous scandalisés à mon sujet. » Pierre répondit : « Quand tu serais pour tous une occasion de chute, tu ne le seras jamais pour moi. » Jésus lui dit : « En vérité, cette nuit même, avant que le coq chante, tu me renieras trois fois. » — « Quand il me faudrait mourir avec toi, je ne te renierai pas. »",
      ref: "Matthieu 26:31-35",
      exercices: [
        { type: "qcm", q: "Que Jésus annonce-t-il à Pierre ?", choix: ["Qu'il le reniera trois fois avant le chant du coq", "Qu'il fuira le premier", "Qu'il sera arrêté", "Qu'il le trahira pour de l'argent"], bonne: 0 },
        { type: "qcm", q: "Que répond Pierre ?", choix: ["Qu'il mourrait plutôt avec lui", "Qu'il ne comprend pas", "Qu'il partira", "Rien"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Judas avait déjà vendu Jésus pour trente pièces d'argent.", vrai: true, ref: "Matthieu 26:15", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Il alla avec eux dans un lieu appelé Gethsémané. Il commença à éprouver de la tristesse et des angoisses : « Mon âme est triste jusqu'à la mort ; restez ici et veillez avec moi. » S'étant avancé un peu plus loin, il se jeta sur sa face et pria : « Mon Père, s'il est possible, que cette coupe s'éloigne de moi ! Toutefois, non pas ce que je veux, mais ce que tu veux. »",
      ref: "Matthieu 26:36-39",
      exercices: [
        { type: "verset", ref: "Matthieu 26:39", texte: "Non pas ce que je veux mais ce que tu veux" },
        { type: "qcm", q: "Comment s'appelle le lieu de cette prière ?", choix: ["Gethsémané", "Golgotha", "Béthanie", "Siloé"], bonne: 0 },
        { type: "qcm", q: "Que trouve-t-il en revenant vers ses disciples ?", choix: ["Ils dormaient", "Ils priaient", "Ils avaient fui", "Ils veillaient armés"], bonne: 0, ref: "Matthieu 26:40", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comme il parlait encore, Judas arriva avec une foule armée d'épées et de bâtons. Il donna ce signe : « Celui que je baiserai, c'est lui. » Aussitôt il s'approcha : « Salut, Rabbi ! » et il le baisa. Jésus lui dit : « Mon ami, ce que tu es venu faire, fais-le. » Pierre tira l'épée ; Jésus lui dit : « Remets ton épée à sa place, car tous ceux qui prendront l'épée périront par l'épée. » Alors tous les disciples l'abandonnèrent et prirent la fuite.",
      ref: "Matthieu 26:47-56",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel signe Judas avait-il convenu ?", choix: ["Un baiser", "Un mot de passe", "Une lampe levée", "Un sifflet"], bonne: 0 },
        { type: "qcm", q: "Que dit Jésus à Pierre qui tire l'épée ?", choix: ["« Tous ceux qui prendront l'épée périront par l'épée »", "« Bien joué »", "« Frappe encore »", "« Fuyons »"], bonne: 0 },
        { type: "ordre", consigne: "Remets cette nuit dans l'ordre :", items: ["Le parfum répandu à Béthanie", "Jésus lave les pieds des disciples", "Le pain rompu et la coupe", "Gethsémané et l'arrestation"] },
      ],
    },
  ],
};
