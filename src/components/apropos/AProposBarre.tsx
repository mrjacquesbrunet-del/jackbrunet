"use client";

import { useEffect } from "react";

/** Page À propos : fond nuit jusqu'aux bords (site et app). */
export function AProposBarre() {
  useEffect(() => {
    const h = document.documentElement;
    h.classList.add("page-nuit");
    return () => h.classList.remove("page-nuit");
  }, []);
  return null;
}
