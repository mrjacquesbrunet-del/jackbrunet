"use client";

import Link from "next/link";
import { usePlanProgress } from "@/lib/plan-progress";
import type { ThemePlan } from "@/lib/types";

export function PlanView({ plan }: { plan: ThemePlan }) {
  const progress = usePlanProgress(plan.slug);
  const total = plan.days.length;
  const doneCount = progress.done.length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <section className="container-x py-10">
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
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 text-night-950">
                  <div className="text-center leading-none">
                    <span className="block text-[9px] font-bold uppercase">Jour</span>
                    <span className="block text-xl font-extrabold">{d.day}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-bold">{d.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {d.verses.map((v) => (
                      <span
                        key={v}
                        className="inline-flex items-center rounded-full bg-dawn-400/15 px-3 py-1 text-xs font-semibold text-spirit-700"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-base leading-relaxed text-night-900/80">{d.meditation}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => progress.toggleDay(d.day)}
                  className={done ? "btn-ghost" : "btn-primary"}
                >
                  {done ? "✓ Terminé" : "Marquer comme fait"}
                </button>
                <Link href="/bible" className="btn-ghost">
                  Ouvrir la Bible
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      {percent === 100 ? (
        <div className="mt-8 max-w-2xl rounded-3xl border border-spirit-500/30 bg-spirit-500/[0.06] p-6 text-center">
          <p className="font-display text-xl font-bold">Parcours terminé</p>
          <p className="mt-1 text-sm text-night-900/65">
            Bravo ! Continue sur un autre thème pour t'enraciner encore plus.
          </p>
          <Link href="/plans" className="btn-primary mt-4 inline-flex">
            Voir les autres parcours
          </Link>
        </div>
      ) : null}

      <p className="mt-8 max-w-2xl text-xs text-night-900/45">
        Ta progression est enregistrée sur cet appareil.
      </p>
    </section>
  );
}
