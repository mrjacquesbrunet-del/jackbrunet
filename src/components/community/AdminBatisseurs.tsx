"use client";

import { useEffect, useState } from "react";
import { listSoutiens, type SoutienAdmin } from "@/lib/batisseurs";
import { IconeBatisseur } from "@/components/community/BatisseurBadge";

/**
 * Espace admin → Bâtisseurs : les soutiens reçus dans l'app (qui, combien),
 * pour savoir qui inviter au Zoom mensuel.
 */
export function AdminBatisseurs() {
  const [soutiens, setSoutiens] = useState<SoutienAdmin[] | null | undefined>(undefined);

  useEffect(() => {
    listSoutiens().then(setSoutiens);
  }, []);

  const batisseurs = new Set((soutiens ?? []).map((s) => s.user_id).filter(Boolean)).size;
  const totaux = (soutiens ?? []).reduce<Record<string, number>>((acc, s) => {
    const dev = s.devise ?? "EUR";
    acc[dev] = (acc[dev] ?? 0) + Number(s.montant ?? 0);
    return acc;
  }, {});

  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <IconeBatisseur className="h-5 w-5 text-spirit-600" />
        Bâtisseurs
      </h2>
      <p className="mt-1 text-sm text-night-900/60">
        Les membres qui soutiennent l&apos;app reçoivent le badge. Voici qui inviter au Zoom mensuel.
      </p>

      {/* Soutiens reçus */}
      <div className="mt-4">
        {soutiens === undefined ? (
          <p className="text-sm text-night-900/50">Chargement…</p>
        ) : soutiens === null ? (
          <p className="text-sm text-night-900/50">Liste indisponible : exécute d&apos;abord le SQL des soutiens.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(
                [
                  [String(batisseurs), "Bâtisseurs"],
                  [String(soutiens.length), "soutiens"],
                  [
                    Object.entries(totaux)
                      .map(([d, v]) => v.toLocaleString("fr-FR", { style: "currency", currency: d }))
                      .join(" + ") || "0 €",
                    "brut reçu",
                  ],
                ] as [string, string][]
              ).map(([v, l]) => (
                <div key={l} className="rounded-xl bg-night-900/[0.04] p-3">
                  <p className="font-display text-lg font-extrabold">{v}</p>
                  <p className="text-[11px] font-bold text-night-900/55">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-night-900/45">
              Montants avant la commission d&apos;Apple ou de Google (15 %).
            </p>
            <ul className="mt-3 divide-y divide-night-900/5">
              {soutiens.slice(0, 30).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="min-w-0 truncate font-semibold">{s.pseudo ?? "Anonyme (non connecté)"}</span>
                  <span className="shrink-0 text-night-900/55">
                    {Number(s.montant ?? 0).toLocaleString("fr-FR", { style: "currency", currency: s.devise ?? "EUR" })} ·{" "}
                    {new Date(s.created_at).toLocaleDateString("fr-FR")} · {s.plateforme === "ios" ? "iPhone" : "Android"}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
