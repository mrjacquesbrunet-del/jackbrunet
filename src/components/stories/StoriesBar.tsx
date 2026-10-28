"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import type { Profile } from "@/lib/community";
import {
  listStoryGroups,
  addStory,
  markStoryViewed,
  storyViewCounts,
  deleteStory,
  setStoryLike,
  myStoryLikes,
  storyLikeCounts,
  storyViewers,
  replyToStory,
  type StoryGroup,
  type StoryViewer as Spectateur,
} from "@/lib/stories";
import { imageLegere } from "@/lib/image-legere";

/**
 * STORIES 24 h : la rangée de ronds (ma story + celles des amis, anneau
 * lime quand il reste du nouveau) et le lecteur plein écran — progression
 * segmentée, avance automatique, tap gauche/droite, auteur suivant à la fin.
 */

const DURATION = 5000; // ms par story
/** Réactions rapides en réponse à une story (les mêmes que sur le mur de prière). */
const REACTIONS = ["🙏", "❤️", "🕊️", "🙌", "✨"];

function ilYa(iso: string | null): string {
  if (!iso) return "";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  return `il y a ${Math.floor(min / 60)} h`;
}

export function StoriesBar({
  me,
  myProfile,
  dark = true,
}: {
  me: string;
  myProfile?: Profile | null;
  dark?: boolean;
}) {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [open, setOpen] = useState<{ g: number; s: number } | null>(null);
  const [publishing, setPublishing] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    listStoryGroups(me).then(setGroups);
  }, [me]);
  useEffect(() => {
    reload();
  }, [reload]);

  const myGroup = groups.find((g) => g.mine);
  const others = groups.filter((g) => !g.mine);
  const sub = dark ? "text-cream/70" : "text-night-900/70";

  async function publish() {
    if (!publishing || busy) return;
    setBusy(true);
    const s = await addStory(me, publishing, caption);
    setBusy(false);
    if (s) {
      setPublishing(null);
      setCaption("");
      reload();
    }
  }

  return (
    <div className="mb-4">
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {/* Ma story : + pour publier, ou mon rond si j'en ai une */}
        <button
          type="button"
          onClick={() => (myGroup ? setOpen({ g: groups.indexOf(myGroup), s: 0 }) : fileRef.current?.click())}
          className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1"
        >
          <span className={`relative rounded-full p-[3px] ${myGroup ? "bg-gradient-to-tr from-dawn-400 to-spirit-500" : dark ? "bg-white/15" : "bg-night-900/15"}`}>
            <span className={`block rounded-full p-[2px] ${dark ? "bg-night-950" : "bg-cream"}`}>
              <Avatar pseudo={myProfile?.pseudo ?? ""} url={myProfile?.avatar_url ?? null} size={56} />
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-dawn-400 text-night-950 ring-2 ring-night-950">
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={3}>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </span>
          </span>
          <span className={`w-full truncate text-center text-[11px] font-semibold ${sub}`}>Ta story</span>
        </button>

        {others.map((g) => (
          <button
            key={g.author.id}
            type="button"
            onClick={() => setOpen({ g: groups.indexOf(g), s: g.stories.findIndex((s) => !s.viewed) === -1 ? 0 : g.stories.findIndex((s) => !s.viewed) })}
            className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1"
          >
            <span className={`rounded-full p-[3px] ${g.allViewed ? (dark ? "bg-white/20" : "bg-night-900/20") : "bg-gradient-to-tr from-dawn-400 to-spirit-500"}`}>
              <span className={`block rounded-full p-[2px] ${dark ? "bg-night-950" : "bg-cream"}`}>
                <Avatar pseudo={g.author.pseudo} url={g.author.avatar_url} size={56} />
              </span>
            </span>
            <span className={`w-full truncate text-center text-[11px] font-semibold ${sub}`}>{g.author.pseudo}</span>
          </button>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          e.target.value = "";
          if (f) setPublishing(f);
        }}
      />

      {/* Ajouter une story depuis mon rond même si j'en ai déjà une */}
      {myGroup ? (
        <button type="button" onClick={() => fileRef.current?.click()} className="sr-only">
          Ajouter une story
        </button>
      ) : null}

      {/* Confirmation de publication : aperçu + légende */}
      {publishing ? (
        <div className="fixed inset-0 z-[150] flex flex-col bg-night-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={URL.createObjectURL(publishing)} alt="" className="min-h-0 flex-1 object-contain" />
          <div className="space-y-2.5 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={160}
              placeholder="Une légende ? (facultatif)"
              className="w-full rounded-full border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPublishing(null);
                  setCaption("");
                }}
                className="flex-1 rounded-full border border-white/15 py-3 font-display text-sm font-bold text-cream/75"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={publish}
                disabled={busy}
                className="flex-1 rounded-full bg-dawn-400 py-3 font-display text-sm font-extrabold text-night-950 disabled:opacity-50"
              >
                {busy ? "Envoi…" : "Publier ma story"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {open !== null && groups[open.g] ? (
        <StoryViewer
          groups={groups}
          start={open}
          me={me}
          onClose={() => {
            setOpen(null);
            reload();
          }}
          onAddMine={() => {
            setOpen(null);
            fileRef.current?.click();
          }}
        />
      ) : null}
    </div>
  );
}

// ————————————————————— Lecteur plein écran —————————————————————
function StoryViewer({
  groups,
  start,
  me,
  onClose,
  onAddMine,
}: {
  groups: StoryGroup[];
  start: { g: number; s: number };
  me: string;
  onClose: () => void;
  onAddMine: () => void;
}) {
  const [pos, setPos] = useState(start);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [views, setViews] = useState<Record<string, number>>({});
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [aimees, setAimees] = useState<Set<string>>(new Set());
  const [feuille, setFeuille] = useState<Spectateur[] | null>(null);
  const [texte, setTexte] = useState("");
  const [saisie, setSaisie] = useState(false);
  const [envoye, setEnvoye] = useState("");
  // La story s'arrête pendant qu'on écrit ou qu'on regarde qui l'a vue.
  const arret = paused || feuille !== null || saisie || texte.length > 0;
  const raf = useRef<number | null>(null);
  const startedAt = useRef(0);
  const elapsed = useRef(0);

  const group = groups[pos.g];
  const story = group?.stories[pos.s];

  const next = useCallback(() => {
    setProgress(0);
    elapsed.current = 0;
    setPos((p) => {
      const g = groups[p.g];
      if (p.s + 1 < g.stories.length) return { g: p.g, s: p.s + 1 };
      if (p.g + 1 < groups.length) return { g: p.g + 1, s: 0 };
      onClose();
      return p;
    });
  }, [groups, onClose]);

  const prev = useCallback(() => {
    setProgress(0);
    elapsed.current = 0;
    setPos((p) => {
      if (p.s > 0) return { g: p.g, s: p.s - 1 };
      if (p.g > 0) {
        const pg = groups[p.g - 1];
        return { g: p.g - 1, s: pg.stories.length - 1 };
      }
      return p;
    });
  }, [groups]);

  // Minuterie d'avance automatique (pause au doigt posé).
  useEffect(() => {
    if (!story) return;
    void markStoryViewed(story.id, me);
    const ids = group.stories.map((s) => s.id);
    if (group.mine) {
      storyViewCounts(ids, me).then(setViews);
      storyLikeCounts(ids).then(setLikes);
    } else {
      myStoryLikes(ids, me).then((set) => setAimees((prev) => new Set([...prev, ...set])));
    }
    setTexte("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  useEffect(() => {
    if (arret || !story) return;
    startedAt.current = performance.now() - elapsed.current;
    const tick = (t: number) => {
      elapsed.current = t - startedAt.current;
      const p = elapsed.current / DURATION;
      if (p >= 1) {
        next();
        return;
      }
      setProgress(p);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [arret, story?.id, next, story]);

  if (!group || !story) return null;

  const aime = aimees.has(story.id);
  async function basculerJaime() {
    if (!story) return;
    const on = !aimees.has(story.id);
    setAimees((prev) => {
      const n = new Set(prev);
      if (on) n.add(story.id);
      else n.delete(story.id);
      return n;
    });
    const ok = await setStoryLike(story.id, me, on);
    if (!ok) {
      setAimees((prev) => {
        const n = new Set(prev);
        if (on) n.delete(story.id);
        else n.add(story.id);
        return n;
      });
    }
  }
  async function repondre(contenu: string) {
    if (!story || !contenu.trim()) return;
    const ok = await replyToStory(me, story, contenu);
    setTexte("");
    setSaisie(false);
    (document.activeElement as HTMLElement | null)?.blur?.();
    setEnvoye(ok ? "Envoyé" : "Envoi impossible, réessaie");
    setTimeout(() => setEnvoye(""), 1600);
  }
  async function ouvrirVues() {
    if (!story) return;
    setFeuille([]);
    setFeuille(await storyViewers(story.id, me));
  }
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-[160] flex flex-col bg-black"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...imageLegere(story.image_url, 540)} alt="" className="absolute inset-0 h-full w-full object-contain" />
      <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 to-transparent pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {/* Segments de progression */}
        <div className="flex gap-1 px-3">
          {group.stories.map((s, i) => (
            <span key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full rounded-full bg-white"
                style={{ width: i < pos.s ? "100%" : i === pos.s ? `${progress * 100}%` : "0%" }}
              />
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-2.5 px-3">
          <Avatar pseudo={group.author.pseudo} url={group.author.avatar_url} size={34} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-white">{group.author.pseudo}</span>
            <span className="block text-[11px] text-white/60">
              {(() => {
                const h = Math.floor((Date.now() - new Date(story.created_at).getTime()) / 3600_000);
                return h < 1 ? "à l'instant" : `il y a ${h} h`;
              })()}
            </span>
          </span>
          {group.mine ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Supprimer cette story ?")) {
                    void deleteStory(story.id, story.image_url);
                    onClose();
                  }
                }}
                aria-label="Supprimer"
                className="grid h-9 w-9 place-items-center rounded-full text-white/70"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.9}>
                  <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 7" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMine();
                }}
                aria-label="Ajouter une story"
                className="grid h-9 w-9 place-items-center rounded-full text-white/80"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-full text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {story.caption && !saisie ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] bg-gradient-to-t from-black/60 to-transparent px-5 pb-3 pt-10">
          <p className="text-center text-[15px] font-semibold leading-relaxed text-white">{story.caption}</p>
        </div>
      ) : null}

      {/* Zones de navigation : tap gauche = précédent, droite = suivant (au-dessus de la barre du bas) */}
      <button type="button" aria-label="Story précédente" onClick={prev} className="absolute left-0 top-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] w-1/3" />
      <button type="button" aria-label="Story suivante" onClick={next} className="absolute right-0 top-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] w-2/3" />

      {/* Barre du bas : répondre / j'aime (stories des autres), vues (les miennes) */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-6"
        onPointerDown={stop}
        onPointerUp={stop}
      >
        {group.mine ? (
          <button
            type="button"
            onClick={() => void ouvrirVues()}
            className="mx-auto flex items-center gap-4 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur"
          >
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Vu par {views[story.id] ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current text-dawn-400" aria-hidden>
                <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" />
              </svg>
              {likes[story.id] ?? 0}
            </span>
          </button>
        ) : (
          <>
            {saisie ? (
              <div className="mb-3 flex justify-around">
                {REACTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    // Avant que le champ perde le focus (sinon la rangée disparaît).
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => void repondre(r)}
                    aria-label={`Réagir ${r}`}
                    className="grid h-12 w-12 place-items-center rounded-full text-[28px] transition-transform active:scale-90"
                  >
                    {r}
                  </button>
                ))}
              </div>
            ) : null}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void repondre(texte);
              }}
            >
              <input
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                onFocus={() => setSaisie(true)}
                onBlur={() => setSaisie(false)}
                maxLength={500}
                enterKeyHint="send"
                placeholder={`Répondre à ${group.author.pseudo}…`}
                className="min-w-0 flex-1 rounded-full border border-white/45 bg-black/20 px-4 py-2.5 text-[15px] text-white placeholder:text-white/70 focus:border-white focus:outline-none"
              />
              {texte.trim() ? (
                <button
                  type="submit"
                  onPointerDown={(e) => e.preventDefault()}
                  className="shrink-0 rounded-full bg-dawn-400 px-4 py-2.5 text-sm font-bold text-night-950"
                >
                  Envoyer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void basculerJaime()}
                  aria-label={aime ? "Je n'aime plus" : "J'aime"}
                  aria-pressed={aime}
                  className="grid h-11 w-11 shrink-0 place-items-center text-white transition-transform active:scale-90"
                >
                  <svg viewBox="0 0 24 24" className={`h-7 w-7 ${aime ? "fill-current text-dawn-400" : "fill-none stroke-current"}`} strokeWidth={1.9} aria-hidden>
                    <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </form>
          </>
        )}
      </div>

      {envoye ? (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex justify-center">
          <span className="rounded-full bg-black/75 px-4 py-2 text-sm font-semibold text-white">{envoye}</span>
        </div>
      ) : null}

      {/* Qui a vu ma story */}
      {feuille !== null ? (
        <div className="absolute inset-0 z-30 flex flex-col justify-end" onPointerDown={stop} onPointerUp={stop}>
          <button type="button" aria-label="Fermer" onClick={() => setFeuille(null)} className="absolute inset-0 bg-black/50" />
          <div className="relative max-h-[65%] overflow-y-auto rounded-t-3xl bg-night-900 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-cream">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <p className="flex items-center justify-between text-sm font-bold">
              <span>Vu par {views[story.id] ?? feuille.length}</span>
              <span className="flex items-center gap-1 text-cream/70">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-dawn-400" aria-hidden>
                  <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" />
                </svg>
                {likes[story.id] ?? 0}
              </span>
            </p>
            {feuille.length === 0 ? (
              <p className="py-6 text-center text-sm text-cream/55">Personne n'a encore vu ta story.</p>
            ) : (
              <ul className="mt-3 space-y-1">
                {feuille.map((v) => (
                  <li key={v.profile.id}>
                    <Link href={`/membre?u=${v.profile.id}`} onClick={onClose} className="flex items-center gap-3 rounded-2xl px-1 py-2 hover:bg-white/5">
                      <Avatar pseudo={v.profile.pseudo} url={v.profile.avatar_url} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{v.profile.pseudo}</span>
                        {v.vuLe ? <span className="block text-xs text-cream/50">{ilYa(v.vuLe)}</span> : null}
                      </span>
                      {v.aime ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current text-dawn-400" aria-label="Aime ta story">
                          <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" />
                        </svg>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
