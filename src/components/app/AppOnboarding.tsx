"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/community/useAuth";
import { signInEmail, signInGoogle } from "@/lib/community";

const KEY = "jb.onboarded";

/* Petites icônes ligne */
function Ico({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const FEATURES = [
  { d: "M12 3v18M3 8h4l2-3 3 6 2-3h7", label: "Ta pensée du jour, chaque matin" },
  { d: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v16", label: "Ton carnet spirituel sauvegardé" },
  { d: "M7 21l1.5-7.5a3.5 3.5 0 0 1 7 0L17 21M12 3c-1 2-1 4 0 6", label: "Le mur de prière de la communauté" },
  { d: "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z", label: "Tes cadeaux offerts (ebooks, soaking)" },
];

/**
 * Écran d'accueil au 1er lancement de l'APPLICATION (uniquement).
 * Invite à créer un compte (Google ou email) sans l'imposer : un lien
 * « Continuer sans compte » permet d'entrer librement (conforme App Store).
 * Ne s'affiche jamais sur le site (monté seulement par AppShell en mode app).
 */
export function AppOnboarding() {
  const { ready, userId } = useAuth();
  const [dismissed, setDismissed] = useState(true); // true par défaut → pas de flash
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
  }

  async function google() {
    setGBusy(true);
    setErr("");
    try {
      await signInGoogle();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
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

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="dark-ctx fixed inset-0 z-[100] overflow-y-auto bg-night-950"
        >
          <div className="bg-topo-dark relative min-h-full px-6 pb-10 pt-16">
            <motion.div
              className="blob -left-16 top-6 h-72 w-72 bg-dawn-400/25"
              animate={{ y: [0, -18, 0], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative mx-auto flex max-w-md flex-col">
              <span className="eyebrow">✦ Bienvenue</span>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05]">
                Ton <span className="text-gradient">temps avec Jésus</span>, chaque jour
              </h1>
              <p className="mt-3 text-cream/75">
                Crée ton compte gratuit pour profiter de tout — et ne rien perdre.
              </p>

              <ul className="mt-7 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/5 text-dawn-300">
                      <Ico d={f.d} />
                    </span>
                    <span className="text-sm text-cream/85">{f.label}</span>
                  </li>
                ))}
              </ul>

              {sent ? (
                <div className="mt-8 rounded-2xl border border-dawn-400/30 bg-dawn-400/10 p-4 text-center text-sm text-cream">
                  ✓ Un lien de connexion vient d'être envoyé à <strong>{email}</strong>.
                  Ouvre ta boîte mail et clique dessus.
                  <button onClick={close} className="btn-ghost mt-4 w-full justify-center">
                    Continuer
                  </button>
                </div>
              ) : (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={google}
                    disabled={gBusy}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-night-900 transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    <GoogleMark /> {gBusy ? "Redirection…" : "Continuer avec Google"}
                  </button>

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
                      {busy ? "Un instant…" : "Créer mon compte"}
                    </button>
                  </form>

                  {err ? <p className="field-error mt-2">{err}</p> : null}

                  <button
                    onClick={close}
                    className="mt-6 w-full text-center text-sm text-cream/55 underline-offset-4 hover:underline"
                  >
                    Continuer sans compte
                  </button>
                  <p className="mt-2 text-center text-[11px] text-cream/40">
                    Pas de mot de passe : tu reçois un lien sécurisé par email.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.8z" />
      <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8z" />
      <path fill="#EA4335" d="M12 5.5c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.6 3.2-4.7 6-4.7z" />
    </svg>
  );
}
