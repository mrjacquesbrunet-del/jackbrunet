"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { usePlanProgress } from "@/lib/plan-progress";
import { PassageInline } from "@/components/bible/PassageInline";
import { bibleHref } from "@/lib/bible-ref";
import { Celebration } from "@/components/ui/Celebration";
import { PlanRating } from "@/components/plans/PlanRating";
import { useAuth } from "@/components/community/useAuth";
import { getSupabase } from "@/lib/supabase";
import { isPlanSaved, togglePlanSave } from "@/lib/community";
import type { ThemePlan } from "@/lib/types";

/** Photo de l'auteur (bucket public « audiovf »), repli monogramme. */
const AVATARS = (() => {
  const sb = getSupabase();
  if (!sb) return [] as string[];
  return ["auteurjack.jpg", "auteurjack.png", "pasteur-jack.jpg"].map(
    (n) => sb.storage.from("audiovf").getPublicUrl(n).data.publicUrl
  );
})();

function PlanAuthor({ name }: { name: string }) {
  const [i, setI] = useState(0);
  const src = AVATARS[i];
  return (
    <div className="flex items-center gap-2.5">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setI((n) => n + 1)}
          className="h-11 w-11 rounded-full object-cover ring-2 ring-dawn-400/70"
        />
      ) : (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-spirit-500 font-display text-sm font-extrabold text-cream ring-2 ring-dawn-400/70">
          J
        </span>
      )}
      <span className="leading-tight">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-cream/55">
          Par
        </span>
        <span className="block font-display text-sm font-bold text-cream">{name}</span>
      </span>
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-10 w-10 place-items-center rounded-full backdrop-blur transition-colors ${
        active ? "bg-dawn-400 text-night-950" : "bg-night-950/50 text-cream hover:bg-night-950/70"
      }`}
    >
      {children}
    </button>
  );
}

export function PlanView({ plan }: { plan: ThemePlan }) {
  const progress = usePlanProgress(plan.slug);
  const { userId } = useAuth();
  const total = plan.days.length;
  const doneCount = progress.done.length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const author = plan.author ?? "Pasteur Jack Brunet";

  // Jour courant = premier jour non terminé. Les jours suivants sont verrouillés.
  const currentDay = plan.days.find((d) => !progress.isDone(d.day))?.day ?? total + 1;

  const [reread, setReread] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (userId) isPlanSaved(plan.slug, userId).then(setSaved);
    else setSaved(false);
  }, [plan.slug, userId]);

  useEffect(() => {
    if (percent !== 100) return;
    try {
      const key = "jb.plan.celebrated.v1";
      const seen = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      if (!seen.includes(plan.slug)) {
        setCelebrate(true);
        localStorage.setItem(key, JSON.stringify([...seen, plan.slug]));
      }
    } catch {
      /* stockage indisponible */
    }
  }, [percent, plan.slug]);

  async function toggleSave() {
    if (!userId) return;
    const next = !saved;
    setSaved(next);
    await togglePlanSave(plan.slug, userId, next);
  }

  async function share() {
    const url =
      (typeof window !== "undefined" ? window.location.origin : "https://jackbrunet.com") +
      `/plans/${plan.slug}`;
    const data = { title: plan.title, text: `Découvre le parcours « ${plan.title} » sur RHEMA`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        alert("Lien du plan copié.");
      }
    } catch {
      /* partage annulé */
    }
  }

  return (
    <div className="min-h-screen bg-night-950 pb-24 text-cream">
      <Celebration
        open={celebrate}
        emoji=""
        title="Parcours terminé!"
        message={`Bravo, tu as terminé « ${plan.title} »! Que cette Parole continue de porter du fruit dans ta vie.`}
        onClose={() => setCelebrate(false)}
      />

      {/* ---------- Héros : photo du plan ---------- */}
      <section className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">
          {plan.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(plan.cover)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-night-800 to-night-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/35 to-night-950/10" />

          {/* Barre du haut : retour + partager + enregistrer */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <Link
              href="/plans"
              aria-label="Tous les parcours"
              className="grid h-10 w-10 place-items-center rounded-full bg-night-950/50 text-cream backdrop-blur transition-colors hover:bg-night-950/70"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="flex gap-2">
              <IconBtn onClick={share} label="Partager le plan">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconBtn>
              <IconBtn onClick={toggleSave} label="Enregistrer le plan" active={saved}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
                  <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </IconBtn>
            </div>
          </div>

          {/* Bas de la photo : titre + auteur (gauche) + note (droite) */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-dawn-300">
              Plan thématique
            </span>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold leading-tight text-cream sm:text-4xl">
              {plan.title}
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-cream/75">{plan.subtitle}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <PlanAuthor name={author} />
              <PlanRating slug={plan.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Synopsis (façon Netflix) ---------- */}
      {plan.summary ? (
        <div className="container-x pt-5">
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-cream/80">
            {plan.summary}
          </p>
        </div>
      ) : null}

      {/* ---------- Progression ---------- */}
      <div className="container-x pt-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-cream/80">
              {doneCount} / {total} jours
            </span>
            <span className="text-cream/50">{percent}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-dawn-300 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ---------- Jours (déverrouillage progressif) ---------- */}
      <ol className="container-x mx-auto mt-6 max-w-2xl space-y-4">
        {plan.days.map((d) => {
          const done = progress.isDone(d.day);
          const current = d.day === currentDay;
          const locked = d.day > currentDay;
          const open = current || reread === d.day;

          // --- Jour verrouillé ---
          if (locked) {
            return (
              <li
                key={d.day}
                className="flex items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5 opacity-60"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 text-cream/50">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                    <path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-cream/40">
                    Jour {d.day}
                  </p>
                  <p className="text-sm text-cream/55">
                    Termine le jour {d.day - 1} pour débloquer.
                  </p>
                </div>
              </li>
            );
          }

          return (
            <li
              key={d.day}
              className={`overflow-hidden rounded-3xl border transition-all ${
                current
                  ? "border-dawn-400/50 bg-night-900 shadow-[0_18px_50px_-20px_rgba(202,240,0,0.4)]"
                  : "border-white/8 bg-white/[0.04]"
              }`}
            >
              {/* Entête du jour (cliquable pour replier/déplier un jour terminé) */}
              <button
                type="button"
                onClick={() => !current && setReread(open ? null : d.day)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <div
                  className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                    current ? "bg-dawn-400" : "bg-night-950"
                  }`}
                >
                  <div className="text-center leading-none">
                    <span
                      className={`block text-[8px] font-bold uppercase tracking-[0.2em] ${
                        current ? "text-night-950/70" : "text-dawn-400"
                      }`}
                    >
                      Jour
                    </span>
                    <span
                      className={`mt-1 block font-display text-2xl font-extrabold ${
                        current ? "text-night-950" : "text-cream"
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                  {done ? (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-dawn-400 text-night-950 ring-2 ring-night-900">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={3}>
                        <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wide ${
                      done ? "text-dawn-300" : current ? "text-dawn-300" : "text-cream/40"
                    }`}
                  >
                    {done ? "Terminé" : current ? "À méditer aujourd'hui" : "À méditer"}
                  </span>
                  <h3 className="font-display text-xl font-bold leading-tight text-cream">{d.title}</h3>
                </div>
                {!current ? (
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 shrink-0 fill-none stroke-cream/40 transition-transform ${open ? "rotate-180" : ""}`}
                    strokeWidth={2}
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </button>

              {/* Contenu du jour */}
              {open ? (
                <div className="px-5 pb-6">
                  <div className="space-y-4 text-[15px] leading-relaxed text-cream/85">
                    {d.meditation.split("\n\n").map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dawn-300">
                      À lire & méditer
                    </p>
                    {d.verses.map((v) => (
                      <PassageInline key={v} reference={v} />
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => progress.toggleDay(d.day)}
                      className={
                        done
                          ? "inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-2.5 text-sm font-bold text-cream/70"
                          : "inline-flex items-center gap-2 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-bold text-night-950"
                      }
                    >
                      {done ? "✓ Terminé — annuler" : "J'ai terminé ce jour"}
                    </button>
                    <Link
                      href={bibleHref(d.verses[0]) ?? "/bible"}
                      className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-2.5 text-sm font-bold text-cream/80"
                    >
                      Ouvrir la Bible
                    </Link>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {percent === 100 ? (
        <div className="container-x mx-auto mt-8 max-w-2xl rounded-3xl border border-dawn-400/30 bg-dawn-400/[0.08] p-6 text-center">
          <p className="font-display text-xl font-bold text-cream">Parcours terminé</p>
          <p className="mt-1 text-sm text-cream/70">
            Bravo! Continue sur un autre thème pour t'enraciner encore plus.
          </p>
          <Link
            href="/plans"
            className="mt-4 inline-flex rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-bold text-night-950"
          >
            Voir les autres parcours
          </Link>
        </div>
      ) : null}
    </div>
  );
}
