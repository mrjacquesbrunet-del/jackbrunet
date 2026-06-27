import type { Metadata } from "next";
import { ExclusivesView } from "@/components/app/ExclusivesView";

export const metadata: Metadata = {
  title: "Exclusivités",
  description:
    "Contenus exclusifs offerts : ebooks, audios et bonus. Débloque-les gratuitement avec ton email.",
};

export default function ExclusivitesPage() {
  return <ExclusivesView />;
}
