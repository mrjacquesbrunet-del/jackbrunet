"use client";

import { useEffect, useState } from "react";
import {
  fetchProfileBadges,
  localSpiritualStats,
  HONOR_LABELS,
  BADGE_HOW_TO,
  type ProfileBadges,
  type BadgeKind,
  type BadgeTier,
  type BadgeState,
  type HonorKind,
} from "@/lib/badges";

/** Comment remporter chaque TITRE (affiché quand on touche le médaillon). */
const HONOR_HOW: Record<HonorKind, string> = {
  champion_semaine:
    "Termine n°1 de la ligue de la semaine, tous jeux confondus (points cumulés du lundi au dimanche). Le titre est remis en jeu chaque lundi — tu peux le remporter plusieurs fois (×N).",
  intercesseur_semaine:
    "Sois le membre qui a donné le plus de « Je prie » sur les 7 derniers jours. Décerné chaque dimanche soir, remis en jeu chaque semaine.",
  intercesseur_mois:
    "Sois le plus grand intercesseur des 30 derniers jours. Décerné le 1er de chaque mois.",
};

/* ---------- Titres à répétition (« ×N ») ---------- */

const HONOR_META: Record<HonorKind, { ring: string; color: string; icon: "crown" | "pray" }> = {
  champion_semaine: { ring: "bdg-champ", color: "#FCD34D", icon: "crown" },
  intercesseur_semaine: { ring: "bdg-interw", color: "#CAF000", icon: "pray" },
  intercesseur_mois: { ring: "bdg-interm", color: "#c7d2fe", icon: "pray" },
};

const HONOR_ORDER: HonorKind[] = ["champion_semaine", "intercesseur_semaine", "intercesseur_mois"];

function HonorIcon({ icon, color, size = 20 }: { icon: "crown" | "pray"; color: string; size?: number }) {
  const d =
    icon === "crown"
      ? "M4 18h16M5 16l-1-8 5 3 3-6 3 6 5-3-1 8z"
      : ICON_PATHS.intercesseur;
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
      <path d={d} />
    </svg>
  );
}

/** Médaillon d'un TITRE, avec son anneau coloré et le compteur ×N. */
function HonorMedallion({
  kind,
  count,
  small = false,
  onClick,
}: {
  kind: HonorKind;
  count: number;
  small?: boolean;
  onClick?: () => void;
}) {
  const meta = HONOR_META[kind];
  const won = count > 0;
  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={onClick}
        title={`${HONOR_LABELS[kind]}${won ? ` ×${count}` : ""}`}
        aria-label={`${HONOR_LABELS[kind]}${won ? ` remporté ${count} fois` : ""}`}
        className={`bdg bdg-in ${small ? "bdg-sm" : ""} ${won ? meta.ring : "bdg-lock"} transition-transform active:scale-95`}
      >
        <span className="bdg-core">
          <HonorIcon icon={meta.icon} color={won ? meta.color : "rgba(243,243,237,.35)"} size={small ? 16 : 20} />
        </span>
      </button>
      {won ? <span className="bdg-count">×{count}</span> : null}
    </span>
  );
}

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
/* Anneaux des TITRES (couleurs modernes, un thème par titre) */
.bdg-champ{background:conic-gradient(from 210deg,#b45309,#fde68a 25%,#f97316 55%,#ef4444 80%,#b45309)}
.bdg-interw{background:conic-gradient(from 210deg,#5b7300,#e9ffa1 25%,#CAF000 55%,#86a800 80%,#5b7300)}
.bdg-interm{background:conic-gradient(from 210deg,#3730a3,#c7d2fe 25%,#818cf8 55%,#6366f1 80%,#3730a3)}
.bdg-count{position:absolute;right:-6px;bottom:-4px;min-width:24px;height:24px;padding:0 5px;border-radius:9999px;display:grid;place-items:center;background:linear-gradient(180deg,#fcd34d,#f59e0b);color:#4a2600;font-weight:900;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,.4)}
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
  // — Prière —
  scrolleur: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM12 15V9m0 0-2.5 2.5M12 9l2.5 2.5",
  voix: "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4",
  coeur:
    "M12 20s-7-4.5-9-9c-1.4-3 .4-6 3.4-6 1.8 0 3 1 3.6 2 .6-1 1.8-2 3.6-2 3 0 4.8 3 3.4 6-2 4.5-9 9-9 9zM7.5 11h2l1.3-2 2 3.5 1.2-1.5h2.5",
  premier: "M5 21V4m0 1h11l-2.5 3.5L16 12H5",
  // — Temps avec Jésus —
  levetot: "M12 4v3M5.6 7.6 7.7 9.7M18.4 7.6l-2.1 2.1M4 15h16M7 15a5 5 0 0 1 10 0M6 19h12",
  enracine:
    "M12 3a5 5 0 0 1 5 5c0 2.6-2.2 4.2-5 4.2S7 10.6 7 8a5 5 0 0 1 5-5zM12 12.2V18m0 0c0 2-1.5 3-3.5 3M12 18c0 2 1.5 3 3.5 3",
  ecoute:
    "M4 14a8 8 0 0 1 16 0M4 14v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2zM20 14v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z",
  // — La Parole —
  scribe: "M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1zM13 8l3 3",
  surligneur: "M9 15l-4 4H3v-2l4-4m2 2 8.5-8.5a2 2 0 0 0-3-3L8 12m1 3-3-3M14 20h7",
  // — Jeux —
  duelliste: "M3 3l8 8M3 3v3M3 3h3M21 3l-8 8M21 3v3M21 3h-3M6 14l4 4M18 14l-4 4M5 21l3-3M19 21l-3-3",
  invincible: "M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6zM9 12l2 2 4-4",
  sansfaute: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 12.5l2.5 2.5 4.5-5",
  eclair: "M13 2 5 13h5l-1 9 8-11h-5z",
  marathonien: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 13l2 2 4-4",
  defi: "M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM9 12l-2 9 5-3 5 3-2-9",
  demineur: "M12 8a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 8V5m0 0h-2m2 0h2M16.5 9.5 18 8M7.5 9.5 6 8",
  maitre_quiz: "M3 9l9-4 9 4-9 4zM7 11v4c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-4",
  maitre_vf: "M12 4v16M8 20h8M6 7h12M6 7l-2.5 5a3 3 0 0 0 5 0zM18 7l-2.5 5a3 3 0 0 0 5 0z",
  maitre_qsj:
    "M12 3C7 3 3 6 3 11c0 4 3 6 4 8 .5 1 1.5 2 5 2s4.5-1 5-2c1-2 4-4 4-8 0-5-4-8-9-8zM8.5 11h.01M15.5 11h.01M9 15c1 1 5 1 6 0",
  millionnaire: "M6 3h12l3 5-9 13L3 8zM3 8h18M9 3l-1 5M15 3l1 5",
  enchaineur:
    "M9 15l6-6M8.5 8.5 10 7a3.5 3.5 0 0 1 5 5l-1.5 1.5M15.5 15.5 14 17a3.5 3.5 0 0 1-5-5l1.5-1.5",
  limier: "M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zM16 16l5 5",
  historien:
    "M6 3h12M6 21h12M8 3v3.5c0 2 1.6 3.2 4 5.5-2.4 2.3-4 3.5-4 5.5V21M16 3v3.5c0 2-1.6 3.2-4 5.5 2.4 2.3 4 3.5 4 5.5V21",
  motjuste: "M4 7h16M4 12h5m4 0h7M4 17h16",
  frondeur: "M12 12V21M12 12L7 5M12 12l5-7M7 5c1.5-1 3.5-1 5 0 1.5-1 3.5-1 5 0",
  tireur: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  // — Arène & défis —
  lanceur: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM13 7l-4 6h3l-1 4 4-6h-3z",
  assidu:
    "M6 9h4M8 7v4M15 8h.01M17 11h.01M7 5h10a4 4 0 0 1 4 4v5a3 3 0 0 1-5.4 1.8L14 14h-4l-1.6 1.8A3 3 0 0 1 3 14V9a4 4 0 0 1 4-4z",
  missionnaire: "M9 6h12M9 12h12M9 18h12M4 5l1 1 2-2M4 11l1 1 2-2M4 17l1 1 2-2",
  etoile:
    "M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6zM12 8l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z",
  // — Communauté —
  ambassadeur: "M21 3 3 10.5l7 2.5M21 3l-5 18-6-8M21 3 10 13",
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
  const hasHonors = Object.values(data.honors ?? {}).some((n) => (n ?? 0) > 0);
  const empty = earned.length === 0 && !data.weeklyTop && !hasHonors;
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
            title="Intercesseur de la semaine (en cours)"
            onClick={() => setOpen(true)}
          />
        ) : null}
        {HONOR_ORDER.filter((k) => (data.honors?.[k] ?? 0) > 0).map((k) => (
          <HonorMedallion
            key={k}
            kind={k}
            count={data.honors[k] ?? 0}
            small={compact}
            onClick={() => setOpen(true)}
          />
        ))}
        {(compact ? earned.slice(0, 6) : earned).map((s, i) => (
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
        {compact && earned.length > 6 ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Voir les ${earned.length} badges`}
            className="grid h-[38px] shrink-0 place-items-center rounded-full bg-white/10 px-2.5 text-[11px] font-black text-cream/80"
          >
            +{earned.length - 6}
          </button>
        ) : null}
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

/**
 * Vitrine ouvrable depuis n'importe où (accueil des jeux, etc.) : charge les
 * accomplissements du membre connecté puis affiche la vitrine complète.
 */
export function AchievementsOverlay({
  userId,
  streakDays,
  self = false,
  onClose,
}: {
  userId: string;
  streakDays?: number | null;
  /** Mon propre profil : compteurs locaux frais ; sinon profiles.stats. */
  self?: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<ProfileBadges | null>(null);
  useEffect(() => {
    let alive = true;
    fetchProfileBadges(userId, streakDays, self ? localSpiritualStats() : undefined).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [userId, streakDays, self]);

  if (!data) {
    return (
      <div className="fixed inset-0 z-[110] grid place-items-center bg-night-950/95 text-cream backdrop-blur-sm">
        <style>{BDG_CSS}</style>
        <p className="text-sm text-cream/55">Chargement des accomplissements…</p>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream/80">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }
  return <BadgesVitrine data={data} onClose={onClose} />;
}

/** Vitrine façon « Performances » : grille de médaillons (verrouillés en
 * grisé), sections par domaine, détail + progression du badge touché. */
function BadgesVitrine({ data, onClose }: { data: ProfileBadges; onClose: () => void }) {
  const [sel, setSel] = useState<BadgeState | null>(null);
  const [selHonor, setSelHonor] = useState<HonorKind | null>(null);

  const SECTIONS: { title: string; kinds: BadgeKind[] }[] = [
    { title: "Prière", kinds: ["intercesseur", "scrolleur", "voix", "coeur", "premier"] },
    { title: "Temps avec Jésus", kinds: ["fidele", "meditant", "levetot", "enracine", "ecoute"] },
    { title: "La Parole", kinds: ["expert", "memorisateur", "lecteur", "scribe", "surligneur"] },
    {
      title: "Jeux",
      kinds: [
        "sansfaute",
        "eclair",
        "demineur",
        "millionnaire",
        "enchaineur",
        "limier",
        "historien",
        "motjuste",
        "frondeur",
        "tireur",
        "maitre_quiz",
        "maitre_vf",
        "maitre_qsj",
      ],
    },
    {
      title: "Arène & défis",
      kinds: ["duelliste", "invincible", "lanceur", "defi", "marathonien", "assidu", "missionnaire", "etoile"],
    },
    { title: "Communauté", kinds: ["encourageur", "ambassadeur"] },
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

        {/* TITRES à répétition : remportés ×N, remis en jeu chaque période */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-[11px] font-black uppercase tracking-[0.22em] text-cream/45">Titres</p>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-4">
            {HONOR_ORDER.map((k) => {
              const n = data.honors?.[k] ?? 0;
              const selected = selHonor === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setSel(null);
                    setSelHonor(selected ? null : k);
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center transition-colors ${selected ? "bg-white/[0.07]" : ""}`}
                >
                  <span className={n > 0 ? "" : "opacity-45 grayscale"}>
                    <HonorMedallion kind={k} count={n} />
                  </span>
                  <span className={`text-[11px] font-bold leading-tight ${n > 0 ? "text-cream" : "text-cream/45"}`}>
                    {HONOR_LABELS[k]}
                  </span>
                  <span className={`text-[10px] font-semibold ${n > 0 ? "text-dawn-300" : "text-cream/35"}`}>
                    {n > 0 ? `Remporté ×${n}` : "À remporter"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

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
                    onClick={() => {
                      setSelHonor(null);
                      setSel(selected ? null : s);
                    }}
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

        <p className="text-center text-xs text-cream/40">
          Touche un badge pour voir comment l&apos;obtenir et ta progression.
        </p>
        {/* Espace pour que le volet fixe ne recouvre pas les derniers badges */}
        {sel || selHonor ? <div className="h-40" /> : null}
      </div>

      {/* Volet fixe en bas : comment obtenir le badge/titre touché */}
      {selHonor || sel ? (
        <div
          className="fixed inset-x-0 bottom-0 z-10 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
          style={{ animation: "bdg-in .25s ease-out both" }}
        >
        {selHonor ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-night-900 p-4 shadow-2xl">
            <p className="flex items-baseline justify-between gap-2 text-sm font-bold">
              {HONOR_LABELS[selHonor]}
              <span className={`text-[11px] font-semibold ${(data.honors?.[selHonor] ?? 0) > 0 ? "text-dawn-300" : "text-cream/40"}`}>
                {(data.honors?.[selHonor] ?? 0) > 0 ? `Remporté ×${data.honors?.[selHonor]}` : "À remporter"}
              </span>
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-cream/65">{HONOR_HOW[selHonor]}</p>
          </div>
        ) : sel ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-night-900 p-4 shadow-2xl">
            <p className="flex items-baseline justify-between gap-2 text-sm font-bold">
              {sel.label}
              <span className={`text-[11px] font-semibold ${sel.tier ? "text-dawn-300" : "text-cream/40"}`}>
                {sel.tier ? TIER_LABEL[sel.tier] : "À débloquer"}
              </span>
            </p>
            {/* Comment l'obtenir — la clé pour les badges pas encore gagnés */}
            <p className="mt-1.5 text-xs leading-relaxed text-cream/65">
              {sel.tier ? BADGE_HOW_TO[sel.kind] : `Comment l'obtenir : ${BADGE_HOW_TO[sel.kind]}`}
            </p>
            <p className="mt-2 text-xs font-semibold text-cream/55">
              Ta progression : {sel.count.toLocaleString("fr-FR")} {sel.detail}
              {sel.next ? ` · prochain palier à ${sel.next.toLocaleString("fr-FR")}` : " · palier maximum atteint"}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-dawn-300 to-dawn-500 transition-[width]"
                style={{ width: `${sel.next ? Math.min(100, Math.round((sel.count / sel.next) * 100)) : 100}%` }}
              />
            </div>
          </div>
        ) : null}
        </div>
      ) : null}
    </div>
  );
}
