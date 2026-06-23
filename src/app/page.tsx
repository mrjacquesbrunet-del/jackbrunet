import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { MissionBanner } from "@/components/home/MissionBanner";
import { DailyHub } from "@/components/home/DailyHub";
import { ReadingPlan } from "@/components/home/ReadingPlan";
import { FeaturedPredications } from "@/components/home/FeaturedPredications";
import { Reels } from "@/components/home/Reels";
import { PrayerSpace } from "@/components/home/PrayerSpace";
import { Testimonies } from "@/components/home/Testimonies";
import { Shop } from "@/components/home/Shop";
import { AboutFounder } from "@/components/home/AboutFounder";
import { Support } from "@/components/home/Support";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee
        items={[
          "Jack Brunet",
          "Pour la gloire de Jésus",
          "Pensée du jour",
          "Édifie ta foi chaque jour",
          "Rejoins la communauté",
        ]}
      />
      <MissionBanner />
      <DailyHub />
      <ReadingPlan />
      <FeaturedPredications />
      <Reels />
      <Shop />
      <PrayerSpace />
      <Testimonies />
      <AboutFounder />
      <Support />
      <NewsletterCTA />
    </>
  );
}
