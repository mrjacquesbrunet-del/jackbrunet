import type { Metadata } from "next";
import { Suspense } from "react";
import { EtudesView } from "@/components/ecole/EtudesView";

export const metadata: Metadata = {
  title: "Études bibliques",
  description: "Des études bibliques à lire seul ou en groupe, classées par thème et par auteur.",
};

export default function EtudesPage() {
  return (
    // Suspense requis : la page lit ?e=, ?theme= et ?auteur=.
    <Suspense fallback={null}>
      <EtudesView />
    </Suspense>
  );
}
