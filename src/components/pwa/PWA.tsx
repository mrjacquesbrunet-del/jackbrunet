"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "jb.pwa.dismissed";

/**
 * Enregistre le service worker (mode hors-ligne / installable) et propose, de
 * façon discrète, l'installation de l'application sur l'écran d'accueil.
 */
export function PWA() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [hidden, setHidden] = useState(true);

  // 1) Service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register(asset("/sw.js")).catch(() => undefined);
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // 2) Invite d'installation
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return; // déjà installée
    if (localStorage.getItem(DISMISS_KEY)) return; // déjà refusée

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS ne déclenche pas beforeinstallprompt : on affiche une aide.
    const ua = window.navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    if (isIOS) {
      setShowIOS(true);
      setHidden(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  if (hidden || (!deferred && !showIOS)) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md">
      <div className="glass-strong flex items-center gap-3 rounded-2xl p-3.5 shadow-card">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-dawn-400/15 text-xl">
          📲
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold leading-tight">
            Installe l'application
          </p>
          {showIOS ? (
            <p className="mt-0.5 text-xs text-night-900/60">
              Appuie sur <span className="font-semibold">Partager</span> puis{" "}
              <span className="font-semibold">« Sur l'écran d'accueil »</span>.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-night-900/60">
              Accès direct à la pensée du jour, même hors connexion.
            </p>
          )}
        </div>
        {deferred ? (
          <button type="button" onClick={install} className="btn-primary shrink-0 text-sm">
            Installer
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="shrink-0 px-1.5 text-night-900/40 transition-colors hover:text-night-900/70"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
