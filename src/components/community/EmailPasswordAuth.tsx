"use client";

import { useState } from "react";
import { signInEmailPassword, signUpEmailPassword } from "@/lib/community";

/**
 * Connexion / inscription par e-mail + mot de passe, 100 % dans l'application
 * (aucun navigateur) — conforme aux règles App Store 4.0 / 4.8.
 * Utilisé dans l'app native ; sur le web on garde aussi Google/Apple.
 */
export function EmailPasswordAuth({ onSuccess }: { onSuccess?: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
        await signUpEmailPassword(email, password);
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
      } else {
        setError("Une erreur est survenue. Réessaie.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ton adresse e-mail"
        className="field w-full"
      />
      <input
        type="password"
        autoComplete={mode === "signup"? "new-password": "current-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Ton mot de passe"
        className="field w-full"
      />
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
        {busy? "…": mode === "signup"? "Créer mon compte": "Se connecter"}
      </button>
      {error? <p className="field-error text-center">{error}</p>: null}
      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signin"? "signup": "signin"));
          setError("");
        }}
        className="block w-full text-center text-sm font-semibold text-spirit-600 hover:underline"
      >
        {mode === "signin"
? "Pas encore de compte? Créer un compte"
: "Déjà un compte? Se connecter"}
      </button>
    </form>
  );
}
