"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import { PrayerMark } from "@/components/ui/PrayerMark";
import {
  listNotifications,
  markNotificationsRead,
  type Notification,
  type NotifType,
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
    case "admin":
      return n.body? `${n.body}`: "Message de Pasteur Jack";
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

const TYPES: { key: NotifType; label: string; icon: string }[] = [
  { key: "pray", label: "Prières", icon: "M12 3c-1 2-1 4 0 6m0 0c1-2 1-4 0-6M7 21l1.5-7.5a3.5 3.5 0 0 1 7 0L17 21" },
  { key: "heart", label: "J'aime", icon: "M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" },
  { key: "comment", label: "Messages", icon: "M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" },
  { key: "follow", label: "Abonnés", icon: "M16 18v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6" },
  { key: "mention", label: "Mentions", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm4 0v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" },
];

export function ProfileNotifications({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notification[] | null>(null);

  const load = useCallback(async () => {
    const list = await listNotifications(userId, 50);
    setItems(list);
    // Consultées depuis le profil → marquées lues.
    if (list.some((n) =>!n.read)) await markNotificationsRead(userId);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const counts: Record<NotifType, number> = {
    pray: 0,
    heart: 0,
    comment: 0,
    follow: 0,
    mention: 0,
    admin: 0,
  };
  for (const n of items?? []) counts[n.type]++;

  return (
    <div className="glass-strong p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold">Mes notifications</h3>

      {/* Compteurs par type */}
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {TYPES.map((t) => (
          <div key={t.key} className="rounded-2xl border border-night-900/10 bg-white p-3 text-center">
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-night-900 text-dawn-400">
              {t.key === "pray"? (
                <PrayerMark className="h-5 w-5" />
              ): (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path d={t.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <p className="mt-1.5 font-display text-xl font-extrabold text-spirit-700">{counts[t.key]}</p>
            <p className="text-xs text-night-900/55">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Liste récente */}
      <div className="mt-5">
        {items === null? (
          <p className="text-sm text-night-900/45">Chargement…</p>
        ): items.length === 0? (
          <p className="text-sm text-night-900/55">
            Pas encore de notification. Partage un sujet de prière pour lancer les échanges.
          </p>
        ): (
          <ul className="divide-y divide-night-900/5">
            {items.slice(0, 12).map((n) => (
              <li key={n.id} className="flex items-center gap-3 py-2.5">
                <Avatar pseudo={n.actor?.pseudo} url={n.actor?.avatar_url} size={34} />
                <p className="min-w-0 flex-1 text-sm text-night-900/85">{label(n)}</p>
                <span className="shrink-0 text-xs text-night-900/40">{when(n.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
