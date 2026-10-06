/**
 * Badge exclusif des Bâtisseurs (membres qui soutiennent l'app).
 * - `compact` : pastille ronde (à côté d'un pseudo dans les listes) ;
 * - sinon : pastille avec le mot « Bâtisseur ».
 */
export function IconeBatisseur({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={2.2} aria-hidden>
      {/* Mur de briques */}
      <path d="M3 6h18v12H3zM3 12h18M9 6v6M15 12v6" strokeLinejoin="round" />
    </svg>
  );
}

export function BatisseurBadge({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <span
        title="Bâtisseur : soutient RHEMA"
        className={`inline-grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#CAF000] text-[#0A0B07] ${className}`}
      >
        <IconeBatisseur className="h-2.5 w-2.5" />
      </span>
    );
  }
  return (
    <span
      title="Bâtisseur : soutient RHEMA"
      className={`inline-flex items-center gap-1 rounded-full bg-[#CAF000] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#0A0B07] ${className}`}
    >
      <IconeBatisseur />
      Bâtisseur
    </span>
  );
}
