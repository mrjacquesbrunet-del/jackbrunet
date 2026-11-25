import type { Metadata } from "next";
import { MyFavorites } from "@/components/profile/MyFavorites";

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Retrouve tes exhortations, versets, surlignages et paroles fortes enregistrés, regroupés au même endroit.",
};

export default function FavorisPage() {
  return <MyFavorites />;
}
