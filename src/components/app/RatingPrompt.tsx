"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/notifications";
import { getOpens } from "@/lib/usage";

const KEY = "jb.rated.v1";

/**
 * Demande de note (une fois) après quelques utilisations. On propose d'abord un
 * message doux; si l'utilisateur accepte, on ouvre la fenêtre de notation native
 * du store (App Store / Play Store) via le plugin in-app review.
 * Application native uniquement.
 */
export function RatingPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;
    try {
      if (localStorage.getItem(KEY)) return; // déjà proposé
      if (getOpens() < 4) return; // seulement après quelques utilisations
    } catch {
      return;
    }
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function remember() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function rate() {
    remember();
    setShow(false);
    try {
      const { InAppReview } = await import("@capacitor-community/in-app-review");
      await InAppReview.requestReview();
    } catch {
      /* indisponible — on ne bloque pas */
    }
  }

  function later() {
    remember();
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
          Tu aimes l'application ?
        </h2>
        <p className="mt-2 text-night-900/65">
          Ton avis nous aide énormément et permet à d'autres de découvrir ce temps avec Dieu.
          Merci du fond du cœur.
        </p>
        <div className="mt-6 space-y-3">
          <button type="button" onClick={rate} className="btn-primary w-full justify-center">
            Noter l'application
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
