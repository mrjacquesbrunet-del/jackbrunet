"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import type { Profile } from "@/lib/community";
import {
  listStoryGroups,
  addStory,
  markStoryViewed,
  storyViewCounts,
  deleteStory,
  type StoryGroup,
} from "@/lib/stories";

/**
 * STORIES 24 h : la rangée de ronds (ma story + celles des amis, anneau
 * lime quand il reste du nouveau) et le lecteur plein écran — progression
 * segmentée, avance automatique, tap gauche/droite, auteur suivant à la fin.
 */

const DURATION = 5000; // ms par story

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
    if (group.mine) {
      storyViewCounts(group.stories.map((s) => s.id)).then(setViews);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  useEffect(() => {
    if (paused || !story) return;
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
  }, [paused, story?.id, next, story]);

  if (!group || !story) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex flex-col bg-black"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={story.image_url} alt="" className="absolute inset-0 h-full w-full object-contain" />
      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
              <span className="flex items-center gap-1 text-xs font-bold text-white/80">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
                  <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {views[story.id] ?? 0}
              </span>
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

      {story.caption ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-12">
          <p className="text-center text-[15px] font-semibold leading-relaxed text-white">{story.caption}</p>
        </div>
      ) : null}

      {/* Zones de navigation : tap gauche = précédent, droite = suivant */}
      <button type="button" aria-label="Story précédente" onClick={prev} className="absolute inset-y-0 left-0 w-1/3" />
      <button type="button" aria-label="Story suivante" onClick={next} className="absolute inset-y-0 right-0 w-2/3" />
    </div>
  );
}
