import { initials } from "@/components/community/useAuth";
import { STREAK_BADGE_MIN } from "@/lib/spiritual";

/**
 * Avatar rond d'un membre. Si `streak` ≥ 7, un anneau de flamme (dégradé
 * orange) + une petite flamme entourent la photo : la fidélité se voit.
 */
export function Avatar({
  pseudo,
  url,
  size = 40,
  streak,
}: {
  pseudo?: string | null;
  url?: string | null;
  size?: number;
  streak?: number | null;
}) {
  const hot = (streak ?? 0) >= STREAK_BADGE_MIN;

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

  if (!hot) return core;

  const badge = Math.max(14, Math.round(size * 0.42));
  return (
    <span className="relative inline-flex shrink-0" title={`Série de ${streak} jours`}>
      <span
        className="rounded-full"
        style={{ padding: Math.max(2, Math.round(size * 0.05)), background: "linear-gradient(135deg,#fbbf24,#f97316,#ef4444)" }}
      >
        {core}
      </span>
      <span
        className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full text-white ring-2 ring-white"
        style={{ width: badge, height: badge, background: "linear-gradient(180deg,#fb923c,#ea580c)" }}
        aria-label={`Série de ${streak} jours`}
      >
        <svg viewBox="0 0 24 24" style={{ width: badge * 0.62, height: badge * 0.62 }} fill="currentColor" aria-hidden>
          <path d="M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z" />
        </svg>
      </span>
    </span>
  );
}
