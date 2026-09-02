import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 2 — Noé (Genèse 6-9). 8 étapes. */
export const CHAPITRE_NOE: CheminChapitre = {
  id: 2,
  nom: "Noé",
  livre: "Genèse 6-9",
  accent: "#38BDF8",
  decor: "/img/chemin/decor-2.jpg",
  sentier: [{ x: 43.6, y: 93 }, { x: 38.6, y: 84.4 }, { x: 56.4, y: 75.9 }, { x: 58, y: 67.3 }, { x: 50.5, y: 58.7 }, { x: 44.4, y: 50.1 }, { x: 56.2, y: 41.6 }, { x: 48.7, y: 33 }],
  fallback: ["#0c2f4a", "#123a5c", "#081f33"],
  carte: {
    id: "noe",
    nom: "Noé",
    titre: "Le bâtisseur de l'arche",
    rarete: "legendaire",
    image: "/img/chemin/cartes/noe.jpg",
  },
  etapes: [
    {
      recit:
        "La terre était corrompue et remplie de violence. Mais Noé trouva grâce aux yeux de l'Éternel : c'était un homme juste et intègre, qui marchait avec Dieu.",
      ref: "Genèse 6:5-9",
      exercices: [
        { type: "qcm", q: "Comment la Bible décrit-elle Noé ?", choix: ["Un homme juste et intègre, qui marchait avec Dieu", "Un roi puissant", "Un prophète errant", "Un charpentier du désert"], bonne: 0 },
        { type: "trou", texte: "Noé trouva ___ aux yeux de l'Éternel.", reponse: "grâce", leurres: ["peur", "gloire", "repos"] },
        { type: "vf", q: "Dieu regarde la terre et voit que la méchanceté des hommes est grande.", vrai: true },
      ],
    },
    {
      recit:
        "Dieu dit à Noé : « Fais-toi une arche de bois de gopher. » Trois cents coudées de long, cinquante de large, trente de haut ; trois étages, une porte sur le côté. Noé fit tout ce que Dieu lui avait ordonné.",
      ref: "Genèse 6:14-22",
      exercices: [
        { type: "qcm", q: "Quelles sont les dimensions de l'arche ?", choix: ["300 coudées de long, 50 de large, 30 de haut", "100 sur 100 sur 100", "500 de long et 20 de large", "Elles ne sont pas données"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Combien d'étages compte l'arche ?", choix: ["Trois", "Un", "Deux", "Sept"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Noé fit tout ce que Dieu lui avait ___.", reponse: "ordonné", leurres: ["promis", "montré", "raconté"] },
      ],
    },
    {
      recit:
        "Les animaux vinrent vers Noé : deux par deux, mâle et femelle — et sept paires des animaux purs et des oiseaux. Noé, sa femme, ses trois fils et leurs femmes entrèrent dans l'arche, et l'Éternel ferma la porte sur lui.",
      ref: "Genèse 7:1-16",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Je bâtis un vaisseau alors qu'il n'a jamais plu ainsi.", "J'ai trois fils : Sem, Cham et Japhet.", "Je fais entrer les animaux deux par deux.", "L'Éternel ferme lui-même la porte derrière moi."], reponse: "Noé", leurres: ["Abraham", "Moïse", "Josué"] },
        { type: "qcm", q: "Combien de personnes entrent dans l'arche ?", choix: ["Huit", "Deux", "Douze", "Quarante"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Combien de couples d'animaux purs Noé doit-il prendre ?", choix: ["Sept", "Deux", "Trois", "Dix"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "Les écluses des cieux s'ouvrirent : la pluie tomba quarante jours et quarante nuits. Les eaux grossirent et couvrirent même les hautes montagnes. Mais Dieu se souvint de Noé : les eaux dominèrent la terre cent cinquante jours, puis commencèrent à baisser.",
      ref: "Genèse 7:17-8:3",
      exercices: [
        { type: "qcm", q: "Combien de jours et de nuits la pluie tombe-t-elle ?", choix: ["Quarante", "Sept", "Cent cinquante", "Trois cents"], bonne: 0 },
        { type: "qcm", q: "Combien de temps les eaux restent-elles au plus haut sur la terre ?", choix: ["Cent cinquante jours", "Quarante jours", "Un an entier", "Sept jours"], bonne: 0, niveau: "expert" },
        { type: "vf", q: "Les plus hautes montagnes ont été recouvertes par les eaux.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'arche s'arrêta sur les montagnes d'Ararat. Noé lâcha un corbeau, puis une colombe : elle revint d'abord sans rien, puis rapporta une feuille d'olivier toute fraîche — la terre renaissait. La troisième fois, elle ne revint plus.",
      ref: "Genèse 8:4-12",
      exercices: [
        { type: "ordre", consigne: "Remets ces moments dans l'ordre :", items: ["L'arche se pose sur les monts d'Ararat", "Noé lâche le corbeau", "La colombe revient avec une feuille d'olivier", "La colombe ne revient plus"] },
        { type: "qcm", q: "Quel oiseau Noé envoie-t-il en premier ?", choix: ["Le corbeau", "La colombe", "L'aigle", "L'hirondelle"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Sur quelles montagnes l'arche s'arrête-t-elle ?", choix: ["Les monts d'Ararat", "Le mont Sinaï", "Le mont Carmel", "Le mont des Oliviers"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dieu dit : « Sors de l'arche ! » Noé sortit avec les siens et tous les animaux. Il bâtit un autel à l'Éternel et offrit un sacrifice. L'Éternel dit en son cœur : « Tant que la terre subsistera, les semailles et la moisson, le froid et la chaleur, l'été et l'hiver, le jour et la nuit ne cesseront point. »",
      ref: "Genèse 8:15-22",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Genèse 8:22", texte: "Les semailles et la moisson le froid et la chaleur ne cesseront point", niveau: "expert" },
        { type: "qcm", q: "Que fait Noé en sortant de l'arche ?", choix: ["Il bâtit un autel à l'Éternel", "Il plante aussitôt une vigne", "Il compte les animaux", "Il repart en mer"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Dieu promet de ne plus maudire la terre à cause de l'homme.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Dieu établit son alliance avec Noé et toute la création : « Je mets mon arc dans la nue : il sera le signe de l'alliance entre moi et la terre. Les eaux ne deviendront plus un déluge pour détruire toute chair. »",
      ref: "Genèse 9:8-17",
      exercices: [
        { type: "qcm", q: "Quel signe Dieu donne-t-il de son alliance ?", choix: ["L'arc-en-ciel dans la nuée", "Une étoile", "Une colombe", "Un feu sur la montagne"], bonne: 0 },
        { type: "trou", texte: "« Les eaux ne deviendront plus un ___ pour détruire toute chair. »", reponse: "déluge", leurres: ["torrent", "orage", "abîme"] },
        { type: "qcm", q: "Avec qui Dieu conclut-il cette alliance ?", choix: ["Avec Noé, sa descendance et tout être vivant", "Avec Noé seul", "Avec les hommes seulement", "Avec les oiseaux seulement"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'histoire de Noé nous apprend qu'un seul homme qui marche avec Dieu peut changer le cours du monde. Dieu voit, Dieu avertit, Dieu sauve — et ses promesses tiennent encore aujourd'hui, chaque fois qu'un arc-en-ciel traverse le ciel.",
      ref: "Genèse 6-9",
      exercices: [
        { type: "qui", indices: ["Je porte un nom qui annonce une consolation.", "Je suis fils de Lémec.", "J'ai six cents ans quand le déluge arrive.", "Je plante une vigne après le déluge."], reponse: "Noé", leurres: ["Sem", "Lémec", "Hénoc"], niveau: "expert" },
        { type: "ordre", consigne: "Remets toute l'histoire dans l'ordre :", items: ["Dieu voit la méchanceté des hommes", "Noé bâtit l'arche", "Le déluge couvre la terre", "L'arche se pose sur l'Ararat", "L'arc-en-ciel scelle l'alliance"] },
        { type: "qcm", q: "Quel âge a Noé lorsque le déluge vient sur la terre ?", choix: ["Six cents ans", "Cent vingt ans", "Neuf cents ans", "Quarante ans"], bonne: 0, niveau: "expert" },
      ],
    },
  ],
};
