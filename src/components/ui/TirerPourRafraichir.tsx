"use client";

import { useEffect, useRef, useState } from "react";

/**
 * « Tirer vers le bas pour rafraîchir », comme Instagram : en haut de la
 * page, on tire du doigt, une pastille descend et tourne, on lâche → la page
 * recharge ses données. Rien à l'écran tant qu'on ne tire pas.
 */
const SEUIL = 70;

export function TirerPourRafraichir({ onRefresh, sombre = false }: { onRefresh: () => Promise<unknown> | void; sombre?: boolean }) {
  const [tire, setTire] = useState(0);
  const [charge, setCharge] = useState(false);
  const rappel = useRef(onRefresh);
  rappel.current = onRefresh;

  useEffect(() => {
    let y0: number | null = null;
    let distance = 0;
    let enCours = false;
    const debut = (e: TouchEvent) => {
      // Seulement tout en haut, et pas depuis une fenêtre ouverte par-dessus.
      if (enCours || window.scrollY > 2 || (e.target as HTMLElement | null)?.closest?.('[aria-modal="true"]')) {
        y0 = null;
        return;
      }
      y0 = e.touches[0].clientY;
      distance = 0;
    };
    const bouge = (e: TouchEvent) => {
      if (y0 == null) return;
      const d = e.touches[0].clientY - y0;
      if (d <= 0 || window.scrollY > 2) {
        if (distance) setTire(0);
        distance = 0;
        return;
      }
      // Résistance : la pastille suit le doigt de moins en moins.
      distance = Math.min(110, d * 0.5);
      setTire(distance);
    };
    const fin = async () => {
      if (y0 == null) return;
      y0 = null;
      if (distance >= SEUIL * 0.75) {
        enCours = true;
        setCharge(true);
        setTire(SEUIL * 0.75);
        try {
          navigator.vibrate?.(10);
        } catch {
          /* pas de vibration */
        }
        try {
          await rappel.current();
        } finally {
          enCours = false;
          setCharge(false);
          setTire(0);
        }
      } else setTire(0);
      distance = 0;
    };
    window.addEventListener("touchstart", debut, { passive: true });
    window.addEventListener("touchmove", bouge, { passive: true });
    window.addEventListener("touchend", fin);
    window.addEventListener("touchcancel", fin);
    return () => {
      window.removeEventListener("touchstart", debut);
      window.removeEventListener("touchmove", bouge);
      window.removeEventListener("touchend", fin);
      window.removeEventListener("touchcancel", fin);
    };
  }, []);

  if (!tire && !charge) return null;
  const pret = tire >= SEUIL * 0.75;
  return (
    <div
      aria-live="polite"
      aria-label={charge ? "Actualisation…" : undefined}
      className="pointer-events-none fixed inset-x-0 z-[90] flex justify-center"
      style={{
        top: `calc(env(safe-area-inset-top) + ${Math.round(tire)}px + 8px)`,
        transition: charge || !tire ? "top 180ms ease-out" : "none",
      }}
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-full shadow-lg ${sombre ? "bg-night-800 text-dawn-400" : "bg-white text-night-900"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 fill-none stroke-current ${charge ? "animate-spin" : ""}`}
          strokeWidth={2.2}
          style={charge ? undefined : { transform: `rotate(${tire * 3}deg)`, opacity: pret ? 1 : 0.55 }}
          aria-hidden
        >
          <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
