"use client";

/**
 * « La Fronde de David » v2 — VUE À LA PREMIÈRE PERSONNE (façon stand de
 * tir) : la fronde est en bas de l'écran, les cibles sont posées en
 * PROFONDEUR sur le chemin (plus c'est loin, plus c'est petit), le VENT
 * dévie la pierre pendant le vol, la puissance du tir décide de la
 * distance atteinte. 30 niveaux, le GÉANT aux niveaux 10, 20 et 30.
 *
 * Écran logique : 360 × 480.
 */

/** Créature qui garde une cible (habillage + points de vie du géant). */
export type FrGuard = "loup" | "lion" | "ours" | "geant";

export type FrTarget = {
  /** Position horizontale 0..1 (0 = gauche, 1 = droite). */
  u: number;
  /** Profondeur 0..1 (0 = tout près, 1 = au fond du chemin). */
  d: number;
  /** Coups nécessaires (le géant en demande 3). */
  hp: number;
  /** Gardien dessiné derrière la cible. */
  guard?: FrGuard;
  /** Déplacement latéral (amplitude en u, vitesse en rad/s). */
  move?: { amp: number; speed: number };
};

export type FrLevel = {
  stones: number;
  /** 3 étoiles si pierres utilisées ≤ par. */
  par: number;
  /** Vent : vitesse max en m/s (0 = pas de vent). Direction aléatoire. */
  wind: number;
  targets: FrTarget[];
};

const T = (u: number, d: number, guard?: FrGuard, hp = 1): FrTarget => ({ u, d, hp, guard });
const TM = (u: number, d: number, amp: number, speed: number, guard?: FrGuard, hp = 1): FrTarget => ({ u, d, hp, guard, move: { amp, speed } });
const GOL = (u: number, d: number): FrTarget => ({ u, d, hp: 3, guard: "geant" });

export const FR_LEVELS: FrLevel[] = [
  // ---------- Chapitre 1 : Le berger de Bethléhem (1-10) ----------
  { stones: 4, par: 1, wind: 0, targets: [T(0.5, 0.25)] },
  { stones: 4, par: 2, wind: 0, targets: [T(0.3, 0.3), T(0.7, 0.3)] },
  { stones: 5, par: 2, wind: 0, targets: [T(0.5, 0.2, "loup"), T(0.5, 0.75)] },
  { stones: 5, par: 3, wind: 0, targets: [T(0.25, 0.3, "loup"), T(0.55, 0.55), T(0.8, 0.35)] },
  { stones: 4, par: 2, wind: 1, targets: [T(0.4, 0.45), T(0.75, 0.7)] },
  { stones: 5, par: 3, wind: 1, targets: [T(0.2, 0.25, "loup"), T(0.5, 0.5, "lion"), T(0.8, 0.25)] },
  { stones: 4, par: 2, wind: 0, targets: [TM(0.5, 0.35, 0.16, 1.1), T(0.5, 0.8)] },
  { stones: 5, par: 3, wind: 1.5, targets: [T(0.3, 0.6, "lion"), T(0.7, 0.6, "ours"), T(0.5, 0.25, "loup")] },
  { stones: 5, par: 3, wind: 1.5, targets: [TM(0.35, 0.45, 0.14, 1.3, "loup"), T(0.72, 0.3), T(0.55, 0.85)] },
  { stones: 6, par: 3, wind: 1, targets: [GOL(0.5, 0.85), T(0.25, 0.35, "loup")] },
  // ---------- Chapitre 2 : Le camp d'Israël (11-20) ----------
  { stones: 5, par: 3, wind: 2, targets: [T(0.3, 0.4, "lion"), T(0.7, 0.55, "ours"), T(0.5, 0.8)] },
  { stones: 5, par: 3, wind: 2, targets: [TM(0.5, 0.55, 0.2, 1.5, "lion"), T(0.2, 0.3, "loup"), T(0.85, 0.35)] },
  { stones: 4, par: 2, wind: 2.5, targets: [T(0.35, 0.75, "ours"), T(0.68, 0.75, "ours")] },
  { stones: 5, par: 3, wind: 1.5, targets: [TM(0.4, 0.3, 0.2, 1.8, "loup"), TM(0.6, 0.6, 0.18, 1.2, "lion"), T(0.5, 0.9)] },
  { stones: 6, par: 3, wind: 2, targets: [T(0.18, 0.5, "lion"), T(0.5, 0.5, "ours"), T(0.82, 0.5, "lion")] },
  { stones: 5, par: 3, wind: 2.5, targets: [TM(0.5, 0.8, 0.22, 1.4, "ours"), T(0.3, 0.35, "loup"), T(0.75, 0.55)] },
  { stones: 4, par: 2, wind: 3, targets: [T(0.4, 0.85, "ours"), TM(0.6, 0.4, 0.2, 1.6, "loup")] },
  { stones: 6, par: 4, wind: 2, targets: [T(0.2, 0.35, "loup"), T(0.45, 0.55, "lion"), T(0.7, 0.75, "ours"), T(0.85, 0.3)] },
  { stones: 5, par: 3, wind: 2.5, targets: [TM(0.35, 0.65, 0.24, 1.7, "lion"), TM(0.68, 0.45, 0.2, 1.3, "loup"), T(0.5, 0.9)] },
  { stones: 6, par: 3, wind: 2, targets: [GOL(0.5, 0.8), TM(0.25, 0.4, 0.16, 1.5, "loup"), T(0.8, 0.55, "lion")] },
  // ---------- Chapitre 3 : Face au géant (21-30) ----------
  { stones: 5, par: 3, wind: 2.5, targets: [T(0.25, 0.6, "ours"), TM(0.6, 0.75, 0.2, 1.8, "lion"), T(0.8, 0.3, "loup")] },
  { stones: 5, par: 3, wind: 3, targets: [TM(0.4, 0.5, 0.26, 2, "lion"), TM(0.65, 0.85, 0.18, 1.4, "ours"), T(0.2, 0.3)] },
  { stones: 6, par: 4, wind: 2.5, targets: [T(0.15, 0.45, "loup"), TM(0.45, 0.6, 0.2, 1.6, "lion"), T(0.72, 0.8, "ours"), TM(0.85, 0.35, 0.12, 2.2)] },
  { stones: 5, par: 3, wind: 2, targets: [GOL(0.6, 0.75), TM(0.3, 0.5, 0.2, 1.8, "ours")] },
  { stones: 6, par: 4, wind: 3, targets: [T(0.25, 0.85, "ours"), T(0.5, 0.65, "lion"), T(0.72, 0.45, "loup"), T(0.88, 0.75, "lion")] },
  { stones: 5, par: 3, wind: 3, targets: [TM(0.5, 0.9, 0.24, 1.6, "ours"), TM(0.3, 0.4, 0.22, 2.1, "loup"), T(0.78, 0.6, "lion")] },
  { stones: 6, par: 4, wind: 2.5, targets: [TM(0.2, 0.55, 0.16, 1.9, "lion"), TM(0.5, 0.75, 0.22, 1.5, "ours"), TM(0.75, 0.4, 0.18, 2.3, "loup"), T(0.9, 0.85)] },
  { stones: 5, par: 3, wind: 3, targets: [GOL(0.35, 0.8), TM(0.72, 0.55, 0.24, 2, "lion")] },
  { stones: 6, par: 4, wind: 3, targets: [TM(0.3, 0.7, 0.26, 2.2, "ours"), TM(0.6, 0.5, 0.24, 1.8, "lion"), TM(0.82, 0.85, 0.14, 1.5, "ours"), T(0.15, 0.35, "loup")] },
  { stones: 7, par: 4, wind: 2.5, targets: [GOL(0.5, 0.85), TM(0.22, 0.5, 0.2, 2, "lion"), TM(0.8, 0.6, 0.2, 1.7, "ours")] },
];

/** Chapitres de l'histoire, affichés dans la sélection de niveaux. */
export const FR_CHAPTERS: { from: number; title: string; verse: string }[] = [
  { from: 0, title: "Le berger de Bethléhem", verse: "« L'Éternel ne regarde pas à ce que l'homme regarde… l'Éternel regarde au cœur. » — 1 Samuel 16:7" },
  { from: 10, title: "Le camp d'Israël", verse: "« Qui est ce Philistin, pour insulter les troupes du Dieu vivant ? » — 1 Samuel 17:26" },
  { from: 20, title: "Face au géant", verse: "« Tu marches contre moi avec l'épée… moi, je marche contre toi au nom de l'Éternel. » — 1 Samuel 17:45" },
];

/* ---------- Progression locale ---------- */

const KEY = "jb.fronde.v1"; // { stars: { [niveau]: 1..3 } }
const XP_KEY = "jb.fronde.xp.v1";

type Store = { stars: Record<string, number> };

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* stockage indisponible */
  }
  return { stars: {} };
}
function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible */
  }
}

export function frondeStars(level: number): number {
  const v = read().stars[String(level)];
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/** Niveaux réussis + étoiles cumulées (pour les badges). */
export function frondeStats(): { done: number; stars: number } {
  const s = read();
  let done = 0;
  let stars = 0;
  for (const v of Object.values(s.stars)) {
    if (Number.isFinite(v) && v > 0) {
      done += 1;
      stars += v;
    }
  }
  return { done, stars };
}

/** Enregistre une réussite ; XP seulement pour les étoiles GAGNÉES en plus. */
export function recordFronde(level: number, stars: number): { xpGained: number } {
  const s = read();
  const key = String(level);
  const prev = Number(s.stars[key]) || 0;
  const next = Math.max(prev, Math.min(3, stars));
  s.stars[key] = next;
  write(s);
  const xp = (next - prev) * 40;
  if (xp > 0) {
    try {
      const cur = Number(localStorage.getItem(XP_KEY)) || 0;
      localStorage.setItem(XP_KEY, String(cur + xp));
    } catch {
      /* */
    }
  }
  return { xpGained: xp };
}

export function getFrondeXp(): number {
  try {
    const v = Number(localStorage.getItem(XP_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}
