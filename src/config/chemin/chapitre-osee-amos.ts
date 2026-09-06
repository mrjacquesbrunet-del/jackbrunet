import type { CheminChapitre } from "@/lib/chemin";

/**
 * Chapitre 27 — Osée, Amos, Michée et Habacuc. 8 étapes.
 * Les « petits prophètes » : quatre voix courtes mais décisives, réunies en
 * un chapitre pour qu'aucune ne manque au panorama.
 */
export const CHAPITRE_OSEE_AMOS: CheminChapitre = {
  id: 27,
  nom: "Les petits prophètes",
  livre: "Osée, Amos, Michée, Habacuc",
  accent: "#84CC16",
  decor: "/img/chemin/decor-27.jpg",
  sentier: [{ x: 39.2, y: 94 }, { x: 46.8, y: 84.3 }, { x: 57.4, y: 74.6 }, { x: 41, y: 64.9 }, { x: 49.9, y: 55 }, { x: 41.4, y: 45.3 }, { x: 39.7, y: 35.6 }, { x: 51.3, y: 26 }],
  fallback: ["#2c3d08", "#41590e", "#141c03"],
  carte: {
    id: "amos",
    nom: "Amos",
    titre: "Le berger devenu prophète",
    rarete: "epique",
    image: "/img/chemin/cartes/amos.jpg",
  },
  etapes: [
    {
      recit:
        "L'Éternel dit à Osée : « Va, prends une femme prostituée et des enfants de prostitution ; car le pays se prostitue en abandonnant l'Éternel. » Osée épousa Gomer. Sa vie de mari trahi devint le message même : Israël avait quitté son Dieu comme une épouse infidèle.",
      ref: "Osée 1:1-3",
      exercices: [
        { type: "qcm", q: "Comment la vie d'Osée devient-elle son message ?", choix: ["Son mariage avec une femme infidèle image l'infidélité d'Israël", "Il jeûne quarante jours", "Il bâtit un autel", "Il quitte le pays"], bonne: 0 },
        { type: "qcm", q: "Comment s'appelle sa femme ?", choix: ["Gomer", "Anne", "Sara", "Judith"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Osée annonce que Dieu a définitivement rejeté son peuple.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel dit encore : « Va, aime une femme aimée d'un amant et adultère ; aime-la comme l'Éternel aime les enfants d'Israël, qui se tournent vers d'autres dieux. » Osée la racheta pour quinze sicles d'argent et une mesure et demie d'orge : il la reprit chez lui.",
      ref: "Osée 3:1-3",
      exercices: [
        { type: "qcm", q: "Que fait Osée pour reprendre sa femme ?", choix: ["Il la rachète à prix d'argent et d'orge", "Il l'oublie", "Il la fait juger", "Il attend qu'elle revienne seule"], bonne: 0 },
        { type: "qcm", q: "Que cette image annonce-t-elle de Dieu ?", choix: ["Qu'il aime et rachète un peuple qui l'a quitté", "Qu'il punit sans pitié", "Qu'il change d'alliance", "Qu'il se tait pour toujours"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« Je veux la miséricorde et non les ___. »", reponse: "sacrifices", leurres: ["prières", "offrandes", "jeûnes"], ref: "Osée 6:6", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Amos n'était ni prophète ni fils de prophète : il était berger et cultivait des sycomores. L'Éternel le prit derrière le troupeau et lui dit : « Va, prophétise à mon peuple d'Israël. » Il monta du sud, de Tekoa, jusqu'aux sanctuaires du nord pour y parler sans ménagement.",
      ref: "Amos 7:14-15",
      exercices: [
        { type: "qui", indices: ["Je ne suis ni prophète ni fils de prophète.", "Je garde les troupeaux et je cultive des sycomores.", "Dieu me prend derrière le bétail.", "Je réclame que le droit coule comme de l'eau."], reponse: "Amos", leurres: ["Osée", "Michée", "Habacuc"] },
        { type: "qcm", q: "Quel était le métier d'Amos ?", choix: ["Berger et cultivateur de sycomores", "Sacrificateur", "Scribe du roi", "Charpentier"], bonne: 0 },
        { type: "qcm", q: "De quelle ville vient-il ?", choix: ["Tekoa", "Samarie", "Béthel", "Guilgal"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "« Je hais, je méprise vos fêtes, dit l'Éternel, et je ne puis sentir vos assemblées. Éloignez de moi le bruit de vos cantiques : je n'écoute pas le son de vos luths. Mais que le droit coule comme de l'eau, et la justice comme un torrent qui jamais ne tarit ! »",
      ref: "Amos 5:21-24",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Amos 5:24", texte: "Que le droit coule comme de l'eau et la justice comme un torrent" },
        { type: "qcm", q: "Que Dieu reproche-t-il à son peuple par Amos ?", choix: ["Des fêtes et des cantiques sans justice envers les pauvres", "De ne plus offrir de sacrifices", "De trop travailler", "De ne pas bâtir de temple"], bonne: 0 },
        { type: "vf", q: "Amos dit que Dieu se réjouit de leurs assemblées.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Michée annonça : « Et toi, Bethléhem Éphrata, petite entre les milliers de Juda, de toi sortira pour moi celui qui dominera sur Israël, et dont l'origine remonte aux temps anciens, aux jours de l'éternité. »",
      ref: "Michée 5:2",
      exercices: [
        { type: "qcm", q: "Quelle ville Michée nomme-t-il ?", choix: ["Bethléhem Éphrata", "Jérusalem", "Nazareth", "Samarie"], bonne: 0 },
        { type: "vf", q: "Les sages interrogeront ce texte pour savoir où naîtrait le Messie.", vrai: true, ref: "Matthieu 2:5-6", niveau: "moyen" },
        { type: "trou", texte: "« Et toi, Bethléhem Éphrata, ___ entre les milliers de Juda… »", reponse: "petite", leurres: ["grande", "première", "sainte"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Michée résuma tout : « On t'a fait connaître, ô homme, ce qui est bien ; et ce que l'Éternel demande de toi, c'est que tu pratiques la justice, que tu aimes la miséricorde, et que tu marches humblement avec ton Dieu. »",
      ref: "Michée 6:8",
      exercices: [
        { type: "verset", ref: "Michée 6:8", texte: "Pratiquer la justice aimer la miséricorde et marcher humblement avec ton Dieu" },
        { type: "qcm", q: "Combien de choses l'Éternel demande-t-il selon ce verset ?", choix: ["Trois", "Dix", "Une seule", "Sept"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment faut-il marcher avec son Dieu ?", choix: ["Humblement", "Fièrement", "En silence", "Seul"], bonne: 0 },
      ],
    },
    {
      recit:
        "Habacuc osa se plaindre : « Jusqu'à quand, ô Éternel ? J'ai crié, et tu n'écoutes pas ! Pourquoi me fais-tu voir l'iniquité ? » Dieu lui répondit : « Écris la prophétie, grave-la sur des tables, afin qu'on la lise couramment. Car c'est une prophétie dont le temps est fixé ; si elle tarde, attends-la. »",
      ref: "Habacuc 1:2 - 2:3",
      exercices: [
        { type: "qcm", q: "Que fait Habacuc au début de son livre ?", choix: ["Il se plaint à Dieu de son silence", "Il annonce la victoire", "Il chante un cantique", "Il bâtit un autel"], bonne: 0 },
        { type: "qcm", q: "Que Dieu lui demande-t-il de faire de la prophétie ?", choix: ["De l'écrire et la graver pour qu'on la lise couramment", "De la garder secrète", "De l'oublier", "De la chanter"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La Bible permet de poser à Dieu des questions difficiles.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Habacuc finit par ce chant : « Car le figuier ne fleurira pas, la vigne ne produira rien, le travail de l'olivier manquera, les champs ne donneront pas de nourriture ; les brebis disparaîtront du pâturage, et il n'y aura plus de bœufs dans les étables. Toutefois, je veux me réjouir en l'Éternel, je veux me réjouir dans le Dieu de mon salut. »",
      ref: "Habacuc 3:17-19",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Habacuc 3:18", texte: "Toutefois je veux me réjouir en l'Éternel" },
        { type: "qcm", q: "Dans quelle situation Habacuc dit-il vouloir se réjouir ?", choix: ["Alors que tout manque : figuier, vigne, troupeaux", "Après une grande récolte", "Le jour de sa victoire", "Au retour d'exil"], bonne: 0 },
        { type: "ordre", consigne: "Remets les quatre prophètes de ce chapitre dans l'ordre où tu les as rencontrés :", items: ["Osée et l'épouse rachetée", "Amos et le droit comme un torrent", "Michée et Bethléhem", "Habacuc et sa joie malgré tout"] },
      ],
    },
  ],
};
