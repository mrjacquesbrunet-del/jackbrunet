import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { home } from "@/lib/content";

// Style référence : trois cartes de couleurs posées côte à côte sur
// fond noir — sur-titre, grand titre étendu, texte, lien souligné.
const tones = [
  { bg: "bg-[#FFFFFC]", sub: "text-night/65" },
  { bg: "bg-leaf", sub: "text-night/75" },
  { bg: "bg-pulse", sub: "text-night/75" },
] as const;

export function QuickLinks() {
  const { quickLinks } = home;

  return (
    <section aria-label={quickLinks.title} className="bg-night py-16 sm:py-20">
      <div className="wrap grid gap-6 md:grid-cols-3">
        {quickLinks.items.map((item, i) => {
          const tone = tones[i % tones.length];
          return (
            <Reveal key={item.href} delay={i * 0.08} className="h-full">
              <Link
                href={item.href}
                className={`group flex h-full min-h-[20rem] flex-col p-8 text-night transition-transform duration-500 ease-smooth hover:-translate-y-1 sm:min-h-[24rem] sm:p-10 ${tone.bg}`}
              >
                <p className="text-sm font-bold">
                  {(item as { kicker?: string }).kicker ?? quickLinks.kicker}
                </p>
                <h2 className="wordmark mt-8 text-3xl leading-none sm:text-4xl">
                  {item.title}
                </h2>
                <p className={`mt-5 leading-relaxed ${tone.sub}`}>{item.text}</p>
                <span className="link-cta mt-auto pt-10">Découvrir</span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
