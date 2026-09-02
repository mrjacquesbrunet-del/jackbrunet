"use client";

/**
 * « Le Chemin » — la route d'apprentissage de la Bible, de la Genèse à
 * l'Apocalypse. Chaque CHAPITRE est un personnage/une histoire (la Création,
 * Noé, Abraham…) ; chaque ÉTAPE = un court récit + des exercices variés.
 * Terminer un chapitre fait gagner la CARTE de son personnage.
 *
 * Ici : la progression locale (étapes, coffres, cartes, XP) + les types du
 * contenu. Le contenu lui-même est en données : src/config/chemin/*.
 */

export type CheminExercice =
  | { type: "qcm"; q: string; choix: string[]; bonne: number }
  | { type: "vf"; q: string; vrai: boolean }
  | { type: "trou"; texte: string; reponse: string; leurres: string[] }
  | { type: "ordre"; consigne: string; items: string[] };

export interface CheminEtape {
  /** Le récit raconté avant les exercices (2-4 phrases). */
  recit: string;
  ref: string;
  exercices: CheminExercice[];
  /** Un coffre bonus se trouve sur cette étape. */
  coffre?: boolean;
}

export interface CheminCarte {
  id: string;
  nom: string;
  titre: string; // ex. « Le bâtisseur de l'arche »
  rarete: "commune" | "rare" | "epique" | "legendaire";
  image: string; // /img/chemin/cartes/<id>.jpg
}

export interface CheminChapitre {
  id: number;
  nom: string;
  livre: string; // ex. « Genèse 1-3 »
  accent: string; // couleur du chapitre
  decor: string; // /img/chemin/decor-<id>.jpg (2K généré)
  /** Dégradé de secours tant que le décor n'est pas installé. */
  fallback: [string, string, string];
  carte: CheminCarte;
  etapes: CheminEtape[];
}

/* ---------------- Progression locale ---------------- */

const KEY = "jb.chemin.v1";

type Store = {
  /** Prochaine étape à jouer par chapitre (0 = rien de fait). */
  steps: Record<string, number>;
  /** Index des coffres ouverts par chapitre. */
  chests: Record<string, number[]>;
  /** Cartes gagnées (ids). */
  cards: string[];
  xp: number;
};

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Store;
      if (s && typeof s === "object" && s.steps && s.chests && Array.isArray(s.cards)) return s;
    }
  } catch {
    /* stockage indisponible */
  }
  return { steps: {}, chests: {}, cards: [], xp: 0 };
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible */
  }
}

export function cheminStep(chapId: number): number {
  const v = read().steps[String(chapId)];
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function cheminChestOpened(chapId: number, stepIdx: number): boolean {
  return (read().chests[String(chapId)] ?? []).includes(stepIdx);
}

export function cheminCards(): string[] {
  return read().cards;
}

export function getCheminXp(): number {
  return read().xp;
}

/** Valide une étape. Renvoie les gains (xp, coffre éventuel, carte de fin). */
export function completeCheminStep(
  chap: CheminChapitre,
  stepIdx: number,
  fautes: number,
): { xp: number; coffreGemmes: number; carte: CheminCarte | null; dejaFaite: boolean } {
  const s = read();
  const key = String(chap.id);
  const cur = Number(s.steps[key]) || 0;
  const dejaFaite = stepIdx < cur;
  // XP : 30 par étape parfaite, 20 sinon ; 8 en re-jeu.
  const xp = dejaFaite ? 8 : fautes === 0 ? 30 : 20;
  s.xp += xp;
  let coffreGemmes = 0;
  if (!dejaFaite) {
    s.steps[key] = Math.max(cur, stepIdx + 1);
    if (chap.etapes[stepIdx]?.coffre && !cheminChestOpened(chap.id, stepIdx)) {
      s.chests[key] = [...(s.chests[key] ?? []), stepIdx];
      coffreGemmes = 15;
    }
  }
  let carte: CheminCarte | null = null;
  if (!dejaFaite && stepIdx + 1 >= chap.etapes.length && !s.cards.includes(chap.carte.id)) {
    s.cards = [...s.cards, chap.carte.id];
    carte = chap.carte;
  }
  write(s);
  return { xp, coffreGemmes, carte, dejaFaite };
}

/** Un chapitre est débloqué si le précédent est terminé. */
export function cheminChapitreOuvert(chapitres: CheminChapitre[], idx: number): boolean {
  if (idx === 0) return true;
  const prev = chapitres[idx - 1];
  return cheminStep(prev.id) >= prev.etapes.length;
}
