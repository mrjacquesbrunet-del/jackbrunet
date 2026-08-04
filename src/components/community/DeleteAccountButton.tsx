"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/community";

/**
 * Suppression de compte (exigence App Store 5.1.1 v). Toujours visible dans le
 * profil: double confirmation puis suppression définitive du compte + données,
 * et redirection vers l'accueil.
 */
export function DeleteAccountButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onDelete() {
    if (
      !confirm(
        "Supprimer définitivement ton compte et toutes tes données ? Cette action est irréversible.",
      )
    )
      return;
    if (
      !confirm(
        "Dernière confirmation : ton compte, tes sujets de prière, tes messages et toutes tes données seront effacés pour toujours. Continuer ?",
      )
    )
      return;
    setBusy(true);
    setMsg("");
    const res = await deleteAccount();
    if (res.ok) {
      setMsg("Ton compte a été supprimé. À bientôt.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1400);
    } else {
      setBusy(false);
      setMsg(
        `La suppression a échoué${res.error ? ` (${res.error})` : ""}. Réessaie, ou écris-nous à contact@jackbrunet.com.`,
      );
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-red-500/25 bg-red-500/[0.04] p-5">
      <p className="font-display text-base font-bold text-night-900/85">Supprimer mon compte</p>
      <p className="mt-1 text-sm text-night-900/60">
        Efface définitivement ton compte et toutes tes données (profil, sujets de prière,
        messages). Cette action est irréversible.
      </p>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
          <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {busy? "Suppression…": "Supprimer mon compte"}
      </button>
      {msg? <p className="mt-2 text-sm font-semibold text-red-600">{msg}</p>: null}
    </div>
  );
}
