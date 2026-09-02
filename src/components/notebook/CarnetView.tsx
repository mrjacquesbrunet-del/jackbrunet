"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { useAuth } from "@/components/community/useAuth";
import { useProfileAccent, ACCENTS, type AccentKey } from "@/lib/profile-accent";
import { useToolkit, highlightBg, type Snippet } from "@/lib/toolkit";
import { bibleHref } from "@/lib/bible-ref";
import { useEngagement } from "@/lib/engagement";
import { getDevotions } from "@/lib/content";
import { fetchPublishedDevotions } from "@/lib/devotions";
import type { Devotion } from "@/lib/types";
import {
  useNotebook,
  addNote,
  updateNote,
  removeNote,
  toggleAnswered,
  NOTE_CATEGORIES,
  type Note,
  type NoteCategory,
} from "@/lib/notebook";

const KIND_LABEL: Record<string, string> = {
  verset: "Verset",
  méditation: "Méditation",
  punchline: "Parole forte",
  déclaration: "Déclaration",
  publication: "Publication",
  texte: "Texte",
};

/** Onglets du carnet (façon feed). */
const FILTERS = ["Tout", "Méditations", "Versets", "Paroles fortes", "Publications", "Notes", "Surlignages"] as const;
type Filter = (typeof FILTERS)[number];

const fmt = (ts: number) =>
  new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

type Item =
  | { t: "note"; key: string; ts: number; note: Note }
  | { t: "snippet"; key: string; ts: number; snip: Snippet }
  | { t: "highlight"; key: string; ts: number; hl: { id: string; color: string; text: string; reference?: string; kind?: string } }
  | { t: "favverse"; key: string; ts: number; text: string; reference?: string }
  | { t: "favdev"; key: string; ts: number; idx: number; dev: Devotion };

function groupOf(it: Item): Exclude<Filter, "Tout"> {
  if (it.t === "note") return "Notes";
  if (it.t === "highlight") return "Surlignages";
  if (it.t === "favverse") return "Versets";
  if (it.t === "favdev") return "Méditations";
  const k = it.snip.kind;
  if (k === "verset") return "Versets";
  if (k === "publication") return "Publications";
  if (k === "méditation") return "Méditations";
  return "Paroles fortes";
}

export function CarnetView() {
  const { profile } = useAuth();
  const { accent, setAccent, colors } = useProfileAccent();
  const { saved, removeSnippet, highlightItems, clearHighlight } = useToolkit();
  const notes = useNotebook();
  const eng = useEngagement();

  const [filter, setFilter] = useState<Filter>("Tout");
  const [adding, setAdding] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  const favVerses = profile?.favorite_verses?? [];

  // Méditations mises en favori dans le Temps avec Jésus : on retrouve leur
  // contenu complet (exhortation, déclaration) pour les RELIRE ici.
  const [remoteDevs, setRemoteDevs] = useState<Devotion[] | null>(null);
  useEffect(() => {
    fetchPublishedDevotions()
      .then((d) => {
        if (d && d.length) setRemoteDevs(d);
      })
      .catch(() => undefined);
  }, []);
  const devList = useMemo(() => remoteDevs ?? getDevotions(), [remoteDevs]);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (const n of notes) out.push({ t: "note", key: `note-${n.id}`, ts: n.ts, note: n });
    for (const s of saved) out.push({ t: "snippet", key: `snip-${s.id}`, ts: s.ts, snip: s });
    for (const h of highlightItems)
      out.push({ t: "highlight", key: `hl-${h.id}`, ts: h.ts?? 0, hl: h });
    favVerses.forEach((v, i) =>
      out.push({ t: "favverse", key: `fav-${i}`, ts: 0, text: v.text, reference: v.reference }),
    );
    for (const idx of eng.favorites) {
      const dev = devList[idx];
      if (dev) out.push({ t: "favdev", key: `favdev-${idx}`, ts: 1, idx, dev });
    }
    return out.sort((a, b) => b.ts - a.ts);
  }, [notes, saved, highlightItems, favVerses, eng.favorites, devList]);

  const shown = filter === "Tout"? items: items.filter((it) => groupOf(it) === filter);
  const total = items.length;

  return (
    <>
      {/* Fond du carnet: dégradé teinté par la couleur d'accent choisie. Il est
          fixe (il ne bouge pas au défilement) et le feed « flotte » par-dessus. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg, ${colors.from}2b 0%, ${colors.to}17 20%, #F3F3ED 52%)`,
        }}
      />
      <section className="container-x pb-28 pt-24 sm:pt-28">
      {/* En-tête façon profil, avec personnalisation */}
      <div className="dark-ctx bg-topo-dark relative mx-auto max-w-2xl overflow-hidden rounded-4xl border border-white/10 p-6 shadow-card sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-30"
          style={{ backgroundImage: `linear-gradient(120deg, ${colors.from}, ${colors.to})` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full opacity-40 blur-3xl"
          style={{ backgroundColor: colors.from }}
        />
        <div className="relative flex items-center gap-4">
          <span
            className="shrink-0 rounded-full p-[3px]"
            style={{ backgroundImage: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
          >
            <span className="block rounded-full bg-night-900 p-[3px]">
              <Avatar pseudo={profile?.pseudo} url={profile?.avatar_url} size={72} />
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dawn-300">Mon carnet</p>
            <h1 className="mt-0.5 truncate font-display text-2xl font-extrabold text-cream">
              {profile?.pseudo?? "Mon carnet"}
            </h1>
            <p className="mt-0.5 text-sm text-cream/60">
              {total} élément{total > 1? "s": ""} enregistré{total > 1? "s": ""}
            </p>
          </div>
        </div>

        {/* Personnalisation: un seul bouton « Personnaliser » qui ouvre l'outil
            (couleur d'accent, partagée avec le profil). Se referme après. */}
        <div className="relative mt-5">
          <button
            type="button"
            onClick={() => setCustomizing((o) =>!o)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
              <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 1.8-2.9 2 2 0 0 1 1.8-2.9H19a3 3 0 0 0 3-3A8.2 8.2 0 0 0 12 3z" strokeLinejoin="round" />
              <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
              <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
              <circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            {customizing? "Fermer": "Personnaliser"}
          </button>

          {customizing? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cream/50">
                Couleur d'accent
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setAccent(k)}
                    aria-label={ACCENTS[k].label}
                    className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-night-900 transition-transform hover:scale-110 ${
                      accent === k? "ring-white": "ring-transparent"
                    }`}
                    style={{ backgroundImage: `linear-gradient(120deg, ${ACCENTS[k].from}, ${ACCENTS[k].to})` }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCustomizing(false)}
                className="mt-4 rounded-full bg-dawn-400 px-4 py-1.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5"
              >
                Enregistrer
              </button>
            </div>
          ): null}
        </div>
      </div>

      {/* Filtres + ajout de note */}
      <div className="mx-auto mt-6 max-w-2xl">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                filter === f
? "bg-night-900 text-cream"
: "border border-night-900/15 text-night-900/70 hover:border-night-900/30"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAdding((a) =>!a)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-dawn-400 px-3.5 py-1.5 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Note
          </button>
        </div>

        {adding? <NoteComposer onDone={() => setAdding(false)} />: null}
      </div>

      {/* Feed */}
      <div className="mx-auto mt-6 max-w-2xl">
        {shown.length === 0? (
          <div className="glass-strong p-8 text-center">
            <p className="font-display text-lg font-bold">Rien ici pour l'instant</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-night-900/60">
              Surligne un verset, mets une méditation en favori, enregistre une pensée du jour, une
              punchline ou une publication du mur: tu la retrouveras ici, comme un journal à toi.
            </p>
          </div>
        ): (
          <div className="gap-4 sm:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {shown.map((it) => (
              <FeedCard
                key={it.key}
                item={it}
                onRemove={() => {
                  if (it.t === "note") removeNote(it.note.id);
                  else if (it.t === "snippet") removeSnippet(it.snip.id);
                  else if (it.t === "highlight") clearHighlight(it.hl.id);
                  else if (it.t === "favdev") eng.toggleFavorite(it.idx);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-night-900/45">
        Ton carnet reste privé, enregistré sur cet appareil.
      </p>
      </section>
    </>
  );
}

/* ---------- Méditation favorite : relisible en entier ---------- */
function DevFavCard({ dev, onRemove }: { dev: Devotion; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  const paragraphs = dev.meditation.split("\n\n");
  return (
    <article className="dark-ctx bg-topo-dark relative overflow-hidden rounded-3xl border border-white/10 p-6 text-cream shadow-card">
      <div className="blob -right-10 -top-8 h-32 w-32 bg-spirit-500/25" />
      <span className="relative inline-block rounded-full border border-dawn-400/40 bg-dawn-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-dawn-300">
        Méditation favorite
      </span>
      <h3 className="relative mt-2.5 font-display text-xl font-extrabold leading-snug">{dev.theme}</h3>
      <p className="relative mt-2 text-[15px] italic leading-relaxed text-cream/80">
        «&nbsp;{dev.verseText}&nbsp;»
      </p>
      <p className="relative mt-1.5 text-sm font-semibold text-dawn-200">{dev.verseReference}</p>

      {open ? (
        <div className="relative mt-4 space-y-3 border-t border-white/10 pt-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[14px] leading-relaxed text-cream/80">
              {p}
            </p>
          ))}
          <div className="rounded-2xl border border-dawn-400/25 bg-dawn-400/[0.07] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-dawn-300">À déclarer sur ta vie</p>
            <p className="mt-1.5 font-display text-[15px] font-bold leading-snug">{dev.declarationText}</p>
            <p className="mt-1 text-right text-xs italic text-dawn-200">— {dev.declarationReference}</p>
          </div>
          {dev.author ? <p className="text-xs text-cream/50">{dev.author}</p> : null}
        </div>
      ) : null}

      <div className="relative mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-cream/85 transition-colors hover:bg-white/15"
        >
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 fill-none stroke-current transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.2}>
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {open ? "Replier" : "Relire la méditation"}
        </button>
        <RemoveBtn onRemove={onRemove} tone="dark" />
      </div>
    </article>
  );
}

/* ---------- Composeur de note ---------- */
function NoteComposer({ onDone }: { onDone: () => void }) {
  const [category, setCategory] = useState<NoteCategory>("Prière");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="mt-4 rounded-3xl border border-night-900/10 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        {NOTE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              category === c
? "bg-night-900 text-cream"
: "border border-night-900/15 text-night-900/70 hover:border-night-900/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre (facultatif)"
        className="field mt-3 w-full"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ta note…"
        rows={3}
        className="field mt-2 w-full resize-y"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!body.trim() &&!title.trim()}
          onClick={() => {
            addNote({ category, title, body });
            onDone();
          }}
          className="btn-primary text-sm disabled:opacity-40"
        >
          Ajouter au carnet
        </button>
        <button type="button" onClick={onDone} className="btn-ghost text-sm">
          Annuler
        </button>
      </div>
    </div>
  );
}

/* ---------- Carte du feed ---------- */
function FeedCard({ item, onRemove }: { item: Item; onRemove: () => void }) {
  if (item.t === "note") return <NoteCard note={item.note} onRemove={onRemove} />;
  if (item.t === "favdev") return <DevFavCard dev={item.dev} onRemove={onRemove} />;

  const text = item.t === "snippet"? item.snip.text: item.t === "highlight"? item.hl.text: item.text;
  const reference =
    item.t === "snippet"? item.snip.reference: item.t === "highlight"? item.hl.reference: item.reference;
  const kind = item.t === "snippet"? item.snip.kind: item.t === "highlight"? item.hl.kind: "verset";
  // Lien vers le passage: on se base sur la RÉFÉRENCE (« Jean 3:16 »), ce qui
  // marche aussi pour les versets du jour et les favoris (pas d'id « bible: »).
  const href = bibleHref(reference);

  // Publication du mur: carte dédiée (auteur + lien).
  if (item.t === "snippet" && item.snip.kind === "publication") {
    const author = item.snip.reference?? "";
    const authorId = item.snip.id.startsWith("pub:")? item.snip.id.slice(4): null;
    return (
      <article className="rounded-3xl border border-night-900/10 bg-white p-5">
        <Badge label="Publication" />
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85">{text}</p>
        <div className="mt-3 flex items-center justify-between">
          {authorId? (
            <Link href={`/membre?u=${authorId}`} className="text-xs font-bold text-spirit-700 hover:underline">
              {author}
            </Link>
          ): (
            <span className="text-xs font-bold text-spirit-700">{author}</span>
          )}
          <RemoveBtn onRemove={onRemove} />
        </div>
      </article>
    );
  }

  // Parole forte / déclaration: carte sombre esthétique (façon carte à partager).
  const richy = kind === "punchline" || kind === "déclaration";
  if (richy) {
    return (
      <article className="dark-ctx bg-topo-dark relative overflow-hidden rounded-3xl border border-dawn-400/30 p-6 text-cream shadow-card">
        <div className="blob -right-10 -top-8 h-32 w-32 bg-dawn-500/25" />
        <span className="font-display text-4xl leading-none text-dawn-300/70">&ldquo;</span>
        <p className="relative mt-1 font-display text-xl font-extrabold leading-snug">{text}</p>
        {reference? <p className="relative mt-3 text-sm font-semibold text-dawn-200">{reference}</p>: null}
        <div className="relative mt-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-cream/50">
            {KIND_LABEL[kind]?? "Parole"}
          </span>
          <RemoveBtn onRemove={onRemove} tone="dark" />
        </div>
      </article>
    );
  }

  // Verset / méditation / surlignage: carte claire citation.
  const hlTint = item.t === "highlight"? highlightBg(item.hl.color): "";
  return (
    <article className={`rounded-3xl border border-night-900/10 p-5 ${hlTint || "bg-white"}`}>
      <Badge label={KIND_LABEL[kind?? "verset"]?? "Verset"} />
      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85">{text}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        {reference? (
          <span className="text-xs font-bold uppercase tracking-wide text-spirit-700">{reference}</span>
        ): (
          <span />
        )}
        <div className="flex items-center gap-3">
          {href? (
            <Link href={href} className="text-xs font-semibold text-spirit-600 hover:underline">
              Ouvrir →
            </Link>
          ): null}
          <RemoveBtn onRemove={onRemove} />
        </div>
      </div>
    </article>
  );
}

function NoteCard({ note, onRemove }: { note: Note; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  return (
    <article
      className={`rounded-3xl border p-5 ${
        note.answered? "border-spirit-500/30 bg-spirit-500/[0.06]": "border-night-900/10 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-spirit-600">
          {note.category}
          {note.answered? " · exaucé": ""}
        </span>
        <div className="flex items-center gap-2">
          {note.category === "Prière"? (
            <button
              type="button"
              onClick={() => toggleAnswered(note.id)}
              className="text-xs font-semibold text-spirit-600 hover:underline"
            >
              {note.answered? "Rouvrir": "Exaucé"}
            </button>
          ): null}
          {!editing? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Modifier"
              className="text-night-900/35 transition-colors hover:text-spirit-700"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
                <path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ): null}
          <RemoveBtn onRemove={onRemove} />
        </div>
      </div>

      {editing? (
        <div className="mt-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="field w-full" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="field mt-2 w-full resize-y"
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={!body.trim() &&!title.trim()}
              onClick={() => {
                updateNote(note.id, { title: title.trim(), body: body.trim() });
                setEditing(false);
              }}
              className="btn-primary text-sm disabled:opacity-40"
            >
              Enregistrer
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost text-sm">
              Annuler
            </button>
          </div>
        </div>
      ): (
        <>
          {note.title? (
            <p className="mt-1 font-display text-lg font-bold text-night-900">{note.title}</p>
          ): null}
          {note.body? (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-night-900/80">{note.body}</p>
          ): null}
          <p className="mt-2 text-xs text-night-900/40">{fmt(note.ts)}</p>
        </>
      )}
    </article>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-spirit-600">{label}</span>
  );
}

function RemoveBtn({ onRemove, tone = "light" }: { onRemove: () => void; tone?: "light" | "dark" }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Retirer"
      className={`text-xs font-semibold transition-colors ${
        tone === "dark"? "text-cream/50 hover:text-white": "text-night-900/35 hover:text-red-500"
      }`}
    >
      Retirer
    </button>
  );
}
