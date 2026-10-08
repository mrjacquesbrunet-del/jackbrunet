"use client";

import { getLangue } from "@/lib/i18n";

/**
 * Classe un contact Brevo par langue (fr / en / pt) grâce à la fonction
 * Supabase « brevo-langue » (la clé Brevo reste côté serveur). Best-effort :
 * n'empêche jamais une inscription. Si la fonction n'est pas encore
 * déployée, rien ne se passe (l'inscription Brevo habituelle reste faite).
 */
const FONCTION = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "")}/functions/v1/brevo-langue`;
const ANON = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export async function classerContactBrevo(email: string, opts: { prenom?: string; newsletter: boolean }): Promise<void> {
  if (!FONCTION.startsWith("http")) return;
  const corps = JSON.stringify({ email, langue: getLangue(), prenom: opts.prenom ?? "", newsletter: opts.newsletter });
  try {
    // Requête « simple » (pas de pré-vérification CORS), puis avec la clé publique si exigée.
    let r = await fetch(FONCTION, { method: "POST", body: corps, headers: { "Content-Type": "text/plain" } });
    if (r.status === 401 || r.status === 403) {
      r = await fetch(FONCTION, {
        method: "POST",
        body: corps,
        headers: { "Content-Type": "text/plain", apikey: ANON, Authorization: `Bearer ${ANON}` },
      });
    }
  } catch {
    /* hors ligne ou fonction absente : sans gravité */
  }
}
