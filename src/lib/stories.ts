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
  /** Vide pour une story texte (sur fond coloré). */
  image_url: string | null;
  caption?: string | null;
  /** Fond d'une story texte (clé de FONDS_STORY). */
  fond?: string | null;
  /** Membres mentionnés (@pseudo). */
  mentions?: string[] | null;
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
const STORY_COLS_PLUS = "id,author_id,image_url,caption,fond,mentions,created_at";

/** Fonds des stories texte (dégradés de la charte). */
export const FONDS_STORY: Record<string, string> = {
  aurore: "linear-gradient(160deg,#CAF000 0%,#7FB800 55%,#2F5D00 100%)",
  nuit: "linear-gradient(160deg,#1F2A44 0%,#0B0F1A 100%)",
  braise: "linear-gradient(160deg,#F5A623 0%,#E0662B 55%,#8A1F2B 100%)",
  ciel: "linear-gradient(160deg,#7DD3FC 0%,#3B82F6 55%,#1E3A8A 100%)",
  lavande: "linear-gradient(160deg,#C4B5FD 0%,#8B5CF6 55%,#4C1D95 100%)",
  rose: "linear-gradient(160deg,#FDA4AF 0%,#F43F5E 55%,#881337 100%)",
  sable: "linear-gradient(160deg,#FAF6F0 0%,#E9DCC6 100%)",
};
/** Le texte est sombre sur les fonds clairs. */
export const FONDS_CLAIRS = new Set(["aurore", "sable"]);

/** @pseudo cités dans un texte. */
export function pseudosCites(texte: string): string[] {
  return [...new Set([...texte.matchAll(/(?:^|\s)@([\p{L}\p{N}_.-]{1,30})/gu)].map((m) => m[1]))];
}

function sinceIso(): string {
  return new Date(Date.now() - 24 * 3600 * 1000).toISOString();
}

/** Le fil des stories : les miennes d'abord, puis celles des gens que je
 * suis (le RLS ne sert que celles-là), groupées par auteur. */
export async function listStoryGroups(me: string): Promise<StoryGroup[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let res = await sb.from("stories").select(STORY_COLS_PLUS).gt("created_at", sinceIso()).order("created_at", { ascending: true });
  // SQL des stories texte pas encore lancé : colonnes d'avant.
  if (res.error) res = (await sb.from("stories").select(STORY_COLS).gt("created_at", sinceIso()).order("created_at", { ascending: true })) as typeof res;
  const stories = (res.data as Story[]) ?? [];
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

/** Publie une story : photo compressée (~200 Ko) + légende, ou texte sur
 * fond coloré (sans photo). Les @pseudo cités sont mentionnés (prévenus). */
export async function addStory(
  me: string,
  file: File | null,
  caption?: string,
  options: { fond?: string | null; mentions?: string[] } = {},
): Promise<Story | null> {
  const sb = getSupabase();
  if (!sb) return null;
  let imageUrl: string | null = null;
  if (file) {
    const blob = await compressWallImage(file);
    if (!blob) return null;
    const path = `${me}/story-${Date.now()}.jpg`;
    const { error: upErr } = await sb.storage
      .from("wallmedia")
      .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
    if (upErr) return null;
    imageUrl = sb.storage.from("wallmedia").getPublicUrl(path).data.publicUrl;
  } else if (!caption?.trim()) return null;
  const base = { author_id: me, image_url: imageUrl, caption: caption?.trim() || null };
  const plus = {
    ...(options.fond ? { fond: options.fond } : {}),
    ...(options.mentions?.length ? { mentions: options.mentions } : {}),
  };
  let { data, error } = await sb.from("stories").insert({ ...base, ...plus }).select(STORY_COLS).single();
  // Colonnes pas encore créées : une story photo part quand même (sans mentions).
  if (error && imageUrl && Object.keys(plus).length) ({ data, error } = await sb.from("stories").insert(base).select(STORY_COLS).single());
  if (error) return null;
  return { ...(data as Story), ...plus };
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
  // L'image reste si la story a été mise « à la une ».
  if (imageUrl) {
    const { data: alaune } = await sb.from("story_alaune_items").select("id").eq("image_url", imageUrl).limit(1);
    if (alaune?.length) return;
  }
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
  const { error } = await sb.from("messages").insert({ ...base, story_id: story.id, story_image: story.image_url ?? null });
  if (!error) return true;
  // Base sans les colonnes story_* : le message part quand même, avec la mention.
  const { error: e2 } = await sb.from("messages").insert({ ...base, body: `Réponse à ta story : ${texte}` });
  return !e2;
}

/* ---------------- Stories « à la une » (restent sur le profil) ---------------- */

export type AlaUneItem = { id: string; alaune_id: string; image_url: string | null; caption: string | null; fond: string | null; created_at: string };
export type AlaUne = { id: string; user_id: string; titre: string; position: number; items: AlaUneItem[] };

/** Les stories à la une d'un membre (vide si le SQL n'est pas encore lancé). */
export async function listAlaUne(userId: string): Promise<AlaUne[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("story_alaune").select("id,user_id,titre,position").eq("user_id", userId).order("position").order("created_at");
  if (error || !data?.length) return [];
  const ids = data.map((a) => a.id as string);
  const { data: items } = await sb
    .from("story_alaune_items")
    .select("id,alaune_id,image_url,caption,fond,created_at")
    .in("alaune_id", ids)
    .order("created_at");
  return (data as Omit<AlaUne, "items">[]).map((a) => ({
    ...a,
    items: ((items as AlaUneItem[]) ?? []).filter((i) => i.alaune_id === a.id),
  }));
}

/** Crée une nouvelle story à la une (titre court : « Témoignages », « Culte »…). */
export async function creerAlaUne(me: string, titre: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb || !titre.trim()) return null;
  const { data, error } = await sb.from("story_alaune").insert({ user_id: me, titre: titre.trim().slice(0, 30) }).select("id").single();
  return error ? null : (data.id as string);
}

/** Ajoute une story (copiée : elle reste après les 24 h) à une story à la une. */
export async function ajouterALaUne(me: string, alauneId: string, story: Story): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("story_alaune_items").insert({
    alaune_id: alauneId,
    user_id: me,
    image_url: story.image_url ?? null,
    caption: story.caption ?? null,
    fond: story.fond ?? null,
  });
  return !error;
}

export async function retirerDeLaUne(itemId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("story_alaune_items").delete().eq("id", itemId);
  return !error;
}

export async function supprimerAlaUne(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("story_alaune").delete().eq("id", id);
  return !error;
}
