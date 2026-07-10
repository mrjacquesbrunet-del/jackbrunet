"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { asset } from "@/lib/asset";

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
  pray: "M12 3.4c-.6 1.1-1.3 2-2.4 3.1L6.3 9.8c-.6.6-.9 1.5-.7 2.3l.8 4A1.8 1.8 0 0 0 8.2 19.5H12ZM12 3.4c.6 1.1 1.3 2 2.4 3.1L17.7 9.8c.6.6.9 1.5.7 2.3l-.8 4A1.8 1.8 0 0 1 15.8 19.5H12ZM9.4 12.1c1.7-.9 3.5-.9 5.2 0",
  video: "M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM17 10l5-3v10l-5-3",
  headphones: "M4 14v-2a8 8 0 0 1 16 0v2M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 1zM20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1z",
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
  { href: "/communaute", label: "Prière", icon: I.pray, img: "/icons/priere.png", match: ["/communaute", "/membre"] },
  { href: "/ecouter", label: "Écouter", icon: I.headphones, match: ["/ecouter", "/videos"] },
  { href: "/bible", label: "Bible", icon: I.bible, match: ["/bible", "/plans", "/bible-1-an", "/recherche"] },
  { href: "/carnet", label: "Carnet", icon: I.note, match: ["/carnet", "/favoris"] },
  { href: "/profil", label: "Profil", icon: I.user, match: ["/profil"] },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (m: string[]) => m.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#14160E]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map((t) => {
          const active = isActive(t.match);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                active? "text-[#CAF000]": "text-cream/55"
              }`}
            >
              {t.img? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset(t.img)}
                  alt=""
                  aria-hidden="true"
                  className={`h-6 w-6 object-contain transition-all ${
                    active? "opacity-100": "opacity-55 grayscale"
                  }`}
                />
              ): (
                <Icon d={t.icon} className="h-6 w-6" />
              )}
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
