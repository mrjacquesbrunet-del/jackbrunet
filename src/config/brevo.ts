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
  | "rhema"
  | "soaking"
  | "boutique"
  | "dons"
  | "priere"
  | "temoignages"
  | "mission"
  | "membres";

export const BREVO_ENDPOINTS: Record<BrevoFormKey, string | null> = {
  newsletter:
    "https://27d09ed7.sibforms.com/serve/MUIFAC_7RFJAdQ6MVjqLN8RCSWKm11pBgyucs8Kb7t2H_7f31Fc2It2MHjCZEIb9OMc9LdULmJCyKHjdTGrjOB_fzjJ4rv18gjN_MoQD-quQC1PUDShBMltKeW3rpU6GrLPoNVDDDBYCW_J55L8v4r_WiyJYod7qxVKgUTNvoXDgwl5hxzdXYXjPgy7I1eqZkRvdElQeuML6fSEqXw==",
  ebook:
    "https://27d09ed7.sibforms.com/serve/MUIFAE-lwEuLsYrTGOR9hIGAT98fQx3uYmzRe6uoI-gQEvQ986gJPJPyRXvDQRSC46o9UXLMc0uQlAdAWuPfk5aSaEEkALzq5L09u2n9dFbD8TiA3nGP9IGTc790qDLs3JLuCvAlsZcTOHCSjxouz6i3hmbibwuPpfdu_4ooF6cYQ2QPYKjiXKrVclGQ0GjI_NO0rGFIBYzLB_3wJw==",
  // 1 liste = 1 cadeau (pour des automatisations d'envoi distinctes).
  rhema:
    "https://27d09ed7.sibforms.com/serve/MUIFAEbQ2t9CXrPDPgHPr8Dm9BiUaJeopBjD_QWw6POUiyg2YmCYDiV6aQvmh4nTYXrlXPFVIsw__DL4M9JlOE0-opjSirBddjIHLHfAkH9A6RpFfCc9dCWcz4n6azQSlgCkwLxFbcafuaeiJb_3NMkrAJmCiqO6MBMaK_2wvxR7hdjr9Z399SQxk9-FLXYE41kQUptP4k8R22XN8g==",
  soaking:
    "https://27d09ed7.sibforms.com/serve/MUIFAJHlIaW54ub12NkHXi34yydOSuqODJ7J75a5UXQCDDnXpHX76qFbxsA1iu2XfcX3WNc0KTGPQ5HO5OKOCxJK-ZvdD00Vphc4wPx1NCRdZy8KGdiX7D2bqW_U3D758B_KUPVk1JXkZhLFZnZvUtFFiOFv0vZKQB4Oj958HkGs24oB7SNTYqKihjt8ZHbvYSEr9c0oA1dmJXYcpQ==",
  // Membres de l'app (inscription/connexion) — capture auto email + nom.
  membres:
    "https://27d09ed7.sibforms.com/serve/MUIFADw4C9OhZlGa3jild9dk1RE4L3RJHR4Ram7w5ba0bbR_YqBLKCynUJ_s3bcpSCfIg0aqui2wGnexGs_Os4M-QxlgoYbn4Jbr3G0FlywmQ5eurujFvbo1iNAYl1B52ou_RrUNcyuHVvFaOpfEufWXoHnhhI2fdL2reSFbSIBg-3CCVb1hDrzvqPMSuhqxxUnf8xCd8zAq343D-A==",

  boutique:
    "https://27d09ed7.sibforms.com/serve/MUIFANp_6dO3R15ypdw-nkNvSM_LyHzGHaTSUHoI32w2AqH5IAd50unn430pMOgMPUhGM69WtfVhQ26BJm8OF5r-9ctRv7rYMvl8diaR_1UTOdDXv0WG4ce3Ji5b7yV_qwOMrPt1eoZBR4IFJ0YlLXx-XDkOsHySPXsPKxcbZCCM2nzvDrqBhw5csfvK4-A5JQblyWbPn91-3qXB5g==",
  dons:
    "https://27d09ed7.sibforms.com/serve/MUIFAAeOI9s764C0QRMkPtrtkzWwqLntM27QI3lTonEXxMygjXY-NE0ZPbeag58p5dFX0XHhxky0UsUB2sckjSMCkp5j_kebRPKIUPdZlkZUxpzduywies7IiRb4RsTZJFZTGp_l5q7_fmvkp5kszK50eCwIDo6YfUJrRSfPsgs5gijrNLpjkNOFOwEs3OGowFy9CC9utkw5grFKZw==",
  priere:
    "https://27d09ed7.sibforms.com/serve/MUIFAGrPoxGUnlFpL2PCdOshU_4PYmndY_juwbl0FovGiLojmjyk6kklDVswEJRj6XVUZq-2hf62ty-Yh6Zz4QCAub4VK-wxSpVX-5M3QW1PKSm5CNLMwx-nA-bu4hISpQv7jGEIQ7_HrJ0YpkXwbzNjHzH4WceL0AwKd2OxPINuJZhsNpigC9N6LT0pl6mX3_-g-priHISPB_WyOA==",
  temoignages:
    "https://27d09ed7.sibforms.com/serve/MUIFALYp5pHYAhrI6B0ns51z9LMXIc7Qav85PKXcHOh5VM_6khVYS6bE5RXyT8KkK5x35ZiBcqGiGOsiq7dkG6CO_YOwbW8g1D7cnAVWw7s8HyMxI2nE79Er19751LtB9bf0nfHpT0Io5Ok2rg6l87qT9g494-TVMJcB9kBtoNoduAOcyXuRCV-4H5Fzs8PYMxxx7WHXJJfYOTIOFw==",
  mission:
    "https://27d09ed7.sibforms.com/serve/MUIFAF9zxAlf8WLekEypBopwF9FfXeymB6Fns1866j62dOUXCffEZMm92aLpwUKUygwwaEyBnksqYW8X-3NIw1IUzM75n1enYLvbvr3PXyzho4qh7YhtFqQf8LhohZi-FBf7BhBg-aDL0l7l4Sdv7m4k3vDJES2KIr8-4Xv-wAz1R4CsAVUqMDla0ANCWN9mwj_Xbn3JQ5IC51JpPw==",
};

/** Associe une origine de formulaire email (prop `source`) à une liste Brevo. */
export function brevoKeyForSource(source: string): BrevoFormKey {
  switch (source) {
    // Toutes les captations qui PROMETTENT l'ebook « 7 jours pour retrouver
    // la paix » → liste « ebook » (qui déclenche l'envoi automatique du PDF).
    case "popup":
    case "cadeau-ebook":
    case "cta-newsletter":
    case "pensee-du-jour":
    case "exclusivites":
      return "ebook";
    case "cadeau-soaking":
      return "soaking";
    case "cadeau-rhema":
      return "rhema";
    case "boutique":
    case "page-boutique":
      return "boutique";
    case "page-dons":
      return "dons";
    case "mission-madagascar":
      return "mission";
    // Inscription/connexion à l'application (compte membre).
    case "app-membre":
      return "membres";
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
