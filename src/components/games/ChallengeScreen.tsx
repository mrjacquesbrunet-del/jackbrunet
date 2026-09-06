"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listFollowing, type Profile } from "@/lib/community";
import { currentUserId } from "@/lib/game-scores";
import { GameDecor } from "./ArcadeUI";
import {
  buildChallengeDeck,
  newSeed,
  createChallenge,
  answerChallenge,
  listChallenges,
  CHALLENGE_LEN,
  type ChallengeGame,
  type ChallengeItem,
  type ChallengeRow,
} from "@/lib/challenges";

const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconUser = S("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0");
const IconSword = S("M14.5 4H20v5.5L9.5 20 4 14.5zM15 9l-6 6M4 20l3-3");
const IconBack = S("M15 6l-6 6 6 6");
const IconCheck = S("M5 12l4.5 4.5L19 7");
const IconCap = S("M3 9l9-4 9 4-9 4zM7 11v4c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-4");
const IconScale = S("M12 4v16M8 20h8M6 7h12M6 7l-2.5 5a3 3 0 0 0 5 0zM18 7l-2.5 5a3 3 0 0 0 5 0z");
const LETTERS = ["A", "B", "C", "D"];

function Avatar({ url, size = 40 }: { url?: string | null; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="shrink-0 rounded-full object-cover ring-1 ring-white/15" style={{ width: size, height: size }} />
  ) : (
    <span className="grid shrink-0 place-items-center rounded-full bg-white/10 text-cream/60 ring-1 ring-white/15" style={{ width: size, height: size }}>
      <IconUser className="h-1/2 w-1/2" />
    </span>
  );
}

type Session =
  | { mode: "create"; game: ChallengeGame; seed: number; opponent: Profile }
  | { mode: "answer"; row: ChallengeRow };

type Phase = "menu" | "pick" | "play" | "over";

export function ChallengeScreen() {
  const [phase, setPhase] = useState<Phase>("menu");
  // Repart du haut de l'écran à chaque changement de vue (hub <-> jeu),
  // sinon la position de défilement est conservée sous la barre de statut.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  const [meId, setMeId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Profile[] | null>(null);
  const [rows, setRows] = useState<ChallengeRow[] | null>(null);
  const [pickGame, setPickGame] = useState<ChallengeGame>("vraifaux");

  const [session, setSession] = useState<Session | null>(null);
  const [deck, setDeck] = useState<ChallengeItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const reveal = picked !== null;
  const [sent, setSent] = useState(false);

  const reload = () => {
    listChallenges().then(setRows);
  };

  useEffect(() => {
    currentUserId().then((id) => {
      setMeId(id);
      if (id) listFollowing(id).then(setFriends);
      else setFriends([]);
    });
    reload();
  }, []);

  // Verrou du défilement de fond (écran plein écran).
  useEffect(() => {
    const b = document.body,
      h = document.documentElement;
    const pb = b.style.overflow,
      ph = h.style.overflow;
    b.style.overflow = "hidden";
    h.style.overflow = "hidden";
    return () => {
      b.style.overflow = pb;
      h.style.overflow = ph;
    };
  }, []);

  const received = useMemo(
    () => (rows || []).filter((r) => !r.i_am_challenger && r.status === "pending"),
    [rows],
  );
  const others = useMemo(
    () => (rows || []).filter((r) => r.i_am_challenger || r.status === "done"),
    [rows],
  );

  const startCreate = (game: ChallengeGame, opponent: Profile) => {
    const seed = newSeed();
    setSession({ mode: "create", game, seed, opponent });
    setDeck(buildChallengeDeck(game, seed));
    setIdx(0);
    setScore(0);
    setPicked(null);
    setSent(false);
    setPhase("play");
  };
  const startAnswer = (row: ChallengeRow) => {
    setSession({ mode: "answer", row });
    setDeck(buildChallengeDeck(row.game, Number(row.seed)));
    setIdx(0);
    setScore(0);
    setPicked(null);
    setSent(false);
    setPhase("play");
  };

  const cur = deck[idx];
  const answer = (i: number) => {
    if (picked !== null || !cur) return;
    setPicked(i);
    const good = i === cur.correct;
    const ns = good ? score + 1 : score;
    if (good) setScore(ns);
    setTimeout(async () => {
      if (idx + 1 >= deck.length) {
        // Fin du défi
        if (session?.mode === "create") {
          await createChallenge(session.game, session.seed, session.opponent.id, ns);
        } else if (session?.mode === "answer") {
          await answerChallenge(session.row.id, ns);
        }
        setSent(true);
        reload();
        setPhase("over");
      } else {
        setIdx((n) => n + 1);
        setPicked(null);
      }
    }, 900);
  };

  /* ---------------- MENU ---------------- */
  if (phase === "menu") {
    return (
      <Shell title="Défier un ami">
        {meId === null ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-cream/70">
            Connecte-toi pour défier tes amis et voir tes défis.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setPhase("pick")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-dawn-300 to-dawn-500 py-4 font-game text-lg font-black text-night-950 shadow-[inset_0_2px_0_rgba(255,255,255,.4),0_5px_0_#5b7300] active:translate-y-[2px]"
            >
              <IconSword className="h-5 w-5" /> Lancer un défi
            </button>

            {/* Défis reçus à relever */}
            <h2 className="mt-6 font-game text-lg font-extrabold">À relever</h2>
            {received.length === 0 ? (
              <p className="mt-2 text-sm text-cream/50">Aucun défi reçu pour l&apos;instant.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {received.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-dawn-400/30 bg-dawn-400/[0.06] p-3">
                    <Avatar url={r.challenger_avatar} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-game text-sm font-bold">{r.challenger_pseudo || "Un ami"}</p>
                      <p className="text-[11px] text-cream/60">
                        te défie · {gameLabel(r.game)} · a fait {r.challenger_score}/{CHALLENGE_LEN}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startAnswer(r)}
                      className="shrink-0 rounded-full bg-dawn-400 px-4 py-2 font-game text-xs font-extrabold text-night-950"
                    >
                      Relever
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Défis envoyés / terminés */}
            <h2 className="mt-6 font-game text-lg font-extrabold">Mes défis</h2>
            {others.length === 0 ? (
              <p className="mt-2 text-sm text-cream/50">Lance ton premier défi&nbsp;!</p>
            ) : (
              <div className="mt-2 space-y-2">
                {others.map((r) => (
                  <ChallengeRowView key={r.id} r={r} />
                ))}
              </div>
            )}
          </>
        )}
      </Shell>
    );
  }

  /* ---------------- CHOIX AMI + JEU ---------------- */
  if (phase === "pick") {
    return (
      <Shell title="Choisis un ami" onBack={() => setPhase("menu")}>
        <p className="font-game text-sm font-bold text-cream/70">Le jeu du défi</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPickGame("vraifaux")}
            className={`flex items-center justify-center gap-2 rounded-2xl border p-3 font-game text-sm font-bold ${pickGame === "vraifaux" ? "border-dawn-400 bg-dawn-400/15 text-cream" : "border-white/12 bg-white/[0.04] text-cream/70"}`}
          >
            <IconScale className="h-5 w-5" /> Vrai ou Faux
          </button>
          <button
            type="button"
            onClick={() => setPickGame("quiz")}
            className={`flex items-center justify-center gap-2 rounded-2xl border p-3 font-game text-sm font-bold ${pickGame === "quiz" ? "border-dawn-400 bg-dawn-400/15 text-cream" : "border-white/12 bg-white/[0.04] text-cream/70"}`}
          >
            <IconCap className="h-5 w-5" /> Connaissances
          </button>
        </div>

        <p className="mt-5 font-game text-sm font-bold text-cream/70">Tes amis</p>
        {friends === null ? (
          <p className="mt-2 text-sm text-cream/50">Chargement…</p>
        ) : friends.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-cream/60">
            Tu ne suis encore personne. Abonne-toi à des membres depuis la communauté pour pouvoir les défier.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {friends.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => startCreate(pickGame, f)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left active:bg-white/[0.07]"
              >
                <Avatar url={f.avatar_url} />
                <span className="min-w-0 flex-1 truncate font-game text-sm font-bold text-cream">{f.pseudo || "Membre"}</span>
                <span className="shrink-0 rounded-full bg-dawn-400 px-3 py-1.5 font-game text-xs font-extrabold text-night-950">Défier</span>
              </button>
            ))}
          </div>
        )}
      </Shell>
    );
  }

  /* ---------------- JEU ---------------- */
  if (phase === "play") {
    return (
      <Shell title={session?.mode === "answer" ? "Tu relèves le défi" : "À toi de jouer"}>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-3 py-1 font-game text-xs font-extrabold text-dawn-300">
            Question {idx + 1}/{deck.length}
          </span>
          <span className="font-game text-sm font-extrabold">Score {score}</span>
        </div>

        <div key={idx} className="mt-4 rounded-3xl border border-white/10 bg-white/[0.05] p-5" style={{ animation: "fadeup .3s ease-out" }}>
          <p className="font-game text-lg font-bold leading-snug">{cur?.q}</p>
        </div>

        <div className="mt-4 space-y-2.5">
          {cur?.options.map((opt, i) => {
            const showCorrect = reveal && i === cur.correct;
            const showWrong = reveal && picked === i && i !== cur.correct;
            const cls = showCorrect
              ? "border-[#22c55e] bg-[#22c55e] text-white"
              : showWrong
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-white/12 bg-night-900/60 text-cream";
            return (
              <button
                key={i}
                type="button"
                disabled={reveal}
                onClick={() => answer(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-game text-base font-bold ${cls}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/20 text-sm">
                  {cur.options.length === 2 ? (i === 0 ? <IconCheck className="h-4 w-4" /> : "✕") : LETTERS[i]}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>
      </Shell>
    );
  }

  /* ---------------- RÉSULTAT ---------------- */
  const isAnswer = session?.mode === "answer";
  const challengerScore = isAnswer && session ? session.row.challenger_score : null;
  const outcome =
    isAnswer && challengerScore !== null
      ? score > challengerScore
        ? "win"
        : score < challengerScore
          ? "lose"
          : "draw"
      : null;

  return (
    <Shell title="Résultat">
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center">
        {isAnswer ? (
          <>
            <p className="font-game text-sm text-cream/60">
              {outcome === "win" ? "Tu gagnes le défi !" : outcome === "lose" ? "Défi perdu…" : "Égalité !"}
            </p>
            <div className="mt-3 flex items-center justify-center gap-5">
              <div>
                <p className="font-game text-4xl font-black text-dawn-300">{score}</p>
                <p className="text-[11px] text-cream/55">toi</p>
              </div>
              <span className="font-game text-xl font-bold text-cream/40">/</span>
              <div>
                <p className="font-game text-4xl font-black text-cream/80">{challengerScore}</p>
                <p className="text-[11px] text-cream/55">{session && session.mode === "answer" ? session.row.challenger_pseudo || "ami" : "ami"}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="font-game text-sm text-cream/60">Défi envoyé à {session && session.mode === "create" ? session.opponent.pseudo || "ton ami" : "ton ami"} !</p>
            <p className="mt-3 font-game text-5xl font-black text-dawn-300">
              {score}
              <span className="text-2xl text-cream/50">/{CHALLENGE_LEN}</span>
            </p>
            <p className="mt-2 text-sm text-cream/60">On te préviendra quand il aura relevé le défi.</p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setSession(null);
          setPhase("menu");
        }}
        className="mt-4 w-full rounded-2xl bg-gradient-to-b from-dawn-300 to-dawn-500 py-3.5 font-game text-lg font-black text-night-950"
      >
        Retour aux défis
      </button>
    </Shell>
  );
}

function ChallengeRowView({ r }: { r: ChallengeRow }) {
  const other = r.i_am_challenger
    ? { pseudo: r.opponent_pseudo, avatar: r.opponent_avatar }
    : { pseudo: r.challenger_pseudo, avatar: r.challenger_avatar };
  const myScore = r.i_am_challenger ? r.challenger_score : r.opponent_score;
  const theirScore = r.i_am_challenger ? r.opponent_score : r.challenger_score;
  let verdict = "";
  if (r.status === "done" && myScore !== null && theirScore !== null) {
    verdict = myScore > theirScore ? "Gagné" : myScore < theirScore ? "Perdu" : "Égalité";
  } else {
    verdict = r.i_am_challenger ? "En attente" : "À relever";
  }
  const vcls =
    verdict === "Gagné"
      ? "text-[#8FE23C]"
      : verdict === "Perdu"
        ? "text-rose-300"
        : "text-cream/55";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <Avatar url={other.avatar} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-game text-sm font-bold">{other.pseudo || "Ami"}</p>
        <p className="text-[11px] text-cream/60">
          {gameLabel(r.game)}
          {r.status === "done" ? ` · ${r.i_am_challenger ? r.challenger_score : r.opponent_score}–${r.i_am_challenger ? r.opponent_score : r.challenger_score}` : ""}
        </p>
      </div>
      <span className={`shrink-0 font-game text-xs font-extrabold ${vcls}`}>{verdict}</span>
    </div>
  );
}

function gameLabel(g: ChallengeGame) {
  return g === "quiz" ? "Connaissances" : "Vrai ou Faux";
}

function Shell({ title, onBack, children }: { title: string; onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-night-950 text-cream [overscroll-behavior:contain]">
      <style dangerouslySetInnerHTML={{ __html: "@keyframes fadeup{0%{transform:translateY(12px);opacity:0}100%{transform:translateY(0);opacity:1}}" }} />
      <GameDecor src="/img/jeux/decors/defi.jpg" />
      <div className="relative mx-auto w-full max-w-md px-4 pb-16 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button type="button" onClick={onBack} aria-label="Retour" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
              <IconBack className="h-5 w-5" />
            </button>
          ) : (
            <Link href="/jeux" aria-label="Accueil des jeux" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
              <IconBack className="h-5 w-5" />
            </Link>
          )}
          <h1 className="font-game text-xl font-extrabold">{title}</h1>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
