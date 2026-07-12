"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEngagement } from "@/lib/engagement";
import { getThemePlans } from "@/lib/content";

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

type Prayer = { id: string; title: string; note: string };
const PKEY = "jb.prayerlist.v1";
const DEFAULT_PRAYERS: Prayer[] = [
  { id: "famille", title: "Famille", note: "Unité et paix au foyer" },
  { id: "sante", title: "Santé", note: "Guérison et force" },
  { id: "travail", title: "Travail & finances", note: "Provision et sagesse" },
  { id: "direction", title: "Direction", note: "Discerner la volonté de Dieu" },
  { id: "reconnaissance", title: "Reconnaissance", note: "Rendre grâce à Dieu" },
  { id: "eglise", title: "Église", note: "Mon église et mes frères" },
];

function loadPrayers(): Prayer[] {
  try {
    const raw = localStorage.getItem(PKEY);
    if (!raw) return DEFAULT_PRAYERS;
    const arr = JSON.parse(raw) as Prayer[];
    return Array.isArray(arr) ? arr : DEFAULT_PRAYERS;
  } catch {
    return DEFAULT_PRAYERS;
  }
}

/**
 * Sections du profil (après les suggestions), dans la charte:
 * 1) Ta semaine avec Jésus (suivi jour par jour).
 * 2) Tes plans de lecture (lime / olive / crème).
 * 3) Mes sujets de prière personnels (éditables + ajout).
 */
export function ProfileActivity() {
  const eng = useEngagement();
  const plans = getThemePlans().slice(0, 3);

  const [prayers, setPrayers] = useState<Prayer[]>(DEFAULT_PRAYERS);
  const [editing, setEditing] = useState<Prayer | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => setPrayers(loadPrayers()), []);
  function save(next: Prayer[]) {
    setPrayers(next);
    try {
      localStorage.setItem(PKEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
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
            <span className="rounded-full bg-dawn-400/20 px-3 py-1 text-xs font-bold text-spirit-700">
              🔥 {eng.streak} jours d&apos;affilée
            </span>
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
                <span className={`mx-auto mt-1 grid h-5 w-5 place-items-center rounded-full text-[11px] ${done ? "bg-dawn-400 text-night-950" : "bg-night-900/[0.06] text-night-900/30"}`}>
                  {done ? "✓" : "·"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-night-900/50">Chaque jour où tu prends ton temps avec Jésus est marqué d&apos;un ✓.</p>
      </section>

      {/* 2) Tes plans de lecture — lime / olive / crème */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Découvre tes plans</h3>
          <Link href="/plans" className="text-sm font-semibold text-spirit-700">Voir tout →</Link>
        </div>
        <p className="mt-1 text-sm text-night-900/55">De nouveaux plans de lecture, selon ce que tu traverses.</p>
        <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
          {plans.map((p, i) => {
            const ch = CHARTE[i % CHARTE.length];
            return (
              <Link
                key={p.slug}
                href={`/plans/${p.slug}`}
                className="relative flex h-40 w-56 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl p-4"
                style={{ background: ch.bg, color: ch.text, border: ch.border }}
              >
                <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: "rgba(0,0,0,0.12)" }}>
                  {p.days.length} jours
                </span>
                <p className="font-display text-lg font-extrabold leading-tight">{p.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: ch.sub }}>{p.subtitle}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3) Mes sujets de prière personnels */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Mes sujets de prière</h3>
        </div>
        <p className="mt-1 text-sm text-night-900/55">Tes sujets personnels, rien que pour toi 🙏</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {prayers.map((pr, i) => {
            const ch = CHARTE[i % CHARTE.length];
            return (
              <button
                key={pr.id}
                type="button"
                onClick={() => {
                  setIsNew(false);
                  setEditing(pr);
                }}
                className="flex flex-col items-start rounded-2xl p-3 text-left transition-transform hover:-translate-y-0.5"
                style={{ background: ch.bg, color: ch.text, border: ch.border }}
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: "rgba(0,0,0,0.12)" }}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
                    <path d="M12 3.4c-.6 1.1-1.3 2-2.4 3.1-1.8 1.8-3.4 3.5-3.4 6a5.8 5.8 0 0 0 11.6 0c0-2.5-1.6-4.2-3.4-6C13.3 5.4 12.6 4.5 12 3.4z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-2 font-display text-sm font-extrabold leading-tight">{pr.title}</p>
                {pr.note ? <p className="mt-0.5 text-[11px]" style={{ color: ch.sub }}>{pr.note}</p> : null}
              </button>
            );
          })}

          {/* Ajouter un sujet */}
          <button
            type="button"
            onClick={() => {
              setIsNew(true);
              setEditing({ id: `p-${Date.now()}`, title: "", note: "" });
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-night-900/20 p-3 text-night-900/50 transition-colors hover:border-spirit-600 hover:text-spirit-700"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs font-semibold">Ajouter un sujet</span>
          </button>
        </div>
      </section>

      {/* Éditeur de sujet (modal) */}
      {editing ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <button type="button" aria-label="Fermer" onClick={() => setEditing(null)} className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 m-3 w-full max-w-sm rounded-2xl border border-night-900/10 bg-white p-4 shadow-xl">
            <p className="mb-3 font-display text-lg font-bold">{isNew ? "Nouveau sujet" : "Modifier le sujet"}</p>
            <label className="block">
              <span className="text-xs font-semibold text-night-900/55">Titre</span>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Ex. Ma famille" className="field mt-1 w-full" />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-semibold text-night-900/55">Sous-titre (perso)</span>
              <input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} placeholder="Ex. Pour l'unité et la paix" className="field mt-1 w-full" />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!editing.title.trim()) return;
                  const exists = prayers.some((p) => p.id === editing.id);
                  save(exists ? prayers.map((p) => (p.id === editing.id ? editing : p)) : [...prayers, editing]);
                  setEditing(null);
                }}
                className="btn-primary text-sm"
              >
                Enregistrer
              </button>
              {!isNew ? (
                <button
                  type="button"
                  onClick={() => {
                    save(prayers.filter((p) => p.id !== editing.id));
                    setEditing(null);
                  }}
                  className="rounded-full border border-night-900/15 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  Supprimer
                </button>
              ) : null}
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost text-sm">Annuler</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
