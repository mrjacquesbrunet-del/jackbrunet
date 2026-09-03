import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 48 — La conversion de Saul et Corneille (Actes 9-11). 8 étapes. */
export const CHAPITRE_PAUL: CheminChapitre = {
  id: 48,
  nom: "La conversion de Saul",
  livre: "Actes 9-11",
  accent: "#FAFAFA",
  decor: "/img/chemin/decor-48.jpg",
  sentier: [{ x: 53.4, y: 94 }, { x: 48.9, y: 84.3 }, { x: 46.5, y: 74.6 }, { x: 36.9, y: 64.9 }, { x: 51, y: 55 }, { x: 40.2, y: 45.3 }, { x: 38.5, y: 35.6 }, { x: 39.5, y: 26 }],
  fallback: ["#3a3a3a", "#545454", "#181818"],
  carte: {
    id: "paul",
    nom: "Paul",
    titre: "Le persécuteur devenu apôtre",
    rarete: "legendaire",
    image: "/img/chemin/cartes/paul.jpg",
  },
  etapes: [
    {
      recit:
        "Saul, respirant encore la menace et le meurtre contre les disciples du Seigneur, alla trouver le souverain sacrificateur et lui demanda des lettres pour Damas, afin que, s'il trouvait des partisans de la nouvelle doctrine, hommes ou femmes, il les amenât liés à Jérusalem.",
      ref: "Actes 9:1-2",
      exercices: [
        { type: "qcm", q: "Que va faire Saul à Damas ?", choix: ["Arrêter les disciples et les ramener liés", "Étudier la loi", "Commercer", "Bâtir une synagogue"], bonne: 0 },
        { type: "qcm", q: "Comment le texte décrit-il Saul ?", choix: ["Respirant la menace et le meurtre", "Doux et hésitant", "Malade", "Riche et oisif"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Saul agissait avec l'autorisation officielle du souverain sacrificateur.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Comme il était en chemin et approchait de Damas, tout à coup une lumière venant du ciel resplendit autour de lui. Il tomba par terre et entendit une voix : « Saul, Saul, pourquoi me persécutes-tu ? » — « Qui es-tu, Seigneur ? » — « Je suis Jésus que tu persécutes. Lève-toi, entre dans la ville, et on te dira ce que tu dois faire. »",
      ref: "Actes 9:3-6",
      exercices: [
        { type: "verset", ref: "Actes 9:4", texte: "Saul Saul pourquoi me persécutes-tu" },
        { type: "qcm", q: "Que révèle cette question sur Jésus et son Église ?", choix: ["Persécuter les disciples, c'est le persécuter lui-même", "Qu'il ne le savait pas", "Qu'il était en colère contre eux", "Qu'il était à Damas"], bonne: 0 },
        { type: "qui", indices: ["Je garde les vêtements de ceux qui lapident Étienne.", "Une lumière me jette à terre sur une route.", "Je reste trois jours sans voir.", "J'écrirai plus de lettres que personne dans le Nouveau Testament."], reponse: "Paul", leurres: ["Barnabas", "Silas", "Apollos"] },
      ],
    },
    {
      recit:
        "Saul se releva de terre ; les yeux ouverts, il ne voyait rien. On le conduisit par la main à Damas. Il fut trois jours sans voir, et il ne mangea ni ne but. Il y avait à Damas un disciple nommé Ananias. Le Seigneur lui dit : « Lève-toi, va dans la rue appelée la droite, et cherche Saul de Tarse. Car il prie. »",
      ref: "Actes 9:8-11",
      exercices: [
        { type: "qcm", q: "Combien de jours Saul reste-t-il sans voir ?", choix: ["Trois", "Sept", "Quarante", "Un"], bonne: 0 },
        { type: "qcm", q: "Comment s'appelle le disciple envoyé vers lui ?", choix: ["Ananias", "Barnabas", "Philippe", "Étienne"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel signe le Seigneur donne-t-il d'un changement chez Saul ?", choix: ["« Car il prie »", "Il a jeûné", "Il a écrit une lettre", "Il a rendu ses lettres"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ananias objecta : « Seigneur, j'ai appris de plusieurs tout le mal que cet homme a fait à tes saints à Jérusalem. » Le Seigneur lui dit : « Va, car cet homme est un instrument que j'ai choisi, pour porter mon nom devant les nations, devant les rois, et devant les fils d'Israël ; je lui montrerai tout ce qu'il doit souffrir pour mon nom. »",
      ref: "Actes 9:13-16",
      exercices: [
        { type: "qcm", q: "Pourquoi Ananias hésite-t-il ?", choix: ["Il connaît le mal que Saul a fait", "Il ne sait pas où aller", "Il est malade", "Il a peur des Romains"], bonne: 0 },
        { type: "qcm", q: "Comment le Seigneur appelle-t-il Saul ?", choix: ["Un instrument qu'il a choisi", "Un ennemi vaincu", "Un prophète d'Israël", "Un serviteur temporaire"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le Seigneur annonce d'emblée que Saul souffrira pour son nom.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ananias entra dans la maison, imposa les mains à Saul : « Saul, mon frère, le Seigneur Jésus, qui t'est apparu sur le chemin, m'a envoyé pour que tu recouvres la vue et que tu sois rempli du Saint-Esprit. » Au même instant, il tomba de ses yeux comme des écailles, et il recouvra la vue. Il se leva et fut baptisé. Aussitôt il prêcha dans les synagogues que Jésus est le Fils de Dieu.",
      ref: "Actes 9:17-20",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Comment Ananias appelle-t-il Saul en entrant ?", choix: ["« Saul, mon frère »", "« Persécuteur »", "« Homme de Tarse »", "« Serviteur »"], bonne: 0 },
        { type: "qcm", q: "Que prêche Saul aussitôt après son baptême ?", choix: ["Que Jésus est le Fils de Dieu", "La loi de Moïse", "La fin du monde", "Rien pendant trois ans"], bonne: 0 },
        { type: "qcm", q: "Que tombe-t-il de ses yeux ?", choix: ["Comme des écailles", "Des larmes seulement", "De la poussière", "Rien de visible"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Arrivé à Jérusalem, Saul tâchait de se joindre aux disciples ; mais tous le craignaient, ne croyant pas qu'il fût un disciple. Alors Barnabas le prit avec lui, le conduisit auprès des apôtres et raconta comment sur le chemin Saul avait vu le Seigneur et lui avait parlé, et comment à Damas il avait prêché franchement au nom de Jésus.",
      ref: "Actes 9:26-28",
      exercices: [
        { type: "qcm", q: "Qui prend le risque d'introduire Saul auprès des apôtres ?", choix: ["Barnabas", "Pierre", "Jean", "Ananias"], bonne: 0 },
        { type: "qcm", q: "Pourquoi les disciples le craignaient-ils ?", choix: ["Ils ne croyaient pas qu'il fût vraiment disciple", "Il était romain", "Il était riche", "Il parlait grec"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Il a fallu quelqu'un pour se porter garant de lui.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À Césarée vivait un centenier nommé Corneille, pieux et craignant Dieu, qui faisait beaucoup d'aumônes et priait Dieu continuellement. Un ange lui dit d'envoyer chercher Simon Pierre. Au même moment, Pierre eut une vision : une grande nappe descendait du ciel avec toutes sortes d'animaux. « Tue et mange. » — « Non, Seigneur, je n'ai jamais rien mangé de souillé. » — « Ce que Dieu a déclaré pur, ne le regarde pas comme souillé. »",
      ref: "Actes 10:1-16",
      exercices: [
        { type: "qcm", q: "Qui est Corneille ?", choix: ["Un centenier romain, pieux et craignant Dieu", "Un pharisien", "Un marchand grec", "Un prêtre du temple"], bonne: 0 },
        { type: "qcm", q: "Que voit Pierre en vision ?", choix: ["Une nappe descendant du ciel avec toutes sortes d'animaux", "Un ange à la porte", "Une lumière", "Un fleuve"], bonne: 0 },
        { type: "trou", texte: "« Ce que Dieu a déclaré ___, ne le regarde pas comme souillé. »", reponse: "pur", leurres: ["saint", "bon", "juste"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Pierre entra chez Corneille : « Vous savez qu'il est défendu à un Juif de se lier avec un étranger ; mais Dieu m'a appris à ne regarder aucun homme comme souillé. En vérité, je reconnais que Dieu ne fait point acception de personnes, mais qu'en toute nation celui qui le craint et qui pratique la justice lui est agréable. » Comme il parlait encore, le Saint-Esprit descendit sur tous ceux qui écoutaient, et les croyants d'origine juive furent étonnés que le don fût aussi répandu sur les païens.",
      ref: "Actes 10:28-45",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Actes 10:34", texte: "Dieu ne fait point acception de personnes" },
        { type: "qcm", q: "Qu'est-ce qui étonne les croyants d'origine juive ?", choix: ["Que le Saint-Esprit soit donné aussi aux païens", "Que Pierre soit venu", "Que Corneille soit riche", "Que la maison soit grande"], bonne: 0 },
        { type: "ordre", consigne: "Remets ces événements dans l'ordre :", items: ["Saul part pour Damas avec des lettres", "La lumière sur le chemin", "Ananias impose les mains à Saul", "Pierre entre chez Corneille le païen"] },
      ],
    },
  ],
};
