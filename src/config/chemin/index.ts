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
import { CHAPITRE_JOSUE } from "./chapitre-josue";
import { CHAPITRE_GEDEON } from "./chapitre-gedeon";
import { CHAPITRE_SAMSON } from "./chapitre-samson";
import { CHAPITRE_RUTH } from "./chapitre-ruth";
import { CHAPITRE_SAMUEL } from "./chapitre-samuel";
import { CHAPITRE_DAVID } from "./chapitre-david";
import { CHAPITRE_SAUL } from "./chapitre-saul";
import { CHAPITRE_DAVID_ROI } from "./chapitre-david-roi";
import { CHAPITRE_SALOMON } from "./chapitre-salomon";
import { CHAPITRE_ELIE } from "./chapitre-elie";
import { CHAPITRE_ELISEE } from "./chapitre-elisee";

/**
 * Les chapitres du Chemin, dans l'ordre du récit biblique.
 * La Genèse est complète (Création, Noé, Abraham, Jacob, Joseph), l'Exode
 * aussi (Moïse, la Pâque, la mer Rouge, le Sinaï), puis la conquête et les
 * juges (Josué, Gédéon, Samson, Ruth, Samuel, David et Goliath), puis les
 * rois et les premiers prophètes (Saül, David roi, Salomon, Élie, Élisée).
 * À venir : Job, les prophètes (Ésaïe, Jérémie, Ézéchiel, Daniel, Osée,
 * Amos, Jonas), Esther et Néhémie, puis Jésus (plusieurs chapitres), les
 * Actes, Paul et l'Apocalypse.
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
  CHAPITRE_JOSUE,
  CHAPITRE_GEDEON,
  CHAPITRE_SAMSON,
  CHAPITRE_RUTH,
  CHAPITRE_SAMUEL,
  CHAPITRE_DAVID,
  CHAPITRE_SAUL,
  CHAPITRE_DAVID_ROI,
  CHAPITRE_SALOMON,
  CHAPITRE_ELIE,
  CHAPITRE_ELISEE,
];
