"use client";

import { siteConfig } from "@/config/site";
import { STRIPE_LINKS, STRIPE_MONTHLY } from "@/config/stripe";

/**
 * Don sur le site (jackbrunet.com/donner) : la page la plus simple possible,
 * puis le paiement Stripe (Apple Pay, Google Pay, carte) au montant choisi.
 *
 * - Avec la fonction Supabase « don-checkout » en place : n'importe quel
 *   montant, unique ou mensuel, déjà rempli sur la page de paiement.
 * - Sans elle (pas encore déployée) : on retombe sur les liens Stripe
 *   existants (paliers mensuels 20/50/100 €, don unique à montant libre).
 */
const FONCTION = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "")}/functions/v1/don-checkout`;
const ANON = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
const entetes = { apikey: ANON, Authorization: `Bearer ${ANON}` };

/** Lien vers la page de don du site, avec le montant présélectionné. */
export function lienDonSite(montant?: number, mensuel?: boolean, langue?: string, direct = false): string {
  const q = new URLSearchParams();
  if (montant) q.set("montant", String(Math.round(montant)));
  if (mensuel !== undefined) q.set("mensuel", mensuel ? "1" : "0");
  if (langue) q.set("langue", langue);
  // direct : la page ouvre tout de suite le paiement Stripe (montant déjà choisi).
  if (direct && montant) q.set("go", "1");
  const s = q.toString();
  return `${siteConfig.url}/donner/${s ? `?${s}` : ""}`;
}

/** Dernière erreur rencontrée (affichée avec ?debug=1 sur la page). */
export let derniereErreurDon = "";

/**
 * Appel de la fonction : d'abord en requête « simple » (aucun en-tête
 * particulier, donc pas de pré-vérification CORS — idéal si « Verify JWT »
 * est décoché), puis avec la clé publique si Supabase l'exige (401).
 */
async function appeler(methode: "GET" | "POST", corps?: string): Promise<Response> {
  const init: RequestInit = { method: methode, ...(corps ? { body: corps, headers: { "Content-Type": "text/plain" } } : {}) };
  let r = await fetch(FONCTION, init);
  if (r.status === 401 || r.status === 403) {
    r = await fetch(FONCTION, { ...init, headers: { ...(init.headers as Record<string, string>), ...entetes } });
  }
  return r;
}

let dispo: Promise<boolean> | null = null;
/** La fonction de paiement est-elle déployée (et configurée) ? */
export function paiementDirectDispo(): Promise<boolean> {
  if (!dispo) {
    dispo = appeler("GET")
      .then(async (r) => {
        const d = (await r.json().catch(() => ({}))) as { ok?: boolean; msg?: string; message?: string };
        if (!r.ok || !d.ok) derniereErreurDon = `vérification ${r.status} ${JSON.stringify(d).slice(0, 160)}`;
        return Boolean(r.ok && d.ok);
      })
      .catch((e) => {
        derniereErreurDon = `vérification impossible : ${e instanceof Error ? e.message : String(e)}`;
        return false;
      });
  }
  return dispo;
}

/** Ouvre la page de paiement Stripe pour ce don (ou le lien de repli). */
export async function payerDon(montant: number, mensuel: boolean, langue: string): Promise<void> {
  // On tente toujours la fonction (même si la vérification a échoué).
  try {
    const r = await appeler("POST", JSON.stringify({ montant, mensuel, langue }));
    const d = (await r.json().catch(() => ({}))) as { url?: string; erreur?: string };
    if (d.url) {
      window.location.href = d.url;
      return;
    }
    derniereErreurDon = `paiement ${r.status} ${d.erreur ?? JSON.stringify(d).slice(0, 160)}`;
  } catch (e) {
    derniereErreurDon = `paiement impossible : ${e instanceof Error ? e.message : String(e)}`;
  }
  if (new URLSearchParams(window.location.search).has("debug")) {
    window.alert(`Paiement direct indisponible\n${derniereErreurDon}`);
  }
  window.location.href = lienRepli(montant, mensuel) ?? `${siteConfig.url}/dons`;
}

/** Lien Stripe déjà existant pour ce choix, sans la fonction. */
export function lienRepli(montant: number, mensuel: boolean): string | null {
  if (mensuel) {
    const palier = montant === 20 ? "Ami" : montant === 50 ? "Partenaire" : montant === 100 ? "Bâtisseur" : null;
    if (palier && STRIPE_MONTHLY[palier]) return STRIPE_MONTHLY[palier];
  }
  return STRIPE_LINKS.donOnce;
}
