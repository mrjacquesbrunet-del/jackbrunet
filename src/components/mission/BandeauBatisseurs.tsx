"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/community/useAuth";
import {
  chargerOffresSoutien,
  estBatisseurActif,
  soutenir,
  soutienDispo,
  synchroniserBatisseur,
  type OffreSoutien,
} from "@/lib/soutien";

/** Une seule vérification de l'abonnement par lancement de l'app. */
let synchroFaite = false;
import { IconeBatisseur } from "@/components/community/BatisseurBadge";

/** Pages d'entrée des onglets où le bandeau apparaît (en bas du contenu). */
const ONGLETS = ["/devotionnel", "/communaute", "/plans", "/bible", "/profil", "/ecole", "/jeux", "/ecouter", "/a-propos"];
const CLE_PLUS_TARD = "jb.batisseurs.plustard";
const PAUSE_MS = 3 * 24 * 3600_000;

/**
 * Bandeau compact « Deviens Bâtisseur » en bas de chaque onglet : rappelle
 * le coût réel de l'app et propose les montants directement. Toucher un
 * montant ouvre tout de suite la feuille de paiement Apple / Google.
 * Uniquement dans l'app qui sait payer, jamais pour un Bâtisseur ;
 * la croix le masque 3 jours.
 */
export function BandeauBatisseurs() {
  const pathname = usePathname();
  const { userId, profile, refreshProfile } = useAuth();
  const [cible, setCible] = useState<HTMLElement | null>(null);
  const [masque, setMasque] = useState(true);
  const [offres, setOffres] = useState<OffreSoutien[]>([]);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [merci, setMerci] = useState(false);
  const [erreur, setErreur] = useState("");

  const chemin = (pathname || "/").replace(/\/+$/, "") || "/";
  const surOnglet = ONGLETS.includes(chemin);
  const batisseur = estBatisseurActif(profile as { batisseur_jusqu_au?: string | null } | null);

  // À l'ouverture : si l'abonnement est toujours actif chez Apple / Google,
  // prolonge le statut Bâtisseur (badge, invitations au Zoom).
  useEffect(() => {
    if (!userId || synchroFaite || !soutienDispo()) return;
    synchroFaite = true;
    synchroniserBatisseur(userId).then((ok) => {
      if (ok) refreshProfile();
    });
  }, [userId, refreshProfile]);

  useEffect(() => {
    let pause = false;
    try {
      pause = Date.now() - Number(localStorage.getItem(CLE_PLUS_TARD) || 0) < PAUSE_MS;
    } catch {
      /* stockage indisponible */
    }
    setMasque(pause || !soutienDispo());
    setCible(document.querySelector("main"));
  }, [chemin]);

  useEffect(() => {
    if (soutienDispo()) chargerOffresSoutien().then(setOffres);
  }, []);

  if (masque || !surOnglet || !cible || !offres.length || (batisseur && !merci)) return null;

  function plusTard() {
    try {
      localStorage.setItem(CLE_PLUS_TARD, String(Date.now()));
    } catch {
      /* ignore */
    }
    setMasque(true);
  }

  async function choisir(o: OffreSoutien) {
    setErreur("");
    setEnCours(o.id);
    try {
      if ((await soutenir(o, userId)) === "ok") {
        setMerci(true);
        setTimeout(() => {
          synchroniserBatisseur(userId).finally(() => refreshProfile());
        }, 1500);
      }
    } catch {
      setErreur("Le paiement n'a pas abouti. Réessaie.");
    } finally {
      setEnCours(null);
    }
  }

  return createPortal(
    <aside className="mx-auto mt-6 max-w-lg px-4 pb-2">
      <div className="relative rounded-2xl border border-[#CAF000]/35 bg-[#0A0B07] p-4 text-[#F3F3ED]">
        {merci ? (
          <p className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#CAF000] text-[#0A0B07]">
              <IconeBatisseur className="h-4 w-4" />
            </span>
            Merci du fond du cœur ! {userId ? "Te voilà Bâtisseur." : "Que Dieu te bénisse."}
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={plusTard}
              aria-label="Masquer"
              className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full text-[#A5A5A1] hover:text-[#F3F3ED]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2.5 pr-7">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#CAF000] text-[#0A0B07]">
                <IconeBatisseur className="h-4 w-4" />
              </span>
              <p className="font-display text-base font-extrabold leading-tight">Deviens Bâtisseur : partenaire mensuel</p>
            </div>
            <p className="mt-2 text-[13px] leading-snug text-[#CFCFCB]">
              Créer et faire vivre une app comme RHEMA coûte environ 20&nbsp;000&nbsp;€. Elle reste gratuite pour
              tous grâce à la générosité de chacun. Ton soutien t&apos;offre le{" "}
              <b className="text-[#CAF000]">badge Bâtisseur</b> et le <b className="text-[#CAF000]">Zoom mensuel</b> avec
              Pasteur Jack.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {offres.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => choisir(o)}
                  disabled={!!enCours}
                  className="rounded-xl bg-[#CAF000] px-1 py-2.5 text-center font-display text-[13px] font-extrabold text-[#0A0B07] active:scale-[0.97] disabled:opacity-60"
                >
                  {enCours === o.id ? "…" : o.prix}
                  <span className="block text-[10px] font-bold opacity-70">/mois</span>
                </button>
              ))}
            </div>
            {erreur ? <p className="mt-2 text-center text-xs font-semibold text-amber-300">{erreur}</p> : null}
            <p className="mt-2 text-center text-[11px] text-[#A5A5A1]">
              Sans engagement, résiliable à tout moment.{!userId ? " Connecte-toi pour recevoir ton badge." : ""}
            </p>
          </>
        )}
      </div>
    </aside>,
    cible,
  );
}
