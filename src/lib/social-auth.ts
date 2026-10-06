"use client";

import { Capacitor } from "@capacitor/core";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { isPseudoTaken } from "./community";
import { APP_BUNDLE_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/config/auth";

/**
 * Connexion Google / Apple NATIVE (feuille système, sans navigateur), puis
 * session Supabase via signInWithIdToken. Exigences des stores :
 *  - Apple (règle 4.8) : si l'app propose Google, elle doit aussi proposer
 *    « Se connecter avec Apple » sur iOS ;
 *  - Google refuse l'OAuth dans une WebView : d'où le SDK natif.
 * Les boutons n'apparaissent que si le plugin est présent dans le binaire
 * installé (build store) et que les identifiants sont configurés.
 */

type Fournisseur = "google" | "apple";

export function connexionSocialeDispo(): { google: boolean; apple: boolean } {
  try {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("SocialLogin")) {
      return { google: false, apple: false };
    }
    const ios = Capacitor.getPlatform() === "ios";
    return {
      google: !!GOOGLE_WEB_CLIENT_ID && (!ios || !!GOOGLE_IOS_CLIENT_ID),
      apple: ios,
    };
  } catch {
    return { google: false, apple: false };
  }
}

let initialise = false;
async function plugin() {
  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  if (!initialise) {
    const ios = Capacitor.getPlatform() === "ios";
    await SocialLogin.initialize({
      ...(GOOGLE_WEB_CLIENT_ID
        ? {
            google: {
              webClientId: GOOGLE_WEB_CLIENT_ID,
              ...(ios && GOOGLE_IOS_CLIENT_ID ? { iOSClientId: GOOGLE_IOS_CLIENT_ID, iOSServerClientId: GOOGLE_WEB_CLIENT_ID } : {}),
              mode: "online" as const,
            },
          }
        : {}),
      ...(ios ? { apple: { clientId: APP_BUNDLE_ID } } : {}),
    });
    initialise = true;
  }
  return SocialLogin;
}

/** Nonce : la version hachée (SHA-256) part chez Google/Apple et se retrouve
 * dans le jeton ; la version brute est donnée à Supabase qui compare. */
async function nonces(): Promise<{ brut: string; hache: string }> {
  const octets = crypto.getRandomValues(new Uint8Array(32));
  const brut = Array.from(octets, (b) => b.toString(16).padStart(2, "0")).join("");
  const empreinte = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(brut));
  const hache = Array.from(new Uint8Array(empreinte), (b) => b.toString(16).padStart(2, "0")).join("");
  return { brut, hache };
}

/** Connexion native. Renvoie false si l'utilisateur a annulé. */
export async function connexionNative(fournisseur: Fournisseur): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) throw new Error("non configuré");
  const SocialLogin = await plugin();
  const { brut, hache } = await nonces();
  let idToken: string | null = null;
  let prenom: string | null = null;
  let nom: string | null = null;
  let photo: string | null = null;
  try {
    if (fournisseur === "google") {
      const r = await SocialLogin.login({ provider: "google", options: { scopes: ["email", "profile"], nonce: hache } });
      const res = r.result as { idToken?: string | null; profile?: { givenName?: string | null; familyName?: string | null; imageUrl?: string | null } };
      idToken = res.idToken ?? null;
      prenom = res.profile?.givenName ?? null;
      nom = res.profile?.familyName ?? null;
      photo = res.profile?.imageUrl ?? null;
    } else {
      const r = await SocialLogin.login({ provider: "apple", options: { scopes: ["email", "name"], nonce: hache } });
      idToken = r.result.idToken ?? null;
      // Apple ne donne le nom QU'À LA PREMIÈRE connexion : on le garde tout de suite.
      prenom = r.result.profile?.givenName ?? null;
      nom = r.result.profile?.familyName ?? null;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/cancel|annul|1001|12501/i.test(msg)) return false;
    throw e;
  }
  if (!idToken) throw new Error("Jeton de connexion manquant.");
  const { data, error } = await sb.auth.signInWithIdToken({ provider: fournisseur, token: idToken, nonce: brut });
  if (error) throw error;
  if (data.user && (prenom || photo)) {
    try {
      await sb.auth.updateUser({
        data: {
          ...(prenom ? { first_name: prenom, full_name: [prenom, nom].filter(Boolean).join(" ") } : {}),
          ...(photo ? { avatar_url: photo } : {}),
        },
      });
    } catch {
      /* best-effort */
    }
  }
  if (data.user) await completerProfilSocial(data.user, { prenom, photo });
  return true;
}

const dejaFait = new Set<string>();

/**
 * Après une connexion Google ou Apple (native ou web) : reprend la photo
 * Google et le prénom pour le profil, SANS écraser ce que la personne a
 * déjà choisi (photo existante, pseudo personnalisé).
 */
export async function completerProfilSocial(user: User, extra?: { prenom?: string | null; photo?: string | null }): Promise<void> {
  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [user.app_metadata?.provider as string];
  if (!providers.some((p) => p === "google" || p === "apple")) return;
  if (dejaFait.has(user.id) && !extra) return;
  dejaFait.add(user.id);
  const sb = getSupabase();
  if (!sb) return;
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const photo = extra?.photo || meta.avatar_url || meta.picture || null;
  const prenom = (extra?.prenom || meta.first_name || meta.given_name || (meta.full_name || meta.name || "").split(" ")[0] || "").trim();
  const { data: p } = await sb.from("profiles").select("pseudo,avatar_url").eq("id", user.id).maybeSingle();
  if (!p) return;
  const patch: { avatar_url?: string; pseudo?: string } = {};
  if (!p.avatar_url && photo) patch.avatar_url = photo;
  const prefixe = (user.email ?? "").split("@")[0];
  const pseudoParDefaut = !p.pseudo || p.pseudo === "Ami(e)" || p.pseudo === prefixe;
  if (prenom && pseudoParDefaut) {
    let pseudo = prenom;
    try {
      if (await isPseudoTaken(pseudo, user.id)) pseudo = `${prenom}${Math.floor(Math.random() * 900 + 100)}`;
    } catch {
      /* on garde le prénom */
    }
    patch.pseudo = pseudo;
  }
  if (Object.keys(patch).length) await sb.from("profiles").update(patch).eq("id", user.id);
}

/** Déconnexion côté plugin (pour pouvoir choisir un autre compte Google ensuite). */
export async function deconnexionSociale(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("SocialLogin") || !initialise) return;
    const { SocialLogin } = await import("@capgo/capacitor-social-login");
    await SocialLogin.logout({ provider: "google" }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}
