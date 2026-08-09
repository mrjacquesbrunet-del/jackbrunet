import type { Metadata } from "next";
import { DevotionalHero } from "@/components/home/DevotionalHero";
import { DevotionalView } from "@/components/home/DevotionalView";
import {
  getDevotions,
  getReadingPlan,
  getLatestShort,
  getShorts,
  getProducts,
  todayIndex,
} from "@/lib/content";
import { asset } from "@/lib/asset";
import audioData from "../../../content/audio.generated.json";

export const metadata: Metadata = {
  title: "Temps avec Jésus",
  description:
    "Ton dévotionnel quotidien: une méditation pour t'enraciner en Jésus, un verset à déclarer, une réflexion en profondeur, des questions, le passage du jour et la vidéo. Nouveau chaque jour.",
};

export default function DevotionnelPage() {
  const devotions = getDevotions();
  const plan = getReadingPlan();
  const latestShort = getLatestShort();
  const shorts = getShorts();
  const book = getProducts()[0];

  return (
    <>
      <DevotionalHero />
      <DevotionalView
        devotions={devotions}
        initialIndex={todayIndex(devotions.length)}
        plan={plan}
        initialPlanIndex={todayIndex(plan.length)}
        latestShort={latestShort}
        shorts={shorts}
        bookTitle={book?.title?? "RHEMA"}
        bookCover={asset(book?.image)}
        audioMap={(audioData.devotions?? {}) as Record<string, string>}
      />
    </>
  );
}
