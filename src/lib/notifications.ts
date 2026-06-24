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
    return { ...defaultReminder, ...(JSON.parse(raw) as Partial<ReminderPref>) };
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

/** Programme (ou reprogramme) le rappel quotidien à l'heure choisie. */
export async function enableDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!isNativeApp()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");

  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return false;

  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: "Ta pensée du jour t'attend",
        body: "Prends un instant avec Dieu : ouvre le dévotionnel du jour.",
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
  writeReminder({ ...current, enabled: false });
  if (!isNativeApp()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
}
