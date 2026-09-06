import type { CheminChapitre } from "@/lib/chemin";

/** L'Ecclésiaste. 8 étapes. Le revers de la sagesse de Salomon : l'examen de tout. */
export const CHAPITRE_ECCLESIASTE: CheminChapitre = {
  id: 58,
  nom: "L'Ecclésiaste",
  livre: "Ecclésiaste 1-12",
  accent: "#A8A29E",
  decor: "/img/chemin/decor-58.jpg",
  sentier: [{ x: 57.4, y: 94 }, { x: 60.8, y: 84.3 }, { x: 58.4, y: 74.6 }, { x: 48.5, y: 64.9 }, { x: 50.2, y: 55 }, { x: 55.9, y: 45.3 }, { x: 44, y: 35.6 }, { x: 41.8, y: 26 }],
  fallback: ["#3a352f", "#544d44", "#1a1815"],
  carte: {
    id: "qoheleth",
    nom: "Le Prédicateur",
    titre: "Celui qui a tout cherché sous le soleil",
    rarete: "epique",
    image: "/img/chemin/cartes/qoheleth.jpg",
  },
  etapes: [
    {
      recit:
        "« Paroles de l'Ecclésiaste, fils de David, roi de Jérusalem. Vanité des vanités, dit l'Ecclésiaste, vanité des vanités, tout est vanité. Quel avantage revient-il à l'homme de toute la peine qu'il se donne sous le soleil ? Une génération s'en va, une autre vient, et la terre subsiste toujours. Ce qui a été, c'est ce qui sera, et il n'y a rien de nouveau sous le soleil. »",
      ref: "Ecclésiaste 1:1-9",
      exercices: [
        { type: "qcm", q: "Par quelle formule le livre commence-t-il ?", choix: ["« Vanité des vanités, tout est vanité »", "« Heureux l'homme »", "« Écoute, Israël »", "« Au commencement »"], bonne: 0 },
        { type: "verset", ref: "Ecclésiaste 1:9", texte: "Il n'y a rien de nouveau sous le soleil", niveau: "moyen" },
        { type: "qcm", q: "Comment l'auteur se présente-t-il ?", choix: ["L'Ecclésiaste, fils de David, roi de Jérusalem", "Un prophète", "Un scribe", "Un étranger"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« J'ai dit en mon cœur : Viens, je t'éprouverai par la joie. J'ai exécuté de grands ouvrages, je me suis bâti des maisons, planté des vignes, fait des jardins et des vergers, amassé de l'argent et de l'or. Puis j'ai considéré tous les ouvrages que mes mains avaient faits : et voici, tout est vanité et poursuite du vent ; il n'y a aucun avantage sous le soleil. »",
      ref: "Ecclésiaste 2:1-11",
      exercices: [
        { type: "qcm", q: "Qu'a essayé le Prédicateur avant de conclure ?", choix: ["La joie, les grands travaux, la richesse et la sagesse", "Rien, il a seulement réfléchi", "La guerre", "L'exil"], bonne: 0 },
        { type: "trou", texte: "« Tout est vanité et poursuite du ___. »", reponse: "vent", leurres: ["temps", "bonheur", "soleil"], niveau: "moyen" },
        { type: "vf", q: "Il parle d'expérience, pas de théorie : il a réellement tout eu.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Il y a un temps pour tout, un temps pour toute chose sous les cieux : un temps pour naître, et un temps pour mourir ; un temps pour planter, et un temps pour arracher ; un temps pour pleurer, et un temps pour rire ; un temps pour se taire, et un temps pour parler ; un temps pour la guerre, et un temps pour la paix. »",
      ref: "Ecclésiaste 3:1-8",
      exercices: [
        { type: "verset", ref: "Ecclésiaste 3:1", texte: "Il y a un temps pour tout un temps pour toute chose sous les cieux" },
        { type: "ordre", consigne: "Remets ces couples dans l'ordre du texte :", items: ["Un temps pour naître, un temps pour mourir", "Un temps pour planter, un temps pour arracher", "Un temps pour pleurer, un temps pour rire", "Un temps pour la guerre, un temps pour la paix"] },
        { type: "qcm", q: "Que dit ce passage du silence ?", choix: ["Il y a un temps pour se taire et un temps pour parler", "Il faut toujours parler", "Il faut toujours se taire", "Il n'en parle pas"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Il fait toute chose belle en son temps ; même il a mis dans leur cœur la pensée de l'éternité, bien que l'homme ne puisse pas saisir l'œuvre que Dieu fait, du commencement jusqu'à la fin. »",
      ref: "Ecclésiaste 3:11",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Ecclésiaste 3:11", texte: "Il a mis dans leur cœur la pensée de l'éternité" },
        { type: "qcm", q: "Qu'est-ce que Dieu a mis dans le cœur de l'homme ?", choix: ["La pensée de l'éternité", "La crainte", "La connaissance du bien et du mal", "Le désir de régner"], bonne: 0 },
        { type: "qcm", q: "Que l'homme ne peut-il pas faire, selon ce verset ?", choix: ["Saisir l'œuvre de Dieu du commencement à la fin", "Aimer", "Travailler", "Se souvenir"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Deux valent mieux qu'un, parce qu'ils retirent un bon salaire de leur travail. Car, s'ils tombent, l'un relève son compagnon ; mais malheur à celui qui est seul et qui tombe, sans avoir un second pour le relever ! De même, si deux couchent ensemble, ils auront chaud ; mais celui qui est seul, comment aura-t-il chaud ? Et si quelqu'un est plus fort qu'un seul, les deux peuvent lui résister ; et la corde à trois fils ne se rompt pas facilement. »",
      ref: "Ecclésiaste 4:9-12",
      exercices: [
        { type: "verset", ref: "Ecclésiaste 4:12", texte: "La corde à trois fils ne se rompt pas facilement" },
        { type: "qcm", q: "Quel est le malheur de celui qui est seul ?", choix: ["S'il tombe, personne ne le relève", "Il travaille plus", "Il mange moins", "Il parle trop"], bonne: 0 },
        { type: "qcm", q: "Combien de fils à la corde qui ne se rompt pas facilement ?", choix: ["Trois", "Deux", "Sept", "Douze"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Ne te presse pas d'ouvrir la bouche, et que ton cœur ne se hâte pas d'exprimer une parole devant Dieu ; car Dieu est au ciel, et toi sur la terre : que tes paroles soient donc peu nombreuses. Celui qui aime l'argent n'est pas rassasié par l'argent, et celui qui aime les richesses n'en profite pas : c'est encore là une vanité. Le sommeil du travailleur est doux, qu'il ait peu ou beaucoup à manger ; mais le rassasiement du riche ne le laisse pas dormir. »",
      ref: "Ecclésiaste 5:1-11",
      exercices: [
        { type: "qcm", q: "Que dit ce passage de celui qui aime l'argent ?", choix: ["Il n'en est jamais rassasié", "Il devient sage", "Il dort mieux", "Il est béni"], bonne: 0 },
        { type: "qcm", q: "Qui dort d'un sommeil doux ?", choix: ["Le travailleur, qu'il ait peu ou beaucoup", "Le riche", "Le roi", "Le sage"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« Dieu est au ciel, et toi sur la terre : que tes paroles soient donc peu ___. »", reponse: "nombreuses", leurres: ["sages", "fortes", "sincères"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Tout ce que ta main trouve à faire avec ta force, fais-le. Jette ton pain sur la surface des eaux, car avec le temps tu le retrouveras. Donnes-en une part à sept et même à huit, car tu ne sais pas quel malheur peut arriver sur la terre. Celui qui observe le vent ne sèmera point, et celui qui regarde les nuages ne moissonnera point. Que la lumière est douce, et qu'il est agréable aux yeux de voir le soleil ! »",
      ref: "Ecclésiaste 9:10 - 11:7",
      exercices: [
        { type: "verset", ref: "Ecclésiaste 9:10", texte: "Tout ce que ta main trouve à faire fais-le avec ta force" },
        { type: "qcm", q: "Que dit le texte de celui qui observe le vent ?", choix: ["Il ne sèmera point", "Il sèmera au bon moment", "Il sera sage", "Il moissonnera double"], bonne: 0 },
        { type: "qcm", q: "Que signifie « jette ton pain sur la surface des eaux » ?", choix: ["Donne largement, tu le retrouveras avec le temps", "Ne garde rien", "Ne travaille pas", "Jette ce qui est mauvais"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Souviens-toi de ton créateur pendant les jours de ta jeunesse, avant que les jours mauvais arrivent et que les années s'approchent où tu diras : Je n'y prends point de plaisir. » Puis, au dernier verset, tout ce qui a été cherché sous le soleil se resserre en une phrase : « Écoutons la fin du discours : crains Dieu et observe ses commandements. C'est là ce que doit faire tout homme. »",
      ref: "Ecclésiaste 12:1-13",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Ecclésiaste 12:1", texte: "Souviens-toi de ton créateur pendant les jours de ta jeunesse" },
        { type: "qui", indices: ["Je suis fils de David et roi à Jérusalem.", "J'ai bâti, planté, amassé, et j'ai tout examiné.", "Je répète que tout est vanité et poursuite du vent.", "Je finis pourtant par : crains Dieu et observe ses commandements."], reponse: "Le Prédicateur", leurres: ["Job", "Agur", "Asaph"] },
        { type: "qcm", q: "Sur quoi le livre se referme-t-il ?", choix: ["« Crains Dieu et observe ses commandements »", "« Tout est vanité »", "« Mange et bois »", "« Rien de nouveau sous le soleil »"], bonne: 0 },
      ],
    },
  ],
};
