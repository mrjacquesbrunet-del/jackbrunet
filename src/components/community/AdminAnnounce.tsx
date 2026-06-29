"use client";

import { useState } from "react";
import { postAnnouncement, clearAnnouncements } from "@/lib/announcements";

/**
 * Encart admin (réservé à Jack) pour publier une annonce in-app à tous les
 * utilisateurs. Affiché uniquement si l'email connecté est celui de l'admin.
 */
export function AdminAnnounce() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setMsg("Donne au moins un titre.");
      return;
    }
    setBusy(true);
    setMsg("");
    const ok = await postAnnouncement(title, body, link);
    setBusy(false);
    if (ok) {
      setMsg("✓ Annonce publiée ! Elle s'affiche en haut de l'app.");
      setTitle("");
      setBody("");
      setLink("");
    } else {
      setMsg("Erreur : publication impossible.");
    }
  }

  async function remove() {
    setBusy(true);
    await clearAnnouncements();
    setBusy(false);
    setMsg("✓ Annonces retirées.");
  }

  return (
    <div className="mt-8 rounded-3xl border border-dawn-400/40 bg-cream/70 p-5">
      <p className="font-display text-lg font-bold">📣 Publier une annonce (admin)</p>
      <p className="mt-1 text-sm text-night-900/60">
        Visible en haut de l'app pour tous les utilisateurs (nouvelle vidéo, événement, message…).
      </p>
      <form onSubmit={publish} className="mt-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre (ex. Nouvelle vidéo en ligne 🎬)"
          className="field w-full"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message (optionnel)"
          rows={2}
          className="field w-full"
        />
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Lien optionnel (ex. /videos)"
          className="field w-full"
        />
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "Un instant…" : "Publier l'annonce"}
          </button>
          <button type="button" onClick={remove} disabled={busy} className="btn-ghost">
            Retirer les annonces
          </button>
        </div>
        {msg ? <p className="text-sm text-spirit-700">{msg}</p> : null}
      </form>
    </div>
  );
}
