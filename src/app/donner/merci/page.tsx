import type { Metadata } from "next";
import { Suspense } from "react";
import { DonMerci } from "@/components/mission/DonnerRapide";

export const metadata: Metadata = {
  title: "Merci pour ta contribution",
  robots: { index: false },
};

export default function DonMerciPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-night-950" />}>
      <DonMerci />
    </Suspense>
  );
}
