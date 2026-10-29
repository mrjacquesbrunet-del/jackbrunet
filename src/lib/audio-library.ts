"use client";

import { getSupabase } from "./supabase";
import { compressToMonoMp3 } from "./audio-compress";
import { compressWallImage } from "./wall";

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
  /** L'émission complète (fiche de l'intervenant : bio, Instagram, liens). */
  emission?: Emission;
};

/** Lien de l'intervenant (YouTube, Boutique, site…). */
export type LienAuteur = { label: string; url: string };

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
  /** Fiche de l'intervenant (cliquer sur son nom) — migration-podcast-auteurs.sql. */
  author_role?: string | null;
  author_bio?: string | null;
  author_photo?: string | null;
  author_instagram?: string | null;
  author_links?: LienAuteur[] | null;
  /** Plusieurs intervenants (migration-podcast-intervenants.sql). Sans elle :
   * un seul intervenant, déduit des champs author_*. */
  intervenants?: Intervenant[] | null;
  /** Public visé (migration-podcast-publics-notes.sql) : voir PUBLICS. */
  publics?: string[] | null;
};

/** Publics visés possibles d'une émission (clé enregistrée, libellé affiché). */
export const PUBLICS: [string, string][] = [
  ["tout-public", "Tout public"],
  ["enfance", "Enfance"],
  ["jeunesse", "Jeunesse"],
  ["famille", "Famille"],
];
export const libellePublic = (cle: string) => PUBLICS.find(([k]) => k === cle)?.[1] ?? cle;

/* ————— Notes des émissions (étoiles) ————— */

export type NoteStats = { avg: number; cnt: number };

/** Moyenne et nombre de notes de chaque émission. */
export async function notesEmissions(): Promise<Record<string, NoteStats>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data, error } = await sb.rpc("podcast_ratings_summary");
  if (error || !data) return {};
  const out: Record<string, NoteStats> = {};
  for (const r of data as { show_id: string; avg: number; cnt: number }[]) out[r.show_id] = { avg: Number(r.avg) || 0, cnt: Number(r.cnt) || 0 };
  return out;
}

/** Ma note pour une émission (1 à 5), ou null. */
export async function maNoteEmission(showId: string, userId: string): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("podcast_ratings").select("stars").eq("show_id", showId).eq("user_id", userId).maybeSingle();
  return (data as { stars: number } | null)?.stars ?? null;
}

/** Note (ou modifie ma note d') une émission. */
export async function noterEmission(showId: string, stars: number, userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("podcast_ratings")
    .upsert({ show_id: showId, user_id: userId, stars, updated_at: new Date().toISOString() }, { onConflict: "user_id,show_id" });
  return !error;
}

/** Un intervenant d'émission et sa fiche (ce qui s'affiche au toucher de son nom). */
export type Intervenant = {
  nom: string;
  role?: string | null;
  bio?: string | null;
  photo?: string | null;
  instagram?: string | null;
  liens?: LienAuteur[] | null;
};

/** Les intervenants d'une émission (liste, sinon l'intervenant unique historique). */
export function intervenantsDe(e?: Emission | null): Intervenant[] {
  if (!e) return [];
  const liste = (e.intervenants ?? []).filter((i) => i?.nom?.trim());
  if (liste.length) return liste;
  return e.author
    ? [{ nom: e.author, role: e.author_role, bio: e.author_bio, photo: e.author_photo, instagram: e.author_instagram, liens: e.author_links ?? [] }]
    : [];
}
export const nomsDe = (e?: Emission | null) => intervenantsDe(e).map((i) => i.nom);

/** « A », « A et B », « A, B et C ». */
export function joindreNoms(noms: string[]): string {
  if (noms.length <= 1) return noms[0] ?? "";
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

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
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("podcasts").update(patch).eq("id", id);
  return !error;
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
      emission: e,
    };
  });
  // Numéro dans l'émission (du plus ancien au plus récent).
  for (const e of emissions) {
    const liste = enrichis.filter((t) => t.show_id === e.id).sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
    liste.forEach((t, i) => (t.numero = i + 1));
  }
  return { emissions, episodes: enrichis };
}

/** Image (pochette, photo) compressée avant l'envoi : une photo de téléphone
 * de 4 Mo devient ~200 Ko, chargée par chaque auditeur. Nom unique → cache d'un an. */
async function envoyerImage(fichier: File, max: number): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const leger = await compressWallImage(fichier, max, 0.88);
  const corps: Blob = leger && leger.size < fichier.size ? leger : fichier;
  const ext = corps === fichier ? (fichier.name.split(".").pop() || "jpg").toLowerCase() : "jpg";
  const key = `shows/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage.from(AUDIO_BUCKET).upload(key, corps, {
    contentType: corps === fichier ? fichier.type || "image/jpeg" : "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  return error ? null : key;
}
const envoyerPochette = (fichier: File) => envoyerImage(fichier, 1400);

/** Admin : photo de l'intervenant (fiche), renvoie son adresse publique. */
export async function envoyerPhotoIntervenant(fichier: File): Promise<string | null> {
  const key = await envoyerImage(fichier, 600);
  return key ? urlPublique(key) : null;
}

/** Admin : crée une émission (pochette facultative). */
export async function creerEmission(
  champs: { title: string; author?: string | null; description?: string | null; category?: string | null } & Partial<
    Omit<Emission, "id" | "cover" | "cover_path" | "position">
  >,
  pochette?: File | null,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const cover_path = pochette ? await envoyerPochette(pochette) : null;
  const { data, error } = await sb
    .from("podcast_shows")
    .insert({ ...champs, cover_path, position: Date.now() % 1_000_000 })
    .select("id")
    .single();
  return error || !data ? null : (data as { id: string }).id;
}

/** Admin : modifie une émission (et sa pochette si fournie). */
export async function modifierEmission(
  id: string,
  champs: Partial<Omit<Emission, "id" | "cover" | "cover_path" | "position">>,
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
export async function deplacerEpisode(id: string, showId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || showId === EMISSION_PAR_DEFAUT_ID) return false;
  const { error } = await sb.from("podcasts").update({ show_id: showId }).eq("id", id);
  return !error;
}

/** Admin : nouvel ordre d'affichage des émissions (première = en tête). */
export async function reordonnerEmissions(ids: string[]): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const res = await Promise.all(
    ids.filter((id) => id !== EMISSION_PAR_DEFAUT_ID).map((id, i) => sb.from("podcast_shows").update({ position: i * 10 }).eq("id", id)),
  );
  return res.every((r) => !r.error);
}

/** L'émission de secours (table absente) ne se modifie pas : SQL à exécuter. */
export const estEmissionDeSecours = (id: string) => id === EMISSION_PAR_DEFAUT_ID;
