"use client";

import { useEffect, useState } from "react";
import { usePodcastPlayer, getPodcastAudio } from "@/lib/podcast-player";
import { useSoaking } from "@/lib/soaking";
import { PlayGlyph, PauseGlyph, MusicGlyph } from "@/components/ui/DevoIcons";
import { SleepTimer } from "@/components/audio/SleepTimer";
import { useLecteurPlein } from "@/lib/lecteur-plein";
import { usePodcastEtat, ouvrirLecteurPodcast } from "@/lib/podcast-etat";

/** Flèche vers le haut : redéplie le grand lecteur de la page (Bible, plan). */
function BoutonAgrandir({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Agrandir le lecteur"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_16px_rgba(202,240,0,0.4)] transition-transform active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.6} aria-hidden>
        <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Barre de lecture GLOBALE, affichée en bas sur toutes les pages tant qu'un
 * audio est en cours (podcast en priorité, sinon musique soaking). Reste
 * visible quand on change d'onglet ; la lecture continue en arrière-plan.
 */
export function GlobalAudioBar() {
  const pod = usePodcastPlayer();
  const soak = useSoaking();
  const lp = useLecteurPlein();
  const { pleinEcran } = usePodcastEtat();
  // Épisode de podcast : la flèche rouvre le lecteur plein écran ; sinon le
  // grand lecteur de la page (Bible, plan).
  const estPodcast = !!pod.current?.memoriser;
  const agrandir = estPodcast ? ouvrirLecteurPodcast : lp.present && lp.ouvrir ? lp.ouvrir : null;
  const cache = lp.ouvert || (estPodcast && pleinEcran);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  // Réserve la place de la barre : tant qu'elle est visible, le bas de page
  // est rembourré de (hauteur barre + menu) pour que plus AUCUN bouton ou
  // texte ne soit caché dessous (ex. « chapitre suivant » dans la Bible).
  // On mesure aussi la VRAIE hauteur du menu du bas (--bottom-nav-h) pour
  // coller la barre pile dessus, sans aucun jour entre les deux.
  // Grand lecteur de la page déplié → la barre se cache (un seul lecteur).
  const visible = (!!pod.current || soak.playing || !!lp.voix) && !cache;
  useEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    if (!main) return;
    const apply = () => {
      const bar = document.querySelector(".global-audio-bar") as HTMLElement | null;
      if (!bar) return;
      const nav = document.querySelector(".bottom-nav") as HTMLElement | null;
      const navH = nav ? nav.getBoundingClientRect().height : 0; // hauteur réelle (cf. AppShell)
      document.documentElement.style.setProperty("--bottom-nav-h", `${Math.max(0, navH - 1)}px`);
      // La carte flotte à 10px au-dessus du menu : --audio-bar-h représente
      // TOUT l'espace qu'elle occupe (hauteur + marge), pour caler les
      // éléments flottants au-dessus d'elle.
      const barH = bar.getBoundingClientRect().height;
      main.style.paddingBottom = `${navH + barH + 24}px`;
      document.documentElement.style.setProperty("--audio-bar-h", `${barH + 10}px`);
    };
    if (visible) {
      apply();
      const t = setTimeout(apply, 50);
      window.addEventListener("resize", apply);
      return () => {
        clearTimeout(t);
        window.removeEventListener("resize", apply);
        main.style.paddingBottom = "";
        document.documentElement.style.setProperty("--audio-bar-h", "0px");
      };
    }
    main.style.paddingBottom = "";
    document.documentElement.style.setProperty("--audio-bar-h", "0px");
  }, [visible, pod.current?.title, soak.playing, lp.voix?.titre]);

  useEffect(() => {
    const a = getPodcastAudio();
    if (!a) return;
    const onT = () => setTime(a.currentTime);
    const onM = () => setDur(a.duration || 0);
    a.addEventListener("timeupdate", onT);
    a.addEventListener("loadedmetadata", onM);
    setTime(a.currentTime);
    setDur(a.duration || 0);
    return () => {
      a.removeEventListener("timeupdate", onT);
      a.removeEventListener("loadedmetadata", onM);
    };
  }, [pod.index]);

  if (cache) return null;

  // Podcast en priorité.
  if (pod.current) {
    return (
      <div
        className="global-audio-bar dark-ctx fixed inset-x-3 z-[55] mx-auto max-w-xl rounded-[2.375rem] border border-white/10 bg-night-900/95 px-4 pb-5 pt-4 shadow-card backdrop-blur-md"
        style={{ bottom: "calc(var(--bottom-nav-h, 0px) + 0.625rem)" }}
      >
        <div>
          {/* Ligne 1, gros bouton, titre + progression, fermer */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={pod.toggle}
              aria-label={pod.playing? "Pause": "Lire"}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-sm transition-transform active:scale-95"
            >
              {pod.playing? <PauseGlyph className="h-5 w-5" />: <PlayGlyph className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <button type="button" onClick={agrandir ?? undefined} className="block w-full truncate text-left text-[15px] font-semibold text-cream">
                {pod.current.title}
              </button>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] tabular-nums text-cream/45">{fmt(time)}</span>
                <input
                  type="range"
                  min={0}
                  max={dur || 0}
                  value={time}
                  onChange={(e) => pod.seek(Number(e.target.value))}
                  className="h-1.5 flex-1 accent-dawn-400"
                  aria-label="Position"
                />
                <span className="text-[10px] tabular-nums text-cream/45">{fmt(dur)}</span>
              </div>
            </div>
            {agrandir ? <BoutonAgrandir onClick={agrandir} /> : null}
            <button
              type="button"
              onClick={pod.stop}
              aria-label="Fermer le lecteur"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/50 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Ligne 2, contrôles secondaires, bien espacés (rien ne se superpose) */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (pod.queue.length < 2) return;
                const q = [...pod.queue];
                for (let i = q.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [q[i], q[j]] = [q[j], q[i]];
                }
                pod.playQueue(q, 0);
              }}
              aria-label="Lecture aléatoire"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/60 transition-colors hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden>
                <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const speeds = [1, 1.25, 1.5, 0.8];
                const i = speeds.indexOf(pod.rate);
                pod.setRate(speeds[(i + 1) % speeds.length]);
              }}
              aria-label="Vitesse de lecture"
              className="h-9 shrink-0 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-bold tabular-nums text-cream/80"
            >
              {pod.rate}×
            </button>
            <SleepTimer />
            <button
              type="button"
              onClick={pod.next}
              aria-label="Suivant"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/60 transition-colors hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                <path d="M6 5l9 7-9 7zM17 5h2v14h-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sinon: musique soaking en cours.
  if (soak.playing) {
    return (
      <div
        className="global-audio-bar dark-ctx fixed inset-x-3 z-[55] mx-auto max-w-xl rounded-[2.375rem] border border-white/10 bg-night-900/95 px-4 py-4 shadow-card backdrop-blur-md"
        style={{ bottom: "calc(var(--bottom-nav-h, 0px) + 0.625rem)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={soak.toggle}
            aria-label="Pause"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_18px_rgba(202,240,0,0.45)] transition-transform active:scale-95"
          >
            <PauseGlyph className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[15px] font-semibold text-cream">
              <MusicGlyph className="h-4 w-4 text-dawn-400" />
              Musique soaking
            </p>
            <p className="truncate text-xs text-cream/55">En cours · {soak.label}</p>
          </div>
          {agrandir ? <BoutonAgrandir onClick={agrandir} /> : null}
          <button
            type="button"
            onClick={soak.toggle}
            aria-label="Fermer le lecteur"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/50 transition-colors hover:bg-white/10 hover:text-cream"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Sinon : lecture à voix haute (voix du téléphone) du grand lecteur replié.
  if (lp.voix) {
    const v = lp.voix;
    return (
      <div
        className="global-audio-bar dark-ctx fixed inset-x-3 z-[55] mx-auto max-w-xl rounded-[2.375rem] border border-white/10 bg-night-900/95 px-4 py-4 shadow-card backdrop-blur-md"
        style={{ bottom: "calc(var(--bottom-nav-h, 0px) + 0.625rem)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={v.basculer}
            aria-label={v.enLecture ? "Pause" : "Lire"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-sm transition-transform active:scale-95"
          >
            {v.enLecture ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="h-5 w-5" />}
          </button>
          <button type="button" onClick={agrandir ?? undefined} className="min-w-0 flex-1 text-left">
            <p className="truncate text-[15px] font-semibold text-cream">{v.titre}</p>
            <p className="truncate text-xs text-cream/55">Lecture à voix haute</p>
          </button>
          {agrandir ? <BoutonAgrandir onClick={agrandir} /> : null}
          <button
            type="button"
            onClick={v.arreter}
            aria-label="Fermer le lecteur"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/50 transition-colors hover:bg-white/10 hover:text-cream"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
