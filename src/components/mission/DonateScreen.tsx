"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { openExternal } from "@/lib/external";
import { asset } from "@/lib/asset";
import { SoutienEnUnClic } from "@/components/mission/SoutienEnUnClic";
import { lienDonSite } from "@/lib/don-site";
import { useLangue } from "@/lib/i18n";
import { DonLibre } from "@/components/mission/DonLibre";

/** Charte de l'app: nuit/olive + accent lime + crème. */
const C = {
  bg: "rgb(var(--n-950))",
  lime: "#CAF000",
  limeSoft: "#D8F53A",
  cream: "#F3F3ED",
  textSec: "#CFCFCB",
  textMuted: "#A5A5A1",
  placeholder: "#77776F",
  cardBorder: "rgba(202,240,0,0.28)",
  limeTint: "rgba(202,240,0,0.12)",
};


/** Les besoins de la mission, expliqués simplement. */
const BESOINS = [
  {
    t: "Développer RHEMA",
    d: "Une application comme RHEMA coûte environ 30 000 € à développer : Bible, plans, études, audio, communauté, traductions.",
    icon: "M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  },
  {
    t: "La faire vivre chaque mois",
    d: "Serveurs, voix audio, traductions et maintenance : des coûts d'infrastructure permanents, pour que tout reste gratuit pour tous.",
    icon: "M4 6h16v5H4zM4 13h16v5H4zM8 8.5h.01M8 15.5h.01",
  },
  {
    t: "Missions humanitaires et d'évangélisation",
    d: "Nous aidons des missions et menons nous-mêmes des missions sur le terrain, auprès des pays les plus pauvres.",
    icon: "M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  },
];

/**
 * Page « Faire un don » (missions d'évangélisation, aides humanitaires,
 * ministère pastoral) : la mission, les besoins, puis le soutien — par Apple /
 * Google quand les produits existent, sinon un bouton vers la page de don du
 * site (jackbrunet.com/donner : Apple Pay, Google Pay, carte). Habillage dans
 * la charte de l'app (nuit/olive + lime).
 */
export function DonateScreen() {
  // Dans l'app : dès que le don libre Apple / Google est disponible, tout
  // passe par lui (plus de don par le site).
  const [donIntegre, setDonIntegre] = useState(false);
  const langue = useLangue();

  return (
    <div className="relative min-h-screen text-[#F3F3ED]" style={{ background: C.bg }}>
      {/* Fond sombre plein écran (couvre aussi la zone sous la barre d'onglets),
          pour éviter toute bande claire en bas. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: C.bg }} />
      {/* En-tête glissant: retour Accueil + fil d'ariane */}
      <header
        className="sticky top-0 z-20 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md"
        style={{ background: "rgb(var(--n-950) / 0.85)" }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link
            href="/devotionnel"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
            style={{ borderColor: "rgba(202,240,0,0.4)", background: C.limeTint, color: C.lime }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Accueil
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: C.lime }}>
              La mission
            </p>
            <p className="truncate text-sm font-semibold text-[#F3F3ED]">Soutiens la mission</p>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto max-w-lg px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-3"
      >
        {/* Héros */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/mission/enfants.webp")}
              alt=""
              className="h-64 w-full object-cover"
              style={{ objectPosition: "center 35%" }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
              style={{ backgroundImage: "linear-gradient(to top, rgb(var(--n-950)), rgb(var(--n-950) / 0))" }}
            />
          </div>
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: C.textMuted }}>
              La mission
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05]">
              Soutiens la mission
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: C.textSec }}>
              Donner accès gratuitement à la Parole de Dieu dans toutes les nations, et aider les pays
              les plus pauvres à travers des missions humanitaires et d&apos;évangélisation.
            </p>

            {/* Verset (bloc citation) */}
            <blockquote
              className="mt-5 rounded-2xl border-l-4 py-3 pl-4 pr-3"
              style={{ borderColor: C.lime, background: "rgba(202,240,0,0.06)" }}
            >
              <p className="font-display text-[15px] italic leading-relaxed text-[#F3F3ED]">
                « Ce n&apos;est pas que je recherche les dons ; mais je recherche le fruit qui
                abonde pour votre compte. »
              </p>
              <cite className="mt-1 block text-xs font-bold uppercase not-italic tracking-wider" style={{ color: C.lime }}>
                Philippiens 4.17
              </cite>
            </blockquote>
          </div>
        </section>

        {/* Les besoins : pourquoi ton soutien compte */}
        <section className="mt-5">
          <p className="px-1 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: C.lime }}>
            Les besoins
          </p>
          <h2 className="mt-1 px-1 font-display text-2xl font-extrabold leading-tight">
            Ton soutien propage la Parole
          </h2>
          <div className="mt-3 space-y-2.5">
            {BESOINS.map((b, i) => (
              <div key={b.t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: C.limeTint, color: C.lime }}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.7}>
                    <path d={b.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-[#F3F3ED]">
                    <span style={{ color: C.textMuted }}>{`0${i + 1} · `}</span>
                    {b.t}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed" style={{ color: C.textMuted }}>{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Soutien en un clic (achats intégrés, app installée uniquement) */}
        <SoutienEnUnClic />

        {/* Don libre (achats intégrés) + objectif */}
        <DonLibre onDispo={setDonIntegre} />

        {!donIntegre ? (
          // Don par le site : une page très simple (Apple Pay, Google Pay,
          // carte) aux couleurs de l'app, ouverte dans le navigateur.
          <section className="mt-5 rounded-3xl border p-5" style={{ borderColor: C.cardBorder, background: "rgba(202,240,0,0.05)" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: C.lime }}>
              Faire un don
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">En quelques secondes</h2>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: C.textSec }}>
              Choisis un montant, une fois ou chaque mois, puis paie avec Apple Pay, Google Pay ou ta
              carte bancaire.
            </p>
            <button
              type="button"
              onClick={() => openExternal(lienDonSite(undefined, undefined, langue))}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-lg font-extrabold shadow-glow transition-transform active:scale-[0.99]"
              style={{ background: C.lime, color: C.bg }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Je soutiens la mission
            </button>
            <p className="mt-3 text-center text-xs" style={{ color: C.textMuted }}>
              Paiement sécurisé sur notre site, par Stripe.
            </p>
          </section>
        ) : null}

        {/* Vers la page Mission Madagascar */}
        <Link
          href="/mission-madagascar"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 font-display text-base font-bold transition-colors"
          style={{ borderColor: "rgba(202,240,0,0.45)", color: C.lime }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="11" r="2.2" />
          </svg>
          Mission Madagascar
        </Link>
      </motion.main>
    </div>
  );
}
