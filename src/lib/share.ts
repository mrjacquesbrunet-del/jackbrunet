"use client";

/**
 * Partage & enregistrement multi-plateformes.
 *
 * En application native (Capacitor), l'API Web `navigator.share` et les
 * téléchargements `<a download>` ne fonctionnent pas de façon fiable dans la
 * WebView (surtout Android). On passe donc par les plugins natifs
 * `@capacitor/share` et `@capacitor/filesystem`. Sur le web, on garde l'API
 * Web Share avec repli sur le téléchargement / la copie.
 */

async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Convertit un Blob en base64 (sans le préfixe data:). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => {
      const s = String(r.result);
      const comma = s.indexOf(",");
      resolve(comma >= 0? s.slice(comma + 1): s);
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/** Téléchargement web classique. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Partage une image générée (canvas). En natif, écrit le fichier puis ouvre la
 * feuille de partage du téléphone (Instagram, WhatsApp, Enregistrer dans
 * Photos/Fichiers…). Sur le web: Web Share si possible, sinon téléchargement.
 */
export async function shareImageBlob(
  blob: Blob,
  filename: string,
  text: string,
): Promise<void> {
  if (await isNative()) {
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");
      const data = await blobToBase64(blob);
      await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
      const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
      await Share.share({ text, files: [uri] });
    } catch {
      /* partage annulé ou indisponible, on ne fait rien */
    }
    return;
  }

  // Web
  try {
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (d: { files: File[] }) => boolean;
    };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], text });
      return;
    }
  } catch {
    /* repli téléchargement */
  }
  downloadBlob(blob, filename);
}

/**
 * Enregistre une image. En natif, il n'y a pas de « téléchargement »: on ouvre
 * la feuille de partage (qui propose « Enregistrer dans Photos / Fichiers »).
 * Sur le web, téléchargement direct.
 */
export async function saveImageBlob(
  blob: Blob,
  filename: string,
  text: string,
): Promise<void> {
  if (await isNative()) {
    await shareImageBlob(blob, filename, text);
    return;
  }
  downloadBlob(blob, filename);
}

/**
 * Enregistre / partage un fichier distant (ex. le MP3 d'un podcast). En natif,
 * on télécharge d'abord le fichier en mémoire puis on ouvre la feuille de
 * partage du téléphone (« Enregistrer dans Fichiers », WhatsApp, Mail…), au
 * lieu d'ouvrir une page de navigateur brute peu rassurante. Sur le web:
 * téléchargement direct.
 */
export async function saveOrShareFile(
  url: string,
  filename: string,
  text: string,
): Promise<void> {
  let blob: Blob;
  try {
    const res = await fetch(url);
    blob = await res.blob();
  } catch {
    // Dernier recours: on ouvre le lien.
    if (typeof window!== "undefined") window.open(url, "_blank");
    return;
  }
  if (await isNative()) {
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");
      const data = await blobToBase64(blob);
      await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
      const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
      await Share.share({ text, files: [uri] });
    } catch {
      /* partage annulé ou indisponible */
    }
    return;
  }
  downloadBlob(blob, filename);
}

/**
 * Partage un texte (+ url éventuelle). En natif: feuille de partage. Sur le web:
 * Web Share si dispo, sinon copie dans le presse-papiers. Renvoie true si un
 * vrai partage a eu lieu (utile pour afficher un repli « Copié »).
 */
export async function shareText(text: string, url?: string): Promise<boolean> {
  if (await isNative()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share(url? { text, url }: { text });
      return true;
    } catch {
      return false;
    }
  }
  try {
    if (typeof navigator!== "undefined" && navigator.share) {
      await navigator.share(url? { text, url }: { text });
      return true;
    }
  } catch {
    return false;
  }
  try {
    await navigator.clipboard.writeText(url? `${text}\n\n${url}`: text);
  } catch {
    /* presse-papiers indisponible */
  }
  return false;
}
