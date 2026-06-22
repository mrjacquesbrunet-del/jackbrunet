/**
 * Source unique de configuration du site.
 *
 * Centralisée ici pour que la future application mobile puisse réutiliser
 * exactement la même navigation, les mêmes libellés et la même identité.
 */

export const siteConfig = {
  name: "Lumière",
  tagline: "Ministère chrétien",
  description:
    "Une plateforme chrétienne vivante : pensée du jour, parole biblique, plan de lecture, vidéos, prières et témoignages — pour grandir en Jésus chaque jour.",
  url: "https://lumiere.ministere",
  locale: "fr_FR",
  contactEmail: "contact@lumiere.ministere",
  social: {
    youtube: "https://youtube.com",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
  },
} as const;

/** Navigation principale — partagée web + future app. */
export const mainNav = [
  { label: "Accueil", href: "/" },
  { label: "Aujourd'hui", href: "/#aujourdhui" },
  { label: "Vidéos", href: "/#videos" },
  { label: "Plan de lecture", href: "/#plan" },
  { label: "Témoignages", href: "/#temoignages" },
  { label: "Boutique", href: "/boutique" },
  { label: "À propos", href: "/a-propos" },
] as const;

/** Liens secondaires (footer). */
export const footerNav = [
  {
    title: "Chaque jour",
    links: [
      { label: "Pensée du jour", href: "/#pensee" },
      { label: "Verset du jour", href: "/#verset" },
      { label: "Plan de lecture", href: "/#plan" },
      { label: "Dernières vidéos", href: "/#videos" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { label: "Requête de prière", href: "/#priere" },
      { label: "Témoignages", href: "/#temoignages" },
      { label: "Newsletter", href: "/#newsletter" },
    ],
  },
  {
    title: "Le ministère",
    links: [
      { label: "Notre histoire", href: "/a-propos" },
      { label: "Boutique", href: "/boutique" },
      { label: "Soutenir la mission", href: "/dons" },
      { label: "Contact", href: "mailto:contact@lumiere.ministere" },
    ],
  },
] as const;

/** CTA principal récurrent. */
export const supportCta = {
  label: "Soutenir la mission",
  href: "/dons",
} as const;
