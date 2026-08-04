"use client";

import { getSupabase } from "./supabase";

/**
 * Notes vocales (mur de prière + groupes) : enregistrement micro via
 * MediaRecorder, envoi dans le bucket Supabase « voices » (dossier = id du
 * membre), lecture via URL publique. Durée maximale : 2 minutes.
 */

export const VOICE_MAX_SECONDS = 120;

export type VoiceRecording = {
  stop: () => Promise<Blob | null>;
  cancel: () => void;
};

/** Le navigateur/appareil sait-il enregistrer ? */
export function canRecordVoice(): boolean {
  try {
    return (
      typeof MediaRecorder !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia
    );
  } catch {
    return false;
  }
}

/** Type d'enregistrement le mieux supporté (iOS → mp4/AAC, Android → webm). */
function pickMimeType(): string {
  const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
  for (const t of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      /* continue */
    }
  }
  return "";
}

/** Démarre l'enregistrement. Lève une erreur si le micro est refusé. */
export async function startRecording(): Promise<VoiceRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mime = pickMimeType();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  rec.start(250);

  const cleanup = () => {
    try {
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
  };

  return {
    stop: () =>
      new Promise<Blob | null>((resolve) => {
        rec.onstop = () => {
          cleanup();
          const type = rec.mimeType || mime || "audio/webm";
          resolve(chunks.length ? new Blob(chunks, { type }) : null);
        };
        try {
          rec.stop();
        } catch {
          cleanup();
          resolve(null);
        }
      }),
    cancel: () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      cleanup();
    },
  };
}

/** Extension de fichier selon le type produit par l'appareil. */
function extFor(type: string): string {
  if (type.includes("mp4")) return "m4a";
  if (type.includes("webm")) return "webm";
  if (type.includes("ogg")) return "ogg";
  return "bin";
}

/** Téléverse la note vocale et renvoie son URL publique (ou null). */
export async function uploadVoice(userId: string, blob: Blob): Promise<string | null> {
  const sb = getSupabase();
  if (!sb || !userId) return null;
  const name = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(blob.type)}`;
  const { error } = await sb.storage.from("voices").upload(name, blob, {
    contentType: blob.type || "audio/webm",
    cacheControl: "31536000",
  });
  if (error) return null;
  const { data } = sb.storage.from("voices").getPublicUrl(name);
  return data?.publicUrl ?? null;
}
