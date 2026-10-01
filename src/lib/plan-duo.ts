"use client";

import { getSupabase } from "./supabase";
import type { Profile } from "./community";

/**
 * PLAN DE LECTURE À DEUX : on invite un ami de l'app à faire un plan
 * ensemble. Chacun voit la progression de l'autre (notification « X a lu le
 * jour N »), et le binôme partage des notes privées par jour — seules les
 * deux personnes du duo peuvent les lire (RLS côté Supabase).
 */

export type DuoStatus = "pending" | "active" | "declined" | "ended";

export type PlanDuo = {
  id: string;
  plan_slug: string;
  plan_title: string;
  inviter_id: string;
  invitee_id: string;
  status: DuoStatus;
  created_at: string;
  /** L'autre personne du binôme (hydraté). */
  partner?: Profile;
};

export type DuoNote = {
  id: string;
  duo_id: string;
  author_id: string;
  day: number;
  body: string;
  created_at: string;
  author?: Profile;
};

const DUO_COLS = "id,plan_slug,plan_title,inviter_id,invitee_id,status,created_at";
const PROFILE_COLS = "id,pseudo,avatar_url,verified,name_color";

/** Le duo en cours (invitation ou actif) pour ce plan et ce membre. */
export async function getDuoForPlan(slug: string, me: string): Promise<PlanDuo | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("plan_duos")
    .select(DUO_COLS)
    .eq("plan_slug", slug)
    .in("status", ["pending", "active"])
    .or(`inviter_id.eq.${me},invitee_id.eq.${me}`)
    .order("created_at", { ascending: false })
    .limit(1);
  const duo = (data as PlanDuo[])?.[0];
  if (!duo) return null;
  const partnerId = duo.inviter_id === me ? duo.invitee_id : duo.inviter_id;
  const { data: prof } = await sb.from("profiles").select(PROFILE_COLS).eq("id", partnerId).single();
  return { ...duo, partner: (prof as Profile) ?? undefined };
}

/** Envoie l'invitation (le trigger côté base notifie l'ami). */
export async function inviteDuo(
  slug: string,
  title: string,
  me: string,
  friendId: string,
): Promise<PlanDuo | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("plan_duos")
    .insert({ plan_slug: slug, plan_title: title, inviter_id: me, invitee_id: friendId })
    .select(DUO_COLS)
    .single();
  if (error) return null;
  return data as PlanDuo;
}

/** Accepte ou décline une invitation reçue. */
export async function respondDuo(duoId: string, accept: boolean): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("plan_duos")
    .update({ status: accept ? "active" : "declined" })
    .eq("id", duoId);
  return !error;
}

/** Met fin au duo (l'un ou l'autre peut le faire). */
export async function endDuo(duoId: string) {
  await getSupabase()?.from("plan_duos").update({ status: "ended" }).eq("id", duoId);
}

/** Jours terminés des DEUX membres : { user_id → jours[] }. */
export async function listDuoChecks(duoId: string): Promise<Record<string, number[]>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data } = await sb.from("plan_duo_checks").select("user_id,day").eq("duo_id", duoId);
  const out: Record<string, number[]> = {};
  for (const r of (data as { user_id: string; day: number }[]) ?? []) {
    (out[r.user_id] ??= []).push(r.day);
  }
  return out;
}

/** Coche / décoche un jour côté duo (le trigger notifie le binôme). */
export async function setDuoCheck(duoId: string, me: string, day: number, on: boolean) {
  const sb = getSupabase();
  if (!sb) return;
  if (on) {
    await sb
      .from("plan_duo_checks")
      .upsert({ duo_id: duoId, user_id: me, day }, { onConflict: "duo_id,user_id,day" });
  } else {
    await sb.from("plan_duo_checks").delete().eq("duo_id", duoId).eq("user_id", me).eq("day", day);
  }
}

/** Ma progression locale poussée dans le duo (au moment où il devient actif),
 * pour que le binôme voie où j'en suis. */
export async function syncDuoChecks(duoId: string, me: string, doneDays: number[]) {
  const sb = getSupabase();
  if (!sb || !doneDays.length) return;
  await sb
    .from("plan_duo_checks")
    .upsert(
      doneDays.map((day) => ({ duo_id: duoId, user_id: me, day })),
      { onConflict: "duo_id,user_id,day" },
    );
}

/** Les notes privées du binôme (toutes, groupées ensuite par jour). */
export async function listDuoNotes(duoId: string): Promise<DuoNote[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("plan_duo_notes")
    .select("id,duo_id,author_id,day,body,created_at")
    .eq("duo_id", duoId)
    .order("created_at", { ascending: true });
  const notes = (data as DuoNote[]) ?? [];
  if (!notes.length) return notes;
  const ids = [...new Set(notes.map((n) => n.author_id))];
  const { data: profs } = await sb.from("profiles").select(PROFILE_COLS).in("id", ids);
  const byId = new Map((profs ?? []).map((p) => [p.id, p as Profile]));
  return notes.map((n) => ({ ...n, author: byId.get(n.author_id) }));
}

export async function addDuoNote(
  duoId: string,
  me: string,
  day: number,
  body: string,
): Promise<DuoNote | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("plan_duo_notes")
    .insert({ duo_id: duoId, author_id: me, day, body: body.trim() })
    .select("id,duo_id,author_id,day,body,created_at")
    .single();
  if (error) return null;
  return data as DuoNote;
}

export async function deleteDuoNote(id: string) {
  await getSupabase()?.from("plan_duo_notes").delete().eq("id", id);
}
