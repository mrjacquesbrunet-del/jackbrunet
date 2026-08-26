"use client";

import { GamesHub } from "@/components/games/GamesHub";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export default function JeuxPage() {
  return (
    <main className="relative min-h-[100dvh]">
      <PlansDarkBg />
      <div className="relative">
        <GamesHub />
      </div>
    </main>
  );
}
