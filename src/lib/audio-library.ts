"use client";

import { getSupabase } from "./supabase";

export type AudioTrack = {
  name: string;
  title: string;
  url: string;
  size?: number;
};

const AUDIO_RE = /\.(mp3|m4a|wav|aac|ogg)$/i;

/** Transforme un nom de fichier en titre lisible. */
function titleFromName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Liste les audios du bucket public « audio » (le nom de fichier = titre). */
export async function listAudio(): Promise<AudioTrack[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.storage
    .from("audio")
    .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error || !data) return [];
  return data
    .filter((f) => f.name && !f.name.startsWith(".") && AUDIO_RE.test(f.name))
    .map((f) => {
      const { data: pub } = sb.storage.from("audio").getPublicUrl(f.name);
      const size = (f as { metadata?: { size?: number } }).metadata?.size;
      return { name: f.name, title: titleFromName(f.name), url: pub.publicUrl, size };
    });
}
