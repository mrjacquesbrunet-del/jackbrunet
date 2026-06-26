"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { getProfile, type Profile } from "@/lib/community";

export function useAuth() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async (id: string | null) => {
    setProfile(id ? await getProfile(id) : null);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUserId(u?.id ?? null);
      setEmail(u?.email ?? null);
      refreshProfile(u?.id ?? null).finally(() => setReady(true));
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      setUserId(u?.id ?? null);
      setEmail(u?.email ?? null);
      refreshProfile(u?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshProfile]);

  return { ready, userId, email, profile, refreshProfile: () => refreshProfile(userId) };
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
