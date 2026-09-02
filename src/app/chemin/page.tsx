import type { Metadata } from "next";
import { CheminScreen } from "@/components/chemin/CheminScreen";

export const metadata: Metadata = {
  title: "Le Chemin — apprendre la Bible pas à pas",
  description:
    "La route d'apprentissage de la Bible : de la Création à l'Apocalypse, apprends l'histoire de chaque personnage étape par étape et gagne leurs cartes.",
};

export default function CheminPage() {
  return <CheminScreen />;
}
