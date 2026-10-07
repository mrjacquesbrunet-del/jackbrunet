import type { Metadata } from "next";
import { EcoleView } from "@/components/ecole/EcoleView";
import { AvecContenus } from "@/components/i18n/AvecContenus";

export const metadata: Metadata = {
  title: "Étude biblique",
  description:
    "Formations, études bibliques, assistant et outils d'exploration : l'espace pour apprendre et s'enraciner dans la Parole.",
};

export default function EcolePage() {
  return (
    <AvecContenus fichiers={["formations", "etudes"]}>
      <EcoleView />
    </AvecContenus>
  );
}
