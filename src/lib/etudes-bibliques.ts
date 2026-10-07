import data from "../../content/etudes.json";
import { getSupabase } from "./supabase";
import { contenuCharge } from "./contenu-i18n";

/**
 * ÉTUDES BIBLIQUES (onglet Étude) : études rédigées par les auteurs du
 * ministère, classées par thème et par auteur. Chaque étude est une suite de
 * blocs typés qui reprend la mise en page du document d'origine (histoire en
 * plusieurs parties, portraits, applications, questions pour le groupe, défi).
 * Contenu éditable dans content/etudes.json. Dans les textes, les références
 * entre parenthèses « (1 Samuel 16:7) » deviennent cliquables et « **gras** »
 * met une amorce en gras.
 */

export type Bloc =
  | { type: "rubrique"; t: string }
  | { type: "p"; t: string }
  | { type: "citation"; t: string; ref: string }
  | { type: "partie"; n: number; t: string; chapeau?: string }
  | { type: "histoire"; n: number; p: string[] }
  | { type: "sousTitre"; t: string }
  | { type: "points"; items: string[] }
  | { type: "application" }
  | { type: "point"; n: number; t: string }
  | { type: "liste"; items: { g: string; t: string }[] }
  | { type: "question"; t: string; items: string[] }
  | { type: "encadre"; t: string; ref?: string }
  | { type: "retenir"; items: string[] }
  | { type: "questions"; items: string[] }
  | { type: "defi"; t: string; verset?: string; ref?: string }
  | { type: "priere"; t: string }
  | { type: "lectures"; t: string; items: { ref: string; t: string }[] };

export type Auteur = { id: string; nom: string; role: string; photo?: string };
export type Theme = { id: string; nom: string };
export type EtudeBiblique = {
  id: string;
  serie?: string;
  numero?: number;
  titre: string;
  sousTitre?: string;
  auteur: string;
  themes: string[];
  public?: string;
  texte?: string;
  lire?: string;
  versetCle?: string;
  image?: string;
  resume: string;
  /** Narration audio en plusieurs parties, déposées dans le bucket Supabase
   * « audiovf » (ex. etudes/david-1-1.mp3). Le lecteur n'apparaît que si la
   * première partie existe. */
  audio?: { fichier: string; titre: string }[];
  blocs: Bloc[];
};

type Donnees = { auteurs: Auteur[]; themes: Theme[]; etudes: EtudeBiblique[] };
const FR = data as unknown as Donnees;
/** Dans la langue de l'app quand la traduction est chargée (voir AvecContenus). */
const donnees = (): Donnees => contenuCharge<Donnees>("etudes") ?? FR;

export function getEtudesBibliques(): EtudeBiblique[] {
  return donnees().etudes;
}
export function getEtudeBiblique(id: string): EtudeBiblique | undefined {
  return donnees().etudes.find((e) => e.id === id);
}
export function getAuteur(id: string): Auteur | undefined {
  return donnees().auteurs.find((a) => a.id === id);
}
/** Les auteurs qui ont au moins une étude publiée. */
export function auteursActifs(): Auteur[] {
  return donnees().auteurs.filter((a) => donnees().etudes.some((e) => e.auteur === a.id));
}
/** Les thèmes qui ont au moins une étude (les thèmes vides restent cachés). */
export function themesActifs(): Theme[] {
  return donnees().themes.filter((t) => donnees().etudes.some((e) => e.themes.includes(t.id)));
}
export function nomTheme(id: string): string {
  return donnees().themes.find((t) => t.id === id)?.nom ?? id;
}

/** Durée de lecture estimée (~180 mots/min), en minutes. */
export function dureeEtude(e: EtudeBiblique): number {
  const textes: string[] = [];
  for (const b of e.blocs) {
    if ("t" in b && typeof b.t === "string") textes.push(b.t);
    if ("p" in b) textes.push(...b.p);
    if ("items" in b) for (const i of b.items) textes.push(typeof i === "string" ? i : i.t);
  }
  const mots = textes.join(" ").split(/\s+/).length;
  return Math.max(5, Math.round(mots / 180));
}

/** Libellé de série : « La vie de David · Étude 1 ». */
export function libelleSerie(e: EtudeBiblique): string | null {
  if (!e.serie) return null;
  return e.numero ? `${e.serie} · Étude ${e.numero}` : e.serie;
}

/** URL publique d'une partie audio (bucket « audiovf »). */
export function audioEtudeUrl(fichier: string): string | null {
  const sb = getSupabase();
  if (!sb) return null;
  return sb.storage.from("audiovf").getPublicUrl(fichier).data.publicUrl;
}
