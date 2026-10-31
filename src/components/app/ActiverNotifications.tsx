"use client";

import { useEffect, useState } from "react";
import { etatPermissionPush, requestPushPermission, type EtatPush } from "@/lib/onesignal";

const CLE_BANDEAU = "jb.push.bandeau-ferme";

/**
 * Autoriser les notifications push sur ce téléphone (messages, commentaires,
 * réponses, abonnés…). Deux formes :
 *  - « reglages » : état + bouton, dans Paramètres ;
 *  - « bandeau » : rappel discret (Messages), refermable 30 jours.
 * Rien sur le web, ni quand c'est déjà autorisé.
 */
export function ActiverNotifications({ variante }: { variante: "reglages" | "bandeau" }) {
  const [etat, setEtat] = useState<EtatPush>("indisponible");
  const [masque, setMasque] = useState(true);

  useEffect(() => {
    etatPermissionPush().then(setEtat);
    if (variante === "bandeau") {
      try {
        setMasque(Date.now() < Number(localStorage.getItem(CLE_BANDEAU) || 0));
      } catch {
        setMasque(false);
      }
    }
  }, [variante]);

  async function activer() {
    await requestPushPermission();
    setEtat(await etatPermissionPush());
  }

  if (etat === "indisponible") return null;

  if (variante === "bandeau") {
    if (etat === "accordee" || masque) return null;
    return (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-spirit-600/25 bg-spirit-500/[0.08] p-3.5">
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-none stroke-current text-spirit-700" strokeWidth={1.8} aria-hidden>
          <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0" strokeLinejoin="round" />
        </svg>
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-night-900/80">
          {etat === "refusee"
            ? "Les notifications sont coupées. Pour savoir quand on t'écrit : Réglages du téléphone → RHEMA → Notifications."
            : "Sois prévenu(e) sur ton téléphone quand on t'écrit ou te répond."}
        </p>
        {etat === "a-demander" ? (
          <button type="button" onClick={() => void activer()} className="shrink-0 rounded-full bg-night-900 px-3.5 py-2 text-[13px] font-bold text-cream">
            Activer
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => {
            setMasque(true);
            try {
              localStorage.setItem(CLE_BANDEAU, String(Date.now() + 30 * 86_400_000));
            } catch {
              /* ignore */
            }
          }}
          className="grid h-8 w-8 shrink-0 place-items-center text-night-900/40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${etat === "accordee" ? "bg-emerald-400" : "bg-red-400"}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{etat === "accordee" ? "Notifications activées sur ce téléphone" : "Notifications coupées sur ce téléphone"}</p>
        <p className="text-[11px] text-cream/50">
          {etat === "accordee"
            ? "Tu reçois les messages, commentaires et réponses comme sur un réseau social."
            : etat === "refusee"
              ? "Pour les réactiver : Réglages du téléphone → RHEMA → Notifications."
              : "Active-les pour être prévenu(e) des messages, commentaires et réponses."}
        </p>
      </div>
      {etat === "a-demander" ? (
        <button type="button" onClick={() => void activer()} className="shrink-0 rounded-full bg-dawn-400 px-4 py-2 text-[13px] font-extrabold text-night-950">
          Activer
        </button>
      ) : null}
    </div>
  );
}
