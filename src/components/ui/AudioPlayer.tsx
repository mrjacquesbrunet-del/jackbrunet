/**
 * Lecteur audio simple (voix clonée). Affiche un libellé + le lecteur natif.
 * S'utilise uniquement quand un fichier audio existe pour le contenu.
 */
export function AudioPlayer({ src, label = "Écouter" }: { src: string; label?: string }) {
  return (
    <div className="rounded-2xl border border-night-900/10 bg-night-900/[0.03] p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-spirit-700">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
        </svg>
        {label}
      </p>
      <audio controls preload="none" src={src} className="w-full">
        Ton navigateur ne peut pas lire l'audio.
      </audio>
    </div>
  );
}
