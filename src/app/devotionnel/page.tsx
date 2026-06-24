import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { DevotionalView } from "@/components/home/DevotionalView";
import {
  getDevotions,
  getReadingPlan,
  getLatestShort,
  getShorts,
  todayIndex,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Dévotionnel",
  description:
    "Ton dévotionnel quotidien : une méditation pour t'enraciner en Jésus — un verset à déclarer, une réflexion en profondeur, des questions, le passage du jour et la vidéo. Nouveau chaque jour.",
};

export default function DevotionnelPage() {
  const devotions = getDevotions();
  const plan = getReadingPlan();
  const latestShort = getLatestShort();
  const shorts = getShorts();
  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <PageHero
        eyebrow="Dévotionnel"
        title={
          <>
            Ton rendez-vous <span className="text-gradient">avec Dieu</span>
          </>
        }
        description="Chaque jour, une méditation pour t'enraciner en Jésus : un verset à déclarer, une réflexion en profondeur, des questions, le passage du jour et la vidéo."
      />
      <DevotionalView
        devotions={devotions}
        initialIndex={todayIndex(devotions.length)}
        plan={plan}
        initialPlanIndex={todayIndex(plan.length)}
        latestShort={latestShort}
        shorts={shorts}
        todayLabel={todayLabel}
      />
    </>
  );
}
