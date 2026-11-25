"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HIGHLIGHT_COLORS, useToolkit, type Snippet } from "@/lib/toolkit";
import { useAuth } from "@/components/community/useAuth";
import { bibleHref } from "@/lib/bible-ref";
import { useMeditations, meditationDe } from "@/lib/meditations-relecture";
import { MeditationRelire } from "@/components/notebook/MeditationRelire";
import { LecteurExhortation } from "@/components/devotional/LecteurExhortation";
import { dateExhortation } from "@/lib/exhortations";
import { localeApp } from "@/lib/i18n";
import type { Devotion } from "@/lib/types";

/**
 * « Mes favoris » : tout ce qu'on a gardé, rangé par onglets — les
 * exhortations du Temps avec Jésus (titre + jour, un toucher pour relire),
 * les versets, les surlignages et le reste (paroles fortes, déclarations…).
 */

type Onglet = "exhortations" | "versets" | "surlignages" | "autres";

const KIND_LABEL: Record<string, string> = {
  méditation: "Méditation",
  punchline: "Parole forte",
  déclaration: "Déclaration",
  texte: "Texte",
};

/** Couleur de pastille d'un surlignage (mêmes teintes que dans la Bible). */
const PASTILLE: Record<string, string> = {
  lime: "#CAF000",
  amber: "#FBBF24",
  rose: "#FB7185",
  sky: "#38BDF8",
  violet: "#A78BFA",
};

const I = {
  retour: <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />,
  signet: <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />,
  livre: (
    <path
      d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"
      strokeLinejoin="round"
    />
  ),
  surligneur: <path d="M9 15l-3 3h5l1-1M9 15l7.5-7.5a2.1 2.1 0 0 1 3 3L12 18M9 15l3 3M4 21h16" strokeLinecap="round" strokeLinejoin="round" />,
  etoile: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" strokeLinejoin="round" />,
  chevron: <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  croix: <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />,
};

function Icone({ d, className = "h-5 w-5" }: { d: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={1.8} aria-hidden>
      {d}
    </svg>
  );
}

export function MyFavorites() {
  const { saved, removeSnippet, highlightItems, clearHighlight } = useToolkit();
  const { profile } = useAuth();
  const versetsProfil = profile?.favorite_verses ?? [];
  const meditations = useMeditations();
  const [onglet, setOnglet] = useState<Onglet>("exhortations");
  const [lecture, setLecture] = useState<{ dev: Devotion; index: number; date: Date } | null>(null);

  // Fond nuit jusqu'aux bords, comme les autres écrans sombres.
  useEffect(() => {
    document.documentElement.classList.add("page-nuit");
    return () => document.documentElement.classList.remove("page-nuit");
  }, []);

  // Exhortations du Temps avec Jésus : le jour où elles sont parues.
  const exhortations = saved
    .filter((s) => s.kind === "méditation" && s.id.startsWith("dev:"))
    .map((s) => {
      const dev = meditationDe(s, meditations);
      if (!dev) return null;
      const index = meditations.indexOf(dev) >= 0 ? meditations.indexOf(dev) : Number(s.id.split(":")[1]) || 0;
      return { s, dev, index, date: dateExhortation(index, meditations.length, new Date(s.ts)) };
    })
    .filter((x): x is { s: Snippet; dev: Devotion; index: number; date: Date } => !!x)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const versets = saved.filter((s) => s.kind === "verset").sort((a, b) => b.ts - a.ts);
  const autres = saved
    .filter((s) => !(s.kind === "méditation" && s.id.startsWith("dev:")) && s.kind !== "verset")
    .sort((a, b) => b.ts - a.ts);

  const compte: Record<Onglet, number> = {
    exhortations: exhortations.length,
    versets: versets.length + versetsProfil.length,
    surlignages: highlightItems.length,
    autres: autres.length,
  };
  const ONGLETS: { cle: Onglet; label: string; icone: React.ReactNode }[] = [
    { cle: "exhortations", label: "Exhortations", icone: I.livre },
    { cle: "versets", label: "Versets", icone: I.signet },
    { cle: "surlignages", label: "Surlignages", icone: I.surligneur },
    { cle: "autres", label: "Autres", icone: I.etoile },
  ];
  const total = compte.exhortations + compte.versets + compte.surlignages + compte.autres;
  const jour = (d: Date) => d.toLocaleDateString(localeApp(), { day: "numeric" });
  const mois = (d: Date) => d.toLocaleDateString(localeApp(), { month: "short" }).replace(".", "");
  const dateLongue = (ts: number) => new Date(ts).toLocaleDateString(localeApp(), { day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="keep-dark relative min-h-[100svh] overflow-hidden bg-night-950 pb-28 text-cream">
      {/* Halo lime discret en haut */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{ background: "radial-gradient(80% 60% at 75% 0%, rgba(202,240,0,.14), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-2xl px-4 pt-[calc(env(safe-area-inset-top)+4.75rem)] sm:pt-28">
        <Link href="/profil" className="inline-flex items-center gap-1 text-sm font-semibold text-cream/55">
          <Icone d={I.retour} className="h-4 w-4" />
          Mon profil
        </Link>

        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[34px] font-extrabold leading-none tracking-tight">
              Mes <span className="text-dawn-400">favoris</span>
            </h1>
            <p className="mt-2 text-[13.5px] leading-snug text-cream/60">Ce qui t&apos;a touché, gardé pour le méditer encore.</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-dawn-400/30 bg-dawn-400/10 px-3.5 py-2 text-center">
            <p className="font-display text-2xl font-extrabold leading-none text-dawn-400">{total}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cream/50">gardés</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1">
          {ONGLETS.map((o) => {
            const actif = onglet === o.cle;
            return (
              <button
                key={o.cle}
                type="button"
                onClick={() => setOnglet(o.cle)}
                className={`relative flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${
                  actif ? "border-dawn-400 bg-dawn-400 text-night-950" : "border-white/10 bg-white/[0.05] text-cream/75"
                }`}
              >
                <Icone d={o.icone} className="h-4 w-4" />
                {o.label}
                <span
                  className={`grid min-w-[20px] place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                    actif ? "bg-night-950/15 text-night-950" : "bg-white/10 text-cream/60"
                  }`}
                >
                  {compte[o.cle]}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div key={onglet} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="mt-5">
          {/* ————— Exhortations ————— */}
          {onglet === "exhortations" ? (
            exhortations.length ? (
              <ul className="space-y-2.5">
                {exhortations.map(({ s, dev, index, date }) => (
                  <li key={s.id}>
                    <div className="group flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-dawn-400/40">
                      <button
                        type="button"
                        onClick={() => setLecture({ dev, index, date })}
                        className="flex min-w-0 flex-1 items-center gap-3.5 p-3 text-left"
                      >
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-dawn-400/25 to-dawn-400/5 text-center ring-1 ring-dawn-400/30">
                          <span>
                            <span className="block font-display text-[22px] font-extrabold leading-none text-dawn-300">{jour(date)}</span>
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-cream/55">{mois(date)}</span>
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 block font-display text-[16px] font-bold leading-snug">{dev.theme}</span>
                          <span className="mt-0.5 block truncate text-xs text-cream/50">{dev.verseReference}</span>
                        </span>
                        <Icone d={I.chevron} className="h-4 w-4 shrink-0 text-cream/30" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSnippet(s.id)}
                        aria-label={`Retirer « ${dev.theme} » des favoris`}
                        className="grid w-11 shrink-0 place-items-center border-l border-white/[0.06] text-dawn-400 transition-colors hover:text-cream/60"
                      >
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
                          {I.signet}
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Vide
                icone={I.livre}
                titre="Aucune exhortation gardée"
                texte="Dans le Temps avec Jésus, touche « Mettre en favori » sur une exhortation qui te parle : elle t'attendra ici."
                lien={{ href: "/exhortations", label: "Voir toutes les exhortations" }}
              />
            )
          ) : null}

          {/* ————— Versets ————— */}
          {onglet === "versets" ? (
            compte.versets ? (
              <ul className="space-y-3">
                {versets.map((s) => {
                  const href = bibleHref(s.id) ?? bibleHref(s.reference);
                  return (
                    <li key={s.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 pl-5">
                      <span aria-hidden className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-dawn-400" />
                      <p className="font-display text-[17px] italic leading-relaxed text-cream/90">« {s.text} »</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-dawn-300">{s.reference ?? ""}</span>
                        <span className="flex items-center gap-1">
                          {href ? (
                            <Link href={href} className="rounded-full px-3 py-1.5 text-xs font-semibold text-cream/70 hover:bg-white/10">
                              Ouvrir
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => removeSnippet(s.id)}
                            aria-label="Retirer des favoris"
                            className="grid h-8 w-8 place-items-center rounded-full text-cream/40 hover:bg-white/10 hover:text-cream/80"
                          >
                            <Icone d={I.croix} className="h-4 w-4" />
                          </button>
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-cream/35">Gardé le {dateLongue(s.ts)}</p>
                    </li>
                  );
                })}
                {versetsProfil.map((v, i) => (
                  <li key={`profil-${i}`} className="relative overflow-hidden rounded-2xl border border-dawn-400/25 bg-dawn-400/[0.06] p-4 pl-5">
                    <span aria-hidden className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-dawn-400" />
                    <p className="font-display text-[17px] italic leading-relaxed text-cream/90">« {v.text} »</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-dawn-300">{v.reference}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream/60">Sur mon profil</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Vide
                icone={I.signet}
                titre="Aucun verset gardé"
                texte="Dans la Bible, touche un verset puis « Enregistrer » pour le retrouver ici."
                lien={{ href: "/bible", label: "Ouvrir la Bible" }}
              />
            )
          ) : null}

          {/* ————— Surlignages ————— */}
          {onglet === "surlignages" ? (
            highlightItems.length ? (
              <ul className="space-y-2.5">
                {highlightItems.map((h) => {
                  const href = bibleHref(h.id);
                  const teinte = PASTILLE[h.color] ?? PASTILLE.lime;
                  const nom = HIGHLIGHT_COLORS.find((c) => c.key === h.color)?.label;
                  return (
                    <li key={h.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[15px] leading-relaxed text-cream/90">
                        <span className="rounded px-0.5" style={{ background: `${teinte}33`, boxShadow: `inset 0 -2px 0 ${teinte}` }}>
                          {h.text}
                        </span>
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cream/60">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: teinte }} title={nom} />
                          {h.reference ?? ""}
                        </span>
                        <span className="flex items-center gap-1">
                          {href ? (
                            <Link href={href} className="rounded-full px-3 py-1.5 text-xs font-semibold text-cream/70 hover:bg-white/10">
                              Ouvrir
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => clearHighlight(h.id)}
                            aria-label="Retirer le surlignage"
                            className="grid h-8 w-8 place-items-center rounded-full text-cream/40 hover:bg-white/10 hover:text-cream/80"
                          >
                            <Icone d={I.croix} className="h-4 w-4" />
                          </button>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Vide
                icone={I.surligneur}
                titre="Aucun surlignage"
                texte="Dans la Bible ou le Temps avec Jésus, touche un passage et choisis une couleur pour le surligner."
                lien={{ href: "/bible", label: "Ouvrir la Bible" }}
              />
            )
          ) : null}

          {/* ————— Autres ————— */}
          {onglet === "autres" ? (
            autres.length ? (
              <ul className="space-y-2.5">
                {autres.map((s) => {
                  const med = meditationDe(s, meditations);
                  return (
                    <li key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream/60">
                          {KIND_LABEL[s.kind] ?? "Texte"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSnippet(s.id)}
                          aria-label="Retirer des favoris"
                          className="grid h-8 w-8 place-items-center rounded-full text-cream/40 hover:bg-white/10 hover:text-cream/80"
                        >
                          <Icone d={I.croix} className="h-4 w-4" />
                        </button>
                      </div>
                      {med ? <p className="mt-2 font-display text-base font-extrabold">{med.theme}</p> : null}
                      <p className="mt-1.5 text-[15px] leading-relaxed text-cream/85">{s.text}</p>
                      {s.reference ? <p className="mt-2 text-xs font-bold uppercase tracking-wide text-dawn-300">{s.reference}</p> : null}
                      {med ? <MeditationRelire dev={med} sansTitre tone="dark" /> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Vide
                icone={I.etoile}
                titre="Rien d'autre pour l'instant"
                texte="Les paroles fortes, déclarations et textes que tu enregistres apparaîtront ici."
              />
            )
          ) : null}
        </motion.div>
      </div>
      <LecteurExhortation ouverte={lecture} fermer={() => setLecture(null)} />
    </section>
  );
}

/** État vide d'un onglet : icône, phrase et raccourci. */
function Vide({
  icone,
  titre,
  texte,
  lien,
}: {
  icone: React.ReactNode;
  titre: string;
  texte: string;
  lien?: { href: string; label: string };
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-dawn-400/10 text-dawn-400">
        <Icone d={icone} className="h-7 w-7" />
      </span>
      <p className="mt-4 font-display text-lg font-bold">{titre}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-cream/55">{texte}</p>
      {lien ? (
        <Link href={lien.href} className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-bold text-night-950">
          {lien.label}
          <Icone d={I.chevron} className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
