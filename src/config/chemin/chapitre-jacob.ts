import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 4 — Jacob (Genèse 25-33). 8 étapes. */
export const CHAPITRE_JACOB: CheminChapitre = {
  id: 4,
  nom: "Jacob",
  livre: "Genèse 25-33",
  accent: "#A78BFA",
  decor: "/img/chemin/decor-4.jpg",
  sentier: [{ x: 46.1, y: 94 }, { x: 34.5, y: 83.9 }, { x: 40.5, y: 73.7 }, { x: 27, y: 63.6 }, { x: 41, y: 53.4 }, { x: 38.2, y: 43.3 }, { x: 52.2, y: 33.1 }, { x: 43.8, y: 23 }],
  fallback: ["#2b1f4a", "#3d2d63", "#160f28"],
  carte: {
    id: "jacob",
    nom: "Jacob",
    titre: "Celui qui lutta avec Dieu",
    rarete: "legendaire",
    image: "/img/chemin/cartes/jacob.jpg",
  },
  etapes: [
    {
      recit:
        "Rebecca était stérile ; Isaac pria pour elle et elle devint enceinte de jumeaux qui se heurtaient dans son sein. L'Éternel lui dit : « Deux nations sont dans ton ventre, et le plus grand sera assujetti au plus petit. » Le premier sortit roux et velu : on l'appela Ésaü. Son frère tenait le talon d'Ésaü : on l'appela Jacob.",
      ref: "Genèse 25:21-26",
      exercices: [
        { type: "qcm", q: "Que dit l'Éternel à Rebecca au sujet de ses jumeaux ?", choix: ["Le plus grand sera assujetti au plus petit", "Ils régneront ensemble", "L'aîné sera roi", "Ils ne se verront jamais"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Le second frère tenait le ___ d'Ésaü : on l'appela Jacob.", reponse: "talon", leurres: ["bras", "manteau", "pied"], niveau: "moyen" },
        { type: "vf", q: "Ésaü est né le premier.", vrai: true },
      ],
    },
    {
      recit:
        "Un jour Ésaü revint des champs, épuisé. Jacob faisait cuire un potage. « Laisse-moi manger de ce roux ! » dit Ésaü. Jacob répondit : « Vends-moi aujourd'hui ton droit d'aînesse. » Ésaü dit : « Je m'en vais mourir ; à quoi me sert ce droit d'aînesse ? » Il le vendit, mangea, but, se leva et s'en alla. C'est ainsi qu'Ésaü méprisa son droit d'aînesse.",
      ref: "Genèse 25:29-34",
      exercices: [
        { type: "qcm", q: "Contre quoi Ésaü échange-t-il son droit d'aînesse ?", choix: ["Un plat de lentilles", "Un troupeau", "Une tente", "Un manteau"], bonne: 0 },
        { type: "trou", texte: "C'est ainsi qu'Ésaü ___ son droit d'aînesse.", reponse: "méprisa", leurres: ["oublia", "défendit", "racheta"], niveau: "moyen" },
        { type: "vf", q: "Ésaü regrette aussitôt son échange et le rompt.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Isaac était devenu vieux et ses yeux s'étaient affaiblis. Il voulut bénir Ésaü. Mais Rebecca fit revêtir à Jacob les habits d'Ésaü et couvrit ses mains de peaux de chevreau. Isaac le toucha et dit : « La voix est la voix de Jacob, mais les mains sont les mains d'Ésaü. » Et il le bénit. Quand Ésaü revint, il poussa un grand cri, plein d'amertume.",
      ref: "Genèse 27:1-40",
      exercices: [
        { type: "qcm", q: "Comment Jacob trompe-t-il son père ?", choix: ["Il se couvre les mains de peaux de chevreau", "Il imite parfaitement la voix d'Ésaü", "Il éteint toutes les lampes", "Il paie un serviteur"], bonne: 0 },
        { type: "trou", texte: "« La ___ est la voix de Jacob, mais les mains sont les mains d'Ésaü. »", reponse: "voix", leurres: ["main", "odeur", "parole"], niveau: "moyen" },
        { type: "qcm", q: "Qui pousse Jacob à cette ruse ?", choix: ["Rebecca, sa mère", "Ésaü lui-même", "Laban", "Isaac"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jacob s'enfuit vers Charan. Le soleil couché, il prit une pierre pour chevet et s'endormit. Il eut un songe : une échelle appuyée sur la terre dont le sommet touchait au ciel, et les anges de Dieu y montaient et descendaient. L'Éternel se tenait au-dessus et dit : « Je suis avec toi ; je te garderai partout où tu iras. » Jacob s'éveilla et dit : « C'est ici la maison de Dieu. » Il appela ce lieu Béthel.",
      ref: "Genèse 28:10-22",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Je fuis mon frère en colère.", "Je prends une pierre pour oreiller.", "Je vois en songe une échelle entre la terre et le ciel.", "J'appelle ce lieu « maison de Dieu »."], reponse: "Jacob", leurres: ["Isaac", "Joseph", "Abraham"] },
        { type: "qcm", q: "Comment Jacob nomme-t-il ce lieu ?", choix: ["Béthel", "Mamré", "Péniel", "Salem"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que veut dire « Béthel » ?", choix: ["Maison de Dieu", "Face de Dieu", "Puits du serment", "Pierre dressée"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Jacob arriva chez son oncle Laban et aima Rachel. Il servit sept ans pour elle, et ces années furent à ses yeux comme quelques jours, tant il l'aimait. Mais au matin des noces, c'était Léa. Laban lui donna aussi Rachel, contre sept nouvelles années de service.",
      ref: "Genèse 29:1-30",
      exercices: [
        { type: "qcm", q: "Combien d'années Jacob sert-il pour Rachel au total ?", choix: ["Quatorze", "Sept", "Vingt", "Trois"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Ces années furent à ses yeux comme quelques ___, tant il l'aimait.", reponse: "jours", leurres: ["heures", "mois", "instants"], niveau: "expert" },
        { type: "qcm", q: "Qui Laban donne-t-il à Jacob au matin des premières noces ?", choix: ["Léa", "Rachel", "Bilha", "Zilpa"], bonne: 0 },
      ],
    },
    {
      recit:
        "Dieu bénit Jacob et ses troupeaux se multiplièrent. Après vingt ans chez Laban, l'Éternel lui dit : « Retourne au pays de tes pères, et je serai avec toi. » Jacob partit avec ses femmes, ses enfants et tout son bétail. Laban le poursuivit, puis ils dressèrent un monceau de pierres comme témoin de paix entre eux.",
      ref: "Genèse 30-31",
      exercices: [
        { type: "qcm", q: "Combien de temps Jacob reste-t-il chez Laban ?", choix: ["Vingt ans", "Sept ans", "Quarante ans", "Dix ans"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Que dressent Jacob et Laban en se quittant ?", choix: ["Un monceau de pierres, témoin entre eux", "Un autel de bois", "Une tente commune", "Un puits"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "C'est Dieu qui ordonne à Jacob de retourner au pays de ses pères.", vrai: true },
      ],
    },
    {
      recit:
        "La nuit d'avant de revoir Ésaü, Jacob resta seul. Un homme lutta avec lui jusqu'à l'aurore. Voyant qu'il ne pouvait le vaincre, il toucha l'emboîture de sa hanche. « Laisse-moi aller. » — « Je ne te laisserai point que tu ne m'aies béni. » Il lui dit : « Tu ne t'appelleras plus Jacob, mais Israël, car tu as lutté avec Dieu et avec des hommes, et tu as été vainqueur. » Jacob appela ce lieu Péniel, et il boitait de la hanche.",
      ref: "Genèse 32:22-32",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Genèse 32:26", texte: "Je ne te laisserai point que tu ne m'aies béni", niveau: "expert" },
        { type: "qcm", q: "Quel nouveau nom Jacob reçoit-il ?", choix: ["Israël", "Béthel", "Péniel", "Édom"], bonne: 0 },
        { type: "qcm", q: "Quelle trace Jacob garde-t-il de cette nuit ?", choix: ["Il boite de la hanche", "Il perd la voix", "Une cicatrice au front", "Ses cheveux blanchissent"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jacob leva les yeux : Ésaü venait avec quatre cents hommes. Jacob passa devant eux et se prosterna sept fois jusqu'à terre. Mais Ésaü courut à sa rencontre, l'embrassa, se jeta à son cou et le baisa. Et ils pleurèrent. Jacob lui dit : « J'ai vu ta face comme on voit la face de Dieu, et tu m'as accueilli favorablement. »",
      ref: "Genèse 33:1-11",
      exercices: [
        { type: "qcm", q: "Comment Ésaü accueille-t-il Jacob ?", choix: ["Il court l'embrasser et ils pleurent", "Il l'attaque avec ses hommes", "Il l'ignore", "Il exige un tribut"], bonne: 0 },
        { type: "ordre", consigne: "Remets la vie de Jacob dans l'ordre :", items: ["Il achète le droit d'aînesse", "Il reçoit la bénédiction et s'enfuit", "Il voit l'échelle à Béthel", "Il lutte au gué de Jabbok", "Il se réconcilie avec Ésaü"] },
        { type: "vf", q: "Jacob se prosterne sept fois avant d'atteindre son frère.", vrai: true, niveau: "moyen" },
      ],
    },
  ],
};
