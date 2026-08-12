"use client";

import { getSupabase } from "./supabase";
import { isNativeApp } from "./notifications";

/** Identifiant d'appareil anonyme (aucune donnée personnelle). */
function deviceId(): string {
  try {
    let d = localStorage.getItem("jb.device.id");
    if (!d) {
      d =
        typeof crypto!== "undefined" && crypto.randomUUID
? crypto.randomUUID()
: String(Date.now()) + Math.random().toString(36).slice(2);
      localStorage.setItem("jb.device.id", d);
    }
    return d;
  } catch {
    return "anon";
  }
}

/** Enregistre un évènement anonyme (vue de page, écoute, plan commencé,
 *  méditation complétée), avec sa provenance (app native ou site). Si la
 *  colonne `source` n'existe pas encore en base, on réessaie sans elle :
 *  la mesure n'est jamais perdue. */
export function track(type: "page" | "play" | "plan_start" | "meditate", page: string) {
  const sb = getSupabase();
  if (!sb) return;
  const base = { type, page, device_id: deviceId() };
  const source = isNativeApp() ? "app" : "site";
  (async () => {
    try {
      const { error } = await sb.from("analytics_events").insert({ ...base, source });
      if (error) await sb.from("analytics_events").insert(base);
    } catch {
      /* silencieux : la mesure ne doit jamais gêner l'app */
    }
  })();
}

export type AnalyticsSummary = {
  plays_day: number;
  plays_week: number;
  plays_month: number;
  listeners_day: number;
  listeners_week: number;
  listeners_month: number;
  visitors_day: number;
  visitors_week: number;
  visitors_month: number;
};

export async function analyticsSummary(): Promise<AnalyticsSummary | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("analytics_summary");
  if (error) return null;
  return data as AnalyticsSummary;
}

export type AnalyticsTotals = {
  visits_total: number;
  visitors_total: number;
  /** Ventilation (mesurée à partir de l'ajout de la colonne source). */
  visits_app?: number;
  visits_site?: number;
};

/** Totaux depuis le lancement (toutes les visites + appareils uniques). */
export async function analyticsTotals(): Promise<AnalyticsTotals | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("analytics_totals");
  if (error) return null;
  return data as AnalyticsTotals;
}

export type AppInsights = {
  app_active_day: number;
  app_active_week: number;
  app_active_month: number;
  regulars_week: number;
  returning_rate: number;
  plan_starts_month: number;
  plan_starts_total: number;
  meditations_day: number;
  meditations_week: number;
  meditations_month: number;
  top_plans: { label: string; n: number }[];
  top_app_pages: { label: string; n: number }[];
};

/** Statistiques d'engagement de l'application (espace admin). */
export async function analyticsAppInsights(): Promise<AppInsights | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("analytics_app_insights");
  if (error) return null;
  return data as AppInsights;
}

export async function analyticsTop(
  kind: "page" | "play",
  days = 30,
): Promise<{ label: string; n: number }[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("analytics_top", { kind, days });
  if (error) return [];
  return (data as { label: string; n: number }[])?? [];
}
