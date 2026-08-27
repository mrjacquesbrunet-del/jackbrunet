"use client";

import { WhoAmIScreen } from "@/components/games/WhoAmIScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export default function QuiSuisJePage() {
  return (
    <main className="relative min-h-[100dvh]">
      <PlansDarkBg />
      <div className="relative">
        <WhoAmIScreen />
      </div>
    </main>
  );
}
