import type { Metadata } from "next";
import { ListenScreen } from "@/components/audio/ListenScreen";

export const metadata: Metadata = {
  title: "Écouter — Podcasts de Pasteur Jack",
  description:
    "Les enseignements de Pasteur Jack Brunet en audio : écoute et télécharge, partout, quand tu veux.",
};

export default function EcouterPage() {
  return <ListenScreen />;
}
