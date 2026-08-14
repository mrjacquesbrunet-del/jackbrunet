"use client";

import { useEffect } from "react";

/**
 * Active un fond noir continu (barre de statut + overscroll) sur les pages
 * Plans, puis le retire en quittant la page. Évite les liserés clairs en haut
 * et en bas quand la page est en noir profond.
 */
export function PlansDarkBg() {
  useEffect(() => {
    const el = document.documentElement;
    el.classList.add("plans-dark");
    return () => el.classList.remove("plans-dark");
  }, []);
  return null;
}
