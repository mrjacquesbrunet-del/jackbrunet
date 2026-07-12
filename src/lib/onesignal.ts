"use client";

import { isNativeApp } from "@/lib/notifications";
import { openNotifRoute } from "@/lib/notif-route";

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
    // (ou la route fournie dans les données de la notif), au lieu de l'accueil.
    OS.Notifications.addEventListener("click", (e: unknown) => {
      const ev = e as { notification?: { additionalData?: { route?: string } } };
      openNotifRoute(ev?.notification?.additionalData?.route);
    });

    await OS.Notifications.requestPermission(true).catch(() => undefined);
  } catch {
    /* plugin absent (web) ou erreur d'init → ignoré */
  }
}

/**
 * Associe l'appareil au compte (external_id = id Supabase). Indispensable pour
 * pouvoir ENVOYER une notification push à cette personne précise (messages,
 * commentaires, réactions…). À appeler dès qu'on connaît l'utilisateur.
 */
export async function linkOneSignalUser(userId: string): Promise<void> {
  if (!isNativeApp() || !userId) return;
  try {
    const mod = await import("onesignal-cordova-plugin");
    const OneSignal = (mod as { default?: unknown }).default ?? mod;
    const OS = OneSignal as { login: (id: string) => void };
    OS.login(userId);
  } catch {
    /* ignoré */
  }
}

/** Dissocie l'appareil du compte à la déconnexion. */
export async function unlinkOneSignalUser(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const mod = await import("onesignal-cordova-plugin");
    const OneSignal = (mod as { default?: unknown }).default ?? mod;
    const OS = OneSignal as { logout: () => void };
    OS.logout();
  } catch {
    /* ignoré */
  }
}
