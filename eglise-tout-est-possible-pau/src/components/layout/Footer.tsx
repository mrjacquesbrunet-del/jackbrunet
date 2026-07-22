import Link from "next/link";
import { siteConfig } from "@/config/site";
import { settings, home } from "@/lib/content";
import { t } from "@/i18n";

const socials = [
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
] as const;

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden border-t border-cream/10 bg-night text-cream">
      <div className="wrap relative py-20 sm:py-28">
        {/* Verset signature */}
        <p className="display-3 max-w-4xl text-balance">
          {home.verse.text}
          <span className="mt-3 block text-sm font-semibold uppercase tracking-kicker text-leaf">
            {home.verse.reference}
          </span>
        </p>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl uppercase tracking-wide">
              Tout est possible <span className="text-leaf">Pau</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/60">
              Annoncer. Restaurer. Équiper. Envoyer. <br />
              Une église pour Pau, portée par l&apos;amour.
            </p>
          </div>

          <nav aria-label="Pages du site">
            <p className="kicker">{t("nav.menu")}</p>
            <ul className="mt-4 space-y-2.5">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline text-sm text-cream/75 hover:text-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/dons" className="link-underline text-sm text-cream/75 hover:text-cream">
                  {t("nav.give")}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="kicker">{t("footer.visit")}</p>
            <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-cream/75">
              <p>{settings.address.venue}</p>
              <p>
                {settings.address.postalCode} {settings.address.city}
              </p>
              <p className="pt-2">
                <a href={`mailto:${settings.contactEmail}`} className="link-underline hover:text-cream">
                  {settings.contactEmail}
                </a>
              </p>
            </address>
          </div>

          <div>
            <p className="kicker">{t("footer.follow")}</p>
            <ul className="mt-4 space-y-2.5">
              {socials.map(({ key, label }) => {
                const href = settings.social[key];
                if (!href) return null;
                return (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-sm text-cream/75 hover:text-cream"
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.fullName}. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="link-underline hover:text-cream">
              {t("footer.legal")}
            </Link>
            <Link href="/confidentialite" className="link-underline hover:text-cream">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
