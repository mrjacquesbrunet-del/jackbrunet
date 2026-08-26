"use client";

import { QuizScreen } from "@/components/quiz/QuizScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export default function QuizPage() {
  return (
    <main className="relative min-h-[100dvh] pb-24">
      <PlansDarkBg />
      <div className="relative">
        <QuizScreen />
      </div>
    </main>
  );
}
