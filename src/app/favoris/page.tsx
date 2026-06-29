import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { MyFavorites } from "@/components/profile/MyFavorites";

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Retrouve tes versets, méditations et paroles fortes enregistrés, regroupés au même endroit.",
};

export default function FavorisPage() {
  return (
    <>
      <PageHero
        eyebrow="Mes favoris"
        title={
          <>
            Tes <span className="text-gradient">trésors</span> gardés
          </>
        }
        description="Versets, méditations et paroles fortes que tu as enregistrés — regroupés ici, pour les méditer encore."
      />
      <MyFavorites />
    </>
  );
}
