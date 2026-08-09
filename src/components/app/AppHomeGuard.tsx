"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isNativeApp } from "@/lib/notifications";
import { consumeStashedNotifRoute } from "@/lib/notif-route";
import { trace } from "@/lib/boot-trace";

/**
 * Sur l'accueil marketing « / », en mode application (natif ou aperçu ?app=1),
 * on ouvre « Mon temps avec Jésus » (/devotionnel) — ou le contenu d'une
 * notification tapée — au lieu de l'accueil marketing.
 *
 * On utilise UNIQUEMENT la navigation douce du routeur Next (elle reste dans le
 * bundle déjà chargé et fonctionne comme le reste de l'app). On n'utilise PAS
 * de navigation dure vers « /devotionnel/ » : dans la WebView iOS, un chemin de
 * dossier ne se résout pas toujours en index.html → écran olive vide. Le voile
 * ne piège jamais l'utilisateur : lien tapable + retrait automatique.
 */
export function AppHomeGuard() {
  const router = useRouter();
  const [veil, setVeil] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [target, setTarget] = useState("/devotionnel/");

  useEffect(() => {
    let preview = false;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("app") === "1") sessionStorage.setItem("jb.appPreview", "1");
      preview =
        sessionStorage.getItem("jb.appPreview") === "1" || params.get("app") === "1";
    } catch {
      /* ignore */
    }
    if (!(isNativeApp() || preview)) return;

    // Cible : le contenu d'une notification mémorisée, sinon le dévotionnel.
    const dest = consumeStashedNotifRoute() || "/devotionnel/";
    setTarget(dest);
    setVeil(true);
    trace("garde:accueil", dest);

    // Navigation douce (fiable dans la WebView). On réessaie une fois peu après
    // au cas où le routeur n'était pas prêt au tout premier rendu.
    const soft = () => {
      try {
        router.replace(dest);
        trace("garde:router.replace", dest);
      } catch {
        trace("garde:router-erreur");
      }
    };
    soft();
    const tRetry = setTimeout(soft, 600);

    // Lien tapable si ça traîne, puis retrait du voile : jamais coincé.
    const tLink = setTimeout(() => setShowLink(true), 1500);
    const tOff = setTimeout(() => setVeil(false), 3500);

    return () => {
      clearTimeout(tRetry);
      clearTimeout(tLink);
      clearTimeout(tOff);
    };
  }, [router]);

  if (!veil) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 px-8 text-center"
      style={{ background: "rgb(var(--n-950))" }}
    >
      <p className="font-sans text-xl font-extrabold tracking-[0.25em] text-cream">RHEMA</p>
      <span
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-dawn-400/30 border-t-dawn-400"
      />
      {showLink ? (
        <button
          type="button"
          onClick={() => {
            try {
              router.replace(target);
            } catch {
              /* ignore */
            }
            setVeil(false);
          }}
          className="rounded-full bg-dawn-400 px-6 py-3 text-sm font-bold text-night-950"
        >
          Ouvrir « Mon temps avec Jésus »
        </button>
      ) : null}
    </div>
  );
}
