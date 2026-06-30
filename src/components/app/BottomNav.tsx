"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const I = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  bible: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v16M9 7h6M9 10h6",
  pray: "M11.4 3.2C9.7 5.7 8.6 8.4 8.6 12.5V18a1.6 1.6 0 0 0 1.6 1.6h1.2V3.2Z M12.6 3.2c1.7 2.5 2.8 5.2 2.8 9.3V18a1.6 1.6 0 0 1-1.6 1.6h-1.2V3.2Z M8.6 12.7 6.6 14.1a1.4 1.4 0 0 0-.4 1.9 M15.4 12.7l2 1.4a1.4 1.4 0 0 1 .4 1.9",
  video: "M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM17 10l5-3v10l-5-3",
  plus: "M4 6h16M4 12h16M4 18h16",
  star: "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z",
  note: "M5 4h11l3 3v13H5zM15 4v4h4",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  news: "M4 5h13v14H6a2 2 0 0 1-2-2zM17 8h3v9a2 2 0 0 1-2 2M8 9h6M8 13h6",
  user: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  heart: "M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z",
  bag: "M6 7h12l1 13H5zM9 7a3 3 0 0 1 6 0",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3C9.5 5.5 9.5 18.5 12 21",
  gift: "M20 12v8H4v-8M2 7h20v5H2zM12 7v13M12 7S10 3 7.5 3 5 7 8 7M12 7s2-4 4.5-4S19 7 16 7",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  answered: "M12 2l2.4 5 5.6.8-4 4 1 5.6L12 19.8 6.9 22l1-5.6-4-4 5.6-.8z",
};

const TABS = [
  { href: "/devotionnel", label: "Jésus", icon: I.home, match: ["/devotionnel", "/"] },
  { href: "/communaute", label: "Prière", icon: I.pray, match: ["/communaute", "/membre"] },
  { href: "/carnet", label: "Carnet", icon: I.note, match: ["/carnet"] },
  { href: "/bible", label: "Bible", icon: I.bible, match: ["/bible", "/plans"] },
];

const MORE = [
  { href: "/videos", label: "Vidéos", icon: I.video },
  { href: "/plans", label: "Plans", icon: I.list },
  { href: "/profil", label: "Mon profil", icon: I.user },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (m: string[]) => m.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <>
      {/* Feuille « Plus » */}
      {moreOpen ? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-x-0 bottom-0 z-[71] rounded-t-3xl border-t border-white/10 bg-[#181B11] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-cream shadow-card">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            <p className="mb-3 font-display text-lg font-bold">Tout explorer</p>
            <div className="grid grid-cols-3 gap-3">
              {MORE.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center transition-colors hover:bg-white/[0.08]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#CAF000]/15 text-[#CAF000]">
                    <Icon d={m.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold">{m.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Barre d'onglets */}
      <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#14160E]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {TABS.map((t) => {
            const active = isActive(t.match);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                  active ? "text-[#CAF000]" : "text-cream/55"
                }`}
              >
                <Icon d={t.icon} className="h-6 w-6" />
                {t.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
              moreOpen ? "text-[#CAF000]" : "text-cream/55"
            }`}
          >
            <Icon d={I.plus} className="h-6 w-6" />
            Plus
          </button>
        </div>
      </nav>
    </>
  );
}
