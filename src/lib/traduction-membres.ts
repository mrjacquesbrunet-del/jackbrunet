"use client";

import { getSupabase } from "./supabase";
import type { Langue } from "./i18n";

/**
 * « Voir la traduction » des textes écrits par les membres (prières,
 * commentaires, messages, bio). La traduction est faite par la fonction
 * Supabase « traduire » (Claude), mémorisée côté serveur et ici.
 */

/* ---- Langue probable d'un texte (rapide, sans appel réseau) ---- */
const MOTS: Record<"fr" | "en" | "pt", Set<string>> = {
  fr: new Set("le la les des du et est pour que qui je tu il elle nous vous ils dans pas une un mon ma mes ton ta tes sur avec ce cette mais au aux sont suis être merci prie priez prière seigneur dieu jésus esprit mère père frère soeur sœur aussi très tout toute".split(" ")),
  en: new Set("the and is are to of for that you i my me we in on with this it be please pray prayer god lord jesus thank thanks his her our your have has not but all so who will from".split(" ")),
  pt: new Set("o os as do da dos das e é para que eu você meu minha nós em no na com uma um por favor ore oração deus senhor jesus obrigado obrigada não mas muito minha seu sua estou está são irmão irmã".split(" ")),
};

export function devinerLangue(texte: string): Langue | null {
  const t = texte.toLowerCase();
  const mots = t.match(/[a-zà-ÿœ]+/g) ?? [];
  if (mots.length < 2) return null;
  const score = { fr: 0, en: 0, pt: 0 };
  for (const m of mots) for (const l of ["fr", "en", "pt"] as const) if (MOTS[l].has(m)) score[l]++;
  if (/[ãõ]|ção|ções/.test(t)) score.pt += 2;
  if (/[èêàùœ]|ç(?!ão|ões)/.test(t)) score.fr += 1;
  const tri = (Object.entries(score) as ["fr" | "en" | "pt", number][]).sort((a, b) => b[1] - a[1]);
  if (tri[0][1] === 0 || tri[0][1] === tri[1][1]) return null;
  return tri[0][0];
}

/* ---- Connecté ? (une seule vérification pour tous les textes) ---- */
let connecte: Promise<boolean> | null = null;
export function estConnecte(): Promise<boolean> {
  connecte ??= (async () => {
    try {
      const { data } = (await getSupabase()?.auth.getSession()) ?? { data: null };
      return !!data?.session;
    } catch {
      return false;
    }
  })();
  return connecte;
}

/* ---- Traduction (avec mémoire locale) ---- */
const memoire = new Map<string, Promise<string | null>>();

export function traduireTexteMembre(texte: string, langue: Langue): Promise<string | null> {
  const cle = `${langue}|${texte}`;
  if (!memoire.has(cle)) {
    memoire.set(
      cle,
      (async () => {
        const sb = getSupabase();
        if (!sb) return null;
        const { data, error } = await sb.functions.invoke("traduire", { body: { texte, langue } });
        if (error) return null;
        return (data as { traduction?: string })?.traduction ?? null;
      })().then((r) => {
        if (r === null) memoire.delete(cle); // réessayable
        return r;
      }),
    );
  }
  return memoire.get(cle)!;
}
