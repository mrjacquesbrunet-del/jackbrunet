"use client";

import { useEffect, useState } from "react";

/** Numéro du jour dans l'année, selon la date LOCALE du visiteur. */
export function localDayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

/**
 * Renvoie l'index du contenu « du jour », recalculé dans le navigateur.
 * `initial` (calculé à la construction) sert au premier rendu pour éviter tout
 * décalage d'hydratation ; l'index bascule ensuite sur la vraie date locale,
 * donc le contenu change automatiquement à minuit, sans reconstruction.
 */
export function useTodayIndex(length: number, initial: number): number {
  const [index, setIndex] = useState(initial);
  useEffect(() => {
    if (length > 0) setIndex(localDayOfYear() % length);
  }, [length]);
  return index;
}
