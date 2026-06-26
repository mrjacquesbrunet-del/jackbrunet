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
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url as string, anon as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
