"use client";

import { useEffect, useState } from "react";

// Compte à rebours vers la prochaine célébration du dimanche 10h30.
// Rendu uniquement côté client (aucun décalage d'hydratation).
function nextSunday(): Date {
  const now = new Date();
  const next = new Date(now);
  next.setHours(10, 30, 0, 0);
  const day = now.getDay(); // 0 = dimanche
  let add = (7 - day) % 7;
  if (add === 0 && now >= next) add = 7;
  next.setDate(next.getDate() + add);
  return next;
}

function format(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} j ${hours} h ${String(minutes).padStart(2, "0")} min`;
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  return `${minutes} min`;
}

export function Countdown() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const remaining = nextSunday().getTime() - Date.now();
      // Le dimanche entre 10h30 et 12h30 : la célébration est en cours.
      const live = remaining > 6 * 24 * 3600000 + 22 * 3600000;
      setLabel(live ? "en ce moment !" : `dans ${format(remaining)}`);
    };
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!label) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-pulse/40 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-leaf">
      <span className="block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-pulse" aria-hidden />
      Prochaine célébration {label}
    </span>
  );
}
