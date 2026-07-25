"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isNativeApp } from "@/lib/notifications";
import { asset } from "@/lib/asset";
import { consumeStashedNotifRoute } from "@/lib/notif-route";

/**
 * Sur l'accueil marketing « / », en mode application (natif ou aperçu ?app=1),
 * on ouvre « Mon temps avec Jésus » (/devotionnel) — ou le contenu d'une
 * notification tapée — au lieu de l'accueil marketing, qui ne doit pas être
 * visible dans l'app.
 *
 * Fiabilité avant tout : on privilégie la navigation DOUCE (routeur Next, qui
 * reste dans le bundle déjà chargé, sans rechargement de la WebView ni risque
 * de page blanche), puis une navigation dure en filet. Surtout, le voile olive
 * NE PIÈGE JAMAIS l'utilisateur : il propose un lien tapable et se retire tout
 * seul au bout de quelques secondes. Sur le web classique : sans effet.
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

    const bare = dest.split("?")[0].replace(/\/+$/, "") || "/devotionnel";
    const atTarget = () =>
      "/" + window.location.pathname.replace(/^\/+|\/+$/g, "") === bare;

    // 1) Navigation douce immédiate (la plus fiable dans la WebView).
    try {
      router.replace(dest);
    } catch {
      /* routeur indisponible */
    }

    // 2) Filet : si on est toujours à l'accueil peu après, navigation dure.
    const tHard = setTimeout(() => {
      try {
        if (!atTarget()) window.location.replace(asset(dest));
      } catch {
        /* ignore */
      }
    }, 700);

    // 3) Propose un lien tapable si ça traîne (l'utilisateur n'est jamais coincé).
    const tLink = setTimeout(() => setShowLink(true), 1500);

    // 4) Sécurité anti-blocage : on retire le voile quoi qu'il arrive.
    const tOff = setTimeout(() => setVeil(false), 3500);

    return () => {
      clearTimeout(tHard);
      clearTimeout(tLink);
      clearTimeout(tOff);
    };
  }, [router]);

  if (!veil) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 px-8 text-center"
      style={{ background: "#14160E" }}
    >
      <p className="font-display text-xl font-bold text-dawn-400">Jack Brunet</p>
      <span
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-dawn-400/30 border-t-dawn-400"
      />
      {showLink ? (
        <a
          href={asset(target)}
          className="rounded-full bg-dawn-400 px-6 py-3 text-sm font-bold text-night-950"
        >
          Ouvrir « Mon temps avec Jésus »
        </a>
      ) : null}
    </div>
  );
}
