"use client";

import { useEffect, useState } from "react";
import { bumpAchv } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";
import { usePodcastPlayer, getPodcastAudio } from "@/lib/podcast-player";
import type { AudioTrack } from "@/lib/audio-library";
import { PlayGlyph, PauseGlyph } from "@/components/ui/DevoIcons";

/** Vitesses proposées (mémorisées avec celle du lecteur global). */
const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

export type PisteAudio = { src: string; titre: string };

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}

/**
 * Lecteur de la méditation (voix de Pasteur Jack). Passe par le lecteur
 * GLOBAL : la lecture continue écran verrouillé et en changeant de page,
 * avec les commandes sur l'écran de verrouillage et la barre du bas.
 * `suite` : méditations à enchaîner après celle-ci (les jours précédents).
 * (L'ancien lecteur réglait le volume par Web Audio, qu'iOS coupe dès que
 * l'écran se verrouille : le volume se règle aux boutons du téléphone.)
 */
export function AudioPlayer({
  src,
  label = "Écouter",
  titre,
  suite = [],
}: {
  src: string;
  label?: string;
  titre?: string;
  suite?: PisteAudio[];
}) {
  const pod = usePodcastPlayer();
  const id = `meditation:${src}`;
  const actif = pod.current?.id === id;
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    if (!actif) return;
    const a = getPodcastAudio();
    if (!a) return;
    const maj = () => {
      setPos(a.currentTime || 0);
      setDur(Number.isFinite(a.duration) ? a.duration : 0);
    };
    maj();
    a.addEventListener("timeupdate", maj);
    a.addEventListener("durationchange", maj);
    return () => {
      a.removeEventListener("timeupdate", maj);
      a.removeEventListener("durationchange", maj);
    };
  }, [actif, pod.index]);

  const piste = (p: PisteAudio): AudioTrack => ({
    id: `meditation:${p.src}`,
    title: p.titre,
    description: null,
    url: p.src,
    path: p.src,
    author: "Pasteur Jack Brunet",
    showTitle: "Méditation du jour",
    cover: "/img/podcast/rhema-du-jour.jpg", // pochette sur l'écran verrouillé
  });

  function lancer() {
    if (actif) {
      pod.toggle();
      return;
    }
    const file = [{ src, titre: titre ?? label }, ...suite.filter((p) => p.src !== src)].map(piste);
    pod.playQueue(file, 0, true);
    bumpAchv("listens");
    checkLocalBadges();
  }

  const enLecture = actif && pod.playing;

  return (
    <div className="rounded-2xl border border-night-900/10 bg-night-900/[0.03] p-4">
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={lancer}
          aria-label={enLecture ? "Pause" : label}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_18px_-4px_rgba(202,240,0,.6)] transition-transform active:scale-95"
        >
          {enLecture ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="ml-0.5 h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-night-900">{label}</p>
          {actif ? (
            <div className="mt-1.5 flex items-center gap-2">
              <span className="w-8 shrink-0 text-[10.5px] tabular-nums text-night-900/50">{fmt(pos)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, Math.floor(dur))}
                step={1}
                value={Math.floor(pos)}
                onChange={(e) => pod.seek(Number(e.target.value))}
                aria-label="Position dans la méditation"
                className="h-1 min-w-0 flex-1 accent-spirit-600"
              />
              <span className="w-8 shrink-0 text-right text-[10.5px] tabular-nums text-night-900/50">{fmt(dur)}</span>
            </div>
          ) : (
            <p className="mt-0.5 text-[12px] leading-snug text-night-900/55">
              Continue écran verrouillé{suite.length ? ", puis enchaîne les méditations précédentes" : ""}.
            </p>
          )}
        </div>
      </div>
      {/* Vitesse de lecture */}
      <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-night-900/45">Vitesse</span>
        {SPEEDS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => pod.setRate(r)}
            className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
              pod.rate === r
                ? "bg-dawn-400 text-night-950"
                : "border border-night-900/15 bg-night-900/[0.03] text-night-900/65 hover:border-night-900/35"
            }`}
          >
            {String(r).replace(".", ",")}×
          </button>
        ))}
      </div>
    </div>
  );
}
