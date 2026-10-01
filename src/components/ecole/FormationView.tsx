"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/community/useAuth";
import { TexteAvecRefs } from "@/components/bible/FichesChapitre";
import { asset } from "@/lib/asset";
import { addNote } from "@/lib/notebook";
import { askAssistant } from "@/lib/assistant";
import {
  ebookUrl,
  getFormation,
  listFormationProgress,
  validateLesson,
  type Formation,
  type Lecon,
} from "@/lib/formations";

/**
 * FORMATION e-learning (maquette validée) : fond crème, cartes blanches,
 * accents lime. Fiche → Mon parcours (leçons numérotées, coches, cadenas)
 * → Leçon (onglets Contenu / Notes / Questions) → Quiz « Valider ma
 * réponse » → écran de réussite → Félicitations sombres avec l'e-book.
 */

const SEUIL = 4;

/** Durée de lecture estimée d'une leçon (~180 mots/min). */
function dureeMin(l: Lecon): number {
  const mots = l.sections.reduce((n, s) => n + s.p.split(/\s+/).length, 0);
  return Math.max(4, Math.round(mots / 180) + 2);
}

/** Vrai une fois l'image réellement chargée. Sondée après montage : sur une
 * page exportée en statique, le 404 de l'image part avant que React
 * n'attache onError, donc le repli onError ne suffit pas. */
function useImageExiste(src?: string): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!src) return;
    let actif = true;
    const img = new Image();
    img.onload = () => {
      if (actif) setOk(true);
    };
    img.src = asset(src);
    return () => {
      actif = false;
    };
  }, [src]);
  return ok;
}

/** Vignette de leçon : l'image si elle existe, sinon rien (le numéro reste). */
function Vignette({ src }: { src: string }) {
  const ok = useImageExiste(src);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(src)} alt="" aria-hidden className="h-12 w-16 shrink-0 rounded-xl object-cover" />
  );
}

/** Héros d'une leçon ouverte (si l'image existe). */
function LeconHero({ src }: { src: string }) {
  const ok = useImageExiste(src);
  if (!ok) return null;
  return (
    <div className="mb-5 overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(src)} alt="" aria-hidden className="aspect-[16/9] w-full object-cover" />
    </div>
  );
}

const CheckCircle = ({ className = "h-6 w-6" }: { className?: string }) => (
  <span className={`grid place-items-center rounded-full bg-dawn-400 text-night-950 ${className}`}>
    <svg viewBox="0 0 24 24" className="h-[55%] w-[55%] fill-none stroke-current" strokeWidth={3}>
      <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export function FormationView({ formationId }: { formationId: string }) {
  const formation = getFormation(formationId);
  const { userId } = useAuth();
  const router = useRouter();
  const [done, setDone] = useState<number[]>([]);
  const [openLesson, setOpenLesson] = useState<number | null>(null);
  const [bravo, setBravo] = useState(false);

  useEffect(() => {
    if (userId && formation) {
      listFormationProgress(userId, formation.id).then((rows) => setDone(rows.map((r) => r.lesson)));
    } else setDone([]);
  }, [userId, formation]);

  const total = formation?.lecons.length ?? 0;
  const percent = total ? Math.round((done.length / total) * 100) : 0;
  const current = useMemo(() => {
    for (let i = 1; i <= total; i++) if (!done.includes(i)) return i;
    return total + 1;
  }, [done, total]);
  const complete = total > 0 && done.length >= total;
  const dureeTotale = useMemo(
    () => (formation ? formation.lecons.reduce((n, l) => n + dureeMin(l), 0) : 0),
    [formation],
  );

  if (!formation) return null;

  function onLessonValidated(n: number) {
    setDone((cur) => (cur.includes(n) ? cur : [...cur, n]));
    if (formation && n >= formation.lecons.length) {
      setOpenLesson(null);
      setBravo(true);
    }
  }

  /* ——— Écran Félicitations (sombre, façon maquette) ——— */
  if (bravo) {
    return (
      <div className="dark-ctx flex min-h-screen flex-col items-center justify-center bg-night-950 px-6 text-center text-cream">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-dawn-400/15">
          <CheckCircle className="h-16 w-16" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold">Félicitations !</h1>
        <p className="mt-2 text-[15px] text-cream/70">
          Tu as terminé la formation
          <br />
          <span className="font-bold text-cream">« {formation.titre} »</span>
        </p>
        <div className="mt-7 grid h-32 w-32 place-items-center rounded-full border-[6px] border-dawn-400">
          <p className="font-display text-2xl font-extrabold">
            {total}/{total}
            <span className="block text-[11px] font-bold text-cream/55">leçons</span>
          </p>
        </div>
        {formation.ebook ? (
          <a
            href={ebookUrl(formation.ebook) ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="mt-8 flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Télécharger mon e-book offert
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => setBravo(false)}
          className="mt-3 w-full max-w-xs rounded-full border border-white/25 py-3.5 font-display text-sm font-bold text-cream/80"
        >
          Revoir la formation
        </button>
      </div>
    );
  }

  /* ——— Leçon ouverte ——— */
  if (openLesson) {
    const lecon = formation.lecons[openLesson - 1];
    return (
      <LeconView
        formation={formation}
        lecon={lecon}
        numero={openLesson}
        userId={userId}
        dejaValidee={done.includes(openLesson)}
        onBack={() => setOpenLesson(null)}
        onValidated={() => onLessonValidated(openLesson)}
        onNext={openLesson < total ? () => setOpenLesson(openLesson + 1) : () => setOpenLesson(null)}
        onPrev={openLesson > 1 ? () => setOpenLesson(openLesson - 1) : undefined}
        onNavigate={(l, c) => router.push(`/bible/?livre=${l}&chap=${c}`)}
      />
    );
  }

  /* ——— Fiche formation + Mon parcours ——— */
  return (
    <div className="min-h-screen pb-32 text-night-900">
      {/* Fiche : l'affiche en carte */}
      <header className="container-x mx-auto max-w-2xl pt-[calc(env(safe-area-inset-top)+1rem)]">
        <Link
          href="/ecole"
          aria-label="École biblique"
          className="inline-grid h-10 w-10 place-items-center rounded-full border border-night-900/15 bg-white text-night-900"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <div className="relative mt-4 overflow-hidden rounded-3xl">
          {formation.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(formation.cover)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-top" />
          ) : null}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night-950/95 via-night-950/55 to-night-950/25" />
          {userId && done.length > 0 ? (
            <div className="absolute right-4 top-4 grid h-20 w-20 place-items-center">
              <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="rgba(12,12,11,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="#CAF000" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(percent / 100) * 213.6} 213.6`}
                />
              </svg>
              <p className="relative text-center font-display text-sm font-extrabold leading-none text-white">
                {percent}%
                <span className="block text-[9px] font-bold text-white/60">terminé</span>
              </p>
            </div>
          ) : null}
          <div className="relative p-5 pt-24">
            <span className="inline-block rounded-full bg-dawn-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-night-950">
              Formation
            </span>
            <h1 className="mt-2.5 font-display text-[1.7rem] font-extrabold leading-tight text-white">{formation.titre}</h1>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/80">{formation.accroche}</p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {[`${total} leçons`, `≈ ${Math.floor(dureeTotale / 60)}h${String(dureeTotale % 60).padStart(2, "0")}`, "Débutant"].map((m) => (
                <span key={m} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {userId ? (
          !complete ? (
            <button
              type="button"
              onClick={() => setOpenLesson(current)}
              className="mt-5 w-full rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950 shadow-[0_12px_30px_-12px_rgba(140,170,0,0.6)]"
            >
              {done.length === 0 ? "Commencer la formation" : "Reprendre la formation"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setBravo(true)}
              className="mt-5 w-full rounded-full bg-night-900 py-3.5 font-display text-base font-bold text-cream"
            >
              Formation terminée — voir ma récompense
            </button>
          )
        ) : (
          <div className="mt-5 rounded-2xl border border-night-900/10 bg-white p-4">
            <p className="text-sm text-night-900/70">
              Connecte-toi pour suivre la formation : ta progression est enregistrée et l&apos;e-book
              t&apos;est offert.
            </p>
            <Link href="/profil" className="mt-3 inline-flex rounded-full bg-dawn-400 px-5 py-2.5 font-display text-sm font-bold text-night-950">
              Se connecter
            </Link>
          </div>
        )}

        {/* Ce que tu vas apprendre */}
        <div className="mt-5 rounded-3xl bg-dawn-400/20 p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.3 1 2.1h5c0-.8.3-1.6 1-2.1A6 6 0 0 0 12 3zM10 19h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h2 className="font-display text-base font-extrabold">Ce que tu vas apprendre</h2>
          </div>
          <div className="mt-3 space-y-2">
            {formation.objectifs.map((o) => (
              <p key={o} className="flex items-start gap-2.5 text-sm font-semibold text-night-900/85">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={3.2}>
                    <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {o}
              </p>
            ))}
          </div>
        </div>

        {/* Les prochaines étapes */}
        <div className="mt-5 rounded-3xl border border-night-900/10 bg-white p-5">
          <h2 className="font-display text-base font-extrabold">Les prochaines étapes</h2>
          <div className="mt-4 flex items-start">
            {[
              ["Commencer", done.length > 0],
              ["Suivre les leçons", complete],
              ["Réussir les quiz", complete],
              ["Recevoir l'e-book", complete],
            ].map(([label, fait], i, arr) => (
              <div key={label as string} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : fait || (arr[i - 1] && arr[i - 1][1]) ? "bg-dawn-400" : "bg-night-900/10"}`} />
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${
                      fait ? "bg-dawn-400 text-night-950" : "bg-night-900/[0.07] text-night-900/60"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`h-0.5 flex-1 ${i === arr.length - 1 ? "bg-transparent" : fait ? "bg-dawn-400" : "bg-night-900/10"}`} />
                </div>
                <span className={`mt-1.5 text-[11px] font-bold leading-tight ${fait ? "text-[#5F7A00]" : "text-night-900/55"}`}>
                  {label as string}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Un mot pour toi */}
        <div className="mt-3 rounded-3xl border-l-4 border-dawn-400 bg-white p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">Un mot pour toi</p>
          <p className="mt-1.5 text-[15px] italic leading-relaxed text-night-900/85">
            « Ta parole est une lampe à mes pieds, une lumière sur mon sentier. »
          </p>
          <p className="mt-1 text-xs font-bold text-night-900/50">Psaumes 119.105</p>
        </div>

        {/* À propos */}
        <div className="mt-3 rounded-3xl border border-night-900/10 bg-white p-5">
          <h2 className="font-display text-base font-extrabold">À propos de cette formation</h2>
          <p className="mt-2 text-sm leading-relaxed text-night-900/70">{formation.intro}</p>
          {/* L'autrice */}
          <div className="mt-4 flex items-center gap-3 border-t border-night-900/10 pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/img/auteure-josy.webp")}
              alt={formation.auteur}
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-dawn-400/70"
            />
            <div className="min-w-0">
              <p className="font-display text-sm font-bold">{formation.auteur}</p>
              {formation.auteurRole ? <p className="text-xs text-night-900/55">{formation.auteurRole}</p> : null}
            </div>
          </div>
        </div>

        {/* E-book en accès direct */}
        {formation.ebook ? (
          <a
            href={ebookUrl(formation.ebook) ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-3.5 rounded-3xl border border-night-900/10 bg-white p-4"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-dawn-400 text-night-950">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] font-extrabold">E-book offert</span>
              <span className="block text-xs text-night-900/55">Télécharge le livre complet en PDF — gratuit.</span>
            </span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-night-900/35" strokeWidth={2}>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ) : null}
      </header>

      {/* Mon parcours */}
      <main className="container-x mx-auto mt-7 max-w-2xl">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-extrabold">Mon parcours</h2>
          {userId ? <span className="text-sm font-bold text-night-900/50">{percent} %</span> : null}
        </div>
        {userId ? (
          <>
            <p className="mt-0.5 text-sm text-night-900/55">
              {done.length}/{total} leçons
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-night-900/10">
              <div className="h-full rounded-full bg-dawn-400 transition-all" style={{ width: `${percent}%` }} />
            </div>
          </>
        ) : null}

        <div className="mt-4 space-y-2.5">
          {formation.lecons.map((lecon, i) => {
            const n = i + 1;
            const validee = done.includes(n);
            const courante = n === current && !complete;
            const verrouillee = !userId || (n > current && !validee);
            return (
              <button
                key={lecon.id}
                type="button"
                disabled={verrouillee}
                onClick={() => setOpenLesson(n)}
                className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                  courante
                    ? "border-dawn-400 bg-dawn-50 shadow-[0_10px_26px_-14px_rgba(140,170,0,0.5)]"
                    : "border-night-900/10 bg-white"
                } ${verrouillee ? "opacity-55" : ""}`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${
                    courante ? "bg-dawn-400 text-night-950" : "bg-night-900/[0.06] text-night-900"
                  }`}
                >
                  {n}
                </span>
                {lecon.image ? <Vignette src={lecon.image} /> : null}
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-extrabold leading-tight">{lecon.titre}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-night-900/50">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" strokeLinecap="round" />
                    </svg>
                    {dureeMin(lecon)} min
                  </span>
                </span>
                {validee ? (
                  <CheckCircle className="h-7 w-7 shrink-0" />
                ) : verrouillee && userId ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-night-900/35" strokeWidth={1.9}>
                    <path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : courante ? (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current stroke-none">
                      <path d="M8 5.5v13l11-6.5z" />
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ————————————————— LEÇON ————————————————— */

type OngletLecon = "contenu" | "notes" | "questions";

function LeconView({
  formation,
  lecon,
  numero,
  userId,
  dejaValidee,
  onBack,
  onValidated,
  onNext,
  onPrev,
  onNavigate,
}: {
  formation: Formation;
  lecon: Lecon;
  numero: number;
  userId: string | null;
  dejaValidee: boolean;
  onBack: () => void;
  onValidated: () => void;
  onNext: () => void;
  onPrev?: () => void;
  onNavigate: (l: number, c: number) => void;
}) {
  const [onglet, setOnglet] = useState<OngletLecon>("contenu");
  const [quizOn, setQuizOn] = useState(false);
  const [valide, setValide] = useState(dejaValidee);
  // Parcours guidé : 1. lire la leçon → 2. temps de réflexion → 3. quiz.
  const [etape, setEtape] = useState<"lecon" | "reflexion">("lecon");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [quizOn, onglet, etape]);

  if (quizOn) {
    return (
      <QuizView
        formation={formation}
        lecon={lecon}
        numero={numero}
        userId={userId}
        onBack={() => setQuizOn(false)}
        onValidated={() => {
          setValide(true);
          onValidated();
        }}
        onNext={onNext}
      />
    );
  }

  return (
    <div className="min-h-screen pb-32 text-night-900">
      {/* En-tête */}
      <div className="sticky top-0 z-10 border-b border-night-900/10 bg-[#F3F3ED]/95 backdrop-blur-md">
        <div className="container-x mx-auto max-w-2xl py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Retour"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">
                Leçon {numero}/{formation.lecons.length}
              </p>
              <p className="truncate font-display text-base font-extrabold leading-tight">{lecon.titre}</p>
            </div>
            {valide ? <CheckCircle className="h-7 w-7 shrink-0" /> : null}
          </div>
          {/* Onglets */}
          <div className="mt-2.5 flex rounded-full bg-night-900/[0.06] p-1 text-sm font-bold">
            {(
              [
                ["contenu", "Contenu"],
                ["notes", "Notes"],
                ["questions", "Questions"],
              ] as [OngletLecon, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setOnglet(t)}
                className={`flex-1 rounded-full py-2 transition-colors ${
                  onglet === t ? "bg-dawn-400 text-night-950" : "text-night-900/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container-x mx-auto max-w-2xl pt-5">
        {onglet === "contenu" ? (
          <>
            {/* Parcours de la leçon : Leçon → Réflexion → Quiz */}
            <div className="mb-5 flex items-center gap-1.5">
              {(
                [
                  ["Leçon", etape === "lecon", true],
                  ["Réflexion", etape === "reflexion", etape === "reflexion" || valide],
                  ["Quiz", false, valide],
                ] as [string, boolean, boolean][]
              ).map(([label, courante, atteinte], i) => (
                <div key={label} className="flex flex-1 items-center gap-1.5">
                  <div
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-[11px] font-black uppercase tracking-wide ${
                      courante
                        ? "bg-dawn-400 text-night-950"
                        : atteinte
                          ? "bg-dawn-50 text-[#5F7A00]"
                          : "bg-night-900/[0.05] text-night-900/40"
                    }`}
                  >
                    <span>{i + 1}</span>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {etape === "reflexion" ? (
              <ReflexionLecon
                formation={formation}
                lecon={lecon}
                numero={numero}
                valide={valide}
                onQuiz={() => setQuizOn(true)}
                onRetour={() => setEtape("lecon")}
              />
            ) : (
              <>
            {lecon.image ? <LeconHero src={lecon.image} /> : null}

            {/* Chapitres de la leçon */}
            <div className="mb-5 rounded-3xl border border-night-900/10 bg-white p-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-display text-base font-extrabold">Chapitres de la leçon</h2>
                <span className="text-xs font-bold text-night-900/50">{lecon.sections.length} parties</span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {lecon.sections.map((sec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => document.getElementById(`lecon-sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex w-full items-center gap-3 rounded-2xl bg-night-900/[0.04] px-3 py-2.5 text-left"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-night-900">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current stroke-none">
                        <path d="M8 5.5v13l11-6.5z" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-night-900/85">
                      {i + 1}. {sec.t}
                    </span>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-night-900/30" strokeWidth={2}>
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {lecon.sections.map((s, i) => (
                <section key={i} id={`lecon-sec-${i}`} className="scroll-mt-28 rounded-3xl border border-night-900/10 bg-white p-5">
                  <h2 className="font-display text-[17px] font-extrabold leading-snug">
                    {i + 1}. {s.t}
                  </h2>
                  <div className="mt-2.5 space-y-3">
                    {s.p.split("\n\n").map((par, j) =>
                      par.trim().startsWith("«") ? (
                        <div key={j} className="rounded-2xl border-l-4 border-dawn-400 bg-dawn-50 px-4 py-3">
                          <TexteAvecRefs texte={par} onNavigate={onNavigate} light />
                        </div>
                      ) : (
                        <TexteAvecRefs key={j} texte={par} onNavigate={onNavigate} light />
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* Fin de la lecture → temps de réflexion */}
            <button
              type="button"
              onClick={() => setEtape("reflexion")}
              className="mt-6 w-full rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950 shadow-[0_12px_30px_-12px_rgba(140,170,0,0.6)]"
            >
              J&apos;ai lu la leçon — temps de réflexion
            </button>
            <p className="mt-2 text-center text-xs text-night-900/45">
              Puis un quiz de {lecon.quiz.length} questions · {SEUIL} bonnes réponses pour débloquer la suite
            </p>
            <div className="mt-4 flex gap-2.5">
              {onPrev ? (
                <button
                  type="button"
                  onClick={onPrev}
                  className="flex-1 rounded-full border border-night-900/15 bg-white py-3 font-display text-sm font-bold text-night-900/70"
                >
                  Leçon précédente
                </button>
              ) : null}
              {valide ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="flex-1 rounded-full bg-night-900 py-3 font-display text-sm font-bold text-cream"
                >
                  Leçon suivante
                </button>
              ) : null}
            </div>
              </>
            )}
          </>
        ) : onglet === "notes" ? (
          <NotesLecon formation={formation} lecon={lecon} numero={numero} />
        ) : (
          <QuestionsLecon formation={formation} lecon={lecon} userId={userId} onNavigate={onNavigate} />
        )}
      </main>
    </div>
  );
}

/* ——— Étape 2 du parcours : le temps de réflexion avant le quiz ——— */
function ReflexionLecon({
  formation,
  lecon,
  numero,
  valide,
  onQuiz,
  onRetour,
}: {
  formation: Formation;
  lecon: Lecon;
  numero: number;
  valide: boolean;
  onQuiz: () => void;
  onRetour: () => void;
}) {
  const [texte, setTexte] = useState("");
  const [ok, setOk] = useState(false);
  return (
    <>
      <div className="space-y-6">
        <section className="rounded-3xl border border-night-900/10 bg-white p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-night-900/50">Temps de réflexion</p>
          <p className="mt-2 text-[15px] leading-relaxed text-night-900/85">
            Avant le quiz, prends un moment de calme. Relis l&apos;engagement de cette
            leçon, regarde comment l&apos;appliquer concrètement, et confie à Dieu ce que
            tu viens de lire.
          </p>
        </section>

        {/* Mon engagement */}
        <section className="rounded-3xl border border-dawn-400/60 bg-dawn-50 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">Mon engagement</p>
          <div className="mt-2 space-y-3">
            {lecon.engagement.split("\n\n").map((par, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-night-900/85">{par}</p>
            ))}
          </div>
        </section>

        {/* Comment l'appliquer */}
        <section className="rounded-3xl border border-night-900/10 bg-white p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-night-900/50">
            Comment l&apos;appliquer ?
          </p>
          <ul className="mt-2.5 space-y-2">
            {lecon.application.map((a) => (
              <li key={a} className="flex items-start gap-2.5 text-sm leading-snug text-night-900/80">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-[#5F7A00]" strokeWidth={2.4}>
                  <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {a}
              </li>
            ))}
          </ul>
        </section>

        {/* Ma réflexion personnelle */}
        <section className="rounded-3xl border border-night-900/10 bg-white p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-night-900/50">Ma réflexion</p>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={4}
            placeholder="Ce que Dieu me montre dans cette leçon…"
            className="mt-2.5 w-full resize-y rounded-2xl border border-night-900/15 bg-[#FAFAF6] px-3.5 py-3 text-[15px] text-night-900 placeholder:text-night-900/35 focus:outline-none"
          />
          <button
            type="button"
            disabled={!texte.trim()}
            onClick={() => {
              addNote({
                category: "Note",
                title: `${formation.titre} — Réflexion leçon ${numero} : ${lecon.titre}`,
                body: texte.trim(),
              });
              setTexte("");
              setOk(true);
              setTimeout(() => setOk(false), 2500);
            }}
            className="mt-3 rounded-full border border-night-900/15 px-5 py-2.5 font-display text-sm font-bold text-night-900/75 disabled:opacity-40"
          >
            Garder dans mon carnet
          </button>
          {ok ? <p className="mt-2 text-sm font-semibold text-[#5F7A00]">Réflexion enregistrée.</p> : null}
        </section>
      </div>

      <button
        type="button"
        onClick={onQuiz}
        className="mt-6 w-full rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950 shadow-[0_12px_30px_-12px_rgba(140,170,0,0.6)]"
      >
        {valide ? "Refaire le quiz" : "Passer au quiz"}
      </button>
      <p className="mt-2 text-center text-xs text-night-900/45">
        {lecon.quiz.length} questions · {SEUIL} bonnes réponses pour valider la leçon
      </p>
      <button
        type="button"
        onClick={onRetour}
        className="mt-4 w-full rounded-full border border-night-900/15 bg-white py-3 font-display text-sm font-bold text-night-900/70"
      >
        Revenir à la leçon
      </button>
    </>
  );
}

/* ——— Onglet Notes : enregistrées dans le carnet ——— */
function NotesLecon({ formation, lecon, numero }: { formation: Formation; lecon: Lecon; numero: number }) {
  const [texte, setTexte] = useState("");
  const [ok, setOk] = useState(false);
  return (
    <div className="rounded-3xl border border-night-900/10 bg-white p-5">
      <p className="text-sm text-night-900/60">
        Note ce que tu retiens de cette leçon — ta note est rangée dans <span className="font-bold">Mon carnet</span>.
      </p>
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={6}
        placeholder="Ce que Dieu me montre dans cette leçon…"
        className="mt-3 w-full resize-y rounded-2xl border border-night-900/15 bg-[#FAFAF6] px-3.5 py-3 text-[15px] text-night-900 placeholder:text-night-900/35 focus:outline-none"
      />
      <button
        type="button"
        disabled={!texte.trim()}
        onClick={() => {
          addNote({
            category: "Note",
            title: `${formation.titre} — Leçon ${numero} : ${lecon.titre}`,
            body: texte.trim(),
          });
          setTexte("");
          setOk(true);
          setTimeout(() => setOk(false), 2500);
        }}
        className="mt-3 rounded-full bg-dawn-400 px-6 py-2.5 font-display text-sm font-bold text-night-950 disabled:opacity-40"
      >
        Enregistrer dans mon carnet
      </button>
      {ok ? <p className="mt-2 text-sm font-semibold text-[#5F7A00]">Note enregistrée.</p> : null}
    </div>
  );
}

/* ——— Onglet Questions : l'assistant, avec la leçon en contexte ——— */
function QuestionsLecon({
  formation,
  lecon,
  userId,
  onNavigate,
}: {
  formation: Formation;
  lecon: Lecon;
  userId: string | null;
  onNavigate: (l: number, c: number) => void;
}) {
  const [q, setQ] = useState("");
  const [rep, setRep] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function envoyer() {
    const question = q.trim();
    if (!question || busy) return;
    setErr(null);
    setBusy(true);
    const contexte = lecon.sections.map((s) => `${s.t} : ${s.p}`).join("\n").slice(0, 1500);
    const res = await askAssistant([
      {
        role: "user",
        content: `Dans la formation « ${formation.titre} », leçon « ${lecon.titre} » (extrait : ${contexte}) — ma question : ${question}`,
      },
    ]);
    setBusy(false);
    if (res.ok) setRep(res.answer);
    else
      setErr(
        res.error === "quota"
          ? "Tu as posé tes 10 questions des dernières 24 h. Reviens un peu plus tard."
          : res.error === "auth"
            ? "Connecte-toi pour poser ta question."
            : "Petit souci de connexion. Réessaie dans un instant.",
      );
  }

  return (
    <div className="rounded-3xl border border-night-900/10 bg-white p-5">
      {!userId ? (
        <p className="text-sm text-night-900/60">Connecte-toi pour poser ta question sur cette leçon.</p>
      ) : rep ? (
        <>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">Réponse</p>
          <div className="mt-2 space-y-2.5">
            {rep.split("\n\n").map((par, i) => (
              <TexteAvecRefs key={i} texte={par} onNavigate={onNavigate} light />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setRep(null);
              setQ("");
            }}
            className="mt-3 rounded-full border border-night-900/15 px-4 py-2 text-xs font-bold text-night-900/70"
          >
            Poser une autre question
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-night-900/60">
            Une question sur cette leçon ? L&apos;assistant répond, versets à l&apos;appui.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") envoyer();
              }}
              placeholder="Écris ta question ici…"
              disabled={busy}
              className="flex-1 rounded-full border border-night-900/15 bg-[#FAFAF6] px-4 py-2.5 text-sm text-night-900 placeholder:text-night-900/35 focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={envoyer}
              disabled={!q.trim() || busy}
              aria-label="Envoyer"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
                <path d="M4 12l16-7-4.5 7L20 19zM4 12h11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {busy ? <p className="mt-2.5 text-xs font-semibold text-night-900/50">L&apos;assistant médite ta question…</p> : null}
          {err ? <p className="mt-2.5 text-xs font-semibold text-red-600">{err}</p> : null}
        </>
      )}
    </div>
  );
}

/* ————————————————— QUIZ ————————————————— */

function QuizView({
  formation,
  lecon,
  numero,
  userId,
  onBack,
  onValidated,
  onNext,
}: {
  formation: Formation;
  lecon: Lecon;
  numero: number;
  userId: string | null;
  onBack: () => void;
  onValidated: () => void;
  onNext: () => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [fini, setFini] = useState(false);
  const question = lecon.quiz[qIndex];
  const reussi = score >= SEUIL;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [qIndex, verdict, fini]);

  function valider() {
    if (choix === null || verdict !== null) return;
    const bon = choix === question.bonne;
    if (bon) setScore((s) => s + 1);
    setVerdict(bon);
  }

  async function suivante() {
    if (qIndex + 1 < lecon.quiz.length) {
      setQIndex(qIndex + 1);
      setChoix(null);
      setVerdict(null);
    } else {
      setFini(true);
      if (score >= SEUIL && userId) {
        const ok = await validateLesson(userId, formation.id, numero, score);
        if (ok) onValidated();
      }
    }
  }

  const LETTRES = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen pb-32 text-night-900">
      <div className="sticky top-0 z-10 border-b border-night-900/10 bg-[#F3F3ED]/95 backdrop-blur-md">
        <div className="container-x mx-auto flex max-w-2xl items-center gap-3 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour à la leçon"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="min-w-0 flex-1 truncate font-display text-base font-extrabold">
            Quiz — Leçon {numero}
          </p>
          {!fini ? (
            <span className="shrink-0 text-sm font-bold text-night-900/50">
              {qIndex + 1}/{lecon.quiz.length}
            </span>
          ) : null}
        </div>
        {!fini ? (
          <div className="container-x mx-auto max-w-2xl pb-3">
            <div className="h-2 overflow-hidden rounded-full bg-night-900/10">
              <div
                className="h-full rounded-full bg-dawn-400 transition-all"
                style={{ width: `${((qIndex + (verdict !== null ? 1 : 0)) / lecon.quiz.length) * 100}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <main className="container-x mx-auto max-w-2xl pt-6">
        {fini ? (
          <div className="pt-4 text-center">
            <span
              className={`mx-auto grid h-24 w-24 place-items-center rounded-full font-display text-2xl font-extrabold ${
                reussi ? "bg-dawn-400 text-night-950" : "bg-night-900/10 text-night-900"
              }`}
            >
              {score}/{lecon.quiz.length}
            </span>
            <h2 className="mt-5 font-display text-2xl font-extrabold">
              {reussi ? "Leçon validée !" : "Presque…"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-night-900/60">
              {reussi
                ? numero < formation.lecons.length
                  ? "Bravo ! La leçon suivante est déverrouillée."
                  : "Bravo, c'était la dernière leçon de la formation !"
                : `Il faut ${SEUIL} bonnes réponses sur ${lecon.quiz.length}. Relis la leçon tranquillement et retente — tu vas y arriver.`}
            </p>
            <div className="mt-6 flex flex-col items-center gap-2.5">
              {reussi ? (
                <button type="button" onClick={onNext} className="rounded-full bg-dawn-400 px-7 py-3 font-display text-base font-bold text-night-950">
                  {numero < formation.lecons.length ? "Leçon suivante" : "Terminer"}
                </button>
              ) : (
                <>
                  <button type="button" onClick={onBack} className="rounded-full bg-dawn-400 px-7 py-3 font-display text-base font-bold text-night-950">
                    Relire la leçon
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQIndex(0);
                      setChoix(null);
                      setVerdict(null);
                      setScore(0);
                      setFini(false);
                    }}
                    className="rounded-full border border-night-900/20 px-7 py-3 font-display text-sm font-bold text-night-900/70"
                  >
                    Retenter le quiz
                  </button>
                </>
              )}
            </div>
          </div>
        ) : verdict !== null ? (
          <div className="pt-4 text-center">
            <span
              className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${
                verdict ? "bg-dawn-400 text-night-950" : "bg-orange-400 text-white"
              }`}
            >
              {verdict ? (
                <svg viewBox="0 0 24 24" className="h-10 w-10 fill-none stroke-current" strokeWidth={2.6}>
                  <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-9 w-9 fill-none stroke-current" strokeWidth={2.6}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold">
              {verdict ? "Bonne réponse !" : "Ce n'est pas ça"}
            </h2>
            {!verdict ? (
              <p className="mt-1.5 text-sm font-bold text-night-900/60">
                La bonne réponse : {LETTRES[question.bonne]} — {question.choix[question.bonne]}
              </p>
            ) : null}
            <div className="mx-auto mt-4 max-w-md rounded-2xl border-l-4 border-dawn-400 bg-white p-4 text-left">
              <p className="text-sm leading-relaxed text-night-900/80">{question.explication}</p>
            </div>
            <button
              type="button"
              onClick={suivante}
              className="mt-6 rounded-full bg-dawn-400 px-8 py-3 font-display text-base font-bold text-night-950"
            >
              {qIndex + 1 < lecon.quiz.length ? "Question suivante" : "Voir mon résultat"}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-night-900/50">
              Question {qIndex + 1} sur {lecon.quiz.length}
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold leading-snug">{question.q}</h2>
            <div className="mt-5 space-y-2.5">
              {question.choix.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setChoix(i)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] font-semibold transition-colors ${
                    choix === i ? "border-dawn-400 bg-dawn-50" : "border-night-900/12 bg-white"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${
                      choix === i ? "bg-dawn-400 text-night-950" : "bg-night-900/[0.06] text-night-900/70"
                    }`}
                  >
                    {LETTRES[i]}
                  </span>
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={valider}
              disabled={choix === null}
              className="mt-6 w-full rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950 shadow-[0_12px_30px_-12px_rgba(140,170,0,0.6)] disabled:opacity-40"
            >
              Valider ma réponse
            </button>
          </>
        )}
      </main>
    </div>
  );
}
