"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";

/** Annonce de la Formation biblique : le visuel fourni par Jack, affiché
 * une fois par appareil, pendant la semaine de lancement seulement.
 * v2 : visuel définitif (remplace le repli dessiné de la v1). */
const SEEN_KEY = "jb.news.formation.v2";
/** Fin de la campagne : après cette date, le pop-up ne s'affiche plus. */
const FIN_CAMPAGNE = new Date("2026-10-12T00:00:00");

/** Vrai si l'annonce doit encore s'afficher (pour céder la priorité). */
export function formationNewsPending(): boolean {
  if (new Date() >= FIN_CAMPAGNE) return false;
  try {
    return !localStorage.getItem(SEEN_KEY);
  } catch {
    return false;
  }
}

export function FormationNewsModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(false);

  useEffect(() => {
    if (!formationNewsPending()) return;
    // L'affiche n'apparaît qu'une fois le visuel réellement chargé.
    const img = new Image();
    let t: ReturnType<typeof setTimeout> | null = null;
    img.onload = () => {
      setImgOk(true);
      t = setTimeout(() => setOpen(true), 1200);
    };
    img.src = asset("/img/annonce-formation.jpg");
    return () => {
      if (t) clearTimeout(t);
    };
  }, []);

  const close = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open || !imgOk) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={close} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-[1.8rem] shadow-[0_0_44px_rgba(202,240,0,0.15),0_24px_60px_rgba(0,0,0,0.65)]"
        style={{ animation: "fm-in .35s cubic-bezier(.2,.8,.2,1)", maxHeight: "calc(100vh - 2rem)" }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: "@keyframes fm-in{0%{transform:translateY(28px);opacity:0}100%{transform:translateY(0);opacity:1}}",
          }}
        />

        {/* L'affiche entière mène à la formation (son bouton « Découvrir la
         * formation » est dessiné dans le visuel). */}
        <button
          type="button"
          onClick={() => {
            close();
            router.push("/ecole/fondamentaux/");
          }}
          aria-label="Accéder à la formation"
          className="block w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/img/annonce-formation.jpg")}
            alt="La formation biblique arrive sur RHEMA"
            className="block w-full object-contain"
            style={{ maxHeight: "calc(100vh - 2rem)" }}
          />
        </button>

        {/* Croix de fermeture incrustée */}
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={2.2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
