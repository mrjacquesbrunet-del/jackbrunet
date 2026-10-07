import type { Metadata } from "next";
import { ListenScreen } from "@/components/audio/ListenScreen";
import { FrancaisSeulement } from "@/components/i18n/FrancaisSeulement";

export const metadata: Metadata = {
  title: "Écouter, Podcasts de Pasteur Jack",
  description:
    "Les enseignements de Pasteur Jack Brunet en audio: écoute et télécharge, partout, quand tu veux.",
};

export default function EcouterPage() {
  return (
    <>
      <FrancaisSeulement />
      <div className="fr-seulement">
        <ListenScreen />
      </div>
    </>
  );
}
