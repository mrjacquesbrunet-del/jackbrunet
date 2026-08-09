"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEngagement } from "@/lib/engagement";
import { getThemePlans } from "@/lib/content";
import { useAllPlanProgress } from "@/lib/plan-progress";
import type { ThemePlan } from "@/lib/types";

/** Date locale YYYY-MM-DD. */
function dayStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DOW = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/** Les 3 couleurs de la charte: lime, olive, crème. */
type Charte = { bg: string; text: string; sub: string; chip: string; border?: string };
const CHARTE: Charte[] = [
  { bg: "linear-gradient(150deg, #CAF000, #AAD000)", text: "rgb(var(--n-950))", sub: "rgb(var(--n-950) / 0.68)", chip: "rgb(var(--n-950) / 0.15)" }, // lime
  { bg: "linear-gradient(150deg, rgb(var(--n-700)), rgb(var(--n-900)))", text: "#F3F3ED", sub: "rgba(243,243,237,0.72)", chip: "rgba(255,255,255,0.15)" }, // olive
  { bg: "#F3F3ED", text: "rgb(var(--n-900))", sub: "rgb(var(--n-900) / 0.6)", chip: "rgb(var(--n-900) / 0.08)", border: "1px solid rgb(var(--n-900) / 0.12)" }, // crème
];

type Item = { id: string; text: string; done: boolean };
type Category = { id: string; title: string; note: string; items: Item[] };

const PKEY = "jb.prayerlist.v2";
const DEFAULT_CATS: Category[] = [
  { id: "famille", title: "Famille", note: "Unité et paix au foyer", items: [] },
  { id: "sante", title: "Santé", note: "Guérison et force", items: [] },
  { id: "travail", title: "Travail & finances", note: "Provision et sagesse", items: [] },
  { id: "direction", title: "Direction", note: "Discerner la volonté de Dieu", items: [] },
  { id: "reconnaissance", title: "Reconnaissance", note: "Rendre grâce à Dieu", items: [] },
  { id: "eglise", title: "Église", note: "Mon église et mes frères", items: [] },
];

function loadCats(): Category[] {
  try {
    const raw = localStorage.getItem(PKEY);
    if (!raw) return DEFAULT_CATS;
    const arr = JSON.parse(raw) as Category[];
    return Array.isArray(arr) ? arr : DEFAULT_CATS;
  } catch {
    return DEFAULT_CATS;
  }
}

/** Carte de plan (carrousel), charte + progression. */
function PlanCard({ plan, done, total, ch }: { plan: ThemePlan; done: number; total: number; ch: Charte }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const started = done > 0;
  const finished = total > 0 && done >= total;
  return (
    <Link
      href={`/plans/${plan.slug}`}
      className="relative flex h-44 w-60 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl p-4"
      style={{ background: ch.bg, color: ch.text, border: ch.border }}
    >
      <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: ch.chip }}>
        {total} jours
      </span>
      {started ? (
        <span className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-extrabold" style={{ background: ch.chip }}>
          {finished ? "Terminé ✓" : `${pct}%`}
        </span>
      ) : null}
      <p className="font-display text-xl font-extrabold leading-tight">{plan.title}</p>
      <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: ch.sub }}>{plan.subtitle}</p>
      {started ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: ch.chip }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ch.text }} />
        </div>
      ) : null}
    </Link>
  );
}

export function ProfileActivity() {
  const eng = useEngagement();
  const progress = useAllPlanProgress();
  const allPlans = getThemePlans();
  const pInfo = (p: ThemePlan) => {
    const total = p.days.length;
    const done = (progress[p.slug] ?? []).length;
    return { total, done };
  };
  // Plans que je suis d'abord, puis recommandés.
  const orderedPlans = [
    ...allPlans.filter((p) => pInfo(p).done > 0),
    ...allPlans.filter((p) => pInfo(p).done === 0),
  ];

  const [cats, setCats] = useState<Category[]>(DEFAULT_CATS);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => setCats(loadCats()), []);
  function persist(next: Category[]) {
    setCats(next);
    try {
      localStorage.setItem(PKEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  function addItem(catId: string) {
    const text = draft.trim();
    if (!text) return;
    persist(cats.map((c) => (c.id === catId ? { ...c, items: [...c.items, { id: `i-${Date.now()}`, text, done: false }] } : c)));
    setDraft("");
  }
  function toggleItem(catId: string, itemId: string) {
    persist(cats.map((c) => (c.id === catId ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)) } : c)));
  }
  function delItem(catId: string, itemId: string) {
    persist(cats.map((c) => (c.id === catId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c)));
  }

  const current = cats.find((c) => c.id === openCat) ?? null;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const doneSet = new Set(eng.completedDates ?? []);
  const todayStr = dayStr(new Date());

  return (
    <div className="mt-8 space-y-8">
      {/* 1) Ta semaine avec Jésus */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Ta semaine avec Jésus</h3>
          {eng.streak > 1 ? (
            <span className="rounded-full bg-dawn-400/20 px-3 py-1 text-xs font-bold text-spirit-700">🔥 {eng.streak} jours d&apos;affilée</span>
          ) : null}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const ds = dayStr(d);
            const done = doneSet.has(ds);
            const isToday = ds === todayStr;
            return (
              <div key={ds} className={`rounded-2xl border py-2 text-center ${isToday ? "border-night-900" : "border-night-900/10"}`}>
                <p className="text-[11px] font-semibold text-night-900/50">{DOW[d.getDay()]}</p>
                <p className="text-sm font-extrabold text-night-900">{d.getDate()}</p>
                <span className={`mx-auto mt-1 grid h-5 w-5 place-items-center rounded-full text-[11px] ${done ? "bg-dawn-400 text-night-950" : "bg-night-900/[0.06] text-night-900/30"}`}>{done ? "✓" : "·"}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-night-900/50">Chaque jour où tu prends ton temps avec Jésus est marqué d&apos;un ✓.</p>
      </section>

      {/* 2) Plans (carrousel, charte lime/olive/crème, suivis d'abord + %) */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Découvre tes plans</h3>
          <Link href="/plans" className="text-sm font-semibold text-spirit-700">Voir tout →</Link>
        </div>
        <p className="mt-1 text-sm text-night-900/55">Tes plans en cours d&apos;abord, puis de nouveaux à découvrir.</p>
        <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
          {orderedPlans.map((p, i) => {
            const { done, total } = pInfo(p);
            return <PlanCard key={p.slug} plan={p} done={done} total={total} ch={CHARTE[i % CHARTE.length]} />;
          })}
        </div>
      </section>

      {/* 3) Ma to-do list de prière (grille 2 colonnes, charte) */}
      <section>
        <h3 className="font-display text-lg font-bold">Ma to-do list de prière</h3>
        <p className="mt-1 text-sm text-night-900/55">Tes sujets par catégorie, privés, rien que pour toi 🙏</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {cats.map((cat, i) => {
            const ch = CHARTE[i % CHARTE.length];
            const remaining = cat.items.filter((it) => !it.done).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setOpenCat(cat.id)}
                className="flex min-h-[112px] flex-col items-start rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5"
                style={{ background: ch.bg, color: ch.text, border: ch.border }}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: ch.chip }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                    <path d="M12 3.4c-.6 1.1-1.3 2-2.4 3.1-1.8 1.8-3.4 3.5-3.4 6a5.8 5.8 0 0 0 11.6 0c0-2.5-1.6-4.2-3.4-6C13.3 5.4 12.6 4.5 12 3.4z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-2 font-display text-base font-extrabold leading-tight">{cat.title}</p>
                <p className="mt-0.5 text-[11px]" style={{ color: ch.sub }}>
                  {cat.items.length > 0 ? `${remaining} en cours · ${cat.items.length} sujet${cat.items.length > 1 ? "s" : ""}` : cat.note}
                </p>
              </button>
            );
          })}

          {/* Ajouter une catégorie */}
          <button
            type="button"
            onClick={() => { setIsNew(true); setEditing({ id: `c-${Date.now()}`, title: "", note: "", items: [] }); }}
            className="flex min-h-[112px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-night-900/20 p-4 text-night-900/50 transition-colors hover:border-spirit-600 hover:text-spirit-700"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs font-semibold">Ajouter</span>
          </button>
        </div>
      </section>

      {/* Modal: sujets d'une catégorie */}
      {current ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <button type="button" aria-label="Fermer" onClick={() => { setOpenCat(null); setDraft(""); }} className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 m-3 max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-night-900/10 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-bold text-night-900">{current.title}</p>
                {current.note ? <p className="text-xs text-night-900/55">{current.note}</p> : null}
              </div>
              <button type="button" onClick={() => { setIsNew(false); setEditing(current); }} aria-label="Modifier" className="text-sm font-semibold text-spirit-700">✎</button>
            </div>

            <div className="mt-3 space-y-1.5">
              {current.items.length === 0 ? (
                <p className="text-xs text-night-900/40">Ajoute ton premier sujet de prière.</p>
              ) : (
                current.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-2">
                    <button type="button" onClick={() => toggleItem(current.id, it.id)} aria-label="Marquer"
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] ${it.done ? "border-spirit-600 bg-spirit-600 text-cream" : "border-night-900/25 text-transparent"}`}>✓</button>
                    <span className={`flex-1 text-sm ${it.done ? "text-night-900/40 line-through" : "text-night-900/85"}`}>{it.text}</span>
                    <button type="button" onClick={() => delItem(current.id, it.id)} aria-label="Supprimer" className="text-night-900/25 hover:text-red-500">✕</button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addItem(current.id); }} className="mt-3 flex items-center gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ajouter un sujet…" className="field flex-1 py-2 text-sm" />
              <button type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-spirit-600 text-lg font-bold text-cream">+</button>
            </form>

            <button type="button" onClick={() => { setOpenCat(null); setDraft(""); }} className="btn-ghost mt-3 w-full text-sm">Fermer</button>
          </div>
        </div>
      ) : null}

      {/* Modal: éditer / créer une catégorie */}
      {editing ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <button type="button" aria-label="Fermer" onClick={() => setEditing(null)} className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 m-3 w-full max-w-sm rounded-2xl border border-night-900/10 bg-white p-4 shadow-xl">
            <p className="mb-3 font-display text-lg font-bold">{isNew ? "Nouvelle catégorie" : "Modifier la catégorie"}</p>
            <label className="block">
              <span className="text-xs font-semibold text-night-900/55">Titre</span>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Ex. Mes amis" className="field mt-1 w-full" />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-semibold text-night-900/55">Sous-titre</span>
              <input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} placeholder="Ex. Ceux qui ne connaissent pas Jésus" className="field mt-1 w-full" />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button"
                onClick={() => {
                  if (!editing.title.trim()) return;
                  const exists = cats.some((c) => c.id === editing.id);
                  persist(exists ? cats.map((c) => (c.id === editing.id ? { ...c, title: editing.title, note: editing.note } : c)) : [...cats, editing]);
                  if (isNew) setOpenCat(editing.id);
                  setEditing(null);
                }}
                className="btn-primary text-sm">Enregistrer</button>
              {!isNew ? (
                <button type="button" onClick={() => { persist(cats.filter((c) => c.id !== editing.id)); setOpenCat(null); setEditing(null); }}
                  className="rounded-full border border-night-900/15 px-4 py-2 text-sm font-semibold text-red-600">Supprimer</button>
              ) : null}
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost text-sm">Annuler</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
