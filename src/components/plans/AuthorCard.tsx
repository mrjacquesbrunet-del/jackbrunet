"use client";

import Link from "next/link";
import type { AuthorInfo } from "@/config/author";

/** Icône Instagram (trait). */
function InstaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/**
 * Fiche de présentation de l'auteur (photo, rôle, bio, Instagram, ressources),
 * ouverte au clic sur le nom de l'auteur d'un plan.
 */
export function AuthorCard({
  open,
  onClose,
  author,
  photo,
}: {
  open: boolean;
  onClose: () => void;
  author: AuthorInfo;
  photo?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-white/10 bg-night-900 p-6 text-cream shadow-card sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-cream"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex items-center gap-4">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={author.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-dawn-400/70" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-spirit-500 font-display text-xl font-extrabold text-cream ring-2 ring-dawn-400/70">
              {author.name.slice(0, 1)}
            </span>
          )}
          <div>
            <p className="font-display text-xl font-extrabold">{author.name}</p>
            {author.role ? <p className="text-sm text-dawn-300">{author.role}</p> : null}
          </div>
        </div>

        {author.bio ? <p className="mt-4 text-[15px] leading-relaxed text-cream/80">{author.bio}</p> : null}

        {author.instagram ? (
          <a
            href={author.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dawn-400 px-5 py-3 text-sm font-bold text-night-950"
          >
            <InstaIcon className="h-5 w-5" />
            Suivre sur Instagram
          </a>
        ) : null}

        {author.resources.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-cream/45">Ses ressources</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {author.resources.map((r) =>
                r.url.startsWith("/") ? (
                  <Link
                    key={r.label}
                    href={r.url}
                    onClick={onClose}
                    className="rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold text-cream/85"
                  >
                    {r.label}
                  </Link>
                ) : (
                  <a
                    key={r.label}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold text-cream/85"
                  >
                    {r.label}
                  </a>
                )
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
