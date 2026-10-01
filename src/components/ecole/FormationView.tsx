"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/community/useAuth";
import { TexteAvecRefs } from "@/components/bible/FichesChapitre";
import { Celebration } from "@/components/ui/Celebration";
import {
  ebookUrl,
  getFormation,
  listFormationProgress,
  validateLesson,
  type Formation,
  type Lecon,
} from "@/lib/formations";

/**
 * FORMATION de l'École biblique — l'expérience « vraie école » :
 * présentation, leçons à déverrouillage progressif, quiz de validation
 * (4/5 pour valider), progression EN BASE, e-book offert à la fin.
 */

const SEUIL = 4; // bonnes réponses sur 5 pour valider une leçon

export function FormationView({ formationId }: { formationId: string }) {
  const formation = getFormation(formationId);
  const { userId } = useAuth();
  const router = useRouter();
  const [done, setDone] = useState<number[]>([]);
  const [openLesson, setOpenLesson] = useState<number | null>(null); // 1-based
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (userId && formation) {
      listFormationProgress(userId, formation.id).then((rows) =>
        setDone(rows.map((r) => r.lesson)),
      );
    } else {
      setDone([]);
    }
  }, [userId, formation]);

  const total = formation?.lecons.length ?? 0;
  const percent = total ? Math.round((done.length / total) * 100) : 0;
  // Prochaine leçon = la première non validée.
  const current = useMemo(() => {
    for (let i = 1; i <= total; i++) if (!done.includes(i)) return i;
    return total + 1;
  }, [done, total]);
  const complete = total > 0 && done.length >= total;

  if (!formation) return null;

  function onLessonValidated(n: number) {
    setDone((cur) => (cur.includes(n) ? cur : [...cur, n]));
    if (formation && n >= formation.lecons.length) {
      setOpenLesson(null);
      setCelebrate(true);
    }
  }

  // ——— Vue leçon ouverte ———
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
        onNext={
          openLesson < total
            ? () => setOpenLesson(openLesson + 1)
            : () => setOpenLesson(null)
        }
        onNavigate={(l, c) => router.push(`/bible/?livre=${l}&chap=${c}`)}
      />
    );
  }

  // ——— Vue présentation + liste des leçons ———
  return (
    <div className="dark-ctx min-h-screen bg-night-950 pb-32 text-cream">
      <Celebration
        open={celebrate}
        emoji=""
        title="Formation terminée !"
        message={`Félicitations, tu as complété « ${formation.titre} ». L'e-book t'est offert ci-dessous — que cette Parole porte du fruit dans ta vie !`}
        onClose={() => setCelebrate(false)}
      />

      {/* Héros */}
      <header className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40rem 20rem at 90% -10%, rgba(202,240,0,0.14), transparent 60%), linear-gradient(170deg, #2E3A14 0%, #171716 45%)",
          }}
        />
        <div className="container-x relative mx-auto max-w-2xl pb-7 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
          <Link
            href="/ecole"
            aria-label="École biblique"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-night-950/50 text-cream backdrop-blur"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">
            Formation{formation.volume ? ` · ${formation.volume}` : ""}
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {formation.titre}
          </h1>
          <p className="mt-1.5 text-sm font-bold text-cream/60">Par {formation.auteur}</p>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-cream/75">{formation.accroche}</p>

          {/* Objectifs */}
          <div className="mt-5 space-y-1.5">
            {formation.objectifs.map((o) => (
              <p key={o} className="flex items-start gap-2 text-sm text-cream/70">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-dawn-400" strokeWidth={2.4}>
                  <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {o}
              </p>
            ))}
          </div>

          {/* Progression / CTA */}
          {userId ? (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-cream/80">
                  {done.length} / {total} leçons validées
                </span>
                <span className="text-cream/50">{percent}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-dawn-300 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              {!complete ? (
                <button
                  type="button"
                  onClick={() => setOpenLesson(current)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-dawn-400 px-6 py-3 font-display text-sm font-bold text-night-950"
                >
                  {done.length === 0 ? "Commencer la formation" : `Continuer — leçon ${current}`}
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}>
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/15 bg-night-950/40 p-4">
              <p className="text-sm text-cream/75">
                Connecte-toi pour suivre la formation : ta progression est enregistrée et
                l&apos;e-book t&apos;est offert à la fin.
              </p>
              <Link
                href="/profil"
                className="mt-3 inline-flex rounded-full bg-dawn-400 px-5 py-2.5 font-display text-sm font-bold text-night-950"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* E-book offert (à la fin) */}
      {complete && formation.ebook ? (
        <div className="container-x mx-auto mt-6 max-w-2xl">
          <a
            href={ebookUrl(formation.ebook) ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-3xl border border-dawn-400/40 bg-dawn-400/[0.08] p-5"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-dawn-400 text-night-950">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-dawn-300">
                Ta récompense
              </span>
              <span className="block font-display text-lg font-extrabold">L&apos;e-book t&apos;est offert</span>
              <span className="block text-sm text-cream/65">
                « {formation.titre} » ({formation.volume}) en PDF, à garder et relire.
              </span>
            </span>
          </a>
        </div>
      ) : null}

      {/* Les leçons */}
      <main className="container-x mx-auto mt-7 max-w-2xl space-y-3">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cream/40">
          Le cursus — {total} leçons
        </p>
        {formation.lecons.map((lecon, i) => {
          const n = i + 1;
          const validee = done.includes(n);
          const estCourante = n === current && !complete;
          const verrouillee = !userId || (n > current && !validee);
          return (
            <button
              key={lecon.id}
              type="button"
              disabled={verrouillee}
              onClick={() => setOpenLesson(n)}
              className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition-all ${
                estCourante
                  ? "border-dawn-400/50 bg-night-900 shadow-[0_18px_50px_-20px_rgba(202,240,0,0.4)]"
                  : verrouillee
                    ? "border-white/5 bg-white/[0.02] opacity-55"
                    : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <span
                className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold ${
                  estCourante ? "bg-dawn-400 text-night-950" : "bg-night-950 text-cream"
                }`}
              >
                {verrouillee && userId ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-cream/50" strokeWidth={1.8}>
                    <path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  n
                )}
                {validee ? (
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-dawn-400 text-night-950 ring-2 ring-night-950">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={3}>
                      <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[10px] font-black uppercase tracking-wide ${
                    validee ? "text-dawn-300" : estCourante ? "text-dawn-300" : "text-cream/40"
                  }`}
                >
                  {validee ? "Validée" : estCourante ? "À suivre" : `Leçon ${n}`}
                </span>
                <span className="block font-display text-base font-extrabold leading-tight">{lecon.titre}</span>
                <span className="mt-0.5 line-clamp-1 block text-[13px] text-cream/55">{lecon.resume}</span>
              </span>
            </button>
          );
        })}

        {/* Intro du livre */}
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cream/45">
            D&apos;où vient cette formation
          </p>
          <p className="mt-2 text-sm leading-relaxed text-cream/70">{formation.intro}</p>
        </div>
      </main>
    </div>
  );
}

/* ————————————————— La leçon ouverte ————————————————— */

function LeconView({
  formation,
  lecon,
  numero,
  userId,
  dejaValidee,
  onBack,
  onValidated,
  onNext,
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
  onNavigate: (l: number, c: number) => void;
}) {
  const [quizOn, setQuizOn] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [fini, setFini] = useState(false);
  const [valide, setValide] = useState(dejaValidee);

  const question = lecon.quiz[qIndex];
  const reussi = score >= SEUIL;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [quizOn, qIndex]);

  async function repondre(i: number) {
    if (choix !== null) return;
    setChoix(i);
    if (i === question.bonne) setScore((s) => s + 1);
  }

  async function suivante() {
    if (qIndex + 1 < lecon.quiz.length) {
      setQIndex(qIndex + 1);
      setChoix(null);
    } else {
      setFini(true);
      const finalScore = score;
      if (finalScore >= SEUIL && userId) {
        const ok = await validateLesson(userId, formation.id, numero, finalScore);
        if (ok) {
          setValide(true);
          onValidated();
        }
      }
    }
  }

  function resetQuiz() {
    setQuizOn(false);
    setQIndex(0);
    setChoix(null);
    setScore(0);
    setFini(false);
  }

  return (
    <div className="dark-ctx min-h-screen bg-night-950 pb-32 text-cream">
      {/* Barre du haut */}
      <div className="container-x sticky top-0 z-10 border-b border-white/10 bg-night-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <button
            type="button"
            onClick={quizOn && !fini ? resetQuiz : onBack}
            aria-label="Retour"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-dawn-300">
              Leçon {numero}/{formation.lecons.length}
              {quizOn ? " · Quiz" : ""}
            </p>
            <p className="truncate font-display text-base font-extrabold leading-tight">{lecon.titre}</p>
          </div>
          {valide ? (
            <span className="shrink-0 rounded-full bg-dawn-400/15 px-3 py-1 text-[11px] font-bold text-dawn-300">
              Validée
            </span>
          ) : null}
        </div>
      </div>

      <main className="container-x mx-auto max-w-2xl pt-6">
        {!quizOn ? (
          <>
            {/* Le contenu de la leçon */}
            <div className="space-y-7">
              {lecon.sections.map((s, i) => (
                <section key={i}>
                  <h2 className="font-display text-lg font-extrabold text-dawn-300">{s.t}</h2>
                  <div className="mt-2">
                    <TexteAvecRefs texte={s.p} onNavigate={onNavigate} />
                  </div>
                </section>
              ))}
            </div>

            {/* Mon engagement */}
            <div className="mt-8 rounded-3xl border border-dawn-400/30 bg-dawn-400/[0.07] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-300">Mon engagement</p>
              <p className="mt-2 text-[15px] leading-relaxed text-cream/85">{lecon.engagement}</p>
            </div>

            {/* Comment l'appliquer */}
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cream/50">
                Comment l&apos;appliquer ?
              </p>
              <ul className="mt-2.5 space-y-2">
                {lecon.application.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-sm leading-snug text-cream/80">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-dawn-400" strokeWidth={2.2}>
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lancer le quiz */}
            <button
              type="button"
              onClick={() => setQuizOn(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950"
            >
              {valide ? "Refaire le quiz" : "Valider la leçon — quiz"}
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="mt-2 text-center text-xs text-cream/45">
              5 questions · {SEUIL} bonnes réponses pour valider
            </p>
          </>
        ) : !fini ? (
          /* ——— Le quiz ——— */
          <div>
            <div className="flex gap-1.5">
              {lecon.quiz.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < qIndex ? "bg-dawn-400" : i === qIndex ? "bg-dawn-400/50" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="mt-5 font-display text-xl font-extrabold leading-snug">{question.q}</p>
            <div className="mt-5 space-y-2.5">
              {question.choix.map((c, i) => {
                const estBonne = i === question.bonne;
                const estChoisie = choix === i;
                const revele = choix !== null;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={revele}
                    onClick={() => repondre(i)}
                    className={`w-full rounded-2xl border px-4 py-3.5 text-left text-[15px] font-semibold transition-colors ${
                      revele && estBonne
                        ? "border-dawn-400 bg-dawn-400/15 text-dawn-200"
                        : revele && estChoisie
                          ? "border-red-400/60 bg-red-400/10 text-red-200"
                          : "border-white/12 bg-white/[0.05] text-cream/85"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {choix !== null ? (
              <>
                <p className="mt-4 rounded-2xl bg-white/[0.05] px-4 py-3 text-sm leading-relaxed text-cream/75">
                  {question.explication}
                </p>
                <button
                  type="button"
                  onClick={suivante}
                  className="mt-4 w-full rounded-full bg-dawn-400 py-3 font-display text-base font-bold text-night-950"
                >
                  {qIndex + 1 < lecon.quiz.length ? "Question suivante" : "Voir mon résultat"}
                </button>
              </>
            ) : null}
          </div>
        ) : (
          /* ——— Résultat ——— */
          <div className="pt-6 text-center">
            <span
              className={`mx-auto grid h-24 w-24 place-items-center rounded-full font-display text-2xl font-extrabold ${
                reussi ? "bg-dawn-400 text-night-950" : "bg-white/10 text-cream"
              }`}
            >
              {score}/{lecon.quiz.length}
            </span>
            <h2 className="mt-5 font-display text-2xl font-extrabold">
              {reussi ? "Leçon validée !" : "Presque…"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-cream/65">
              {reussi
                ? numero < formation.lecons.length
                  ? "Bravo ! La leçon suivante est déverrouillée."
                  : "Bravo, c'était la dernière leçon de la formation !"
                : `Il faut ${SEUIL} bonnes réponses sur ${lecon.quiz.length}. Relis la leçon tranquillement et retente le quiz — tu vas y arriver.`}
            </p>
            <div className="mt-6 flex flex-col items-center gap-2.5">
              {reussi ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="rounded-full bg-dawn-400 px-7 py-3 font-display text-base font-bold text-night-950"
                >
                  {numero < formation.lecons.length ? "Leçon suivante" : "Terminer"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="rounded-full bg-dawn-400 px-7 py-3 font-display text-base font-bold text-night-950"
                  >
                    Relire la leçon
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQIndex(0);
                      setChoix(null);
                      setScore(0);
                      setFini(false);
                    }}
                    className="rounded-full border border-white/20 px-7 py-3 font-display text-sm font-bold text-cream/75"
                  >
                    Retenter le quiz
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
