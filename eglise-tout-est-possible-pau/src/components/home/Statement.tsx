import Link from "next/link";
import { WordReveal } from "@/components/ui/WordReveal";
import { home } from "@/lib/content";

// Déclaration géante révélée mot à mot au rythme du scroll —
// l'effet signature des grands sites d'églises.
export function Statement() {
  const { statement } = home;

  return (
    <section className="bg-cream py-28 text-night sm:py-40">
      <div className="wrap">
        <p className="kicker text-leaf-deep">{statement.kicker}</p>
        <WordReveal text={statement.text} className="display-2 mt-8 max-w-5xl" />
        <Link href="/a-propos" className="btn-dark mt-12">
          {statement.cta}
        </Link>
      </div>
    </section>
  );
}
