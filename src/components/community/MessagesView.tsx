"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
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
    listConversations().then(setConvos);
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
                  <Avatar pseudo={c.partner?.pseudo} url={c.partner?.avatar_url} size={44} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`flex items-center gap-1 text-night-900/85 ${
                        c.unread > 0? "font-bold": "font-semibold"
                      }`}
                    >
                      {c.partner?.pseudo?? "Membre"}
                      {c.partner?.verified? <VerifiedBadge className="h-4 w-4" />: null}
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
  const bottomRef = useRef<HTMLDivElement>(null);

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
            <Avatar pseudo={partner?.pseudo} url={partner?.avatar_url} size={40} />
            <span className="flex items-center gap-1 font-display text-lg font-bold">
              {partner?.pseudo?? "Membre"}
              {partner?.verified? <VerifiedBadge className="h-4 w-4" />: null}
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
            messages.map((m) => {
              const mine = m.sender_id === meId;
              return (
                <div key={m.id} className={`flex ${mine? "justify-end": "justify-start"}`}>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-[15px] leading-snug ${
                      mine
? "bg-dawn-400 text-night-900"
: "border border-night-900/10 bg-white text-night-900/85"
                    }`}
                  >
                    {m.body}
                  </div>
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
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ton message…"
            className="field w-full"
            aria-label="Message"
          />
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
