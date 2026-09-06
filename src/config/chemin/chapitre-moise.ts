import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 6 — Moïse (Exode 1-4). 8 étapes. */
export const CHAPITRE_MOISE: CheminChapitre = {
  id: 6,
  nom: "Moïse",
  livre: "Exode 1-4",
  accent: "#FB923C",
  decor: "/img/chemin/decor-6.jpg",
  sentier: [{ x: 72.1, y: 94 }, { x: 53.8, y: 84.3 }, { x: 55.9, y: 74.6 }, { x: 57.4, y: 64.9 }, { x: 53.1, y: 55.1 }, { x: 51.1, y: 45.4 }, { x: 50.1, y: 35.7 }, { x: 43, y: 26 }],
  fallback: ["#4a2a10", "#633a16", "#241207"],
  carte: {
    id: "moise",
    nom: "Moïse",
    titre: "L'homme du buisson ardent",
    rarete: "legendaire",
    image: "/img/chemin/cartes/moise.jpg",
  },
  etapes: [
    {
      recit:
        "Il s'éleva sur l'Égypte un nouveau roi qui n'avait point connu Joseph. Il dit à son peuple : « Les enfants d'Israël sont devenus plus nombreux et plus puissants que nous. » On leur imposa des chefs de corvée pour les accabler de travaux pénibles : ils bâtirent les villes de Pithom et de Ramsès. Mais plus on les opprimait, plus ils se multipliaient.",
      ref: "Exode 1:8-14",
      exercices: [
        { type: "qcm", q: "Pourquoi le nouveau roi opprime-t-il les Hébreux ?", choix: ["Il les trouve trop nombreux et les craint", "Ils ont volé son trésor", "Ils refusent de payer l'impôt", "Ils ont déclaré la guerre"], bonne: 0 },
        { type: "qcm", q: "Quelles villes les Hébreux bâtissent-ils pour Pharaon ?", choix: ["Pithom et Ramsès", "Thèbes et Memphis", "Sodome et Gomorrhe", "Ninive et Babel"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Plus on les opprimait, plus ils se multipliaient.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Pharaon ordonna aux sages-femmes hébreues, Schiphra et Pua, de faire mourir les garçons à la naissance. Mais elles craignirent Dieu et laissèrent vivre les enfants. Dieu fit du bien aux sages-femmes. Alors Pharaon donna cet ordre à tout son peuple : « Vous jetterez dans le fleuve tout garçon qui naîtra. »",
      ref: "Exode 1:15-22",
      exercices: [
        { type: "qcm", q: "Pourquoi les sages-femmes désobéissent-elles à Pharaon ?", choix: ["Parce qu'elles craignaient Dieu", "Parce qu'elles étaient payées", "Parce qu'elles avaient peur des Hébreux", "Parce qu'elles n'avaient pas compris"], bonne: 0 },
        { type: "qcm", q: "Comment s'appellent les deux sages-femmes ?", choix: ["Schiphra et Pua", "Séphora et Marie", "Léa et Rachel", "Rebecca et Sara"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Dieu récompense les sages-femmes pour leur courage.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Une femme de la maison de Lévi eut un fils. Le voyant beau, elle le cacha trois mois. Ne pouvant plus le cacher, elle prit une caisse de jonc, l'enduisit de bitume et de poix, y mit l'enfant et la déposa parmi les roseaux du fleuve. La fille de Pharaon descendit se baigner, vit la caisse et eut pitié : « C'est un enfant des Hébreux. » Elle l'appela Moïse, car, dit-elle, « je l'ai retiré des eaux ».",
      ref: "Exode 2:1-10",
      exercices: [
        { type: "qcm", q: "Que veut dire le nom de Moïse ?", choix: ["Retiré des eaux", "Sauvé du feu", "Don du fleuve", "Fils du roi"], bonne: 0 },
        { type: "qcm", q: "Combien de temps sa mère le cache-t-elle ?", choix: ["Trois mois", "Un an", "Quarante jours", "Sept jours"], bonne: 0, niveau: "moyen" },
        { type: "qui", indices: ["Je surveille de loin le berceau posé dans les roseaux.", "Je propose une nourrice à la fille de Pharaon.", "C'est notre propre mère que je vais chercher.", "Je suis la sœur de Moïse."], reponse: "Marie", leurres: ["Séphora", "Schiphra", "Rachel"], niveau: "expert" },
      ],
    },
    {
      recit:
        "Devenu grand, Moïse sortit vers ses frères et vit un Égyptien frapper un Hébreu. Il regarda de côté et d'autre, tua l'Égyptien et le cacha dans le sable. Le lendemain, il comprit que la chose était connue. Pharaon voulut le faire mourir, mais Moïse s'enfuit au pays de Madian.",
      ref: "Exode 2:11-15",
      exercices: [
        { type: "qcm", q: "Pourquoi Moïse s'enfuit-il d'Égypte ?", choix: ["Il a tué un Égyptien et Pharaon veut sa mort", "Il cherche du travail", "Il est envoyé en mission", "Il fuit une famine"], bonne: 0 },
        { type: "trou", texte: "Moïse s'enfuit au pays de ___.", reponse: "Madian", leurres: ["Canaan", "Moab", "Édom"], niveau: "moyen" },
        { type: "vf", q: "Moïse a été élevé à la cour de Pharaon avant cette fuite.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Assis près d'un puits en Madian, Moïse défendit sept jeunes filles que des bergers chassaient, et fit boire leur troupeau. Leur père Réuel — Jéthro — l'invita chez lui. Moïse consentit à demeurer avec lui, et Jéthro lui donna pour femme sa fille Séphora, qui lui enfanta un fils nommé Guerschom.",
      ref: "Exode 2:16-22",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qui devient le beau-père de Moïse ?", choix: ["Jéthro", "Aaron", "Laban", "Potiphar"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment s'appelle la femme de Moïse ?", choix: ["Séphora", "Marie", "Pua", "Élisabeth"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de filles de Jéthro Moïse défend-il au puits ?", choix: ["Sept", "Deux", "Trois", "Douze"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Moïse menait le troupeau de son beau-père au-delà du désert, à Horeb, la montagne de Dieu. L'ange de l'Éternel lui apparut dans une flamme de feu, au milieu d'un buisson. Le buisson était tout en feu, et le buisson ne se consumait point. Moïse dit : « Je veux me détourner pour voir cette grande vision. »",
      ref: "Exode 3:1-6",
      exercices: [
        { type: "qcm", q: "Qu'a de si étonnant le buisson ?", choix: ["Il brûle sans se consumer", "Il parle avec la voix du vent", "Il porte des fruits en plein désert", "Il change de couleur"], bonne: 0 },
        { type: "trou", texte: "« Ôte tes ___ de tes pieds, car le lieu sur lequel tu te tiens est une terre sainte. »", reponse: "souliers", leurres: ["mains", "habits", "chaînes"], niveau: "moyen" },
        { type: "qcm", q: "Sur quelle montagne cela se passe-t-il ?", choix: ["Horeb", "Le Carmel", "L'Ararat", "Le Thabor"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Dieu dit : « J'ai vu la souffrance de mon peuple en Égypte, et j'ai entendu ses cris. Je suis descendu pour le délivrer. Va, je t'envoie vers Pharaon. » Moïse dit : « Qui suis-je ? » — « Je serai avec toi. » — « Quel est ton nom ? » Dieu répondit : « JE SUIS CELUI QUI SUIS. Tu diras : Celui qui s'appelle « je suis » m'a envoyé vers vous. »",
      ref: "Exode 3:7-15",
      exercices: [
        { type: "verset", ref: "Exode 3:14", texte: "JE SUIS CELUI QUI SUIS", niveau: "moyen" },
        { type: "qcm", q: "Que répond Dieu à Moïse qui dit « Qui suis-je ? »", choix: ["« Je serai avec toi »", "« Tu es mon prophète »", "« Prends ton frère »", "« N'y va pas »"], bonne: 0 },
        { type: "qcm", q: "Pourquoi Dieu dit-il descendre en Égypte ?", choix: ["Il a vu la souffrance de son peuple et entendu ses cris", "Pour punir les Hébreux", "Pour compter le peuple", "Pour bâtir un temple"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Ils ne me croiront pas », dit Moïse. L'Éternel lui fit jeter son bâton à terre : il devint un serpent. Il lui fit mettre la main dans son sein : elle devint lépreuse, puis redevint saine. « Je ne suis pas un homme qui parle bien. » — « Qui a fait la bouche de l'homme ? » Dieu s'irrita, puis dit : « Aaron ton frère parlera pour toi. »",
      ref: "Exode 4:1-17",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets les signes et l'appel dans l'ordre :", items: ["Le buisson qui brûle sans se consumer", "Dieu révèle son nom", "Le bâton changé en serpent", "Aaron est donné comme porte-parole"] },
        { type: "qcm", q: "Quelle objection Moïse donne-t-il en dernier ?", choix: ["Il ne parle pas bien", "Il est trop vieux", "Il n'a pas de troupeau", "Il a peur du désert"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qui Dieu donne-t-il à Moïse comme porte-parole ?", choix: ["Aaron, son frère", "Josué", "Jéthro", "Marie"], bonne: 0 },
      ],
    },
  ],
};
