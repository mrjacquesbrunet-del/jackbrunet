"use client";

import { Mp3Encoder } from "@breezystack/lamejs";

/**
 * Compresse un fichier audio en MP3 mono ~48 kbps côté navigateur (voix
 * parfaitement intelligible, ~2× moins de bande passante). Sert à l'upload
 * des podcasts et de la Bible audio. En cas d'échec (format non décodable,
 * navigateur limité…), on renvoie le fichier d'origine, jamais bloquant.
 */
export async function compressToMonoMp3(file: File, kbps = 48): Promise<File> {
  try {
    if (typeof window === "undefined") return file;
    const AC: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return file;

    const ctx = new AC();
    const buf = await ctx.decodeAudioData(await file.arrayBuffer());

    // Downmix en mono (moyenne des canaux).
    const n = buf.length;
    const mono = new Float32Array(n);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const data = buf.getChannelData(c);
      for (let i = 0; i < n; i++) mono[i] += data[i];
    }
    const inv = 1 / Math.max(1, buf.numberOfChannels);
    for (let i = 0; i < n; i++) mono[i] *= inv;

    // Float32 [-1,1] → Int16.
    const pcm = new Int16Array(n);
    for (let i = 0; i < n; i++) {
      const s = Math.max(-1, Math.min(1, mono[i]));
      pcm[i] = s < 0? s * 0x8000: s * 0x7fff;
    }

    ctx.close?.();

    // Encodage MP3 mono par blocs.
    const sampleRate = Math.round(buf.sampleRate);
    const enc = new Mp3Encoder(1, sampleRate, kbps);
    const block = 1152;
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < pcm.length; i += block) {
      const slice = pcm.subarray(i, i + block);
      const out = enc.encodeBuffer(slice);
      if (out.length > 0) chunks.push(out);
    }
    const end = enc.flush();
    if (end.length > 0) chunks.push(end);

    const blob = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
    // Si la compression n'apporte rien (déjà plus petit), garde l'original.
    if (blob.size === 0 || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".mp3";
    return new File([blob], name, { type: "audio/mpeg" });
  } catch {
    return file;
  }
}
