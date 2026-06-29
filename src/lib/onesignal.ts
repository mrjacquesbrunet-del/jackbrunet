"use client";

import { isNativeApp } from "@/lib/notifications";

/** App ID OneSignal (public, sans risque côté client). */
export const ONESIGNAL_APP_ID = "27d280f7-9f55-4c22-9798-2566a6f24ab3";

/**
 * Initialise OneSignal (notifications push) — application native uniquement.
 * Charge le plugin dynamiquement pour ne jamais l'inclure côté web.
 * Demande la permission de notification au lancement.
 */
export async function initOneSignal(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const mod = await import("onesignal-cordova-plugin");
    const OneSignal = (mod as { default?: unknown }).default ?? mod;
    const OS = OneSignal as {
      initialize: (id: string) => void;
      Notifications: { requestPermission: (fallback: boolean) => Promise<boolean> };
    };
    OS.initialize(ONESIGNAL_APP_ID);
    await OS.Notifications.requestPermission(true).catch(() => undefined);
  } catch {
    /* plugin absent (web) ou erreur d'init → ignoré */
  }
}
