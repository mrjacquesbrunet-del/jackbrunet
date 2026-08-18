import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { AppDownloadBanner } from "@/components/home/AppDownloadBanner";
import { RhemaBanner } from "@/components/home/RhemaBanner";
import { MissionBanner } from "@/components/home/MissionBanner";
import { DailyHub } from "@/components/home/DailyHub";
import { ReadingPlan } from "@/components/home/ReadingPlan";
import { FeaturedPredications } from "@/components/home/FeaturedPredications";
import { Reels } from "@/components/home/Reels";
import { PrayerSpace } from "@/components/home/PrayerSpace";
import { Shop } from "@/components/home/Shop";
import { AboutFounder } from "@/components/home/AboutFounder";
import { Support } from "@/components/home/Support";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { WhatsAppChannel } from "@/components/ui/WhatsAppChannel";
import { AppHomeGuard } from "@/components/app/AppHomeGuard";

export default function HomePage() {
  return (
    <>
      <AppHomeGuard />
      <Hero />
      <Marquee
        items={[
          "Pensée du jour",
          "Nouveautés",
          "Application",
          "Livres",
          "Missions",
          "Édifie ta foi chaque jour",
        ]}
      />
      <RhemaBanner />
      <AppDownloadBanner />
      <MissionBanner />
      <DailyHub />
      <ReadingPlan />
      <FeaturedPredications />
      <Reels />
      <Shop />
      <PrayerSpace />
      <AboutFounder />
      <Support />
      <WhatsAppChannel />
      <NewsletterCTA />
    </>
  );
}
