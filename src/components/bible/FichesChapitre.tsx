"use client";

import { useEffect, useMemo, useState } from "react";
import { asset } from "@/lib/asset";

/**
 * « Dans ce chapitre » — les personnages et les lieux dont parle le chapitre,
 * présentés en PILE de médaillons : un tap sur la pile fait défiler les
 * figures (au lieu d'une longue grille), et « Lire sa fiche » ouvre la fiche
 * complète : portrait, bio, passages clés et tous les chapitres où la figure
 * apparaît (navigation croisée). Les données viennent de
 * public/bible/fiches.json (pré-généré par scripts/build-fiches-index.mjs).
 */

export type Fiche = {
  nom: string;
  type: "personnage" | "lieu";
  bio: string;
  periode?: string;
  passages: [string, number, number][];
};
export type FichesData = {
  fiches: Record<string, Fiche>;
  chapitres: Record<string, string[]>;
  apparitions: Record<string, string[]>;
};

let dataPromise: Promise<FichesData | null> | null = null;
export function getFiches(): Promise<FichesData | null> {
  if (!dataPromise) {
    dataPromise = fetch(asset("/bible/fiches.json"))
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return dataPromise;
}

/** Médaillon : portrait si présent (img/bible/fiches/<id>.jpg), sinon un
 * monogramme élégant sur dégradé — remplacé au fur et à mesure des portraits. */
export function Medaillon({ id, fiche, size = "h-16 w-16" }: { id: string; fiche: Fiche; size?: string }) {
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
  dark = false,
}: {
  bookId: number;
  chapter: number;
  /** id → nom du livre (pour afficher « Apparaît aussi dans »). */
  bookNames: Record<number, string>;
  onNavigate: (bookId: number, chapter: number) => void;
  /** Vrai quand la page est sur un thème de lecture sombre. */
  dark?: boolean;
}) {
  const [data, setData] = useState<FichesData | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    getFiches().then(setData);
  }, []);
  // Nouvelle pile à chaque chapitre.
  useEffect(() => setIdx(0), [bookId, chapter]);

  // Personnages d'abord, puis lieux, alphabétique — l'ordre du défilement.
  const ordered = useMemo(() => {
    if (!data) return [];
    const ids = data.chapitres[`${bookId}-${chapter}`] ?? [];
    const of = (t: Fiche["type"]) =>
      ids
        .filter((id) => data.fiches[id]?.type === t)
        .sort((a, b) => data.fiches[a].nom.localeCompare(data.fiches[b].nom, "fr"));
    return [...of("personnage"), ...of("lieu")];
  }, [data, bookId, chapter]);

  if (!data || ordered.length === 0) return null;
  const i = ((idx % ordered.length) + ordered.length) % ordered.length;
  const currentId = ordered[i];
  const current = data.fiches[currentId];
  const open = openId ? data.fiches[openId] : null;
  // L'anneau entre les cartes de la pile reprend le fond de la page pour
  // dessiner un vrai espace entre les médaillons.
  const ring = dark ? "#171716" : "#F3F3ED";

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <p className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] ${dark ? "text-cream/40" : "text-night-900/40"}`}>
        <span className="h-px flex-1 bg-current opacity-30" />
        Dans ce chapitre
        <span className="h-px flex-1 bg-current opacity-30" />
      </p>

      {/* La pile de médaillons (tap = figure suivante) + la figure en cours */}
      <div className="mt-6 flex items-center gap-5">
        <button
          type="button"
          onClick={() => setIdx((v) => v + 1)}
          aria-label="Figure suivante"
          className="relative h-24 w-[7.75rem] shrink-0 active:scale-95"
          style={{ transition: "transform .15s" }}
        >
          {[2, 1, 0].map((n) => {
            if (n >= ordered.length) return null;
            const id = ordered[(i + n) % ordered.length];
            return (
              <span
                key={id}
                className="absolute top-0 block h-24 w-24 transition-all duration-300"
                style={{
                  left: `${(2 - n) * 14}px`,
                  zIndex: 30 - n * 10,
                  transform: `scale(${1 - n * 0.05})`,
                  boxShadow: `0 0 0 3px ${ring}`,
                  borderRadius: "9999px",
                }}
              >
                <Medaillon id={id} fiche={data.fiches[id]} size="h-24 w-24" />
              </span>
            );
          })}
        </button>

        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${dark ? "text-dawn-300" : "text-dawn-600"}`}>
            {current.type === "personnage" ? "Personnage" : "Lieu"} · {i + 1} / {ordered.length}
          </p>
          <h3 className={`mt-0.5 font-display text-xl font-extrabold leading-tight ${dark ? "text-cream" : "text-night-900"}`}>
            {current.nom}
          </h3>
          <p className={`mt-1 line-clamp-2 text-sm leading-relaxed ${dark ? "text-cream/70" : "text-night-900/70"}`}>
            {current.bio}
          </p>
          <button
            type="button"
            onClick={() => setOpenId(currentId)}
            className="mt-2.5 rounded-full bg-dawn-400 px-4 py-1.5 font-display text-xs font-bold text-night-950 shadow-card"
          >
            Lire sa fiche
          </button>
        </div>
      </div>
      {ordered.length > 1 ? (
        <p className={`mt-3 text-xs ${dark ? "text-cream/40" : "text-night-900/40"}`}>
          Touche la pile pour faire défiler les {ordered.length} figures du chapitre.
        </p>
      ) : null}

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
