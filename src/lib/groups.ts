"use client";

import { getSupabase } from "./supabase";
import type { AccentKey } from "./profile-accent";

/** Groupes fermés: répertoire, feed, chat, personnalisation. */

export type GroupRole = "owner" | "admin" | "member";
export type GroupStatus = "pending" | "approved" | "invited";

export type Group = {
  id: string;
  name: string;
  description: string;
  verse_text: string;
  verse_reference: string;
  accent: AccentKey;
  invite_code: string;
  is_public: boolean;
  owner_id: string;
  image?: string;
  created_at: string;
  member_count?: number;
  my_role?: GroupRole | null;
  my_status?: GroupStatus | null;
};

export type MiniProfile = { id: string; pseudo: string | null; avatar_url: string | null };

export type GroupMember = {
  user_id: string;
  role: GroupRole;
  status: GroupStatus;
  created_at: string;
  profile?: MiniProfile;
};

export type GroupPost = {
  id: string;
  group_id: string;
  author_id: string;
  body: string;
  kind: "post" | "plan" | "percee" | "priere";
  created_at: string;
  author?: MiniProfile;
};

export type GroupComment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: MiniProfile;
};

export type GroupReaction = { post_id: string; user_id: string; emoji: string };

export type GroupMessage = {
  id: string;
  group_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: MiniProfile;
};

/** Post enrichi (nom du groupe + compteurs) pour le feed agrégé du répertoire. */
export type FeedPost = GroupPost & {
  group_name: string;
  group_accent: AccentKey;
  reaction_count: number;
  comment_count: number;
};

export const GROUP_REACTIONS = ["🙏", "❤️", "👍", "🔥", "🙌", "🕊️"];
export const KIND_LABEL: Record<GroupPost["kind"], string> = {
  post: "Message",
  plan: "Plan",
  percee: "Percée",
  priere: "Prière",
};

/** Récupère des profils (pseudo + avatar) par lot. */
async function profilesByIds(ids: string[]): Promise<Record<string, MiniProfile>> {
  const sb = getSupabase();
  const uniq = Array.from(new Set(ids)).filter(Boolean);
  if (!sb || uniq.length === 0) return {};
  const { data } = await sb.from("profiles").select("id, pseudo, avatar_url").in("id", uniq);
  const map: Record<string, MiniProfile> = {};
  for (const p of (data ?? []) as MiniProfile[]) map[p.id] = p;
  return map;
}

async function memberCounts(groupIds: string[]): Promise<Record<string, number>> {
  const sb = getSupabase();
  const uniq = Array.from(new Set(groupIds)).filter(Boolean);
  if (!sb || uniq.length === 0) return {};
  const { data } = await sb
    .from("group_members")
    .select("group_id")
    .eq("status", "approved")
    .in("group_id", uniq);
  const counts: Record<string, number> = {};
  for (const r of (data ?? []) as { group_id: string }[]) counts[r.group_id] = (counts[r.group_id] ?? 0) + 1;
  return counts;
}

/** Répertoire: groupes publics (avec recherche facultative). */
export async function listPublicGroups(query = ""): Promise<Group[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let q = sb.from("groups").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(60);
  if (query.trim()) q = q.ilike("name", `%${query.trim()}%`);
  const { data, error } = await q;
  if (error || !data) return [];
  const groups = data as Group[];
  const counts = await memberCounts(groups.map((g) => g.id));
  return groups.map((g) => ({ ...g, member_count: counts[g.id] ?? 0 }));
}

/** Mes groupes (où je suis membre approuvé). */
export async function listMyGroups(userId: string): Promise<Group[]> {
  const sb = getSupabase();
  if (!sb || !userId) return [];
  const { data: mem } = await sb
    .from("group_members")
    .select("group_id, role, status")
    .eq("user_id", userId)
    .eq("status", "approved");
  const rows = (mem ?? []) as { group_id: string; role: GroupRole; status: GroupStatus }[];
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.group_id);
  const { data } = await sb.from("groups").select("*").in("id", ids);
  const counts = await memberCounts(ids);
  const byId: Record<string, { role: GroupRole; status: GroupStatus }> = {};
  for (const r of rows) byId[r.group_id] = { role: r.role, status: r.status };
  return ((data ?? []) as Group[]).map((g) => ({
    ...g,
    member_count: counts[g.id] ?? 0,
    my_role: byId[g.id]?.role ?? null,
    my_status: byId[g.id]?.status ?? null,
  }));
}

export async function getGroup(id: string): Promise<Group | null> {
  const sb = getSupabase();
  if (!sb || !id) return null;
  const { data, error } = await sb.from("groups").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  const counts = await memberCounts([id]);
  return { ...(data as Group), member_count: counts[id] ?? 0 };
}

export async function myMembership(
  groupId: string,
  userId: string,
): Promise<{ role: GroupRole; status: GroupStatus } | null> {
  const sb = getSupabase();
  if (!sb || !userId) return null;
  const { data } = await sb
    .from("group_members")
    .select("role, status")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as { role: GroupRole; status: GroupStatus } | null) ?? null;
}

export async function createGroup(input: {
  name: string;
  description?: string;
  verse_text?: string;
  verse_reference?: string;
  accent?: string;
  is_public?: boolean;
}): Promise<Group | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("create_group", {
    p_name: input.name,
    p_description: input.description ?? "",
    p_verse_text: input.verse_text ?? "",
    p_verse_reference: input.verse_reference ?? "",
    p_accent: input.accent ?? "lime",
    p_is_public: input.is_public ?? true,
  });
  if (error || !data) return null;
  return data as Group;
}

/** Rejoindre via code d'invitation (approuvé immédiatement). Renvoie l'id du groupe. */
export async function joinByCode(code: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("join_group_by_code", { p_code: code });
  if (error || !data) return null;
  return data as string;
}

/** Demander à rejoindre un groupe public (statut « en attente »). */
export async function requestJoin(groupId: string, userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("group_members")
    .upsert({ group_id: groupId, user_id: userId, role: "member", status: "pending" }, { onConflict: "group_id,user_id" });
  return !error;
}

export async function leaveGroup(groupId: string, userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
  return !error;
}

export async function updateGroup(id: string, patch: Partial<Group>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("groups").update(patch).eq("id", id);
  return !error;
}

export async function listMembers(groupId: string): Promise<GroupMember[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("group_members")
    .select("user_id, role, status, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as GroupMember[];
  const profs = await profilesByIds(rows.map((r) => r.user_id));
  return rows.map((r) => ({ ...r, profile: profs[r.user_id] }));
}

export async function approveMember(groupId: string, userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("group_members")
    .update({ status: "approved" })
    .eq("group_id", groupId)
    .eq("user_id", userId);
  return !error;
}

export async function removeMember(groupId: string, userId: string): Promise<boolean> {
  return leaveGroup(groupId, userId);
}

/** Admin: inviter un ami dans le groupe (il reçoit une notification). */
export async function inviteToGroup(groupId: string, userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.rpc("invite_to_group", { p_group_id: groupId, p_user_id: userId });
  return !error;
}

/** Accepter une invitation à un groupe (statut invité → membre). */
export async function acceptInvite(groupId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.rpc("accept_group_invite", { p_group_id: groupId });
  return !error;
}

// ---------- Feed ----------
export async function listPosts(groupId: string): Promise<GroupPost[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("group_posts")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as GroupPost[];
  const profs = await profilesByIds(rows.map((r) => r.author_id));
  return rows.map((r) => ({ ...r, author: profs[r.author_id] }));
}

export async function createPost(
  groupId: string,
  authorId: string,
  body: string,
  kind: GroupPost["kind"] = "post",
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !body.trim()) return false;
  const { error } = await sb.from("group_posts").insert({ group_id: groupId, author_id: authorId, body: body.trim(), kind });
  return !error;
}

export async function deletePost(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("group_posts").delete().eq("id", id);
  return !error;
}

export async function listComments(postId: string): Promise<GroupComment[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("group_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as GroupComment[];
  const profs = await profilesByIds(rows.map((r) => r.author_id));
  return rows.map((r) => ({ ...r, author: profs[r.author_id] }));
}

export async function commentCounts(postIds: string[]): Promise<Record<string, number>> {
  const sb = getSupabase();
  const uniq = Array.from(new Set(postIds)).filter(Boolean);
  if (!sb || uniq.length === 0) return {};
  const { data } = await sb.from("group_comments").select("post_id").in("post_id", uniq);
  const counts: Record<string, number> = {};
  for (const r of (data ?? []) as { post_id: string }[]) counts[r.post_id] = (counts[r.post_id] ?? 0) + 1;
  return counts;
}

export async function addComment(
  postId: string,
  groupId: string,
  authorId: string,
  body: string,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !body.trim()) return false;
  const { error } = await sb
    .from("group_comments")
    .insert({ post_id: postId, group_id: groupId, author_id: authorId, body: body.trim() });
  return !error;
}

export async function reactionsFor(postIds: string[]): Promise<GroupReaction[]> {
  const sb = getSupabase();
  const uniq = Array.from(new Set(postIds)).filter(Boolean);
  if (!sb || uniq.length === 0) return [];
  const { data } = await sb.from("group_reactions").select("post_id, user_id, emoji").in("post_id", uniq);
  return (data ?? []) as GroupReaction[];
}

export async function toggleReaction(
  postId: string,
  groupId: string,
  userId: string,
  emoji: string,
  active: boolean,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  if (active) {
    const { error } = await sb
      .from("group_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId)
      .eq("emoji", emoji);
    return !error;
  }
  const { error } = await sb
    .from("group_reactions")
    .insert({ post_id: postId, group_id: groupId, user_id: userId, emoji });
  return !error;
}

/** Feed agrégé: derniers posts de tous mes groupes (pour le répertoire). */
export async function listMyGroupsFeed(userId: string): Promise<FeedPost[]> {
  const sb = getSupabase();
  if (!sb || !userId) return [];
  const { data: mem } = await sb
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId)
    .eq("status", "approved");
  const gids = (mem ?? []).map((r) => (r as { group_id: string }).group_id);
  if (gids.length === 0) return [];
  const { data: posts } = await sb
    .from("group_posts")
    .select("*")
    .in("group_id", gids)
    .order("created_at", { ascending: false })
    .limit(30);
  const ps = (posts ?? []) as GroupPost[];
  if (ps.length === 0) return [];
  const { data: gs } = await sb.from("groups").select("id, name, accent").in("id", gids);
  const gmap: Record<string, { name: string; accent: AccentKey }> = {};
  for (const g of (gs ?? []) as { id: string; name: string; accent: AccentKey }[]) {
    gmap[g.id] = { name: g.name, accent: g.accent };
  }
  const profs = await profilesByIds(ps.map((p) => p.author_id));
  const reacts = await reactionsFor(ps.map((p) => p.id));
  const rc: Record<string, number> = {};
  for (const r of reacts) rc[r.post_id] = (rc[r.post_id] ?? 0) + 1;
  const cc = await commentCounts(ps.map((p) => p.id));
  return ps.map((p) => ({
    ...p,
    author: profs[p.author_id],
    group_name: gmap[p.group_id]?.name ?? "",
    group_accent: gmap[p.group_id]?.accent ?? "lime",
    reaction_count: rc[p.id] ?? 0,
    comment_count: cc[p.id] ?? 0,
  }));
}

// ---------- Chat ----------
export async function listMessages(groupId: string): Promise<GroupMessage[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("group_messages")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true })
    .limit(200);
  const rows = (data ?? []) as GroupMessage[];
  const profs = await profilesByIds(rows.map((r) => r.author_id));
  return rows.map((r) => ({ ...r, author: profs[r.author_id] }));
}

export async function sendMessage(groupId: string, authorId: string, body: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !body.trim()) return false;
  const { error } = await sb.from("group_messages").insert({ group_id: groupId, author_id: authorId, body: body.trim() });
  return !error;
}

// ---------- Témoignage / contact pasteur ----------
export async function sendContactMessage(input: {
  firstName: string;
  lastName: string;
  body: string;
  kind: "temoignage" | "contact";
  userId?: string | null;
}): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !input.body.trim()) return false;
  const { error } = await sb.from("contact_messages").insert({
    user_id: input.userId ?? null,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    body: input.body.trim(),
    kind: input.kind,
  });
  return !error;
}
