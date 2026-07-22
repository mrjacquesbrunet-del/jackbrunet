import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "dark" | "light" | "leaf";
  className?: string;
  id?: string;
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  dark: "bg-night text-cream",
  light: "bg-cream text-night",
  leaf: "bg-leaf text-night",
};

// Section très aérée — chaque espace doit respirer.
export function Section({ children, tone = "dark", className = "", id }: Props) {
  return (
    <section id={id} className={`relative py-24 sm:py-32 lg:py-40 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}
