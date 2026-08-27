"use client";

import { ChallengeScreen } from "@/components/games/ChallengeScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export default function DefiPage() {
  return (
    <main className="relative min-h-[100dvh]">
      <PlansDarkBg />
      <div className="relative">
        <ChallengeScreen />
      </div>
    </main>
  );
}
