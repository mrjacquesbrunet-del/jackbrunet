import type { Metadata } from "next";
import { StudioSpace } from "@/components/community/StudioSpace";

export const metadata: Metadata = {
  title: "Studio Jack",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <StudioSpace />;
}
