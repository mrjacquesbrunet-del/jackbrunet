"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Capacitor } from "@capacitor/core";
import { openExternal } from "@/lib/external";
import { useAuth } from "@/components/community/useAuth";
import { BatisseurBadge } from "@/components/community/BatisseurBadge";
import {
  chargerOffresSoutien,
  estBatisseurActif,
  gererAbonnement,
  restaurerAbonnement,
  soutenir,
  soutienDispo,
  synchroniserBatisseur,
  type OffreSoutien,
} from "@/lib/soutien";

/** Conditions d'utilisation standard d'Apple (exigées pour un abonnement). */
const EULA_APPLE = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

/**
 * Bloc « Bâtisseurs » de l'onglet Soutien (app installée uniquement) :
 * 4 abonnements mensuels, payés par la feuille Apple / Google (Face ID…),
 * résiliables à tout moment. Mentions exigées par Apple : prix par mois,
 * renouvellement automatique, résiliation, conditions et confidentialité.
 * Masqué sur le web, et tant que les produits n'existent pas dans les stores.
 */
export function SoutienEnUnClic() {
  const { userId, profile, refreshProfile } = useAuth();
  const [restaure, setRestaure] = useState("");
  const [offres, setOffres] = useState<OffreSoutien[]>([]);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [merci, setMerci] = useState<OffreSoutien | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (!soutienDispo()) return;
    chargerOffresSoutien().then(setOffres);
  }, []);

  if (!offres.length) return null;

  const ios = Capacitor.getPlatform() === "ios";
  const compte = ios ? "ton compte Apple" : "ton compte Google Play";
  const actif = estBatisseurActif(profile as { batisseur_jusqu_au?: string | null } | null);

  async function restaurer() {
    setRestaure("Vérification…");
    const ok = await restaurerAbonnement(userId);
    if (ok) refreshProfile();
    setRestaure(ok ? "Abonnement retrouvé : merci, Bâtisseur !" : "Aucun abonnement actif trouvé sur ce compte.");
  }

  async function choisir(o: OffreSoutien) {
    setErreur("");
    setEnCours(o.id);
    try {
      const r = await soutenir(o, userId);
      if (r === "ok") {
        setMerci(o);
        // Laisse le temps au trigger Supabase de poser le badge, puis recharge.
        setTimeout(() => {
          synchroniserBatisseur(userId).finally(() => refreshProfile());
        }, 1500);
      }
    } catch {
      setErreur("Le paiement n'a pas abouti. Réessaie dans un instant.");
    } finally {
      setEnCours(null);
    }
  }

  return (
    <section id="soutien" className="mt-5 scroll-mt-20 rounded-3xl border border-[#CAF000]/30 bg-[#CAF000]/[0.06] p-5">
      {merci ? (
        <div className="py-2 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#CAF000] text-[#0A0B07]">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={2}>
              <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="mt-4 font-display text-2xl font-extrabold">Merci du fond du cœur</p>
          <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-[#CFCFCB]">
            Ton soutien de {merci.prix} par mois aide RHEMA à rester gratuite et à toucher encore plus de
            vies. Que Dieu te bénisse.
          </p>
          {userId ? (
            <div className="mx-auto mt-4 max-w-xs rounded-2xl border border-[#CAF000]/30 p-3">
              <BatisseurBadge />
              <p className="mt-2 text-sm text-[#CFCFCB]">
                Te voilà Bâtisseur ! Ton badge apparaît sur ton profil, et tu recevras chaque mois
                l&apos;invitation au Zoom avec Pasteur Jack.
              </p>
            </div>
          ) : null}
        </div>
      ) : actif ? (
        <div className="py-1 text-center">
          <BatisseurBadge />
          <p className="mt-3 font-display text-2xl font-extrabold">Merci, tu es Bâtisseur</p>
          <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-[#CFCFCB]">
            Ton soutien mensuel fait vivre RHEMA. Tu recevras chaque mois l&apos;invitation au Zoom avec
            Pasteur Jack.
          </p>
          <button
            type="button"
            onClick={() => gererAbonnement()}
            className="mt-4 rounded-2xl border border-[#CAF000]/50 px-4 py-2.5 text-sm font-semibold text-[#CAF000]"
          >
            Gérer mon abonnement
          </button>
        </div>
      ) : (
        <>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#CAF000]">Partenaire mensuel</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">Deviens Bâtisseur de RHEMA</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#CFCFCB]">
            Chaque mois, ton soutien fait vivre la mission : RHEMA reste gratuite pour tous, la Parole
            avance dans les nations, et les missions sur le terrain continuent.
          </p>
          <blockquote className="mt-3 rounded-2xl border-l-4 border-[#CAF000] bg-white/[0.04] py-2.5 pl-3.5 pr-3">
            <p className="text-[14px] italic leading-relaxed text-[#F3F3ED]">
              « Pour moi, c&apos;est important de proposer ces ressources gratuites et accessibles à tout le
              monde. Mais cela dépend aussi de la générosité de chacun d&apos;entre nous. »
            </p>
            <cite className="mt-1 block text-xs font-bold not-italic text-[#CAF000]">Pasteur Jack Brunet</cite>
          </blockquote>
          <ul className="mt-3 space-y-1.5 text-sm text-[#F3F3ED]">
            <li className="flex items-center gap-2">
              <BatisseurBadge compact /> Le badge exclusif Bâtisseur sur ton profil
            </li>
            <li className="flex items-center gap-2">
              <BatisseurBadge compact /> Le Zoom mensuel en direct avec Pasteur Jack
            </li>
            <li className="flex items-center gap-2">
              <BatisseurBadge compact /> Sans engagement : tu arrêtes quand tu veux
            </li>
          </ul>

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
                <span className="block text-xs font-bold text-[#CAF000]">par mois</span>
                <span className="mt-0.5 block text-xs font-semibold text-[#A5A5A1]">{o.libelle}</span>
              </button>
            ))}
          </div>

          {erreur ? <p className="mt-3 text-center text-sm font-semibold text-amber-300">{erreur}</p> : null}
          {!userId ? (
            <p className="mt-3 text-center text-xs font-semibold text-[#CAF000]">
              Connecte-toi d&apos;abord (onglet Profil) pour recevoir ton badge et l&apos;invitation au Zoom.
            </p>
          ) : null}

          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#A5A5A1]">
            Abonnement mensuel, payé avec {compte} et renouvelé automatiquement chaque mois, sauf résiliation au
            moins 24 h avant la fin de la période en cours. Tu peux le gérer ou le résilier à tout moment dans
            les réglages de {compte}. Tout le contenu de l&apos;app reste gratuit pour tous.
          </p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#CFCFCB]">
            <button type="button" onClick={restaurer} className="underline">
              Restaurer mon abonnement
            </button>
            {ios ? (
              <button type="button" onClick={() => openExternal(EULA_APPLE)} className="underline">
                Conditions d&apos;utilisation
              </button>
            ) : (
              <Link href="/cgv" className="underline">
                Conditions d&apos;utilisation
              </Link>
            )}
            <Link href="/confidentialite" className="underline">
              Confidentialité
            </Link>
          </p>
          {restaure ? <p className="mt-2 text-center text-xs font-semibold text-[#CAF000]">{restaure}</p> : null}
        </>
      )}
    </section>
  );
}
