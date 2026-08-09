"use client";

import { siteConfig } from "@/config/site";
import { useAppMode } from "@/lib/app-mode";

/** Marque du pied de page : « RHEMA » dans l'app, « Jack Brunet » sur le site. */
export function FooterBrand() {
  const isApp = useAppMode();
  if (isApp) {
    return (
      <span className="font-sans text-2xl font-extrabold uppercase tracking-[0.2em] text-cream">
        RHEMA
      </span>
    );
  }
  return (
    <>
      <span className="font-display text-2xl font-bold uppercase tracking-tight text-cream">
        {siteConfig.name.split(" ")[0]}
      </span>
      <span className="font-sans text-2xl font-extrabold uppercase tracking-tight text-dawn-400">
        {siteConfig.name.split(" ").slice(1).join("")}
      </span>
    </>
  );
}
