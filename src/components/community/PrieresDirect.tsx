"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { ReportButton } from "@/components/community/ReportButton";
import { TexteMembre } from "@/components/community/VoirTraduction";
import { VoiceRecorderButton, VoiceNotePlayer } from "@/components/community/VoiceNote";
import { useAuth } from "@/components/community/useAuth";
import { asset } from "@/lib/asset";
import { localeApp } from "@/lib/i18n";
import { startSoaking, stopSoaking, isSoakingPlaying } from "@/lib/soaking";
import {
  DUREES_MIN,
  REACTIONS,
  amens,
  basculerRappel,
  debutMs,
  direAmen,
  estEnDirect,
  finMs,
  lancerPriereDirect,
  programmerPriereDirect,
  rappels,
  supprimerPriereDirect,
  useDirect,
  type PriereDirect,
  type Present,
  type Reaction,
} from "@/lib/prieres-direct";

/**
 * PRIÈRES EN DIRECT sur le mur de prière (voir lib/prieres-direct.ts) :
 *  - « Maintenant » : la prière en cours, le compte à rebours et le nombre de
 *    personnes qui prient en ce moment ; puis la file d'attente ;
 *  - les sessions programmées, avec « Me prévenir » ;
 *  - la salle de prière plein écran (présence, réactions, « Amen »).
 */

const FOND = asset("/img/chemin/decor-30.jpg");

function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

function quand(iso: string): string {
  return new Intl.DateTimeFormat(localeApp(), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

function PointDirect() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dawn-400 opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-dawn-400" />
    </span>
  );
}

function Nom({ p }: { p: PriereDirect }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5" translate="no">
      <span className="truncate">{p.author?.pseudo ?? "Membre"}</span>
      {p.author?.verified ? <VerifiedBadge /> : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Section du mur                                                     */
/* ------------------------------------------------------------------ */

export function PrieresDirectSection() {
  const { userId, profile } = useAuth();
  const moi = useMemo(
    () => ({ uid: userId, pseudo: profile?.pseudo ?? null, avatar: profile?.avatar_url ?? null }),
    [userId, profile?.pseudo, profile?.avatar_url],
  );
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [composer, setComposer] = useState<null | "maintenant" | "programmer">(null);
  const [tout, setTout] = useState(false);
  const { liste, maintenant, presents, reactions, reagir, recharger } = useDirect(moi, ouverte);
  const [rap, setRap] = useState<{ nb: Record<string, number>; miens: Set<string> }>({ nb: {}, miens: new Set() });

  // Lien d'une notification : /communaute/?direct=<id>
  const params = useSearchParams();
  const directParam = params.get("direct");
  useEffect(() => {
    if (directParam) setOuverte(directParam);
  }, [directParam]);

  const enDirect = (liste ?? []).filter((p) => estEnDirect(p, maintenant));
  const attente = (liste ?? []).filter((p) => !p.programmee && debutMs(p) > maintenant);
  const programmees = (liste ?? []).filter((p) => p.programmee && debutMs(p) > maintenant);
  const idsProg = programmees.map((p) => p.id).join(",");

  useEffect(() => {
    if (!idsProg) return;
    void rappels(idsProg.split(","), userId).then(setRap);
  }, [idsProg, userId]);

  const parPriere = (id: string) => presents.filter((x) => x.priere === id);

  async function basculer(id: string) {
    if (!userId) return;
    const actif = !rap.miens.has(id);
    if (await basculerRappel(id, actif)) {
      const miens = new Set(rap.miens);
      if (actif) miens.add(id);
      else miens.delete(id);
      setRap({ nb: { ...rap.nb, [id]: Math.max(0, (rap.nb[id] ?? 0) + (actif ? 1 : -1)) }, miens });
    }
  }

  const priereOuverte = ouverte ? (liste ?? []).find((p) => p.id === ouverte) ?? null : null;

  return (
    <section className="dark-ctx relative mt-5 overflow-hidden rounded-4xl border border-white/10 bg-night-950 text-cream shadow-card">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-extrabold">
            <PointDirect />
            Prières en direct
          </h2>
          {presents.length ? (
            <span className="text-[12px] font-semibold text-cream/60">{presents.length > 1 ? `${presents.length} personnes` : `${presents.length} personne`}</span>
          ) : null}
        </div>

        {/* Maintenant */}
        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Maintenant</p>
        {liste === null ? (
          <div className="mt-2 h-36 animate-pulse rounded-3xl bg-white/5" />
        ) : enDirect.length ? (
          enDirect.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOuverte(p.id)}
              className="relative mt-2 block w-full overflow-hidden rounded-3xl border border-white/15 text-left"
            >
              <span className="absolute inset-0 bg-cover bg-center opacity-60 blur-[2px]" style={{ backgroundImage: `url(${FOND})` }} />
              <span className="absolute inset-0 bg-gradient-to-b from-night-950/30 to-night-950/85" />
              <span className="relative block p-4">
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0 font-display text-[22px] font-bold leading-tight">
                    <Nom p={p} />
                  </span>
                  <span className="shrink-0 pt-1 text-[12px] font-semibold text-cream/75">{`Il reste ${mmss(finMs(p) - maintenant)}`}</span>
                </span>
                <span className="mt-2 line-clamp-3 block text-[15px] leading-relaxed text-cream/90" translate="no">
                  {p.sujet}
                </span>
                <span className="mt-3 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-dawn-400 px-4 py-2 text-[13px] font-bold text-night-950">
                    Rejoins la prière en direct
                  </span>
                  {parPriere(p.id).length ? (
                    <span className="text-[12px] font-semibold text-cream/70">{`${parPriere(p.id).length} en prière`}</span>
                  ) : null}
                </span>
              </span>
            </button>
          ))
        ) : (
          <p className="mt-2 rounded-3xl border border-dashed border-white/15 p-4 text-center text-[13px] leading-relaxed text-cream/60">
            Aucune prière en direct pour l&apos;instant. Lance la tienne : tous ceux qui sont dans l&apos;app prieront avec toi.
          </p>
        )}

        {/* Lancer / programmer */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setComposer("maintenant")}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-dawn-400 text-[13px] font-bold text-night-950"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Prier en direct
          </button>
          <button
            type="button"
            onClick={() => setComposer("programmer")}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 text-[13px] font-bold text-cream"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
              <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
              <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
            Programmer
          </button>
        </div>

        {/* File d'attente */}
        {attente.length ? (
          <>
            <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">
              {attente.length > 1 ? `En attente · ${attente.length} prières` : `En attente · ${attente.length} prière`}
            </p>
            {(tout ? attente : attente.slice(0, 3)).map((p) => (
              <button key={p.id} type="button" onClick={() => setOuverte(p.id)} className="mt-2 block w-full rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-left">
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0 font-display text-[17px] font-bold">
                    <Nom p={p} />
                  </span>
                  <span className="shrink-0 rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cream/80">
                    {`Commence dans ${Math.max(1, Math.ceil((debutMs(p) - maintenant) / 60_000))} min`}
                  </span>
                </span>
                <span className="mt-2 line-clamp-2 block text-[14px] leading-relaxed text-cream/75" translate="no">
                  {p.sujet}
                </span>
              </button>
            ))}
            {attente.length > 3 && !tout ? (
              <button type="button" onClick={() => setTout(true)} className="mt-2 w-full text-center text-[13px] font-semibold text-dawn-300">
                {`Voir les ${attente.length - 3} autres`}
              </button>
            ) : null}
          </>
        ) : null}

        {/* Sessions programmées */}
        {programmees.length ? (
          <>
            <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Sessions programmées</p>
            {programmees.map((p) => {
              const prevenu = rap.miens.has(p.id);
              const nb = rap.nb[p.id] ?? 0;
              return (
                <div key={p.id} className="mt-2 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <button type="button" onClick={() => setOuverte(p.id)} className="block w-full text-left">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-black uppercase tracking-wider text-dawn-300" translate="no">
                        {quand(p.debut)}
                      </span>
                      <span className="text-[12px] font-semibold text-cream/55">{`${Math.round(p.duree_s / 60)} min`}</span>
                    </span>
                    <span className="mt-1.5 block font-display text-[17px] font-bold">
                      <Nom p={p} />
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[14px] leading-relaxed text-cream/75" translate="no">
                      {p.sujet}
                    </span>
                  </button>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[12px] text-cream/55">{nb > 1 ? `${nb} inscrits` : nb ? `${nb} inscrit` : ""}</span>
                    {userId ? (
                      <button
                        type="button"
                        onClick={() => basculer(p.id)}
                        className={`flex h-9 items-center gap-2 rounded-full px-4 text-[12px] font-bold ${
                          prevenu ? "border border-dawn-400/50 text-dawn-300" : "bg-white text-night-950"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                          {prevenu ? (
                            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2.2 2.2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
                          )}
                        </svg>
                        {prevenu ? "Prévenu" : "Me prévenir"}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>

      <AnimatePresence>
        {composer ? (
          <Composer
            mode={composer}
            userId={userId}
            onFermer={() => setComposer(null)}
            onCree={(p) => {
              setComposer(null);
              recharger();
              if (!p.programmee) setOuverte(p.id);
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {ouverte ? (
          <Salle
            id={ouverte}
            priere={priereOuverte}
            liste={liste ?? []}
            maintenant={maintenant}
            presents={parPriere(ouverte)}
            reactions={reactions.filter((r) => r.priere === ouverte)}
            reagir={(e) => reagir(ouverte, e)}
            userId={userId}
            prevenu={rap.miens.has(ouverte)}
            basculerRappel={() => basculer(ouverte)}
            onChanger={setOuverte}
            onFermer={() => {
              setOuverte(null);
              recharger();
            }}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Lancer ou programmer                                               */
/* ------------------------------------------------------------------ */

function heureParDefaut(): string {
  const d = new Date(Date.now() + 60 * 60_000);
  d.setMinutes(0, 0, 0);
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}

function Composer({
  mode: modeInitial,
  userId,
  onFermer,
  onCree,
}: {
  mode: "maintenant" | "programmer";
  userId: string | null;
  onFermer: () => void;
  onCree: (p: PriereDirect) => void;
}) {
  const [mode, setMode] = useState(modeInitial);
  const [sujet, setSujet] = useState("");
  const [voix, setVoix] = useState<string | null>(null);
  const [date, setDate] = useState(heureParDefaut);
  const [duree, setDuree] = useState(15);
  const [occupe, setOccupe] = useState(false);
  const [err, setErr] = useState("");

  async function envoyer() {
    if (sujet.trim().length < 3) {
      setErr("Écris ton sujet de prière.");
      return;
    }
    setOccupe(true);
    setErr("");
    try {
      const p =
        mode === "maintenant"
          ? await lancerPriereDirect(sujet.trim(), voix)
          : await programmerPriereDirect(sujet.trim(), new Date(date), duree, voix);
      onCree(p);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Une erreur est survenue. Réessaie.");
    } finally {
      setOccupe(false);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label="Fermer" onClick={onFermer} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        className="dark-ctx relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-4xl border border-white/10 bg-night-950 p-5 text-cream sm:rounded-4xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-extrabold">{mode === "maintenant" ? "Prier en direct" : "Programmer une session"}</h3>
          <button type="button" onClick={onFermer} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {!userId ? (
          <div className="mt-5 rounded-3xl border border-white/10 p-5 text-center text-[14px] text-cream/75">
            Connecte-toi pour lancer une prière en direct.
            <Link href="/profil" className="mt-4 flex h-11 items-center justify-center rounded-full bg-dawn-400 font-bold text-night-950">
              Me connecter
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 flex gap-1.5 rounded-full border border-white/10 p-1">
              {(
                [
                  ["maintenant", "Maintenant"],
                  ["programmer", "Programmer"],
                ] as const
              ).map(([m, l]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`h-9 flex-1 rounded-full text-[13px] font-bold ${mode === m ? "bg-dawn-400 text-night-950" : "text-cream/70"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-cream/60">
              {mode === "maintenant"
                ? "Ta prière passe en direct dès que c'est ton tour (1 min 30) : tous ceux qui sont dans l'app prient avec toi en même temps."
                : "Choisis le jour, l'heure et la durée. Les membres peuvent demander à être prévenus, et prient avec toi en direct."}
            </p>

            <textarea
              value={sujet}
              onChange={(e) => setSujet(e.target.value.slice(0, 600))}
              rows={4}
              placeholder="Ton sujet de prière…"
              className="field mt-4 w-full resize-none"
            />
            <p className="mt-1 text-right text-[11px] text-cream/40">{`${sujet.length}/600`}</p>

            {mode === "programmer" ? (
              <>
                <label className="mt-3 block text-[12px] font-bold uppercase tracking-wider text-cream/55">Jour et heure</label>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="field mt-1.5 w-full" />
                <label className="mt-4 block text-[12px] font-bold uppercase tracking-wider text-cream/55">Durée</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {DUREES_MIN.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuree(d)}
                      className={`h-9 rounded-full px-4 text-[13px] font-bold ${duree === d ? "bg-dawn-400 text-night-950" : "border border-white/15 text-cream/80"}`}
                    >
                      {`${d} min`}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <div className="mt-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-cream/55">Prière vocale (facultatif)</p>
              <div className="mt-2">
                {voix ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <VoiceNotePlayer src={voix} tone="dark" />
                    </div>
                    <button type="button" onClick={() => setVoix(null)} className="text-[12px] font-semibold text-cream/60">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <VoiceRecorderButton userId={userId} tone="dark" onSend={(url) => setVoix(url)} />
                )}
              </div>
            </div>

            {err ? <p className="field-error mt-3">{err}</p> : null}

            <button
              type="button"
              disabled={occupe}
              onClick={envoyer}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-dawn-400 text-[15px] font-bold text-night-950 disabled:opacity-60"
            >
              {occupe ? "Un instant…" : mode === "maintenant" ? "Lancer ma prière en direct" : "Programmer la session"}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Salle de prière                                                    */
/* ------------------------------------------------------------------ */

function Salle({
  id,
  priere,
  liste,
  maintenant,
  presents,
  reactions,
  reagir,
  userId,
  prevenu,
  basculerRappel,
  onChanger,
  onFermer,
}: {
  id: string;
  priere: PriereDirect | null;
  liste: PriereDirect[];
  maintenant: number;
  presents: Present[];
  reactions: Reaction[];
  reagir: (emoji: string) => void;
  userId: string | null;
  prevenu: boolean;
  basculerRappel: () => void;
  onChanger: (id: string) => void;
  onFermer: () => void;
}) {
  const { isAdmin, isModerator } = useAuth();
  const [amen, setAmen] = useState(false);
  const [nbAmens, setNbAmens] = useState(0);
  const [musique, setMusique] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setMusique(isSoakingPlaying());
  }, []);
  useEffect(() => {
    setAmen(false);
    void amens(id).then((a) => {
      setNbAmens(a.total);
      if (userId && a.uids.includes(userId)) setAmen(true);
    });
  }, [id, userId]);
  // En quittant la salle, la musique s'arrête si c'est nous qui l'avions lancée.
  useEffect(() => () => {
    if (musique) stopSoaking();
  }, [musique]);

  const avant = priere ? debutMs(priere) > maintenant : false;
  const fini = priere ? finMs(priere) <= maintenant : false;
  const enCours = priere ? !avant && !fini : false;
  // À la fin, on enchaîne sur la prière suivante de la file si elle a commencé.
  const suivante = useMemo(
    () => (fini ? liste.find((p) => p.id !== id && estEnDirect(p, maintenant)) ?? null : null),
    [fini, liste, id, maintenant],
  );
  useEffect(() => {
    if (!suivante) return;
    const t = setTimeout(() => onChanger(suivante.id), 2500);
    return () => clearTimeout(t);
  }, [suivante, onChanger]);

  const progression = priere ? Math.min(1, Math.max(0, (maintenant - debutMs(priere)) / (priere.duree_s * 1000))) : 0;
  const R = 46;
  const C = 2 * Math.PI * R;

  async function dire() {
    if (!userId || amen) return;
    setAmen(true);
    setNbAmens((n) => n + 1);
    reagir("🙏");
    await direAmen(id);
  }

  return (
    <motion.div
      className="dark-ctx fixed inset-0 z-[120] overflow-hidden bg-[#0B0B0A] text-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 scale-110 bg-cover bg-center blur-[10px]" style={{ backgroundImage: `url(${FOND})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0A]/70 via-[#0B0B0A]/55 to-[#0B0B0A]" />

      {/* Réactions qui s'envolent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.span
              key={r.id}
              className="absolute bottom-40 text-3xl"
              style={{ left: `${15 + ((r.id * 37) % 70)}%` }}
              initial={{ y: 0, opacity: 0, scale: 0.6 }}
              animate={{ y: -420, opacity: [0, 1, 1, 0], scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
            >
              {r.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div
        className="relative flex h-full flex-col px-6"
        style={{ paddingTop: "max(env(safe-area-inset-top), 16px)", paddingBottom: "max(env(safe-area-inset-bottom), 18px)" }}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={onFermer} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          {enCours ? (
            <span className="flex items-center gap-2 rounded-full bg-dawn-400/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-dawn-300">
              <PointDirect /> En direct
            </span>
          ) : avant ? (
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/80">Bientôt</span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Musique"
              onClick={() => {
                if (musique) stopSoaking();
                else startSoaking();
                setMusique(!musique);
              }}
              className={`grid h-10 w-10 place-items-center rounded-full ${musique ? "bg-dawn-400 text-night-950" : "bg-white/10"}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
                <path d="M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" strokeLinejoin="round" />
              </svg>
            </button>
            {priere ? (
              <button type="button" aria-label="Options" onClick={() => setMenu(!menu)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                  <circle cx="5" cy="12" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="19" cy="12" r="1.8" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
        {menu && priere ? (
          <div className="absolute right-6 top-20 z-10 w-56 rounded-2xl border border-white/10 bg-night-900 p-2 shadow-card">
            <ReportButton targetType="priere_direct" targetId={priere.id} className="w-full" />
            {userId && (priere.author_id === userId || isAdmin || isModerator) ? (
              <button
                type="button"
                onClick={async () => {
                  if (await supprimerPriereDirect(priere.id)) onFermer();
                }}
                className="mt-1 w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-red-300 hover:bg-white/5"
              >
                Supprimer cette prière
              </button>
            ) : null}
          </div>
        ) : null}

        {!priere ? (
          <div className="m-auto text-center text-cream/70">Cette prière n&apos;est plus disponible.</div>
        ) : (
          <>
            {/* Auteur et compte à rebours */}
            <div className="mt-6 flex flex-col items-center text-center">
              <div className="relative grid h-28 w-28 place-items-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
                  <circle
                    cx="50"
                    cy="50"
                    r={R}
                    fill="none"
                    stroke="#CAF000"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - progression)}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <Avatar pseudo={priere.author?.pseudo} url={priere.author?.avatar_url} size={84} />
              </div>
              <p className="mt-3 font-display text-2xl font-bold">
                <Nom p={priere} />
              </p>
              <p className="mt-1 text-[13px] font-semibold text-cream/70">
                {avant
                  ? `Commence dans ${mmss(debutMs(priere) - maintenant)}`
                  : enCours
                    ? `Il reste ${mmss(finMs(priere) - maintenant)}`
                    : "Prière terminée"}
              </p>
            </div>

            {/* Le sujet */}
            <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
              <TexteMembre
                texte={priere.sujet}
                tone="dark"
                rendu={(t) => (
                  <p className="text-center font-display text-[22px] font-semibold leading-snug" translate="no">
                    {t}
                  </p>
                )}
              />
              {priere.voice_url ? (
                <div className="mx-auto mt-5 max-w-xs">
                  <VoiceNotePlayer src={priere.voice_url} tone="dark" />
                </div>
              ) : null}
            </div>

            {/* Qui prie en ce moment */}
            <div className="mt-4 flex flex-col items-center">
              <div className="flex -space-x-2">
                {presents.slice(0, 7).map((x) => (
                  <span key={x.cle} className="rounded-full ring-2 ring-[#0B0B0A]">
                    <Avatar pseudo={x.pseudo ?? "?"} url={x.avatar} size={30} />
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[13px] text-cream/75">
                {avant
                  ? presents.length > 1
                    ? `${presents.length} personnes attendent`
                    : `${presents.length} personne attend`
                  : presents.length > 1
                    ? `${presents.length} personnes prient en ce moment`
                    : `${presents.length} personne prie en ce moment`}
                {nbAmens ? ` · ${nbAmens} amen` : ""}
              </p>
            </div>

            {/* Actions */}
            {fini ? (
              <div className="mt-5 text-center">
                <p className="font-display text-xl font-bold">{suivante ? "Prière suivante…" : "Merci d'avoir prié."}</p>
                {!suivante ? (
                  <button type="button" onClick={onFermer} className="mt-4 h-12 w-full rounded-full bg-dawn-400 font-bold text-night-950">
                    Retour au mur
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mt-5 flex justify-center gap-3">
                  {REACTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => reagir(e)}
                      className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl transition-transform active:scale-90"
                    >
                      {e}
                    </button>
                  ))}
                </div>
                {avant ? (
                  priere.programmee && userId ? (
                    <button
                      type="button"
                      onClick={basculerRappel}
                      className={`mt-4 h-14 w-full rounded-full text-[16px] font-bold ${prevenu ? "border border-dawn-400/50 text-dawn-300" : "bg-dawn-400 text-night-950"}`}
                    >
                      {prevenu ? "Tu seras prévenu" : "Me prévenir au début"}
                    </button>
                  ) : null
                ) : userId ? (
                  <button
                    type="button"
                    onClick={dire}
                    disabled={amen}
                    className={`mt-4 h-14 w-full rounded-full text-[16px] font-bold transition-colors ${
                      amen ? "border border-dawn-400/50 text-dawn-300" : "bg-dawn-400 text-night-950 shadow-[0_0_30px_rgba(202,240,0,0.25)]"
                    }`}
                  >
                    {amen ? "Amen, tu as prié" : "Amen, je prie"}
                  </button>
                ) : (
                  <Link href="/profil" className="mt-4 flex h-14 w-full items-center justify-center rounded-full border border-white/15 text-[15px] font-bold">
                    Connecte-toi pour dire Amen
                  </Link>
                )}
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
