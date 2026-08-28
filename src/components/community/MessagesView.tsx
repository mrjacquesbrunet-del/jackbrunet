"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { VoiceRecorderButton, VoiceNotePlayer } from "@/components/community/VoiceNote";
import { voiceExpired } from "@/lib/voice";
import { presenceLabel } from "@/lib/presence";
import { getSupabase } from "@/lib/supabase";
import { getProfile, searchProfiles, type Profile } from "@/lib/community";
import {
  listConversations,
  listMessages,
  markMessagesRead,
  markConversationUnread,
  sendMessage,
  type Conversation,
  type Message,
} from "@/lib/messages";

/** Date discrète d'une conversation : heure si aujourd'hui, « hier », puis
 * « il y a X j », puis la date courte. */
function convoWhen(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "hier";
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days <= 7) return `il y a ${days} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Étiquette de jour dans le fil : « Aujourd'hui », « Hier », « 12 août ». */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
  });
}

export function MessagesView() {
  const { ready, userId } = useAuth();
  const params = useSearchParams();
  const partnerId = params.get("u");

  if (!isSupabaseConfigured) {
    return <section className="container-x py-24 text-center text-night-900/55">Messagerie bientôt disponible.</section>;
  }
  if (!ready) return <section className="container-x py-24 text-center text-night-900/50">Chargement…</section>;
  if (!userId) {
    return (
      <section className="container-x py-24 text-center text-night-900/60">
        Connecte-toi pour accéder à tes messages.{" "}
        <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
          Rejoindre
        </Link>
      </section>
    );
  }
  return partnerId? (
    <Conversation meId={userId} partnerId={partnerId} />
  ): (
    <Inbox />
  );
}

/* ---------- Recherche d'une personne à qui écrire ---------- */
function StartSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => setResults(await searchProfiles(q, 8)), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div className="relative">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-night-900/40"
          strokeWidth={1.8}
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher une personne à qui écrire…"
          className="field w-full pl-10"
        />
      </div>
      {open && q.trim().length >= 2? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-xl">
            {results.length === 0? (
              <p className="px-4 py-4 text-sm text-night-900/45">Aucun membre trouvé.</p>
            ): (
              <ul className="max-h-80 overflow-y-auto">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/messages?u=${p.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-night-900/[0.04]"
                    >
                      <Avatar pseudo={p.pseudo} url={p.avatar_url} size={34} />
                      <span className="flex items-center gap-1 font-semibold text-night-900/85">
                        {p.pseudo}
                        {p.verified? <VerifiedBadge className="h-3.5 w-3.5" />: null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ): null}
    </div>
  );
}

/* ---------- Liste des conversations ---------- */
function Inbox() {
  const { userId } = useAuth();
  const [convos, setConvos] = useState<Conversation[] | null>(null);

  useEffect(() => {
    // Tri garanti : la conversation au message le plus récent en premier.
    listConversations().then((cs) =>
      setConvos(
        [...cs].sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime()),
      ),
    );
  }, []);

  /** Repasse la conversation en « non lu » (pour y revenir plus tard). */
  async function toUnread(c: Conversation) {
    if (!userId) return;
    setConvos((prev) =>
      prev? prev.map((x) => (x.partner_id === c.partner_id? {...x, unread: Math.max(1, x.unread) }: x)): prev,
    );
    await markConversationUnread(userId, c.partner_id);
  }

  /** Marque la conversation comme lue sans l'ouvrir. */
  async function toRead(c: Conversation) {
    if (!userId) return;
    setConvos((prev) =>
      prev? prev.map((x) => (x.partner_id === c.partner_id? {...x, unread: 0 }: x)): prev,
    );
    await markMessagesRead(userId, c.partner_id);
  }

  return (
    <section className="container-x pb-16 pt-24 sm:pt-28">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold">Messages</h1>
        <p className="mt-1 text-sm text-night-900/55">Tes conversations privées avec la communauté.</p>

        {/* Loupe: chercher quelqu'un à qui écrire */}
        <div className="mt-4">
          <StartSearch />
        </div>

        {convos === null? (
          <p className="mt-8 text-night-900/50">Chargement…</p>
        ): convos.length === 0? (
          <div className="mt-8 rounded-3xl border border-night-900/10 bg-white p-6 text-center">
            <p className="font-semibold text-night-900/80">Aucune conversation pour l'instant.</p>
            <p className="mt-1 text-sm text-night-900/55">
              Ouvre le profil d'un membre et touche « Message » pour lui écrire.
            </p>
          </div>
        ): (
          <ul className="mt-6 space-y-2">
            {convos.map((c) => (
              <li
                key={c.partner_id}
                className="flex items-center gap-1 rounded-2xl border border-night-900/10 bg-white p-1.5 transition-colors hover:bg-night-900/[0.02]"
              >
                <Link
                  href={`/messages?u=${c.partner_id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5"
                >
                  <Avatar pseudo={c.partner?.pseudo} url={c.partner?.avatar_url} size={44} streak={c.partner?.streak_days} badge={c.partner?.badge_tier} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`flex items-center gap-1 text-night-900/85 ${
                        c.unread > 0? "font-bold": "font-semibold"
                      }`}
                    >
                      <span className="min-w-0 truncate">{c.partner?.pseudo?? "Membre"}</span>
                      {c.partner?.verified? <VerifiedBadge className="h-4 w-4 shrink-0" />: null}
                      <span className="ml-auto shrink-0 pl-2 text-[11px] font-medium text-night-900/40">
                        {convoWhen(c.last_at)}
                      </span>
                    </p>
                    <p
                      className={`truncate text-sm ${
                        c.unread > 0? "font-semibold text-night-900/80": "text-night-900/55"
                      }`}
                    >
                      {c.last_body}
                    </p>
                  </div>
                </Link>
                {c.unread > 0? (
                  <button
                    type="button"
                    onClick={() => toRead(c)}
                    aria-label="Marquer comme lu"
                    title="Marquer comme lu"
                    className="mr-1 grid h-9 min-w-[26px] shrink-0 place-items-center rounded-full bg-dawn-400 px-2 text-xs font-bold text-night-900 active:scale-95"
                  >
                    {c.unread}
                  </button>
                ): (
                  <button
                    type="button"
                    onClick={() => toUnread(c)}
                    aria-label="Remettre en non lu"
                    title="Remettre en non lu (pour y revenir plus tard)"
                    className="mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-night-900/35 transition-colors hover:bg-night-900/[0.06] hover:text-night-900/70 active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5zM4.5 7l7.5 6 7.5-6" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="19" cy="6" r="4" className="fill-dawn-400 stroke-none" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- Fil de discussion ---------- */
function Conversation({ meId, partnerId }: { meId: string; partnerId: string }) {
  const [partner, setPartner] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingChanRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabase>>["channel"]> | null>(null);
  const typingSentRef = useRef(0);
  const typingOffRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Canal temps réel « X est en train d'écrire… » (partagé par les deux).
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const name = `dm-typing:${[meId, partnerId].sort().join(":")}`;
    const chan = sb.channel(name, { config: { broadcast: { self: false } } });
    chan.on("broadcast", { event: "typing" }, (msg) => {
      const from = (msg as { payload?: { from?: string } }).payload?.from;
      if (from !== partnerId) return;
      setPartnerTyping(true);
      if (typingOffRef.current) clearTimeout(typingOffRef.current);
      typingOffRef.current = setTimeout(() => setPartnerTyping(false), 3500);
    });
    chan.subscribe();
    typingChanRef.current = chan;
    return () => {
      if (typingOffRef.current) clearTimeout(typingOffRef.current);
      typingChanRef.current = null;
      void sb.removeChannel(chan);
    };
  }, [meId, partnerId]);

  /** Signale que je tape (throttlé à 1 envoi / 1,5 s). */
  const signalTyping = useCallback(() => {
    const now = Date.now();
    if (now - typingSentRef.current < 1500) return;
    typingSentRef.current = now;
    void typingChanRef.current?.send({ type: "broadcast", event: "typing", payload: { from: meId } });
  }, [meId]);

  const refresh = useCallback(async () => {
    const msgs = await listMessages(meId, partnerId);
    setMessages(msgs);
    await markMessagesRead(meId, partnerId);
  }, [meId, partnerId]);

  useEffect(() => {
    getProfile(partnerId).then(setPartner);
  }, [partnerId]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000); // rafraîchit les nouveaux messages
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    const body = text.trim();
    setText("");
    await sendMessage(meId, partnerId, body);
    await refresh();
    setBusy(false);
  }

  /** Envoie un message vocal (déjà téléversé — expire après 7 jours). */
  async function sendVoice(audioUrl: string) {
    setBusy(true);
    await sendMessage(meId, partnerId, "", audioUrl);
    await refresh();
    setBusy(false);
  }

  // « Vu » : id de mon dernier message lu par l'autre.
  const lastSeenId = [...messages].reverse().find((m) => m.sender_id === meId && m.read)?.id ?? null;

  return (
    <section className="container-x pb-28 pt-24 sm:pt-28">
      <div className="mx-auto max-w-2xl">
        {/* En-tête conversation */}
        <div className="flex items-center gap-3">
          <Link href="/messages" aria-label="Retour" className="text-night-900/50 hover:text-night-900/80">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href={`/membre?u=${partnerId}`} className="flex items-center gap-2.5">
            <span className="relative">
              <Avatar pseudo={partner?.pseudo} url={partner?.avatar_url} size={40} streak={partner?.streak_days} badge={partner?.badge_tier} />
              {presenceLabel(partner?.last_seen_at)?.online ? (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
              ) : null}
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-1 font-display text-lg font-bold leading-tight">
                {partner?.pseudo?? "Membre"}
                {partner?.verified? <VerifiedBadge className="h-4 w-4" />: null}
              </span>
              {partnerTyping ? (
                <span className="text-xs font-semibold italic text-spirit-600">est en train d&apos;écrire…</span>
              ) : presenceLabel(partner?.last_seen_at) ? (
                <span className="text-xs text-night-900/50">{presenceLabel(partner?.last_seen_at)!.label}</span>
              ) : null}
            </span>
          </Link>
        </div>

        {/* Messages */}
        <div className="mt-5 space-y-2">
          {messages.length === 0? (
            <p className="py-8 text-center text-sm text-night-900/45">
              Écris le premier message à {partner?.pseudo?? "ce membre"}.
            </p>
          ): (
            messages.map((m, i) => {
              const mine = m.sender_id === meId;
              // Séparateur de jour quand la date change dans le fil.
              const newDay =
                i === 0 ||
                new Date(messages[i - 1].created_at).toDateString() !==
                  new Date(m.created_at).toDateString();
              return (
                <div key={m.id} className={`flex flex-col ${mine? "items-end": "items-start"}`}>
                  {newDay ? (
                    <p className="my-2 w-full self-center text-center text-[11px] font-semibold text-night-900/35">
                      {dayLabel(m.created_at)}
                    </p>
                  ) : null}
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-[15px] leading-snug ${
                      mine
? "bg-dawn-400 text-night-900"
: "border border-night-900/10 bg-white text-night-900/85"
                    }`}
                  >
                    {m.audio_url ? (
                      voiceExpired(m.created_at) ? (
                        <span className="text-sm italic opacity-60">Note vocale expirée (les vocaux durent 7 jours)</span>
                      ) : (
                        <div className="min-w-[13rem]">
                          <VoiceNotePlayer src={m.audio_url} />
                        </div>
                      )
                    ) : null}
                    {m.body}
                  </div>
                  {mine && m.id === lastSeenId ? (
                    <p className="mt-0.5 pr-1 text-[10px] font-semibold text-night-900/40">Vu</p>
                  ) : null}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Barre d'envoi */}
      <div className="global-audio-bar fixed inset-x-0 z-[50] border-t border-night-900/10 bg-white/95 p-3 backdrop-blur">
        <div className="container-x flex max-w-2xl items-center gap-2 px-0">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              signalTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ton message…"
            className="field w-full"
            aria-label="Message"
          />
          <VoiceRecorderButton userId={meId} onSend={sendVoice} />
          <button
            type="button"
            onClick={send}
            disabled={busy ||!text.trim()}
            className="btn-primary shrink-0 disabled:opacity-40"
          >
            Envoyer
          </button>
        </div>
      </div>
    </section>
  );
}
