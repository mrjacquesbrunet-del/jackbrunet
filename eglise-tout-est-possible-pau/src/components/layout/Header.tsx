"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { t } from "@/i18n";

// Header minimaliste (style référence) : logo à gauche, « MENU » à droite.
// Toute la navigation vit dans le panneau plein écran.
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

      {/* z-index au-dessus du panneau quand le menu est ouvert, pour que
          « Fermer » reste cliquable */}
      <header
        className={`fixed inset-x-0 top-0 transition-all duration-500 ease-smooth ${
          open ? "z-[70]" : "z-50"
        } ${
          scrolled || open
            ? "bg-night/85 backdrop-blur-xl"
            : "bg-gradient-to-b from-night/70 to-transparent"
        }`}
      >
        <div className="wrap flex h-20 items-center justify-between gap-4">
          <Link
            href="/"
            className="relative z-[70] flex items-center transition-transform duration-300 ease-smooth hover:scale-105"
            aria-label={`${siteConfig.fullName} — ${t("nav.home")}`}
          >
            <Image
              src="/logo.png"
              alt={`Logo ${siteConfig.fullName}`}
              width={52}
              height={52}
              priority
              className="h-12 w-12 object-contain sm:h-[52px] sm:w-[52px]"
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="wordmark link-underline relative z-[70] text-base text-cream transition-colors duration-300 hover:text-pulse sm:text-lg"
          >
            {open ? t("nav.close") : t("nav.menu")}
          </button>
        </div>
      </header>

      {/* Menu plein écran */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] flex flex-col justify-between overflow-y-auto bg-night px-6 pb-10 pt-28 sm:px-12"
          >
            <nav aria-label="Navigation principale" className="flex flex-col gap-1">
              {[{ href: "/", label: t("nav.home") }, ...siteConfig.nav, siteConfig.give].map(
                (item, i) => (
                  <motion.div
                    key={item.href}
                    initial={reduce ? false : { opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={item.href}
                      className={`display-3 block py-2 transition-colors duration-300 ${
                        pathname === item.href ? "text-pulse" : "text-cream hover:text-pulse"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ),
              )}
            </nav>
            <Link href={siteConfig.cta.href} className="btn-primary mt-10 w-full sm:w-auto">
              {siteConfig.cta.label}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
