"use client";

import { WhoAmIScreen } from "@/components/games/WhoAmIScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import { AvecContenus } from "@/components/i18n/AvecContenus";

export default function QuiSuisJePage() {
  return (
    <main className="relative min-h-[100dvh]">
      <PlansDarkBg />
      <div className="relative">
        <AvecContenus fichiers={["whoami"]}>
          <WhoAmIScreen />
        </AvecContenus>
      </div>
    </main>
  );
}
