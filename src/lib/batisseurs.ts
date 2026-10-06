"use client";

import { getSupabase } from "./supabase";

/**
 * Les Bâtisseurs : les membres qui soutiennent l'app (achat intégré).
 * Avantages : badge exclusif sur le profil et la communauté, et invitation
 * au Zoom mensuel avec Pasteur Jack (envoyée par Jack). Le statut est posé côté Supabase par un
 * trigger à l'enregistrement d'un soutien (profiles.batisseur_depuis).
 */

/** Date du premier soutien de la personne, ou null. */
export async function batisseurDepuis(userId?: string | null): Promise<string | null> {
  const sb = getSupabase();
  if (!sb || !userId) return null;
  const { data, error } = await sb.from("profiles").select("batisseur_depuis").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return (data as { batisseur_depuis?: string | null }).batisseur_depuis ?? null;
}

export type SoutienAdmin = {
  id: number;
  user_id: string | null;
  produit: string;
  montant: number | null;
  devise: string | null;
  plateforme: string | null;
  created_at: string;
  pseudo?: string | null;
};

/** Liste des soutiens (admin), avec le pseudo de chacun. */
export async function listSoutiens(): Promise<SoutienAdmin[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("soutiens")
    .select("id,user_id,produit,montant,devise,plateforme,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return null;
  const rows = (data ?? []) as SoutienAdmin[];
  const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];
  if (ids.length) {
    const { data: profs } = await sb.from("profiles").select("id,pseudo").in("id", ids);
    const map = new Map(((profs ?? []) as { id: string; pseudo: string }[]).map((p) => [p.id, p.pseudo]));
    rows.forEach((r) => (r.pseudo = r.user_id ? map.get(r.user_id) ?? null : null));
  }
  return rows;
}

/* ---- Invitations au Zoom mensuel ---- */

export type InvitationZoom = { id: number; date_zoom: string | null; lien: string; message: string | null; created_at: string };

/** « jeudi 6 novembre à 20 h 00 » (heure de l'appareil). */
export function dateZoom(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const jour = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h ");
  return `${jour} à ${heure}`;
}

/** La dernière invitation (visible par les Bâtisseurs et l'admin). */
export async function derniereInvitationZoom(): Promise<InvitationZoom | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("zoom_invitations")
    .select("id,date_zoom,lien,message,created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as InvitationZoom;
}

export type ResultatInvitation = { notifies: number; emails: number | null; erreurEmail?: string };

/**
 * Envoie l'invitation : notification dans l'app (+ push) à chaque Bâtisseur,
 * puis e-mail via la fonction Supabase « invite-batisseurs ».
 */
export async function envoyerInvitationZoom(z: { date: string | null; lien: string; message: string }): Promise<ResultatInvitation> {
  const sb = getSupabase();
  if (!sb) throw new Error("Connexion indisponible");
  const quand = dateZoom(z.date);
  const texte = `Invitation au Zoom des Bâtisseurs${quand ? ` : ${quand}` : ""}. Touche pour rejoindre.`;
  const { data, error } = await sb.rpc("inviter_batisseurs", {
    p_date: z.date,
    p_lien: z.lien.trim(),
    p_message: z.message.trim(),
    p_texte: texte,
  });
  if (error) throw error;
  const r = data as { invitation_id: number; notifies: number };
  try {
    const { data: mail, error: errMail } = await sb.functions.invoke("invite-batisseurs", {
      body: { invitation_id: r.invitation_id },
    });
    if (errMail) return { notifies: r.notifies, emails: null, erreurEmail: errMail.message };
    return { notifies: r.notifies, emails: (mail as { envoyes?: number })?.envoyes ?? 0 };
  } catch (e) {
    return { notifies: r.notifies, emails: null, erreurEmail: e instanceof Error ? e.message : String(e) };
  }
}

/** Nombre de Bâtisseurs dont l'abonnement est en cours. */
export async function compterBatisseursActifs(): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { count, error } = await sb
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt("batisseur_jusqu_au", new Date().toISOString());
  return error ? null : count ?? 0;
}
