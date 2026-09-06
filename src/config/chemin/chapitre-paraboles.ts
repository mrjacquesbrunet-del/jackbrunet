import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 38 — Les paraboles du royaume (Matthieu 13, Luc 10 et 15). 8 étapes. */
export const CHAPITRE_PARABOLES: CheminChapitre = {
  id: 38,
  nom: "Les paraboles",
  livre: "Matthieu 13, Luc 15",
  accent: "#A3E635",
  decor: "/img/chemin/decor-38.jpg",
  sentier: [{ x: 54, y: 94 }, { x: 48, y: 84.3 }, { x: 38.6, y: 74.6 }, { x: 45.2, y: 64.9 }, { x: 54.2, y: 55 }, { x: 42.3, y: 45.3 }, { x: 58.6, y: 35.6 }, { x: 50.9, y: 26 }],
  fallback: ["#3a4a08", "#526b0f", "#182203"],
  carte: {
    id: "samaritain",
    nom: "Le bon Samaritain",
    titre: "Celui qui s'est arrêté",
    rarete: "epique",
    image: "/img/chemin/cartes/samaritain.jpg",
  },
  etapes: [
    {
      recit:
        "« Un semeur sortit pour semer. Comme il semait, une partie de la semence tomba le long du chemin : les oiseaux vinrent et la mangèrent. Une autre partie tomba dans les endroits pierreux : elle leva aussitôt, mais le soleil la brûla, car elle n'avait pas de racines. Une autre tomba parmi les épines, qui l'étouffèrent. Une autre tomba dans la bonne terre et donna du fruit. »",
      ref: "Matthieu 13:3-8",
      exercices: [
        { type: "ordre", consigne: "Remets les quatre terrains dans l'ordre du récit :", items: ["Le long du chemin", "Les endroits pierreux", "Parmi les épines", "La bonne terre"] },
        { type: "qcm", q: "Pourquoi la semence des lieux pierreux se dessèche-t-elle ?", choix: ["Elle n'avait pas de racines", "Les oiseaux l'ont mangée", "Il a trop plu", "Les épines l'ont étouffée"], bonne: 0 },
        { type: "qcm", q: "Que représente la semence, selon l'explication de Jésus ?", choix: ["La parole du royaume", "L'argent", "La loi de Moïse", "Les disciples"], bonne: 0, ref: "Matthieu 13:19", niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Le royaume des cieux est semblable à un grain de sénevé qu'un homme a pris et semé dans son champ. C'est la plus petite de toutes les semences ; mais quand il a poussé, il est plus grand que les légumes et devient un arbre, de sorte que les oiseaux du ciel viennent habiter dans ses branches. »",
      ref: "Matthieu 13:31-32",
      exercices: [
        { type: "qcm", q: "À quoi le royaume est-il comparé ici ?", choix: ["À un grain de sénevé", "À un cèdre", "À une montagne", "À un fleuve"], bonne: 0 },
        { type: "qcm", q: "Qu'est-ce qui frappe dans cette image ?", choix: ["La plus petite semence devient un arbre", "L'arbre pousse en un jour", "Il ne donne pas de fruit", "Il est planté au désert"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Les oiseaux du ciel viennent habiter dans ses branches.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Le royaume des cieux est encore semblable à un trésor caché dans un champ. L'homme qui l'a trouvé le cache ; et, dans sa joie, il va vendre tout ce qu'il a et achète ce champ. Il est encore semblable à un marchand qui cherche de belles perles. Ayant trouvé une perle de grand prix, il est allé vendre tout ce qu'il avait et l'a achetée. »",
      ref: "Matthieu 13:44-46",
      exercices: [
        { type: "qcm", q: "Que fait l'homme qui trouve le trésor ?", choix: ["Il vend tout ce qu'il a et achète le champ", "Il l'emporte aussitôt", "Il le partage", "Il le laisse là"], bonne: 0 },
        { type: "qcm", q: "Quel mot le texte emploie-t-il pour ce qu'il ressent ?", choix: ["La joie", "La peur", "L'orgueil", "Le doute"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que cherchait le marchand ?", choix: ["De belles perles", "De l'or", "Des terres", "Des épices"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Un docteur de la loi demanda : « Qui est mon prochain ? » Jésus répondit : « Un homme descendait de Jérusalem à Jéricho. Il tomba au milieu des brigands, qui le dépouillèrent, le chargèrent de coups et s'en allèrent, le laissant à demi mort. Un sacrificateur descendait par le même chemin : il passa outre. Un Lévite fit de même. »",
      ref: "Luc 10:29-32",
      exercices: [
        { type: "qcm", q: "Quelle question déclenche cette parabole ?", choix: ["« Qui est mon prochain ? »", "« Que faut-il croire ? »", "« Qui est le plus grand ? »", "« Faut-il payer l'impôt ? »"], bonne: 0 },
        { type: "qcm", q: "Que font le sacrificateur et le Lévite ?", choix: ["Ils passent outre", "Ils appellent des secours", "Ils le soignent", "Ils poursuivent les brigands"], bonne: 0 },
        { type: "qcm", q: "Sur quelle route l'homme est-il attaqué ?", choix: ["De Jérusalem à Jéricho", "De Nazareth à Cana", "De Béthanie à Emmaüs", "De Capernaüm à Tyr"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Mais un Samaritain, qui voyageait, arriva près de lui. Voyant l'homme, il fut ému de compassion. Il s'approcha, banda ses plaies en y versant de l'huile et du vin, le mit sur sa propre monture, le conduisit à une hôtellerie et prit soin de lui. » — « Lequel de ces trois te semble avoir été le prochain ? » — « C'est celui qui a exercé la miséricorde. » — « Va, et toi, fais de même. »",
      ref: "Luc 10:33-37",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qui s'arrête finalement ?", choix: ["Un Samaritain, un étranger méprisé", "Un pharisien", "Un soldat romain", "Un marchand"], bonne: 0 },
        { type: "verset", ref: "Luc 10:37", texte: "Va et toi fais de même", niveau: "moyen" },
        { type: "qcm", q: "Comment Jésus retourne-t-il la question du docteur ?", choix: ["Il ne demande plus qui est mon prochain, mais qui s'est fait le prochain", "Il refuse de répondre", "Il cite la loi", "Il change de sujet"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Quel homme d'entre vous, s'il a cent brebis et qu'il en perde une, ne laisse les quatre-vingt-dix-neuf dans le désert pour aller après celle qui est perdue, jusqu'à ce qu'il la retrouve ? Lorsqu'il l'a retrouvée, il la met avec joie sur ses épaules, et, de retour à la maison, il appelle ses amis : Réjouissez-vous avec moi, car j'ai retrouvé ma brebis qui était perdue. »",
      ref: "Luc 15:3-7",
      exercices: [
        { type: "qcm", q: "Combien de brebis le berger laisse-t-il pour en chercher une ?", choix: ["Quatre-vingt-dix-neuf", "Dix", "Cinquante", "Aucune, il attend"], bonne: 0 },
        { type: "qcm", q: "Comment ramène-t-il la brebis retrouvée ?", choix: ["Avec joie, sur ses épaules", "Attachée par une corde", "En la poussant devant lui", "Il envoie un serviteur"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Le ciel se réjouit plus pour un pécheur qui se repent que pour quatre-vingt-dix-neuf justes.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Un homme avait deux fils. Le plus jeune dit : Mon père, donne-moi la part de bien qui doit me revenir. Peu de jours après, il partit pour un pays éloigné, où il dissipa son bien en vivant dans la débauche. Une grande famine survint. Il aurait bien voulu se rassasier des caroubes que mangeaient les pourceaux, mais personne ne lui en donnait. »",
      ref: "Luc 15:11-16",
      exercices: [
        { type: "qcm", q: "Que demande le plus jeune fils ?", choix: ["Sa part d'héritage, du vivant de son père", "Un voyage", "Un troupeau", "Une maison"], bonne: 0 },
        { type: "qcm", q: "Jusqu'où descend-il ?", choix: ["Il envie la nourriture des pourceaux", "Il devient soldat", "Il est mis en prison", "Il tombe malade"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Il partit pour un pays ___.", reponse: "éloigné", leurres: ["voisin", "ennemi", "désert"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Étant rentré en lui-même, il se dit : Je me lèverai, j'irai vers mon père et je lui dirai : Père, j'ai péché contre le ciel et contre toi. Il se leva et alla vers son père. Comme il était encore loin, son père le vit et fut ému de compassion ; il courut se jeter à son cou et le baisa. Le père dit à ses serviteurs : Apportez vite la plus belle robe ; car mon fils que voici était mort, et il est revenu à la vie. »",
      ref: "Luc 15:17-24",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que fait le père en voyant revenir son fils ?", choix: ["Il court se jeter à son cou", "Il attend qu'il arrive", "Il l'interroge d'abord", "Il refuse de le voir"], bonne: 0 },
        { type: "verset", ref: "Luc 15:24", texte: "Mon fils que voici était mort et il est revenu à la vie" },
        { type: "qcm", q: "Que dit le fils aîné à la fin de la parabole ?", choix: ["Qu'il a servi son père sans jamais recevoir de fête", "Qu'il est heureux du retour", "Rien du tout", "Qu'il veut partir aussi"], bonne: 0, ref: "Luc 15:29", niveau: "expert" },
      ],
    },
  ],
};
