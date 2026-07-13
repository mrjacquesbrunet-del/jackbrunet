/** Badge « Modérateur » dans la charte (bouclier lime sur olive). */
export function ModeratorBadge({ className }: { className?: string }) {
  return (
    <span
      title="Modérateur de la communauté"
      className={`inline-flex items-center gap-1 rounded-full border border-dawn-400/35 bg-dawn-400/15 px-2.5 py-0.5 text-[11px] font-bold text-dawn-300 ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
        <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.4 12l1.9 1.9L15 9.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Modérateur
    </span>
  );
}
