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
export function lienDonSite(montant?: number, mensuel?: boolean, langue?: string): string {
  const q = new URLSearchParams();
  if (montant) q.set("montant", String(Math.round(montant)));
  if (mensuel !== undefined) q.set("mensuel", mensuel ? "1" : "0");
  if (langue) q.set("langue", langue);
  const s = q.toString();
  return `${siteConfig.url}/donner/${s ? `?${s}` : ""}`;
}

let dispo: Promise<boolean> | null = null;
/** La fonction de paiement est-elle déployée (et configurée) ? */
export function paiementDirectDispo(): Promise<boolean> {
  if (!dispo) {
    dispo = fetch(FONCTION, { headers: entetes })
      .then((r) => (r.ok ? r.json() : { ok: false }))
      .then((d: { ok?: boolean }) => Boolean(d.ok))
      .catch(() => false);
  }
  return dispo;
}

/** Ouvre la page de paiement Stripe pour ce don (ou le lien de repli). */
export async function payerDon(montant: number, mensuel: boolean, langue: string): Promise<void> {
  if (await paiementDirectDispo()) {
    const r = await fetch(FONCTION, {
      method: "POST",
      headers: { ...entetes, "Content-Type": "application/json" },
      body: JSON.stringify({ montant, mensuel, langue }),
    });
    const d = (await r.json().catch(() => ({}))) as { url?: string };
    if (d.url) {
      window.location.href = d.url;
      return;
    }
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
