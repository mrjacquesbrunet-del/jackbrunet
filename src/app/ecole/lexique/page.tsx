import type { Metadata } from "next";
import { LexiqueView } from "@/components/ecole/LexiqueView";

export const metadata: Metadata = {
  title: "Lexique grec et hébreu",
  description: "Les mots grecs et hébreux de la Bible : sens, mots apparentés et concordance dans la Segond 1910.",
  robots: { index: false },
};

export default function LexiquePage() {
  return <LexiqueView />;
}
