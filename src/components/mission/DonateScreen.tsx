"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { openExternal } from "@/lib/external";
import { isNativeApp } from "@/lib/notifications";
import { asset } from "@/lib/asset";
import { STRIPE_LINKS } from "@/config/stripe";
import { siteConfig } from "@/config/site";

/** Palette calquée sur la référence: fond teal-navy, or + cyan. */
const C = {
  gold: "#E9C45C",
  cyan: "#59B6D8",
  cardBorder: "rgba(233,196,92,0.35)",
};

const PRESETS = [20, 30, 50, 100, 250, 500];
const MIN = 20;
const MAX = 500;
/** Base d'impact: 5 € finance 1 personne soutenue. */
const PER_PERSON = 5;

/**
 * Page « Faire un don » (mission d'évangélisation, aide humanitaire, ministère).
 * Le curseur et les montants illustrent l'impact ; le bouton renvoie vers la
 * page de don SÉCURISÉE du site (exigé par Apple: pas de paiement intégré).
 */
export function DonateScreen() {
  const [monthly, setMonthly] = useState(true);
  const [amount, setAmount] = useState(250);
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
    <div className="min-h-screen bg-[#0A171C] text-[#E8EEF0]">
      {/* En-tête glissant: retour Accueil + fil d'ariane */}
      <header className="sticky top-0 z-20 bg-[#0A171C]/85 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link
            href="/devotionnel"
            className="inline-flex items-center gap-2 rounded-full border border-[#59B6D8]/40 bg-[#59B6D8]/10 px-4 py-2 text-sm font-bold text-[#59B6D8]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Accueil
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-[#59B6D8]">
              Soutenir le ministère
            </p>
            <p className="truncate text-sm font-semibold text-[#E8EEF0]">Faire un don</p>
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/mission/logo-web.webp")}
            alt="Mission d'évangélisation"
            className="h-52 w-full bg-[#0E2830] object-contain p-6"
          />
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9FB4BA]">
              Mission terrain
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05]">
              Ton don peut faire la différence.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#B7C6CB]">
              Tu soutiens l&apos;évangélisation, l&apos;aide humanitaire et le ministère pastoral:
              annoncer, aimer, servir sur le terrain.
            </p>
          </div>
        </section>

        {/* Curseur de soutien */}
        <section
          className="mt-5 rounded-3xl border bg-white/[0.03] p-5"
          style={{ borderColor: C.cardBorder }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold }}>
                Curseur de soutien
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">
                Combien veux-tu donner ?
              </h2>
            </div>
            <div className="shrink-0 rounded-2xl border border-[#59B6D8]/30 bg-[#59B6D8]/10 px-4 py-2 text-center">
              <p className="font-display text-2xl font-extrabold" style={{ color: C.cyan }}>
                {effective} €
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9FB4BA]">
                {people} personne{people > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#B7C6CB]">
            Avec <span className="font-bold" style={{ color: C.gold }}>{effective} €{monthly ? "/mois" : ""}</span>, tu
            soutiens <span className="font-bold" style={{ color: C.gold }}>{people} personne{people > 1 ? "s" : ""}</span>:
            Bibles, aide humanitaire et partage de l&apos;Évangile.
          </p>

          {/* Mensuel / ponctuel */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-black/20 p-1">
            {[
              { k: true, label: "Don mensuel" },
              { k: false, label: "Don ponctuel" },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setMonthly(o.k)}
                className={`rounded-xl py-2.5 text-sm font-bold transition-colors ${
                  monthly === o.k
                    ? "bg-[#59B6D8]/15 text-[#59B6D8] ring-1 ring-[#59B6D8]/50"
                    : "text-[#9FB4BA]"
                }`}
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
                background: `linear-gradient(90deg, ${C.gold} 0%, ${C.cyan} ${sliderPct}%, rgba(255,255,255,0.12) ${sliderPct}%)`,
              }}
              aria-label="Montant du don"
            />
            <div className="mt-1 flex justify-between text-xs font-semibold text-[#9FB4BA]">
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
                  className={`rounded-2xl py-3 text-center font-bold transition-colors ${
                    active ? "text-black" : "border border-white/10 bg-white/[0.03] text-[#E8EEF0]"
                  }`}
                  style={active ? { background: C.gold } : undefined}
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
              className={`rounded-2xl py-3 text-center font-bold transition-colors ${
                freeMode
                  ? "text-black"
                  : "border border-[#59B6D8]/40 bg-[#59B6D8]/5 text-[#59B6D8]"
              }`}
              style={freeMode ? { background: C.cyan } : undefined}
            >
              Don libre
            </button>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3">
              <span className="text-sm text-[#9FB4BA]">Montant</span>
              <input
                inputMode="numeric"
                value={freeVal}
                onFocus={() => setFreeMode(true)}
                onChange={(e) => {
                  setFreeMode(true);
                  setFreeVal(e.target.value.replace(/[^0-9]/g, ""));
                }}
                placeholder="Ex. 75"
                className="w-full bg-transparent py-3 text-right font-bold text-[#E8EEF0] outline-none placeholder:text-[#6E8288]"
              />
              <span className="text-[#9FB4BA]">€</span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[#8CA0A6]">
            Base d&apos;impact: 5 € = 1 personne soutenue. Le don est volontaire et traité par Stripe.
          </p>
        </section>

        {/* Piliers d'impact */}
        <section className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { n: "01", t: "Bibles distribuées" },
            { n: "02", t: "Aide humanitaire" },
            { n: "03", t: "Partage de l'Évangile" },
          ].map((p) => (
            <div key={p.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-bold text-[#6E8288]">{p.n}</p>
              <p className="mt-6 text-sm font-bold leading-snug text-[#E8EEF0]">{p.t}</p>
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
          <InfoRow
            title="Reçu fiscal"
            text="Les informations fiscales et le reçu sont gérés côté site après le paiement."
            icon="M6 3h9l3 3v15l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6"
          />
        </section>

        {/* Note conformité */}
        <div
          className="mt-5 flex gap-3 rounded-2xl border p-4"
          style={{ borderColor: C.cardBorder, background: "rgba(233,196,92,0.05)" }}
        >
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold text-black" style={{ background: C.gold }}>
            i
          </span>
          <p className="text-sm leading-relaxed text-[#C7D4D8]">
            Ce don est volontaire, effectué sur le site, et ne débloque aucun contenu numérique
            dans l&apos;application.
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => openExternal(target)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-lg font-extrabold text-black shadow-lg transition-transform active:scale-[0.99]"
          style={{ background: C.gold }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Continuer vers le don sécurisé
        </button>
      </motion.main>
    </div>
  );
}

function InfoRow({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#59B6D8]/12 text-[#59B6D8]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="font-bold text-[#E8EEF0]">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-[#9FB4BA]">{text}</p>
      </div>
    </div>
  );
}
