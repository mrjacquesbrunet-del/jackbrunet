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
  card: string | null;
  declaration_text: string | null;
  declaration_reference: string | null;
  questions: unknown;
  published: boolean | null;
};

/** Colonnes lues (la colonne `card` doit exister : voir migration-devotions-card.sql). */
const SELECT_COLS =
  "position, theme, verse_text, verse_reference, punchline, meditation, card, declaration_text, declaration_reference, questions, published";

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
    card: r.card ?? undefined,
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
    card: d.card ?? null,
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
    .select(SELECT_COLS)
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
    .select(SELECT_COLS)
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
 * Admin: synchronise le contenu intégré au build avec la base, SANS écraser le
 * texte déjà saisi :
 *  - pour les positions déjà en base → met à jour UNIQUEMENT la carte (`card`) ;
 *  - pour les positions manquantes (nouvelles exhortations) → les insère en
 *    entier (publiées).
 * Renvoie le nombre de cartes mises à jour et de dévotionnels ajoutés.
 * Prérequis : la colonne `card` doit exister (voir migration-devotions-card.sql).
 */
export async function adminSyncCardsAndNew(
  items: Devotion[],
): Promise<{ updated: number; inserted: number } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: existRows, error: e0 } = await sb.from("devotions").select("position");
  if (e0) return null;
  const existing = new Set(
    (existRows ?? []).map((r) => Number((r as { position: number }).position)),
  );

  let updated = 0;
  const toInsert: ReturnType<typeof devotionToRow>[] = [];
  for (let i = 0; i < items.length; i++) {
    const d = items[i];
    if (existing.has(i)) {
      const { error } = await sb
        .from("devotions")
        .update({ card: d.card ?? null, updated_at: new Date().toISOString() })
        .eq("position", i);
      if (!error) updated += 1;
    } else {
      toInsert.push(devotionToRow({ ...d, position: i, published: true }));
    }
  }
  let inserted = 0;
  if (toInsert.length) {
    const { data, error } = await sb
      .from("devotions")
      .upsert(toInsert, { onConflict: "position" })
      .select("position");
    if (!error) inserted = data?.length ?? 0;
  }
  return { updated, inserted };
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
