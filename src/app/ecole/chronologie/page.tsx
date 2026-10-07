import type { Metadata } from "next";
import { FriseChronologique } from "@/components/ecole/FriseChronologique";
import { AvecContenus } from "@/components/i18n/AvecContenus";

export const metadata: Metadata = {
  title: "Frise chronologique de la Bible",
  description: "L'histoire de la Bible, de la création à l'Apocalypse : événements, dates, passages, personnages et lieux.",
  robots: { index: false },
};

export default function FrisePage() {
  return (
    <AvecContenus fichiers={["chronologie-biblique"]}>
      <FriseChronologique />
    </AvecContenus>
  );
}
