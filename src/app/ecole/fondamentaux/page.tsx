import type { Metadata } from "next";
import { FormationView } from "@/components/ecole/FormationView";

export const metadata: Metadata = {
  title: "Les fondamentaux de la foi chrétienne",
  description:
    "La formation en 7 leçons de Josy W. Brunet : qui est Dieu, le salut, le baptême, la Sainte Cène, la générosité, l'Église et la nouvelle vie — avec quiz de validation et e-book offert.",
};

export default function FondamentauxPage() {
  return <FormationView formationId="fondamentaux-vol1" />;
}
