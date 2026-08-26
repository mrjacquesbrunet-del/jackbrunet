"use client";

import { getSupabase } from "./supabase";
import { isAdminEmail } from "./community";

/**
 * Questions posées par les membres depuis la page Q&R.
 *
 * Table Supabase `faq_questions` (RLS) :
 *  - n'importe qui peut POSER une question (insert public, corps 5..1000) ;
 *  - lecture publique de toutes les questions non masquées → section
 *    « Questions de la communauté » ;
 *  - seul Pasteur Jack (admin) peut répondre / masquer.
 *
 * Tant que Supabase n'est pas configuré, tout dégrade proprement : la page
 * fonctionne (recherche + FAQ + vedette), la section communauté reste vide et
 * le formulaire garde la question en local avec un message clair.
 */

export type CommunityQuestion = {
  id: string;
  created_at: string;
  body: string;
  author_name: string | null;
  category: string | null;
  status: string; // 'nouvelle' | 'publiee' | 'masquee'
  answer: string | null;
  answer_verse: string | null;
  answered_at: string | null;
};

const COOLDOWN_KEY = "jb.faq.lastask.v1";
const COOLDOWN_MS = 30_000; // anti-spam léger côté appareil

/** E-mail de la personne connectée (pour savoir si c'est l'admin). */
export async function currentUserEmail(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

export async function currentIsAdmin(): Promise<boolean> {
  return isAdminEmail(await currentUserEmail());
}

/** Poser une question. Renvoie {ok} ; en cas d'échec, un message lisible. */
export async function askQuestion(
  body: string,
  name?: string,
  category?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const text = body.trim();
  if (text.length < 5) return { ok: false, error: "Ta question est un peu courte." };
  if (text.length > 1000) return { ok: false, error: "Ta question est trop longue (1000 max)." };

  // Anti-spam léger : une question toutes les 30 s max depuis cet appareil.
  try {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (Date.now() - last < COOLDOWN_MS) {
      return { ok: false, error: "Doucement — attends un instant avant de reposer une question." };
    }
  } catch {
    /* stockage indisponible */
  }

  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Service indisponible pour l'instant. Réessaie plus tard." };

  // author_id si connecté (facultatif) ; sinon question anonyme.
  let authorId: string | null = null;
  try {
    const { data } = await sb.auth.getUser();
    authorId = data.user?.id ?? null;
  } catch {
    /* anonyme */
  }

  const { error } = await sb.from("faq_questions").insert({
    body: text,
    author_name: (name ?? "").trim().slice(0, 40) || null,
    author_id: authorId,
    category: category ?? null,
  });
  if (error) return { ok: false, error: "Impossible d'envoyer ta question. Réessaie." };

  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  return { ok: true };
}

/** Liste des questions de la communauté (non masquées), plus récentes d'abord. */
export async function listCommunityQuestions(limit = 40): Promise<CommunityQuestion[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("faq_questions")
    .select("id,created_at,body,author_name,category,status,answer,answer_verse,answered_at")
    .neq("status", "masquee")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as CommunityQuestion[]) ?? [];
}

/** Admin : répondre à une question (la marque comme publiée + répondue). */
export async function answerQuestion(
  id: string,
  answer: string,
  verse?: string | null,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const a = answer.trim();
  if (!a) return false;
  const { error } = await sb
    .from("faq_questions")
    .update({
      answer: a,
      answer_verse: (verse ?? "").trim() || null,
      status: "publiee",
      answered_at: new Date().toISOString(),
    })
    .eq("id", id);
  return !error;
}

/** Admin : masquer une question (spam / hors sujet). */
export async function hideQuestion(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("faq_questions").update({ status: "masquee" }).eq("id", id);
  return !error;
}
