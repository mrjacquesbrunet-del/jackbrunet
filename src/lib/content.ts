/**
 * Couche de contenu.
 *
 * Les textes éditables vivent dans des fichiers JSON (`/content/*.json`),
 * modifiables sans coder via l'espace d'administration (Pages CMS).
 * Les éléments purement visuels (dégradés de couleurs) sont ajoutés ici,
 * pour que l'édition reste simple côté texte.
 */

import type {
  DailyThought,
  Product,
  ReadingPlanDay,
  Short,
  SupportTier,
  Testimony,
  Verse,
  Video,
} from "./types";

import thoughtsData from "../../content/thoughts.json";
import versesData from "../../content/verses.json";
import readingPlanData from "../../content/reading-plan.json";
import testimoniesData from "../../content/testimonies.json";
import productsData from "../../content/products.json";
import supportTiersData from "../../content/support-tiers.json";
import impactData from "../../content/impact.json";
import shortsData from "../../content/shorts.json";
import shortsGenerated from "../../content/shorts.generated.json";

/** Sélection déterministe basée sur le jour de l'année (rotation quotidienne). */
function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

// Palettes appliquées en code (pour ne pas avoir à éditer des couleurs) -------

const avatarColors = [
  "from-dawn-400 to-dawn-600",
  "from-spirit-400 to-spirit-600",
  "from-glow-400 to-glow-500",
  "from-dawn-300 to-spirit-500",
];

const productCovers = [
  "from-dawn-400 via-dawn-500 to-spirit-600",
  "from-spirit-500 via-spirit-600 to-night-700",
  "from-glow-400 via-glow-500 to-spirit-500",
  "from-dawn-300 via-spirit-500 to-night-700",
];

// Vidéos longues : vignettes de démonstration (les liens pointent vers YouTube).
const videos: Video[] = [
  {
    id: "v1",
    title: "Comment retrouver la paix quand tout s'effondre",
    duration: "18:42",
    thumbnail: "from-spirit-600 via-spirit-500 to-glow-400",
    category: "Enseignement",
    publishedAt: "Récent",
  },
  {
    id: "v2",
    title: "La prière qui change tout",
    duration: "24:10",
    thumbnail: "from-dawn-500 via-dawn-400 to-spirit-500",
    category: "Prière",
    publishedAt: "Récent",
  },
  {
    id: "v3",
    title: "Pourquoi Dieu semble parfois silencieux",
    duration: "21:05",
    thumbnail: "from-night-600 via-spirit-600 to-glow-500",
    category: "Foi",
    publishedAt: "Récent",
  },
  {
    id: "v4",
    title: "Reprends courage : ton histoire n'est pas finie",
    duration: "15:33",
    thumbnail: "from-glow-500 via-spirit-500 to-dawn-400",
    category: "Encouragement",
    publishedAt: "Récent",
  },
];

// API publique de la couche contenu ------------------------------------------

export function getDailyThought(): DailyThought {
  const items = thoughtsData.items as Omit<DailyThought, "date">[];
  return { date: "", ...items[dayOfYear() % items.length] };
}

export function getDailyVerse(): Verse {
  const items = versesData.items as Verse[];
  return items[dayOfYear() % items.length];
}

export function getReadingPlan(): ReadingPlanDay[] {
  return readingPlanData.items as ReadingPlanDay[];
}

export function getTodayPlanDay(): ReadingPlanDay {
  const items = getReadingPlan();
  return items[dayOfYear() % items.length];
}

export function getLatestVideos(): Video[] {
  return videos;
}

export function getTestimonies(): Testimony[] {
  return (testimoniesData.items as Omit<Testimony, "id" | "avatarColor">[]).map(
    (t, i) => ({
      id: `t${i + 1}`,
      avatarColor: avatarColors[i % avatarColors.length],
      ...t,
    }),
  );
}

export function getProducts(): Product[] {
  return (productsData.items as Omit<Product, "id" | "cover">[]).map((p, i) => ({
    id: `p${i + 1}`,
    cover: productCovers[i % productCovers.length],
    ...p,
  }));
}

export function getSupportTiers(): SupportTier[] {
  return (supportTiersData.items as Omit<SupportTier, "id">[]).map((t, i) => ({
    id: `s${i + 1}`,
    ...t,
  }));
}

/**
 * Shorts YouTube.
 * Fusionne la liste générée automatiquement (via l'API, en CI) et la liste
 * manuelle (CMS). En cas d'ID en double, l'entrée manuelle prime (titre/catégorie).
 */
export function getShorts(): Short[] {
  const manual = (shortsData.items as Short[]) ?? [];
  const generated = (shortsGenerated.items as Short[]) ?? [];
  const byId = new Map<string, Short>();
  for (const s of generated) if (s?.id) byId.set(s.id, s);
  for (const s of manual) if (s?.id) byId.set(s.id, { ...byId.get(s.id), ...s });
  return Array.from(byId.values()).filter((s) => s.id);
}

/** Shorts regroupés par catégorie (pour le catalogue type Netflix). */
export function getShortCategories(): { category: string; shorts: Short[] }[] {
  const shorts = getShorts();
  const order: string[] = [];
  const groups = new Map<string, Short[]>();
  for (const s of shorts) {
    const cat = s.category?.trim() || "Tous les Shorts";
    if (!groups.has(cat)) {
      groups.set(cat, []);
      order.push(cat);
    }
    groups.get(cat)!.push(s);
  }
  return order.map((category) => ({ category, shorts: groups.get(category)! }));
}

export function getImpactStats() {
  return impactData.stats;
}

export function getFundUsage() {
  return impactData.fundUsage;
}
