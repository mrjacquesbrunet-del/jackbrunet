"use client";

import { getSupabase } from "./supabase";

/**
 * Préférences de notifications PUSH, par famille (profiles.notif_prefs).
 * Clé absente / null = activé. L'edge function notify-push lit ce champ
 * avant d'envoyer ; la cloche in-app, elle, reste toujours alimentée.
 */

export type NotifGroup =
  | "games"
  | "messages"
  | "prays"
  | "comments"
  | "groups"
  | "follows"
  | "podcasts"
  | "admin";

export type NotifPrefs = Partial<Record<NotifGroup, boolean>>;

export const NOTIF_GROUPS: { key: NotifGroup; label: string; detail: string }[] = [
  { key: "games", label: "Défis & duels", detail: "Quand quelqu'un te défie en direct ou aux jeux." },
  { key: "messages", label: "Messages privés", detail: "Quand tu reçois un message." },
  { key: "prays", label: "Prières sur tes sujets", detail: "Quand on prie pour toi, et les nouvelles demandées." },
  { key: "comments", label: "Encouragements & mentions", detail: "Commentaires, réponses, réactions et mentions." },
  { key: "groups", label: "Groupes", detail: "Publications et messages de tes groupes." },
  { key: "follows", label: "Nouveaux abonnés", detail: "Quand quelqu'un s'abonne à toi." },
  { key: "podcasts", label: "Nouveaux épisodes", detail: "Quand un nouvel épisode de podcast sort." },
  { key: "admin", label: "Annonces", detail: "Les annonces de Pasteur Jack." },
];

/** Famille d'un type de notification (miroir côté edge notify-push). */
export function groupForType(type: string): NotifGroup {
  if (type === "challenge" || type === "friend_score") return "games";
  if (type === "message") return "messages";
  if (type === "pray" || type === "pray_digest" || type === "follow_up") return "prays";
  if (type.startsWith("group_")) return "groups";
  if (type === "follow") return "follows";
  if (type === "podcast") return "podcasts";
  if (type === "admin") return "admin";
  return "comments"; // comment, reply, mention, heart, comment_reaction…
}

export async function loadNotifPrefs(userId: string): Promise<NotifPrefs> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data } = await sb.from("profiles").select("notif_prefs").eq("id", userId).maybeSingle();
  return ((data?.notif_prefs as NotifPrefs) ?? {}) || {};
}

/** Langue de l'app enregistrée sur le profil : les annonces de podcasts (en
 * français) ne partent qu'aux membres qui utilisent l'app en français. */
export async function enregistrerLangueProfil(userId: string, langue: string): Promise<void> {
  const cle = "jb.langue.profil";
  try {
    if (localStorage.getItem(cle) === `${userId}:${langue}`) return;
  } catch {
    /* ignore */
  }
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("profiles").update({ langue }).eq("id", userId);
  if (error) return; // colonne pas encore créée (SQL) : on réessaiera
  try {
    localStorage.setItem(cle, `${userId}:${langue}`);
  } catch {
    /* ignore */
  }
}

export async function saveNotifPrefs(userId: string, prefs: NotifPrefs): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("profiles").update({ notif_prefs: prefs }).eq("id", userId);
}
