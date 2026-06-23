/**
 * Adresses d'envoi des formulaires Brevo.
 *
 * Comment obtenir une adresse : dans Brevo → Formulaires → créer un formulaire
 * « Pleine page/intégré » → étape « Partager » → code HTML. L'adresse est la
 * valeur de l'attribut `action="https://xxxx.sibforms.com/serve/..."` du <form>.
 *
 * Tant qu'une entrée vaut `null`, le formulaire correspondant n'est pas encore
 * créé dans Brevo (les captations email retombent alors sur la newsletter pour
 * ne perdre aucun contact ; la prière et les témoignages restent en attente).
 */

export type BrevoFormKey =
  | "newsletter"
  | "ebook"
  | "boutique"
  | "dons"
  | "priere"
  | "temoignages";

export const BREVO_ENDPOINTS: Record<BrevoFormKey, string | null> = {
  newsletter:
    "https://27d09ed7.sibforms.com/serve/MUIFAC_7RFJAdQ6MVjqLN8RCSWKm11pBgyucs8Kb7t2H_7f31Fc2It2MHjCZEIb9OMc9LdULmJCyKHjdTGrjOB_fzjJ4rv18gjN_MoQD-quQC1PUDShBMltKeW3rpU6GrLPoNVDDDBYCW_J55L8v4r_WiyJYod7qxVKgUTNvoXDgwl5hxzdXYXjPgy7I1eqZkRvdElQeuML6fSEqXw==",
  ebook: null,
  boutique: null,
  dons: null,
  priere: null,
  temoignages: null,
};

/** Associe une origine de formulaire email (prop `source`) à une liste Brevo. */
export function brevoKeyForSource(source: string): BrevoFormKey {
  switch (source) {
    case "popup":
      return "ebook";
    case "boutique":
    case "page-boutique":
      return "boutique";
    case "page-dons":
      return "dons";
    default:
      return "newsletter";
  }
}

/**
 * Adresse d'envoi pour une captation email, avec repli sur la newsletter tant
 * que la liste dédiée n'a pas encore son adresse Brevo (rien n'est perdu).
 */
export function newsletterEndpointForSource(source: string): string | null {
  const key = brevoKeyForSource(source);
  return BREVO_ENDPOINTS[key] ?? BREVO_ENDPOINTS.newsletter;
}
