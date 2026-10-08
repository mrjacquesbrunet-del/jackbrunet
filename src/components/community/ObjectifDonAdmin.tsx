"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { progressionDon } from "@/lib/soutien";

/**
 * Réglage admin : objectif du « Don libre » (onglet Soutien de l'app). La barre
 * se remplit toute seule à chaque don Apple / Google ; ici on règle le titre,
 * le montant visé et si l'objectif repart à zéro chaque mois.
 */
export function ObjectifDonAdmin() {
  const [titre, setTitre] = useState("Objectif du mois");
  const [montant, setMontant] = useState("10000");
  const [mensuel, setMensuel] = useState(true);
  const [horsApp, setHorsApp] = useState("0");
  const [collecte, setCollecte] = useState<{ eur: number; dons: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getSupabase()
      ?.from("objectif_don")
      .select("ajout_manuel_eur")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => data && setHorsApp(String(Number(data.ajout_manuel_eur) || 0)));
    progressionDon().then((o) => {
      if (!o) return;
      setTitre(o.titre);
      setMontant(String(o.objectif));
      setMensuel(o.mensuel);
      setCollecte({ eur: o.collecte, dons: o.dons });
    });
  }, []);

  async function save() {
    const n = Math.max(1, Math.round(Number(montant.replace(",", ".")) || 0));
    const h = Math.max(0, Math.round(Number(horsApp.replace(",", ".")) || 0));
    setBusy(true);
    setMsg("");
    const sb = getSupabase();
    const { error } = (await sb
      ?.from("objectif_don")
      .update({
        titre: titre.trim() || (mensuel ? "Objectif du mois" : "Objectif"),
        montant_eur: n,
        periode: mensuel ? "mensuel" : "total",
        ajout_manuel_eur: h,
        ajout_le: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)) ?? { error: true };
    setBusy(false);
    setMontant(String(n));
    setMsg(error ? "Échec. As-tu lancé le SQL du don libre ?" : "Objectif mis à jour. C'est déjà en ligne.");
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-spirit-500/15 text-spirit-600">€</span>
        Objectif du don libre (app)
      </h2>
      <p className="mt-1 text-sm text-night-900/60">
        La barre additionne les dons libres Apple / Google, les Bâtisseurs actifs, les contributions
        faites sur le site par Stripe (automatique, hors Mission Madagascar) et ce que tu saisis
        ci-dessous (virements, espèces…).
        {collecte ? ` En ce moment : ${collecte.eur.toLocaleString("fr-FR")} € (${collecte.dons} contributions).` : ""}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} className="field" placeholder="Titre affiché" aria-label="Titre de l'objectif" />
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            min={1}
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="field w-full pr-9"
            aria-label="Objectif en euros"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-night-900/40">€</span>
        </div>
      </div>
      <label className="mt-3 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
          Autres contributions {mensuel ? "ce mois-ci" : "depuis le début"} (virements, espèces… pas Stripe)
        </span>
        <div className="relative mt-1 w-48">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={horsApp}
            onChange={(e) => setHorsApp(e.target.value)}
            className="field w-full pr-9"
            aria-label="Reçu hors de l'app en euros"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-night-900/40">€</span>
        </div>
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={mensuel} onChange={(e) => setMensuel(e.target.checked)} />
          Repart à zéro chaque mois
        </label>
        <button type="button" onClick={save} disabled={busy} className="btn-primary text-sm">
          {busy ? "…" : "Enregistrer"}
        </button>
      </div>
      {msg ? <p className="mt-2 text-sm font-semibold text-spirit-600">{msg}</p> : null}
    </div>
  );
}
