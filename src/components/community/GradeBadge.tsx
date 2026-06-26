"use client";

import { gradeFor, type Activity } from "@/lib/grades";

/** Petit badge de grade (à côté d'un pseudo). */
export function GradeBadge({ activity }: { activity: Activity }) {
  const { grade } = gradeFor(activity);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-dawn-400/20 to-spirit-500/15 px-2.5 py-0.5 text-[11px] font-bold text-spirit-700">
      <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current" aria-hidden>
        <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85z" />
      </svg>
      {grade.name}
    </span>
  );
}

/** Carte de progression de grade (sur le profil). */
export function GradeProgress({ activity }: { activity: Activity }) {
  const { grade, points, next, toNext } = gradeFor(activity);
  const pct = next ? Math.min(100, Math.round((points / next.min) * 100)) : 100;
  return (
    <div className="rounded-2xl border border-night-900/10 bg-gradient-to-br from-dawn-400/[0.08] to-spirit-500/[0.06] p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-extrabold text-spirit-700">{grade.name}</p>
        <span className="text-xs font-semibold text-night-900/50">{points} pts</span>
      </div>
      <p className="mt-0.5 text-sm text-night-900/65">{grade.blurb}</p>
      {next ? (
        <>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-night-900/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-night-900/55">
            Plus que <strong className="text-night-900/80">{toNext} pts</strong> pour devenir{" "}
            <strong className="text-spirit-700">{next.name}</strong>
          </p>
        </>
      ) : (
        <p className="mt-3 text-xs font-semibold text-spirit-700">Grade maximal atteint. 🙏</p>
      )}
    </div>
  );
}
