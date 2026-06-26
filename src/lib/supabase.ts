"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase (auth + base de données) pour l'espace communautaire.
 *
 * Les deux variables sont PUBLIQUES (l'« anon key » est conçue pour être
 * exposée ; la sécurité est assurée par les règles RLS côté base). Elles sont
 * injectées au build via NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * Tant qu'elles ne sont pas configurées, `supabase` vaut null et l'espace
 * communautaire affiche un message « bientôt disponible » (le reste du site
 * fonctionne normalement).
 */
/** Nettoie l'URL du projet : enlève espaces/guillemets, ajoute https:// si
 *  manquant, retire le slash final, et valide. Renvoie "" si invalide. */
function cleanUrl(raw?: string): string {
  let u = (raw ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  u = u.replace(/\/+$/, "");
  try {
    new URL(u);
    return u;
  } catch {
    return "";
  }
}

const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    try {
      client = createClient(url, anon, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch {
      return null;
    }
  }
  return client;
}
