import type { Metadata } from "next";
import { CadeauRhema } from "@/components/home/CadeauRhema";

export const metadata: Metadata = {
  title: "Les 7 premières révélations RHEMA, offertes",
  description:
    "Reçois gratuitement les 7 premières révélations du livre RHEMA de Jack Brunet : entre ton email et télécharge ton ebook.",
  robots: { index: false, follow: false },
};

export default function CadeauRhemaPage() {
  return <CadeauRhema />;
}
