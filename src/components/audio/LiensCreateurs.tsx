"use client";

import Link from "next/link";
import { intervenantsDe, type Emission } from "@/lib/audio-library";
import { ficheAuteur } from "@/lib/podcast-auteurs";
import { openExternal } from "@/lib/external";

/** Icônes en trait des liens (réseaux, site, boutique). */
const ICONES: Record<string, React.ReactNode> = {
  Instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.2 6.8h.01" strokeLinecap="round" />
    </>
  ),
  YouTube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.3v5.4l4.6-2.7z" strokeLinejoin="round" />
    </>
  ),
  TikTok: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.3 4.4 5 4.6" strokeLinecap="round" strokeLinejoin="round" />,
  Facebook: <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5H17.6V4.4A20 20 0 0 0 15.4 4.3c-2.2 0-3.7 1.3-3.7 3.8v2.4H9.2v3h2.5V21" strokeLinejoin="round" />,
  Boutique: <path d="M5 8h14l-1.2 12H6.2zM9 8V6.5a3 3 0 0 1 6 0V8" strokeLinejoin="round" />,
  "Site web": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
};
const LIEN_DEFAUT = <path d="M10 14l4-4M8.5 11.5l-2 2a3.5 3.5 0 0 0 5 5l2-2M15.5 12.5l2-2a3.5 3.5 0 0 0-5-5l-2 2" strokeLinecap="round" />;

/**
 * Liens du ou des créateurs d'une émission (Instagram, YouTube, TikTok,
 * Facebook, site, boutique), sous la description. Plusieurs intervenants :
 * une ligne par personne. Rien si aucun lien.
 */
export function LiensCreateurs({ emission }: { emission: Emission }) {
  const personnes = intervenantsDe(emission)
    .map(({ nom }) => {
      const { info } = ficheAuteur(nom, emission);
      const liens = [
        ...(info.instagram ? [{ label: "Instagram", url: info.instagram }] : []),
        ...info.resources.filter((r) => r.label !== "Instagram"),
      ].filter((l) => l.url);
      return { nom, liens };
    })
    .filter((p) => p.liens.length);
  if (!personnes.length) return null;
  const plusieurs = personnes.length > 1 || intervenantsDe(emission).length > 1;

  return (
    <div className="mx-auto mt-4 max-w-sm space-y-3">
      {personnes.map(({ nom, liens }) => (
        <div key={nom}>
          {plusieurs ? <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cream/45">{nom}</p> : null}
          <div className="flex flex-wrap justify-center gap-2">
            {liens.map((l) => {
              const icone = (
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                  {ICONES[l.label] ?? LIEN_DEFAUT}
                </svg>
              );
              const classe =
                "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-2 text-[13px] font-semibold text-cream/85 active:bg-white/10";
              return l.url.startsWith("/") ? (
                <Link key={l.label + l.url} href={l.url} className={classe}>
                  {icone}
                  {l.label}
                </Link>
              ) : (
                <button key={l.label + l.url} type="button" onClick={() => void openExternal(l.url)} className={classe}>
                  {icone}
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
