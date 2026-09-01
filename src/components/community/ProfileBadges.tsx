"use client";

import { useEffect, useState } from "react";
import {
  fetchProfileBadges,
  localSpiritualStats,
  type ProfileBadges,
  type BadgeKind,
  type BadgeTier,
  type BadgeState,
} from "@/lib/badges";

/**
 * Médaillons « premium » des badges, affichés SUR la photo de profil :
 * anneau métal (bronze / argent / or) en dégradé conique, cœur nuit, icône en
 * trait, reflet qui balaie. Le badge « Intercesseur de la semaine » a un
 * anneau doré qui pulse. Un toucher ouvre la vitrine avec la progression.
 */

const BDG_CSS = `
.bdg{position:relative;width:46px;height:46px;border-radius:9999px;padding:3px;display:grid;place-items:center;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.35)}
.bdg-sm{width:38px;height:38px;padding:2.5px}
.bdg-bronze{background:conic-gradient(from 210deg,#8a5a2b,#e0a56b 30%,#5f3d1c 55%,#c98d4f 80%,#8a5a2b)}
.bdg-argent{background:conic-gradient(from 210deg,#9ca3af,#f3f4f6 30%,#6b7280 55%,#e5e7eb 80%,#9ca3af)}
.bdg-or{background:conic-gradient(from 210deg,#b45309,#fde68a 30%,#d97706 55%,#fcd34d 80%,#b45309)}
.bdg-lock{background:linear-gradient(160deg,#4a4a48,#2c2c2b)}
.bdg-core{width:100%;height:100%;border-radius:9999px;background:radial-gradient(130% 130% at 30% 20%,#30302F,#0C0C0B);display:grid;place-items:center}
.bdg::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.5) 50%,transparent 58%);transform:translateX(-70%);animation:bdg-shine 4.2s ease-in-out infinite}
.bdg-lock::after{display:none}
@keyframes bdg-shine{0%,55%{transform:translateX(-70%)}75%,100%{transform:translateX(70%)}}
@keyframes bdg-halo{0%,100%{box-shadow:0 2px 10px rgba(0,0,0,.35),0 0 12px rgba(252,211,77,.5)}50%{box-shadow:0 2px 10px rgba(0,0,0,.35),0 0 26px rgba(252,211,77,.9)}}
.bdg-hebdo{animation:bdg-halo 2.4s ease-in-out infinite}
@keyframes bdg-in{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
.bdg-in{animation:bdg-in .45s cubic-bezier(.2,.8,.3,1) both}
`;

const ICON_PATHS: Record<BadgeKind | "hebdo", string> = {
  intercesseur:
    "M12 3c-1 2-1 4 0 6m0 0c1-2 1-4 0-6M7 21l1.5-7.5a3.5 3.5 0 0 1 7 0L17 21",
  hebdo:
    "M12 3c-1 2-1 4 0 6m0 0c1-2 1-4 0-6M7 21l1.5-7.5a3.5 3.5 0 0 1 7 0L17 21",
  fidele:
    "M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z",
  encourageur:
    "M21 12a8 8 0 0 1-8 8H5.6L3 21.4V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z",
  expert:
    "M7 4h10v3a5 5 0 0 1-10 0zM7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4M12 12v4m-3 5h6m-3-5v5",
  meditant: "M12 3v2M5.6 6.6 7 8M18.4 6.6 17 8M4 20h16M6.5 20a5.5 5.5 0 0 1 11 0",
  memorisateur:
    "M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.3 1 2.1h5c0-.8.3-1.6 1-2.1A6 6 0 0 0 12 3zM10 19h4M10.8 21.5h2.4",
  lecteur:
    "M12 6c-2-1.5-4.5-2-7-2v14c2.5 0 5 .5 7 2 2-1.5 4.5-2 7-2V4c-2.5 0-5 .5-7 2zM12 6v14",
};

const TIER_COLOR: Record<BadgeTier, string> = {
  bronze: "#e0a56b",
  argent: "#e5e7eb",
  or: "#FCD34D",
};

const TIER_LABEL: Record<BadgeTier, string> = { bronze: "Bronze", argent: "Argent", or: "Or" };

function BadgeIcon({ kind, color, size = 20 }: { kind: BadgeKind | "hebdo"; color: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: size, height: size, color }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={ICON_PATHS[kind]} />
    </svg>
  );
}

function Medallion({
  kind,
  tier,
  hebdo = false,
  small = false,
  delay = 0,
  onClick,
  title,
}: {
  kind: BadgeKind | "hebdo";
  tier: BadgeTier | null;
  hebdo?: boolean;
  small?: boolean;
  delay?: number;
  onClick?: () => void;
  title?: string;
}) {
  const ring = hebdo ? "bdg-or bdg-hebdo" : tier ? `bdg-${tier}` : "bdg-lock";
  const color = hebdo ? TIER_COLOR.or : tier ? TIER_COLOR[tier] : "rgba(243,243,237,.35)";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`bdg bdg-in ${small ? "bdg-sm" : ""} ${ring} shrink-0 transition-transform active:scale-95`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="bdg-core">
        <BadgeIcon kind={kind} color={color} size={small ? 16 : 20} />
      </span>
    </button>
  );
}

export function ProfileBadgesRow({
  userId,
  streakDays,
  compact = false,
  self = false,
}: {
  userId: string;
  streakDays?: number | null;
  /** Version discrète : petits médaillons alignés à gauche (rangée d'icônes). */
  compact?: boolean;
  /** Mon propre profil : compteurs locaux frais (méditations, versets…). */
  self?: boolean;
}) {
  const [data, setData] = useState<ProfileBadges | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchProfileBadges(userId, streakDays, self ? localSpiritualStats() : undefined).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [userId, streakDays, self]);

  const earned = data?.states.filter((s) => s.tier) ?? [];
  if (!data) return null;
  const empty = earned.length === 0 && !data.weeklyTop;
  // Profil d'un autre sans badge : rien. Sur SON profil (compact), on montre
  // quand même un médaillon grisé qui ouvre la vitrine des accomplissements.
  if (empty && !(compact && self)) return null;

  return (
    <>
      <style>{BDG_CSS}</style>
      <div
        className={
          compact
            ? "mr-auto flex min-w-0 flex-wrap items-center gap-1.5"
            : "mt-3 flex flex-wrap items-center justify-center gap-2.5"
        }
      >
        {data.weeklyTop ? (
          <Medallion
            kind="hebdo"
            tier="or"
            hebdo
            small={compact}
            title="Intercesseur de la semaine"
            onClick={() => setOpen(true)}
          />
        ) : null}
        {earned.map((s, i) => (
          <Medallion
            key={s.kind}
            kind={s.kind}
            tier={s.tier}
            small={compact}
            delay={0.08 * (i + 1)}
            title={`${s.label} ${s.tier ? TIER_LABEL[s.tier] : ""}`}
            onClick={() => setOpen(true)}
          />
        ))}
        {empty ? (
          <span className="opacity-60">
            <Medallion kind="expert" tier={null} small title="Tes accomplissements" onClick={() => setOpen(true)} />
          </span>
        ) : null}
      </div>

      {open ? <BadgesVitrine data={data} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** Vitrine façon « Performances » : grille de médaillons (verrouillés en
 * grisé), sections par domaine, détail + progression du badge touché. */
function BadgesVitrine({ data, onClose }: { data: ProfileBadges; onClose: () => void }) {
  const [sel, setSel] = useState<BadgeState | null>(null);

  const SECTIONS: { title: string; kinds: BadgeKind[] }[] = [
    { title: "Prière", kinds: ["intercesseur", "encourageur"] },
    { title: "Fidélité", kinds: ["fidele", "meditant"] },
    { title: "La Parole", kinds: ["lecteur", "memorisateur", "expert"] },
  ];
  const byKind = Object.fromEntries(data.states.map((s) => [s.kind, s])) as Record<BadgeKind, BadgeState>;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-night-950/95 text-cream backdrop-blur-sm" role="dialog" aria-modal>
      <style>{BDG_CSS}</style>

      {/* En-tête */}
      <div className="flex items-center justify-between px-5 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <p className="font-display text-xl font-extrabold tracking-wide">Accomplissements</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream/80"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        {/* Badge tournant de la semaine */}
        {data.weeklyTop ? (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-dawn-400/40 bg-dawn-400/10 p-3">
            <Medallion kind="hebdo" tier="or" hebdo small title="Intercesseur de la semaine" />
            <div className="min-w-0">
              <p className="text-sm font-bold">Intercesseur de la semaine</p>
              <p className="text-xs text-cream/60">N°1 de la prière sur 7 jours — remis en jeu chaque lundi.</p>
            </div>
          </div>
        ) : null}

        {SECTIONS.map(({ title, kinds }) => (
          <div key={title} className="mb-6">
            <div className="flex items-center gap-3">
              <p className="shrink-0 text-[11px] font-black uppercase tracking-[0.22em] text-cream/45">{title}</p>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4">
              {kinds.map((k) => {
                const s = byKind[k];
                if (!s) return null;
                const selected = sel?.kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSel(selected ? null : s)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-colors ${selected ? "bg-white/[0.07]" : ""}`}
                  >
                    <span className={s.tier ? "" : "opacity-45 grayscale"}>
                      <Medallion kind={k} tier={s.tier} title={s.label} />
                    </span>
                    <span className={`text-center text-[11px] font-bold leading-tight ${s.tier ? "text-cream" : "text-cream/45"}`}>
                      {s.label}
                    </span>
                    <span className={`text-[10px] font-semibold ${s.tier ? "text-dawn-300" : "text-cream/35"}`}>
                      {s.tier ? TIER_LABEL[s.tier] : "À débloquer"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Détail du badge touché : compteur + progression vers le palier suivant */}
        {sel ? (
          <div className="rounded-2xl border border-white/10 bg-night-900 p-4">
            <p className="flex items-baseline justify-between gap-2 text-sm font-bold">
              {sel.label}
              <span className={`text-[11px] font-semibold ${sel.tier ? "text-dawn-300" : "text-cream/40"}`}>
                {sel.tier ? TIER_LABEL[sel.tier] : "À débloquer"}
              </span>
            </p>
            <p className="mt-1 text-xs text-cream/60">
              {sel.count.toLocaleString("fr-FR")} {sel.detail}
              {sel.next ? ` · prochain palier à ${sel.next.toLocaleString("fr-FR")}` : " · palier maximum atteint"}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-dawn-300 to-dawn-500 transition-[width]"
                style={{ width: `${sel.next ? Math.min(100, Math.round((sel.count / sel.next) * 100)) : 100}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-cream/40">Touche un badge pour voir ta progression.</p>
        )}
      </div>
    </div>
  );
}
