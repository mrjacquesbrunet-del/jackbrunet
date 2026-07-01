"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { searchProfiles, type Profile } from "@/lib/community";

export function MemberSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      setResults(await searchProfiles(q));
      setLoading(false);
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div className="relative">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-night-900/40"
          strokeWidth={1.8}
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un membre par pseudo…"
          className="field w-full pl-10"
        />
      </div>

      {open && q.trim().length >= 2? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-xl">
            {loading? (
              <p className="px-4 py-4 text-sm text-night-900/45">Recherche…</p>
            ): results.length === 0? (
              <p className="px-4 py-4 text-sm text-night-900/45">Aucun membre trouvé.</p>
            ): (
              <ul className="max-h-80 overflow-y-auto">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/membre?u=${p.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-night-900/[0.04]"
                    >
                      <Avatar pseudo={p.pseudo} url={p.avatar_url} size={36} />
                      <span className="font-semibold text-night-900/85">{p.pseudo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ): null}
    </div>
  );
}
