import type { Metadata } from "next";
import { BibleHero } from "@/components/bible/BibleHero";
import { BibleReader } from "@/components/bible/BibleReader";

export const metadata: Metadata = {
  title: "Bible",
  description:
    "Lis la Bible (Louis Segond) directement en ligne: choisis un livre et un chapitre.",
};

export default function BiblePage() {
  return (
    <>
      <BibleHero />
      <BibleReader />
    </>
  );
}
