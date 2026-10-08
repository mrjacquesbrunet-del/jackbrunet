"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { asset } from "@/lib/asset";
import { getLangue } from "@/lib/i18n";
import { derniereErreurDon, payerDon, paiementDirectDispo } from "@/lib/don-site";
import { progressionDon, type ObjectifDon } from "@/lib/soutien";

const MONTANTS = [10, 20, 50, 100, 200];
const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

/** Masque l'en-tête et le pied du site : la page ressemble à l'app. */
export function PageEpuree() {
  useEffect(() => {
    const h = document.documentElement;
    h.classList.add("page-epuree");
    return () => h.classList.remove("page-epuree");
  }, []);
  return null;
}

/**
 * Page de don du site, ouverte depuis l'app : le moins de friction possible.
 * On choisit « une fois » ou « chaque mois », un montant, et un seul bouton
 * ouvre le paiement Stripe (Apple Pay, Google Pay, carte) déjà rempli.
 */
export function DonnerRapide() {
  const params = useSearchParams();
  const initial = Number(params.get("montant")) || 50;
  const [mensuel, setMensuel] = useState(params.get("mensuel") === "1");
  const [montant, setMontant] = useState<number>(MONTANTS.includes(initial) ? initial : 50);
  const [libre, setLibre] = useState(MONTANTS.includes(initial) ? "" : String(initial));
  const [modeLibre, setModeLibre] = useState(!MONTANTS.includes(initial));
  const [envoi, setEnvoi] = useState(false);
  const [direct, setDirect] = useState<boolean | null>(null);
  const [objectif, setObjectif] = useState<ObjectifDon | null>(null);

  useEffect(() => {
    paiementDirectDispo().then(setDirect);
    progressionDon().then(setObjectif);
  }, []);

  const valeur = modeLibre ? Math.max(0, Math.round(Number(libre.replace(",", ".")) || 0)) : montant;
  const valide = valeur >= 1 && valeur <= 10000;
  const pct = objectif ? Math.min(100, Math.round((objectif.collecte / objectif.objectif) * 100)) : 0;

  async function donner() {
    if (!valide || envoi) return;
    setEnvoi(true);
    try {
      await payerDon(valeur, mensuel, getLangue());
    } finally {
      setTimeout(() => setEnvoi(false), 4000);
    }
  }

  // ?go=1 (bouton « 10 € par mois » du pop-up de l'app) : le paiement
  // s'ouvre aussitôt, sans second clic.
  const [lance, setLance] = useState(false);
  useEffect(() => {
    if (lance || params.get("go") !== "1" || !valide) return;
    setLance(true);
    void donner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[100svh] bg-night-950 text-cream">
      <PageEpuree />
      <div className="mx-auto flex min-h-[100svh] max-w-md flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        {/* Marque */}
        <div className="flex items-center justify-center gap-2 text-cream/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/logo-rhema.webp")} alt="" className="h-7 w-7 rounded-md object-contain" />
          <span className="text-[13px] font-black tracking-[0.28em]">RHEMA</span>
        </div>

        {/* La mission */}
        <div className="relative mt-4 overflow-hidden rounded-3xl border border-dawn-400/25">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/mission/enfants.webp")}
            alt=""
            className="h-44 w-full object-cover"
            style={{ objectPosition: "center 52%", filter: "saturate(0.8) contrast(1.06) brightness(0.85)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgb(var(--n-950)) 0%, rgb(var(--n-950) / .7) 22%, transparent 48%)" }}
          />
          <div className="absolute inset-x-4 bottom-2.5">
            <h1 className="font-display text-[21px] font-extrabold leading-tight [text-shadow:0_1px_10px_rgba(0,0,0,.7)]">
              Soutiens la <span className="text-dawn-400">mission</span>
            </h1>
            <p className="mt-0.5 text-[12px] font-medium leading-snug text-cream [text-shadow:0_1px_8px_rgba(0,0,0,.8)]">
              Ta contribution fait vivre l&apos;app et des missions auprès des plus pauvres.
            </p>
          </div>
        </div>

        {objectif ? (
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-[11px] font-black uppercase tracking-[0.16em] text-cream/45">
              <span>{objectif.titre}</span>
              <span className="text-dawn-400">{`${pct} %`}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8FB300] to-dawn-400"
                style={{ width: `${Math.max(pct, objectif.collecte > 0 ? 3 : 0)}%` }}
              />
            </div>
            <p className="mt-1 text-[12px] font-semibold text-cream/55">{`${euros(objectif.collecte)} sur ${euros(objectif.objectif)}`}</p>
          </div>
        ) : null}

        {/* Pourquoi donner : une phrase, simple et claire */}
        <div className="mt-4 flex gap-3 rounded-2xl border border-dawn-400/20 bg-dawn-400/[0.06] p-3.5">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 fill-none stroke-current text-dawn-400" strokeWidth={1.8} aria-hidden>
            <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
          </svg>
          <p className="text-[13px] leading-relaxed text-cream/80">
            RHEMA est gratuite, mais sa création et sa maintenance ont un vrai coût. Ta contribution permet d&apos;annoncer
            la Parole gratuitement au plus grand nombre, et le reste part dans les missions.
          </p>
        </div>

        {/* Une fois / chaque mois */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.06] p-1">
          {[
            { k: false, label: "Une fois" },
            { k: true, label: "Chaque mois" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setMensuel(o.k)}
              className={`rounded-xl py-2.5 text-[14px] font-bold transition-colors ${
                mensuel === o.k ? "bg-dawn-400 text-night-950" : "text-cream/65"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Montant */}
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {MONTANTS.map((v) => {
            const actif = !modeLibre && montant === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setModeLibre(false);
                  setMontant(v);
                }}
                className={`rounded-2xl py-3.5 font-display text-[20px] font-extrabold transition-colors active:scale-[0.98] ${
                  actif ? "bg-dawn-400 text-night-950 shadow-[0_0_18px_rgba(202,240,0,.3)]" : "border border-white/10 bg-white/[0.04] text-cream"
                }`}
              >
                {`${v} €`}
              </button>
            );
          })}
          <label
            className={`flex items-center justify-center gap-1 rounded-2xl px-2 transition-colors ${
              modeLibre ? "bg-dawn-400 text-night-950" : "border border-white/10 bg-white/[0.04] text-cream/70"
            }`}
          >
            <input
              inputMode="numeric"
              value={libre}
              onFocus={() => setModeLibre(true)}
              onChange={(e) => {
                setModeLibre(true);
                setLibre(e.target.value.replace(/[^0-9]/g, "").slice(0, 5));
              }}
              placeholder="Autre"
              aria-label="Autre montant"
              className={`w-full min-w-0 bg-transparent py-3.5 text-center font-display text-[18px] font-extrabold outline-none ${
                modeLibre ? "placeholder:text-night-950/50" : "placeholder:text-cream/55"
              }`}
            />
            {libre ? <span className="font-display text-[18px] font-extrabold">€</span> : null}
          </label>
        </div>

        {/* Un seul bouton */}
        <button
          type="button"
          onClick={donner}
          disabled={!valide || envoi}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-dawn-400 py-4 font-display text-[19px] font-extrabold text-night-950 shadow-[0_0_24px_rgba(202,240,0,.35)] transition-transform active:scale-[0.99] disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
          </svg>
          {envoi
            ? "Ouverture du paiement…"
            : !valide
              ? "Choisis un montant"
              : mensuel
                ? `Contribuer ${euros(valeur)} par mois`
                : `Contribuer ${euros(valeur)}`}
        </button>

        {/* Moyens de paiement */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[12px] font-bold text-cream/70">
          {["Apple Pay", "Google Pay", "Carte bancaire"].map((m) => (
            <span key={m} translate={m === "Carte bancaire" ? undefined : "no"} className="rounded-full border border-white/12 px-3 py-1">
              {m}
            </span>
          ))}
        </div>

        <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-[12px] leading-snug text-cream/45">
          <svg viewBox="0 0 24 24" className="mt-px h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span>
            {mensuel
              ? "Paiement sécurisé par Stripe. Reçu par e-mail. Tu arrêtes quand tu veux."
              : "Paiement sécurisé par Stripe. Reçu par e-mail."}
          </span>
        </p>
        {direct === false && (modeLibre || !mensuel || ![20, 50, 100].includes(valeur)) ? (
          <p className="mt-1 text-center text-[11.5px] text-cream/40">Tu confirmeras le montant sur la page de paiement.</p>
        ) : null}

        {/* Diagnostic (jackbrunet.com/donner/?debug=1) */}
        {params.has("debug") ? (
          <p className="mt-3 break-all rounded-xl bg-white/5 p-2 text-[11px] text-cream/60">
            {`Paiement direct : ${direct === null ? "vérification…" : direct ? "OK" : "indisponible"} ${derniereErreurDon}`}
          </p>
        ) : null}

        <p className="mt-auto pt-8 text-center font-display text-[13px] italic text-cream/40">
          « Que chacun donne comme il l&apos;a résolu en son cœur. » 2 Corinthiens 9:7
        </p>
      </div>
    </div>
  );
}

/** Page de remerciement, après le paiement. */
export function DonMerci() {
  const params = useSearchParams();
  const montant = Number(params.get("montant")) || 0;
  const mensuel = params.get("mensuel") === "1";
  return (
    <div className="min-h-[100svh] bg-night-950 text-cream">
      <PageEpuree />
      <div className="mx-auto flex min-h-[100svh] max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_30px_rgba(202,240,0,.45)]">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="mt-6 font-display text-[30px] font-extrabold leading-tight">Merci du fond du cœur</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-cream/70">
          {montant
            ? mensuel
              ? `Ton soutien de ${euros(montant)} par mois fait avancer la mission : la Parole de Dieu dans les nations et des missions auprès des plus pauvres. Que Dieu te bénisse.`
              : `Ta contribution de ${euros(montant)} fait avancer la mission : la Parole de Dieu dans les nations et des missions auprès des plus pauvres. Que Dieu te bénisse.`
            : "Ta contribution fait avancer la mission : la Parole de Dieu dans les nations et des missions auprès des plus pauvres. Que Dieu te bénisse."}
        </p>
        <p className="mt-3 text-[13px] text-cream/45">Ton reçu arrive par e-mail.</p>
        <p className="mt-8 text-[13px] font-semibold text-dawn-400">Tu peux fermer cette page pour revenir à l&apos;application.</p>
      </div>
    </div>
  );
}
