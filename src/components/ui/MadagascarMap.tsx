/**
 * Silhouette stylisée de Madagascar, utilisée comme texture de fond.
 * Hérite de la couleur du texte (`currentColor`) pour s'intégrer à la
 * charte : place-la dans un conteneur `text-dawn-400/10`, `text-spirit-500/10`, etc.
 */
export function MadagascarMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 560"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M150 8 C175 30 190 70 198 120 C206 175 214 235 212 300 C210 360 200 415 182 465 C168 505 152 535 138 552 C128 540 118 520 108 495 C92 455 78 405 70 350 C62 295 58 240 64 185 C70 130 88 75 115 40 C128 22 140 12 150 8 Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M150 8 C175 30 190 70 198 120 C206 175 214 235 212 300 C210 360 200 415 182 465 C168 505 152 535 138 552 C128 540 118 520 108 495 C92 455 78 405 70 350 C62 295 58 240 64 185 C70 130 88 75 115 40 C128 22 140 12 150 8 Z"
        stroke="currentColor"
        strokeOpacity="0.9"
        strokeWidth="2.5"
      />
    </svg>
  );
}
