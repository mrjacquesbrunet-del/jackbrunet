import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanView } from "@/components/plans/PlanView";
import { getThemePlan, getThemePlans } from "@/lib/content";
import audioData from "../../../../content/audio.generated.json";

export function generateStaticParams() {
  return getThemePlans().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plan = getThemePlan(slug);
  if (!plan) return { title: "Plan introuvable" };
  return { title: plan.title, description: plan.subtitle };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plan = getThemePlan(slug);
  if (!plan) notFound();

  // Audio du plan (voix clonée) généré par scripts/generate-audio.mjs, ou {}.
  const plans = (audioData as { plans?: Record<string, Record<string, string>> }).plans ?? {};
  const audioMap = plans[slug] ?? {};

  return <PlanView plan={plan} audioMap={audioMap} />;
}
