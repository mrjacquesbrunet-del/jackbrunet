"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

/**
 * PRIÈRES EN DIRECT (mur de prière) — voir supabase/migration-prieres-direct.sql.
 *  - « Maintenant » : la prière prend la prochaine place de la file (1 min 30) ;
 *  - « Programmée » : une date, une heure et une durée, avec « Me prévenir ».
 * Le temps réel (Supabase Realtime) donne qui prie en ce moment (présence),
 * fait voler les réactions de chacun et rafraîchit la liste.
 */

export type PriereDirect = {
  id: string;
  author_id: string;
  sujet: string;
  voice_url: string | null;
  debut: string;
  duree_s: number;
  programmee: boolean;
  created_at: string;
  author?: { id: string; pseudo: string; avatar_url: string | null; verified?: boolean | null };
};

export type Present = { cle: string; uid: string | null; pseudo: string | null; avatar: string | null; priere: string | null };
export type Reaction = { id: number; priere: string; emoji: string };

export const REACTIONS = ["🙏", "❤️", "🕊️", "🙌", "✨"];
export const DUREES_MIN = [5, 10, 15, 30, 60];

export const debutMs = (p: PriereDirect) => new Date(p.debut).getTime();
export const finMs = (p: PriereDirect) => debutMs(p) + p.duree_s * 1000;
export const estEnDirect = (p: PriereDirect, t = Date.now()) => debutMs(p) <= t && t < finMs(p);

/** Prières à venir et en cours (les terminées depuis plus de 10 min sont exclues). */
export async function listerPrieresDirect(): Promise<PriereDirect[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("prieres_direct")
    .select("*")
    .gte("debut", new Date(Date.now() - 2 * 3600_000).toISOString())
    .order("debut", { ascending: true })
    .limit(200);
  if (error || !data) return [];
  const liste = (data as PriereDirect[]).filter((p) => finMs(p) > Date.now() - 10 * 60_000);
  const ids = Array.from(new Set(liste.map((p) => p.author_id)));
  if (ids.length) {
    const { data: profs } = await sb.from("profiles").select("id,pseudo,avatar_url,verified").in("id", ids);
    const par = Object.fromEntries(((profs as PriereDirect["author"][]) ?? []).map((x) => [x!.id, x]));
    for (const p of liste) p.author = par[p.author_id];
  }
  return liste;
}

function messageErreur(e: unknown): string {
  const m = e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : String(e);
  return m.replace(/^.*?:\s*/, "") || "Une erreur est survenue. Réessaie.";
}

export async function lancerPriereDirect(sujet: string, voice: string | null): Promise<PriereDirect> {
  const sb = getSupabase();
  if (!sb) throw new Error("Connexion requise");
  const { data, error } = await sb.rpc("lancer_priere_direct", { p_sujet: sujet, p_voice: voice });
  if (error) throw new Error(messageErreur(error));
  return data as PriereDirect;
}

export async function programmerPriereDirect(sujet: string, debut: Date, dureeMin: number, voice: string | null): Promise<PriereDirect> {
  const sb = getSupabase();
  if (!sb) throw new Error("Connexion requise");
  const { data, error } = await sb.rpc("programmer_priere_direct", {
    p_sujet: sujet,
    p_debut: debut.toISOString(),
    p_duree_min: dureeMin,
    p_voice: voice,
  });
  if (error) throw new Error(messageErreur(error));
  return data as PriereDirect;
}

export async function supprimerPriereDirect(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("prieres_direct").delete().eq("id", id);
  return !error;
}

/** Rappels (« Me prévenir ») : nombre par prière et les miens. */
export async function rappels(ids: string[], uid: string | null): Promise<{ nb: Record<string, number>; miens: Set<string> }> {
  const sb = getSupabase();
  const nb: Record<string, number> = {};
  const miens = new Set<string>();
  if (!sb || !ids.length) return { nb, miens };
  const { data } = await sb.from("prieres_direct_rappels").select("priere_id,user_id").in("priere_id", ids);
  for (const r of (data as { priere_id: string; user_id: string }[]) ?? []) {
    nb[r.priere_id] = (nb[r.priere_id] ?? 0) + 1;
    if (r.user_id === uid) miens.add(r.priere_id);
  }
  return { nb, miens };
}

export async function basculerRappel(id: string, actif: boolean): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = actif
    ? await sb.from("prieres_direct_rappels").insert({ priere_id: id })
    : await sb.from("prieres_direct_rappels").delete().eq("priere_id", id);
  return !error;
}

/** « Amen, j'ai prié » (une fois par personne et par prière). */
export async function direAmen(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("prieres_direct_amens").insert({ priere_id: id });
  return !error || error.code === "23505";
}

export async function amens(id: string): Promise<{ total: number; uids: string[] }> {
  const sb = getSupabase();
  if (!sb) return { total: 0, uids: [] };
  const { data } = await sb.from("prieres_direct_amens").select("user_id").eq("priere_id", id);
  const uids = ((data as { user_id: string }[]) ?? []).map((x) => x.user_id);
  return { total: uids.length, uids };
}

/**
 * Le direct : liste à jour, horloge à la seconde, présence (qui prie quelle
 * prière en ce moment) et réactions qui volent. `priere` = celle que je
 * regarde (null sur le mur).
 */
export function useDirect(moi: { uid: string | null; pseudo: string | null; avatar: string | null }, priere: string | null) {
  const [liste, setListe] = useState<PriereDirect[] | null>(null);
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [presents, setPresents] = useState<Present[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const canal = useRef<RealtimeChannel | null>(null);
  const cle = useMemo(() => moi.uid ?? `invite-${Math.random().toString(36).slice(2, 10)}`, [moi.uid]);

  const recharger = useMemo(
    () => () => {
      void listerPrieresDirect().then(setListe);
    },
    [],
  );

  useEffect(() => {
    recharger();
    const h = setInterval(() => setMaintenant(Date.now()), 1000);
    const r = setInterval(recharger, 60_000);
    return () => {
      clearInterval(h);
      clearInterval(r);
    };
  }, [recharger]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const ch = sb.channel("prieres-direct", { config: { presence: { key: cle } } });
    ch.on("presence", { event: "sync" }, () => {
      const etat = ch.presenceState<Present>();
      setPresents(Object.values(etat).map((v) => v[0]).filter(Boolean));
    });
    ch.on("broadcast", { event: "reaction" }, ({ payload }) => {
      const r = payload as { priere: string; emoji: string };
      const id = Date.now() + Math.random();
      setReactions((x) => [...x.slice(-30), { id, priere: r.priere, emoji: r.emoji }]);
      setTimeout(() => setReactions((x) => x.filter((y) => y.id !== id)), 3200);
    });
    ch.on("postgres_changes", { event: "*", schema: "public", table: "prieres_direct" }, () => recharger());
    ch.subscribe((s) => {
      if (s === "SUBSCRIBED") void ch.track({ cle, uid: moi.uid, pseudo: moi.pseudo, avatar: moi.avatar, priere });
    });
    canal.current = ch;
    return () => {
      canal.current = null;
      void sb.removeChannel(ch);
    };
    // La présence est mise à jour à part (ci-dessous) quand on change de prière.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle, recharger]);

  useEffect(() => {
    void canal.current?.track({ cle, uid: moi.uid, pseudo: moi.pseudo, avatar: moi.avatar, priere });
  }, [cle, moi.uid, moi.pseudo, moi.avatar, priere]);

  const reagir = (id: string, emoji: string) => {
    const rid = Date.now() + Math.random();
    setReactions((x) => [...x.slice(-30), { id: rid, priere: id, emoji }]);
    setTimeout(() => setReactions((x) => x.filter((y) => y.id !== rid)), 3200);
    void canal.current?.send({ type: "broadcast", event: "reaction", payload: { priere: id, emoji } });
  };

  return { liste, maintenant, presents, reactions, reagir, recharger };
}
