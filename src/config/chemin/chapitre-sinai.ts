import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 9 — Le Sinaï (Exode 19-34). 10 étapes. */
export const CHAPITRE_SINAI: CheminChapitre = {
  id: 9,
  nom: "Le Sinaï",
  livre: "Exode 19-34",
  accent: "#A3E635",
  decor: "/img/chemin/decor-9.jpg",
  sentier: [{ x: 59.6, y: 94 }, { x: 54.6, y: 86.2 }, { x: 54, y: 78.4 }, { x: 58.3, y: 70.7 }, { x: 68.3, y: 62.9 }, { x: 58.3, y: 55.1 }, { x: 68.3, y: 47.3 }, { x: 58.3, y: 39.6 }, { x: 68.3, y: 31.8 }, { x: 58.3, y: 24 }],
  fallback: ["#2e3a10", "#455618", "#161c08"],
  carte: {
    id: "josue",
    nom: "Josué",
    titre: "Le serviteur devenu chef",
    rarete: "epique",
    image: "/img/chemin/cartes/josue.jpg",
  },
  etapes: [
    {
      recit:
        "Trois mois après la sortie d'Égypte, Israël campa devant la montagne du Sinaï. Dieu appela Moïse et dit : « Vous avez vu ce que j'ai fait à l'Égypte, et comment je vous ai portés sur des ailes d'aigle pour vous amener vers moi. Si vous écoutez ma voix et gardez mon alliance, vous serez pour moi un royaume de sacrificateurs et une nation sainte. »",
      ref: "Exode 19:1-6",
      exercices: [
        { type: "qcm", q: "À quoi Dieu compare-t-il la manière dont il a porté son peuple ?", choix: ["À des ailes d'aigle", "À un troupeau conduit au pâturage", "À un père portant son fils", "À un navire sur la mer"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« Vous serez pour moi un royaume de sacrificateurs et une nation ___. »", reponse: "sainte", leurres: ["forte", "libre", "grande"], niveau: "moyen" },
        { type: "qcm", q: "Combien de temps après la sortie d'Égypte arrivent-ils au Sinaï ?", choix: ["Trois mois", "Quarante jours", "Un an", "Sept jours"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Le troisième jour au matin, il y eut des tonnerres, des éclairs et une épaisse nuée sur la montagne. Le son de la trompette retentit fortement, et tout le peuple trembla. La montagne du Sinaï était toute en fumée, parce que l'Éternel y était descendu au milieu du feu ; elle tremblait, et le son de la trompette allait se renforçant.",
      ref: "Exode 19:16-20",
      exercices: [
        { type: "qcm", q: "Comment l'Éternel descend-il sur la montagne ?", choix: ["Au milieu du feu, avec fumée et tremblement", "En silence, dans la nuit", "Dans une brise légère", "Porté par un char"], bonne: 0 },
        { type: "qcm", q: "Quel instrument retentit sur la montagne ?", choix: ["La trompette", "Le tambourin", "La harpe", "Le cor de bélier des prêtres"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le peuple pouvait monter librement sur la montagne.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dieu prononça toutes ces paroles : « Je suis l'Éternel ton Dieu, qui t'ai fait sortir du pays d'Égypte, de la maison de servitude. Tu n'auras pas d'autres dieux devant ma face. Tu ne te feras point d'image taillée, ni de représentation quelconque, tu ne te prosterneras point devant elles. »",
      ref: "Exode 20:1-6",
      exercices: [
        { type: "qcm", q: "Par quoi Dieu commence-t-il les dix commandements ?", choix: ["En rappelant qu'il les a fait sortir d'Égypte", "Par l'interdiction de tuer", "Par le sabbat", "Par l'honneur dû aux parents"], bonne: 0, niveau: "moyen" },
        { type: "verset", ref: "Exode 20:3", texte: "Tu n'auras pas d'autres dieux devant ma face", niveau: "moyen" },
        { type: "qcm", q: "Que défend le deuxième commandement ?", choix: ["Se faire une image taillée et se prosterner devant elle", "Prononcer le nom de Dieu", "Travailler le septième jour", "Convoiter le bien d'autrui"], bonne: 0 },
      ],
    },
    {
      recit:
        "« Tu ne prendras point le nom de l'Éternel ton Dieu en vain. Souviens-toi du jour du repos, pour le sanctifier. Tu travailleras six jours, mais le septième est le jour du repos de l'Éternel ton Dieu : tu ne feras aucun ouvrage, ni toi, ni ton fils, ni ta fille, ni ton serviteur, ni ton bétail, ni l'étranger qui est dans tes portes. »",
      ref: "Exode 20:7-11",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel jour est mis à part pour le repos ?", choix: ["Le septième", "Le premier", "Le troisième", "Le dixième"], bonne: 0 },
        { type: "qcm", q: "Qui est concerné par le repos du septième jour ?", choix: ["Toute la maison, jusqu'au bétail et à l'étranger", "Seulement le chef de famille", "Seulement les prêtres", "Seulement les hommes libres"], bonne: 0, niveau: "expert" },
        { type: "trou", texte: "« Souviens-toi du jour du repos, pour le ___. »", reponse: "sanctifier", leurres: ["célébrer", "attendre", "compter"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Honore ton père et ta mère, afin que tes jours se prolongent dans le pays. Tu ne tueras point. Tu ne commettras point d'adultère. Tu ne déroberas point. Tu ne porteras point de faux témoignage contre ton prochain. Tu ne convoiteras point la maison de ton prochain, ni rien de ce qui lui appartient. »",
      ref: "Exode 20:12-17",
      exercices: [
        { type: "qcm", q: "Quelle promesse accompagne le commandement sur les parents ?", choix: ["Que tes jours se prolongent dans le pays", "Que tu seras riche", "Que tu auras beaucoup d'enfants", "Qu'aucun ennemi ne t'atteindra"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets ces commandements dans leur ordre :", items: ["Honore ton père et ta mère", "Tu ne tueras point", "Tu ne déroberas point", "Tu ne convoiteras point"] },
        { type: "qcm", q: "Combien de commandements Dieu donne-t-il au Sinaï ?", choix: ["Dix", "Sept", "Douze", "Cinq"], bonne: 0 },
      ],
    },
    {
      recit:
        "L'Éternel dit à Moïse : « Monte vers moi sur la montagne, et je te donnerai les tables de pierre. » Moïse se leva avec Josué son serviteur et monta. La nuée couvrit la montagne pendant six jours ; le septième jour, l'Éternel appela Moïse du milieu de la nuée. Moïse resta sur la montagne quarante jours et quarante nuits.",
      ref: "Exode 24:12-18",
      exercices: [
        { type: "qcm", q: "Combien de jours Moïse reste-t-il sur la montagne ?", choix: ["Quarante jours et quarante nuits", "Sept jours", "Trois jours", "Cent jours"], bonne: 0 },
        { type: "qui", indices: ["Je suis le serviteur de Moïse.", "J'ai mené le combat contre Amalek.", "Je monte avec lui vers la montagne de Dieu.", "Je conduirai plus tard le peuple dans le pays promis."], reponse: "Josué", leurres: ["Aaron", "Caleb", "Hur"], niveau: "moyen" },
        { type: "qcm", q: "Le combien-ième jour l'Éternel appelle-t-il Moïse du milieu de la nuée ?", choix: ["Le septième", "Le premier", "Le troisième", "Le quarantième"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Voyant que Moïse tardait, le peuple s'assembla auprès d'Aaron : « Fais-nous un dieu qui marche devant nous. » Aaron recueillit leurs anneaux d'or et fit un veau en fonte. Ils dirent : « Israël, voici ton dieu ! » L'Éternel dit à Moïse : « Descends ; ton peuple s'est corrompu. » Mais Moïse implora l'Éternel, et l'Éternel se repentit du mal qu'il avait résolu de faire.",
      ref: "Exode 32:1-14",
      exercices: [
        { type: "qcm", q: "Avec quoi Aaron fabrique-t-il le veau ?", choix: ["Les anneaux d'or du peuple", "Du bronze fondu", "Du bois de cèdre", "De l'argent du tabernacle"], bonne: 0 },
        { type: "qcm", q: "Pourquoi le peuple réclame-t-il un dieu visible ?", choix: ["Parce que Moïse tarde à redescendre", "Parce qu'ils ont faim", "Parce qu'Aaron le leur demande", "Parce qu'ils veulent rentrer en Égypte"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Moïse intercède pour le peuple auprès de l'Éternel.", vrai: true },
      ],
    },
    {
      recit:
        "Moïse descendit, les deux tables dans la main, écrites des deux côtés, de l'écriture de Dieu. Approchant du camp, il vit le veau et les danses : sa colère s'enflamma, il jeta les tables et les brisa au pied de la montagne. Il prit le veau, le brûla au feu, le réduisit en poudre et la répandit sur l'eau qu'il fit boire au peuple.",
      ref: "Exode 32:15-24",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que fait Moïse en voyant le veau d'or ?", choix: ["Il brise les tables de la Loi", "Il s'enfuit", "Il prie en silence", "Il remonte aussitôt"], bonne: 0 },
        { type: "qcm", q: "Que devient le veau d'or ?", choix: ["Brûlé, réduit en poudre et jeté sur l'eau", "Enterré dans le sable", "Emporté au désert", "Fondu en bijoux"], bonne: 0, niveau: "expert" },
        { type: "trou", texte: "Les tables étaient écrites des deux côtés, de l'écriture de ___.", reponse: "Dieu", leurres: ["Moïse", "Aaron", "la Loi"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Moïse dit : « Fais-moi voir ta gloire ! » L'Éternel répondit : « Je ferai passer devant toi toute ma bonté, et je proclamerai devant toi le nom de l'Éternel. Mais tu ne pourras pas voir ma face, car l'homme ne peut me voir et vivre. » Et il ajouta : « Tu te tiendras sur le rocher ; je te couvrirai de ma main jusqu'à ce que j'aie passé. »",
      ref: "Exode 33:12-23",
      exercices: [
        { type: "qcm", q: "Que demande Moïse à l'Éternel ?", choix: ["« Fais-moi voir ta gloire »", "« Donne-moi un successeur »", "« Ramène-nous en Égypte »", "« Envoie du pain »"], bonne: 0 },
        { type: "qcm", q: "Pourquoi Moïse ne peut-il voir la face de Dieu ?", choix: ["L'homme ne peut voir Dieu et vivre", "Il n'est pas sacrificateur", "Il a brisé les tables", "La nuée est trop épaisse"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Où Dieu place-t-il Moïse pour le protéger ?", choix: ["Dans le creux du rocher, couvert de sa main", "Dans sa tente", "Derrière la nuée", "Au pied de la montagne"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'Éternel dit : « Taille deux tables de pierre comme les premières, et monte vers moi. » Moïse monta de bon matin. L'Éternel passa devant lui en proclamant : « L'Éternel, Dieu miséricordieux et compatissant, lent à la colère, riche en bonté et en fidélité. » Moïse s'inclina et adora. Et l'Éternel renouvela son alliance avec le peuple.",
      ref: "Exode 34:1-10",
      exercices: [
        { type: "verset", ref: "Exode 34:6", texte: "L'Éternel Dieu miséricordieux et compatissant lent à la colère", niveau: "expert" },
        { type: "qcm", q: "Qui taille les secondes tables de pierre ?", choix: ["Moïse", "Aaron", "Dieu lui-même", "Josué"], bonne: 0, niveau: "expert" },
        { type: "ordre", consigne: "Remets le séjour au Sinaï dans l'ordre :", items: ["La montagne fume et tremble", "Dieu donne les dix commandements", "Le peuple fait le veau d'or", "Moïse brise les tables", "L'alliance est renouvelée"] },
      ],
    },
  ],
};
