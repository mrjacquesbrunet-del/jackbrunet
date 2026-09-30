"use client";

import { getSupabase } from "./supabase";
import type { Profile, Visibility } from "./community";

/**
 * LE MUR — le réseau social de l'app, façon page Facebook :
 * publications texte, verset (belle carte) ou lien (réseaux connus
 * uniquement), visibles en Public ou entre Amis (= on se suit
 * mutuellement), avec réactions, commentaires et relais.
 * Le mur de PRIÈRE (/communaute) reste un lieu à part.
 */

export type WallVisibility = Exclude<Visibility, "private">;

export type WallPost = {
  id: string;
  author_id: string;
  body: string;
  visibility: WallVisibility;
  verse_ref?: string | null;
  verse_text?: string | null;
  link_url?: string | null;
  /** Photo jointe (URL publique du bucket wallmedia, compressée à l'envoi). */
  image_url?: string | null;
  /** Relais d'une autre publication (id) — le post original est joint. */
  reshare_of?: string | null;
  created_at: string;
  author?: Profile;
  original?: WallPost | null;
};

export type WallComment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Profile;
};

export type WallReaction = { post_id: string; user_id: string; type: string };

/** Liens autorisés : les réseaux de confiance uniquement (anti-spam). */
const ALLOWED_LINK_HOSTS = [
  "facebook.com",
  "fb.watch",
  "instagram.com",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
  "jackbrunet.com",
];

/** Vérifie et normalise un lien ; renvoie null s'il n'est pas autorisé. */
export function sanitizeWallLink(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const ok = ALLOWED_LINK_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  return ok ? url.toString() : null;
}

/** La plateforme d'un lien autorisé (pour l'icône de la carte lien). */
export function linkPlatform(url: string): "facebook" | "instagram" | "tiktok" | "youtube" | "site" {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("facebook") || host.includes("fb.watch")) return "facebook";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("youtube") || host.includes("youtu.be")) return "youtube";
  } catch {
    /* ignore */
  }
  return "site";
}

const POST_COLS =
  "id,author_id,body,visibility,verse_ref,verse_text,link_url,image_url,reshare_of,created_at";

/**
 * Compresse une photo côté téléphone AVANT l'envoi : 1080 px maxi, JPEG
 * qualité 0.82 → ~150-300 Ko par photo. C'est ce qui rend le mur photo
 * viable en stockage comme en bande passante.
 */
export async function compressWallImage(file: File): Promise<Blob | null> {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const max = 1080;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82),
    );
  } catch {
    return null;
  }
}

/** Envoie la photo (déjà compressée) et renvoie son URL publique. */
export async function uploadWallImage(userId: string, file: File): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const blob = await compressWallImage(file);
  if (!blob) return null;
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
  const { error } = await sb.storage
    .from("wallmedia")
    .upload(path, blob, { contentType: "image/jpeg" });
  if (error) return null;
  const { data } = sb.storage.from("wallmedia").getPublicUrl(path);
  return data.publicUrl ?? null;
}

/** Joint les profils auteurs (et les posts originaux des relais). */
async function hydrate(posts: WallPost[]): Promise<WallPost[]> {
  const sb = getSupabase();
  if (!sb || posts.length === 0) return posts;
  const origIds = posts.map((p) => p.reshare_of).filter(Boolean) as string[];
  let originals: WallPost[] = [];
  if (origIds.length) {
    const { data } = await sb.from("wall_posts").select(POST_COLS).in("id", origIds);
    originals = (data as WallPost[]) ?? [];
  }
  const authorIds = [
    ...new Set([...posts.map((p) => p.author_id), ...originals.map((p) => p.author_id)]),
  ];
  const { data: profs } = await sb
    .from("profiles")
    .select("id,pseudo,avatar_url,verified,name_color,badge_tier,is_moderator")
    .in("id", authorIds);
  const byId = new Map((profs ?? []).map((p) => [p.id, p as Profile]));
  const byPost = new Map(originals.map((p) => [p.id, { ...p, author: byId.get(p.author_id) }]));
  return posts.map((p) => ({
    ...p,
    author: byId.get(p.author_id),
    original: p.reshare_of ? (byPost.get(p.reshare_of) ?? null) : null,
  }));
}

/** Fil public (tout le monde), paginé par date. */
export async function listPublicWall(before?: string, limit = 20): Promise<WallPost[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let q = sb
    .from("wall_posts")
    .select(POST_COLS)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  return hydrate((data as WallPost[]) ?? []);
}

/** Fil « Amis » : les publications des gens que je suis (le RLS ne laisse
 * passer leurs posts « amis » que si l'amitié est mutuelle). */
export async function listFriendsWall(
  followingIds: string[],
  before?: string,
  limit = 20,
): Promise<WallPost[]> {
  const sb = getSupabase();
  if (!sb || followingIds.length === 0) return [];
  let q = sb
    .from("wall_posts")
    .select(POST_COLS)
    .in("author_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  return hydrate((data as WallPost[]) ?? []);
}

/** Le mur d'une personne (le mien ou celui d'un membre). */
export async function listUserWall(userId: string, before?: string, limit = 20): Promise<WallPost[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let q = sb
    .from("wall_posts")
    .select(POST_COLS)
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  return hydrate((data as WallPost[]) ?? []);
}

export async function createWallPost(input: {
  authorId: string;
  body: string;
  visibility: WallVisibility;
  verseRef?: string;
  verseText?: string;
  linkUrl?: string;
  imageUrl?: string;
  reshareOf?: string;
}): Promise<WallPost | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("wall_posts")
    .insert({
      author_id: input.authorId,
      body: input.body.trim(),
      visibility: input.visibility,
      verse_ref: input.verseRef ?? null,
      verse_text: input.verseText ?? null,
      link_url: input.linkUrl ?? null,
      image_url: input.imageUrl ?? null,
      reshare_of: input.reshareOf ?? null,
    })
    .select(POST_COLS)
    .single();
  if (error) return null;
  return data as WallPost;
}

export async function deleteWallPost(id: string, imageUrl?: string | null) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("wall_posts").delete().eq("id", id);
  // La photo jointe part avec la publication (pas de fichiers orphelins).
  if (imageUrl) {
    const m = imageUrl.match(/\/wallmedia\/(.+)$/);
    if (m) await sb.storage.from("wallmedia").remove([decodeURIComponent(m[1])]);
  }
}

/** Nombre de publications d'un membre (compteur de l'en-tête). */
export async function countUserPosts(userId: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { count } = await sb
    .from("wall_posts")
    .select("*", { count: "exact", head: true })
    .eq("author_id", userId);
  return count ?? 0;
}

// ————— Réactions (mêmes gestes que le mur de prière : 🙏 ❤️ 🕊️ 🙌 ✨) —————
export async function wallReactionsFor(postIds: string[]): Promise<WallReaction[]> {
  const sb = getSupabase();
  if (!sb || postIds.length === 0) return [];
  const { data } = await sb.from("wall_reactions").select("post_id,user_id,type").in("post_id", postIds);
  return (data as WallReaction[]) ?? [];
}

export async function toggleWallReaction(postId: string, userId: string, type: string, on: boolean) {
  const sb = getSupabase();
  if (!sb) return;
  if (on) {
    await sb.from("wall_reactions").upsert({ post_id: postId, user_id: userId, type });
  } else {
    await sb.from("wall_reactions").delete().eq("post_id", postId).eq("user_id", userId);
  }
}

// ————— Commentaires —————
export async function listWallComments(postId: string): Promise<WallComment[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("wall_comments")
    .select("id,post_id,author_id,body,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  const comments = (data as WallComment[]) ?? [];
  if (!comments.length) return comments;
  const { data: profs } = await sb
    .from("profiles")
    .select("id,pseudo,avatar_url,verified,name_color")
    .in("id", [...new Set(comments.map((c) => c.author_id))]);
  const byId = new Map((profs ?? []).map((p) => [p.id, p as Profile]));
  return comments.map((c) => ({ ...c, author: byId.get(c.author_id) }));
}

export async function wallCommentCounts(postIds: string[]): Promise<Record<string, number>> {
  const sb = getSupabase();
  if (!sb || postIds.length === 0) return {};
  const { data } = await sb.from("wall_comments").select("post_id").in("post_id", postIds);
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.post_id] = (out[row.post_id] ?? 0) + 1;
  return out;
}

export async function addWallComment(postId: string, authorId: string, body: string): Promise<WallComment | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("wall_comments")
    .insert({ post_id: postId, author_id: authorId, body: body.trim() })
    .select("id,post_id,author_id,body,created_at")
    .single();
  if (error) return null;
  return data as WallComment;
}

export async function deleteWallComment(id: string) {
  await getSupabase()?.from("wall_comments").delete().eq("id", id);
}
