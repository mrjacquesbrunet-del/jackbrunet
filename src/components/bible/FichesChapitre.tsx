"use client";

import { useEffect, useMemo, useState } from "react";
import { asset } from "@/lib/asset";

/**
 * « Dans ce chapitre » — les personnages et les lieux dont parle le chapitre,
 * en pastilles rondes. Un tap ouvre la fiche : portrait, bio, passages clés
 * et tous les chapitres où la figure apparaît (navigation croisée).
 * Les données viennent de public/bible/fiches.json (pré-généré par
 * scripts/build-fiches-index.mjs — aucun appel réseau externe).
 */

type Fiche = {
  nom: string;
  type: "personnage" | "lieu";
  bio: string;
  periode?: string;
  passages: [string, number, number][];
};
type FichesData = {
  fiches: Record<string, Fiche>;
  chapitres: Record<string, string[]>;
  apparitions: Record<string, string[]>;
};

let dataPromise: Promise<FichesData | null> | null = null;
function getFiches(): Promise<FichesData | null> {
  if (!dataPromise) {
    dataPromise = fetch(asset("/bible/fiches.json"))
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return dataPromise;
}

/** Médaillon : portrait si présent (img/bible/fiches/<id>.jpg), sinon un
 * monogramme élégant sur dégradé — remplacé au fur et à mesure des portraits. */
function Medaillon({ id, fiche, size = "h-16 w-16" }: { id: string; fiche: Fiche; size?: string }) {
  const [imgOk, setImgOk] = useState(true);
  const grad =
    fiche.type === "personnage"
      ? "linear-gradient(150deg,#8a5a2b,#5f3d1d)"
      : "linear-gradient(150deg,#365d7a,#1f3a4d)";
  return (
    <span className={`relative block ${size} overflow-hidden rounded-full border border-white/15 shadow-card`} style={{ background: grad }}>
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(`/img/bible/fiches/${id}.jpg`)}
          alt=""
          onError={() => setImgOk(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center font-display text-xl font-extrabold text-cream/90">
          {fiche.nom.replace(/^(Le |La |Les |L')/, "").charAt(0)}
        </span>
      )}
    </span>
  );
}

export function FichesChapitre({
  bookId,
  chapter,
  bookNames,
  onNavigate,
}: {
  bookId: number;
  chapter: number;
  /** id → nom du livre (pour afficher « Apparaît aussi dans »). */
  bookNames: Record<number, string>;
  onNavigate: (bookId: number, chapter: number) => void;
}) {
  const [data, setData] = useState<FichesData | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getFiches().then(setData);
  }, []);

  const ids = data?.chapitres[`${bookId}-${chapter}`] ?? [];
  const groups = useMemo(() => {
    if (!data) return [];
    const of = (t: Fiche["type"]) =>
      ids
        .filter((id) => data.fiches[id]?.type === t)
        .sort((a, b) => data.fiches[a].nom.localeCompare(data.fiches[b].nom, "fr"));
    return [
      { titre: "Personnages", ids: of("personnage") },
      { titre: "Lieux", ids: of("lieu") },
    ].filter((g) => g.ids.length > 0);
  }, [data, ids]);

  if (!data || ids.length === 0) return null;
  const open = openId ? data.fiches[openId] : null;

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <p className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-night-900/40">
        <span className="h-px flex-1 bg-current opacity-30" />
        Dans ce chapitre
        <span className="h-px flex-1 bg-current opacity-30" />
      </p>
      {groups.map((g) => (
        <div key={g.titre} className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
          {g.ids.map((id) => {
            const f = data.fiches[id];
            return (
              <button key={id} type="button" onClick={() => setOpenId(id)} className="group flex flex-col items-center gap-1.5 text-center">
                <span className="transition-transform group-active:scale-90">
                  <Medaillon id={id} fiche={f} />
                </span>
                <span className="line-clamp-2 text-[13px] font-bold leading-tight text-night-900/85">{f.nom}</span>
                <span className="-mt-1 text-[10px] font-semibold uppercase tracking-wide text-night-900/40">{g.titre}</span>
              </button>
            );
          })}
        </div>
      ))}

      {/* Fiche : feuille qui monte du bas */}
      {open && openId ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
          <button type="button" aria-label="Fermer" onClick={() => setOpenId(null)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
          <div className="dark-ctx relative flex max-h-[84vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
            <div className="overflow-y-auto px-5 pb-6 pt-5">
              <div className="flex items-start gap-4">
                <Medaillon id={openId} fiche={open} size="h-20 w-20" />
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dawn-400">
                    {open.type === "personnage" ? "Personnage" : "Lieu"}
                    {open.periode ? ` · ${open.periode}` : ""}
                  </p>
                  <h3 className="mt-0.5 font-display text-2xl font-extrabold leading-tight">{open.nom}</h3>
                </div>
                <button type="button" onClick={() => setOpenId(null)} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
                </button>
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-cream/85">{open.bio}</p>

              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Passages clés</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {open.passages.map(([label, l, c]) => (
                  <button
                    key={`${l}-${c}`}
                    type="button"
                    onClick={() => {
                      setOpenId(null);
                      onNavigate(l, c);
                    }}
                    className="rounded-full bg-dawn-400 px-3.5 py-2 font-display text-sm font-bold text-night-950"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {(() => {
                const apps = data.apparitions[openId] ?? [];
                if (apps.length <= 1) return null;
                const shown = apps.slice(0, 18);
                return (
                  <>
                    <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">
                      Apparaît dans {apps.length} chapitre{apps.length > 1 ? "s" : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {shown.map((key) => {
                        const [l, c] = key.split("-").map(Number);
                        const here = l === bookId && c === chapter;
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={here}
                            onClick={() => {
                              setOpenId(null);
                              onNavigate(l, c);
                            }}
                            className={`rounded-full px-2.5 py-1.5 text-xs font-bold ${
                              here ? "bg-dawn-400/25 text-dawn-300" : "bg-white/[0.07] text-cream/80 hover:bg-white/15"
                            }`}
                          >
                            {bookNames[l] ?? l} {c}
                          </button>
                        );
                      })}
                      {apps.length > shown.length ? (
                        <span className="rounded-full px-2 py-1.5 text-xs font-semibold text-cream/45">
                          +{apps.length - shown.length} autres
                        </span>
                      ) : null}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
