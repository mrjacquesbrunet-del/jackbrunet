"use client";

import { getSupabase } from "./supabase";
import type { Devotion } from "./types";

/**
 * Dévotionnels gérés par l'admin (Supabase), avec repli de sécurité sur les
 * 60 dévotionnels intégrés au build.
 *
 * - L'app publique lit les dévotionnels PUBLIÉS et les affiche à la place des
 *   60 par défaut. Si la table est vide / non configurée, on garde les 60
 *   intégrés (la méditation du jour ne casse jamais).
 * - L'espace admin (/admin) permet d'écrire, modifier, ajouter, supprimer et
 *   d'importer les 60 existants d'un clic.
 */

/** Dévotionnel stocké en base (avec sa position et son état de publication). */
export type DbDevotion = Devotion & { position: number; published: boolean };

type Row = {
  position: number;
  theme: string | null;
  verse_text: string | null;
  verse_reference: string | null;
  punchline: string | null;
  meditation: string | null;
  declaration_text: string | null;
  declaration_reference: string | null;
  questions: unknown;
  published: boolean | null;
};

function rowToDevotion(r: Row): DbDevotion {
  const questions = Array.isArray(r.questions)
    ? (r.questions as unknown[]).map((q) => String(q))
    : [];
  return {
    position: Number(r.position) || 0,
    theme: r.theme ?? "",
    verseText: r.verse_text ?? "",
    verseReference: r.verse_reference ?? "",
    punchline: r.punchline ?? "",
    meditation: r.meditation ?? "",
    declarationText: r.declaration_text ?? "",
    declarationReference: r.declaration_reference ?? "",
    questions,
    published: r.published !== false,
  };
}

function devotionToRow(d: DbDevotion) {
  return {
    position: d.position,
    theme: d.theme,
    verse_text: d.verseText,
    verse_reference: d.verseReference,
    punchline: d.punchline,
    meditation: d.meditation,
    declaration_text: d.declarationText,
    declaration_reference: d.declarationReference,
    questions: d.questions,
    published: d.published,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Dévotionnels publiés, pour l'app publique (triés par position).
 * Renvoie `null` si Supabase n'est pas configuré, en cas d'erreur, ou si la
 * table est vide → l'appelant garde alors les 60 par défaut.
 */
export async function fetchPublishedDevotions(): Promise<Devotion[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("devotions")
    .select(
      "position, theme, verse_text, verse_reference, punchline, meditation, declaration_text, declaration_reference, questions, published",
    )
    .eq("published", true)
    .order("position", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as Row[]).map(rowToDevotion);
}

/** Admin: tous les dévotionnels (y compris brouillons), triés par position. */
export async function adminListDevotions(): Promise<DbDevotion[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("devotions")
    .select(
      "position, theme, verse_text, verse_reference, punchline, meditation, declaration_text, declaration_reference, questions, published",
    )
    .order("position", { ascending: true });
  if (error || !data) return null;
  return (data as Row[]).map(rowToDevotion);
}

/** Admin: enregistre (crée ou met à jour) un dévotionnel par sa position. */
export async function adminSaveDevotion(d: DbDevotion): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("devotions")
    .upsert(devotionToRow(d), { onConflict: "position" });
  return !error;
}

/** Admin: supprime un dévotionnel par sa position. */
export async function adminDeleteDevotion(position: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("devotions").delete().eq("position", position);
  return !error;
}

/**
 * Admin: importe une liste de dévotionnels (les 60 par défaut) en base.
 * N'écrase PAS ce qui existe déjà (ignoreDuplicates), pour ne pas perdre les
 * modifications faites après un premier import.
 */
export async function adminSeedDevotions(items: Devotion[]): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const rows = items.map((d, i) =>
    devotionToRow({ ...d, position: i, published: true }),
  );
  const { data, error } = await sb
    .from("devotions")
    .upsert(rows, { onConflict: "position", ignoreDuplicates: true })
    .select("position");
  if (error) return 0;
  return data?.length ?? 0;
}
