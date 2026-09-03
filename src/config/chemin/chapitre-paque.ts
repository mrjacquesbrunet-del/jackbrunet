import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 7 — La Pâque (Exode 5-13). 8 étapes. */
export const CHAPITRE_PAQUE: CheminChapitre = {
  id: 7,
  nom: "La Pâque",
  livre: "Exode 5-13",
  accent: "#EF4444",
  decor: "/img/chemin/decor-7.jpg",
  sentier: [{ x: 57.3, y: 94 }, { x: 44.4, y: 84.4 }, { x: 72.4, y: 74.9 }, { x: 35.2, y: 65.3 }, { x: 68.6, y: 55.7 }, { x: 47.7, y: 46.1 }, { x: 58.9, y: 36.6 }, { x: 68.7, y: 27 }],
  fallback: ["#3d1414", "#5c1d1d", "#1f0a0a"],
  carte: {
    id: "aaron",
    nom: "Aaron",
    titre: "La voix de Moïse",
    rarete: "epique",
    image: "/img/chemin/cartes/aaron.jpg",
  },
  etapes: [
    {
      recit:
        "Moïse et Aaron allèrent dire à Pharaon : « Ainsi parle l'Éternel : laisse aller mon peuple. » Pharaon répondit : « Qui est l'Éternel, pour que j'obéisse à sa voix ? Je ne connais pas l'Éternel. » Le même jour il ordonna qu'on ne donne plus de paille aux Hébreux, tout en exigeant la même quantité de briques.",
      ref: "Exode 5:1-9",
      exercices: [
        { type: "qcm", q: "Que répond Pharaon à la demande de Moïse ?", choix: ["« Je ne connais pas l'Éternel »", "« J'y consens volontiers »", "« Revenez demain »", "« Apportez-moi un signe »"], bonne: 0 },
        { type: "qcm", q: "Comment Pharaon durcit-il le travail des Hébreux ?", choix: ["Il supprime la paille sans réduire le nombre de briques", "Il double les journées de travail", "Il leur retire l'eau", "Il les envoie dans les mines"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« Ainsi parle l'Éternel : laisse aller mon ___. »", reponse: "peuple", leurres: ["serviteur", "prophète", "troupeau"] },
      ],
    },
    {
      recit:
        "Aaron jeta son bâton devant Pharaon, et il devint un serpent. Les magiciens d'Égypte en firent autant par leurs enchantements. Mais le bâton d'Aaron engloutit leurs bâtons. Le cœur de Pharaon s'endurcit, et il ne les écouta point, comme l'Éternel l'avait dit.",
      ref: "Exode 7:8-13",
      exercices: [
        { type: "qcm", q: "Que fait le bâton d'Aaron devant les magiciens ?", choix: ["Il engloutit leurs bâtons", "Il se brise", "Il devient de l'or", "Il disparaît"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Les magiciens d'Égypte reproduisent d'abord le signe.", vrai: true },
        { type: "trou", texte: "Le cœur de Pharaon ___, et il ne les écouta point.", reponse: "s'endurcit", leurres: ["se troubla", "se réjouit", "s'apaisa"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Au matin, Moïse alla trouver Pharaon au bord du fleuve. Aaron frappa les eaux : toutes les eaux du Nil furent changées en sang. Les poissons moururent, le fleuve devint infect, et les Égyptiens ne purent plus en boire. Ce fut la première plaie. Pharaon rentra chez lui et n'y prit point garde.",
      ref: "Exode 7:14-25",
      exercices: [
        { type: "qcm", q: "Quelle est la première plaie d'Égypte ?", choix: ["L'eau changée en sang", "Les grenouilles", "Les ténèbres", "La grêle"], bonne: 0 },
        { type: "vf", q: "Les Égyptiens pouvaient encore boire l'eau du fleuve.", vrai: false },
        { type: "qcm", q: "Où Moïse va-t-il trouver Pharaon ce matin-là ?", choix: ["Au bord du fleuve", "Dans son palais", "Au temple", "Sur un chantier"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Les plaies s'enchaînèrent : les grenouilles envahirent les maisons, la poussière devint des poux, des mouches venimeuses remplirent le pays, une peste frappa le bétail, des ulcères couvrirent hommes et bêtes, puis une grêle terrible ravagea les champs. À chaque fois Pharaon promettait, puis se rétractait dès que le fléau cessait.",
      ref: "Exode 8-9",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets ces plaies dans l'ordre :", items: ["L'eau changée en sang", "Les grenouilles", "Les poux", "Les mouches", "La peste du bétail"] },
        { type: "qcm", q: "Que fait Pharaon dès qu'une plaie cesse ?", choix: ["Il se rétracte et refuse de laisser partir le peuple", "Il tient parole", "Il s'enfuit", "Il consulte Moïse"], bonne: 0 },
        { type: "qcm", q: "Quelle région est épargnée par les plaies ?", choix: ["Le pays de Gosen, où habite Israël", "La ville de Ramsès", "Le delta du Nil", "Aucune"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Vint le vent d'orient : les sauterelles couvrirent la face du pays et dévorèrent ce que la grêle avait laissé. Puis Moïse étendit sa main vers le ciel : d'épaisses ténèbres couvrirent l'Égypte pendant trois jours. On ne se voyait pas les uns les autres, et nul ne se leva de sa place. Mais tous les enfants d'Israël avaient de la lumière là où ils habitaient.",
      ref: "Exode 10",
      exercices: [
        { type: "qcm", q: "Combien de jours durent les ténèbres ?", choix: ["Trois jours", "Sept jours", "Quarante jours", "Un jour"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qu'apportent les sauterelles ?", choix: ["Un vent d'orient", "Un vent du nord", "Une pluie de feu", "Une inondation"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Pendant les ténèbres, les Hébreux avaient de la lumière chez eux.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel dit : « Ce mois-ci sera pour vous le premier des mois. Le dixième jour, chacun prendra un agneau sans défaut, mâle, âgé d'un an. On l'immolera au crépuscule du quatorzième jour, et on mettra du sang sur les deux poteaux et le linteau des maisons. Quand je verrai le sang, je passerai par-dessus vous, et il n'y aura point de plaie sur vous. »",
      ref: "Exode 12:1-13",
      exercices: [
        { type: "verset", ref: "Exode 12:13", texte: "Quand je verrai le sang je passerai par-dessus vous", niveau: "expert" },
        { type: "qcm", q: "Où faut-il mettre le sang de l'agneau ?", choix: ["Sur les deux poteaux et le linteau de la porte", "Sur le seuil de la maison", "Sur le toit", "Sur l'autel du temple"], bonne: 0 },
        { type: "qcm", q: "Comment doit être l'agneau de la Pâque ?", choix: ["Sans défaut, mâle, âgé d'un an", "Le plus gros du troupeau", "Une brebis de deux ans", "Peu importe"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Au milieu de la nuit, l'Éternel frappa tous les premiers-nés du pays d'Égypte. Il y eut un grand cri, car il n'y avait pas de maison où il ne se trouvât un mort. Pharaon appela Moïse et Aaron pendant la nuit : « Levez-vous, sortez du milieu de mon peuple. Allez, servez l'Éternel. » Les Égyptiens pressaient le peuple de partir en hâte.",
      ref: "Exode 12:29-36",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quelle est la dixième et dernière plaie ?", choix: ["La mort des premiers-nés", "Les ténèbres", "Les sauterelles", "La grêle"], bonne: 0 },
        { type: "qcm", q: "Que dit Pharaon cette nuit-là ?", choix: ["« Sortez du milieu de mon peuple, servez l'Éternel »", "« Revenez demain matin »", "« Restez encore »", "« Je vous poursuivrai »"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Les Hébreux partent lentement, après plusieurs jours de préparatifs.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les enfants d'Israël partirent de Ramsès, environ six cent mille hommes de pied, sans compter les enfants. Ils emportèrent la pâte avant qu'elle fût levée et cuisirent des gâteaux sans levain. Le temps qu'ils avaient passé en Égypte fut de quatre cent trente ans. Ce fut une nuit de veille en l'honneur de l'Éternel.",
      ref: "Exode 12:37-42",
      exercices: [
        { type: "qcm", q: "Combien de temps Israël est-il resté en Égypte ?", choix: ["Quatre cent trente ans", "Quatre cents ans", "Cent vingt ans", "Soixante-dix ans"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Pourquoi le pain est-il sans levain ?", choix: ["Ils sont partis en hâte, la pâte n'avait pas levé", "C'était la coutume égyptienne", "Le levain était interdit en voyage", "Il n'y avait plus de farine"], bonne: 0, niveau: "moyen" },
        { type: "qui", indices: ["Je suis le frère aîné de Moïse.", "Je parle à sa place devant Pharaon.", "Mon bâton engloutit ceux des magiciens.", "Je deviendrai le premier souverain sacrificateur."], reponse: "Aaron", leurres: ["Josué", "Jéthro", "Caleb"], niveau: "moyen" },
      ],
    },
  ],
};
