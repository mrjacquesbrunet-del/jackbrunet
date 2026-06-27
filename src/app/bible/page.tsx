import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { BibleReader } from "@/components/bible/BibleReader";

export const metadata: Metadata = {
  title: "Bible",
  description:
    "Lis la Bible (Louis Segond) directement en ligne : choisis un livre et un chapitre.",
};

export default function BiblePage() {
  return (
    <>
      <PageHero tone="creme"
        eyebrow="Bible"
        title={
          <>
            La Bible <span className="text-gradient">Louis Segond</span>
          </>
        }
        description="Lis la Parole de Dieu directement sur le site : choisis un livre, un chapitre, et laisse-la prendre racine."
      />
      <BibleReader />
    </>
  );
}
