/**
 * Auteur par défaut des plans (Pasteur Jack Brunet). Utilisé quand un plan
 * ne précise pas son propre auteur dans le CMS. Un plan peut tout surcharger
 * (nom, photo, rôle, bio, Instagram, ressources).
 */
export type AuthorResource = { label: string; url: string };

export type AuthorInfo = {
  name: string;
  role?: string;
  photo?: string;
  bio?: string;
  instagram?: string;
  resources: AuthorResource[];
};

export const DEFAULT_AUTHOR: AuthorInfo = {
  name: "Pasteur Jack Brunet",
  role: "Pasteur & fondateur",
  // photo laissée vide : la fiche retombe sur l'avatar (Supabase) déjà utilisé.
  bio: "Passionné par Jésus, j'ai à cœur que chacun puisse Le découvrir personnellement — pas de façon religieuse, mais dans une relation vivante et concrète, au quotidien.",
  instagram: "https://www.instagram.com/jack_brnt/?hl=fr",
  resources: [
    { label: "Podcast", url: "/ecouter" },
    { label: "YouTube", url: "https://www.youtube.com/@Jack_brnt" },
    { label: "Boutique", url: "/boutique" },
  ],
};
