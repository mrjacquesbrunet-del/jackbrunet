"use client";

import { useEffect, useState } from "react";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

const KEY = "jb.profil.theme";

/**
 * Thème du profil : nuit (défaut) ou jour, choisi d'un clic et mémorisé
 * sur l'appareil. Partagé entre mon profil et les profils des membres.
 */
export function useProfileTheme() {
  const [jour, setJour] = useState(false);

  useEffect(() => {
    try {
      setJour(localStorage.getItem(KEY) === "jour");
    } catch {
      /* stockage indisponible */
    }
  }, []);

  function toggle() {
    setJour((j) => {
      const next = !j;
      try {
        localStorage.setItem(KEY, next ? "jour" : "nuit");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return { jour, toggle };
}

/** Fond continu (barre de statut + overscroll) : sombre la nuit, crème le jour. */
export function ProfileThemeBg({ jour }: { jour: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    if (jour) root.classList.add("profile-jour");
    else root.classList.remove("profile-jour");
    return () => root.classList.remove("profile-jour");
  }, [jour]);
  if (jour) return null;
  return <PlansDarkBg />;
}

/** Bouton rond soleil/lune qui bascule le thème du profil. */
export function ProfileThemeToggle({
  jour,
  onToggle,
}: {
  jour: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={jour ? "Passer en mode nuit" : "Passer en mode jour"}
      title={jour ? "Mode nuit" : "Mode jour"}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
        jour
          ? "border-night-900/20 bg-night-900/5 text-night-900 hover:bg-night-900/10"
          : "border-white/20 bg-white/10 text-cream hover:bg-white/20"
      }`}
    >
      {jour ? (
        // Lune (repasser en nuit)
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
          <path
            d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // Soleil (passer en jour)
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
