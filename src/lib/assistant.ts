"use client";

import { getSupabase } from "./supabase";

/**
 * ASSISTANT BIBLIQUE : le client n'appelle JAMAIS l'API Anthropic
 * directement — tout passe par l'Edge Function `bible-assistant`
 * (clé API dans les secrets Supabase, quota de 5 questions / 24 h
 * vérifié côté serveur, journal pour relecture pastorale).
 */

export type AssistantMsg = { role: "user" | "assistant"; content: string };

export type AssistantResult =
  | { ok: true; answer: string; remaining: number }
  | { ok: false; error: "auth" | "quota" | "server" };

export const ASSISTANT_DAILY_LIMIT = 5;

export async function askAssistant(messages: AssistantMsg[]): Promise<AssistantResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "server" };
  const { data, error } = await sb.functions.invoke("bible-assistant", {
    body: { messages },
  });
  if (error) {
    // supabase-js met la réponse non-2xx dans error.context (Response).
    const status = (error as { context?: { status?: number } }).context?.status;
    if (status === 401) return { ok: false, error: "auth" };
    if (status === 429) return { ok: false, error: "quota" };
    return { ok: false, error: "server" };
  }
  if (!data?.answer) return { ok: false, error: "server" };
  return { ok: true, answer: data.answer as string, remaining: (data.remaining as number) ?? 0 };
}

/** Questions posées sur les dernières 24 h (pour afficher le compteur). */
export async function assistantUsedToday(userId: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb
    .from("assistant_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gt("created_at", since);
  return count ?? 0;
}
