"use client";

import { getSupabase } from "./supabase";

/** Nom du bucket Storage des podcasts (public). */
const AUDIO_BUCKET = "audiovf";

export type AudioTrack = {
  id: string;
  title: string;
  url: string;
  path: string;
};

/** Nom de fichier lisible → titre affiché (conserve accents & apostrophes). */
function titleFromName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clé de stockage sûre (Supabase refuse accents, apostrophes, « ! »…). */
function safeKey(name: string): string {
  const ext = (name.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = name.replace(/\.[^.]+$/, "");
  const slug =
    base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "audio";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${slug}.${ext}`;
}

/** Liste les podcasts (table + URL publique du fichier). */
export async function listPodcasts(): Promise<AudioTrack[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("podcasts")
    .select("id,title,path")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as { id: string; title: string; path: string }[]).map((r) => {
    const { data: pub } = sb.storage.from(AUDIO_BUCKET).getPublicUrl(r.path);
    return { id: r.id, title: r.title, url: pub.publicUrl, path: r.path };
  });
}

/** Admin : envoie un fichier audio (nom technique propre, titre conservé). */
export async function uploadPodcast(file: File): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const key = safeKey(file.name);
  const { error } = await sb.storage
    .from(AUDIO_BUCKET)
    .upload(key, file, { contentType: file.type || "audio/mpeg", upsert: false });
  if (error) return false;
  const { error: e2 } = await sb.from("podcasts").insert({ title: titleFromName(file.name), path: key });
  if (e2) {
    // rollback du fichier si l'insertion échoue
    await sb.storage.from(AUDIO_BUCKET).remove([key]);
    return false;
  }
  return true;
}

/** Admin : supprime un podcast (fichier + entrée). */
export async function deletePodcast(id: string, path: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.storage.from(AUDIO_BUCKET).remove([path]);
  await sb.from("podcasts").delete().eq("id", id);
}
