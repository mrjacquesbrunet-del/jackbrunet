import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { home } from "@/lib/content";

// Style référence : blocs de couleurs pleines empilés, kicker gras,
// titre étendu ultra-gras, lien souligné « Découvrir ».
const tones = [
  { bg: "bg-pulse", text: "text-night", sub: "text-night/75", link: "text-night" },
  { bg: "bg-cream", text: "text-night", sub: "text-night/70", link: "text-night" },
  { bg: "bg-leaf", text: "text-night", sub: "text-night/75", link: "text-night" },
] as const;

export function QuickLinks() {
  const { quickLinks } = home;

  return (
    <section aria-label={quickLinks.title}>
      {quickLinks.items.map((item, i) => {
        const tone = tones[i % tones.length];
        return (
          <div key={item.href} className={`${tone.bg} ${tone.text}`}>
            <div className="wrap py-16 sm:py-20">
              <Reveal>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
                  {(item as { kicker?: string }).kicker ?? quickLinks.kicker}
                </p>
                <h2 className="display-2 mt-4">{item.title}</h2>
                <p className={`mt-4 max-w-xl text-lg leading-relaxed ${tone.sub}`}>
                  {item.text}
                </p>
                <Link href={item.href} className={`link-cta mt-8 ${tone.link}`}>
                  Découvrir
                </Link>
              </Reveal>
            </div>
          </div>
        );
      })}
    </section>
  );
}
