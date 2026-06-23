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
  LongVideo,
  Product,
  ReadingPlanDay,
  Short,
  SupportTier,
  Testimony,
  Verse,
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
import videosData from "../../content/videos.json";
import videosGenerated from "../../content/videos.generated.json";
import homeData from "../../content/home.json";
import aboutData from "../../content/about.json";

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

/**
 * Vidéos longues (prédications). Fusionne l'import auto (CI) et le CMS.
 */
export function getLongVideos(): LongVideo[] {
  const manual = (videosData.items as LongVideo[]) ?? [];
  const generated = (videosGenerated.items as LongVideo[]) ?? [];
  const byId = new Map<string, LongVideo>();
  for (const v of generated) if (v?.id) byId.set(v.id, v);
  for (const v of manual) if (v?.id) byId.set(v.id, { ...byId.get(v.id), ...v });
  return Array.from(byId.values()).filter((v) => v.id);
}

/** Normalise un texte pour comparaison (minuscules, sans accents). */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

const STOPWORDS = new Set([
  "le", "la", "les", "des", "une", "un", "de", "du", "et", "a", "au", "aux",
  "pour", "votre", "votre", "comment", "ton", "ta", "tes", "the", "c", "est",
  "ce", "cette", "avec", "sur", "dans",
]);

/**
 * Sélectionne les prédications mises en avant sur l'accueil, à partir des
 * titres listés dans content/home.json. Correspondance souple (par mots-clés)
 * pour rester robuste si le titre YouTube diffère un peu.
 */
export function getFeaturedPredications(): LongVideo[] {
  const longs = getLongVideos();
  const queries = (homeData.featuredPredications as string[]) ?? [];
  const used = new Set<string>();
  const result: LongVideo[] = [];

  for (const q of queries) {
    const qTokens = normalize(q)
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
    let best: { v: LongVideo; score: number } | null = null;
    for (const v of longs) {
      if (used.has(v.id)) continue;
      const title = normalize(v.title);
      const score = qTokens.reduce((n, t) => (title.includes(t) ? n + 1 : n), 0);
      if (!best || score > best.score) best = { v, score };
    }
    if (best && best.score >= 2) {
      used.add(best.v.id);
      result.push(best.v);
    }
  }

  // Repli : si rien ne correspond (ex. import non encore configuré), on prend
  // simplement les plus récentes pour ne pas laisser la section vide.
  if (result.length === 0) return longs.slice(0, 3);
  return result;
}

/** Vidéos longues regroupées par thème (catalogue type Netflix). */
export function getLongVideoCategories(): { category: string; videos: LongVideo[] }[] {
  const groups = new Map<string, LongVideo[]>();
  for (const v of getLongVideos()) {
    const cat = v.category?.trim() || classifyByTitle(v.title);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(v);
  }
  const rank = (c: string) => {
    const i = CATEGORY_ORDER.indexOf(c);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return Array.from(groups.entries())
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
    .map(([category, list]) => ({ category, videos: list }));
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
    available: false,
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

/**
 * Auto-classement des Shorts par mots-clés dans le titre.
 * Les règles sont testées dans l'ordre (les plus spécifiques d'abord) ;
 * « Foi » est volontairement en dernier car très générique.
 */
const CATEGORY_RULES: [string, RegExp][] = [
  ["Prière", /(pri[èe]re|prier|prions|interc[ée]|sup-?plication)/i],
  ["Témoignage", /(t[ée]moign|gu[ée]ri|d[ée]livr|transform[ée]|miracle|exauc)/i],
  ["Encouragement", /(encourage|courage|espoir|esp[ée]rance|force|tiens? bon|ne l[âa]che|rel[èe]ve|motivation|fatigue|d[ée]courag)/i],
  ["Enseignement", /(enseign|[ée]tude|comprendre|explication|que dit la bible|doctrine|m[ée]ditation|le[çc]on|apprendre|d[ée]cryptage)/i],
  ["Foi", /(foi|cro(is|ire|yant)|confiance|j[ée]sus|christ|dieu|saint[- ]?esprit|[ée]vangile|salut|gr[âa]ce|bible|seigneur|royaume|p[ée]ch[ée])/i],
];

/** Ordre d'affichage des rayons (catégorie type « Netflix »). */
const CATEGORY_ORDER = [
  "Foi",
  "Prière",
  "Encouragement",
  "Témoignage",
  "Enseignement",
  "À découvrir",
  "Tous les Shorts",
];

function classifyByTitle(title: string): string {
  for (const [cat, re] of CATEGORY_RULES) if (re.test(title)) return cat;
  return "À découvrir";
}

/** Shorts regroupés par catégorie (pour le catalogue type Netflix). */
export function getShortCategories(): { category: string; shorts: Short[] }[] {
  const shorts = getShorts();
  const groups = new Map<string, Short[]>();
  for (const s of shorts) {
    // Catégorie explicite (CMS) sinon auto-classement par le titre.
    const cat = s.category?.trim() || classifyByTitle(s.title);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(s);
  }
  const rank = (c: string) => {
    const i = CATEGORY_ORDER.indexOf(c);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return Array.from(groups.entries())
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
    .map(([category, list]) => ({ category, shorts: list }));
}

/** Le Short le plus récent (vidéo du jour). */
export function getLatestShort(): Short | null {
  return getShorts()[0] ?? null;
}

/** Contenu de la section « Qui suis-je ». */
export function getAbout() {
  return aboutData;
}

export function getImpactStats() {
  return impactData.stats;
}

export function getFundUsage() {
  return impactData.fundUsage;
}
