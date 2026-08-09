"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { openExternal } from "@/lib/external";
import { isNativeApp } from "@/lib/notifications";
import { asset } from "@/lib/asset";
import { STRIPE_LINKS } from "@/config/stripe";
import { siteConfig } from "@/config/site";

/** Charte de l'app: nuit/olive + accent lime + crème. */
const C = {
  bg: "rgb(var(--n-950))",
  lime: "#CAF000",
  limeSoft: "#D8F53A",
  cream: "#F3F3ED",
  textSec: "#CBD0B8",
  textMuted: "#9AA184",
  placeholder: "#6E7356",
  cardBorder: "rgba(202,240,0,0.28)",
  limeTint: "rgba(202,240,0,0.12)",
};

const PRESETS = [20, 50, 100, 200, 500];
const MIN = 20;
const MAX = 500;
/** Base d'impact: 5 € finance 1 personne soutenue. */
const PER_PERSON = 5;

/**
 * Page « Faire un don » (missions d'évangélisation, aides humanitaires,
 * ministère pastoral). Le curseur et les montants illustrent l'impact ; le
 * bouton renvoie vers la page de don SÉCURISÉE du site (exigé par Apple: pas de
 * paiement intégré). Habillage dans la charte de l'app (nuit/olive + lime).
 */
export function DonateScreen() {
  const [monthly, setMonthly] = useState(true);
  const [amount, setAmount] = useState(100);
  const [freeMode, setFreeMode] = useState(false);
  const [freeVal, setFreeVal] = useState("");

  const effective = freeMode ? Math.max(0, Math.round(Number(freeVal.replace(",", ".")) || 0)) : amount;
  const people = Math.max(0, Math.floor(effective / PER_PERSON));

  // Lien de don: en natif on ouvre la page sécurisée du site (puis Stripe);
  // sur le web, on peut aller directement au paiement Stripe (don unique).
  const target = useMemo(() => {
    const site = `${siteConfig.url}/dons`;
    if (isNativeApp()) return site;
    if (!monthly && STRIPE_LINKS.donOnce) return STRIPE_LINKS.donOnce;
    return site;
  }, [monthly]);

  function pick(v: number) {
    setFreeMode(false);
    setAmount(v);
  }

  const sliderPct = ((amount - MIN) / (MAX - MIN)) * 100;

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
              Soutenir le ministère
            </p>
            <p className="truncate text-sm font-semibold text-[#F3F3ED]">Faire un don</p>
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
              src={asset("/mission/pasteur-scene.png")}
              alt="Pasteur Jack Brunet sur scène"
              className="h-64 w-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
              style={{ backgroundImage: "linear-gradient(to top, rgb(var(--n-950)), rgb(var(--n-950) / 0))" }}
            />
          </div>
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: C.textMuted }}>
              Mission terrain
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05]">
              Ton don pour le royaume de Dieu
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: C.textSec }}>
              Tu soutiens des missions d&apos;évangélisation, des aides humanitaires et un
              ministère pastoral: annoncer, aimer, servir.
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

        {/* Curseur de soutien */}
        <section className="mt-5 rounded-3xl border bg-white/[0.03] p-5" style={{ borderColor: C.cardBorder }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: C.lime }}>
                Curseur de soutien
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">
                Combien veux-tu donner ?
              </h2>
            </div>
            <div
              className="shrink-0 rounded-2xl border px-4 py-2 text-center"
              style={{ borderColor: "rgba(202,240,0,0.3)", background: C.limeTint }}
            >
              <p className="font-display text-2xl font-extrabold" style={{ color: C.lime }}>
                {effective} €
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>
                {people} personne{people > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSec }}>
            Avec <span className="font-bold" style={{ color: C.lime }}>{effective} €{monthly ? "/mois" : ""}</span>, tu
            soutiens <span className="font-bold" style={{ color: C.lime }}>{people} personne{people > 1 ? "s" : ""}</span>:
            évangélisation, aide humanitaire et ministère.
          </p>

          {/* Mensuel / ponctuel */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-black/25 p-1">
            {[
              { k: true, label: "Don mensuel" },
              { k: false, label: "Don ponctuel" },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setMonthly(o.k)}
                className="rounded-xl py-2.5 text-sm font-bold transition-colors"
                style={
                  monthly === o.k
                    ? { background: C.limeTint, color: C.lime, boxShadow: "inset 0 0 0 1px rgba(202,240,0,0.5)" }
                    : { color: C.textMuted }
                }
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="mt-5">
            <input
              type="range"
              min={MIN}
              max={MAX}
              step={5}
              value={freeMode ? MIN : amount}
              onChange={(e) => pick(Number(e.target.value))}
              className="jb-donate-range w-full"
              style={{
                background: `linear-gradient(90deg, rgb(var(--s-500)) 0%, ${C.lime} ${sliderPct}%, rgba(255,255,255,0.12) ${sliderPct}%)`,
              }}
              aria-label="Montant du don"
            />
            <div className="mt-1 flex justify-between text-xs font-semibold" style={{ color: C.textMuted }}>
              <span>{MIN} €</span>
              <span>{MAX} €</span>
            </div>
          </div>

          {/* Montants prédéfinis */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {PRESETS.map((v) => {
              const active = !freeMode && amount === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => pick(v)}
                  className="rounded-2xl py-3 text-center font-bold transition-colors"
                  style={
                    active
                      ? { background: C.lime, color: C.bg }
                      : { border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: C.cream }
                  }
                >
                  {v} €
                </button>
              );
            })}
          </div>

          {/* Don libre */}
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setFreeMode(true)}
              className="rounded-2xl py-3 text-center font-bold transition-colors"
              style={
                freeMode
                  ? { background: C.lime, color: C.bg }
                  : { border: "1px solid rgba(202,240,0,0.4)", background: "rgba(202,240,0,0.05)", color: C.lime }
              }
            >
              Don libre
            </button>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3">
              <span className="text-sm" style={{ color: C.textMuted }}>Montant</span>
              <input
                inputMode="numeric"
                value={freeVal}
                onFocus={() => setFreeMode(true)}
                onChange={(e) => {
                  setFreeMode(true);
                  setFreeVal(e.target.value.replace(/[^0-9]/g, ""));
                }}
                placeholder="Ex. 75"
                className="w-full bg-transparent py-3 text-right font-bold text-[#F3F3ED] outline-none"
                style={{ caretColor: C.lime }}
              />
              <span style={{ color: C.textMuted }}>€</span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed" style={{ color: C.textMuted }}>
            Base d&apos;impact: 5 € = 1 personne soutenue. Le don est volontaire et traité par Stripe.
          </p>
        </section>

        {/* Piliers d'impact (icônes, mise en page verticale) */}
        <section className="mt-5 space-y-2.5">
          {[
            {
              t: "Mission d'évangélisation",
              d: "Annoncer l'Évangile là où Jésus n'est pas encore connu.",
              icon: "M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4M8 3v3M4 6l8 5 8-5",
            },
            {
              t: "Aide humanitaire",
              d: "Servir concrètement: nourriture, soutien, présence auprès des plus fragiles.",
              icon: "M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z",
            },
            {
              t: "Ministère pastoral",
              d: "Enseigner, affermir et accompagner l'Église au quotidien.",
              icon: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM12 6v7M9 9h6",
            },
          ].map((p, i) => (
            <div
              key={p.t}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-sm font-extrabold"
                style={{ background: C.limeTint, color: C.lime }}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path d={p.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="font-bold text-[#F3F3ED]">
                  <span style={{ color: C.textMuted }}>{`0${i + 1} · `}</span>
                  {p.t}
                </p>
                <p className="mt-0.5 text-sm leading-snug" style={{ color: C.textMuted }}>{p.d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Réassurance */}
        <section className="mt-5 space-y-2.5">
          <InfoRow
            title="Paiement sécurisé hors application"
            text="Le bouton ouvre la page web sécurisée du site, puis Stripe traite le paiement."
            icon="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"
          />
        </section>

        {/* Note conformité */}
        <div
          className="mt-5 flex gap-3 rounded-2xl border p-4"
          style={{ borderColor: C.cardBorder, background: "rgba(202,240,0,0.05)" }}
        >
          <span
            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold"
            style={{ background: C.lime, color: C.bg }}
          >
            i
          </span>
          <p className="text-sm leading-relaxed" style={{ color: C.textSec }}>
            Ce don est volontaire, effectué sur le site, et ne débloque aucun contenu numérique
            dans l&apos;application.
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => openExternal(target)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-lg font-extrabold shadow-glow transition-transform active:scale-[0.99]"
          style={{ background: C.lime, color: C.bg }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Je soutiens la mission
        </button>

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

function InfoRow({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ background: "rgba(202,240,0,0.12)", color: "#CAF000" }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="font-bold text-[#F3F3ED]">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "#9AA184" }}>{text}</p>
      </div>
    </div>
  );
}
