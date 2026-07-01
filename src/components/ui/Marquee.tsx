type MarqueeProps = {
  items: string[];
  /** Bande lime (défaut) ou sombre. */
  variant?: "lime" | "dark";
};

/** Bande défilante façon « ticker » — apporte du mouvement et de l'énergie. */
export function Marquee({ items, variant = "lime" }: MarqueeProps) {
  const loop = [...items,...items];
  const wrap =
    variant === "dark"
? "dark-ctx bg-topo-dark border-y border-white/10"
: "bg-dawn-400 border-y border-night-900/10";
  const text = variant === "dark"? "text-cream": "text-night-900";
  const star = variant === "dark"? "text-dawn-400": "text-night-900/40";

  return (
    <div className={`${wrap} relative overflow-hidden py-4`} aria-hidden>
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap pr-10">
        {loop.map((t, i) => (
          <span
            key={i}
            className={`flex items-center gap-10 font-display text-lg font-bold uppercase tracking-tight ${text}`}
          >
            {t}
            <span className={star}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
