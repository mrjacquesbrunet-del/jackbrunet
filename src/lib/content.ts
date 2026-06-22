/**
 * Couche de contenu (mock).
 *
 * Chaque fonction est asynchrone-compatible dans l'esprit : remplacer le corps
 * par un appel CMS/API sera trivial sans toucher aux composants.
 */

import type {
  DailyThought,
  Product,
  Reel,
  ReadingPlanDay,
  SupportTier,
  Testimony,
  Verse,
  Video,
} from "./types";

/** Sélection déterministe basée sur le jour de l'année (rotation quotidienne). */
function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

const thoughts: DailyThought[] = [
  {
    date: "",
    title: "Tu es vu, tu es aimé",
    body: "Avant même que tu ouvres les yeux ce matin, Dieu pensait déjà à toi. Ta valeur ne dépend pas de ta performance d'hier ni de tes peurs de demain. Aujourd'hui, marche en sachant que tu es profondément aimé.",
    author: "Pasteur Jacques Brunet",
  },
  {
    date: "",
    title: "La paix avant le combat",
    body: "Jésus dormait dans la tempête parce que la paix n'était pas autour de Lui, elle était en Lui. Demande-Lui aujourd'hui cette paix qui ne dépend pas des circonstances.",
    author: "Pasteur Jacques Brunet",
  },
  {
    date: "",
    title: "Un pas suffit",
    body: "Dieu ne te demande pas de voir tout le chemin. Il te demande le pas d'aujourd'hui. Sa fidélité s'occupe du reste.",
    author: "Pasteur Jacques Brunet",
  },
];

const verses: Verse[] = [
  {
    reference: "Lamentations 3.22-23",
    text: "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin. Grande est ta fidélité !",
    version: "LSG",
  },
  {
    reference: "Psaume 16.11",
    text: "Tu me feras connaître le sentier de la vie ; il y a d'abondantes joies devant ta face, des délices éternelles à ta droite.",
    version: "LSG",
  },
  {
    reference: "Ésaïe 60.1",
    text: "Lève-toi, sois éclairée, car ta lumière arrive, et la gloire de l'Éternel se lève sur toi.",
    version: "LSG",
  },
];

const readingPlan: ReadingPlanDay[] = [
  { day: 1, theme: "La lumière qui se lève", passages: ["Jean 1.1-18"], minutes: 6 },
  { day: 2, theme: "Une nouvelle naissance", passages: ["Jean 3.1-21"], minutes: 7 },
  { day: 3, theme: "L'eau vive", passages: ["Jean 4.1-30"], minutes: 8 },
  { day: 4, theme: "Le pain de vie", passages: ["Jean 6.22-40"], minutes: 7 },
  { day: 5, theme: "La liberté véritable", passages: ["Jean 8.31-47"], minutes: 6 },
  { day: 6, theme: "Le bon berger", passages: ["Jean 10.1-21"], minutes: 6 },
  { day: 7, theme: "La résurrection et la vie", passages: ["Jean 11.1-44"], minutes: 9 },
];

const videos: Video[] = [
  {
    id: "v1",
    title: "Comment retrouver la paix quand tout s'effondre",
    duration: "18:42",
    thumbnail: "from-spirit-600 via-spirit-500 to-glow-400",
    category: "Enseignement",
    publishedAt: "Il y a 2 jours",
  },
  {
    id: "v2",
    title: "La prière qui change tout (et que personne ne fait)",
    duration: "24:10",
    thumbnail: "from-dawn-500 via-dawn-400 to-spirit-500",
    category: "Prière",
    publishedAt: "Il y a 5 jours",
  },
  {
    id: "v3",
    title: "Pourquoi Dieu semble parfois silencieux",
    duration: "21:05",
    thumbnail: "from-night-600 via-spirit-600 to-glow-500",
    category: "Foi",
    publishedAt: "Il y a 1 semaine",
  },
  {
    id: "v4",
    title: "Reprends courage : ton histoire n'est pas finie",
    duration: "15:33",
    thumbnail: "from-glow-500 via-spirit-500 to-dawn-400",
    category: "Encouragement",
    publishedAt: "Il y a 2 semaines",
  },
];

const reels: Reel[] = [
  { id: "r1", title: "30 secondes pour changer ta journée", thumbnail: "from-dawn-400 to-spirit-600", views: "128 k" },
  { id: "r2", title: "Ce verset va te marquer", thumbnail: "from-spirit-500 to-glow-400", views: "94 k" },
  { id: "r3", title: "Arrête de te condamner", thumbnail: "from-glow-400 to-dawn-500", views: "212 k" },
  { id: "r4", title: "Dieu n'a pas fini avec toi", thumbnail: "from-spirit-600 to-night-700", views: "76 k" },
  { id: "r5", title: "La phrase qui m'a libéré", thumbnail: "from-dawn-500 to-glow-500", views: "143 k" },
];

const testimonies: Testimony[] = [
  {
    id: "t1",
    name: "Sarah M.",
    location: "Lyon",
    quote:
      "Je commençais mes journées dans l'anxiété. La pensée du jour est devenue mon premier réflexe le matin. En trois semaines, ma paix a changé.",
    avatarColor: "from-dawn-400 to-dawn-600",
  },
  {
    id: "t2",
    name: "David K.",
    location: "Montréal",
    quote:
      "Le plan de lecture m'a fait ouvrir la Bible tous les jours pour la première fois de ma vie. Je ne pensais pas que c'était possible pour moi.",
    avatarColor: "from-spirit-400 to-spirit-600",
  },
  {
    id: "t3",
    name: "Esther A.",
    location: "Abidjan",
    quote:
      "J'ai déposé une requête de prière un soir où je n'en pouvais plus. Savoir que d'autres priaient pour moi m'a redonné de la force.",
    avatarColor: "from-glow-400 to-glow-500",
  },
];

const products: Product[] = [
  {
    id: "p1",
    title: "Chaque matin, une promesse",
    type: "Livre · 90 méditations",
    price: "19 €",
    cover: "from-dawn-400 via-dawn-500 to-spirit-600",
    badge: "Best-seller",
  },
  {
    id: "p2",
    title: "Journal de prière guidé",
    type: "Carnet · 365 jours",
    price: "24 €",
    cover: "from-spirit-500 via-spirit-600 to-night-700",
  },
  {
    id: "p3",
    title: "Parcours « Renaître »",
    type: "Formation vidéo",
    price: "49 €",
    cover: "from-glow-400 via-glow-500 to-spirit-500",
    badge: "Nouveau",
  },
];

const supportTiers: SupportTier[] = [
  {
    id: "s1",
    name: "Ami",
    amount: "5 €",
    cadence: "/ mois",
    description: "Le premier pas pour faire avancer la mission.",
    perks: ["Newsletter partenaires", "Carte de prière mensuelle"],
  },
  {
    id: "s2",
    name: "Partenaire",
    amount: "20 €",
    cadence: "/ mois",
    description: "Tu portes le ministère et ses contenus quotidiens.",
    perks: [
      "Tous les avantages Ami",
      "Accès anticipé aux vidéos",
      "Étude approfondie mensuelle",
    ],
    featured: true,
  },
  {
    id: "s3",
    name: "Bâtisseur",
    amount: "50 €",
    cadence: "/ mois",
    description: "Tu construis l'avenir : nouveaux contenus et application mobile.",
    perks: [
      "Tous les avantages Partenaire",
      "Rencontre en ligne trimestrielle",
      "Ton nom dans le mur des bâtisseurs",
    ],
  },
];

const impactStats = [
  { value: "120 000+", label: "personnes touchées chaque mois" },
  { value: "365", label: "contenus publiés par an" },
  { value: "42", label: "pays rejoints" },
  { value: "100 %", label: "des dons au service de la mission" },
];

const fundUsage = [
  { label: "Création de contenus (vidéos, plans, méditations)", percent: 45 },
  { label: "Développement de l'application mobile", percent: 25 },
  { label: "Diffusion et accompagnement", percent: 20 },
  { label: "Fonctionnement du ministère", percent: 10 },
];

// API publique de la couche contenu ------------------------------------------

export function getDailyThought(): DailyThought {
  return thoughts[dayOfYear() % thoughts.length];
}

export function getDailyVerse(): Verse {
  return verses[dayOfYear() % verses.length];
}

export function getTodayPlanDay(): ReadingPlanDay {
  return readingPlan[dayOfYear() % readingPlan.length];
}

export function getReadingPlan(): ReadingPlanDay[] {
  return readingPlan;
}

export function getLatestVideos(): Video[] {
  return videos;
}

export function getReels(): Reel[] {
  return reels;
}

export function getTestimonies(): Testimony[] {
  return testimonies;
}

export function getProducts(): Product[] {
  return products;
}

export function getSupportTiers(): SupportTier[] {
  return supportTiers;
}

export function getImpactStats() {
  return impactStats;
}

export function getFundUsage() {
  return fundUsage;
}
