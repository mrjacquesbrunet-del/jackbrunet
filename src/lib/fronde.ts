"use client";

/**
 * « La Fronde de David » — PROGRESSION locale (étoiles par niveau, XP,
 * meilleur score). Le moteur du jeu vit dans src/lib/fronde-engine/ ;
 * les niveaux sont des données dans fronde-engine/levels.ts.
 */

const KEY = "jb.fronde.v1"; // { stars: { [niveau]: 1..3 } }
const XP_KEY = "jb.fronde.xp.v1";
const HS_KEY = "jb.fronde.highscore.v1";

type Store = { stars: Record<string, number> };

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Store;
      if (s && typeof s === "object" && s.stars && typeof s.stars === "object") return s;
    }
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

/** Meilleur score toutes parties confondues. Renvoie true si record battu. */
export function updateFrondeHighScore(score: number): boolean {
  try {
    const prev = Number(localStorage.getItem(HS_KEY)) || 0;
    if (score > prev) {
      localStorage.setItem(HS_KEY, String(score));
      return true;
    }
  } catch {
    /* */
  }
  return false;
}

export function getFrondeHighScore(): number {
  try {
    const v = Number(localStorage.getItem(HS_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}
