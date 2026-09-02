import type { CheminChapitre } from "@/lib/chemin";
import { CHAPITRE_CREATION } from "./chapitre-creation";
import { CHAPITRE_NOE } from "./chapitre-noe";

/**
 * Les chapitres du Chemin, dans l'ordre du récit biblique.
 * À venir : Abraham, Joseph, Moïse et l'Exode, Josué, David, Salomon,
 * Élie, Daniel, Jonas, Esther, puis Jésus (plusieurs chapitres), les
 * Actes, Paul et l'Apocalypse.
 */
export const CHEMIN_CHAPITRES: CheminChapitre[] = [CHAPITRE_CREATION, CHAPITRE_NOE];
