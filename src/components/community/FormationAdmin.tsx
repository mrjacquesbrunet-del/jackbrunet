"use client";

import { useEffect, useState } from "react";
import {
  getFormationAdminStats,
  getFormations,
  type FormationAdminStats,
} from "@/lib/formations";

/** Espace admin : qui suit la Formation biblique, qui l'a terminée,
 * et la note moyenne donnée par les membres. */
export function FormationAdmin() {
  const formations = getFormations();
  const [stats, setStats] = useState<Record<string, FormationAdminStats | null>>({});

  useEffect(() => {
    formations.forEach((f) => {
      getFormationAdminStats(f.id, f.lecons.length).then((s) =>
        setStats((cur) => ({ ...cur, [f.id]: s })),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-spirit-600" strokeWidth={1.9}>
          <path
            d="M2 9.5l10-5 10 5-10 5-10-5M5.8 12.4v3.8c0 1.4 2.8 2.8 6.2 2.8s6.2-1.4 6.2-2.8v-3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Formation biblique
      </h2>
      <p className="mt-1 text-sm text-night-900/60">
        Qui suit la formation, qui l&apos;a terminée, et la note des membres.
      </p>

      {formations.map((f) => {
        const s = stats[f.id];
        return (
          <div key={f.id} className="mt-4 rounded-2xl border border-night-900/10 bg-[#FAFAF6] p-4">
            <p className="font-display text-[15px] font-extrabold leading-tight">{f.titre}</p>
            {s === undefined ? (
              <p className="mt-2 text-sm text-night-900/50">Chargement…</p>
            ) : s === null ? (
              <p className="mt-2 text-sm text-night-900/50">
                Statistiques indisponibles — exécute la migration SQL « formation-ratings »
                (je te l&apos;ai donnée dans le chat), puis recharge.
              </p>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {(
                    [
                      [s.inscrits, "en formation"],
                      [s.termines, "ont terminé"],
                      [s.nb_avis ? `${String(s.note_moyenne).replace(".", ",")}/5` : "—", `${s.nb_avis} avis`],
                    ] as [number | string, string][]
                  ).map(([valeur, label]) => (
                    <div key={label} className="rounded-xl bg-white p-3">
                      <p className="font-display text-xl font-extrabold">{valeur}</p>
                      <p className="text-[11px] font-bold text-night-900/55">{label}</p>
                    </div>
                  ))}
                </div>
                {/* Combien ont validé chaque leçon */}
                <div className="mt-3 space-y-1.5">
                  {f.lecons.map((l, i) => {
                    const n = s.par_lecon[String(i + 1)] ?? 0;
                    const pct = s.inscrits ? Math.round((n / s.inscrits) * 100) : 0;
                    return (
                      <div key={l.id} className="flex items-center gap-2.5">
                        <span className="w-5 shrink-0 text-right text-xs font-bold text-night-900/55">{i + 1}</span>
                        <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-night-900/10">
                          <div className="h-full rounded-full bg-dawn-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-9 shrink-0 text-xs font-bold text-night-900/55">{n}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-night-900/45">
                  Chaque barre : membres ayant validé la leçon (quiz réussi).
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
