/**
 * Types du domaine.
 *
 * Volontairement découplés de la source de données: aujourd'hui les contenus
 * viennent de `content.ts`, demain ils pourront venir d'un CMS ou d'une API
 * consommée à l'identique par le site et l'application mobile.
 */

export type DailyThought = {
  date: string; // ISO
  title: string;
  body: string;
  author: string;
};

export type Verse = {
  reference: string;
  text: string;
  version: string;
};

export type ReadingPlanDay = {
  day: number;
  theme: string;
  passages: string[];
  minutes: number;
};

export type Video = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
  publishedAt: string;
};

export type Reel = {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
};

/** Short YouTube affiché en natif sur le site. */
export type Short = {
  id: string; // ID YouTube (après /shorts/)
  title: string;
  category: string;
};

/** Vidéo longue (prédication) affichée et jouée sur le site. */
export type LongVideo = {
  id: string; // ID YouTube (après watch?v=)
  title: string;
  category: string;
};

export type Testimony = {
  id: string;
  name: string;
  location: string;
  quote: string;
  avatarColor: string;
};

export type Product = {
  id: string;
  title: string;
  type: string;
  price: string;
  cover: string; // dégradé tailwind (fallback si pas d'image)
  image?: string; // photo du produit (uploadable au CMS)
  badge?: string;
  available?: boolean; // disponible à la vente?
};

export type SupportTier = {
  id: string;
  name: string;
  amount?: string;
  cadence?: string;
  description: string;
  perks?: string[];
  featured?: boolean;
};

export type Mission = {
  active: boolean;
  title: string;
  period: string;
  location: string;
  objectiveEur: number;
  raisedEur: number;
};


export type AgendaEvent = {
  type: "live" | "presentiel" | "annonce";
  title: string;
  date?: string; // YYYY-MM-DD (agenda), facultatif pour les annonces
  time?: string; // ex. "20:30"
  location?: string; // ex. "En ligne · TikTok" ou "Pau (64)"
  description?: string;
  link?: string; // URL externe ou chemin interne (/boutique)
  linkLabel?: string;
  badge?: string; // ex. "Bientôt", "Début novembre"
};

export type ThemePlanDay = {
  day: number;
  title: string;
  verses: string[];
  meditation: string;
};

export type ThemePlan = {
  slug: string;
  title: string;
  subtitle: string;
  days: ThemePlanDay[];
  /** Image de couverture optionnelle (vignette catalogue). Sinon dégradé. */
  cover?: string;
  /** Auteur affiché sur la vignette. Défaut: Pasteur Jack Brunet. */
  author?: string;
  /** Synopsis « façon Netflix » (2-3 phrases) affiché sur la vue du plan. */
  summary?: string;
  /** Fiche auteur (au clic sur le nom de l'auteur). Repli sur l'auteur par défaut. */
  authorPhoto?: string;
  authorRole?: string;
  authorBio?: string;
  authorInstagram?: string;
  authorResources?: { label: string; url: string }[];
};

export type Devotion = {
  theme: string;
  verseText: string;
  verseReference: string;
  punchline: string;
  meditation: string;
  declarationText: string;
  declarationReference: string;
  questions: string[];
};
