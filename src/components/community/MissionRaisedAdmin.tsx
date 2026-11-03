"use client";

import { useEffect, useState } from "react";
import { getMissionStats, setMissionRaised, getBenevolesStats, setBenevolesRaised, OBJECTIF_BENEVOLES } from "@/lib/mission";

/**
 * Réglage admin: montant collecté pour la Mission Madagascar. La valeur est
 * enregistrée dans Supabase et se reflète EN DIRECT sur la page publique
 * (barre de progression + pourcentage), sans reconstruire le site.
 */
export function MissionRaisedAdmin() {
  const [val, setVal] = useState("");
  const [obj, setObj] = useState(15000);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  // 2e jauge : participation aux frais des bénévoles.
  const [valB, setValB] = useState("");
  const [objB, setObjB] = useState(OBJECTIF_BENEVOLES);
  const [msgB, setMsgB] = useState("");

  useEffect(() => {
    getMissionStats().then((s) => {
      if (s) {
        setVal(String(s.raised));
        if (s.objective > 0) setObj(s.objective);
      }
    });
    getBenevolesStats().then((s) => {
      if (s) {
        setValB(String(s.raised));
        if (s.objective > 0) setObjB(s.objective);
      } else setMsgB("Lance d'abord le SQL migration-mission-benevoles.sql.");
    });
  }, []);

  async function saveB() {
    const n = Math.max(0, Math.round(Number(valB.replace(",", ".")) || 0));
    setBusy(true);
    setMsgB("");
    const ok = await setBenevolesRaised(n);
    setBusy(false);
    setValB(String(n));
    setMsgB(ok ? "Montant mis à jour. C'est déjà en ligne." : "Échec. Réessaie.");
    setTimeout(() => setMsgB(""), 3000);
  }
  const percentB = objB > 0 ? Math.round(((Number(valB) || 0) / objB) * 100) : 0;

  async function save() {
    const n = Math.max(0, Math.round(Number(val.replace(",", ".")) || 0));
    setBusy(true);
    setMsg("");
    const ok = await setMissionRaised(n);
    setBusy(false);
    setVal(String(n));
    setMsg(ok? "Montant mis à jour. C'est déjà en ligne." : "Échec. Réessaie.");
    setTimeout(() => setMsg(""), 3000);
  }

  const percent = obj > 0? Math.round(((Number(val) || 0) / obj) * 100): 0;

  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-spirit-500/15 text-spirit-600">€</span>
        Collecte Mission Madagascar
      </h2>
      <p className="mt-1 text-sm text-night-900/60">
        Entre le total reçu (ce que tu vois sur Stripe). La barre et le pourcentage se
        mettent à jour tout de suite sur le site, sans reconstruire.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="field w-40 pr-9"
            placeholder="0"
            aria-label="Montant collecté en euros"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-night-900/40">€</span>
        </div>
        <span className="text-sm text-night-900/55">sur {obj.toLocaleString("fr-FR")} € ({percent}%)</span>
        <button type="button" onClick={save} disabled={busy} className="btn-primary text-sm">
          {busy? "…": "Enregistrer"}
        </button>
      </div>
      {msg? <p className="mt-2 text-sm font-semibold text-spirit-600">{msg}</p>: null}

      <h3 className="mt-6 font-display text-lg font-bold">Participation aux frais des bénévoles</h3>
      <p className="mt-1 text-sm text-night-900/60">
        2e jauge sur la page : billets d&apos;avion payés par les bénévoles (7 × 900 € + 5 × 1 570 € = {objB.toLocaleString("fr-FR")} €).
        Entre ce qui a été reçu pour eux.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={valB}
            onChange={(e) => setValB(e.target.value)}
            className="field w-40 pr-9"
            placeholder="0"
            aria-label="Montant reçu pour les bénévoles en euros"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-night-900/40">€</span>
        </div>
        <span className="text-sm text-night-900/55">sur {objB.toLocaleString("fr-FR")} € ({percentB}%)</span>
        <button type="button" onClick={saveB} disabled={busy} className="btn-primary text-sm">
          {busy? "…": "Enregistrer"}
        </button>
      </div>
      {msgB ? <p className="mt-2 text-sm font-semibold text-spirit-600">{msgB}</p> : null}
    </div>
  );
}
