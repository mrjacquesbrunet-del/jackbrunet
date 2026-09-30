"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { ReportButton } from "@/components/community/ReportButton";
import { listFollowingIds, type Profile } from "@/lib/community";
import {
  createWallPost,
  deleteWallPost,
  listPublicWall,
  listFriendsWall,
  listUserWall,
  wallReactionsFor,
  toggleWallReaction,
  wallCommentCounts,
  listWallComments,
  addWallComment,
  sanitizeWallLink,
  linkPlatform,
  uploadWallImage,
  type WallPost,
  type WallComment,
  type WallVisibility,
} from "@/lib/wall";

/**
 * LE MUR : le cœur social du profil, façon page Facebook.
 * Trois onglets (Mon mur · Amis · Communauté), un composeur en tête,
 * des publications texte / verset / lien (réseaux connus seulement),
 * réactions, commentaires, relais.
 */

const QUICK: [string, string][] = [["🙏", "pray"], ["❤️", "heart"], ["🕊️", "dove"], ["🙌", "hands"], ["✨", "sparkles"]];
const EMOJI = new Map(QUICK.map(([e, t]) => [t, e]));

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 7 * 86400) return `il y a ${Math.floor(s / 86400)} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  site: "jackbrunet.com",
};

export function WallSection({
  me,
  myProfile,
  isModerator = false,
  dark = true,
}: {
  /** Mon id (connecté). */
  me: string;
  myProfile?: Profile | null;
  isModerator?: boolean;
  dark?: boolean;
}) {
  const [tab, setTab] = useState<"moi" | "amis" | "public">("moi");
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);
  const [reactions, setReactions] = useState<Record<string, { mine: string | null; counts: Record<string, number> }>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    listFollowingIds(me).then(setFollowing);
  }, [me]);

  const fetchPage = useCallback(
    async (before?: string) => {
      if (tab === "moi") return listUserWall(me, before);
      if (tab === "amis") return listFriendsWall(following, before);
      return listPublicWall(before);
    },
    [tab, me, following],
  );

  const refreshMeta = useCallback(
    async (list: WallPost[]) => {
      const ids = list.flatMap((p) => (p.original ? [p.id, p.original.id] : [p.id]));
      const [rs, cc] = await Promise.all([wallReactionsFor(ids), wallCommentCounts(ids)]);
      const agg: Record<string, { mine: string | null; counts: Record<string, number> }> = {};
      for (const r of rs) {
        const a = (agg[r.post_id] ??= { mine: null, counts: {} });
        a.counts[r.type] = (a.counts[r.type] ?? 0) + 1;
        if (r.user_id === me) a.mine = r.type;
      }
      setReactions(agg);
      setCommentCounts(cc);
    },
    [me],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const list = await fetchPage();
    setPosts(list);
    setHasMore(list.length >= 20);
    setLoading(false);
    void refreshMeta(list);
  }, [fetchPage, refreshMeta]);

  useEffect(() => {
    void load();
  }, [load]);

  async function loadMore() {
    const last = posts[posts.length - 1];
    if (!last) return;
    const more = await fetchPage(last.created_at);
    const next = [...posts, ...more];
    setPosts(next);
    setHasMore(more.length >= 20);
    void refreshMeta(next);
  }

  const sub = dark ? "text-cream/55" : "text-night-900/55";
  const tabOn = "bg-dawn-400 text-night-950";
  const tabOff = dark ? "text-cream/65" : "text-night-900/60";

  return (
    <div>
      {/* Les trois onglets du mur */}
      <div className={`flex rounded-full p-1 ${dark ? "bg-white/[0.07]" : "bg-night-900/[0.06]"}`}>
        {(
          [
            ["moi", "Mon profil"],
            ["amis", "Amis"],
            ["public", "Public"],
          ] as ["public" | "amis" | "moi", string][]
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`flex-1 rounded-full py-2 font-display text-sm font-bold transition-colors ${tab === t ? tabOn : tabOff}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Composeur */}
      <WallComposer
        me={me}
        myProfile={myProfile}
        dark={dark}
        onPosted={(p) => {
          if (tab !== "amis") setPosts((cur) => [{ ...p, author: myProfile ?? undefined }, ...cur]);
        }}
      />

      {/* Le fil */}
      {loading ? (
        <p className={`mt-6 text-center text-sm ${sub}`}>Chargement du mur…</p>
      ) : posts.length === 0 ? (
        <p className={`mt-6 text-center text-sm ${sub}`}>
          {tab === "moi"
            ? "Ton mur est vide : écris ta première publication."
            : tab === "amis"
              ? "Aucune publication de tes amis pour l'instant — abonne-toi à des membres."
              : "Aucune publication publique pour l'instant. Lance-toi !"}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {posts.map((p) => (
            <WallPostCard
              key={p.id}
              post={p}
              me={me}
              dark={dark}
              canDelete={p.author_id === me || isModerator}
              reaction={reactions[p.id] ?? { mine: null, counts: {} }}
              commentCount={commentCounts[p.id] ?? 0}
              onDeleted={() => setPosts((cur) => cur.filter((x) => x.id !== p.id))}
              onReact={async (type, on) => {
                await toggleWallReaction(p.id, me, type, on);
                setReactions((cur) => {
                  const prev = cur[p.id] ?? { mine: null, counts: {} };
                  const counts = { ...prev.counts };
                  if (prev.mine) counts[prev.mine] = Math.max(0, (counts[prev.mine] ?? 1) - 1);
                  if (on) counts[type] = (counts[type] ?? 0) + 1;
                  return { ...cur, [p.id]: { mine: on ? type : null, counts } };
                });
              }}
              onReshared={(np) => {
                if (tab !== "amis") setPosts((cur) => [{ ...np, author: myProfile ?? undefined, original: p }, ...cur]);
              }}
            />
          ))}
          {hasMore ? (
            <button
              type="button"
              onClick={loadMore}
              className={`w-full rounded-full border py-2.5 text-sm font-bold ${dark ? "border-white/15 text-cream/75" : "border-night-900/15 text-night-900/70"}`}
            >
              Voir plus
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ————————————————————————— Composeur —————————————————————————
function WallComposer({
  me,
  myProfile,
  dark,
  onPosted,
}: {
  me: string;
  myProfile?: Profile | null;
  dark: boolean;
  onPosted: (p: WallPost) => void;
}) {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<WallVisibility>("public");
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState(false);
  const [busy, setBusy] = useState(false);
  // Photo jointe : choisie ici, compressée puis envoyée au moment de publier.
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  function pickPhoto(f: File | null) {
    setPhoto(f);
    setPhotoError(false);
    setPhotoPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return f ? URL.createObjectURL(f) : null;
    });
  }

  const card = dark ? "border-white/10 bg-white/[0.05]" : "border-night-900/10 bg-white";
  const field = dark
    ? "w-full resize-none rounded-2xl border border-white/15 bg-night-950/50 px-3.5 py-2.5 text-[15px] text-cream placeholder:text-cream/40 focus:outline-none"
    : "w-full resize-none rounded-2xl border border-night-900/15 bg-white px-3.5 py-2.5 text-[15px] text-night-900 placeholder:text-night-900/40 focus:outline-none";

  async function publish() {
    const cleanLink = link.trim() ? sanitizeWallLink(link) : null;
    if (link.trim() && !cleanLink) {
      setLinkError(true);
      return;
    }
    if (!body.trim() && !cleanLink && !photo) return;
    setBusy(true);
    let imageUrl: string | undefined;
    if (photo) {
      const up = await uploadWallImage(me, photo);
      if (!up) {
        setPhotoError(true);
        setBusy(false);
        return;
      }
      imageUrl = up;
    }
    const post = await createWallPost({
      authorId: me,
      body,
      visibility,
      linkUrl: cleanLink ?? undefined,
      imageUrl,
    });
    setBusy(false);
    if (post) {
      setBody("");
      setLink("");
      setLinkOpen(false);
      setLinkError(false);
      pickPhoto(null);
      // La zone de texte reprend sa petite taille (l'auto-agrandissement
      // avait figé la hauteur du message publié).
      if (taRef.current) {
        taRef.current.style.height = "";
        taRef.current.style.overflowY = "";
      }
      onPosted(post);
    }
  }

  return (
    <div className={`mt-4 rounded-3xl border p-3.5 shadow-card ${card}`}>
      <div className="flex items-start gap-3">
        <Avatar url={myProfile?.avatar_url ?? null} pseudo={myProfile?.pseudo ?? ""} size={40} />
        <textarea
          ref={taRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Exprime-toi : un mot, un témoignage, une parole…"
          rows={1}
          maxLength={2000}
          className={field}
        />
      </div>
      {photoPreview ? (
        <div className="mt-2 pl-[52px]">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="" className="h-24 w-24 rounded-2xl object-cover" />
            <button
              type="button"
              onClick={() => pickPhoto(null)}
              aria-label="Retirer la photo"
              className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-night-950 text-cream shadow-card"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.4}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {photoError ? (
            <p className="mt-1 text-xs font-semibold text-red-400">
              Photo impossible à envoyer — réessaie (connexion ou format).
            </p>
          ) : null}
        </div>
      ) : null}
      {linkOpen ? (
        <div className="mt-2 pl-[52px]">
          <input
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setLinkError(false);
            }}
            placeholder="Lien Facebook, Instagram, TikTok ou YouTube…"
            className={`${field} resize-none`}
          />
          {linkError ? (
            <p className="mt-1 text-xs font-semibold text-red-400">
              Seuls les liens Facebook, Instagram, TikTok et YouTube sont acceptés.
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="mt-2.5 flex items-center gap-2 pl-[52px]">
        {/* Visibilité : Public / Amis */}
        <button
          type="button"
          onClick={() => setVisibility((v) => (v === "public" ? "friends" : "public"))}
          aria-label="Changer la visibilité"
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold ${dark ? "border-white/15 text-cream/75" : "border-night-900/15 text-night-900/70"}`}
        >
          {visibility === "public" ? (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.9}>
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
              </svg>
              Public
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.9}>
                <circle cx="9" cy="8" r="3.2" />
                <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 1 1-1 5.8M15.5 13.6A5.5 5.5 0 0 1 20.5 19" strokeLinecap="round" />
              </svg>
              Amis
            </>
          )}
        </button>
        {/* Photo (compressée sur le téléphone avant l'envoi) */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Joindre une photo"
          className={`grid h-8 w-8 place-items-center rounded-full border ${photo ? "border-dawn-400 text-dawn-300" : dark ? "border-white/15 text-cream/75" : "border-night-900/15 text-night-900/70"}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="M5 17l4.5-4.5 3 3L16 12l3 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {/* Lien (réseaux connus) */}
        <button
          type="button"
          onClick={() => setLinkOpen((v) => !v)}
          aria-label="Joindre un lien"
          aria-expanded={linkOpen}
          className={`grid h-8 w-8 place-items-center rounded-full border ${linkOpen ? "border-dawn-400 text-dawn-300" : dark ? "border-white/15 text-cream/75" : "border-night-900/15 text-night-900/70"}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
            <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.5 1.5M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.5-1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={publish}
          disabled={busy || (!body.trim() && !link.trim() && !photo)}
          className="ml-auto rounded-full bg-dawn-400 px-5 py-2 font-display text-sm font-extrabold text-night-950 shadow-card disabled:opacity-40"
        >
          {busy ? "Envoi…" : "Publier"}
        </button>
      </div>
    </div>
  );
}

// ————————————————————————— Carte de publication —————————————————————————
function WallPostCard({
  post,
  me,
  dark,
  canDelete,
  reaction,
  commentCount,
  onDeleted,
  onReact,
  onReshared,
}: {
  post: WallPost;
  me: string;
  dark: boolean;
  canDelete: boolean;
  reaction: { mine: string | null; counts: Record<string, number> };
  commentCount: number;
  onDeleted: () => void;
  onReact: (type: string, on: boolean) => void;
  onReshared: (p: WallPost) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [resharing, setResharing] = useState(false);

  const card = dark ? "border-white/10 bg-white/[0.05]" : "border-night-900/10 bg-white";
  const text = dark ? "text-cream" : "text-night-900";
  const sub = dark ? "text-cream/50" : "text-night-900/50";
  const chip = dark ? "border-white/15 text-cream/70" : "border-night-900/15 text-night-900/65";

  const totalReactions = Object.values(reaction.counts).reduce((s, n) => s + n, 0);

  async function reshare() {
    if (resharing) return;
    setResharing(true);
    const np = await createWallPost({
      authorId: me,
      body: "",
      visibility: "public",
      reshareOf: post.reshare_of ?? post.id,
    });
    setResharing(false);
    if (np) onReshared(np);
  }

  function Body({ p }: { p: WallPost }) {
    return (
      <>
        {p.body ? <p className={`whitespace-pre-wrap text-[15px] leading-relaxed ${text}`}>{p.body}</p> : null}
        {p.verse_text ? (
          <div className="dark-ctx mt-2 overflow-hidden rounded-2xl border border-dawn-400/30 bg-gradient-to-br from-night-900 to-night-950 p-4 text-cream">
            <p className="font-display text-[17px] font-bold leading-snug">« {p.verse_text} »</p>
            {p.verse_ref ? <p className="mt-2 text-xs font-black uppercase tracking-[0.15em] text-dawn-300">{p.verse_ref}</p> : null}
          </div>
        ) : null}
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt=""
            loading="lazy"
            className="mt-2 max-h-[26rem] w-full rounded-2xl object-cover"
          />
        ) : null}
        {p.link_url ? (
          <a
            href={p.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 ${chip}`}
          >
            <PlatformIcon platform={linkPlatform(p.link_url)} />
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-bold ${text}`}>{PLATFORM_LABEL[linkPlatform(p.link_url)]}</span>
              <span className={`block truncate text-xs ${sub}`}>{p.link_url.replace(/^https?:\/\/(www\.)?/, "")}</span>
            </span>
            <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 fill-none stroke-current ${sub}`} strokeWidth={2}>
              <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ) : null}
      </>
    );
  }

  return (
    <article className={`rounded-3xl border p-4 shadow-card ${card}`}>
      {/* Auteur */}
      <div className="flex items-center gap-2.5">
        <Avatar url={post.author?.avatar_url ?? null} pseudo={post.author?.pseudo ?? ""} size={38} />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-bold ${text}`} style={post.author?.name_color ? { color: post.author.name_color } : undefined}>
            {post.author?.pseudo ?? "Membre"}
            {post.author?.verified ? <VerifiedBadge className="ml-1 inline-block h-4 w-4 align-text-bottom" /> : null}
          </p>
          <p className={`flex items-center gap-1.5 text-[11px] ${sub}`}>
            {timeAgo(post.created_at)}
            {post.visibility === "friends" ? <span>· Amis</span> : null}
            {post.original ? <span>· a relayé</span> : null}
          </p>
        </div>
        {canDelete ? (
          <button
            type="button"
            onClick={() => {
              if (confirm("Supprimer cette publication ?")) {
                void deleteWallPost(post.id, post.image_url);
                onDeleted();
              }
            }}
            aria-label="Supprimer"
            className={`grid h-8 w-8 place-items-center rounded-full ${sub}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 7" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <ReportButton targetType="wall_post" targetId={post.id} tone={dark ? "dark" : "light"} />
        )}
      </div>

      {/* Contenu */}
      <div className="mt-2.5">
        <Body p={post} />
        {post.original ? (
          <div className={`mt-2 rounded-2xl border p-3 ${dark ? "border-white/12 bg-night-950/40" : "border-night-900/10 bg-night-900/[0.03]"}`}>
            <div className="mb-1.5 flex items-center gap-2">
              <Avatar url={post.original.author?.avatar_url ?? null} pseudo={post.original.author?.pseudo ?? ""} size={24} />
              <span className={`text-xs font-bold ${text}`}>{post.original.author?.pseudo ?? "Membre"}</span>
              <span className={`text-[11px] ${sub}`}>{timeAgo(post.original.created_at)}</span>
            </div>
            <Body p={post.original} />
          </div>
        ) : null}
      </div>

      {/* Réactions + actions */}
      <div className="relative mt-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${reaction.mine ? "border-dawn-400 text-dawn-300" : chip}`}
        >
          <span>{reaction.mine ? EMOJI.get(reaction.mine) : "🙏"}</span>
          {totalReactions > 0 ? <span className="text-xs font-bold tabular-nums">{totalReactions}</span> : null}
        </button>
        {pickerOpen ? (
          <div className={`absolute bottom-11 left-0 z-10 flex gap-1 rounded-full border p-1.5 shadow-card ${dark ? "border-white/15 bg-night-900" : "border-night-900/10 bg-white"}`}>
            {QUICK.map(([e, t]) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onReact(t, reaction.mine !== t);
                  setPickerOpen(false);
                }}
                className={`grid h-9 w-9 place-items-center rounded-full text-lg transition-transform hover:scale-110 ${reaction.mine === t ? "bg-dawn-400/20" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          aria-expanded={commentsOpen}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${chip}`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.9}>
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {commentCount > 0 ? commentCount : "Commenter"}
        </button>
        <button
          type="button"
          onClick={reshare}
          disabled={resharing || post.author_id === me}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold disabled:opacity-40 ${chip}`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.9}>
            <path d="M17 2l4 4-4 4M21 6H8a5 5 0 0 0-5 5M7 22l-4-4 4-4M3 18h13a5 5 0 0 0 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Relayer
        </button>
      </div>

      {commentsOpen ? <WallComments postId={post.id} me={me} dark={dark} /> : null}
    </article>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const cls = "h-8 w-8 shrink-0 rounded-xl p-1.5 text-white";
  if (platform === "youtube")
    return (
      <span className={`${cls} grid place-items-center bg-[#FF0000]`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M10 8.5v7l6-3.5z" /></svg>
      </span>
    );
  if (platform === "instagram")
    return (
      <span className={`${cls} grid place-items-center bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.5" /><circle cx="16.8" cy="7.2" r="0.8" fill="currentColor" /></svg>
      </span>
    );
  if (platform === "tiktok")
    return (
      <span className={`${cls} grid place-items-center bg-night-950`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M14.5 3h2.6c.3 1.8 1.4 3.2 3.4 3.6v2.7c-1.3 0-2.5-.4-3.6-1.1v5.6a5.9 5.9 0 1 1-5.9-5.9c.3 0 .7 0 1 .1v2.8a3.1 3.1 0 1 0 2.5 3V3z" /></svg>
      </span>
    );
  if (platform === "facebook")
    return (
      <span className={`${cls} grid place-items-center bg-[#1877F2]`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.2c0-.8.3-1.4 1.5-1.4h1.4V5.2c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2.5H8.5V14H11v7z" /></svg>
      </span>
    );
  return (
    <span className={`${cls} grid place-items-center bg-spirit-600`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.2 2.3 3.3 5 3.3 8S14.2 17.7 12 20c-2.2-2.3-3.3-5-3.3-8S9.8 6.3 12 4z" /></svg>
    </span>
  );
}

// ————————————————————————— Commentaires —————————————————————————
function WallComments({ postId, me, dark }: { postId: string; me: string; dark: boolean }) {
  const [comments, setComments] = useState<WallComment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listWallComments(postId).then(setComments);
  }, [postId]);

  const text = dark ? "text-cream" : "text-night-900";
  const sub = dark ? "text-cream/50" : "text-night-900/50";
  const field = dark
    ? "flex-1 rounded-full border border-white/15 bg-night-950/50 px-3.5 py-2 text-sm text-cream placeholder:text-cream/40 focus:outline-none"
    : "flex-1 rounded-full border border-night-900/15 bg-white px-3.5 py-2 text-sm text-night-900 placeholder:text-night-900/40 focus:outline-none";

  async function send() {
    if (!draft.trim() || busy) return;
    setBusy(true);
    const c = await addWallComment(postId, me, draft);
    setBusy(false);
    if (c) {
      setComments((cur) => [...(cur ?? []), c]);
      setDraft("");
    }
  }

  return (
    <div className={`mt-3 border-t pt-3 ${dark ? "border-white/10" : "border-night-900/10"}`}>
      {comments === null ? (
        <p className={`text-xs ${sub}`}>Chargement…</p>
      ) : (
        <div className="space-y-2.5">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar url={c.author?.avatar_url ?? null} pseudo={c.author?.pseudo ?? ""} size={28} />
              <div className={`min-w-0 flex-1 rounded-2xl px-3 py-2 ${dark ? "bg-white/[0.06]" : "bg-night-900/[0.05]"}`}>
                <p className={`text-xs font-bold ${text}`}>{c.author?.pseudo ?? "Membre"}</p>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${text}`}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2.5 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Écrire un commentaire…"
          className={field}
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || busy}
          aria-label="Envoyer"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
            <path d="M4 12l16-7-4.5 7L20 19zM4 12h11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
