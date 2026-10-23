"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isNativeApp } from "@/lib/notifications";
import { consumeStashedNotifRoute } from "@/lib/notif-route";
import { trace } from "@/lib/boot-trace";
import { asset } from "@/lib/asset";

/**
 * Sur l'accueil marketing « / », en mode application (natif ou aperçu ?app=1),
 * on ouvre « Mon temps avec Jésus » (/devotionnel) — ou le contenu d'une
 * notification tapée — au lieu de l'accueil marketing.
 *
 * On utilise UNIQUEMENT la navigation douce du routeur Next (elle reste dans le
 * bundle déjà chargé et fonctionne comme le reste de l'app). On n'utilise PAS
 * de navigation dure vers « /devotionnel/ » : dans la WebView iOS, un chemin de
 * dossier ne se résout pas toujours en index.html → écran olive vide. Le voile
 * ne piège jamais l'utilisateur : lien tapable, et navigation relancée.
 */
export function AppHomeGuard() {
  const router = useRouter();
  const [veil, setVeil] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [sousIntro, setSousIntro] = useState(false);
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
    const stash = consumeStashedNotifRoute();
    const dest = stash && stash.replace(/[?#].*$/, "").replace(/\/+$/, "") ? stash : "/devotionnel/";
    setTarget(dest);
    // Le voile reste tant qu'on est sur « / » : l'accueil du site n'apparaît
    // jamais dans l'app (il est aussi masqué en CSS, .accueil-site). Au premier
    // lancement, il passe SOUS l'introduction (AppOnboarding) au lieu de la couvrir.
    setSousIntro(document.documentElement.classList.contains("accueil-attente"));
    setVeil(true);
    trace("garde:accueil", dest);

    // Navigation douce (fiable dans la WebView), relancée tant que le routeur
    // ne nous a pas emmenés ailleurs (il peut ne pas être prêt au 1er rendu).
    const soft = () => {
      try {
        router.replace(dest);
        trace("garde:router.replace", dest);
      } catch {
        trace("garde:router-erreur");
      }
    };
    soft();
    const tRetry = setInterval(soft, 1200);
    // Lien tapable si ça traîne : jamais coincé.
    const tLink = setTimeout(() => setShowLink(true), 1500);

    return () => {
      clearInterval(tRetry);
      clearTimeout(tLink);
    };
  }, [router]);

  if (!veil) return null;

  return (
    <div
      className={`fixed inset-0 ${sousIntro ? "z-[90]" : "z-[9999]"} flex flex-col items-center justify-center gap-6 px-8 text-center`}
      /* Gris de la charte codé en dur : fiable dès la première image,
         avant même que le thème de l'app soit appliqué (plus d'olive). */
      style={{ background: "#171716" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/img/logo-rhema.webp")}
        alt=""
        aria-hidden
        className="h-28 w-auto"
      />
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
          }}
          className="rounded-full bg-dawn-400 px-6 py-3 text-sm font-bold text-night-950"
        >
          Ouvrir « Mon temps avec Jésus »
        </button>
      ) : null}
    </div>
  );
}
