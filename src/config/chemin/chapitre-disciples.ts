import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 34 — Les premiers disciples et Cana (Jean 1-2, Luc 5). 8 étapes. */
export const CHAPITRE_DISCIPLES: CheminChapitre = {
  id: 34,
  nom: "Les premiers disciples",
  livre: "Jean 1-2, Luc 5",
  accent: "#5EEAD4",
  decor: "/img/chemin/decor-34.jpg",
  sentier: [{ x: 44.1, y: 94 }, { x: 49.5, y: 84.3 }, { x: 58.4, y: 74.6 }, { x: 46.9, y: 64.9 }, { x: 54, y: 55 }, { x: 53.1, y: 45.3 }, { x: 40.5, y: 35.6 }, { x: 54, y: 26 }],
  fallback: ["#0a4038", "#105c52", "#031d18"],
  carte: {
    id: "andre",
    nom: "André",
    titre: "Celui qui amène son frère",
    rarete: "epique",
    image: "/img/chemin/cartes/andre.jpg",
  },
  etapes: [
    {
      recit:
        "Le lendemain, Jean était là avec deux de ses disciples. Voyant passer Jésus, il dit : « Voici l'Agneau de Dieu. » Les deux disciples le suivirent. Jésus se retourna : « Que cherchez-vous ? » — « Maître, où demeures-tu ? » — « Venez, et vous verrez. » Ils allèrent et demeurèrent auprès de lui ce jour-là.",
      ref: "Jean 1:35-39",
      exercices: [
        { type: "qcm", q: "Quelle est la première parole de Jésus à ces deux hommes ?", choix: ["« Que cherchez-vous ? »", "« Suivez-moi »", "« Qui êtes-vous ? »", "« Repentez-vous »"], bonne: 0 },
        { type: "qcm", q: "Que leur répond-il quand ils demandent où il demeure ?", choix: ["« Venez, et vous verrez »", "« Cela ne vous regarde pas »", "« À Capernaüm »", "« Nulle part »"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qui les avait orientés vers Jésus ?", choix: ["Jean-Baptiste", "Pierre", "Nicodème", "Un ange"], bonne: 0 },
      ],
    },
    {
      recit:
        "André, l'un des deux, trouva d'abord son frère Simon et lui dit : « Nous avons trouvé le Messie. » Il le conduisit vers Jésus. Jésus le regarda et dit : « Tu es Simon, fils de Jonas ; tu seras appelé Céphas — ce qui signifie Pierre. »",
      ref: "Jean 1:40-42",
      exercices: [
        { type: "qui", indices: ["Je suis le frère de Simon Pierre.", "Je suis d'abord disciple de Jean-Baptiste.", "Je cours annoncer : « Nous avons trouvé le Messie ».", "C'est moi qui amène mon frère à Jésus."], reponse: "André", leurres: ["Philippe", "Nathanaël", "Jacques"] },
        { type: "qcm", q: "Quel nom Jésus donne-t-il à Simon ?", choix: ["Céphas, c'est-à-dire Pierre", "Barnabas", "Boanergès", "Didyme"], bonne: 0 },
        { type: "qcm", q: "Que fait André dès qu'il a trouvé Jésus ?", choix: ["Il va chercher son frère", "Il retourne pêcher", "Il se tait", "Il part seul en voyage"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Philippe trouva Nathanaël : « Nous avons trouvé celui dont Moïse a écrit dans la loi : Jésus de Nazareth. » Nathanaël répondit : « Peut-il venir de Nazareth quelque chose de bon ? » — « Viens et vois. » Jésus le vit venir : « Voici un véritable Israélite, dans lequel il n'y a point de fraude. » — « D'où me connais-tu ? » — « Avant que Philippe t'appelât, quand tu étais sous le figuier, je t'ai vu. »",
      ref: "Jean 1:43-51",
      exercices: [
        { type: "qcm", q: "Quelle objection Nathanaël soulève-t-il ?", choix: ["« Peut-il venir de Nazareth quelque chose de bon ? »", "« Il est trop jeune »", "« Moïse ne l'a pas annoncé »", "« Il n'a pas de disciples »"], bonne: 0 },
        { type: "qcm", q: "Que répond Philippe à son objection ?", choix: ["« Viens et vois »", "« Tu as raison »", "« Attends un signe »", "« Demande aux scribes »"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Où Jésus dit-il avoir vu Nathanaël ?", choix: ["Sous le figuier", "Au bord du lac", "Dans la synagogue", "Sur la route"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Il y eut des noces à Cana en Galilée, et la mère de Jésus y était. Le vin ayant manqué, elle lui dit : « Ils n'ont plus de vin. » — « Femme, mon heure n'est pas encore venue. » Elle dit aux serviteurs : « Faites ce qu'il vous dira. »",
      ref: "Jean 2:1-5",
      exercices: [
        { type: "qcm", q: "Quel manque survient aux noces de Cana ?", choix: ["Le vin", "Le pain", "Les convives", "Les musiciens"], bonne: 0 },
        { type: "verset", ref: "Jean 2:5", texte: "Faites ce qu'il vous dira", niveau: "moyen" },
        { type: "qcm", q: "Que répond d'abord Jésus à sa mère ?", choix: ["« Mon heure n'est pas encore venue »", "« Je vais le faire »", "« Ce n'est pas grave »", "« Va le dire au maître d'hôtel »"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Il y avait là six vases de pierre destinés aux purifications des Juifs. Jésus dit : « Remplissez d'eau ces vases. » Ils les remplirent jusqu'au bord. « Puisez maintenant, et portez-en à l'ordonnateur du repas. » Celui-ci goûta l'eau changée en vin et appela l'époux : « Tout homme sert d'abord le bon vin ; toi, tu as gardé le bon jusqu'à maintenant. »",
      ref: "Jean 2:6-11",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Combien de vases de pierre y avait-il ?", choix: ["Six", "Douze", "Trois", "Sept"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que remarque l'ordonnateur du repas ?", choix: ["Qu'on a gardé le bon vin pour la fin", "Qu'il en manque encore", "Que le vin est coupé d'eau", "Que les vases sont vides"], bonne: 0 },
        { type: "qcm", q: "Comment l'évangile appelle-t-il ce miracle ?", choix: ["Le premier des signes de Jésus", "Le plus grand des miracles", "Un signe caché", "Une parabole"], bonne: 0, ref: "Jean 2:11", niveau: "expert" },
      ],
    },
    {
      recit:
        "La foule se pressait autour de Jésus au bord du lac de Génésareth. Il monta dans la barque de Simon et enseigna les foules depuis la barque. Puis il dit à Simon : « Avance en pleine eau, et jetez vos filets pour pêcher. » Simon répondit : « Maître, nous avons travaillé toute la nuit sans rien prendre ; mais sur ta parole, je jetterai le filet. »",
      ref: "Luc 5:1-5",
      exercices: [
        { type: "qcm", q: "Qu'ont fait les pêcheurs toute la nuit ?", choix: ["Ils ont travaillé sans rien prendre", "Ils ont dormi", "Ils ont réparé les filets", "Ils ont pêché beaucoup"], bonne: 0 },
        { type: "trou", texte: "« Mais sur ta ___, je jetterai le filet. »", reponse: "parole", leurres: ["demande", "promesse", "route"], niveau: "moyen" },
        { type: "qcm", q: "D'où Jésus enseigne-t-il la foule ?", choix: ["Depuis la barque de Simon", "Du haut d'un rocher", "Dans la synagogue", "Sur la plage"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils prirent une grande quantité de poissons, et leur filet se rompait. Ils firent signe à leurs compagnons de l'autre barque : les deux barques furent remplies au point de s'enfoncer. Simon Pierre tomba aux genoux de Jésus : « Seigneur, retire-toi de moi, parce que je suis un homme pécheur. » Jésus dit : « Ne crains point ; désormais tu seras pêcheur d'hommes. »",
      ref: "Luc 5:6-11",
      exercices: [
        { type: "verset", ref: "Luc 5:10", texte: "Ne crains point désormais tu seras pêcheur d'hommes" },
        { type: "qcm", q: "Quelle est la réaction de Pierre devant la pêche ?", choix: ["Il tombe à genoux et se dit pécheur", "Il se réjouit du gain", "Il doute encore", "Il compte les poissons"], bonne: 0 },
        { type: "qcm", q: "Que font-ils des barques et des filets ensuite ?", choix: ["Ils laissent tout et le suivent", "Ils vendent la pêche", "Ils repartent pêcher", "Ils rentrent chez eux"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus, passant, vit un publicain nommé Lévi — Matthieu — assis au bureau des péages. Il lui dit : « Suis-moi. » Cet homme, laissant tout, se leva et le suivit. Il lui fit un grand festin, et il y avait une foule de publicains à table. Les pharisiens murmuraient. Jésus leur dit : « Ce ne sont pas ceux qui se portent bien qui ont besoin de médecin. Je ne suis pas venu appeler des justes à la repentance, mais des pécheurs. »",
      ref: "Luc 5:27-32",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Quel était le métier de Lévi, appelé aussi Matthieu ?", choix: ["Collecteur d'impôts", "Pêcheur", "Charpentier", "Scribe"], bonne: 0 },
        { type: "verset", ref: "Luc 5:32", texte: "Je ne suis pas venu appeler des justes mais des pécheurs", niveau: "moyen" },
        { type: "ordre", consigne: "Remets les appels dans l'ordre :", items: ["André amène son frère Simon", "Philippe appelle Nathanaël", "La pêche miraculeuse et « pêcheur d'hommes »", "Lévi quitte son bureau de péage"] },
      ],
    },
  ],
};
