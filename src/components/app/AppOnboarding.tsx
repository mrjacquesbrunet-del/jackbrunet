"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/community/useAuth";
import { signInEmail, signInGoogle } from "@/lib/community";
import { isNativeApp } from "@/lib/notifications";
import { EmailPasswordAuth } from "@/components/community/EmailPasswordAuth";
import { GoogleG } from "@/components/community/SocialAuthButtons";
import { asset } from "@/lib/asset";
import { useLangue, type Langue } from "@/lib/i18n";

const KEY = "jb.onboarded";

/**
 * ACCUEIL AU 1ER LANCEMENT DE L'APPLICATION (uniquement), en trois temps :
 *  1. Intro : un décor flouté, une croix qui s'allume, puis le verset
 *     « Ta parole est une lampe à mes pieds » qui apparaît mot à mot ;
 *  2. Diapositives : le décor se dévoile, chaque titre s'écrit mot à mot,
 *     avec un bouton « Continuer » (et « Passer ») ; puis les avis des
 *     utilisateurs (App Store, Google Play) s'il y en a ;
 *  3. Compte : Apple, Google ou e-mail, ou « Continuer sans compte »
 *     (jamais imposé : conforme App Store).
 * Décors : public/img/chemin (paysages bibliques verticaux).
 * Textes écrits ici dans les trois langues (les titres sont découpés en
 * mots pour l'animation : le traducteur d'écran ne pourrait pas les lire).
 */

type Diapo = { titre: string; texte: string; decor: number };
type Avis = { texte: string; auteur: string; source: "App Store" | "Google Play" };

const TEXTES: Record<
  Langue,
  { verset: string; ref: string; diapos: Diapo[]; avisTitre: string; compteTitre: string; compteTexte: string; continuer: string; passer: string }
> = {
  fr: {
    verset: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.",
    ref: "Psaume 119:105",
    diapos: [
      { titre: "Rencontre Jésus, chaque jour.", texte: "Une méditation, un verset et une prière pour commencer ta journée avec Lui.", decor: 30 },
      { titre: "Une Bible vivante, expliquée.", texte: "Commentaires verset par verset, mots hébreux et grecs, personnages, lieux et chronologie.", decor: 5 },
      { titre: "Grandis pas à pas dans ta foi.", texte: "Formations, études bibliques et plans de lecture pour aller plus loin.", decor: 1 },
      { titre: "Tu n'es jamais seul.", texte: "Sur le mur de prière, partage tes sujets : des frères et sœurs prient pour toi.", decor: 34 },
      { titre: "Apprends la Bible en t'amusant.", texte: "Quiz, Qui suis-je ?, Vrai ou faux, versets à mémoriser : seul ou entre amis.", decor: 8 },
    ],
    avisTitre: "Ils vivent leur foi avec RHEMA.",
    compteTitre: "Commence ton chemin avec Jésus.",
    compteTexte: "Crée ton compte gratuit pour garder ta progression, ton carnet et tes favoris.",
    continuer: "Continuer",
    passer: "Passer",
  },
  en: {
    verset: "Your word is a lamp to my feet, and a light for my path.",
    ref: "Psalm 119:105",
    diapos: [
      { titre: "Meet Jesus, every day.", texte: "A devotional, a verse and a prayer to start your day with Him.", decor: 30 },
      { titre: "A living Bible, explained.", texte: "Verse-by-verse commentary, Hebrew and Greek words, people, places and timeline.", decor: 5 },
      { titre: "Grow in your faith, step by step.", texte: "Courses, Bible studies and reading plans to go deeper.", decor: 1 },
      { titre: "You are never alone.", texte: "On the prayer wall, share your requests: brothers and sisters pray for you.", decor: 34 },
      { titre: "Learn the Bible while having fun.", texte: "Quiz, Who am I?, True or False, verses to memorize: solo or with friends.", decor: 8 },
    ],
    avisTitre: "They live their faith with RHEMA.",
    compteTitre: "Start your journey with Jesus.",
    compteTexte: "Create your free account to keep your progress, your journal and your favorites.",
    continuer: "Continue",
    passer: "Skip",
  },
  pt: {
    verset: "Tua palavra é lâmpada para meus pés e luz para meu caminho.",
    ref: "Salmos 119:105",
    diapos: [
      { titre: "Encontre Jesus, todos os dias.", texte: "Uma meditação, um versículo e uma oração para começar o seu dia com Ele.", decor: 30 },
      { titre: "Uma Bíblia viva, explicada.", texte: "Comentários versículo por versículo, palavras hebraicas e gregas, personagens, lugares e linha do tempo.", decor: 5 },
      { titre: "Cresça na fé, passo a passo.", texte: "Cursos, estudos bíblicos e planos de leitura para ir mais longe.", decor: 1 },
      { titre: "Você nunca está sozinho.", texte: "No mural de oração, compartilhe seus pedidos: irmãos e irmãs oram por você.", decor: 34 },
      { titre: "Aprenda a Bíblia se divertindo.", texte: "Quiz, Quem sou eu?, Verdadeiro ou falso, versículos para memorizar: sozinho ou com amigos.", decor: 8 },
    ],
    avisTitre: "Eles vivem a fé com o RHEMA.",
    compteTitre: "Comece sua jornada com Jesus.",
    compteTexte: "Crie sua conta gratuita para guardar seu progresso, seu caderno e seus favoritos.",
    continuer: "Continuar",
    passer: "Pular",
  },
};

/** Avis 5 étoiles de l'App Store et de Google Play (texte dans chaque langue). */
const AVIS: Record<Langue, Avis[]> = { fr: [], en: [], pt: [] };

const DECOR_AVIS = 20;
const DECOR_COMPTE = 25;
const decor = (n: number) => asset(`/img/chemin/decor-${n}.jpg`);

/** Titre qui s'écrit mot à mot (fondu + net). */
function MotAMot({ texte, delai = 0, pas = 0.11, className = "" }: { texte: string; delai?: number; pas?: number; className?: string }) {
  return (
    <span className={className} translate="no">
      {texte.split(" ").map((m, i) => (
        <motion.span
          key={`${texte}-${i}`}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delai + i * pas, duration: 0.55, ease: "easeOut" }}
        >
          {m + " "}
        </motion.span>
      ))}
    </span>
  );
}

function Croix() {
  return (
    <svg viewBox="0 0 48 64" className="h-16 w-12 drop-shadow-[0_0_18px_rgba(202,240,0,0.55)]" fill="none" stroke="#CAF000" strokeWidth={2.4} strokeLinejoin="round" aria-hidden>
      <path d="M20 4h8v14h14v8H28v34h-8V26H6v-8h14z" />
    </svg>
  );
}

export function AppOnboarding() {
  const langue = useLangue();
  const T = TEXTES[langue];
  const { ready, userId } = useAuth();
  const [dismissed, setDismissed] = useState(true); // true par défaut → pas de flash
  const [native, setNative] = useState(false);
  useEffect(() => setNative(isNativeApp()), []);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gBusy, setGBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  // Déjà connecté → on considère l'onboarding terminé.
  useEffect(() => {
    if (userId) {
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      setDismissed(true);
    }
  }, [userId]);

  function close() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
    // Pic de motivation : NotifOptIn écoute cet événement pour proposer le
    // rappel quotidien juste après l'onboarding.
    try {
      window.dispatchEvent(new Event("jb:onboarded"));
    } catch {
      /* ignore */
    }
  }


  async function google() {
    setGBusy(true);
    setErr("");
    try {
      await signInGoogle();
    } catch (e) {
      const msg = e instanceof Error? e.message: String(e);
      setErr(
        /provider is not enabled|Unsupported provider/i.test(msg)
? "La connexion Google n'est pas encore activée."
: "Connexion Google impossible. Réessaie.",
      );
      setGBusy(false);
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Entre une adresse email valide.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await signInEmail(email);
      setSent(true);
    } catch {
      setErr("Une erreur est survenue. Réessaie.");
    } finally {
      setBusy(false);
    }
  }

  const show = ready && !userId && !dismissed;

  // Étapes : "intro", puis l'index de la diapositive, puis "compte".
  const avis = AVIS[langue];
  const nbDiapos = T.diapos.length + (avis.length ? 1 : 0);
  const [etape, setEtape] = useState<"intro" | number | "compte">("intro");
  const [avisIdx, setAvisIdx] = useState(0);
  const finIntro = useRef<ReturnType<typeof setTimeout> | null>(null);

  // L'intro dure le temps d'écrire le verset, puis laisse place aux diapositives.
  useEffect(() => {
    if (!show || etape !== "intro") return;
    const duree = 1100 + T.verset.split(" ").length * 110 + 2300;
    finIntro.current = setTimeout(() => setEtape(0), duree);
    return () => {
      if (finIntro.current) clearTimeout(finIntro.current);
    };
  }, [show, etape, T.verset]);

  // Les avis défilent tout seuls.
  useEffect(() => {
    if (etape !== T.diapos.length || avis.length < 2) return;
    const t = setInterval(() => setAvisIdx((i) => (i + 1) % avis.length), 4200);
    return () => clearInterval(t);
  }, [etape, T.diapos.length, avis.length]);

  // Précharge les décors.
  useEffect(() => {
    if (!show) return;
    for (const n of [...T.diapos.map((d) => d.decor), DECOR_AVIS, DECOR_COMPTE]) {
      const i = new Image();
      i.src = decor(n);
    }
  }, [show, T.diapos]);

  const suivant = () => setEtape((e) => (typeof e === "number" && e + 1 < nbDiapos ? e + 1 : "compte"));
  const fond =
    etape === "intro" ? T.diapos[0].decor : etape === "compte" ? DECOR_COMPTE : etape < T.diapos.length ? T.diapos[etape].decor : DECOR_AVIS;
  const diapo = typeof etape === "number" && etape < T.diapos.length ? T.diapos[etape] : null;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="dark-ctx fixed inset-0 z-[100] overflow-hidden bg-[#0B0B0A] text-cream"
        >
          {/* Décor : flou pendant l'intro, puis dévoilé, avec un lent zoom. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={fond}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1 }}
            >
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${decor(fond)})` }}
                initial={{ scale: 1.12 }}
                animate={{
                  scale: 1.02,
                  filter: etape === "intro" ? "blur(14px) brightness(0.5)" : "blur(0px) brightness(0.85)",
                }}
                transition={{ scale: { duration: 14, ease: "easeOut" }, filter: { duration: 1.4, ease: "easeInOut" } }}
              />
            </motion.div>
          </AnimatePresence>
          {/* Dégradé vers la nuit en bas, pour lire les textes. */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${etape === "intro" ? "opacity-0" : "opacity-100"}`}
            style={{ background: "linear-gradient(180deg, rgba(11,11,10,0.35) 0%, rgba(11,11,10,0) 22%, rgba(11,11,10,0.55) 50%, #0B0B0A 74%)" }}
          />

          <AnimatePresence mode="wait">
            {etape === "intro" ? (
              <motion.button
                key="intro"
                type="button"
                aria-label={T.continuer}
                onClick={() => setEtape(0)}
                exit={{ opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center"
              >
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.9 }}>
                  <Croix />
                </motion.div>
                <p className="mt-8 font-display text-[28px] font-bold leading-[1.2]">
                  <MotAMot texte={T.verset} delai={1.1} />
                </p>
                <motion.p
                  className="mt-4 text-[12px] font-black uppercase tracking-[0.25em] text-dawn-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 + T.verset.split(" ").length * 0.11 + 0.4, duration: 0.8 }}
                >
                  {T.ref}
                </motion.p>
              </motion.button>
            ) : (
              <motion.div
                key="suite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex flex-col"
                style={{ paddingTop: "max(env(safe-area-inset-top), 16px)", paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
              >
                {/* En-tête : la marque, et « Passer » sur les diapositives. */}
                <div className="flex items-center justify-between px-6 pt-2">
                  <span className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.3em]">
                    <span className="h-2 w-2 rounded-full bg-dawn-400 shadow-[0_0_10px_rgba(202,240,0,0.8)]" />
                    RHEMA
                  </span>
                  {etape !== "compte" ? (
                    <button type="button" onClick={() => setEtape("compte")} className="text-[13px] font-semibold text-cream/70">
                      {T.passer}
                    </button>
                  ) : null}
                </div>

                <div className="mt-auto px-6">
                  <AnimatePresence mode="wait">
                    {diapo ? (
                      <motion.div key={`d${etape}`} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="text-center">
                        <h1 className="font-display text-[34px] font-bold leading-[1.12]">
                          <MotAMot texte={diapo.titre} delai={0.25} />
                        </h1>
                        <motion.p
                          className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-cream/75"
                          translate="no"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + diapo.titre.split(" ").length * 0.11 + 0.2, duration: 0.6 }}
                        >
                          {diapo.texte}
                        </motion.p>
                      </motion.div>
                    ) : etape === "compte" ? (
                      <motion.div key="compte" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-h-[78vh] max-w-md overflow-y-auto pb-2">
                        <h1 className="text-center font-display text-[32px] font-bold leading-[1.12]">
                          <MotAMot texte={T.compteTitre} delai={0.2} />
                        </h1>
                        <p className="mx-auto mt-3 max-w-sm text-center text-[15px] leading-relaxed text-cream/75" translate="no">
                          {T.compteTexte}
                        </p>
                        {native? (
                          <div className="mt-6">
                            <EmailPasswordAuth onSuccess={close} initialMode="signup" tone="dark" />
                            <button
                              onClick={close}
                              className="mt-6 w-full text-center text-sm text-cream/55 underline-offset-4 hover:underline"
                            >
                              Continuer sans compte
                            </button>
                          </div>
                        ): sent? (
                          <div className="mt-6 rounded-2xl border border-dawn-400/30 bg-dawn-400/10 p-4 text-center text-sm text-cream">
                            ✓ Un lien de connexion vient d'être envoyé à <strong>{email}</strong>.
                            Ouvre ta boîte mail et clique dessus.
                            <button onClick={close} className="btn-ghost mt-4 w-full justify-center">
                              Continuer
                            </button>
                          </div>
                        ): (
                          <div className="mt-6">
                            <button
                              type="button"
                              onClick={google}
                              disabled={gBusy}
                              className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-night-900 transition-transform hover:scale-[1.02] disabled:opacity-60"
                            >
                              <GoogleMark /> {gBusy? "Redirection…": "Continuer avec Google"}
                            </button>

                            {/* Apple sur le site : nécessite un « Services ID » + clé côté Supabase
                                (non configurés). Sur iPhone, Apple passe par SocialAuthButtons. */}

                            <div className="my-4 flex items-center gap-3 text-xs text-cream/40">
                              <span className="h-px flex-1 bg-white/10" /> ou par email{" "}
                              <span className="h-px flex-1 bg-white/10" />
                            </div>

                            <form onSubmit={sendLink} className="space-y-3">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ton adresse email"
                                className="field w-full"
                              />
                              <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
                                {busy? "Un instant…": "Créer mon compte"}
                              </button>
                            </form>

                            {err? <p className="field-error mt-2">{err}</p>: null}

                            <button
                              onClick={close}
                              className="mt-6 w-full text-center text-sm text-cream/55 underline-offset-4 hover:underline"
                            >
                              Continuer sans compte
                            </button>
                            <p className="mt-2 text-center text-[11px] text-cream/40">
                              Pas de mot de passe: tu reçois un lien sécurisé par email.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div key="avis" exit={{ opacity: 0 }} className="text-center">
                        <h1 className="font-display text-[32px] font-bold leading-[1.12]">
                          <MotAMot texte={T.avisTitre} delai={0.2} />
                        </h1>
                        <AnimatePresence mode="wait">
                          {avis[avisIdx] ? (
                            <motion.figure
                              key={avisIdx}
                              initial={{ opacity: 0, x: 24 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -24 }}
                              transition={{ duration: 0.45 }}
                              className="mx-auto mt-6 max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur-md"
                              translate="no"
                            >
                              <div className="flex gap-1 text-dawn-400" aria-label="5/5">
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                                    <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19.9l1-5.8L3.6 9.1l5.8-.8z" />
                                  </svg>
                                ))}
                              </div>
                              <blockquote className="mt-3 text-[15px] leading-relaxed text-cream/90">« {avis[avisIdx].texte} »</blockquote>
                              <figcaption className="mt-3 text-[12px] font-semibold text-cream/55">
                                {avis[avisIdx].auteur} · {avis[avisIdx].source}
                              </figcaption>
                            </motion.figure>
                          ) : null}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {etape !== "compte" ? (
                    <>
                      {/* Points de progression */}
                      <div className="mt-7 flex justify-center gap-1.5">
                        {Array.from({ length: nbDiapos }, (_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === etape ? "w-6 bg-dawn-400" : "w-1.5 bg-white/30"}`}
                          />
                        ))}
                      </div>
                      <motion.button
                        key={`b${etape}`}
                        type="button"
                        onClick={suivant}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-dawn-400 text-[16px] font-bold text-[#0B0B0A] shadow-[0_0_30px_rgba(202,240,0,0.25)]"
                      >
                        {T.continuer}
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    </>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


function GoogleMark() {
  return <GoogleG />;
}
