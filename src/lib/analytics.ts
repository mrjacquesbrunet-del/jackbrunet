"use client";

import { getSupabase } from "./supabase";

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

/** Enregistre un évènement anonyme (vue de page ou écoute). */
export function track(type: "page" | "play", page: string) {
  const sb = getSupabase();
  if (!sb) return;
  sb.from("analytics_events")
.insert({ type, page, device_id: deviceId() })
.then(
      () => undefined,
      () => undefined,
    );
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
};

/** Totaux depuis le lancement (toutes les visites + appareils uniques). */
export async function analyticsTotals(): Promise<AnalyticsTotals | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("analytics_totals");
  if (error) return null;
  return data as AnalyticsTotals;
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
