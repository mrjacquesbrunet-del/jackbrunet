import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Shop } from "@/components/home/Shop";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "RHEMA — 365 révélations bibliques à méditer chaque jour. Le livre de Jack Brunet, bientôt disponible.",
};

export default function BoutiquePage() {
  return (
    <>
      <PageHero
        eyebrow="Boutique"
        title={
          <>
            Le livre <span className="text-gradient">RHEMA</span>
          </>
        }
        description="L'aboutissement de ces dernières années — 365 révélations bibliques à méditer chaque jour."
      />

      <Shop />
    </>
  );
}
