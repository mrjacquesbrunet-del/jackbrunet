import type { Metadata } from "next";
import { Suspense } from "react";
import { DonnerRapide } from "@/components/mission/DonnerRapide";

export const metadata: Metadata = {
  title: "Soutiens la mission",
  description: "Une contribution en quelques secondes, par Apple Pay, Google Pay ou carte bancaire.",
};

export default function DonnerPage() {
  return (
    // Suspense requis : la page lit ?montant= et ?mensuel=.
    <Suspense fallback={<div className="min-h-[100svh] bg-night-950" />}>
      <DonnerRapide />
    </Suspense>
  );
}
