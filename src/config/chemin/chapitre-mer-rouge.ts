import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 8 — La mer Rouge (Exode 13-17). 8 étapes. */
export const CHAPITRE_MER_ROUGE: CheminChapitre = {
  id: 8,
  nom: "La mer Rouge",
  livre: "Exode 13-17",
  accent: "#22D3EE",
  decor: "/img/chemin/decor-8.jpg",
  sentier: [{ x: 51.9, y: 94 }, { x: 51.2, y: 83.6 }, { x: 67, y: 73.1 }, { x: 45.3, y: 62.7 }, { x: 51.4, y: 52.3 }, { x: 45.9, y: 41.9 }, { x: 56.9, y: 31.4 }, { x: 45.7, y: 21 }],
  fallback: ["#0b3a44", "#125460", "#06222a"],
  carte: {
    id: "marie",
    nom: "Marie",
    titre: "La prophétesse au tambourin",
    rarete: "epique",
    image: "/img/chemin/cartes/marie.jpg",
  },
  etapes: [
    {
      recit:
        "L'Éternel allait devant eux, le jour dans une colonne de nuée pour les guider, et la nuit dans une colonne de feu pour les éclairer, afin qu'ils marchassent jour et nuit. La colonne de nuée ne se retirait point devant le peuple pendant le jour, ni la colonne de feu pendant la nuit.",
      ref: "Exode 13:21-22",
      exercices: [
        { type: "qcm", q: "Comment Dieu guide-t-il son peuple le jour ?", choix: ["Par une colonne de nuée", "Par une colonne de feu", "Par une étoile", "Par un ange visible"], bonne: 0 },
        { type: "trou", texte: "La nuit, l'Éternel allait devant eux dans une colonne de ___.", reponse: "feu", leurres: ["nuée", "lumière", "fumée"] },
        { type: "vf", q: "La colonne se retirait pendant que le peuple dormait.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "On annonça à Pharaon que le peuple avait pris la fuite. Son cœur changea : il attela son char et prit six cents chars d'élite. Les Israélites, voyant l'armée approcher, eurent grand peur et crièrent contre Moïse. Moïse répondit : « Ne craignez rien, restez en place et regardez la délivrance que l'Éternel va vous accorder. L'Éternel combattra pour vous ; et vous, gardez le silence. »",
      ref: "Exode 14:5-14",
      exercices: [
        { type: "verset", ref: "Exode 14:14", texte: "L'Éternel combattra pour vous et vous gardez le silence", niveau: "moyen" },
        { type: "qcm", q: "Combien de chars d'élite Pharaon emmène-t-il ?", choix: ["Six cents", "Cent", "Mille", "Trois cents"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Que dit Moïse au peuple effrayé ?", choix: ["« Ne craignez rien, l'Éternel combattra pour vous »", "« Prenez les armes »", "« Retournons en Égypte »", "« Dispersez-vous »"], bonne: 0 },
      ],
    },
    {
      recit:
        "L'Éternel dit à Moïse : « Étends ta main sur la mer, et fends-la. » Moïse étendit sa main. L'Éternel refoula la mer par un vent d'orient qui souffla toute la nuit ; il mit la mer à sec, et les eaux se fendirent. Les enfants d'Israël entrèrent au milieu de la mer à sec, et les eaux formaient une muraille à leur droite et à leur gauche.",
      ref: "Exode 14:15-22",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Par quel moyen l'Éternel met-il la mer à sec ?", choix: ["Un vent d'orient soufflant toute la nuit", "Un tremblement de terre", "Une pluie de feu", "Un ange qui écarte les eaux"], bonne: 0, niveau: "expert" },
        { type: "trou", texte: "Les eaux formaient une ___ à leur droite et à leur gauche.", reponse: "muraille", leurres: ["vague", "colline", "brume"], niveau: "moyen" },
        { type: "vf", q: "Le peuple traverse la mer à pied sec.", vrai: true },
      ],
    },
    {
      recit:
        "Les Égyptiens les poursuivirent au milieu de la mer. À la veille du matin, l'Éternel troubla leur camp et ôta les roues de leurs chars. Ils dirent : « Fuyons, car l'Éternel combat pour eux. » Moïse étendit sa main : les eaux revinrent et couvrirent chars et cavaliers. Il n'en resta pas un seul. Ce jour-là, Israël vit la grande puissance de l'Éternel, et le peuple crut en lui.",
      ref: "Exode 14:23-31",
      exercices: [
        { type: "qcm", q: "Que reconnaissent les Égyptiens au milieu de la mer ?", choix: ["Que l'Éternel combat pour Israël", "Qu'ils sont trop peu nombreux", "Qu'ils se sont perdus", "Que la mer est trop froide"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Qu'arrive-t-il aux chars égyptiens ?", choix: ["Leurs roues sont ôtées et ils avancent péniblement", "Ils prennent feu", "Ils s'envolent", "Ils font demi-tour intacts"], bonne: 0, niveau: "expert" },
        { type: "ordre", consigne: "Remets la traversée dans l'ordre :", items: ["Pharaon lance sa poursuite", "Moïse étend sa main sur la mer", "Israël passe à pied sec", "Les eaux reviennent sur l'armée"] },
      ],
    },
    {
      recit:
        "Alors Moïse et les enfants d'Israël chantèrent ce cantique : « Je chanterai à l'Éternel, car il a fait éclater sa gloire. L'Éternel est ma force et le sujet de mes louanges. » Marie la prophétesse, sœur d'Aaron, prit un tambourin, et toutes les femmes sortirent après elle avec des tambourins, en dansant. Marie répondait : « Chantez à l'Éternel, car il a fait éclater sa gloire. »",
      ref: "Exode 15:1-21",
      exercices: [
        { type: "qui", indices: ["Je suis prophétesse, et sœur d'Aaron.", "Petite, j'ai veillé sur un berceau posé dans les roseaux.", "Je prends un tambourin après la traversée de la mer.", "Toutes les femmes sortent derrière moi en dansant."], reponse: "Marie", leurres: ["Séphora", "Débora", "Anne"], niveau: "moyen" },
        { type: "qcm", q: "Quel instrument Marie prend-elle ?", choix: ["Un tambourin", "Une harpe", "Une trompette", "Une lyre"], bonne: 0 },
        { type: "trou", texte: "« L'Éternel est ma ___ et le sujet de mes louanges. »", reponse: "force", leurres: ["joie", "lumière", "paix"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ils marchèrent trois jours dans le désert sans trouver d'eau. Arrivés à Mara, ils ne purent boire : les eaux étaient amères. Le peuple murmura. Moïse cria à l'Éternel, qui lui indiqua un bois. Il le jeta dans l'eau, et l'eau devint douce. Ils vinrent ensuite à Élim, où il y avait douze sources et soixante-dix palmiers.",
      ref: "Exode 15:22-27",
      exercices: [
        { type: "qcm", q: "Pourquoi le peuple murmure-t-il à Mara ?", choix: ["Les eaux y sont amères", "Il n'y a pas d'ombre", "Le chemin est trop long", "Les Égyptiens reviennent"], bonne: 0 },
        { type: "qcm", q: "Que jette Moïse dans l'eau pour l'adoucir ?", choix: ["Un bois indiqué par l'Éternel", "Du sel", "Sa verge", "Une poignée de farine"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de sources trouvent-ils à Élim ?", choix: ["Douze", "Sept", "Trois", "Soixante-dix"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Dans le désert de Sin, le peuple murmura encore. L'Éternel dit : « Je ferai pleuvoir pour vous du pain du haut des cieux. » Le soir, des cailles couvrirent le camp ; le matin, il y eut une couche de rosée, et dessus quelque chose de menu comme du givre. Ils se dirent : « Man hou ? » — qu'est-ce que c'est ? Chacun en ramassait selon ce qu'il pouvait manger, et le sixième jour, le double.",
      ref: "Exode 16",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que signifie le mot « manne » ?", choix: ["Qu'est-ce que c'est ?", "Pain du ciel", "Don du matin", "Nourriture des anges"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Que Dieu envoie-t-il le soir ?", choix: ["Des cailles", "De la manne", "De l'eau", "Du feu"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Pourquoi ramassent-ils le double le sixième jour ?", choix: ["Pour ne pas ramasser le jour du repos", "Parce qu'il y en a plus", "Pour la vendre", "Pour nourrir les troupeaux"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "À Rephidim, il n'y avait pas d'eau. L'Éternel dit à Moïse : « Tu frapperas le rocher, et il en sortira de l'eau. » Il le fit devant les anciens. Puis Amalek vint combattre Israël. Josué mena le combat ; Moïse monta sur la colline, la verge de Dieu à la main. Quand il élevait sa main, Israël était le plus fort ; quand il la baissait, Amalek l'emportait. Aaron et Hur soutinrent ses mains jusqu'au coucher du soleil.",
      ref: "Exode 17",
      exercices: [
        { type: "qcm", q: "D'où vient l'eau à Rephidim ?", choix: ["Du rocher frappé par Moïse", "D'un puits creusé par le peuple", "D'une source trouvée par Josué", "De la pluie"], bonne: 0 },
        { type: "qcm", q: "Qui soutient les mains de Moïse pendant la bataille ?", choix: ["Aaron et Hur", "Josué et Caleb", "Marie et Séphora", "Les anciens du peuple"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Qui conduit Israël au combat contre Amalek ?", choix: ["Josué", "Aaron", "Hur", "Moïse"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
