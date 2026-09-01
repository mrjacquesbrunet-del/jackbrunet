import type { Metadata } from "next";
import { ChronoScreen } from "@/components/games/ChronoScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export const metadata: Metadata = {
  title: "La Chronologie",
  description:
    "Deux événements de la Bible : lequel est arrivé en premier ? Remets l'histoire dans l'ordre et bats ton record.",
};

export default function ChronologiePage() {
  return (
    <main className="relative min-h-[100dvh]">
      <PlansDarkBg />
      <div className="relative">
        <ChronoScreen />
      </div>
    </main>
  );
}
