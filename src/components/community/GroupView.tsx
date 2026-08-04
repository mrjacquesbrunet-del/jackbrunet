"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth, initials } from "@/components/community/useAuth";
import { searchProfiles, type Profile } from "@/lib/community";
import { RichText } from "@/components/community/RichText";
import { ReportButton } from "@/components/community/ReportButton";
import { ACCENTS, type AccentKey } from "@/lib/profile-accent";
import { asset } from "@/lib/asset";
import {
  getGroup,
  myMembership,
  requestJoin,
  leaveGroup,
  updateGroup,
  deleteGroup,
  uploadGroupCover,
  listMembers,
  approveMember,
  removeMember,
  inviteToGroup,
  acceptInvite,
  listPosts,
  createPost,
  deletePost,
  listComments,
  commentCounts,
  addComment,
  deleteComment,
  reactionsFor,
  toggleReaction,
  listMessages,
  sendMessage,
  GROUP_REACTIONS,
  KIND_LABEL,
  type Group,
  type GroupMember,
  type GroupPost,
  type GroupComment,
  type GroupReaction,
  type GroupMessage,
  type GroupRole,
  type GroupStatus,
} from "@/lib/groups";
import { VoiceRecorderButton, VoiceNotePlayer } from "@/components/community/VoiceNote";

const BG = "#14160E";
const fieldDark =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-cream placeholder:text-cream/40 outline-none focus:border-dawn-400/60";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400/20 text-xs font-bold text-dawn-300">
      {initials(name)}
    </span>
  );
}

type Tab = "feed" | "chat" | "membres";

export function GroupView() {
  const params = useSearchParams();
  const gid = params.get("g") ?? "";
  const { ready, userId, isModerator } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<{ role: GroupRole; status: GroupStatus } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("feed");

  const reload = useCallback(async () => {
    if (!gid) return;
    const g = await getGroup(gid);
    setGroup(g);
    setMembership(userId ? await myMembership(gid, userId) : null);
    setLoading(false);
  }, [gid, userId]);

  useEffect(() => {
    if (ready) reload();
  }, [ready, reload]);

  if (!ready || loading) {
    return (
      <section className="py-24 text-center text-cream/50" style={{ background: BG, minHeight: "100vh" }}>
        Chargement…
      </section>
    );
  }

  if (!group) {
    return (
      <section className="pb-28 pt-24 text-center text-cream" style={{ background: BG, minHeight: "100vh" }}>
        <h1 className="font-display text-2xl font-extrabold">Groupe introuvable</h1>
        <p className="mt-2 text-cream/60">Ce groupe n'existe pas, ou il est privé.</p>
        <Link href="/groupes" className="btn-primary mt-6 inline-flex">Voir les groupes</Link>
      </section>
    );
  }

  const isMember = membership?.status === "approved";
  const isInvited = membership?.status === "invited";
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";
  const isOwner = membership?.role === "owner" || group.owner_id === userId;
  // Peut modérer (supprimer posts/commentaires): admin du groupe OU modérateur global.
  const canModerate = isAdmin || isModerator;

  return (
    <section className="relative pb-28 text-cream" style={{ background: BG, minHeight: "100vh" }}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: BG }} />

      {/* Hero: fond vert olive (charte), titre lime, sous-titre crème.
          La photo de couverture éventuelle passe en fond, très assombrie. */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #14160E, #26301A)" }}
      >
        {group.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(group.image)}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "linear-gradient(160deg, rgba(20,22,14,0.86), rgba(38,48,26,0.92))" }}
            />
          </>
        ) : null}
        <div className="relative px-4 pb-7 pt-[calc(5rem+env(safe-area-inset-top))]">
          <div className="mx-auto max-w-2xl">
            <Link href="/groupes" className="inline-flex items-center gap-1 text-sm font-semibold text-cream/80">
              ← Groupes
            </Link>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-dawn-400">{group.name}</h1>
            {group.verse_text ? (
              <p className="mt-2 max-w-xl text-sm italic text-cream/90">
                « {group.verse_text} »{group.verse_reference ? ` — ${group.verse_reference}` : ""}
              </p>
            ) : null}
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-cream/85">
              {group.description?.trim()
                ? group.description
                : "Bienvenue 🙏 Partagez vos plans, vos percées et vos sujets de prière. Commentez, réagissez et priez les uns pour les autres, en famille."}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cream/70">
              {group.member_count ?? 0} membre{(group.member_count ?? 0) > 1 ? "s" : ""}
              {group.is_public ? " · Public" : " · Privé"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4">
        {!isMember ? (
          <JoinBox
            group={group}
            userId={userId}
            invited={isInvited}
            pending={membership?.status === "pending"}
            onChanged={reload}
          />
        ) : (
          <>
            {/* Onglets */}
            <div
              className="sticky top-0 z-10 -mx-4 flex items-center gap-2 px-4 py-3 backdrop-blur"
              style={{ background: "rgba(20,22,14,0.85)" }}
            >
              {[
                { k: "feed" as Tab, label: "Feed" },
                { k: "chat" as Tab, label: "Chat" },
                { k: "membres" as Tab, label: "Membres" },
              ].map((t) => (
                <button
                  key={t.k}
                  type="button"
                  onClick={() => setTab(t.k)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    tab === t.k ? "bg-dawn-400 text-night-950" : "bg-white/10 text-cream/70"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              {isAdmin || isModerator ? (
                <GroupSettings group={group} canEdit={isAdmin} canDelete={isOwner || isModerator} onSaved={reload} />
              ) : null}
            </div>

            {tab === "feed" ? <Feed group={group} userId={userId!} isAdmin={canModerate} /> : null}
            {tab === "chat" ? <Chat group={group} userId={userId!} /> : null}
            {tab === "membres" ? (
              <Members group={group} userId={userId!} isAdmin={isAdmin} onChanged={reload} />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

/* ---------------- Rejoindre / invité ---------------- */
function JoinBox({
  group,
  userId,
  invited,
  pending,
  onChanged,
}: {
  group: Group;
  userId: string | null;
  invited: boolean;
  pending: boolean;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  if (!userId) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
        <p className="text-cream/70">Connecte-toi pour rejoindre ce groupe.</p>
        <Link href="/communaute" className="btn-primary mt-4 inline-flex">Se connecter</Link>
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
      {invited ? (
        <>
          <p className="font-display text-lg font-bold text-cream">Tu es invité(e) 🎉</p>
          <p className="mt-1 text-sm text-cream/70">Rejoins ce groupe pour voir le feed et le chat.</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await acceptInvite(group.id);
                setBusy(false);
                onChanged();
              }}
              className="btn-primary text-sm"
            >
              {busy ? "…" : "Accepter"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await leaveGroup(group.id, userId);
                setBusy(false);
                window.location.href = "/groupes";
              }}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-cream/70"
            >
              Refuser
            </button>
          </div>
        </>
      ) : pending ? (
        <p className="font-semibold text-dawn-300">Demande envoyée. En attente de validation.</p>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await requestJoin(group.id, userId);
            setBusy(false);
            onChanged();
          }}
          className="btn-primary"
        >
          {busy ? "…" : group.open_join ? "Rejoindre le groupe" : "Demander à rejoindre"}
        </button>
      )}
    </div>
  );
}

/* ---------------- Feed ---------------- */
function Feed({ group, userId, isAdmin }: { group: Group; userId: string; isAdmin: boolean }) {
  const [posts, setPosts] = useState<GroupPost[] | null>(null);
  const [reacts, setReacts] = useState<GroupReaction[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<GroupPost["kind"]>("post");
  const [busy, setBusy] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);

  const load = useCallback(async () => {
    const ps = await listPosts(group.id);
    setPosts(ps);
    const ids = ps.map((p) => p.id);
    setReacts(await reactionsFor(ids));
    setCounts(await commentCounts(ids));
  }, [group.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function publish() {
    if (!body.trim()) return;
    setBusy(true);
    await createPost(group.id, userId, body, kind);
    setBusy(false);
    setBody("");
    setKind("post");
    load();
  }

  async function react(postId: string, emoji: string) {
    const active = reacts.some((r) => r.post_id === postId && r.user_id === userId && r.emoji === emoji);
    setReacts((prev) =>
      active
        ? prev.filter((r) => !(r.post_id === postId && r.user_id === userId && r.emoji === emoji))
        : [...prev, { post_id: postId, user_id: userId, emoji }],
    );
    await toggleReaction(postId, group.id, userId, emoji, active);
  }

  return (
    <div className="mt-4">
      {/* Composer */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(Object.keys(KIND_LABEL) as GroupPost["kind"][]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                kind === k ? "bg-dawn-400 text-night-950" : "bg-white/10 text-cream/60"
              }`}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Partage un plan, une percée, un sujet de prière… (colle un lien, il sera cliquable)"
          className={fieldDark}
        />
        <div className="mt-2 flex justify-end">
          <button type="button" onClick={publish} disabled={busy} className="btn-primary text-sm">
            {busy ? "…" : "Publier"}
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-4 space-y-3">
        {posts === null ? (
          <p className="text-sm text-cream/50">Chargement…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-cream/55">Aucune publication. Sois le premier à partager 🙏</p>
        ) : (
          posts.map((p) => {
            const emojiCounts: Record<string, { n: number; mine: boolean }> = {};
            for (const r of reacts.filter((r) => r.post_id === p.id)) {
              emojiCounts[r.emoji] = emojiCounts[r.emoji] ?? { n: 0, mine: false };
              emojiCounts[r.emoji].n += 1;
              if (r.user_id === userId) emojiCounts[r.emoji].mine = true;
            }
            return (
              <article key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={p.author?.pseudo} url={p.author?.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-cream">{p.author?.pseudo ?? "Membre"}</p>
                    <p className="text-xs text-cream/45">{timeAgo(p.created_at)}</p>
                  </div>
                  {p.kind !== "post" ? (
                    <span className="rounded-full bg-dawn-400/15 px-2 py-0.5 text-[11px] font-bold text-dawn-300">
                      {KIND_LABEL[p.kind]}
                    </span>
                  ) : null}
                  {p.author_id === userId || isAdmin ? (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm("Supprimer cette publication ?")) {
                          await deletePost(p.id);
                          load();
                        }
                      }}
                      aria-label="Supprimer"
                      className="text-cream/30 hover:text-red-400"
                    >
                      ✕
                    </button>
                  ) : p.author_id !== userId ? (
                    <ReportButton targetType="group_post" targetId={p.id} label="" className="text-cream/30 hover:text-red-400" />
                  ) : null}
                </div>

                <RichText text={p.body} className="mt-3 text-[15px] leading-relaxed text-cream/90" />

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {GROUP_REACTIONS.map((e) => {
                    const info = emojiCounts[e];
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => react(p.id, e)}
                        className={`rounded-full border px-2.5 py-1 text-sm transition-colors ${
                          info?.mine ? "border-dawn-400 bg-dawn-400/15" : "border-white/12 hover:bg-white/[0.06]"
                        }`}
                      >
                        {e}
                        {info?.n ? <span className="ml-1 text-xs font-bold text-cream/60">{info.n}</span> : null}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setOpenComments((o) => (o === p.id ? null : p.id))}
                    className="ml-auto text-sm font-semibold text-dawn-300"
                  >
                    💬 {counts[p.id] ?? 0}
                  </button>
                </div>

                {openComments === p.id ? (
                  <Comments postId={p.id} groupId={group.id} userId={userId} canModerate={isAdmin} onChange={load} />
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function Comments({
  postId,
  groupId,
  userId,
  canModerate,
  onChange,
}: {
  postId: string;
  groupId: string;
  userId: string;
  canModerate: boolean;
  onChange: () => void;
}) {
  const [list, setList] = useState<GroupComment[] | null>(null);
  const [text, setText] = useState("");

  const load = useCallback(async () => setList(await listComments(postId)), [postId]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="space-y-2">
        {(list ?? []).map((cm) => (
          <div key={cm.id} className="group flex items-start gap-2">
            <Avatar name={cm.author?.pseudo} url={cm.author?.avatar_url} />
            <div className="rounded-2xl bg-white/[0.06] px-3 py-2">
              <p className="text-xs font-bold text-cream">{cm.author?.pseudo ?? "Membre"}</p>
              <p className="text-sm text-cream/85">{cm.body}</p>
            </div>
            {cm.author_id === userId || canModerate ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Supprimer ce commentaire ?")) {
                    await deleteComment(cm.id);
                    load();
                    onChange();
                  }
                }}
                aria-label="Supprimer le commentaire"
                className="mt-1 text-cream/30 hover:text-red-400"
              >
                ✕
              </button>
            ) : cm.author_id !== userId ? (
              <ReportButton targetType="group_comment" targetId={cm.id} label="" className="mt-1 text-cream/30 hover:text-red-400" />
            ) : null}
          </div>
        ))}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          await addComment(postId, groupId, userId, text);
          setText("");
          load();
          onChange();
        }}
        className="mt-2 flex items-center gap-2"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Répondre…" className={`${fieldDark} flex-1`} />
        <button type="submit" className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-cream">Envoyer</button>
      </form>
    </div>
  );
}

/* Icône mains en prière (trait de la charte). */
function PrayGlyphChat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path
        d="M12 3.4c-.6 1.1-1.3 2-2.4 3.1L6.3 9.8c-.6.6-.9 1.5-.7 2.3l.8 4A1.8 1.8 0 0 0 8.2 19.5H12ZM12 3.4c.6 1.1 1.3 2 2.4 3.1L17.7 9.8c.6.6.9 1.5.7 2.3l-.8 4A1.8 1.8 0 0 1 15.8 19.5H12ZM9.4 12.1c1.7-.9 3.5-.9 5.2 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- Chat ---------------- */
function Chat({ group, userId }: { group: Group; userId: string }) {
  const [msgs, setMsgs] = useState<GroupMessage[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Sujets de prière du cercle (posts kind « priere ») + qui a prié (🙏).
  const [subjects, setSubjects] = useState<GroupPost[]>([]);
  const [subjectRx, setSubjectRx] = useState<GroupReaction[]>([]);
  const [showSubjects, setShowSubjects] = useState(true);
  const [subjectMode, setSubjectMode] = useState(false);

  const load = useCallback(async () => setMsgs(await listMessages(group.id)), [group.id]);
  const loadSubjects = useCallback(async () => {
    const posts = (await listPosts(group.id)).filter((p) => p.kind === "priere").slice(0, 12);
    setSubjects(posts);
    setSubjectRx(posts.length ? await reactionsFor(posts.map((p) => p.id)) : []);
  }, [group.id]);

  useEffect(() => {
    load();
    loadSubjects();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load, loadSubjects]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  /** Compte des « J'ai prié » et état pour moi, par sujet. */
  const prayedFor = (postId: string) => subjectRx.filter((r) => r.post_id === postId && r.emoji === "🙏");

  async function togglePrayed(p: GroupPost) {
    const mine = prayedFor(p.id).some((r) => r.user_id === userId);
    // Optimiste, puis synchro.
    setSubjectRx((rx) =>
      mine
        ? rx.filter((r) => !(r.post_id === p.id && r.user_id === userId && r.emoji === "🙏"))
        : [...rx, { post_id: p.id, user_id: userId, emoji: "🙏" }],
    );
    await toggleReaction(p.id, group.id, userId, "🙏", mine);
    loadSubjects();
  }

  async function shareSubject() {
    const t = text.trim();
    if (!t) return;
    setText("");
    setSubjectMode(false);
    await createPost(group.id, userId, t, "priere");
    await sendMessage(group.id, userId, `Nouveau sujet de prière — ${t}`);
    await Promise.all([load(), loadSubjects()]);
  }

  return (
    <div className="mt-4">
      {/* Sujets de prière épinglés du cercle */}
      {subjects.length > 0 ? (
        <div className="mb-3 rounded-2xl border border-dawn-400/25 bg-dawn-400/[0.07] p-3">
          <button
            type="button"
            onClick={() => setShowSubjects((s) => !s)}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-dawn-300">
              <PrayGlyphChat className="h-4 w-4" />
              Sujets du cercle · {subjects.length}
            </span>
            <span className="text-xs text-cream/50">{showSubjects ? "Réduire" : "Voir"}</span>
          </button>
          {showSubjects ? (
            <ul className="mt-2 space-y-2">
              {subjects.map((p) => {
                const rx = prayedFor(p.id);
                const mine = rx.some((r) => r.user_id === userId);
                return (
                  <li key={p.id} className="rounded-xl bg-white/[0.05] px-3 py-2">
                    <p className="text-sm leading-snug text-cream/90">{p.body}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-cream/50">
                        {p.author?.pseudo ?? "Membre"}
                        {rx.length > 0
                          ? ` · ${rx.length} ${rx.length > 1 ? "ont prié" : "a prié"}`
                          : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePrayed(p)}
                        className={`flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors active:scale-95 ${
                          mine
                            ? "bg-dawn-400 text-night-950"
                            : "border border-dawn-400/40 text-dawn-300 hover:bg-dawn-400/10"
                        }`}
                      >
                        <PrayGlyphChat className="h-3.5 w-3.5" />
                        {mine ? "J'ai prié" : "Je prie"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="max-h-[55vh] space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        {msgs.length === 0 ? (
          <p className="py-8 text-center text-sm text-cream/45">Aucun message. Lance la discussion !</p>
        ) : (
          msgs.map((m) => {
            const mine = m.author_id === userId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "bg-dawn-400 text-night-950" : "bg-white/10 text-cream"}`}>
                  {!mine ? <p className="text-[11px] font-bold opacity-70">{m.author?.pseudo ?? "Membre"}</p> : null}
                  {m.audio_url ? (
                    <div className="py-0.5">
                      <VoiceNotePlayer src={m.audio_url} tone={mine ? "light" : "dark"} />
                    </div>
                  ) : null}
                  {m.body ? <p className="whitespace-pre-wrap text-sm">{m.body}</p> : null}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (subjectMode) {
            await shareSubject();
            return;
          }
          if (!text.trim()) return;
          const t = text;
          setText("");
          await sendMessage(group.id, userId, t);
          load();
        }}
        className="mt-2 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setSubjectMode((s) => !s)}
          aria-label="Partager un sujet de prière"
          title="Sujet de prière"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors active:scale-95 ${
            subjectMode ? "bg-dawn-400 text-night-950" : "bg-white/10 text-cream/80 hover:bg-white/15"
          }`}
        >
          <PrayGlyphChat className="h-5 w-5" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={subjectMode ? "Ton sujet de prière (épinglé pour le cercle)…" : "Ton message…"}
          className={`${fieldDark} flex-1 ${subjectMode ? "border-dawn-400/50" : ""}`}
        />
        <VoiceRecorderButton
          userId={userId}
          tone="dark"
          onSend={async (url) => {
            await sendMessage(group.id, userId, "", url);
            load();
          }}
        />
        <button type="submit" className="btn-primary text-sm">
          {subjectMode ? "Partager" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- Membres ---------------- */
function Members({
  group,
  userId,
  isAdmin,
  onChanged,
}: {
  group: Group;
  userId: string;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const [members, setMembers] = useState<GroupMember[] | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => setMembers(await listMembers(group.id)), [group.id]);
  useEffect(() => {
    load();
  }, [load]);

  const approved = (members ?? []).filter((m) => m.status === "approved");
  const pending = (members ?? []).filter((m) => m.status === "pending");
  const invited = (members ?? []).filter((m) => m.status === "invited");
  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/groupe/?g=${group.id}` : "";

  return (
    <div className="mt-4 space-y-4">
      {/* Inviter des amis (admin) */}
      {isAdmin ? <InviteFriends group={group} existing={members ?? []} onInvited={load} /> : null}

      {/* Invitation par lien / code */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-cream/45">Lien d'invitation</p>
        <p className="mt-1 text-sm text-cream/70">
          Code : <span className="font-mono font-bold tracking-widest text-dawn-300">{group.invite_code}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(inviteLink).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="mt-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream"
        >
          {copied ? "✓ Lien copié" : "Copier le lien"}
        </button>
      </div>

      {/* Demandes en attente */}
      {isAdmin && pending.length > 0 ? (
        <div className="rounded-2xl border border-dawn-400/30 bg-dawn-400/[0.06] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-cream/50">Demandes ({pending.length})</p>
          <div className="mt-2 space-y-2">
            {pending.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3">
                <Avatar name={m.profile?.pseudo} url={m.profile?.avatar_url} />
                <span className="flex-1 truncate text-sm font-semibold text-cream">{m.profile?.pseudo ?? "Membre"}</span>
                <button
                  type="button"
                  onClick={async () => {
                    await approveMember(group.id, m.user_id);
                    load();
                    onChanged();
                  }}
                  className="rounded-full bg-dawn-400 px-3 py-1 text-xs font-bold text-night-950"
                >
                  Accepter
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await removeMember(group.id, m.user_id);
                    load();
                  }}
                  className="text-cream/40 hover:text-red-400"
                  aria-label="Refuser"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Invitations envoyées */}
      {isAdmin && invited.length > 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-cream/45">Invitations envoyées ({invited.length})</p>
          <div className="mt-2 space-y-2">
            {invited.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3">
                <Avatar name={m.profile?.pseudo} url={m.profile?.avatar_url} />
                <span className="flex-1 truncate text-sm text-cream/70">{m.profile?.pseudo ?? "Membre"}</span>
                <span className="text-xs text-cream/40">en attente…</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Membres */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-cream/45">Membres ({approved.length})</p>
        <div className="mt-2 space-y-2">
          {approved.map((m) => (
            <div key={m.user_id} className="flex items-center gap-3">
              <Avatar name={m.profile?.pseudo} url={m.profile?.avatar_url} />
              <span className="flex-1 truncate text-sm font-semibold text-cream">{m.profile?.pseudo ?? "Membre"}</span>
              {m.role !== "member" ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-cream/55">
                  {m.role === "owner" ? "Créateur" : "Admin"}
                </span>
              ) : null}
              {isAdmin && m.user_id !== userId && m.role !== "owner" ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("Retirer ce membre ?")) {
                      await removeMember(group.id, m.user_id);
                      load();
                      onChanged();
                    }
                  }}
                  className="text-cream/30 hover:text-red-400"
                  aria-label="Retirer"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {group.owner_id !== userId ? (
        <button
          type="button"
          onClick={async () => {
            if (confirm("Quitter ce groupe ?")) {
              await leaveGroup(group.id, userId);
              window.location.href = "/groupes";
            }
          }}
          className="w-full rounded-full border border-white/15 py-3 text-sm font-semibold text-red-400"
        >
          Quitter le groupe
        </button>
      ) : null}
    </div>
  );
}

/* ---------------- Inviter des amis ---------------- */
function InviteFriends({
  group,
  existing,
  onInvited,
}: {
  group: Group;
  existing: GroupMember[];
  onInvited: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => setResults(await searchProfiles(q, 8)), 250);
    return () => clearTimeout(t);
  }, [q]);

  const existingIds = new Set(existing.map((m) => m.user_id));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-cream/45">Inviter des amis</p>
      <p className="mt-1 text-xs text-cream/55">Ils reçoivent une notification et acceptent (ou refusent) de rejoindre.</p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un membre par pseudo…"
        className={`${fieldDark} mt-3`}
      />
      <div className="mt-2 space-y-2">
        {results.map((p) => {
          const already = existingIds.has(p.id);
          const invited = done[p.id];
          return (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar name={p.pseudo} url={p.avatar_url} />
              <span className="flex-1 truncate text-sm font-semibold text-cream">{p.pseudo ?? "Membre"}</span>
              {already || invited ? (
                <span className="text-xs text-cream/45">{invited ? "Invité ✓" : "Déjà là"}</span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await inviteToGroup(group.id, p.id);
                    if (ok) {
                      setDone((d) => ({ ...d, [p.id]: true }));
                      onInvited();
                    }
                  }}
                  className="rounded-full bg-dawn-400 px-3 py-1 text-xs font-bold text-night-950"
                >
                  Inviter
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Réglages (admin) / Modération ---------------- */
function GroupSettings({ group, canEdit, canDelete, onSaved }: { group: Group; canEdit: boolean; canDelete: boolean; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: group.name,
    description: group.description,
    verse_text: group.verse_text,
    verse_reference: group.verse_reference,
    accent: group.accent as AccentKey,
    is_public: group.is_public,
    open_join: group.open_join ?? false,
  });
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Le modal est rendu via un portail vers <body> pour échapper au contexte
  // d'empilement de la barre d'onglets (sticky + backdrop-blur), qui piégeait
  // le modal derrière le composer du feed.
  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)", paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
            role="dialog"
            aria-modal="true"
          >
            <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 max-h-full w-full max-w-sm overflow-y-auto rounded-2xl border border-white/10 bg-[#1F2216] p-4 text-cream shadow-xl">
              <p className="mb-3 font-display text-lg font-bold">{canEdit ? "Réglages du groupe" : "Modération du groupe"}</p>
              <div className="space-y-3">
                {canEdit ? (
                <>
                {/* Photo de couverture */}
                <div>
                  <span className="text-xs font-semibold text-cream/55">Photo de couverture</span>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10">
                      {group.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={group.image} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <label className="cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream">
                      {cover ? "Photo choisie…" : "Choisir une photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                </div>
                <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nom" className={fieldDark} />
                <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Texte d'explication du groupe" rows={3} className={fieldDark} />
                <input value={f.verse_text} onChange={(e) => setF({ ...f, verse_text: e.target.value })} placeholder="Verset" className={fieldDark} />
                <input value={f.verse_reference} onChange={(e) => setF({ ...f, verse_reference: e.target.value })} placeholder="Référence" className={fieldDark} />
                <div>
                  <p className="text-xs font-semibold text-cream/55">Couleur</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setF({ ...f, accent: k })}
                        aria-label={ACCENTS[k].label}
                        className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-[#1F2216] ${f.accent === k ? "ring-cream" : "ring-transparent"}`}
                        style={{ backgroundImage: `linear-gradient(135deg, ${ACCENTS[k].from}, ${ACCENTS[k].to})` }}
                      />
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-cream/70">
                  <input type="checkbox" checked={f.is_public} onChange={(e) => setF({ ...f, is_public: e.target.checked })} />
                  Visible dans le répertoire
                </label>
                <div>
                  <p className="text-xs font-semibold text-cream/55">Adhésion</p>
                  <div className="mt-2 flex gap-2">
                    {[
                      { v: true, label: "Ouverte", hint: "on rejoint sans validation" },
                      { v: false, label: "Sur validation", hint: "tu acceptes les demandes" },
                    ].map((o) => (
                      <button
                        key={String(o.v)}
                        type="button"
                        onClick={() => setF({ ...f, open_join: o.v })}
                        className={`flex-1 rounded-2xl border px-3 py-2 text-left text-xs transition-colors ${
                          f.open_join === o.v ? "border-dawn-400 bg-dawn-400/15 text-cream" : "border-white/15 text-cream/60"
                        }`}
                      >
                        <span className="block text-sm font-bold">{o.label}</span>
                        <span className="text-[11px] text-cream/50">{o.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      let image: string | undefined;
                      if (cover) {
                        const url = await uploadGroupCover(group.id, cover);
                        if (url) image = url;
                      }
                      await updateGroup(group.id, image ? { ...f, image } : f);
                      setBusy(false);
                      setOpen(false);
                      onSaved();
                    }}
                    className="btn-primary text-sm"
                  >
                    {busy ? "…" : "Enregistrer"}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream">Fermer</button>
                </div>
                </>
                ) : null}

                {/* Suppression du groupe (créateur ou modérateur) */}
                {canDelete ? (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm(`Supprimer définitivement le groupe « ${group.name} » ? Cette action est irréversible.`)) return;
                        setBusy(true);
                        const ok = await deleteGroup(group.id);
                        setBusy(false);
                        if (ok) window.location.href = "/groupes";
                        else alert("Suppression impossible. Réessaie.");
                      }}
                      className="w-full rounded-full border border-red-500/40 py-2.5 text-sm font-semibold text-red-400"
                    >
                      Supprimer le groupe
                    </button>
                  </div>
                ) : null}

                {!canEdit ? (
                  <button type="button" onClick={() => setOpen(false)} className="w-full rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream">Fermer</button>
                ) : null}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="ml-auto">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Réglages du groupe"
        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream/70"
      >
        ⚙
      </button>
      {modal}
    </div>
  );
}
