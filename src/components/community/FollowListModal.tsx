"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listFollowers, listFollowing, type Profile } from "@/lib/community";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";

/**
 * Liste des abonnés / abonnements d'un membre, en modale.
 * `locked` : la personne a passé ses listes en privé (on n'affiche rien).
 */
export function FollowListModal({
  userId,
  kind,
  locked = false,
  onClose,
}: {
  userId: string;
  kind: "followers" | "following";
  locked?: boolean;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<Profile[] | null>(null);
  const title = kind === "followers" ? "Abonnés" : "Abonnements";

  useEffect(() => {
    if (locked) {
      setRows([]);
      return;
    }
    let alive = true;
    const p = kind === "followers" ? listFollowers(userId) : listFollowing(userId);
    p.then((r) => alive && setRows(r));
    return () => {
      alive = false;
    };
  }, [userId, kind, locked]);

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-white/10 bg-gradient-to-b from-night-800 to-night-950 p-5 text-cream shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream/70"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-1.5 overflow-y-auto">
          {locked ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-cream/60">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5zM12 14v3" /></svg>
              </span>
              <p className="text-sm text-cream/60">Ce membre garde ses {title.toLowerCase()} privés.</p>
            </div>
          ) : rows === null ? (
            <p className="py-8 text-center text-sm text-cream/55">Chargement…</p>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-cream/55">
              {kind === "followers" ? "Aucun abonné pour l'instant." : "Aucun abonnement pour l'instant."}
            </p>
          ) : (
            rows.map((p) => (
              <Link
                key={p.id}
                href={`/membre/?u=${p.id}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-2 active:bg-white/10"
              >
                {p.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-cream/60">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" /></svg>
                  </span>
                )}
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span className="truncate font-semibold">{p.pseudo || "Membre"}</span>
                  {p.verified ? <VerifiedBadge /> : null}
                </span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-cream/40" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
