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

/**
 * Ouvre WhatsApp avec un message pré-rempli. En natif, on utilise le schéma
 * d'application « whatsapp:// » (Capacitor le confie au système, qui lance
 * directement l'app WhatsApp) — bien plus fiable que d'ouvrir « wa.me » dans le
 * navigateur intégré, qui affichait une page web bancale. Sur le web: wa.me.
 */
export async function openWhatsApp(text: string): Promise<void> {
  const encoded = encodeURIComponent(text);
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      // Capacitor intercepte les schémas non-http et les ouvre via l'OS.
      window.location.href = `whatsapp://send?text=${encoded}`;
      return;
    }
  } catch {
    /* repli ci-dessous */
  }
  window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
}
