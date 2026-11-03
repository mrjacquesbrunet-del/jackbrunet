"use client";

import { useEffect, useState } from "react";
import { getMissionStats } from "@/lib/mission";
import { localeApp } from "@/lib/i18n";

/**
 * Barre de progression de la collecte, lue EN DIRECT depuis Supabase (se met à
 * jour sans reconstruire le site). Les valeurs initiales (issues du contenu)
 * servent au premier affichage, puis on bascule sur le montant réel.
 */
export function MissionProgress({
  initialRaised,
  objective,
}: {
  initialRaised: number;
  objective: number;
}) {
  const [raised, setRaised] = useState(initialRaised);
  const [obj, setObj] = useState(objective);

  useEffect(() => {
    let alive = true;
    const sync = () => {
      getMissionStats().then((s) => {
        if (alive && s) {
          setRaised(s.raised);
          if (s.objective > 0) setObj(s.objective);
        }
      });
    };
    sync();
    // Rafraîchit quand on revient sur la page (ex. après un don, ou après avoir
    // mis à jour le montant en admin), sans avoir à recharger.
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

  // Pourcentage RÉEL de l'objectif (peut dépasser 100 % : objectif dépassé).
  const depasse = obj > 0 && raised >= obj;
  const percent = obj > 0? Math.round((raised / obj) * 100): 0;
  const barWidth = Math.min(100, percent);

  return (
    <div
      className="mt-8 rounded-3xl border p-5 sm:p-6"
      style={
        depasse
          ? { borderColor: "rgba(252,211,77,.35)", background: "linear-gradient(160deg, rgba(252,211,77,.10), rgba(224,137,43,.06) 60%, transparent)" }
          : { borderColor: "rgba(255,255,255,.10)", background: "rgba(255,255,255,.03)" }
      }
    >
      {depasse ? (
        <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-night-950" style={{ background: "linear-gradient(90deg,#FCD34D,#EBA94D)" }}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Objectif dépassé
        </span>
      ) : null}

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="text-left">
          <p className="font-display text-4xl font-extrabold leading-none" style={{ color: depasse ? "#FCD34D" : "#FAF6F0" }}>
            {raised.toLocaleString(localeApp())}&nbsp;€
          </p>
          <p className="mt-1 text-sm text-[#FAF6F0]/60">collectés pour la mission</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold leading-none" style={{ color: depasse ? "#FCD34D" : "#EBA94D" }}>{percent} %</p>
          <p className="mt-1 text-sm text-[#FAF6F0]/60">de l&apos;objectif de <span className="whitespace-nowrap">{obj.toLocaleString(localeApp())}&nbsp;€</span></p>
        </div>
      </div>

      {depasse ? (
        <p className="mt-3 rounded-2xl bg-[#FCD34D]/10 px-4 py-2.5 text-left text-sm font-semibold text-[#FAF6F0]/90">
          Objectif dépassé de{" "}
          <strong className="whitespace-nowrap font-extrabold text-[#FCD34D]">
            {(raised - obj).toLocaleString(localeApp())}&nbsp;€
          </strong>{" "}
          <span className="text-[#FAF6F0]/60">(+{percent - 100}&nbsp;%)</span>
        </p>
      ) : null}

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={
            depasse
              ? { width: "100%", background: "linear-gradient(90deg,#EBA94D,#FCD34D,#EBA94D)", boxShadow: "0 0 14px rgba(252,211,77,.55)" }
              : { width: `${barWidth}%`, background: "linear-gradient(90deg,#E0892B,#EBA94D)" }
          }
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#FAF6F0]/75">
        {depasse ? (
          <>
            <strong className="font-bold text-[#FCD34D]">Merci du fond du cœur !</strong> Grâce à
            votre générosité, l&apos;objectif de {obj.toLocaleString(localeApp())}&nbsp;€ est dépassé.
            Tout est reversé au bénéfice des associations sur place, à Madagascar.
          </>
        ) : (
          "Chaque don est intégralement reversé au bénéfice des associations sur place, à Madagascar."
        )}
      </p>
    </div>
  );
}
