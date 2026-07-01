"use client";

import { getSupabase } from "./supabase";
import { getProfile, type Profile } from "./community";

/** Messagerie privée entre membres (1 à 1). */
export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read: boolean;
};

export type Conversation = {
  partner_id: string;
  last_body: string;
  last_at: string;
  unread: number;
  partner?: Profile | null;
};

/** Envoie un message privé. */
export async function sendMessage(senderId: string, recipientId: string, body: string) {
  const sb = getSupabase();
  if (!sb ||!body.trim()) return;
  await sb.from("messages").insert({ sender_id: senderId, recipient_id: recipientId, body: body.trim() });
}

/** Fil de discussion entre moi et une personne (ancien → récent). */
export async function listMessages(meId: string, partnerId: string): Promise<Message[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
.from("messages")
.select("*")
.or(
      `and(sender_id.eq.${meId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${meId})`,
    )
.order("created_at", { ascending: true });
  return (data as Message[])?? [];
}

/** Marque comme lus les messages reçus d'une personne. */
export async function markMessagesRead(meId: string, partnerId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb
.from("messages")
.update({ read: true })
.eq("recipient_id", meId)
.eq("sender_id", partnerId)
.eq("read", false);
}

/** Liste des conversations (dernier message + non-lus par personne). */
export async function listConversations(): Promise<Conversation[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("my_conversations");
  if (error ||!data) return [];
  const rows = data as Omit<Conversation, "partner">[];
  const withProfiles = await Promise.all(
    rows.map(async (r) => ({...r, partner: await getProfile(r.partner_id) })),
  );
  return withProfiles;
}

/** Nombre total de messages non lus. */
export async function unreadMessages(): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { data, error } = await sb.rpc("unread_messages");
  if (error) return 0;
  return (data as number)?? 0;
}
