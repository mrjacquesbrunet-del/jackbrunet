/**
 * Conversion d'unités de mensuration — fonctions pures.
 * Les valeurs sont TOUJOURS stockées en centimètres (unité normalisée) ;
 * la conversion cm ↔ pouces ne sert qu'à l'affichage et à la saisie.
 */

import type { MeasurementUnit } from '@/src/types/domain';

const CM_PER_INCH = 2.54;

/** Valeur stockée (cm) → valeur affichée dans l'unité du profil. */
export function cmToDisplay(valueCm: number, unit: MeasurementUnit): number {
  const v = unit === 'in' ? valueCm / CM_PER_INCH : valueCm;
  return Math.round(v * 10) / 10;
}

/** Valeur saisie dans l'unité du profil → valeur à stocker (cm). */
export function displayToCm(value: number, unit: MeasurementUnit): number {
  const v = unit === 'in' ? value * CM_PER_INCH : value;
  return Math.round(v * 100) / 100;
}

/** Libellé court de l'unité pour l'affichage. */
export function unitLabel(unit: MeasurementUnit): string {
  return unit === 'in' ? 'po' : 'cm';
}
