"use client";

import { useEffect, useState } from "react";

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

/**
 * Pays francophones (Madagascar, Afrique francophone, Maghreb, Haïti,
 * outre-mer…) : l'app y reste en français, même si le téléphone est réglé en
 * anglais. Codes pays (ISO) et fuseaux horaires des appareils.
 */
const PAYS_FRANCOPHONES = new Set([
  "FR", "BE", "CH", "LU", "MC", "MG", "KM", "RE", "YT", "SC", "SN", "CI", "ML", "BF", "NE", "GN", "TG", "BJ",
  "CM", "GA", "CG", "CD", "CF", "TD", "BI", "RW", "DJ", "MR", "MA", "DZ", "TN", "HT", "GP", "MQ", "GF", "PF", "NC",
]);
const FUSEAUX_FRANCOPHONES = new Set([
  "Indian/Antananarivo", "Indian/Comoro", "Indian/Reunion", "Indian/Mayotte", "Indian/Mahe",
  "Africa/Dakar", "Africa/Abidjan", "Africa/Bamako", "Africa/Ouagadougou", "Africa/Niamey", "Africa/Conakry",
  "Africa/Lome", "Africa/Porto-Novo", "Africa/Douala", "Africa/Libreville", "Africa/Brazzaville", "Africa/Kinshasa",
  "Africa/Lubumbashi", "Africa/Bangui", "Africa/Ndjamena", "Africa/Bujumbura", "Africa/Kigali", "Africa/Djibouti",
  "Africa/Nouakchott", "Africa/Casablanca", "Africa/Algiers", "Africa/Tunis", "America/Port-au-Prince",
  "America/Guadeloupe", "America/Martinique", "America/Cayenne", "Pacific/Noumea", "Pacific/Tahiti",
]);

/** Le téléphone est-il dans un pays francophone (code pays, sinon fuseau horaire) ? */
function paysFrancophone(nav: string): boolean {
  const pays = nav.split(/[-_]/)[1]?.toUpperCase();
  if (pays && PAYS_FRANCOPHONES.has(pays)) return true;
  // Sans pays précis (« en », « en-US » par défaut), le fuseau horaire tranche.
  if (pays && pays !== "US") return false;
  try {
    return FUSEAUX_FRANCOPHONES.has(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return false;
  }
}

export function langueDuTelephone(): Langue {
  try {
    const nav = navigator.languages?.[0] || navigator.language || "fr";
    const l = nav.toLowerCase();
    if (l.startsWith("pt")) return "pt";
    if (l.startsWith("fr")) return "fr";
    // Téléphone en anglais, mais à Madagascar ou en Afrique francophone : français.
    if (l.startsWith("en")) return paysFrancophone(nav) ? "fr" : "en";
  } catch {
    /* rendu serveur */
  }
  // Autres langues (malgache, wolof, lingala, arabe…) : français par défaut.
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

/* ---- Pour les composants ---- */


/** Langue de l'app côté composant ("fr" au premier rendu, puis la vraie). */
export function useLangue(): Langue {
  const [l, setL] = useState<Langue>("fr");
  useEffect(() => setL(getLangue()), []);
  return l;
}

/** Format des dates et des nombres de la langue de l'app (fr-FR, en-US, pt-BR). */
export function localeApp(): string {
  if (typeof window === "undefined") return "fr-FR";
  const l = getLangue();
  return l === "en" ? "en-US" : l === "pt" ? "pt-BR" : "fr-FR";
}

/** Livres, boutique et e-books : vendus et envoyés en France seulement, donc
 * proposés uniquement dans l'app en français. */
export function offresFrance(l: Langue): boolean {
  return l === "fr";
}

/** Lien vers une offre réservée à la France (boutique, livre papier, Amazon.fr…) ? */
export function lienFranceSeulement(href: string): boolean {
  return /\/boutique|boutique\.jackbrunet|amazon\.|amzn\./i.test(href);
}

/** Podcasts et vidéos n'existent qu'en français. */
export function contenuAudioVideoDispo(l: Langue): boolean {
  return l === "fr";
}
