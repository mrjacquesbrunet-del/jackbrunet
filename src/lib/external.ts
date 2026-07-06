"use client";

/**
 * Ouvre une URL externe. Dans l'application native (Capacitor), on l'ouvre dans
 * le navigateur système (Safari/Chrome), exigé par Apple pour les paiements et
 * les dons, et meilleure expérience que de quitter la webview. Sur le web,
 * comportement normal (nouvel onglet).
 */
export async function openExternal(url: string): Promise<void> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url });
      return;
    }
  } catch {
    /* repli ci-dessous */
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
