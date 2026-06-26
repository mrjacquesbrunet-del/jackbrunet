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
export type Comment = {
  id: string;
  prayer_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Profile;
};
export type Reaction = { prayer_id: string; user_id: string; type: "heart" | "pray" };

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
  return sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/communaute/` },
  });
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

export async function createPrayer(body: string, visibility: Visibility, authorId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("prayers").insert({ body, visibility, author_id: authorId });
}

export async function deletePrayer(id: string) {
  await getSupabase()?.from("prayers").delete().eq("id", id);
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
