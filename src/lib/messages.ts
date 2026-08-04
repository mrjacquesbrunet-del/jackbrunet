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

/** Admin: dépose un message dans la messagerie de TOUS les membres + notifie.
 * Renvoie le nombre de membres touchés, ou null en cas d'échec. */
export async function broadcastMessage(body: string): Promise<number | null> {
  const sb = getSupabase();
  if (!sb ||!body.trim()) return null;
  const { data, error } = await sb.rpc("admin_broadcast_message", { message: body.trim() });
  if (error) return null;
  return typeof data === "number"? data: 0;
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

/** Remet une conversation « non lue » (pour y revenir plus tard) : le dernier
 * message reçu de cette personne repasse en non lu → la pastille revient. */
export async function markConversationUnread(meId: string, partnerId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data } = await sb
.from("messages")
.select("id")
.eq("recipient_id", meId)
.eq("sender_id", partnerId)
.order("created_at", { ascending: false })
.limit(1);
  const id = (data as { id: string }[] | null)?.[0]?.id;
  if (!id) return false;
  const { error } = await sb.from("messages").update({ read: false }).eq("id", id);
  return !error;
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
