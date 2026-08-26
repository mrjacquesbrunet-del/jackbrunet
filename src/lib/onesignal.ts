"use client";

import { isNativeApp } from "@/lib/notifications";
import { openNotifRoute } from "@/lib/notif-route";

/** App ID OneSignal (public, sans risque côté client). */
export const ONESIGNAL_APP_ID = "27d280f7-9f55-4c22-9798-2566a6f24ab3";

/** Évite d'empiler plusieurs écouteurs « click » si l'init est rappelée. */
let _osInitDone = false;

/**
 * Initialise OneSignal (notifications push), application native uniquement.
 * Charge le plugin dynamiquement pour ne jamais l'inclure côté web.
 * NE demande PAS la permission ici : la demander « à froid » au premier
 * lancement fait refuser la plupart des gens, et sur iOS ce refus bloque
 * aussi le rappel quotidien (permission partagée push + locale). La
 * permission est demandée au bon moment, avec du contexte (NotifOptIn).
 */
export async function initOneSignal(): Promise<void> {
  if (!isNativeApp() || _osInitDone) return;
  _osInitDone = true;
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
  } catch {
    _osInitDone = false;
    /* plugin absent (web) ou erreur d'init → ignoré */
  }
}

/**
 * Demande la permission de notification (et enregistre l'appareil pour le
 * push). À appeler UNIQUEMENT dans un moment de contexte (l'utilisateur vient
 * d'activer son rappel, par exemple) — jamais à froid au lancement.
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const mod = await import("onesignal-cordova-plugin");
    const OneSignal = (mod as { default?: unknown }).default ?? mod;
    const OS = OneSignal as {
      Notifications: { requestPermission: (fallback: boolean) => Promise<boolean> };
    };
    return await OS.Notifications.requestPermission(true);
  } catch {
    return false;
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

/**
 * Pose des « tags » OneSignal sur l'appareil (série, médité aujourd'hui, dernier
 * jour actif…). Ils permettent de CIBLER les relances push depuis OneSignal
 * (ex. segment « série ≥ 3 ET médité aujourd'hui = 0 » → « ne casse pas ta
 * série », ou « inactif depuis 3 jours » → « on t'attend »). Sans effet sur le
 * web ; silencieux si le plugin est absent.
 */
export async function updateEngagementTags(tags: Record<string, string>): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const mod = await import("onesignal-cordova-plugin");
    const OneSignal = (mod as { default?: unknown }).default ?? mod;
    const OS = OneSignal as { User: { addTags: (t: Record<string, string>) => void } };
    OS.User.addTags(tags);
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
