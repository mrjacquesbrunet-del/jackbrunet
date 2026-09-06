import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 32 — Jean-Baptiste et le baptême (Matthieu 3, Jean 1, Luc 3). 8 étapes. */
export const CHAPITRE_BAPTEME: CheminChapitre = {
  id: 32,
  nom: "Jean-Baptiste",
  livre: "Matthieu 3, Jean 1",
  accent: "#7DD3FC",
  decor: "/img/chemin/decor-32.jpg",
  sentier: [{ x: 47.1, y: 94 }, { x: 60.6, y: 84.3 }, { x: 53.6, y: 74.6 }, { x: 42, y: 64.9 }, { x: 55, y: 55 }, { x: 50.5, y: 45.3 }, { x: 53.3, y: 35.6 }, { x: 52.9, y: 26 }],
  fallback: ["#0c3a4a", "#12556b", "#041a22"],
  carte: {
    id: "jean-baptiste",
    nom: "Jean-Baptiste",
    titre: "La voix qui crie dans le désert",
    rarete: "legendaire",
    image: "/img/chemin/cartes/jean-baptiste.jpg",
  },
  etapes: [
    {
      recit:
        "Le père de Jean, Zacharie, était resté muet depuis l'annonce de l'ange, pour n'avoir pas cru. Le jour où l'on voulut nommer l'enfant du nom de son père, Élisabeth dit : « Non, il sera appelé Jean. » Zacharie demanda une tablette et écrivit : « Jean est son nom. » Au même instant sa bouche s'ouvrit et il bénit Dieu.",
      ref: "Luc 1:57-66",
      exercices: [
        { type: "qcm", q: "Pourquoi Zacharie était-il devenu muet ?", choix: ["Il n'avait pas cru la parole de l'ange", "Il avait crié dans le temple", "Il était malade", "Il avait fait un vœu"], bonne: 0 },
        { type: "qcm", q: "Comment retrouve-t-il la parole ?", choix: ["En écrivant que l'enfant s'appellera Jean", "En priant sept jours", "Au baptême de Jean", "Sans raison donnée"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La famille voulait appeler l'enfant Zacharie, comme son père.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jean parut dans le désert de Judée, prêchant : « Repentez-vous, car le royaume des cieux est proche. » C'est lui dont avait parlé le prophète Ésaïe : « C'est ici la voix de celui qui crie dans le désert : Préparez le chemin du Seigneur, aplanissez ses sentiers. » Jean avait un vêtement de poils de chameau et une ceinture de cuir ; il se nourrissait de sauterelles et de miel sauvage.",
      ref: "Matthieu 3:1-6",
      exercices: [
        { type: "qui", indices: ["Je vis au désert, vêtu de poils de chameau.", "Je crie : « Préparez le chemin du Seigneur ».", "Je baptise dans le Jourdain.", "Je dis que je ne suis pas digne de porter ses souliers."], reponse: "Jean-Baptiste", leurres: ["Élie", "Simon Pierre", "André"] },
        { type: "qcm", q: "Quel prophète avait annoncé Jean-Baptiste ?", choix: ["Ésaïe", "Jérémie", "Daniel", "Osée"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "De quoi Jean se nourrissait-il ?", choix: ["De sauterelles et de miel sauvage", "De pain et d'eau", "De poisson", "De racines"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Voyant venir des pharisiens et des sadducéens, Jean leur dit : « Races de vipères, qui vous a appris à fuir la colère à venir ? Produisez donc du fruit digne de la repentance, et ne prétendez pas dire : Nous avons Abraham pour père ! car Dieu peut de ces pierres susciter des enfants à Abraham. »",
      ref: "Matthieu 3:7-10",
      exercices: [
        { type: "qcm", q: "Que reproche Jean aux religieux venus le voir ?", choix: ["De se prévaloir d'Abraham sans porter de fruit", "De ne pas connaître la loi", "D'être trop pauvres", "De vivre au désert"], bonne: 0 },
        { type: "trou", texte: "« Produisez donc du ___ digne de la repentance. »", reponse: "fruit", leurres: ["signe", "sacrifice", "serment"], niveau: "moyen" },
        { type: "vf", q: "Jean adoucissait son message devant les gens importants.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Les foules lui demandaient : « Que devons-nous donc faire ? » Il leur répondait : « Que celui qui a deux tuniques partage avec celui qui n'en a point, et que celui qui a de quoi manger agisse de même. » Des publicains vinrent : « N'exigez rien au-delà de ce qui vous a été ordonné. » Des soldats : « Ne commettez ni extorsion ni fraude, et contentez-vous de votre solde. »",
      ref: "Luc 3:10-14",
      exercices: [
        { type: "qcm", q: "Que répond Jean aux foules qui demandent quoi faire ?", choix: ["Partager tunique et nourriture avec qui n'en a pas", "Quitter leur métier", "Aller au temple", "Jeûner quarante jours"], bonne: 0 },
        { type: "qcm", q: "Que dit-il aux collecteurs d'impôts ?", choix: ["De n'exiger rien au-delà de ce qui est ordonné", "De quitter leur charge", "De rembourser tout", "De se taire"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que dit-il aux soldats ?", choix: ["Ni extorsion ni fraude, se contenter de leur solde", "De déserter", "De ne plus porter d'armes", "De prier chaque jour"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "« Moi, je vous baptise d'eau pour vous amener à la repentance ; mais celui qui vient après moi est plus puissant que moi, et je ne suis pas digne de porter ses souliers. Lui, il vous baptisera du Saint-Esprit et de feu. »",
      ref: "Matthieu 3:11-12",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Comment Jean se compare-t-il à celui qui vient ?", choix: ["Il n'est pas digne de porter ses souliers", "Il est son égal", "Il est son maître", "Il ne le connaît pas"], bonne: 0 },
        { type: "qcm", q: "De quoi celui qui vient baptisera-t-il ?", choix: ["Du Saint-Esprit et de feu", "D'eau seulement", "D'huile", "De sang"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jean cherchait à garder ses disciples pour lui.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le lendemain, Jean vit Jésus venant à lui et dit : « Voici l'Agneau de Dieu, qui ôte le péché du monde. C'est celui dont j'ai dit : Après moi vient un homme qui m'a précédé, car il était avant moi. Moi, je ne le connaissais pas, mais c'est afin qu'il fût manifesté à Israël que je suis venu baptiser d'eau. »",
      ref: "Jean 1:29-34",
      exercices: [
        { type: "verset", ref: "Jean 1:29", texte: "Voici l'Agneau de Dieu qui ôte le péché du monde" },
        { type: "qcm", q: "Par quel titre Jean désigne-t-il Jésus ?", choix: ["L'Agneau de Dieu", "Le Lion de Juda", "Le Roi des Juifs", "Le Prophète"], bonne: 0 },
        { type: "qcm", q: "Pourquoi Jean dit-il être venu baptiser d'eau ?", choix: ["Pour que celui qui vient soit manifesté à Israël", "Pour purifier le temple", "Pour appliquer la loi de Moïse", "Pour fonder une école"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Alors Jésus vint de la Galilée au Jourdain pour être baptisé par Jean. Mais Jean s'y opposait : « C'est moi qui ai besoin d'être baptisé par toi ! » Jésus répondit : « Laisse faire maintenant, car il est convenable que nous accomplissions ainsi tout ce qui est juste. » Alors Jean ne lui résista plus.",
      ref: "Matthieu 3:13-15",
      exercices: [
        { type: "qcm", q: "Pourquoi Jean hésite-t-il à baptiser Jésus ?", choix: ["Il s'estime celui qui a besoin d'être baptisé", "Il ne le reconnaît pas", "La foule est trop nombreuse", "Le fleuve est trop haut"], bonne: 0 },
        { type: "trou", texte: "« Il est convenable que nous accomplissions ainsi tout ce qui est ___. »", reponse: "juste", leurres: ["écrit", "promis", "saint"], niveau: "moyen" },
        { type: "qcm", q: "D'où Jésus vient-il pour être baptisé ?", choix: ["De la Galilée", "De Jérusalem", "d'Égypte", "Du désert de Juda"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dès que Jésus eut été baptisé, il sortit de l'eau. Et voici, les cieux s'ouvrirent, et il vit l'Esprit de Dieu descendre comme une colombe et venir sur lui. Et voici, une voix fit entendre des cieux ces paroles : « Celui-ci est mon Fils bien-aimé, en qui j'ai mis toute mon affection. »",
      ref: "Matthieu 3:16-17",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Matthieu 3:17", texte: "Celui-ci est mon Fils bien-aimé en qui j'ai mis toute mon affection" },
        { type: "qcm", q: "Sous quelle forme l'Esprit descend-il ?", choix: ["Comme une colombe", "Comme un feu", "Comme un vent", "Comme une nuée"], bonne: 0 },
        { type: "ordre", consigne: "Remets le baptême dans l'ordre :", items: ["Jean prêche au désert de Judée", "« Voici l'Agneau de Dieu »", "Jésus est baptisé dans le Jourdain", "La voix du ciel : « Celui-ci est mon Fils bien-aimé »"] },
      ],
    },
  ],
};
