"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { usePlanProgress } from "@/lib/plan-progress";
import { Celebration } from "@/components/ui/Celebration";
import { PlanRating } from "@/components/plans/PlanRating";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import { AuthorCard } from "@/components/plans/AuthorCard";
import { DEFAULT_AUTHOR } from "@/config/author";
import { appShareUrl } from "@/config/app-links";
import { useAuth } from "@/components/community/useAuth";
import { getSupabase } from "@/lib/supabase";
import { isPlanSaved, togglePlanSave } from "@/lib/community";
import {
  buildYearPlan,
  YEAR_PLAN_SLUG,
  YEAR_PLAN_DAYS,
  type PlanIndexBook,
  type PlanDay,
} from "@/lib/year-plan";

const COVER = "/img/plans/bible-1-an.webp";

/** Photo de l'auteur (bucket public « audiovf »), repli monogramme. */
const AVATARS = (() => {
  const sb = getSupabase();
  if (!sb) return [] as string[];
  return ["auteurjack.jpg", "auteurjack.png", "pasteur-jack.jpg"].map(
    (n) => sb.storage.from("audiovf").getPublicUrl(n).data.publicUrl
  );
})();

function PlanAuthor({ name }: { name: string }) {
  const [i, setI] = useState(0);
  const src = AVATARS[i];
  return (
    <div className="flex items-center gap-2.5">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setI((n) => n + 1)}
          className="h-11 w-11 rounded-full object-cover ring-2 ring-dawn-400/70"
        />
      ) : (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-spirit-500 font-display text-sm font-extrabold text-cream ring-2 ring-dawn-400/70">
          J
        </span>
      )}
      <span className="leading-tight">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-cream/55">
          Par
        </span>
        <span className="block font-display text-sm font-bold text-cream">{name}</span>
      </span>
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-10 w-10 place-items-center rounded-full backdrop-blur transition-colors ${
        active ? "bg-dawn-400 text-night-950" : "bg-night-950/50 text-cream hover:bg-night-950/70"
      }`}
    >
      {children}
    </button>
  );
}

export function YearPlanView() {
  const [index, setIndex] = useState<PlanIndexBook[] | null>(null);
  const progress = usePlanProgress(YEAR_PLAN_SLUG);
  const { userId } = useAuth();
  const [day, setDay] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);

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

  useEffect(() => {
    if (userId) isPlanSaved(YEAR_PLAN_SLUG, userId).then(setSaved);
    else setSaved(false);
  }, [userId]);

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

  async function toggleSave() {
    if (!userId) return;
    const next = !saved;
    setSaved(next);
    await togglePlanSave(YEAR_PLAN_SLUG, userId, next);
  }

  async function share() {
    // Lien intelligent : ouvre l'app sur ce parcours, sinon le store.
    const url = appShareUrl("/bible-1-an");
    const data = {
      title: "La Bible en 1 an",
      text: "Découvre le parcours « La Bible en 1 an » sur RHEMA",
      url,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        alert("Lien du plan copié.");
      }
    } catch {
      /* partage annulé */
    }
  }

  const loading = !index || day === null;
  const doneCount = progress.done.length;
  const percent = Math.round((doneCount / YEAR_PLAN_DAYS) * 100);
  const current = loading ? null : plan[(day as number) - 1];
  const allDone = doneCount >= YEAR_PLAN_DAYS;

  return (
    <div className="min-h-screen bg-night-950 pb-24 text-cream">
      <PlansDarkBg />
      <AuthorCard
        open={authorOpen}
        onClose={() => setAuthorOpen(false)}
        author={DEFAULT_AUTHOR}
        photo={AVATARS[0]}
      />
      <Celebration
        open={celebrate}
        emoji=""
        title="Toute la Bible lue en 1 an!"
        message="Quel parcours! Tu as traversé toute la Parole de Dieu. Qu'elle reste une lampe à tes pieds."
        onClose={() => setCelebrate(false)}
      />

      {/* ---------- Héros : photo du plan ---------- */}
      <section className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(COVER)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/35 to-night-950/10" />

          {/* Barre du haut : retour + partager + enregistrer */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <Link
              href="/plans"
              aria-label="Tous les parcours"
              className="grid h-10 w-10 place-items-center rounded-full bg-night-950/50 text-cream backdrop-blur transition-colors hover:bg-night-950/70"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="flex gap-2">
              <IconBtn onClick={share} label="Partager le plan">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconBtn>
              <IconBtn onClick={toggleSave} label="Enregistrer le plan" active={saved}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
                  <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconBtn>
            </div>
          </div>

          {/* Bas de la photo : titre + auteur (gauche) + note (droite) */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-dawn-300">
              Grand parcours
            </span>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold leading-tight text-cream sm:text-4xl">
              La Bible en 1 an
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-cream/75">
              Un court passage chaque jour pour traverser toute la Parole en une année.
            </p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <button type="button" onClick={() => setAuthorOpen(true)} className="text-left" aria-label="Voir la fiche de l'auteur">
                <PlanAuthor name={DEFAULT_AUTHOR.name} />
              </button>
              <PlanRating slug={YEAR_PLAN_SLUG} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Synopsis ---------- */}
      <div className="container-x pt-5">
        <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-cream/80">
          365 jours, toute la Bible. Avance à ton rythme : ta progression est gardée,
          et chaque chapitre s&apos;ouvre directement dans ta Bible, en lecture ou en audio.
        </p>
      </div>

      {loading ? (
        <p className="container-x py-10 text-center text-sm text-cream/55">Chargement du plan…</p>
      ) : (
        <>
          {/* ---------- Progression ---------- */}
          <div className="container-x pt-6">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-cream/80">
                  {doneCount} / {YEAR_PLAN_DAYS} jours
                </span>
                <span className="text-cream/50">{percent}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-dawn-300 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {allDone ? (
            <div className="container-x mx-auto mt-6 max-w-2xl rounded-3xl border border-dawn-400/30 bg-dawn-400/[0.08] p-6 text-center">
              <p className="font-display text-xl font-bold text-cream">
                Toute la Bible lue en 1 an, bravo!
              </p>
              <p className="mt-1 text-sm text-cream/70">
                « Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. »
              </p>
            </div>
          ) : null}

          {/* ---------- Jour courant ---------- */}
          <div className="container-x mx-auto mt-6 max-w-2xl">
            <div className="overflow-hidden rounded-3xl border border-dawn-400/50 bg-night-900 shadow-[0_18px_50px_-20px_rgba(202,240,0,0.4)]">
              <div className="flex items-center gap-4 p-5">
                <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-dawn-400">
                  <div className="text-center leading-none">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-night-950/70">
                      Jour
                    </span>
                    <span className="mt-1 block font-display text-xl font-extrabold text-night-950">
                      {current!.day}
                    </span>
                  </div>
                  {progress.isDone(current!.day) ? (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-dawn-400 text-night-950 ring-2 ring-night-900">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={3}>
                        <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-dawn-300">
                    {progress.isDone(current!.day) ? "Terminé" : "À lire aujourd'hui"} · {current!.day} / {YEAR_PLAN_DAYS}
                  </span>
                  <h2 className="font-display text-xl font-bold leading-tight text-cream">
                    {current!.label}
                  </h2>
                </div>
              </div>

              <div className="px-5 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dawn-300">
                  À lire & méditer
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current!.chapters.map((c) => (
                    <Link
                      key={`${c.livre}:${c.chap}`}
                      href={`/bible?livre=${c.livre}&chap=${c.chap}`}
                      className="rounded-full border border-cream/20 bg-white/[0.04] px-3.5 py-1.5 text-sm font-semibold text-cream transition-colors hover:border-dawn-400/60"
                    >
                      {c.nom} {c.chap}
                    </Link>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => progress.toggleDay(current!.day)}
                  className={
                    progress.isDone(current!.day)
                      ? "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-cream/20 px-5 py-2.5 text-sm font-bold text-cream/70"
                      : "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-bold text-night-950"
                  }
                >
                  {progress.isDone(current!.day) ? "✓ Terminé — annuler" : "J'ai lu ce jour"}
                </button>
              </div>
            </div>

            {/* Navigation jours */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                disabled={(day as number) <= 1}
                onClick={() => setDay((d) => Math.max(1, (d ?? 1) - 1))}
                className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-2.5 text-sm font-bold text-cream/80 disabled:opacity-40"
              >
                ← Jour précédent
              </button>
              <button
                type="button"
                disabled={(day as number) >= YEAR_PLAN_DAYS}
                onClick={() => setDay((d) => Math.min(YEAR_PLAN_DAYS, (d ?? 1) + 1))}
                className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-2.5 text-sm font-bold text-cream/80 disabled:opacity-40"
              >
                Jour suivant →
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-cream/45">
              Ta progression est enregistrée sur cet appareil (et synchronisée si tu es connecté).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
