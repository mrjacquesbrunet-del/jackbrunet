"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { getProfile, isAdminEmail, type Profile } from "@/lib/community";
import { submitToBrevo } from "@/lib/brevo";
import { newsletterEndpointForSource } from "@/config/brevo";
import { linkOneSignalUser, unlinkOneSignalUser } from "@/lib/onesignal";

// Partagé entre toutes les instances du hook: on n'associe l'appareil au
// compte OneSignal qu'une seule fois par utilisateur.
let lastLinkedUser: string | null = null;

/**
 * Capture automatique des membres de l'app dans Brevo: à chaque connexion
 * (email magic-link OU Google), on enregistre l'email (+ le pseudo dès qu'il
 * est connu) dans la liste « Membres de l'app ». Une seule fois par signature
 * email|pseudo (évite les envois répétés). Aucune clé API exposée.
 */
function syncMemberToBrevo(email: string | null, pseudo: string | null) {
  if (!email) return;
  try {
    const sig = `${email}|${pseudo?? ""}`;
    if (localStorage.getItem("jb.brevo.member") === sig) return;
    const endpoint = newsletterEndpointForSource("app-membre");
    if (!endpoint) return;
    submitToBrevo(endpoint, { EMAIL: email, NOM: pseudo?? "" })
.then(() => localStorage.setItem("jb.brevo.member", sig))
.catch(() => {});
  } catch {
    /* ignore */
  }
}

export function useAuth() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async (id: string | null) => {
    setProfile(id? await getProfile(id): null);
  }, []);

  useEffect(() => {
    let sb;
    try {
      sb = getSupabase();
    } catch {
      sb = null;
    }
    if (!sb) {
      setReady(true);
      return;
    }
    try {
      sb.auth
.getSession()
.then(({ data }) => {
          const u = data.session?.user;
          setUserId(u?.id?? null);
          setEmail(u?.email?? null);
          refreshProfile(u?.id?? null).finally(() => setReady(true));
        })
.catch(() => setReady(true));
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
        const u = session?.user;
        setUserId(u?.id?? null);
        setEmail(u?.email?? null);
        refreshProfile(u?.id?? null);
      });
      return () => sub.subscription.unsubscribe();
    } catch {
      setReady(true);
    }
  }, [refreshProfile]);

  // Synchronise le membre connecté vers Brevo (email immédiat, nom dès connu).
  useEffect(() => {
    syncMemberToBrevo(email, profile?.pseudo?? null);
  }, [email, profile?.pseudo]);

  // Associe/dissocie l'appareil au compte pour les notifications push ciblées.
  useEffect(() => {
    if (userId) {
      if (lastLinkedUser!== userId) {
        lastLinkedUser = userId;
        linkOneSignalUser(userId);
      }
    } else if (lastLinkedUser) {
      lastLinkedUser = null;
      unlinkOneSignalUser();
    }
  }, [userId]);

  const isAdmin = isAdminEmail(email);
  // Modérateur global: admin, ou profil marqué is_moderator par l'admin.
  const isModerator = isAdmin || !!profile?.is_moderator;

  return { ready, userId, email, profile, isAdmin, isModerator, refreshProfile: () => refreshProfile(userId) };
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
.trim()
.split(/\s+/)
.slice(0, 2)
.map((w) => w[0]?.toUpperCase()?? "")
.join("");
}
