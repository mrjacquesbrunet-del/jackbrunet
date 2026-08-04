"use client";

/**
 * Rappel quotidien « pensée du jour », notification locale programmée sur
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

/** Messages du matin qui VARIENT (choisis selon le jour, reprogrammés à chaque
 * ouverture de l'app) — pour ne pas répéter la même phrase à vie. */
const MORNING_MESSAGES: { title: string; body: string }[] = [
  { title: "Ta pensée du jour t'attend", body: "Prends un instant avec Dieu : ouvre ta méditation du jour." },
  { title: "Bonjour ! Dieu a une parole pour toi", body: "Deux minutes avec Lui avant que la journée démarre." },
  { title: "Un moment rien que pour ta foi", body: "Ta méditation du jour est prête. Viens la lire." },
  { title: "Commence ta journée avec Jésus", body: "Ta pensée du jour t'attend dans l'app." },
  { title: "Le Père t'attend ce matin", body: "Ouvre ta méditation, elle a été préparée pour toi." },
  { title: "Ta dose d'espérance du jour", body: "Une parole, une prière, une punchline : c'est prêt." },
];

/** Titre + corps du rappel du matin : varie selon le jour, et rappelle la
 * série en cours quand elle devient significative. */
function reminderMessage(streak: number): { title: string; body: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const base = MORNING_MESSAGES[dayOfYear % MORNING_MESSAGES.length];
  if (streak >= 3) {
    return { title: `${streak} jours avec Dieu d'affilée !`, body: base.body };
  }
  return base;
}

const CHANNEL_ID = "daily-reminder";
const EVENING_ID = 1002;

/** Rappel du soir (20h30) : seulement un filet — il est automatiquement décalé
 * au lendemain dès que la méditation du jour est faite (deferEveningNudge). */
async function scheduleEveningNudge(skipToday: boolean): Promise<void> {
  if (!isNativeApp()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: [{ id: EVENING_ID }] }).catch(() => undefined);
  const notif = {
    id: EVENING_ID,
    title: "Encore un instant avec Dieu ?",
    body: "Ta méditation du jour t'attend toujours. 2 minutes avant de dormir.",
    channelId: CHANNEL_ID,
    extra: { route: "/devotionnel/" },
  };
  if (skipToday) {
    // Méditation du jour déjà faite → une seule occurrence, demain 20h30.
    // (Le mode quotidien est re-armé à la prochaine ouverture de l'app.)
    const at = new Date();
    at.setDate(at.getDate() + 1);
    at.setHours(20, 30, 0, 0);
    await LocalNotifications.schedule({
      notifications: [{ ...notif, schedule: { at, allowWhileIdle: true } }],
    });
  } else {
    await LocalNotifications.schedule({
      notifications: [
        { ...notif, schedule: { on: { hour: 20, minute: 30 }, allowWhileIdle: true } },
      ],
    });
  }
}

/** À appeler quand la méditation du jour est faite : le rappel du soir ne
 * partira pas ce soir (reprogrammé à partir de demain). */
export async function deferEveningNudge(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    if (!readReminder().enabled) return;
    await scheduleEveningNudge(true);
  } catch {
    /* ignore */
  }
}

/** Programme (ou reprogramme) le rappel quotidien à l'heure choisie. */
export async function enableDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!isNativeApp()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");

  // Permission (nécessaire iOS + Android 13+).
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display!== "granted") {
    perm = await LocalNotifications.requestPermissions();
  }
  if (perm.display!== "granted") return false;

  // Canal Android (sans lui, aucune notification ne s'affiche sur Android 8+).
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Rappel quotidien",
      description: "Ta pensée du jour, chaque matin.",
      importance: 5,
      visibility: 1,
    });
  } catch {
    /* iOS: pas de canaux — on ignore */
  }

  const { title, body } = reminderMessage(readStreak());

  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title,
        body,
        channelId: CHANNEL_ID,
        // `on` (heure + minute, sans jour) => répétition quotidienne.
        schedule: { on: { hour, minute }, allowWhileIdle: true },
        extra: { route: "/devotionnel/" },
      },
    ],
  });

  writeReminder({ enabled: true, hour, minute });

  // Rappel du soir (filet) : pas ce soir si la méditation du jour est déjà
  // faite — et deferEveningNudge() le décale dès qu'elle l'est.
  try {
    await scheduleEveningNudge(isMeditatedToday());
  } catch {
    /* best-effort */
  }
  return true;
}

/** La méditation du jour est-elle déjà faite ? (lecture engagement local) */
function isMeditatedToday(): boolean {
  try {
    const raw = localStorage.getItem("jb.engagement.v1");
    if (!raw) return false;
    const s = JSON.parse(raw) as { completedDates?: string[] };
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    return Array.isArray(s.completedDates) && s.completedDates.includes(today);
  } catch {
    return false;
  }
}

/** Annule le rappel quotidien (et le rappel du soir qui va avec). */
export async function disableDailyReminder(): Promise<void> {
  const current = readReminder();
  writeReminder({...current, enabled: false });
  if (!isNativeApp()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({
    notifications: [{ id: REMINDER_ID }, { id: EVENING_ID }],
  });
}
