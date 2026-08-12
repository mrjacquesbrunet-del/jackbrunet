/**
 * Rappel d'hydratation intelligent — fonctions pures.
 * Principe : jamais de spam. On ne rappelle que si l'utilisateur est
 * réellement en retard sur son objectif POUR L'HEURE QU'IL EST,
 * en supposant une consommation répartie sur la journée éveillée.
 */

/**
 * Quantité d'eau « attendue » à une heure donnée, si l'objectif est
 * réparti linéairement entre le lever et le coucher.
 */
export function expectedWaterMl(
  goalMl: number,
  hour: number, // heure actuelle (0-23, fractions autorisées : 14,5 = 14h30)
  wakeHour = 7,
  sleepHour = 22,
): number {
  if (goalMl <= 0 || sleepHour <= wakeHour) return 0;
  if (hour <= wakeHour) return 0;
  if (hour >= sleepHour) return goalMl;
  return Math.round((goalMl * (hour - wakeHour)) / (sleepHour - wakeHour));
}

/**
 * Faut-il rappeler de boire ? Vrai seulement si la consommation réelle
 * est sous 75 % de l'attendu à cette heure ET que le retard dépasse
 * un verre (250 ml) — sinon on laisse l'utilisateur tranquille.
 */
export function isBehindOnWater(
  currentMl: number,
  goalMl: number,
  hour: number,
  wakeHour = 7,
  sleepHour = 22,
): boolean {
  const expected = expectedWaterMl(goalMl, hour, wakeHour, sleepHour);
  if (expected === 0) return false;
  return currentMl < expected * 0.75 && expected - currentMl >= 250;
}
