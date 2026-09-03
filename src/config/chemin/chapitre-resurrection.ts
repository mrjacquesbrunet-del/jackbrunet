import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 45 — La résurrection (Luc 24, Jean 20-21, Matthieu 28). 8 étapes. */
export const CHAPITRE_RESURRECTION: CheminChapitre = {
  id: 45,
  nom: "La résurrection",
  livre: "Luc 24, Jean 20-21",
  accent: "#FFFFFF",
  decor: "/img/chemin/decor-45.jpg",
  sentier: [{ x: 44.3, y: 94 }, { x: 33.5, y: 84.3 }, { x: 33.4, y: 74.6 }, { x: 47, y: 64.9 }, { x: 60, y: 55 }, { x: 42.5, y: 45.3 }, { x: 47, y: 35.6 }, { x: 37.2, y: 26 }],
  fallback: ["#3f3a2c", "#5c5540", "#1c1a14"],
  carte: {
    id: "marie-madeleine",
    nom: "Marie-Madeleine",
    titre: "La première au tombeau",
    rarete: "legendaire",
    image: "/img/chemin/cartes/marie-madeleine.jpg",
  },
  etapes: [
    {
      recit:
        "Le premier jour de la semaine, de grand matin, comme il faisait encore obscur, Marie de Magdala se rendit au sépulcre et vit que la pierre était ôtée. Elle courut trouver Simon Pierre et l'autre disciple : « Ils ont enlevé du sépulcre le Seigneur, et nous ne savons où ils l'ont mis. »",
      ref: "Jean 20:1-2",
      exercices: [
        { type: "qcm", q: "Que trouve Marie de Magdala au matin ?", choix: ["La pierre ôtée du sépulcre", "Un ange assis", "Le tombeau scellé", "Les gardes endormis"], bonne: 0 },
        { type: "qcm", q: "Que pense-t-elle d'abord ?", choix: ["Qu'on a enlevé le corps", "Qu'il est ressuscité", "Qu'elle s'est trompée de tombeau", "Que c'est un rêve"], bonne: 0 },
        { type: "qcm", q: "Quel jour de la semaine est-ce ?", choix: ["Le premier jour de la semaine", "Le sabbat", "Le sixième jour", "Le jour de la Pâque"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Pierre et l'autre disciple coururent ensemble au sépulcre ; l'autre courut plus vite et arriva le premier. S'étant baissé, il vit les bandes qui étaient à terre, mais il n'entra pas. Simon Pierre entra dans le sépulcre : il vit les bandes, et le linge qu'on avait mis sur la tête, non pas avec les bandes, mais plié dans un lieu à part.",
      ref: "Jean 20:3-7",
      exercices: [
        { type: "qcm", q: "Quel détail est souligné à propos du linge de la tête ?", choix: ["Il était plié à part", "Il avait disparu", "Il était déchiré", "Il était taché"], bonne: 0 },
        { type: "qcm", q: "Qui arrive le premier au sépulcre ?", choix: ["L'autre disciple, qui courait plus vite", "Pierre", "Marie de Magdala", "Thomas"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le corps avait été volé et le tombeau laissé en désordre.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Marie se tenait dehors près du sépulcre, et pleurait. Elle se retourna et vit Jésus debout ; mais elle ne savait pas que c'était Jésus. « Femme, pourquoi pleures-tu ? Qui cherches-tu ? » Croyant que c'était le jardinier, elle dit : « Seigneur, si c'est toi qui l'as emporté, dis-moi où tu l'as mis. » Jésus lui dit : « Marie ! » Elle se retourna et lui dit : « Rabbouni ! »",
      ref: "Jean 20:11-16",
      exercices: [
        { type: "qui", indices: ["J'arrive au tombeau quand il fait encore nuit.", "Je pleure dehors, près du sépulcre.", "Je prends le ressuscité pour le jardinier.", "Il m'appelle par mon nom, et je le reconnais."], reponse: "Marie-Madeleine", leurres: ["Marie de Béthanie", "Marthe", "Jeanne"] },
        { type: "qcm", q: "Qu'est-ce qui lui fait reconnaître Jésus ?", choix: ["Il l'appelle par son nom", "Ses mains", "Sa voix seule, sans un mot", "Un miracle"], bonne: 0 },
        { type: "qcm", q: "Pour qui l'avait-elle pris ?", choix: ["Pour le jardinier", "Pour un ange", "Pour un soldat", "Pour Pierre"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ce même jour, deux disciples allaient à un village nommé Emmaüs. Jésus s'approcha et fit route avec eux, mais leurs yeux étaient empêchés de le reconnaître. « De quoi vous entretenez-vous ? » Ils s'arrêtèrent, l'air triste : « Nous espérions que ce serait lui qui délivrerait Israël. » Alors, commençant par Moïse et par tous les prophètes, il leur expliqua dans toutes les Écritures ce qui le concernait.",
      ref: "Luc 24:13-27",
      exercices: [
        { type: "qcm", q: "Que fait Jésus sur la route d'Emmaüs ?", choix: ["Il leur explique les Écritures depuis Moïse", "Il fait un miracle", "Il se nomme aussitôt", "Il les réprimande"], bonne: 0 },
        { type: "qcm", q: "Pourquoi ne le reconnaissent-ils pas ?", choix: ["Leurs yeux étaient empêchés de le reconnaître", "Il portait un capuchon", "Il faisait nuit", "Ils marchaient devant"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qu'avaient-ils espéré ?", choix: ["Qu'il délivrerait Israël", "Qu'il bâtirait le temple", "Qu'il serait roi de Galilée", "Rien de précis"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils le pressèrent : « Reste avec nous, car le soir approche. » Il entra pour rester avec eux. Pendant qu'il était à table avec eux, il prit le pain, rendit grâces, le rompit et le leur donna. Alors leurs yeux s'ouvrirent, et ils le reconnurent ; mais il disparut de devant eux. Ils se dirent : « Notre cœur ne brûlait-il pas au dedans de nous, lorsqu'il nous parlait en chemin ? »",
      ref: "Luc 24:28-32",
      coffre: true,
      exercices: [
        { type: "qcm", q: "À quel moment le reconnaissent-ils ?", choix: ["Quand il rompt le pain", "Quand il entre dans la maison", "Quand il prie", "Au bord du chemin"], bonne: 0 },
        { type: "trou", texte: "« Notre cœur ne ___-il pas au dedans de nous ? »", reponse: "brûlait", leurres: ["battait", "tremblait", "chantait"], niveau: "moyen" },
        { type: "qcm", q: "Que font-ils aussitôt après ?", choix: ["Ils retournent à Jérusalem la même heure", "Ils dorment", "Ils continuent leur route", "Ils se taisent"], bonne: 0, ref: "Luc 24:33", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le soir, les portes du lieu où étaient les disciples étant fermées par crainte, Jésus vint et se présenta au milieu d'eux : « La paix soit avec vous ! » Il leur montra ses mains et son côté. Les disciples furent dans la joie. Il leur dit de nouveau : « La paix soit avec vous ! Comme le Père m'a envoyé, moi aussi je vous envoie. »",
      ref: "Jean 20:19-21",
      exercices: [
        { type: "qcm", q: "Quelle est la première parole de Jésus aux disciples réunis ?", choix: ["« La paix soit avec vous »", "« Pourquoi doutez-vous ? »", "« Suivez-moi »", "« N'ayez pas peur »"], bonne: 0 },
        { type: "qcm", q: "Que leur montre-t-il ?", choix: ["Ses mains et son côté", "Le tombeau vide", "Un rouleau", "Rien"], bonne: 0, niveau: "moyen" },
        { type: "verset", ref: "Jean 20:21", texte: "Comme le Père m'a envoyé moi aussi je vous envoie", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Thomas, l'un des douze, n'était pas avec eux. Il dit : « Si je ne vois dans ses mains la marque des clous, je ne croirai point. » Huit jours après, Jésus vint, les portes étant fermées : « Avance ici ton doigt, et regarde mes mains ; ne sois pas incrédule, mais crois. » Thomas répondit : « Mon Seigneur et mon Dieu ! » Jésus lui dit : « Heureux ceux qui n'ont pas vu, et qui ont cru ! »",
      ref: "Jean 20:24-29",
      exercices: [
        { type: "verset", ref: "Jean 20:29", texte: "Heureux ceux qui n'ont pas vu et qui ont cru" },
        { type: "qcm", q: "Que demandait Thomas pour croire ?", choix: ["Voir et toucher la marque des clous", "Un signe dans le ciel", "Le témoignage de Pierre", "Rien"], bonne: 0 },
        { type: "qcm", q: "Que confesse-t-il finalement ?", choix: ["« Mon Seigneur et mon Dieu ! »", "« C'est bien toi »", "« Pardonne-moi »", "« Je crois maintenant »"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Au bord du lac, après un repas de poisson grillé, Jésus dit trois fois à Simon Pierre : « M'aimes-tu ? » Trois fois Pierre répondit : « Seigneur, tu sais que je t'aime. » Et Jésus lui dit : « Pais mes brebis. » Puis, sur la montagne de Galilée, il dit aux onze : « Tout pouvoir m'a été donné dans le ciel et sur la terre. Allez, faites de toutes les nations des disciples. Et voici, je suis avec vous tous les jours, jusqu'à la fin du monde. »",
      ref: "Jean 21:15-17",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Combien de fois Jésus demande-t-il à Pierre s'il l'aime ?", choix: ["Trois fois — autant qu'il l'avait renié", "Une fois", "Sept fois", "Deux fois"], bonne: 0 },
        { type: "verset", ref: "Matthieu 28:20", texte: "Je suis avec vous tous les jours jusqu'à la fin du monde", niveau: "moyen" },
        { type: "ordre", consigne: "Remets ce matin dans l'ordre :", items: ["La pierre ôtée et le linge plié", "« Marie ! » — « Rabbouni ! »", "Les disciples d'Emmaüs et le pain rompu", "« Pais mes brebis » au bord du lac"] },
      ],
    },
  ],
};
