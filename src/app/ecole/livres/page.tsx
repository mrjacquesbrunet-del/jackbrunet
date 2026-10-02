import type { Metadata } from "next";
import { BibliothequeLivres } from "@/components/ecole/BibliothequeLivres";

export const metadata: Metadata = {
  title: "Les 66 livres de la Bible",
  description: "Une introduction à chaque livre de la Bible : auteur, date, destinataires, contexte, plan, thèmes et versets clés.",
  robots: { index: false },
};

export default function LivresPage() {
  return <BibliothequeLivres />;
}
