"use client";

import { useEffect, useState } from "react";
import { connexionNative, connexionSocialeDispo } from "@/lib/social-auth";

/**
 * Boutons « Continuer avec Apple / Google » de l'app native. Présentation
 * conforme aux guides des deux marques : bouton Apple noir (ou blanc sur
 * fond sombre) avec le logo Apple, bouton Google blanc avec le « G »
 * officiel, même taille et même place l'un que l'autre (règle Apple 4.8).
 * Ne s'affichent que si le binaire installé contient le plugin et que les
 * identifiants sont configurés ; sinon rien (la connexion e-mail suffit).
 */

export function GoogleG({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export function AppleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
      <path d="M16.37 1.43c.06.83-.27 1.65-.78 2.25-.55.64-1.45 1.13-2.32 1.06-.08-.8.3-1.64.8-2.18.56-.62 1.52-1.09 2.3-1.13zM19.6 17.2c-.4.93-.6 1.34-1.12 2.16-.72 1.15-1.74 2.58-3 2.59-1.12.01-1.41-.73-2.93-.72-1.52 0-1.84.73-2.96.73-1.26.01-2.22-1.3-2.95-2.44-2.02-3.2-2.23-6.96-.99-8.95.88-1.42 2.27-2.25 3.58-2.25 1.33 0 2.17.73 3.27.73 1.07 0 1.72-.73 3.26-.73 1.16 0 2.39.63 3.27 1.72-2.87 1.57-2.41 5.67.5 6.89z" />
    </svg>
  );
}

export function SocialAuthButtons({ tone = "light", onSuccess }: { tone?: "light" | "dark"; onSuccess?: () => void }) {
  const [dispo, setDispo] = useState({ google: false, apple: false });
  const [occupe, setOccupe] = useState<"google" | "apple" | null>(null);
  const [erreur, setErreur] = useState("");
  const dark = tone === "dark";

  useEffect(() => setDispo(connexionSocialeDispo()), []);
  if (!dispo.google && !dispo.apple) return null;

  async function go(f: "google" | "apple") {
    setErreur("");
    setOccupe(f);
    try {
      const ok = await connexionNative(f);
      if (ok) onSuccess?.();
    } catch {
      setErreur(`La connexion avec ${f === "google" ? "Google" : "Apple"} n'a pas abouti. Réessaie, ou utilise ton e-mail.`);
    } finally {
      setOccupe(null);
    }
  }

  return (
    <div className="space-y-3">
      {dispo.apple ? (
        <button
          type="button"
          onClick={() => go("apple")}
          disabled={!!occupe}
          className={`flex h-12 w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-60 ${
            dark ? "bg-white text-black" : "bg-black text-white"
          }`}
        >
          <AppleLogo className="-mt-0.5 h-5 w-5" />
          {occupe === "apple" ? "Connexion…" : "Continuer avec Apple"}
        </button>
      ) : null}
      {dispo.google ? (
        <button
          type="button"
          onClick={() => go("google")}
          disabled={!!occupe}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#747775] bg-white text-[15px] font-semibold text-[#1F1F1F] transition-opacity disabled:opacity-60"
        >
          <GoogleG />
          {occupe === "google" ? "Connexion…" : "Continuer avec Google"}
        </button>
      ) : null}
      {erreur ? <p className="field-error text-center">{erreur}</p> : null}
      <div className={`flex items-center gap-3 py-1 text-xs ${dark ? "text-cream/45" : "text-night-900/45"}`}>
        <span className={`h-px flex-1 ${dark ? "bg-white/15" : "bg-night-900/10"}`} />
        ou avec ton e-mail
        <span className={`h-px flex-1 ${dark ? "bg-white/15" : "bg-night-900/10"}`} />
      </div>
    </div>
  );
}
