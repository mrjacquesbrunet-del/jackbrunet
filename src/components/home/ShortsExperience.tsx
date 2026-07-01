"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Short } from "@/lib/types";
import { ShortsPlayer } from "@/components/home/ShortsPlayer";
import { PlayIcon } from "@/components/ui/PlayIcon";

type Category = { category: string; shorts: Short[] };

export function ShortsExperience({ categories }: { categories: Category[] }) {
  // Liste à plat (ordre global) pour la navigation dans le lecteur.
  const flat = categories.flatMap((c) => c.shorts);
  const [openAt, setOpenAt] = useState<number | null>(null);

  // Index global de départ de chaque rayon (pour ouvrir le feed au bon endroit).
  const starts: number[] = [];
  let acc = 0;
  for (const c of categories) {
    starts.push(acc);
    acc += c.shorts.length;
  }

  // On limite chaque rayon pour rester fluide ; le feed contient tout.
  const PER_RAIL = 12;

  return (
    <>
      <div className="mt-10 flex flex-col gap-10">
        {categories.map((cat, ci) => {
          const start = starts[ci];
          const preview = cat.shorts.slice(0, PER_RAIL);
          const extra = cat.shorts.length - preview.length;
          return (
            <div key={cat.category}>
              <div className="container-x mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-xl font-bold sm:text-2xl">{cat.category}</h3>
                <button
                  type="button"
                  onClick={() => setOpenAt(start)}
                  className="shrink-0 text-xs font-semibold uppercase tracking-wider text-spirit-600 transition-colors hover:text-night-900"
                >
                  Tout voir · {cat.shorts.length}
                </button>
              </div>
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-12">
                {preview.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setOpenAt(start + i)}
                    className="group relative aspect-[9/16] w-40 shrink-0 snap-start overflow-hidden rounded-3xl border border-night-900/10 bg-night-900 text-left transition-transform duration-300 hover:-translate-y-1 hover:shadow-card sm:w-48"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-night-950/85 via-transparent to-night-950/10" />
                    <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-dawn-400 text-night-900 opacity-0 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                      <PlayIcon className="h-5 w-5 translate-x-0.5" />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 p-3">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-cream">
                        {s.title}
                      </span>
                    </span>
                  </button>
                ))}
                {extra > 0? (
                  <button
                    type="button"
                    onClick={() => setOpenAt(start + preview.length)}
                    className="group grid aspect-[9/16] w-40 shrink-0 snap-start place-items-center rounded-3xl border border-dashed border-night-900/25 bg-night-900/[0.03] text-center transition-colors hover:border-dawn-500 hover:bg-night-900/[0.06] sm:w-48"
                  >
                    <span className="px-4">
                      <span className="block font-display text-2xl font-extrabold text-night-900">
                        +{extra}
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-night-900/55">
                        Tout voir
                      </span>
                    </span>
                  </button>
                ): (
                  <span className="w-1 shrink-0" aria-hidden />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {openAt!== null? (
          <ShortsPlayer
            shorts={flat}
            startIndex={openAt}
            onClose={() => setOpenAt(null)}
          />
        ): null}
      </AnimatePresence>
    </>
  );
}

