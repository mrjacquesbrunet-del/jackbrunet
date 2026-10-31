"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { Celebration } from "@/components/ui/Celebration";
import { MentionField } from "@/components/community/MentionField";
import { BarreReactions, PucesReactions, gesteReaction } from "@/components/community/Reactions";
import { VoiceRecorderButton, VoiceNotePlayer } from "@/components/community/VoiceNote";
import { voiceExpired } from "@/lib/voice";
import { MentionText } from "@/components/community/MentionText";
import { HandsGlyph, BookmarkGlyph, BookmarkFilledGlyph } from "@/components/ui/DevoIcons";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { BatisseurBadge } from "@/components/community/BatisseurBadge";
import { TexteMembre } from "@/components/community/VoirTraduction";
import { estBatisseurActif } from "@/lib/soutien";
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
  type CommentReaction,
} from "@/lib/community";
import { localeApp } from "@/lib/i18n";
import { themesPriere } from "@/lib/themes-priere";
import { appShareUrl } from "@/config/app-links";

const VIS_LABEL: Record<string, string> = { public: "Public", friends: "Abonnés", private: "Privé" };

/** Réactions rapides des sujets (appui long sur « Je prie ») : mêmes emojis que les commentaires. */
const PRAYER_QUICK: [string, string][] = [["🙏", "pray"], ["❤️", "heart"], ["🕊️", "dove"], ["🙌", "hands"], ["✨", "sparkles"]];

/** Réactions d'un commentaire, façon WhatsApp : barre rapide (appui long ou
 * « Réagir ») avec « + » pour tout le choix, puces agrégées sous la bulle.
 * Une réaction par personne, re-toucher la sienne = la retirer. */
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
  return (
    <div className="relative">
      {open ? <BarreReactions mine={mine} onPick={onPick} onClose={onClose} className="bottom-0 left-2" /> : null}
      <PucesReactions emojis={reactions.map((r) => r.emoji)} mine={mine} onPick={onPick} className="mt-1 pl-3" />
    </div>
  );
}

/** « à l'instant », « 5 min », « 2 h », « hier », « 3 j », puis la date. */
function tempsCourt(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return "hier";
  if (j < 7) return `${j} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className?? ""} fill-none stroke-current`} strokeWidth={1.8}>
      <path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5zM12 17v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** « Il y a 2 heures », « Hier »… puis la date au-delà d'une semaine. */
function when(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "À l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return m === 1 ? "Il y a 1 minute" : `Il y a ${m} minutes`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "Il y a 1 heure" : `Il y a ${h} heures`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Hier";
  if (d < 7) return `Il y a ${d} jours`;
  return new Date(iso).toLocaleDateString(localeApp(), { day: "numeric", month: "short" });
}

const COEUR =
  "M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.9 4.02 3 6.5 3c1.74 0 3.4 1 4.22 2.44h.56C12.1 4 13.76 3 15.5 3 17.98 3 20 4.9 20 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z";

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
  apercu = null,
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
  /** Dernier encouragement, affiché sous le sujet (aperçu du fil). */
  apercu?: Comment | null;
}) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  // Réactions rapides (appui long sur « Je prie ») : 🙏 ❤️ 🕊️ 🙌 ✨
  const [quickOpen, setQuickOpen] = useState(false);
  const quickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quickFired = useRef(false);
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
  const [menuOuvert, setMenuOuvert] = useState(false);
  const themes = themesPriere(prayer.body);

  async function partager() {
    const url = appShareUrl(`/communaute/?prayer=${prayer.id}`);
    const texte = prayer.body.length > 120 ? `${prayer.body.slice(0, 117)}…` : prayer.body;
    try {
      const nav = navigator as Navigator & { share?: (d: object) => Promise<void> };
      if (nav.share) await nav.share({ title: "Sujet de prière", text: `Prie avec nous : « ${texte} »`, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* annulé */
    }
  }

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
  const count = (t: string) => reactions.filter((r) => r.type === t).length;
  const mine = (t: string) => reactions.some((r) => r.type === t && r.user_id === userId);

  async function react(t: string) {
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

  /** Appui long sur une bulle → barre de réactions ; double toucher → ❤️. */
  function longPress(id: string) {
    return gesteReaction(
      () => setPickerFor(id),
      () => {
        if (myReaction(id) !== "❤️") void reactToComment(id, "❤️");
      },
    );
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

  // Boutons d'action : pastilles sombres, même hauteur (maquette du mur).
  const pastille = "inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border text-[12.5px] font-medium transition-colors active:scale-[0.97]";
  const neutre = "border-creme/[0.12] bg-creme/[0.05] text-cream/85";

  return (
    <li
      ref={cardRef}
      id={`prayer-${prayer.id}`}
      className={`scroll-mt-24 overflow-hidden rounded-2xl border ${
        answered ? "border-dawn-400/35 bg-gradient-to-b from-dawn-400/[0.09] to-cream/[0.05]" : "border-creme/10 bg-creme/[0.06]"
      } text-cream`}
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
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-dawn-400 to-dawn-300 px-3.5 py-1.5 text-[11.5px] font-bold text-night-950">
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
            <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6L12 19.8 6.9 22l1-5.6-4-4 5.6-.8z" />
          </svg>
          Dieu a agi, prière exaucée
        </div>
      ): null}

      <div className="p-3.5">
        {pinned? (
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-dawn-400/15 px-3 py-1 text-[11px] font-bold text-dawn-300">
            <PinIcon className="h-3.5 w-3.5" /> Épinglé
          </p>
        ): null}
        <div className="flex items-center gap-2.5">
          <Link href={`/membre?u=${prayer.author_id}`} aria-label="Voir le profil" className="shrink-0">
            <Avatar pseudo={prayer.author?.pseudo} url={prayer.author?.avatar_url} size={40} streak={prayer.author?.streak_days} badge={prayer.author?.badge_tier} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Link
                href={`/membre?u=${prayer.author_id}`}
                className="inline-flex min-w-0 items-center gap-1 text-[14.5px] font-semibold leading-tight text-cream"
              >
                <span className="truncate">{prayer.author?.pseudo?? "Ami(e)"}</span>
                {prayer.author?.verified? <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />: null}
                {estBatisseurActif(prayer.author) ? <BatisseurBadge compact /> : null}
              </Link>
              {grade? (
                <span className="rounded-full bg-dawn-400/90 px-1.5 py-[1px] text-[8.5px] font-bold uppercase tracking-wide text-night-950">
                  {grade}
                </span>
              ): null}
            </div>
            <p className="mt-0.5 text-[11px] text-cream/45">
              {when(prayer.created_at)} · {VIS_LABEL[prayer.visibility]}
            </p>
          </div>
          {/* Options : exaucé, épingler, supprimer, signaler */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOuvert((o) => !o)}
              aria-label="Options du sujet"
              className="grid h-8 w-7 place-items-center rounded-full text-cream/50 active:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>
            {menuOuvert ? (
              <>
                <button type="button" aria-label="Fermer" onClick={() => setMenuOuvert(false)} className="fixed inset-0 z-[60] cursor-default" />
                <div className="absolute right-0 top-full z-[61] mt-1 w-56 overflow-hidden rounded-2xl border border-white/10 bg-night-800 py-1 text-[14.5px] shadow-xl">
                  {isAuthor ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOuvert(false);
                        toggleAnswered();
                      }}
                      className="block w-full px-4 py-3 text-left font-semibold text-dawn-300 active:bg-white/[0.06]"
                    >
                      {answered ? "Rouvrir le sujet" : "Dieu a agi (exaucée)"}
                    </button>
                  ) : null}
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOuvert(false);
                        togglePin();
                      }}
                      className="block w-full px-4 py-3 text-left font-semibold text-cream/85 active:bg-white/[0.06]"
                    >
                      {pinned ? "Désépingler" : "Épingler en haut du mur"}
                    </button>
                  ) : null}
                  {isAuthor || isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOuvert(false);
                        remove();
                      }}
                      className="block w-full px-4 py-3 text-left font-semibold text-red-400 active:bg-white/[0.06]"
                    >
                      {isAdmin && !isAuthor ? "Supprimer (modération)" : "Supprimer"}
                    </button>
                  ) : (
                    <div className="px-4 py-3">
                      <ReportButton targetType="prayer" targetId={prayer.id} label="Signaler" tone="dark" className="font-semibold text-cream/70" />
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Message vocal joint (expire après 7 jours) */}
        {prayer.audio_url ? (
          voiceExpired(prayer.created_at) ? (
            <p className="mt-3 text-sm italic text-cream/45">Note vocale expirée (les vocaux durent 7 jours)</p>
          ) : (
            <div className="mt-3">
              <VoiceNotePlayer src={prayer.audio_url} />
            </div>
          )
        ) : null}

        <TexteMembre
          texte={prayer.body}
          rendu={(t) => (
            <MentionText text={t} className="mt-2.5 block whitespace-pre-wrap text-[13.5px] leading-[1.5] text-cream/90" />
          )}
        />

        {/* Thèmes du sujet */}
        {themes.length ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {themes.map((t) => (
              <span key={t} className="rounded-full bg-creme/[0.09] px-2.5 py-[3px] text-[11px] text-cream/80">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {/* Suivi du sujet (auteur, à partir de J+3, tant que non exaucé) */}
        {showFollowUp ? (
          <div className="mt-4 rounded-2xl border border-dawn-400/40 bg-dawn-400/10 p-3.5">
            <p className="text-sm font-semibold text-cream/90">Comment évolue ton sujet ?</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={dismissFollowUp}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-cream/75"
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
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-cream/75"
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

        {/* Actions : Je prie · J'aime · Encourager · Partager · Carnet */}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="relative inline-flex min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                if (quickFired.current) {
                  quickFired.current = false;
                  return; // l'appui long a ouvert le picker, pas de toggle
                }
                react("pray");
              }}
              onPointerDown={() => {
                quickFired.current = false;
                if (quickTimer.current) clearTimeout(quickTimer.current);
                quickTimer.current = setTimeout(() => {
                  quickFired.current = true;
                  setQuickOpen(true);
                }, 420);
              }}
              onPointerUp={() => {
                if (quickTimer.current) clearTimeout(quickTimer.current);
              }}
              onPointerLeave={() => {
                if (quickTimer.current) clearTimeout(quickTimer.current);
              }}
              onContextMenu={(e) => e.preventDefault()}
              className={`${pastille} w-full select-none px-2.5 ${
                mine("pray") ? "border-dawn-400 bg-dawn-400 text-night-950" : "border-dawn-400/50 bg-dawn-400/[0.05] text-dawn-400"
              }`}
              title="Appui long : plus de réactions"
            >
              <HandsGlyph className="h-4 w-4 shrink-0" /> Je prie{count("pray") > 0? ` · ${count("pray")}`: ""}
            </button>
            {quickOpen ? (
              <>
                <button aria-label="Fermer" onClick={() => setQuickOpen(false)} className="fixed inset-0 z-[60] cursor-default" />
                <div className="absolute bottom-full left-0 z-[61] mb-2 flex items-center gap-0.5 rounded-full border border-white/10 bg-night-800 px-1.5 py-1 shadow-xl" style={{ animation: "qr-pop .18s ease-out" }}>
                  <style dangerouslySetInnerHTML={{ __html: "@keyframes qr-pop{0%{transform:scale(.6) translateY(6px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}" }} />
                  {PRAYER_QUICK.map(([emo, t]) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setQuickOpen(false);
                        react(t);
                      }}
                      aria-label={`Réagir ${emo}`}
                      className={`grid h-9 w-9 place-items-center rounded-full text-xl transition-transform hover:scale-110 ${mine(t) ? "bg-dawn-400/25" : ""}`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </span>
          <button type="button" onClick={() => react("heart")} aria-label="J'aime" className={`${pastille} w-[48px] shrink-0 ${mine("heart") ? "border-red-400/50 bg-red-500/10 text-cream" : neutre}`}>
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 ${count("heart") > 0 || mine("heart") ? "fill-red-500 text-red-500" : "fill-none text-cream/80"} stroke-current`}
              strokeWidth={1.8}
              aria-hidden
            >
              <path d={COEUR} strokeLinejoin="round" />
            </svg>
            {count("heart") > 0? count("heart"): ""}
          </button>
          <button type="button" onClick={openComments} aria-label="Encourager" className={`${pastille} w-[48px] shrink-0 ${neutre}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
              <path d="M21 11.5a8 8 0 0 1-11.5 7.2L4 20l1.3-4.5A8 8 0 1 1 21 11.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {commentCount > 0? commentCount: ""}
          </button>
          <button type="button" onClick={partager} aria-label="Partager" className={`${pastille} w-9 shrink-0 ${neutre}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
              <path d="M14 5l7 7-7 7M21 12H10a7 7 0 0 0-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggleSavePub}
            aria-label={savedPub? "Retirer du carnet": "Enregistrer dans mon carnet"}
            className={`${pastille} w-9 shrink-0 ${savedPub ? "border-dawn-400/50 bg-dawn-400/15 text-dawn-300" : neutre}`}
          >
            {savedPub? <BookmarkFilledGlyph className="h-4 w-4" />: <BookmarkGlyph className="h-4 w-4" />}
          </button>
        </div>

        {/* Réactions rapides supplémentaires (🕊️ 🙌 ✨) — visibles si utilisées */}
        {PRAYER_QUICK.some(([, t]) => t !== "pray" && t !== "heart" && (count(t) > 0 || mine(t))) ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRAYER_QUICK.filter(([, t]) => t !== "pray" && t !== "heart" && (count(t) > 0 || mine(t))).map(([emo, t]) => (
              <button
                key={t}
                type="button"
                onClick={() => react(t)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-semibold ${
                  mine(t) ? "border-dawn-400/50 bg-dawn-400/15 text-dawn-300" : "border-white/12 text-cream/75"
                }`}
              >
                <span className="text-base leading-none">{emo}</span>
                {count(t) > 0 ? count(t) : ""}
              </button>
            ))}
          </div>
        ) : null}

        {/* Aperçu : le dernier encouragement + « Voir les N commentaires » */}
        {!showComments && apercu ? (
          <div className="mt-2.5 rounded-xl bg-creme/[0.06] px-2.5 py-2">
            <div className="flex items-center gap-2.5">
              <Avatar pseudo={apercu.author?.pseudo} url={apercu.author?.avatar_url} size={30} />
              <div className="min-w-0 flex-1">
                <p className="flex min-w-0 items-center gap-1.5 text-[12.5px]">
                  <span className="truncate font-bold text-cream">{apercu.author?.pseudo ?? "Ami(e)"}</span>
                  {apercu.author?.verified ? <VerifiedBadge className="h-3.5 w-3.5 shrink-0" /> : null}
                  <span className="shrink-0 text-[10.5px] text-cream/40">{when(apercu.created_at)}</span>
                </p>
                {apercu.audio_url && !voiceExpired(apercu.created_at) ? (
                  <div className="mt-1.5">
                    <VoiceNotePlayer src={apercu.audio_url} />
                  </div>
                ) : apercu.body ? (
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-cream/70">{apercu.body}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        {!showComments && commentCount > 0 ? (
          <button type="button" onClick={openComments} className="mt-2 inline-flex items-center gap-0.5 text-[12px] font-medium text-cream/55">
            {commentCount > 1 ? `Voir les ${commentCount} commentaires` : "Voir le commentaire"}
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}

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
                                {estBatisseurActif(c.author) ? <BatisseurBadge compact /> : null}
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
                                <TexteMembre texte={c.body} rendu={(t) => <MentionText text={t} className="text-sm text-night-900/85" />} />
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
                              <span className="text-[11px] text-night-900/40">{tempsCourt(c.created_at)}</span>
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
                                      <TexteMembre texte={r.body} rendu={(t) => <MentionText text={t} className="text-sm text-night-900/85" />} />
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
                                    <span className="text-[11px] text-night-900/40">{tempsCourt(r.created_at)}</span>
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
