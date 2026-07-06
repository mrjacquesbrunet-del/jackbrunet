"use client";

/**
 * Synchronisation du compte: rattache le carnet, les versets
 * (surlignés + enregistrés) et la progression des plans au compte
 * Supabase, pour les retrouver sur tous les appareils.
 *
 * Stratégie « offline-first »:
 * - localStorage reste la source pour l'affichage (rapide, hors-ligne) ;
 * - à la connexion, on fusionne le cloud avec le local (union, le plus
 * récent gagne), on réécrit le local et on pousse le tout vers le cloud ;
 * - ensuite, chaque modification locale est répercutée vers le cloud.
 */

import { getSupabase } from "./supabase";
import {
  setNoteSink,
  snapshotNotes,
  replaceNotes,
  type Note,
} from "./notebook";
import {
  setToolkitSink,
  snapshotToolkit,
  replaceToolkit,
  type Snippet,
} from "./toolkit";
import { setPlanSink, snapshotPlans, replacePlans } from "./plan-progress";

let current: string | null = null;

export function disableCloudSync() {
  current = null;
  setNoteSink(null);
  setToolkitSink(null);
  setPlanSink(null);
}

export async function enableCloudSync(userId: string) {
  if (current === userId) return;
  current = userId;
  const sb = getSupabase();
  if (!sb) return;

  // ---- Sinks: pousser chaque modif vers le cloud ----
  setNoteSink({
    upsert: (n) => {
      void sb.from("notes").upsert({ user_id: userId,...serializeNote(n) });
    },
    remove: (id) => {
      void sb.from("notes").delete().eq("user_id", userId).eq("id", id);
    },
  });
  setToolkitSink({
    highlightAdd: (id) => {
      void sb.from("highlights").upsert({ user_id: userId, hid: id });
    },
    highlightRemove: (id) => {
      void sb.from("highlights").delete().eq("user_id", userId).eq("hid", id);
    },
    snippetUpsert: (s) => {
      void sb.from("snippets").upsert({ user_id: userId,...serializeSnippet(s) });
    },
    snippetRemove: (id) => {
      void sb.from("snippets").delete().eq("user_id", userId).eq("id", id);
    },
  });
  setPlanSink({
    set: (slug, days) => {
      void sb.from("plan_progress").upsert({ user_id: userId, slug, days });
    },
  });

  // ---- Fusion initiale (deux sens) ----
  try {
    await Promise.all([syncNotes(userId), syncToolkit(userId), syncPlans(userId)]);
  } catch {
    /* la synchro réessaiera à la prochaine connexion */
  }
}

/* ---------------- Carnet ---------------- */
function serializeNote(n: Note) {
  return {
    id: n.id,
    category: n.category,
    title: n.title,
    body: n.body,
    answered:!!n.answered,
    ts: n.ts?? 0,
  };
}

async function syncNotes(userId: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { data } = await sb.from("notes").select("*").eq("user_id", userId);
  const cloud = (data?? []) as (Note & { user_id: string })[];
  const local = snapshotNotes();

  const map = new Map<string, Note>();
  for (const n of cloud) map.set(n.id, normalizeNote(n));
  for (const n of local) {
    const ex = map.get(n.id);
    if (!ex || (n.ts?? 0) >= (ex.ts?? 0)) map.set(n.id, n);
  }
  const merged = [...map.values()].sort((a, b) => (b.ts?? 0) - (a.ts?? 0));
  replaceNotes(merged);
  if (merged.length) {
    await sb.from("notes").upsert(merged.map((n) => ({ user_id: userId,...serializeNote(n) })));
  }
}

function normalizeNote(n: Note & { user_id?: string }): Note {
  return {
    id: n.id,
    category: n.category,
    title: n.title,
    body: n.body,
    answered:!!n.answered,
    ts: Number(n.ts) || 0,
  };
}

/* ---------------- Versets (toolkit) ---------------- */
function serializeSnippet(s: Snippet) {
  return {
    id: s.id,
    text: s.text,
    reference: s.reference?? null,
    kind: s.kind,
    ts: s.ts?? 0,
  };
}

async function syncToolkit(userId: string) {
  const sb = getSupabase();
  if (!sb) return;
  const [{ data: hRows }, { data: sRows }] = await Promise.all([
    sb.from("highlights").select("hid").eq("user_id", userId),
    sb.from("snippets").select("*").eq("user_id", userId),
  ]);
  const local = snapshotToolkit();

  // Surlignages: union
  const hSet = new Set<string>(local.highlights);
  for (const r of (hRows?? []) as { hid: string }[]) hSet.add(r.hid);
  const highlights = [...hSet];

  // Snippets: union par id (le plus récent gagne)
  const map = new Map<string, Snippet>();
  for (const s of (sRows?? []) as Snippet[]) {
    map.set(s.id, {...s, ts: Number(s.ts) || 0 });
  }
  for (const s of local.saved) {
    const ex = map.get(s.id);
    if (!ex || (s.ts?? 0) >= (ex.ts?? 0)) map.set(s.id, s);
  }
  const saved = [...map.values()].sort((a, b) => (b.ts?? 0) - (a.ts?? 0));

  // colors / hlmeta / noted restent locaux (non synchronisés), on les conserve.
  replaceToolkit({
    highlights,
    saved,
    colors: local.colors,
    hlmeta: local.hlmeta,
    noted: local.noted,
  });

  await Promise.all([
    highlights.length
? sb.from("highlights").upsert(highlights.map((hid) => ({ user_id: userId, hid })))
: Promise.resolve(),
    saved.length
? sb.from("snippets").upsert(saved.map((s) => ({ user_id: userId,...serializeSnippet(s) })))
: Promise.resolve(),
  ]);
}

/* ---------------- Plans ---------------- */
async function syncPlans(userId: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { data } = await sb.from("plan_progress").select("slug,days").eq("user_id", userId);
  const local = snapshotPlans();

  const merged: Record<string, number[]> = {};
  for (const r of (data?? []) as { slug: string; days: number[] }[]) {
    merged[r.slug] = [...(r.days?? [])];
  }
  for (const [slug, days] of Object.entries(local)) {
    const set = new Set<number>([...(merged[slug]?? []),...days]);
    merged[slug] = [...set].sort((a, b) => a - b);
  }
  replacePlans(merged);

  const rows = Object.entries(merged).map(([slug, days]) => ({ user_id: userId, slug, days }));
  if (rows.length) await sb.from("plan_progress").upsert(rows);
}
