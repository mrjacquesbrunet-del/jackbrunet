"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { unreadMessages } from "@/lib/messages";

/** Icône enveloppe (messagerie) avec pastille de non-lus, pour l'en-tête profil. */
export function MessagesButton({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => unreadMessages().then((n) => active && setUnread(n));
    load();
    const t = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <Link
      href="/messages"
      aria-label="Messages"
      className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
        tone === "dark"
? "border-white/20 bg-white/10 text-cream hover:bg-white/20"
: "border-night-900/15 text-night-900/70 hover:border-night-900/30"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {unread > 0? (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-night-900">
          {unread > 9? "9+": unread}
        </span>
      ): null}
    </Link>
  );
}
