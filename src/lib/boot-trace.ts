"use client";

/**
 * « Boîte noire » de démarrage. Enregistre, à chaque lancement de l'app, les
 * étapes clés (démarrage JS, garde d'accueil, tap de notification, navigation,
 * arrivée sur la page) dans le stockage local. Les 3 derniers lancements sont
 * conservés et consultables depuis le profil (Diagnostic) pour comprendre les
 * blocages au démarrage (écran olive) qu'on ne peut pas reproduire à distance.
 * Volontairement minuscule et silencieux : ne peut jamais faire échouer l'app.
 */

const KEY = "jb.bootlogs.v1";

type Entry = { t: number; s: string; d?: string };
export type BootLog = { start: number; entries: Entry[] };

let booted = false;

function load(): BootLog[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? (v as BootLog[]) : [];
  } catch {
    return [];
  }
}

function save(boots: BootLog[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(boots));
  } catch {
    /* stockage plein/indisponible */
  }
}

/** Ajoute une étape au journal du lancement en cours. */
export function trace(step: string, detail?: string): void {
  if (typeof window === "undefined") return;
  try {
    let boots = load();
    if (!booted) {
      booted = true;
      boots.push({ start: Date.now(), entries: [] });
      boots = boots.slice(-3);
    }
    const cur = boots[boots.length - 1];
    if (cur && cur.entries.length < 80) {
      cur.entries.push({ t: Date.now(), s: step, d: detail });
      save(boots);
    }
  } catch {
    /* jamais bloquant */
  }
}

/** Journaux des 3 derniers lancements (le plus récent en dernier). */
export function getBootLogs(): BootLog[] {
  if (typeof window === "undefined") return [];
  return load();
}

/** Représentation texte (pour copie/partage). */
export function formatBootLogs(): string {
  const boots = getBootLogs();
  if (boots.length === 0) return "Aucun journal de démarrage.";
  return boots
    .map((b) => {
      const d = new Date(b.start);
      const head = `— Lancement du ${d.toLocaleDateString("fr-FR")} à ${d.toLocaleTimeString("fr-FR")} —`;
      const lines = b.entries.map(
        (e) => `+${String(e.t - b.start).padStart(5, " ")}ms  ${e.s}${e.d ? ` · ${e.d}` : ""}`,
      );
      return [head, ...(lines.length ? lines : ["(aucune étape enregistrée)"])].join("\n");
    })
    .join("\n\n");
}
