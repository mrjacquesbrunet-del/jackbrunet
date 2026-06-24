import { asset } from "@/lib/asset";
import { getAbout } from "@/lib/content";

/**
 * Signature « Par Jack Brunet » avec photo ronde.
 * - défaut : vertical, centré (pour les en-têtes) ;
 * - compact : horizontal, discret (pour les pieds de carte).
 */
export function AuthorByline({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const about = getAbout();
  const photo = asset(about.photo);

  if (compact) {
    return (
      <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
        <span className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-dawn-400/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Jack Brunet" className="h-full w-full object-cover object-top" />
        </span>
        <span className="text-sm text-night-900/60">
          Par <span className="font-semibold text-night-900/80">Jack Brunet</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      <span className="h-16 w-16 overflow-hidden rounded-full shadow-card ring-2 ring-dawn-400/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="Jack Brunet" className="h-full w-full object-cover object-top" />
      </span>
      <div className="text-center leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-night-900/45">
          Par
        </p>
        <p className="font-display text-sm font-bold text-night-900">Jack Brunet</p>
      </div>
    </div>
  );
}
