"use client";

import { useEffect, useState } from "react";
import {
  dateZoom,
  getZoomBatisseurs,
  listSoutiens,
  setZoomBatisseurs,
  type SoutienAdmin,
} from "@/lib/batisseurs";
import { IconeBatisseur } from "@/components/community/BatisseurBadge";

/** « 2026-11-06T20:00 » (heure locale) pour un champ datetime-local. */
function versChamp(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Espace admin → Bâtisseurs : réglage du Zoom mensuel (date + lien, visibles
 * dans le profil des Bâtisseurs) et liste des soutiens reçus dans l'app.
 */
export function AdminBatisseurs() {
  const [date, setDate] = useState("");
  const [lien, setLien] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [soutiens, setSoutiens] = useState<SoutienAdmin[] | null | undefined>(undefined);

  useEffect(() => {
    getZoomBatisseurs().then((z) => {
      if (!z) return;
      setDate(versChamp(z.prochaine_date));
      setLien(z.lien ?? "");
      setMessage(z.message ?? "");
    });
    listSoutiens().then(setSoutiens);
  }, []);

  async function enregistrer() {
    setBusy(true);
    setMsg("");
    const ok = await setZoomBatisseurs({
      prochaine_date: date ? new Date(date).toISOString() : null,
      lien: lien.trim() || null,
      message: message.trim() || null,
    });
    setBusy(false);
    setMsg(ok ? "Enregistré : les Bâtisseurs le voient dans leur profil." : "Échec : as-tu exécuté le SQL des Bâtisseurs ?");
  }

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
        Les membres qui soutiennent l&apos;app reçoivent le badge et l&apos;accès au Zoom mensuel.
      </p>

      {/* Zoom du mois */}
      <div className="mt-4 rounded-2xl border border-night-900/10 bg-[#FAFAF6] p-4">
        <p className="font-display text-[15px] font-extrabold">Prochain Zoom</p>
        <label className="mt-3 block text-xs font-bold text-night-900/55">Date et heure</label>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="field mt-1 w-full" />
        <label className="mt-3 block text-xs font-bold text-night-900/55">Lien Zoom</label>
        <input
          type="url"
          value={lien}
          onChange={(e) => setLien(e.target.value)}
          placeholder="https://zoom.us/j/…"
          className="field mt-1 w-full"
        />
        <label className="mt-3 block text-xs font-bold text-night-900/55">Petit mot (facultatif)</label>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex. Thème : la prière qui change tout"
          className="field mt-1 w-full"
        />
        {date ? <p className="mt-2 text-xs text-night-900/55">Affiché : « Prochain rendez-vous : {dateZoom(new Date(date).toISOString())} »</p> : null}
        <button type="button" onClick={enregistrer} disabled={busy} className="btn-primary mt-3 text-sm">
          {busy ? "…" : "Enregistrer"}
        </button>
        {msg ? <p className="mt-2 text-sm font-semibold text-spirit-700">{msg}</p> : null}
      </div>

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
