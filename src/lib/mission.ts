"use client";

import { getSupabase } from "./supabase";

/** Statistiques de collecte de la mission, lues en direct depuis Supabase. */
export type MissionStats = { raised: number; objective: number };

export async function getMissionStats(): Promise<MissionStats | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
.from("mission_stats")
.select("raised_eur, objective_eur")
.eq("id", 1)
.single();
  if (error ||!data) return null;
  return {
    raised: Number(data.raised_eur) || 0,
    objective: Number(data.objective_eur) || 0,
  };
}

/** Admin: définit le montant collecté (se met à jour en direct sur le site). */
export async function setMissionRaised(val: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.rpc("set_mission_raised", { val });
  return!error;
}

/** 2e jauge : participation aux frais des bénévoles (billets d'avion). */
export type BenevolesStats = { raised: number; objective: number };

/** Billets payés par les bénévoles : 7 × 900 € puis 5 × 1 570 € (rachat). */
export const BENEVOLES = { nombre: 7, billet: 900, rachats: 5, billetRachat: 1570 };
/** Total payé par les bénévoles (affiché pour comprendre) : 14 150 €. */
export const TOTAL_BENEVOLES = BENEVOLES.nombre * BENEVOLES.billet + BENEVOLES.rachats * BENEVOLES.billetRachat;
/** Objectif de la jauge : participation au 2e billet seulement (5 × 1 570 € = 7 850 €). */
export const OBJECTIF_BENEVOLES = BENEVOLES.rachats * BENEVOLES.billetRachat;

/** Lu à part : la jauge principale ne dépend pas de ces colonnes (SQL récent). */
export async function getBenevolesStats(): Promise<BenevolesStats | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("mission_stats").select("benevoles_eur, objectif_benevoles_eur").eq("id", 1).single();
  if (error || !data) return null;
  return {
    raised: Number(data.benevoles_eur) || 0,
    objective: Number(data.objectif_benevoles_eur) || OBJECTIF_BENEVOLES,
  };
}

/** Admin : montant reçu pour les frais des bénévoles. */
export async function setBenevolesRaised(val: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.rpc("set_mission_benevoles", { val });
  return !error;
}
