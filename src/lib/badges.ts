"use client";

import { getSupabase } from "./supabase";
import { topIntercessors } from "./community";
import { fetchGameLeaderboard } from "./game-scores";
import { bestDayStreak, fullWeeksFromDates, getAchv } from "./achievements";
import { getQuizCoins } from "./quiz";
import { getVfXp } from "./vraifaux";
import { getWhoXp } from "./whoami";
import { snapshotToolkit } from "./toolkit";
import { snapshotNotes } from "./notebook";
import { frondeStats } from "./fronde";

/**
 * Badges d'ACCOMPLISSEMENT — attribués automatiquement, avec paliers
 * bronze / argent / or, à partir de l'activité. Trois sources :
 *  - compteurs SERVEUR : prières, commentaires, points de quiz ;
 *  - compteurs LOCAUX (cet appareil, lib achievements) synchronisés 1×/jour
 *    dans profiles.stats pour être visibles sur le profil vu par les autres ;
 *  - dérivés d'autres stores locaux (carnet, surlignages, engagement).
 *  + Titres à répétition (« ×N ») : champions & intercesseurs (table honors).
 */

export type BadgeTier = "bronze" | "argent" | "or";
export type BadgeKind =
  // — Prière —
  | "intercesseur"
  | "scrolleur"
  | "voix"
  | "coeur"
  | "premier"
  // — Temps avec Jésus —
  | "fidele"
  | "meditant"
  | "levetot"
  | "enracine"
  | "ecoute"
  // — La Parole —
  | "expert"
  | "memorisateur"
  | "lecteur"
  | "scribe"
  | "surligneur"
  // — Jeux —
  | "duelliste"
  | "invincible"
  | "sansfaute"
  | "eclair"
  | "marathonien"
  | "defi"
  | "demineur"
  | "maitre_quiz"
  | "maitre_vf"
  | "maitre_qsj"
  | "millionnaire"
  | "enchaineur"
  | "limier"
  | "historien"
  | "motjuste"
  | "frondeur"
  | "tireur"
  // — Arène & défis —
  | "lanceur"
  | "assidu"
  | "missionnaire"
  | "etoile"
  // — Communauté —
  | "encourageur"
  | "ambassadeur";

export type BadgeState = {
  kind: BadgeKind;
  label: string;
  tier: BadgeTier | null;
  count: number;
  next: number | null;
  detail: string;
};

/** Titres à répétition (« ×N ») remportés au fil des semaines/mois. */
export type HonorKind = "champion_semaine" | "intercesseur_semaine" | "intercesseur_mois";
export type HonorCounts = Partial<Record<HonorKind, number>>;

export const HONOR_LABELS: Record<HonorKind, string> = {
  champion_semaine: "Champion de la semaine",
  intercesseur_semaine: "Intercesseur de la semaine",
  intercesseur_mois: "Intercesseur du mois",
};

export type ProfileBadges = {
  states: BadgeState[];
  weeklyTop: boolean;
  honors: HonorCounts;
};

export const BADGE_LABELS: Record<BadgeKind, string> = {
  intercesseur: "Intercesseur",
  scrolleur: "Scrolleur du ciel",
  voix: "Voix qui monte",
  coeur: "Cœur constant",
  premier: "Premier au front",
  fidele: "Fidèle",
  meditant: "Méditant",
  levetot: "Lève-tôt",
  enracine: "Enraciné",
  ecoute: "À l'écoute",
  expert: "Expert de la Parole",
  memorisateur: "Mémorisateur",
  lecteur: "Lecteur",
  scribe: "Scribe",
  surligneur: "Surligneur",
  duelliste: "Duelliste",
  invincible: "Invincible",
  sansfaute: "Sans-faute",
  eclair: "Éclair",
  marathonien: "Marathonien",
  defi: "Habitué du Défi",
  demineur: "Démineur",
  maitre_quiz: "Maître du Quiz",
  maitre_vf: "Maître du Vrai ou Faux",
  maitre_qsj: "Maître du Qui suis-je",
  millionnaire: "Millionnaire",
  enchaineur: "Enchaîneur",
  limier: "Fin limier",
  historien: "Historien",
  motjuste: "Le mot juste",
  frondeur: "Frondeur",
  tireur: "Tireur d'élite",
  lanceur: "Lanceur de défis",
  assidu: "Assidu",
  missionnaire: "Missionnaire",
  etoile: "Étoile des ligues",
  encourageur: "Encourageur",
  ambassadeur: "Ambassadeur",
};

export const BADGE_THRESHOLDS: Record<BadgeKind, [number, number, number]> = {
  intercesseur: [50, 200, 500],
  scrolleur: [5, 25, 100],
  voix: [5, 25, 100],
  coeur: [7, 30, 90],
  premier: [10, 40, 120],
  fidele: [7, 30, 100],
  meditant: [10, 50, 200],
  levetot: [7, 30, 100],
  enracine: [4, 12, 52],
  ecoute: [10, 50, 150],
  expert: [1500, 4000, 10000],
  memorisateur: [5, 20, 60],
  lecteur: [15, 60, 250],
  scribe: [10, 50, 200],
  surligneur: [20, 100, 300],
  duelliste: [5, 25, 100],
  invincible: [3, 7, 15],
  sansfaute: [5, 25, 75],
  eclair: [25, 100, 300],
  marathonien: [7, 30, 100],
  defi: [10, 50, 200],
  demineur: [20, 75, 200],
  maitre_quiz: [5000, 20000, 60000],
  maitre_vf: [500, 2000, 6000],
  maitre_qsj: [300, 1200, 4000],
  millionnaire: [1, 5, 20],
  enchaineur: [10, 20, 35],
  limier: [5, 20, 60],
  historien: [50, 200, 600],
  motjuste: [30, 120, 400],
  frondeur: [10, 20, 30],
  tireur: [30, 60, 90],
  lanceur: [3, 15, 50],
  assidu: [20, 100, 500],
  missionnaire: [3, 12, 40],
  etoile: [2, 3, 4],
  encourageur: [25, 100, 300],
  ambassadeur: [10, 50, 200],
};

const DETAILS: Record<BadgeKind, string> = {
  intercesseur: "« Je prie » donnés sur le mur",
  scrolleur: "sessions Scrolle & prie terminées",
  voix: "prières vocales déposées",
  coeur: "record de jours d'affilée en prière",
  premier: "premier à prier pour un sujet",
  fidele: "jours d'affilée avec Jésus",
  meditant: "méditations complétées",
  levetot: "méditations faites avant 8 h",
  enracine: "semaines parfaites (7 jours sur 7)",
  ecoute: "méditations écoutées en audio",
  expert: "points au Quiz biblique",
  memorisateur: "versets appris par cœur",
  lecteur: "jours de lecture cochés",
  scribe: "notes écrites dans le carnet",
  surligneur: "versets et passages surlignés",
  duelliste: "duels en ligne remportés",
  invincible: "record de victoires d'affilée en duel",
  sansfaute: "parties parfaites",
  eclair: "bonnes réponses en moins de 3 s",
  marathonien: "record de jours de jeu d'affilée",
  defi: "participations au Défi du jour",
  demineur: "questions pièges réussies",
  maitre_quiz: "pièces gagnées au Quiz",
  maitre_vf: "points au Vrai ou Faux",
  maitre_qsj: "points au Qui suis-je",
  millionnaire: "LE MILLION décroché au Quiz",
  enchaineur: "record de série au Vrai ou Faux",
  limier: "personnages devinés au premier indice",
  historien: "bonnes réponses à La Chronologie",
  motjuste: "mots retrouvés au Mot manquant",
  frondeur: "niveaux réussis à La Fronde",
  tireur: "étoiles gagnées à La Fronde",
  lanceur: "duels en ligne lancés",
  assidu: "parties jouées, tous jeux confondus",
  missionnaire: "missions de la semaine accomplies",
  etoile: "palier de ligue atteint",
  encourageur: "encouragements laissés",
  ambassadeur: "partages faits depuis l'app",
};

/**
 * COMMENT L'OBTENIR — affiché dans la vitrine quand on touche un badge
 * (surtout un badge verrouillé) : l'action concrète + le premier palier.
 */
export const BADGE_HOW_TO: Record<BadgeKind, string> = {
  intercesseur: "Sur le mur de prière ou dans Scrolle & prie, appuie sur « Je prie » pour les sujets des autres. Bronze à 50 prières, argent à 200, or à 500.",
  scrolleur: "Ouvre le mode « Scrolle & prie » (mur de prière ou Temps avec Jésus), prie pour au moins une personne puis termine ta session. Bronze à 5 sessions, argent à 25, or à 100.",
  voix: "Dans Scrolle & prie, appuie sur le gros micro et laisse une prière vocale sur un sujet. Bronze à 5 vocales, argent à 25, or à 100.",
  coeur: "Prie pour quelqu'un chaque jour, sans manquer un jour : c'est ta meilleure série qui compte. Bronze à 7 jours d'affilée, argent à 30, or à 90.",
  premier: "Sois le tout premier à prier pour un sujet que personne n'a encore porté. Bronze à 10 fois, argent à 40, or à 120.",
  fidele: "Appuie sur « J'ai médité » chaque jour dans le Temps avec Jésus pour faire grandir ta série. Bronze à 7 jours, argent à 30, or à 100.",
  meditant: "Termine la méditation du jour et valide « J'ai médité ». Bronze à 10 méditations, argent à 50, or à 200.",
  levetot: "Valide « J'ai médité » avant 8 h du matin. Bronze à 7 matins, argent à 30, or à 100.",
  enracine: "Médite les 7 jours d'une même semaine, du lundi au dimanche. Bronze à 4 semaines parfaites, argent à 12, or à 52.",
  ecoute: "Lance l'audio d'une méditation (bouton « Écouter la méditation »). Bronze à 10 écoutes, argent à 50, or à 150.",
  expert: "Joue au Quiz biblique : tes points de classement s'accumulent. Bronze à 1 500 points, argent à 4 000, or à 10 000.",
  memorisateur: "Dans Mémoriser, amène des versets jusqu'à l'étape « Par cœur ». Bronze à 5 versets, argent à 20, or à 60.",
  lecteur: "Coche tes jours de lecture dans les plans de lecture biblique. Bronze à 15 jours, argent à 60, or à 250.",
  scribe: "Écris des notes dans ton carnet (bloc « Prends une note » ou page Carnet). Bronze à 10 notes, argent à 50, or à 200.",
  surligneur: "Touche un verset ou un passage d'une méditation pour le surligner ou l'enregistrer. Bronze à 20, argent à 100, or à 300.",
  duelliste: "Gagne des duels en ligne (Quiz ou Vrai ou Faux, premier à 7 points). Bronze à 5 victoires, argent à 25, or à 100.",
  invincible: "Enchaîne les victoires en duel sans perdre : c'est ta meilleure série qui compte. Bronze à 3 d'affilée, argent à 7, or à 15.",
  sansfaute: "Fais une partie parfaite : LE MILLION au Quiz, 20 bonnes réponses sans perdre une vie au Vrai ou Faux, 10/10 à La Chronologie ou au Mot manquant. Bronze à 5 parties, argent à 25, or à 75.",
  eclair: "Réponds juste en moins de 3 secondes, dans n'importe quel jeu. Bronze à 25 réponses éclair, argent à 100, or à 300.",
  marathonien: "Joue au moins une partie chaque jour : c'est ta meilleure série de jours qui compte. Bronze à 7 jours d'affilée, argent à 30, or à 100.",
  defi: "Fais le Défi du jour au Quiz (un par jour). Bronze à 10 défis, argent à 50, or à 200.",
  demineur: "Réussis les questions les plus dures : Quiz difficulté maximale et personnages ardus du Qui suis-je. Bronze à 20, argent à 75, or à 200.",
  maitre_quiz: "Accumule des pièces au Quiz biblique, partie après partie. Bronze à 5 000 pièces, argent à 20 000, or à 60 000.",
  maitre_vf: "Accumule des points au Vrai ou Faux. Bronze à 500 points, argent à 2 000, or à 6 000.",
  maitre_qsj: "Accumule des points au Qui suis-je. Bronze à 300 points, argent à 1 200, or à 4 000.",
  millionnaire: "Va au bout de l'échelle du Quiz et décroche LE MILLION. Bronze dès la première fois, argent à 5, or à 20.",
  enchaineur: "Au Vrai ou Faux, enchaîne les bonnes réponses sans te tromper : c'est ta meilleure série qui compte. Bronze à 10 d'affilée, argent à 20, or à 35.",
  limier: "Au Qui suis-je, trouve le personnage dès le PREMIER indice. Bronze à 5 fois, argent à 20, or à 60.",
  historien: "À La Chronologie, remets les événements dans le bon ordre. Bronze à 50 bonnes réponses, argent à 200, or à 600.",
  motjuste: "Au Mot manquant (dans Mémoriser), retrouve le mot caché du verset. Bronze à 30 mots, argent à 120, or à 400.",
  frondeur: "Réussis les niveaux de La Fronde de David. Bronze à 10 niveaux, argent à 20, or aux 30 (Goliath compris).",
  tireur: "Décroche les 3 étoiles des niveaux de La Fronde en économisant tes pierres. Bronze à 30 étoiles, argent à 60, or à 90.",
  lanceur: "Crée un salon de duel en ligne et envoie le lien à quelqu'un. Bronze à 3 duels lancés, argent à 15, or à 50.",
  assidu: "Joue, tout simplement — chaque partie de n'importe quel jeu compte. Bronze à 20 parties, argent à 100, or à 500.",
  missionnaire: "Accomplis les missions de la semaine (accueil des jeux) et récupère leur récompense. Bronze à 3 missions, argent à 12, or à 40.",
  etoile: "Monte dans les ligues : finis dans la moitié haute de ta division le dimanche soir. Bronze du badge en atteignant la ligue Argent, argent en ligue Or, or en ligue Élite.",
  encourageur: "Laisse des commentaires d'encouragement sur les sujets de prière. Bronze à 25, argent à 100, or à 300.",
  ambassadeur: "Partage un verset, une image du studio ou une carte depuis l'app. Bronze à 10 partages, argent à 50, or à 200.",
};

function tierFor(kind: BadgeKind, count: number): { tier: BadgeTier | null; next: number | null } {
  const [b, a, o] = BADGE_THRESHOLDS[kind];
  if (count >= o) return { tier: "or", next: null };
  if (count >= a) return { tier: "argent", next: o };
  if (count >= b) return { tier: "bronze", next: a };
  return { tier: null, next: b };
}

function state(kind: BadgeKind, count: number): BadgeState {
  const { tier, next } = tierFor(kind, count);
  return { kind, label: BADGE_LABELS[kind], tier, count, next, detail: DETAILS[kind] };
}

/* ---------- Compteurs spirituels LOCAUX (cet appareil) ---------- */

export type SpiritualStats = {
  meditations: number;
  memorized: number;
  reading: number;
  // Prière
  pray_sessions: number;
  voice_prayers: number;
  pray_streak_best: number;
  first_prayers: number;
  // Temps avec Jésus
  early_meditations: number;
  full_weeks: number;
  listens: number;
  // La Parole
  notes: number;
  snippets: number;
  // Jeux
  duels_won: number;
  duel_streak_best: number;
  perfect_games: number;
  fast_answers: number;
  play_streak_best: number;
  daily_challenges: number;
  hard_correct: number;
  quiz_coins: number;
  vf_xp: number;
  qsj_xp: number;
  quiz_millions: number;
  vf_best_combo: number;
  first_clue: number;
  chrono_correct: number;
  words_found: number;
  duels_started: number;
  games_played: number;
  missions_claimed: number;
  league_best: number;
  fronde_levels: number;
  fronde_stars: number;
  // Communauté
  shares: number;
};

export function localSpiritualStats(): SpiritualStats {
  const out: SpiritualStats = {
    meditations: 0,
    memorized: 0,
    reading: 0,
    pray_sessions: getAchv("pray_sessions"),
    voice_prayers: getAchv("voice_prayers"),
    pray_streak_best: bestDayStreak("pray"),
    first_prayers: getAchv("first_prayers"),
    early_meditations: getAchv("early_meditations"),
    full_weeks: 0,
    listens: getAchv("listens"),
    notes: 0,
    snippets: 0,
    duels_won: getAchv("duels_won"),
    duel_streak_best: getAchv("duel_streak_best"),
    perfect_games: getAchv("perfect_games"),
    fast_answers: getAchv("fast_answers"),
    play_streak_best: bestDayStreak("play"),
    daily_challenges: getAchv("daily_challenges"),
    hard_correct: getAchv("hard_correct"),
    quiz_coins: 0,
    vf_xp: 0,
    qsj_xp: 0,
    quiz_millions: getAchv("quiz_millions"),
    vf_best_combo: getAchv("vf_best_combo"),
    first_clue: getAchv("first_clue"),
    chrono_correct: getAchv("chrono_correct"),
    words_found: getAchv("words_found"),
    duels_started: getAchv("duels_started"),
    games_played: getAchv("games_played"),
    missions_claimed: getAchv("missions_claimed"),
    league_best: getAchv("league_best"),
    fronde_levels: 0,
    fronde_stars: 0,
    shares: getAchv("shares"),
  };
  try {
    const fs = frondeStats();
    out.fronde_levels = fs.done;
    out.fronde_stars = fs.stars;
  } catch {
    /* indisponible */
  }
  try {
    const eng = JSON.parse(localStorage.getItem("jb.engagement.v1") || "null") as {
      completedDates?: string[];
    } | null;
    out.meditations = eng?.completedDates?.length ?? 0;
    out.full_weeks = fullWeeksFromDates(eng?.completedDates ?? []);
  } catch {
    /* indisponible */
  }
  try {
    const mem = JSON.parse(localStorage.getItem("jb.memorize.v1") || "null") as
      | { level?: number }[]
      | null;
    out.memorized = (mem ?? []).filter((m) => (m.level ?? 0) >= 4).length;
  } catch {
    /* indisponible */
  }
  try {
    const plans = JSON.parse(localStorage.getItem("jb.planprogress.v1") || "null") as Record<
      string,
      number[]
    > | null;
    out.reading = Object.values(plans ?? {}).reduce((n, days) => n + (days?.length ?? 0), 0);
  } catch {
    /* indisponible */
  }
  try {
    out.notes = snapshotNotes().length;
    const tk = snapshotToolkit();
    out.snippets = (tk.highlights?.length ?? 0) + (tk.saved?.length ?? 0);
  } catch {
    /* indisponible */
  }
  try {
    out.quiz_coins = getQuizCoins();
    out.vf_xp = getVfXp();
    out.qsj_xp = getWhoXp();
  } catch {
    /* indisponible */
  }
  return out;
}

/** États des badges calculables à partir des stats (sans le serveur). */
function statesFromStats(stats: SpiritualStats, streakDays: number): BadgeState[] {
  return [
    state("scrolleur", stats.pray_sessions),
    state("voix", stats.voice_prayers),
    state("coeur", stats.pray_streak_best),
    state("premier", stats.first_prayers),
    state("fidele", streakDays),
    state("meditant", stats.meditations),
    state("levetot", stats.early_meditations),
    state("enracine", stats.full_weeks),
    state("ecoute", stats.listens),
    state("memorisateur", stats.memorized),
    state("lecteur", stats.reading),
    state("scribe", stats.notes),
    state("surligneur", stats.snippets),
    state("duelliste", stats.duels_won),
    state("invincible", stats.duel_streak_best),
    state("sansfaute", stats.perfect_games),
    state("eclair", stats.fast_answers),
    state("marathonien", stats.play_streak_best),
    state("defi", stats.daily_challenges),
    state("demineur", stats.hard_correct),
    state("maitre_quiz", stats.quiz_coins),
    state("maitre_vf", stats.vf_xp),
    state("maitre_qsj", stats.qsj_xp),
    state("millionnaire", stats.quiz_millions),
    state("enchaineur", stats.vf_best_combo),
    state("limier", stats.first_clue),
    state("historien", stats.chrono_correct),
    state("motjuste", stats.words_found),
    state("frondeur", stats.fronde_levels),
    state("tireur", stats.fronde_stars),
    state("lanceur", stats.duels_started),
    state("assidu", stats.games_played),
    state("missionnaire", stats.missions_claimed),
    state("etoile", stats.league_best),
  ];
}

/* ---------- Célébration « badge décroché » ---------- */

export type BadgeUnlock = { kind: BadgeKind; label: string; tier: BadgeTier; detail: string };

const CELEBRATED_KEY = "jb.achv.celebrated.v1";

/**
 * Compare les paliers atteints avec ceux déjà célébrés ; les nouveaux sont
 * annoncés via l'évènement `jb:badge-unlocked` (écouté par BadgeCelebration).
 * Au tout premier passage, on enregistre l'existant sans rien célébrer.
 */
export function celebrateNewBadges(states: BadgeState[]): void {
  if (typeof window === "undefined") return;
  const TIERS: BadgeTier[] = ["bronze", "argent", "or"];
  const reached = new Set<string>();
  for (const s of states) {
    if (!s.tier) continue;
    for (const t of TIERS) {
      reached.add(`${s.kind}:${t}`);
      if (t === s.tier) break;
    }
  }
  let seen: string[] | null = null;
  try {
    const raw = localStorage.getItem(CELEBRATED_KEY);
    if (raw) seen = JSON.parse(raw) as string[];
  } catch {
    /* */
  }
  const merged = new Set([...(seen ?? []), ...reached]);
  try {
    localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...merged]));
  } catch {
    /* */
  }
  if (seen === null) return; // premier passage : baseline silencieuse
  const seenSet = new Set(seen);
  for (const s of states) {
    if (!s.tier || seenSet.has(`${s.kind}:${s.tier}`)) continue;
    const unlock: BadgeUnlock = { kind: s.kind, label: s.label, tier: s.tier, detail: s.detail };
    window.dispatchEvent(new CustomEvent<BadgeUnlock>("jb:badge-unlocked", { detail: unlock }));
  }
}

/**
 * À appeler après une action qui fait progresser un compteur local (fin de
 * partie, méditation, prière, partage…) : détecte les paliers fraîchement
 * atteints et déclenche la célébration. Rapide, 100 % local.
 */
export function checkLocalBadges(streakDays = 0): void {
  try {
    celebrateNewBadges(statesFromStats(localSpiritualStats(), streakDays));
  } catch {
    /* jamais bloquant */
  }
}

/** Meilleur métal porté (pour l'anneau d'or autour de la photo). */
export function bestTier(pb: ProfileBadges): BadgeTier | null {
  if (pb.weeklyTop) return "or";
  if (Object.values(pb.honors ?? {}).some((n) => (n ?? 0) > 0)) return "or";
  const tiers = pb.states.map((s) => s.tier).filter(Boolean) as BadgeTier[];
  if (tiers.includes("or")) return "or";
  if (tiers.includes("argent")) return "argent";
  if (tiers.includes("bronze")) return "bronze";
  return null;
}

const TIER_SYNC_KEY = "jb.badgetier.sync.v2";

/**
 * Synchronise 1×/jour vers profiles : le meilleur métal (anneau doré de
 * l'avatar) ET les compteurs locaux (stats) pour que tous les badges
 * s'affichent aussi sur le profil vu par les autres.
 */
export async function syncMyBadgeTier(userId: string, streakDays?: number | null): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(TIER_SYNC_KEY) === today) return;
    localStorage.setItem(TIER_SYNC_KEY, today);
  } catch {
    /* stockage indisponible : on synchronise quand même */
  }
  const sb = getSupabase();
  if (!sb) return;
  const stats = localSpiritualStats();
  const pb = await fetchProfileBadges(userId, streakDays, stats);
  if (!pb) return;
  await sb.from("profiles").update({ badge_tier: bestTier(pb), stats }).eq("id", userId);
}

/**
 * Calcule les badges d'un membre. `localStats` (facultatif) : compteurs
 * frais de CET appareil (pour soi-même) ; sinon on lit profiles.stats
 * (synchronisés) — c'est le cas quand on regarde le profil d'un autre.
 */
export async function fetchProfileBadges(
  userId: string,
  streakDays?: number | null,
  localStats?: SpiritualStats,
): Promise<ProfileBadges | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const [prays, comments, quizBoard, tops, prof, honorRows] = await Promise.all([
    sb
      .from("prayer_reactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "pray"),
    sb
      .from("prayer_comments")
      .select("*", { count: "exact", head: true })
      .eq("author_id", userId),
    fetchGameLeaderboard("quiz", 200),
    topIntercessors(7, 1),
    localStats
      ? Promise.resolve(null)
      : sb.from("profiles").select("stats").eq("id", userId).maybeSingle(),
    sb.from("honors").select("kind").eq("user_id", userId),
  ]);

  const honors: HonorCounts = {};
  for (const r of ((honorRows?.data as { kind: HonorKind }[]) ?? [])) {
    honors[r.kind] = (honors[r.kind] ?? 0) + 1;
  }

  const remote = ((prof?.data?.stats as Partial<SpiritualStats>) ?? {}) || {};
  const num = (v: unknown) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0);
  const stats: SpiritualStats = localStats ?? {
    meditations: num(remote.meditations),
    memorized: num(remote.memorized),
    reading: num(remote.reading),
    pray_sessions: num(remote.pray_sessions),
    voice_prayers: num(remote.voice_prayers),
    pray_streak_best: num(remote.pray_streak_best),
    first_prayers: num(remote.first_prayers),
    early_meditations: num(remote.early_meditations),
    full_weeks: num(remote.full_weeks),
    listens: num(remote.listens),
    notes: num(remote.notes),
    snippets: num(remote.snippets),
    duels_won: num(remote.duels_won),
    duel_streak_best: num(remote.duel_streak_best),
    perfect_games: num(remote.perfect_games),
    fast_answers: num(remote.fast_answers),
    play_streak_best: num(remote.play_streak_best),
    daily_challenges: num(remote.daily_challenges),
    hard_correct: num(remote.hard_correct),
    quiz_coins: num(remote.quiz_coins),
    vf_xp: num(remote.vf_xp),
    qsj_xp: num(remote.qsj_xp),
    quiz_millions: num(remote.quiz_millions),
    vf_best_combo: num(remote.vf_best_combo),
    first_clue: num(remote.first_clue),
    chrono_correct: num(remote.chrono_correct),
    words_found: num(remote.words_found),
    duels_started: num(remote.duels_started),
    games_played: num(remote.games_played),
    missions_claimed: num(remote.missions_claimed),
    league_best: num(remote.league_best),
    fronde_levels: num(remote.fronde_levels),
    fronde_stars: num(remote.fronde_stars),
    shares: num(remote.shares),
  };

  const praysN = prays.count ?? 0;
  const commentsN = comments.count ?? 0;
  const quizN = quizBoard.find((r) => r.user_id === userId)?.points ?? 0;
  const streakN = Math.max(0, Math.floor(streakDays ?? 0));

  const pb: ProfileBadges = {
    states: [
      state("intercesseur", praysN),
      state("encourageur", commentsN),
      state("expert", quizN),
      state("ambassadeur", stats.shares),
      ...statesFromStats(stats, streakN),
    ],
    weeklyTop: tops.length > 0 && tops[0].profile.id === userId && tops[0].score > 0,
    honors,
  };
  // Sur son propre profil (stats locales fraîches) : célébrer les paliers
  // atteints, y compris ceux qui dépendent du serveur (intercesseur…).
  if (localStats) celebrateNewBadges(pb.states);
  return pb;
}
