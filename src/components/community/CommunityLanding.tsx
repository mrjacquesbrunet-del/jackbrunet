"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { isNativeApp } from "@/lib/notifications";
import { EmailPasswordAuth } from "@/components/community/EmailPasswordAuth";
import { signInEmail, signInGoogle } from "@/lib/community";

/* ---------- Icônes locales ---------- */
function Ico({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const PRAY = "M12 3c-1 2-1 4 0 6m0 0c1-2 1-4 0-6M7 21l1.5-7.5a3.5 3.5 0 0 1 7 0L17 21";
const HEART = "M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z";
const USERS = "M16 18v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 18v-1a3 3 0 0 0-2.5-3M17 5.2a3 3 0 0 1 0 5.6";
const STAR = "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z";
const BOOK = "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v16";
const SHIELD = "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z";

const FEATURES = [
  { icon: USERS, title: "Abonne-toi", text: "Suis les frères et sœurs qui t'inspirent. Leurs sujets de prière apparaissent dans ton fil." },
  { icon: PRAY, title: "Prie ensemble", text: "D'un geste, dis « Je prie » pour un sujet. La personne est notifiée qu'on la porte." },
  { icon: HEART, title: "Encourage", text: "Un cœur, un mot d'encouragement… Personne ne traverse l'épreuve seul." },
  { icon: STAR, title: "Grandis en prière", text: "Plus tu pries et encourages, plus tu montes en grade: Intercesseur, Guerrier, Sentinelle." },
  { icon: BOOK, title: "Ton espace synchronisé", text: "Carnet, versets surlignés et plans te suivent sur tous tes appareils." },
  { icon: SHIELD, title: "Tu choisis", text: "Chaque sujet: public, réservé à tes abonnés, ou privé entre toi et Dieu." },
];

const STEPS = [
  { n: "1", title: "Crée ton profil", text: "Connexion en un clic (Google ou email). Ajoute ta photo, ta bio, tes versets." },
  { n: "2", title: "Partage & suis", text: "Publie un sujet de prière, abonne-toi à d'autres, découvre leur mur." },
  { n: "3", title: "Portez-vous les uns les autres", text: "Priez, encouragez, célébrez les prières exaucées. Ensemble." },
];

export function CommunityLanding() {
  return (
    <div>
      <Hero />
      <Steps />
      <Features />
      <AuthCard />
    </div>
  );
}

/* ---------- Hero immersif ---------- */
function Hero() {
  return (
    <section className="dark-ctx relative overflow-hidden bg-night-950 pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 bg-grid opacity-[0.12]" />
      <motion.div
        className="blob -left-16 top-10 h-80 w-80 bg-dawn-400/30"
        animate={{ y: [0, -22, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob -right-10 top-1/3 h-72 w-72 bg-spirit-400/30"
        animate={{ y: [0, 24, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="text-center lg:text-left">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ✦ Le réseau social de prière
          </motion.span>
          <motion.h1
            className="mt-6 font-display text-5xl font-extrabold leading-[1.02] text-balance sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            Le mur de <span className="text-gradient">prière</span>
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream/75 lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
          >
            Un lieu pour <strong className="text-cream">déposer tes sujets de prière</strong>, t'abonner à
            d'autres croyants et <strong className="text-cream">vous porter les uns les autres</strong> devant Dieu.
            Comme un réseau social, mais tourné vers le Ciel.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
          >
            <a href="#rejoindre" className="btn-primary">
              Rejoindre maintenant
            </a>
            <a href="#decouvrir" className="btn-ghost">
              Découvrir
            </a>
          </motion.div>
        </div>

        {/* Carte de prière animée (aperçu) */}
        <motion.div
          className="relative mx-auto w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-3xl border border-white/10 bg-night-800/70 p-5 shadow-card backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-dawn-400 to-spirit-500 font-bold text-night-950">
                M
              </span>
              <div>
                <p className="font-display font-bold text-cream">Marie</p>
                <p className="text-xs text-cream/50">il y a 5 min · Public</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-dawn-400/15 px-2.5 py-0.5 text-[11px] font-bold text-dawn-300">
                ✦ Sentinelle
              </span>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-cream/85">
              « Merci de prier pour ma fille qui passe ses examens cette semaine. Que la paix de Dieu
              la garde. »
            </p>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-dawn-400/15 px-3 py-1.5 text-sm font-semibold text-dawn-300">
                <Ico d={PRAY} className="h-4 w-4" /> 24
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm font-semibold text-cream/70">
                <Ico d={HEART} className="h-4 w-4" /> 12
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Fusion douce vers la section claire suivante (pas de coupure nette) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#E9EADF]"
      />
    </section>
  );
}

/* ---------- Comment ça marche ---------- */
function Steps() {
  return (
    <section id="decouvrir" className="bg-topo-light py-16 sm:py-20">
      <div className="container-x">
        <Reveal from="up" className="text-center">
          <span className="eyebrow">Comment ça marche</span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">
            Trois pas, et tu fais partie de la famille
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} from="up" delay={i * 0.1}>
              <div className="glass h-full p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 font-display text-xl font-extrabold text-night-950">
                  {s.n}
                </span>
                <p className="mt-4 font-display text-lg font-bold">{s.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-night-900/65">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Fonctionnalités ---------- */
function Features() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal from="up" className="text-center">
          <span className="eyebrow">Pourquoi c'est différent</span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">
            Tout ce qu'un réseau social fait… pour la <span className="text-gradient">prière</span>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} from="up" delay={(i % 3) * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-night-900/10 bg-white p-6"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-dawn-400/10 transition-transform duration-500 group-hover:scale-150" />
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-night-900 text-dawn-400">
                  <Ico d={f.icon} className="h-6 w-6" />
                </span>
                <p className="relative mt-4 font-display text-lg font-bold">{f.title}</p>
                <p className="relative mt-1.5 text-sm leading-relaxed text-night-900/65">{f.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Connexion ---------- */
function AuthCard() {
  const [native, setNative] = useState(false);
  useEffect(() => setNative(isNativeApp()), []);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [gBusy, setGBusy] = useState(false);
  const [gErr, setGErr] = useState("");

  async function google() {
    setGBusy(true);
    setGErr("");
    try {
      await signInGoogle();
    } catch (e) {
      const msg = e instanceof Error? e.message: String(e);
      setGErr(
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
      setError("Entre une adresse email valide.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await signInEmail(email);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="rejoindre" className="dark-ctx relative overflow-hidden bg-night-950 py-16 sm:py-24">
      <div className="absolute inset-0 bg-grid opacity-[0.1]" />
      <motion.div
        className="blob left-1/2 top-0 h-72 w-72 -translate-x-1/2 bg-dawn-400/25"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="container-x relative">
        <Reveal from="scale" className="mx-auto max-w-md">
          <div className="rounded-4xl border border-white/10 bg-night-800/70 p-7 shadow-card backdrop-blur-xl sm:p-9">
            <h2 className="text-center font-display text-3xl font-extrabold">Rejoins la communauté</h2>
            <p className="mt-2 text-center text-sm text-cream/70">
              Gratuit, en un clic. Partage, prie, encourage, et retrouve ton espace partout.
            </p>

            {native? (
              <div className="mt-7">
                <EmailPasswordAuth tone="dark" />
              </div>
            ): sent? (
              <div className="mt-7 rounded-2xl border border-dawn-400/30 bg-dawn-400/10 p-4 text-center text-sm text-cream">
                ✓ Un lien de connexion vient d'être envoyé à <strong>{email}</strong>. Ouvre ta boîte
                mail et clique dessus.
              </div>
            ): (
              <>
                <button
                  type="button"
                  onClick={google}
                  disabled={gBusy}
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-night-900 transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  <GoogleMark /> {gBusy? "Redirection…": "Continuer avec Google"}
                </button>
                {gErr? <p className="field-error mt-2 text-center">{gErr}</p>: null}

                <div className="my-5 flex items-center gap-3 text-xs text-cream/40">
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
                    {busy? "Un instant…": "Recevoir mon lien de connexion"}
                  </button>
                  {error? <p className="field-error">{error}</p>: null}
                </form>
                <p className="mt-3 text-center text-xs text-cream/45">
                  Pas de mot de passe: tu reçois un lien sécurisé par email.
                </p>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.8z" />
      <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1.7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8z" />
      <path fill="#EA4335" d="M12 5.5c1.6 0 3.5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.6 3.2-4.7 6-4.7z" />
    </svg>
  );
}
