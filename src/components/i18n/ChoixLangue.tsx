"use client";

import { useEffect, useState } from "react";
import { LANGUES, getLangue, setLangue, type Langue } from "@/lib/i18n";

/**
 * Choix de la langue de l'app (français, anglais, portugais du Brésil).
 * Les noms des langues sont écrits dans leur propre langue et ne sont
 * jamais traduits (translate="no").
 */
export function ChoixLangue({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [courante, setCourante] = useState<Langue | null>(null);
  useEffect(() => setCourante(getLangue()), []);
  const sombre = tone === "dark";

  return (
    <div className="grid grid-cols-3 gap-2" translate="no">
      {LANGUES.map((l) => {
        const actif = courante === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => !actif && setLangue(l.code)}
            aria-pressed={actif}
            className={`rounded-2xl px-2 py-3 text-center transition-colors ${
              actif
                ? "bg-[#CAF000] text-[#0A0B07]"
                : sombre
                  ? "bg-white/[0.06] text-cream hover:bg-white/10"
                  : "bg-night-900/[0.05] text-night-900 hover:bg-night-900/10"
            }`}
          >
            <span className="block text-[11px] font-black tracking-widest opacity-70">{l.drapeau}</span>
            <span className="mt-0.5 block text-[13px] font-bold leading-tight">{l.nom}</span>
          </button>
        );
      })}
    </div>
  );
}
