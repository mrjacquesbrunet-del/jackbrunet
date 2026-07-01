import type { Metadata } from "next";
import { Testimonies } from "@/components/home/Testimonies";

export const metadata: Metadata = {
  title: "Témoignages",
  description:
    "Dieu a agi dans ta vie? Partage ton témoignage. Nous te répondrons et, avec ton accord, nous pourrons le partager pour encourager la communauté.",
};

export default function TemoignagesPage() {
  return <Testimonies />;
}
