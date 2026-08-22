"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { APP_SCHEME, APP_STORE_URL, PLAY_STORE_URL } from "@/config/app-links";

/**
 * Page relais des partages : essaie d'ouvrir l'application directement sur
 * le contenu partagé (rhema://…). Si l'app ne s'ouvre pas (non installée),
 * bascule automatiquement vers l'App Store / le Play Store. Sur ordinateur,
 * propose simplement les liens.
 */
function LienInner() {
  const params = useSearchParams();
  const to = params.get("to") || "/";
  const [statut, setStatut] = useState<"essai" | "stores">("essai");

  const deepLink = `${APP_SCHEME}://${to.replace(/^\/+/, "")}`;

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    if (!isIOS && !isAndroid) {
      setStatut("stores");
      return;
    }

    // Tente d'ouvrir l'application ; si la page est toujours visible après
    // un court délai, l'app n'est pas installée → on ouvre le store.
    let annule = false;
    const cacheOuAnnule = () => {
      if (document.hidden) annule = true;
    };
    document.addEventListener("visibilitychange", cacheOuAnnule);
    window.addEventListener("pagehide", () => {
      annule = true;
    });

    window.location.href = deepLink;
    const t = setTimeout(() => {
      document.removeEventListener("visibilitychange", cacheOuAnnule);
      if (!annule && !document.hidden) {
        setStatut("stores");
        window.location.href = isIOS ? APP_STORE_URL : PLAY_STORE_URL;
      }
    }, 1800);
    return () => clearTimeout(t);
  }, [deepLink]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-night-950 px-6 text-center text-cream">
      <span className="text-xs font-bold uppercase tracking-[0.22em] text-dawn-400">RHEMA</span>
      <h1 className="mt-3 font-display text-2xl font-extrabold">
        {statut === "essai" ? "Ouverture de l'application…" : "Télécharge l'application"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-cream/70">
        {statut === "essai"
          ? "Si rien ne se passe, utilise les boutons ci-dessous."
          : "Retrouve ce contenu directement dans l'application RHEMA – Bible & Prière."}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <a
          href={deepLink}
          className="inline-flex rounded-full bg-dawn-400 px-6 py-3 text-sm font-bold text-night-950"
        >
          Ouvrir dans l&apos;application
        </a>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={APP_STORE_URL}
            className="inline-flex rounded-full border border-cream/25 px-5 py-2.5 text-sm font-semibold text-cream/85"
          >
            App Store (iPhone)
          </a>
          <a
            href={PLAY_STORE_URL}
            className="inline-flex rounded-full border border-cream/25 px-5 py-2.5 text-sm font-semibold text-cream/85"
          >
            Google Play (Android)
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LienPage() {
  return (
    <Suspense fallback={null}>
      <LienInner />
    </Suspense>
  );
}
