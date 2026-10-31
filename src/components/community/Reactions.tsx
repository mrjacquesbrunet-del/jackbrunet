"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Réactions façon WhatsApp (commentaires, messages privés) : une barre de 6
 * émojis rapides + « + » qui ouvre tout le choix, et les puces agrégées sous
 * la bulle (❤️ 3, 🙏 2…). Une réaction par personne ; toucher la sienne la
 * retire. Les émojis sont ici un choix explicite de Jack (comme le mur de prière).
 */

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
}: {
  mine: string | null;
  onPick: (emoji: string) => void;
  onClose: () => void;
  className?: string;
  sombre?: boolean;
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

/** Appui long (450 ms, ou clic droit) sur une bulle → ouvre la barre ; double toucher → ❤️. */
export function gesteReaction(ouvrir: () => void, coeur?: () => void) {
  let t: ReturnType<typeof setTimeout> | undefined;
  let dernier = 0;
  return {
    onTouchStart: () => {
      t = setTimeout(() => {
        ouvrir();
        try {
          navigator.vibrate?.(12);
        } catch {
          /* pas de vibration */
        }
      }, 450);
    },
    onTouchEnd: () => {
      clearTimeout(t);
      if (!coeur) return;
      const maintenant = Date.now();
      if (maintenant - dernier < 300) {
        coeur();
        dernier = 0;
      } else dernier = maintenant;
    },
    onTouchMove: () => clearTimeout(t),
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      ouvrir();
    },
    onDoubleClick: coeur,
  };
}
