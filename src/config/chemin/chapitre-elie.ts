import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 19 — Élie (1 Rois 17-19, 2 Rois 2). 8 étapes. */
export const CHAPITRE_ELIE: CheminChapitre = {
  id: 19,
  nom: "Élie",
  livre: "1 Rois 17-19",
  accent: "#DC2626",
  decor: "/img/chemin/decor-19.jpg",
  sentier: [{ x: 43.1, y: 94 }, { x: 51.9, y: 84.3 }, { x: 62, y: 74.6 }, { x: 42.2, y: 64.9 }, { x: 54.9, y: 55 }, { x: 45.6, y: 45.3 }, { x: 48.6, y: 35.6 }, { x: 49.6, y: 26 }],
  fallback: ["#4a0f0f", "#6b1717", "#220505"],
  carte: {
    id: "elie",
    nom: "Élie",
    titre: "Le prophète du feu",
    rarete: "legendaire",
    image: "/img/chemin/cartes/elie.jpg",
  },
  etapes: [
    {
      recit:
        "Élie, le Thischbite, dit à Achab : « L'Éternel est vivant, devant qui je me tiens ! Il n'y aura ces années-ci ni rosée ni pluie, sinon à ma parole. » L'Éternel lui dit : « Cache-toi près du torrent de Kerith. Tu boiras de l'eau du torrent, et j'ai ordonné aux corbeaux de te nourrir là. »",
      ref: "1 Rois 17:1-7",
      exercices: [
        { type: "qcm", q: "Qu'annonce Élie au roi Achab ?", choix: ["Ni rosée ni pluie pendant des années", "Une invasion", "La chute du temple", "Une famine de sept jours"], bonne: 0 },
        { type: "qcm", q: "Qui nourrit Élie près du torrent ?", choix: ["Des corbeaux", "Une caravane", "Un ange chaque matin", "Des bergers"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Élie se cache près du torrent de ___.", reponse: "Kerith", leurres: ["Kison", "Jabbok", "Arnon"], niveau: "expert" },
      ],
    },
    {
      recit:
        "Le torrent sécha. Dieu l'envoya à Sarepta, chez une veuve. Elle n'avait qu'une poignée de farine et un peu d'huile pour un dernier repas. Élie dit : « Fais-m'en d'abord un petit gâteau : la farine ne manquera point et l'huile ne diminuera point, jusqu'au jour où l'Éternel fera tomber la pluie. » Il en fut ainsi longtemps.",
      ref: "1 Rois 17:8-16",
      exercices: [
        { type: "qcm", q: "Que restait-il à la veuve de Sarepta ?", choix: ["Une poignée de farine et un peu d'huile", "Un pain entier", "Un troupeau", "Rien du tout"], bonne: 0 },
        { type: "qcm", q: "Que promet Élie à la veuve ?", choix: ["Que la farine et l'huile ne manqueront pas", "Une maison neuve", "Un fils", "De l'argent du roi"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Élie demande à la veuve de le servir avant elle-même.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le fils de la veuve tomba malade et cessa de respirer. Élie le prit, le monta dans la chambre haute et l'étendit sur son lit. Il cria à l'Éternel : « Éternel, mon Dieu, que l'âme de cet enfant revienne au dedans de lui ! » L'Éternel écouta la voix d'Élie, et l'enfant recouvra la vie.",
      ref: "1 Rois 17:17-24",
      exercices: [
        { type: "qcm", q: "Que fait Élie pour le fils de la veuve ?", choix: ["Il crie à l'Éternel et l'enfant revit", "Il prépare un remède", "Il l'emmène chez le roi", "Il attend trois jours"], bonne: 0 },
        { type: "qcm", q: "Où Élie porte-t-il l'enfant ?", choix: ["Dans la chambre haute", "Au temple", "Au torrent", "Sur le toit de la ville"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Après ce signe, la veuve reconnaît qu'Élie est un homme de Dieu.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "La troisième année, Élie se présenta devant Achab, qui l'appela « celui qui trouble Israël ». Élie répondit : « Ce n'est pas moi qui trouble Israël, c'est toi, en abandonnant les commandements de l'Éternel. Rassemble tout Israël au mont Carmel, avec les quatre cent cinquante prophètes de Baal. »",
      ref: "1 Rois 18:17-19",
      exercices: [
        { type: "qcm", q: "De quoi Achab accuse-t-il Élie ?", choix: ["De troubler Israël", "De voler le trésor", "De fuir la guerre", "De prophétiser faussement"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de prophètes de Baal sont convoqués ?", choix: ["Quatre cent cinquante", "Cent", "Douze", "Mille"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Sur quelle montagne le peuple est-il rassemblé ?", choix: ["Le mont Carmel", "Le mont Sinaï", "Le mont Guilboa", "Le mont des Oliviers"], bonne: 0 },
      ],
    },
    {
      recit:
        "Élie dit au peuple : « Jusqu'à quand clocherez-vous des deux côtés ? Si l'Éternel est Dieu, allez après lui ; si c'est Baal, allez après lui. » Le peuple ne lui répondit rien. Les prophètes de Baal invoquèrent leur dieu depuis le matin jusqu'à midi : point de voix, point de réponse.",
      ref: "1 Rois 18:20-29",
      coffre: true,
      exercices: [
        { type: "trou", texte: "« Jusqu'à quand clocherez-vous des ___ côtés ? »", reponse: "deux", leurres: ["quatre", "mille", "sept"], niveau: "moyen" },
        { type: "qcm", q: "Que se passe-t-il quand les prophètes de Baal invoquent leur dieu ?", choix: ["Point de voix, point de réponse", "Le feu tombe aussitôt", "Un orage éclate", "Ils sont exaucés à midi"], bonne: 0 },
        { type: "vf", q: "Le peuple répond aussitôt à la question d'Élie.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Élie rebâtit l'autel avec douze pierres, creusa un fossé et fit verser douze cruches d'eau sur l'holocauste et sur le bois. Il pria : « Éternel, que l'on sache aujourd'hui que tu es Dieu ! » Le feu de l'Éternel tomba et consuma l'holocauste, le bois, les pierres et la terre, et absorba l'eau du fossé. Le peuple tomba sur son visage : « C'est l'Éternel qui est Dieu ! »",
      ref: "1 Rois 18:30-39",
      exercices: [
        { type: "qcm", q: "Que fait Élie avant de prier ?", choix: ["Il fait verser douze cruches d'eau sur l'autel", "Il allume un petit feu", "Il jeûne trois jours", "Il éloigne le peuple"], bonne: 0 },
        { type: "qcm", q: "Que crie le peuple après le feu ?", choix: ["« C'est l'Éternel qui est Dieu ! »", "« Vive le roi ! »", "« Baal a répondu ! »", "« Sauve-nous, Élie ! »"], bonne: 0 },
        { type: "qcm", q: "Pourquoi douze pierres pour l'autel ?", choix: ["Pour les douze tribus d'Israël", "Pour les douze mois", "Pour les douze prophètes", "Sans raison donnée"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Menacé de mort par Jézabel, Élie s'enfuit au désert et s'assit sous un genêt : « C'est assez ! Prends mon âme. » Un ange le toucha deux fois et lui donna un gâteau cuit et une cruche d'eau : « Lève-toi, mange, car le chemin est trop long pour toi. » Fortifié par cette nourriture, il marcha quarante jours jusqu'à Horeb.",
      ref: "1 Rois 19:1-8",
      exercices: [
        { type: "qcm", q: "Dans quel état Élie fuit-il après le Carmel ?", choix: ["Découragé, il demande à mourir", "Triomphant", "Blessé au combat", "Malade de fièvre"], bonne: 0 },
        { type: "qcm", q: "Comment Dieu le relève-t-il ?", choix: ["Un ange le nourrit et le fait dormir", "Il lui envoie une armée", "Il lui parle en songe", "Il le ramène chez Achab"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de jours marche-t-il jusqu'à Horeb ?", choix: ["Quarante", "Sept", "Trois", "Cent"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "À Horeb, un vent impétueux déchira les montagnes : l'Éternel n'était pas dans le vent. Après le vent, un tremblement de terre : l'Éternel n'y était pas. Après le tremblement, un feu : l'Éternel n'y était pas. Et après le feu, un murmure doux et léger. Quand Élie l'entendit, il s'enveloppa le visage de son manteau.",
      ref: "1 Rois 19:9-18",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Où Élie entend-il enfin l'Éternel ?", choix: ["Dans un murmure doux et léger", "Dans le vent", "Dans le tremblement de terre", "Dans le feu"], bonne: 0 },
        { type: "ordre", consigne: "Remets ce qui passe devant Élie dans l'ordre :", items: ["Un vent impétueux", "Un tremblement de terre", "Un feu", "Un murmure doux et léger"] },
        { type: "qcm", q: "Qui Dieu lui dit-il d'oindre comme prophète à sa place ?", choix: ["Élisée", "Jéhu", "Hazaël", "Michée"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
