"use client";

import { VraiFauxScreen } from "@/components/games/VraiFauxScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export default function VraiFauxPage() {
  return (
    <main className="relative min-h-[100dvh]">
      <PlansDarkBg />
      <div className="relative">
        <VraiFauxScreen />
      </div>
    </main>
  );
}
