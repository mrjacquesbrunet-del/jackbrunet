import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

/** En-tête immersif réutilisé par les pages intérieures. */
export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="blob left-1/3 top-10 h-80 w-80 rotate-[-12deg] rounded-[42%] bg-dawn-400/[0.18] animate-pulse-glow" />
      <div className="blob right-1/4 top-1/2 h-72 w-72 bg-spirit-400/25 animate-pulse-glow" />
      <div className="container-x relative pb-12 text-center">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description? (
          <p className="mx-auto mt-5 max-w-2xl text-base text-night-900/70 sm:text-lg">
            {description}
          </p>
        ): null}
        {children? <div className="mt-8">{children}</div>: null}
      </div>
    </section>
  );
}
