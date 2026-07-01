"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import {
  listFollowers,
  listFollowing,
  removeFollower,
  unfollow,
  type Profile,
} from "@/lib/community";

/**
 * Fenêtre listant les abonnés ou les abonnements, avec possibilité de
 * retirer quelqu'un (retirer un abonné / se désabonner).
 */
export function FollowList({
  userId,
  mode,
  onClose,
  onChange,
}: {
  userId: string;
  mode: "followers" | "following";
  onClose: () => void;
  onChange: () => void;
}) {
  const [people, setPeople] = useState<Profile[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (mode === "followers"? listFollowers(userId): listFollowing(userId)).then(setPeople);
  }, [userId, mode]);

  async function remove(id: string) {
    setBusy(id);
    if (mode === "followers") await removeFollower(id, userId);
    else await unfollow(id, userId);
    setPeople((prev) => (prev? prev.filter((p) => p.id!== id): prev));
    setBusy(null);
    onChange();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-card sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-night-900/15 sm:hidden" />
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">
            {mode === "followers"? "Mes abonnés": "Mes abonnements"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-8 w-8 place-items-center rounded-full text-night-900/40 hover:bg-night-900/5"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          {people === null? (
            <p className="py-6 text-center text-sm text-night-900/45">Chargement…</p>
          ): people.length === 0? (
            <p className="py-6 text-center text-sm text-night-900/55">
              {mode === "followers"
? "Personne ne te suit encore."
: "Tu ne suis encore personne."}
            </p>
          ): (
            <ul className="divide-y divide-night-900/5">
              {people.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <Link href={`/membre?u=${p.id}`} onClick={onClose} className="shrink-0">
                    <Avatar pseudo={p.pseudo} url={p.avatar_url} size={40} />
                  </Link>
                  <Link
                    href={`/membre?u=${p.id}`}
                    onClick={onClose}
                    className="flex min-w-0 flex-1 items-center gap-1.5 font-semibold text-night-900/85 hover:underline"
                  >
                    <span className="truncate">{p.pseudo}</span>
                    {p.verified? <VerifiedBadge className="h-4 w-4" />: null}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    disabled={busy === p.id}
                    className="shrink-0 rounded-full border border-night-900/15 px-3 py-1.5 text-sm font-semibold text-night-900/70 transition-colors hover:border-night-900/30 disabled:opacity-50"
                  >
                    {mode === "followers"? "Retirer": "Se désabonner"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
