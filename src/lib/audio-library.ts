"use client";

import { getSupabase } from "./supabase";
import { compressToMonoMp3 } from "./audio-compress";

/** Nom du bucket Storage des podcasts (public). */
const AUDIO_BUCKET = "audiovf";

export type AudioTrack = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  path: string;
  created_at?: string;
  /** Épisode de podcast : la position d'écoute est mémorisée (reprise). */
  memoriser?: boolean;
  /** Émission à laquelle appartient l'épisode (podcasts). */
  show_id?: string | null;
  /** Pochette (celle de l'émission). */
  cover?: string | null;
  showTitle?: string;
  showDescription?: string | null;
  author?: string | null;
  /** Numéro de l'épisode dans son émission (1 = le plus ancien). */
  numero?: number;
};

/** Émission de podcast (un intervenant, une pochette). */
export type Emission = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  category: string | null;
  cover: string | null;
  cover_path: string | null;
  position: number;
};

/** Nom de fichier lisible → titre affiché (conserve accents & apostrophes). */
function titleFromName(name: string): string {
  let t = name.replace(/\.[^.]+$/, ""); // extension
  t = t.replace(/[_]+/g, " "); // underscores → espaces
  t = t.replace(/^\s*\d{1,3}\s*[-.)]\s*/, ""); // "01 - " en tête
  t = t.replace(/\s*-\s*/g, ", "); // tirets propres
  t = t.replace(/\s+/g, " ").trim();
  if (t) t = t.charAt(0).toUpperCase() + t.slice(1); // 1re lettre en majuscule
  return t;
}

/** Clé de stockage sûre (Supabase refuse accents, apostrophes, «! »…). */
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

/** Durée « m:ss » lisible (vide si inconnue). */
export function formatDuration(sec: number | undefined): string {
  if (!sec ||!Number.isFinite(sec) || sec <= 0) return "";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Lit la durée d'un audio distant (métadonnées seules), en secondes. */
export function loadAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(0);
    const a = document.createElement("audio");
    a.preload = "metadata";
    a.onloadedmetadata = () => resolve(Number.isFinite(a.duration)? a.duration: 0);
    a.onerror = () => resolve(0);
    a.src = url;
  });
}

/** Liste les podcasts (table + URL publique du fichier). */
export async function listPodcasts(): Promise<AudioTrack[]> {
  const sb = getSupabase();
  if (!sb) return [];
  // Avec l'émission (migration-podcast-shows.sql) ; sinon, l'ancien format.
  let res = await sb
.from("podcasts")
.select("id,title,description,path,created_at,show_id")
.order("created_at", { ascending: false });
  if (res.error) {
    res = (await sb
.from("podcasts")
.select("id,title,description,path,created_at")
.order("created_at", { ascending: false })) as typeof res;
  }
  const { data, error } = res;
  if (error ||!data) return [];
  return (
    data as { id: string; title: string; description: string | null; path: string; created_at: string; show_id?: string | null }[]
  ).map((r) => {
    const { data: pub } = sb.storage.from(AUDIO_BUCKET).getPublicUrl(r.path);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      url: pub.publicUrl,
      path: r.path,
      created_at: r.created_at,
      memoriser: true,
      show_id: r.show_id ?? null,
    };
  });
}

/** Admin: modifie le titre / la description d'un podcast. */
export async function updatePodcast(
  id: string,
  patch: { title?: string; description?: string | null },
): Promise<void> {
  await getSupabase()?.from("podcasts").update(patch).eq("id", id);
}

/** Admin: envoie un fichier audio (nom technique propre, titre conservé).
 * Renvoie l'épisode créé (id + titre), ou null en cas d'échec. */
export async function uploadPodcast(file: File, showId?: string | null): Promise<{ id: string; title: string } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const out = await compressToMonoMp3(file); // 48 kbps mono → moins de bande passante
  const key = safeKey(out.name); // l'extension suit le fichier réellement envoyé
  const { error } = await sb.storage
.from(AUDIO_BUCKET)
.upload(key, out, { contentType: "audio/mpeg", upsert: false });
  if (error) return null;
  const ligne: Record<string, unknown> = { title: titleFromName(file.name), path: key };
  if (showId && showId !== "par-defaut") ligne.show_id = showId;
  const { data, error: e2 } = await sb.from("podcasts").insert(ligne).select("id,title").single();
  if (e2 || !data) {
    // rollback du fichier si l'insertion échoue
    await sb.storage.from(AUDIO_BUCKET).remove([key]);
    return null;
  }
  return data as { id: string; title: string };
}

/** Les plus écoutés : nombre d'auditeurs (appareils) par épisode, sur 90 jours.
 * Vide tant que le SQL migration-podcasts-plus.sql n'est pas exécuté. */
export async function listerPopulaires(): Promise<Record<string, number>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data, error } = await sb.rpc("podcasts_populaires", { jours: 90 });
  if (error || !data) return {};
  const out: Record<string, number> = {};
  for (const r of data as { podcast_id: string; ecoutes: number }[]) out[r.podcast_id] = Number(r.ecoutes) || 0;
  return out;
}

/** Admin : prévient tout le monde d'un nouvel épisode (cloche + push,
 * selon la préférence « Nouveaux épisodes »). Renvoie le nombre de personnes. */
export async function notifierNouvelEpisode(message: string, lien: string): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("notifier_nouvel_episode", { message, lien });
  return error ? null : Number(data) || 0;
}

/** Admin: supprime un podcast (fichier + entrée). */
export async function deletePodcast(id: string, path: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.storage.from(AUDIO_BUCKET).remove([path]);
  await sb.from("podcasts").delete().eq("id", id);
}


/* ————— Émissions (plusieurs intervenants) ————— */

const EMISSION_PAR_DEFAUT_ID = "par-defaut";
const POCHETTE_RHEMA_DU_JOUR = "/img/podcast/rhema-du-jour.jpg";

/** Pochette : fichier du bucket audio, ou image fournie avec l'app (« /img/… »). */
function urlPublique(path: string | null): string | null {
  if (path && /^(\/|https?:)/.test(path)) return path;
  const sb = getSupabase();
  if (!sb || !path) return null;
  return sb.storage.from(AUDIO_BUCKET).getPublicUrl(path).data.publicUrl ?? null;
}

/** Les émissions, dans l'ordre choisi. Sans la table (SQL pas encore
 * exécuté) : une seule émission, celle de Pasteur Jack. */
export async function listEmissions(): Promise<Emission[]> {
  const sb = getSupabase();
  const defaut: Emission[] = [
    {
      id: EMISSION_PAR_DEFAUT_ID,
      title: "RHEMA du jour",
      author: "Pasteur Jack Brunet",
      description: "Une parole courte pour chaque jour : quelques minutes pour nourrir ta foi, où que tu sois.",
      category: "Parole du jour",
      cover: POCHETTE_RHEMA_DU_JOUR,
      cover_path: POCHETTE_RHEMA_DU_JOUR,
      position: 0,
    },
  ];
  if (!sb) return defaut;
  const { data, error } = await sb.from("podcast_shows").select("*").order("position").order("created_at");
  if (error || !data || data.length === 0) return defaut;
  return (data as Omit<Emission, "cover">[]).map((e) => ({ ...e, cover: urlPublique(e.cover_path) }));
}

/** Tout le catalogue : émissions + épisodes enrichis (pochette, émission, numéro). */
export async function chargerCatalogue(): Promise<{ emissions: Emission[]; episodes: AudioTrack[] }> {
  const [emissions, episodes] = await Promise.all([listEmissions(), listPodcasts()]);
  const parId = new Map(emissions.map((e) => [e.id, e]));
  const premiere = emissions[0];
  const enrichis = episodes.map((t) => {
    const e = (t.show_id && parId.get(t.show_id)) || premiere;
    return {
      ...t,
      show_id: e?.id ?? null,
      cover: e?.cover ?? null,
      showTitle: e?.title,
      showDescription: e?.description ?? null,
      author: e?.author ?? null,
    };
  });
  // Numéro dans l'émission (du plus ancien au plus récent).
  for (const e of emissions) {
    const liste = enrichis.filter((t) => t.show_id === e.id).sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
    liste.forEach((t, i) => (t.numero = i + 1));
  }
  return { emissions, episodes: enrichis };
}

async function envoyerPochette(fichier: File): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const ext = (fichier.name.split(".").pop() || "jpg").toLowerCase();
  const key = `shows/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage.from(AUDIO_BUCKET).upload(key, fichier, { contentType: fichier.type || "image/jpeg", upsert: false });
  return error ? null : key;
}

/** Admin : crée une émission (pochette facultative). */
export async function creerEmission(
  champs: { title: string; author?: string | null; description?: string | null; category?: string | null },
  pochette?: File | null,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const cover_path = pochette ? await envoyerPochette(pochette) : null;
  const { error } = await sb.from("podcast_shows").insert({ ...champs, cover_path, position: Date.now() % 1_000_000 });
  return !error;
}

/** Admin : modifie une émission (et sa pochette si fournie). */
export async function modifierEmission(
  id: string,
  champs: { title?: string; author?: string | null; description?: string | null; category?: string | null },
  pochette?: File | null,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || id === EMISSION_PAR_DEFAUT_ID) return false;
  const patch: Record<string, unknown> = { ...champs };
  if (pochette) {
    const key = await envoyerPochette(pochette);
    if (key) patch.cover_path = key;
  }
  const { error } = await sb.from("podcast_shows").update(patch).eq("id", id);
  return !error;
}

/** Admin : supprime une émission (ses épisodes restent, sans émission). */
export async function supprimerEmission(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || id === EMISSION_PAR_DEFAUT_ID) return false;
  const { error } = await sb.from("podcast_shows").delete().eq("id", id);
  return !error;
}

/** Admin : range un épisode dans une émission. */
export async function deplacerEpisode(id: string, showId: string): Promise<void> {
  if (showId === EMISSION_PAR_DEFAUT_ID) return;
  await getSupabase()?.from("podcasts").update({ show_id: showId }).eq("id", id);
}
