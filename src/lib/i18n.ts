"use client";

/**
 * MULTILINGUE — langue de l'app (français, anglais, portugais du Brésil).
 *
 * Le code et les textes restent écrits en français. Dans une autre langue,
 * le composant <Traducteur> remplace à l'affichage chaque texte français par
 * sa traduction, d'après les dictionnaires public/i18n/ui.<langue>.json
 * (générés par scripts/i18n/traduire-ui.mjs). Un texte sans traduction reste
 * simplement en français.
 */

export type Langue = "fr" | "en" | "pt";
export const LANGUES: { code: Langue; nom: string; drapeau: string }[] = [
  { code: "fr", nom: "Français", drapeau: "FR" },
  { code: "en", nom: "English", drapeau: "EN" },
  { code: "pt", nom: "Português (Brasil)", drapeau: "BR" },
];

export const CLE_LANGUE = "jb.langue";

/** Langue choisie, sinon celle du téléphone (français par défaut). */
export function getLangue(): Langue {
  try {
    const l = localStorage.getItem(CLE_LANGUE);
    if (l === "fr" || l === "en" || l === "pt") return l;
  } catch {
    /* stockage indisponible */
  }
  return langueDuTelephone();
}

export function langueDuTelephone(): Langue {
  try {
    const nav = (navigator.languages?.[0] || navigator.language || "fr").toLowerCase();
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("fr")) return "fr";
    if (nav.startsWith("en")) return "en";
  } catch {
    /* rendu serveur */
  }
  return "fr";
}

/** Change de langue : mémorise puis recharge l'app dans la nouvelle langue. */
export function setLangue(l: Langue): void {
  try {
    localStorage.setItem(CLE_LANGUE, l);
  } catch {
    /* ignore */
  }
  window.location.reload();
}

/** La langue a-t-elle été choisie explicitement (ou seulement devinée) ? */
export function langueChoisie(): boolean {
  try {
    return !!localStorage.getItem(CLE_LANGUE);
  } catch {
    return false;
  }
}

/* ---- Dictionnaire de l'interface ---- */

type Gabarit = { re: RegExp; trad: string };
let exact: Map<string, string> | null = null;
let gabarits: Gabarit[] = [];

/** Espaces normalisés, comme à l'extraction des textes. */
export function normaliser(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function echapper(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Charge le dictionnaire de la langue (une fois). */
export async function chargerDictionnaire(l: Langue): Promise<boolean> {
  if (l === "fr") return false;
  if (exact) return true;
  try {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const r = await fetch(`${base}/i18n/ui.${l}.json`, { cache: "force-cache" });
    if (!r.ok) return false;
    const dico = (await r.json()) as Record<string, string>;
    exact = new Map();
    gabarits = [];
    for (const [fr, trad] of Object.entries(dico)) {
      if (!trad) continue;
      if (/\{\d+\}/.test(fr)) {
        // « Plus que {0} pts » → /^Plus que (.+?) pts$/
        const parties = fr.split(/(\{\d+\})/);
        const ordre: number[] = [];
        const src = parties
          .map((p) => {
            const m = p.match(/^\{(\d+)\}$/);
            if (m) {
              ordre.push(Number(m[1]));
              return "(.+?)";
            }
            return echapper(p);
          })
          .join("");
        const re = new RegExp(`^${src}$`, "s");
        gabarits.push({
          re,
          trad: trad.replace(/\{(\d+)\}/g, (_, n) => `{#${ordre.indexOf(Number(n))}}`),
        });
      } else {
        exact.set(fr, trad);
      }
    }
    // Les gabarits les plus précis (plus de texte fixe) d'abord.
    gabarits.sort((a, b) => b.re.source.replace(/\(\.\+\?\)/g, "").length - a.re.source.replace(/\(\.\+\?\)/g, "").length);
    return true;
  } catch {
    return false;
  }
}

/** Traduit un texte français (ou renvoie null s'il n'a pas de traduction). */
export function traduireTexte(texte: string): string | null {
  if (!exact) return null;
  const t = normaliser(texte);
  if (!t) return null;
  const direct = exact.get(t);
  if (direct !== undefined) return direct;
  for (const g of gabarits) {
    const m = t.match(g.re);
    if (m) return g.trad.replace(/\{#(\d+)\}/g, (_, i) => m[Number(i) + 1] ?? "");
  }
  return null;
}

/** Pour le code : t("Texte français") → texte dans la langue de l'app. */
export function t(fr: string): string {
  return traduireTexte(fr) ?? fr;
}
