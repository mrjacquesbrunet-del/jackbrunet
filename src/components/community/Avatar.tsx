import { initials } from "@/components/community/useAuth";
import { STREAK_BADGE_MIN } from "@/lib/spiritual";

/**
 * Avatar rond d'un membre.
 * - `badge` (profiles.badge_tier) → anneau DORÉ premium : la personne porte
 *   au moins un badge de récompense.
 * - `streak` ≥ 7 → petite flamme en bas à droite (anneau orange si pas de
 *   badge) : la fidélité se voit.
 */
export function Avatar({
  pseudo,
  url,
  size = 40,
  streak,
  badge,
}: {
  pseudo?: string | null;
  url?: string | null;
  size?: number;
  streak?: number | null;
  badge?: string | null;
}) {
  const hot = (streak ?? 0) >= STREAK_BADGE_MIN;
  const gold = !!badge;

  const core = url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={pseudo ?? ""}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-dawn-400 to-spirit-500 font-bold text-night-950"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(pseudo)}
    </span>
  );

  if (!hot && !gold) return core;

  const ring = gold
    ? "linear-gradient(135deg,#fde68a,#f59e0b 45%,#b45309 80%,#fcd34d)"
    : "linear-gradient(135deg,#fbbf24,#f97316,#ef4444)";
  const badgeSize = Math.max(14, Math.round(size * 0.42));

  return (
    <span
      className="relative inline-flex shrink-0"
      title={gold ? "Porte des badges de récompense" : `Série de ${streak} jours`}
    >
      <span
        className="rounded-full"
        style={{
          padding: Math.max(2, Math.round(size * 0.05)),
          background: ring,
          ...(gold ? { boxShadow: "0 0 10px rgba(245,158,11,.45)" } : {}),
        }}
      >
        {core}
      </span>
      {hot ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full text-white ring-2 ring-white"
          style={{ width: badgeSize, height: badgeSize, background: "linear-gradient(180deg,#fb923c,#ea580c)" }}
          aria-label={`Série de ${streak} jours`}
        >
          <svg viewBox="0 0 24 24" style={{ width: badgeSize * 0.62, height: badgeSize * 0.62 }} fill="currentColor" aria-hidden>
            <path d="M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}
