"use client";

import { useEffect, useState } from "react";

/**
 * Filet de sécurité global: si une exception client survient (ex. un ancien
 * cache du service worker qui référence des fichiers JS supprimés après un
 * déploiement), on purge les caches + le service worker et on recharge.
 * Évite l'écran blanc « Application error ».
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [healing, setHealing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function heal() {
      // Purge caches + service workers (corrige les caches obsolètes).
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
        /* ignore */
      }
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch {
        /* ignore */
      }

      // Un seul rechargement automatique (anti-boucle).
      try {
        const KEY = "jb.autoReloaded";
        if (!sessionStorage.getItem(KEY)) {
          sessionStorage.setItem(KEY, "1");
          window.location.reload();
          return;
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setHealing(false);
    }

    heal();
    return () => {
      cancelled = true;
    };
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#f7f6f1",
          color: "#1a1726",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
            Mise à jour de l&apos;application…
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.7, margin: "0 0 20px" }}>
            {healing
? "Un instant, on rafraîchit la page avec la dernière version."
: "Si la page ne se recharge pas toute seule, touche le bouton ci-dessous."}
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem("jb.autoReloaded");
              } catch {
                /* ignore */
              }
              reset();
              window.location.reload();
            }}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "12px 22px",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg,#7c5cff,#b06cff)",
              cursor: "pointer",
            }}
          >
            Recharger la page
          </button>
        </div>
      </body>
    </html>
  );
}
