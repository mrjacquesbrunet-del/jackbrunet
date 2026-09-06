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
import { CHAPITRE_PSAUMES } from "./chapitre-psaumes";
import { CHAPITRE_SALOMON } from "./chapitre-salomon";
import { CHAPITRE_PROVERBES } from "./chapitre-proverbes";
import { CHAPITRE_ECCLESIASTE } from "./chapitre-ecclesiaste";
import { CHAPITRE_ELIE } from "./chapitre-elie";
import { CHAPITRE_ELISEE } from "./chapitre-elisee";
import { CHAPITRE_JONAS } from "./chapitre-jonas";
import { CHAPITRE_ESAIE } from "./chapitre-esaie";
import { CHAPITRE_JOB } from "./chapitre-job";
import { CHAPITRE_JEREMIE } from "./chapitre-jeremie";
import { CHAPITRE_EZECHIEL } from "./chapitre-ezechiel";
import { CHAPITRE_DANIEL } from "./chapitre-daniel";
import { CHAPITRE_OSEE_AMOS } from "./chapitre-osee-amos";
import { CHAPITRE_ESTHER } from "./chapitre-esther";
import { CHAPITRE_NEHEMIE } from "./chapitre-nehemie";
import { CHAPITRE_ATTENTE } from "./chapitre-attente";
import { CHAPITRE_NAISSANCE } from "./chapitre-naissance";
import { CHAPITRE_BAPTEME } from "./chapitre-bapteme";
import { CHAPITRE_TENTATION } from "./chapitre-tentation";
import { CHAPITRE_DISCIPLES } from "./chapitre-disciples";
import { CHAPITRE_SERMON } from "./chapitre-sermon";
import { CHAPITRE_MIRACLES } from "./chapitre-miracles";
import { CHAPITRE_PAINS } from "./chapitre-pains";
import { CHAPITRE_PARABOLES } from "./chapitre-paraboles";
import { CHAPITRE_TRANSFIGURATION } from "./chapitre-transfiguration";
import { CHAPITRE_RENCONTRES } from "./chapitre-rencontres";
import { CHAPITRE_LAZARE } from "./chapitre-lazare";
import { CHAPITRE_RAMEAUX } from "./chapitre-rameaux";
import { CHAPITRE_CENE } from "./chapitre-cene";
import { CHAPITRE_CROIX } from "./chapitre-croix";
import { CHAPITRE_RESURRECTION } from "./chapitre-resurrection";
import { CHAPITRE_PENTECOTE } from "./chapitre-pentecote";
import { CHAPITRE_EGLISE } from "./chapitre-eglise";
import { CHAPITRE_PAUL } from "./chapitre-paul";
import { CHAPITRE_VOYAGES } from "./chapitre-voyages";
import { CHAPITRE_ROME } from "./chapitre-rome";
import { CHAPITRE_LETTRES_PAUL } from "./chapitre-lettres-paul";
import { CHAPITRE_JACQUES } from "./chapitre-jacques";
import { CHAPITRE_HEBREUX } from "./chapitre-hebreux";
import { CHAPITRE_PIERRE_JEAN } from "./chapitre-pierre-jean";
import { CHAPITRE_APOCALYPSE } from "./chapitre-apocalypse";

/**
 * Les chapitres du Chemin, dans l'ordre du récit biblique.
 * La Genèse est complète (Création, Noé, Abraham, Jacob, Joseph), l'Exode
 * aussi (Moïse, la Pâque, la mer Rouge, le Sinaï), puis la conquête et les
 * juges (Josué, Gédéon, Samson, Ruth, Samuel, David et Goliath), puis les
 * rois et les premiers prophètes (Saül, David roi, Salomon, Élie, Élisée).
 * rois, la sagesse et les premiers prophètes (Saül, David roi, les Psaumes,
 * Salomon, les Proverbes, l'Ecclésiaste, Élie, Élisée),
 * puis les grands livres prophétiques (Jonas, Ésaïe, Job, Jérémie, Ézéchiel).
 * L'Ancien Testament se referme sur l'exil et le retour (Daniel, les petits
 * prophètes, Esther, Néhémie) et sur l'attente du Messie.
 * Puis les Évangiles, pris en détail : la naissance, Jean-Baptiste, la
 * tentation, les premiers disciples, le sermon sur la montagne.
 * Les Évangiles vont jusqu'à la croix et à la résurrection, puis les Actes
 * (la Pentecôte, l'Église naissante, Paul), les épîtres — Paul, Jacques,
 * Hébreux, Pierre, Jean et Jude — et l'Apocalypse.
 *
 * L'ORDRE DE CE TABLEAU est l'ordre de lecture, et c'est lui qui donne le
 * numéro affiché au joueur. L'`id` de chaque chapitre est la clé de sa
 * progression sauvegardée : il ne doit jamais changer, même si un chapitre
 * s'insère au milieu de la route.
 * Le Chemin va donc désormais de la Création à la nouvelle Jérusalem.
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
  CHAPITRE_PSAUMES,
  CHAPITRE_SALOMON,
  CHAPITRE_PROVERBES,
  CHAPITRE_ECCLESIASTE,
  CHAPITRE_ELIE,
  CHAPITRE_ELISEE,
  CHAPITRE_JONAS,
  CHAPITRE_ESAIE,
  CHAPITRE_JOB,
  CHAPITRE_JEREMIE,
  CHAPITRE_EZECHIEL,
  CHAPITRE_DANIEL,
  CHAPITRE_OSEE_AMOS,
  CHAPITRE_ESTHER,
  CHAPITRE_NEHEMIE,
  CHAPITRE_ATTENTE,
  CHAPITRE_NAISSANCE,
  CHAPITRE_BAPTEME,
  CHAPITRE_TENTATION,
  CHAPITRE_DISCIPLES,
  CHAPITRE_SERMON,
  CHAPITRE_MIRACLES,
  CHAPITRE_PAINS,
  CHAPITRE_PARABOLES,
  CHAPITRE_TRANSFIGURATION,
  CHAPITRE_RENCONTRES,
  CHAPITRE_LAZARE,
  CHAPITRE_RAMEAUX,
  CHAPITRE_CENE,
  CHAPITRE_CROIX,
  CHAPITRE_RESURRECTION,
  CHAPITRE_PENTECOTE,
  CHAPITRE_EGLISE,
  CHAPITRE_PAUL,
  CHAPITRE_VOYAGES,
  CHAPITRE_ROME,
  CHAPITRE_LETTRES_PAUL,
  CHAPITRE_JACQUES,
  CHAPITRE_HEBREUX,
  CHAPITRE_PIERRE_JEAN,
  CHAPITRE_APOCALYPSE,
];
