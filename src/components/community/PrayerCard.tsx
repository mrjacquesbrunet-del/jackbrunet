"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { Celebration } from "@/components/ui/Celebration";
import { MentionField } from "@/components/community/MentionField";
import { VoiceRecorderButton, VoiceNotePlayer } from "@/components/community/VoiceNote";
import { voiceExpired } from "@/lib/voice";
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
  commentReactionsFor,
  setCommentReaction,
  COMMENT_REACTIONS,
  type CommentReaction,
} from "@/lib/community";

const VIS_LABEL: Record<string, string> = { public: "Public", friends: "Abonnés", private: "Privé" };

/** Réactions d'un commentaire : sélecteur (appui long / « Réagir ») + puces
 * agrégées (🙏 3, ❤️ 1…). Une réaction par personne, re-tap = retirer. */
function CommentReactionsRow({
  reactions,
  mine,
  open,
  onClose,
  onPick,
}: {
  reactions: CommentReaction[];
  mine: string | null;
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
}) {
  const counts: Record<string, number> = {};
  for (const r of reactions) counts[r.emoji] = (counts[r.emoji]?? 0) + 1;
  const entries = COMMENT_REACTIONS.filter((e) => counts[e]).map(
    (e) => [e, counts[e]] as const,
  );
  return (
    <div className="relative">
      {open? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute bottom-0 left-2 z-50 flex gap-0.5 rounded-full border border-night-900/10 bg-white px-1.5 py-1 shadow-xl">
            {COMMENT_REACTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onPick(e)}
                className={`grid h-10 w-10 place-items-center rounded-full text-xl transition-transform hover:scale-110 active:scale-90 ${
                  mine === e? "bg-dawn-400/25": "hover:bg-night-900/[0.05]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </>
      ): null}
      {entries.length > 0? (
        <div className="mt-1 flex flex-wrap gap-1 pl-3">
          {entries.map(([e, n]) => (
            <button
              key={e}
              type="button"
              onClick={() => onPick(e)}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors active:scale-95 ${
                mine === e
? "border-dawn-500/60 bg-dawn-400/15"
: "border-night-900/10 bg-white hover:border-night-900/25"
              }`}
            >
              <span>{e}</span>
              <span className="font-semibold text-night-900/60">{n}</span>
            </button>
          ))}
        </div>
      ): null}
    </div>
  );
}

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
  autoOpenComments = false,
  targetCommentId = null,
}: {
  prayer: Prayer;
  userId: string;
  initialReactions: Reaction[];
  initialCommentCount?: number;
  grade?: string;
  onDeleted: () => void;
  isAdmin?: boolean;
  /** Ouvre les commentaires et fait défiler jusqu'à la carte (clic notif). */
  autoOpenComments?: boolean;
  /** Commentaire précis à mettre en avant (clic sur une notif de commentaire,
   *  réaction ou mention) : on défile jusqu'à lui et on le surligne. */
  targetCommentId?: string | null;
}) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  // Réactions sur les commentaires (appui long / bouton « Réagir »).
  const [crx, setCrx] = useState<CommentReaction[]>([]);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
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
    try {
      await setPrayerPinned(prayer.id, next);
      onDeleted(); // recharge le fil pour remonter/redescendre le sujet
    } catch {
      setPinned(!next); // le serveur a refusé : on annule l'affichage
    }
  }

  const isAuthor = prayer.author_id === userId;

  // Suivi « Comment évolue ton sujet ? » : proposé à l'auteur à partir de
  // 3 jours, tant que le sujet n'est pas exaucé ; masquable (mémorisé).
  const [fuDismissed, setFuDismissed] = useState(true);
  useEffect(() => {
    try {
      setFuDismissed(localStorage.getItem(`jb.fu.${prayer.id}`) === "1");
    } catch {
      /* stockage indisponible */
    }
  }, [prayer.id]);
  const olderThan3Days = Date.now() - new Date(prayer.created_at).getTime() > 3 * 86_400_000;
  const showFollowUp = isAuthor && !answered && olderThan3Days && !fuDismissed;
  function dismissFollowUp() {
    setFuDismissed(true);
    try {
      localStorage.setItem(`jb.fu.${prayer.id}`, "1");
    } catch {
      /* ignore */
    }
  }
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
    setCrx(await commentReactionsFor(list.map((c) => c.id)));
  }

  /** Ma réaction actuelle sur un commentaire (ou null). */
  const myReaction = (commentId: string) =>
    crx.find((r) => r.comment_id === commentId && r.user_id === userId)?.emoji?? null;

  /** Pose / change / retire ma réaction (optimiste). */
  async function reactToComment(commentId: string, emoji: string) {
    const current = myReaction(commentId);
    const next = current === emoji? null: emoji;
    setPickerFor(null);
    setCrx((prev) => {
      const rest = prev.filter((r) =>!(r.comment_id === commentId && r.user_id === userId));
      return next? [...rest, { comment_id: commentId, user_id: userId, emoji: next }]: rest;
    });
    await setCommentReaction(commentId, userId, next);
  }

  /** Appui long (450 ms) sur une bulle → ouvre le sélecteur de réactions. */
  function longPress(id: string) {
    let t: ReturnType<typeof setTimeout>;
    return {
      onTouchStart: () => {
        t = setTimeout(() => setPickerFor(id), 450);
      },
      onTouchEnd: () => clearTimeout(t),
      onTouchMove: () => clearTimeout(t),
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
        setPickerFor(id);
      },
    };
  }

  async function openComments() {
    const next =!showComments;
    setShowComments(next);
    if (next && comments === null) await refreshComments();
  }

  // Clic sur une notification (« X a commenté ton sujet », mention…) : on
  // ouvre les commentaires et on fait défiler la page jusqu'à cette carte.
  const cardRef = useRef<HTMLLIElement>(null);
  const didAutoOpen = useRef(false);
  // Commentaire à surligner brièvement après un clic sur une notification.
  const [highlightId, setHighlightId] = useState<string | null>(null);
  useEffect(() => {
    if (!autoOpenComments || didAutoOpen.current) return;
    didAutoOpen.current = true;
    setShowComments(true);
    if (comments === null) refreshComments();
    const t = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenComments]);

  // Défilement + surbrillance du commentaire ciblé, une fois les commentaires
  // chargés (clic sur « X a réagi / répondu / t'a mentionné »).
  const didAutoComment = useRef(false);
  useEffect(() => {
    if (!targetCommentId || didAutoComment.current) return;
    if (comments === null) return; // on attend le chargement
    didAutoComment.current = true;
    const t = setTimeout(() => {
      const el = document.getElementById(`c-${targetCommentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightId(targetCommentId);
        setTimeout(() => setHighlightId(null), 2600);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [targetCommentId, comments]);

  async function submitComment() {
    if (!commentText.trim()) return;
    setBusy(true);
    const text = commentText.trim();
    const cid = await addComment(prayer.id, text, userId);
    await notifyMentions(text, userId, prayer.id, cid);
    setCommentText("");
    await refreshComments();
    setBusy(false);
  }

  /** Note vocale envoyée en encouragement (au lieu du texte).
   * Le corps « Note vocale » sert de repli (la base refuse un corps vide, et
   * les anciennes versions de l'app affichent ce texte) ; il est masqué à
   * l'affichage quand la note audio est présente. */
  async function submitVoiceComment(audioUrl: string) {
    setBusy(true);
    const ok = await addComment(prayer.id, "Note vocale", userId, null, audioUrl);
    await refreshComments();
    setBusy(false);
    if (!ok) throw new Error("envoi impossible");
  }

  async function submitReply(parentId: string) {
    if (!replyText.trim()) return;
    setBusy(true);
    const text = replyText.trim();
    const cid = await addComment(prayer.id, text, userId, parentId);
    await notifyMentions(text, userId, prayer.id, cid);
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
      ref={cardRef}
      id={`prayer-${prayer.id}`}
      className={`scroll-mt-24 overflow-hidden rounded-3xl border ${
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

        {/* Message vocal joint (expire après 7 jours) */}
        {prayer.audio_url ? (
          voiceExpired(prayer.created_at) ? (
            <p className="mt-3 text-sm italic text-night-900/45">Note vocale expirée (les vocaux durent 7 jours)</p>
          ) : (
            <div className="mt-3">
              <VoiceNotePlayer src={prayer.audio_url} />
            </div>
          )
        ) : null}

        <MentionText
          text={prayer.body}
          className="mt-3 block whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85"
        />

        {/* Suivi du sujet (auteur, à partir de J+3, tant que non exaucé) */}
        {showFollowUp ? (
          <div className="mt-4 rounded-2xl border border-dawn-400/40 bg-dawn-400/10 p-3.5">
            <p className="text-sm font-semibold text-night-900/85">Comment évolue ton sujet ?</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={dismissFollowUp}
                className="rounded-full border border-night-900/15 px-3 py-1.5 text-xs font-semibold text-night-900/70 transition-colors hover:border-night-900/30"
              >
                Continuer à prier
              </button>
              <button
                type="button"
                onClick={() => {
                  dismissFollowUp();
                  setShowComments(true);
                  if (comments === null) refreshComments();
                }}
                className="rounded-full border border-night-900/15 px-3 py-1.5 text-xs font-semibold text-night-900/70 transition-colors hover:border-night-900/30"
              >
                Donner des nouvelles
              </button>
              <button
                type="button"
                onClick={() => {
                  dismissFollowUp();
                  toggleAnswered();
                }}
                className="rounded-full bg-dawn-400 px-3 py-1.5 text-xs font-bold text-night-950 transition-transform active:scale-95"
              >
                Prière exaucée
              </button>
            </div>
          </div>
        ) : null}

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

          {/* Modérateur / admin : épingler le sujet */}
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
                      <li key={c.id} id={`c-${c.id}`} className="scroll-mt-24">
                        <div className="group flex items-start gap-2.5">
                          <Link href={`/membre?u=${c.author_id}`} aria-label="Voir le profil">
                            <Avatar pseudo={c.author?.pseudo} url={c.author?.avatar_url} size={30} />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div
                              {...longPress(c.id)}
                              className={`select-none rounded-2xl px-3 py-2 transition-colors duration-700 ${
                                highlightId === c.id
                                  ? "bg-dawn-400/25 ring-2 ring-dawn-400"
                                  : "bg-night-900/[0.04]"
                              }`}
                            >
                              <Link href={`/membre?u=${c.author_id}`} className="flex items-center gap-1 text-xs font-semibold text-night-900/70 hover:underline">
                                {c.author?.pseudo?? "Ami(e)"}
                                {c.author?.verified? <VerifiedBadge className="h-3.5 w-3.5" />: null}
                              </Link>
                              {c.audio_url? (
                                <div className="mt-1">
                                  {voiceExpired(c.created_at)? (
                                    <p className="text-xs italic text-night-900/45">
                                      Note vocale expirée (les vocaux durent 7 jours)
                                    </p>
                                  ): (
                                    <VoiceNotePlayer src={c.audio_url} />
                                  )}
                                </div>
                              ): null}
                              {c.body &&!c.audio_url? (
                                <MentionText text={c.body} className="text-sm text-night-900/85" />
                              ): null}
                            </div>
                            <CommentReactionsRow
                              reactions={crx.filter((r) => r.comment_id === c.id)}
                              mine={myReaction(c.id)}
                              open={pickerFor === c.id}
                              onClose={() => setPickerFor(null)}
                              onPick={(e) => reactToComment(c.id, e)}
                            />
                            <div className="mt-1 flex items-center gap-3 pl-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyTo(replyTo === c.id? null: c.id);
                                  setReplyText(c.author?.pseudo? `@${c.author.pseudo} `: "");
                                }}
                                className="text-[11px] font-semibold text-spirit-600 hover:underline"
                              >
                                Répondre
                              </button>
                              <button
                                type="button"
                                onClick={() => setPickerFor(pickerFor === c.id? null: c.id)}
                                className="text-[11px] font-semibold text-spirit-600 hover:underline"
                              >
                                Réagir
                              </button>
                            </div>
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
                              <li key={r.id} id={`c-${r.id}`} className="group flex items-start gap-2 scroll-mt-24">
                                <Avatar pseudo={r.author?.pseudo} url={r.author?.avatar_url} size={24} />
                                <div className="min-w-0 flex-1">
                                  <div
                                    {...longPress(r.id)}
                                    className={`select-none rounded-2xl px-3 py-1.5 transition-colors duration-700 ${
                                      highlightId === r.id
                                        ? "bg-dawn-400/25 ring-2 ring-dawn-400"
                                        : "bg-night-900/[0.04]"
                                    }`}
                                  >
                                    <p className="flex items-center gap-1 text-[11px] font-semibold text-night-900/70">
                                      {r.author?.pseudo?? "Ami(e)"}
                                      {r.author?.verified? <VerifiedBadge className="h-3 w-3" />: null}
                                    </p>
                                    {r.audio_url? (
                                      <div className="mt-1">
                                        {voiceExpired(r.created_at)? (
                                          <p className="text-xs italic text-night-900/45">
                                            Note vocale expirée (les vocaux durent 7 jours)
                                          </p>
                                        ): (
                                          <VoiceNotePlayer src={r.audio_url} />
                                        )}
                                      </div>
                                    ): null}
                                    {r.body &&!r.audio_url? (
                                      <MentionText text={r.body} className="text-sm text-night-900/85" />
                                    ): null}
                                  </div>
                                  <CommentReactionsRow
                                    reactions={crx.filter((x) => x.comment_id === r.id)}
                                    mine={myReaction(r.id)}
                                    open={pickerFor === r.id}
                                    onClose={() => setPickerFor(null)}
                                    onPick={(e) => reactToComment(r.id, e)}
                                  />
                                  <div className="mt-0.5 flex items-center gap-3 pl-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyTo(c.id);
                                        setReplyText(r.author?.pseudo? `@${r.author.pseudo} `: "");
                                      }}
                                      className="text-[11px] font-semibold text-spirit-600 hover:underline"
                                    >
                                      Répondre
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPickerFor(pickerFor === r.id? null: r.id)}
                                      className="text-[11px] font-semibold text-spirit-600 hover:underline"
                                    >
                                      Réagir
                                    </button>
                                  </div>
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
                          <div className="mt-2 flex items-end gap-2 sm:ml-10">
                            <MentionField
                              value={replyText}
                              onChange={setReplyText}
                              onEnter={() => submitReply(c.id)}
                              placeholder="Ta réponse…"
                              rows={1}
                              autoGrow
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

            <div className="mt-3 flex items-end gap-2">
              <MentionField
                value={commentText}
                onChange={setCommentText}
                onEnter={submitComment}
                placeholder="Un mot d'encouragement… cite avec @"
                rows={1}
                autoGrow
                className="field w-full text-sm"
              />
              <VoiceRecorderButton userId={userId} onSend={submitVoiceComment} />
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
