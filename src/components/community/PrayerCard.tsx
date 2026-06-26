"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import {
  type Prayer,
  type Reaction,
  type Comment,
  toggleReaction,
  listComments,
  addComment,
  deleteComment,
  deletePrayer,
  setPrayerAnswered,
} from "@/lib/community";

const VIS_LABEL: Record<string, string> = { public: "Public", friends: "Abonnés", private: "Privé" };

function when(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PrayerCard({
  prayer,
  userId,
  initialReactions,
  onDeleted,
  isAdmin = false,
}: {
  prayer: Prayer;
  userId: string;
  initialReactions: Reaction[];
  onDeleted: () => void;
  isAdmin?: boolean;
}) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const [answered, setAnswered] = useState(prayer.answered);

  const isAuthor = prayer.author_id === userId;
  const count = (t: "heart" | "pray") => reactions.filter((r) => r.type === t).length;
  const mine = (t: "heart" | "pray") => reactions.some((r) => r.type === t && r.user_id === userId);

  async function react(t: "heart" | "pray") {
    const on = !mine(t);
    setReactions((prev) =>
      on
        ? [...prev, { prayer_id: prayer.id, user_id: userId, type: t }]
        : prev.filter((r) => !(r.type === t && r.user_id === userId)),
    );
    await toggleReaction(prayer.id, userId, t, on);
  }

  async function toggleAnswered() {
    const next = !answered;
    setAnswered(next);
    await setPrayerAnswered(prayer.id, next);
  }

  async function openComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) setComments(await listComments(prayer.id));
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    setBusy(true);
    await addComment(prayer.id, commentText.trim(), userId);
    setCommentText("");
    setComments(await listComments(prayer.id));
    setBusy(false);
  }

  async function removeComment(id: string) {
    await deleteComment(id);
    setComments((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
  }

  async function remove() {
    if (!confirm("Supprimer cette prière ?")) return;
    await deletePrayer(prayer.id);
    onDeleted();
  }

  return (
    <li
      className={`overflow-hidden rounded-3xl border ${
        answered
          ? "border-dawn-400/50 bg-gradient-to-br from-dawn-50 to-white shadow-glow"
          : "border-night-900/10 bg-white"
      }`}
    >
      {/* Bandeau « Dieu a agi » */}
      {answered ? (
        <div className="flex items-center gap-2 bg-gradient-to-r from-dawn-400 to-dawn-300 px-5 py-2 text-sm font-extrabold text-night-950">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6L12 19.8 6.9 22l1-5.6-4-4 5.6-.8z" />
          </svg>
          Dieu a agi — prière exaucée 🙌
        </div>
      ) : null}

      <div className="p-5">
        <div className="flex items-center gap-3">
          <Link href={`/membre?u=${prayer.author_id}`} aria-label="Voir le profil">
            <Avatar pseudo={prayer.author?.pseudo} url={prayer.author?.avatar_url} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/membre?u=${prayer.author_id}`}
              className="font-display font-bold leading-tight hover:underline"
            >
              {prayer.author?.pseudo ?? "Ami(e)"}
            </Link>
            <p className="text-xs text-night-900/50">
              {when(prayer.created_at)}
              {prayer.group_id ? "" : ` · ${VIS_LABEL[prayer.visibility]}`}
            </p>
          </div>
          {isAuthor || isAdmin ? (
            <button
              type="button"
              onClick={remove}
              aria-label="Supprimer"
              title={isAdmin && !isAuthor ? "Supprimer (modération)" : "Supprimer"}
              className="shrink-0 text-night-900/30 transition-colors hover:text-night-900/70"
            >
              ✕
            </button>
          ) : null}
        </div>

        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85">
          {prayer.body}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => react("pray")}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              mine("pray")
                ? "border-spirit-500/40 bg-spirit-500/10 text-spirit-700"
                : "border-night-900/15 text-night-900/70 hover:border-night-900/30"
            }`}
          >
            🙏 Je prie{count("pray") > 0 ? ` · ${count("pray")}` : ""}
          </button>
          <button
            type="button"
            onClick={() => react("heart")}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              mine("heart")
                ? "border-dawn-400/50 bg-dawn-400/15 text-spirit-700"
                : "border-night-900/15 text-night-900/70 hover:border-night-900/30"
            }`}
          >
            ❤️{count("heart") > 0 ? ` ${count("heart")}` : ""}
          </button>
          <button
            type="button"
            onClick={openComments}
            className="inline-flex items-center gap-1.5 rounded-full border border-night-900/15 px-3 py-1.5 text-sm font-semibold text-night-900/70 transition-colors hover:border-night-900/30"
          >
            💬 Encourager
          </button>

          {/* Auteur : marquer exaucé */}
          {isAuthor ? (
            <button
              type="button"
              onClick={toggleAnswered}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
                answered
                  ? "border border-night-900/15 text-night-900/55 hover:border-night-900/30"
                  : "bg-night-900 text-dawn-400 hover:bg-night-800"
              }`}
            >
              {answered ? "Rouvrir" : "Dieu a agi 🙌"}
            </button>
          ) : null}
        </div>

        {showComments ? (
          <div className="mt-4 border-t border-night-900/10 pt-4">
            {comments === null ? (
              <p className="text-sm text-night-900/45">Chargement…</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="group flex items-start gap-2.5">
                    <Avatar pseudo={c.author?.pseudo} url={c.author?.avatar_url} size={30} />
                    <div className="min-w-0 flex-1 rounded-2xl bg-night-900/[0.04] px-3 py-2">
                      <p className="text-xs font-semibold text-night-900/70">
                        {c.author?.pseudo ?? "Ami(e)"}
                      </p>
                      <p className="text-sm text-night-900/85">{c.body}</p>
                    </div>
                    {isAdmin || c.author_id === userId ? (
                      <button
                        type="button"
                        onClick={() => removeComment(c.id)}
                        aria-label="Supprimer le commentaire"
                        title={isAdmin && c.author_id !== userId ? "Supprimer (modération)" : "Supprimer"}
                        className="shrink-0 text-night-900/25 transition-colors hover:text-night-900/70"
                      >
                        ✕
                      </button>
                    ) : null}
                  </li>
                ))}
                {comments.length === 0 ? (
                  <li className="text-sm text-night-900/45">Sois le premier à encourager.</li>
                ) : null}
              </ul>
            )}

            <div className="mt-3 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Un mot d'encouragement, « Je prie pour toi »…"
                className="field flex-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitComment();
                }}
              />
              <button
                type="button"
                onClick={submitComment}
                disabled={busy || !commentText.trim()}
                className="btn-primary text-sm disabled:opacity-40"
              >
                Envoyer
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
