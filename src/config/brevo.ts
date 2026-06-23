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
  ebook:
    "https://27d09ed7.sibforms.com/serve/MUIFAE-lwEuLsYrTGOR9hIGAT98fQx3uYmzRe6uoI-gQEvQ986gJPJPyRXvDQRSC46o9UXLMc0uQlAdAWuPfk5aSaEEkALzq5L09u2n9dFbD8TiA3nGP9IGTc790qDLs3JLuCvAlsZcTOHCSjxouz6i3hmbibwuPpfdu_4ooF6cYQ2QPYKjiXKrVclGQ0GjI_NO0rGFIBYzLB_3wJw==",
  boutique: null,
  dons: null,
  priere:
    "https://27d09ed7.sibforms.com/serve/MUIFAGrPoxGUnlFpL2PCdOshU_4PYmndY_juwbl0FovGiLojmjyk6kklDVswEJRj6XVUZq-2hf62ty-Yh6Zz4QCAub4VK-wxSpVX-5M3QW1PKSm5CNLMwx-nA-bu4hISpQv7jGEIQ7_HrJ0YpkXwbzNjHzH4WceL0AwKd2OxPINuJZhsNpigC9N6LT0pl6mX3_-g-priHISPB_WyOA==",
  temoignages:
    "https://27d09ed7.sibforms.com/serve/MUIFALYp5pHYAhrI6B0ns51z9LMXIc7Qav85PKXcHOh5VM_6khVYS6bE5RXyT8KkK5x35ZiBcqGiGOsiq7dkG6CO_YOwbW8g1D7cnAVWw7s8HyMxI2nE79Er19751LtB9bf0nfHpT0Io5Ok2rg6l87qT9g494-TVMJcB9kBtoNoduAOcyXuRCV-4H5Fzs8PYMxxx7WHXJJfYOTIOFw==",
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
