"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { reportContent, REPORT_REASONS, type ReportTarget } from "@/lib/moderation";

/**
 * Bouton « Signaler » réutilisable (publications, commentaires, messages, profils).
 * Ouvre une petite fenêtre pour choisir un motif, puis enregistre le signalement
 * (visible par les modérateurs). Discret : icône drapeau + libellé optionnel.
 */
export function ReportButton({
  targetType,
  targetId,
  label,
  className,
  tone = "dark",
}: {
  targetType: ReportTarget;
  targetId: string;
  label?: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const field =
    tone === "dark"
      ? "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3 py-2 text-cream placeholder:text-cream/40 outline-none"
      : "w-full rounded-2xl border border-night-900/15 bg-white px-3 py-2 text-night-900 outline-none";
  const panelBg = tone === "dark" ? "bg-[#1C1C1B] text-cream border-white/10" : "bg-white text-night-900 border-night-900/10";

  const modal =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" role="dialog" aria-modal="true"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}>
            <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
            <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-4 shadow-xl ${panelBg}`}>
              {done ? (
                <div className="py-2 text-center">
                  <p className="font-display text-lg font-bold">Merci 🙏</p>
                  <p className="mt-1 text-sm opacity-70">Ton signalement a été transmis aux modérateurs.</p>
                  <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-4 text-sm">Fermer</button>
                </div>
              ) : (
                <>
                  <p className="font-display text-lg font-bold">Signaler ce contenu</p>
                  <p className="mt-1 text-xs opacity-60">Aide-nous à garder la communauté saine. Motif :</p>
                  <div className="mt-3 space-y-1.5">
                    {REPORT_REASONS.map((r) => (
                      <label key={r} className="flex items-center gap-2 text-sm">
                        <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} />
                        {r}
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Détail (facultatif)…"
                    className={`${field} mt-3 text-sm`}
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        const ok = await reportContent(targetType, targetId, reason, note);
                        setBusy(false);
                        if (ok) setDone(true);
                      }}
                      className="btn-primary text-sm"
                    >
                      {busy ? "…" : "Envoyer le signalement"}
                    </button>
                    <button type="button" onClick={() => setOpen(false)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tone === "dark" ? "bg-white/10 text-cream" : "bg-night-900/5 text-night-900"}`}>Annuler</button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => { setDone(false); setOpen(true); }}
        aria-label="Signaler"
        title="Signaler"
        className={className ?? "inline-flex items-center gap-1 text-xs font-semibold opacity-60 hover:opacity-100"}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.8}>
          <path d="M5 21V4M5 4h11l-2 4 2 4H5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label ?? "Signaler"}
      </button>
      {modal}
    </>
  );
}
