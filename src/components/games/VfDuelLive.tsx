"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { VF_ITEMS, type VFItem } from "@/lib/vraifaux";
import { appShareUrl } from "@/config/app-links";
import { shareText } from "@/lib/share";
import { Avatar } from "@/components/community/Avatar";

/**
 * DUEL Vrai ou Faux EN LIGNE, en direct : chacun sur SON téléphone.
 * - L'hôte crée un salon (code 6 lettres) et partage le lien intelligent,
 *   ou défie un membre connecté (notification).
 * - Les deux téléphones rejoignent le canal Realtime `vfduel:{code}` :
 *   même deck (graine = code), mêmes questions au même moment.
 * - Le premier qui touche la BONNE réponse marque (l'hôte arbitre l'ordre
 *   d'arrivée) ; une erreur bloque la manche ; premier à 7.
 */

const TARGET = 7;
const ROUND_TIME = 10; // secondes par affirmation
const REVEAL_MS = 2600;

export type DuelRole = "host" | "guest";
type Phase = "lobby" | "play" | "reveal" | "end";

type Evt =
  | { t: "start"; epoch: number }
  | { t: "answer"; p: DuelRole; round: number; val: boolean }
  | { t: "locked"; p: DuelRole; round: number }
  | { t: "result"; round: number; winner: DuelRole | null; scores: { host: number; guest: number } }
  | { t: "next"; round: number }
  | { t: "rematch"; epoch: number };

/* RNG déterministe : même code → même ordre de questions des deux côtés. */
function hashCode(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededDeck(seedStr: string): VFItem[] {
  const rng = mulberry32(hashCode(seedStr));
  const a = [...VF_ITEMS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Code de salon : 6 caractères sans ambiguïté (pas de O/0, I/1…). */
export function newDuelCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

type OnlineMember = { id: string; pseudo: string | null; avatar_url: string | null };

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

export function VfDuelLive({
  code,
  role,
  me,
  onClose,
}: {
  code: string;
  role: DuelRole;
  me: { id: string; pseudo: string; avatar: string | null };
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [epoch, setEpoch] = useState(0);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<{ host: number; guest: number }>({ host: 0, guest: 0 });
  const [locked, setLocked] = useState<{ host: boolean; guest: boolean }>({ host: false, guest: false });
  const [roundWinner, setRoundWinner] = useState<DuelRole | null>(null);
  const [opp, setOpp] = useState<{ id: string; pseudo: string | null; avatar: string | null } | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [online, setOnline] = useState<OnlineMember[]>([]);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [shareDone, setShareDone] = useState(false);
  // Effets : splash VS, flash de point, secousse d'erreur.
  const [splash, setSplash] = useState(false);
  const [flash, setFlash] = useState<"" | "win" | "lose">("");
  const [shake, setShake] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chRef = useRef<any>(null);
  const answersRef = useRef<{ resolved: boolean; locked: { host: boolean; guest: boolean } }>({
    resolved: false,
    locked: { host: false, guest: false },
  });
  const roundRef = useRef(0);
  const scoresRef = useRef(scores);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deck = useMemo(() => seededDeck(`${code}:${epoch}`), [code, epoch]);
  const cur = deck[round % deck.length];
  const myRole = role;
  const champion: DuelRole | null = scores.host >= TARGET ? "host" : scores.guest >= TARGET ? "guest" : null;

  scoresRef.current = scores;

  /* ---------- Canal temps réel ---------- */
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const ch = sb.channel(`vfduel:${code}`, {
      config: { broadcast: { self: false }, presence: { key: me.id } },
    });
    chRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState() as Record<string, Array<{ pseudo?: string; avatar?: string | null }>>;
      for (const key of Object.keys(st)) {
        if (key !== me.id && st[key][0]) {
          setOpp({ id: key, pseudo: st[key][0].pseudo ?? null, avatar: st[key][0].avatar ?? null });
          return;
        }
      }
      setOpp(null);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ch.on("broadcast", { event: "evt" }, ({ payload }: any) => onEvt(payload as Evt));
    ch.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        void ch.track({ pseudo: me.pseudo, avatar: me.avatar });
      }
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (nextRef.current) clearTimeout(nextRef.current);
      void sb.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function send(evt: Evt) {
    void chRef.current?.send({ type: "broadcast", event: "evt", payload: evt });
  }

  /* ---------- Déroulé d'une manche ---------- */
  function beginRound(r: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    answersRef.current = { resolved: false, locked: { host: false, guest: false } };
    roundRef.current = r;
    setRound(r);
    setLocked({ host: false, guest: false });
    setRoundWinner(null);
    setTimeLeft(ROUND_TIME);
    setPhase("play");
    if (r === 0) {
      // Splash « VS » d'entrée en matière.
      setSplash(true);
      setTimeout(() => setSplash(false), 1600);
      buzz(40);
    }
    if (myRole === "host") {
      timeoutRef.current = setTimeout(() => resolveRound(null), ROUND_TIME * 1000 + 350);
    }
  }

  /** HÔTE : tranche la manche (premier arrivé correct, ou personne). */
  function resolveRound(winner: DuelRole | null) {
    if (answersRef.current.resolved) return;
    answersRef.current.resolved = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const s = { ...scoresRef.current };
    if (winner) s[winner] += 1;
    send({ t: "result", round: roundRef.current, winner, scores: s });
    applyResult(winner, s);
  }

  function applyResult(winner: DuelRole | null, s: { host: number; guest: number }) {
    setScores(s);
    setRoundWinner(winner);
    setPhase("reveal");
    // Flash d'écran + vibration selon l'issue de la manche.
    if (winner === myRole) {
      setFlash("win");
      buzz([30, 40, 60]);
    } else if (winner) {
      setFlash("lose");
      buzz(120);
    }
    setTimeout(() => setFlash(""), 750);
    const finished = s.host >= TARGET || s.guest >= TARGET;
    if (nextRef.current) clearTimeout(nextRef.current);
    nextRef.current = setTimeout(() => {
      if (finished) setPhase("end");
      else if (myRole === "host") {
        const r = roundRef.current + 1;
        send({ t: "next", round: r });
        beginRound(r);
      }
    }, REVEAL_MS);
  }

  /** HÔTE : reçoit une réponse (la sienne ou celle de l'invité). */
  function hostHandleAnswer(p: DuelRole, r: number, val: boolean) {
    if (r !== roundRef.current || answersRef.current.resolved || answersRef.current.locked[p]) return;
    if (val === deck[r % deck.length].answer) {
      resolveRound(p);
    } else {
      answersRef.current.locked[p] = true;
      setLocked((l) => ({ ...l, [p]: true }));
      send({ t: "locked", p, round: r });
      if (answersRef.current.locked.host && answersRef.current.locked.guest) resolveRound(null);
    }
  }

  function onEvt(e: Evt) {
    if (e.t === "start") {
      setEpoch(e.epoch);
      setScores({ host: 0, guest: 0 });
      beginRound(0);
    } else if (e.t === "answer") {
      if (myRole === "host") hostHandleAnswer(e.p, e.round, e.val);
    } else if (e.t === "locked") {
      setLocked((l) => ({ ...l, [e.p]: true }));
      if (myRole === "host") {
        answersRef.current.locked[e.p] = true;
      }
    } else if (e.t === "result") {
      roundRef.current = e.round;
      applyResult(e.winner, e.scores);
    } else if (e.t === "next") {
      beginRound(e.round);
    } else if (e.t === "rematch") {
      setEpoch(e.epoch);
      setScores({ host: 0, guest: 0 });
      setPhase("lobby");
    }
  }

  /* L'hôte lance la partie dès que l'adversaire est là. */
  useEffect(() => {
    if (myRole !== "host" || phase !== "lobby" || !opp) return;
    const t = setTimeout(() => {
      send({ t: "start", epoch });
      setScores({ host: 0, guest: 0 });
      beginRound(0);
    }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRole, phase, opp, epoch]);

  /* Compte à rebours d'affichage (+ vibration de stress sous 3 s). */
  useEffect(() => {
    if (phase !== "play" || timeLeft <= 0) return;
    if (timeLeft <= 3) buzz(25);
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  /* Membres connectés (pour défier) — hôte en salon uniquement. */
  useEffect(() => {
    if (myRole !== "host" || phase !== "lobby") return;
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    (async () => {
      const { data } = await sb
        .from("profiles")
        .select("id,pseudo,avatar_url,last_seen_at")
        .gt("last_seen_at", new Date(Date.now() - 3 * 60_000).toISOString())
        .neq("id", me.id)
        .limit(12);
      if (alive) setOnline(((data as OnlineMember[]) ?? []).filter((m) => m.pseudo));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRole, phase]);

  const duelLink = appShareUrl(`/vrai-faux?duel=${code}`);

  async function shareInvite() {
    await shareText(
      `Je te défie en DIRECT à Vrai ou Faux sur RHEMA ! Code du salon : ${code}. Touche le lien pour me rejoindre :`,
      duelLink,
    );
    setShareDone(true);
  }

  /** Défie un membre connecté : notification avec lien direct vers le salon. */
  async function inviteMember(m: OnlineMember) {
    const sb = getSupabase();
    if (!sb) return;
    setInvited((s) => new Set(s).add(m.id));
    try {
      await sb.rpc("notify_duel", {
        target: m.id,
        body: `${me.pseudo || "Un membre"} te défie en DIRECT à Vrai ou Faux !`,
        link: `/vrai-faux?duel=${code}`,
      });
    } catch {
      /* RPC absente : le lien partagé reste la voie principale */
    }
  }

  function myTap(val: boolean) {
    if (phase !== "play" || locked[myRole]) return;
    if (val !== cur.answer) {
      // Erreur : secousse + vibration immédiates.
      setShake((s) => s + 1);
      buzz(90);
    }
    if (myRole === "host") {
      hostHandleAnswer("host", roundRef.current, val);
    } else {
      send({ t: "answer", p: "guest", round: roundRef.current, val });
      // Optimiste : une erreur se voit tout de suite de mon côté.
      if (val !== cur.answer) setLocked((l) => ({ ...l, guest: true }));
    }
  }

  function rematch() {
    const n = epoch + 1;
    send({ t: "rematch", epoch: n });
    setEpoch(n);
    setScores({ host: 0, guest: 0 });
    setPhase("lobby");
  }

  const myScore = scores[myRole];
  const oppRole: DuelRole = myRole === "host" ? "guest" : "host";
  const oppScore = scores[oppRole];

  /* ================= RENDU ================= */

  return (
    <div
      className="fixed inset-0 z-[130] flex flex-col text-cream"
      style={{
        background:
          "radial-gradient(120% 50% at 50% 0%, rgba(252,211,77,.10) 0%, transparent 55%), radial-gradient(120% 50% at 50% 100%, rgba(202,240,0,.12) 0%, transparent 55%), linear-gradient(180deg,#0C0C0B,#171716 50%,#0C0C0B)",
      }}
    >
      <style>{`
        @keyframes vfl-pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes vfl-pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        .vfl-pop{animation:vfl-pop .35s cubic-bezier(.2,.8,.3,1) both}
        /* Chrono : impact à chaque seconde */
        @keyframes vfl-tick{0%{transform:scale(1.55);opacity:.4}60%{transform:scale(.95)}100%{transform:scale(1);opacity:1}}
        .vfl-tick{animation:vfl-tick .5s cubic-bezier(.2,.8,.3,1) both}
        /* Panique sous 3 s : tremble + halo rouge qui bat */
        @keyframes vfl-danger{0%,100%{transform:scale(1) rotate(0)}20%{transform:scale(1.12) rotate(-2.5deg)}45%{transform:scale(1.04) rotate(2deg)}70%{transform:scale(1.1) rotate(-1.5deg)}}
        .vfl-danger{animation:vfl-danger .5s ease-in-out both}
        @keyframes vfl-heart{0%,100%{opacity:0}50%{opacity:.55}}
        .vfl-heart{animation:vfl-heart 1s ease-in-out infinite}
        /* Flash d'écran : point gagné / perdu */
        @keyframes vfl-flash{0%{opacity:.55}100%{opacity:0}}
        .vfl-flash{animation:vfl-flash .7s ease-out both}
        /* Secousse quand on rate */
        @keyframes vfl-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}35%{transform:translateX(9px)}55%{transform:translateX(-7px)}75%{transform:translateX(5px)}90%{transform:translateX(-2px)}}
        .vfl-shake{animation:vfl-shake .45s ease-in-out both}
        /* Splash VS au départ */
        @keyframes vfl-slam-l{from{opacity:0;transform:translateX(-70px) scale(.7)}to{opacity:1;transform:none}}
        @keyframes vfl-slam-r{from{opacity:0;transform:translateX(70px) scale(.7)}to{opacity:1;transform:none}}
        @keyframes vfl-vs{0%{opacity:0;transform:scale(3)}55%{opacity:1;transform:scale(.9)}75%{transform:scale(1.12)}100%{transform:scale(1)}}
        @keyframes vfl-fadeout{to{opacity:0;visibility:hidden}}
        /* Score qui claque quand il monte */
        @keyframes vfl-score{0%{transform:scale(1.7)}100%{transform:scale(1)}}
        .vfl-score{animation:vfl-score .45s cubic-bezier(.2,.8,.3,1) both}
      `}</style>

      {/* Flash d'écran : vert = point pour moi, rouge = point adverse */}
      {flash ? (
        <div
          className={`vfl-flash pointer-events-none fixed inset-0 z-[145] ${flash === "win" ? "bg-emerald-400" : "bg-rose-500"}`}
        />
      ) : null}

      {/* Vignette rouge qui bat sous 3 secondes : le stress monte */}
      {phase === "play" && timeLeft <= 3 ? (
        <div
          className="vfl-heart pointer-events-none fixed inset-0 z-[135]"
          style={{ background: "radial-gradient(120% 120% at 50% 50%, transparent 52%, rgba(244,63,94,.55))" }}
        />
      ) : null}

      {/* Splash VS au lancement de la partie */}
      {splash ? (
        <div
          className="pointer-events-none fixed inset-0 z-[150] grid place-items-center bg-night-950/85"
          style={{ animation: "vfl-fadeout .4s ease 1.15s both" }}
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1.5" style={{ animation: "vfl-slam-l .5s cubic-bezier(.2,.8,.3,1) both" }}>
              <Avatar pseudo={me.pseudo} url={me.avatar} size={68} />
              <p className="max-w-[6rem] truncate font-game text-xs font-black text-[#CAF000]">{me.pseudo || "TOI"}</p>
            </div>
            <p className="font-game text-6xl font-black text-cream" style={{ animation: "vfl-vs .6s cubic-bezier(.2,.8,.3,1) .15s both", textShadow: "0 0 30px rgba(202,240,0,.6)" }}>
              VS
            </p>
            <div className="flex flex-col items-center gap-1.5" style={{ animation: "vfl-slam-r .5s cubic-bezier(.2,.8,.3,1) both" }}>
              <Avatar pseudo={opp?.pseudo} url={opp?.avatar} size={68} />
              <p className="max-w-[6rem] truncate font-game text-xs font-black text-[#FCD34D]">{opp?.pseudo ?? "…"}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* En-tête : adversaire + scores + quitter */}
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.9rem)]">
        <div className="flex min-w-0 items-center gap-2.5">
          {opp ? <Avatar pseudo={opp.pseudo} url={opp.avatar} size={36} /> : (
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cream/40" style={{ animation: "vfl-pulse 1.5s infinite" }}>
              ?
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-game text-sm font-black">{opp?.pseudo ?? "En attente…"}</p>
            <p className="text-[10px] text-cream/50">{opp ? "En direct" : "Personne n'a encore rejoint"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span key={`o${oppScore}`} className="vfl-score rounded-full bg-[#FCD34D]/15 px-3 py-1 font-game text-lg font-black text-[#FCD34D]">{oppScore}</span>
          <span className="font-game text-xs text-cream/40">·</span>
          <span key={`m${myScore}`} className="vfl-score rounded-full bg-[#CAF000]/15 px-3 py-1 font-game text-lg font-black text-[#CAF000]">{myScore}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Quitter le duel"
            className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cream/70"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ---------- LOBBY ---------- */}
      {phase === "lobby" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-8">
          <div className="vfl-pop mx-auto w-full max-w-sm text-center">
            <p className="font-game text-xs font-black uppercase tracking-[0.25em] text-[#CAF000]">Duel en ligne · en direct</p>
            <p className="mt-3 text-sm text-cream/65">
              {myRole === "host"
                ? opp
                  ? "Adversaire connecté ! La partie démarre…"
                  : "Partage le lien ou défie un membre connecté. La partie démarre dès qu'il rejoint."
                : opp
                  ? "Connecté ! L'hôte lance la partie…"
                  : "Connexion au salon…"}
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-night-900/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/45">Code du salon</p>
              <p className="mt-1 font-game text-4xl font-black tracking-[0.35em] text-cream">{code}</p>
            </div>

            {myRole === "host" ? (
              <>
                <button
                  type="button"
                  onClick={shareInvite}
                  className="mt-4 w-full rounded-full py-3.5 font-game text-base font-black text-[#1a2000]"
                  style={{ background: "linear-gradient(180deg,#D8F53A,#AAD000)", boxShadow: "0 4px 0 #5b7300" }}
                >
                  {shareDone ? "LIEN ENVOYÉ · RENVOYER" : "PARTAGER LE LIEN DU DUEL"}
                </button>

                {online.length > 0 ? (
                  <div className="mt-6 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/45">Connectés maintenant</p>
                    <ul className="mt-2 space-y-2">
                      {online.map((m) => (
                        <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-2.5">
                          <Avatar pseudo={m.pseudo} url={m.avatar_url} size={34} />
                          <p className="min-w-0 flex-1 truncate text-sm font-bold">{m.pseudo}</p>
                          <button
                            type="button"
                            disabled={invited.has(m.id)}
                            onClick={() => inviteMember(m)}
                            className="shrink-0 rounded-full bg-dawn-400 px-4 py-1.5 font-game text-xs font-black text-night-950 disabled:opacity-50"
                          >
                            {invited.has(m.id) ? "INVITÉ" : "DÉFIER"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : phase === "end" ? (
        /* ---------- FIN ---------- */
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="vfl-pop font-game text-4xl font-black" style={{ color: champion === myRole ? "#CAF000" : "#FCD34D" }}>
            {champion === myRole ? "VICTOIRE !" : `${opp?.pseudo ?? "Ton adversaire"} gagne`}
          </p>
          <p className="text-sm text-cream/65">
            {myScore} — {oppScore}
          </p>
          {myRole === "host" ? (
            <button
              type="button"
              onClick={rematch}
              className="mt-3 rounded-full px-8 py-3.5 font-game text-base font-black text-[#1a2000]"
              style={{ background: "linear-gradient(180deg,#D8F53A,#AAD000)", boxShadow: "0 4px 0 #5b7300" }}
            >
              REVANCHE
            </button>
          ) : (
            <p className="mt-2 text-xs text-cream/50">L&apos;hôte peut lancer une revanche…</p>
          )}
          <button type="button" onClick={onClose} className="mt-1 rounded-full border border-white/15 px-6 py-3 font-game text-sm font-bold text-cream/75">
            Quitter
          </button>
        </div>
      ) : (
        /* ---------- MANCHE ---------- */
        <div key={shake || undefined} className={`flex min-h-0 flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] ${shake ? "vfl-shake" : ""}`}>
          {/* GROS chrono central : anneau qui se vide + impact chaque seconde */}
          <div className="flex flex-col items-center">
            <p className="font-game text-[10px] font-bold uppercase tracking-[0.2em] text-cream/45">Premier à {TARGET}</p>
            {phase === "play" ? (
              <div
                key={`t${timeLeft}`}
                className={`mt-1.5 grid h-[4.6rem] w-[4.6rem] place-items-center rounded-full ${timeLeft <= 3 ? "vfl-danger" : ""}`}
                style={{
                  background: `conic-gradient(${timeLeft <= 3 ? "#f43f5e" : "#CAF000"} ${(timeLeft / ROUND_TIME) * 100}%, rgba(255,255,255,.08) 0)`,
                  boxShadow: timeLeft <= 3 ? "0 0 30px rgba(244,63,94,.55)" : "0 0 18px rgba(202,240,0,.25)",
                }}
              >
                <div className="grid h-[3.8rem] w-[3.8rem] place-items-center rounded-full bg-night-950">
                  <span className={`vfl-tick font-game text-4xl font-black tabular-nums ${timeLeft <= 3 ? "text-rose-300" : "text-cream"}`}>
                    {timeLeft}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-1.5 h-[4.6rem]" />
            )}
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center">
            <p key={`${epoch}:${round}`} className={`vfl-pop text-balance text-center font-game font-black leading-snug ${cur.text.length > 90 ? "text-lg" : "text-xl sm:text-2xl"}`}>
              {cur.text}
            </p>
          </div>

          {/* Statut de manche */}
          {phase === "reveal" ? (
            <p className="pb-2 text-center font-game text-sm font-black">
              <span className={cur.answer ? "text-emerald-300" : "text-rose-300"}>{cur.answer ? "VRAI" : "FAUX"}</span>
              <span className="ml-2 text-cream/60">
                {roundWinner === myRole ? "Point pour toi !" : roundWinner ? `Point pour ${opp?.pseudo ?? "l'adversaire"}` : "Personne !"}
              </span>
            </p>
          ) : locked[myRole] ? (
            <p className="pb-2 text-center font-game text-xs font-black text-rose-300">Raté ! Manche bloquée…</p>
          ) : locked[oppRole] ? (
            <p className="pb-2 text-center font-game text-xs font-black text-emerald-300">{opp?.pseudo ?? "L'adversaire"} a raté — à toi !</p>
          ) : null}

          <div className="flex shrink-0 gap-2.5">
            <button
              type="button"
              disabled={phase !== "play" || locked[myRole]}
              onClick={() => myTap(true)}
              className="flex-1 rounded-2xl py-5 font-game text-2xl font-black text-white transition-transform active:scale-[.97] disabled:opacity-40"
              style={{ background: "linear-gradient(180deg,#10b981,#047857)", boxShadow: "0 5px 0 #064e3b" }}
            >
              VRAI
            </button>
            <button
              type="button"
              disabled={phase !== "play" || locked[myRole]}
              onClick={() => myTap(false)}
              className="flex-1 rounded-2xl py-5 font-game text-2xl font-black text-white transition-transform active:scale-[.97] disabled:opacity-40"
              style={{ background: "linear-gradient(180deg,#f43f5e,#be123c)", boxShadow: "0 5px 0 #881337" }}
            >
              FAUX
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
