import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 10 — Josué et Jéricho (Josué 1-6). 8 étapes. */
export const CHAPITRE_JOSUE: CheminChapitre = {
  id: 10,
  nom: "Josué",
  livre: "Josué 1-6",
  accent: "#14B8A6",
  decor: "/img/chemin/decor-10.jpg",
  sentier: [{ x: 50.5, y: 94 }, { x: 53.7, y: 84.3 }, { x: 50.1, y: 74.6 }, { x: 58.5, y: 64.9 }, { x: 50, y: 55 }, { x: 60.9, y: 45.3 }, { x: 53.2, y: 35.6 }, { x: 55.2, y: 26 }],
  fallback: ["#0d4a44", "#12645b", "#04211e"],
  carte: {
    id: "rahab",
    nom: "Rahab",
    titre: "Le cordon écarlate",
    rarete: "epique",
    image: "/img/chemin/cartes/rahab.jpg",
  },
  etapes: [
    {
      recit:
        "Après la mort de Moïse, l'Éternel dit à Josué : « Moïse, mon serviteur, est mort. Lève-toi, passe ce Jourdain, toi et tout ce peuple, pour entrer dans le pays que je donne aux enfants d'Israël. Fortifie-toi et prends courage. Je serai avec toi comme j'ai été avec Moïse ; je ne te délaisserai point, je ne t'abandonnerai point. »",
      ref: "Josué 1:1-9",
      exercices: [
        { type: "qcm", q: "Qui succède à Moïse à la tête d'Israël ?", choix: ["Josué", "Aaron", "Caleb", "Éléazar"], bonne: 0 },
        { type: "verset", ref: "Josué 1:9", texte: "Fortifie-toi et prends courage", niveau: "moyen" },
        { type: "qcm", q: "Quelle promesse Dieu répète-t-il à Josué ?", choix: ["« Je ne te délaisserai point »", "« Tu ne verras pas la guerre »", "« Tu régneras quarante ans »", "« Le pays viendra à toi »"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Josué envoya secrètement deux espions à Jéricho. Ils entrèrent dans la maison d'une femme nommée Rahab. Le roi les fit rechercher, mais elle les cacha sous des tiges de lin sur son toit. « Je sais que l'Éternel vous a donné ce pays, leur dit-elle. Jurez-moi de faire grâce à la maison de mon père. » Ils lui dirent d'attacher à sa fenêtre un cordon de fil écarlate.",
      ref: "Josué 2",
      exercices: [
        { type: "qui", indices: ["J'habite une maison bâtie dans la muraille de la ville.", "Je cache deux étrangers sous des tiges de lin.", "Je crois que leur Dieu a donné le pays.", "J'attache un cordon écarlate à ma fenêtre."], reponse: "Rahab", leurres: ["Débora", "Jaël", "Ruth"] },
        { type: "qcm", q: "Où Rahab cache-t-elle les deux espions ?", choix: ["Sous des tiges de lin sur son toit", "Dans un puits", "Dans une jarre à grain", "Sous son lit"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel signe doit sauver sa maison ?", choix: ["Un cordon écarlate à la fenêtre", "Une lampe allumée la nuit", "Une croix sur la porte", "Un drapeau blanc sur le toit"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le peuple partit pour passer le Jourdain, les sacrificateurs portant l'arche de l'alliance en tête. Or le Jourdain déborde sur toutes ses rives tout le temps de la moisson. Dès que les pieds des sacrificateurs touchèrent l'eau, les eaux qui descendaient s'arrêtèrent et s'élevèrent en un monceau. Tout Israël passa à sec.",
      ref: "Josué 3",
      exercices: [
        { type: "qcm", q: "Quand les eaux du Jourdain s'arrêtent-elles ?", choix: ["Quand les pieds des sacrificateurs touchent l'eau", "Quand Josué lève son javelot", "Au lever du soleil", "Quand le peuple crie"], bonne: 0 },
        { type: "vf", q: "Le Jourdain était alors à son plus bas niveau, facile à traverser.", vrai: false, niveau: "moyen" },
        { type: "qcm", q: "Que portaient les sacrificateurs en tête du peuple ?", choix: ["L'arche de l'alliance", "Le chandelier d'or", "Les tables de la loi seules", "Le bâton de Moïse"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel dit à Josué : « Prenez douze hommes, un homme par tribu, et qu'ils emportent douze pierres du milieu du Jourdain. » Josué les dressa à Guilgal et dit : « Lorsque vos enfants demanderont un jour : Que signifient ces pierres ? vous leur direz : Israël a passé ce Jourdain à sec. »",
      ref: "Josué 4",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Combien de pierres sont tirées du lit du Jourdain ?", choix: ["Douze, une par tribu", "Sept", "Quarante", "Trois"], bonne: 0 },
        { type: "trou", texte: "Josué dressa les douze pierres à ___.", reponse: "Guilgal", leurres: ["Béthel", "Silo", "Hébron"], niveau: "expert" },
        { type: "qcm", q: "Pourquoi ces pierres sont-elles dressées ?", choix: ["Pour que les enfants demandent et qu'on raconte", "Pour marquer une frontière", "Pour bâtir un autel de sacrifices", "Pour compter les tribus"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comme Josué était près de Jéricho, il leva les yeux et vit un homme debout devant lui, son épée nue à la main. « Es-tu des nôtres ou de nos ennemis ? » — « Non, répondit-il, je suis le chef de l'armée de l'Éternel. » Josué tomba le visage contre terre. « Ôte tes souliers de tes pieds, car le lieu sur lequel tu te tiens est saint. »",
      ref: "Josué 5:13-15",
      exercices: [
        { type: "qcm", q: "Que répond l'homme à l'épée quand Josué demande de quel côté il est ?", choix: ["« Je suis le chef de l'armée de l'Éternel »", "« Je suis un ange gardien »", "« Je viens de Jéricho »", "« Je suis un messager du roi »"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« Ôte tes souliers de tes pieds, car le lieu sur lequel tu te tiens est ___. »", reponse: "saint", leurres: ["à moi", "maudit", "gardé"], niveau: "moyen" },
        { type: "vf", q: "Moïse avait entendu les mêmes mots devant le buisson ardent.", vrai: true, ref: "Exode 3:5", niveau: "expert" },
      ],
    },
    {
      recit:
        "Jéricho était fermée et barricadée devant les enfants d'Israël. L'Éternel dit à Josué : « Vois, je livre entre tes mains Jéricho et son roi. Faites le tour de la ville, vous tous les hommes de guerre, une fois par jour. Tu feras ainsi pendant six jours. »",
      ref: "Josué 6:1-7",
      exercices: [
        { type: "qcm", q: "Combien de jours Israël fait-il une fois le tour de la ville ?", choix: ["Six jours", "Trois jours", "Sept jours", "Quarante jours"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jéricho était grande ouverte à l'arrivée d'Israël.", vrai: false },
        { type: "qcm", q: "Qui marche en tête de la procession ?", choix: ["Sept sacrificateurs avec des trompettes devant l'arche", "Les douze espions", "Les femmes et les enfants", "Les chars de guerre"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Le septième jour, ils se levèrent dès l'aurore et firent sept fois le tour de la ville. À la septième fois, Josué dit : « Poussez des cris, car l'Éternel vous a livré la ville ! » Le peuple poussa des cris, et la muraille s'écroula. Le peuple monta dans la ville, chacun devant soi.",
      ref: "Josué 6:12-21",
      exercices: [
        { type: "ordre", consigne: "Remets la prise de Jéricho dans l'ordre :", items: ["Rahab cache les deux espions", "Israël traverse le Jourdain à sec", "Six jours d'un tour par jour", "Sept tours le septième jour, puis le cri"] },
        { type: "qcm", q: "Combien de tours le septième jour ?", choix: ["Sept", "Un", "Trois", "Douze"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce qui fait tomber la muraille ?", choix: ["Le cri du peuple au son des trompettes", "Un tremblement de terre annoncé", "Un bélier de siège", "Le feu mis aux portes"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Josué dit aux deux espions : « Entrez dans la maison de la femme et faites-en sortir tout ce qui lui appartient, comme vous le lui avez juré. » Ils firent sortir Rahab, son père, sa mère, ses frères et tous les siens, et elle habita au milieu d'Israël. Elle avait caché les messagers que Josué avait envoyés.",
      ref: "Josué 6:22-25",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qu'advient-il de Rahab et de sa famille ?", choix: ["Ils sont sauvés et habitent au milieu d'Israël", "Ils sont chassés au désert", "Ils retournent à Jéricho reconstruite", "Ils sont emmenés en Égypte"], bonne: 0 },
        { type: "vf", q: "Rahab est plus tard nommée dans la généalogie de Jésus.", vrai: true, ref: "Matthieu 1:5", niveau: "expert" },
        { type: "qcm", q: "Pourquoi est-elle épargnée ?", choix: ["À cause du serment fait aux espions qu'elle a cachés", "Parce qu'elle a ouvert la porte de la ville", "Parce qu'elle est de la tribu de Juda", "Parce qu'elle a payé une rançon"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
