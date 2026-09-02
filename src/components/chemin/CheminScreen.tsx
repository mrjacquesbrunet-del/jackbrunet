"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cheminStep,
  cheminCards,
  cheminChapitreOuvert,
  completeCheminStep,
  getCheminXp,
  type CheminChapitre,
  type CheminCarte,
  type CheminExercice,
} from "@/lib/chemin";
import { CHEMIN_CHAPITRES } from "@/config/chemin";
import { asset } from "@/lib/asset";
import { submitWeeklyPoints } from "@/lib/game-scores";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import { bumpAchv, markDayStreak } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";

/**
 * « Le Chemin » — la route d'apprentissage : une carte illustrée par chapitre
 * (décor 2K généré), un sentier de médaillons, des étapes récit + exercices,
 * des coffres bonus et une carte de personnage à la fin de chaque chapitre.
 */

const GOLD = "#FCD34D";

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

/* ---------- Icônes en trait (charte : pas d'emojis) ---------- */

function IcoCheck({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IcoLock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" />
    </svg>
  );
}
function IcoBook({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 6c-2-1.5-4.5-2-8-2v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2V4c-3.5 0-6 .5-8 2zM12 6v14" />
    </svg>
  );
}
function IcoCards({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 5h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM6 17.5 4.2 6.6a2 2 0 0 1 1.6-2.3L11 3.4" />
    </svg>
  );
}
function ChestSvg({ open = false, className = "h-9 w-9" }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <ellipse cx="24" cy="41" rx="14" ry="2.6" fill="rgba(0,0,0,.35)" />
      <rect x="8" y="22" width="32" height="16" rx="3" fill="#8a5a2b" stroke="#4e3014" strokeWidth="2" />
      <path d={open ? "M8 20c0-7 7-11 16-11s16 4 16 11l-2 2H10z" : "M8 22c0-7 7-11 16-11s16 4 16 11z"} fill={open ? "#b07a41" : "#a8743d"} stroke="#4e3014" strokeWidth="2" />
      <rect x="21" y="24" width="6" height="9" rx="1.5" fill={GOLD} stroke="#92400e" strokeWidth="1.6" />
      {open ? (
        <g fill={GOLD}>
          <circle cx="17" cy="16" r="2" />
          <circle cx="24" cy="12" r="2.4" />
          <circle cx="31" cy="16" r="2" />
        </g>
      ) : null}
    </svg>
  );
}

/* ---------- Positions du sentier ---------- */

function nodePositions(n: number): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n <= 1 ? 0 : i / (n - 1);
    return { x: 50 + 27 * Math.sin(i * 1.25 + 0.6), y: 88 - t * 76 };
  });
}

function pathD(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const my = (p.y + c.y) / 2;
    d += ` C ${p.x} ${my}, ${c.x} ${my}, ${c.x} ${c.y}`;
  }
  return d;
}

const RARETE_LABEL: Record<CheminCarte["rarete"], string> = {
  commune: "Commune",
  rare: "Rare",
  epique: "Épique",
  legendaire: "Légendaire",
};

/* ==================== Écran principal ==================== */

type Phase = "map" | "lesson";

export function CheminScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("map");
  const [chapIdx, setChapIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [, setTick] = useState(0);

  // Repart du haut de l'écran à chaque changement de vue.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase, chapIdx]);

  // À l'ouverture : se placer sur le premier chapitre non terminé.
  useEffect(() => {
    const i = CHEMIN_CHAPITRES.findIndex((c) => cheminStep(c.id) < c.etapes.length);
    setChapIdx(i === -1 ? CHEMIN_CHAPITRES.length - 1 : i);
  }, []);

  const chap = CHEMIN_CHAPITRES[chapIdx];

  if (phase === "lesson") {
    return (
      <CheminLesson
        chap={chap}
        stepIdx={stepIdx}
        onDone={() => {
          setPhase("map");
          setTick((t) => t + 1);
        }}
      />
    );
  }

  const done = cheminStep(chap.id);
  const pts = nodePositions(chap.etapes.length);
  const cards = cheminCards();
  const ouvert = cheminChapitreOuvert(CHEMIN_CHAPITRES, chapIdx);

  return (
    <div className="dark-ctx relative min-h-screen overflow-hidden text-white" style={{ background: `linear-gradient(180deg, ${chap.fallback[0]}, ${chap.fallback[1]} 55%, ${chap.fallback[2]})` }}>
      <PlansDarkBg />
      {/* Décor 2K du chapitre (dès qu'il est installé) */}
      <DecorImage src={asset(chap.decor)} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.05) 22%, rgba(0,0,0,.05) 70%, rgba(0,0,0,.5) 100%)" }} />

      <div className="container-x relative mx-auto flex min-h-screen max-w-md flex-col pb-8 pt-20 sm:pt-24">
        {/* En-tête du chapitre */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => router.push("/jeux")} className="flex items-center gap-1.5 rounded-full bg-black/45 px-3.5 py-2 font-game text-xs font-black text-white/85 backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}><path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            JEUX
          </button>
          <button type="button" onClick={() => setAlbumOpen(true)} className="flex items-center gap-2 rounded-full bg-black/45 px-3.5 py-2 font-game text-xs font-black text-amber-300 backdrop-blur">
            <IcoCards className="h-4 w-4" />
            {cards.length}/{CHEMIN_CHAPITRES.length} CARTES
          </button>
        </div>

        <div className="mt-3 rounded-3xl bg-black/45 px-5 py-3.5 text-center backdrop-blur">
          <p className="font-game text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Chapitre {chap.id} · {chap.livre}</p>
          <h1 className="font-game text-2xl font-black" style={{ color: chap.accent }}>{chap.nom}</h1>
          <div className="mx-auto mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
            <i className="block h-full rounded-full" style={{ width: `${(done / chap.etapes.length) * 100}%`, background: GOLD }} />
          </div>
          <p className="mt-1 font-game text-[11px] font-bold text-white/70">{done}/{chap.etapes.length} étapes · {getCheminXp()} XP</p>
        </div>

        {/* Le sentier */}
        <div className="relative mt-2 w-full flex-1" style={{ minHeight: 440 }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d={pathD(pts)} fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="7" strokeLinecap="round" />
            <path d={pathD(pts)} fill="none" stroke="rgba(252,211,77,.9)" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="0.1 7.5" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.6))" }} />
          </svg>
          {chap.etapes.map((et, i) => {
            const p = pts[i];
            const fait = ouvert && i < done;
            const courant = ouvert && i === done;
            const verrou = !ouvert || i > done;
            return (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                {et.coffre ? (
                  <div className="absolute -right-11 top-0"><ChestSvg open={fait} /></div>
                ) : null}
                <button
                  type="button"
                  disabled={verrou}
                  onClick={() => {
                    setStepIdx(i);
                    setPhase("lesson");
                    buzz(15);
                  }}
                  className="relative grid h-14 w-14 place-items-center rounded-full font-game text-lg font-black transition-transform active:scale-90"
                  style={
                    fait
                      ? { background: "linear-gradient(180deg,#FCD34D,#F59E0B)", color: "#4a2600", boxShadow: "0 4px 0 #92400e, 0 6px 14px rgba(0,0,0,.5)" }
                      : courant
                        ? { background: `linear-gradient(180deg,${chap.accent},${chap.accent}cc)`, color: "#08130a", boxShadow: `0 4px 0 rgba(0,0,0,.45), 0 0 22px ${chap.accent}88`, animation: "chemin-pulse 1.6s ease-in-out infinite" }
                        : { background: "rgba(12,12,11,.72)", color: "rgba(243,243,237,.45)", border: "2px solid rgba(255,255,255,.18)", boxShadow: "0 4px 0 rgba(0,0,0,.4)" }
                  }
                >
                  {fait ? <IcoCheck /> : verrou ? <IcoLock /> : i + 1}
                </button>
              </div>
            );
          })}
        </div>

        {/* Navigation entre chapitres */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={chapIdx === 0}
            onClick={() => setChapIdx((i) => Math.max(0, i - 1))}
            className="flex-1 rounded-2xl bg-black/45 py-3 font-game text-xs font-black text-white/80 backdrop-blur disabled:opacity-30"
          >
            CHAPITRE PRÉCÉDENT
          </button>
          <button
            type="button"
            disabled={chapIdx + 1 >= CHEMIN_CHAPITRES.length || !cheminChapitreOuvert(CHEMIN_CHAPITRES, chapIdx + 1)}
            onClick={() => setChapIdx((i) => Math.min(CHEMIN_CHAPITRES.length - 1, i + 1))}
            className="flex-1 rounded-2xl py-3 font-game text-xs font-black text-[#08130a] disabled:opacity-30"
            style={{ background: `linear-gradient(180deg,${chap.accent},${chap.accent}bb)` }}
          >
            CHAPITRE SUIVANT
          </button>
        </div>
      </div>

      {albumOpen ? <AlbumCartes onClose={() => setAlbumOpen(false)} /> : null}

      <style>{`
        @keyframes chemin-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}

/** Décor de chapitre : ne s'affiche qu'une fois réellement chargé. */
function DecorImage({ src }: { src: string }) {
  const [ok, setOk] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onLoad={() => setOk(true)}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
      style={{ opacity: ok ? 1 : 0 }}
    />
  );
}

/* ==================== L'album de cartes ==================== */

function AlbumCartes({ onClose }: { onClose: () => void }) {
  const cards = cheminCards();
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-night-950/85 backdrop-blur-sm" />
      <div className="relative max-h-[82vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-night-900 p-5 sm:rounded-3xl" style={{ animation: "qm-optin .3s ease-out" }}>
        <p className="text-center font-game text-lg font-black text-amber-300">MES CARTES</p>
        <p className="mt-1 text-center text-xs text-white/55">Termine le chapitre d&apos;un personnage pour gagner sa carte.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {CHEMIN_CHAPITRES.map((c) => {
            const gagnee = cards.includes(c.carte.id);
            return (
              <div key={c.carte.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: gagnee ? "rgba(252,211,77,.6)" : "rgba(255,255,255,.1)" }}>
                <div className="relative aspect-[2/3]" style={{ background: `linear-gradient(160deg, ${c.fallback[0]}, ${c.fallback[2]})` }}>
                  {gagnee ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset(c.carte.image)} alt={c.carte.nom} onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-white/25">
                      <IcoLock className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="bg-black/40 px-2.5 py-2 text-center">
                  <p className="font-game text-[12px] font-black" style={{ color: gagnee ? "#FCD34D" : "rgba(243,243,237,.5)" }}>{c.carte.nom}</p>
                  <p className="text-[10px] font-semibold text-white/45">{gagnee ? RARETE_LABEL[c.carte.rarete] : "À découvrir"}</p>
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-full bg-amber-400 py-3 font-game text-sm font-black text-night-950">
          FERMER
        </button>
      </div>
    </div>
  );
}

/* ==================== Une étape : récit + exercices ==================== */

function CheminLesson({ chap, stepIdx, onDone }: { chap: CheminChapitre; stepIdx: number; onDone: () => void }) {
  const etape = chap.etapes[stepIdx];
  const [screen, setScreen] = useState(0); // 0 = récit, 1..n = exercices, n+1 = fin
  const [fautes, setFautes] = useState(0);
  const [gains, setGains] = useState<ReturnType<typeof completeCheminStep> | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const total = etape.exercices.length;

  function nextAfterExercise(ok: boolean) {
    if (!ok) setFautes((f) => f + 1);
    if (screen >= total) {
      const nbFautes = fautes + (ok ? 0 : 1);
      const res = completeCheminStep(chap, stepIdx, nbFautes);
      if (!res.dejaFaite) {
        submitWeeklyPoints(nbFautes === 0 ? 3 : 2);
        bumpAchv("games_played");
        markDayStreak("play");
        checkLocalBadges();
      }
      setGains(res);
      buzz([25, 40, 70]);
    }
    setScreen((s) => s + 1);
  }

  return (
    <div className="dark-ctx min-h-screen pb-16 pt-20 text-white sm:pt-24" style={{ background: `linear-gradient(180deg, ${chap.fallback[0]}, ${chap.fallback[2]})` }}>
      <PlansDarkBg />
      <div className="container-x mx-auto max-w-md">
        {/* Barre de progression de l'étape */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={onDone} className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white/75" aria-label="Quitter">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/40">
            <i className="block h-full rounded-full transition-all duration-300" style={{ width: `${(Math.min(screen, total + 1) / (total + 1)) * 100}%`, background: `linear-gradient(90deg, ${chap.accent}, ${GOLD})` }} />
          </div>
          <span className="font-game text-xs font-black text-white/70">{chap.id}·{stepIdx + 1}</span>
        </div>

        {screen === 0 ? (
          /* ----- Le récit ----- */
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur" style={{ animation: "qm-optin .3s ease-out" }}>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-game text-[11px] font-black uppercase tracking-wider" style={{ background: `${chap.accent}22`, color: chap.accent }}>
              <IcoBook className="h-4 w-4" /> L&apos;histoire
            </span>
            <p className="mt-4 font-game text-[17px] font-semibold leading-relaxed text-white/95">{etape.recit}</p>
            <p className="mt-3 text-xs font-bold" style={{ color: chap.accent }}>{etape.ref}</p>
            <button type="button" onClick={() => setScreen(1)} className="mt-6 w-full rounded-full py-3.5 font-game text-base font-black text-[#08130a]" style={{ background: `linear-gradient(180deg,${chap.accent},${chap.accent}bb)`, boxShadow: "0 4px 0 rgba(0,0,0,.4)" }}>
              C&apos;EST PARTI
            </button>
          </div>
        ) : screen <= total ? (
          <Exercice key={screen} ex={etape.exercices[screen - 1]} accent={chap.accent} onNext={nextAfterExercise} />
        ) : (
          /* ----- Fin d'étape ----- */
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-6 text-center backdrop-blur" style={{ animation: "qm-optin .35s ease-out" }}>
            <p className="font-game text-2xl font-black" style={{ color: chap.accent }}>
              {fautes === 0 ? "SANS FAUTE !" : "ÉTAPE RÉUSSIE !"}
            </p>
            <p className="mt-2 text-sm text-white/70">
              {total - Math.min(fautes, total)}/{total} exercices réussis du premier coup
            </p>
            {gains ? <p className="mt-3 font-game text-lg font-black text-amber-300">+{gains.xp} XP</p> : null}
            {gains && gains.coffreGemmes > 0 ? (
              <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3">
                <ChestSvg open className="h-10 w-10" />
                <p className="font-game text-sm font-black text-amber-300">COFFRE OUVERT · +{gains.coffreGemmes} gemmes</p>
              </div>
            ) : null}
            {gains && gains.carte ? (
              <div className="mt-4 rounded-2xl border-2 border-amber-400/70 bg-black/50 p-4">
                <p className="font-game text-[11px] font-black uppercase tracking-[0.25em] text-amber-300">Carte gagnée</p>
                <div className="relative mx-auto mt-3 aspect-[2/3] w-36 overflow-hidden rounded-xl border border-amber-300/60" style={{ background: `linear-gradient(160deg, ${chap.fallback[0]}, ${chap.fallback[2]})` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(gains.carte.image)} alt={gains.carte.nom} onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <p className="mt-2 font-game text-base font-black text-amber-300">{gains.carte.nom}</p>
                <p className="text-[11px] font-semibold text-white/60">{gains.carte.titre} · {RARETE_LABEL[gains.carte.rarete]}</p>
              </div>
            ) : null}
            <button type="button" onClick={onDone} className="mt-6 w-full rounded-full py-3.5 font-game text-base font-black text-[#08130a]" style={{ background: `linear-gradient(180deg,${GOLD},#F59E0B)`, boxShadow: "0 4px 0 #92400e" }}>
              CONTINUER LE CHEMIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== Les exercices ==================== */

function Exercice({ ex, accent, onNext }: { ex: CheminExercice; accent: string; onNext: (ok: boolean) => void }) {
  if (ex.type === "qcm") return <ExQcm q={ex.q} choix={ex.choix} bonne={ex.bonne} accent={accent} onNext={onNext} />;
  if (ex.type === "vf") return <ExVf q={ex.q} vrai={ex.vrai} accent={accent} onNext={onNext} />;
  if (ex.type === "trou") return <ExTrou texte={ex.texte} reponse={ex.reponse} leurres={ex.leurres} accent={accent} onNext={onNext} />;
  return <ExOrdre consigne={ex.consigne} items={ex.items} accent={accent} onNext={onNext} />;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CadreExercice({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur" style={{ animation: "qm-optin .25s ease-out" }}>
      <span className="rounded-full px-3 py-1 font-game text-[11px] font-black uppercase tracking-wider" style={{ background: `${accent}22`, color: accent }}>{label}</span>
      {children}
    </div>
  );
}

function BoutonSuite({ reveal, ok, onNext }: { reveal: boolean; ok: boolean; onNext: (ok: boolean) => void }) {
  if (!reveal) return null;
  return (
    <button
      type="button"
      onClick={() => onNext(ok)}
      className="mt-5 w-full rounded-full py-3.5 font-game text-base font-black"
      style={ok ? { background: "linear-gradient(180deg,#4ADE80,#16A34A)", color: "#052e16", boxShadow: "0 4px 0 #14532d" } : { background: "linear-gradient(180deg,#fb7185,#e11d48)", color: "#4c0519", boxShadow: "0 4px 0 #881337" }}
    >
      {ok ? "CONTINUER" : "COMPRIS, ON CONTINUE"}
    </button>
  );
}

function ExQcm({ q, choix, bonne, accent, onNext }: { q: string; choix: string[]; bonne: number; accent: string; onNext: (ok: boolean) => void }) {
  const ordre = useMemo(() => shuffle(choix.map((_, i) => i)), [choix]);
  const [pick, setPick] = useState<number | null>(null);
  const reveal = pick !== null;
  return (
    <CadreExercice label="Question" accent={accent}>
      <p className="mt-3 font-game text-[16px] font-bold leading-snug text-white">{q}</p>
      <div className="mt-4 flex flex-col gap-2.5">
        {ordre.map((i) => {
          const isGood = i === bonne;
          const isPicked = pick === i;
          let cls = "border-white/12 bg-white/[0.06] text-white";
          if (reveal && isGood) cls = "border-emerald-400 bg-emerald-400/20 text-emerald-200";
          else if (reveal && isPicked) cls = "border-rose-400 bg-rose-400/20 text-rose-200";
          else if (reveal) cls = "border-white/10 bg-white/[0.04] text-white/40";
          return (
            <button key={i} type="button" disabled={reveal} onClick={() => { setPick(i); buzz(i === bonne ? 18 : [30, 30, 30]); }} className={`rounded-2xl border-2 px-4 py-3 text-left font-game text-[14px] font-bold transition-transform active:scale-[.98] ${cls}`}>
              {choix[i]}
            </button>
          );
        })}
      </div>
      <BoutonSuite reveal={reveal} ok={pick === bonne} onNext={onNext} />
    </CadreExercice>
  );
}

function ExVf({ q, vrai, accent, onNext }: { q: string; vrai: boolean; accent: string; onNext: (ok: boolean) => void }) {
  const [pick, setPick] = useState<boolean | null>(null);
  const reveal = pick !== null;
  return (
    <CadreExercice label="Vrai ou faux" accent={accent}>
      <p className="mt-3 font-game text-[16px] font-bold leading-snug text-white">{q}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[true, false].map((v) => {
          const isGood = v === vrai;
          const isPicked = pick === v;
          let style: React.CSSProperties = { background: v ? "linear-gradient(180deg,#4ADE80,#16A34A)" : "linear-gradient(180deg,#fb7185,#e11d48)", color: v ? "#052e16" : "#4c0519" };
          if (reveal && !isGood && !isPicked) style = { background: "rgba(255,255,255,.06)", color: "rgba(243,243,237,.35)" };
          if (reveal && isPicked && !isGood) style = { background: "rgba(225,29,72,.25)", color: "#fecdd3", border: "2px solid #fb7185" };
          if (reveal && isGood) style = { ...style, boxShadow: "0 0 0 3px rgba(255,255,255,.5)" };
          return (
            <button key={String(v)} type="button" disabled={reveal} onClick={() => { setPick(v); buzz(v === vrai ? 18 : [30, 30, 30]); }} className="rounded-2xl py-4 font-game text-lg font-black transition-transform active:scale-[.97]" style={style}>
              {v ? "VRAI" : "FAUX"}
            </button>
          );
        })}
      </div>
      <BoutonSuite reveal={reveal} ok={pick === vrai} onNext={onNext} />
    </CadreExercice>
  );
}

function ExTrou({ texte, reponse, leurres, accent, onNext }: { texte: string; reponse: string; leurres: string[]; accent: string; onNext: (ok: boolean) => void }) {
  const options = useMemo(() => shuffle([reponse, ...leurres]), [reponse, leurres]);
  const [pick, setPick] = useState<string | null>(null);
  const reveal = pick !== null;
  const [avant, apres] = texte.split("___");
  return (
    <CadreExercice label="Le mot manquant" accent={accent}>
      <p className="mt-3 font-game text-[16px] font-bold leading-relaxed text-white">
        {avant}
        <span className="mx-1 inline-block min-w-[64px] rounded-lg border-b-2 px-2 text-center" style={{ borderColor: accent, color: reveal ? (pick === reponse ? "#6ee7b7" : "#fda4af") : accent }}>
          {reveal ? reponse : "…"}
        </span>
        {apres}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {options.map((w) => {
          const isGood = w === reponse;
          const isPicked = pick === w;
          let cls = "border-white/12 bg-white/[0.06] text-white";
          if (reveal && isGood) cls = "border-emerald-400 bg-emerald-400/20 text-emerald-200";
          else if (reveal && isPicked) cls = "border-rose-400 bg-rose-400/20 text-rose-200";
          else if (reveal) cls = "border-white/10 bg-white/[0.04] text-white/40";
          return (
            <button key={w} type="button" disabled={reveal} onClick={() => { setPick(w); buzz(w === reponse ? 18 : [30, 30, 30]); }} className={`rounded-2xl border-2 px-3 py-3 text-center font-game text-[14px] font-black transition-transform active:scale-[.97] ${cls}`}>
              {w}
            </button>
          );
        })}
      </div>
      <BoutonSuite reveal={reveal} ok={pick === reponse} onNext={onNext} />
    </CadreExercice>
  );
}

function ExOrdre({ consigne, items, accent, onNext }: { consigne: string; items: string[]; accent: string; onNext: (ok: boolean) => void }) {
  const [pool, setPool] = useState<string[]>(() => {
    let melange = shuffle(items);
    // Éviter de proposer l'ordre déjà correct.
    if (melange.join("|") === items.join("|") && items.length > 1) melange = [...melange.slice(1), melange[0]];
    return melange;
  });
  const [choisis, setChoisis] = useState<string[]>([]);
  const [reveal, setReveal] = useState(false);
  const ok = reveal && choisis.join("|") === items.join("|");

  function pickItem(w: string) {
    if (reveal) return;
    const next = [...choisis, w];
    setChoisis(next);
    setPool((p) => p.filter((x) => x !== w));
    buzz(10);
    if (next.length === items.length) {
      setReveal(true);
      buzz(next.join("|") === items.join("|") ? [20, 30, 50] : [40, 40, 40]);
    }
  }

  return (
    <CadreExercice label="Dans l'ordre" accent={accent}>
      <p className="mt-3 font-game text-[15px] font-bold leading-snug text-white">{consigne}</p>
      {/* La séquence choisie */}
      <div className="mt-4 flex flex-col gap-2">
        {choisis.map((w, i) => {
          const bon = !reveal || items[i] === w;
          return (
            <div key={w} className={`flex items-center gap-2.5 rounded-2xl border-2 px-3.5 py-2.5 font-game text-[13px] font-bold ${reveal ? (bon ? "border-emerald-400 bg-emerald-400/15 text-emerald-200" : "border-rose-400 bg-rose-400/15 text-rose-200") : "border-white/15 bg-white/[0.08] text-white"}`}>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-black" style={{ background: `${accent}30`, color: accent }}>{i + 1}</span>
              {w}
            </div>
          );
        })}
        {choisis.length < items.length ? (
          <div className="rounded-2xl border-2 border-dashed border-white/20 px-3.5 py-2.5 text-center font-game text-[12px] font-bold text-white/40">
            Touche l&apos;événement suivant…
          </div>
        ) : null}
      </div>
      {/* Le vivier */}
      {pool.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {pool.map((w) => (
            <button key={w} type="button" onClick={() => pickItem(w)} className="rounded-2xl border-2 border-white/12 bg-white/[0.06] px-3.5 py-2.5 font-game text-[13px] font-bold text-white transition-transform active:scale-[.96]">
              {w}
            </button>
          ))}
        </div>
      ) : null}
      {reveal && !ok ? (
        <p className="mt-3 text-center text-[12px] font-semibold text-white/60">
          Le bon ordre : {items.join(" → ")}
        </p>
      ) : null}
      <BoutonSuite reveal={reveal} ok={ok} onNext={onNext} />
    </CadreExercice>
  );
}
