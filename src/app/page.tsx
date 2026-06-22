import { Hero } from "@/components/home/Hero";
import { DailyHub } from "@/components/home/DailyHub";
import { ReadingPlan } from "@/components/home/ReadingPlan";
import { LatestVideos } from "@/components/home/LatestVideos";
import { Reels } from "@/components/home/Reels";
import { PrayerSpace } from "@/components/home/PrayerSpace";
import { Testimonies } from "@/components/home/Testimonies";
import { Shop } from "@/components/home/Shop";
import { Support } from "@/components/home/Support";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DailyHub />
      <ReadingPlan />
      <LatestVideos />
      <Reels />
      <PrayerSpace />
      <Testimonies />
      <Shop />
      <Support />
      <NewsletterCTA />
    </>
  );
}
