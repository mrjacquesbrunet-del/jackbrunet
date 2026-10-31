"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Réactions façon WhatsApp (commentaires, messages privés) : une barre de 6
 * émojis rapides + « + » qui ouvre tout le choix, et les puces agrégées sous
 * la bulle (❤️ 3, 🙏 2…). Une réaction par personne ; toucher la sienne la
 * retire. Les émojis sont ici un choix explicite de Jack (comme le mur de prière).
 */

/** Action du menu d'un message (Répondre, Copier, Modifier, Supprimer…). */
export type ActionBulle = { label: string; icone: React.ReactNode; onClick: () => void; danger?: boolean };

export const REACTIONS_RAPIDES = ["❤️", "🙏", "😂", "🙌", "😮", "😢"];

const CATEGORIES: [string, string[]][] = [
  ["Foi", ["🙏", "🕊️", "✝️", "⛪", "📖", "✨", "🔥", "🙌", "💒", "👑", "🌿", "☀️", "⭐", "🌈", "💧", "🕯️"]],
  ["Cœurs", ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "🖤", "❤️‍🔥", "💖", "💕", "💞", "💯", "🫶"]],
  ["Visages", ["😂", "🤣", "😊", "🥰", "😍", "😇", "🙂", "😉", "😎", "🤩", "🥳", "😮", "😯", "🤔", "😢", "😭", "🥹", "😅", "😌", "🤗", "😴", "😬", "🙈", "😱"]],
  ["Gestes", ["👍", "👏", "🙌", "👊", "✊", "🤝", "💪", "👋", "🤲", "👌", "✌️", "🫡", "☝️", "👀"]],
  ["Fête", ["🎉", "🎊", "🎁", "🥂", "🎶", "🎵", "🏆", "🥇", "🌸", "🌻", "🍀", "🎂"]],
];

/** Barre de réactions rapides (au-dessus d'une bulle), avec « + » pour tout le choix. */
export function BarreReactions({
  mine,
  onPick,
  onClose,
  className = "",
  sombre = false,
  actions,
  menuClassName = "",
}: {
  mine: string | null;
  onPick: (emoji: string) => void;
  onClose: () => void;
  className?: string;
  sombre?: boolean;
  /** Menu d'actions sous la barre (façon WhatsApp). */
  actions?: ActionBulle[];
  menuClassName?: string;
}) {
  const [tout, setTout] = useState(false);
  const choisir = (e: string) => {
    setTout(false);
    onPick(e);
  };
  return (
    <>
      <button type="button" aria-label="Fermer" onClick={onClose} className="fixed inset-0 z-40 cursor-default" />
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute z-50 flex items-center gap-0.5 rounded-full border px-1.5 py-1 shadow-xl ${
          sombre ? "border-white/10 bg-night-800" : "border-night-900/10 bg-white"
        } ${className}`}
      >
        {REACTIONS_RAPIDES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => choisir(e)}
            aria-label={`Réagir ${e}`}
            className={`grid h-10 w-10 place-items-center rounded-full text-[22px] transition-transform hover:scale-110 active:scale-90 ${
              mine === e ? "bg-dawn-400/30" : ""
            }`}
          >
            {e}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTout(true)}
          aria-label="Plus d'émojis"
          className={`grid h-9 w-9 place-items-center rounded-full ${sombre ? "bg-white/10 text-cream/80" : "bg-night-900/[0.06] text-night-900/60"}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </motion.div>
      {actions?.length ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          role="menu"
          className={`absolute z-50 min-w-[11rem] overflow-hidden rounded-2xl border shadow-xl ${
            sombre ? "border-white/10 bg-night-800 text-cream" : "border-night-900/10 bg-white text-night-900"
          } ${menuClassName}`}
        >
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              onClick={() => {
                onClose();
                a.onClick();
              }}
              className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-[14px] font-medium ${
                sombre ? "active:bg-white/10" : "active:bg-night-900/[0.05]"
              } ${a.danger ? "text-red-500" : ""}`}
            >
              {a.label}
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current opacity-70" strokeWidth={1.8} aria-hidden>
                {a.icone}
              </svg>
            </button>
          ))}
        </motion.div>
      ) : null}
      <SelecteurEmojis ouvert={tout} mine={mine} onPick={choisir} fermer={() => setTout(false)} />
    </>
  );
}

/** Tout le choix d'émojis, en feuille du bas, classé par thème. */
export function SelecteurEmojis({
  ouvert,
  mine,
  onPick,
  fermer,
}: {
  ouvert: boolean;
  mine: string | null;
  onPick: (emoji: string) => void;
  fermer: () => void;
}) {
  return (
    <AnimatePresence>
      {ouvert ? (
        <motion.div
          className="fixed inset-0 z-[160] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Choisir un émoji"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="Fermer" onClick={fermer} className="absolute inset-0 bg-black/50" />
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="keep-dark relative max-h-[60svh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-night-900 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-cream"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            {CATEGORIES.map(([titre, emojis]) => (
              <div key={titre} className="mb-3">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cream/45">{titre}</p>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((e) => (
                    <button
                      key={titre + e}
                      type="button"
                      onClick={() => onPick(e)}
                      aria-label={`Réagir ${e}`}
                      className={`grid aspect-square place-items-center rounded-xl text-[24px] active:scale-90 ${mine === e ? "bg-dawn-400/25" : "hover:bg-white/[0.06]"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Puces agrégées sous une bulle : chaque émoji et son nombre, le mien surligné. */
export function PucesReactions({
  emojis,
  mine,
  onPick,
  sombre = false,
  className = "",
}: {
  emojis: string[];
  mine: string | null;
  onPick: (emoji: string) => void;
  sombre?: boolean;
  className?: string;
}) {
  if (!emojis.length) return null;
  const compte: Record<string, number> = {};
  for (const e of emojis) compte[e] = (compte[e] ?? 0) + 1;
  const tries = Object.entries(compte).sort((a, b) => b[1] - a[1]);
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tries.map(([e, n]) => (
        <button
          key={e}
          type="button"
          onClick={() => onPick(e)}
          aria-label={mine === e ? `Retirer ma réaction ${e}` : `Réagir ${e}`}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors active:scale-95 ${
            mine === e
              ? "border-dawn-500/60 bg-dawn-400/15"
              : sombre
                ? "border-white/10 bg-white/[0.06]"
                : "border-night-900/10 bg-white hover:border-night-900/25"
          }`}
        >
          <span className="text-[14px] leading-none">{e}</span>
          {n > 1 ? <span className={`font-semibold ${sombre ? "text-cream/60" : "text-night-900/60"}`}>{n}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** Icônes en trait des actions de bulle. */
export const ICONES_BULLE = {
  repondre: <path d="M9 7L4 12l5 5M4 12h11a5 5 0 0 1 5 5v1" strokeLinecap="round" strokeLinejoin="round" />,
  copier: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  modifier: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" strokeLinecap="round" strokeLinejoin="round" />,
  supprimer: <path d="M5 7h14M10 11v6M14 11v6M6.5 7l1 12a2 2 0 0 0 2 1.8h5a2 2 0 0 0 2-1.8l1-12M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" strokeLinecap="round" strokeLinejoin="round" />,
};

/** Petite vibration (Android ; ignorée ailleurs). */
export function vibrer(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* pas de vibration */
  }
}

/** État du geste par bulle : survit aux rendus (un message qui arrive en
 * plein appui long ne casse pas le geste). */
type EtatGeste = { t?: ReturnType<typeof setTimeout>; dernier: number; x0: number; y0: number; dx: number; horizontal: boolean | null };
const ETATS = new WeakMap<EventTarget, EtatGeste>();
function etat(el: EventTarget): EtatGeste {
  let e = ETATS.get(el);
  if (!e) ETATS.set(el, (e = { dernier: 0, x0: 0, y0: 0, dx: 0, horizontal: null }));
  return e;
}

/** Appui long (450 ms, ou clic droit) sur une bulle → ouvre la barre ; double
 * toucher → ❤️ ; glisser vers la droite (option) → répondre, façon WhatsApp. */
export function gesteReaction(ouvrir: () => void, coeur?: () => void, glisser?: () => void) {
  const remettre = (el: HTMLElement) => {
    el.style.transition = "transform 180ms ease-out";
    el.style.transform = "";
  };
  return {
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
      const g = etat(e.currentTarget);
      g.x0 = e.touches[0].clientX;
      g.y0 = e.touches[0].clientY;
      g.dx = 0;
      g.horizontal = null;
      clearTimeout(g.t);
      g.t = setTimeout(() => {
        ouvrir();
        vibrer();
      }, 450);
    },
    onTouchEnd: (e: React.TouchEvent<HTMLElement>) => {
      const g = etat(e.currentTarget);
      clearTimeout(g.t);
      if (glisser && g.horizontal) {
        remettre(e.currentTarget);
        g.horizontal = null;
        if (g.dx > 60) glisser();
        return;
      }
      if (!coeur) return;
      const maintenant = Date.now();
      if (maintenant - g.dernier < 300) {
        coeur();
        g.dernier = 0;
      } else g.dernier = maintenant;
    },
    onTouchMove: (e: React.TouchEvent<HTMLElement>) => {
      const g = etat(e.currentTarget);
      clearTimeout(g.t);
      if (!glisser) return;
      const mx = e.touches[0].clientX - g.x0;
      const my = e.touches[0].clientY - g.y0;
      if (g.horizontal === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) g.horizontal = Math.abs(mx) > Math.abs(my) * 1.4 && mx > 0;
      if (!g.horizontal) return;
      const avant = g.dx;
      g.dx = Math.max(0, Math.min(90, mx));
      if (avant <= 60 && g.dx > 60) vibrer(8);
      e.currentTarget.style.transition = "none";
      e.currentTarget.style.transform = `translateX(${g.dx}px)`;
    },
    onTouchCancel: (e: React.TouchEvent<HTMLElement>) => {
      const g = etat(e.currentTarget);
      clearTimeout(g.t);
      g.horizontal = null;
      remettre(e.currentTarget);
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      ouvrir();
    },
    onDoubleClick: coeur,
  };
}
