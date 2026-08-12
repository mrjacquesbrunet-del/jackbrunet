/** Utilitaires de dates — toujours en date locale, format ISO `YYYY-MM-DD`. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Lundi de la semaine contenant `date` (pour les check-ins hebdo). */
export function weekStartISO(date: Date = new Date()): string {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - day);
  return toISODate(d);
}

/** Nombre de jours écoulés depuis `startISO` (jour 1 = date de début). */
export function programDayNumber(startISO: string, today: Date = new Date()): number {
  const start = new Date(`${startISO}T00:00:00`);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return diff + 1;
}

/** « mardi 12 août » — pour l'en-tête du dashboard. */
export function formatDateFR(d: Date = new Date()): string {
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Jour de la semaine au format base de données (0 = lundi … 6 = dimanche). */
export function dayOfWeekMondayFirst(d: Date = new Date()): number {
  return (d.getDay() + 6) % 7;
}
