"use client";

import { isNativeApp } from "@/lib/notifications";
import { asset } from "@/lib/asset";

/** App ID OneSignal (public, sans risque côté client). */
export const ONESIGNAL_APP_ID = "27d280f7-9f55-4c22-9798-2566a6f24ab3";

/**
 * Initialise OneSignal (notifications push), application native uniquement.
 * Charge le plugin dynamiquement pour ne jamais l'inclure côté web.
 * Demande la permission de notification au lancement.
 */
export async function initOneSignal(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const mod = await import("onesignal-cordova-plugin");
    const OneSignal = (mod as { default?: unknown }).default?? mod;
    const OS = OneSignal as {
      initialize: (id: string) => void;
      Notifications: {
        requestPermission: (fallback: boolean) => Promise<boolean>;
        addEventListener: (event: "click", cb: (e: unknown) => void) => void;
      };
    };
    OS.initialize(ONESIGNAL_APP_ID);

    // Clic sur une notification push → ouvre l'app sur « Mon temps avec Jésus »
    // (ou la route fournie dans les données de la notif), au lieu du navigateur.
    OS.Notifications.addEventListener("click", (e: unknown) => {
      const ev = e as { notification?: { additionalData?: { route?: string } } };
      const route = ev?.notification?.additionalData?.route?? "/devotionnel/";
      try {
        window.location.href = asset(route);
      } catch {
        /* navigation impossible */
      }
    });

    await OS.Notifications.requestPermission(true).catch(() => undefined);
  } catch {
    /* plugin absent (web) ou erreur d'init → ignoré */
  }
}
