/**
 * Source unique de configuration du site.
 *
 * Centralisée ici pour que la future application mobile puisse réutiliser
 * exactement la même navigation, les mêmes libellés et la même identité.
 */

export const siteConfig = {
  name: "Jack Brunet",
  tagline: "Ministère chrétien",
  description:
    "Une plateforme chrétienne vivante : pensée du jour, parole biblique, plan de lecture, vidéos, prières et témoignages — pour grandir en Jésus chaque jour.",
  url: "https://lumiere.ministere",
  locale: "fr_FR",
  contactEmail: "contact@lumiere.ministere",
  social: {
    youtube: "https://www.youtube.com/@Jack_brnt",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
  },
} as const;

/**
 * Intégration YouTube.
 *
 * `shorts` et `featured` attendent des IDs de vidéos (11 caractères, la partie
 * après `watch?v=` ou `/shorts/`). Dès qu'ils sont renseignés, les Shorts
 * s'affichent en lecture directe sur le site. Tant que `shorts` est vide,
 * la section renvoie élégamment vers l'onglet Shorts de la chaîne.
 */
export const youtube = {
  handle: "@Jack_brnt",
  channelUrl: "https://www.youtube.com/@Jack_brnt",
  shortsUrl: "https://www.youtube.com/@Jack_brnt/shorts",
  videosUrl: "https://www.youtube.com/@Jack_brnt/videos",
  // Ex. : ["dQw4w9WgXcQ", "..."] — colle ici les IDs de tes Shorts.
  shorts: [] as string[],
  // IDs de vidéos longues à mettre en avant (optionnel).
  featured: [] as string[],
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
