import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AnsweredFeed } from "@/components/community/AnsweredFeed";

export const metadata: Metadata = {
  title: "Prières exaucées",
  description: "Les témoignages de la communauté : des prières que Dieu a exaucées. Rendons-Lui gloire ensemble.",
};

export default function ExauceesPage() {
  return (
    <>
      <PageHero
        eyebrow="Témoignages"
        title={
          <>
            Prières <span className="text-gradient">exaucées</span>
          </>
        }
        description="Ce que Dieu a fait dans la vie de la communauté. Chaque prière exaucée encourage la foi de tous."
      />
      <AnsweredFeed />
    </>
  );
}
