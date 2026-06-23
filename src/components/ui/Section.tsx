import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

/** En-tête de section homogène sur tout le site. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-4 ${
        align === "center" ? "items-center text-center" : "items-start"
      } ${className}`}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="max-w-3xl font-display text-3xl font-extrabold leading-[1.1] text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p
          className={`max-w-2xl text-base leading-relaxed text-night-900/70 [.dark-ctx_&]:text-cream/70 sm:text-lg ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
