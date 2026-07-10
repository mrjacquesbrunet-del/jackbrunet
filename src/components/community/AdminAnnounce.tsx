"use client";

import { useState } from "react";
import { postAnnouncement, clearAnnouncements } from "@/lib/announcements";
import { broadcastNotification } from "@/lib/community";
import { broadcastMessage } from "@/lib/messages";
import { MegaphoneGlyph, BellGlyph } from "@/components/ui/DevoIcons";

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

  // Notification directe (cloche) à tous les membres, ex. live de prière.
  const [notif, setNotif] = useState("");
  const [notifLink, setNotifLink] = useState("");
  const [notifBusy, setNotifBusy] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  // Message privé (messagerie) à tous les membres.
  const [dm, setDm] = useState("");
  const [dmBusy, setDmBusy] = useState(false);
  const [dmMsg, setDmMsg] = useState("");

  async function sendDm(e: React.FormEvent) {
    e.preventDefault();
    if (!dm.trim()) {
      setDmMsg("Écris ton message.");
      return;
    }
    if (!confirm("Envoyer ce message dans la messagerie de TOUS les membres?")) return;
    setDmBusy(true);
    setDmMsg("");
    const n = await broadcastMessage(dm);
    setDmBusy(false);
    if (n!== null) {
      setDmMsg(`✓ Message envoyé à ${n} membre${n > 1? "s": ""}. Ils sont notifiés.`);
      setDm("");
    } else {
      setDmMsg("Erreur: envoi impossible (vérifie la migration SQL admin_broadcast_message).");
    }
  }

  async function sendNotif(e: React.FormEvent) {
    e.preventDefault();
    if (!notif.trim()) {
      setNotifMsg("Écris ton message.");
      return;
    }
    if (!confirm("Envoyer cette notification à TOUS les membres?")) return;
    setNotifBusy(true);
    setNotifMsg("");
    const n = await broadcastNotification(notif, notifLink);
    setNotifBusy(false);
    if (n!== null) {
      setNotifMsg(`✓ Notification envoyée à ${n} membre${n > 1? "s": ""}.`);
      setNotif("");
      setNotifLink("");
    } else {
      setNotifMsg("Erreur: envoi impossible (vérifie la migration SQL).");
    }
  }

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
      setMsg("✓ Annonce publiée! Elle s'affiche en haut de l'app.");
      setTitle("");
      setBody("");
      setLink("");
    } else {
      setMsg("Erreur: publication impossible.");
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
      <p className="flex items-center gap-2 font-display text-lg font-bold">
        <MegaphoneGlyph className="h-5 w-5 text-spirit-600" />
        Publier une annonce (admin)
      </p>
      <p className="mt-1 text-sm text-night-900/60">
        Visible en haut de l'app pour tous les utilisateurs (nouvelle vidéo, événement, message…).
      </p>
      <form onSubmit={publish} className="mt-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre (ex. Nouvelle vidéo en ligne)"
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
            {busy? "Un instant…": "Publier l'annonce"}
          </button>
          <button type="button" onClick={remove} disabled={busy} className="btn-ghost">
            Retirer les annonces
          </button>
        </div>
        {msg? <p className="text-sm text-spirit-700">{msg}</p>: null}
      </form>

      {/* Notification directe (cloche) à tous les membres */}
      <div className="mt-6 border-t border-dawn-400/30 pt-5">
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          <BellGlyph className="h-5 w-5 text-spirit-600" />
          Notifier tous les membres
        </p>
        <p className="mt-1 text-sm text-night-900/60">
          Chaque membre reçoit une notification dans son profil (idéal pour annoncer un
          live de prière, un direct, un événement).
        </p>
        <form onSubmit={sendNotif} className="mt-4 space-y-3">
          <textarea
            value={notif}
            onChange={(e) => setNotif(e.target.value)}
            placeholder="Ton message (ex. Live de prière dans 10 min, rejoins-nous)"
            rows={2}
            className="field w-full"
          />
          <input
            value={notifLink}
            onChange={(e) => setNotifLink(e.target.value)}
            placeholder="Lien optionnel (ex. /communaute)"
            className="field w-full"
          />
          <button type="submit" disabled={notifBusy} className="btn-primary">
            {notifBusy? "Envoi…": "Envoyer la notification"}
          </button>
          {notifMsg? <p className="text-sm text-spirit-700">{notifMsg}</p>: null}
        </form>
      </div>

      {/* Message privé (messagerie) à tous les membres */}
      <div className="mt-6 border-t border-dawn-400/30 pt-5">
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          <BellGlyph className="h-5 w-5 text-spirit-600" />
          Message privé à tous
        </p>
        <p className="mt-1 text-sm text-night-900/60">
          Dépose un message dans la messagerie de chaque membre (de ta part). Chacun reçoit une
          notification « Nouveau message » qui ouvre sa messagerie.
        </p>
        <form onSubmit={sendDm} className="mt-4 space-y-3">
          <textarea
            value={dm}
            onChange={(e) => setDm(e.target.value)}
            placeholder="Ton message (ex. Merci de faire partie de cette famille de prière…)"
            rows={3}
            className="field w-full"
          />
          <button type="submit" disabled={dmBusy} className="btn-primary">
            {dmBusy? "Envoi…": "Envoyer à tous"}
          </button>
          {dmMsg? <p className="text-sm text-spirit-700">{dmMsg}</p>: null}
        </form>
      </div>
    </div>
  );
}
