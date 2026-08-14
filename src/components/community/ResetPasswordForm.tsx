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
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
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
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
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

  if (ready && !hasSession) {
    return (
      <div className="rounded-3xl border border-night-900/10 bg-white p-6 text-center">
        <p className="font-display text-xl font-bold text-night-900">
          Lien invalide ou expiré
        </p>
        <p className="mt-2 text-night-900/70">
          Ouvre l'application, va sur l'écran de connexion et touche « Mot de passe
          oublié » pour recevoir un nouveau lien.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-3xl border border-night-900/10 bg-white p-6">
      <input
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nouveau mot de passe"
        className="field w-full"
      />
      <input
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirme le mot de passe"
        className="field w-full"
      />
      <button type="submit" disabled={busy || !ready} className="btn-primary w-full justify-center">
        {busy ? "…" : "Enregistrer le nouveau mot de passe"}
      </button>
      {error ? <p className="field-error text-center">{error}</p> : null}
    </form>
  );
}
