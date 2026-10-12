"use client";

import { getSupabase } from "@/lib/supabase";

export type Announcement = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  active: boolean;
  created_at: string;
};

/** Dernière annonce active (la plus récente), publiée il y a moins de 7 jours :
 * une annonce oubliée (« prochain live » passé…) ne revient pas indéfiniment. */
export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb
.from("announcements")
.select("*")
.eq("active", true)
.gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString())
.order("created_at", { ascending: false })
.limit(1)
.maybeSingle();
    return (data as Announcement)?? null;
  } catch {
    return null;
  }
}

/** Publie une annonce (réservé à l'admin, la RLS le garantit côté serveur). */
export async function postAnnouncement(title: string, body: string, link: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("announcements").insert({
    title: title.trim(),
    body: body.trim() || null,
    link: link.trim() || null,
  });
  return!error;
}

/** Désactive toutes les annonces actives (pour « retirer » la bannière). */
export async function clearAnnouncements(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from("announcements").update({ active: false }).eq("active", true);
  } catch {
    /* ignore */
  }
}
