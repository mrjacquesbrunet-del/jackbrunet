"use client";

import formationsData from "../../content/formations.json";
import { getSupabase } from "./supabase";

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

export type Lecon = {
  id: string;
  titre: string;
  resume: string;
  /** Visuel d'illustration (chemin public), affiché si le fichier existe. */
  image?: string;
  sections: { t: string; p: string }[];
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
  lecons: Lecon[];
};

export function getFormations(): Formation[] {
  return (formationsData as { formations: Formation[] }).formations;
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

/** URL publique de l'e-book (bucket audiovf). */
export function ebookUrl(file: string): string | null {
  const sb = getSupabase();
  if (!sb) return null;
  return sb.storage.from("audiovf").getPublicUrl(file).data.publicUrl;
}

/** URL publique de la narration audio d'une leçon (bucket audiovf).
 * Fichier attendu : formations/<formationId>/<leconId>.mp3 — la carte
 * « Écouter la leçon » ne s'affiche que si le fichier existe. */
export function audioLeconUrl(formationId: string, leconId: string): string | null {
  const sb = getSupabase();
  if (!sb) return null;
  return sb.storage.from("audiovf").getPublicUrl(`formations/${formationId}/${leconId}.mp3`).data.publicUrl;
}
