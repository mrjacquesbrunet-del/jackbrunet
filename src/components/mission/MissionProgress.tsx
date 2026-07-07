"use client";

import { useEffect, useState } from "react";
import { getMissionStats } from "@/lib/mission";

/**
 * Barre de progression de la collecte, lue EN DIRECT depuis Supabase (se met à
 * jour sans reconstruire le site). Les valeurs initiales (issues du contenu)
 * servent au premier affichage, puis on bascule sur le montant réel.
 */
export function MissionProgress({
  initialRaised,
  objective,
}: {
  initialRaised: number;
  objective: number;
}) {
  const [raised, setRaised] = useState(initialRaised);
  const [obj, setObj] = useState(objective);

  useEffect(() => {
    let alive = true;
    getMissionStats().then((s) => {
      if (alive && s) {
        setRaised(s.raised);
        if (s.objective > 0) setObj(s.objective);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const percent = obj > 0? Math.min(100, Math.round((raised / obj) * 100)): 0;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#FAF6F0]/80">
          {raised.toLocaleString("fr-FR")} € collectés
        </span>
        <span className="font-semibold text-[#EBA94D]">
          Objectif {obj.toLocaleString("fr-FR")} €
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#E0892B] to-[#EBA94D] transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-[#FAF6F0]/55">{percent}% de l'objectif atteint</p>
    </div>
  );
}
