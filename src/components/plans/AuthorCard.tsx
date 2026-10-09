"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_AUTHOR, type AuthorInfo } from "@/config/author";
import { getSupabase } from "@/lib/supabase";
import { getProfileByPseudo } from "@/lib/community";

/** Ressource « boutique » : mise en avant (halo) pour que l'auteur vende ses produits. */
const estBoutique = (r: { label: string; url: string }) => /boutique|shop|store|loja/i.test(`${r.label} ${r.url}`);

/**
 * Profil de l'auteur dans l'app (pour « voir son profil ») : Pasteur Jack =
 * son compte vérifié ; les autres auteurs = le membre qui porte leur nom.
 */
async function trouverProfilAuteur(nom: string): Promise<string | null> {
  if (nom === DEFAULT_AUTHOR.name) {
    const sb = getSupabase();
    if (!sb) return null;
    const { data } = await sb
      .from("profiles")
      .select("id")
      .eq("verified", true)
      .or("pseudo.ilike.%jack%,pseudo.ilike.%brunet%")
      .limit(1);
    return (data as { id: string }[] | null)?.[0]?.id ?? null;
  }
  return (await getProfileByPseudo(nom))?.id ?? null;
}

/** Icône sac (boutique), en trait. */
function SacIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
      <path d="M5 8h14l-1 12H6L5 8z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

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
  const [profilId, setProfilId] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    let actif = true;
    trouverProfilAuteur(author.name)
      .then((id) => actif && setProfilId(id))
      .catch(() => undefined);
    return () => {
      actif = false;
    };
  }, [open, author.name]);

  if (!open) return null;
  const lienProfil = profilId ? `/membre?u=${profilId}` : null;

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
          {lienProfil ? (
            <Link href={lienProfil} onClick={onClose} aria-label="Voir son profil dans l'app" className="shrink-0">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={author.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-dawn-400/70" />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-spirit-500 font-display text-xl font-extrabold text-cream ring-2 ring-dawn-400/70">
                  {author.name.replace(/^Pasteur\s+/i, "").slice(0, 1)}
                </span>
              )}
            </Link>
          ) : photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={author.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-dawn-400/70" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-spirit-500 font-display text-xl font-extrabold text-cream ring-2 ring-dawn-400/70">
              {author.name.replace(/^Pasteur\s+/i, "").slice(0, 1)}
            </span>
          )}
          <div className="min-w-0">
            {lienProfil ? (
              <Link href={lienProfil} onClick={onClose} className="group inline-flex items-center gap-1.5">
                <span className="font-display text-xl font-extrabold underline-offset-4 group-hover:underline">{author.name}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current text-cream/50" strokeWidth={2.2} aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ) : (
              <p className="font-display text-xl font-extrabold">{author.name}</p>
            )}
            {author.role ? <p className="text-sm text-dawn-300">{author.role}</p> : null}
            {lienProfil ? (
              <Link href={lienProfil} onClick={onClose} className="mt-0.5 inline-block text-[12.5px] font-semibold text-cream/55 underline underline-offset-2">
                Voir son profil dans l&apos;app
              </Link>
            ) : null}
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
                estBoutique(r) ? (
                  r.url.startsWith("/") ? (
                    <Link key={r.label} href={r.url} onClick={onClose} className="halo-boutique inline-flex items-center gap-1.5 rounded-full border border-dawn-400 bg-dawn-400/10 px-4 py-2 text-sm font-bold text-dawn-400">
                      <SacIcon className="h-4 w-4" />
                      {r.label}
                    </Link>
                  ) : (
                    <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" className="halo-boutique inline-flex items-center gap-1.5 rounded-full border border-dawn-400 bg-dawn-400/10 px-4 py-2 text-sm font-bold text-dawn-400">
                      <SacIcon className="h-4 w-4" />
                      {r.label}
                    </a>
                  )
                ) : r.url.startsWith("/") ? (
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
