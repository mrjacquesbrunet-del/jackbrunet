"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlanProgress } from "@/lib/plan-progress";
import { AuthorByline } from "@/components/ui/AuthorByline";
import { PassageInline } from "@/components/bible/PassageInline";
import { bibleHref } from "@/lib/bible-ref";
import { Celebration } from "@/components/ui/Celebration";
import type { ThemePlan } from "@/lib/types";

export function PlanView({ plan }: { plan: ThemePlan }) {
  const progress = usePlanProgress(plan.slug);
  const total = plan.days.length;
  const doneCount = progress.done.length;
  const percent = total? Math.round((doneCount / total) * 100): 0;

  // Célébration unique à la complétion du plan
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (percent!== 100) return;
    try {
      const key = "jb.plan.celebrated.v1";
      const seen = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      if (!seen.includes(plan.slug)) {
        setCelebrate(true);
        localStorage.setItem(key, JSON.stringify([...seen, plan.slug]));
      }
    } catch {
      /* stockage indisponible */
    }
  }, [percent, plan.slug]);

  return (
    <section className="container-x py-10">
      <Celebration
        open={celebrate}
        emoji=""
        title="Parcours terminé!"
        message={`Bravo, tu as terminé « ${plan.title} »! Que cette Parole continue de porter du fruit dans ta vie.`}
        onClose={() => setCelebrate(false)}
      />
      {/* Progression */}
      <div className="max-w-2xl">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-night-900/70">
            {doneCount} / {total} jours
          </span>
          <span className="text-night-900/50">{percent}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-night-900/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Jours */}
      <ol className="mt-8 max-w-2xl space-y-4">
        {plan.days.map((d) => {
          const done = progress.isDone(d.day);
          return (
            <li
              key={d.day}
              className={`rounded-3xl border p-5 sm:p-6 transition-colors ${
                done
? "border-spirit-500/30 bg-spirit-500/[0.06]"
: "border-night-900/10 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-night-900 shadow-sm">
                  <div className="text-center leading-none">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-dawn-400">
                      Jour
                    </span>
                    <span className="mt-1 block font-display text-2xl font-extrabold text-cream">
                      {d.day}
                    </span>
                  </div>
                  {done? (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-dawn-400 text-night-900 ring-2 ring-white">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={3}>
                        <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ): null}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wide ${
                      done? "text-spirit-600": "text-night-900/40"
                    }`}
                  >
                    {done? "Terminé": "À méditer"}
                  </span>
                  <h3 className="font-display text-xl font-bold leading-tight">{d.title}</h3>
                </div>
              </div>

              <div className="mt-4 space-y-4 text-base leading-relaxed text-night-900/80">
                {d.meditation.split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Versets à lire, intégrés, avec les mêmes options que la Bible */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-spirit-600">
                  À lire & méditer
                </p>
                {d.verses.map((v) => (
                  <PassageInline key={v} reference={v} />
                ))}
              </div>

              <AuthorByline compact className="mt-5 border-t border-night-900/10 pt-4" />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => progress.toggleDay(d.day)}
                  className={done? "btn-ghost": "btn-primary"}
                >
                  {done? "✓ Terminé": "Marquer comme fait"}
                </button>
                <Link href={bibleHref(d.verses[0])?? "/bible"} className="btn-ghost">
                  Ouvrir la Bible
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      {percent === 100? (
        <div className="mt-8 max-w-2xl rounded-3xl border border-spirit-500/30 bg-spirit-500/[0.06] p-6 text-center">
          <p className="font-display text-xl font-bold">Parcours terminé</p>
          <p className="mt-1 text-sm text-night-900/65">
            Bravo! Continue sur un autre thème pour t'enraciner encore plus.
          </p>
          <Link href="/plans" className="btn-primary mt-4 inline-flex">
            Voir les autres parcours
          </Link>
        </div>
      ): null}

      <p className="mt-8 max-w-2xl text-xs text-night-900/45">
        Ta progression est enregistrée sur cet appareil.
      </p>
    </section>
  );
}
