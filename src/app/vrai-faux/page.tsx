"use client";

import { Suspense } from "react";
import { VraiFauxScreen } from "@/components/games/VraiFauxScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export default function VraiFauxPage() {
  return (
    <main className="relative min-h-[100dvh]">
      <PlansDarkBg />
      <div className="relative">
        {/* Suspense requis : l'écran lit ?duel=CODE (lien de défi en direct). */}
        <Suspense fallback={null}>
          <VraiFauxScreen />
        </Suspense>
      </div>
    </main>
  );
}
