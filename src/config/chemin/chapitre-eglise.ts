import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 47 — L'Église naissante et Étienne (Actes 3-8). 8 étapes. */
export const CHAPITRE_EGLISE: CheminChapitre = {
  id: 47,
  nom: "L'Église naissante",
  livre: "Actes 3-8",
  accent: "#FCD34D",
  decor: "/img/chemin/decor-47.jpg",
  sentier: [{ x: 61.6, y: 94 }, { x: 59.7, y: 84.3 }, { x: 59.7, y: 74.6 }, { x: 46, y: 64.9 }, { x: 49.7, y: 55 }, { x: 31.3, y: 45.3 }, { x: 51, y: 35.6 }, { x: 45, y: 26 }],
  fallback: ["#4a3a08", "#6b540f", "#221a03"],
  carte: {
    id: "etienne",
    nom: "Étienne",
    titre: "Le premier témoin",
    rarete: "legendaire",
    image: "/img/chemin/cartes/etienne.jpg",
  },
  etapes: [
    {
      recit:
        "Pierre et Jean montaient au temple à l'heure de la prière. On portait un homme boiteux de naissance qu'on plaçait chaque jour à la porte appelée la Belle, pour qu'il demandât l'aumône. Voyant Pierre et Jean, il demanda l'aumône. Pierre lui dit : « Je n'ai ni argent ni or ; mais ce que j'ai, je te le donne : au nom de Jésus-Christ de Nazareth, lève-toi et marche ! »",
      ref: "Actes 3:1-6",
      exercices: [
        { type: "verset", ref: "Actes 3:6", texte: "Je n'ai ni argent ni or mais ce que j'ai je te le donne" },
        { type: "qcm", q: "Comment s'appelle la porte du temple ?", choix: ["La Belle", "La Dorée", "La porte des Brebis", "La porte de l'Est"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Que demandait cet homme ?", choix: ["L'aumône", "La guérison", "Un travail", "Une place au temple"], bonne: 0 },
      ],
    },
    {
      recit:
        "Le prenant par la main droite, Pierre le fit lever. Au même instant, ses pieds et ses chevilles devinrent fermes ; d'un saut il fut debout et se mit à marcher. Il entra avec eux dans le temple, marchant, sautant et louant Dieu. Tout le peuple, le reconnaissant, fut rempli d'étonnement.",
      ref: "Actes 3:7-10",
      exercices: [
        { type: "qcm", q: "Que fait l'homme guéri ?", choix: ["Il marche, saute et loue Dieu", "Il rentre chez lui en silence", "Il demande encore l'aumône", "Il s'enfuit"], bonne: 0 },
        { type: "qcm", q: "Pourquoi le peuple est-il étonné ?", choix: ["Il reconnaît le mendiant de la porte", "Il n'a jamais vu de guérison", "Il croyait l'homme mort", "Le temple a tremblé"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "L'homme était boiteux depuis sa naissance.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Pierre et Jean furent arrêtés et comparurent devant le sanhédrin. On leur défendit absolument de parler et d'enseigner au nom de Jésus. Pierre et Jean répondirent : « Jugez s'il est juste devant Dieu de vous obéir plutôt qu'à Dieu ; car nous ne pouvons pas ne pas parler de ce que nous avons vu et entendu. »",
      ref: "Actes 4:13-20",
      exercices: [
        { type: "verset", ref: "Actes 4:20", texte: "Nous ne pouvons pas ne pas parler de ce que nous avons vu et entendu" },
        { type: "qcm", q: "Que leur défend le sanhédrin ?", choix: ["De parler et d'enseigner au nom de Jésus", "De guérir", "D'entrer au temple", "De quitter la ville"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce qui étonne les chefs chez Pierre et Jean ?", choix: ["Leur assurance, alors qu'ils sont sans instruction", "Leur richesse", "Leur nombre", "Leur silence"], bonne: 0, ref: "Actes 4:13", niveau: "moyen" },
      ],
    },
    {
      recit:
        "La multitude de ceux qui avaient cru n'était qu'un cœur et qu'une âme. Nul ne disait que ses biens lui appartinssent en propre, mais tout était commun entre eux. Il n'y avait parmi eux aucun indigent : tous ceux qui possédaient des champs ou des maisons les vendaient et déposaient le prix aux pieds des apôtres, et l'on faisait des distributions à chacun selon qu'il en avait besoin.",
      ref: "Actes 4:32-35",
      exercices: [
        { type: "qcm", q: "Comment vivait la première Église ?", choix: ["Un cœur et une âme, tout en commun", "Chacun chez soi", "Sous la loi de Moïse seule", "En se cachant sans se voir"], bonne: 0 },
        { type: "qcm", q: "Y avait-il des indigents parmi eux ?", choix: ["Aucun", "Beaucoup", "Quelques-uns", "Le texte ne le dit pas"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le partage était le fruit d'une contrainte imposée.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comme le nombre des disciples augmentait, les Hellénistes murmurèrent : leurs veuves étaient négligées dans les distributions. Les douze dirent : « Il n'est pas convenable que nous laissions la parole de Dieu pour servir aux tables. Choisissez sept hommes de bon témoignage, pleins d'Esprit-Saint et de sagesse. » Ils élurent Étienne, homme plein de foi et d'Esprit-Saint, et six autres.",
      ref: "Actes 6:1-6",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel problème apparaît dans l'Église qui grandit ?", choix: ["Les veuves des Hellénistes sont négligées", "Le manque d'argent", "Une hérésie", "La persécution"], bonne: 0 },
        { type: "qcm", q: "Combien d'hommes sont choisis pour le service ?", choix: ["Sept", "Douze", "Trois", "Soixante-dix"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment Étienne est-il décrit ?", choix: ["Plein de foi et d'Esprit-Saint", "Bon administrateur seulement", "Riche", "Ancien pharisien"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Étienne, plein de grâce et de puissance, faisait des prodiges parmi le peuple. Quelques-uns disputèrent avec lui, mais ils ne pouvaient résister à la sagesse et à l'Esprit par lequel il parlait. Alors ils subornèrent des hommes qui l'accusèrent de blasphème, et l'entraînèrent devant le sanhédrin. Tous ceux qui siégeaient virent son visage comme celui d'un ange.",
      ref: "Actes 6:8-15",
      exercices: [
        { type: "qui", indices: ["Je suis choisi parmi sept pour servir aux tables.", "On ne peut résister à la sagesse par laquelle je parle.", "Mon visage paraît comme celui d'un ange.", "Je prie pour ceux qui me lapident."], reponse: "Étienne", leurres: ["Philippe", "Barnabas", "Matthias"] },
        { type: "qcm", q: "De quoi Étienne est-il accusé ?", choix: ["De blasphème, par de faux témoins", "De vol", "De sédition armée", "De magie"], bonne: 0 },
        { type: "qcm", q: "Que remarquent ceux qui siègent au sanhédrin ?", choix: ["Son visage comme celui d'un ange", "Son silence", "Sa peur", "Ses larmes"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Étienne leur retraça toute l'histoire d'Israël, d'Abraham à Salomon, puis conclut : « Hommes au cou raide, vous vous opposez toujours au Saint-Esprit, comme vos pères. » Ils grinçaient des dents. Mais lui, rempli du Saint-Esprit, fixa les regards vers le ciel : « Voici, je vois les cieux ouverts, et le Fils de l'homme debout à la droite de Dieu. »",
      ref: "Actes 7:51-56",
      exercices: [
        { type: "qcm", q: "Que voit Étienne avant de mourir ?", choix: ["Les cieux ouverts et le Fils de l'homme à la droite de Dieu", "Un ange à la porte", "Une lumière sur le temple", "Rien"], bonne: 0 },
        { type: "qcm", q: "Sur quoi porte son long discours ?", choix: ["Toute l'histoire d'Israël, d'Abraham à Salomon", "Sa propre défense", "Les prophéties de la fin", "La loi romaine"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le Chemin que tu viens de parcourir suit à peu près le même fil qu'Étienne.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils le traînèrent hors de la ville et le lapidèrent. Les témoins déposèrent leurs vêtements aux pieds d'un jeune homme nommé Saul. Étienne priait : « Seigneur Jésus, reçois mon esprit ! » Puis, s'étant mis à genoux, il s'écria d'une voix forte : « Seigneur, ne leur impute pas ce péché ! » Et il s'endormit. Ce jour-là, une grande persécution éclata, et ceux qui furent dispersés annonçaient la bonne nouvelle partout où ils passaient.",
      ref: "Actes 7:57 - 8:4",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quelle est la dernière prière d'Étienne ?", choix: ["« Seigneur, ne leur impute pas ce péché »", "« Venge-moi »", "« Sauve-moi »", "« Souviens-toi de mes frères »"], bonne: 0 },
        { type: "qcm", q: "Qui garde les vêtements des témoins ?", choix: ["Un jeune homme nommé Saul", "Gamaliel", "Caïphe", "Barnabas"], bonne: 0 },
        { type: "qcm", q: "Quel effet a la persécution qui suit ?", choix: ["Les dispersés annoncent la bonne nouvelle partout", "L'Église disparaît", "Les apôtres se taisent", "Le temple est fermé"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
