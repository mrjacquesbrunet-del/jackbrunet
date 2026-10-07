"use client";

import { useEffect, useState } from "react";
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
 * ACCUEIL DU PREMIER LANCEMENT DE L'APPLICATION (une seule fois par appareil,
 * jamais pour un membre déjà connecté), dans l'ambiance RHEMA :
 *  1. Intro : le fauteuil sort du flou, le logo et « RHEMA » apparaissent,
 *     « Ton temps avec Jésus » s'écrit mot à mot, puis Matthieu 11:28 ;
 *  2. Les fonctionnalités, une par écran, avec la vraie capture de l'app ;
 *  3. Les avis des stores ;
 *  4. Le compte (Apple, Google, e-mail).
 * Pas de « Passer » : on avance avec « Continuer ».
 * Décor : public/img/accueil/fauteuil.webp ; captures : public/img/accueil/<langue>-<écran>.webp.
 * Textes écrits ici dans les trois langues (titres découpés en mots pour
 * l'animation, que le traducteur d'écran ne pourrait pas lire).
 */

type Fonction = { image: string; surtitre: string; titre: string; texte: string };
type Avis = { texte: string; auteur: string; source: "App Store" | "Google Play" };

const AVIS_FR: Avis[] = [
  {
    texte: "Les passages bibliques sont vêtus de l'onction du Rhema et commentés d'un esprit éclairé : avec simplicité mais profondeur.",
    auteur: "Imène N.",
    source: "Google Play",
  },
  {
    texte: "L'exhortation quotidienne permet de démarrer la journée avec une parole de Dieu et un encouragement certain. Une des meilleures applications chrétiennes.",
    auteur: "Piyanatlk",
    source: "App Store",
  },
  {
    texte: "J'apprécie vraiment cette application. Elle m'aide à me rapprocher de Dieu. On peut prier les uns pour les autres : c'est la première application que j'ai trouvée pour le faire.",
    auteur: "Edith B.",
    source: "Google Play",
  },
  {
    texte: "Enfin un système ludique qui permet de comprendre et d'intégrer la Bible facilement. Un outil accessible à tous.",
    auteur: "lastardumonde",
    source: "App Store",
  },
  {
    texte: "Un véritable espace d'échange, de lecture, de conseils et d'explications pour la compréhension de la Bible et de la parole de Dieu.",
    auteur: "Christophe L.",
    source: "Google Play",
  },
  { texte: "Excellente application, fluide et claire. Quelle bénédiction dans ma vie !", auteur: "bidoumari", source: "App Store" },
];

const TEXTES: Record<
  Langue,
  {
    slogan: string;
    verset: string;
    ref: string;
    commencer: string;
    continuer: string;
    fonctions: Fonction[];
    avisTitre: string;
    avisSous: string;
    avis: Avis[];
    traduit: string;
    compteTitre: string;
    compteTexte: string;
  }
> = {
  fr: {
    slogan: "Ton temps avec Jésus",
    verset: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
    ref: "Matthieu 11:28",
    commencer: "Commencer",
    continuer: "Continuer",
    fonctions: [
      { image: "meditation", surtitre: "Chaque jour", titre: "Une pensée pour ton cœur, chaque matin.", texte: "Une méditation, un verset et une prière, à lire ou à écouter, pour commencer ta journée avec Jésus." },
      { image: "bible", surtitre: "La Bible", titre: "La Parole, expliquée verset par verset.", texte: "Commentaires, mots hébreux et grecs, personnages, lieux, chronologie… et la Bible audio." },
      { image: "mur", surtitre: "Le mur de prière", titre: "Tu n'es jamais seul.", texte: "Partage tes sujets de prière : des frères et sœurs prient pour toi, et tu pries pour eux." },
      { image: "etudes", surtitre: "Études bibliques", titre: "Grandis dans la connaissance de Sa Parole.", texte: "Formations, études bibliques, plans de lecture et jeux pour avancer pas à pas." },
      { image: "profil", surtitre: "Ton profil", titre: "Ton chemin avec Dieu, jour après jour.", texte: "Ta série de jours, tes badges, ton carnet spirituel et tes favoris, toujours avec toi." },
    ],
    avisTitre: "Ils vivent leur foi avec RHEMA.",
    avisSous: "Ce qu'ils en disent sur l'App Store et Google Play",
    avis: AVIS_FR,
    traduit: "",
    compteTitre: "Crée ton espace.",
    compteTexte: "C'est gratuit : ta progression, ton carnet et tes favoris sont gardés, sur tous tes appareils.",
  },
  en: {
    slogan: "Your time with Jesus",
    verset: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
    ref: "Matthew 11:28",
    commencer: "Get started",
    continuer: "Continue",
    fonctions: [
      { image: "meditation", surtitre: "Every day", titre: "A word for your heart, every morning.", texte: "A devotional, a verse and a prayer, to read or listen to, to start your day with Jesus." },
      { image: "bible", surtitre: "The Bible", titre: "The Word, explained verse by verse.", texte: "Commentary, Hebrew and Greek words, people, places, timeline… and the audio Bible." },
      { image: "mur", surtitre: "The prayer wall", titre: "You are never alone.", texte: "Share your prayer requests: brothers and sisters pray for you, and you pray for them." },
      { image: "etudes", surtitre: "Bible studies", titre: "Grow in the knowledge of His Word.", texte: "Courses, Bible studies, reading plans and games to move forward step by step." },
      { image: "profil", surtitre: "Your profile", titre: "Your walk with God, day after day.", texte: "Your streak, your badges, your spiritual journal and your favorites, always with you." },
    ],
    avisTitre: "They live their faith with RHEMA.",
    avisSous: "What they say on the App Store and Google Play",
    avis: [
      { texte: "The Bible passages are clothed with the anointing of the Rhema and explained with an enlightened spirit: simple, yet deep.", auteur: "Imène N.", source: "Google Play" },
      { texte: "The daily exhortation lets you start the day with a word from God and real encouragement. One of the best Christian apps.", auteur: "Piyanatlk", source: "App Store" },
      { texte: "I really love this app. It helps me draw closer to God. We can pray for one another: it's the first app I've found that lets you do that.", auteur: "Edith B.", source: "Google Play" },
      { texte: "Finally a fun way to understand the Bible and take it in easily. A tool for everyone.", auteur: "lastardumonde", source: "App Store" },
      { texte: "A true place for sharing, reading, advice and explanations to understand the Bible and the word of God.", auteur: "Christophe L.", source: "Google Play" },
      { texte: "Excellent app, smooth and clear. What a blessing in my life!", auteur: "bidoumari", source: "App Store" },
    ],
    traduit: "Translated from French",
    compteTitre: "Create your space.",
    compteTexte: "It's free: your progress, your journal and your favorites are saved, on all your devices.",
  },
  pt: {
    slogan: "Seu tempo com Jesus",
    verset: "Vinde a mim todos vós que estais cansados e sobrecarregados, e eu vos farei descansar.",
    ref: "Mateus 11:28",
    commencer: "Começar",
    continuer: "Continuar",
    fonctions: [
      { image: "meditation", surtitre: "Todos os dias", titre: "Uma palavra para o seu coração, cada manhã.", texte: "Uma meditação, um versículo e uma oração, para ler ou ouvir, para começar o dia com Jesus." },
      { image: "bible", surtitre: "A Bíblia", titre: "A Palavra, explicada versículo por versículo.", texte: "Comentários, palavras hebraicas e gregas, personagens, lugares, linha do tempo… e a Bíblia em áudio." },
      { image: "mur", surtitre: "O mural de oração", titre: "Você nunca está sozinho.", texte: "Compartilhe seus pedidos de oração: irmãos e irmãs oram por você, e você ora por eles." },
      { image: "etudes", surtitre: "Estudos bíblicos", titre: "Cresça no conhecimento da Sua Palavra.", texte: "Cursos, estudos bíblicos, planos de leitura e jogos para avançar passo a passo." },
      { image: "profil", surtitre: "Seu perfil", titre: "Sua caminhada com Deus, dia após dia.", texte: "Sua sequência de dias, suas medalhas, seu caderno espiritual e seus favoritos, sempre com você." },
    ],
    avisTitre: "Eles vivem a fé com o RHEMA.",
    avisSous: "O que dizem na App Store e no Google Play",
    avis: [
      { texte: "Os textos bíblicos são revestidos da unção do Rhema e comentados com um espírito iluminado: com simplicidade, mas com profundidade.", auteur: "Imène N.", source: "Google Play" },
      { texte: "A exortação diária permite começar o dia com uma palavra de Deus e um verdadeiro encorajamento. Um dos melhores aplicativos cristãos.", auteur: "Piyanatlk", source: "App Store" },
      { texte: "Gosto muito deste aplicativo. Ele me ajuda a me aproximar de Deus. Podemos orar uns pelos outros: é o primeiro aplicativo que encontrei que permite isso.", auteur: "Edith B.", source: "Google Play" },
      { texte: "Finalmente um jeito divertido de entender a Bíblia e assimilá-la com facilidade. Uma ferramenta acessível a todos.", auteur: "lastardumonde", source: "App Store" },
      { texte: "Um verdadeiro espaço de partilha, leitura, conselhos e explicações para compreender a Bíblia e a palavra de Deus.", auteur: "Christophe L.", source: "Google Play" },
      { texte: "Excelente aplicativo, fluido e claro. Que bênção na minha vida!", auteur: "bidoumari", source: "App Store" },
    ],
    traduit: "Traduzido do francês",
    compteTitre: "Crie o seu espaço.",
    compteTexte: "É grátis: seu progresso, seu caderno e seus favoritos ficam salvos, em todos os seus aparelhos.",
  },
};

const FOND = "/img/accueil/fauteuil.webp";
const LOGO = "/img/logo-rhema.webp";
const EASE = [0.22, 1, 0.36, 1] as const;

/** Texte qui s'écrit mot à mot (fondu + net), comme dans les grandes apps. */
function MotAMot({ texte, delai = 0, pas = 0.12 }: { texte: string; delai?: number; pas?: number }) {
  return (
    <span translate="no">
      {texte.split(" ").map((m, i) => (
        <motion.span
          key={`${texte}-${i}`}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delai + i * pas, duration: 0.7, ease: EASE }}
        >
          {m + " "}
        </motion.span>
      ))}
    </span>
  );
}

function Etoiles({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className="flex gap-1 text-dawn-400" aria-label="5/5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
          <path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L2.9 9.4l6.3-.9z" />
        </svg>
      ))}
    </span>
  );
}

/** Bouton principal : pilule lime, comme le reste de l'app. */
function BoutonLime({ children, onClick, delai = 0 }: { children: React.ReactNode; onClick: () => void; delai?: number }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delai, duration: 0.6, ease: EASE }}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-dawn-400 font-sans text-[16px] font-bold text-[#0E0E0C] shadow-[0_0_34px_rgba(202,240,0,0.28)] active:scale-[0.98]"
    >
      {children}
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
}

export function AppOnboarding() {
  const langue = useLangue();
  const T = TEXTES[langue];
  const { ready, userId } = useAuth();
  // Lu tout de suite (composant monté côté client, en mode app) : l'intro
  // s'affiche dès le premier rendu, sans laisser voir l'accueil derrière.
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });
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

  const show = !userId && !dismissed;

  // Fin de l'écran sombre posé au démarrage (layout) dès que l'intro est là ou inutile.
  useEffect(() => {
    const retirer = () => document.documentElement.classList.remove("accueil-attente");
    if (show) {
      // L'intro apparaît en fondu : on garde le noir dessous le temps du fondu.
      const t = setTimeout(retirer, 900);
      return () => clearTimeout(t);
    }
    if (ready) retirer();
  }, [show, ready]);

  // Étapes : intro → fonctionnalités (0…n-1) → avis → compte.
  const [etape, setEtape] = useState<"intro" | number | "avis" | "compte">("intro");
  const [avisIdx, setAvisIdx] = useState(0);
  const n = T.fonctions.length;

  useEffect(() => {
    if (etape !== "avis") return;
    const t = setInterval(() => setAvisIdx((i) => (i + 1) % T.avis.length), 5000);
    return () => clearInterval(t);
  }, [etape, T.avis.length]);

  // Précharge le décor, le logo et les captures de la langue.
  useEffect(() => {
    if (!show) return;
    for (const src of [FOND, LOGO, ...T.fonctions.map((f) => `/img/accueil/${langue}-${f.image}.webp`)]) {
      const i = new Image();
      i.src = asset(src);
    }
  }, [show, langue, T.fonctions]);

  const suivant = () =>
    setEtape((e) => (e === "intro" ? 0 : typeof e === "number" ? (e + 1 < n ? e + 1 : "avis") : "compte"));
  const fonction = typeof etape === "number" ? T.fonctions[etape] : null;
  const points = n + 1; // fonctionnalités + avis
  const pointActif = typeof etape === "number" ? etape : etape === "avis" ? n : -1;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="dark-ctx fixed inset-0 z-[100] overflow-hidden bg-[#0E0E0C] text-cream"
        >
          {/* Le fauteuil : sort du flou à l'intro, puis reste en fond, voilé. */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${asset(FOND)})` }}
            initial={{ scale: 1.08, filter: "blur(22px) brightness(0.3)" }}
            animate={
              etape === "intro"
                ? { scale: 1, filter: "blur(0px) brightness(1)" }
                : { scale: 1.06, filter: "blur(18px) brightness(0.32)" }
            }
            transition={{ duration: etape === "intro" ? 2.8 : 1.2, ease: EASE }}
          />
          {/* Halo de la lampe à l'intro */}
          {etape === "intro" ? (
            <motion.div
              className="pointer-events-none absolute left-[56%] top-[47%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD27A]/20 blur-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.6] }}
              transition={{ delay: 1.2, duration: 3 }}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0E0E0C]/60 via-transparent to-[#0E0E0C]/90" />

          <div
            className="relative flex h-full flex-col px-6"
            style={{ paddingTop: "max(env(safe-area-inset-top), 18px)", paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
          >
            <AnimatePresence mode="wait">
              {etape === "intro" ? (
                <motion.div
                  key="intro"
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.5 }}
                  className="flex h-full flex-col"
                >
                  {/* Logo, RHEMA, Ton temps avec Jésus : en haut, au-dessus de la lampe */}
                  <div className="mt-[7vh] flex flex-col items-center text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      src={asset(LOGO)}
                      alt=""
                      className="h-16 w-16 object-contain"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.6, duration: 0.9, ease: EASE }}
                    />
                    <motion.h1
                      className="mt-5 font-sans text-[46px] font-extrabold leading-none text-white"
                      initial={{ opacity: 0, letterSpacing: "0.45em" }}
                      animate={{ opacity: 1, letterSpacing: "0.14em" }}
                      transition={{ delay: 2.0, duration: 1.4, ease: EASE }}
                    >
                      RHEMA
                    </motion.h1>
                    <motion.div
                      className="mt-4 h-[3px] rounded-full bg-dawn-400"
                      initial={{ width: 0 }}
                      animate={{ width: 48 }}
                      transition={{ delay: 2.8, duration: 0.7, ease: EASE }}
                    />
                    <p className="mt-4 font-sans text-[19px] font-medium tracking-wide text-cream/90">
                      <MotAMot texte={T.slogan} delai={3.1} pas={0.16} />
                    </p>
                  </div>

                  <div className="mt-auto">
                    <motion.div
                      className="mx-auto flex max-w-[260px] items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 4.0, duration: 0.8 }}
                    >
                      <span className="h-px flex-1 bg-dawn-400/50" />
                      <span className="h-2 w-2 rounded-full bg-dawn-400" />
                      <span className="h-px flex-1 bg-dawn-400/50" />
                    </motion.div>
                    <p className="mx-auto mt-4 max-w-sm text-center font-display text-[19px] italic leading-snug text-cream">
                      <MotAMot texte={T.verset} delai={4.3} pas={0.07} />
                    </p>
                    <motion.p
                      className="mt-3 text-center font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-dawn-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 4.3 + T.verset.split(" ").length * 0.07 + 0.3, duration: 0.8 }}
                      translate="no"
                    >
                      {T.ref}
                    </motion.p>
                    <div className="mt-7">
                      <BoutonLime onClick={suivant} delai={4.6 + T.verset.split(" ").length * 0.07}>
                        {T.commencer}
                      </BoutonLime>
                    </div>
                  </div>
                </motion.div>
              ) : fonction ? (
                <motion.div
                  key={`f${etape}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.45 }}
                  className="flex h-full flex-col"
                >
                  {/* La vraie capture de l'app, dans un téléphone */}
                  <div className="relative flex min-h-0 flex-1 items-center justify-center pt-2">
                    <div className="absolute bottom-[8%] h-24 w-56 rounded-full bg-dawn-400/25 blur-3xl" />
                    <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.94 }}
                      animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
                      transition={{ opacity: { duration: 0.6 }, scale: { duration: 0.7, ease: EASE }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.7 } }}
                      className="relative aspect-[390/844] h-full max-h-[58vh] overflow-hidden rounded-[2.4rem] border-[7px] border-[#1B1B18] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset(`/img/accueil/${langue}-${fonction.image}.webp`)} alt="" className="h-full w-full object-cover object-top" />
                    </motion.div>
                  </div>
                  <div className="pt-6 text-center">
                    <motion.p
                      className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-dawn-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      translate="no"
                    >
                      {fonction.surtitre}
                    </motion.p>
                    <h2 className="mt-2.5 font-display text-[28px] font-bold leading-[1.15] text-white">
                      <MotAMot texte={fonction.titre} delai={0.35} pas={0.09} />
                    </h2>
                    <motion.p
                      className="mx-auto mt-3 max-w-sm font-sans text-[15px] leading-relaxed text-cream/75"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + fonction.titre.split(" ").length * 0.09, duration: 0.6 }}
                      translate="no"
                    >
                      {fonction.texte}
                    </motion.p>
                  </div>
                </motion.div>
              ) : etape === "avis" ? (
                <motion.div
                  key="avis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="flex h-full flex-col justify-center text-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(LOGO)} alt="" className="mx-auto h-12 w-12 object-contain opacity-90" />
                  <h2 className="mt-5 font-display text-[30px] font-bold leading-[1.15] text-white">
                    <MotAMot texte={T.avisTitre} delai={0.2} pas={0.09} />
                  </h2>
                  <motion.div className="mt-4 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                    <Etoiles className="h-6 w-6" />
                    <p className="font-sans text-[13px] text-cream/60" translate="no">
                      {T.avisSous}
                    </p>
                  </motion.div>
                  <div className="relative mt-7 min-h-[230px]">
                    <AnimatePresence mode="wait">
                      <motion.figure
                        key={avisIdx}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="mx-auto max-w-sm rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md"
                        translate="no"
                      >
                        <Etoiles />
                        <blockquote className="mt-4 font-display text-[18px] leading-snug text-cream">« {T.avis[avisIdx].texte} »</blockquote>
                        <figcaption className="mt-4 font-sans text-[12px] font-semibold text-cream/55">
                          {T.avis[avisIdx].auteur} · {T.avis[avisIdx].source}
                          {T.traduit ? <span className="block font-normal text-cream/35">{T.traduit}</span> : null}
                        </figcaption>
                      </motion.figure>
                    </AnimatePresence>
                  </div>
                  <div className="mt-3 flex justify-center gap-1.5">
                    {T.avis.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${i + 1}`}
                        onClick={() => setAvisIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i === avisIdx ? "w-4 bg-cream/80" : "w-1.5 bg-white/25"}`}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="compte" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto">
                  <div className="mt-[6vh] flex flex-col items-center text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(LOGO)} alt="" className="h-14 w-14 object-contain" />
                    <p className="mt-3 font-sans text-[22px] font-extrabold text-white" style={{ letterSpacing: "0.14em" }}>
                      RHEMA
                    </p>
                    <h2 className="mt-6 font-display text-[30px] font-bold leading-[1.15] text-white">
                      <MotAMot texte={T.compteTitre} delai={0.2} pas={0.09} />
                    </h2>
                    <p className="mt-3 max-w-sm font-sans text-[15px] leading-relaxed text-cream/75" translate="no">
                      {T.compteTexte}
                    </p>
                  </div>
                  <div className="mt-auto pb-2">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progression + Continuer (fonctionnalités et avis) */}
            {etape !== "intro" && etape !== "compte" ? (
              <div className="pt-6">
                <div className="flex justify-center gap-1.5">
                  {Array.from({ length: points }, (_, i) => (
                    <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === pointActif ? "w-6 bg-dawn-400" : "w-1.5 bg-white/25"}`} />
                  ))}
                </div>
                <div className="mt-5">
                  <BoutonLime key={String(etape)} onClick={suivant} delai={0.6}>
                    {T.continuer}
                  </BoutonLime>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


function GoogleMark() {
  return <GoogleG />;
}
