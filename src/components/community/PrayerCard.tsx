"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { Celebration } from "@/components/ui/Celebration";
import { MentionField } from "@/components/community/MentionField";
import { MentionText } from "@/components/community/MentionText";
import { HandsGlyph, BookmarkGlyph, BookmarkFilledGlyph } from "@/components/ui/DevoIcons";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { ReportButton } from "@/components/community/ReportButton";
import { useToolkit } from "@/lib/toolkit";
import {
  type Prayer,
  type Reaction,
  type Comment,
  toggleReaction,
  listComments,
  addComment,
  notifyMentions,
  deleteComment,
  deletePrayer,
  setPrayerAnswered,
  setPrayerPinned,
} from "@/lib/community";

const VIS_LABEL: Record<string, string> = { public: "Public", friends: "Abonnés", private: "Privé" };

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className?? ""} fill-none stroke-current`} strokeWidth={1.8}>
      <path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5zM12 17v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
  initialCommentCount = 0,
  grade,
  onDeleted,
  isAdmin = false,
}: {
  prayer: Prayer;
  userId: string;
  initialReactions: Reaction[];
  initialCommentCount?: number;
  grade?: string;
  onDeleted: () => void;
  isAdmin?: boolean;
}) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [answered, setAnswered] = useState(prayer.answered);
  const [pinned, setPinned] = useState(!!prayer.pinned);
  const [celebrate, setCelebrate] = useState(false);

  // Enregistrer la publication dans mon carnet (comme un signet).
  const tk = useToolkit();
  const pubId = `pub:${prayer.id}`;
  const savedPub = tk.isSaved(pubId);
  function toggleSavePub() {
    tk.toggleSnippet({
      id: pubId,
      text: prayer.body,
      reference: prayer.author?.pseudo? `@${prayer.author.pseudo}`: "Publication",
      kind: "publication",
    });
  }

  async function togglePin() {
    const next =!pinned;
    setPinned(next);
    await setPrayerPinned(prayer.id, next);
    onDeleted(); // recharge le fil pour remonter/redescendre le sujet
  }

  const isAuthor = prayer.author_id === userId;
  const count = (t: "heart" | "pray") => reactions.filter((r) => r.type === t).length;
  const mine = (t: "heart" | "pray") => reactions.some((r) => r.type === t && r.user_id === userId);

  async function react(t: "heart" | "pray") {
    const on =!mine(t);
    setReactions((prev) =>
      on
? [...prev, { prayer_id: prayer.id, user_id: userId, type: t }]
: prev.filter((r) =>!(r.type === t && r.user_id === userId)),
    );
    await toggleReaction(prayer.id, userId, t, on);
  }

  async function toggleAnswered() {
    const next =!answered;
    setAnswered(next);
    if (next) setCelebrate(true);
    await setPrayerAnswered(prayer.id, next);
  }

  async function refreshComments() {
    const list = await listComments(prayer.id);
    setComments(list);
    setCommentCount(list.length);
  }

  async function openComments() {
    const next =!showComments;
    setShowComments(next);
    if (next && comments === null) await refreshComments();
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    setBusy(true);
    const text = commentText.trim();
    await addComment(prayer.id, text, userId);
    await notifyMentions(text, userId, prayer.id);
    setCommentText("");
    await refreshComments();
    setBusy(false);
  }

  async function submitReply(parentId: string) {
    if (!replyText.trim()) return;
    setBusy(true);
    const text = replyText.trim();
    await addComment(prayer.id, text, userId, parentId);
    await notifyMentions(text, userId, prayer.id);
    setReplyText("");
    setReplyTo(null);
    await refreshComments();
    setBusy(false);
  }

  async function removeComment(id: string) {
    await deleteComment(id);
    setComments((prev) => (prev? prev.filter((c) => c.id!== id): prev));
    setCommentCount((n) => Math.max(0, n - 1));
  }

  async function remove() {
    if (!confirm("Supprimer cette prière?")) return;
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
      <Celebration
        open={celebrate}
        emoji=""
        title="Gloire à Dieu!"
        message="Quelle joie! Ta prière exaucée encourage toute la communauté. Continue de témoigner de Sa fidélité."
        onClose={() => setCelebrate(false)}
      />

      {/* Bandeau « Dieu a agi » */}
      {answered? (
        <div className="flex items-center gap-2 bg-gradient-to-r from-dawn-400 to-dawn-300 px-5 py-2 text-sm font-extrabold text-night-950">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6L12 19.8 6.9 22l1-5.6-4-4 5.6-.8z" />
          </svg>
          Dieu a agi, prière exaucée
        </div>
      ): null}

      <div className="p-5">
        {pinned? (
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-dawn-400/15 px-3 py-1 text-[11px] font-bold text-spirit-700">
            <PinIcon className="h-3.5 w-3.5" /> Épinglé
          </p>
        ): null}
        <div className="flex items-center gap-3">
          <Link href={`/membre?u=${prayer.author_id}`} aria-label="Voir le profil">
            <Avatar pseudo={prayer.author?.pseudo} url={prayer.author?.avatar_url} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Link
                href={`/membre?u=${prayer.author_id}`}
                className="inline-flex items-center gap-1.5 font-display font-bold leading-tight hover:underline"
              >
                {prayer.author?.pseudo?? "Ami(e)"}
                {prayer.author?.verified? <VerifiedBadge className="h-4 w-4" />: null}
              </Link>
              {grade? (
                <span className="text-[11px] font-semibold uppercase tracking-wide text-spirit-600/55">
                  {grade}
                </span>
              ): null}
            </div>
            <p className="text-xs text-night-900/50">
              {when(prayer.created_at)} · {VIS_LABEL[prayer.visibility]}
            </p>
          </div>
          {isAuthor || isAdmin? (
            <button
              type="button"
              onClick={remove}
              aria-label="Supprimer"
              title={isAdmin &&!isAuthor? "Supprimer (modération)": "Supprimer"}
              className="shrink-0 text-night-900/30 transition-colors hover:text-night-900/70"
            >
              ✕
            </button>
          ):!isAuthor? (
            <ReportButton targetType="prayer" targetId={prayer.id} label="" tone="light" className="shrink-0 text-night-900/25 hover:text-night-900/60" />
          ): null}
        </div>

        <MentionText
          text={prayer.body}
          className="mt-3 block whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85"
        />

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
            <HandsGlyph className="h-[18px] w-[18px]" /> Je prie{count("pray") > 0? ` · ${count("pray")}`: ""}
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
            <svg
              viewBox="0 0 24 24"
              className={`h-[18px] w-[18px] stroke-current ${mine("heart")? "fill-current": "fill-none"}`}
              strokeWidth={1.8}
            >
              <path
                d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.9 4.02 3 6.5 3c1.74 0 3.4 1 4.22 2.44h.56C12.1 4 13.76 3 15.5 3 17.98 3 20 4.9 20 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z"
                strokeLinejoin="round"
              />
            </svg>
            {count("heart") > 0? count("heart"): ""}
          </button>
          <button
            type="button"
            onClick={openComments}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              commentCount > 0
? "border-spirit-500/40 bg-spirit-500/10 text-spirit-700"
: "border-night-900/15 text-night-900/70 hover:border-night-900/30"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.8}>
              <path
                d="M21 11.5a8 8 0 0 1-11.5 7.2L4 20l1.3-4.5A8 8 0 1 1 21 11.5z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Encourager{commentCount > 0? ` · ${commentCount}`: ""}
          </button>
          <button
            type="button"
            onClick={toggleSavePub}
            aria-label={savedPub? "Retirer du carnet": "Enregistrer dans mon carnet"}
            title={savedPub? "Enregistré dans ton carnet": "Enregistrer dans mon carnet"}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              savedPub
? "border-dawn-400/50 bg-dawn-400/15 text-spirit-700"
: "border-night-900/15 text-night-900/70 hover:border-night-900/30"
            }`}
          >
            {savedPub? (
              <BookmarkFilledGlyph className="h-[18px] w-[18px] text-spirit-600" />
            ): (
              <BookmarkGlyph className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* Admin: épingler le sujet */}
          {isAdmin? (
            <button
              type="button"
              onClick={togglePin}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                pinned
? "border-dawn-400/50 bg-dawn-400/15 text-spirit-700"
: "border-night-900/15 text-night-900/70 hover:border-night-900/30"
              }`}
            >
              <PinIcon className="h-[18px] w-[18px]" />
              {pinned? "Épinglé": "Épingler"}
            </button>
          ): null}

          {/* Auteur: marquer exaucé */}
          {isAuthor? (
            <button
              type="button"
              onClick={toggleAnswered}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
                answered
? "border border-night-900/15 text-night-900/55 hover:border-night-900/30"
: "bg-night-900 text-dawn-400 hover:bg-night-800"
              }`}
            >
              {answered? "Rouvrir": "Dieu a agi"}
            </button>
          ): null}
        </div>

        {showComments? (
          <div className="mt-4 border-t border-night-900/10 pt-4">
            {comments === null? (
              <p className="text-sm text-night-900/45">Chargement…</p>
            ): (
              <ul className="space-y-3">
                {comments
.filter((c) =>!c.parent_id)
.map((c) => {
                    const replies = comments.filter((r) => r.parent_id === c.id);
                    return (
                      <li key={c.id}>
                        <div className="group flex items-start gap-2.5">
                          <Avatar pseudo={c.author?.pseudo} url={c.author?.avatar_url} size={30} />
                          <div className="min-w-0 flex-1">
                            <div className="rounded-2xl bg-night-900/[0.04] px-3 py-2">
                              <p className="flex items-center gap-1 text-xs font-semibold text-night-900/70">
                                {c.author?.pseudo?? "Ami(e)"}
                                {c.author?.verified? <VerifiedBadge className="h-3.5 w-3.5" />: null}
                              </p>
                              <MentionText text={c.body} className="text-sm text-night-900/85" />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyTo(replyTo === c.id? null: c.id);
                                setReplyText(c.author?.pseudo? `@${c.author.pseudo} `: "");
                              }}
                              className="mt-1 pl-3 text-[11px] font-semibold text-spirit-600 hover:underline"
                            >
                              Répondre
                            </button>
                          </div>
                          {isAdmin || c.author_id === userId? (
                            <button
                              type="button"
                              onClick={() => removeComment(c.id)}
                              aria-label="Supprimer le commentaire"
                              title={isAdmin && c.author_id!== userId? "Supprimer (modération)": "Supprimer"}
                              className="shrink-0 text-night-900/25 transition-colors hover:text-night-900/70"
                            >
                              ✕
                            </button>
                          ): null}
                        </div>

                        {/* Réponses (indentées) */}
                        {replies.length > 0? (
                          <ul className="mt-2 space-y-2 border-l-2 border-night-900/10 pl-3 sm:ml-10">
                            {replies.map((r) => (
                              <li key={r.id} className="group flex items-start gap-2">
                                <Avatar pseudo={r.author?.pseudo} url={r.author?.avatar_url} size={24} />
                                <div className="min-w-0 flex-1">
                                  <div className="rounded-2xl bg-night-900/[0.04] px-3 py-1.5">
                                    <p className="flex items-center gap-1 text-[11px] font-semibold text-night-900/70">
                                      {r.author?.pseudo?? "Ami(e)"}
                                      {r.author?.verified? <VerifiedBadge className="h-3 w-3" />: null}
                                    </p>
                                    <MentionText text={r.body} className="text-sm text-night-900/85" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyTo(c.id);
                                      setReplyText(r.author?.pseudo? `@${r.author.pseudo} `: "");
                                    }}
                                    className="mt-0.5 pl-3 text-[11px] font-semibold text-spirit-600 hover:underline"
                                  >
                                    Répondre
                                  </button>
                                </div>
                                {isAdmin || r.author_id === userId? (
                                  <button
                                    type="button"
                                    onClick={() => removeComment(r.id)}
                                    aria-label="Supprimer la réponse"
                                    className="shrink-0 text-night-900/25 transition-colors hover:text-night-900/70"
                                  >
                                    ✕
                                  </button>
                                ): null}
                              </li>
                            ))}
                          </ul>
                        ): null}

                        {/* Champ de réponse */}
                        {replyTo === c.id? (
                          <div className="mt-2 flex gap-2 sm:ml-10">
                            <MentionField
                              value={replyText}
                              onChange={setReplyText}
                              onEnter={() => submitReply(c.id)}
                              placeholder="Ta réponse…"
                              className="field w-full text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => submitReply(c.id)}
                              disabled={busy ||!replyText.trim()}
                              className="btn-primary text-sm disabled:opacity-40"
                            >
                              Répondre
                            </button>
                          </div>
                        ): null}
                      </li>
                    );
                  })}
                {comments.length === 0? (
                  <li className="text-sm text-night-900/45">Sois le premier à encourager.</li>
                ): null}
              </ul>
            )}

            <div className="mt-3 flex gap-2">
              <MentionField
                value={commentText}
                onChange={setCommentText}
                onEnter={submitComment}
                placeholder="Un mot d'encouragement… cite avec @"
                className="field w-full text-sm"
              />
              <button
                type="button"
                onClick={submitComment}
                disabled={busy ||!commentText.trim()}
                className="btn-primary text-sm disabled:opacity-40"
              >
                Envoyer
              </button>
            </div>
          </div>
        ): null}
      </div>
    </li>
  );
}
