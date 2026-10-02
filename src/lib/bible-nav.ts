/**
 * Navigation dans la Bible depuis un lien : avec un verset, on ouvre un
 * aperçu (on lit sans quitter sa page) ; sans verset, on va au chapitre.
 */
export type Naviguer = (livre: number, chapitre: number, verset?: number, versetFin?: number) => void;

/** « Jean 3:16 », « Romains 5.8-10 » → [16] ou [8, 10] ; [] si pas de verset. */
export function versetsDe(reference: string): [number?, number?] {
  const m = reference.trim().match(/\d+\s*[.:]\s*(\d+)(?:\s*[-–]\s*(\d+))?\s*$/);
  if (!m) return [];
  return [Number(m[1]), m[2] ? Number(m[2]) : undefined];
}
