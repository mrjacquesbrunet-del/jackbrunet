"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { usePlanProgress } from "@/lib/plan-progress";
import { Celebration } from "@/components/ui/Celebration";
import {
  buildYearPlan,
  YEAR_PLAN_SLUG,
  YEAR_PLAN_DAYS,
  type PlanIndexBook,
  type PlanDay,
} from "@/lib/year-plan";

export function YearPlanView() {
  const [index, setIndex] = useState<PlanIndexBook[] | null>(null);
  const progress = usePlanProgress(YEAR_PLAN_SLUG);
  const [day, setDay] = useState<number | null>(null);

  useEffect(() => {
    fetch(asset("/bible/index.json"))
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  }, []);

  const plan: PlanDay[] = useMemo(() => (index ? buildYearPlan(index) : []), [index]);

  // Au chargement, se positionne sur le premier jour non lu.
  useEffect(() => {
    if (day !== null || plan.length === 0) return;
    const firstTodo = plan.find((d) => !progress.isDone(d.day))?.day ?? YEAR_PLAN_DAYS;
    setDay(firstTodo);
  }, [plan, day, progress]);

  // Célébration unique quand toute la Bible est lue
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (progress.done.length < YEAR_PLAN_DAYS) return;
    try {
      const key = "jb.plan.celebrated.v1";
      const seen = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      if (!seen.includes(YEAR_PLAN_SLUG)) {
        setCelebrate(true);
        localStorage.setItem(key, JSON.stringify([...seen, YEAR_PLAN_SLUG]));
      }
    } catch {
      /* stockage indisponible */
    }
  }, [progress.done.length]);

  if (!index || day === null) {
    return <p className="container-x py-10 text-sm text-night-900/55">Chargement du plan…</p>;
  }

  const doneCount = progress.done.length;
  const percent = Math.round((doneCount / YEAR_PLAN_DAYS) * 100);
  const current = plan[day - 1];
  const allDone = doneCount >= YEAR_PLAN_DAYS;

  return (
    <section className="container-x max-w-2xl py-10">
      <Celebration
        open={celebrate}
        emoji="🎉"
        title="Toute la Bible lue en 1 an !"
        message="Quel parcours ! Tu as traversé toute la Parole de Dieu. Qu'elle reste une lampe à tes pieds."
        onClose={() => setCelebrate(false)}
      />

      {/* Progression */}
      <div className="rounded-3xl border border-night-900/10 bg-white/70 p-5">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>
            {doneCount} / {YEAR_PLAN_DAYS} jours
          </span>
          <span className="text-night-900/50">{percent}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-night-900/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {allDone ? (
        <div className="mt-6 rounded-3xl border border-dawn-400/50 bg-gradient-to-br from-dawn-50 to-white p-6 text-center shadow-glow">
          <p className="font-display text-xl font-bold">🎉 Toute la Bible lue en 1 an — bravo !</p>
          <p className="mt-1 text-sm text-night-900/65">
            « Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. »
          </p>
        </div>
      ) : null}

      {/* Jour courant */}
      <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-spirit-600">
            Jour {current.day} / {YEAR_PLAN_DAYS}
          </span>
          {progress.isDone(current.day) ? (
            <span className="rounded-full bg-dawn-400/15 px-3 py-1 text-xs font-bold text-dawn-700">
              ✓ Lu
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 font-display text-2xl font-extrabold">{current.label}</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {current.chapters.map((c) => (
            <Link
              key={`${c.livre}:${c.chap}`}
              href={`/bible?livre=${c.livre}&chap=${c.chap}`}
              className="rounded-full border border-night-900/15 bg-cream/70 px-3.5 py-1.5 text-sm font-semibold text-spirit-700 transition-colors hover:border-spirit-600/40"
            >
              {c.nom} {c.chap}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => progress.toggleDay(current.day)}
          className={`mt-6 w-full justify-center ${
            progress.isDone(current.day) ? "btn-ghost" : "btn-primary"
          }`}
        >
          {progress.isDone(current.day) ? "✓ Marqué comme lu" : "Marquer ce jour comme lu"}
        </button>
      </div>

      {/* Navigation jours */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          disabled={day <= 1}
          onClick={() => setDay((d) => Math.max(1, (d ?? 1) - 1))}
          className="btn-ghost disabled:opacity-40"
        >
          ← Jour précédent
        </button>
        <button
          type="button"
          disabled={day >= YEAR_PLAN_DAYS}
          onClick={() => setDay((d) => Math.min(YEAR_PLAN_DAYS, (d ?? 1) + 1))}
          className="btn-ghost disabled:opacity-40"
        >
          Jour suivant →
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-night-900/45">
        Ta progression est enregistrée sur cet appareil (et synchronisée si tu es connecté).
      </p>
    </section>
  );
}
