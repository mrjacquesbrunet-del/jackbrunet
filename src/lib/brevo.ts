/**
 * Envoi direct vers un formulaire Brevo (sibforms), sans backend.
 *
 * Le site est exporté en statique: on poste donc les données directement à
 * l'adresse du formulaire Brevo, côté navigateur. La clé API n'est jamais
 * exposée (Brevo gère la collecte, le double opt-in et le RGPD).
 *
 * La réponse est opaque (`mode: "no-cors"`): on considère l'envoi réussi tant
 * qu'il n'y a pas d'erreur réseau.
 */
export async function submitToBrevo(
  endpoint: string,
  fields: Record<string, string>,
): Promise<void> {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value!= null && value!== "") body.append(key, value);
  }
  // Pot de miel anti-robot de Brevo: doit être présent et vide.
  body.append("email_address_check", "");
  if (!body.has("locale")) body.append("locale", "fr");

  await fetch(endpoint, { method: "POST", mode: "no-cors", body });
}
