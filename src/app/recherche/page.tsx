import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { BibleSearch } from "@/components/bible/BibleSearch";

export const metadata: Metadata = {
  title: "Recherche dans la Bible",
  description: "Cherche un mot, un verset ou un thème dans toute la Bible (Louis Segond).",
};

export default function RecherchePage() {
  return (
    <>
      <PageHero
        eyebrow="Recherche"
        title={
          <>
            Cherche dans <span className="text-gradient">la Bible</span>
          </>
        }
        description="Un mot, un verset, un thème… Trouve-le dans toute la Parole, puis ouvre le passage et son commentaire."
      />
      <BibleSearch />
    </>
  );
}
