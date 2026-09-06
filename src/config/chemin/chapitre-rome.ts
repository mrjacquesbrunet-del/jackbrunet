import type { CheminChapitre } from "@/lib/chemin";

/**
 * Chapitre 50 — Paul prisonnier, de Jérusalem jusqu'à Rome (Actes 21-28),
 * et son dernier mot à Timothée. Ses lettres ont leurs propres chapitres.
 * 8 étapes.
 */
export const CHAPITRE_ROME: CheminChapitre = {
  id: 50,
  nom: "Jusqu'à Rome",
  livre: "Actes 21-28",
  accent: "#D8B4FE",
  decor: "/img/chemin/decor-50.jpg",
  sentier: [{ x: 64.2, y: 94 }, { x: 60.5, y: 84.3 }, { x: 67.2, y: 74.6 }, { x: 46.5, y: 64.9 }, { x: 65, y: 55 }, { x: 46.9, y: 45.3 }, { x: 50.8, y: 35.6 }, { x: 50.5, y: 26 }],
  fallback: ["#33204a", "#4b306b", "#150d22"],
  carte: {
    id: "timothee",
    nom: "Timothée",
    titre: "Le fils dans la foi",
    rarete: "epique",
    image: "/img/chemin/cartes/timothee.jpg",
  },
  etapes: [
    {
      recit:
        "À Jérusalem, la foule s'ameuta contre Paul dans le temple. Le tribun le fit arrêter et lier de deux chaînes. Paul demanda la permission de parler au peuple et raconta sa conversion sur le chemin de Damas. Apprenant qu'il était citoyen romain, le tribun eut peur de l'avoir fait lier.",
      ref: "Actes 21:27 - 22:29",
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui protège Paul de la flagellation ?", choix: ["Sa citoyenneté romaine", "Sa richesse", "L'intervention du sanhédrin", "Un ami au palais"], bonne: 0 },
        { type: "qcm", q: "Que raconte Paul à la foule ?", choix: ["Sa conversion sur le chemin de Damas", "L'histoire d'Israël", "Ses voyages", "Rien"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Paul a été arrêté dans le temple de Jérusalem.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comparaissant devant le gouverneur Félix, puis devant Festus, Paul se défendit. Festus proposa de le juger à Jérusalem. Paul répondit : « Je suis devant le tribunal de César, c'est là que je dois être jugé. J'en appelle à César. » Festus déclara : « Tu en as appelé à César ; tu iras devant César. »",
      ref: "Actes 25:8-12",
      exercices: [
        { type: "qcm", q: "Quel droit Paul utilise-t-il ?", choix: ["Le droit d'en appeler à César", "Le droit d'asile", "Le droit de fuite", "Le droit de silence"], bonne: 0 },
        { type: "qcm", q: "Devant quels gouverneurs comparaît-il ?", choix: ["Félix puis Festus", "Pilate puis Hérode", "Gallion seul", "Le tribun seul"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "C'est cet appel qui l'emmènera jusqu'à Rome.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le voyage par mer fut périlleux. Un vent d'ouragan, l'Euraquilon, emporta le navire. Pendant plusieurs jours on ne vit ni soleil ni étoiles ; toute espérance de se sauver était perdue. Paul se leva : « Je vous exhorte à prendre courage ; car aucun de vous ne périra. Cette nuit, un ange du Dieu à qui j'appartiens et que je sers m'est apparu : Ne crains point, Paul ; il faut que tu comparaisses devant César. »",
      ref: "Actes 27:14-24",
      exercices: [
        { type: "qcm", q: "Que promet Paul aux passagers en pleine tempête ?", choix: ["Qu'aucun d'eux ne périra", "Que le navire arrivera intact", "Qu'ils rentreront chez eux", "Rien"], bonne: 0 },
        { type: "qcm", q: "Comment s'appelle le vent qui emporte le navire ?", choix: ["L'Euraquilon", "Le sirocco", "Le Zéphyr", "Le khamsin"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Comment Paul se décrit-il devant l'équipage ?", choix: ["Appartenant à Dieu et le servant", "Comme un prisonnier romain", "Comme un marin", "Comme un juge"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le navire se brisa sur l'île de Malte, mais tous parvinrent à terre sains et saufs. Les habitants allumèrent un grand feu. Paul ayant ramassé un tas de broussailles, une vipère en sortit par l'effet de la chaleur et s'attacha à sa main. Il la secoua dans le feu et n'éprouva aucun mal. Il guérit ensuite le père du principal de l'île, et beaucoup de malades.",
      ref: "Actes 28:1-9",
      exercices: [
        { type: "qcm", q: "Sur quelle île le navire fait-il naufrage ?", choix: ["Malte", "Chypre", "Crète", "Rhodes"], bonne: 0 },
        { type: "qcm", q: "Combien de passagers survivent ?", choix: ["Tous", "La moitié", "Paul seul", "Le texte ne le dit pas"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La morsure de la vipère n'a eu aucun effet sur Paul.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Arrivé à Rome, Paul obtint la permission de demeurer à part, avec un soldat qui le gardait. Il resta deux ans entiers dans une maison qu'il avait louée, recevant tous ceux qui venaient le voir, prêchant le royaume de Dieu et enseignant ce qui concerne le Seigneur Jésus-Christ, avec toute liberté et sans obstacle.",
      ref: "Actes 28:16-31",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Comment le livre des Actes se termine-t-il ?", choix: ["Paul prêche à Rome deux ans, sans obstacle", "Paul est libéré", "Paul meurt", "Paul retourne à Jérusalem"], bonne: 0 },
        { type: "qcm", q: "Dans quelles conditions vit-il à Rome ?", choix: ["Dans une maison louée, gardé par un soldat", "Dans un cachot", "Libre de circuler", "Chez un ami"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le livre des Actes s'achève sans dire ce qu'il advint de Paul.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Plus de quarante hommes firent le serment de ne rien manger avant d'avoir tué Paul. Le fils de la sœur de Paul, ayant eu connaissance du guet-apens, alla dans la forteresse en informer le tribun. Celui-ci fit partir Paul de nuit pour Césarée, escorté de deux cents soldats.",
      ref: "Actes 23:12-24",
      exercices: [
        { type: "qcm", q: "Qui déjoue le complot contre Paul ?", choix: ["Son neveu, le fils de sa sœur", "Un centenier", "Un ange", "Le grand prêtre"], bonne: 0 },
        { type: "qcm", q: "Qu'avaient juré les conjurés ?", choix: ["De ne rien manger avant de l'avoir tué", "De le livrer à Rome", "De brûler la forteresse", "De payer une rançon"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Paul avait de la famille à Jérusalem.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Devant le roi Agrippa, Paul raconta encore une fois sa conversion et conclut : « Je n'ai pas été rebelle à la vision céleste. » Festus s'écria : « Tu es fou, Paul ! Ton grand savoir te fait déraisonner. » — « Je ne suis point fou, très excellent Festus ; je parle le langage de la vérité et du bon sens. » Agrippa dit : « Tu vas bientôt me persuader de devenir chrétien ! » — « Que ce soit bientôt ou que ce soit tard, plût à Dieu que tous ceux qui m'écoutent deviennent tels que je suis, à l'exception de ces liens ! »",
      ref: "Actes 26:19-29",
      exercices: [
        { type: "qcm", q: "Que reproche Festus à Paul ?", choix: ["D'être fou à force de savoir", "De mentir", "De fuir", "De comploter"], bonne: 0 },
        { type: "trou", texte: "« Je n'ai pas été rebelle à la ___ céleste. »", reponse: "vision", leurres: ["voix", "loi", "gloire"], niveau: "moyen" },
        { type: "qcm", q: "Que souhaite Paul à ceux qui l'écoutent ?", choix: ["Qu'ils deviennent tels que lui — moins les chaînes", "Qu'ils le libèrent", "Qu'ils se taisent", "Qu'ils le suivent à Rome"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Vers la fin de sa vie, Paul écrivit à Timothée : « Car pour moi, je sers déjà de libation, et le moment de mon départ approche. J'ai combattu le bon combat, j'ai achevé la course, j'ai gardé la foi. Désormais la couronne de justice m'est réservée. » Il ajouta : « Dans ma première défense, personne ne m'a assisté ; tous m'ont abandonné. Mais le Seigneur m'a assisté et m'a fortifié. »",
      ref: "2 Timothée 4:6-17",
      coffre: true,
      exercices: [
        { type: "verset", ref: "2 Timothée 4:7", texte: "J'ai combattu le bon combat j'ai achevé la course j'ai gardé la foi" },
        { type: "qui", indices: ["Ma mère et ma grand-mère m'ont transmis la foi.", "Paul m'appelle son enfant bien-aimé.", "Il me dit de ne laisser personne mépriser ma jeunesse.", "Il m'écrit sa toute dernière lettre."], reponse: "Timothée", leurres: ["Tite", "Silas", "Onésime"] },
        { type: "ordre", consigne: "Remets la fin des Actes dans l'ordre :", items: ["L'arrestation dans le temple", "L'appel à César devant Festus", "Le naufrage et Malte", "Deux ans à Rome, sans obstacle"] },
      ],
    },
  ],
};
