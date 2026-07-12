"use client";

import Link from "next/link";
import { useEngagement } from "@/lib/engagement";
import { getThemePlans } from "@/lib/content";
import { ACCENTS, type AccentKey } from "@/lib/profile-accent";

/** Date locale YYYY-MM-DD. */
function dayStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DOW = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const PLAN_ACCENTS: AccentKey[] = ["lime", "ocean", "sunset", "violet", "rose", "gold"];

const PRAYER_THEMES: { label: string; hint: string; accent: AccentKey }[] = [
  { label: "Santé & guérison", hint: "Pour un proche malade", accent: "rose" },
  { label: "Famille", hint: "Unité et paix au foyer", accent: "sunset" },
  { label: "Travail & finances", hint: "Provision et sagesse", accent: "gold" },
  { label: "Direction", hint: "Discerner la volonté de Dieu", accent: "ocean" },
  { label: "Reconnaissance", hint: "Rendre grâce à Dieu", accent: "lime" },
  { label: "Nations", hint: "Intercéder pour le monde", accent: "violet" },
];

/**
 * Sections du profil (après les suggestions):
 * 1) Ta semaine avec Jésus (suivi jour par jour du temps de méditation).
 * 2) Tes plans / proposition de plans de lecture.
 * 3) Sujets de prière (colonnes façon plans).
 */
export function ProfileActivity() {
  const eng = useEngagement();
  const plans = getThemePlans().slice(0, 3);

  // 7 derniers jours (aujourd'hui à droite).
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const doneSet = new Set(eng.completedDates ?? []);
  const todayStr = dayStr(new Date());

  return (
    <div className="mt-8 space-y-8">
      {/* 1) Ta semaine avec Jésus */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Ta semaine avec Jésus</h3>
          {eng.streak > 1 ? (
            <span className="rounded-full bg-dawn-400/20 px-3 py-1 text-xs font-bold text-spirit-700">
              🔥 {eng.streak} jours d&apos;affilée
            </span>
          ) : null}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const ds = dayStr(d);
            const done = doneSet.has(ds);
            const isToday = ds === todayStr;
            return (
              <div
                key={ds}
                className={`rounded-2xl border py-2 text-center ${
                  isToday ? "border-night-900" : "border-night-900/10"
                }`}
              >
                <p className="text-[11px] font-semibold text-night-900/50">{DOW[d.getDay()]}</p>
                <p className="text-sm font-extrabold text-night-900">{d.getDate()}</p>
                <span
                  className={`mx-auto mt-1 grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                    done ? "bg-dawn-400 text-night-950" : "bg-night-900/[0.06] text-night-900/30"
                  }`}
                >
                  {done ? "✓" : "·"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-night-900/50">
          Chaque jour où tu prends ton temps avec Jésus est marqué d&apos;un ✓.
        </p>
      </section>

      {/* 2) Tes plans de lecture */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Découvre tes plans</h3>
          <Link href="/plans" className="text-sm font-semibold text-spirit-700">Voir tout →</Link>
        </div>
        <p className="mt-1 text-sm text-night-900/55">De nouveaux plans de lecture, selon ce que tu traverses.</p>
        <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
          {plans.map((p, i) => {
            const c = ACCENTS[PLAN_ACCENTS[i % PLAN_ACCENTS.length]];
            return (
              <Link
                key={p.slug}
                href={`/plans/${p.slug}`}
                className="relative flex h-40 w-56 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl p-4 text-white"
                style={{ backgroundImage: `linear-gradient(150deg, ${c.from}, ${c.to})` }}
              >
                <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-bold">
                  {p.days.length} jours
                </span>
                <p className="font-display text-lg font-extrabold leading-tight">{p.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-white/85">{p.subtitle}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3) Sujets de prière (colonnes) */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Sujets de prière</h3>
          <Link href="/communaute" className="text-sm font-semibold text-spirit-700">Le mur →</Link>
        </div>
        <p className="mt-1 text-sm text-night-900/55">Choisis un sujet et dépose ta prière.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRAYER_THEMES.map((t) => {
            const c = ACCENTS[t.accent];
            return (
              <Link
                key={t.label}
                href="/communaute"
                className="rounded-2xl border border-night-900/10 bg-white p-3 transition-transform hover:-translate-y-0.5"
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl text-white"
                  style={{ backgroundImage: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                    <path d="M12 3.4c-.6 1.1-1.3 2-2.4 3.1-1.8 1.8-3.4 3.5-3.4 6a5.8 5.8 0 0 0 11.6 0c0-2.5-1.6-4.2-3.4-6C13.3 5.4 12.6 4.5 12 3.4z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-2 font-display text-sm font-extrabold leading-tight text-night-900">{t.label}</p>
                <p className="mt-0.5 text-[11px] text-night-900/50">{t.hint}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
