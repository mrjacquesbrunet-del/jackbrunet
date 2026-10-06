"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/components/community/useAuth";
import { chargerOffresSoutien, soutenir, soutienDispo, type OffreSoutien } from "@/lib/soutien";

/**
 * Bloc « Soutien en un clic » de l'onglet Soutien (app installée uniquement) :
 * 4 montants, payés par la feuille Apple / Google (Face ID, empreinte…).
 * Masqué sur le web, et tant que les produits n'existent pas dans les stores.
 */
export function SoutienEnUnClic() {
  const { userId } = useAuth();
  const [offres, setOffres] = useState<OffreSoutien[]>([]);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [merci, setMerci] = useState<OffreSoutien | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (!soutienDispo()) return;
    chargerOffresSoutien().then(setOffres);
  }, []);

  if (!offres.length) return null;

  const store = Capacitor.getPlatform() === "ios" ? "l'App Store" : "Google Play";

  async function choisir(o: OffreSoutien) {
    setErreur("");
    setEnCours(o.id);
    try {
      const r = await soutenir(o, userId);
      if (r === "ok") setMerci(o);
    } catch {
      setErreur("Le paiement n'a pas abouti. Réessaie dans un instant.");
    } finally {
      setEnCours(null);
    }
  }

  return (
    <section className="mt-5 rounded-3xl border border-[#CAF000]/30 bg-[#CAF000]/[0.06] p-5">
      {merci ? (
        <div className="py-2 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#CAF000] text-[#0A0B07]">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={2}>
              <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="mt-4 font-display text-2xl font-extrabold">Merci du fond du cœur</p>
          <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-[#CFCFCB]">
            Ton soutien de {merci.prix} aide RHEMA à rester gratuite et à toucher encore plus de vies.
            Que Dieu te bénisse.
          </p>
          <button
            type="button"
            onClick={() => setMerci(null)}
            className="mt-4 text-sm font-semibold text-[#CAF000] hover:underline"
          >
            Soutenir à nouveau
          </button>
        </div>
      ) : (
        <>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#CAF000]">Soutien en un clic</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">Soutiens RHEMA</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#CFCFCB]">
            L&apos;application est gratuite et le restera. Si elle te fait du bien, tu peux aider à la faire
            vivre et grandir, en un geste.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {offres.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => choisir(o)}
                disabled={!!enCours}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center transition-colors hover:border-[#CAF000]/60 active:scale-[0.98] disabled:opacity-60"
              >
                <span className="block font-display text-2xl font-extrabold text-[#F3F3ED]">
                  {enCours === o.id ? "…" : o.prix}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-[#A5A5A1]">{o.libelle}</span>
              </button>
            ))}
          </div>

          {erreur ? <p className="mt-3 text-center text-sm font-semibold text-amber-300">{erreur}</p> : null}

          <p className="mt-3 text-center text-xs leading-relaxed text-[#A5A5A1]">
            Paiement unique et sécurisé par {store}. Aucun abonnement. Ce soutien ne débloque aucun contenu :
            tout reste gratuit pour tous.
          </p>
        </>
      )}
    </section>
  );
}
