"use client";

import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  { n: "1", title: "Écris", text: "Un sujet de prière, une parole reçue, une réflexion." },
  { n: "2", title: "Classe", text: "Range et retrouve tes notes sur tous tes appareils." },
  { n: "3", title: "Vois les réponses", text: "Marque tes prières « exaucées »." },
];

/** Courte intro explicative du carnet (site + app). */
export function CarnetIntro() {
  return (
    <section className="container-x pt-2">
      <Reveal from="up" className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Ton journal spirituel</span>
        <p className="mt-3 text-night-900/65">
          Ton lieu intime pour écrire, prier, et revenir voir comment Dieu répond.
        </p>
      </Reveal>
      <div className="mx-auto mt-5 grid max-w-3xl gap-3 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} from="up" delay={i * 0.08}>
            <div className="flex items-start gap-3 rounded-2xl border border-night-900/10 bg-white p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-night-900 text-sm font-bold text-dawn-400">
                {s.n}
              </span>
              <div>
                <p className="font-display font-bold leading-tight">{s.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-night-900/60">{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
