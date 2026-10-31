"use client";

import { getSupabase } from "./supabase";
import { getProfile, type Profile } from "./community";
import { compressWallImage } from "./wall";

/** Messagerie privée entre membres (1 à 1). */
export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  /** Message vocal (URL publique) — expire au bout de 7 jours. */
  audio_url?: string | null;
  /** Réponse à une story : la story et son image (gardée après les 24 h). */
  story_id?: string | null;
  story_image?: string | null;
  /** Réponse à un message précis (citation affichée au-dessus). */
  reply_to?: string | null;
  /** Photo envoyée dans la conversation. */
  image_url?: string | null;
  edited_at?: string | null;
  /** Supprimé pour tout le monde : il reste « Message supprimé ». */
  deleted_at?: string | null;
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

/** Envoie un message privé (texte, vocal ou photo, en réponse ou non). */
export async function sendMessage(
  senderId: string,
  recipientId: string,
  body: string,
  audioUrl?: string | null,
  extra: { replyTo?: string | null; imageUrl?: string | null } = {},
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || (!body.trim() && !audioUrl && !extra.imageUrl)) return false;
  const base = {
    sender_id: senderId,
    recipient_id: recipientId,
    body: body.trim(),
    audio_url: audioUrl ?? null,
  };
  const enPlus = {
    ...(extra.replyTo ? { reply_to: extra.replyTo } : {}),
    ...(extra.imageUrl ? { image_url: extra.imageUrl } : {}),
  };
  const { error } = await sb.from("messages").insert({ ...base, ...enPlus });
  if (!error) return true;
  // Colonnes pas encore créées (SQL non lancé) : la réponse part sans citation.
  if (!Object.keys(enPlus).length || extra.imageUrl) return false;
  const { error: e2 } = await sb.from("messages").insert(base);
  return !e2;
}

/** Téléverse une photo de conversation (compressée ~200 Ko) → URL publique. */
export async function envoyerPhotoMessage(me: string, file: File): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const blob = await compressWallImage(file);
  if (!blob) return null;
  const path = `${me}/dm-${Date.now()}.jpg`;
  const { error } = await sb.storage.from("wallmedia").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) return null;
  return sb.storage.from("wallmedia").getPublicUrl(path).data.publicUrl ?? null;
}

/** Délai pendant lequel on peut modifier son message (comme WhatsApp). */
export const DELAI_MODIF_MS = 15 * 60_000;

/** Modifie le texte de mon message (dans les 15 minutes). */
export async function modifierMessage(id: string, body: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !body.trim()) return false;
  const { data, error } = await sb.rpc("modifier_message", { p_id: id, p_body: body.trim() });
  return !error && data === true;
}

/** Supprime mon message pour tout le monde. */
export async function supprimerMessage(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data, error } = await sb.rpc("supprimer_message", { p_id: id });
  return !error && data === true;
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

/** Garde-fou : les ids injectés dans le filtre `.or(...)` (chaîne construite)
 * doivent être des UUID — jamais une valeur libre venue de l'URL. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fil de discussion entre moi et une personne (ancien → récent). */
export async function listMessages(meId: string, partnerId: string): Promise<Message[]> {
  const sb = getSupabase();
  if (!sb) return [];
  if (!UUID_RE.test(meId) || !UUID_RE.test(partnerId)) return [];
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

/* ————— Réactions sur les messages (façon WhatsApp) ————— */

export type MessageReaction = { message_id: string; user_id: string; emoji: string };

/** Réactions des messages d'une conversation (vide si la table n'existe pas encore). */
export async function messageReactionsFor(ids: string[]): Promise<MessageReaction[]> {
  const sb = getSupabase();
  if (!sb || !ids.length) return [];
  const { data, error } = await sb.from("message_reactions").select("message_id,user_id,emoji").in("message_id", ids);
  return error ? [] : ((data as MessageReaction[]) ?? []);
}

/** Pose, change ou retire (`null`) ma réaction sur un message. */
export async function setMessageReaction(messageId: string, userId: string, emoji: string | null): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = emoji
    ? await sb.from("message_reactions").upsert({ message_id: messageId, user_id: userId, emoji }, { onConflict: "message_id,user_id" })
    : await sb.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", userId);
  return !error;
}
