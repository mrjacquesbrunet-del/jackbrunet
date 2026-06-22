"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mainNav, siteConfig, supportCta } from "@/config/site";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Verrouille le scroll quand le menu mobile est ouvert.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-night-950/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-dawn-400 to-spirit-500 shadow-glow">
            <span className="h-3 w-3 rounded-full bg-night-950" />
            <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            {siteConfig.name}
            <span className="text-dawn-400">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-cream/75 transition-colors hover:bg-white/5 hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={supportCta.href} className="btn-primary hidden sm:inline-flex">
            <HeartIcon className="h-4 w-4" />
            {supportCta.label}
          </Link>

          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 lg:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-cream transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-5 bg-cream transition-all duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-5 bg-cream transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-night-950/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="container-x flex flex-col gap-1 py-5">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-cream/85 transition-colors hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={supportCta.href}
                onClick={() => setOpen(false)}
                className="btn-primary mt-3"
              >
                <HeartIcon className="h-4 w-4" />
                {supportCta.label}
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 21s-7.5-4.6-10-9.2C.2 8.4 1.7 4.8 5.2 4.2 7.4 3.8 9.3 5 12 7.6 14.7 5 16.6 3.8 18.8 4.2c3.5.6 5 4.2 3.2 7.6C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
