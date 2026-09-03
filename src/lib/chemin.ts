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

/**
 * Difficulté d'un exercice. « facile » est le défaut et ne s'affiche pas ;
 * « moyen » et « expert » sont annoncés au joueur et rapportent plus d'XP.
 */
export type CheminNiveau = "facile" | "moyen" | "expert";

type Base = {
  niveau?: CheminNiveau;
  /**
   * Le passage à consulter pour cet exercice. Facultatif : par défaut on
   * affiche celui de l'étape. À ne renseigner que si la question porte sur
   * un autre passage que le récit qui la précède.
   */
  ref?: string;
};

export type CheminExercice =
  | ({ type: "qcm"; q: string; choix: string[]; bonne: number } & Base)
  | ({ type: "vf"; q: string; vrai: boolean } & Base)
  | ({ type: "trou"; texte: string; reponse: string; leurres: string[] } & Base)
  | ({ type: "ordre"; consigne: string; items: string[] } & Base)
  /** Qui suis-je : les indices se dévoilent un par un, puis on désigne. */
  | ({ type: "qui"; indices: string[]; reponse: string; leurres: string[] } & Base)
  /** Le verset à reconstruire mot à mot, dans l'ordre. */
  | ({ type: "verset"; ref: string; texte: string } & Base);

/** Bonus d'XP par exercice selon sa difficulté. */
export const XP_NIVEAU: Record<CheminNiveau, number> = { facile: 0, moyen: 3, expert: 8 };

export const LABEL_NIVEAU: Record<CheminNiveau, string> = {
  facile: "Facile",
  moyen: "Moyen",
  expert: "Expert",
};

/** L'intitulé du défi d'une étape, déduit de ses exercices. */
export function defiEtape(e: CheminEtape): string {
  const t = e.exercices[0]?.type;
  if (t === "qui") return "Qui suis-je ?";
  if (t === "verset") return "Le verset";
  if (t === "ordre") return "La chronologie";
  if (t === "trou") return "Le mot manquant";
  if (t === "vf") return "Vrai ou faux";
  return "Les questions";
}

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
  /**
   * Les points du sentier PEINT dans le décor, en % de l'image (0-100).
   * Le chemin n'est plus dessiné par l'app : il fait partie de l'illustration,
   * et ces coordonnées — relevées sur l'image par détection du sentier — y
   * posent les dalles exactement dessus. Un point par étape, du bas vers le
   * haut. Voir docs/CHEMIN-ASSETS.md pour la méthode de relevé.
   */
  sentier: { x: number; y: number }[];
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
  // XP : 30 par étape parfaite, 20 sinon ; 8 en re-jeu. Les exercices de
  // difficulté « moyen » et « expert » ajoutent leur bonus par-dessus.
  const bonus = (chap.etapes[stepIdx]?.exercices ?? [])
    .reduce((n, ex) => n + XP_NIVEAU[ex.niveau ?? "facile"], 0);
  const xp = dejaFaite ? 8 : (fautes === 0 ? 30 : 20) + bonus;
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

/** Où en est le joueur sur l'ensemble du Chemin (pour l'écran d'accueil). */
export function cheminProgres(chapitres: CheminChapitre[]): {
  chapitresFaits: number;
  chapitresTotal: number;
  etapesFaites: number;
  etapesTotal: number;
  xp: number;
  cartes: number;
} {
  let etapesFaites = 0;
  let etapesTotal = 0;
  let chapitresFaits = 0;
  for (const c of chapitres) {
    const fait = Math.min(cheminStep(c.id), c.etapes.length);
    etapesFaites += fait;
    etapesTotal += c.etapes.length;
    if (fait >= c.etapes.length) chapitresFaits += 1;
  }
  return {
    chapitresFaits,
    chapitresTotal: chapitres.length,
    etapesFaites,
    etapesTotal,
    xp: getCheminXp(),
    cartes: cheminCards().length,
  };
}

/** Un chapitre est débloqué si le précédent est terminé. */
export function cheminChapitreOuvert(chapitres: CheminChapitre[], idx: number): boolean {
  if (idx === 0) return true;
  const prev = chapitres[idx - 1];
  return cheminStep(prev.id) >= prev.etapes.length;
}
