import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 39 — La confession de Pierre et la transfiguration (Matthieu 16-18). 8 étapes. */
export const CHAPITRE_TRANSFIGURATION: CheminChapitre = {
  id: 39,
  nom: "La transfiguration",
  livre: "Matthieu 16-18",
  accent: "#E0E7FF",
  decor: "/img/chemin/decor-39.jpg",
  sentier: [{ x: 45.2, y: 94 }, { x: 53.7, y: 84.3 }, { x: 67.1, y: 74.6 }, { x: 58.2, y: 64.9 }, { x: 54.9, y: 55 }, { x: 45, y: 45.3 }, { x: 43.7, y: 35.6 }, { x: 48.3, y: 26 }],
  fallback: ["#2b3050", "#3f4670", "#12142a"],
  carte: {
    id: "jacques",
    nom: "Jacques",
    titre: "Le témoin de la montagne",
    rarete: "epique",
    image: "/img/chemin/cartes/jacques.jpg",
  },
  etapes: [
    {
      recit:
        "Jésus, étant arrivé dans le territoire de Césarée de Philippe, demanda à ses disciples : « Qui dit-on que je suis, moi, le Fils de l'homme ? » Ils répondirent : « Les uns disent que tu es Jean-Baptiste ; les autres, Élie ; les autres, Jérémie ou l'un des prophètes. »",
      ref: "Matthieu 16:13-14",
      exercices: [
        { type: "qcm", q: "Où Jésus pose-t-il cette question ?", choix: ["À Césarée de Philippe", "À Jérusalem", "À Capernaüm", "À Nazareth"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Pour qui les gens le prennent-ils ?", choix: ["Jean-Baptiste, Élie, Jérémie ou un prophète", "Un scribe", "Un roi", "Un ange"], bonne: 0 },
        { type: "vf", q: "Jésus commence par demander ce que les autres disent de lui.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Et vous, leur dit-il, qui dites-vous que je suis ? » Simon Pierre répondit : « Tu es le Christ, le Fils du Dieu vivant. » Jésus lui dit : « Tu es heureux, Simon, fils de Jonas ; car ce ne sont pas la chair et le sang qui t'ont révélé cela, mais mon Père qui est dans les cieux. »",
      ref: "Matthieu 16:15-17",
      exercices: [
        { type: "verset", ref: "Matthieu 16:16", texte: "Tu es le Christ le Fils du Dieu vivant" },
        { type: "qcm", q: "Qui répond à la question de Jésus ?", choix: ["Simon Pierre", "Jean", "André", "Thomas"], bonne: 0 },
        { type: "qcm", q: "Qui a révélé cela à Pierre, selon Jésus ?", choix: ["Le Père qui est dans les cieux", "Jean-Baptiste", "Les Écritures seules", "Sa propre intelligence"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dès lors Jésus commença à faire connaître à ses disciples qu'il fallait qu'il allât à Jérusalem, qu'il souffrît beaucoup, qu'il fût mis à mort et qu'il ressuscitât le troisième jour. Pierre le prit à part et se mit à le reprendre : « À Dieu ne plaise, Seigneur ! Cela ne t'arrivera pas. » Jésus se retourna : « Arrière de moi, Satan ! tu ne penses pas les choses de Dieu, mais celles des hommes. »",
      ref: "Matthieu 16:21-23",
      exercices: [
        { type: "qcm", q: "Qu'annonce Jésus pour la première fois ?", choix: ["Sa souffrance, sa mort et sa résurrection le troisième jour", "La fin du temple", "Le retour d'Élie", "Un règne immédiat"], bonne: 0 },
        { type: "qcm", q: "Que fait Pierre juste après sa belle confession ?", choix: ["Il reprend Jésus et refuse la croix", "Il se tait", "Il prie", "Il part"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le même Pierre est loué puis sévèrement repris à quelques versets d'intervalle.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Alors Jésus dit à ses disciples : « Si quelqu'un veut venir après moi, qu'il renonce à lui-même, qu'il se charge de sa croix et qu'il me suive. Car celui qui voudra sauver sa vie la perdra, mais celui qui la perdra à cause de moi la trouvera. Et que servirait-il à un homme de gagner tout le monde, s'il perdait son âme ? »",
      ref: "Matthieu 16:24-26",
      exercices: [
        { type: "verset", ref: "Matthieu 16:24", texte: "Qu'il renonce à lui-même qu'il se charge de sa croix et qu'il me suive" },
        { type: "qcm", q: "Que dit Jésus de celui qui veut sauver sa vie ?", choix: ["Il la perdra", "Il la gardera", "Il sera récompensé", "Il sera oublié"], bonne: 0 },
        { type: "qcm", q: "Quelle question termine ce passage ?", choix: ["Que sert de gagner le monde et de perdre son âme ?", "Qui est le plus grand ?", "Quand viendra le royaume ?", "Faut-il jeûner ?"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Six jours après, Jésus prit avec lui Pierre, Jacques et Jean son frère, et les conduisit à l'écart sur une haute montagne. Il fut transfiguré devant eux : son visage resplendit comme le soleil, et ses vêtements devinrent blancs comme la lumière. Et voici, Moïse et Élie leur apparurent, s'entretenant avec lui.",
      ref: "Matthieu 17:1-3",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quels trois disciples montent sur la montagne ?", choix: ["Pierre, Jacques et Jean", "Pierre, André et Jean", "Jacques, Jean et Philippe", "Les douze"], bonne: 0 },
        { type: "qcm", q: "Qui apparaît en s'entretenant avec Jésus ?", choix: ["Moïse et Élie", "Abraham et David", "Ésaïe et Jérémie", "Jean-Baptiste et Samuel"], bonne: 0 },
        { type: "qui", indices: ["Je suis pêcheur, fils de Zébédée.", "Mon frère est Jean.", "Je monte avec Pierre sur la haute montagne.", "Je vois Moïse et Élie parler avec mon Maître."], reponse: "Jacques", leurres: ["André", "Philippe", "Thomas"] },
      ],
    },
    {
      recit:
        "Pierre dit : « Seigneur, il est bon que nous soyons ici ; si tu le veux, je dresserai ici trois tentes. » Comme il parlait encore, une nuée lumineuse les couvrit. Et voici, une voix fit entendre de la nuée ces paroles : « Celui-ci est mon Fils bien-aimé, en qui j'ai mis toute mon affection : écoutez-le ! » Les disciples tombèrent sur leur face, saisis d'une grande frayeur.",
      ref: "Matthieu 17:4-8",
      exercices: [
        { type: "verset", ref: "Matthieu 17:5", texte: "Celui-ci est mon Fils bien-aimé écoutez-le" },
        { type: "qcm", q: "Que propose Pierre ?", choix: ["Dresser trois tentes", "Redescendre aussitôt", "Appeler les autres disciples", "Bâtir un autel"], bonne: 0 },
        { type: "qcm", q: "Quel mot la voix ajoute-t-elle par rapport au baptême ?", choix: ["« Écoutez-le »", "« Suivez-le »", "« Craignez-le »", "« Servez-le »"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À ce moment, les disciples s'approchèrent : « Qui donc est le plus grand dans le royaume des cieux ? » Jésus appela un petit enfant, le plaça au milieu d'eux et dit : « Si vous ne vous convertissez et si vous ne devenez comme les petits enfants, vous n'entrerez pas dans le royaume des cieux. Quiconque se rendra humble comme ce petit enfant sera le plus grand. »",
      ref: "Matthieu 18:1-5",
      exercices: [
        { type: "qcm", q: "Que fait Jésus quand on lui demande qui est le plus grand ?", choix: ["Il place un petit enfant au milieu d'eux", "Il désigne Pierre", "Il refuse de répondre", "Il cite la loi"], bonne: 0 },
        { type: "qcm", q: "Que faut-il devenir pour entrer dans le royaume ?", choix: ["Comme les petits enfants", "Comme les docteurs de la loi", "Comme les rois", "Comme les prophètes"], bonne: 0 },
        { type: "vf", q: "Le plus grand est celui qui se rend humble.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Pierre demanda : « Combien de fois pardonnerai-je à mon frère ? Jusqu'à sept fois ? » Jésus répondit : « Je ne te dis pas jusqu'à sept fois, mais jusqu'à septante fois sept fois. » Puis il raconta le serviteur à qui l'on remit une dette immense et qui refusa d'en remettre une petite à son compagnon.",
      ref: "Matthieu 18:21-35",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Combien de fois faut-il pardonner, selon Jésus ?", choix: ["Jusqu'à septante fois sept fois", "Sept fois", "Trois fois", "Une seule fois"], bonne: 0 },
        { type: "qcm", q: "Que reproche-t-on au serviteur de la parabole ?", choix: ["Il refuse une petite dette après avoir été remis d'une immense", "Il a volé son maître", "Il a fui", "Il n'a pas travaillé"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets ce chapitre dans l'ordre :", items: ["« Tu es le Christ, le Fils du Dieu vivant »", "« Qu'il se charge de sa croix »", "La transfiguration et la voix de la nuée", "« Septante fois sept fois »"] },
      ],
    },
  ],
};
