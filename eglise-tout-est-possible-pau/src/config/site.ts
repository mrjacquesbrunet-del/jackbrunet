import { settings } from "@/lib/content";
import { t } from "@/i18n";

// Source unique : identité, navigation, liens.
export const siteConfig = {
  name: settings.name,
  city: settings.city,
  fullName: `${settings.name} ${settings.city}`,
  tagline: settings.tagline,
  description: settings.description,
  url: settings.url,
  locale: "fr_FR",
  nav: [
    { href: "/premiere-visite", label: t("nav.firstVisit") },
    { href: "/a-propos", label: t("nav.about") },
    { href: "/vision", label: t("nav.vision") },
    { href: "/equipe", label: t("nav.team") },
    { href: "/reunions", label: t("nav.meetings") },
    { href: "/messages", label: t("nav.messages") },
    { href: "/temoignages", label: t("nav.testimonies") },
    { href: "/annonces", label: t("nav.newsletter") },
    { href: "/contact", label: t("nav.contact") },
  ],
  cta: { href: "/premiere-visite", label: t("nav.plan") },
  give: { href: "/dons", label: t("nav.give") },
};
