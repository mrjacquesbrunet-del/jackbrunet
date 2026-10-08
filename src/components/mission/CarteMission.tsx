"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";
import { chargerDonsLibres, progressionDon, soutienDispo, type ObjectifDon } from "@/lib/soutien";
import { lienDonSite } from "@/lib/don-site";
import { openExternal } from "@/lib/external";
import { getLangue } from "@/lib/i18n";

/** Photo de la mission (enfants soutenus par le ministère). */
export const PHOTO_MISSION = "/mission/enfants.webp";

const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

/**
 * « Je soutiens la mission » : paiement Apple / Google dans l'app s'il est en
 * place, sinon directement la page de don du site (Apple Pay, Google Pay,
 * carte), dans la langue de l'app.
 */
export function useAllerAuDon() {
  const router = useRouter();
  return async () => {
    if (soutienDispo() && (await chargerDonsLibres()).length) router.push("/don");
    else void openExternal(lienDonSite(undefined, undefined, getLangue()));
  };
}

/** L'objectif du mois (rechargé à chaque affichage : il avance à chaque don). */
export function useObjectifDon() {
  const [objectif, setObjectif] = useState<ObjectifDon | null>(null);
  useEffect(() => {
    progressionDon().then(setObjectif);
  }, []);
  return objectif;
}

/** Barre d'objectif (titre, %, barre lime, « X € sur Y € »). */
export function BarreObjectif({ objectif }: { objectif: ObjectifDon }) {
  const pct = Math.min(100, Math.round((objectif.collecte / objectif.objectif) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-cream/45">{objectif.titre}</p>
        <p className="text-[12px] font-extrabold text-dawn-400">{`${pct} %`}</p>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8FB300] to-dawn-400"
          style={{ width: `${Math.max(pct, objectif.collecte > 0 ? 3 : 0)}%` }}
        />
      </div>
      <p className="mt-1.5 text-[12px] font-semibold text-cream/60">{`${euros(objectif.collecte)} sur ${euros(objectif.objectif)}`}</p>
    </div>
  );
}

/**
 * Carte « Soutiens la mission » : photo des enfants, phrase simple, barre
 * d'objectif et bouton de don. La même partout (menu profil, mur de prière…).
 */
export function CarteMission({ className = "", onAvantDon }: { className?: string; onAvantDon?: () => void }) {
  const objectif = useObjectifDon();
  const allerAuDon = useAllerAuDon();

  return (
    <button
      type="button"
      onClick={() => {
        onAvantDon?.();
        void allerAuDon();
      }}
      className={`dark-ctx keep-dark group block w-full overflow-hidden rounded-3xl border border-dawn-400/30 bg-night-900 text-left ${className}`}
    >
      <div className="relative h-28 overflow-hidden">
        {/* Photo « fondue » dans la charte : légèrement désaturée, dégradé
            seulement en bas pour garder les deux visages bien visibles. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(PHOTO_MISSION)}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: "center 34%", filter: "saturate(0.78) contrast(1.08) brightness(0.82)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 85% 0%, rgba(202,240,0,0.12), transparent 55%), linear-gradient(to top, rgb(var(--n-900)) 0%, rgb(var(--n-900) / 0.6) 18%, transparent 42%)",
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-night-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-dawn-400 backdrop-blur">
          Mission
        </span>
        <p className="absolute inset-x-4 bottom-1.5 font-display text-[16px] font-extrabold leading-tight text-cream [text-shadow:0_1px_8px_rgba(0,0,0,.7)]">
          Soutiens la <span className="text-dawn-400">mission</span>
        </p>
      </div>
      <div className="px-4 pb-3.5 pt-1">
        <p className="text-[12.5px] leading-snug text-cream/65">
          Ta contribution fait vivre l&apos;app et des missions auprès des plus pauvres.
        </p>
        {objectif ? (
          <div className="mt-2.5">
            <BarreObjectif objectif={objectif} />
          </div>
        ) : null}
        <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-dawn-400 px-3.5 py-1.5 text-[12.5px] font-extrabold text-night-950 transition-transform group-active:scale-95">
          Je soutiens la mission
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </button>
  );
}
