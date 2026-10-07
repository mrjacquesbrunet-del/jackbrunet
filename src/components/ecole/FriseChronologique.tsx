"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bibleHref } from "@/lib/bible-ref";
import { LieuCarte } from "@/components/bible/LieuCarte";
import { FicheSheet, Medaillon, TexteAvecRefs, getFiches, type FichesData } from "@/components/bible/FichesChapitre";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import frise from "../../../content/chronologie-biblique.json";
import { enregistrerContenu } from "@/lib/contenu-i18n";
import { getIndex } from "@/lib/bible-client";

/**
 * FRISE CHRONOLOGIQUE — page cachée de l'Étude biblique (section Explorer).
 *
 * Deux frises : Ancien et Nouveau Testament. En haut, la bande des grandes
 * périodes (un tap y saute) ; dessous, la ligne du temps, événement par
 * événement. Un tap ouvre l'événement : récit, passages à lire, personnages
 * (qui ouvrent leur fiche complète) et lieux situés sur la carte.
 * Contenu : content/chronologie-biblique.json.
 */

type Testament = "AT" | "NT";
type Periode = { id: string; nom: string; couleur: string };
type Evenement = {
  t: Testament;
  id: string;
  titre: string;
  date: string;
  y: number | null;
  p: string;
  refs: string[];
  pers: string[];
  lieux: string[];
  txt: string;
};
const DATA = frise as { periodes: Record<Testament, Periode[]>; evenements: Evenement[] };
enregistrerContenu("chronologie-biblique", frise);
const MEMO = "jb.frise.v1";

export function FriseChronologique() {
  const router = useRouter();
  const [t, setT] = useState<Testament>("AT");
  const [fiches, setFiches] = useState<FichesData | null>(null);
  const [bookNames, setBookNames] = useState<Record<number, string>>({});
  const [ouvert, setOuvert] = useState<Evenement | null>(null);
  const [fiche, setFiche] = useState<string | null>(null);
  const [periodeVue, setPeriodeVue] = useState<string>("");
  const listeRef = useRef<HTMLDivElement>(null);
  const bandeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFiches().then(setFiches);
    getIndex()
      .then((b: { id: number; name: string }[]) => setBookNames(Object.fromEntries(b.map((x) => [x.id, x.name]))))
      .catch(() => {});
    // Lien profond (?ev=…) depuis une introduction de livre : on ouvre l'événement.
    const ev = DATA.evenements.find((e) => e.id === new URLSearchParams(window.location.search).get("ev"));
    if (ev) {
      setT(ev.t);
      setOuvert(ev);
      return;
    }
    try {
      if (sessionStorage.getItem(MEMO) === "NT") setT("NT");
    } catch {
      /* stockage indisponible */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(MEMO, t);
    } catch {
      /* stockage indisponible */
    }
    listeRef.current?.scrollTo({ top: 0 });
  }, [t]);

  const periodes = DATA.periodes[t];
  const evenements = useMemo(() => DATA.evenements.filter((e) => e.t === t), [t]);
  const couleur = (p: string) => periodes.find((x) => x.id === p)?.couleur ?? "#CAF000";

  // Période visible : la dernière dont l'en-tête est passé sous la bande.
  const onScroll = () => {
    const box = listeRef.current;
    if (!box) return;
    const top = box.getBoundingClientRect().top + 8;
    let vue = periodes[0]?.id ?? "";
    for (const p of periodes) {
      const el = box.querySelector<HTMLElement>(`[data-periode="${p.id}"]`);
      if (el && el.getBoundingClientRect().top <= top) vue = p.id;
    }
    if (vue !== periodeVue) setPeriodeVue(vue);
  };
  useEffect(onScroll); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bandeRef.current
      ?.querySelector(`[data-bande="${periodeVue}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [periodeVue]);

  const allerPeriode = (id: string) => {
    const box = listeRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-periode="${id}"]`);
    if (box && el) box.scrollTo({ top: el.offsetTop - 4, behavior: "smooth" });
  };

  const lire = (ref: string) => {
    const h = bibleHref(ref);
    if (h) router.push(h);
  };

  return (
    <div className="dark-ctx fixed inset-0 z-[70] flex flex-col bg-night-950 text-cream">
      {/* Fond noir continu sous la barre de statut et la zone du geste d'accueil */}
      <PlansDarkBg />
      <header className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link href="/ecole" aria-label="Retour à l'Étude biblique" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">Étude biblique</p>
            <h1 className="font-display text-xl font-extrabold leading-tight">Frise chronologique</h1>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-lg rounded-full border border-white/10 bg-white/[0.05] p-1">
          {(
            [
              ["AT", "Ancien Testament"],
              ["NT", "Nouveau Testament"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setT(k)}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${t === k ? "bg-dawn-400 text-night-950" : "text-cream/65"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* La bande des périodes */}
        <div ref={bandeRef} className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-2">
          {periodes.map((p) => {
            const n = evenements.filter((e) => e.p === p.id).length;
            const actif = p.id === periodeVue;
            return (
              <button
                key={p.id}
                type="button"
                data-bande={p.id}
                onClick={() => allerPeriode(p.id)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${actif ? "border-white/40 bg-white/10" : "border-white/10"}`}
                style={{ minWidth: `${Math.max(6.5, n * 1.4)}rem` }}
              >
                <span className="block h-1.5 rounded-full" style={{ background: p.couleur }} />
                <span className="mt-1.5 block text-[12px] font-bold leading-tight text-cream/90">{p.nom}</span>
                <span className="block text-[10px] font-semibold text-cream/45">
                  {n} événement{n > 1 ? "s" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* La ligne du temps */}
      <div ref={listeRef} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="mx-auto max-w-lg">
          {periodes.map((p) => {
            const evs = evenements.filter((e) => e.p === p.id);
            if (!evs.length) return null;
            return (
              <section key={p.id} data-periode={p.id} className="pt-5">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-night-950" style={{ background: p.couleur }}>
                  {p.nom}
                </p>
                <ol className="relative ml-2 border-l-2 pl-6" style={{ borderColor: `${p.couleur}66` }}>
                  {evs.map((ev) => (
                    <li key={ev.id} className="relative pb-5 last:pb-2">
                      <span
                        className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-[3px] border-night-950"
                        style={{ background: p.couleur, boxShadow: `0 0 0 2px ${p.couleur}55` }}
                      />
                      <button
                        type="button"
                        onClick={() => setOuvert(ev)}
                        className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-left transition-colors active:bg-white/10"
                      >
                        <span className="block text-[11px] font-bold" style={{ color: p.couleur }}>
                          {ev.date}
                        </span>
                        <span className="mt-0.5 block font-display text-[17px] font-extrabold leading-snug">{ev.titre}</span>
                        <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-cream/65">{ev.txt.replace(/\s*\([^)]*\d+\.\d+[^)]*\)/g, "")}</span>
                        {fiches && ev.pers.length ? (
                          <span className="mt-2.5 flex items-center">
                            {ev.pers.slice(0, 5).map((id, i) =>
                              fiches.fiches[id] ? (
                                <span key={id} className="-ml-2 first:ml-0 rounded-full ring-2 ring-night-950" style={{ zIndex: 10 - i }}>
                                  <Medaillon id={id} fiche={fiches.fiches[id]} size="h-8 w-8" />
                                </span>
                              ) : null,
                            )}
                            <span className="ml-2 truncate text-[12px] font-semibold text-cream/55">
                              {ev.pers
                                .slice(0, 3)
                                .map((id) => fiches.fiches[id]?.nom.replace(/\s*\(.*\)$/, ""))
                                .filter(Boolean)
                                .join(", ")}
                              {ev.pers.length > 3 ? ` +${ev.pers.length - 3}` : ""}
                            </span>
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
          <p className="mt-6 text-center text-[11px] leading-relaxed text-cream/35">
            Dates approximatives, selon la chronologie biblique traditionnelle ; avant Abraham, la Bible ne donne pas de date.
          </p>
        </div>
      </div>

      {/* L'événement ouvert */}
      {ouvert ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
          <button type="button" aria-label="Fermer" onClick={() => setOuvert(null)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
          <div className="relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 sm:rounded-3xl">
            <div className="h-1.5 shrink-0" style={{ background: couleur(ouvert.p) }} />
            <div className="overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: couleur(ouvert.p) }}>
                    {ouvert.date} · {periodes.find((x) => x.id === ouvert.p)?.nom}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">{ouvert.titre}</h2>
                </div>
                <button type="button" onClick={() => setOuvert(null)} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
                </button>
              </div>

              <div className="mt-3">
                <TexteAvecRefs texte={ouvert.txt} onNavigate={(l, c, v) => router.push(`/bible?livre=${l}&chap=${c}${v ? `&v=${v}` : ""}`)} />
              </div>

              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">À lire dans la Bible</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ouvert.refs.map((r) => (
                  <button key={r} type="button" onClick={() => lire(r)} className="rounded-full bg-dawn-400 px-3.5 py-2 font-display text-sm font-bold text-night-950">
                    {r}
                  </button>
                ))}
              </div>

              {fiches && ouvert.pers.length ? (
                <>
                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Personnages</p>
                  <div className="mt-2 grid grid-cols-4 gap-x-2 gap-y-3">
                    {ouvert.pers.map((id) => {
                      const f = fiches.fiches[id];
                      if (!f) return null;
                      return (
                        <button key={id} type="button" onClick={() => setFiche(id)} className="flex flex-col items-center gap-1 text-center">
                          <Medaillon id={id} fiche={f} size="h-14 w-14" />
                          <span className="line-clamp-2 text-[11px] font-bold leading-tight text-cream/85">{f.nom.replace(/\s*\(.*\)$/, "")}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {fiches && ouvert.lieux.length ? (
                <>
                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Lieux</p>
                  {(() => {
                    const pts = ouvert.lieux
                      .map((id) => fiches.fiches[id])
                      .filter((f) => f?.geo)
                      .map((f) => ({ g: f!.geo as [number, number], label: f!.nom.replace(/\s*\(.*\)$/, "").replace(/^(Le |La |Les |L')/, "") }));
                    return pts.length ? <LieuCarte className="mt-2" points={pts} /> : null;
                  })()}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ouvert.lieux.map((id) => {
                      const f = fiches.fiches[id];
                      if (!f) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setFiche(id)}
                          className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] py-1 pl-1 pr-3"
                        >
                          <Medaillon id={id} fiche={f} size="h-7 w-7" />
                          <span className="text-xs font-bold text-cream">{f.nom}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* La fiche complète d'un personnage ou d'un lieu */}
      {fiche && fiches ? (
        <FicheSheet
          id={fiche}
          data={fiches}
          bookId={-1}
          chapter={-1}
          bookNames={bookNames}
          zIndex="z-[130]"
          onClose={() => setFiche(null)}
          onNavigate={(l, c, v) => router.push(`/bible?livre=${l}&chap=${c}${v ? `&v=${v}` : ""}`)}
        />
      ) : null}
    </div>
  );
}
