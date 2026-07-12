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
type Charte = { bg: string; text: string; sub: string; border?: string };
const CHARTE: Charte[] = [
  { bg: "linear-gradient(150deg, #CAF000, #AAD000)", text: "#14160E", sub: "rgba(20,22,14,0.68)" }, // lime
  { bg: "linear-gradient(150deg, #3A3F28, #1F2216)", text: "#F3F3ED", sub: "rgba(243,243,237,0.72)" }, // olive
  { bg: "#F3F3ED", text: "#1F2216", sub: "rgba(31,34,22,0.6)", border: "1px solid rgba(31,34,22,0.12)" }, // crème
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

/** Carte de plan (charte: olive foncé / crème + accent lime), avec progression. */
function PlanCard({ plan, done, total, dark }: { plan: ThemePlan; done: number; total: number; dark: boolean }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const started = done > 0;
  const finished = total > 0 && done >= total;
  const accent = dark ? "#CAF000" : "#3A3F28";
  const sub = dark ? "rgba(243,243,237,0.72)" : "rgba(31,34,22,0.6)";
  return (
    <Link
      href={`/plans/${plan.slug}`}
      className="block rounded-3xl p-5"
      style={
        dark
          ? { background: "linear-gradient(150deg,#3A3F28,#1F2216)", color: "#F3F3ED" }
          : { background: "#FFFFFF", color: "#1F2216", border: "1px solid rgba(31,34,22,0.08)" }
      }
    >
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider"
          style={{ background: dark ? "rgba(202,240,0,0.15)" : "rgba(58,63,40,0.1)", color: accent }}
        >
          {total} jours
        </span>
        {started ? (
          <span className="text-xs font-extrabold" style={{ color: accent }}>
            {finished ? "Terminé ✓" : `${pct}%`}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold leading-tight">{plan.title}</p>
      <p className="mt-1 text-sm" style={{ color: sub }}>{plan.subtitle}</p>
      {started ? (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: dark ? "rgba(255,255,255,0.12)" : "rgba(31,34,22,0.08)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
        </div>
      ) : null}
      <p className="mt-3 text-sm font-bold" style={{ color: accent }}>
        {finished ? "Revoir →" : started ? "Continuer →" : "Commencer →"}
      </p>
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
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };
  const startedPlans = allPlans.filter((p) => pInfo(p).done > 0);
  const recoPlans = allPlans.filter((p) => pInfo(p).done === 0);

  const [cats, setCats] = useState<Category[]>(DEFAULT_CATS);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);

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
    const text = (drafts[catId] ?? "").trim();
    if (!text) return;
    persist(
      cats.map((c) =>
        c.id === catId ? { ...c, items: [...c.items, { id: `i-${Date.now()}`, text, done: false }] } : c,
      ),
    );
    setDrafts((d) => ({ ...d, [catId]: "" }));
  }
  function toggleItem(catId: string, itemId: string) {
    persist(
      cats.map((c) =>
        c.id === catId ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)) } : c,
      ),
    );
  }
  function delItem(catId: string, itemId: string) {
    persist(cats.map((c) => (c.id === catId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c)));
  }

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

      {/* 2) Plans: en cours (avec %) puis recommandés — charte olive/crème + lime */}
      <section>
        {startedPlans.length ? (
          <div>
            <h3 className="font-display text-lg font-bold">Mes plans en cours</h3>
            <div className="mt-3 space-y-3">
              {startedPlans.map((p, i) => {
                const { done, total } = pInfo(p);
                return <PlanCard key={p.slug} plan={p} done={done} total={total} dark={i % 2 === 0} />;
              })}
            </div>
          </div>
        ) : null}

        <div className={startedPlans.length ? "mt-6" : ""}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Plans recommandés</h3>
            <Link href="/plans" className="text-sm font-semibold text-spirit-700">Voir tout →</Link>
          </div>
          <p className="mt-1 text-sm text-night-900/55">De nouveaux plans, selon ce que tu traverses.</p>
          <div className="mt-3 space-y-3">
            {recoPlans.map((p, i) => {
              const { done, total } = pInfo(p);
              return <PlanCard key={p.slug} plan={p} done={done} total={total} dark={(startedPlans.length + i) % 2 === 0} />;
            })}
          </div>
        </div>
      </section>

      {/* 3) Ma to-do list de prière (privée, par catégories) */}
      <section>
        <h3 className="font-display text-lg font-bold">Ma to-do list de prière</h3>
        <p className="mt-1 text-sm text-night-900/55">Tes sujets par catégorie, privés, rien que pour toi 🙏</p>

        <div className="mt-3 space-y-3">
          {cats.map((cat, i) => {
            const ch = CHARTE[i % CHARTE.length];
            return (
              <div key={cat.id} className="overflow-hidden rounded-3xl border border-night-900/10 bg-white">
                {/* En-tête coloré (charte) */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ background: ch.bg, color: ch.text, borderBottom: ch.border }}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-extrabold leading-tight">{cat.title}</p>
                    {cat.note ? <p className="truncate text-xs" style={{ color: ch.sub }}>{cat.note}</p> : null}
                  </div>
                  <button type="button" onClick={() => { setIsNew(false); setEditing(cat); }} aria-label="Modifier" className="text-sm opacity-70">✎</button>
                </div>

                {/* Sujets */}
                <div className="px-4 py-3">
                  {cat.items.length === 0 ? (
                    <p className="text-xs text-night-900/40">Ajoute ton premier sujet de prière.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {cat.items.map((it) => (
                        <li key={it.id} className="flex items-center gap-2">
                          <button type="button" onClick={() => toggleItem(cat.id, it.id)} aria-label="Marquer"
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] ${it.done ? "border-spirit-600 bg-spirit-600 text-cream" : "border-night-900/25 text-transparent"}`}>✓</button>
                          <span className={`flex-1 text-sm ${it.done ? "text-night-900/40 line-through" : "text-night-900/85"}`}>{it.text}</span>
                          <button type="button" onClick={() => delItem(cat.id, it.id)} aria-label="Supprimer" className="text-night-900/25 hover:text-red-500">✕</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form onSubmit={(e) => { e.preventDefault(); addItem(cat.id); }} className="mt-2 flex items-center gap-2">
                    <input value={drafts[cat.id] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [cat.id]: e.target.value }))} placeholder="Ajouter un sujet…" className="field flex-1 py-2 text-sm" />
                    <button type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-spirit-600 text-lg font-bold text-cream">+</button>
                  </form>
                </div>
              </div>
            );
          })}

          {/* Ajouter une catégorie */}
          <button type="button" onClick={() => { setIsNew(true); setEditing({ id: `c-${Date.now()}`, title: "", note: "", items: [] }); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-night-900/20 py-3 text-sm font-semibold text-night-900/55 transition-colors hover:border-spirit-600 hover:text-spirit-700">
            <span className="text-lg leading-none">+</span> Ajouter une catégorie
          </button>
        </div>
      </section>

      {/* Éditeur de catégorie */}
      {editing ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
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
                  setEditing(null);
                }}
                className="btn-primary text-sm">Enregistrer</button>
              {!isNew ? (
                <button type="button" onClick={() => { persist(cats.filter((c) => c.id !== editing.id)); setEditing(null); }}
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
