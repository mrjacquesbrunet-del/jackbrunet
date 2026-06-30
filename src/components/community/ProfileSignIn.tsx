"use client";

import { useState } from "react";
import { signInEmail, signInGoogle } from "@/lib/community";

/**
 * Carte de connexion compacte affichée sur le profil quand l'utilisateur
 * n'a pas de compte (Google ou lien magique par email).
 */
export function ProfileSignIn() {
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
      const msg = e instanceof Error ? e.message : String(e);
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
    <div className="mx-auto max-w-md rounded-4xl border border-night-900/10 bg-white p-7 shadow-card sm:p-8">
      <h2 className="text-center font-display text-2xl font-extrabold">Connecte-toi à ton espace</h2>
      <p className="mt-2 text-center text-sm text-night-900/65">
        Personnalise ton profil (photo, verset, bio), retrouve ton grade et ton parcours partout.
      </p>

      {sent ? (
        <div className="mt-6 rounded-2xl border border-dawn-400/40 bg-dawn-400/10 p-4 text-center text-sm">
          ✓ Un lien de connexion vient d'être envoyé à <strong>{email}</strong>. Ouvre ta boîte mail
          et clique dessus.
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={google}
            disabled={gBusy}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-night-900/15 bg-white px-6 py-3 text-sm font-semibold text-night-900 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <GoogleMark /> {gBusy ? "Redirection…" : "Continuer avec Google"}
          </button>
          {gErr ? <p className="field-error mt-2 text-center">{gErr}</p> : null}

          <div className="my-5 flex items-center gap-3 text-xs text-night-900/40">
            <span className="h-px flex-1 bg-night-900/10" /> ou par email{" "}
            <span className="h-px flex-1 bg-night-900/10" />
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
              {busy ? "Envoi…" : "Recevoir mon lien de connexion"}
            </button>
            {error ? <p className="field-error text-center">{error}</p> : null}
          </form>
        </>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
