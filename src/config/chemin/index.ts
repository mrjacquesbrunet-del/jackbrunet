import type { CheminChapitre } from "@/lib/chemin";
import { CHAPITRE_CREATION } from "./chapitre-creation";
import { CHAPITRE_NOE } from "./chapitre-noe";
import { CHAPITRE_ABRAHAM } from "./chapitre-abraham";
import { CHAPITRE_JACOB } from "./chapitre-jacob";
import { CHAPITRE_JOSEPH } from "./chapitre-joseph";
import { CHAPITRE_MOISE } from "./chapitre-moise";
import { CHAPITRE_PAQUE } from "./chapitre-paque";
import { CHAPITRE_MER_ROUGE } from "./chapitre-mer-rouge";
import { CHAPITRE_SINAI } from "./chapitre-sinai";

/**
 * Les chapitres du Chemin, dans l'ordre du récit biblique.
 * La Genèse est complète (Création, Noé, Abraham, Jacob, Joseph) et l'Exode
 * aussi (Moïse, la Pâque, la mer Rouge, le Sinaï).
 * À venir : Josué, les Juges, Samuel, David, Salomon, Élie, Daniel, Jonas,
 * Esther, puis Jésus (plusieurs chapitres), les Actes, Paul et l'Apocalypse.
 */
export const CHEMIN_CHAPITRES: CheminChapitre[] = [
  CHAPITRE_CREATION,
  CHAPITRE_NOE,
  CHAPITRE_ABRAHAM,
  CHAPITRE_JACOB,
  CHAPITRE_JOSEPH,
  CHAPITRE_MOISE,
  CHAPITRE_PAQUE,
  CHAPITRE_MER_ROUGE,
  CHAPITRE_SINAI,
];
