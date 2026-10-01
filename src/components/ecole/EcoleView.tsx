"use client";

import Link from "next/link";
import { LieuCarte } from "@/components/bible/LieuCarte";
import { getEtudes } from "@/lib/etudes";

/**
 * ÉCOLE BIBLIQUE — le hub d'étude et de formation, version « vitrine » :
 *  héros aux halos, formation vedette façon affiche, assistant en carte
 *  pleine couleur, carrousel d'études, tuiles Explorer (dont la vraie
 *  carte du monde biblique en fond de tuile).
 */

export function EcoleView() {
  const etudes = getEtudes();

  return (
    <div className="dark-ctx relative min-h-screen overflow-hidden bg-night-950 pb-32 text-cream">
      {/* Halos d'ambiance */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[30rem]"
        style={{
          background:
            "radial-gradient(42rem 22rem at 85% -5%, rgba(202,240,0,0.14), transparent 60%), radial-gradient(36rem 20rem at 0% 12%, rgba(110,91,255,0.12), transparent 65%)",
        }}
      />

      {/* ——— Héros ——— */}
      <header className="container-x relative pt-[calc(env(safe-area-inset-top)+2rem)]">
        <div className="mx-auto max-w-2xl">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.26em] text-dawn-300">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
              <path d="M2 9.5l10-5 10 5-10 5-10-5M5.8 12.4v3.8c0 1.4 2.8 2.8 6.2 2.8s6.2-1.4 6.2-2.8v-3.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            École biblique
          </p>
          <h1 className="mt-2 font-display text-[2.6rem] font-extrabold leading-[1.05] sm:text-5xl">
            Enracine-toi
            <br />
            dans la Parole.
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-cream/65">
            Des formations, des études et des outils pour comprendre la Bible — et la vivre.
          </p>
          {/* Les trois forces de l'espace */}
          <div className="mt-5 flex flex-wrap gap-2">
            {[`${etudes.length} études`, "275 fiches", "Assistant biblique"].map((s) => (
              <span key={s} className="rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-bold text-cream/75">
                {s}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="container-x relative mx-auto mt-8 max-w-2xl">
        {/* ——— Formation vedette (affiche) ——— */}
        <Link href="/ecole/fondamentaux" className="relative block overflow-hidden rounded-[2rem] border border-white/10 shadow-card transition-transform active:scale-[0.99]">
          {/* L'affiche : la couverture du livre */}
          <span aria-hidden className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/ecole/fondamentaux-vol1.jpg" alt="" className="h-full w-full object-cover object-top" />
            <span className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-night-950/15" />
          </span>
          <span className="relative block p-6 pt-36">
          <p className="inline-flex items-center gap-2 rounded-full bg-dawn-400/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-dawn-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dawn-400" />
            Formation · 7 leçons
          </p>
          <h2 className="mt-3 max-w-[16rem] font-display text-[1.7rem] font-extrabold leading-tight">
            Les fondamentaux de la foi chrétienne
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-cream/65">
            Par Josy W. Brunet. Quiz de validation à chaque leçon — et l&apos;e-book offert
            quand tu termines.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-dawn-400 px-5 py-2.5 font-display text-sm font-bold text-night-950">
            Commencer
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          </span>
        </Link>

        {/* ——— L'assistant : la carte qui claque ——— */}
        <Link
          href="/assistant"
          className="relative mt-4 flex items-center gap-4 overflow-hidden rounded-[2rem] bg-dawn-400 p-6 text-night-950 shadow-[0_18px_50px_-18px_rgba(202,240,0,0.45)] transition-transform active:scale-[0.99]"
        >
          <span aria-hidden className="absolute -right-10 -bottom-12 h-44 w-44 rounded-full bg-night-950/10" />
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-night-950 text-dawn-300">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M12 6c-1.8-1.4-4.2-2-7-2v14c2.8 0 5.2.6 7 2 1.8-1.4 4.2-2 7-2V4c-2.8 0-5.2.6-7 2zM12 6v14" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="block font-display text-xl font-extrabold leading-tight">Pose ta question</span>
            <span className="mt-0.5 block text-sm font-semibold text-night-950/70">
              L&apos;assistant répond, versets à l&apos;appui.
            </span>
          </span>
          <svg viewBox="0 0 24 24" className="relative h-6 w-6 shrink-0 fill-none stroke-night-950/60" strokeWidth={2.2}>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* ——— Études : carrousel ——— */}
        <section className="mt-8">
          <div className="flex items-end justify-between">
            <h3 className="font-display text-lg font-extrabold">Études bibliques</h3>
            <Link href="/assistant?tab=etudes" className="text-xs font-bold text-dawn-300">
              Tout voir
            </Link>
          </div>
          <div className="-mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {etudes.slice(0, 8).map((e, i) => (
              <Link
                key={e.id}
                href={`/assistant?tab=etudes&etude=${e.id}`}
                className="relative flex w-36 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-4 transition-transform active:scale-[0.97]"
                style={{
                  background: `linear-gradient(160deg, ${["#2E3A14", "#1F2C3A", "#3A2314", "#2C1F3A"][i % 4]} 0%, #171716 80%)`,
                  minHeight: "10.5rem",
                }}
              >
                <span className="font-display text-4xl font-extrabold text-cream/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-display text-[15px] font-extrabold leading-tight">{e.titre}</span>
                  <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-dawn-300/80">
                    {e.sections.length} parties
                  </span>
                </span>
              </Link>
            ))}
            <Link
              href="/assistant?tab=etudes"
              className="flex w-36 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/20 text-cream/60"
              style={{ minHeight: "10.5rem" }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2}>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-bold">Les {etudes.length} études</span>
            </Link>
          </div>
        </section>

        {/* ——— Explorer : deux tuiles visuelles ——— */}
        <section className="mt-6">
          <h3 className="font-display text-lg font-extrabold">Explorer</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {/* La carte biblique — la VRAIE carte en fond */}
            <Link
              href="/bible"
              className="relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/10 transition-transform active:scale-[0.98]"
              style={{ minHeight: "11rem" }}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0">
                <LieuCarte
                  points={[{ g: [35.23, 31.78], label: "Jérusalem" }]}
                  className="h-full w-full rounded-none border-0"
                />
              </span>
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/30 to-transparent" />
              <span className="relative p-4">
                <span className="block font-display text-base font-extrabold leading-tight">Personnages, lieux &amp; cartes</span>
                <span className="mt-0.5 block text-[11px] font-bold text-cream/60">275 fiches dans ta Bible</span>
              </span>
            </Link>

            {/* La chronologie — frise stylisée */}
            <Link
              href="/chronologie"
              className="relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-night-900 transition-transform active:scale-[0.98]"
              style={{ minHeight: "11rem" }}
            >
              <svg aria-hidden viewBox="0 0 160 100" className="absolute inset-x-0 top-4 h-20 w-full">
                <path d="M10 60 H150" stroke="rgba(244,242,231,0.18)" strokeWidth="2" strokeLinecap="round" />
                {[
                  [25, "#CAF000"],
                  [60, "#6E5BFF"],
                  [95, "#CAF000"],
                  [130, "#F4F2E7"],
                ].map(([x, c], i) => (
                  <g key={i}>
                    <line x1={x as number} y1={i % 2 ? 60 : 36} x2={x as number} y2={60} stroke="rgba(244,242,231,0.25)" strokeWidth="1.5" />
                    <circle cx={x as number} cy={i % 2 ? 60 : 36} r="5" fill={c as string} opacity="0.85" />
                  </g>
                ))}
              </svg>
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent" />
              <span className="relative p-4">
                <span className="block font-display text-base font-extrabold leading-tight">Chronologie biblique</span>
                <span className="mt-0.5 block text-[11px] font-bold text-cream/60">De la création à l&apos;Apocalypse</span>
              </span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
