import Link from "next/link";
import { footerNav, siteConfig } from "@/config/site";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

export function Footer() {
  return (
    <footer className="dark-ctx bg-topo-dark relative mt-24 overflow-hidden border-t border-white/10">
      <div className="blob -left-24 top-0 h-72 w-72 bg-spirit-600/20" />
      <div className="blob -right-24 bottom-0 h-72 w-72 bg-dawn-500/15" />

      <div className="container-x relative z-10 py-16">
        {/* Captation email — footer */}
        <div className="glass-strong flex flex-col gap-6 rounded-4xl p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
              Reçois la <span className="text-gradient">lumière</span> chaque matin
            </h3>
            <p className="mt-2 text-cream/70">
              Une pensée, un verset et le passage du jour — directement dans ta boîte mail.
            </p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterForm source="footer" cta="Recevoir chaque jour" />
          </div>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-baseline">
              <span className="font-display text-2xl font-bold uppercase tracking-tight text-cream">
                {siteConfig.name.split(" ")[0]}
              </span>
              <span className="font-sans text-2xl font-extrabold uppercase tracking-tight text-dawn-400">
                {siteConfig.name.split(" ").slice(1).join("")}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex gap-2">
              <SocialLink href={siteConfig.social.youtube} label="YouTube" />
              <SocialLink href={siteConfig.social.instagram} label="Instagram" />
              <SocialLink href={siteConfig.social.tiktok} label="TikTok" />
              <SocialLink href={siteConfig.social.facebook} label="Facebook" />
            </div>
          </div>

          {footerNav.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-cream/90">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 transition-colors hover:text-dawn-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-sm text-cream/45 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Pour la gloire de Jésus.
          </p>
          <div className="flex gap-5">
            <Link href="/dons" className="transition-colors hover:text-dawn-300">
              Soutenir
            </Link>
            <Link href="/a-propos" className="transition-colors hover:text-dawn-300">
              À propos
            </Link>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="transition-colors hover:text-dawn-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-cream/70 transition-all hover:border-dawn-400/50 hover:text-dawn-300"
    >
      {label.slice(0, 2)}
    </a>
  );
}
