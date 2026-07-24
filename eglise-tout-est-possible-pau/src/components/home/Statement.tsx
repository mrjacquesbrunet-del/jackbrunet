import Link from "next/link";
import { WordReveal } from "@/components/ui/WordReveal";
import { home } from "@/lib/content";

// Déclaration géante révélée mot à mot au rythme du scroll —
// l'effet signature des grands sites d'églises.
export function Statement() {
  const { statement } = home;

  return (
    <section className="bg-cream pb-8 pt-28 text-night sm:pb-10 sm:pt-40">
      <div className="wrap">
        <p className="kicker text-leaf-deep">{statement.kicker}</p>
        <WordReveal text={statement.text} className="display-2 mt-8 max-w-5xl" />
        {/* CTA discret et élégant : pastille noire compacte, vers les
            témoignages (la vision et l'histoire arrivent juste après) */}
        <Link
          href="/temoignages"
          className="btn-dark mt-9 !px-6 !py-3.5 !text-[0.62rem]"
        >
          {statement.cta}
        </Link>
      </div>
    </section>
  );
}
