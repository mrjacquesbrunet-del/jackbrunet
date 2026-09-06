import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 37 — Les cinq pains et la marche sur la mer (Jean 6, Matthieu 14). 8 étapes. */
export const CHAPITRE_PAINS: CheminChapitre = {
  id: 37,
  nom: "Les cinq pains",
  livre: "Jean 6, Matthieu 14",
  accent: "#FBBF24",
  decor: "/img/chemin/decor-37.jpg",
  sentier: [{ x: 57.4, y: 94 }, { x: 47, y: 84.3 }, { x: 38.2, y: 74.6 }, { x: 50.3, y: 64.9 }, { x: 51.9, y: 55 }, { x: 51.7, y: 45.3 }, { x: 46.9, y: 35.6 }, { x: 44.4, y: 26 }],
  fallback: ["#4a3608", "#6b4e0f", "#221803"],
  carte: {
    id: "philippe",
    nom: "Philippe",
    titre: "Deux cents deniers ne suffiraient pas",
    rarete: "epique",
    image: "/img/chemin/cartes/philippe.jpg",
  },
  etapes: [
    {
      recit:
        "Une grande foule suivait Jésus, parce qu'elle voyait les miracles qu'il opérait sur les malades. Il monta sur la montagne et s'y assit avec ses disciples. Levant les yeux et voyant venir à lui une grande foule, il dit à Philippe : « Où achèterons-nous des pains, pour que ces gens aient à manger ? » Il disait cela pour l'éprouver, car il savait ce qu'il allait faire.",
      ref: "Jean 6:1-6",
      exercices: [
        { type: "qcm", q: "À qui Jésus pose-t-il la question des pains ?", choix: ["À Philippe", "À Pierre", "À Jean", "À Judas"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Pourquoi pose-t-il cette question ?", choix: ["Pour l'éprouver : il savait déjà ce qu'il allait faire", "Parce qu'il ne savait pas", "Pour envoyer les disciples au marché", "Pour renvoyer la foule"], bonne: 0 },
        { type: "qcm", q: "Pourquoi la foule le suivait-elle ?", choix: ["Elle voyait les miracles sur les malades", "Elle cherchait du pain", "Elle voulait le faire roi tout de suite", "Elle venait pour la fête"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Philippe répondit : « Deux cents deniers de pains ne suffiraient pas pour que chacun en reçût un peu. » André dit : « Il y a ici un jeune garçon qui a cinq pains d'orge et deux poissons ; mais qu'est-ce que cela pour tant de gens ? » Jésus dit : « Faites-les asseoir. » Ils étaient environ cinq mille hommes.",
      ref: "Jean 6:7-10",
      exercices: [
        { type: "qcm", q: "Que possède le jeune garçon ?", choix: ["Cinq pains d'orge et deux poissons", "Sept pains", "Un panier de figues", "Une outre de vin"], bonne: 0 },
        { type: "qcm", q: "Combien d'hommes étaient présents ?", choix: ["Environ cinq mille", "Cent", "Douze mille", "Cinq cents"], bonne: 0, niveau: "moyen" },
        { type: "qui", indices: ["Jésus m'interroge le premier sur les pains.", "Je calcule qu'il faudrait deux cents deniers.", "Je dirai plus tard : « Montre-nous le Père ».", "J'avais amené Nathanaël en disant « viens et vois »."], reponse: "Philippe", leurres: ["André", "Thomas", "Barthélemy"] },
      ],
    },
    {
      recit:
        "Jésus prit les pains, rendit grâces et les distribua à ceux qui étaient assis ; il leur donna de même des poissons, autant qu'ils en voulurent. Lorsqu'ils furent rassasiés, il dit : « Ramassez les morceaux qui restent, afin que rien ne se perde. » Ils les ramassèrent et remplirent douze paniers.",
      ref: "Jean 6:11-13",
      exercices: [
        { type: "qcm", q: "Combien de paniers de restes sont ramassés ?", choix: ["Douze", "Sept", "Cinq", "Aucun"], bonne: 0 },
        { type: "trou", texte: "« Ramassez les morceaux qui restent, afin que rien ne se ___. »", reponse: "perde", leurres: ["vende", "gâte", "partage"], niveau: "moyen" },
        { type: "vf", q: "Il n'y en eut que le strict nécessaire, sans reste.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ces gens, ayant vu le miracle, disaient : « Celui-ci est vraiment le prophète qui doit venir dans le monde. » Et Jésus, sachant qu'ils allaient venir l'enlever pour le faire roi, se retira de nouveau sur la montagne, lui seul.",
      ref: "Jean 6:14-15",
      exercices: [
        { type: "qcm", q: "Que veut faire la foule après le miracle ?", choix: ["L'enlever pour le faire roi", "Le chasser", "Le suivre en Judée", "Lui payer les pains"], bonne: 0 },
        { type: "qcm", q: "Que fait Jésus alors ?", choix: ["Il se retire seul sur la montagne", "Il accepte", "Il demande un vote", "Il part en barque avec eux"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jésus a refusé une royauté que la foule voulait lui donner.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "La barque était déjà au milieu de la mer, battue par les flots, car le vent était contraire. À la quatrième veille de la nuit, Jésus alla vers eux, marchant sur la mer. Les disciples, le voyant marcher sur la mer, furent troublés : « C'est un fantôme ! » Et de peur ils poussèrent des cris. Aussitôt Jésus leur parla : « Rassurez-vous, c'est moi ; n'ayez pas peur ! »",
      ref: "Matthieu 14:24-27",
      coffre: true,
      exercices: [
        { type: "qcm", q: "À quelle heure de la nuit Jésus vient-il vers eux ?", choix: ["À la quatrième veille", "Au coucher du soleil", "À l'aube", "À minuit exactement"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Que croient d'abord voir les disciples ?", choix: ["Un fantôme", "Un ange", "Un autre bateau", "Un mirage"], bonne: 0 },
        { type: "verset", ref: "Matthieu 14:27", texte: "Rassurez-vous c'est moi n'ayez pas peur", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Pierre lui répondit : « Seigneur, si c'est toi, ordonne que j'aille vers toi sur les eaux. » — « Viens ! » Pierre sortit de la barque et marcha sur les eaux pour aller vers Jésus. Mais, voyant que le vent était fort, il eut peur ; et, comme il commençait à enfoncer, il s'écria : « Seigneur, sauve-moi ! » Aussitôt Jésus étendit la main et le saisit : « Homme de peu de foi, pourquoi as-tu douté ? »",
      ref: "Matthieu 14:28-31",
      exercices: [
        { type: "qcm", q: "Qu'est-ce qui fait enfoncer Pierre ?", choix: ["Il voit le vent fort et prend peur", "Une vague le renverse", "Il glisse", "Il lâche la main de Jésus"], bonne: 0 },
        { type: "verset", ref: "Matthieu 14:30", texte: "Seigneur sauve-moi" },
        { type: "qcm", q: "Que fait Jésus aussitôt ?", choix: ["Il étend la main et le saisit", "Il le laisse nager", "Il calme d'abord le vent", "Il remonte dans la barque"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le lendemain, la foule le retrouva de l'autre côté de la mer. Jésus leur dit : « En vérité, vous me cherchez, non parce que vous avez vu des miracles, mais parce que vous avez mangé des pains et que vous avez été rassasiés. Travaillez, non pour la nourriture qui périt, mais pour celle qui subsiste pour la vie éternelle. »",
      ref: "Jean 6:22-27",
      exercices: [
        { type: "qcm", q: "Pourquoi la foule le cherche-t-elle, selon Jésus ?", choix: ["Parce qu'elle a mangé des pains et été rassasiée", "Parce qu'elle a vu la marche sur la mer", "Parce qu'elle veut être guérie", "Parce qu'elle craint la loi"], bonne: 0 },
        { type: "qcm", q: "Pour quelle nourriture faut-il travailler ?", choix: ["Celle qui subsiste pour la vie éternelle", "Celle du matin", "Celle du sabbat", "Celle du temple"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jésus félicite la foule d'être revenue.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Je suis le pain de vie. Celui qui vient à moi n'aura jamais faim, et celui qui croit en moi n'aura jamais soif. » Dès ce moment, plusieurs de ses disciples se retirèrent. Jésus dit aux douze : « Et vous, ne voulez-vous pas aussi vous en aller ? » Simon Pierre répondit : « Seigneur, à qui irions-nous ? Tu as les paroles de la vie éternelle. »",
      ref: "Jean 6:35-69",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Jean 6:35", texte: "Je suis le pain de vie" },
        { type: "qcm", q: "Que répond Pierre quand plusieurs s'en vont ?", choix: ["« Seigneur, à qui irions-nous ? Tu as les paroles de la vie éternelle »", "« Nous partons aussi »", "« Explique-nous d'abord »", "« Rends-nous les pains »"], bonne: 0 },
        { type: "ordre", consigne: "Remets la journée dans l'ordre :", items: ["Cinq pains et deux poissons pour cinq mille", "Douze paniers de restes", "Jésus marche sur la mer", "« Je suis le pain de vie »"] },
      ],
    },
  ],
};
