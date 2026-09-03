"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cheminChapitreOuvert,
  cheminProgres,
  cheminStep,
  type CheminChapitre,
} from "@/lib/chemin";
import { CHEMIN_CHAPITRES } from "@/config/chemin";
import { asset } from "@/lib/asset";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getVfXp } from "@/lib/vraifaux";
import { getChronoXp } from "@/lib/chrono";
import { getQuizCoins } from "@/lib/quiz";
import { submitGameScore } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import {
  ArcadeShell,
  HubHeader,
  IcoPlay,
  IcoRefresh,
  IcoLock,
  IcoCheck,
  IcoTrophy,
  IcoTarget,
} from "@/components/games/ArcadeUI";

const OR = "#FCD34D";

/** Anneau de progression : la part de chapitres terminés, d'un coup d'œil. */
function Anneau({ faits, total }: { faits: number; total: number }) {
  const pct = total > 0 ? faits / total : 0;
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="url(#chemin-anneau)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          style={{ transition: "stroke-dasharray .6s ease-out" }}
        />
        <defs>
          <linearGradient id="chemin-anneau" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <p className="font-game text-[30px] font-black leading-none text-white">{faits}</p>
        <p className="font-game text-[11px] font-bold text-white/55">sur {total}</p>
      </div>
    </div>
  );
}

/** Une ligne de la liste des chapitres. */
function LigneChapitre({
  chap,
  idx,
  onOuvrir,
}: {
  chap: CheminChapitre;
  idx: number;
  onOuvrir: () => void;
}) {
  const fait = Math.min(cheminStep(chap.id), chap.etapes.length);
  const termine = fait >= chap.etapes.length;
  const ouvert = cheminChapitreOuvert(CHEMIN_CHAPITRES, idx);
  const pct = Math.round((fait / chap.etapes.length) * 100);

  return (
    <button
      type="button"
      disabled={!ouvert}
      onClick={onOuvrir}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 text-left transition-transform active:scale-[.99] disabled:opacity-55"
    >
      {/* Vignette : la carte du personnage, grisée tant qu'elle n'est pas gagnée */}
      <span
        className="relative h-[58px] w-[42px] shrink-0 overflow-hidden rounded-lg border"
        style={{ borderColor: termine ? "rgba(252,211,77,.6)" : "rgba(255,255,255,.12)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(chap.carte.image)}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
          style={termine ? undefined : { filter: "grayscale(1) brightness(.45)" }}
        />
        {!ouvert ? (
          <span className="absolute inset-0 grid place-items-center bg-black/45 text-white/70">
            <IcoLock className="h-4 w-4" />
          </span>
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-game text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            Chapitre {chap.id}
          </span>
          {termine ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 font-game text-[9px] font-black uppercase tracking-wide text-amber-300">
              <IcoCheck className="h-3 w-3" /> Terminé
            </span>
          ) : ouvert && fait > 0 ? (
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 font-game text-[9px] font-black uppercase tracking-wide text-emerald-300">
              En cours
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate font-game text-[15px] font-black" style={{ color: ouvert ? chap.accent : "rgba(243,243,237,.5)" }}>
          {chap.nom}
        </span>
        <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-black/40">
          <i className="block h-full rounded-full" style={{ width: `${pct}%`, background: termine ? OR : chap.accent }} />
        </span>
        <span className="mt-1 block font-game text-[10px] font-bold text-white/50">
          {chap.livre} · {fait}/{chap.etapes.length} étapes
        </span>
      </span>
    </button>
  );
}

/**
 * L'accueil du Chemin : où en est le joueur (chapitres, étapes, cartes, XP),
 * la liste des chapitres, et le classement du jeu — comme les autres jeux.
 */
export function CheminHub({ onJouer }: { onJouer: (chapIdx: number) => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xpGlobal, setXpGlobal] = useState(0);

  const p = cheminProgres(CHEMIN_CHAPITRES);
  // Le premier chapitre non terminé : c'est là que « CONTINUER » emmène.
  const idxCourant = (() => {
    const i = CHEMIN_CHAPITRES.findIndex((c) => cheminStep(c.id) < c.etapes.length);
    return i === -1 ? CHEMIN_CHAPITRES.length - 1 : i;
  })();
  const toutFini = p.chapitresFaits >= p.chapitresTotal;

  useEffect(() => {
    setXpGlobal(getMemorizeXp() + getVfXp() + getChronoXp() + Math.floor(getQuizCoins() / 500));
    // Le score du Chemin est l'XP cumulée : on le remonte à chaque passage.
    submitGameScore("chemin", p.xp);
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      try {
        const { data } = await sb.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const prof = await getProfile(uid);
        setName((prof?.pseudo && prof.pseudo.trim()) || (data.user?.user_metadata?.first_name as string | undefined) || "");
        setAvatar(prof?.avatar_url || null);
      } catch {
        /* avatar neutre */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lvl = levelFromXp(xpGlobal);

  return (
    <ArcadeShell decor="/img/chemin/decor-1.jpg">
      <HubHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={p.xp} onGear={() => router.push("/profil")} />

      {/* Héros */}
      <div className="qm-hero mt-4" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(74,222,128,.22), transparent 55%), linear-gradient(135deg,rgba(30,30,29,.72) 0%,rgba(12,12,11,.84) 100%)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/img/jeux/chemin.png")} alt="" className="qm-illo pointer-events-none absolute -bottom-2 -right-2 h-32 w-auto max-w-[38%] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.35)]" />
        <div className="relative max-w-[62%]">
          <span className="qm-rapide" style={{ background: "rgba(74,222,128,.18)", color: "#4ADE80" }}>
            <IcoTarget className="h-3.5 w-3.5" /> LA ROUTE DE LA BIBLE
          </span>
          <h1 className="mt-2.5 font-game text-[2rem] font-black leading-[0.9] drop-shadow">
            LE <span className="text-[#4ADE80]">CHEMIN</span>
          </h1>
          <p className="mt-2.5 font-game text-[13px] font-semibold leading-tight text-white/85">
            De la Genèse à l&apos;Apocalypse, chapitre après chapitre.
          </p>
        </div>
      </div>

      {/* Où j'en suis */}
      <div className="qm-card mt-4 p-4">
        <div className="flex items-center gap-4">
          <Anneau faits={p.chapitresFaits} total={p.chapitresTotal} />
          <div className="min-w-0 flex-1">
            <p className="font-game text-[11px] font-black uppercase tracking-[0.18em] text-white/50">Chapitres terminés</p>
            <p className="mt-1 font-game text-[15px] font-black text-white">
              {toutFini ? "Tout le Chemin est parcouru !" : `Il t'en reste ${p.chapitresTotal - p.chapitresFaits}`}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/[0.06] px-2 py-1.5 text-center">
                <p className="font-game text-[15px] font-black text-white">{p.etapesFaites}<span className="text-white/45">/{p.etapesTotal}</span></p>
                <p className="font-game text-[9px] font-bold uppercase tracking-wide text-white/45">Étapes</p>
              </div>
              <div className="rounded-xl bg-white/[0.06] px-2 py-1.5 text-center">
                <p className="font-game text-[15px] font-black text-amber-300">{p.cartes}<span className="text-white/45">/{p.chapitresTotal}</span></p>
                <p className="font-game text-[9px] font-bold uppercase tracking-wide text-white/45">Cartes</p>
              </div>
              <div className="rounded-xl bg-white/[0.06] px-2 py-1.5 text-center">
                <p className="font-game text-[15px] font-black" style={{ color: "#4ADE80" }}>{p.xp}</p>
                <p className="font-game text-[9px] font-bold uppercase tracking-wide text-white/45">XP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" onClick={() => onJouer(idxCourant)} className="qm-jouer mt-4">
        <IcoPlay className="h-6 w-6" />
        {p.etapesFaites === 0 ? "COMMENCER LE CHEMIN" : toutFini ? "REVOIR LE CHEMIN" : "CONTINUER"}
      </button>

      {/* Les chapitres */}
      <div className="qm-howto mt-4">
        <div className="flex items-center justify-between">
          <p className="font-game text-sm font-black tracking-wide text-[#4ADE80]">LES CHAPITRES</p>
          <span className="font-game text-[11px] font-bold text-white/45">{p.chapitresTotal} au total</span>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {CHEMIN_CHAPITRES.map((c, i) => (
            <LigneChapitre key={c.id} chap={c} idx={i} onOuvrir={() => onJouer(i)} />
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] font-semibold leading-snug text-white/55">
          D&apos;autres chapitres arrivent : Abraham, Joseph, Moïse, David, Jésus, l&apos;Apocalypse…
        </p>
      </div>

      {/* Objectif + Record */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="qm-obj flex items-center gap-3">
          <span className="qm-obj-ic"><IcoTarget className="h-6 w-6" /></span>
          <div className="min-w-0">
            <p className="font-game text-xs font-black text-teal-800">OBJECTIF</p>
            <p className="text-[11px] font-semibold leading-tight text-teal-900/80">Termine chaque chapitre&nbsp;!</p>
          </div>
        </div>
        <div className="qm-rec flex items-center gap-3">
          <span className="qm-rec-ic"><IcoTrophy className="h-6 w-6" /></span>
          <div className="min-w-0">
            <p className="font-game text-xs font-black text-amber-700">MES POINTS</p>
            <p className="font-game text-2xl font-black leading-none text-[#4a2600]">{p.xp}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button type="button" onClick={() => router.push("/jeux")} className="qm-retour">
          <IcoRefresh className="h-4 w-4" /> RETOUR AUX JEUX
        </button>
      </div>

      <div className="mt-5">
        <ScoreBoard mode="chemin" accent="#4ADE80" title="Classement · Le Chemin" />
      </div>
    </ArcadeShell>
  );
}
