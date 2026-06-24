import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { PlanView } from "@/components/plans/PlanView";
import { AuthorByline } from "@/components/ui/AuthorByline";
import { getThemePlan, getThemePlans } from "@/lib/content";

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

  return (
    <>
      <PageHero eyebrow="Plan thématique" title={plan.title} description={plan.subtitle}>
        <div className="flex flex-col items-center gap-5">
          <AuthorByline />
          <Link href="/plans" className="btn-ghost">
            ← Tous les parcours
          </Link>
        </div>
      </PageHero>
      <PlanView plan={plan} />
    </>
  );
}
