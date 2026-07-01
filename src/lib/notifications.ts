"use client";

/**
 * Rappel quotidien « pensée du jour » — notification locale programmée sur
 * l'appareil (aucun serveur). Disponible uniquement dans l'application native
 * (Capacitor). Sur le web, les fonctions ne font rien.
 */

import { Capacitor } from "@capacitor/core";

const REMINDER_ID = 1001;
export const REMINDER_KEY = "jb.reminder.v1";

export type ReminderPref = { enabled: boolean; hour: number; minute: number };

export const defaultReminder: ReminderPref = { enabled: false, hour: 8, minute: 0 };

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function readReminder(): ReminderPref {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return defaultReminder;
    return {...defaultReminder,...(JSON.parse(raw) as Partial<ReminderPref>) };
  } catch {
    return defaultReminder;
  }
}

function writeReminder(pref: ReminderPref) {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(pref));
  } catch {
    /* ignore */
  }
}

/** Série actuelle (lue depuis l'engagement local) pour personnaliser le rappel. */
function readStreak(): number {
  try {
    const raw = localStorage.getItem("jb.engagement.v1");
    if (!raw) return 0;
    const s = JSON.parse(raw) as { streak?: number };
    return typeof s.streak === "number"? s.streak: 0;
  } catch {
    return 0;
  }
}

/** Titre + corps du rappel, motivant selon la série en cours. */
function reminderMessage(streak: number): { title: string; body: string } {
  if (streak >= 2) {
    return {
      title: `${streak} jours d'affilée — ne casse pas ta série!`,
      body: "Prends un instant avec Dieu: ouvre ta méditation du jour.",
    };
  }
  return {
    title: "Ta pensée du jour t'attend",
    body: "Prends un instant avec Dieu: ouvre le dévotionnel du jour.",
  };
}

/** Programme (ou reprogramme) le rappel quotidien à l'heure choisie. */
export async function enableDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!isNativeApp()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");

  const perm = await LocalNotifications.requestPermissions();
  if (perm.display!== "granted") return false;

  const { title, body } = reminderMessage(readStreak());

  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title,
        body,
        schedule: { on: { hour, minute }, allowWhileIdle: true },
        extra: { route: "/devotionnel/" },
      },
    ],
  });

  writeReminder({ enabled: true, hour, minute });
  return true;
}

/** Annule le rappel quotidien. */
export async function disableDailyReminder(): Promise<void> {
  const current = readReminder();
  writeReminder({...current, enabled: false });
  if (!isNativeApp()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
}
