"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { updatePassword } from "@/lib/community";

/**
 * Formulaire de choix d'un nouveau mot de passe, atterrissage du lien reçu
 * par e-mail (« Mot de passe oublié »). Supabase établit automatiquement une
 * session de récupération à partir du lien ; on vérifie sa présence puis on
 * enregistre le nouveau mot de passe.
 */
export function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [voir, setVoir] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [expire, setExpire] = useState(false);

  useEffect(() => {
    // Lien expiré ou déjà utilisé (souvent ouvert automatiquement par la
    // messagerie pour le vérifier) : Supabase renvoie ici avec #error=…
    try {
      const h = new URLSearchParams(window.location.hash.slice(1) + "&" + window.location.search.slice(1));
      if (h.get("error_code") || h.get("error")) setExpire(true);
    } catch {
      /* ignore */
    }
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    let active = true;
    // Le lien de l'e-mail ouvre une session de récupération (détectée dans l'URL).
    sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setHasSession(true);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (session || event === "PASSWORD_RECOVERY") {
        setHasSession(true);
        setReady(true);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch {
      setError(
        "Le lien a peut-être expiré. Redemande un e-mail de réinitialisation depuis l'application."
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-night-900/10 bg-white p-6 text-center">
        <p className="font-display text-xl font-bold text-night-900">
          Ton mot de passe a été mis à jour.
        </p>
        <p className="mt-2 text-night-900/70">
          Tu peux maintenant retourner dans l'application et te connecter avec ton
          nouveau mot de passe.
        </p>
        <Link href="/communaute/" className="btn-primary mt-5 inline-flex justify-center">
          Ouvrir la communauté
        </Link>
      </div>
    );
  }

  if ((ready && !hasSession) || (expire && !hasSession)) {
    return (
      <div className="rounded-3xl border border-night-900/10 bg-white p-6 text-center">
        <p className="font-display text-xl font-bold text-night-900">
          Lien expiré ou déjà utilisé
        </p>
        <p className="mt-2 text-night-900/70">
          Ce lien n'est plus valable. Certaines messageries l'ouvrent toutes seules pour
          le vérifier, ce qui l'utilise.
        </p>
        <p className="mt-2 text-night-900/70">
          Ouvre l'application, touche « Mot de passe oublié » sur l'écran de connexion,
          puis entre directement le code reçu dans le nouvel e-mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-3xl border border-night-900/10 bg-white p-6">
      <div className="relative">
        <input
          type={voir ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe"
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
      <button type="submit" disabled={busy || !ready} className="btn-primary w-full justify-center">
        {busy ? "…" : "Enregistrer le nouveau mot de passe"}
      </button>
      {error ? <p className="field-error text-center">{error}</p> : null}
    </form>
  );
}
