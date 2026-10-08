// ============================================================
//  Edge Function : ouvre une page de paiement Stripe Checkout pour
//  un DON (unique ou mensuel), au montant choisi sur la page
//  jackbrunet.com/donner. Stripe y propose Apple Pay, Google Pay,
//  carte bancaire… sans rien à ressaisir.
//
//  Secret Supabase requis : STRIPE_SECRET_KEY (jamais dans l'app).
//  Déploiement : Supabase → Edge Functions → Deploy a new function
//  → nom « don-checkout » → coller ce fichier → décocher
//  « Verify JWT » → Deploy.
// ============================================================

const SITE = "https://jackbrunet.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (d: unknown, status = 200) =>
  new Response(JSON.stringify(d), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const cle = Deno.env.get("STRIPE_SECRET_KEY");
  // GET : simple vérification que la fonction est en place.
  if (req.method === "GET") return json({ ok: Boolean(cle) });
  if (!cle) return json({ erreur: "STRIPE_SECRET_KEY manquant" }, 500);

  let corps: { montant?: unknown; mensuel?: unknown; langue?: unknown } = {};
  try {
    corps = await req.json();
  } catch {
    return json({ erreur: "requête invalide" }, 400);
  }
  const eur = Math.round(Number(corps.montant));
  const mensuel = corps.mensuel === true || corps.mensuel === 1 || corps.mensuel === "1";
  const langue = corps.langue === "en" ? "en" : corps.langue === "pt" ? "pt-BR" : "fr";
  if (!Number.isFinite(eur) || eur < 1 || eur > 10000) return json({ erreur: "montant invalide" }, 400);

  const retour = `montant=${eur}&mensuel=${mensuel ? 1 : 0}`;
  const p = new URLSearchParams();
  p.set("mode", mensuel ? "subscription" : "payment");
  p.set("line_items[0][quantity]", "1");
  p.set("line_items[0][price_data][currency]", "eur");
  p.set("line_items[0][price_data][unit_amount]", String(eur * 100));
  p.set(
    "line_items[0][price_data][product_data][name]",
    mensuel ? "Soutien mensuel · Mission RHEMA" : "Don · Mission RHEMA",
  );
  if (mensuel) {
    p.set("line_items[0][price_data][recurring][interval]", "month");
    p.set("subscription_data[metadata][source]", "rhema-donner");
  } else {
    p.set("submit_type", "donate");
    p.set("payment_intent_data[metadata][source]", "rhema-donner");
  }
  p.set("success_url", `${SITE}/donner/merci/?${retour}`);
  p.set("cancel_url", `${SITE}/donner/?${retour}`);
  p.set("locale", langue);
  p.set("metadata[source]", "rhema-donner");

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: p,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.url) return json({ erreur: d?.error?.message ?? "Stripe indisponible" }, 502);
  return json({ url: d.url });
});
