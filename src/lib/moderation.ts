"use client";

import { getSupabase } from "./supabase";

export type ReportTarget =
  | "group_post"
  | "group_comment"
  | "group_message"
  | "prayer"
  | "prayer_comment"
  | "message"
  | "profile";

export type Report = {
  id: string;
  reporter_id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: string;
  note: string | null;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
};

export const REPORT_REASONS = [
  "Contenu inapproprié",
  "Harcèlement ou haine",
  "Spam ou arnaque",
  "Contenu sexuel",
  "Autre",
];

/** Signaler un contenu (tout membre connecté). */
export async function reportContent(
  targetType: ReportTarget,
  targetId: string,
  reason: string,
  note?: string,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: auth } = await sb.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return false;
  const { error } = await sb.from("reports").insert({
    reporter_id: uid,
    target_type: targetType,
    target_id: targetId,
    reason,
    note: note?.trim() || null,
  });
  return !error;
}

/** File des signalements ouverts (modérateurs / admin). */
export async function listOpenReports(): Promise<Report[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("reports")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Report[];
}

export async function setReportStatus(id: string, status: "resolved" | "dismissed"): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("reports").update({ status }).eq("id", id);
  return !error;
}

/* ---------------- Blocages ---------------- */

export async function blockUser(blockedId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: auth } = await sb.auth.getUser();
  const uid = auth.user?.id;
  if (!uid || uid === blockedId) return false;
  const { error } = await sb
    .from("blocks")
    .upsert({ blocker_id: uid, blocked_id: blockedId }, { onConflict: "blocker_id,blocked_id" });
  return !error;
}

export async function unblockUser(blockedId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: auth } = await sb.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return false;
  const { error } = await sb.from("blocks").delete().eq("blocker_id", uid).eq("blocked_id", blockedId);
  return !error;
}

/** Liste des ids bloqués par l'utilisateur courant. */
export async function listBlockedIds(): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("blocks").select("blocked_id");
  return ((data ?? []) as { blocked_id: string }[]).map((b) => b.blocked_id);
}
