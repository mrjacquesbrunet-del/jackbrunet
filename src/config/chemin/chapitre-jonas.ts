import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 21 — Jonas (Jonas 1-4). 8 étapes. */
export const CHAPITRE_JONAS: CheminChapitre = {
  id: 21,
  nom: "Jonas",
  livre: "Jonas 1-4",
  accent: "#0891B2",
  decor: "/img/chemin/decor-21.jpg",
  sentier: [{ x: 63.3, y: 94 }, { x: 64.6, y: 84.3 }, { x: 68.1, y: 74.6 }, { x: 60, y: 64.9 }, { x: 48.3, y: 55 }, { x: 52, y: 45.3 }, { x: 36.7, y: 35.6 }, { x: 48.3, y: 26 }],
  fallback: ["#063d47", "#0a5a68", "#021c21"],
  carte: {
    id: "jonas",
    nom: "Jonas",
    titre: "Le prophète en fuite",
    rarete: "legendaire",
    image: "/img/chemin/cartes/jonas.jpg",
  },
  etapes: [
    {
      recit:
        "La parole de l'Éternel fut adressée à Jonas, fils d'Amitthaï : « Lève-toi, va à Ninive, la grande ville, et crie contre elle ! car sa méchanceté est montée jusqu'à moi. » Et Jonas se leva pour s'enfuir à Tarsis, loin de la face de l'Éternel. Il descendit à Japho, trouva un navire, paya le prix du passage et s'embarqua.",
      ref: "Jonas 1:1-3",
      exercices: [
        { type: "qcm", q: "Où Dieu envoie-t-il Jonas ?", choix: ["À Ninive", "À Tarsis", "À Babylone", "À Jérusalem"], bonne: 0 },
        { type: "qcm", q: "Que fait Jonas en recevant cet ordre ?", choix: ["Il fuit dans la direction opposée", "Il part aussitôt", "Il demande un signe", "Il envoie un serviteur"], bonne: 0 },
        { type: "trou", texte: "Jonas s'embarque à Japho pour ___.", reponse: "Tarsis", leurres: ["Ninive", "Tyr", "Chypre"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel fit souffler sur la mer un vent impétueux, et le navire menaçait de se briser. Les mariniers crièrent chacun à son dieu. Jonas, descendu au fond du navire, dormait profondément. Le pilote le réveilla : « Pourquoi dors-tu ? Lève-toi, invoque ton Dieu ! »",
      ref: "Jonas 1:4-6",
      exercices: [
        { type: "qcm", q: "Que fait Jonas pendant la tempête ?", choix: ["Il dort au fond du navire", "Il rame", "Il prie sur le pont", "Il saute à l'eau"], bonne: 0 },
        { type: "qcm", q: "Qui vient le réveiller ?", choix: ["Le pilote du navire", "Un ange", "Un marin de Tarsis", "Le capitaine du port"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Les mariniers priaient chacun son propre dieu.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "On tira au sort, et le sort tomba sur Jonas. « Je suis Hébreu, dit-il, et je crains l'Éternel, le Dieu des cieux, qui a fait la mer et la terre. Prenez-moi et jetez-moi dans la mer, et elle se calmera : je sais que c'est moi qui attire sur vous cette grande tempête. » Ils le jetèrent, et la mer s'apaisa.",
      ref: "Jonas 1:7-16",
      exercices: [
        { type: "qui", indices: ["Je fuis par la mer pour échapper à un ordre.", "Je dors pendant que le navire va se briser.", "Un grand poisson m'engloutit trois jours.", "Je m'irrite parce que Dieu a pardonné."], reponse: "Jonas", leurres: ["Élie", "Amos", "Osée"] },
        { type: "qcm", q: "Comment les marins découvrent-ils le coupable ?", choix: ["Ils tirent au sort", "Jonas avoue tout de suite", "Le pilote le devine", "Un rêve le leur montre"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que demande Jonas aux marins ?", choix: ["De le jeter à la mer", "De le ramener au port", "De l'enchaîner", "De prier pour lui"], bonne: 0 },
      ],
    },
    {
      recit:
        "L'Éternel fit venir un grand poisson pour engloutir Jonas, et Jonas fut dans le ventre du poisson trois jours et trois nuits. De là il pria : « Dans ma détresse j'ai invoqué l'Éternel, et il m'a exaucé. Du sein du séjour des morts j'ai crié, et tu as entendu ma voix. Le salut vient de l'Éternel. »",
      ref: "Jonas 2",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Combien de temps Jonas reste-t-il dans le poisson ?", choix: ["Trois jours et trois nuits", "Un jour", "Sept jours", "Quarante jours"], bonne: 0 },
        { type: "verset", ref: "Jonas 2:9", texte: "Le salut vient de l'Éternel", niveau: "moyen" },
        { type: "vf", q: "Jésus reprend ce signe de Jonas pour parler de sa propre mort et résurrection.", vrai: true, ref: "Matthieu 12:40", niveau: "expert" },
      ],
    },
    {
      recit:
        "La parole de l'Éternel fut adressée à Jonas une seconde fois : « Lève-toi, va à Ninive et proclame ce que je te dirai. » Jonas se leva et alla à Ninive. Il commença par une journée de marche dans la ville et cria : « Encore quarante jours, et Ninive est détruite ! »",
      ref: "Jonas 3:1-4",
      exercices: [
        { type: "qcm", q: "Que crie Jonas dans Ninive ?", choix: ["« Encore quarante jours, et Ninive est détruite ! »", "« Repentez-vous et vivez ! »", "« L'Éternel est bon »", "« Fuyez la ville ! »"], bonne: 0 },
        { type: "vf", q: "Dieu adresse à Jonas un second appel après le poisson.", vrai: true, niveau: "moyen" },
        { type: "qcm", q: "Combien de jours de marche fallait-il pour traverser Ninive ?", choix: ["Trois jours", "Un jour", "Sept jours", "Une heure"], bonne: 0, ref: "Jonas 3:3", niveau: "expert" },
      ],
    },
    {
      recit:
        "Les gens de Ninive crurent à Dieu. Ils publièrent un jeûne et se couvrirent de sacs, depuis les plus grands jusqu'aux plus petits. La nouvelle parvint au roi : il se leva de son trône, ôta son manteau, se couvrit d'un sac et s'assit sur la cendre. « Qui sait si Dieu ne reviendra pas et ne se repentira pas ? »",
      ref: "Jonas 3:5-9",
      exercices: [
        { type: "qcm", q: "Comment Ninive réagit-elle au message ?", choix: ["Toute la ville jeûne et se repent, du roi au plus petit", "Elle chasse Jonas", "Elle se moque de lui", "Elle se fortifie pour la guerre"], bonne: 0 },
        { type: "qcm", q: "Que fait le roi de Ninive ?", choix: ["Il descend de son trône et s'assied sur la cendre", "Il fait tuer Jonas", "Il fuit la ville", "Il double les impôts"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Seuls les pauvres de la ville se repentent.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dieu vit qu'ils revenaient de leur mauvaise voie. Alors il se repentit du mal qu'il avait résolu de leur faire, et il ne le fit pas. Cela déplut fort à Jonas, et il fut irrité. Il pria : « N'est-ce pas ce que je disais quand j'étais encore dans mon pays ? Je savais que tu es un Dieu compatissant et miséricordieux, lent à la colère et riche en bonté. »",
      ref: "Jonas 4:1-3",
      exercices: [
        { type: "qcm", q: "Pourquoi Jonas est-il en colère ?", choix: ["Parce que Dieu a pardonné à Ninive", "Parce que la ville l'a chassé", "Parce qu'il a faim", "Parce que la tempête revient"], bonne: 0 },
        { type: "trou", texte: "« Tu es un Dieu compatissant et miséricordieux, lent à la ___ et riche en bonté. »", reponse: "colère", leurres: ["parole", "marche", "justice"], niveau: "moyen" },
        { type: "vf", q: "Jonas avait fui justement parce qu'il craignait que Dieu pardonne.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jonas s'assit à l'orient de la ville. Dieu fit croître un ricin qui l'abrita, et Jonas en eut une grande joie. Le lendemain, un ver piqua le ricin et il sécha. Jonas défaillit sous le soleil. Dieu lui dit : « Tu as pitié du ricin qui ne t'a coûté aucune peine — et moi je n'aurais pas pitié de Ninive, où il y a plus de cent vingt mille hommes qui ne savent pas distinguer leur droite de leur gauche ? »",
      ref: "Jonas 4:4-11",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets l'histoire de Jonas dans l'ordre :", items: ["La fuite vers Tarsis et la tempête", "Trois jours dans le ventre du poisson", "Ninive se repent tout entière", "La leçon du ricin séché"] },
        { type: "qcm", q: "Que veut montrer Dieu à Jonas par le ricin ?", choix: ["Que sa pitié pour la ville vaut plus que celle de Jonas pour une plante", "Qu'il faut planter des arbres", "Que le soleil est dangereux", "Que Jonas doit rentrer chez lui"], bonne: 0 },
        { type: "qcm", q: "Combien d'habitants Dieu nomme-t-il à Ninive ?", choix: ["Plus de cent vingt mille", "Dix mille", "Mille", "Sept cents"], bonne: 0, niveau: "expert" },
      ],
    },
  ],
};
