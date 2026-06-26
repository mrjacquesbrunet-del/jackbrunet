/**
 * Source unique de configuration du site.
 *
 * L'identité éditable (nom, description, réseaux, YouTube) provient de
 * `/content/settings.json` — modifiable sans coder via l'espace d'administration.
 * La navigation reste ici (structure du site).
 */

import settings from "../../content/settings.json";

export const siteConfig = {
  name: settings.name,
  tagline: settings.tagline,
  description: settings.description,
  url: "https://jackbrunet.com",
  locale: "fr_FR",
  contactEmail: settings.contactEmail,
  heroPhoto: (settings as { heroPhoto?: string }).heroPhoto ?? "",
  social: settings.social,
};

/**
 * Intégration YouTube (depuis settings.json).
 * Les Shorts/prédications proviennent de content/shorts.json & videos.json
 * (import auto + CMS), pas d'ici.
 */
export const youtube = {
  handle: settings.youtube.handle,
  channelUrl: settings.youtube.channelUrl,
  shortsUrl: settings.youtube.shortsUrl,
  videosUrl: settings.youtube.videosUrl,
};

/** Navigation principale — partagée web + future app. */
export const mainNav = [
  { label: "Dévotionnel", href: "/devotionnel" },
  { label: "Bible", href: "/bible" },
  { label: "Plans", href: "/plans" },
  { label: "Mon carnet", href: "/carnet" },
  { label: "Actualité", href: "/actualite" },
  { label: "Vidéos", href: "/videos" },
  { label: "Madagascar", href: "/mission-madagascar" },
  { label: "Témoignages", href: "/temoignages" },
  { label: "Boutique", href: "/boutique" },
  { label: "À propos", href: "/a-propos" },
] as const;

/** Liens secondaires (footer). */
export const footerNav = [
  {
    title: "Chaque jour",
    links: [
      { label: "Dévotionnel", href: "/devotionnel" },
      { label: "Plans thématiques", href: "/plans" },
      { label: "Mon carnet", href: "/carnet" },
      { label: "Bible", href: "/bible" },
      { label: "Vidéos & Shorts", href: "/videos" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { label: "Requête de prière", href: "/#priere" },
      { label: "Témoignages", href: "/temoignages" },
      { label: "Newsletter", href: "/#newsletter" },
    ],
  },
  {
    title: "Le ministère",
    links: [
      { label: "Notre histoire", href: "/a-propos" },
      { label: "Boutique", href: "/boutique" },
      { label: "Soutenir la mission", href: "/dons" },
      { label: "Contact", href: `mailto:${siteConfig.contactEmail}` },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "CGV", href: "/cgv" },
    ],
  },
] as const;

/** CTA principal récurrent. */
export const supportCta = {
  label: "Soutenir",
  href: "/dons",
} as const;
