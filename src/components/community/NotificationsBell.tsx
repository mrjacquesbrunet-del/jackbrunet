"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import {
  listNotifications,
  unreadCount,
  markNotificationsRead,
  type Notification,
} from "@/lib/community";

function label(n: Notification) {
  const who = n.actor?.pseudo ?? "Quelqu'un";
  switch (n.type) {
    case "pray":
      return `${who} prie pour ton sujet 🙏`;
    case "heart":
      return `${who} a aimé ton sujet ❤️`;
    case "comment":
      return `${who} t'a encouragé(e) 💬`;
    case "follow":
      return `${who} s'est abonné(e) à toi`;
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

export function NotificationsBell({ userId }: { userId: string }) {
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
    const next = !open;
    setOpen(next);
    if (next) {
      setItems(await listNotifications(userId));
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
        className="relative grid h-10 w-10 place-items-center rounded-full border border-night-900/15 text-night-900/70 transition-colors hover:border-night-900/30"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-spirit-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-xl">
            <p className="border-b border-night-900/10 px-4 py-3 font-display font-bold">
              Notifications
            </p>
            <div className="max-h-96 overflow-y-auto">
              {items === null ? (
                <p className="px-4 py-6 text-sm text-night-900/45">Chargement…</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-night-900/45">
                  Pas encore de notification.
                </p>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 ${
                        n.read ? "" : "bg-spirit-500/[0.05]"
                      }`}
                    >
                      <Avatar pseudo={n.actor?.pseudo} url={n.actor?.avatar_url} size={32} />
                      <div className="min-w-0">
                        <p className="text-sm leading-snug text-night-900/85">{label(n)}</p>
                        <p className="text-xs text-night-900/45">{when(n.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
