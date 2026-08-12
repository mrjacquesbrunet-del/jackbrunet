/**
 * Référentiel des mensurations : libellés français et aide à la prise de
 * mesure (où placer le mètre). Utilisé par les écrans de bilan corporel.
 */

import type { MeasurementSide, MeasurementState, MeasurementType } from '@/src/types/domain';

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  neck: 'Tour de cou',
  shoulders: 'Tour d’épaules',
  chest: 'Tour de poitrine',
  waist: 'Tour de taille',
  abdomen: 'Tour de ventre',
  hips: 'Tour de hanches',
  biceps: 'Tour de bras',
  forearm: 'Avant-bras',
  thigh: 'Cuisse',
  calf: 'Mollet',
  custom: 'Mesure personnalisée',
};

/** Où placer exactement le mètre — affiché sous chaque champ de saisie. */
export const MEASUREMENT_HELP: Record<MeasurementType, string> = {
  neck: 'Sous la pomme d’Adam, mètre bien horizontal.',
  shoulders: 'Au point le plus large des épaules, bras relâchés.',
  chest: 'Au niveau des mamelons, après une expiration normale.',
  waist: 'Au niveau le plus étroit du buste, au-dessus du nombril.',
  abdomen: 'Autour du nombril, ventre relâché — différent du tour de taille.',
  hips: 'Au point le plus large des hanches et des fessiers.',
  biceps: 'À la partie la plus large du bras. Précise relâché ou contracté.',
  forearm: 'À la partie la plus large de l’avant-bras.',
  thigh: 'À la partie la plus large de la cuisse, debout.',
  calf: 'À la partie la plus large du mollet, debout.',
  custom: 'Note où tu mesures pour reproduire la même mesure à chaque bilan.',
};

export const SIDE_LABELS: Record<MeasurementSide, string> = {
  left: 'Gauche',
  right: 'Droit',
  center: '',
};

export const STATE_LABELS: Record<MeasurementState, string> = {
  relaxed: 'Relâché',
  flexed: 'Contracté',
  not_applicable: '',
};

/** Mesures proposées par défaut lors d'un bilan (ordre d'affichage). */
export const DEFAULT_CHECKIN_MEASUREMENTS: Array<{
  measurement_type: MeasurementType;
  side: MeasurementSide;
}> = [
  { measurement_type: 'neck', side: 'center' },
  { measurement_type: 'chest', side: 'center' },
  { measurement_type: 'waist', side: 'center' },
  { measurement_type: 'abdomen', side: 'center' },
  { measurement_type: 'hips', side: 'center' },
  { measurement_type: 'biceps', side: 'left' },
  { measurement_type: 'biceps', side: 'right' },
  { measurement_type: 'forearm', side: 'left' },
  { measurement_type: 'forearm', side: 'right' },
  { measurement_type: 'thigh', side: 'left' },
  { measurement_type: 'thigh', side: 'right' },
  { measurement_type: 'calf', side: 'left' },
  { measurement_type: 'calf', side: 'right' },
];

/** Libellé complet d'une mesure : « Tour de bras droit (contracté) ». */
export function measurementLabel(
  type: MeasurementType,
  side: MeasurementSide,
  state: MeasurementState,
  customLabel?: string | null,
): string {
  const base = type === 'custom' && customLabel ? customLabel : MEASUREMENT_LABELS[type];
  const sidePart = SIDE_LABELS[side] ? ` ${SIDE_LABELS[side].toLowerCase()}` : '';
  const statePart = STATE_LABELS[state] ? ` (${STATE_LABELS[state].toLowerCase()})` : '';
  return `${base}${sidePart}${statePart}`;
}
