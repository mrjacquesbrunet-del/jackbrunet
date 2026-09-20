"use client";

import { useEffect, useState } from "react";
import { getMissionStats } from "@/lib/mission";

/**
 * Titre de la section « Objectif » : tant que la collecte est en cours il
 * annonce l'objectif ; une fois l'objectif atteint (montant réel lu en direct
 * depuis Supabase, comme la jauge), il bascule en « Objectif réalisé » avec
 * un texte qui invite à continuer — chaque euro compte.
 */
export function MissionObjectiveHeader({
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

  const realise = obj > 0 && raised >= obj;

  if (realise) {
    return (
      <>
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#EBA94D]">La collecte continue</span>
        <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
          Chaque euro <span className="text-[#E0892B]">compte&nbsp;!</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#FAF6F0]/70 sm:text-lg">
          Les {obj.toLocaleString("fr-FR")}&nbsp;€ n&apos;étaient que le{" "}
          <strong className="font-bold text-[#FAF6F0]">premier palier</strong>. Sur place,{" "}
          <strong className="font-bold text-[#FAF6F0]">les besoins sont immenses</strong> — et
          chaque euro récolté en plus nous permettra de{" "}
          <strong className="font-bold text-[#EBA94D]">bénir davantage</strong>&nbsp;: plus
          d&apos;orphelinats visités, plus de familles soutenues, plus de vies touchées.
        </p>
      </>
    );
  }

  return (
    <>
      <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#EBA94D]">Objectif</span>
      <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
        Notre objectif&nbsp;: <span className="text-[#E0892B]">{obj.toLocaleString("fr-FR")} €</span>
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[#FAF6F0]/70 sm:text-lg">
        Cette mission a un coût: déplacements, logistique sur place, et soutien direct aux
        œuvres que nous visiterons. Chaque don, petit ou grand, nous rapproche du but.
      </p>
    </>
  );
}
