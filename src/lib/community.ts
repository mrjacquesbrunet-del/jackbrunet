"use client";

import { getSupabase } from "./supabase";
import { gradeFor } from "./grades";

export type FavoriteVerse = { reference: string; text: string };
export type Profile = {
  id: string;
  pseudo: string;
  avatar_url: string | null;
  bio?: string | null;
  favorite_verses?: FavoriteVerse[];
  verified?: boolean | null;
  is_moderator?: boolean | null;
  /* Personnalisation du profil (tous facultatifs) */
  church?: string | null;
  city?: string | null;
  country?: string | null;
  /** Confidentialité de la localisation : visible par tous, ou par moi seul. */
  location_privacy?: "public" | "prive" | null;
  /** Confidentialité des abonnés / abonnements : visibles par tous (défaut), ou par moi seul. */
  follows_privacy?: "public" | "prive" | null;
  /** Phrase personnelle, ex. « Jésus a changé ma vie en 2019 ». */
  life_phrase?: string | null;
  /** Bannière du profil (grande image plein écran, personnalisable). */
  banner_url?: string | null;
  /** Couleur du nom affiché sur le profil (hex), choisie par le membre. */
  name_color?: string | null;
  /** Dernière activité (présence « En ligne » / « Actif il y a X »). */
  last_seen_at?: string | null;
  /** Série de jours consécutifs (badge flamme public à partir de 7). */
  streak_days?: number | null;
  /** Date de la rencontre avec Jésus → « X ans avec Jésus ». */
  converted_at?: string | null;
};
export type Visibility = "public" | "friends" | "private";
export type Prayer = {
  id: string;
  author_id: string;
  body: string;
  visibility: Visibility;
  /** Message vocal joint (URL publique) — expire au bout de 7 jours. */
  audio_url?: string | null;
  answered: boolean;
  pinned?: boolean;
  created_at: string;
  author?: Profile;
};

/** Emails administrateurs (modération + annonces). Ajoute-en ici au besoin. */
export const ADMIN_EMAILS = ["contact@jackbrunet.com", "mr.jacquesbrunet@gmail.com"];
export const ADMIN_EMAIL = ADMIN_EMAILS[0];
export function isAdminEmail(email?: string | null) {
  return ADMIN_EMAILS.includes((email?? "").trim().toLowerCase());
}
export type Comment = {
  id: string;
  prayer_id: string;
  author_id: string;
  body: string;
  created_at: string;
  /** Réponse à un commentaire (null = commentaire de 1er niveau). */
  parent_id?: string | null;
  /** Note vocale (URL publique) — remplace le texte quand présent. */
  audio_url?: string | null;
  author?: Profile;
};
export type Reaction = { prayer_id: string; user_id: string; type: string };
export type NotifType =
  | "pray"
  | "heart"
  | "comment"
  | "follow"
  | "mention"
  | "admin"
  | "message"
  | "reply"
  | "group_comment"
  | "group_reaction"
  | "group_post"
  | "group_message"
  | "group_join"
  | "comment_reaction"
  | "pray_digest"
  | "follow_up"
  | "challenge";
export type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotifType;
  prayer_id: string | null;
  comment_id?: string | null;
  body?: string | null;
  link?: string | null;
  read: boolean;
  created_at: string;
  actor?: Profile;
};

/* ---- Auth ---- */

/**
 * Base des URLs de redirection d'authentification. Dans l'app native,
 * `window.location.origin` vaut `capacitor://localhost` : un magic-link ou un
 * OAuth qui y redirige est inutilisable (lien mort). On force alors le site.
 * NOTE : `https://jackbrunet.com/communaute/` doit figurer dans les
 * « Redirect URLs » de Supabase Auth.
 */
function authRedirectBase(): string {
  try {
    const origin = window.location.origin;
    if (origin.startsWith("http")) return origin;
  } catch {
    /* ignore */
  }
  return "https://jackbrunet.com";
}

export async function signInEmail(email: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  return sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${authRedirectBase()}/communaute/` },
  });
}

export async function signInGoogle() {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${authRedirectBase()}/communaute/` },
  });
  if (error) throw error;
  // Au cas où la redirection automatique ne se déclenche pas (certains
  // navigateurs mobiles), on force la navigation vers l'URL d'autorisation.
  if (data?.url) window.location.assign(data.url);
  return data;
}

export async function signInApple() {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "apple",
    options: { redirectTo: `${authRedirectBase()}/communaute/` },
  });
  if (error) throw error;
  if (data?.url) window.location.assign(data.url);
  return data;
}

/** Inscription e-mail + mot de passe (100% dans l'app, sans navigateur).
 * Le prénom, s'il est fourni, est enregistré dans le compte et devient le
 * pseudo affiché sur le profil (dédupliqué si déjà pris). */
export async function signUpEmailPassword(email: string, password: string, firstName?: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const clean = (firstName?? "").trim();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: clean? { data: { first_name: clean } }: undefined,
  });
  if (error) throw error;
  // Renseigne le prénom comme pseudo si la session est active immédiatement
  // (double opt-in désactivé). Best-effort: n'interrompt jamais l'inscription.
  const uid = data.user?.id;
  if (uid && clean && data.session) {
    try {
      let pseudo = clean;
      if (await isPseudoTaken(pseudo, uid)) {
        pseudo = `${clean}${Math.floor(Math.random() * 900 + 100)}`;
      }
      await sb.from("profiles").upsert({ id: uid, pseudo });
    } catch {
      /* le pseudo pourra être défini plus tard depuis le profil */
    }
  }
  return data;
}

/** Connexion e-mail + mot de passe (100% dans l'app). */
export async function signInEmailPassword(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Mot de passe oublié : envoie un e-mail avec un lien de réinitialisation.
 * Le lien ouvre la page /reinitialiser-mot-de-passe où l'utilisateur choisit
 * un nouveau mot de passe. On redirige toujours vers le site public
 * (authRedirectBase renvoie jackbrunet.com dans l'app native). */
export async function sendPasswordReset(email: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${authRedirectBase()}/reinitialiser-mot-de-passe/`,
  });
  if (error) throw error;
}

/** Définit un nouveau mot de passe (une fois la session de récupération
 * ouverte via le lien reçu par e-mail). */
export async function updatePassword(newPassword: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ============ Plans : notes (étoiles) + enregistrements ============

export type PlanStats = { avg: number; cnt: number };

/** Moyenne + nombre d'avis pour tous les plans. */
export async function planRatingsSummary(): Promise<Record<string, PlanStats>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data, error } = await sb.rpc("plan_ratings_summary");
  if (error || !data) return {};
  const map: Record<string, PlanStats> = {};
  for (const r of data as { plan_slug: string; avg: number; cnt: number }[]) {
    map[r.plan_slug] = { avg: Number(r.avg) || 0, cnt: Number(r.cnt) || 0 };
  }
  return map;
}

/** Ma note pour un plan (1..5), ou null si pas encore noté. */
export async function myPlanRating(slug: string, userId: string): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("plan_ratings")
    .select("stars")
    .eq("user_id", userId)
    .eq("plan_slug", slug)
    .maybeSingle();
  return (data?.stars as number | undefined) ?? null;
}

/** Noter un plan (1..5). Renvoie true si enregistré. */
export async function ratePlan(slug: string, stars: number, userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("plan_ratings")
    .upsert({ user_id: userId, plan_slug: slug, stars, updated_at: new Date().toISOString() });
  return !error;
}

/** Le plan est-il enregistré par cette personne ? */
export async function isPlanSaved(slug: string, userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data } = await sb
    .from("plan_saves")
    .select("plan_slug")
    .eq("user_id", userId)
    .eq("plan_slug", slug)
    .maybeSingle();
  return !!data;
}

/** Enregistre (on=true) ou retire (on=false) un plan. */
export async function togglePlanSave(slug: string, userId: string, on: boolean): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  if (on) await sb.from("plan_saves").upsert({ user_id: userId, plan_slug: slug });
  else await sb.from("plan_saves").delete().eq("user_id", userId).eq("plan_slug", slug);
}

/** Slugs des plans enregistrés par cette personne. */
export async function listSavedPlans(userId: string): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("plan_saves").select("plan_slug").eq("user_id", userId);
  return ((data as { plan_slug: string }[] | null) ?? []).map((r) => r.plan_slug);
}

/** Suppression du compte (exigence App Store) via une fonction Supabase.
 * Renvoie le détail de l'erreur pour l'afficher (plutôt qu'un échec muet). */
export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Service non configuré." };
  const { error } = await sb.rpc("delete_user");
  if (error) return { ok: false, error: error.message };
  await sb.auth.signOut();
  return { ok: true };
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}

/* ---- Profils ---- */
export async function getProfile(id: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  // `*` plutôt qu'une liste de colonnes : si une migration (église, bannière…)
  // n'est pas encore passée côté Supabase, la requête réussit quand même au
  // lieu d'échouer entièrement (profil « Ami(e) » + photo par défaut).
  const { data } = await sb
.from("profiles")
.select("*")
.eq("id", id)
.single();
  return (data as Profile)?? null;
}

/** Admin: nommer (ou retirer) un modérateur. La RLS impose l'admin côté serveur. */
export async function setModerator(userId: string, on: boolean): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.rpc("set_moderator", { p_user_id: userId, p_on: on });
  return !error;
}

export async function updateProfile(id: string, patch: Partial<Profile>) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("profiles").update(patch).eq("id", id);
  if (error) {
    // Migration pas encore passée (colonnes église/bannière absentes) :
    // on sauvegarde au moins les champs de base plutôt que rien.
    const base: Partial<Profile> = {
      pseudo: patch.pseudo,
      avatar_url: patch.avatar_url,
      bio: patch.bio,
      favorite_verses: patch.favorite_verses,
    };
    const cleaned = Object.fromEntries(
      Object.entries(base).filter(([, v]) => v!== undefined),
    );
    if (Object.keys(cleaned).length) {
      await sb.from("profiles").update(cleaned).eq("id", id);
    }
  }
}

/** Ajoute un verset aux versets publics du profil (dédupliqué). */
export async function addFavoriteVerse(userId: string, v: FavoriteVerse): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const profile = await getProfile(userId);
  const current = profile?.favorite_verses?? [];
  const exists = current.some(
    (x) => x.text.trim() === v.text.trim() && (x.reference?? "") === (v.reference?? ""),
  );
  if (exists) return true;
  const next = [...current, { reference: v.reference.trim(), text: v.text.trim() }];
  const { error } = await sb.from("profiles").update({ favorite_verses: next }).eq("id", userId);
  return!error;
}

async function profilesByIds(ids: string[]): Promise<Record<string, Profile>> {
  const sb = getSupabase();
  if (!sb || ids.length === 0) return {};
  const { data } = await sb
.from("profiles")
.select("id,pseudo,avatar_url,verified,streak_days")
.in("id", Array.from(new Set(ids)));
  const map: Record<string, Profile> = {};
  for (const p of (data as Profile[])?? []) map[p.id] = p;
  return map;
}

/* ---- Prières ---- */

/** Le mur de prières. Renvoie `null` en cas d'ERREUR réseau/serveur, pour que
 * l'interface distingue « problème de connexion » d'un mur réellement vide. */
export async function listPrayers(): Promise<Prayer[] | null> {
  const sb = getSupabase();
  if (!sb) return [];
  // Les 60 plus récentes + TOUS les sujets épinglés (même anciens) : un sujet
  // épinglé par l'admin ne doit jamais disparaître du haut du mur.
  const [recent, pinned] = await Promise.all([
    sb.from("prayers").select("*").order("created_at", { ascending: false }).limit(60),
    sb.from("prayers").select("*").eq("pinned", true).limit(10),
  ]);
  if (recent.error) return null;
  const seen = new Set<string>();
  const prayers: Prayer[] = [];
  for (const p of [...(((pinned.data as Prayer[]) ?? [])), ...(((recent.data as Prayer[]) ?? []))]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      prayers.push(p);
    }
  }
  const profs = await profilesByIds(prayers.map((p) => p.author_id));
  // Les sujets épinglés (par un modérateur) remontent en tête, sans casser l'ordre.
  return prayers
.map((p) => ({...p, author: profs[p.author_id] }))
.sort((a, b) => Number(b.pinned?? false) - Number(a.pinned?? false));
}

/** Tous les sujets du mur pour le « Temps de prière » (bien au-delà des 60
 * récents du fil) : celui qui veut prier toute une journée doit pouvoir
 * descendre jusqu'aux sujets les plus anciens. RLS appliqué comme partout. */
export async function listPrayersForPrayerTime(): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
.from("prayers")
.select("*")
.eq("answered", false)
.order("created_at", { ascending: false })
.limit(500);
  const prayers = (data as Prayer[]) ?? [];
  const profs = await profilesByIds(prayers.map((p) => p.author_id));
  return prayers.map((p) => ({ ...p, author: profs[p.author_id] }));
}

/** Une prière précise (deep-link de notification) même si elle n'est plus dans
 * les 60 récentes du mur. RLS : visible seulement si on y a droit. */
export async function getPrayer(id: string): Promise<Prayer | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("prayers").select("*").eq("id", id).maybeSingle();
  const p = (data as Prayer) ?? null;
  if (!p) return null;
  const profs = await profilesByIds([p.author_id]);
  return { ...p, author: profs[p.author_id] };
}

/** Modérateur / admin : épingle / désépingle un sujet de prière. */
export async function setPrayerPinned(id: string, pinned: boolean) {
  const res = await getSupabase()?.rpc("set_prayer_pinned", { pid: id, val: pinned });
  if (res?.error) throw res.error;
}

/** Prières exaucées publiques (« témoignages »), les plus récentes. */
export async function listAnsweredPrayers(): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
.from("prayers")
.select("*")
.eq("answered", true)
.eq("visibility", "public")
.order("created_at", { ascending: false })
.limit(60);
  const prayers = (data as Prayer[])?? [];
  const profs = await profilesByIds(prayers.map((p) => p.author_id));
  return prayers.map((p) => ({...p, author: profs[p.author_id] }));
}

export async function listMyPrayers(userId: string): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
.from("prayers")
.select("*")
.eq("author_id", userId)
.order("created_at", { ascending: false });
  return (data as Prayer[])?? [];
}

/** Les sujets des AUTRES pour lesquels je prie (mes « Je prie » actifs),
 *  non exaucés, avec l'auteur — pour la section « Je prie pour… ». */
export async function listPrayingFor(userId: string, limit = 10): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data: rx } = await sb
.from("prayer_reactions")
.select("prayer_id")
.eq("user_id", userId)
.eq("type", "pray")
.order("created_at", { ascending: false })
.limit(50);
  const ids = ((rx as { prayer_id: string }[])?? []).map((r) => r.prayer_id);
  if (ids.length === 0) return [];
  const { data } = await sb
.from("prayers")
.select("*")
.in("id", ids)
.eq("answered", false)
.neq("author_id", userId)
.order("created_at", { ascending: false })
.limit(limit);
  const ps = (data as Prayer[])?? [];
  const profs = await profilesByIds(ps.map((p) => p.author_id));
  return ps.map((p) => ({...p, author: profs[p.author_id] }));
}

export async function createPrayer(
  body: string,
  visibility: Visibility,
  authorId: string,
  audioUrl?: string | null,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
.from("prayers")
.insert({ body, visibility, author_id: authorId, audio_url: audioUrl ?? null })
.select("id")
.single();
  return (data as { id: string } | null)?.id?? null;
}

export async function deletePrayer(id: string) {
  await getSupabase()?.from("prayers").delete().eq("id", id);
}

/** Marque une prière comme exaucée (« Dieu a agi ») ou la rouvre. */
export async function setPrayerAnswered(id: string, answered: boolean) {
  await getSupabase()?.from("prayers").update({ answered }).eq("id", id);
  // Une prière exaucée = moment de joie → la demande de note peut se montrer.
  if (answered) {
    try {
      window.dispatchEvent(new Event("jb:joy"));
    } catch {
      /* hors navigateur */
    }
  }
}

/* ---- Réactions ---- */
export async function reactionsFor(prayerIds: string[]): Promise<Reaction[]> {
  const sb = getSupabase();
  if (!sb || prayerIds.length === 0) return [];
  const { data } = await sb
.from("prayer_reactions")
.select("prayer_id,user_id,type")
.in("prayer_id", prayerIds);
  return (data as Reaction[])?? [];
}

export async function toggleReaction(
  prayerId: string,
  userId: string,
  type: string, // 'pray' | 'heart' | 'dove' | 'hands' | 'sparkles'
  on: boolean,
) {
  const sb = getSupabase();
  if (!sb) return;
  if (on) {
    await sb.from("prayer_reactions").insert({ prayer_id: prayerId, user_id: userId, type });
  } else {
    await sb
.from("prayer_reactions")
.delete()
.eq("prayer_id", prayerId)
.eq("user_id", userId)
.eq("type", type);
  }
}

/* ---- Commentaires ---- */
export async function listComments(prayerId: string): Promise<Comment[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
.from("prayer_comments")
.select("*")
.eq("prayer_id", prayerId)
.order("created_at", { ascending: true });
  const comments = (data as Comment[])?? [];
  const profs = await profilesByIds(comments.map((c) => c.author_id));
  return comments.map((c) => ({...c, author: profs[c.author_id] }));
}

/** Nombre d'encouragements (commentaires + réponses) par prière, en un appel. */
export async function commentCountsFor(prayerIds: string[]): Promise<Record<string, number>> {
  const sb = getSupabase();
  if (!sb || prayerIds.length === 0) return {};
  const { data } = await sb.from("prayer_comments").select("prayer_id").in("prayer_id", prayerIds);
  const counts: Record<string, number> = {};
  for (const r of (data as { prayer_id: string }[])?? []) {
    counts[r.prayer_id] = (counts[r.prayer_id]?? 0) + 1;
  }
  return counts;
}

export async function addComment(
  prayerId: string,
  body: string,
  authorId: string,
  parentId?: string | null,
  audioUrl?: string | null,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
.from("prayer_comments")
.insert({
      prayer_id: prayerId,
      body,
      author_id: authorId,
      parent_id: parentId?? null,
      ...(audioUrl? { audio_url: audioUrl }: {}),
    })
.select("id")
.single();
  if (error) return null;
  // Renvoie l'id du commentaire créé (chaîne truthy) ou null en cas d'échec ;
  // les appelants qui testent `if (id)` restent valides.
  return (data as { id: string } | null)?.id?? null;
}

export async function deleteComment(id: string) {
  await getSupabase()?.from("prayer_comments").delete().eq("id", id);
}

/* ---- Réactions sur les commentaires (appui long, façon WhatsApp) ---- */
export type CommentReaction = { comment_id: string; user_id: string; emoji: string };

/** Palette de réactions du mur : prière, amour, Saint-Esprit, louange, gloire. */
export const COMMENT_REACTIONS = ["🙏", "❤️", "🕊️", "🙌", "✨"];

export async function commentReactionsFor(commentIds: string[]): Promise<CommentReaction[]> {
  const sb = getSupabase();
  const uniq = Array.from(new Set(commentIds)).filter(Boolean);
  if (!sb || uniq.length === 0) return [];
  const { data } = await sb
.from("comment_reactions")
.select("comment_id,user_id,emoji")
.in("comment_id", uniq);
  return (data as CommentReaction[])?? [];
}

/** Pose (ou remplace) ma réaction sur un commentaire ; `null` = la retirer.
 * Une seule réaction par personne et par commentaire. */
export async function setCommentReaction(
  commentId: string,
  userId: string,
  emoji: string | null,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  if (emoji === null) {
    const { error } = await sb
.from("comment_reactions")
.delete()
.eq("comment_id", commentId)
.eq("user_id", userId);
    return !error;
  }
  const { error } = await sb
.from("comment_reactions")
.upsert({ comment_id: commentId, user_id: userId, emoji }, { onConflict: "comment_id,user_id" });
  return !error;
}

/** Téléverse une photo de profil et renvoie son URL publique. */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await sb.storage
.from("avatars")
.upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
  if (error) return null;
  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl?? null;
}

/* ---- Abonnements (follow) ---- */
export async function follow(followingId: string, followerId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("follows").insert({ follower_id: followerId, following_id: followingId });
}

export async function unfollow(followingId: string, followerId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb
.from("follows")
.delete()
.eq("follower_id", followerId)
.eq("following_id", followingId);
}

export async function isFollowing(followingId: string, followerId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data } = await sb
.from("follows")
.select("follower_id")
.eq("follower_id", followerId)
.eq("following_id", followingId)
.maybeSingle();
  return!!data;
}

/** { followers, following } pour un profil. */
export async function followCounts(userId: string): Promise<{ followers: number; following: number }> {
  const sb = getSupabase();
  if (!sb) return { followers: 0, following: 0 };
  const [{ count: followers }, { count: following }] = await Promise.all([
    sb.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    sb.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers?? 0, following: following?? 0 };
}

/** Recherche de membres par pseudo. */
export async function searchProfiles(query: string, limit = 20): Promise<Profile[]> {
  const sb = getSupabase();
  const q = query.trim();
  if (!sb || q.length < 2) return [];
  const { data } = await sb
.from("profiles")
.select("id,pseudo,avatar_url,verified")
.ilike("pseudo", `%${q}%`)
.limit(limit);
  return (data as Profile[])?? [];
}

/** Admin: envoie une notification à TOUS les membres (ex. live de prière).
 * Renvoie le nombre de membres notifiés, ou null en cas d'échec. */
export async function broadcastNotification(
  message: string,
  link?: string | null,
): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("broadcast_notification", {
    message: message.trim(),
    link: link?.trim() || null,
  });
  if (error) return null;
  return typeof data === "number"? data: 0;
}

/** Pseudos réservés à Pasteur Jack (toutes variantes _/-/espace/casse).
 * Seul un compte admin peut les utiliser. */
const RESERVED_PSEUDOS = [
  "jackbrnt",
  "jackbrunet",
  "pasteurjack",
  "pasteurjackbrunet",
  "pasteurjackbrnt",
  "jackbrunetofficiel",
  "pasteurbrunet",
];
export function isReservedPseudo(pseudo: string): boolean {
  const norm = pseudo.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return RESERVED_PSEUDOS.includes(norm);
}

/** Vrai si le pseudo est déjà pris par un AUTRE membre (insensible à la casse). */
export async function isPseudoTaken(pseudo: string, selfId: string): Promise<boolean> {
  const sb = getSupabase();
  const p = pseudo.trim();
  if (!sb ||!p) return false;
  const { data } = await sb
.from("profiles")
.select("id")
.ilike("pseudo", p)
.neq("id", selfId)
.limit(1);
  return ((data as { id: string }[])?? []).length > 0;
}

/** Profil correspondant exactement à un pseudo (insensible à la casse). */
export async function getProfileByPseudo(pseudo: string): Promise<Profile | null> {
  const sb = getSupabase();
  const p = pseudo.trim();
  if (!sb ||!p) return null;
  const { data } = await sb
.from("profiles")
.select("id,pseudo,avatar_url,verified")
.ilike("pseudo", p)
.limit(1)
.maybeSingle();
  return (data as Profile | null)?? null;
}

/** Extrait les pseudos mentionnés (@pseudo) d'un texte. */
export function extractMentions(text: string): string[] {
  const out = new Set<string>();
  // Pseudos: lettres/chiffres/_/-/accents/espace insécable exclus.
  const re = /@([\p{L}\p{N}_.-]{2,30})/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))!== null) out.add(m[1]);
  return Array.from(out);
}

/** Crée une notification « mention » pour chaque membre cité (@pseudo).
 *  Si la mention est dans un commentaire, `commentId` permet à la notif de
 *  pointer vers ce commentaire précis (sinon on ne pointe que vers le sujet). */
export async function notifyMentions(
  text: string,
  actorId: string,
  prayerId?: string | null,
  commentId?: string | null,
) {
  const sb = getSupabase();
  if (!sb) return;
  const pseudos = extractMentions(text);
  if (pseudos.length === 0) return;
  const { data } = await sb.from("profiles").select("id,pseudo").in("pseudo", pseudos);
  const targets = ((data as { id: string }[])?? []).map((r) => r.id).filter((id) => id!== actorId);
  await Promise.all(
    targets.map((target) => {
      // On n'envoie `cmt` que s'il existe : les mentions dans le corps d'un
      // sujet gardent l'appel à 2 arguments (compatible avant la migration).
      const args: Record<string, unknown> = { target, prayer: prayerId?? null };
      if (commentId) args.cmt = commentId;
      return sb.rpc("notify_mention", args).then(
        () => undefined,
        () => undefined,
      );
    }),
  );
}

/** Intercesseurs les plus actifs de la semaine (réactions « Je prie » +
 *  commentaires d'encouragement), avec leur profil. */
export type Intercessor = { profile: Profile; score: number };
export async function topIntercessors(days = 7, lim = 4): Promise<Intercessor[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("top_intercessors", { days, lim });
  if (error) return [];
  const rows = (data as { user_id: string; score: number }[])?? [];
  const profs = await profilesByIds(rows.map((r) => r.user_id));
  return rows
.filter((r) => profs[r.user_id])
.map((r) => ({ profile: profs[r.user_id], score: Number(r.score) }));
}

/** Ids des membres auxquels je suis abonné. */
export async function listFollowingIds(userId: string): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("follows").select("following_id").eq("follower_id", userId);
  return ((data as { following_id: string }[])?? []).map((r) => r.following_id);
}

/** Profils des membres qui me suivent (abonnés). */
export async function listFollowers(userId: string): Promise<Profile[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("follows").select("follower_id").eq("following_id", userId);
  const ids = ((data as { follower_id: string }[])?? []).map((r) => r.follower_id);
  const map = await profilesByIds(ids);
  return ids.map((id) => map[id]).filter(Boolean) as Profile[];
}

/** Profils des membres que je suis (abonnements). */
export async function listFollowing(userId: string): Promise<Profile[]> {
  const ids = await listFollowingIds(userId);
  const map = await profilesByIds(ids);
  return ids.map((id) => map[id]).filter(Boolean) as Profile[];
}

/** Retire un abonné (force quelqu'un à ne plus me suivre). */
export async function removeFollower(followerId: string, userId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("follows").delete().eq("follower_id", followerId).eq("following_id", userId);
}

/** Suggestions de membres à suivre (intercesseurs), façon Instagram:
 * on exclut soi-même et les personnes déjà suivies. */
export async function suggestedProfiles(userId: string, limit = 12): Promise<Profile[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const exclude = new Set(await listFollowingIds(userId));
  exclude.add(userId);
  const { data } = await sb
.from("profiles")
.select("id,pseudo,avatar_url,bio,verified")
.limit(200);
  const candidates = ((data as Profile[])?? []).filter((p) =>!exclude.has(p.id));
  if (candidates.length === 0) return [];

  // Score d'activité (proxy), même pondération que les grades: publier compte
  // le plus, puis encourager. 2 requêtes légères (RLS: activité visible).
  const ids = new Set(candidates.map((c) => c.id));
  const score: Record<string, number> = {};
  const [{ data: pr }, { data: cm }] = await Promise.all([
    sb.from("prayers").select("author_id").limit(2000),
    sb.from("prayer_comments").select("author_id").limit(4000),
  ]);
  for (const r of (pr as { author_id: string }[])?? []) {
    if (ids.has(r.author_id)) score[r.author_id] = (score[r.author_id]?? 0) + 5;
  }
  for (const r of (cm as { author_id: string }[])?? []) {
    if (ids.has(r.author_id)) score[r.author_id] = (score[r.author_id]?? 0) + 2;
  }

  // Ordre stable dans chaque groupe : les plus actifs d'abord.
  const stable = (a: Profile, b: Profile) =>
    (score[b.id]?? 0) - (score[a.id]?? 0) || a.pseudo.localeCompare(b.pseudo);
  const withPhoto = candidates.filter((p) => p.avatar_url).sort(stable);
  const noPhoto = candidates.filter((p) =>!p.avatar_url).sort(stable);

  // Rotation QUOTIDIENNE : chaque jour, une « fenêtre » différente parmi les
  // profils avec photo (priorité), pour ne pas toujours montrer les mêmes.
  // Une fois tous les profils avec photo épuisés, le cycle recommence au début.
  const day = Math.floor(Date.now() / 86_400_000);
  const rotate = (arr: Profile[]): Profile[] => {
    if (arr.length <= limit) return arr;
    const start = (day * limit) % arr.length;
    return [...arr.slice(start), ...arr.slice(0, start)];
  };
  // S'il manque des profils avec photo pour remplir, on complète (aussi en
  // rotation) avec les autres membres actifs.
  return [...rotate(withPhoto), ...rotate(noPhoto)].slice(0, limit);
}

/** Fil des prières des membres que je suis (+ les miennes).
 * Renvoie `null` en cas d'erreur réseau/serveur (≠ fil réellement vide). */
export async function listFollowingFeed(userId: string): Promise<Prayer[] | null> {
  const sb = getSupabase();
  if (!sb) return [];
  const ids = await listFollowingIds(userId);
  const authors = Array.from(new Set([...ids, userId]));
  const { data, error } = await sb
.from("prayers")
.select("*")
.in("author_id", authors)
.order("created_at", { ascending: false })
.limit(60);
  if (error) return null;
  const prayers = (data as Prayer[])?? [];
  const profs = await profilesByIds(prayers.map((p) => p.author_id));
  return prayers.map((p) => ({...p, author: profs[p.author_id] }));
}

/** Activité (pour le grade de prière). */
export async function getActivity(
  userId: string,
): Promise<{ prayers: number; comments: number; prays: number }> {
  const sb = getSupabase();
  if (!sb) return { prayers: 0, comments: 0, prays: 0 };
  const { data } = await sb.rpc("user_activity", { uid: userId });
  const row = Array.isArray(data)? data[0]: data;
  return {
    prayers: row?.prayers?? 0,
    comments: row?.comments?? 0,
    prays: row?.prays?? 0,
  };
}

/** Grade de prière (« Intercesseur », « Guerrier »…) par auteur, pour le mur.
 * 3 requêtes groupées pour TOUS les auteurs à la fois (au lieu d'un appel RPC
 * par membre — jusqu'à 60 requêtes par chargement du mur auparavant). */
export async function gradesFor(ids: string[]): Promise<Record<string, string>> {
  const sb = getSupabase();
  const uniq = Array.from(new Set(ids));
  if (!sb || uniq.length === 0) return {};
  try {
    const [pr, cm, rx] = await Promise.all([
      sb.from("prayers").select("author_id").in("author_id", uniq).limit(4000),
      sb.from("prayer_comments").select("author_id").in("author_id", uniq).limit(8000),
      sb.from("prayer_reactions").select("user_id").eq("type", "pray").in("user_id", uniq).limit(8000),
    ]);
    const acc: Record<string, { prayers: number; comments: number; prays: number }> = {};
    const bump = (id: string, k: "prayers" | "comments" | "prays") => {
      (acc[id] ??= { prayers: 0, comments: 0, prays: 0 })[k] += 1;
    };
    for (const r of ((pr.data as { author_id: string }[]) ?? [])) bump(r.author_id, "prayers");
    for (const r of ((cm.data as { author_id: string }[]) ?? [])) bump(r.author_id, "comments");
    for (const r of ((rx.data as { user_id: string }[]) ?? [])) bump(r.user_id, "prays");
    const out: Record<string, string> = {};
    for (const id of uniq) out[id] = gradeFor(acc[id] ?? { prayers: 0, comments: 0, prays: 0 }).grade.name;
    return out;
  } catch {
    return {};
  }
}

/* ---- Notifications ---- */

/**
 * Destination du clic sur une notification. On ouvre directement le bon
 * contenu :
 *  - lien explicite fourni par le serveur (priorité) ;
 *  - notif liée à un sujet de prière (commentaire, mention, 🙏/❤️, réponse) →
 *    /communaute?prayer=<id> : la carte s'ouvre sur les commentaires ;
 *  - message privé → /messages ;
 *  - sinon le profil de l'auteur.
 * La même logique est répliquée côté serveur (edge notify-push) pour les
 * notifications push (démarrage à froid).
 */
export function notifHref(n: Notification): string | null {
  if (n.link && n.link.startsWith("/")) return n.link;
  if (n.prayer_id)
    return `/communaute/?prayer=${n.prayer_id}${n.comment_id ? `&c=${n.comment_id}` : ""}`;
  if (n.type === "message") return n.actor_id ? `/messages/?u=${n.actor_id}` : "/messages/";
  if (n.actor_id && n.type !== "admin") return `/membre/?u=${n.actor_id}`;
  return null;
}

export async function listNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
.from("notifications")
.select("*")
.eq("user_id", userId)
.order("created_at", { ascending: false })
.limit(limit);
  const notifs = (data as Notification[])?? [];
  const profs = await profilesByIds(notifs.map((n) => n.actor_id).filter(Boolean) as string[]);
  return notifs.map((n) => ({...n, actor: n.actor_id? profs[n.actor_id]: undefined }));
}

export async function unreadCount(userId: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { count } = await sb
.from("notifications")
.select("*", { count: "exact", head: true })
.eq("user_id", userId)
.eq("read", false);
  return count?? 0;
}

export async function markNotificationsRead(userId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

/** Prières visibles d'un membre donné (RLS filtre public / abonnés). */
export async function listPrayersByAuthor(authorId: string): Promise<Prayer[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
.from("prayers")
.select("*")
.eq("author_id", authorId)
.order("created_at", { ascending: false })
.limit(60);
  return (data as Prayer[])?? [];
}
