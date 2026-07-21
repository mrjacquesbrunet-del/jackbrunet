"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import {
  listNotifications,
  unreadCount,
  markNotificationsRead,
  notifHref,
  type Notification,
} from "@/lib/community";

function label(n: Notification) {
  const who = n.actor?.pseudo?? "Quelqu'un";
  switch (n.type) {
    case "pray":
      return `${who} prie pour ton sujet`;
    case "heart":
      return `${who} a aimé ton sujet`;
    case "comment":
      return `${who} t'a encouragé(e)`;
    case "follow":
      return `${who} s'est abonné(e) à toi`;
    case "mention":
      return `${who} t'a mentionné(e)`;
    case "message":
      return `${who} t'a envoyé un message`;
    case "reply":
      return `${who} a répondu à ton commentaire`;
    case "group_comment":
      return `${who} a commenté ta publication`;
    case "group_reaction":
      return `${who} a réagi à ta publication`;
    case "admin":
      return n.body? `${n.body}`: "Message de Pasteur Jack";
    default:
      return n.body?? "Nouvelle notification";
  }
}

function when(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsBell({
  userId,
  tone = "light",
}: {
  userId: string;
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[] | null>(null);

  const refresh = useCallback(async () => {
    setUnread(await unreadCount(userId));
  }, [userId]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [refresh]);

  async function toggle() {
    const next =!open;
    setOpen(next);
    if (next) {
      setItems(await listNotifications(userId, 100));
      await markNotificationsRead(userId);
      setUnread(0);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
          tone === "dark"
? "border-dawn-400/50 bg-dawn-400/15 text-dawn-300 hover:bg-dawn-400/25"
: "border-night-900/15 text-night-900/70 hover:border-night-900/30"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0? (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-night-900">
            {unread > 9? "9+": unread}
          </span>
        ): null}
      </button>

      {open? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[55] cursor-default"
          />
          {/* Mobile: panneau centré en haut (toujours dans l'écran). Desktop: ancré sous la cloche. */}
          <div className="fixed left-1/2 top-20 z-[60] w-[92vw] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl border border-night-900/10 bg-white text-left shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:translate-x-0">
            <p className="border-b border-night-900/10 px-4 py-3 font-display font-bold text-night-900">
              Notifications
            </p>
            <div className="max-h-[70vh] overflow-y-auto sm:max-h-96">
              {items === null? (
                <p className="px-4 py-6 text-sm text-night-900/45">Chargement…</p>
              ): items.length === 0? (
                <p className="px-4 py-6 text-sm text-night-900/45">
                  Pas encore de notification.
                </p>
              ): (
                <ul>
                  {items.map((n) => {
                    const inner = (
                      <>
                        <Avatar pseudo={n.actor?.pseudo} url={n.actor?.avatar_url} size={32} />
                        <div className="min-w-0">
                          <p className="text-sm leading-snug text-night-900/85">{label(n)}</p>
                          <p className="text-xs text-night-900/45">{when(n.created_at)}</p>
                        </div>
                      </>
                    );
                    const rowCls = `flex items-start gap-3 px-4 py-3 ${
                      n.read? "": "bg-spirit-500/[0.05]"
                    }`;
                    // Destination du clic : le bon contenu directement
                    // (sujet de prière + commentaires, message, profil…).
                    const href = notifHref(n);
                    return href? (
                      <li key={n.id}>
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`${rowCls} transition-colors hover:bg-night-900/[0.04]`}
                        >
                          {inner}
                        </Link>
                      </li>
                    ): (
                      <li key={n.id} className={rowCls}>
                        {inner}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      ): null}
    </div>
  );
}
