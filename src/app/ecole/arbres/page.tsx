import type { Metadata } from "next";
import { ArbresGenealogiques } from "@/components/ecole/ArbresGenealogiques";

export const metadata: Metadata = {
  title: "Arbres généalogiques de la Bible",
  description: "Les familles de la Bible, d'Adam à Jésus : patriarches, tribus, rois, et les généalogies de Matthieu et de Luc.",
  robots: { index: false },
};

export default function ArbresPage() {
  return <ArbresGenealogiques />;
}
