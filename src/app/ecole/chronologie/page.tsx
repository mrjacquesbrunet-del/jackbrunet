import type { Metadata } from "next";
import { FriseChronologique } from "@/components/ecole/FriseChronologique";

export const metadata: Metadata = {
  title: "Frise chronologique de la Bible",
  description: "L'histoire de la Bible, de la création à l'Apocalypse : événements, dates, passages, personnages et lieux.",
  robots: { index: false },
};

export default function FrisePage() {
  return <FriseChronologique />;
}
