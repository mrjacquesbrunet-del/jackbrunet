"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { PrayerCard } from "@/components/community/PrayerCard";
import {
  getGroup,
  deleteGroup,
  listGroupMembers,
  addGroupMember,
  removeGroupMember,
  listGroupPrayers,
  createPrayer,
  reactionsFor,
  searchProfiles,
  isAdminEmail,
  type Group,
  type GroupMember,
  type Prayer,
  type Reaction,
  type Profile,
} from "@/lib/community";

export function GroupDetailView() {
  const params = useSearchParams();
  const groupId = params.get("g");
  const { ready, userId, email } = useAuth();
  const admin = isAdminEmail(email);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const isOwner = !!group && !!userId && group.owner_id === userId;

  const loadFeed = useCallback(async () => {
    if (!groupId) return;
    const ps = await listGroupPrayers(groupId);
    setPrayers(ps);
    setReactions(await reactionsFor(ps.map((p) => p.id)));
  }, [groupId]);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    const g = await getGroup(groupId);
    if (!g) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setGroup(g);
    setMembers(await listGroupMembers(groupId));
    await loadFeed();
    setLoading(false);
  }, [groupId, loadFeed]);

  useEffect(() => {
    if (ready && userId) load();
    else if (ready) setLoading(false);
  }, [ready, userId, load]);

  async function post() {
    if (!body.trim() || !userId || !groupId) return;
    setPosting(true);
    await createPrayer(body.trim(), "private", userId, groupId);
    setBody("");
    await loadFeed();
    setPosting(false);
  }

  async function onAdded() {
    if (groupId) setMembers(await listGroupMembers(groupId));
  }
  async function onRemoved(uid: string) {
    if (!groupId) return;
    await removeGroupMember(groupId, uid);
    setMembers((prev) => prev.filter((m) => m.user_id !== uid));
  }
  async function removeGroup() {
    if (!group) return;
    if (!confirm(`Supprimer le groupe « ${group.name} » ? Cette action est définitive.`)) return;
    await deleteGroup(group.id);
    window.location.assign("/groupes");
  }

  if (!isSupabaseConfigured) {
    return <section className="container-x py-16 pt-32 text-center text-night-900/60">Bientôt disponible.</section>;
  }
  if (!ready || loading) return <p className="container-x py-16 pt-32 text-night-900/50">Chargement…</p>;
  if (!userId) {
    return (
      <section className="container-x py-16 pt-32 text-center text-night-900/70">
        Connecte-toi pour accéder à tes groupes.{" "}
        <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
          Mur de prière
        </Link>
      </section>
    );
  }
  if (notFound || !group) {
    return (
      <section className="container-x py-16 pt-32 text-center text-night-900/65">
        Groupe introuvable ou accès non autorisé.{" "}
        <Link href="/groupes" className="font-semibold text-spirit-600 hover:underline">
          Mes groupes
        </Link>
      </section>
    );
  }

  return (
    <section className="container-x py-10 pt-28">
      <Link href="/groupes" className="text-sm font-semibold text-spirit-600 hover:underline">
        ← Mes groupes
      </Link>

      <div className="glass-strong mt-3 p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 font-display text-xl font-extrabold text-night-950">
            {group.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold leading-tight">{group.name}</h1>
            {group.description ? (
              <p className="mt-1 text-sm text-night-900/65">{group.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-night-900/45">
              {members.length} membre{members.length > 1 ? "s" : ""}
            </p>
          </div>
          {isOwner ? (
            <button
              type="button"
              onClick={removeGroup}
              className="shrink-0 text-sm text-night-900/45 hover:text-night-900/70 hover:underline"
            >
              Supprimer
            </button>
          ) : null}
        </div>

        {/* Membres */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-night-900/50">Membres</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {members.map((m) => (
              <li
                key={m.user_id}
                className="flex items-center gap-2 rounded-full border border-night-900/10 bg-white py-1 pl-1 pr-3"
              >
                <Avatar pseudo={m.profile?.pseudo} url={m.profile?.avatar_url} size={26} />
                <span className="text-sm font-semibold text-night-900/80">
                  {m.profile?.pseudo ?? "Ami(e)"}
                </span>
                {m.role === "owner" ? (
                  <span className="text-[10px] font-bold uppercase text-spirit-600">admin</span>
                ) : null}
                {isOwner && m.role !== "owner" ? (
                  <button
                    type="button"
                    onClick={() => onRemoved(m.user_id)}
                    aria-label="Retirer"
                    className="text-night-900/30 hover:text-night-900/70"
                  >
                    ✕
                  </button>
                ) : null}
              </li>
            ))}
          </ul>

          {isOwner ? (
            <AddMember
              existing={members.map((m) => m.user_id)}
              onAdd={async (id) => {
                await addGroupMember(group.id, id);
                await onAdded();
              }}
            />
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div className="glass-strong mt-5 p-5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Partage un sujet de prière avec le groupe…"
          className="field w-full resize-y"
        />
        <button
          type="button"
          onClick={post}
          disabled={posting || !body.trim()}
          className="btn-primary mt-3 disabled:opacity-40"
        >
          {posting ? "Publication…" : "Publier dans le groupe"}
        </button>
      </div>

      {/* Fil du groupe */}
      <div className="mt-8">
        {prayers.length === 0 ? (
          <p className="text-night-900/55">Aucune prière dans ce groupe pour l'instant. 🙏</p>
        ) : (
          <ul className="space-y-4">
            {prayers.map((p) => (
              <PrayerCard
                key={p.id}
                prayer={p}
                userId={userId}
                isAdmin={admin}
                initialReactions={reactions.filter((r) => r.prayer_id === p.id)}
                onDeleted={loadFeed}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---- Ajout d'un membre par recherche ---- */
function AddMember({
  existing,
  onAdd,
}: {
  existing: string[];
  onAdd: (id: string) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      const r = await searchProfiles(q);
      setResults(r.filter((p) => !existing.includes(p.id)));
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, existing]);

  return (
    <div className="mt-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ajouter un membre (pseudo)…"
        className="field w-full max-w-sm text-sm"
      />
      {results.length > 0 ? (
        <ul className="mt-2 max-w-sm overflow-hidden rounded-2xl border border-night-900/10 bg-white">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={async () => {
                  await onAdd(p.id);
                  setQ("");
                  setResults([]);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-night-900/[0.04]"
              >
                <Avatar pseudo={p.pseudo} url={p.avatar_url} size={32} />
                <span className="font-semibold text-night-900/85">{p.pseudo}</span>
                <span className="ml-auto text-sm font-bold text-spirit-600">+ Ajouter</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
