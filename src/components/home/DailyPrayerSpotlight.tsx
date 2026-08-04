"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { listPrayers, type Prayer } from "@/lib/community";

/** Icône mains en prière (charte, même trait que le menu). */
function PrayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path
        d="M12 3.4c-.6 1.1-1.3 2-2.4 3.1L6.3 9.8c-.6.6-.9 1.5-.7 2.3l.8 4A1.8 1.8 0 0 0 8.2 19.5H12ZM12 3.4c.6 1.1 1.3 2 2.4 3.1L17.7 9.8c.6.6.9 1.5.7 2.3l-.8 4A1.8 1.8 0 0 1 15.8 19.5H12ZM9.4 12.1c1.7-.9 3.5-.9 5.2 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * « Le sujet du jour du mur » : à la fin du temps avec Jésus, un sujet de
 * prière du mur (épinglés en priorité) à porter aujourd'hui. Change chaque
 * jour (rotation calendaire) pour que toute la communauté porte le même
 * sujet — et invite à aller prier sur le mur.
 */
export function DailyPrayerSpotlight() {
  const { ready, userId } = useAuth();
  const [prayer, setPrayer] = useState<Prayer | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    (async () => {
      const list = await listPrayers();
      if (!active || !list || list.length === 0) return;
      // Épinglés d'abord ; sinon tout le mur. Rotation quotidienne.
      const pinned = list.filter((p) => p.pinned);
      const pool = pinned.length > 0 ? pinned : list;
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
      );
      setPrayer(pool[dayOfYear % pool.length]);
    })();
    return () => {
      active = false;
    };
  }, [ready, userId]);

  if (!prayer) return null;

  return (
    <section className="container-x">
      <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-3xl p-6 text-cream sm:p-7">
        <div className="blob -right-10 -top-8 h-36 w-36 bg-spirit-500/25" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-dawn-300">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-dawn-400/15">
              <PrayIcon className="h-4 w-4" />
            </span>
            Le sujet du jour du mur
          </p>
          <p className="mt-3 line-clamp-4 font-display text-lg font-bold italic leading-snug">
            « {prayer.body} »
          </p>
          <p className="mt-2 text-xs text-cream/55">
            {prayer.author?.pseudo ?? "Un membre"} · mur de prière
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link href={`/communaute/?prayer=${prayer.id}`} className="btn-primary text-sm">
              Je prie pour ce sujet
            </Link>
            <Link href="/communaute" className="btn-ghost text-sm">
              Voir le mur
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
