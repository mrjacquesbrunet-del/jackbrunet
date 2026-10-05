"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { useAuth } from "@/components/community/useAuth";
import { getProfile } from "@/lib/community";
import { getFormations, listFormationProgress, type Formation } from "@/lib/formations";
import { CartesLexique } from "@/components/ecole/CartesLexique";
import { CarteEtude } from "@/components/ecole/EtudesView";
import { getEtudesBibliques, themesActifs } from "@/lib/etudes-bibliques";

/**
 * ÉTUDE BIBLIQUE — accueil (onglet « Étude ») : formations, assistant,
 * exploration (galerie des personnages & lieux, frise chronologique).
 * Accueil e-learning (maquette validée) :
 * en-tête sombre (Bonjour {prénom} + bannière FORMATIONS E-LEARNING),
 * corps clair arrondi : actions rapides rondes, « Reprendre où tu t'es
 * arrêté », liste des formations, études et exploration.
 */

function dureeFormation(f: Formation): string {
  const mots = f.lecons.reduce((n, l) => n + l.sections.reduce((m, s) => m + s.p.split(/\s+/).length, 0), 0);
  const min = Math.round(mots / 180) + f.lecons.length * 2;
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}`;
}

function RondAction({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-dawn-400/20 text-night-900">
        {children}
      </span>
      <span className="text-xs font-bold text-night-900/80">{label}</span>
    </Link>
  );
}

export function EcoleView() {
  const formations = getFormations();
  const { userId } = useAuth();
  const [prenom, setPrenom] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number[]>>({});

  useEffect(() => {
    if (!userId) {
      setPrenom(null);
      setProgress({});
      return;
    }
    getProfile(userId).then((p) => setPrenom(p?.pseudo?.split(" ")[0] ?? null));
    formations.forEach((f) => {
      listFormationProgress(userId, f.id).then((rows) =>
        setProgress((cur) => ({ ...cur, [f.id]: rows.map((r) => r.lesson) })),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // « Reprendre où tu t'es arrêté » : la 1re formation commencée, non finie.
  const reprise = formations
    .map((f) => {
      const done = progress[f.id] ?? [];
      let next = 1;
      for (let i = 1; i <= f.lecons.length; i++) if (!done.includes(i)) { next = i; break; }
      return { f, done: done.length, next, fini: done.length >= f.lecons.length };
    })
    .find((r) => r.done > 0 && !r.fini);

  return (
    <div className="min-h-screen bg-night-950 pb-28">
      {/* ——— En-tête sombre ——— */}
      <header className="container-x pt-[calc(env(safe-area-inset-top)+1.5rem)] text-cream">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-dawn-300">Étude biblique</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">
            Bonjour{prenom ? ` ${prenom}` : ""} !
          </h1>
          <p className="mt-1 text-[15px] text-cream/65">Grandis dans la connaissance de Sa Parole.</p>

          {/* Bannière FORMATIONS E-LEARNING */}
          <Link
            href="/ecole/fondamentaux"
            className="relative mt-5 block overflow-hidden rounded-3xl transition-transform active:scale-[0.99]"
          >
            <BanniereFond />
            <span className="relative z-10 block p-6 pr-24">
              <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-dawn-300">Formations</span>
              <span className="block font-display text-[1.7rem] font-extrabold leading-tight text-white">E-learning</span>
              <span className="mt-1.5 block max-w-[15rem] text-sm leading-snug text-white/80">
                Des parcours bibliques pour comprendre, appliquer et grandir dans ta foi.
              </span>
            </span>
            <span className="absolute bottom-5 right-5 z-10 grid h-14 w-14 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_10px_26px_-8px_rgba(140,170,0,0.8)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2.4}>
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </header>

      {/* ——— Corps clair arrondi ——— */}
      <main className="mt-6 rounded-t-[2rem] bg-[#F3F3ED] pb-10 pt-7 text-night-900">
        <div className="container-x mx-auto max-w-2xl">
          {/* Actions rapides */}
          <div className="flex items-start justify-between px-2">
            <RondAction href="/ecole/fondamentaux" label="Formations">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M2 9.5l10-5 10 5-10 5-10-5M5.8 12.4v3.8c0 1.4 2.8 2.8 6.2 2.8s6.2-1.4 6.2-2.8v-3.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </RondAction>
            <RondAction href="/ecole/fondamentaux" label="Ma progression">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M5 20V10m7 10V4m7 16v-7" strokeLinecap="round" />
              </svg>
            </RondAction>
            <RondAction href="/assistant" label="Mes questions">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M21 12a8 8 0 1 0-3.1 6.3L21 19l-.9-3.2A8 8 0 0 0 21 12z" strokeLinejoin="round" />
                <path d="M9.6 10a2.4 2.4 0 1 1 3.3 2.2c-.6.3-.9.7-.9 1.3M12 16.2h.01" strokeLinecap="round" />
              </svg>
            </RondAction>
            <RondAction href="/bible" label="Bible">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M12 6c-1.8-1.4-4.2-2-7-2v14c2.8 0 5.2.6 7 2 1.8-1.4 4.2-2 7-2V4c-2.8 0-5.2.6-7 2zM12 6v14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </RondAction>
          </div>

          {/* Reprendre où tu t'es arrêté */}
          {reprise ? (
            <section className="mt-7">
              <h2 className="font-display text-lg font-extrabold">Reprendre où tu t&apos;es arrêté</h2>
              <Link
                href="/ecole/fondamentaux"
                className="mt-3 flex items-center gap-3.5 rounded-3xl border border-night-900/10 bg-white p-3.5"
              >
                <MiniVignette src={reprise.f.lecons[reprise.next - 1]?.image} cover={reprise.f.cover} />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-extrabold leading-tight">{reprise.f.titre}</span>
                  <span className="mt-0.5 block text-xs text-night-900/55">
                    Leçon {reprise.next} : {reprise.f.lecons[reprise.next - 1]?.titre}
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-night-900/10">
                      <span
                        className="block h-full rounded-full bg-dawn-400"
                        style={{ width: `${Math.round((reprise.done / reprise.f.lecons.length) * 100)}%` }}
                      />
                    </span>
                    <span className="text-xs font-bold text-night-900/55">
                      {Math.round((reprise.done / reprise.f.lecons.length) * 100)} %
                    </span>
                  </span>
                </span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-night-900/35" strokeWidth={2}>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </section>
          ) : null}

          {/* Les formations */}
          <section className="mt-7">
            <h2 className="font-display text-lg font-extrabold">Formations</h2>
            <div className="mt-3 space-y-3">
              {formations.map((f) => (
                <Link
                  key={f.id}
                  href={`/ecole/${f.id === "fondamentaux-vol1" ? "fondamentaux" : f.id}`}
                  className="flex items-center gap-3.5 rounded-3xl border border-night-900/10 bg-white p-3.5"
                >
                  {f.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset(f.cover)} alt="" aria-hidden className="h-20 w-20 shrink-0 rounded-2xl object-cover object-top" />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-dawn-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-night-950">
                      Nouveau
                    </span>
                    <span className="mt-1 block font-display text-[15px] font-extrabold leading-tight">{f.titre}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-night-900/55">
                      <span>{f.lecons.length} leçons</span>
                      <span className="flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" strokeLinecap="round" />
                        </svg>
                        {dureeFormation(f)}
                      </span>
                      <span>Débutant</span>
                    </span>
                  </span>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-night-900/35" strokeWidth={2}>
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
              {/* Les prochaines formations arrivent */}
              <div className="flex items-center gap-3.5 rounded-3xl border border-dashed border-night-900/20 p-3.5 opacity-70">
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-night-900/[0.05] text-night-900/40">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.8}>
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-extrabold text-night-900/60">
                    D&apos;autres formations arrivent
                  </span>
                  <span className="mt-0.5 block text-xs text-night-900/45">
                    Prière, identité en Christ, vie d&apos;Église…
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Études bibliques : classées par thème et par auteur */}
          <section className="mt-7">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold">Études bibliques</h2>
              <Link href="/ecole/etudes" className="text-[13px] font-bold text-[#5F7A00]">
                Tout voir
              </Link>
            </div>
            <div className="mt-3 space-y-3">
              {getEtudesBibliques()
                .slice(0, 3)
                .map((e) => (
                  <CarteEtude key={e.id} etude={e} />
                ))}
            </div>
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {themesActifs().map((t) => (
                <Link
                  key={t.id}
                  href={`/ecole/etudes?theme=${t.id}`}
                  className="shrink-0 rounded-full border border-night-900/12 bg-white px-3.5 py-2 text-[13px] font-bold text-night-900/75"
                >
                  {t.nom}
                </Link>
              ))}
            </div>
          </section>

          {/* Pose ta question sur la Bible */}
          <section className="mt-7">
            <Link
              href="/assistant"
              className="relative block overflow-hidden rounded-3xl bg-night-950 p-5 text-cream shadow-[0_16px_38px_-16px_rgba(12,12,11,0.55)] transition-transform active:scale-[0.99]"
            >
              <span
                aria-hidden
                className="absolute -right-2 -top-9 select-none font-display text-[10rem] font-extrabold leading-none text-dawn-400/10"
              >
                ?
              </span>
              <span className="relative flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-dawn-400 text-night-950">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
                    <path d="M21 12a8 8 0 1 0-3.1 6.3L21 19l-.9-3.2A8 8 0 0 0 21 12z" strokeLinejoin="round" />
                    <path d="M9.6 10a2.4 2.4 0 1 1 3.3 2.2c-.6.3-.9.7-.9 1.3M12 16.2h.01" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-dawn-300">
                    Assistant biblique
                  </span>
                  <span className="mt-1 block font-display text-lg font-extrabold leading-tight">
                    Pose ta question sur la Bible
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-cream/65">
                    Un passage difficile, un doute, un sujet ? L&apos;assistant répond, versets à l&apos;appui.
                  </span>
                </span>
              </span>
              <span className="relative mt-4 flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] py-2 pl-4 pr-2">
                <span className="min-w-0 flex-1 truncate text-sm text-cream/45">Écris ta question ici…</span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
                    <path d="M20 12L4 5l4.5 7L4 19zM20 12H9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </Link>
          </section>

          {/* Grec & hébreu : un mot du lexique, et l'accès au lexique */}
          <CartesLexique />

          {/* Explorer : galerie, frise, livres et arbres, dans le style sombre de leurs pages */}
          <section className="mt-5">
            <h2 className="font-display text-lg font-extrabold">Explorer</h2>
            <p className="mt-0.5 text-[13px] text-night-900/55">Pour entrer en profondeur dans la Parole.</p>
            <div className="mt-3 space-y-3">
              {/* Personnages & lieux : un petit éventail de cartes « profil » */}
              <Link
                href="/ecole/personnages"
                className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-night-950 p-5 text-cream shadow-[0_16px_38px_-18px_rgba(12,12,11,0.6)] transition-transform active:scale-[0.99]"
              >
                <span aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-44 w-44 rounded-full bg-dawn-400/10 blur-2xl" />
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">Galerie</span>
                  <span className="mt-1 block font-display text-xl font-extrabold leading-tight">Personnages &amp; lieux</span>
                  <span className="mt-1 block text-[12px] leading-snug text-cream/60">
                    Plus de 700 fiches, de la Genèse à l&apos;Apocalypse : famille, histoire, passages.
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-cream/80">
                    Glisse pour découvrir
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.4}>
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
                <span aria-hidden className="relative -mr-1 h-32 w-32 shrink-0">
                  {[
                    ["abraham", "-rotate-[15deg] -translate-x-8 translate-y-2"],
                    ["marie", "rotate-[15deg] translate-x-8 translate-y-2"],
                    ["moise", "rotate-0 -translate-y-1"],
                  ].map(([id, pose]) => (
                    <span
                      key={id}
                      className={`absolute left-1/2 top-1 -ml-[2.6rem] h-[7.5rem] w-[5.2rem] overflow-hidden rounded-2xl border border-white/15 bg-night-900 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.8)] ${pose}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset(`/img/bible/fiches/${id}.jpg`)} alt="" className="h-full w-full object-cover object-[50%_30%]" />
                      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night-950 to-transparent" />
                    </span>
                  ))}
                </span>
              </Link>

              {/* Frise chronologique : la bande des périodes et ses jalons */}
              <Link
                href="/ecole/chronologie"
                className="relative block overflow-hidden rounded-3xl bg-night-950 p-5 text-cream shadow-[0_16px_38px_-18px_rgba(12,12,11,0.6)] transition-transform active:scale-[0.99]"
              >
                <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[#8A6BFF]/15 blur-2xl" />
                <span className="relative block">
                  <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">Frise</span>
                  <span className="mt-1 block font-display text-xl font-extrabold leading-tight">Chronologie biblique</span>
                  <span className="mt-1 block text-[12px] leading-snug text-cream/60">
                    De la création à l&apos;Apocalypse : dates, passages, personnages et lieux.
                  </span>
                </span>
                <span aria-hidden className="relative mt-4 block">
                  <span className="flex items-end justify-between px-1">
                    {[
                      ["Abraham", "#C99A3B"],
                      ["Moïse", "#D9692E"],
                      ["David", "#CAF000"],
                      ["Exil", "#9A7F6B"],
                      ["Jésus", "#E8B44A"],
                      ["Paul", "#8A6BFF"],
                    ].map(([label, c]) => (
                      <span key={label} className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-cream/70">{label}</span>
                        <span className="mt-1 h-3 w-px bg-white/25" />
                        <span className="h-3 w-3 rounded-full border-2 border-night-950" style={{ background: c, boxShadow: `0 0 0 2px ${c}55` }} />
                      </span>
                    ))}
                  </span>
                  <span className="mt-1.5 flex h-1.5 overflow-hidden rounded-full">
                    {["#8A6BFF", "#C99A3B", "#D9692E", "#7FA33A", "#CAF000", "#4F9FD0", "#9A7F6B", "#3FB59A", "#E8B44A", "#D9542E", "#8A6BFF"].map((c, i) => (
                      <span key={i} className="h-full flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="mt-1.5 flex justify-between text-[10px] font-bold text-cream/40">
                    <span>Ancien Testament</span>
                    <span>Nouveau Testament</span>
                  </span>
                </span>
              </Link>

              {/* Les 66 livres : une étagère aux couleurs des familles de livres */}
              <Link
                href="/ecole/livres"
                className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-night-950 p-5 text-cream shadow-[0_16px_38px_-18px_rgba(12,12,11,0.6)] transition-transform active:scale-[0.99]"
              >
                <span aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-[#3FB59A]/12 blur-2xl" />
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">Bibliothèque</span>
                  <span className="mt-1 block font-display text-xl font-extrabold leading-tight">Les 66 livres</span>
                  <span className="mt-1 block text-[12px] leading-snug text-cream/60">
                    Chaque livre présenté : auteur, époque, contexte, plan, thèmes et versets clés.
                  </span>
                </span>
                <span aria-hidden className="relative flex h-24 shrink-0 items-end gap-[3px] border-b-2 border-white/20 px-1 pb-px">
                  {[
                    ["#C99A3B", 84], ["#C99A3B", 76], ["#7FA33A", 70], ["#7FA33A", 88], ["#8A6BFF", 64], ["#D9692E", 92],
                    ["#4F9FD0", 58], ["#4F9FD0", 66], ["#CAF000", 86], ["#E8B44A", 74], ["#3FB59A", 62], ["#C77DBA", 70], ["#D9542E", 80],
                  ].map(([c, h], i) => (
                    <span key={i} className="block w-[7px] rounded-t-[3px]" style={{ height: `${h}%`, background: c as string, opacity: 0.9 }} />
                  ))}
                </span>
              </Link>

              {/* Arbres généalogiques : un petit arbre de portraits */}
              <Link
                href="/ecole/arbres"
                className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-night-950 p-5 text-cream shadow-[0_16px_38px_-18px_rgba(12,12,11,0.6)] transition-transform active:scale-[0.99]"
              >
                <span aria-hidden className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-[#C99A3B]/14 blur-2xl" />
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">Généalogies</span>
                  <span className="mt-1 block font-display text-xl font-extrabold leading-tight">Arbres généalogiques</span>
                  <span className="mt-1 block text-[12px] leading-snug text-cream/60">
                    D&apos;Adam à Jésus : patriarches, tribus, rois, et les généalogies de Matthieu et Luc.
                  </span>
                </span>
                <span aria-hidden className="relative h-[7.5rem] w-28 shrink-0">
                  <svg viewBox="0 0 112 120" className="absolute inset-0 h-full w-full fill-none stroke-white/30" strokeWidth={1.5}>
                    <path d="M56 30v14M56 74v8M28 82h56M28 82v8M84 82v8" />
                  </svg>
                  {[
                    ["abraham", "left-[38px] top-0 h-9 w-9"],
                    ["isaac", "left-[38px] top-[44px] h-9 w-9"],
                    ["esau", "left-[10px] top-[88px] h-9 w-9"],
                    ["jacob", "left-[66px] top-[88px] h-9 w-9"],
                  ].map(([id, pos]) => (
                    <span key={id} className={`absolute overflow-hidden rounded-full border border-white/20 bg-night-900 ${pos}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset(`/img/bible/fiches/${id}.jpg`)} alt="" className="h-full w-full object-cover" />
                    </span>
                  ))}
                </span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/** Vrai une fois l'image réellement chargée. Sondée après montage : sur une
 * page exportée en statique, le 404 de l'image part avant que React
 * n'attache onError, donc le repli onError ne suffit pas. */
function useImageExiste(src?: string): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!src) return;
    let actif = true;
    const img = new Image();
    img.onload = () => {
      if (actif) setOk(true);
    };
    img.src = asset(src);
    return () => {
      actif = false;
    };
  }, [src]);
  return ok;
}

/** Fond de la bannière : la photo si présente, sinon un dégradé élégant —
 * l'image pourra être déposée dans /img/ecole/banner.jpg. */
function BanniereFond() {
  const ok = useImageExiste("/img/ecole/banner.jpg");
  return (
    <span aria-hidden className="absolute inset-0">
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset("/img/ecole/banner.jpg")} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="block h-full w-full bg-gradient-to-br from-[#2E3A14] via-night-900 to-night-950" />
      )}
      <span className="absolute inset-0 bg-gradient-to-r from-night-950/80 via-night-950/40 to-transparent" />
    </span>
  );
}

/** Vignette « reprendre » : l'image de la leçon, sinon la couverture. */
function MiniVignette({ src, cover }: { src?: string; cover?: string }) {
  const okSrc = useImageExiste(src);
  const chemin = okSrc && src ? src : cover;
  if (!chemin) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(chemin)} alt="" aria-hidden className="h-16 w-24 shrink-0 rounded-2xl object-cover object-top" />
  );
}
