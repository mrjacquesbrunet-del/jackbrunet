import type { Metadata } from "next";
import { FrondeScreen } from "@/components/games/FrondeScreen";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export const metadata: Metadata = {
  title: "La Fronde de David",
  description:
    "Jeu d'adresse : vise, tends la fronde et fais tomber les cibles — jusqu'à Goliath. 30 niveaux, 3 étoiles à décrocher partout.",
};

export default function FrondePage() {
  return (
    <main className="relative min-h-[100dvh]">
      <PlansDarkBg />
      <div className="relative">
        <FrondeScreen />
      </div>
    </main>
  );
}
