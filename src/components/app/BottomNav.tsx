"use client";

import { useRef, useState } from "react";
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
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8h.01M11 12h1v4h1",
  group: "M17 20v-1a4 4 0 0 0-3-3.9M7 20v-1a4 4 0 0 1 3-3.9M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M3.5 20v-.5a2.5 2.5 0 0 1 2.5-2.5M20.5 20v-.5a2.5 2.5 0 0 0-2.5-2.5",
  bulb: "M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.3 1 2.1h5c0-.8.3-1.6 1-2.1A6 6 0 0 0 12 3zM10 19h4M10.8 21.5h2.4",
  quiz: "M9.2 9a3 3 0 1 1 4 2.8c-.8.5-1.2 1-1.2 1.9M12 17.5h.01M4 5h16v12a2 2 0 0 1-2 2H9l-4 3z",
  qa: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M9.3 9.5a2.7 2.7 0 1 1 3.6 2.6c-.7.4-1.1.9-1.1 1.7M12 16.5h.01",
};

const TABS = [
  { href: "/devotionnel", label: "Jésus", icon: I.home, match: ["/devotionnel", "/"] },
  { href: "/communaute", label: "Prière", icon: I.pray, img: "/icons/priere.png", match: ["/communaute", "/membre"] },
  { href: "/plans", label: "Plans", icon: I.list, match: ["/plans", "/bible-1-an"] },
  { href: "/bible", label: "Bible", icon: I.bible, match: ["/bible", "/recherche", "/carnet", "/favoris"] },
  { href: "/profil", label: "Profil", icon: I.user, match: ["/profil"] },
  // Onglets 6+ : masqués par défaut, révélés en faisant glisser la barre.
  { href: "/questions", label: "Questions", icon: I.qa, match: ["/questions"] },
  { href: "/ecouter", label: "Écouter", icon: I.headphones, match: ["/ecouter", "/videos"] },
  { href: "/memoriser", label: "Mémoriser", icon: I.bulb, match: ["/memoriser"] },
  { href: "/quiz", label: "Défi", icon: I.quiz, match: ["/quiz"] },
  { href: "/groupes", label: "Groupes", icon: I.group, match: ["/groupes", "/groupe"] },
  // « Soutien » regroupe désormais le don ET la fiche « À propos ».
  { href: "/don", label: "Soutien", icon: I.heart, match: ["/don", "/a-propos"] },
];

export function BottomNav() {
  const pathname = usePathname();
  const rowRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  const isActive = (m: string[]) => m.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const onScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-night-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="relative mx-auto max-w-lg">
        {/* Rangée glissante: 5 icônes visibles, on glisse vers la gauche pour
            révéler « Soutien » et « À propos » (onglets 6 & 7). */}
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory items-stretch overflow-x-auto"
        >
          {TABS.map((t) => {
            const active = isActive(t.match);
            return (
              <Link
                key={t.href}
                href={t.href}
                // touch-manipulation + tap-highlight transparent : évite l'état
                // « appuyé » qui reste collé dans la WebView iOS après un tap.
                style={{ WebkitTapHighlightColor: "transparent" }}
                className={`flex shrink-0 basis-1/5 snap-start select-none flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors touch-manipulation ${
                  active? "text-[#CAF000]": "text-cream/55"
                }`}
              >
                {t.img? (
                  // eslint-disable-next-line @next/next/no-img-element
                  // Pas de transition sur `filter` (grayscale) : WebKit iOS peut
                  // figer l'animation et laisser l'icône « allumée ».
                  <img
                    src={asset(t.img)}
                    alt=""
                    aria-hidden="true"
                    className={`h-6 w-6 object-contain ${
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
        {/* Dégradé + chevron: indique qu'on peut faire glisser vers la gauche.
            Masqué une fois arrivé au bout. */}
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-end bg-gradient-to-l from-night-950 via-night-950/70 to-transparent pr-1.5 text-dawn-400 transition-opacity duration-300 ${
            atEnd? "opacity-0": "opacity-100"
          }`}
        >
          {/* Double chevron lime animé : « il y a d'autres onglets à droite » */}
          <svg viewBox="0 0 24 24" className="nav-nudge h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4}>
            <path d="M6.5 6l6 6-6 6M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </nav>
  );
}
