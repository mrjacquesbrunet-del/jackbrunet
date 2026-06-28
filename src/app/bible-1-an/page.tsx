import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { YearPlanView } from "@/components/plans/YearPlanView";

export const metadata: Metadata = {
  title: "La Bible en 1 an",
  description: "Lis toute la Bible en un an : un court passage chaque jour, avec ta progression.",
};

export default function BibleEnUnAnPage() {
  return (
    <>
      <PageHero
        eyebrow="Plan de lecture"
        title={
          <>
            La Bible en <span className="text-gradient">1 an</span>
          </>
        }
        description="Un court passage chaque jour pour traverser toute la Parole en une année. Avance à ton rythme, ta progression est gardée."
      />
      <YearPlanView />
    </>
  );
}
