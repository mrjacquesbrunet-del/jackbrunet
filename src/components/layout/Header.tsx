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
      className={`site-header fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-night-900/10 bg-cream/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link
          href="/"
          className="group flex items-baseline"
          onClick={() => setOpen(false)}
        >
          <span className="font-display text-2xl font-bold uppercase tracking-tight text-night-900">
            {siteConfig.name.split(" ")[0]}
          </span>
          <span className="font-sans text-2xl font-extrabold uppercase tracking-tight text-night-900">
            {siteConfig.name.split(" ").slice(1).join("")}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold uppercase tracking-wide text-night-900/70 transition-colors hover:bg-night-900/5 hover:text-night-900"
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
            className="grid h-10 w-10 place-items-center rounded-full border border-night-900/20 bg-night-900/[0.03] lg:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-night-900 transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-5 bg-night-900 transition-all duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-5 bg-night-900 transition-all duration-300 ${
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
            className="overflow-hidden border-t border-night-900/10 bg-cream/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="container-x flex flex-col gap-1 py-5">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-semibold uppercase tracking-wide text-night-900/85 transition-colors hover:bg-night-900/5"
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
