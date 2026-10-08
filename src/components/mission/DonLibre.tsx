"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/components/community/useAuth";
import { chargerDonsLibres, donner, progressionDon, soutienDispo, type ObjectifDon, type OffreDon } from "@/lib/soutien";

const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

/**
 * Bloc « Don libre » de l'onglet Soutien (app installée uniquement), sous
 * les Bâtisseurs : on choisit un montant, la feuille Apple / Google s'ouvre,
 * et la barre d'objectif avance. Masqué tant que les produits n'existent pas
 * dans les stores (`onDispo(false)` : la page garde alors le don par le site).
 */
export function DonLibre({ onDispo }: { onDispo?: (dispo: boolean) => void }) {
  const { userId } = useAuth();
  const [offres, setOffres] = useState<OffreDon[]>([]);
  const [choix, setChoix] = useState<string | null>(null);
  const [objectif, setObjectif] = useState<ObjectifDon | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [merci, setMerci] = useState<OffreDon | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (!soutienDispo()) {
      onDispo?.(false);
      return;
    }
    chargerDonsLibres().then((o) => {
      setOffres(o);
      setChoix(o.find((x) => x.eur === 20)?.id ?? o[0]?.id ?? null);
      onDispo?.(o.length > 0);
    });
    progressionDon().then(setObjectif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!offres.length) return null;

  const ios = Capacitor.getPlatform() === "ios";
  const offre = offres.find((o) => o.id === choix) ?? null;
  const pct = objectif ? Math.min(100, Math.round((objectif.collecte / objectif.objectif) * 100)) : 0;

  async function valider() {
    if (!offre) return;
    setErreur("");
    setEnCours(true);
    try {
      const r = await donner(offre, userId);
      if (r === "ok") {
        setMerci(offre);
        // La barre avance tout de suite, puis se recale sur le serveur.
        setObjectif((o) => (o ? { ...o, collecte: o.collecte + offre.eur, dons: o.dons + 1 } : o));
        setTimeout(() => progressionDon().then((o) => o && setObjectif(o)), 2000);
      }
    } catch {
      setErreur("Le paiement n'a pas abouti. Réessaie dans un instant.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <section id="don-libre" className="mt-5 scroll-mt-20 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#CAF000]">Don ponctuel</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">Don libre</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[#CFCFCB]">
        Donne ce que tu veux, quand tu veux, sans abonnement. Chaque don fait avancer l&apos;objectif.
      </p>

      {/* Objectif : la barre se remplit à chaque don */}
      {objectif ? (
        <div className="mt-4 rounded-2xl border border-[#CAF000]/25 bg-[#CAF000]/[0.06] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#A5A5A1]">{objectif.titre}</p>
            <p className="font-display text-sm font-extrabold text-[#CAF000]">{`${pct} %`}</p>
          </div>
          <p className="mt-1.5 font-display text-[26px] font-extrabold leading-none text-[#F3F3ED]">
            {euros(objectif.collecte)}
            <span className="text-base font-bold text-[#A5A5A1]">{` / ${euros(objectif.objectif)}`}</span>
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8FB300] to-[#CAF000] transition-[width] duration-700"
              style={{ width: `${Math.max(pct, objectif.collecte > 0 ? 3 : 0)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-[#A5A5A1]">
            {objectif.dons > 1 ? `${objectif.dons} dons reçus` : objectif.dons === 1 ? "1 don reçu" : "Sois le premier à donner"}
          </p>
        </div>
      ) : null}

      {merci ? (
        <div className="mt-4 py-2 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#CAF000] text-[#0A0B07]">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={2}>
              <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="mt-4 font-display text-2xl font-extrabold">Merci du fond du cœur</p>
          <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-[#CFCFCB]">
            {`Ton don de ${merci.prix} aide RHEMA à rester gratuite et à toucher encore plus de vies. Que Dieu te bénisse.`}
          </p>
          <button
            type="button"
            onClick={() => setMerci(null)}
            className="mt-4 rounded-2xl border border-[#CAF000]/50 px-4 py-2.5 text-sm font-semibold text-[#CAF000]"
          >
            Faire un autre don
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {offres.map((o) => {
              const actif = o.id === choix;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setChoix(o.id)}
                  disabled={enCours}
                  className={`rounded-2xl py-3.5 text-center font-display text-lg font-extrabold transition-colors active:scale-[0.98] ${
                    actif ? "bg-[#CAF000] text-[#0A0B07]" : "border border-white/10 bg-white/[0.04] text-[#F3F3ED]"
                  }`}
                >
                  {o.prix}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={valider}
            disabled={!offre || enCours}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#CAF000] py-4 font-display text-lg font-extrabold text-[#0A0B07] shadow-glow transition-transform active:scale-[0.99] disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {enCours ? "Un instant…" : offre ? `Donner ${offre.prix}` : "Donner"}
          </button>
          {erreur ? <p className="mt-3 text-center text-sm font-semibold text-amber-300">{erreur}</p> : null}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#A5A5A1]">
            {ios
              ? "Paiement unique avec ton compte Apple, sans abonnement ni renouvellement. Ton don soutient RHEMA et son ministère ; il ne débloque aucun contenu : tout reste gratuit pour tous."
              : "Paiement unique avec ton compte Google Play, sans abonnement ni renouvellement. Ton don soutient RHEMA et son ministère ; il ne débloque aucun contenu : tout reste gratuit pour tous."}
          </p>
        </>
      )}
    </section>
  );
}
