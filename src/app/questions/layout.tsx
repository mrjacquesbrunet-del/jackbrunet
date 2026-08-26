import type { Metadata } from "next";
import faq from "../../../content/questions-faq.json";

export const metadata: Metadata = {
  title: "Questions & réponses sur la foi chrétienne",
  description:
    "Des réponses claires, bibliques et pleines d'amour aux questions que se posent croyants et non-croyants : Dieu, Jésus, le salut, la Bible, le Saint-Esprit et les dons, la souffrance, la vie chrétienne.",
  alternates: { canonical: "/questions" },
  openGraph: {
    title: "Questions & réponses sur la foi chrétienne",
    description:
      "Des réponses claires et bibliques aux grandes questions de la foi : Dieu, Jésus, le salut, la Bible, le Saint-Esprit, la souffrance…",
    type: "website",
  },
};

type Item = { q: string; a: string };
const ITEMS = (faq as { items: Item[] }).items;

/** Données structurées FAQPage (référencement : résultats enrichis Google). */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ITEMS.map((i) => ({
    "@type": "Question",
    name: i.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: i.a.replace(/\*\*/g, "").replace(/\s+/g, " ").trim(),
    },
  })),
};

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
