"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { usePodcastPlayer, getPodcastAudio } from "@/lib/podcast-player";
import { usePodcastEtat, basculerFavori, fermerLecteurPodcast, ouvrirChoixListe } from "@/lib/podcast-etat";
import { episodesHorsLigne, telechargerEpisode, retirerEpisode } from "@/lib/podcast-offline";
import { PodcastASuivre } from "@/components/audio/PodcastASuivre";
import { appShareUrl } from "@/config/app-links";
import { PlayGlyph, PauseGlyph, HeadphonesGlyph } from "@/components/ui/DevoIcons";

const COEUR =
  "M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.9 4.02 3 6.5 3c1.74 0 3.4 1 4.22 2.44h.56C12.1 4 13.76 3 15.5 3 17.98 3 20 4.9 20 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z";

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

const VITESSES = [1, 1.25, 1.5, 0.8];

/**
 * Lecteur PLEIN ÉCRAN des podcasts : grande pochette, progression, commandes,
 * vitesse / minuteur / téléchargement / partage. À la fin d'un épisode, le
 * suivant de la même émission arrive après 5 s (annulable).
 * S'ouvre quand on lance un épisode ; la flèche (ou un glissé vers le bas)
 * le réduit dans la barre du bas, qui le rouvre avec sa flèche verte.
 */
export function PodcastPlayerPlein() {
  const pod = usePodcastPlayer();
  const { pleinEcran, favoris } = usePodcastEtat();
  const t = pod.current;
  const visible = pleinEcran && !!t?.memoriser;

  const [temps, setTemps] = useState(0);
  const [duree, setDuree] = useState(0);
  const [minuteur, setMinuteur] = useState(false);
  const [horsLigne, setHorsLigne] = useState(false);
  const [telech, setTelech] = useState<number | null>(null);
  const glisse = useDragControls();
  const [options, setOptions] = useState(false);

  useEffect(() => {
    const a = getPodcastAudio();
    if (!a) return;
    const maj = () => {
      setTemps(a.currentTime);
      setDuree(Number.isFinite(a.duration) ? a.duration : 0);
    };
    maj();
    a.addEventListener("timeupdate", maj);
    a.addEventListener("loadedmetadata", maj);
    a.addEventListener("durationchange", maj);
    return () => {
      a.removeEventListener("timeupdate", maj);
      a.removeEventListener("loadedmetadata", maj);
      a.removeEventListener("durationchange", maj);
    };
  }, [pod.index]);

  useEffect(() => {
    if (!t) return;
    episodesHorsLigne([t]).then((s) => setHorsLigne(s.has(t.path)));
  }, [t?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pas de défilement de la page sous le lecteur.
  useEffect(() => {
    if (!visible) return;
    const b = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = b;
    };
  }, [visible]);

  async function telecharger() {
    if (!t || telech !== null) return;
    if (horsLigne) {
      if (!confirm(`Retirer « ${t.title} » des téléchargements ?`)) return;
      await retirerEpisode(t);
      setHorsLigne(false);
      return;
    }
    setTelech(0);
    const ok = await telechargerEpisode(t, (r, total) => setTelech(total ? r / total : 0));
    setTelech(null);
    if (ok) setHorsLigne(true);
  }

  async function partager() {
    if (!t) return;
    const url = appShareUrl(`/ecouter?e=${t.id}`);
    try {
      const nav = navigator as Navigator & { share?: (d: object) => Promise<void> };
      if (nav.share) await nav.share({ title: t.title, text: `Écoute « ${t.title} »`, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* annulé */
    }
  }

  function melanger() {
    const reste = pod.queue.filter((_, i) => i !== pod.index);
    for (let i = reste.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reste[i], reste[j]] = [reste[j], reste[i]];
    }
    if (t) pod.playQueue([t, ...reste], 0, true);
  }

  const fav = t ? favoris.has(t.id) : false;
  const timerActif = pod.sleepEndsAt !== null || pod.sleepEpisodeEnd;

  return (
    <AnimatePresence>
      {visible && t ? (
        <motion.div
          key="lecteur-podcast"
          role="dialog"
          aria-modal="true"
          aria-label="Lecteur"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          drag="y"
          dragListener={false}
          dragControls={glisse}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 140 || info.velocity.y > 800) fermerLecteurPodcast();
          }}
          className="dark-ctx fixed inset-0 z-[115] overflow-y-auto bg-night-950 text-cream"
        >
          {/* Fond : la pochette floutée + voile */}
          {t.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.cover} alt="" aria-hidden className="pointer-events-none fixed inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl" />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0"
            style={{ background: "radial-gradient(70% 40% at 50% 25%, rgba(202,240,0,.10), transparent 70%), linear-gradient(to bottom, rgb(var(--n-950) / .35), rgb(var(--n-950) / .85) 60%, rgb(var(--n-950)))" }}
          />

          <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col justify-between gap-4 px-6 pb-[calc(env(safe-area-inset-bottom)+1.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            {/* Haut : réduire, émission, options (glisser ici vers le bas = réduire) */}
            <div className="flex touch-none items-center justify-between gap-3" onPointerDown={(e) => glisse.start(e)}>
              <button
                type="button"
                onClick={fermerLecteurPodcast}
                aria-label="Réduire le lecteur"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_16px_rgba(202,240,0,0.4)] active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.6} aria-hidden>
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="min-w-0 text-center">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-cream/55">Podcast</p>
                <p className="truncate text-[15px] font-semibold text-cream">{t.showTitle ?? "RHEMA"}</p>
              </div>
              <button
                type="button"
                onClick={() => setOptions(true)}
                aria-label="Plus d'options"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-cream/85 active:bg-white/[0.1]"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
                  <circle cx="5" cy="12" r="1.9" />
                  <circle cx="12" cy="12" r="1.9" />
                  <circle cx="19" cy="12" r="1.9" />
                </svg>
              </button>
            </div>

            {/* Pochette */}
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: pod.playing ? 1 : 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="relative aspect-square w-full max-w-[400px] overflow-hidden rounded-[28px] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_40px_80px_-24px_rgba(0,0,0,.9)]"
                style={{ maxHeight: "46vh", maxWidth: "min(100%, 46vh)" }}
              >
                {t.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-spirit-500 to-night-900">
                    <HeadphonesGlyph className="h-16 w-16 text-dawn-400" />
                  </div>
                )}
                {/* La série, posée en bas de l'image (le visage reste dégagé) */}
                <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/15 to-transparent" />
                {!pod.aSuivre ? (
                  <div className="absolute inset-x-0 bottom-0 max-w-[88%] p-5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-dawn-400">Série</p>
                    <p className="mt-1 font-display text-[28px] font-bold leading-[1.02] text-cream">{t.showTitle ?? "Podcast"}</p>
                    {t.showDescription ? <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-cream/80">{t.showDescription}</p> : null}
                  </div>
                ) : null}
                {/* Fin de l'épisode : le suivant arrive (annulable) */}
                <div className="absolute inset-x-3 bottom-3">
                  <PodcastASuivre plein />
                </div>
              </motion.div>
            </div>

            {/* Titre + cœur */}
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {t.numero ? <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dawn-400">Épisode {t.numero}</p> : null}
                <h2 className="mt-1 text-[24px] font-semibold leading-tight text-cream">{t.title}</h2>
                <p className="mt-1 truncate text-[14.5px] text-cream/55">{[t.author, t.showTitle ?? "Podcast"].filter(Boolean).join(" · ")}</p>
              </div>
              <button
                type="button"
                onClick={() => basculerFavori(t.id)}
                aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${fav ? "text-dawn-400" : "text-cream/70"}`}
              >
                <motion.svg
                  key={fav ? "plein" : "vide"}
                  initial={{ scale: fav ? 0.6 : 1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  viewBox="0 0 24 24"
                  className={`h-6 w-6 stroke-current ${fav ? "fill-current" : "fill-none"}`}
                  strokeWidth={1.8}
                  aria-hidden
                >
                  <path d={COEUR} strokeLinejoin="round" />
                </motion.svg>
              </button>
            </div>

            {/* Progression */}
            <div>
              <input
                type="range"
                min={0}
                max={duree || 0}
                step={1}
                value={Math.min(temps, duree || 0)}
                onChange={(e) => pod.seek(Number(e.target.value))}
                aria-label="Position de lecture"
                className="h-1.5 w-full accent-dawn-400"
              />
              <div className="mt-1.5 flex justify-between text-[12px] tabular-nums text-cream/50">
                <span>{fmt(temps)}</span>
                <span>-{fmt(Math.max(0, duree - temps))}</span>
              </div>
            </div>

            {/* Commandes */}
            <div className="flex items-center justify-between">
              <button type="button" onClick={melanger} aria-label="Lecture aléatoire" className="grid h-11 w-11 place-items-center rounded-full text-cream/70 active:bg-white/10">
                <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                  <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" onClick={pod.prev} aria-label="Précédent" className="grid h-12 w-12 place-items-center rounded-full text-cream active:bg-white/10">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
                  <path d="M18 5l-9 7 9 7zM5 5h2v14H5z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={pod.toggle}
                aria-label={pod.playing ? "Pause" : "Lire"}
                className="grid h-[76px] w-[76px] place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_36px_-6px_rgba(202,240,0,.65)] active:scale-95"
              >
                {pod.playing ? <PauseGlyph className="h-8 w-8" /> : <PlayGlyph className="ml-1 h-8 w-8" />}
              </button>
              <button type="button" onClick={pod.next} aria-label="Suivant" className="grid h-12 w-12 place-items-center rounded-full text-cream active:bg-white/10">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
                  <path d="M6 5l9 7-9 7zM17 5h2v14h-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => pod.setRepeat(!pod.repeat)}
                aria-label="Répéter l'épisode"
                className={`grid h-11 w-11 place-items-center rounded-full ${pod.repeat ? "bg-dawn-400/15 text-dawn-400" : "text-cream/70"} active:bg-white/10`}
              >
                <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                  <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Options : boutons ronds, libellé dessous */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {(
                [
                  {
                    cle: "vitesse",
                    lbl: "Vitesse",
                    actif: pod.rate !== 1,
                    clic: () => pod.setRate(VITESSES[(VITESSES.indexOf(pod.rate) + 1) % VITESSES.length] ?? 1),
                    icone: <span className="text-[17px] font-semibold">{pod.rate}×</span>,
                  },
                  {
                    cle: "minuteur",
                    lbl: "Minuteur",
                    actif: timerActif,
                    clic: () => setMinuteur(true),
                    icone: (
                      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current" aria-hidden>
                        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
                      </svg>
                    ),
                  },
                  {
                    cle: "telecharger",
                    lbl: horsLigne ? "Téléchargé" : "Télécharger",
                    actif: horsLigne || telech !== null,
                    clic: telecharger,
                    icone:
                      telech !== null ? (
                        <span className="text-[12px] font-bold tabular-nums">{Math.round(telech * 100)}%</span>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-none stroke-current" strokeWidth={2} aria-hidden>
                          {horsLigne ? (
                            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
                          )}
                        </svg>
                      ),
                  },
                  {
                    cle: "partager",
                    lbl: "Partager",
                    actif: false,
                    clic: partager,
                    icone: (
                      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                ] as const
              ).map((o) => (
                <button key={o.cle} type="button" onClick={o.clic} className="flex flex-col items-center gap-2">
                  <span
                    className={`grid h-[58px] w-[58px] place-items-center rounded-full border ${
                      o.actif ? "border-dawn-400/60 bg-dawn-400/15 text-dawn-400" : "border-white/[0.08] bg-white/[0.07] text-cream"
                    } active:scale-95`}
                  >
                    {o.icone}
                  </span>
                  <span className={`text-[12.5px] font-medium ${o.actif ? "text-dawn-400" : "text-cream/80"}`}>{o.lbl}</span>
                </button>
              ))}
            </div>

          </div>

          {/* Menu « … » */}
          <AnimatePresence>
            {options ? (
              <motion.div className="fixed inset-0 z-[5] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button type="button" aria-label="Fermer" onClick={() => setOptions(false)} className="absolute inset-0 bg-night-950/70" />
                <motion.div
                  initial={{ y: 30 }}
                  animate={{ y: 0 }}
                  exit={{ y: 30 }}
                  className="relative w-full max-w-md divide-y divide-white/[0.07] rounded-t-[28px] border border-white/10 bg-night-900 px-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2"
                >
                  {[
                    { lbl: "Ajouter à une liste", clic: () => ouvrirChoixListe({ id: t.id, titre: t.title }) },
                    { lbl: "Partager l'épisode", clic: partager },
                    { lbl: horsLigne ? "Retirer du hors-ligne" : "Télécharger (écoute hors-ligne)", clic: telecharger },
                    ...(t.show_id
                      ? [
                          {
                            lbl: "Voir l'émission",
                            clic: () => {
                              fermerLecteurPodcast();
                              window.location.href = `/ecouter/?emission=${t.show_id}`;
                            },
                          },
                        ]
                      : []),
                  ].map((o) => (
                    <button
                      key={o.lbl}
                      type="button"
                      onClick={() => {
                        setOptions(false);
                        o.clic();
                      }}
                      className="block w-full px-4 py-4 text-left text-[15.5px] font-semibold text-cream active:bg-white/[0.05]"
                    >
                      {o.lbl}
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Minuteur de sommeil */}
          <AnimatePresence>
            {minuteur ? (
              <motion.div className="fixed inset-0 z-[5] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button type="button" aria-label="Fermer" onClick={() => setMinuteur(false)} className="absolute inset-0 bg-night-950/70" />
                <motion.div
                  initial={{ y: 30 }}
                  animate={{ y: 0 }}
                  exit={{ y: 30 }}
                  className="relative w-full max-w-md rounded-t-[28px] border border-white/10 bg-night-900 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4"
                >
                  <p className="text-center font-display text-[17px] font-bold">Arrêter la lecture</p>
                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    {[15, 30, 45, 60, 90].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          pod.setSleepTimer(m);
                          setMinuteur(false);
                        }}
                        className="rounded-2xl border border-white/10 bg-white/[0.05] py-3 text-[14px] font-semibold active:bg-white/[0.1]"
                      >
                        {m} min
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        pod.setSleepEpisodeEnd(true);
                        setMinuteur(false);
                      }}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] py-3 text-[13px] font-semibold active:bg-white/[0.1]"
                    >
                      Fin de l&apos;épisode
                    </button>
                  </div>
                  {timerActif ? (
                    <button
                      type="button"
                      onClick={() => {
                        pod.cancelSleep();
                        setMinuteur(false);
                      }}
                      className="mt-3 w-full rounded-full border border-white/15 py-3 text-[14px] font-semibold text-cream/80"
                    >
                      Annuler le minuteur
                    </button>
                  ) : null}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
