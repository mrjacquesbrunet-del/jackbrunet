"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PassageInline } from "@/components/bible/PassageInline";
import { BibleAudioPlayer } from "@/components/bible/BibleAudioPlayer";
import { DuoNotes } from "@/components/plans/PlanDuo";
import { localeApp, t } from "@/lib/i18n";
import type { AudioTrack } from "@/lib/audio-library";
import type { DuoNote, PlanDuo } from "@/lib/plan-duo";
import type { ThemePlan, ThemePlanDay } from "@/lib/types";

/** Durée de lecture estimée d'un jour (minutes). */
export function dureeJour(d: ThemePlanDay): number {
  const mots = [d.meditation, d.question, d.priere, d.aRetenir]
    .filter(Boolean)
    .join(" ")
    .split(/\s+/).length;
  return Math.max(3, Math.round(mots / 150) + (d.lecture ? 4 : 1));
}

type Segment = { id: string; texte: string };
type Verset = { n: number; text: string };

/** « Jean 3:16-18 » → livre, chapitre, versets (pour éviter de relire deux fois). */
function decouper(ref: string) {
  const m = ref.match(/^(.*?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  return m ? { livre: m[1], chap: Number(m[2]), v1: Number(m[3]), v2: Number(m[4] ?? m[3]) } : null;
}
function dansLaLecture(ref: string, lecture?: string) {
  const a = decouper(ref);
  const b = lecture ? decouper(lecture) : null;
  return Boolean(a && b && a.livre === b.livre && a.chap === b.chap && a.v1 >= b.v1 && a.v2 <= b.v2);
}

/**
 * Lecture d'un jour de plan en plein écran (comme une leçon de la
 * formation) : passage biblique du jour, méditation, versets, question,
 * prière et phrase à retenir. Le lecteur audio est celui de la Bible
 * (narration enregistrée si elle existe, sinon voix de l'appareil passage
 * par passage avec surlignage et défilement), avec vitesse, soaking,
 * répétition et minuteur.
 */
export function PlanJour({
  plan,
  jour,
  fait,
  piste,
  duo,
  userId,
  duoNotes,
  onDuoNotes,
  onFermer,
  onAller,
  onTerminer,
  onAnnuler,
}: {
  plan: ThemePlan;
  jour: ThemePlanDay;
  fait: boolean;
  /** Narration enregistrée du jour (voix de Jack), ou null. */
  piste: AudioTrack | null;
  duo: PlanDuo | null;
  userId: string | null;
  duoNotes: DuoNote[];
  onDuoNotes: (f: (cur: DuoNote[]) => DuoNote[]) => void;
  onFermer: () => void;
  onAller: (day: number) => void;
  onTerminer: () => void;
  onAnnuler: () => void;
}) {
  const total = plan.days.length;
  const n = jour.day;
  const [versetsLecture, setVersetsLecture] = useState<Verset[]>([]);
  const [versetsCles, setVersetsCles] = useState<Record<string, Verset[]>>({});
  const [actif, setActif] = useState<string | null>(null);
  const defilRef = useRef<HTMLDivElement | null>(null);
  const pauseDefilRef = useRef(0);

  useEffect(() => {
    setVersetsLecture([]);
    setVersetsCles({});
    setActif(null);
    defilRef.current?.scrollTo(0, 0);
  }, [n]);

  // Le lecteur fait défiler le texte ; si on touche l'écran, il attend 6 s.
  useEffect(() => {
    const el = defilRef.current;
    if (!el) return;
    const marque = () => {
      pauseDefilRef.current = Date.now() + 6000;
    };
    el.addEventListener("touchstart", marque, { passive: true });
    el.addEventListener("wheel", marque, { passive: true });
    return () => {
      el.removeEventListener("touchstart", marque);
      el.removeEventListener("wheel", marque);
    };
  }, []);

  const paragraphes = useMemo(() => jour.meditation.split("\n\n"), [jour.meditation]);

  // Ce que lit la voix de l'appareil, dans l'ordre de la page.
  const segments = useMemo<Segment[]>(() => {
    const s: Segment[] = [{ id: "titre", texte: `${t("Jour")} ${n}. ${jour.title}.` }];
    if (jour.lecture && versetsLecture.length) {
      s.push({ id: "lec-titre", texte: `${t("Lecture du jour")} : ${jour.lecture}.` });
      for (const v of versetsLecture) s.push({ id: `lec-${v.n}`, texte: v.text });
    }
    // Versets clés (sauf ceux déjà lus dans le passage du jour).
    jour.verses.forEach((ref, k) => {
      const vs = versetsCles[ref];
      if (!vs?.length || dansLaLecture(ref, jour.lecture)) return;
      s.push({ id: `cle-${k}-titre`, texte: `${ref}.` });
      for (const v of vs) s.push({ id: `cle-${k}-${v.n}`, texte: v.text });
    });
    paragraphes.forEach((p, i) => s.push({ id: `med-${i}`, texte: p.replace(/^## /, "") }));
    if (jour.pratique?.length) {
      s.push({ id: "pratique-titre", texte: `${t("Mettre en pratique")}.` });
      jour.pratique.forEach((x, i) => s.push({ id: `pratique-${i}`, texte: `${x.titre}. ${x.texte}` }));
    }
    if (jour.question) s.push({ id: "question", texte: `${t("Pour réfléchir")}. ${jour.question}` });
    if (jour.priere) s.push({ id: "priere", texte: `${t("Prière")}. ${jour.priere}` });
    if (jour.aRetenir) s.push({ id: "retenir", texte: `${t("À retenir")}. ${jour.aRetenir}` });
    return s;
  }, [n, jour, versetsLecture, versetsCles, paragraphes]);
  const textes = useMemo(() => segments.map((s) => s.texte), [segments]);

  const onVerse = useCallback(
    (i: number | null) => setActif(i === null ? null : segments[i]?.id ?? null),
    [segments],
  );

  // Suit la voix : le passage lu reste au milieu de l'écran.
  useEffect(() => {
    if (!actif || Date.now() < pauseDefilRef.current) return;
    document.getElementById(`seg-${actif}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [actif]);

  const surligne = (id: string) =>
    actif === id ? "-mx-2 rounded-xl bg-dawn-400/25 px-2 transition-colors" : "transition-colors";
  const versetActif = actif?.startsWith("lec-") && actif !== "lec-titre" ? Number(actif.slice(4)) : null;
  const versetCleActif = (k: number) => {
    const m = actif?.match(/^cle-(\d+)-(\d+)$/);
    return m && Number(m[1]) === k ? Number(m[2]) : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F3F3ED] text-night-900">
      {/* En-tête */}
      <div className="border-b border-night-900/10 bg-[#F3F3ED]/95">
        <div className="container-x mx-auto max-w-2xl py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onFermer}
              aria-label="Revenir au plan"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">
                Jour {n}/{total} · {plan.title}
              </p>
              <p className="truncate font-display text-base font-extrabold leading-tight">{jour.title}</p>
            </div>
            {fait ? (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950" aria-label="Jour terminé">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={3}>
                  <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            ) : null}
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-night-900/10">
            <div className="h-full rounded-full bg-dawn-400 transition-all" style={{ width: `${(n / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Texte du jour */}
      <div ref={defilRef} className="flex-1 overflow-y-auto">
        <div className="container-x mx-auto max-w-2xl pb-56 pt-5">
          {/* Titre du jour */}
          <div id="seg-titre" className={surligne("titre")}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-dawn-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-night-950">
              Jour {n}
            </span>
            <h1 className="mt-2.5 font-display text-[1.65rem] font-extrabold leading-tight">{jour.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-night-900/50">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" />
              </svg>
              {dureeJour(jour)} min · Touche le bouton audio pour écouter
            </p>
          </div>

          {/* Lecture du jour */}
          {jour.lecture ? (
            <section className="mt-5">
              <p id="seg-lec-titre" className={`mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00] ${surligne("lec-titre")}`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16z" strokeLinejoin="round" />
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinejoin="round" />
                </svg>
                Lecture du jour
              </p>
              <PassageInline
                key={jour.lecture}
                reference={jour.lecture}
                actif={versetActif}
                ancre="seg-lec"
                onVerses={setVersetsLecture}
              />
            </section>
          ) : null}

          {/* Versets clés : toujours lus AVANT l'exhortation */}
          {jour.verses.length > 0 ? (
            <section className="mt-5 space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">
                {jour.lecture ? "Versets clés" : "À lire & méditer"}
              </p>
              {jour.verses.map((v, k) => (
                <div key={v} id={`seg-cle-${k}-titre`} className={actif === `cle-${k}-titre` ? "rounded-2xl ring-2 ring-dawn-400/60" : ""}>
                  <PassageInline
                    reference={v}
                    actif={versetCleActif(k)}
                    ancre={`seg-cle-${k}`}
                    onVerses={(vs) => setVersetsCles((cur) => ({ ...cur, [v]: vs }))}
                  />
                </div>
              ))}
            </section>
          ) : null}

          {/* Méditation */}
          <section className="mt-5 rounded-3xl border border-night-900/10 bg-white p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">Méditation</p>
            <div className="mt-2 space-y-3.5 text-[16px] leading-relaxed text-night-900/85">
              {paragraphes.map((para, i) =>
                para.startsWith("## ") ? (
                  <h2
                    key={i}
                    id={`seg-med-${i}`}
                    className={`pt-2 font-display text-[19px] font-extrabold leading-snug text-night-900 ${surligne(`med-${i}`)}`}
                  >
                    {para.slice(3)}
                  </h2>
                ) : (
                  <p key={i} id={`seg-med-${i}`} className={surligne(`med-${i}`)}>
                    {para}
                  </p>
                ),
              )}
            </div>
          </section>

          {/* Mettre en pratique */}
          {jour.pratique?.length ? (
            <section className="mt-5 rounded-3xl bg-dawn-400/20 p-5">
              <p id="seg-pratique-titre" className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00] ${surligne("pratique-titre")}`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2} aria-hidden>
                  <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Mettre en pratique
              </p>
              <ol className="mt-3 space-y-3">
                {jour.pratique.map((x, i) => (
                  <li key={i} id={`seg-pratique-${i}`} className={`flex gap-3 rounded-2xl bg-white p-3.5 ${actif === `pratique-${i}` ? "ring-2 ring-dawn-400" : ""}`}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-dawn-400 font-display text-xs font-extrabold text-night-950">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[15px] font-extrabold leading-snug">{x.titre}</span>
                      <span className="mt-0.5 block text-[15px] leading-relaxed text-night-900/80">{x.texte}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {jour.pourAllerPlusLoin?.length ? <PourAllerPlusLoin refs={jour.pourAllerPlusLoin} /> : null}

          {jour.question ? (
            <div id="seg-question" className={`mt-5 rounded-3xl border-l-4 border-dawn-400 bg-white p-4 ${actif === "question" ? "ring-2 ring-dawn-400/60" : ""}`}>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">Pour réfléchir</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-night-900/85">{jour.question}</p>
            </div>
          ) : null}

          {jour.priere ? (
            <div id="seg-priere" className={`mt-3 rounded-3xl bg-dawn-400/20 p-4 ${actif === "priere" ? "ring-2 ring-dawn-400/60" : ""}`}>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">Prière</p>
              <p className="mt-1.5 font-display text-[16px] italic leading-relaxed text-night-900/90">{jour.priere}</p>
            </div>
          ) : null}

          {jour.aRetenir ? (
            <div id="seg-retenir" className={`mt-3 flex gap-3 rounded-3xl bg-night-950 p-4 text-cream ${actif === "retenir" ? "ring-2 ring-dawn-400" : ""}`}>
              <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 fill-none stroke-dawn-400" strokeWidth={2} aria-hidden>
                <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-dawn-400">À retenir</p>
                <p className="mt-0.5 text-[15px] font-bold leading-snug">{jour.aRetenir}</p>
              </div>
            </div>
          ) : null}

          {duo?.status === "active" && userId ? (
            <div className="dark-ctx mt-5 rounded-3xl bg-night-950 p-4 text-cream">
              <DuoNotes
                duo={duo}
                day={n}
                userId={userId}
                notes={duoNotes}
                onAdd={(x) => onDuoNotes((cur) => [...cur, x])}
                onDelete={(id) => onDuoNotes((cur) => cur.filter((y) => y.id !== id))}
              />
            </div>
          ) : null}

          {/* Valider le jour, passer au suivant */}
          {fait ? (
            <>
              {n < total ? (
                <button
                  type="button"
                  onClick={() => onAller(n + 1)}
                  className="mt-8 w-full rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950 shadow-[0_12px_30px_-12px_rgba(140,170,0,0.6)]"
                >
                  Jour suivant ({n + 1}/{total})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onFermer}
                  className="mt-8 w-full rounded-full bg-night-900 py-3.5 font-display text-base font-bold text-cream"
                >
                  Revenir au plan
                </button>
              )}
              <p className="mt-2 text-center text-xs text-night-900/45">
                Jour déjà terminé ·{" "}
                <button type="button" onClick={onAnnuler} className="font-bold underline underline-offset-2">
                  le marquer comme non lu
                </button>
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onTerminer}
                className="mt-8 w-full rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950 shadow-[0_12px_30px_-12px_rgba(140,170,0,0.6)]"
              >
                {n < total ? `J'ai terminé le jour ${n}` : "J'ai terminé le plan"}
              </button>
              <p className="mt-2 text-center text-xs text-night-900/45">
                {n < total ? `Puis le jour ${n + 1} s'ouvre directement` : "Dernier jour du plan"}
              </p>
            </>
          )}
          <div className="mt-3 flex gap-2.5">
            {n > 1 ? (
              <button
                type="button"
                onClick={() => onAller(n - 1)}
                className="flex-1 rounded-full border border-night-900/15 bg-white py-3 font-display text-sm font-bold text-night-900/70"
              >
                Jour précédent
              </button>
            ) : null}
            {!fait && n < total ? (
              <button
                type="button"
                onClick={() => onAller(n + 1)}
                className="flex-1 rounded-full border border-night-900/15 bg-white py-3 font-display text-sm font-bold text-night-900/70"
              >
                Voir le jour {n + 1}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <BibleAudioPlayer
        bookId={0}
        verses={textes}
        bookName={plan.title}
        chapter={n}
        chapterCount={total}
        onVerse={onVerse}
        onPrevChapter={() => n > 1 && onAller(n - 1)}
        onNextChapter={() => n < total && onAller(n + 1)}
        canPrev={n > 1}
        canNext={n < total}
        piste={piste}
        libelles={{
          element: t("Passage"),
          titre: `${t("Jour")} ${n} · ${jour.title}`,
          precedent: t("Jour précédent"),
          suivant: t("Jour suivant"),
        }}
        langueVoix={localeApp()}
      />
    </div>
  );
}

/** « Pour aller plus loin » : références à ouvrir une par une (texte dans l'app). */
function PourAllerPlusLoin({ refs }: { refs: string[] }) {
  const [ouverte, setOuverte] = useState<string | null>(null);
  return (
    <section className="mt-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">Pour aller plus loin</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {refs.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setOuverte(ouverte === r ? null : r)}
            translate="no"
            className={`rounded-full border px-3 py-1.5 text-[13px] font-bold transition-colors ${
              ouverte === r ? "border-dawn-400 bg-dawn-400 text-night-950" : "border-night-900/15 bg-white text-night-900/80"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      {ouverte ? (
        <div className="mt-3">
          <PassageInline key={ouverte} reference={ouverte} />
        </div>
      ) : null}
    </section>
  );
}
