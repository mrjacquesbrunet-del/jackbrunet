"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEngagement } from "@/lib/engagement";
import { siteConfig } from "@/config/site";
import {
  FlameGlyph,
  StarGlyph,
  GiftGlyph,
  MegaphoneGlyph,
} from "@/components/ui/DevoIcons";
import {
  FIDELITY_REWARDS,
  AMBASSADOR_REWARD,
  readSeen,
  markSeen,
  hasShared,
  shareApp,
  daysToNext,
  type Reward,
} from "@/lib/rewards";

/** Icône maison pour chaque récompense (cohérent avec la charte, sans emoji). */
function RewardIcon({ id, className }: { id: string; className?: string }) {
  if (id === "d7") return <FlameGlyph className={className} />;
  if (id === "d30") return <StarGlyph className={className} />;
  if (id === "ambassadeur") return <MegaphoneGlyph className={className} />;
  return <GiftGlyph className={className} />;
}

/**
 * « Mes récompenses »: paliers de fidélité débloqués par la série quotidienne
 * (7j / 30j / 100j) + récompense Ambassadeur (partage). Célébration animée à
 * chaque nouveau palier. 100 % local (aucune donnée serveur).
 */
export function Rewards() {
  const eng = useEngagement();
  const [shared, setShared] = useState(false);
  const [celebrate, setCelebrate] = useState<Reward | null>(null);
  const [copied, setCopied] = useState(false);

  // État « partagé » réactif
  useEffect(() => {
    setShared(hasShared());
    const on = () => setShared(hasShared());
    window.addEventListener("jb-rewards", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("jb-rewards", on);
      window.removeEventListener("storage", on);
    };
  }, []);

  // Détecte les nouveaux paliers débloqués → célébration
  useEffect(() => {
    if (!eng.ready) return;
    const unlocked: Reward[] = [
...FIDELITY_REWARDS.filter((r) => eng.best >= r.days),
...(shared? [AMBASSADOR_REWARD]: []),
    ];
    const seen = readSeen();
    const fresh = unlocked.filter((r) =>!seen.includes(r.id));
    if (fresh.length > 0) {
      setCelebrate(fresh[fresh.length - 1]);
      markSeen(unlocked.map((r) => r.id));
    }
  }, [eng.ready, eng.best, shared]);

  async function onShare() {
    const ok = await shareApp(siteConfig.url);
    if (ok) {
      setShared(true);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const toNext = daysToNext(eng.best);

  return (
    <section className="container-x">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-extrabold">
            Mes <span className="text-gradient">récompenses</span>
          </h3>
          <p className="mt-1 text-sm text-night-900/60">
            {eng.ready && toNext > 0
? `Plus que ${toNext} jour${toNext > 1? "s": ""} d'affilée pour ton prochain cadeau`
: "Reviens chaque jour: ta fidélité est récompensée"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FIDELITY_REWARDS.map((r) => {
          const unlocked = eng.ready && eng.best >= r.days;
          const pct = Math.min(100, Math.round((eng.best / r.days) * 100));
          return (
            <div
              key={r.id}
              className={`relative flex flex-col overflow-hidden rounded-3xl border p-5 ${
                unlocked
? "border-dawn-400/50 bg-gradient-to-br from-dawn-400/15 to-spirit-500/10"
: "border-night-900/10 bg-white"
              }`}
            >
              <span className={`text-spirit-700 ${unlocked? "": "opacity-40 grayscale"}`}>
                <RewardIcon id={r.id} className="h-8 w-8" />
              </span>
              <p className="mt-2 font-display text-base font-extrabold">{r.title}</p>
              <p className="mt-1 flex-1 text-sm text-night-900/65">{r.blurb}</p>
              {unlocked? (
                <Link
                  href={r.href}
                  className="btn-primary mt-4 inline-flex items-center justify-center gap-1.5 text-sm"
                >
                  <GiftGlyph className="h-4 w-4" /> {r.cta}
                </Link>
              ): (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-night-900/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-night-900/55">
                    {eng.ready? `${eng.best}/${r.days} jours`: "…"}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Ambassadeur, partage */}
        <div
          className={`relative flex flex-col overflow-hidden rounded-3xl border p-5 ${
            shared
? "border-spirit-500/50 bg-gradient-to-br from-spirit-500/15 to-dawn-400/10"
: "border-night-900/10 bg-white"
          }`}
        >
          <span className={`text-spirit-700 ${shared? "": "opacity-40 grayscale"}`}>
            <RewardIcon id={AMBASSADOR_REWARD.id} className="h-8 w-8" />
          </span>
          <p className="mt-2 font-display text-base font-extrabold">{AMBASSADOR_REWARD.title}</p>
          <p className="mt-1 flex-1 text-sm text-night-900/65">
            {shared? AMBASSADOR_REWARD.blurb: "Partage l'app à un ami et reçois un bonus"}
          </p>
          {shared? (
            <Link
              href={AMBASSADOR_REWARD.href}
              className="btn-primary mt-4 inline-flex items-center justify-center gap-1.5 text-sm"
            >
              <GiftGlyph className="h-4 w-4" /> {AMBASSADOR_REWARD.cta}
            </Link>
          ): (
            <button type="button" onClick={onShare} className="btn-spirit mt-4 text-sm">
              {copied? "Lien copié ✓": "Inviter un ami"}
            </button>
          )}
        </div>
      </div>

      {/* Célébration */}
      <AnimatePresence>
        {celebrate? (
          <motion.div
            className="fixed inset-0 z-[120] grid place-items-center bg-night-950/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCelebrate(null)}
          >
            <motion.div
              className="relative w-full max-w-sm rounded-4xl border border-dawn-400/40 bg-white p-7 text-center shadow-card"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="mx-auto w-fit text-spirit-700"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
              >
                <RewardIcon id={celebrate.id} className="h-16 w-16" />
              </motion.div>
              <p className="mt-3 font-display text-2xl font-extrabold">Bravo&nbsp;!</p>
              <p className="mt-1 font-semibold text-spirit-700">{celebrate.title} débloqué</p>
              <p className="mt-2 text-sm text-night-900/65">{celebrate.blurb}</p>
              <Link
                href={celebrate.href}
                onClick={() => setCelebrate(null)}
                className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-1.5"
              >
                <GiftGlyph className="h-4 w-4" /> {celebrate.cta}
              </Link>
              <button
                type="button"
                onClick={() => setCelebrate(null)}
                className="mt-2 w-full text-sm font-semibold text-night-900/50 hover:text-night-900/70"
              >
                Plus tard
              </button>
            </motion.div>
          </motion.div>
        ): null}
      </AnimatePresence>
    </section>
  );
}
