"use client";

import { openExternal } from "@/lib/external";

const URL_RE = /(https?:\/\/[^\s]+)/g;
const isUrl = (s: string) => /^https?:\/\//.test(s);

/**
 * Affiche un texte en rendant les liens (http/https) cliquables. Un clic ouvre
 * le lien directement (navigateur système / in-app), sans quitter le contexte.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(URL_RE);
  return (
    <p className={className} style={{ whiteSpace: "pre-wrap" }}>
      {parts.map((part, i) =>
        isUrl(part) ? (
          <a
            key={i}
            href={part}
            onClick={(e) => {
              e.preventDefault();
              openExternal(part);
            }}
            className="break-all font-semibold text-dawn-600 underline underline-offset-2"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}
