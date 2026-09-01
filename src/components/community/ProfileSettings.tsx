"use client";

import { useEffect, useState } from "react";
import { useSoaking } from "@/lib/soaking";
import { NOTIF_GROUPS, loadNotifPrefs, saveNotifPrefs, type NotifPrefs } from "@/lib/notif-prefs";
import { ReminderToggle } from "@/components/pwa/ReminderToggle";
import { DeleteAccountButton } from "@/components/community/DeleteAccountButton";
import { signOut } from "@/lib/community";
import { openExternal } from "@/lib/external";
import { siteConfig } from "@/config/site";
import { isNativeApp } from "@/lib/notifications";

/**
 * PARAMÈTRES — écran plein écran du profil, organisé en sections nettes
 * (notifications par type, sons, rappel quotidien, compte, termes),
 * dans la charte nuit + lime.
 */

/** Interrupteur lime, gros et net. */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-dawn-400" : "bg-white/15"}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[1.375rem]" : "left-0.5"}`}
      />
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-7 flex items-center gap-3">
      <p className="shrink-0 text-[11px] font-black uppercase tracking-[0.22em] text-dawn-300">{children}</p>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function ProfileSettings({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const soaking = useSoaking();
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    loadNotifPrefs(userId).then(setPrefs);
    (async () => {
      try {
        if (!isNativeApp()) return;
        const { App } = await import("@capacitor/app");
        const info = await App.getInfo();
        setVersion(`${info.version} (${info.build})`);
      } catch {
        /* web */
      }
    })();
  }, [userId]);

  function setPref(key: keyof NotifPrefs, v: boolean) {
    setPrefs((p) => {
      const next = { ...(p ?? {}), [key]: v };
      void saveNotifPrefs(userId, next);
      return next;
    });
  }

  return (
    <div className="dark-ctx fixed inset-0 z-[115] flex flex-col bg-night-950 text-cream" role="dialog" aria-modal>
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <p className="font-display text-xl font-extrabold tracking-wide">Paramètres</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream/80"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        {/* ---------- Notifications push, par type ---------- */}
        <SectionTitle>Notifications push</SectionTitle>
        <p className="mt-1.5 text-xs text-cream/50">
          Choisis ce qui arrive sur ton téléphone. La cloche dans l&apos;app garde tout.
        </p>
        <div className="mt-3 space-y-1.5">
          {NOTIF_GROUPS.map((g) => (
            <div key={g.key} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{g.label}</p>
                <p className="text-[11px] text-cream/50">{g.detail}</p>
              </div>
              <Toggle
                on={prefs ? prefs[g.key] !== false : true}
                onChange={(v) => setPref(g.key, v)}
                label={g.label}
              />
            </div>
          ))}
        </div>

        {/* ---------- Rappel quotidien ---------- */}
        <SectionTitle>Rappel quotidien</SectionTitle>
        <div className="mt-3">
          <ReminderToggle />
        </div>

        {/* ---------- Sons ---------- */}
        <SectionTitle>Musique &amp; sons</SectionTitle>
        <div className="mt-3 rounded-2xl bg-white/[0.05] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold">Volume de la musique de méditation</p>
            <span className="text-[11px] font-semibold text-cream/50">{Math.round(soaking.volume * 100)}%</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-cream/60" strokeWidth={1.8} aria-hidden>
              <path d="M4 10v4h3l4 4V6L7 10H4z" strokeLinejoin="round" />
              <path d="M15 9a4 4 0 0 1 0 6" strokeLinecap="round" />
            </svg>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(soaking.volume * 100)}
              onChange={(e) => soaking.setVolume(Number(e.target.value) / 100)}
              className="w-full accent-[#CAF000]"
              aria-label="Volume de la musique"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-cream/45">
            S&apos;applique à la Bible, au soaking et à Scrolle &amp; prie.
          </p>
        </div>

        {/* ---------- Compte ---------- */}
        <SectionTitle>Compte</SectionTitle>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full rounded-full border border-white/15 py-3 text-sm font-bold text-cream/80"
          >
            Se déconnecter
          </button>
          <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-300/80">Zone sensible</p>
            <div className="mt-2">
              <DeleteAccountButton />
            </div>
          </div>
        </div>

        {/* ---------- Termes ---------- */}
        <SectionTitle>Termes</SectionTitle>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => openExternal(`${siteConfig.url}/confidentialite`)}
            className="w-full rounded-full bg-white/[0.06] py-3 text-sm font-bold text-cream/85"
          >
            Politique de confidentialité
          </button>
          <button
            type="button"
            onClick={() => openExternal(`${siteConfig.url}/mentions-legales`)}
            className="w-full rounded-full bg-white/[0.06] py-3 text-sm font-bold text-cream/85"
          >
            Mentions légales
          </button>
        </div>

        {version ? (
          <p className="mt-8 text-center text-[11px] text-cream/35">Version {version}</p>
        ) : null}
      </div>
    </div>
  );
}
