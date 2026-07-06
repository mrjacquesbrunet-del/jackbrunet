"use client";

import { useEffect, useState } from "react";
import { isNativeApp, readReminder, enableDailyReminder } from "@/lib/notifications";
import { getOpens } from "@/lib/usage";

const KEY = "jb.notifoptin.v1";

/**
 * Proposition (une fois) d'activer un rappel quotidien à 8h30, si l'utilisateur
 * n'en a pas encore configuré. Application native uniquement. S'affiche après
 * quelques ouvertures pour ne pas déranger au tout premier lancement.
 */
export function NotifOptIn() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isNativeApp()) return;
    try {
      if (localStorage.getItem(KEY)) return; // déjà décidé
      if (readReminder().enabled) return; // rappel déjà actif
      if (getOpens() < 2) return; // pas au tout premier lancement
    } catch {
      return;
    }
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function remember() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function activate() {
    setBusy(true);
    const ok = await enableDailyReminder(8, 30);
    setBusy(false);
    remember();
    if (ok) {
      setMsg("C'est activé. Rendez-vous chaque matin à 8h30.");
      setTimeout(() => setShow(false), 1700);
    } else {
      setMsg("Notifications refusées. Tu peux les autoriser dans les réglages du téléphone.");
      setTimeout(() => setShow(false), 2600);
    }
  }

  function later() {
    remember();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="dark-ctx fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={later}
        className="absolute inset-0 bg-night-950/70 backdrop-blur-sm"
      />
      <div className="bg-topo-dark relative z-10 w-full max-w-md rounded-t-3xl border border-white/10 p-6 text-center text-cream shadow-2xl sm:rounded-3xl">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-dawn-400/15 text-dawn-300">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.7}>
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2 className="mt-4 font-display text-2xl font-extrabold">
          Ta pensée du jour, <span className="text-gradient">chaque matin</span>
        </h2>
        <p className="mt-2 text-cream/75">
          On t'envoie un petit rappel chaque jour à 8h30 pour ton temps avec Dieu. Tu pourras
          changer l'heure quand tu veux.
        </p>

        {msg? (
          <p className="mt-5 rounded-2xl bg-dawn-400/10 px-4 py-3 text-sm font-semibold text-dawn-200">
            {msg}
          </p>
        ): (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={activate}
              disabled={busy}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {busy? "Activation…": "Activer le rappel"}
            </button>
            <button
              type="button"
              onClick={later}
              className="w-full text-center text-sm text-cream/55 underline-offset-4 hover:underline"
            >
              Plus tard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
