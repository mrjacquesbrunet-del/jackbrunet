/**
 * Types du domaine.
 *
 * Volontairement découplés de la source de données : aujourd'hui les contenus
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
  cover: string; // tailwind gradient classes
  badge?: string;
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
