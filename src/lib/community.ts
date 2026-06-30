"use client";

import { getSupabase } from "./supabase";

export type FavoriteVerse = { reference: string; text: string };
export type Profile = {
  id: string;
  pseudo: string;
  avatar_url: string | null;
  bio?: string | null;
  favorite_verses?: FavoriteVerse[];
};
export type Visibility = "public" | "friends" | "private";
export type Prayer = {
  id: string;
  author_id: string;
  body: string;
  visibility: Visibility;
  answered: boolean;
  created_at: string;
  author?: Profile;
};

/** Emails administrateurs (modération + annonces). Ajoute-en ici au besoin. */
export const ADMIN_EMAILS = ["contact@jackbrunet.com", "mr.jacquesbrunet@gmail.com"];
export const ADMIN_EMAIL = ADMIN_EMAILS[0];
export function isAdminEmail(email?: string | null) {
  return ADMIN_EMAILS.includes((email ?? "").trim().toLowerCase());
}
export type Comment = {
  id: string;
  prayer_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Profile;
};
export type Reaction = { prayer_id: string; user_id: string; type: "heart" | "pray" };
export type NotifType = "pray" | "heart" | "comment" | "follow" | "mention" | "admin";
export type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotifType;
  prayer_id: string | null;
  body?: string | null;
  link?: string | null;
  read: boolean;
  created_at: string;
  actor?: Profile;
};

/* ---- Auth ---- */
export async function signInEmail(email: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  return sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/communaute/` },
  });
}

export async function signInGoogle() {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/communaute/` },
  });
  if (error) throw error;
  // Au cas où la redirection automatique ne se déclenche pas (certains
  // navigateurs mobiles), on force la navigation vers l'URL d'autorisation.
  if (data?.url) window.location.assign(data.url);
  return data;
}

export async function signInApple() {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "apple",
    options: { redirectTo: `${window.location.origin}/communaute/` },
  });
  if (error) throw error;
  if (data?.url) window.location.assign(data.url);
  return data;
}

/** Inscription e-mail + mot de passe (100% dans l'app, sans navigateur). */
export async function signUpEmailPassword(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

/** Connexion e-mail + mot de passe (100% dans l'app). */
export async function signInEmailPassword(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Suppression du compte (exigence App Store) via une fonction Supabase. */
export async function deleteAccount(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.rpc("delete_user");
  if (error) return false;
  await sb.auth.signOut();
  return true;
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}

/* ---- Profils ---- */
export async function getProfile(id: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("profiles")
    .select("id,pseudo,avatar_url,bio,favorite_verses")
    .eq("id", id)
    .single();
  return (data as Profile) ?? null;
}

export async function updateProfile(id: string, patch: Partial<Profile>) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("profiles").update(patch).eq("id", id);
}

/** Ajoute un verset aux versets publics du profil (dédupliqué). */
export async function addFavoriteVerse(userId: string, v: FavoriteVerse): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const profile = await getProfile(userId);
  const current = profile?.favorite_verses ?? [];
  const exists = current.some(
    (x) => x.text.trim() === v.text.trim() && (x.reference ?? "") === (v.reference ?? ""),
  );
  if (exists) return true;
  const next = [...current, { reference: v.reference.trim(), text: v.text.trim() }];
  const { error } = await sb.from("profiles").update({ favorite_verses: next }).eq("id", userId);
  return !error;
}

async function profilesByIds(ids: string[]): Promise<Record<string, Profile>> {
  const sb = getSupabase();
  if (!sb || ids.length === 0) return {};
  const { data } = await sb
    .from("profiles")
    .select("id,pseudo,avatar_url")
    .in("id", Array.from(new Set(ids)));
  const map: Record<string, Profile> = {};
  for (const p of (data as Profile[]) ?? []) map[p.id] = p;
  return map;
}

/* ---- Prières ---- */
export async function listPrayers(): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("prayers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);
  const prayers = (data as Prayer[]) ?? [];
  const profs = await profilesByIds(prayers.map((p) => p.author_id));
  return prayers.map((p) => ({ ...p, author: profs[p.author_id] }));
}

/** Prières exaucées publiques (« témoignages ») — les plus récentes. */
export async function listAnsweredPrayers(): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("prayers")
    .select("*")
    .eq("answered", true)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(60);
  const prayers = (data as Prayer[]) ?? [];
  const profs = await profilesByIds(prayers.map((p) => p.author_id));
  return prayers.map((p) => ({ ...p, author: profs[p.author_id] }));
}

export async function listMyPrayers(userId: string): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("prayers")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  return (data as Prayer[]) ?? [];
}

export async function createPrayer(
  body: string,
  visibility: Visibility,
  authorId: string,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("prayers")
    .insert({ body, visibility, author_id: authorId })
    .select("id")
    .single();
  return (data as { id: string } | null)?.id ?? null;
}

export async function deletePrayer(id: string) {
  await getSupabase()?.from("prayers").delete().eq("id", id);
}

/** Marque une prière comme exaucée (« Dieu a agi ») ou la rouvre. */
export async function setPrayerAnswered(id: string, answered: boolean) {
  await getSupabase()?.from("prayers").update({ answered }).eq("id", id);
}

/* ---- Réactions ---- */
export async function reactionsFor(prayerIds: string[]): Promise<Reaction[]> {
  const sb = getSupabase();
  if (!sb || prayerIds.length === 0) return [];
  const { data } = await sb
    .from("prayer_reactions")
    .select("prayer_id,user_id,type")
    .in("prayer_id", prayerIds);
  return (data as Reaction[]) ?? [];
}

export async function toggleReaction(
  prayerId: string,
  userId: string,
  type: "heart" | "pray",
  on: boolean,
) {
  const sb = getSupabase();
  if (!sb) return;
  if (on) {
    await sb.from("prayer_reactions").insert({ prayer_id: prayerId, user_id: userId, type });
  } else {
    await sb
      .from("prayer_reactions")
      .delete()
      .eq("prayer_id", prayerId)
      .eq("user_id", userId)
      .eq("type", type);
  }
}

/* ---- Commentaires ---- */
export async function listComments(prayerId: string): Promise<Comment[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("prayer_comments")
    .select("*")
    .eq("prayer_id", prayerId)
    .order("created_at", { ascending: true });
  const comments = (data as Comment[]) ?? [];
  const profs = await profilesByIds(comments.map((c) => c.author_id));
  return comments.map((c) => ({ ...c, author: profs[c.author_id] }));
}

export async function addComment(prayerId: string, body: string, authorId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("prayer_comments").insert({ prayer_id: prayerId, body, author_id: authorId });
}

export async function deleteComment(id: string) {
  await getSupabase()?.from("prayer_comments").delete().eq("id", id);
}

/** Téléverse une photo de profil et renvoie son URL publique. */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await sb.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
  if (error) return null;
  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl ?? null;
}

/* ---- Abonnements (follow) ---- */
export async function follow(followingId: string, followerId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("follows").insert({ follower_id: followerId, following_id: followingId });
}

export async function unfollow(followingId: string, followerId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
}

export async function isFollowing(followingId: string, followerId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data } = await sb
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
}

/** { followers, following } pour un profil. */
export async function followCounts(userId: string): Promise<{ followers: number; following: number }> {
  const sb = getSupabase();
  if (!sb) return { followers: 0, following: 0 };
  const [{ count: followers }, { count: following }] = await Promise.all([
    sb.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    sb.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

/** Recherche de membres par pseudo. */
export async function searchProfiles(query: string, limit = 20): Promise<Profile[]> {
  const sb = getSupabase();
  const q = query.trim();
  if (!sb || q.length < 2) return [];
  const { data } = await sb
    .from("profiles")
    .select("id,pseudo,avatar_url")
    .ilike("pseudo", `%${q}%`)
    .limit(limit);
  return (data as Profile[]) ?? [];
}

/** Admin : envoie une notification à TOUS les membres (ex. live de prière).
 *  Renvoie le nombre de membres notifiés, ou null en cas d'échec. */
export async function broadcastNotification(
  message: string,
  link?: string | null,
): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("broadcast_notification", {
    message: message.trim(),
    link: link?.trim() || null,
  });
  if (error) return null;
  return typeof data === "number" ? data : 0;
}

/** Vrai si le pseudo est déjà pris par un AUTRE membre (insensible à la casse). */
export async function isPseudoTaken(pseudo: string, selfId: string): Promise<boolean> {
  const sb = getSupabase();
  const p = pseudo.trim();
  if (!sb || !p) return false;
  const { data } = await sb
    .from("profiles")
    .select("id")
    .ilike("pseudo", p)
    .neq("id", selfId)
    .limit(1);
  return ((data as { id: string }[]) ?? []).length > 0;
}

/** Profil correspondant exactement à un pseudo (insensible à la casse). */
export async function getProfileByPseudo(pseudo: string): Promise<Profile | null> {
  const sb = getSupabase();
  const p = pseudo.trim();
  if (!sb || !p) return null;
  const { data } = await sb
    .from("profiles")
    .select("id,pseudo,avatar_url")
    .ilike("pseudo", p)
    .limit(1)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

/** Extrait les pseudos mentionnés (@pseudo) d'un texte. */
export function extractMentions(text: string): string[] {
  const out = new Set<string>();
  // Pseudos : lettres/chiffres/_/-/accents/espace insécable exclus.
  const re = /@([\p{L}\p{N}_.-]{2,30})/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.add(m[1]);
  return Array.from(out);
}

/** Crée une notification « mention » pour chaque membre cité (@pseudo). */
export async function notifyMentions(text: string, actorId: string, prayerId?: string | null) {
  const sb = getSupabase();
  if (!sb) return;
  const pseudos = extractMentions(text);
  if (pseudos.length === 0) return;
  const { data } = await sb.from("profiles").select("id,pseudo").in("pseudo", pseudos);
  const targets = ((data as { id: string }[]) ?? []).map((r) => r.id).filter((id) => id !== actorId);
  await Promise.all(
    targets.map((target) =>
      sb.rpc("notify_mention", { target, prayer: prayerId ?? null }).then(
        () => undefined,
        () => undefined,
      ),
    ),
  );
}

/** Ids des membres auxquels je suis abonné. */
export async function listFollowingIds(userId: string): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("follows").select("following_id").eq("follower_id", userId);
  return ((data as { following_id: string }[]) ?? []).map((r) => r.following_id);
}

/** Suggestions de membres à suivre (intercesseurs), façon Instagram :
 *  on exclut soi-même et les personnes déjà suivies. */
export async function suggestedProfiles(userId: string, limit = 12): Promise<Profile[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const exclude = new Set(await listFollowingIds(userId));
  exclude.add(userId);
  const { data } = await sb
    .from("profiles")
    .select("id,pseudo,avatar_url,bio")
    .limit(limit + exclude.size + 12);
  return ((data as Profile[]) ?? []).filter((p) => !exclude.has(p.id)).slice(0, limit);
}

/** Fil des prières des membres que je suis (+ les miennes). */
export async function listFollowingFeed(userId: string): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const ids = await listFollowingIds(userId);
  const authors = Array.from(new Set([...ids, userId]));
  const { data } = await sb
    .from("prayers")
    .select("*")
    .in("author_id", authors)
    .order("created_at", { ascending: false })
    .limit(60);
  const prayers = (data as Prayer[]) ?? [];
  const profs = await profilesByIds(prayers.map((p) => p.author_id));
  return prayers.map((p) => ({ ...p, author: profs[p.author_id] }));
}

/** Activité (pour le grade de prière). */
export async function getActivity(
  userId: string,
): Promise<{ prayers: number; comments: number; prays: number }> {
  const sb = getSupabase();
  if (!sb) return { prayers: 0, comments: 0, prays: 0 };
  const { data } = await sb.rpc("user_activity", { uid: userId });
  const row = Array.isArray(data) ? data[0] : data;
  return {
    prayers: row?.prayers ?? 0,
    comments: row?.comments ?? 0,
    prays: row?.prays ?? 0,
  };
}

/* ---- Notifications ---- */
export async function listNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const notifs = (data as Notification[]) ?? [];
  const profs = await profilesByIds(notifs.map((n) => n.actor_id).filter(Boolean) as string[]);
  return notifs.map((n) => ({ ...n, actor: n.actor_id ? profs[n.actor_id] : undefined }));
}

export async function unreadCount(userId: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { count } = await sb
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count ?? 0;
}

export async function markNotificationsRead(userId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

/** Prières visibles d'un membre donné (RLS filtre public / abonnés). */
export async function listPrayersByAuthor(authorId: string): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("prayers")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(60);
  return (data as Prayer[]) ?? [];
}
