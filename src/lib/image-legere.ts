"use client";

import type { ReactEventHandler } from "react";

/**
 * Images Supabase allégées pour l'affichage (avatars, bannières, cartes du
 * jour, photos du mur) : au lieu du fichier d'origine (souvent 1 à 4 Mo,
 * photo de téléphone ou PNG), on demande à Supabase une version à la taille
 * affichée, compressée (WebP quand le téléphone le gère). C'est ce qui pèse
 * le plus dans la bande passante facturée.
 *
 * Si les transformations d'images ne répondent pas (désactivées côté
 * Supabase…), on retombe sur l'image d'origine, et on n'essaie plus pendant
 * la session.
 */
const OBJET = "/storage/v1/object/public/";
const RENDU = "/storage/v1/render/image/public/";
const CLE_KO = "jb.images.rendu-ko";

let renduKo: boolean | null = null;
function transformationsKo(): boolean {
  if (renduKo === null) {
    try {
      renduKo = sessionStorage.getItem(CLE_KO) === "1";
    } catch {
      renduKo = false;
    }
  }
  return renduKo;
}

/** URL allégée d'une image Supabase (sinon l'URL telle quelle). */
export function urlLegere(
  url: string | null | undefined,
  largeur: number,
  opts: { carre?: boolean; qualite?: number } = {},
): string | undefined {
  if (!url) return undefined;
  if (!url.includes(OBJET) || /\.(gif|svg)(\?|$)/i.test(url) || transformationsKo()) return url;
  // Écrans haute densité : deux fois la taille affichée, plafonnée.
  const px = Math.min(2000, Math.max(32, Math.round(largeur * 2)));
  const p = new URLSearchParams({ width: String(px), quality: String(opts.qualite ?? 70) });
  if (opts.carre) {
    p.set("height", String(px));
    p.set("resize", "cover");
  } else {
    p.set("resize", "contain");
  }
  const base = url.replace(OBJET, RENDU);
  return `${base}${base.includes("?") ? "&" : "?"}${p.toString()}`;
}

/** Repli sur l'image d'origine si la version allégée ne charge pas. */
export function repliImage(original: string | null | undefined): ReactEventHandler<HTMLImageElement> | undefined {
  if (!original) return undefined;
  return (e) => {
    const img = e.currentTarget;
    if (img.src === original || !img.src.includes(RENDU)) return;
    renduKo = true;
    try {
      sessionStorage.setItem(CLE_KO, "1");
    } catch {
      /* ignore */
    }
    img.src = original;
  };
}

/** Raccourci pour une balise <img> : `<img {...imageLegere(url, 40, { carre: true })} />`. */
export function imageLegere(
  url: string | null | undefined,
  largeur: number,
  opts: { carre?: boolean; qualite?: number } = {},
): { src: string | undefined; onError: ReactEventHandler<HTMLImageElement> | undefined } {
  return { src: urlLegere(url, largeur, opts), onError: repliImage(url) };
}

/** Pour une liste de photos candidates (essayées l'une après l'autre) :
 * la version allégée d'abord, l'originale en secours. */
export function avecVersionLegere(url: string, largeur: number): string[] {
  const l = urlLegere(url, largeur, { carre: true });
  return l && l !== url ? [l, url] : [url];
}
