import type { Metadata } from "next";
import { YearPlanView } from "@/components/plans/YearPlanView";

export const metadata: Metadata = {
  title: "La Bible en 1 an",
  description: "Lis toute la Bible en un an: un court passage chaque jour, avec ta progression.",
};

export default function BibleEnUnAnPage() {
  return <YearPlanView />;
}
