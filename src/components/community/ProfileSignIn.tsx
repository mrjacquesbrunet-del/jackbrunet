"use client";

import { useEffect, useState } from "react";
import { signInEmail, signInGoogle } from "@/lib/community";
import { isNativeApp } from "@/lib/notifications";
import { EmailPasswordAuth } from "@/components/community/EmailPasswordAuth";
import { GoogleG } from "@/components/community/SocialAuthButtons";

/**
 * Carte de connexion compacte affichée sur le profil quand l'utilisateur
 * n'a pas de compte. App native: e-mail + mot de passe (100% dans l'app).
 * Web: Google / Apple / lien magique par e-mail.
 */
export function ProfileSignIn() {
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
    <div className="mx-auto max-w-md rounded-4xl border border-night-900/10 bg-white p-7 shadow-card sm:p-8">
      <h2 className="text-center font-display text-2xl font-extrabold">Connecte-toi à ton espace</h2>
      <p className="mt-2 text-center text-sm text-night-900/65">
        Personnalise ton profil (photo, verset, bio), retrouve ton grade et ton parcours partout.
      </p>

      {native? (
        <div className="mt-6">
          <EmailPasswordAuth />
        </div>
      ): sent? (
        <div className="mt-6 rounded-2xl border border-dawn-400/40 bg-dawn-400/10 p-4 text-center text-sm">
          ✓ Un lien de connexion vient d'être envoyé à <strong>{email}</strong>. Ouvre ta boîte mail
          et clique dessus.
        </div>
      ): (
        <>
          <button
            type="button"
            onClick={google}
            disabled={gBusy}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-night-900/15 bg-white px-6 py-3 text-sm font-semibold text-night-900 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <GoogleMark /> {gBusy? "Redirection…": "Continuer avec Google"}
          </button>
          {gErr? <p className="field-error mt-2 text-center">{gErr}</p>: null}

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
              {busy? "Envoi…": "Recevoir mon lien de connexion"}
            </button>
            {error? <p className="field-error text-center">{error}</p>: null}
          </form>
        </>
      )}
    </div>
  );
}

function GoogleMark() {
  return <GoogleG />;
}
