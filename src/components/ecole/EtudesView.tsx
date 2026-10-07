"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { asset, mediaUrl } from "@/lib/asset";
import { bibleHref } from "@/lib/bible-ref";
import { shareText } from "@/lib/share";
import { appShareUrl } from "@/config/app-links";
import { EVT_MEME_PAGE } from "@/lib/notif-route";
import { IconePartage, VersetSheet } from "@/components/ecole/FormationView";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import {
  audioEtudeUrl,
  auteursActifs,
  dureeEtude,
  getAuteur,
  getEtudeBiblique,
  getEtudesBibliques,
  libelleSerie,
  nomTheme,
  themesActifs,
  type Bloc,
  type EtudeBiblique,
} from "@/lib/etudes-bibliques";
import { useLangue } from "@/lib/i18n";

/**
 * ÉTUDES BIBLIQUES — /ecole/etudes : la bibliothèque des études, classées
 * par THÈME et par AUTEUR (pastilles de filtre), et le lecteur d'une étude
 * (?e=id) qui reprend la mise en page du document d'origine aux couleurs de
 * l'app : parties de l'histoire en cartes, portraits à puces, applications
 * numérotées, questions pour le groupe, défi de la semaine.
 * Liens : ?e=<étude>, ?theme=<thème>, ?auteur=<auteur>.
 */

const VERT = "text-[#5F7A00]";
const REF_RE = /\(((?:[1-3]\s?)?[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s-]*?\s\d+(?:[.:]\d+(?:-\d+)?)?)\)/g;

/** Texte riche : « **amorce** » en gras et références « (Jean 3:16) » cliquables. */
function Riche({ texte, onRef }: { texte: string; onRef: (r: string) => void }) {
  const morceaux = texte.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {morceaux.map((m, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-night-900">
            {m}
          </strong>
        ) : (
          <Fragment key={i}>
            {m.split(REF_RE).map((part, j) => {
              if (j % 2 === 0) return <Fragment key={j}>{part}</Fragment>;
              if (!bibleHref(part)) return <Fragment key={j}>({part})</Fragment>;
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() => onRef(part)}
                  className={`font-semibold ${VERT} underline decoration-[#5F7A00]/40 underline-offset-2`}
                >
                  ({part})
                </button>
              );
            })}
          </Fragment>
        ),
      )}
    </>
  );
}

function Horloge() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function Fleche() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Avatar({ id, taille = "h-7 w-7" }: { id: string; taille?: string }) {
  const a = getAuteur(id);
  if (!a?.photo) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(a.photo)} alt="" aria-hidden width={56} height={56} loading="lazy" className={`${taille} shrink-0 rounded-full object-cover`} />
  );
}

/* ——— Carte d'une étude (liste et onglet Étude) ——— */
export function CarteEtude({ etude, sombre = false }: { etude: EtudeBiblique; sombre?: boolean }) {
  const auteur = getAuteur(etude.auteur);
  const serie = libelleSerie(etude);
  return (
    <Link
      href={`/ecole/etudes?e=${etude.id}`}
      className={`flex gap-3.5 rounded-3xl p-3.5 transition-transform active:scale-[0.99] ${
        sombre ? "bg-white/[0.06] text-cream" : "border border-night-900/10 bg-white text-night-900"
      }`}
    >
      {etude.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(etude.image)} alt="" aria-hidden width={96} height={112} loading="lazy" className="h-28 w-24 shrink-0 rounded-2xl object-cover object-top" />
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col">
        {serie ? (
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${sombre ? "text-dawn-300" : VERT}`}>{serie}</span>
        ) : null}
        <span className="mt-0.5 font-display text-[17px] font-extrabold leading-tight">{etude.titre}</span>
        {etude.sousTitre ? (
          <span className={`mt-1 line-clamp-2 text-[13px] leading-snug ${sombre ? "text-cream/60" : "text-night-900/60"}`}>{etude.sousTitre}</span>
        ) : null}
        <span className={`mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs ${sombre ? "text-cream/55" : "text-night-900/55"}`}>
          {auteur ? (
            <span className="flex items-center gap-1.5">
              <Avatar id={etude.auteur} taille="h-5 w-5" />
              {auteur.nom}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Horloge />
            {dureeEtude(etude)} min
          </span>
        </span>
      </span>
    </Link>
  );
}

/* ——— Pastille de filtre ——— */
function Pastille({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-bold transition-colors ${
        actif ? "border-night-900 bg-night-900 text-dawn-400" : "border-night-900/12 bg-white text-night-900/75"
      }`}
    >
      {children}
    </button>
  );
}

/* ——— Bibliothèque : filtres thème / auteur ——— */
function Bibliotheque({ theme, auteur }: { theme: string | null; auteur: string | null }) {
  const router = useRouter();
  const etudes = getEtudesBibliques();
  const themes = themesActifs();
  const auteurs = auteursActifs();
  const filtrer = (t: string | null, a: string | null) => {
    const q = new URLSearchParams();
    if (t) q.set("theme", t);
    if (a) q.set("auteur", a);
    const s = q.toString();
    router.replace(`/ecole/etudes${s ? `?${s}` : ""}`, { scroll: false });
  };
  const liste = etudes.filter((e) => (!theme || e.themes.includes(theme)) && (!auteur || e.auteur === auteur));
  // Sans filtre de thème : regroupées par thème principal.
  const groupes = theme
    ? [{ id: theme, nom: nomTheme(theme), etudes: liste }]
    : themes
        .map((t) => ({ id: t.id, nom: t.nom, etudes: liste.filter((e) => e.themes[0] === t.id) }))
        .filter((g) => g.etudes.length);
  const a = auteur ? getAuteur(auteur) : null;

  return (
    <div className="min-h-screen pb-32 text-night-900">
      <header className="container-x mx-auto max-w-2xl pt-[calc(env(safe-area-inset-top)+1rem)]">
        <Link
          href="/ecole"
          aria-label="Retour à l'onglet Étude"
          className="inline-grid h-10 w-10 place-items-center rounded-full border border-night-900/15 bg-white text-night-900"
        >
          <Fleche />
        </Link>
        <p className={`mt-5 text-[11px] font-black uppercase tracking-[0.24em] ${VERT}`}>Étude biblique</p>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold leading-tight">Études bibliques</h1>
        <p className="mt-1.5 text-[14px] leading-snug text-night-900/60">
          Des études pour creuser la Parole, seul ou en groupe, classées par thème et par auteur.
        </p>
      </header>

      <div className="container-x mx-auto mt-5 max-w-2xl">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-night-900/45">Thèmes</p>
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <Pastille actif={!theme} onClick={() => filtrer(null, auteur)}>
            Tous
          </Pastille>
          {themes.map((t) => (
            <Pastille key={t.id} actif={theme === t.id} onClick={() => filtrer(theme === t.id ? null : t.id, auteur)}>
              {t.nom}
            </Pastille>
          ))}
        </div>
        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-night-900/45">Auteurs</p>
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {auteurs.map((x) => (
            <Pastille key={x.id} actif={auteur === x.id} onClick={() => filtrer(theme, auteur === x.id ? null : x.id)}>
              <Avatar id={x.id} taille="h-6 w-6" />
              {x.nom}
            </Pastille>
          ))}
        </div>

        {a ? (
          <div className="mt-5 flex items-center gap-3.5 rounded-3xl bg-night-950 p-4 text-cream">
            <Avatar id={a.id} taille="h-14 w-14" />
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold leading-tight">{a.nom}</p>
              <p className="mt-0.5 text-[13px] text-cream/60">{a.role}</p>
              <p className="mt-1 text-xs font-bold text-dawn-300">
                {etudes.filter((e) => e.auteur === a.id).length} étude{etudes.filter((e) => e.auteur === a.id).length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : null}

        {groupes.map((g) => (
          <section key={g.id} className="mt-7">
            <h2 className="font-display text-lg font-extrabold">{g.nom}</h2>
            <div className="mt-3 space-y-3">
              {g.etudes.map((e) => (
                <CarteEtude key={e.id} etude={e} />
              ))}
            </div>
          </section>
        ))}
        {!groupes.length ? (
          <p className="mt-8 rounded-3xl bg-white p-5 text-center text-sm text-night-900/55">Aucune étude pour ce choix, pour l&apos;instant.</p>
        ) : null}

        <div className="mt-6 flex items-center gap-3.5 rounded-3xl border border-dashed border-night-900/20 p-4 opacity-70">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-night-900/[0.05] text-night-900/40">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.8}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-[13px] font-bold text-night-900/60">D&apos;autres études arrivent bientôt.</span>
        </div>
      </div>
    </div>
  );
}

/* ——— Rendu d'un bloc d'étude ——— */
function BlocEtude({ b, onRef }: { b: Bloc; onRef: (r: string) => void }) {
  const para = "text-[15.5px] leading-relaxed text-night-900/85";
  switch (b.type) {
    case "rubrique":
      return (
        <div className="flex items-center gap-3 pt-5">
          <span className={`text-[11px] font-black uppercase tracking-[0.24em] ${VERT}`}>{b.t}</span>
          <span className="h-px flex-1 bg-night-900/12" />
        </div>
      );
    case "p":
      return (
        <p className={para}>
          <Riche texte={b.t} onRef={onRef} />
        </p>
      );
    case "citation":
      return (
        <figure className="rounded-3xl border-l-4 border-dawn-400 bg-white px-5 py-4 shadow-[0_10px_30px_-22px_rgba(12,12,11,0.5)]">
          <blockquote className="font-display text-[17px] font-bold italic leading-snug text-night-900">« {b.t} »</blockquote>
          <figcaption className="mt-2.5">
            <button type="button" onClick={() => onRef(b.ref)} className={`text-[11px] font-black uppercase tracking-[0.16em] ${VERT}`}>
              {b.ref}
            </button>
          </figcaption>
        </figure>
      );
    case "partie":
      return (
        <div className="pt-7">
          <div className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-night-950 font-display text-xl font-extrabold text-dawn-400">
              {b.n}
            </span>
            <h2 className="font-display text-[22px] font-extrabold uppercase leading-[1.05] tracking-tight">{b.t}</h2>
          </div>
          {b.chapeau ? <p className="mt-2.5 text-[14px] italic text-night-900/55">{b.chapeau}</p> : null}
        </div>
      );
    case "histoire":
      return (
        <div className="rounded-3xl border border-night-900/[0.07] bg-white px-5 py-4">
          <span className={`inline-block rounded-full bg-dawn-400/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${VERT}`}>
            L&apos;histoire · partie {b.n}
          </span>
          <div className="mt-3 space-y-3">
            {b.p.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-night-900/85">
                <Riche texte={p} onRef={onRef} />
              </p>
            ))}
          </div>
        </div>
      );
    case "sousTitre":
      return <h3 className="pt-3 font-display text-lg font-extrabold">{b.t}</h3>;
    case "points":
      return (
        <ul className="space-y-2">
          {b.items.map((x, i) => (
            <li key={i} className="flex gap-3 text-[15px] font-semibold leading-snug text-night-900">
              <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-dawn-400 ring-2 ring-night-900/80" />
              <span>
                <Riche texte={x} onRef={onRef} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "application":
      return (
        <div className="pt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-night-950 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-dawn-400">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.4}>
              <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Application
          </span>
        </div>
      );
    case "point":
      return (
        <div className="flex items-center gap-3 pt-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400 font-display text-base font-extrabold text-night-950">{b.n}</span>
          <h3 className="font-display text-[19px] font-extrabold leading-tight">{b.t}</h3>
        </div>
      );
    case "liste":
      return (
        <ul className="space-y-3">
          {b.items.map((x, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-night-900/85">
              <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-dawn-400 ring-2 ring-night-900/80" />
              <span>
                <strong className="font-bold text-night-900">{x.g}</strong> <Riche texte={x.t} onRef={onRef} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "question":
      return (
        <div className="rounded-3xl bg-night-900/[0.06] px-5 py-4">
          <p className="font-display text-[16px] font-extrabold leading-snug">
            <span className={VERT}>Question :</span> {b.t}
          </p>
          <ul className="mt-3 space-y-2.5">
            {b.items.map((x, i) => (
              <li key={i} className="flex gap-3 text-[14.5px] leading-snug text-night-900/80">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-night-900/50" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "encadre":
      return (
        <div className="rounded-3xl border-l-4 border-night-900 bg-dawn-400/20 px-5 py-4">
          <p className="text-[15px] font-medium italic leading-relaxed text-night-900">
            <Riche texte={b.t} onRef={onRef} />
          </p>
          {b.ref ? (
            <button type="button" onClick={() => onRef(b.ref!)} className={`mt-2.5 text-[11px] font-black uppercase tracking-[0.16em] ${VERT}`}>
              {b.ref}
            </button>
          ) : null}
        </div>
      );
    case "retenir":
      return (
        <div className="rounded-3xl bg-night-950 px-5 py-5 text-cream">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-dawn-300">À retenir</p>
          <ul className="mt-3 space-y-3">
            {b.items.map((x, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-snug text-cream/90">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={3}>
                    <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{x.replace(REF_RE, "").replace(/\s+\./g, ".").trim()}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "questions":
      return (
        <div className="rounded-3xl border border-night-900/10 bg-white px-5 py-5">
          <h3 className="font-display text-lg font-extrabold">Questions pour le groupe</h3>
          <ol className="mt-3.5 space-y-3.5">
            {b.items.map((x, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-snug text-night-900/85">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-night-950 font-display text-[13px] font-extrabold text-dawn-400">
                  {i + 1}
                </span>
                <span className="pt-0.5">{x}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "defi":
      return (
        <div className="relative overflow-hidden rounded-3xl bg-dawn-400 px-5 py-5 text-night-950">
          <p className="text-[11px] font-black uppercase tracking-[0.22em]">Défi de la semaine</p>
          <p className="mt-2 font-display text-[17px] font-extrabold leading-snug">{b.t}</p>
          {b.verset ? (
            <div className="mt-3.5 rounded-2xl bg-night-950/[0.08] px-4 py-3">
              <p className="text-[14.5px] italic leading-snug">« {b.verset} »</p>
              {b.ref ? (
                <button type="button" onClick={() => onRef(b.ref!)} className="mt-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-night-950/70">
                  {b.ref}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      );
    case "priere":
      return (
        <div className="rounded-3xl border border-night-900/10 bg-white px-5 py-5">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-night-900/55">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" strokeLinejoin="round" />
            </svg>
            Prière
          </p>
          <p className="mt-2.5 font-display text-[16px] italic leading-relaxed text-night-900">{b.t}</p>
        </div>
      );
    case "lectures":
      return (
        <div className="pt-2">
          <h3 className="font-display text-lg font-extrabold">{b.t}</h3>
          <div className="mt-3 divide-y divide-night-900/[0.07] overflow-hidden rounded-3xl border border-night-900/10 bg-white">
            {b.items.map((x, i) => (
              <button key={i} type="button" onClick={() => onRef(x.ref)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dawn-400/25 font-display text-[13px] font-extrabold text-night-900">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold leading-tight">{x.ref}</span>
                  <span className="block text-[12.5px] text-night-900/55">{x.t}</span>
                </span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-night-900/35" strokeWidth={2}>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      );
  }
}

/* ——— Écouter l'étude : narration en plusieurs parties ———
 * La carte n'apparaît que si la 1re partie existe dans le bucket. Lecture :
 * mini-lecteur fixe en bas (−10 s / +10 s, vitesse), parties enchaînées. */
const VITESSES = [1, 1.25, 1.5, 2];

function fmt(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/** Narration de l'étude : française, ou dans la langue de l'app quand elle est
 * enregistrée (audio/<langue>/etude-<étude>-<partie>.mp3), sinon rien. */
function AudioEtude({ etude }: Parameters<typeof AudioEtudeFr>[0]) {
  const langue = useLangue();
  const traduite = useMemo(
    () =>
      langue === "fr"
        ? etude
        : { ...etude, audio: (etude.audio ?? []).map((p, i) => ({ ...p, fichier: `${langue}/etude-${etude.id}-${i + 1}.mp3` })) },
    [etude, langue],
  );
  return <AudioEtudeFr key={langue} etude={traduite} />;
}

function AudioEtudeFr({ etude }: { etude: EtudeBiblique }) {
  const { email } = useAuth();
  const admin = isAdminEmail(email);
  // null = recherche en cours ; [] = aucun fichier trouvé.
  const [parties, setParties] = useState<{ fichier: string; titre: string; url: string }[] | null>(null);
  const [idx, setIdx] = useState<number | null>(null);
  const [joue, setJoue] = useState(false);
  const [pos, setPos] = useState(0);
  const [duree, setDuree] = useState(0);
  const [vitesse, setVitesse] = useState(0);
  const [liste, setListe] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cherche la narration : d'abord à l'emplacement prévu (etudes/david-1-1.mp3),
  // sinon à la racine du bucket (david-1-1.mp3). On garde l'emplacement où la
  // première partie existe, puis seulement les parties réellement présentes.
  useEffect(() => {
    const liste = etude.audio ?? [];
    if (!liste.length) {
      setParties([]);
      return;
    }
    let actif = true;
    const existe = (u: string) =>
      new Promise<boolean>((res) => {
        const a = new Audio();
        const fin = (v: boolean) => {
          clearTimeout(minuterie);
          a.onloadedmetadata = null;
          a.onerror = null;
          a.src = "";
          res(v);
        };
        const minuterie = setTimeout(() => fin(false), 15000);
        a.preload = "metadata";
        a.onloadedmetadata = () => fin(true);
        a.onerror = () => fin(false);
        a.src = u;
      });
    // 1) le site (jackbrunet.com/audio/etudes/…), 2) Supabase etudes/…, 3) racine Supabase.
    const emplacements: ((f: string) => string | null)[] = [
      (f) => mediaUrl(`/audio/${f}`),
      (f) => audioEtudeUrl(f),
      (f) => audioEtudeUrl(f.split("/").pop() ?? f),
    ];
    (async () => {
      for (const urlDe of emplacements) {
        const premiere = urlDe(liste[0].fichier);
        if (!premiere || !(await existe(premiere))) continue;
        // Les autres parties sont vérifiées en parallèle.
        const candidates = liste.map((p) => ({ ...p, url: urlDe(p.fichier) ?? "" }));
        const ok = await Promise.all(candidates.map((p, i) => (i === 0 ? true : p.url ? existe(p.url) : false)));
        if (actif) setParties(candidates.filter((_, i) => ok[i]));
        return;
      }
      if (actif) setParties([]);
    })();
    return () => {
      actif = false;
    };
  }, [etude.audio]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || idx === null) return;
    a.playbackRate = VITESSES[vitesse];
    a.play().catch(() => {});
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = VITESSES[vitesse];
  }, [vitesse]);

  if (parties === null) return null;
  if (!parties.length) {
    // Visible seulement par l'admin : dit exactement quoi déposer et où.
    if (!admin || !etude.audio?.length) return null;
    return (
      <div className="container-x mx-auto mt-4 max-w-2xl">
        <div className="rounded-2xl border border-amber-400/50 bg-amber-50 p-4 text-sm text-night-900/80">
          <p className="font-bold">Audio de l&apos;étude introuvable (message visible par toi seul)</p>
          <p className="mt-1">
            Dépose les fichiers dans Supabase, bucket <b>audiovf</b>, dossier <b>etudes</b>, avec ces noms exacts :
          </p>
          <p className="mt-1 font-mono text-xs">
            {etude.audio.map((p) => p.fichier.split("/").pop()).join(" · ")}
          </p>
        </div>
      </div>
    );
  }

  const jouer = (i: number) => {
    if (idx === i && audioRef.current) {
      if (audioRef.current.paused) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
      return;
    }
    setPos(0);
    setDuree(0);
    setIdx(i);
  };
  const saute = (d: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.max(0, Math.min((a.duration || 0) - 0.2, a.currentTime + d));
  };

  return (
    <>
      <div className="container-x mx-auto mt-4 max-w-2xl">
        <div className="rounded-3xl bg-night-950 p-4 text-cream">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => jouer(idx ?? 0)}
              aria-label={joue ? "Pause" : "Écouter l'étude"}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950"
            >
              {joue ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current">
                  <path d="M8 5.2v13.6L19 12z" />
                </svg>
              )}
            </button>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-dawn-300">Écouter l&apos;étude</span>
              <span className="mt-0.5 block truncate font-display text-[15px] font-extrabold">
                {idx === null ? `${parties.length} parties à écouter` : parties[idx].titre}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setListe(!liste)}
              aria-expanded={liste}
              className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-bold text-cream/80"
            >
              Parties
            </button>
          </div>
          {liste ? (
            <ol className="mt-3 divide-y divide-white/[0.07] border-t border-white/10">
              {parties.map((p, i) => (
                <li key={p.fichier}>
                  <button type="button" onClick={() => jouer(i)} className="flex w-full items-center gap-3 py-2.5 text-left">
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-[12px] font-extrabold ${
                        idx === i ? "bg-dawn-400 text-night-950" : "bg-white/10 text-cream/70"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`text-[14px] leading-snug ${idx === i ? "font-bold text-cream" : "text-cream/75"}`}>{p.titre}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>

      {idx !== null ? (
        <div className="pointer-events-none fixed inset-x-0 z-[55] px-4" style={{ bottom: "calc(env(safe-area-inset-bottom) + 4.9rem)" }}>
          <div className="pointer-events-auto mx-auto max-w-2xl rounded-[22px] bg-night-950 px-4 pb-2.5 pt-2.5 text-cream shadow-[0_18px_44px_-14px_rgba(0,0,0,0.65)]">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              ref={audioRef}
              src={parties[idx].url}
              preload="metadata"
              onPlay={() => setJoue(true)}
              onPause={() => setJoue(false)}
              onLoadedMetadata={(e) => {
                setDuree(e.currentTarget.duration || 0);
                e.currentTarget.playbackRate = VITESSES[vitesse];
              }}
              onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
              onEnded={() => {
                setJoue(false);
                if (idx + 1 < parties.length) jouer(idx + 1);
              }}
            />
            <p className="truncate text-[12px] font-bold text-cream/80">
              <span className="text-dawn-300">
                {idx + 1}/{parties.length}
              </span>{" "}
              · {parties[idx].titre}
            </p>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="w-8 shrink-0 text-[10px] font-bold text-cream/45">{fmt(pos)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, Math.floor(duree))}
                step={1}
                value={Math.floor(pos)}
                onChange={(e) => {
                  if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
                }}
                aria-label="Position dans l'audio"
                className="h-1 min-w-0 flex-1 cursor-pointer accent-dawn-400"
              />
              <span className="w-8 shrink-0 text-right text-[10px] font-bold text-cream/45">{fmt(duree)}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setVitesse((vitesse + 1) % VITESSES.length)}
                className="min-w-[3.1rem] rounded-full border border-white/20 px-2.5 py-1 font-display text-[11px] font-extrabold text-cream/85"
              >
                {`${VITESSES[vitesse]}×`.replace(".", ",")}
              </button>
              <div className="flex items-center gap-5">
                <button type="button" onClick={() => saute(-10)} aria-label="Reculer de 10 secondes" className="relative grid h-9 w-9 place-items-center text-cream/85">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth={1.7}>
                    <path d="M12 4.5A7.5 7.5 0 1 1 4.5 12" strokeLinecap="round" />
                    <path d="M4.5 12V7.5m0 4.5H9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="absolute text-[8px] font-black">10</span>
                </button>
                <button
                  type="button"
                  onClick={() => jouer(idx)}
                  aria-label={joue ? "Pause" : "Lecture"}
                  className="grid h-11 w-11 place-items-center rounded-full bg-dawn-400 text-night-950"
                >
                  {joue ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current">
                      <path d="M8 5.2v13.6L19 12z" />
                    </svg>
                  )}
                </button>
                <button type="button" onClick={() => saute(10)} aria-label="Avancer de 10 secondes" className="relative grid h-9 w-9 place-items-center text-cream/85">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth={1.7}>
                    <path d="M12 4.5A7.5 7.5 0 1 0 19.5 12" strokeLinecap="round" />
                    <path d="M19.5 12V7.5m0 4.5H15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="absolute text-[8px] font-black">10</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioRef.current?.pause();
                  setIdx(null);
                }}
                aria-label="Fermer le lecteur"
                className="grid min-w-[3.1rem] place-items-end text-cream/50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ——— Lecteur d'une étude ——— */
function LecteurEtude({ etude, onBack }: { etude: EtudeBiblique; onBack: () => void }) {
  const router = useRouter();
  const [ref, setRef] = useState<string | null>(null);
  const [lienCopie, setLienCopie] = useState(false);
  const auteur = getAuteur(etude.auteur);
  const serie = libelleSerie(etude);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [etude.id]);

  async function partager() {
    const ok = await shareText(
      `Je te recommande l'étude biblique « ${etude.titre} »${auteur ? ` de ${auteur.nom}` : ""} sur l'application RHEMA.`,
      appShareUrl(`/ecole/etudes?e=${etude.id}`),
    );
    if (!ok) {
      setLienCopie(true);
      window.setTimeout(() => setLienCopie(false), 2200);
    }
  }

  return (
    <div className="min-h-screen pb-32 text-night-900">
      {/* En-tête : image, série, titre, auteur */}
      <header className="relative overflow-hidden bg-night-950 text-cream">
        {etude.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(etude.image)} alt="" aria-hidden width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-70" />
        ) : null}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/70 to-night-950/20" />
        <div className="container-x relative mx-auto max-w-2xl pb-7 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              aria-label="Retour"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-night-950/40 text-cream backdrop-blur"
            >
              <Fleche />
            </button>
            <button
              type="button"
              onClick={partager}
              aria-label="Partager l'étude"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-night-950/40 px-4 text-sm font-bold text-cream backdrop-blur"
            >
              <IconePartage />
              Partager
            </button>
          </div>
          <div className="pt-36">
            {serie ? <p className="text-[11px] font-black uppercase tracking-[0.22em] text-dawn-300">{serie}</p> : null}
            <h1 className="mt-1.5 font-display text-[34px] font-extrabold leading-[1.02]">{etude.titre}</h1>
            {etude.sousTitre ? <p className="mt-2 text-[16px] italic leading-snug text-cream/75">{etude.sousTitre}</p> : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {etude.texte ? (
                <button
                  type="button"
                  onClick={() => setRef(etude.lire ?? etude.texte!)}
                  className="rounded-full bg-dawn-400 px-3 py-1.5 text-[12px] font-bold text-night-950"
                >
                  Texte : {etude.texte}
                  {etude.lire && etude.lire !== etude.texte ? <span className="font-medium opacity-70"> (lire {etude.lire.replace(/^.*?\s(?=\d+:)/, "")})</span> : null}
                </button>
              ) : null}
              {etude.versetCle ? (
                <button
                  type="button"
                  onClick={() => setRef(etude.versetCle!)}
                  className="rounded-full border border-white/25 px-3 py-1.5 text-[12px] font-bold text-cream"
                >
                  Verset clé : {etude.versetCle}
                </button>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-cream/65">
              {auteur ? (
                <Link href={`/ecole/etudes?auteur=${auteur.id}`} className="flex items-center gap-2 font-bold text-cream">
                  <Avatar id={auteur.id} taille="h-7 w-7" />
                  {auteur.nom}
                </Link>
              ) : null}
              <span className="flex items-center gap-1.5">
                <Horloge />
                {dureeEtude(etude)} min
              </span>
              {etude.public ? <span>{etude.public}</span> : null}
            </div>
          </div>
        </div>
      </header>

      {/* Thèmes */}
      <div className="container-x mx-auto mt-4 flex max-w-2xl flex-wrap gap-2">
        {etude.themes.map((t) => (
          <Link key={t} href={`/ecole/etudes?theme=${t}`} className="rounded-full border border-night-900/12 bg-white px-3 py-1.5 text-[12px] font-bold text-night-900/70">
            {nomTheme(t)}
          </Link>
        ))}
      </div>

      <AudioEtude etude={etude} />

      {/* Corps de l'étude */}
      <article className="container-x mx-auto mt-2 max-w-2xl space-y-4">
        {etude.blocs.map((b, i) => (
          <BlocEtude key={i} b={b} onRef={setRef} />
        ))}
      </article>

      {/* Auteur + partage */}
      <div className="container-x mx-auto mt-8 max-w-2xl">
        {auteur ? (
          <Link href={`/ecole/etudes?auteur=${auteur.id}`} className="flex items-center gap-3.5 rounded-3xl bg-night-950 p-4 text-cream">
            <Avatar id={auteur.id} taille="h-14 w-14" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-dawn-300">Une étude de</span>
              <span className="mt-0.5 block font-display text-lg font-extrabold leading-tight">{auteur.nom}</span>
              <span className="mt-0.5 block text-[12.5px] text-cream/60">{auteur.role}</span>
            </span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-cream/40" strokeWidth={2}>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={partager}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-night-900 py-3.5 font-display text-sm font-bold text-dawn-400"
        >
          <IconePartage />
          Partager l&apos;étude
        </button>
        {lienCopie ? <p className="mt-2 text-center text-[13px] font-bold text-night-900/60">Lien copié, tu peux le coller où tu veux</p> : null}
      </div>

      {ref ? (
        <VersetSheet
          reference={ref}
          onClose={() => setRef(null)}
          onNavigate={(l, c) => {
            const h = bibleHref(ref);
            router.push(h ?? `/bible/?livre=${l}&chap=${c}`);
          }}
        />
      ) : null}
    </div>
  );
}

/* ——— Page ——— */
export function EtudesView() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("e");
  const theme = params.get("theme");
  const auteur = params.get("auteur");
  const etude = useMemo(() => (id ? getEtudeBiblique(id) : undefined), [id]);
  const depuisListe = useRef(false);

  // Lien intelligent reçu alors que la page est déjà ouverte.
  useEffect(() => {
    const surLien = (ev: Event) => {
      const cible = (ev as CustomEvent<string>).detail;
      if (typeof cible === "string") router.replace(cible.replace(/\/\?/, "?"));
    };
    window.addEventListener(EVT_MEME_PAGE, surLien);
    return () => window.removeEventListener(EVT_MEME_PAGE, surLien);
  }, [router]);

  useEffect(() => {
    if (!id) depuisListe.current = true;
  }, [id]);

  if (etude) {
    return (
      <LecteurEtude
        etude={etude}
        onBack={() => {
          if (depuisListe.current) router.back();
          else router.push("/ecole");
        }}
      />
    );
  }
  return <Bibliotheque theme={theme} auteur={auteur} />;
}
