"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth, initials } from "@/components/community/useAuth";
import { ACCENTS, type AccentKey } from "@/lib/profile-accent";
import {
  getGroup,
  myMembership,
  requestJoin,
  leaveGroup,
  updateGroup,
  listMembers,
  approveMember,
  removeMember,
  listPosts,
  createPost,
  deletePost,
  listComments,
  commentCounts,
  addComment,
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
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-spirit-600/15 text-xs font-bold text-spirit-700">
      {initials(name)}
    </span>
  );
}

type Tab = "feed" | "chat" | "membres";

export function GroupView() {
  const params = useSearchParams();
  const gid = params.get("g") ?? "";
  const { ready, userId } = useAuth();

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
    return <section className="container-x py-24 text-center text-night-900/50">Chargement…</section>;
  }

  if (!group) {
    return (
      <section className="container-x pb-28 pt-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">Groupe introuvable</h1>
        <p className="mt-2 text-night-900/60">Ce groupe n'existe pas, ou il est privé.</p>
        <Link href="/groupes" className="btn-primary mt-6 inline-flex">Voir les groupes</Link>
      </section>
    );
  }

  const c = ACCENTS[group.accent] ?? ACCENTS.lime;
  const isMember = membership?.status === "approved";
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";

  return (
    <section className="pb-28">
      {/* Bannière */}
      <div
        className="px-4 pb-6 pt-[calc(5rem+env(safe-area-inset-top))] text-white"
        style={{ backgroundImage: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
      >
        <div className="mx-auto max-w-2xl">
          <Link href="/groupes" className="inline-flex items-center gap-1 text-sm font-semibold text-white/85">
            ← Groupes
          </Link>
          <h1 className="mt-3 font-display text-3xl font-extrabold">{group.name}</h1>
          {group.verse_text ? (
            <p className="mt-2 max-w-xl text-sm italic text-white/90">
              « {group.verse_text} »{group.verse_reference ? ` — ${group.verse_reference}` : ""}
            </p>
          ) : null}
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">
            {group.member_count ?? 0} membre{(group.member_count ?? 0) > 1 ? "s" : ""}
            {group.is_public ? " · Public" : " · Privé"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4">
        {!isMember ? (
          <JoinBox group={group} userId={userId} membership={membership} onChanged={reload} />
        ) : (
          <>
            {/* Onglets */}
            <div className="sticky top-0 z-10 -mx-4 flex gap-2 bg-cream/80 px-4 py-3 backdrop-blur">
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
                    tab === t.k ? "bg-spirit-600 text-cream" : "bg-night-900/[0.06] text-night-900/60"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              {isAdmin ? <GroupSettings group={group} onSaved={reload} /> : null}
            </div>

            {tab === "feed" ? <Feed group={group} userId={userId!} isAdmin={isAdmin} /> : null}
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

/* ---------------- Rejoindre ---------------- */
function JoinBox({
  group,
  userId,
  membership,
  onChanged,
}: {
  group: Group;
  userId: string | null;
  membership: { role: GroupRole; status: GroupStatus } | null;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  if (!userId) {
    return (
      <div className="mt-6 rounded-2xl border border-night-900/10 bg-white p-5 text-center">
        <p className="text-night-900/70">Connecte-toi pour rejoindre ce groupe.</p>
        <Link href="/communaute" className="btn-primary mt-4 inline-flex">Se connecter</Link>
      </div>
    );
  }
  const pending = membership?.status === "pending";
  return (
    <div className="mt-6 rounded-2xl border border-night-900/10 bg-white p-5 text-center">
      {group.description ? <p className="mb-3 text-night-900/70">{group.description}</p> : null}
      {pending ? (
        <p className="font-semibold text-spirit-700">Demande envoyée. En attente de validation.</p>
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
          {busy ? "…" : "Demander à rejoindre"}
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
    // maj optimiste
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
      <div className="rounded-2xl border border-night-900/10 bg-white p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(Object.keys(KIND_LABEL) as GroupPost["kind"][]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                kind === k ? "bg-spirit-600 text-cream" : "bg-night-900/[0.06] text-night-900/55"
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
          placeholder="Partage un plan, une percée, un sujet de prière…"
          className="field w-full"
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
          <p className="text-sm text-night-900/50">Chargement…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-night-900/55">Aucune publication. Sois le premier à partager 🙏</p>
        ) : (
          posts.map((p) => {
            const emojiCounts: Record<string, { n: number; mine: boolean }> = {};
            for (const r of reacts.filter((r) => r.post_id === p.id)) {
              emojiCounts[r.emoji] = emojiCounts[r.emoji] ?? { n: 0, mine: false };
              emojiCounts[r.emoji].n += 1;
              if (r.user_id === userId) emojiCounts[r.emoji].mine = true;
            }
            return (
              <article key={p.id} className="rounded-2xl border border-night-900/10 bg-white p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={p.author?.pseudo} url={p.author?.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-night-900">
                      {p.author?.pseudo ?? "Membre"}
                    </p>
                    <p className="text-xs text-night-900/45">{timeAgo(p.created_at)}</p>
                  </div>
                  {p.kind !== "post" ? (
                    <span className="rounded-full bg-spirit-500/12 px-2 py-0.5 text-[11px] font-bold text-spirit-700">
                      {KIND_LABEL[p.kind]}
                    </span>
                  ) : null}
                  {(p.author_id === userId || isAdmin) ? (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm("Supprimer cette publication ?")) {
                          await deletePost(p.id);
                          load();
                        }
                      }}
                      aria-label="Supprimer"
                      className="text-night-900/30 hover:text-red-500"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/90">{p.body}</p>

                {/* Réactions */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {GROUP_REACTIONS.map((e) => {
                    const info = emojiCounts[e];
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => react(p.id, e)}
                        className={`rounded-full border px-2.5 py-1 text-sm transition-colors ${
                          info?.mine
                            ? "border-spirit-600 bg-spirit-500/10"
                            : "border-night-900/10 hover:bg-night-900/[0.03]"
                        }`}
                      >
                        {e}
                        {info?.n ? <span className="ml-1 text-xs font-bold text-night-900/60">{info.n}</span> : null}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setOpenComments((o) => (o === p.id ? null : p.id))}
                    className="ml-auto text-sm font-semibold text-spirit-700"
                  >
                    💬 {counts[p.id] ?? 0}
                  </button>
                </div>

                {openComments === p.id ? (
                  <Comments postId={p.id} groupId={group.id} userId={userId} onChange={load} />
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
  onChange,
}: {
  postId: string;
  groupId: string;
  userId: string;
  onChange: () => void;
}) {
  const [list, setList] = useState<GroupComment[] | null>(null);
  const [text, setText] = useState("");

  const load = useCallback(async () => setList(await listComments(postId)), [postId]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mt-3 border-t border-night-900/10 pt-3">
      <div className="space-y-2">
        {(list ?? []).map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <Avatar name={c.author?.pseudo} url={c.author?.avatar_url} />
            <div className="rounded-2xl bg-night-900/[0.04] px-3 py-2">
              <p className="text-xs font-bold text-night-900">{c.author?.pseudo ?? "Membre"}</p>
              <p className="text-sm text-night-900/85">{c.body}</p>
            </div>
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
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Répondre…"
          className="field flex-1"
        />
        <button type="submit" className="btn-ghost text-sm">Envoyer</button>
      </form>
    </div>
  );
}

/* ---------------- Chat ---------------- */
function Chat({ group, userId }: { group: Group; userId: string }) {
  const [msgs, setMsgs] = useState<GroupMessage[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => setMsgs(await listMessages(group.id)), [group.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // rafraîchit le chat
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  return (
    <div className="mt-4">
      <div className="max-h-[55vh] space-y-2 overflow-y-auto rounded-2xl border border-night-900/10 bg-white p-3">
        {msgs.length === 0 ? (
          <p className="py-8 text-center text-sm text-night-900/45">Aucun message. Lance la discussion !</p>
        ) : (
          msgs.map((m) => {
            const mine = m.author_id === userId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "bg-spirit-600 text-cream" : "bg-night-900/[0.05] text-night-900"}`}>
                  {!mine ? <p className="text-[11px] font-bold opacity-70">{m.author?.pseudo ?? "Membre"}</p> : null}
                  <p className="whitespace-pre-wrap text-sm">{m.body}</p>
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
          if (!text.trim()) return;
          const t = text;
          setText("");
          await sendMessage(group.id, userId, t);
          load();
        }}
        className="mt-2 flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ton message…"
          className="field flex-1"
        />
        <button type="submit" className="btn-primary text-sm">Envoyer</button>
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
  const inviteLink =
    typeof window !== "undefined" ? `${window.location.origin}/groupe?g=${group.id}` : "";

  return (
    <div className="mt-4 space-y-4">
      {/* Invitation */}
      <div className="rounded-2xl border border-night-900/10 bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-night-900/45">Inviter</p>
        <p className="mt-1 text-sm text-night-900/70">
          Code : <span className="font-mono font-bold tracking-widest">{group.invite_code}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(`${inviteLink}`).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="btn-ghost mt-2 text-sm"
        >
          {copied ? "✓ Lien copié" : "Copier le lien d'invitation"}
        </button>
      </div>

      {/* Demandes en attente (admin) */}
      {isAdmin && pending.length > 0 ? (
        <div className="rounded-2xl border border-dawn-400/40 bg-cream/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-night-900/45">
            Demandes ({pending.length})
          </p>
          <div className="mt-2 space-y-2">
            {pending.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3">
                <Avatar name={m.profile?.pseudo} url={m.profile?.avatar_url} />
                <span className="flex-1 truncate text-sm font-semibold">{m.profile?.pseudo ?? "Membre"}</span>
                <button
                  type="button"
                  onClick={async () => {
                    await approveMember(group.id, m.user_id);
                    load();
                    onChanged();
                  }}
                  className="rounded-full bg-spirit-600 px-3 py-1 text-xs font-bold text-cream"
                >
                  Accepter
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await removeMember(group.id, m.user_id);
                    load();
                  }}
                  className="text-night-900/40 hover:text-red-500"
                  aria-label="Refuser"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Membres */}
      <div className="rounded-2xl border border-night-900/10 bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-night-900/45">
          Membres ({approved.length})
        </p>
        <div className="mt-2 space-y-2">
          {approved.map((m) => (
            <div key={m.user_id} className="flex items-center gap-3">
              <Avatar name={m.profile?.pseudo} url={m.profile?.avatar_url} />
              <span className="flex-1 truncate text-sm font-semibold">{m.profile?.pseudo ?? "Membre"}</span>
              {m.role !== "member" ? (
                <span className="rounded-full bg-night-900/[0.06] px-2 py-0.5 text-[11px] font-bold text-night-900/55">
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
                  className="text-night-900/30 hover:text-red-500"
                  aria-label="Retirer"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Quitter */}
      {group.owner_id !== userId ? (
        <button
          type="button"
          onClick={async () => {
            if (confirm("Quitter ce groupe ?")) {
              await leaveGroup(group.id, userId);
              window.location.href = "/groupes";
            }
          }}
          className="btn-ghost w-full text-sm text-red-600"
        >
          Quitter le groupe
        </button>
      ) : null}
    </div>
  );
}

/* ---------------- Réglages (admin) ---------------- */
function GroupSettings({ group, onSaved }: { group: Group; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: group.name,
    verse_text: group.verse_text,
    verse_reference: group.verse_reference,
    accent: group.accent as AccentKey,
    is_public: group.is_public,
  });
  const [busy, setBusy] = useState(false);

  return (
    <div className="ml-auto">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Réglages du groupe"
        className="grid h-9 w-9 place-items-center rounded-full bg-night-900/[0.06] text-night-900/60"
      >
        ⚙
      </button>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 m-3 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
            <p className="mb-3 font-display text-lg font-bold">Réglages du groupe</p>
            <div className="space-y-3">
              <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nom" className="field w-full" />
              <input value={f.verse_text} onChange={(e) => setF({ ...f, verse_text: e.target.value })} placeholder="Verset" className="field w-full" />
              <input value={f.verse_reference} onChange={(e) => setF({ ...f, verse_reference: e.target.value })} placeholder="Référence" className="field w-full" />
              <div>
                <p className="text-xs font-semibold text-night-900/55">Couleur</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setF({ ...f, accent: k })}
                      aria-label={ACCENTS[k].label}
                      className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${f.accent === k ? "ring-night-900" : "ring-transparent"}`}
                      style={{ backgroundImage: `linear-gradient(135deg, ${ACCENTS[k].from}, ${ACCENTS[k].to})` }}
                    />
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-night-900/70">
                <input type="checkbox" checked={f.is_public} onChange={(e) => setF({ ...f, is_public: e.target.checked })} />
                Visible dans le répertoire
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    await updateGroup(group.id, f);
                    setBusy(false);
                    setOpen(false);
                    onSaved();
                  }}
                  className="btn-primary text-sm"
                >
                  {busy ? "…" : "Enregistrer"}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-sm">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
