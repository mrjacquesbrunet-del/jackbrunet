import type { Metadata } from "next";
import { DonateScreen } from "@/components/mission/DonateScreen";

export const metadata: Metadata = {
  title: "Faire un don",
  description:
    "Soutiens l'évangélisation, l'aide humanitaire et le ministère pastoral. Ton don, volontaire et sécurisé, est traité sur le site. Annoncer, aimer, servir.",
};

export default function DonPage() {
  return <DonateScreen />;
}
