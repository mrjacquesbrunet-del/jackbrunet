import type { Metadata } from "next";
import { ArchiveExhortations } from "@/components/devotional/ArchiveExhortations";

export const metadata: Metadata = {
  title: "Toutes les exhortations",
  description: "Retrouve et relis les exhortations du Temps avec Jésus des 90 derniers jours.",
};

export default function ExhortationsPage() {
  return <ArchiveExhortations />;
}
