"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/notifications";
import { getOpens } from "@/lib/usage";

const DONE = "jb.rated.v1"; // « done » = a ouvert la notation → on ne redemande plus
const ASKS = "jb.rateasks.v1"; // { n, last } : nombre de demandes + date de la dernière

const MAX_ASKS = 3;
const COOLDOWN_MS = 14 * 86_400_000; // 14 jours entre deux demandes

type Asks = { n: number; last: number };

function readAsks(): Asks {
  try {
    // Migration depuis l'ancienne version : « 1 » signifiait « déjà proposé »
    // (même sur « Plus tard ») → on le compte comme UNE demande passée.
    const legacy = localStorage.getItem(DONE);
    if (legacy === "1") {
      localStorage.removeItem(DONE);
      const migrated: Asks = { n: 1, last: Date.now() };
      localStorage.setItem(ASKS, JSON.stringify(migrated));
      return migrated;
    }
    const raw = localStorage.getItem(ASKS);
    if (!raw) return { n: 0, last: 0 };
    return { n: 0, last: 0, ...(JSON.parse(raw) as Partial<Asks>) };
  } catch {
    return { n: 0, last: 0 };
  }
}

function eligible(): boolean {
  try {
    if (localStorage.getItem(DONE) === "done") return false;
    const a = readAsks();
    if (a.n >= MAX_ASKS) return false;
    if (Date.now() - a.last < COOLDOWN_MS) return false;
    return true;
  } catch {
    return false;
  }
}

function bumpAsks() {
  try {
    const a = readAsks();
    localStorage.setItem(ASKS, JSON.stringify({ n: a.n + 1, last: Date.now() }));
  } catch {
    /* ignore */
  }
}

/**
 * Demande de note, au BON moment :
 *  - après quelques utilisations (comme avant) ;
 *  - et surtout aux « moments de joie » (palier de série atteint, prière
 *    marquée exaucée) via l'événement `jb:joy` — c'est là qu'on a le plus
 *    envie de dire merci.
 * Jamais harcelant : 3 demandes maximum, espacées d'au moins 14 jours, et
 * plus aucune dès que la fenêtre de notation a été ouverte.
 */
export function RatingPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (getOpens() >= 4 && eligible()) {
      t = setTimeout(() => setShow(true), 1500);
    }
    // Moment de joie (série, prière exaucée) → moment idéal pour demander.
    const onJoy = () => {
      if (eligible()) {
        clearTimeout(t);
        t = setTimeout(() => setShow(true), 800);
      }
    };
    window.addEventListener("jb:joy", onJoy);
    return () => {
      clearTimeout(t);
      window.removeEventListener("jb:joy", onJoy);
    };
  }, []);

  async function rate() {
    try {
      localStorage.setItem(DONE, "done");
    } catch {
      /* ignore */
    }
    setShow(false);
    try {
      const { InAppReview } = await import("@capacitor-community/in-app-review");
      await InAppReview.requestReview();
    } catch {
      /* indisponible — on ne bloque pas */
    }
  }

  function later() {
    bumpAsks();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={later}
        className="absolute inset-0 bg-night-950/60 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 text-center shadow-2xl sm:rounded-3xl">
        <div className="flex justify-center gap-1 text-dawn-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
              <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z" />
            </svg>
          ))}
        </div>
        <h2 className="mt-4 font-display text-2xl font-extrabold text-night-900">
          Tu aimes l&apos;application ?
        </h2>
        <p className="mt-2 text-night-900/65">
          Ta note aide d&apos;autres personnes à découvrir ce temps avec Dieu. Ça prend 10
          secondes, et ça compte énormément. Merci du fond du cœur.
        </p>
        <div className="mt-6 space-y-3">
          <button type="button" onClick={rate} className="btn-primary w-full justify-center">
            Noter l&apos;application
          </button>
          <button
            type="button"
            onClick={later}
            className="w-full text-center text-sm text-night-900/45 underline-offset-4 hover:underline"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
