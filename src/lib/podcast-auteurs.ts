import { DEFAULT_AUTHOR, type AuthorInfo } from "@/config/author";
import type { Emission } from "./audio-library";

/**
 * Fiche de l'intervenant d'une émission (même fiche que l'auteur d'un plan) :
 * rôle, bio, Instagram et liens (YouTube, Boutique, site…), pour que chaque
 * intervenant puisse faire connaître son travail.
 * Pasteur Jack : ses liens par défaut quand l'émission n'en précise pas.
 * Photo : celle de la fiche, sinon la pochette de l'émission.
 */
export function ficheAuteur(nom: string, e?: Emission | null): { info: AuthorInfo; photo?: string } {
  const estJack = nom === DEFAULT_AUTHOR.name;
  const liens = (e?.author_links ?? []).filter((l) => l?.url);
  const info: AuthorInfo = {
    name: nom,
    role: e?.author_role || (estJack ? DEFAULT_AUTHOR.role : undefined),
    bio: e?.author_bio || (estJack ? DEFAULT_AUTHOR.bio : undefined),
    instagram: e?.author_instagram || (estJack ? DEFAULT_AUTHOR.instagram : undefined),
    // On est déjà dans les podcasts : pas de lien « Podcast » vers cette page.
    resources: liens.length ? liens : estJack ? DEFAULT_AUTHOR.resources.filter((r) => r.url !== "/ecouter") : [],
  };
  return { info, photo: e?.author_photo || e?.cover || undefined };
}
