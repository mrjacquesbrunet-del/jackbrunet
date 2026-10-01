"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { audioRacineUrl } from "@/lib/formations";

/** Annonce de l'École biblique (formations e-learning). Affichée une fois
 * par appareil, pendant la semaine de lancement seulement. */
const SEEN_KEY = "jb.news.formation.v1";
/** Fin de la campagne : après cette date, le pop-up ne s'affiche plus. */
const FIN_CAMPAGNE = new Date("2026-10-12T00:00:00");
/** Visuel d'annonce, déposé à la racine du bucket public « audiovf ». */
const IMAGE_BUCKET = "annonce-formation.jpg";

/** Vrai si l'annonce doit encore s'afficher (pour céder la priorité). */
export function formationNewsPending(): boolean {
  if (new Date() >= FIN_CAMPAGNE) return false;
  try {
    return !localStorage.getItem(SEEN_KEY);
  } catch {
    return false;
  }
}

const S = (d: string) => {
  const Icon = (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
  return Icon;
};
const IconClose = S("M6 6l12 12M18 6L6 18");
const IconSpark = S("M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8");
const IconCap = S("M2 9.5l10-5 10 5-10 5-10-5M5.8 12.4v3.8c0 1.4 2.8 2.8 6.2 2.8s6.2-1.4 6.2-2.8v-3.8");
const IconAudio = S("M4 10v4h3l5 4V6L7 10H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11");
const IconQuiz = S("M21 12a8 8 0 1 0-3.1 6.3L21 19l-.9-3.2A8 8 0 0 0 21 12zM9.6 10a2.4 2.4 0 1 1 3.3 2.2c-.6.3-.9.7-.9 1.3M12 16.2h.01");
const IconBook = S("M12 3v12m0 0l-4-4m4 4l4-4M5 19h14");

const CSS = `
@keyframes fm-in{0%{transform:translateY(28px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes fm-tw{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:.9;transform:scale(1.15)}}
.fm-tw{position:absolute;border-radius:9999px;background:#CAF000;animation:fm-tw 2.6s ease-in-out infinite;pointer-events:none}
`;

export function FormationNewsModal() {
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(false);
  const imgUrl = audioRacineUrl(IMAGE_BUCKET);

  useEffect(() => {
    if (!formationNewsPending()) return;
    // Sonde le visuel du bucket (repli dégradé si absent / hors ligne).
    if (imgUrl) {
      const img = new Image();
      img.onload = () => setImgOk(true);
      img.src = imgUrl;
    }
    // Petit délai pour ne pas surgir brutalement à l'ouverture.
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={close} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[2rem] border border-[#CAF000]/25 bg-gradient-to-b from-[#1E1E1D] via-[#171716] to-[#0C0C0B] text-cream shadow-2xl sm:rounded-[2rem]"
        style={{ animation: "fm-in .35s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 0 40px rgba(202,240,0,.12), 0 24px 60px rgba(0,0,0,.6)" }}
      >
        <style dangerouslySetInnerHTML={{ __html: CSS }} />

        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-cream/85 backdrop-blur"
        >
          <IconClose className="h-4 w-4" />
        </button>

        {/* Visuel d'annonce (bucket), sinon composition de la charte */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {imgOk && imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt="" aria-hidden className="h-full w-full object-cover" />
          ) : (
            <div className="relative h-full w-full bg-gradient-to-br from-[#2E3A14] via-[#1B220C] to-[#0C0C0B]">
              <span className="fm-tw" style={{ left: "14%", top: "22%", width: 5, height: 5 }} />
              <span className="fm-tw" style={{ right: "18%", top: "16%", width: 6, height: 6, animationDelay: ".7s" }} />
              <span className="fm-tw" style={{ left: "34%", top: "12%", width: 4, height: 4, animationDelay: "1.4s" }} />
              <span className="fm-tw" style={{ right: "30%", bottom: "24%", width: 4, height: 4, animationDelay: "2s" }} />
              <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#CAF000]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#CAF000]/10 blur-3xl" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-20 w-20 place-items-center rounded-[1.6rem] bg-dawn-400 text-night-950 shadow-[0_14px_34px_-10px_rgba(202,240,0,0.6)]">
                  <IconCap className="h-11 w-11" />
                </span>
              </div>
            </div>
          )}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#171716] to-transparent" />
        </div>

        {/* Titre */}
        <div className="relative px-6 pt-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#D8F53A] to-[#AAD000] px-4 py-1 text-xs font-black uppercase tracking-wide text-night-950">
            <IconSpark className="h-3.5 w-3.5" /> Nouveau
          </span>
          <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight">
            La Formation biblique <span className="text-[#CAF000]">arrive&nbsp;!</span>
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-snug text-cream/70">
            Une vraie formation pour grandir dans la foi : « Les fondamentaux de la foi chrétienne », leçon par leçon.
          </p>
        </div>

        {/* Ce qui t'attend */}
        <div className="mt-5 space-y-2.5 px-6">
          <Feature Icon={IconAudio} tint="#CAF000" title="Leçons à lire et à écouter" desc="Chaque partie est racontée par une voix narrateur — le texte suit l'audio." />
          <Feature Icon={IconQuiz} tint="#34D3C6" title="Quiz et progression" desc="Valide chaque leçon avec un quiz noté sur 10 — ta progression est enregistrée." />
          <Feature Icon={IconBook} tint="#FCD34D" title="E-book offert" desc="Termine la formation et reçois le livre complet en PDF." />
        </div>

        {/* Actions */}
        <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
          <Link
            href="/ecole/fondamentaux"
            onClick={close}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#D8F53A] to-[#AAD000] py-4 font-display text-lg font-extrabold text-night-950"
          >
            <IconCap className="h-5 w-5" /> Découvrir la formation
          </Link>
          <button
            type="button"
            onClick={close}
            className="mt-2 w-full rounded-2xl py-3 text-sm font-bold text-cream/60"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({ Icon, tint, title, desc }: { Icon: (p: { className?: string }) => React.ReactElement; tint: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${tint}1f`, color: tint }}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 text-left">
        <p className="text-sm font-extrabold leading-tight">{title}</p>
        <p className="text-[11px] leading-tight text-cream/55">{desc}</p>
      </div>
    </div>
  );
}
