"use client";

import { getSupabase } from "./supabase";

/** Bucket public des médias importés depuis le CMS (cartes, visuels…). */
const BUCKET = "medias";

export type MediaItem = { name: string; url: string; updatedAt?: string };

/** Nettoie un nom de fichier (garde lettres/chiffres/tirets/point). */
function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  const ext = (dot >= 0 ? name.slice(dot + 1) : "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  return `${base}.${ext}`;
}

/** Liste les médias du bucket (plus récents d'abord) avec leur URL publique. */
export async function listMedia(): Promise<MediaItem[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.storage
    .from(BUCKET)
    .list("", { limit: 1000, sortBy: { column: "updated_at", order: "desc" } });
  if (error || !data) return [];
  return data
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => ({
      name: f.name,
      url: sb.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      updatedAt: (f as { updated_at?: string }).updated_at,
    }));
}

export type UploadResult = { name: string; ok: boolean; url?: string; error?: string };

/**
 * Importe PLUSIEURS images d'un coup. `onProgress(done, total)` est appelé
 * après chaque fichier pour l'affichage de la progression.
 */
export async function uploadMedia(
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadResult[]> {
  const sb = getSupabase();
  if (!sb) return files.map((f) => ({ name: f.name, ok: false, error: "hors ligne" }));
  const results: UploadResult[] = [];
  let done = 0;
  for (const file of files) {
    const name = safeName(file.name);
    const { error } = await sb.storage.from(BUCKET).upload(name, file, {
      upsert: true,
      contentType: file.type || "image/png",
      cacheControl: "3600",
    });
    if (error) {
      results.push({ name, ok: false, error: error.message });
    } else {
      results.push({ name, ok: true, url: sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl });
    }
    done += 1;
    onProgress?.(done, files.length);
  }
  return results;
}

export async function deleteMedia(name: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.storage.from(BUCKET).remove([name]);
  return !error;
}
