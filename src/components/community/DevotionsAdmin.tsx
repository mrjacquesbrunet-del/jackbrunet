"use client";

import { useEffect, useState } from "react";
import { getDevotions } from "@/lib/content";
import {
  adminListDevotions,
  adminSaveDevotion,
  adminDeleteDevotion,
  adminSeedDevotions,
  type DbDevotion,
} from "@/lib/devotions";
import { BookGlyph } from "@/components/ui/DevoIcons";

/** Formulaire d'édition d'un dévotionnel (tous les champs). */
function DevotionForm({
  value,
  onCancel,
  onSaved,
}: {
  value: DbDevotion;
  onCancel: () => void;
  onSaved: (d: DbDevotion) => void;
}) {
  const [d, setD] = useState<DbDevotion>(value);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = <K extends keyof DbDevotion>(k: K, v: DbDevotion[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  async function save() {
    if (!d.theme.trim()) {
      setErr("Donne au moins un thème.");
      return;
    }
    setBusy(true);
    setErr("");
    const ok = await adminSaveDevotion({
      ...d,
      questions: d.questions.map((q) => q.trim()).filter(Boolean),
    });
    setBusy(false);
    if (ok) onSaved(d);
    else setErr("Enregistrement impossible (vérifie la migration SQL devotions).");
  }

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-spirit-500/30 bg-cream/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-spirit-600">
          Jour {d.position + 1}
        </span>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={d.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          Publié
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-night-900/60">Thème</span>
        <input
          value={d.theme}
          onChange={(e) => set("theme", e.target.value)}
          className="field mt-1 w-full"
          placeholder="Ex. S'enraciner en Jésus"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="text-xs font-semibold text-night-900/60">Verset (texte)</span>
          <textarea
            value={d.verseText}
            onChange={(e) => set("verseText", e.target.value)}
            rows={2}
            className="field mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-night-900/60">Référence</span>
          <input
            value={d.verseReference}
            onChange={(e) => set("verseReference", e.target.value)}
            className="field mt-1 w-full sm:w-44"
            placeholder="Colossiens 2.6-7"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-night-900/60">Punchline (carte à partager)</span>
        <textarea
          value={d.punchline}
          onChange={(e) => set("punchline", e.target.value)}
          rows={2}
          className="field mt-1 w-full"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-night-900/60">
          Exhortation / méditation
        </span>
        <span className="block text-[11px] text-night-900/45">
          Sépare les paragraphes par une ligne vide.
        </span>
        <textarea
          value={d.meditation}
          onChange={(e) => set("meditation", e.target.value)}
          rows={8}
          className="field mt-1 w-full"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="text-xs font-semibold text-night-900/60">
            Déclaration (à déclarer sur ta vie)
          </span>
          <textarea
            value={d.declarationText}
            onChange={(e) => set("declarationText", e.target.value)}
            rows={2}
            className="field mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-night-900/60">Référence</span>
          <input
            value={d.declarationReference}
            onChange={(e) => set("declarationReference", e.target.value)}
            className="field mt-1 w-full sm:w-44"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-night-900/60">Questions</span>
        <span className="block text-[11px] text-night-900/45">Une question par ligne.</span>
        <textarea
          value={d.questions.join("\n")}
          onChange={(e) => set("questions", e.target.value.split("\n"))}
          rows={4}
          className="field mt-1 w-full"
        />
      </label>

      {err ? <p className="text-sm font-semibold text-red-600">{err}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={busy} className="btn-primary text-sm">
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">
          Annuler
        </button>
      </div>
    </div>
  );
}

/**
 * Espace admin: gestion totale des dévotionnels (écrire, modifier, ajouter,
 * supprimer). Les modifications sont en direct (OTA), sans reconstruire.
 */
export function DevotionsAdmin() {
  const [list, setList] = useState<DbDevotion[] | null>(null);
  const [editing, setEditing] = useState<number | null>(null); // position en édition
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function reload() {
    const rows = await adminListDevotions();
    setList(rows ?? []);
  }

  useEffect(() => {
    reload();
  }, []);

  async function seed() {
    if (!confirm("Importer tes 60 dévotionnels existants dans la base pour pouvoir les modifier?"))
      return;
    setBusy(true);
    setMsg("");
    const n = await adminSeedDevotions(getDevotions());
    setBusy(false);
    setMsg(
      n > 0
        ? `✓ ${n} dévotionnel${n > 1 ? "s" : ""} importé${n > 1 ? "s" : ""}. Tu peux les modifier.`
        : "Rien à importer (déjà présents) ou import impossible.",
    );
    await reload();
  }

  function addNew() {
    const nextPos = list && list.length > 0 ? Math.max(...list.map((d) => d.position)) + 1 : 0;
    setEditing(nextPos);
  }

  async function remove(position: number) {
    if (!confirm(`Supprimer le dévotionnel du jour ${position + 1}?`)) return;
    setBusy(true);
    await adminDeleteDevotion(position);
    setBusy(false);
    if (editing === position) setEditing(null);
    await reload();
  }

  const editingDev: DbDevotion | null =
    editing === null
      ? null
      : (list?.find((d) => d.position === editing) ?? {
          position: editing,
          theme: "",
          verseText: "",
          verseReference: "",
          punchline: "",
          meditation: "",
          declarationText: "",
          declarationReference: "",
          questions: [],
          published: true,
        });

  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <BookGlyph className="h-5 w-5 text-spirit-600" />
        Dévotionnels
      </h2>
      <p className="mt-1 text-sm text-night-900/60">
        Écris, modifie, ajoute ou supprime tes méditations quotidiennes. Tout est en direct,
        sans reconstruire l&apos;application.
      </p>

      {list === null ? (
        <p className="mt-4 text-sm text-night-900/50">Chargement…</p>
      ) : list.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dawn-400/40 bg-cream/60 p-4">
          <p className="text-sm text-night-900/70">
            La base est vide : l&apos;app affiche tes 60 dévotionnels intégrés. Importe-les ici
            pour pouvoir les modifier, en ajouter ou en supprimer.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={seed} disabled={busy} className="btn-primary text-sm">
              {busy ? "Import…" : "Importer mes 60 dévotionnels"}
            </button>
            <button type="button" onClick={addNew} className="btn-ghost text-sm">
              Ou partir de zéro
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={addNew} className="btn-primary text-sm">
              + Nouveau dévotionnel
            </button>
            <span className="text-sm text-night-900/55">
              {list.length} dévotionnel{list.length > 1 ? "s" : ""} en base
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {list.map((d) => (
              <li key={d.position}>
                <div className="flex items-center gap-3 rounded-2xl border border-night-900/10 bg-cream/40 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-night-900/[0.06] font-display text-sm font-bold text-night-900/60">
                    {d.position + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-night-900">
                      {d.theme || "(sans thème)"}
                    </p>
                    <p className="truncate text-xs text-night-900/50">{d.verseReference}</p>
                  </div>
                  {!d.published ? (
                    <span className="shrink-0 rounded-full bg-night-900/10 px-2 py-0.5 text-[11px] font-semibold text-night-900/50">
                      Brouillon
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setEditing(editing === d.position ? null : d.position)}
                    className="shrink-0 text-sm font-semibold text-spirit-600"
                  >
                    {editing === d.position ? "Fermer" : "Modifier"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(d.position)}
                    aria-label="Supprimer"
                    className="shrink-0 text-night-900/30 transition-colors hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
                {editing === d.position && editingDev ? (
                  <DevotionForm
                    value={editingDev}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                      setEditing(null);
                      setMsg("✓ Dévotionnel enregistré. C'est en ligne.");
                      reload();
                    }}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Formulaire de création (nouvelle position hors liste) */}
      {editingDev && editing !== null && !list?.some((d) => d.position === editing) ? (
        <DevotionForm
          value={editingDev}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setMsg("✓ Dévotionnel créé. C'est en ligne.");
            reload();
          }}
        />
      ) : null}

      {msg ? <p className="mt-3 text-sm font-semibold text-spirit-700">{msg}</p> : null}
    </div>
  );
}
