"use client";

import { getSupabase } from "./supabase";
import type { Profile } from "./community";
import { compressWallImage } from "./wall";

/**
 * STORIES éphémères (24 h) façon Instagram : une photo (compressée sur le
 * téléphone) + légende optionnelle. Visibles par les abonnés de l'auteur
 * (RLS) pendant 24 heures, puis elles disparaissent du fil ; les fichiers
 * sont réutilisés depuis le bucket wallmedia.
 */

export type Story = {
  id: string;
  author_id: string;
  image_url: string;
  caption?: string | null;
  created_at: string;
  author?: Profile;
  viewed?: boolean;
};

export type StoryGroup = {
  author: Profile;
  stories: Story[];
  allViewed: boolean;
  mine: boolean;
};

const STORY_COLS = "id,author_id,image_url,caption,created_at";

function sinceIso(): string {
  return new Date(Date.now() - 24 * 3600 * 1000).toISOString();
}

/** Le fil des stories : les miennes d'abord, puis celles des gens que je
 * suis (le RLS ne sert que celles-là), groupées par auteur. */
export async function listStoryGroups(me: string): Promise<StoryGroup[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("stories")
    .select(STORY_COLS)
    .gt("created_at", sinceIso())
    .order("created_at", { ascending: true });
  const stories = (data as Story[]) ?? [];
  if (!stories.length) return [];

  const ids = stories.map((s) => s.id);
  const authorIds = [...new Set(stories.map((s) => s.author_id))];
  const [{ data: profs }, { data: views }] = await Promise.all([
    sb.from("profiles").select("id,pseudo,avatar_url,verified,name_color").in("id", authorIds),
    sb.from("story_views").select("story_id").eq("viewer_id", me).in("story_id", ids),
  ]);
  const byId = new Map((profs ?? []).map((p) => [p.id, p as Profile]));
  const seen = new Set((views ?? []).map((v) => v.story_id));

  const groups = new Map<string, StoryGroup>();
  for (const s of stories) {
    const author = byId.get(s.author_id);
    if (!author) continue;
    const g = groups.get(s.author_id) ?? {
      author,
      stories: [],
      allViewed: true,
      mine: s.author_id === me,
    };
    const viewed = seen.has(s.id);
    g.stories.push({ ...s, author, viewed });
    if (!viewed) g.allViewed = false;
    groups.set(s.author_id, g);
  }
  // Moi d'abord, puis les non-vues, puis le reste (plus récentes en tête).
  return [...groups.values()].sort((a, b) => {
    if (a.mine !== b.mine) return a.mine ? -1 : 1;
    if (a.allViewed !== b.allViewed) return a.allViewed ? 1 : -1;
    return (
      new Date(b.stories[b.stories.length - 1].created_at).getTime() -
      new Date(a.stories[a.stories.length - 1].created_at).getTime()
    );
  });
}

/** Publie une story : photo compressée (~200 Ko) + légende optionnelle. */
export async function addStory(me: string, file: File, caption?: string): Promise<Story | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const blob = await compressWallImage(file);
  if (!blob) return null;
  const path = `${me}/story-${Date.now()}.jpg`;
  const { error: upErr } = await sb.storage
    .from("wallmedia")
    .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (upErr) return null;
  const { data: pub } = sb.storage.from("wallmedia").getPublicUrl(path);
  const { data, error } = await sb
    .from("stories")
    .insert({ author_id: me, image_url: pub.publicUrl, caption: caption?.trim() || null })
    .select(STORY_COLS)
    .single();
  if (error) return null;
  return data as Story;
}

/** Marque une story comme vue (anime l'anneau et nourrit le compteur). */
export async function markStoryViewed(storyId: string, me: string) {
  await getSupabase()
    ?.from("story_views")
    .upsert({ story_id: storyId, viewer_id: me }, { onConflict: "story_id,viewer_id" });
}

/** Nombre de vues de MES stories (affiché dans le lecteur). */
export async function storyViewCounts(storyIds: string[], me?: string): Promise<Record<string, number>> {
  const sb = getSupabase();
  if (!sb || storyIds.length === 0) return {};
  const { data } = await sb.from("story_views").select("story_id,viewer_id").in("story_id", storyIds);
  const out: Record<string, number> = {};
  // Ma propre vue ne compte pas.
  for (const r of data ?? []) if (r.viewer_id !== me) out[r.story_id] = (out[r.story_id] ?? 0) + 1;
  return out;
}

export async function deleteStory(id: string, imageUrl?: string | null) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("stories").delete().eq("id", id);
  if (imageUrl) {
    const m = imageUrl.match(/\/wallmedia\/(.+)$/);
    if (m) await sb.storage.from("wallmedia").remove([decodeURIComponent(m[1])]);
  }
}

/* ---------------- Interactions façon Instagram ---------------- */

/** J'aime / je n'aime plus une story. */
export async function setStoryLike(storyId: string, me: string, on: boolean): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = on
    ? await sb.from("story_likes").upsert({ story_id: storyId, user_id: me }, { onConflict: "story_id,user_id" })
    : await sb.from("story_likes").delete().eq("story_id", storyId).eq("user_id", me);
  return !error;
}

/** Stories (parmi `storyIds`) que j'aime déjà. */
export async function myStoryLikes(storyIds: string[], me: string): Promise<Set<string>> {
  const sb = getSupabase();
  if (!sb || storyIds.length === 0) return new Set();
  const { data } = await sb.from("story_likes").select("story_id").eq("user_id", me).in("story_id", storyIds);
  return new Set((data ?? []).map((r) => r.story_id as string));
}

/** Nombre de j'aime de MES stories. */
export async function storyLikeCounts(storyIds: string[]): Promise<Record<string, number>> {
  const sb = getSupabase();
  if (!sb || storyIds.length === 0) return {};
  const { data } = await sb.from("story_likes").select("story_id").in("story_id", storyIds);
  const out: Record<string, number> = {};
  for (const r of data ?? []) out[r.story_id] = (out[r.story_id] ?? 0) + 1;
  return out;
}

export type StoryViewer = { profile: Profile; vuLe: string | null; aime: boolean };

/** Qui a vu MA story (plus récents d'abord), avec son j'aime. */
export async function storyViewers(storyId: string, me: string): Promise<StoryViewer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let vues = (await sb.from("story_views").select("viewer_id,vu_le").eq("story_id", storyId)).data as
    | { viewer_id: string; vu_le?: string | null }[]
    | null;
  // Migration pas encore passée (colonne vu_le absente) : sans l'heure.
  if (!vues) vues = (await sb.from("story_views").select("viewer_id").eq("story_id", storyId)).data ?? [];
  const ids = [...new Set(vues.map((v) => v.viewer_id))].filter((id) => id !== me);
  if (!ids.length) return [];
  const [{ data: profs }, { data: likes }] = await Promise.all([
    sb.from("profiles").select("id,pseudo,avatar_url,verified").in("id", ids),
    sb.from("story_likes").select("user_id").eq("story_id", storyId),
  ]);
  const aiment = new Set((likes ?? []).map((l) => l.user_id as string));
  const parId = new Map((profs ?? []).map((p) => [p.id as string, p as Profile]));
  return vues
    .filter((v) => parId.has(v.viewer_id) && v.viewer_id !== me)
    .map((v) => ({ profile: parId.get(v.viewer_id)!, vuLe: v.vu_le ?? null, aime: aiment.has(v.viewer_id) }))
    .sort((a, b) => Number(b.aime) - Number(a.aime) || (b.vuLe ?? "").localeCompare(a.vuLe ?? ""));
}

/** Répond à une story (texte ou réaction) : un message privé à son auteur,
 * relié à la story pour l'afficher dans la conversation. */
export async function replyToStory(me: string, story: Story, body: string): Promise<boolean> {
  const sb = getSupabase();
  const texte = body.trim();
  if (!sb || !texte || story.author_id === me) return false;
  const base = { sender_id: me, recipient_id: story.author_id, body: texte };
  const { error } = await sb.from("messages").insert({ ...base, story_id: story.id, story_image: story.image_url });
  if (!error) return true;
  // Base sans les colonnes story_* : le message part quand même, avec la mention.
  const { error: e2 } = await sb.from("messages").insert({ ...base, body: `Réponse à ta story : ${texte}` });
  return !e2;
}
