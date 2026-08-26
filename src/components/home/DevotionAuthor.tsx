"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { asset } from "@/lib/asset";
import { AuthorCard } from "@/components/plans/AuthorCard";
import { DEFAULT_AUTHOR, type AuthorInfo, type AuthorResource } from "@/config/author";

/** Photos candidates de Jack (Supabase « audiovf »), comme sur les plans. */
const JACK_PHOTOS = (() => {
  const sb = getSupabase();
  if (!sb) return [] as string[];
  return ["auteurjack.jpg", "auteurjack.png", "pasteur-jack.jpg"].map(
    (n) => sb.storage.from("audiovf").getPublicUrl(n).data.publicUrl,
  );
})();

export type DevotionAuthorFields = {
  author?: string;
  authorRole?: string;
  authorBio?: string;
  authorInstagram?: string;
  authorPhoto?: string;
  authorResources?: AuthorResource[];
};

/**
 * Signature « Par <auteur> » en pied d'exhortation, cliquable → fiche auteur
 * (bio, Instagram, boutique/ressources), exactement comme sur les plans.
 * Par défaut l'auteur est Pasteur Jack ; une exhortation peut préciser son
 * propre auteur (pour les futurs auteurs invités).
 */
export function DevotionAuthor(props: DevotionAuthorFields) {
  const name = props.author ?? DEFAULT_AUTHOR.name;
  const isDefault = name === DEFAULT_AUTHOR.name;

  // Les champs de l'exhortation surchargent l'auteur par défaut (Jack). Un
  // autre auteur n'hérite ni de la bio, ni de l'Instagram, ni des ressources.
  const info: AuthorInfo = isDefault
    ? {
        name,
        role: props.authorRole ?? DEFAULT_AUTHOR.role,
        bio: props.authorBio ?? DEFAULT_AUTHOR.bio,
        instagram: props.authorInstagram ?? DEFAULT_AUTHOR.instagram,
        resources: props.authorResources?.length ? props.authorResources : DEFAULT_AUTHOR.resources,
      }
    : {
        name,
        role: props.authorRole,
        bio: props.authorBio,
        instagram: props.authorInstagram,
        resources: props.authorResources ?? [],
      };

  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [broken, setBroken] = useState(false);

  const photoSrc = props.authorPhoto ? asset(props.authorPhoto) : undefined;
  const src = broken
    ? undefined
    : photoSrc ?? (isDefault ? JACK_PHOTOS[i] : undefined);
  const initial = name.replace(/^Pasteur\s+/i, "").slice(0, 1);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Voir la fiche de ${name}`}
        className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-night-900/10 bg-night-900/[0.03] p-3 text-left transition-colors hover:border-spirit-500/40 hover:bg-night-900/[0.05]"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            onError={() => {
              if (photoSrc || !isDefault || i + 1 >= JACK_PHOTOS.length) setBroken(true);
              else setI((n) => n + 1);
            }}
            className="h-11 w-11 rounded-full object-cover object-top ring-2 ring-dawn-400/60"
          />
        ) : (
          <span className="grid h-11 w-11 place-items-center rounded-full bg-spirit-500 font-display text-sm font-extrabold text-cream ring-2 ring-dawn-400/60">
            {initial}
          </span>
        )}
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-night-900/40">
            Une exhortation de
          </span>
          <span className="block font-display text-sm font-bold text-night-900">{name}</span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-spirit-600">Voir sa fiche</span>
      </button>

      <AuthorCard
        open={open}
        onClose={() => setOpen(false)}
        author={info}
        photo={photoSrc ?? (isDefault ? JACK_PHOTOS[0] : undefined)}
      />
    </>
  );
}
