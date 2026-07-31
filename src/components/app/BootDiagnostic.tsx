"use client";

import { useState } from "react";
import { getBootLogs, formatBootLogs, type BootLog } from "@/lib/boot-trace";
import { isNativeApp } from "@/lib/notifications";

/**
 * Diagnostic de démarrage (repliable, discret, app native uniquement).
 * Affiche la « boîte noire » des 3 derniers lancements pour comprendre les
 * blocages au démarrage (écran olive). L'utilisateur peut copier le journal
 * et l'envoyer au support. Aucune donnée personnelle : uniquement des étapes
 * techniques horodatées.
 */
export function BootDiagnostic() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<BootLog[]>([]);
  const [copied, setCopied] = useState(false);

  if (typeof window !== "undefined" && !isNativeApp()) return null;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) setLogs(getBootLogs().slice().reverse());
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(formatBootLogs());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={toggle}
        className="text-xs font-semibold text-night-900/35 hover:underline"
      >
        {open ? "Masquer le diagnostic" : "Diagnostic de démarrage"}
      </button>

      {open ? (
        <div className="mt-3 rounded-2xl border border-night-900/10 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-night-900/70">3 derniers lancements</p>
            <button
              type="button"
              onClick={copy}
              className="rounded-full bg-night-900/5 px-3 py-1 text-xs font-semibold text-night-900"
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>
          <div className="mt-2 max-h-64 space-y-3 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-night-900/45">Aucun journal pour l'instant.</p>
            ) : (
              logs.map((b) => (
                <div key={b.start}>
                  <p className="text-[11px] font-bold text-night-900/60">
                    Lancement du{" "}
                    {new Date(b.start).toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                  {b.entries.length === 0 ? (
                    <p className="text-[11px] text-red-600">(aucune étape enregistrée)</p>
                  ) : (
                    <ul className="mt-0.5 space-y-0.5">
                      {b.entries.map((e, i) => (
                        <li key={i} className="font-mono text-[11px] leading-snug text-night-900/70">
                          +{e.t - b.start}ms {e.s}
                          {e.d ? ` · ${e.d}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
