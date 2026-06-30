"use client";

import Link from "next/link";

/** Affiche un texte en transformant les mentions @pseudo en liens cliquables
 *  vers le profil du membre cité. */
export function MentionText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(@[\p{L}\p{N}_.-]{2,30})/gu);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("@") && part.length > 1) {
          const pseudo = part.slice(1);
          return (
            <Link
              key={i}
              href={`/membre?pseudo=${encodeURIComponent(pseudo)}`}
              className="font-semibold text-spirit-600 hover:underline"
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
