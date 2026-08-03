"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Routes « lecture » où le carnet est à portée de main. */
const READING_ROUTES = ["/bible", "/plans", "/bible-1-an", "/recherche"];
/** Routes du carnet / favoris: on propose alors le retour à la Bible. */
const CARNET_ROUTES = ["/carnet", "/favoris"];

function match(pathname: string, routes: string[]) {
  return routes.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/**
 * Petit bouton rond flottant (bas-droite, au-dessus de la barre d'onglets) qui
 * SUIT le défilement:
 * - pendant la lecture (Bible, plans…): raccourci vers « Mon carnet » ;
 * - dans le carnet: retour direct à la Bible, EXACTEMENT où on s'était arrêté
 *   (la position est mémorisée par le lecteur biblique).
 */
export function CarnetBubble() {
  const pathname = usePathname();
  const onReading = match(pathname, READING_ROUTES);
  const onCarnet = match(pathname, CARNET_ROUTES);
  if (!onReading &&!onCarnet) return null;

  const href = onCarnet? "/bible": "/carnet";
  const label = onCarnet? "Bible": "Mon carnet";

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom)+var(--audio-bar-h,0px)+0.5rem)] right-4 z-[55] inline-flex items-center gap-2 rounded-full border border-dawn-400/40 bg-night-900/80 py-2.5 pl-3 pr-4 text-cream shadow-lg backdrop-blur-md transition-transform hover:bg-night-900/90 active:scale-95"
    >
      {onCarnet? (
        // Icône Bible (retour à la lecture)
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-dawn-400" strokeWidth={1.8}>
          <path
            d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v16M9 7h6M9 10h6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ): (
        // Icône carnet
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-dawn-400" strokeWidth={1.8}>
          <path
            d="M6 3.5h8.5L19 8v12.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z"
            strokeLinejoin="round"
          />
          <path d="M14 3.5V8h4.5M8.5 13h7M8.5 16.5h7" strokeLinecap="round" />
        </svg>
      )}
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}
