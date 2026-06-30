/**
 * Jeu d'icônes (trait fin, currentColor) pour l'espace dévotionnel —
 * remplace les emojis pour un rendu plus soigné et cohérent avec la charte.
 */
type P = { className?: string };
const base = "h-full w-full";

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? base}
    >
      {children}
    </svg>
  );
}

export const PlayGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M7 5l12 7-12 7V5z" fill="currentColor" stroke="none" />
  </Svg>
);

export const PauseGlyph = ({ className }: P) => (
  <Svg className={className}>
    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const GiftGlyph = ({ className }: P) => (
  <Svg className={className}>
    <rect x="3.5" y="8.5" width="17" height="5" rx="1" />
    <path d="M5 13.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6.5M12 8.5V21" />
    <path d="M12 8.5S10.5 4 8 4a2.2 2.2 0 0 0 0 4.5h4zM12 8.5S13.5 4 16 4a2.2 2.2 0 0 1 0 4.5h-4z" />
  </Svg>
);

export const StarGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.9l-5.2 2.6.99-5.78-4.21-4.1 5.82-.85z" />
  </Svg>
);

export const MegaphoneGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M4 10v4a1 1 0 0 0 1 1h2l3 4V5L7 9H5a1 1 0 0 0-1 1z" />
    <path d="M14 8.5a4 4 0 0 1 0 7" />
  </Svg>
);

export const PenGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" />
    <path d="M14.5 6.5l3 3" />
  </Svg>
);

export const HandsGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M12 21c-1-2-4-3.5-5.5-5.5C4.5 13 5 10 7 10c1.2 0 1.8.8 2 1.5V6.5a1.5 1.5 0 0 1 3 0" />
    <path d="M12 21c1-2 4-3.5 5.5-5.5C19.5 13 19 10 17 10c-1.2 0-1.8.8-2 1.5V6.5a1.5 1.5 0 0 0-3 0v5" />
  </Svg>
);

export const BookGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M12 6.5C10.5 5 8 4.5 4 4.8v12.5c4-.3 6.5.2 8 1.7 1.5-1.5 4-2 8-1.7V4.8c-4-.3-6.5.2-8 1.7z" />
    <path d="M12 6.5V20" />
  </Svg>
);

export const NoteGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M6 3.5h8.5L19 8v12.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
    <path d="M14 3.5V8h4.5M8.5 13h7M8.5 16.5h7" />
  </Svg>
);

export const BellGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Svg>
);

export const FlameGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.4-2 1-2.8C9.2 9.6 10 11 11 11c1.2 0 1-2.5 1-8z" />
  </Svg>
);

export const HighlighterGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M4 20h6M15 4.5l4.5 4.5-7.5 7.5H7.5V12L15 4.5z" />
  </Svg>
);

export const CopyGlyph = ({ className }: P) => (
  <Svg className={className}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M5.5 15.5H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5h9A1.5 1.5 0 0 1 15.5 5v.5" />
  </Svg>
);

export const BookmarkGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M6 4.5h12v15l-6-3.5-6 3.5v-15z" />
  </Svg>
);

export const BookmarkFilledGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M6 4.5h12v15l-6-3.5-6 3.5v-15z" fill="currentColor" />
  </Svg>
);

export const MusicGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </Svg>
);

export const CheckGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Svg>
);

export const ArrowRightGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const PhoneGlyph = ({ className }: P) => (
  <Svg className={className}>
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path d="M11 18h2" />
  </Svg>
);

export const DownloadGlyph = ({ className }: P) => (
  <Svg className={className}>
    <path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" />
  </Svg>
);
