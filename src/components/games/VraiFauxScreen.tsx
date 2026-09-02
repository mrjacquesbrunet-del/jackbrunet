"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildDeck, recordVf, getVfBest, getVfXp, saveVfProgress, getVfProgress, clearVfProgress, VF_LIVES, VF_TIME, type VFItem, type VfProgress } from "@/lib/vraifaux";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getQuizCoins } from "@/lib/quiz";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { bumpAchv, markDayStreak, setAchvMax } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import { asset } from "@/lib/asset";
import {
  ArcadeShell,
  ArcadeHeader,
  HubHeader,
  IcoClock,
  IcoCheck,
  IcoCross,
  IcoPlay,
  IcoRefresh,
  IcoTrophy,
  IcoTarget,
  IcoBolt,
  IcoHeartFill,
  IcoFlameF,
  IcoPeople,
} from "./ArcadeUI";
import { VfDuel } from "@/components/games/VfDuel";
import { DuelLive, newDuelCode, type DuelRole } from "@/components/games/DuelLive";
import { useSearchParams } from "next/navigation";

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

const HEART = "M12 20s-7-4.6-9.2-9C1.3 8 3 5 6 5c1.8 0 3.2 1 3.99 2C10.8 6 12.2 5 14 5c3 0 4.7 3 3.2 6-2.2 4.4-9.2 9-9.2 9z";

type Phase = "hub" | "play" | "over";

export function VraiFauxScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hub");
  // Repart du haut de l'écran à chaque changement de vue (hub <-> jeu),
  // sinon la position de défilement est conservée sous la barre de statut.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  // Duel local à deux sur le même téléphone (écran miroir).
  const [duel, setDuel] = useState(false);
  // Duel EN LIGNE (temps réel, chacun son téléphone).
  const [live, setLive] = useState<{ code: string; role: DuelRole } | null>(null);
  const [liveMenu, setLiveMenu] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Lien de défi reçu (/vrai-faux?duel=CODE) → on rejoint le salon.
  const duelParam = searchParams.get("duel");
  useEffect(() => {
    if (duelParam) setLive({ code: duelParam.toUpperCase(), role: "guest" });
  }, [duelParam]);
  const [deck, setDeck] = useState<VFItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(VF_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [points, setPoints] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [reveal, setReveal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(VF_TIME);
  const [best, setBest] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [resumable, setResumable] = useState<VfProgress | null>(null);
  const [shake, setShake] = useState(false);
  const locked = reveal;

  useEffect(() => {
    setBest(getVfBest());
    setResumable(getVfProgress());
    setXp(getMemorizeXp() + getVfXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("vraifaux", getVfXp());
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      try {
        const { data } = await sb.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        setUserId(uid);
        const prof = await getProfile(uid);
        const first =
          (prof?.pseudo && prof.pseudo.trim()) ||
          (data.user?.user_metadata?.first_name as string | undefined) ||
          "";
        setName(first);
        setAvatar(prof?.avatar_url || null);
      } catch {
        /* avatar neutre */
      }
    })();
  }, []);

  const lvl = levelFromXp(xp);
  const cur = deck[idx];

  const start = () => {
    clearVfProgress();
    setResumable(null);
    const d = buildDeck();
    setDeck(d);
    setIdx(0);
    setLives(VF_LIVES);
    setScore(0);
    setCombo(0);
    setPoints(0);
    setPicked(null);
    setReveal(false);
    setTimeLeft(VF_TIME);
    setPhase("play");
    buzz(20);
  };

  const resume = () => {
    const p = resumable;
    if (!p) return;
    setDeck(p.deck);
    setIdx(p.idx);
    setLives(p.lives);
    setScore(p.score);
    setCombo(p.combo);
    setPoints(p.points);
    setPicked(null);
    setReveal(false);
    setTimeLeft(VF_TIME);
    setPhase("play");
    buzz(15);
  };

  const end = useCallback((finalScore: number, finalPoints: number) => {
    setPhase("over");
    clearVfProgress();
    setResumable(null);
    const res = recordVf(finalScore, finalPoints);
    setBest(res.best);
    setXp(getMemorizeXp() + getVfXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("vraifaux", getVfXp());
    submitWeeklyPoints(finalScore); // bonnes réponses -> ligue de la semaine
    bumpAchv("games_played");
    markDayStreak("play");
    checkLocalBadges();
  }, []);

  // Sauvegarde continue de la partie (au début de chaque affirmation).
  useEffect(() => {
    if (phase !== "play" || deck.length === 0 || reveal) return;
    saveVfProgress({ deck, idx, lives, score, combo, points, savedAt: Date.now() });
  }, [phase, deck, idx, lives, score, combo, points, reveal]);

  const answer = useCallback(
    (val: boolean | null) => {
      if (locked || !cur) return;
      const correct = val !== null && val === cur.answer;
      setPicked(val);
      setReveal(true);
      let nScore = score;
      let nLives = lives;
      let nPoints = points;
      if (correct) {
        const c = combo + 1;
        setCombo(c);
        nScore = score + 1;
        nPoints = points + 10 + Math.min(c, 10) * 2;
        setScore(nScore);
        setPoints(nPoints);
        buzz(25);
        // Badges : « Éclair » (réponse en ≤ 3 s), « Sans-faute »
        // (20 bonnes réponses sans perdre une seule vie), « Enchaîneur ».
        if (VF_TIME - timeLeft <= 3) bumpAchv("fast_answers");
        if (nScore === 20 && lives === VF_LIVES) bumpAchv("perfect_games");
        setAchvMax("vf_best_combo", c);
      } else {
        setCombo(0);
        nLives = lives - 1;
        setLives(nLives);
        setShake(true);
        setTimeout(() => setShake(false), 550);
        buzz([40, 60, 40]);
      }
      setTimeout(() => {
        if (nLives <= 0 || idx + 1 >= deck.length) {
          end(nScore, nPoints);
        } else {
          setIdx((i) => i + 1);
          setPicked(null);
          setReveal(false);
          setTimeLeft(VF_TIME);
        }
      }, 1500);
    },
    [locked, cur, score, lives, points, combo, idx, deck.length, end, timeLeft],
  );

  // Minuteur
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (phase !== "play" || reveal) return;
    timer.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [phase, reveal, idx]);
  useEffect(() => {
    if (phase === "play" && !reveal && timeLeft === 0) answer(null);
  }, [timeLeft, phase, reveal, answer]);

  /* ---------------- HUB ---------------- */
  if (phase === "hub") {
    return (
      <ArcadeShell decor="/img/jeux/decors/vraifaux.jpg">
        <HubHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={best} onGear={() => router.push("/profil")} />

        {/* Héros */}
        <div className="qm-hero mt-4" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(202,240,0,.16), transparent 55%), linear-gradient(135deg,rgba(30,30,29,.72) 0%,rgba(12,12,11,.84) 100%)" }}>
          <span className="pointer-events-none absolute right-4 top-4 text-[#CAF000]/10">
            <svg viewBox="0 0 24 24" className="h-24 w-24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16M8 20h8M6 7h12M6 7l-2.5 5a3 3 0 0 0 5 0zM18 7l-2.5 5a3 3 0 0 0 5 0z" /></svg>
          </span>
          <div className="relative max-w-[62%]">
            <span className="qm-rapide"><IcoBolt className="h-3.5 w-3.5" /> JEU RAPIDE</span>
            <h1 className="mt-2.5 font-game text-[2rem] font-black leading-[0.9] drop-shadow">
              VRAI <span className="text-[#CAF000]">ou</span> FAUX
            </h1>
            <p className="mt-2.5 font-game text-[13px] font-semibold leading-tight text-white/85">
              Réponds avant la fin du temps et enchaîne les bonnes réponses&nbsp;!
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/jeux/vraifaux.png")} alt="" className="qm-illo pointer-events-none absolute -bottom-2 -right-2 h-32 w-auto max-w-[38%] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.35)]" />
        </div>

        {/* Objectif + Record */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="qm-obj flex items-center gap-3">
            <span className="qm-obj-ic"><IcoTarget className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-teal-800">OBJECTIF</p>
              <p className="text-[11px] font-semibold leading-tight text-teal-900/80">Enchaîne un max de bonnes réponses&nbsp;!</p>
            </div>
          </div>
          <div className="qm-rec flex items-center gap-3">
            <span className="qm-rec-ic"><IcoTrophy className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-amber-700">RECORD</p>
              <p className="font-game text-2xl font-black leading-none text-[#4a2600]">{best}</p>
            </div>
          </div>
        </div>

        {/* Comment jouer */}
        <div className="qm-howto mt-4">
          <p className="font-game text-sm font-black tracking-wide text-[#CAF000]">COMMENT JOUER</p>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <div className="qm-mini" style={{ background: "linear-gradient(180deg,#fce7f3,#fbcfe8)" }}>
              <span className="qm-mini-ic" style={{ background: "linear-gradient(180deg,#f472b6,#db2777)" }}><IcoHeartFill className="h-5 w-5" /></span>
              <p className="mt-1.5 font-game text-[13px] font-black text-[#831843]">{VF_LIVES} vies</p>
              <p className="text-[9px] font-semibold text-[#9d174d]/70">Ne les perds pas</p>
            </div>
            <div className="qm-mini" style={{ background: "linear-gradient(180deg,#cffafe,#a5f3fc)" }}>
              <span className="qm-mini-ic" style={{ background: "linear-gradient(180deg,#22d3ee,#0891b2)" }}><IcoBolt className="h-5 w-5" /></span>
              <p className="mt-1.5 font-game text-[13px] font-black text-[#155e75]">{VF_TIME}s</p>
              <p className="text-[9px] font-semibold text-[#155e75]/70">Réponds vite</p>
            </div>
            <div className="qm-mini" style={{ background: "linear-gradient(180deg,#ffedd5,#fed7aa)" }}>
              <span className="qm-mini-ic" style={{ background: "linear-gradient(180deg,#fb923c,#ea580c)" }}><IcoFlameF className="h-5 w-5" /></span>
              <p className="mt-1.5 font-game text-[13px] font-black text-[#7c2d12]">Série</p>
              <p className="text-[9px] font-semibold text-[#7c2d12]/70">Bonus combo</p>
            </div>
          </div>
        </div>

        {/* JOUER */}
        {resumable ? (
          <button type="button" onClick={resume} className="qm-jouer mt-4">
            <IcoPlay className="h-6 w-6" /> REPRENDRE · {resumable.score}
          </button>
        ) : (
          <button type="button" onClick={start} className="qm-jouer mt-4">
            <IcoPlay className="h-6 w-6" /> JOUER
          </button>
        )}
        {resumable ? (
          <button type="button" onClick={start} className="mt-3 w-full font-game text-sm font-bold text-white/70">Nouvelle partie</button>
        ) : null}

        {/* DUEL à deux sur le même téléphone (écran miroir face à face) */}
        <button
          type="button"
          onClick={() => setDuel(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#FCD34D]/50 bg-[#FCD34D]/10 py-3.5 font-game text-base font-black text-[#FCD34D] transition-transform active:scale-[.98]"
        >
          <IcoPeople className="h-5 w-5" /> DUEL À DEUX · FACE À FACE
        </button>
        <p className="mt-1.5 text-center text-[11px] font-semibold text-white/45">
          Un seul téléphone posé entre vous : l&apos;écran se coupe en deux, chacun son côté.
        </p>

        {/* DUEL EN LIGNE : chacun son téléphone, en direct */}
        {userId ? (
          <>
            <button
              type="button"
              onClick={() => setLiveMenu(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#CAF000]/50 bg-[#CAF000]/10 py-3.5 font-game text-base font-black text-[#CAF000] transition-transform active:scale-[.98]"
            >
              <IcoBolt className="h-5 w-5" /> DUEL EN LIGNE · EN DIRECT
            </button>
            <p className="mt-1.5 text-center text-[11px] font-semibold text-white/45">
              Chacun son téléphone : envoie un lien de défi ou joue avec un membre connecté.
            </p>
          </>
        ) : null}

        {/* Choix du duel en ligne : créer un salon ou rejoindre avec un code */}
        {liveMenu ? (
          <div className="fixed inset-0 z-[125] flex items-end justify-center sm:items-center">
            <button type="button" aria-label="Fermer" onClick={() => setLiveMenu(false)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-t-3xl border border-white/10 bg-night-900 p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] text-cream sm:rounded-3xl sm:pb-5">
              <p className="font-game text-lg font-black">Duel en ligne</p>
              <button
                type="button"
                onClick={() => {
                  setLiveMenu(false);
                  bumpAchv("duels_started"); // badge « Lanceur de défis »
                  setLive({ code: newDuelCode(), role: "host" });
                }}
                className="mt-4 w-full rounded-full py-3.5 font-game text-base font-black text-[#1a2000]"
                style={{ background: "linear-gradient(180deg,#D8F53A,#AAD000)", boxShadow: "0 4px 0 #5b7300" }}
              >
                CRÉER UN SALON
              </button>
              <p className="mt-2 text-center text-[11px] text-cream/50">
                Tu obtiens un code et un lien à envoyer — la partie démarre dès que l&apos;autre rejoint.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  placeholder="CODE DU SALON"
                  className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-center font-game text-base font-black tracking-[0.25em] text-cream placeholder:text-cream/30 placeholder:tracking-normal focus:border-[#CAF000]/60 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={joinCode.length !== 6}
                  onClick={() => {
                    setLiveMenu(false);
                    setLive({ code: joinCode, role: "guest" });
                  }}
                  className="shrink-0 rounded-full bg-dawn-400 px-5 py-3 font-game text-sm font-black text-night-950 disabled:opacity-40"
                >
                  REJOINDRE
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex justify-center">
          <button type="button" onClick={() => router.push("/jeux")} className="qm-retour">
            <IcoRefresh className="h-4 w-4" /> RETOUR AUX JEUX
          </button>
        </div>

        <div className="mt-5">
          <ScoreBoard mode="vraifaux" accent="#CAF000" title="Classement · Vrai ou Faux" />
        </div>

        {duel ? <VfDuel onClose={() => setDuel(false)} /> : null}
        {live && userId ? (
          <DuelLive
            game="vraifaux"
            code={live.code}
            role={live.role}
            me={{ id: userId, pseudo: name, avatar }}
            onClose={() => setLive(null)}
          />
        ) : null}
      </ArcadeShell>
    );
  }

  /* ---------------- FIN ---------------- */
  if (phase === "over") {
    return (
      <ArcadeShell decor="/img/jeux/decors/vraifaux.jpg">
        <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={best} onBack={() => setPhase("hub")} />
        <div className="qm-card mt-6 p-8 text-center" style={{ animation: "qm-optin .3s ease-out" }}>
          <p className="font-game text-lg text-white/60">Partie terminée</p>
          <p className="my-3 font-game text-6xl font-black text-[#CAF000]">{score}</p>
          <p className="text-sm text-white/70">bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-game text-sm">
            <IcoTrophy className="h-4 w-4 text-amber-300" /> Record <span className="font-extrabold text-amber-300">{best}</span>
          </div>
        </div>
        <button type="button" onClick={start} className="qm-valid mt-4 flex w-full items-center justify-center gap-2">
          <IcoRefresh className="h-5 w-5" /> REJOUER
        </button>
        <button type="button" onClick={() => router.push("/jeux")} className="qm-ghost mt-2 w-full">
          Accueil des jeux
        </button>
      </ArcadeShell>
    );
  }

  /* ---------------- JEU ---------------- */
  const trueState = reveal ? (cur && cur.answer === true ? "correct" : picked === true ? "wrong" : "dim") : "idle";
  const falseState = reveal ? (cur && cur.answer === false ? "correct" : picked === false ? "wrong" : "dim") : "idle";
  const bigBtn = (state: string) => {
    const base = "flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl py-6 font-game text-2xl font-black transition-transform active:scale-[.98]";
    if (state === "dim") return `${base} opacity-40`;
    return base;
  };
  const bigStyle = (kind: "true" | "false", state: string): React.CSSProperties => {
    const green = "linear-gradient(180deg,#22c55e,#15803d)";
    const red = "linear-gradient(180deg,#ef4444,#991b1b)";
    if (state === "correct") return { background: green, boxShadow: "inset 0 2px 0 rgba(255,255,255,.4),0 6px 0 rgba(0,0,0,.25)" };
    if (state === "wrong") return { background: red, boxShadow: "inset 0 2px 0 rgba(255,255,255,.35),0 6px 0 rgba(0,0,0,.25)" };
    const g = kind === "true" ? "linear-gradient(180deg,#34d399,#059669)" : "linear-gradient(180deg,#fb7185,#e11d48)";
    return { background: g, color: "#fff", boxShadow: "inset 0 2px 0 rgba(255,255,255,.4),0 6px 0 rgba(0,0,0,.25)" };
  };

  return (
    <ArcadeShell decor="/img/jeux/decors/vraifaux.jpg">
      <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={score} onBack={() => setPhase("hub")} />

      {/* Carte état : vies · série · record */}
      <div className="qm-card relative mt-4 overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <span className="qm-pill-o">SÉRIE {combo}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: VF_LIVES }, (_, i) => (
              <svg key={i} viewBox="0 0 24 24" className={`h-6 w-6 ${i < lives ? "text-rose-400" : "text-white/20"}`} fill="currentColor" aria-hidden>
                <path d={HEART} />
              </svg>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-game text-4xl font-black leading-none">{score}</span>
          <span className="mb-1 font-game text-sm font-bold text-white/70">bonnes réponses · record {best}</span>
        </div>
      </div>

      {/* Carte affirmation */}
      <div key={idx} className={`qm-card mt-4 p-4 ${shake ? "qm-shake" : ""}`} style={{ animation: shake ? undefined : "qm-optin .35s ease-out" }}>
        <div className="flex items-center justify-between">
          <span className="qm-pill-p">VRAI OU FAUX ?</span>
          <span className={`qm-clock ${timeLeft <= 3 ? "text-rose-300" : ""}`}>
            <IcoClock className="h-4 w-4" /> {timeLeft}s
          </span>
        </div>
        <div className="qm-timebar mt-2">
          <i style={{ width: `${(timeLeft / VF_TIME) * 100}%`, transition: "width 1s linear", background: timeLeft <= 3 ? "linear-gradient(90deg,#fb7185,#e11d48)" : undefined }} />
        </div>
        <p className="mt-4 text-center font-game text-xl font-black leading-snug">{cur?.text}</p>
        {reveal && cur ? (
          <div className="mt-4 rounded-2xl bg-black/20 p-3 text-center text-sm text-white/85">
            <p className={`font-game font-black ${cur.answer ? "text-emerald-300" : "text-rose-300"}`}>{cur.answer ? "VRAI" : "FAUX"}</p>
            {cur.note ? <p className="mt-1 text-white/75">{cur.note}</p> : null}
            {cur.reference && cur.reference !== "—" ? <p className="mt-1 font-bold text-amber-300">{cur.reference}</p> : null}
          </div>
        ) : null}
      </div>

      {/* Boutons VRAI / FAUX */}
      <div className="mt-4 flex gap-2.5">
        <button type="button" disabled={locked} onClick={() => answer(true)} className={bigBtn(trueState)} style={bigStyle("true", trueState)}>
          <IcoCheck className="h-7 w-7" /> VRAI
        </button>
        <button type="button" disabled={locked} onClick={() => answer(false)} className={bigBtn(falseState)} style={bigStyle("false", falseState)}>
          <IcoCross className="h-7 w-7" /> FAUX
        </button>
      </div>
    </ArcadeShell>
  );
}

