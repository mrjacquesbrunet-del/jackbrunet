import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 5 — Joseph (Genèse 37-50). 10 étapes. */
export const CHAPITRE_JOSEPH: CheminChapitre = {
  id: 5,
  nom: "Joseph",
  livre: "Genèse 37-50",
  accent: "#F472B6",
  decor: "/img/chemin/decor-5.jpg",
  sentier: [{ x: 48.7, y: 94 }, { x: 47.7, y: 86.4 }, { x: 61.7, y: 78.9 }, { x: 43.4, y: 71.3 }, { x: 57.4, y: 63.8 }, { x: 51.9, y: 56.2 }, { x: 65.9, y: 48.7 }, { x: 48, y: 41.1 }, { x: 59.5, y: 33.6 }, { x: 44.6, y: 26 }],
  fallback: ["#4a1d3a", "#63264d", "#28101f"],
  carte: {
    id: "joseph",
    nom: "Joseph",
    titre: "Le rêveur devenu gouverneur",
    rarete: "legendaire",
    image: "/img/chemin/cartes/joseph.jpg",
  },
  etapes: [
    {
      recit:
        "Israël aimait Joseph plus que tous ses autres fils, car il l'avait eu dans sa vieillesse ; il lui fit une tunique de plusieurs couleurs. Ses frères le haïrent. Joseph eut un songe : leurs gerbes se prosternaient devant la sienne. Puis un autre : le soleil, la lune et onze étoiles se prosternaient devant lui.",
      ref: "Genèse 37:1-11",
      exercices: [
        { type: "qcm", q: "Quel cadeau Jacob fait-il à Joseph ?", choix: ["Une tunique de plusieurs couleurs", "Un troupeau de brebis", "Un anneau d'or", "Une tente neuve"], bonne: 0 },
        { type: "qcm", q: "Que voit Joseph dans son second songe ?", choix: ["Le soleil, la lune et onze étoiles", "Sept vaches grasses", "Une échelle vers le ciel", "Un arbre chargé de fruits"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Ses frères se réjouissent d'entendre ses rêves.", vrai: false },
      ],
    },
    {
      recit:
        "Ses frères le virent venir de loin et complotèrent sa mort. Ruben les en détourna : « Ne répandez pas de sang. » Ils le jetèrent dans une citerne vide. Puis, sur le conseil de Juda, ils le vendirent à des marchands ismaélites pour vingt pièces d'argent. On trempa sa tunique dans le sang d'un bouc pour tromper leur père.",
      ref: "Genèse 37:18-35",
      exercices: [
        { type: "qcm", q: "Pour combien Joseph est-il vendu ?", choix: ["Vingt pièces d'argent", "Trente pièces d'argent", "Dix sicles d'or", "Cent deniers"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Quel frère empêche qu'on le tue ?", choix: ["Ruben", "Siméon", "Lévi", "Benjamin"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets ces moments dans l'ordre :", items: ["Les frères jettent Joseph dans la citerne", "Ils le vendent à des marchands", "Ils trempent sa tunique dans du sang"] },
      ],
    },
    {
      recit:
        "Joseph fut emmené en Égypte et acheté par Potiphar, officier de Pharaon. L'Éternel fut avec Joseph, et tout ce qu'il faisait prospérait entre ses mains. Son maître lui confia sa maison et tout ce qu'il possédait, et la bénédiction de l'Éternel reposa sur cette maison à cause de Joseph.",
      ref: "Genèse 39:1-6",
      exercices: [
        { type: "qcm", q: "Qui achète Joseph en Égypte ?", choix: ["Potiphar, officier de Pharaon", "Pharaon lui-même", "Un prêtre d'On", "Le chef des boulangers"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "L'Éternel fut avec Joseph, et tout ___ entre ses mains.", reponse: "prospérait", leurres: ["manquait", "tardait", "brûlait"], niveau: "moyen" },
        { type: "vf", q: "La maison de Potiphar est bénie à cause de Joseph.", vrai: true },
      ],
    },
    {
      recit:
        "La femme de son maître voulut l'entraîner au mal. Joseph refusa : « Comment ferais-je un si grand mal et pécherais-je contre Dieu ? » Elle le saisit par son vêtement ; il s'enfuit dehors en le laissant dans sa main. Elle l'accusa faussement, et Joseph fut jeté en prison. Mais l'Éternel fut avec lui et lui fit trouver grâce auprès du chef de la prison.",
      ref: "Genèse 39:7-23",
      exercices: [
        { type: "qcm", q: "Quelle raison Joseph donne-t-il pour refuser ?", choix: ["Ce serait pécher contre Dieu", "Il craint Potiphar", "Il est déjà marié", "Il veut rentrer chez lui"], bonne: 0 },
        { type: "qcm", q: "Que laisse Joseph derrière lui en fuyant ?", choix: ["Son vêtement", "Sa sandale", "Sa bague", "Sa ceinture"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "En prison, Joseph est abandonné de Dieu.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dans la prison se trouvaient l'échanson et le panetier de Pharaon. Chacun eut un songe. Joseph leur dit : « Les explications ne sont-elles pas à Dieu ? Racontez-moi. » Il annonça à l'échanson son rétablissement dans trois jours, et au panetier sa condamnation. Tout arriva comme il l'avait dit. Mais l'échanson oublia Joseph.",
      ref: "Genèse 40",
      coffre: true,
      exercices: [
        { type: "qcm", q: "À qui Joseph attribue-t-il l'explication des songes ?", choix: ["À Dieu", "À son propre savoir", "Aux sages d'Égypte", "Aux étoiles"], bonne: 0 },
        { type: "qcm", q: "Que devient l'échanson selon le songe ?", choix: ["Il est rétabli dans sa charge", "Il est condamné", "Il quitte l'Égypte", "Il devient gouverneur"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de temps l'échanson met-il à se souvenir de Joseph ?", choix: ["Deux ans", "Trois jours", "Un mois", "Sept ans"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Pharaon rêva de sept vaches grasses dévorées par sept vaches maigres, puis de sept épis pleins engloutis par sept épis desséchés. Nul ne pouvait expliquer. L'échanson se souvint enfin de Joseph. Joseph dit : « Ce n'est pas moi, c'est Dieu qui donnera une réponse favorable à Pharaon. Sept années d'abondance viennent, puis sept années de famine. »",
      ref: "Genèse 41:1-36",
      exercices: [
        { type: "qcm", q: "Que signifient les sept vaches maigres ?", choix: ["Sept années de famine", "Sept ennemis", "Sept rois", "Sept récoltes"], bonne: 0 },
        { type: "trou", texte: "« Ce n'est pas moi, c'est ___ qui donnera une réponse favorable à Pharaon. »", reponse: "Dieu", leurres: ["le roi", "le songe", "le ciel"], niveau: "moyen" },
        { type: "qcm", q: "Que conseille Joseph à Pharaon ?", choix: ["Mettre en réserve un cinquième des récoltes", "Lever une armée", "Fermer les frontières", "Bâtir un temple"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Pharaon dit à Joseph : « Puisque Dieu t'a fait connaître tout cela, il n'y a personne d'aussi intelligent que toi. Tu seras à la tête de ma maison. » Il lui donna son anneau, le revêtit d'habits de fin lin, mit un collier d'or à son cou et le fit monter sur son second char. Joseph avait trente ans.",
      ref: "Genèse 41:37-49",
      exercices: [
        { type: "qcm", q: "Quel âge a Joseph quand il devient gouverneur ?", choix: ["Trente ans", "Dix-sept ans", "Quarante ans", "Vingt-cinq ans"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Quel signe d'autorité Pharaon lui remet-il ?", choix: ["Son anneau", "Sa couronne", "Son sceptre", "Son épée"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets le parcours de Joseph dans l'ordre :", items: ["La citerne", "La maison de Potiphar", "La prison", "Le palais de Pharaon"] },
      ],
    },
    {
      recit:
        "La famine gagna toute la terre. Jacob envoya ses fils acheter du blé en Égypte. Ils se prosternèrent devant Joseph, sans le reconnaître. Lui les reconnut, et se souvint de ses songes. Il les éprouva, garda Siméon, et exigea qu'ils ramènent Benjamin, le plus jeune.",
      ref: "Genèse 42-43",
      exercices: [
        { type: "qcm", q: "Que se passe-t-il quand les frères arrivent devant Joseph ?", choix: ["Ils se prosternent sans le reconnaître", "Ils le reconnaissent aussitôt", "Ils refusent de le saluer", "Ils s'enfuient"], bonne: 0 },
        { type: "qcm", q: "Quel frère Joseph garde-t-il en otage ?", choix: ["Siméon", "Ruben", "Juda", "Benjamin"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Les songes d'enfance de Joseph s'accomplissent ici.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Joseph ne put se contenir. Il fit sortir tout le monde et s'écria en pleurant : « Je suis Joseph ! Mon père vit-il encore ? » Ses frères, troublés, ne pouvaient répondre. Il leur dit : « Ne vous affligez pas de m'avoir vendu : c'est pour vous sauver la vie que Dieu m'a envoyé devant vous. »",
      ref: "Genèse 45:1-15",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Mon père m'a donné une tunique de plusieurs couleurs.", "Mes frères m'ont vendu à des marchands.", "J'ai expliqué les songes de Pharaon.", "Je pleure en disant à mes frères qui je suis."], reponse: "Joseph", leurres: ["Benjamin", "Juda", "Ruben"] },
        { type: "qcm", q: "Comment Joseph explique-t-il son arrivée en Égypte ?", choix: ["Dieu l'a envoyé devant eux pour leur sauver la vie", "C'est le fruit du hasard", "Il a voulu fuir sa famille", "Pharaon l'avait demandé"], bonne: 0 },
        { type: "vf", q: "Joseph se venge de ses frères.", vrai: false },
      ],
    },
    {
      recit:
        "Après la mort de Jacob, les frères prirent peur : « Si Joseph nous gardait rancune ! » Joseph pleura et leur dit : « Ne craignez point. Suis-je à la place de Dieu ? Vous aviez médité de me faire du mal ; Dieu l'a changé en bien pour sauver la vie à un peuple nombreux. » Et il les consola en leur parlant au cœur.",
      ref: "Genèse 50:15-21",
      exercices: [
        { type: "verset", ref: "Genèse 50:20", texte: "Vous aviez médité de me faire du mal Dieu l'a changé en bien", niveau: "expert" },
        { type: "qcm", q: "Que répond Joseph à ses frères effrayés ?", choix: ["« Suis-je à la place de Dieu ? »", "« Vous méritez la mort »", "« Partez d'Égypte »", "« Je vous ai oubliés »"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Joseph console ses frères en leur parlant au cœur.", vrai: true },
      ],
    },
  ],
};
