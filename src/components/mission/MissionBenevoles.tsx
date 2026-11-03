"use client";

import { useEffect, useState } from "react";
import { BENEVOLES, OBJECTIF_BENEVOLES, TOTAL_BENEVOLES, getBenevolesStats } from "@/lib/mission";
import { localeApp } from "@/lib/i18n";

/**
 * 2e jauge, sous celle de la mission : participation aux frais des
 * bénévoles. Chacun a payé son billet d'avion, puis cinq d'entre eux ont dû
 * en racheter un. Montant lu en direct (réglé par l'admin).
 */
export function MissionBenevoles() {
  const [raised, setRaised] = useState(0);
  const [obj, setObj] = useState(OBJECTIF_BENEVOLES);

  useEffect(() => {
    let alive = true;
    const sync = () => {
      getBenevolesStats().then((s) => {
        if (alive && s) {
          setRaised(s.raised);
          if (s.objective > 0) setObj(s.objective);
        }
      });
    };
    sync();
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", sync);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const percent = obj > 0 ? Math.round((raised / obj) * 100) : 0;
  const atteint = percent >= 100;
  const eur = (n: number) => `${n.toLocaleString(localeApp())}\u00a0€`;
  const lignes: [string, number][] = [
    [`${BENEVOLES.nombre} billets d'avion × ${eur(BENEVOLES.billet)}`, BENEVOLES.nombre * BENEVOLES.billet],
    [`${BENEVOLES.rachats} billets rachetés × ${eur(BENEVOLES.billetRachat)}`, BENEVOLES.rachats * BENEVOLES.billetRachat],
  ];

  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E0892B]/15 text-[#EBA94D]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
            <path d="M2.5 19.5h19M3.5 13.2l3.2 1 4.3-1.4L6.4 6.4l2-.7 7.3 5.2 3.7-1.2a1.8 1.8 0 0 1 1.1 3.4l-12.6 4.1-4.6-1.6z" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p className="font-display text-lg font-extrabold leading-tight text-[#FAF6F0]">Participation aux frais des bénévoles</p>
          <p className="text-sm text-[#FAF6F0]/55">Leurs billets d&apos;avion, payés de leur poche</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[#FAF6F0]/75">
        Pour partir, les {BENEVOLES.nombre} bénévoles ont chacun payé leur billet d&apos;avion. Puis{" "}
        {BENEVOLES.rachats} d&apos;entre eux ont dû <strong className="font-bold text-[#FAF6F0]">faire un pas de foi</strong>{" "}
        et racheter un nouveau billet. Nous vous demandons une participation pour ce{" "}
        <strong className="font-bold text-[#FAF6F0]">deuxième billet</strong>.
      </p>

      <ul className="mt-3 space-y-1 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-[#FAF6F0]/70">
        {lignes.map(([lib, total]) => (
          <li key={lib} className="flex justify-between gap-3">
            <span>{lib}</span>
            <span className="shrink-0 font-semibold text-[#FAF6F0]/85">{eur(total)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-3 border-t border-white/10 pt-1.5 font-bold text-[#FAF6F0]">
          <span>Total payé par les bénévoles</span>
          <span className="shrink-0">{eur(TOTAL_BENEVOLES)}</span>
        </li>
        <li className="flex justify-between gap-3 pt-1 font-bold text-[#EBA94D]">
          <span>Objectif : participation au 2e billet</span>
          <span className="shrink-0">{eur(OBJECTIF_BENEVOLES)}</span>
        </li>
      </ul>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-3xl font-extrabold leading-none text-[#FAF6F0]">{eur(raised)}</p>
          <p className="mt-1 text-sm text-[#FAF6F0]/60">reçus pour les bénévoles</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold leading-none text-[#EBA94D]">{percent} %</p>
          <p className="mt-1 text-sm text-[#FAF6F0]/60">de l&apos;objectif de <span className="whitespace-nowrap">{eur(obj)}</span></p>
        </div>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, percent)}%`,
            background: atteint ? "linear-gradient(90deg,#EBA94D,#FCD34D,#EBA94D)" : "linear-gradient(90deg,#E0892B,#EBA94D)",
          }}
        />
      </div>
    </div>
  );
}
