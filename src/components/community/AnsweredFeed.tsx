"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAnsweredPrayers, type Prayer } from "@/lib/community";
import { Avatar } from "@/components/community/Avatar";

function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function AnsweredFeed() {
  const [prayers, setPrayers] = useState<Prayer[] | null>(null);

  useEffect(() => {
    listAnsweredPrayers()
      .then(setPrayers)
      .catch(() => setPrayers([]));
  }, []);

  return (
    <section className="py-10">
      <div className="container-x max-w-3xl">
        {prayers === null ? (
          <p className="text-sm text-night-900/55">Chargement des témoignages…</p>
        ) : prayers.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="font-display text-xl font-bold">Bientôt les premiers témoignages 🙌</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-night-900/65">
              Quand une prière du mur est marquée « exaucée », elle apparaît ici pour rendre gloire à
              Dieu et encourager toute la communauté.
            </p>
            <Link href="/communaute" className="btn-primary mt-5">
              Aller au mur de prière
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {prayers.map((p) => (
              <li
                key={p.id}
                className="overflow-hidden rounded-3xl border border-dawn-400/50 bg-gradient-to-br from-dawn-50 to-white shadow-glow"
              >
                <div className="flex items-center gap-2 bg-gradient-to-r from-dawn-400 to-dawn-300 px-5 py-2 text-sm font-extrabold text-night-950">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                    <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6L12 19.8 6.9 22l1-5.6-4-4 5.6-.8z" />
                  </svg>
                  Dieu a agi — prière exaucée 🙌
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <Link href={`/membre?u=${p.author_id}`} aria-label="Voir le profil">
                      <Avatar pseudo={p.author?.pseudo} url={p.author?.avatar_url} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/membre?u=${p.author_id}`}
                        className="font-display font-bold leading-tight hover:underline"
                      >
                        {p.author?.pseudo ?? "Ami(e)"}
                      </Link>
                      <p className="text-xs text-night-900/50">{when(p.created_at)}</p>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-night-900/85">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
