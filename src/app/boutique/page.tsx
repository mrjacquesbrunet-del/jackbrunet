import type { Metadata } from "next";
import { RhemaShowcase } from "@/components/boutique/RhemaShowcase";

export const metadata: Metadata = {
  title: "RHEMA — le livre",
  description:
    "RHEMA, 365 révélations bibliques à méditer chaque jour. Le livre de Jack Brunet — réserve ton exemplaire.",
};

export default function BoutiquePage() {
  return <RhemaShowcase />;
}
