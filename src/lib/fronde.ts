"use client";

/**
 * « La Fronde de David » — jeu d'adresse : on tend la fronde au doigt,
 * la pierre suit une vraie trajectoire (gravité, rebonds) et doit briser
 * toutes les cibles. 30 niveaux, Goliath aux niveaux 10, 20 et 30.
 *
 * Monde logique : 360 × 500 (mis à l'échelle sur l'écran).
 */

export type FrTargetType = "jarre" | "bouclier" | "goliath";
export type FrTarget = { x: number; y: number; r: number; type: FrTargetType; hp: number };
export type FrObstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Oscillation verticale (bouclier de Goliath, plateformes mobiles). */
  osc?: { amp: number; speed: number };
};
export type FrLevel = {
  stones: number;
  /** 3 étoiles si pierres utilisées ≤ par. */
  par: number;
  targets: FrTarget[];
  obstacles: FrObstacle[];
};

const J = (x: number, y: number): FrTarget => ({ x, y, r: 13, type: "jarre", hp: 1 });
const B = (x: number, y: number): FrTarget => ({ x, y, r: 16, type: "bouclier", hp: 2 });
const G = (x: number, y: number): FrTarget => ({ x, y, r: 30, type: "goliath", hp: 3 });
const O = (x: number, y: number, w: number, h: number): FrObstacle => ({ x, y, w, h });
const M = (x: number, y: number, w: number, h: number, amp: number, speed: number): FrObstacle => ({ x, y, w, h, osc: { amp, speed } });

/** Sol logique (les pierres roulent dessus). */
export const FR_GROUND = 462;

export const FR_LEVELS: FrLevel[] = [
  // ---------- Chapitre 1 : Le berger de Bethléhem (1-10) ----------
  { stones: 4, par: 1, targets: [J(280, 440)], obstacles: [] },
  { stones: 4, par: 2, targets: [J(240, 440), J(320, 440)], obstacles: [] },
  { stones: 5, par: 2, targets: [J(260, 300), J(320, 440)], obstacles: [O(240, 320, 100, 12)] },
  { stones: 5, par: 3, targets: [J(220, 440), J(280, 300), J(335, 160)], obstacles: [O(255, 320, 110, 12), O(300, 180, 70, 12)] },
  { stones: 4, par: 2, targets: [B(300, 440), J(200, 200)], obstacles: [] },
  { stones: 5, par: 3, targets: [J(200, 440), J(340, 440), B(270, 260)], obstacles: [O(240, 282, 60, 12)] },
  { stones: 4, par: 2, targets: [J(320, 380), J(320, 240)], obstacles: [O(230, 120, 14, 260)] },
  { stones: 5, par: 3, targets: [B(250, 440), B(330, 300), J(180, 160)], obstacles: [O(300, 322, 70, 12)] },
  { stones: 5, par: 3, targets: [J(300, 440), J(300, 320), J(300, 200)], obstacles: [O(250, 340, 100, 10), O(250, 220, 100, 10)] },
  { stones: 6, par: 3, targets: [G(300, 420)], obstacles: [M(250, 330, 12, 90, 55, 1.6)] },
  // ---------- Chapitre 2 : Le camp d'Israël (11-20) ----------
  { stones: 5, par: 3, targets: [J(190, 440), B(280, 440), J(345, 260)], obstacles: [O(310, 282, 60, 12)] },
  { stones: 5, par: 3, targets: [B(320, 440), J(240, 240), J(340, 120)], obstacles: [O(200, 262, 90, 12), O(300, 142, 70, 12)] },
  { stones: 4, par: 2, targets: [J(330, 430), J(200, 430)], obstacles: [O(258, 300, 14, 162), M(160, 120, 90, 12, 70, 1.2)] },
  { stones: 5, par: 3, targets: [B(230, 440), B(340, 380), J(290, 160)], obstacles: [O(250, 182, 80, 12), O(300, 402, 14, 60)] },
  { stones: 6, par: 3, targets: [J(180, 300), J(260, 300), J(340, 300)], obstacles: [O(150, 322, 220, 10), M(230, 120, 80, 12, 60, 1.8)] },
  { stones: 5, par: 3, targets: [B(300, 440), J(300, 100), B(180, 250)], obstacles: [O(268, 120, 70, 12), O(150, 272, 60, 12)] },
  { stones: 4, par: 2, targets: [J(345, 440), J(345, 180)], obstacles: [O(300, 240, 14, 222), O(310, 200, 60, 12)] },
  { stones: 6, par: 4, targets: [J(200, 440), J(270, 440), J(340, 440), B(270, 240)], obstacles: [O(240, 262, 60, 12), M(180, 300, 90, 12, 50, 1.4)] },
  { stones: 5, par: 3, targets: [B(330, 420), B(220, 280), J(330, 140)], obstacles: [O(180, 302, 80, 12), O(290, 162, 80, 12)] },
  { stones: 6, par: 3, targets: [G(310, 410), J(190, 200)], obstacles: [M(255, 320, 12, 95, 60, 2.0), O(150, 222, 80, 12)] },
  // ---------- Chapitre 3 : Face au géant (21-30) ----------
  { stones: 5, par: 3, targets: [J(230, 440), B(320, 350), J(180, 200)], obstacles: [O(280, 372, 80, 12), O(140, 222, 80, 12), O(262, 200, 14, 120)] },
  { stones: 5, par: 3, targets: [B(340, 440), B(340, 240), J(230, 120)], obstacles: [O(296, 262, 88, 12), O(190, 142, 80, 12), M(250, 340, 12, 80, 40, 1.6)] },
  { stones: 6, par: 4, targets: [J(200, 440), J(280, 380), J(340, 300), B(250, 160)], obstacles: [O(240, 402, 12, 60), O(305, 322, 12, 70), O(210, 182, 80, 12)] },
  { stones: 5, par: 3, targets: [B(200, 440), G(320, 400)], obstacles: [M(268, 300, 12, 110, 60, 2.2)] },
  { stones: 6, par: 4, targets: [J(170, 300), J(250, 240), J(330, 180), B(330, 440)], obstacles: [O(140, 322, 60, 10), O(220, 262, 60, 10), O(300, 202, 60, 10)] },
  { stones: 5, par: 3, targets: [B(260, 440), B(260, 200), J(345, 320)], obstacles: [O(300, 342, 90, 12), O(220, 222, 80, 12), M(310, 100, 70, 12, 60, 1.5)] },
  { stones: 6, par: 4, targets: [J(190, 440), B(270, 340), B(340, 220), J(240, 120)], obstacles: [O(235, 362, 70, 12), O(300, 242, 80, 12), O(205, 142, 70, 12)] },
  { stones: 5, par: 3, targets: [G(200, 420), B(330, 300)], obstacles: [O(290, 322, 80, 12), M(155, 320, 12, 80, 50, 1.8)] },
  { stones: 6, par: 4, targets: [B(220, 440), B(330, 440), J(275, 260), J(275, 120)], obstacles: [O(245, 282, 60, 12), O(245, 142, 60, 12), M(180, 200, 80, 12, 70, 1.3)] },
  { stones: 7, par: 4, targets: [G(300, 400), B(190, 440), J(345, 200)], obstacles: [M(245, 300, 12, 110, 65, 2.4), O(305, 222, 70, 12)] },
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
