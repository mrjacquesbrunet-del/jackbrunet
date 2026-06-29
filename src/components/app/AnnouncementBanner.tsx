"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveAnnouncement, type Announcement } from "@/lib/announcements";

const KEY = "jb.announce.dismissed";

/**
 * Bannière d'annonce affichée en haut de l'application (mode app uniquement,
 * montée par AppShell). Se masque une fois lue (par id), pour ne pas gêner.
 */
export function AnnouncementBanner() {
  const [a, setA] = useState<Announcement | null>(null);

  useEffect(() => {
    getActiveAnnouncement().then((res) => {
      if (!res) return;
      let dismissed: string | null = null;
      try {
        dismissed = localStorage.getItem(KEY);
      } catch {
        /* ignore */
      }
      if (dismissed !== res.id) setA(res);
    });
  }, []);

  if (!a) return null;

  function close() {
    try {
      if (a) localStorage.setItem(KEY, a.id);
    } catch {
      /* ignore */
    }
    setA(null);
  }

  const inner = (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-lg leading-none">📣</span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-extrabold leading-tight">{a.title}</p>
        {a.body ? <p className="mt-0.5 text-xs leading-snug text-night-950/80">{a.body}</p> : null}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-x-0 top-0 z-[80] px-3 pt-[calc(0.5rem+env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-lg items-center gap-2 rounded-2xl border border-night-950/10 bg-[#CAF000] px-4 py-3 text-night-950 shadow-card">
        {a.link ? (
          <Link href={a.link} onClick={close} className="min-w-0 flex-1">
            {inner}
          </Link>
        ) : (
          <div className="min-w-0 flex-1">{inner}</div>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Fermer l'annonce"
          className="shrink-0 rounded-full p-1 text-night-950/70 transition-colors hover:bg-night-950/10"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
