// ============================================================
//  Edge Function : reçoit les paiements Stripe (webhook) et les
//  enregistre dans public.dons_site → la barre d'objectif avance
//  toute seule à chaque don fait sur le site.
//
//  Événements Stripe à cocher :
//    checkout.session.completed, checkout.session.async_payment_succeeded,
//    invoice.paid, charge.refunded
//
//  Secrets Supabase requis : STRIPE_WEBHOOK_SECRET (whsec_…) et
//  STRIPE_SECRET_KEY (déjà en place). Jamais dans l'app.
//  Déploiement : nom « stripe-webhook », « Verify JWT » DÉCOCHÉ.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Lien de don « Mission Madagascar » : compté à part (son propre objectif).
const LIEN_MADAGASCAR = "28EfZi5A6bFEeiZaQwa3u04";

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");

/** Vérifie la signature Stripe (en-tête Stripe-Signature : t=…,v1=…). */
async function signatureValide(corps: string, entete: string, secret: string): Promise<boolean> {
  const morceaux = entete.split(",").map((p) => p.split("="));
  const t = morceaux.find(([k]) => k === "t")?.[1];
  const signatures = morceaux.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false; // rejeu
  const cle = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const attendu = hex(await crypto.subtle.sign("HMAC", cle, enc.encode(`${t}.${corps}`)));
  return signatures.some((s) => s.length === attendu.length && [...s].every((c, i) => c === attendu[i]));
}

/** Le paiement vient-il du lien « Mission Madagascar » ? */
async function categorieDuLien(plink: string | null): Promise<string> {
  const cle = Deno.env.get("STRIPE_SECRET_KEY");
  if (!plink || !cle) return "mission";
  try {
    const r = await fetch(`https://api.stripe.com/v1/payment_links/${plink}`, {
      headers: { Authorization: `Bearer ${cle}` },
    });
    const d = await r.json();
    return String(d?.url ?? "").includes(LIEN_MADAGASCAR) ? "madagascar" : "mission";
  } catch {
    return "mission";
  }
}

const ok = (m = "ok") => new Response(m, { status: 200 });

Deno.serve(async (req) => {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return new Response("STRIPE_WEBHOOK_SECRET manquant", { status: 500 });
  const corps = await req.text();
  if (!(await signatureValide(corps, req.headers.get("stripe-signature") ?? "", secret))) {
    return new Response("signature invalide", { status: 400 });
  }

  // deno-lint-ignore no-explicit-any
  let ev: any;
  try {
    ev = JSON.parse(corps);
  } catch {
    return new Response("json invalide", { status: 400 });
  }
  const o = ev?.data?.object ?? {};
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const enregistrer = async (ligne: Record<string, unknown>) => {
    const { error } = await db.from("dons_site").upsert(ligne, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  };

  try {
    switch (ev.type) {
      // Don unique payé (carte, Apple Pay, Google Pay… ou paiement différé réussi).
      // Les abonnements sont comptés par invoice.paid (pour ne rien compter deux fois).
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        if (o.mode !== "payment" || o.payment_status !== "paid") return ok("ignoré");
        if (String(o.currency).toLowerCase() !== "eur") return ok("devise ignorée");
        await enregistrer({
          id: o.payment_intent ?? o.id,
          paiement: o.payment_intent ?? null,
          montant_eur: Number(o.amount_total) / 100,
          mensuel: false,
          categorie: await categorieDuLien(o.payment_link ?? null),
          paye_le: new Date(Number(o.created) * 1000).toISOString(),
        });
        return ok();
      }
      // Mensualité payée (première et suivantes).
      case "invoice.paid": {
        if (!(Number(o.amount_paid) > 0) || String(o.currency).toLowerCase() !== "eur") return ok("ignoré");
        const paye = o.status_transitions?.paid_at ?? o.created;
        await enregistrer({
          id: o.id,
          paiement: typeof o.payment_intent === "string" ? o.payment_intent : null,
          montant_eur: Number(o.amount_paid) / 100,
          mensuel: true,
          categorie: "mission",
          paye_le: new Date(Number(paye) * 1000).toISOString(),
        });
        return ok();
      }
      // Remboursement total : le don ne compte plus.
      case "charge.refunded": {
        if (!o.refunded || !o.payment_intent) return ok("partiel ou inconnu");
        await db.from("dons_site").update({ rembourse: true }).or(`id.eq.${o.payment_intent},paiement.eq.${o.payment_intent}`);
        return ok();
      }
      default:
        return ok("événement ignoré");
    }
  } catch (e) {
    // 500 → Stripe réessaiera plus tard.
    return new Response(`erreur : ${(e as Error).message}`, { status: 500 });
  }
});
