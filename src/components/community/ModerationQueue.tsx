"use client";

import { useCallback, useEffect, useState } from "react";
import { listOpenReports, setReportStatus, type Report } from "@/lib/moderation";
import { getSupabase } from "@/lib/supabase";

const TABLE: Record<string, string | null> = {
  group_post: "group_posts",
  group_comment: "group_comments",
  group_message: "group_messages",
  prayer: "prayers",
  prayer_comment: "prayer_comments",
  message: "messages",
  profile: null,
};
const LABEL: Record<string, string> = {
  group_post: "Publication de groupe",
  group_comment: "Commentaire de groupe",
  group_message: "Message de groupe",
  prayer: "Sujet de prière",
  prayer_comment: "Commentaire de prière",
  message: "Message privé",
  profile: "Profil",
};

/** File des signalements (admin + modérateurs). Supprimer le contenu ou ignorer. */
export function ModerationQueue() {
  const [reports, setReports] = useState<Report[] | null>(null);

  const load = useCallback(async () => setReports(await listOpenReports()), []);
  useEffect(() => {
    load();
  }, [load]);

  async function removeContent(r: Report) {
    const table = TABLE[r.target_type];
    if (table) {
      const sb = getSupabase();
      if (sb) await sb.from(table).delete().eq("id", r.target_id);
    }
    await setReportStatus(r.id, "resolved");
    load();
  }
  async function dismiss(r: Report) {
    await setReportStatus(r.id, "dismissed");
    load();
  }

  if (reports === null) return null;

  return (
    <section className="glass-strong mt-6 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-red-500/15 text-red-600">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
            <path d="M5 21V4M5 4h11l-2 4 2 4H5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="font-display text-lg font-bold">
          Signalements{reports.length ? ` · ${reports.length}` : ""}
        </h3>
      </div>

      {reports.length === 0 ? (
        <p className="mt-2 text-sm text-night-900/55">Aucun signalement en attente 🙏</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-2xl border border-night-900/10 bg-white p-3">
              <p className="text-sm font-bold text-night-900">{LABEL[r.target_type] ?? r.target_type}</p>
              <p className="text-xs text-night-900/55">
                Motif : {r.reason} · {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
              {r.note ? <p className="mt-1 text-sm text-night-900/80">« {r.note} »</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {TABLE[r.target_type] ? (
                  <button
                    type="button"
                    onClick={() => removeContent(r)}
                    className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white"
                  >
                    Supprimer le contenu
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => dismiss(r)}
                  className="rounded-full bg-night-900/5 px-3 py-1.5 text-xs font-semibold text-night-900"
                >
                  Ignorer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
