import etudesData from "../../content/etudes-bibliques.json";

/**
 * ÉTUDES BIBLIQUES embarquées : les grands thèmes théologiques expliqués
 * simplement, références LSG cliquables (rendues par TexteAvecRefs).
 * Contenu éditable dans content/etudes-bibliques.json.
 */

export type EtudeSection = { t: string; p: string };
export type Etude = {
  id: string;
  titre: string;
  accroche: string;
  sections: EtudeSection[];
};

export function getEtudes(): Etude[] {
  return (etudesData as { etudes: Etude[] }).etudes;
}
