import { APP_STORE_URL, PLAY_STORE_URL } from "@/config/app-links";

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.05 12.53c-.03-2.4 1.96-3.55 2.05-3.61-1.12-1.63-2.86-1.86-3.47-1.88-1.47-.15-2.88.87-3.63.87-.75 0-1.9-.85-3.13-.83-1.6.02-3.09.94-3.92 2.38-1.68 2.9-.43 7.2 1.2 9.55.8 1.15 1.75 2.45 3 2.4 1.2-.05 1.66-.78 3.11-.78 1.45 0 1.86.78 3.13.75 1.3-.02 2.12-1.17 2.9-2.33.92-1.33 1.3-2.63 1.32-2.7-.03-.01-2.53-.97-2.56-3.82zM14.66 5.5c.66-.8 1.1-1.9.98-3-.95.04-2.1.63-2.78 1.43-.61.7-1.15 1.83-1 2.9 1.05.08 2.13-.53 2.8-1.33z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4 3.6v16.8c0 .5.55.8.97.53l1.1-.66L15.4 12 6.07 3.73l-1.1-.66A.62.62 0 0 0 4 3.6zm12.9 6.06L8.6 4.7l8.13 8.13 2.94-1.77c.9-.54.9-1.85 0-2.4l-2.77-1zM8.6 19.3l8.3-4.96-1.63-1.63L8.6 19.3z" />
    </svg>
  );
}

/**
 * Boutons de téléchargement App Store + Google Play, réutilisables partout
 * (landing /app, bandeaux, pages). Style charte : nuit + lime.
 */
export function StoreBadges({ center = false }: { center?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 rounded-2xl bg-night-950 px-5 py-3 text-cream shadow-card transition-transform hover:-translate-y-0.5"
      >
        <AppleIcon className="h-7 w-7" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide opacity-70">
            Télécharger sur
          </span>
          <span className="block font-display text-base font-bold">l'App Store</span>
        </span>
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 rounded-2xl bg-night-950 px-5 py-3 text-cream shadow-card transition-transform hover:-translate-y-0.5"
      >
        <PlayIcon className="h-6 w-6 text-dawn-400" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide opacity-70">
            Disponible sur
          </span>
          <span className="block font-display text-base font-bold">Google Play</span>
        </span>
      </a>
    </div>
  );
}
