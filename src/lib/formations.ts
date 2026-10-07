"use client";

import formationsData from "../../content/formations.json";
import { getSupabase } from "./supabase";
import { contenuCharge } from "./contenu-i18n";

/**
 * ÉCOLE BIBLIQUE — les formations : contenu embarqué
 * (content/formations.json, adapté des livres de Josy W. Brunet),
 * progression EN BASE (table formation_progress) : quiz validé = leçon
 * acquise, retrouvée sur tous les appareils.
 */

export type QuizQuestion = {
  q: string;
  choix: string[];
  bonne: number;
  explication: string;
};

/** Étape de lecture d'une leçon : un segment audio et les tranches de texte
 * qu'il raconte (section s, paragraphes d..f, indices 0-based). */
export type EtapeLecon = {
  titre: string;
  fichier: string;
  tranches: { s: number; d: number; f: number }[];
};

export type Lecon = {
  id: string;
  titre: string;
  resume: string;
  /** Visuel d'illustration (chemin public), affiché si le fichier existe. */
  image?: string;
  sections: { t: string; p: string }[];
  /** Noms exacts des fichiers audio de la narration (racine du bucket
   * audiovf), dans l'ordre des segments. */
  audio?: string[];
  /** Lecture guidée partie par partie (une étape = un segment audio). */
  etapes?: EtapeLecon[];
  engagement: string;
  application: string[];
  quiz: QuizQuestion[];
};

export type Formation = {
  id: string;
  titre: string;
  volume?: string;
  auteur: string;
  auteurRole?: string;
  /** Affiche (couverture du livre), chemin public. */
  cover?: string;
  /** Petit mot d'accueil de l'autrice (feuille « L'autrice »). */
  motAccueil?: string;
  accroche: string;
  intro: string;
  objectifs: string[];
  /** Nom du fichier e-book dans le bucket public « audiovf ». */
  ebook?: string;
  /** Lien pour acheter le livre papier (ex. Amazon). */
  livrePapier?: string;
  lecons: Lecon[];
};

export function getFormations(): Formation[] {
  // Dans la langue de l'app quand la traduction est chargée (voir AvecContenus).
  const d = contenuCharge<{ formations: Formation[] }>("formations") ?? (formationsData as { formations: Formation[] });
  return d.formations;
}

export function getFormation(id: string): Formation | null {
  return getFormations().find((f) => f.id === id) ?? null;
}

/** Leçons validées (numéros 1-based) pour ce membre et cette formation. */
export async function listFormationProgress(
  userId: string,
  formationId: string,
): Promise<{ lesson: number; score: number }[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("formation_progress")
    .select("lesson,score")
    .eq("user_id", userId)
    .eq("formation_id", formationId)
    .order("lesson");
  return (data as { lesson: number; score: number }[]) ?? [];
}

/** Valide une leçon (quiz réussi) — upsert pour garder le meilleur score. */
export async function validateLesson(
  userId: string,
  formationId: string,
  lesson: number,
  score: number,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("formation_progress")
    .upsert(
      { user_id: userId, formation_id: formationId, lesson, score },
      { onConflict: "user_id,formation_id,lesson" },
    );
  return !error;
}

/** Note (1-5) déjà donnée par ce membre à cette formation, ou null. */
export async function getMyFormationRating(
  userId: string,
  formationId: string,
): Promise<{ note: number; avis: string | null } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("formation_ratings")
    .select("note,avis")
    .eq("user_id", userId)
    .eq("formation_id", formationId)
    .maybeSingle();
  return (data as { note: number; avis: string | null } | null) ?? null;
}

/** Note la formation (1-5 étoiles, avis facultatif) — modifiable. */
export async function rateFormation(
  userId: string,
  formationId: string,
  note: number,
  avis?: string,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("formation_ratings")
    .upsert(
      { user_id: userId, formation_id: formationId, note, avis: avis?.trim() || null },
      { onConflict: "user_id,formation_id" },
    );
  return !error;
}

/** Moyenne et nombre d'avis d'une formation (public). */
export async function getFormationRatingSummary(
  formationId: string,
): Promise<{ moyenne: number; avis: number } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("formation_rating_summary", { p_formation: formationId });
  if (error || !data) return null;
  return data as { moyenne: number; avis: number };
}

export type FormationAdminStats = {
  inscrits: number;
  termines: number;
  par_lecon: Record<string, number>;
  note_moyenne: number;
  nb_avis: number;
};

/** Statistiques de la formation (réservées à l'admin, null sinon). */
export async function getFormationAdminStats(
  formationId: string,
  totalLecons: number,
): Promise<FormationAdminStats | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("formation_admin_stats", {
    p_formation: formationId,
    p_total: totalLecons,
  });
  if (error || !data) return null;
  return data as FormationAdminStats;
}

/** URL publique de l'e-book (bucket audiovf). */
export function ebookUrl(file: string): string | null {
  const sb = getSupabase();
  if (!sb) return null;
  return sb.storage.from("audiovf").getPublicUrl(file).data.publicUrl;
}

/** URL publique d'un fichier audio nommé, à la racine du bucket audiovf. */
export function audioRacineUrl(nom: string): string | null {
  const sb = getSupabase();
  if (!sb) return null;
  return sb.storage.from("audiovf").getPublicUrl(nom).data.publicUrl;
}

/** URL publique de la narration audio d'une leçon (bucket audiovf).
 * Fichier attendu : <leconId>.mp3, ou en plusieurs segments <leconId>-1.mp3,
 * -2.mp3… que le lecteur enchaîne. Les fichiers peuvent vivre dans
 * formations/<formationId>/ ou directement à la racine du bucket — le
 * lecteur sonde les deux emplacements. */
export function audioLeconUrl(
  formationId: string,
  leconId: string,
  segment?: number,
  racine = false,
): string | null {
  const sb = getSupabase();
  if (!sb) return null;
  const nom = segment ? `${leconId}-${segment}.mp3` : `${leconId}.mp3`;
  const chemin = racine ? nom : `formations/${formationId}/${nom}`;
  return sb.storage.from("audiovf").getPublicUrl(chemin).data.publicUrl;
}
