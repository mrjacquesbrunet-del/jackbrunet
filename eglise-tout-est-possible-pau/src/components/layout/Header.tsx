"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { t } from "@/i18n";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu à chaque navigation + bloque le scroll en arrière-plan.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#contenu"
        className="fixed left-4 top-4 z-[80] -translate-y-24 rounded-full bg-pulse px-5 py-2 text-sm font-bold text-night transition-transform focus:translate-y-0"
      >
        {t("a11y.skipToContent")}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-smooth ${
          scrolled || open
            ? "bg-night/85 backdrop-blur-xl"
            : "bg-gradient-to-b from-night/70 to-transparent"
        }`}
      >
        <div className="wrap flex h-20 items-center justify-between gap-4">
          <Link
            href="/"
            className="group relative z-[70] flex items-baseline gap-2 text-cream"
            aria-label={`${siteConfig.fullName} — ${t("nav.home")}`}
          >
            <span className="font-display text-xl uppercase tracking-wide">
              Tout est possible
            </span>
            <span className="font-display text-xl uppercase tracking-wide text-leaf transition-colors duration-300 group-hover:text-pulse">
              Pau
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {siteConfig.nav.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`link-underline text-sm font-semibold transition-colors duration-300 ${
                  pathname === item.href ? "text-leaf" : "text-cream/85 hover:text-cream"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.give.href}
              className="link-underline hidden text-sm font-semibold text-cream/85 hover:text-cream sm:block"
            >
              {siteConfig.give.label}
            </Link>
            <Link href={siteConfig.cta.href} className="btn-primary hidden !px-5 !py-2.5 !text-xs md:inline-flex">
              {siteConfig.cta.label}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? t("a11y.closeMenu") : t("a11y.openMenu")}
              className="relative z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors duration-300 hover:border-pulse lg:hidden"
            >
              <span className="relative block h-3.5 w-5" aria-hidden>
                <span
                  className={`absolute left-0 top-0 h-0.5 w-full bg-current transition-all duration-300 ease-smooth ${open ? "top-1/2 -translate-y-1/2 rotate-45" : ""}`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full bg-current transition-all duration-300 ease-smooth ${open ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile plein écran */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] flex flex-col justify-between bg-night px-6 pb-10 pt-28"
          >
            <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
              {[{ href: "/", label: t("nav.home") }, ...siteConfig.nav, siteConfig.give].map(
                (item, i) => (
                  <motion.div
                    key={item.href}
                    initial={reduce ? false : { opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.045, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={item.href}
                      className={`block py-2.5 font-display text-4xl uppercase transition-colors duration-300 ${
                        pathname === item.href ? "text-leaf" : "text-cream hover:text-pulse"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ),
              )}
            </nav>
            <Link href={siteConfig.cta.href} className="btn-primary w-full">
              {siteConfig.cta.label}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
