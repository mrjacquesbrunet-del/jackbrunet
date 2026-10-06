"use client";

import { useState } from "react";
import {
  signInEmailPassword,
  signUpEmailPassword,
  sendPasswordReset,
} from "@/lib/community";
import { submitToBrevo } from "@/lib/brevo";
import { newsletterEndpointForSource } from "@/config/brevo";
import { SocialAuthButtons } from "@/components/community/SocialAuthButtons";

/**
 * Connexion / inscription par e-mail + mot de passe, 100 % dans l'application
 * (aucun navigateur), conforme aux règles App Store 4.0 / 4.8.
 * Utilisé dans l'app native ; sur le web on garde aussi Google/Apple.
 */
export function EmailPasswordAuth({
  onSuccess,
  initialMode = "signin",
  tone = "light",
}: {
  onSuccess?: () => void;
  initialMode?: "signin" | "signup";
  tone?: "light" | "dark";
}) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const dark = tone === "dark";
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [voir, setVoir] = useState(false);
  const [aConfirmer, setAConfirmer] = useState(false);

  async function handleForgot() {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Entre d'abord ton adresse e-mail, puis clique sur « Mot de passe oublié ».");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch {
      // On reste volontairement discret (on ne révèle pas si l'e-mail existe).
      setResetSent(true);
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" &&!firstName.trim()) {
      setError("Indique ton prénom.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Entre une adresse e-mail valide.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") {
        const res = await signUpEmailPassword(email, password, firstName.trim());
        // Récupération du contact dans Brevo (liste « membres »): e-mail + prénom.
        // no-cors, best-effort: n'empêche jamais l'inscription.
        try {
          const endpoint = newsletterEndpointForSource("app-membre");
          if (endpoint) {
            await submitToBrevo(endpoint, { EMAIL: email, PRENOM: firstName.trim() });
          }
        } catch {
          /* la collecte Brevo n'est pas bloquante */
        }
        // Confirmation d'e-mail activée côté Supabase : pas encore de session.
        if (!res.session) {
          setAConfirmer(true);
          return;
        }
      } else {
        await signInEmailPassword(email, password);
      }
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error? err.message: String(err);
      if (/invalid login credentials/i.test(msg)) {
        setError("E-mail ou mot de passe incorrect.");
      } else if (/already registered|already exists/i.test(msg)) {
        setError("Un compte existe déjà avec cet e-mail. Connecte-toi.");
      } else if (/not confirmed/i.test(msg)) {
        setError("Confirme d'abord ton adresse : ouvre le lien reçu par e-mail (pense aux indésirables).");
      } else if (/rate limit|too many|security purposes/i.test(msg)) {
        setError("Trop de tentatives d'affilée. Patiente quelques minutes, puis réessaie.");
      } else if (/password should|weak password/i.test(msg)) {
        setError("Ce mot de passe est trop simple. Choisis-en un plus long, avec des chiffres.");
      } else if (/network|fetch/i.test(msg)) {
        setError("Pas de connexion internet. Vérifie ton réseau et réessaie.");
      } else {
        setError("Une erreur est survenue. Réessaie.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (aConfirmer) {
    return (
      <div className={`rounded-2xl border p-5 text-center text-sm ${dark ? "border-dawn-400/30 bg-dawn-400/10 text-cream" : "border-spirit-600/30 bg-spirit-500/10 text-night-900"}`}>
        <p className="font-bold">Plus qu'une étape</p>
        <p className="mt-1.5">
          Un e-mail de confirmation vient d'être envoyé à <strong>{email}</strong>. Ouvre-le et touche le lien,
          puis reviens ici pour te connecter. Pense à regarder dans les indésirables.
        </p>
        <button
          type="button"
          onClick={() => {
            setAConfirmer(false);
            setMode("signin");
          }}
          className="btn-primary mt-4 w-full justify-center"
        >
          Me connecter
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <SocialAuthButtons tone={tone} onSuccess={onSuccess} />
      {mode === "signup"? (
        <input
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Ton prénom"
          className="field w-full"
        />
      ): null}
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ton adresse e-mail"
        className="field w-full"
      />
      <div className="relative">
        <input
          type={voir ? "text" : "password"}
          autoComplete={mode === "signup"? "new-password": "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "Choisis un mot de passe (6 caractères min.)" : "Ton mot de passe"}
          className="field w-full pr-12"
        />
        <button
          type="button"
          onClick={() => setVoir(!voir)}
          aria-label={voir ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-night-900/45"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" />
            {voir ? null : <path d="M4 4l16 16" strokeLinecap="round" />}
          </svg>
        </button>
      </div>
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
        {busy? "…": mode === "signup"? "Créer mon compte": "Se connecter"}
      </button>
      {mode === "signup" ? (
        <p className={`text-center text-xs ${dark ? "text-cream/50" : "text-night-900/50"}`}>
          En créant un compte, tu acceptes notre{" "}
          <a
            href="https://jackbrunet.com/confidentialite"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            politique de confidentialité
          </a>
          .
        </p>
      ) : null}
      {error? <p className="field-error text-center">{error}</p>: null}

      {/* Mot de passe oublié — uniquement à la connexion */}
      {mode === "signin"? (
        resetSent? (
          <p className={`text-center text-sm ${dark? "text-dawn-300": "text-spirit-700"}`}>
            Si un compte existe avec cet e-mail, tu vas recevoir un lien pour
            choisir un nouveau mot de passe. Pense à vérifier tes spams.
          </p>
        ): (
          <div className="text-center">
            <button
              type="button"
              onClick={handleForgot}
              disabled={busy}
              className={`text-sm underline underline-offset-2 ${
                dark? "text-cream/70 hover:text-cream": "text-night-900/55 hover:text-night-900"
              }`}
            >
              Mot de passe oublié ?
            </button>
          </div>
        )
      ): null}

      {/* Bascule connexion/inscription, rendue bien visible (bouton encadré) */}
      <div className="pt-1 text-center">
        <p className={`text-sm ${dark? "text-cream/60": "text-night-900/55"}`}>
          {mode === "signin"? "Pas encore de compte ?": "Tu as déjà un compte ?"}
        </p>
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signin"? "signup": "signin"));
            setError("");
          }}
          className={`mt-2 inline-flex w-full items-center justify-center rounded-full border px-5 py-2.5 text-sm font-bold transition-colors ${
            dark
? "border-dawn-400/60 text-dawn-300 hover:bg-dawn-400/10"
: "border-spirit-600/40 text-spirit-700 hover:bg-spirit-500/10"
          }`}
        >
          {mode === "signin"? "Créer un compte gratuit": "Me connecter"}
        </button>
      </div>
    </form>
  );
}
