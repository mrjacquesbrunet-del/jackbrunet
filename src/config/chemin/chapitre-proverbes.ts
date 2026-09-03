import type { CheminChapitre } from "@/lib/chemin";

/** Les Proverbes. 8 étapes. Placé juste après Salomon, qui en est l'auteur. */
export const CHAPITRE_PROVERBES: CheminChapitre = {
  id: 57,
  nom: "Les Proverbes",
  livre: "Proverbes 1-31",
  accent: "#FDBA74",
  decor: "/img/chemin/decor-57.jpg",
  sentier: [{ x: 55.2, y: 94 }, { x: 47.8, y: 84.3 }, { x: 54.4, y: 74.6 }, { x: 62.4, y: 64.9 }, { x: 49.7, y: 55 }, { x: 44.8, y: 45.3 }, { x: 43.2, y: 35.6 }, { x: 37.4, y: 26 }],
  fallback: ["#4a3110", "#6b4718", "#221606"],
  carte: {
    id: "femme-vertueuse",
    nom: "La femme vertueuse",
    titre: "Son prix dépasse les perles",
    rarete: "epique",
    image: "/img/chemin/cartes/femme-vertueuse.jpg",
  },
  etapes: [
    {
      recit:
        "« Proverbes de Salomon, fils de David, roi d'Israël, pour connaître la sagesse et l'instruction, pour donner aux simples du discernement, au jeune homme de la connaissance et de la réflexion. La crainte de l'Éternel est le commencement de la science ; les insensés méprisent la sagesse et l'instruction. »",
      ref: "Proverbes 1:1-7",
      exercices: [
        { type: "verset", ref: "Proverbes 1:7", texte: "La crainte de l'Éternel est le commencement de la science" },
        { type: "qcm", q: "À qui le livre s'adresse-t-il en premier lieu ?", choix: ["Aux simples et aux jeunes gens, pour leur donner du discernement", "Aux rois seulement", "Aux prêtres", "Aux anciens du peuple"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Par quoi commence la sagesse ?", choix: ["La crainte de l'Éternel", "L'étude", "L'expérience", "La richesse"], bonne: 0 },
      ],
    },
    {
      recit:
        "« Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse ; reconnais-le dans toutes tes voies, et il aplanira tes sentiers. Ne sois point sage à tes propres yeux, crains l'Éternel et détourne-toi du mal. »",
      ref: "Proverbes 3:5-7",
      exercices: [
        { type: "verset", ref: "Proverbes 3:5", texte: "Confie-toi en l'Éternel de tout ton cœur" },
        { type: "trou", texte: "« Reconnais-le dans toutes tes voies, et il ___ tes sentiers. »", reponse: "aplanira", leurres: ["éclairera", "gardera", "bénira"], niveau: "moyen" },
        { type: "qcm", q: "Sur quoi ne faut-il pas s'appuyer ?", choix: ["Sur sa propre sagesse", "Sur les conseils des anciens", "Sur la loi", "Sur les prophètes"], bonne: 0 },
      ],
    },
    {
      recit:
        "« Garde ton cœur plus que toute autre chose, car de lui viennent les sources de la vie. Écarte de ta bouche la fausseté, éloigne de tes lèvres les détours. Que tes yeux regardent en face, et que tes paupières se dirigent devant toi. Ne te détourne ni à droite ni à gauche, et éloigne ton pied du mal. »",
      ref: "Proverbes 4:23-27",
      exercices: [
        { type: "verset", ref: "Proverbes 4:23", texte: "Garde ton cœur plus que toute autre chose car de lui viennent les sources de la vie" },
        { type: "qcm", q: "Pourquoi faut-il garder son cœur avant tout ?", choix: ["De lui viennent les sources de la vie", "Il est fragile", "Il est trompeur", "Il appartient à Dieu"], bonne: 0 },
        { type: "qcm", q: "Que dit ce passage du regard ?", choix: ["Que les yeux regardent en face, sans se détourner", "Qu'il faut baisser les yeux", "Qu'il faut regarder en arrière", "Rien du regard"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Va vers la fourmi, paresseux ; considère ses voies, et deviens sage. Elle n'a ni chef, ni inspecteur, ni maître ; elle prépare en été sa nourriture, elle amasse pendant la moisson de quoi manger. Paresseux, jusqu'à quand seras-tu couché ? Un peu de sommeil, un peu d'assoupissement, un peu croiser les mains pour dormir — et la pauvreté te surprendra comme un rôdeur. »",
      ref: "Proverbes 6:6-11",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel animal est donné en exemple au paresseux ?", choix: ["La fourmi", "L'abeille", "Le castor", "L'hirondelle"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce qui frappe chez elle ?", choix: ["Elle travaille sans chef ni maître", "Elle est très forte", "Elle vit longtemps", "Elle voyage loin"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« La pauvreté te surprendra comme un ___. »", reponse: "rôdeur", leurres: ["orage", "voleur de nuit", "ennemi"], niveau: "expert" },
      ],
    },
    {
      recit:
        "« Une réponse douce calme la fureur, mais une parole dure excite la colère. La langue des sages rend la science aimable. Un cœur joyeux est un bon remède, mais un esprit abattu dessèche les os. Le cœur de l'homme médite sa voie, mais c'est l'Éternel qui dirige ses pas. »",
      ref: "Proverbes 15:1 - 16:9",
      exercices: [
        { type: "verset", ref: "Proverbes 15:1", texte: "Une réponse douce calme la fureur" },
        { type: "qcm", q: "Que dit le proverbe des projets de l'homme ?", choix: ["Il médite sa voie, mais l'Éternel dirige ses pas", "Ils réussissent toujours", "Ils sont vains", "Ils déplaisent à Dieu"], bonne: 0 },
        { type: "qcm", q: "Quel effet a un esprit abattu ?", choix: ["Il dessèche les os", "Il ferme la bouche", "Il aiguise l'esprit", "Il éloigne les amis"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« L'ami aime en tout temps, et dans le malheur il se montre un frère. Comme le fer aiguise le fer, ainsi un homme aiguise un autre homme. Il y a tel ami plus attaché qu'un frère. Ne te vante pas du lendemain, car tu ne sais pas ce qu'un jour peut enfanter. Que ce soit un autre qui te loue, et non ta bouche. »",
      ref: "Proverbes 17:17 - 27:2",
      exercices: [
        { type: "verset", ref: "Proverbes 27:17", texte: "Comme le fer aiguise le fer ainsi un homme aiguise un autre homme" },
        { type: "qcm", q: "Quand l'ami se montre-t-il un frère ?", choix: ["Dans le malheur", "Dans la fête", "Quand on est riche", "Quand on le paie"], bonne: 0 },
        { type: "qcm", q: "Que dit le proverbe de la vantardise ?", choix: ["Que ce soit un autre qui te loue, non ta bouche", "Qu'il faut se taire toujours", "Qu'il faut raconter ses œuvres", "Qu'elle est sans importance"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Instruis l'enfant selon la voie qu'il doit suivre ; et quand il sera vieux, il ne s'en détournera pas. Une bonne réputation vaut mieux que de grandes richesses, et la faveur vaut mieux que l'argent et que l'or. Ne te tourmente pas pour t'enrichir : veux-tu poursuivre du regard ce qui va disparaître ? Car la richesse se fait des ailes, et comme l'aigle, elle prend son vol vers les cieux. »",
      ref: "Proverbes 22:1-6",
      exercices: [
        { type: "verset", ref: "Proverbes 22:6", texte: "Instruis l'enfant selon la voie qu'il doit suivre", niveau: "moyen" },
        { type: "qcm", q: "Qu'est-ce qui vaut mieux que de grandes richesses ?", choix: ["Une bonne réputation", "Une longue vie", "Un grand troupeau", "Une maison"], bonne: 0 },
        { type: "qcm", q: "À quoi la richesse est-elle comparée ?", choix: ["À un aigle qui s'envole", "À de l'eau qui coule", "À de la fumée", "À une ombre"], bonne: 0, ref: "Proverbes 23:5", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le livre se referme sur un portrait. « Qui peut trouver une femme vertueuse ? Elle a bien plus de valeur que les perles. Elle se lève lorsqu'il est encore nuit et elle donne la nourriture à sa maison. Elle tend la main au malheureux. Elle ouvre la bouche avec sagesse, et des instructions aimables sont sur sa langue. La grâce est trompeuse et la beauté est vaine ; la femme qui craint l'Éternel est celle qui sera louée. »",
      ref: "Proverbes 31:10-31",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Je me lève quand il fait encore nuit.", "Mes mains travaillent la laine et le lin.", "Je tends la main au malheureux.", "On dit de moi que mon prix dépasse celui des perles."], reponse: "La femme vertueuse", leurres: ["Ruth", "Esther", "Débora"] },
        { type: "verset", ref: "Proverbes 31:30", texte: "La femme qui craint l'Éternel est celle qui sera louée" },
        { type: "ordre", consigne: "Remets ces proverbes dans l'ordre du livre :", items: ["« La crainte de l'Éternel est le commencement »", "« Confie-toi en l'Éternel de tout ton cœur »", "« Va vers la fourmi, paresseux »", "« Qui peut trouver une femme vertueuse ? »"] },
      ],
    },
  ],
};
