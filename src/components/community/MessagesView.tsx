"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { getProfile, type Profile } from "@/lib/community";
import {
  listConversations,
  listMessages,
  markMessagesRead,
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

/* ---------- Liste des conversations ---------- */
function Inbox() {
  const [convos, setConvos] = useState<Conversation[] | null>(null);

  useEffect(() => {
    listConversations().then(setConvos);
  }, []);

  return (
    <section className="container-x pb-16 pt-24 sm:pt-28">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold">Messages</h1>
        <p className="mt-1 text-sm text-night-900/55">Tes conversations privées avec la communauté.</p>

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
              <li key={c.partner_id}>
                <Link
                  href={`/messages?u=${c.partner_id}`}
                  className="flex items-center gap-3 rounded-2xl border border-night-900/10 bg-white p-3 transition-colors hover:bg-night-900/[0.02]"
                >
                  <Avatar pseudo={c.partner?.pseudo} url={c.partner?.avatar_url} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 font-semibold text-night-900/85">
                      {c.partner?.pseudo?? "Membre"}
                      {c.partner?.verified? <VerifiedBadge className="h-4 w-4" />: null}
                    </p>
                    <p className="truncate text-sm text-night-900/55">{c.last_body}</p>
                  </div>
                  {c.unread > 0? (
                    <span className="grid min-w-[22px] place-items-center rounded-full bg-dawn-400 px-1.5 text-xs font-bold text-night-900">
                      {c.unread}
                    </span>
                  ): null}
                </Link>
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
