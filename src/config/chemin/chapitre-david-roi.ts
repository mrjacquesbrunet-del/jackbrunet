import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 17 — David roi (1 Samuel 18 - 2 Samuel 12, Psaume 51). 8 étapes. */
export const CHAPITRE_DAVID_ROI: CheminChapitre = {
  id: 17,
  nom: "David roi",
  livre: "1 Samuel 18 - 2 Samuel 12",
  accent: "#8B5CF6",
  decor: "/img/chemin/decor-17.jpg",
  sentier: [{ x: 48.1, y: 94 }, { x: 49, y: 84.3 }, { x: 63.5, y: 74.6 }, { x: 69.2, y: 64.9 }, { x: 50, y: 55 }, { x: 35.9, y: 45.3 }, { x: 47, y: 35.6 }, { x: 47.6, y: 26 }],
  fallback: ["#2e1a52", "#432a70", "#150a26"],
  carte: {
    id: "davidroi",
    nom: "David",
    titre: "Le roi selon le cœur de Dieu",
    rarete: "legendaire",
    image: "/img/chemin/cartes/davidroi.jpg",
  },
  etapes: [
    {
      recit:
        "L'âme de Jonathan s'attacha à l'âme de David, et Jonathan l'aima comme son âme. Il fit alliance avec lui et se dépouilla de son manteau pour le lui donner, avec sa tunique, son épée, son arc et sa ceinture. David réussissait partout où Saül l'envoyait, et il était considéré de tout le peuple.",
      ref: "1 Samuel 18:1-5",
      exercices: [
        { type: "qcm", q: "Qui devient l'ami fidèle de David ?", choix: ["Jonathan, le fils de Saül", "Abner", "Joab", "Nathan"], bonne: 0 },
        { type: "qcm", q: "Que donne Jonathan à David en signe d'alliance ?", choix: ["Son manteau, sa tunique, son épée, son arc et sa ceinture", "Une part du royaume", "Un troupeau", "Sa maison"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jonathan était le fils du roi et donc l'héritier du trône.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les femmes chantaient en dansant : « Saül a frappé ses mille, et David ses dix mille. » Saül fut très irrité : « On en donne dix mille à David, et à moi les mille ! Il ne lui manque plus que la royauté. » À partir de ce jour, Saül regarda David d'un mauvais œil, et deux fois il lança sa lance contre lui.",
      ref: "1 Samuel 18:6-11",
      exercices: [
        { type: "trou", texte: "« Saül a frappé ses mille, et David ses ___. »", reponse: "dix mille", leurres: ["cent", "sept mille", "milliers"], niveau: "moyen" },
        { type: "qcm", q: "Pourquoi Saül se met-il à haïr David ?", choix: ["Par jalousie du chant des femmes", "Parce que David a fui", "Parce que David a volé", "Parce que Samuel l'a demandé"], bonne: 0 },
        { type: "qcm", q: "Que fait Saül contre David dans sa maison ?", choix: ["Il lui lance sa lance", "Il le fait emprisonner", "Il le bannit aussitôt", "Il le désarme"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "David s'enfuit et se réfugia dans la caverne d'Adullam. Tous ceux qui étaient dans la détresse, endettés ou mécontents, se rassemblèrent auprès de lui : il devint leur chef, environ quatre cents hommes. Il erra d'un désert à l'autre, poursuivi par Saül.",
      ref: "1 Samuel 22:1-2",
      exercices: [
        { type: "qcm", q: "Qui rejoint David dans la caverne d'Adullam ?", choix: ["Ceux qui étaient dans la détresse, endettés ou mécontents", "Les princes d'Israël", "Les sacrificateurs de Silo", "Des mercenaires philistins"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien d'hommes se rassemblent autour de lui ?", choix: ["Environ quatre cents", "Trois cents", "Mille", "Douze"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "David était alors roi et vivait au palais.", vrai: false },
      ],
    },
    {
      recit:
        "Dans la caverne d'En-Guédi, Saül entra sans savoir que David s'y cachait. Les hommes de David voulaient le tuer ; David se leva et coupa seulement le pan de son manteau — et son cœur le lui reprocha. Il cria ensuite : « Mon père, vois le pan de ton manteau dans ma main ! Je ne porterai pas la main sur l'oint de l'Éternel. »",
      ref: "1 Samuel 24",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que fait David quand Saül est à sa merci ?", choix: ["Il coupe seulement le pan de son manteau", "Il le tue", "Il le fait prisonnier", "Il s'enfuit sans rien dire"], bonne: 0 },
        { type: "qcm", q: "Pourquoi refuse-t-il de tuer Saül ?", choix: ["Saül est l'oint de l'Éternel", "Il a peur de l'armée", "Il a juré à Jonathan", "Il attend un signe"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Dans quel désert se passe cette scène ?", choix: ["En-Guédi", "Maon", "Paran", "Tsin"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Saül et Jonathan moururent sur le mont Guilboa. David composa cette complainte : « Ta gloire, ô Israël, a péri sur tes collines ! Comment des héros sont-ils tombés ? Saül et Jonathan, aimables et chéris pendant leur vie, n'ont point été séparés dans leur mort. »",
      ref: "2 Samuel 1:17-27",
      exercices: [
        { type: "qcm", q: "Comment David réagit-il à la mort de Saül ?", choix: ["Il compose une complainte et le pleure", "Il se réjouit", "Il monte aussitôt sur le trône", "Il quitte le pays"], bonne: 0 },
        { type: "trou", texte: "« Comment des ___ sont-ils tombés ? »", reponse: "héros", leurres: ["rois", "frères", "justes"], niveau: "moyen" },
        { type: "qcm", q: "Sur quelle montagne Saül et Jonathan meurent-ils ?", choix: ["Le mont Guilboa", "Le mont Carmel", "Le mont Thabor", "Le mont Hermon"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Toutes les tribus vinrent à Hébron : « Nous sommes tes os et ta chair. » David fit alliance avec elles et fut oint roi sur tout Israël. Il avait trente ans, et il régna quarante ans. Il prit la forteresse de Sion et s'y établit : c'est la cité de David. Il y fit monter l'arche de l'Éternel, dansant de toute sa force devant elle.",
      ref: "2 Samuel 5-6",
      exercices: [
        { type: "qcm", q: "Quelle ville David prend-il pour capitale ?", choix: ["Jérusalem, la forteresse de Sion", "Hébron", "Silo", "Bethléem"], bonne: 0 },
        { type: "qcm", q: "Combien d'années David règne-t-il ?", choix: ["Quarante", "Vingt", "Sept", "Soixante"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que fait David quand l'arche monte à Jérusalem ?", choix: ["Il danse de toute sa force devant elle", "Il jeûne trois jours", "Il reste dans son palais", "Il offre l'arche aux Philistins"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Un soir, David vit du toit une femme qui se baignait : c'était Bath-Schéba, femme d'Urie le Héthien. Il l'envoya chercher. Puis, pour couvrir sa faute, il fit placer Urie au plus fort du combat et l'abandonna : Urie mourut. Ce que David avait fait déplut à l'Éternel.",
      ref: "2 Samuel 11",
      exercices: [
        { type: "qcm", q: "Quelle double faute David commet-il ?", choix: ["L'adultère, puis la mort d'Urie", "Le vol et le mensonge", "L'idolâtrie", "La désertion"], bonne: 0 },
        { type: "qcm", q: "Comment s'appelle le mari de Bath-Schéba ?", choix: ["Urie le Héthien", "Joab", "Nathan", "Abner"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La Bible passe la faute de David sous silence.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Nathan raconta au roi l'histoire du riche qui prit la brebis unique du pauvre. David s'enflamma : « Cet homme mérite la mort ! » Nathan lui dit : « Tu es cet homme ! » David répondit : « J'ai péché contre l'Éternel. » Et il écrivit : « Ô Dieu, crée en moi un cœur pur, renouvelle en moi un esprit bien disposé. »",
      ref: "2 Samuel 12:1-13",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Psaumes 51:10", texte: "Ô Dieu crée en moi un cœur pur", niveau: "moyen" },
        { type: "qcm", q: "Comment Nathan confond-il David ?", choix: ["Par la parabole de la brebis du pauvre", "En le dénonçant à l'armée", "Par un songe", "En citant la loi"], bonne: 0 },
        { type: "ordre", consigne: "Remets la vie de David roi dans l'ordre :", items: ["L'amitié de Jonathan", "La fuite et la caverne d'En-Guédi", "L'arche monte à Jérusalem", "Nathan : « Tu es cet homme ! »"] },
      ],
    },
  ],
};
