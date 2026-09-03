import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 13 — Ruth (Ruth 1-4). 8 étapes. */
export const CHAPITRE_RUTH: CheminChapitre = {
  id: 13,
  nom: "Ruth",
  livre: "Ruth 1-4",
  accent: "#C084FC",
  decor: "/img/chemin/decor-13.jpg",
  sentier: [{ x: 48.9, y: 94 }, { x: 49.6, y: 84.3 }, { x: 46.6, y: 74.6 }, { x: 58.9, y: 64.9 }, { x: 59.4, y: 55 }, { x: 40.9, y: 45.3 }, { x: 48, y: 35.6 }, { x: 52, y: 26 }],
  fallback: ["#3a1f52", "#54306f", "#1a0d26"],
  carte: {
    id: "ruth",
    nom: "Ruth",
    titre: "La glaneuse de Bethléem",
    rarete: "epique",
    image: "/img/chemin/cartes/ruth.jpg",
  },
  etapes: [
    {
      recit:
        "Du temps des juges, il y eut une famine dans le pays. Un homme de Bethléem de Juda partit avec sa femme et ses deux fils pour faire un séjour dans le pays de Moab. Il s'appelait Élimélec, sa femme Naomi. Élimélec mourut, et ses deux fils épousèrent des femmes moabites : l'une se nommait Orpa, l'autre Ruth.",
      ref: "Ruth 1:1-5",
      exercices: [
        { type: "qcm", q: "Pourquoi la famille quitte-t-elle Bethléem ?", choix: ["À cause d'une famine", "À cause de la guerre", "Pour un commerce", "Sur l'ordre d'un roi"], bonne: 0 },
        { type: "qcm", q: "Comment s'appelle la belle-mère de Ruth ?", choix: ["Naomi", "Orpa", "Rachel", "Anne"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "De quel pays Ruth est-elle originaire ?", choix: ["Moab", "Édom", "L'Égypte", "Aram"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les deux fils moururent aussi, et Naomi resta seule. Elle apprit que l'Éternel avait visité son peuple et lui avait donné du pain ; elle se mit en route pour retourner à Bethléem. Elle dit à ses deux belles-filles : « Allez, retournez chacune à la maison de votre mère. » Orpa embrassa sa belle-mère et s'en alla. Ruth s'attacha à elle.",
      ref: "Ruth 1:6-14",
      exercices: [
        { type: "qcm", q: "Que font les deux belles-filles quand Naomi les renvoie ?", choix: ["Orpa s'en retourne, Ruth s'attache à Naomi", "Les deux restent avec elle", "Les deux s'en retournent", "Elles vont à Jérusalem"], bonne: 0 },
        { type: "vf", q: "Naomi voulait absolument garder ses deux belles-filles avec elle.", vrai: false, niveau: "moyen" },
        { type: "qcm", q: "Que veut dire le nom que Naomi se donne à Bethléem : « Mara » ?", choix: ["Amertume", "Étrangère", "Veuve", "Pauvre"], bonne: 0, ref: "Ruth 1:20", niveau: "expert" },
      ],
    },
    {
      recit:
        "Ruth répondit : « Ne me presse pas de te laisser, de retourner loin de toi ! Où tu iras j'irai, où tu demeureras je demeurerai ; ton peuple sera mon peuple, et ton Dieu sera mon Dieu ; où tu mourras je mourrai, et j'y serai enterrée. » Naomi, la voyant décidée à aller avec elle, cessa ses instances.",
      ref: "Ruth 1:16-18",
      exercices: [
        { type: "verset", ref: "Ruth 1:16", texte: "Ton peuple sera mon peuple et ton Dieu sera mon Dieu" },
        { type: "qcm", q: "Que promet Ruth à Naomi ?", choix: ["De la suivre partout, jusque dans la mort", "De lui envoyer de l'argent", "De revenir dans un an", "De prier pour elle à Moab"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Ruth choisit aussi le Dieu d'Israël, pas seulement le pays.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Elles arrivèrent à Bethléem au commencement de la moisson des orges. Ruth dit à Naomi : « Laisse-moi aller glaner des épis dans le champ de celui aux yeux duquel je trouverai grâce. » Elle se trouva par hasard dans la pièce de terre appartenant à Boaz, qui était de la famille d'Élimélec.",
      ref: "Ruth 2:1-3",
      exercices: [
        { type: "qcm", q: "À quelle saison arrivent-elles à Bethléem ?", choix: ["Au début de la moisson des orges", "Aux vendanges", "En plein hiver", "À la fête des tentes"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que va faire Ruth dans les champs ?", choix: ["Glaner les épis laissés derrière les moissonneurs", "Garder les troupeaux", "Vendre du pain", "Puiser l'eau"], bonne: 0 },
        { type: "qcm", q: "À qui appartient le champ où elle arrive ?", choix: ["À Boaz", "À Élimélec", "Au roi", "À Obed"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Boaz dit à Ruth : « On m'a rapporté tout ce que tu as fait pour ta belle-mère depuis la mort de ton mari, et comment tu as quitté ton père, ta mère et ton pays natal pour aller vers un peuple que tu ne connaissais point auparavant. Que l'Éternel te rende ce que tu as fait ! »",
      ref: "Ruth 2:8-12",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Je suis née dans un pays étranger à Israël.", "Je refuse de quitter ma belle-mère devenue veuve.", "Je glane derrière les moissonneurs pour nous nourrir.", "Je serai l'arrière-grand-mère du roi David."], reponse: "Ruth", leurres: ["Naomi", "Orpa", "Anne"] },
        { type: "qcm", q: "Comment Boaz traite-t-il Ruth dans son champ ?", choix: ["Il la protège et lui fait laisser des épis exprès", "Il la chasse", "Il l'ignore", "Il lui fait payer le grain"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La loi d'Israël demandait de laisser les glanures aux pauvres et aux étrangers.", vrai: true, ref: "Lévitique 19:9-10", niveau: "expert" },
      ],
    },
    {
      recit:
        "Naomi dit à Ruth : « Cet homme est notre parent ; il a sur nous droit de rachat. » Elle l'envoya de nuit à l'aire où Boaz vannait l'orge. Ruth se coucha à ses pieds. Au milieu de la nuit, Boaz s'éveilla : « Qui es-tu ? » — « Je suis Ruth, ta servante ; étends ton aile sur ta servante, car tu as droit de rachat. »",
      ref: "Ruth 3:1-11",
      exercices: [
        { type: "qcm", q: "Qu'est-ce qu'un « rédempteur », un parent avec droit de rachat ?", choix: ["Un proche qui rachète les biens et relève la famille d'un mort", "Un juge de la ville", "Un prêtre du temple", "Un collecteur d'impôts"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Où Ruth va-t-elle trouver Boaz de nuit ?", choix: ["À l'aire, où il vannait l'orge", "À la porte de la ville", "Dans sa maison", "Au puits"], bonne: 0 },
        { type: "trou", texte: "Boaz dit d'elle : « toute la porte de mon peuple sait que tu es une femme ___ ».", reponse: "vertueuse", leurres: ["étrangère", "pauvre", "jeune"], niveau: "expert" },
      ],
    },
    {
      recit:
        "Boaz monta à la porte de la ville et fit asseoir dix anciens. Il proposa le champ de Naomi à un parent plus proche que lui. Celui-ci d'abord accepta, puis, apprenant qu'il devait aussi épouser Ruth, se retira : « Je ne puis le racheter, de peur de détruire mon héritage. » Il ôta son soulier, selon l'usage, et Boaz racheta tout.",
      ref: "Ruth 4:1-10",
      exercices: [
        { type: "qcm", q: "Pourquoi le parent le plus proche renonce-t-il ?", choix: ["Il craint de nuire à son propre héritage", "Il est trop pauvre", "Il n'aime pas Naomi", "Il part en voyage"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel geste scelle l'accord devant les anciens ?", choix: ["Ôter son soulier et le donner", "Se serrer la main", "Signer une tablette", "Briser un pain"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Combien d'anciens Boaz fait-il asseoir ?", choix: ["Dix", "Trois", "Sept", "Douze"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Boaz prit Ruth pour femme, et elle enfanta un fils. Les femmes dirent à Naomi : « Béni soit l'Éternel, qui ne t'a point laissée manquer d'un rédempteur ! Ta belle-fille, qui t'aime, vaut mieux pour toi que sept fils. » On appela l'enfant Obed. Il fut le père d'Isaï, père de David.",
      ref: "Ruth 4:13-22",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets l'histoire de Ruth dans l'ordre :", items: ["La famine et le départ pour Moab", "« Ton peuple sera mon peuple »", "Ruth glane dans le champ de Boaz", "Obed naît, grand-père de David"] },
        { type: "qcm", q: "Qui est le fils de Ruth et de Boaz ?", choix: ["Obed", "Isaï", "David", "Salomon"], bonne: 0 },
        { type: "qcm", q: "Quel roi descend de Ruth ?", choix: ["David", "Saül", "Salomon seulement", "Ézéchias"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
