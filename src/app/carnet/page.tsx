import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { NotebookView } from "@/components/notebook/NotebookView";

export const metadata: Metadata = {
  title: "Mon carnet",
  description:
    "Ton carnet personnel : note tes sujets de prière, les paroles reçues de Dieu et tes réflexions. Privé, sur ton appareil.",
};

export default function CarnetPage() {
  return (
    <>
      <PageHero
        eyebrow="Mon carnet"
        title={
          <>
            Tes <span className="text-gradient">sujets de prière</span> & paroles reçues
          </>
        }
        description="Un espace à toi pour écrire ce que Dieu met sur ton cœur : sujets de prière, paroles reçues, réflexions. Tu pourras revenir voir Ses réponses."
      />
      <NotebookView />
    </>
  );
}
