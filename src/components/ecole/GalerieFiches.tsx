"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";
import { FicheCorps, getFiches, type Fiche, type FichesData } from "@/components/bible/FichesChapitre";

/**
 * GALERIE DES PERSONNAGES & LIEUX — page cachée de la Formation biblique.
 *
 * On choisit un livre (de la Genèse à l'Apocalypse), puis on fait défiler les
 * fiches en cartes plein écran, à gauche et à droite : portrait, nom, tribu,
 * puis toute la fiche (bio, famille & liens, parcours, histoire, passages).
 * Dans un livre, les figures sont rangées par ordre d'entrée en scène.
 * Un tap sur un lien de parenté amène directement à la carte de la personne.
 */

type Mode = "personnage" | "lieu";
type Livre = { id: number; name: string };
const MEMO = "jb.galerie.v1";

/** Figures de l'Ancien Testament qui AGISSENT dans le Nouveau (pas seulement
 * citées) : elles restent dans le fil du récit. */
const ACTIFS_NT = new Set(["satan", "gabriel", "michel-archange", "elie", "moise"]);

/** Vrai si la figure, venue de l'Ancien Testament, n'est que citée dans ce
 * livre du Nouveau : elle passe en fin de livre. */
function estCite(data: FichesData, id: string, livre: number): boolean {
  if (livre < 40 || ACTIFS_NT.has(id) || data.fiches[id]?.type !== "personnage") return false;
  const l = premierLivre(data, id);
  return l != null && l < 40;
}

/** Les fiches d'un livre, dans l'ordre où elles entrent en scène (au verset
 * près), les simples citations de l'Ancien Testament à la fin. */
function fichesDuLivre(data: FichesData, livre: number, mode: Mode): string[] {
  let base = data.ordre?.[livre];
  if (!base) {
    // Repli (ancien index) : premier chapitre d'apparition dans le livre.
    const premier: Record<string, number> = {};
    for (const [id, apps] of Object.entries(data.apparitions)) {
      const k = apps.find((a) => Number(a.split("-")[0]) === livre);
      if (k) premier[id] = Number(k.split("-")[1]);
    }
    base = Object.keys(premier).sort((a, b) => premier[a] - premier[b]);
  }
  const ids = base.filter((id) => data.fiches[id]?.type === mode);
  return [...ids.filter((id) => !estCite(data, id, livre)), ...ids.filter((id) => estCite(data, id, livre))];
}

/** Premier livre où la figure apparaît (pour y sauter depuis un lien). */
function premierLivre(data: FichesData, id: string): number | null {
  const k = data.apparitions[id]?.[0];
  return k ? Number(k.split("-")[0]) : null;
}

export function GalerieFiches() {
  const router = useRouter();
  const [data, setData] = useState<FichesData | null>(null);
  const [livres, setLivres] = useState<Livre[]>([]);
  const [mode, setMode] = useState<Mode>("personnage");
  const [livre, setLivre] = useState(1);
  const [idx, setIdx] = useState(0);
  // Carte à afficher une fois le paquet (re)construit.
  const cible = useRef<number>(0);
  const deckRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFiches().then(setData);
    fetch(asset("/bible/index.json"))
      .then((r) => (r.ok ? r.json() : []))
      .then((b: Livre[]) => setLivres(b.map(({ id, name }) => ({ id, name }))))
      .catch(() => setLivres([]));
    try {
      const m = JSON.parse(sessionStorage.getItem(MEMO) ?? "null");
      if (m) {
        setMode(m.mode === "lieu" ? "lieu" : "personnage");
        setLivre(Number(m.livre) || 1);
        cible.current = Number(m.idx) || 0;
      }
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const bookNames = useMemo(() => Object.fromEntries(livres.map((b) => [b.id, b.name])), [livres]);

  // Les livres qui ont au moins une fiche du type choisi, avec leur nombre.
  const comptes = useMemo(() => {
    const out: Record<number, number> = {};
    if (!data) return out;
    for (const b of livres) {
      const n = fichesDuLivre(data, b.id, mode).length;
      if (n) out[b.id] = n;
    }
    return out;
  }, [data, livres, mode]);

  const ids = useMemo(() => (data ? fichesDuLivre(data, livre, mode) : []), [data, livre, mode]);
  const suivant = useMemo(() => livres.find((b) => b.id > livre && comptes[b.id]), [livres, livre, comptes]);

  // Paquet (re)construit : on se place sur la carte voulue, sans animation.
  useLayoutEffect(() => {
    const el = deckRef.current;
    if (!el || !ids.length) return;
    const i = Math.min(cible.current, ids.length - 1);
    el.scrollTo({ left: i * el.clientWidth, behavior: "auto" });
    setIdx(i);
    cible.current = 0;
  }, [ids]);

  // Mémorise la position (retour depuis la Bible).
  useEffect(() => {
    try {
      sessionStorage.setItem(MEMO, JSON.stringify({ mode, livre, idx }));
    } catch {
      /* stockage indisponible */
    }
  }, [mode, livre, idx]);

  // La puce du livre courant reste visible.
  useEffect(() => {
    chipsRef.current?.querySelector(`[data-livre="${livre}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [livre, mode, comptes]);

  const onScroll = () => {
    const el = deckRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };

  const allerA = useCallback((i: number) => {
    const el = deckRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }, []);

  const changerLivre = (b: number, i = 0) => {
    // Livre déjà ouvert : on revient simplement à la carte demandée.
    if (b === livre) return allerA(i);
    cible.current = i;
    setLivre(b);
  };

  const changerMode = (m: Mode) => {
    if (m === mode || !data) return;
    // On garde le livre s'il contient des fiches de l'autre type.
    const garde = livres.find((b) => b.id === livre && fichesDuLivre(data, b.id, m).length);
    const premier = livres.find((b) => fichesDuLivre(data, b.id, m).length);
    cible.current = 0;
    setMode(m);
    setLivre(garde?.id ?? premier?.id ?? 1);
  };

  // Lien de parenté / tribu : on saute à la carte de la personne.
  const ouvrir = (id: string) => {
    if (!data?.fiches[id]) return;
    const i = ids.indexOf(id);
    if (i >= 0 && data.fiches[id].type === mode) return allerA(i);
    const l = premierLivre(data, id);
    if (l == null) return;
    const m = data.fiches[id].type;
    cible.current = Math.max(0, fichesDuLivre(data, l, m).indexOf(id));
    setMode(m);
    setLivre(l);
  };

  const lire = (l: number, c: number) => router.push(`/bible?livre=${l}&chap=${c}`);

  const nomLivre = bookNames[livre] ?? "";
  const total = ids.length;

  return (
    <div className="dark-ctx fixed inset-0 z-[70] flex flex-col bg-night-950 text-cream">
      {/* En-tête */}
      <header className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link href="/ecole" aria-label="Retour à la Formation" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">Formation biblique</p>
            <h1 className="font-display text-xl font-extrabold leading-tight">Personnages &amp; lieux</h1>
          </div>
        </div>

        {/* Personnages / Lieux */}
        <div className="mx-auto mt-3 flex max-w-lg rounded-full border border-white/10 bg-white/[0.05] p-1">
          {(
            [
              ["personnage", "Personnages"],
              ["lieu", "Lieux"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => changerMode(m)}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
                mode === m ? "bg-dawn-400 text-night-950" : "text-cream/65"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Les livres, de la Genèse à l'Apocalypse */}
        <div ref={chipsRef} className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {livres
            .filter((b) => comptes[b.id])
            .map((b) => {
              const actif = b.id === livre;
              return (
                <button
                  key={b.id}
                  type="button"
                  data-livre={b.id}
                  onClick={() => changerLivre(b.id)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
                    actif ? "border-dawn-400 bg-dawn-400/15 text-dawn-300" : "border-white/12 text-cream/70"
                  }`}
                >
                  {b.name}
                  <span className={`ml-1.5 text-[11px] ${actif ? "text-dawn-300/80" : "text-cream/40"}`}>{comptes[b.id]}</span>
                </button>
              );
            })}
        </div>

        {/* Position dans le livre */}
        <div className="mx-auto mt-2 flex max-w-lg items-center justify-between text-xs font-bold text-cream/55">
          <span className="truncate">
            {nomLivre}
            {total ? ` · ${Math.min(idx + 1, total)} / ${total}` : ""}
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              aria-label="Fiche précédente"
              disabled={idx <= 0}
              onClick={() => allerA(idx - 1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/15 disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              type="button"
              aria-label="Fiche suivante"
              disabled={idx >= total}
              onClick={() => allerA(idx + 1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/15 disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </span>
        </div>
      </header>

      {/* Le paquet de cartes : on glisse à gauche et à droite */}
      <div
        ref={deckRef}
        onScroll={onScroll}
        className="no-scrollbar mt-2 flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {!data ? (
          <p className="m-auto text-sm text-cream/50">Chargement des fiches…</p>
        ) : (
          <>
            {ids.map((id, i) => (
              <div key={id} className="h-full w-full shrink-0 snap-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                {Math.abs(i - idx) <= 2 ? (
                  <Carte
                    id={id}
                    data={data}
                    bookNames={bookNames}
                    livre={livre}
                    onOpen={ouvrir}
                    onNavigate={lire}
                  />
                ) : null}
              </div>
            ))}
            {/* Fin du livre : on enchaîne sur le suivant */}
            <div className="grid h-full w-full shrink-0 snap-center place-items-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <div className="mx-auto max-w-lg text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cream/45">Fin de {nomLivre}</p>
                <p className="mt-2 font-display text-2xl font-extrabold">
                  {total} {mode === "personnage" ? `personnage${total > 1 ? "s" : ""}` : `lieu${total > 1 ? "x" : ""}`}
                </p>
                {suivant ? (
                  <button
                    type="button"
                    onClick={() => changerLivre(suivant.id)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-dawn-400 px-5 py-3 font-display font-bold text-night-950"
                  >
                    Continuer avec {suivant.name}
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                ) : null}
                <button type="button" onClick={() => allerA(0)} className="mt-4 block w-full text-sm font-bold text-cream/55 underline underline-offset-4">
                  Revenir au début
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Une carte « profil » : grand portrait, nom, tribu, puis la fiche complète. */
function Carte({
  id,
  data,
  bookNames,
  livre,
  onOpen,
  onNavigate,
}: {
  id: string;
  data: FichesData;
  bookNames: Record<number, string>;
  livre: number;
  onOpen: (id: string) => void;
  onNavigate: (l: number, c: number) => void;
}) {
  const f = data.fiches[id];
  const [imgOk, setImgOk] = useState(true);
  // Chapitres du livre courant où la figure apparaît.
  const chaps = (data.apparitions[id] ?? [])
    .map((k) => k.split("-").map(Number))
    .filter(([l]) => l === livre)
    .map(([, c]) => c);
  const resume =
    chaps.length > 1 ? `${bookNames[livre] ?? ""} ${chaps[0]} à ${chaps[chaps.length - 1]}` : `${bookNames[livre] ?? ""} ${chaps[0] ?? ""}`;

  return (
    <article className="mx-auto h-full max-w-lg overflow-y-auto overscroll-y-contain rounded-[28px] border border-white/10 bg-night-900 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)]">
      <div className="relative aspect-square max-h-[48vh] w-full overflow-hidden" style={{ background: degrade(f) }}>
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(`/img/bible/fiches/${id}.jpg`)}
            alt=""
            onError={() => setImgOk(false)}
            className="absolute inset-0 h-full w-full object-cover object-[50%_30%]"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-display text-[7rem] font-extrabold text-cream/80">
            {f.nom.replace(/^(Le |La |Les |L')/, "").charAt(0)}
          </span>
        )}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night-900 via-night-900/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dawn-400">
            {f.type === "personnage" ? "Personnage" : "Lieu"}
            {f.periode ? ` · ${f.periode}` : ""}
          </p>
          <h2 className="mt-0.5 font-display text-3xl font-extrabold leading-tight text-cream">{f.nom}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {f.tribu && data.fiches[f.tribu] ? (
              <button
                type="button"
                onClick={() => onOpen(f.tribu!)}
                className="inline-flex items-center gap-1.5 rounded-full border border-dawn-400/40 bg-night-950/60 px-2.5 py-1 text-[11px] font-bold text-dawn-300 backdrop-blur"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={2}>
                  <path d="M5 21V4h9l1 2h4v9h-6l-1-2H7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Tribu de {data.fiches[f.tribu].nom.replace(/\s*\(.*\)$/, "")}
              </button>
            ) : null}
            {chaps.length ? (
              <span className="rounded-full border border-white/15 bg-night-950/60 px-2.5 py-1 text-[11px] font-bold text-cream/75 backdrop-blur">
                {estCite(data, id, livre) ? `Cité dans ${resume}` : resume}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="px-5 pb-8 pt-1">
        <FicheCorps id={id} data={data} bookNames={bookNames} onNavigate={onNavigate} onOpen={onOpen} />
      </div>
    </article>
  );
}

function degrade(f: Fiche): string {
  return f.type === "personnage" ? "linear-gradient(150deg,#8a5a2b,#5f3d1d)" : "linear-gradient(150deg,#365d7a,#1f3a4d)";
}
