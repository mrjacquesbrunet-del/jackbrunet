"use client";

import { useEffect, useState } from "react";
import { compterBatisseursActifs, dateZoom, envoyerInvitationZoom, listSoutiens, type SoutienAdmin } from "@/lib/batisseurs";
import { IconeBatisseur } from "@/components/community/BatisseurBadge";

/**
 * Espace admin → Bâtisseurs : envoi de l'invitation au Zoom mensuel
 * (notification + push + e-mail) et liste des soutiens reçus dans l'app.
 */
export function AdminBatisseurs() {
  const [soutiens, setSoutiens] = useState<SoutienAdmin[] | null | undefined>(undefined);
  const [date, setDate] = useState("");
  const [lien, setLien] = useState("");
  const [mot, setMot] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [retour, setRetour] = useState("");

  useEffect(() => {
    listSoutiens().then(setSoutiens);
  }, []);

  const souscrits = new Set((soutiens ?? []).map((s) => s.user_id).filter(Boolean)).size;
  const [actifs, setActifs] = useState<number | null>(null);
  useEffect(() => {
    compterBatisseursActifs().then(setActifs);
  }, []);

  async function inviter() {
    if (!/^https?:\/\//i.test(lien.trim())) {
      setRetour("Colle le lien Zoom complet (il commence par https://).");
      return;
    }
    const quand = date ? dateZoom(new Date(date).toISOString()) : "";
    if (!confirm(`Envoyer l'invitation${quand ? ` du ${quand}` : ""} à tous les Bâtisseurs (app + e-mail) ?`)) return;
    setEnvoi(true);
    setRetour("");
    try {
      const r = await envoyerInvitationZoom({ date: date ? new Date(date).toISOString() : null, lien, message: mot });
      setRetour(
        `Notification envoyée à ${r.notifies} Bâtisseur${r.notifies > 1 ? "s" : ""}. ` +
          (r.emails !== null
            ? `E-mail envoyé à ${r.emails}.`
            : `E-mail non envoyé (${r.erreurEmail ?? "fonction invite-batisseurs absente"}).`),
      );
    } catch {
      setRetour("Échec de l'envoi : as-tu exécuté le SQL des invitations ?");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <IconeBatisseur className="h-5 w-5 text-spirit-600" />
        Bâtisseurs
      </h2>
      <p className="mt-1 text-sm text-night-900/60">
        Les membres qui soutiennent l&apos;app reçoivent le badge et l&apos;invitation au Zoom mensuel.
      </p>

      {/* Inviter au Zoom */}
      <div className="mt-4 rounded-2xl border border-night-900/10 bg-[#FAFAF6] p-4">
        <p className="font-display text-[15px] font-extrabold">Inviter au Zoom du mois</p>
        <p className="mt-0.5 text-xs text-night-900/55">
          Chaque Bâtisseur reçoit une notification dans l&apos;app et un e-mail avec le lien.
        </p>
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
          value={mot}
          onChange={(e) => setMot(e.target.value)}
          placeholder="Ex. Thème : la prière qui change tout"
          className="field mt-1 w-full"
        />
        <button type="button" onClick={inviter} disabled={envoi || !lien.trim()} className="btn-primary mt-3 text-sm disabled:opacity-50">
          {envoi ? "Envoi…" : "Envoyer l'invitation"}
        </button>
        {retour ? <p className="mt-2 text-sm font-semibold text-spirit-700">{retour}</p> : null}
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
                  [actifs === null ? "—" : String(actifs), "Bâtisseurs actifs"],
                  [String(souscrits), "abonnés via l'app"],
                  [String(soutiens.length), "souscriptions"],
                ] as [string, string][]
              ).map(([v, l]) => (
                <div key={l} className="rounded-xl bg-night-900/[0.04] p-3">
                  <p className="font-display text-lg font-extrabold">{v}</p>
                  <p className="text-[11px] font-bold text-night-900/55">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-night-900/45">
              Les montants réellement encaissés (renouvellements compris) sont dans App Store Connect et la
              Play Console, rubriques Paiements.
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
