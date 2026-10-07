"use client";

import { Suspense } from "react";
import { QuizScreen } from "@/components/quiz/QuizScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import { AvecContenus } from "@/components/i18n/AvecContenus";

export default function QuizPage() {
  return (
    <main className="relative min-h-[100dvh] pb-24">
      <PlansDarkBg />
      <div className="relative">
        {/* Suspense requis : l'écran lit ?duel=CODE (lien de défi en direct). */}
        <Suspense fallback={null}>
          <AvecContenus fichiers={["quiz"]}>
            <QuizScreen />
          </AvecContenus>
        </Suspense>
      </div>
    </main>
  );
}
