import type { Metadata } from "next";
import { GalerieFiches } from "@/components/ecole/GalerieFiches";

export const metadata: Metadata = {
  title: "Personnages & lieux de la Bible",
  description: "Les personnages et les lieux de la Bible, de la Genèse à l'Apocalypse, en fiches à faire défiler.",
  robots: { index: false },
};

export default function GaleriePage() {
  return <GalerieFiches />;
}
