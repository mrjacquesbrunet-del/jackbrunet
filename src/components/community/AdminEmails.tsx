"use client";

import { useState } from "react";
import { adminEmails } from "@/lib/community";

/** Panneau réservé à l'admin : récupérer les emails des inscrits (newsletter). */
export function AdminEmails() {
  const [rows, setRows] = useState<{ email: string; pseudo: string | null; inscrit_le: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    setBusy(true);
    setRows(await adminEmails());
    setBusy(false);
  }

  function copyEmails() {
    if (!rows) return;
    navigator.clipboard.writeText(rows.map((r) => r.email).join(", ")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function downloadCsv() {
    if (!rows) return;
    const csv = ["email,pseudo,inscrit_le", ...rows.map((r) => `${r.email},${r.pseudo ?? ""},${r.inscrit_le}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "abonnes-jackbrunet.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-3xl border border-spirit-500/30 bg-spirit-500/[0.05] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display font-bold text-spirit-700">Espace administrateur</p>
          <p className="text-sm text-night-900/60">Récupère les emails des inscrits pour la newsletter.</p>
        </div>
        <button type="button" onClick={load} disabled={busy} className="btn-ghost text-sm disabled:opacity-50">
          {busy ? "Chargement…" : rows ? "Rafraîchir" : "Charger les emails"}
        </button>
      </div>

      {rows ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-night-900/70">
            {rows.length} inscrit{rows.length > 1 ? "s" : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={copyEmails} className="btn-ghost text-sm">
              {copied ? "✓ Copié" : "Copier tous les emails"}
            </button>
            <button type="button" onClick={downloadCsv} className="btn-primary text-sm">
              Télécharger en CSV
            </button>
          </div>
          <div className="mt-3 max-h-48 overflow-y-auto rounded-2xl border border-night-900/10 bg-white">
            <ul className="divide-y divide-night-900/5 text-sm">
              {rows.map((r) => (
                <li key={r.email} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="truncate text-night-900/80">{r.email}</span>
                  <span className="shrink-0 text-xs text-night-900/45">{r.pseudo ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
