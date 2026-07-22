type Props = {
  items: string[];
  variant?: "band" | "outline";
};

// Bande de texte défilante façon affiche — pur CSS (performant),
// figée si l'utilisateur préfère réduire les animations.
export function Marquee({ items, variant = "band" }: Props) {
  const sequence = [...items, ...items, ...items];

  const wrapper =
    variant === "band"
      ? "bg-pulse text-night"
      : "border-y border-cream/10 bg-night text-outline";

  return (
    <div className={`relative overflow-hidden py-4 sm:py-5 ${wrapper}`} aria-hidden>
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {sequence.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center font-display text-2xl uppercase leading-none tracking-wide sm:text-3xl"
              >
                <span className="whitespace-nowrap px-6">{item}</span>
                <span
                  className={`block h-2 w-2 rounded-full ${variant === "band" ? "bg-night" : "bg-pulse"}`}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
