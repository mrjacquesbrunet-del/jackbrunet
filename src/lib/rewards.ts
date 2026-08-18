"use client";

/**
 * Récompenses de fidélité, 100 % côté client (localStorage), compatible export
 * statique. Les paliers se débloquent grâce à la série de jours consécutifs
 * (record `best` de l'engagement, pour que la récompense reste acquise même si
 * la série se casse plus tard). Un palier « Ambassadeur » se débloque au partage.
 */

export type Reward = {
  id: string;
  /** Série requise (jours). 0 = débloqué par une action (ex. partage). */
  days: number;
  emoji: string;
  title: string;
  blurb: string;
  /** Lien vers le cadeau à récupérer. */
  href: string;
  cta: string;
};

/** Les 3 paliers de fidélité (contenus déjà existants). */
export const FIDELITY_REWARDS: Reward[] = [
  {
    id: "d7",
    days: 7,
    emoji: "",
    title: "7 jours d'affilée",
    blurb: "Ton cadeau: l'ebook « 7 jours pour retrouver la paix ».",
    href: "/ebook/7-jours",
    cta: "Lire l'ebook",
  },
  {
    id: "d30",
    days: 30,
    emoji: "",
    title: "30 jours d'affilée",
    blurb: "Ton cadeau: les premières méditations de RHEMA.",
    href: "/ebook/rhema",
    cta: "Découvrir RHEMA",
  },
  {
    id: "d100",
    days: 100,
    emoji: "",
    title: "100 jours d'affilée",
    blurb: "Un cadeau mystère t'attend pour récompenser ta fidélité.",
    href: "/surprise",
    cta: "Ouvrir ma surprise",
  },
];

/** Récompense « Ambassadeur », débloquée en partageant l'application. */
export const AMBASSADOR_REWARD: Reward = {
  id: "ambassadeur",
  days: 0,
  emoji: "",
  title: "Ambassadeur",
  blurb: "Merci d'avoir partagé l'app! Un bonus pour bénir autour de toi.",
  href: "/soaking",
  cta: "Profiter du bonus",
};

const SEEN_KEY = "jb.rewards.seen.v1";
const SHARE_KEY = "jb.rewards.shared";

export function readSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function markSeen(ids: string[]) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function hasShared(): boolean {
  try {
    return localStorage.getItem(SHARE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markShared() {
  try {
    localStorage.setItem(SHARE_KEY, "1");
    window.dispatchEvent(new Event("jb-rewards"));
  } catch {
    /* ignore */
  }
}

/** Partage l'application (partage natif si dispo, sinon copie le lien). */
export async function shareApp(url: string): Promise<boolean> {
  const text = "Découvre l'application RHEMA – Bible & Prière";
  try {
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    if (typeof nav.share === "function") {
      await nav.share({ title: "RHEMA – Bible & Prière", text, url });
      markShared();
      return true;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    markShared();
    return true;
  } catch {
    return false;
  }
}

/** Combien de jours restants avant le prochain palier (0 si tous atteints). */
export function daysToNext(best: number): number {
  const next = FIDELITY_REWARDS.find((r) => best < r.days);
  return next? next.days - best: 0;
}
