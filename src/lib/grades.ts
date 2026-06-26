/**
 * Grades de prière — attribués selon l'activité du membre dans la communauté.
 * Plus on publie de sujets et plus on encourage / prie pour les autres,
 * plus on progresse. 100 % calculé (aucune donnée stockée en plus).
 */

export type Activity = { prayers: number; comments: number; prays: number };

export type Grade = {
  /** seuil de points pour atteindre ce grade */
  min: number;
  name: string;
  /** courte description encourageante */
  blurb: string;
};

/** Pondération : publier compte le plus, puis prier et encourager. */
export function activityPoints(a: Activity): number {
  return a.prayers * 5 + a.prays * 1 + a.comments * 2;
}

/** Du plus haut au plus bas — l'ordre compte pour la recherche. */
export const GRADES: Grade[] = [
  { min: 250, name: "Sentinelle de prière", blurb: "Tu veilles sans relâche pour les autres." },
  { min: 100, name: "Guerrier de prière", blurb: "Tu combats fidèlement à genoux." },
  { min: 40, name: "Intercesseur", blurb: "Tu portes les autres devant Dieu." },
  { min: 10, name: "Veilleur de prière", blurb: "Tu prends l'habitude de prier pour la famille." },
  { min: 0, name: "Âme en prière", blurb: "Bienvenue ! Chaque prière compte." },
];

export function gradeFor(a: Activity): {
  grade: Grade;
  points: number;
  next: Grade | null;
  toNext: number;
} {
  const points = activityPoints(a);
  const idx = GRADES.findIndex((g) => points >= g.min);
  const grade = GRADES[idx] ?? GRADES[GRADES.length - 1];
  const next = idx > 0 ? GRADES[idx - 1] : null;
  const toNext = next ? Math.max(0, next.min - points) : 0;
  return { grade, points, next, toNext };
}
