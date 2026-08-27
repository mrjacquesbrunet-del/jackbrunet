"use client";

/**
 * Interface « arcade » partagée par tous les jeux (style maquette violet
 * « millionnaire »). Garantit le même design / style / animation d'un jeu à
 * l'autre : fond dégradé violet, en-tête profil + niveau/XP + gemmes, cartes,
 * réponses A/B/C/D, jokers, boutons Quitter / Valider.
 */

import { useEffect, type ReactElement, type ReactNode } from "react";

/* ---------------- Icônes (trait) ---------------- */
const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IcoUser = S("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0");
export const IcoGem = S("M6 3h12l3 5-9 13L3 8zM3 8h18M9 3l-1 5M15 3l1 5");
export const IcoArrowL = S("M19 12H5M11 6l-6 6 6 6");
export const IcoPlus = S("M12 6v12M6 12h12");
export const IcoClock = S("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v4l3 2");
export const IcoFlag = S("M5 21V4M5 4h11l-1.6 3.5L16 11H5");
export const IcoBulb = S("M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10 3 3 0 0 0-1 2H9a3 3 0 0 0-1-2 6 6 0 0 1 4-10z");
export const IcoPeople = S("M17 20v-1a4 4 0 0 0-3-3.9M7 20v-1a4 4 0 0 1 3-3.9M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6");
export const IcoCheck = S("M5 12l4.5 4.5L19 7");
export const IcoCross = S("M6 6l12 12M18 6L6 18");
export const IcoCrown = S("M4 8l4 3.5L12 5l4 6.5L20 8l-1.4 10H5.4z");
export const IcoLock = S("M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5zM12 14v3");
export const IcoPlay = S("M8 5l11 7-11 7z");
export const IcoTrophy = S("M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4");
export const IcoStar = S("M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z");
export const IcoRefresh = S("M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4");

/* ---------------- Thème « millionnaire » violet ---------------- */
export const ARCADE_CSS = `
.qm{background:
  radial-gradient(120% 55% at 50% -5%, #6D28D9 0%, transparent 60%),
  radial-gradient(70% 45% at -5% 42%, rgba(236,72,153,.4) 0%, transparent 55%),
  radial-gradient(70% 45% at 105% 42%, rgba(236,72,153,.4) 0%, transparent 55%),
  linear-gradient(180deg,#4C1D95 0%,#5B21B6 45%,#7E22CE 100%);
  background-attachment:fixed;}
.qm-back{display:grid;place-items:center;width:42px;height:42px;border-radius:9999px;background:rgba(255,255,255,.12);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 2px 6px rgba(0,0,0,.25)}
.qm-back:active{transform:scale(.94)}
.qm-niv{display:inline-block;padding:2px 8px;border-radius:9999px;background:linear-gradient(180deg,#8B5CF6,#6D28D9);font-family:var(--font-game);font-weight:800;font-size:10px;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
.qm-gem{display:inline-flex;align-items:center;gap:6px;padding:5px 5px 5px 12px;border-radius:9999px;background:linear-gradient(180deg,rgba(30,18,66,.92),rgba(20,10,48,.96));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 2px 8px rgba(0,0,0,.4);font-family:var(--font-game);font-weight:900;font-size:14px;color:#fff}
.qm-gem-plus{display:grid;place-items:center;width:26px;height:26px;border-radius:9999px;background:linear-gradient(180deg,#A855F7,#7C3AED);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}
.qm-xpbar{height:8px;border-radius:9999px;background:rgba(0,0,0,.32);overflow:hidden}
.qm-xpbar > i{display:block;height:100%;border-radius:9999px;background:linear-gradient(90deg,#FCD34D,#F59E0B)}
.qm-card{background:linear-gradient(180deg,rgba(49,32,110,.72),rgba(29,18,64,.9));border:1px solid rgba(167,139,250,.24);border-radius:24px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 14px 34px rgba(23,10,54,.5)}
.qm-pill-o{display:inline-block;padding:4px 12px;border-radius:9999px;background:linear-gradient(180deg,#FBBF24,#F59E0B);font-family:var(--font-game);font-weight:900;font-size:11px;letter-spacing:.03em;color:#4a2600;box-shadow:inset 0 1px 0 rgba(255,255,255,.45)}
.qm-pill-p{display:inline-block;padding:5px 13px;border-radius:9999px;background:linear-gradient(180deg,#8B5CF6,#6D28D9);font-family:var(--font-game);font-weight:900;font-size:11px;letter-spacing:.03em;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.22)}
.qm-clock{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-game);font-weight:900;font-size:15px;color:#fff}
.qm-timebar{height:6px;border-radius:9999px;background:rgba(0,0,0,.32);overflow:hidden}
.qm-timebar > i{display:block;height:100%;border-radius:9999px;background:linear-gradient(90deg,#FCD34D,#F59E0B)}
.qm-node{display:grid;place-items:center;width:30px;height:30px;border-radius:9999px;font-family:var(--font-game);font-weight:900;font-size:12px;flex:0 0 auto}
.qm-node-done{background:linear-gradient(180deg,#a3e635,#65a30d);color:#183a06;box-shadow:inset 0 1px 0 rgba(255,255,255,.45)}
.qm-node-cur{background:linear-gradient(180deg,#FCD34D,#F59E0B);color:#4a2600;box-shadow:0 0 0 3px rgba(252,211,77,.35),inset 0 1px 0 rgba(255,255,255,.5);animation:qm-pulse 1.2s ease-in-out infinite}
.qm-node-lock{background:rgba(255,255,255,.12);color:rgba(255,255,255,.55)}
.qm-node-crown{background:linear-gradient(180deg,#FDE68A,#F59E0B);color:#4a2600;box-shadow:0 0 12px rgba(252,211,77,.55),inset 0 1px 0 rgba(255,255,255,.5)}
.qm-line{height:3px;flex:1;border-radius:2px;min-width:6px}
@keyframes qm-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
@keyframes qm-optin{0%{transform:translateY(14px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes qm-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
.qm-shake{animation:qm-shake .5s ease-in-out}
.qm-opt{display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;border-radius:16px;font-family:var(--font-game);font-weight:800;font-size:15px;background:linear-gradient(180deg,rgba(76,52,140,.5),rgba(49,32,110,.68));border:1px solid rgba(167,139,250,.28);color:#fff;transition:transform .1s,background .15s,box-shadow .15s}
.qm-opt:active{transform:scale(.99)}
.qm-opt:disabled{cursor:default}
.qm-opt-badge{display:grid;place-items:center;width:34px;height:34px;flex:0 0 auto;border-radius:9999px;background:linear-gradient(180deg,#8B5CF6,#5B21B6);color:#fff;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.28)}
.qm-opt-sel{background:linear-gradient(180deg,#A3E635,#65A30D);border-color:#bef264;color:#18320a;box-shadow:0 0 0 2px rgba(163,230,53,.55),0 8px 18px rgba(101,163,9,.4)}
.qm-opt-sel .qm-opt-badge{background:#fff;color:#3f6212}
.qm-opt-correct{background:linear-gradient(180deg,#22c55e,#15803d);border-color:#4ade80;color:#fff}
.qm-opt-correct .qm-opt-badge{background:#fff;color:#15803d}
.qm-opt-wrong{background:linear-gradient(180deg,#ef4444,#991b1b);border-color:#f87171;color:#fff}
.qm-opt-wrong .qm-opt-badge{background:#fff;color:#991b1b}
.qm-joker{position:relative;border-radius:18px;padding:9px 6px 12px;text-align:center;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 6px 14px rgba(23,10,54,.4)}
.qm-joker:active{transform:translateY(1px)}
.qm-joker:disabled{opacity:.5}
.qm-joker-blue{background:linear-gradient(180deg,#3B82F6,#1D4ED8)}
.qm-joker-gold{background:linear-gradient(180deg,#F59E0B,#D97706)}
.qm-joker-purple{background:linear-gradient(180deg,#A855F7,#7C3AED)}
.qm-joker-lab{display:inline-block;padding:2px 10px;border-radius:9999px;background:rgba(255,255,255,.92);font-family:var(--font-game);font-weight:900;font-size:9px;letter-spacing:.04em}
.qm-joker-blue .qm-joker-lab{color:#1D4ED8}
.qm-joker-gold .qm-joker-lab{color:#B45309}
.qm-joker-purple .qm-joker-lab{color:#6D28D9}
.qm-joker-cnt{display:grid;place-items:center;width:24px;height:24px;margin:5px auto 0;border-radius:9999px;background:rgba(0,0,0,.28);font-family:var(--font-game);font-weight:900;font-size:12px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)}
.qm-quit{display:inline-flex;align-items:center;gap:8px;padding:15px 18px;border-radius:16px;background:linear-gradient(180deg,rgba(30,18,66,.92),rgba(20,10,48,.96));font-family:var(--font-game);font-weight:900;font-size:14px;letter-spacing:.02em;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
.qm-quit:active{transform:translateY(1px)}
.qm-valid{flex:1;border-radius:16px;padding:16px;font-family:var(--font-game);font-weight:900;font-size:17px;letter-spacing:.02em;background:linear-gradient(180deg,#FCD34D,#F59E0B);color:#4a2600;box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 6px 0 #b45309}
.qm-valid:active{transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 3px 0 #b45309}
.qm-valid:disabled{background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,.1));color:rgba(255,255,255,.4);box-shadow:none}
.qm-ghost{border-radius:16px;padding:15px;font-family:var(--font-game);font-weight:900;font-size:15px;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.15)}
.qm-ghost:active{transform:translateY(1px)}
`;

/** Racine plein écran : fond violet + verrou du défilement de fond + CSS injecté. */
export function ArcadeShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const b = document.body;
    const h = document.documentElement;
    const pb = b.style.overflow;
    const ph = h.style.overflow;
    const po = b.style.overscrollBehavior;
    b.style.overflow = "hidden";
    h.style.overflow = "hidden";
    b.style.overscrollBehavior = "none";
    return () => {
      b.style.overflow = pb;
      h.style.overflow = ph;
      b.style.overscrollBehavior = po;
    };
  }, []);
  return (
    <div className="qm fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden text-white [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch]">
      <style dangerouslySetInnerHTML={{ __html: ARCADE_CSS }} />
      <div className="relative mx-auto w-full max-w-md px-4 pb-6 pt-[calc(0.75rem+env(safe-area-inset-top))]">{children}</div>
    </div>
  );
}

/** En-tête commun : retour · profil · niveau/XP · gemmes. */
export function ArcadeHeader({
  name,
  avatarUrl,
  level,
  xpInto,
  xpSpan,
  gems,
  onBack,
}: {
  name: string;
  avatarUrl: string | null;
  level: number;
  xpInto: number;
  xpSpan: number;
  gems: number | string;
  onBack: () => void;
}) {
  const pct = xpSpan > 0 ? Math.round((xpInto / xpSpan) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <button type="button" onClick={onBack} aria-label="Retour" className="qm-back shrink-0">
        <IcoArrowL className="h-5 w-5" />
      </button>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/40" />
      ) : (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/12 text-white/80 ring-2 ring-white/25">
          <IcoUser className="h-7 w-7" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-game text-sm font-extrabold">{name || "Joueur"}</p>
          <span className="qm-niv shrink-0">NIV. {level}</span>
        </div>
        <div className="qm-xpbar mt-1">
          <i style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-0.5 text-right font-game text-[10px] font-bold text-white/70">
          {xpInto} / {xpSpan} <span className="text-amber-300">XP</span>
        </p>
      </div>
      <span className="qm-gem shrink-0">
        <IcoGem className="h-4 w-4 text-fuchsia-300" />
        {gems}
        <span className="qm-gem-plus"><IcoPlus className="h-3.5 w-3.5" /></span>
      </span>
    </div>
  );
}

type OptState = "idle" | "sel" | "correct" | "wrong";

/** Bouton de réponse A/B/C/D (ou pastille d'icône) au style commun. */
export function ArcadeOption({
  badge,
  children,
  state = "idle",
  onClick,
  disabled,
  suffix,
}: {
  badge?: ReactNode;
  children: ReactNode;
  state?: OptState;
  onClick?: () => void;
  disabled?: boolean;
  suffix?: ReactNode;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`qm-opt ${state !== "idle" ? `qm-opt-${state}` : ""}`}>
      {badge !== undefined ? <span className="qm-opt-badge">{badge}</span> : null}
      <span className="flex-1 text-left">{children}</span>
      {suffix}
    </button>
  );
}

/** Boutons bas : Quitter (drapeau) + action principale dorée. */
export function ArcadeActions({
  onQuit,
  action,
}: {
  onQuit: () => void;
  action: ReactNode;
}) {
  return (
    <div className="mt-4 flex items-center gap-2.5">
      <button type="button" onClick={onQuit} className="qm-quit whitespace-nowrap">
        <IcoFlag className="h-4 w-4" /> QUITTER
      </button>
      {action}
    </div>
  );
}
