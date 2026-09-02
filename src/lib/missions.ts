"use client";

import { getAchv, bumpAchv } from "./achievements";
import { checkLocalBadges } from "./badges";
import { getMemorizeXp } from "./memorize";
import { getVfXp } from "./vraifaux";
import { getChronoGames } from "./chrono";
import { submitWeeklyPoints } from "./game-scores";

/**
 * MISSIONS DE LA SEMAINE : 3 objectifs tirés au sort chaque lundi (tirage
 * déterministe par numéro de semaine — tout le monde a les mêmes). La
 * progression se mesure sur les compteurs d'accomplissements : on prend une
 * « photo » des compteurs en début de semaine, la mission compte le delta.
 * Récompense : des points pour la ligue de la semaine.
 */

export type Mission = {
  id: string;
  label: string;
  target: number;
  reward: number; // points de ligue
  measure: () => number; // valeur ABSOLUE du compteur (le delta est calculé)
};

export const MISSION_POOL: Mission[] = [
  { id: "duels2", label: "Gagne 2 duels en ligne", target: 2, reward: 80, measure: () => getAchv("duels_won") },
  { id: "defi3", label: "Fais 3 Défis du jour au Quiz", target: 3, reward: 60, measure: () => getAchv("daily_challenges") },
  { id: "fast15", label: "15 réponses éclair (moins de 3 s)", target: 15, reward: 50, measure: () => getAchv("fast_answers") },
  { id: "hard8", label: "Réussis 8 questions pièges", target: 8, reward: 60, measure: () => getAchv("hard_correct") },
  { id: "scrolle2", label: "Termine 2 sessions Scrolle & prie", target: 2, reward: 60, measure: () => getAchv("pray_sessions") },
  { id: "voice2", label: "Dépose 2 prières vocales", target: 2, reward: 70, measure: () => getAchv("voice_prayers") },
  { id: "listen3", label: "Écoute 3 méditations en audio", target: 3, reward: 40, measure: () => getAchv("listens") },
  { id: "share3", label: "Partage 3 fois depuis l'app", target: 3, reward: 50, measure: () => getAchv("shares") },
  { id: "memo150", label: "Gagne 150 XP en mémorisation", target: 150, reward: 50, measure: () => getMemorizeXp() },
  { id: "vf250", label: "Gagne 250 points au Vrai ou Faux", target: 250, reward: 50, measure: () => getVfXp() },
  { id: "chrono2", label: "Joue 2 parties de La Chronologie", target: 2, reward: 40, measure: () => getChronoGames() },
  { id: "perfect1", label: "Fais une partie parfaite", target: 1, reward: 80, measure: () => getAchv("perfect_games") },
];

const KEY = "jb.missions.v1";

type MissionState = {
  week: string;
  baseline: Record<string, number>;
  claimed: string[];
};

/** Semaine ISO courante (même formule que le serveur : IYYY-WIW). */
export function isoWeek(d = new Date()): string {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const y = x.getUTCFullYear();
  const start = new Date(Date.UTC(y, 0, 1));
  const wk = Math.ceil(((x.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return `${y}-W${String(wk).padStart(2, "0")}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Les 3 missions de la semaine (tirage déterministe, commun à tous). */
export function weeklyMissions(week = isoWeek()): Mission[] {
  const picked: Mission[] = [];
  const pool = [...MISSION_POOL];
  let seed = hash(`rhema:${week}`);
  while (picked.length < 3 && pool.length > 0) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const i = seed % pool.length;
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

function readState(): MissionState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as MissionState;
  } catch {
    /* */
  }
  return null;
}

function writeState(s: MissionState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* */
  }
}

/** État de la semaine : crée/renouvelle la photo des compteurs au besoin. */
export function ensureMissionState(): MissionState {
  const week = isoWeek();
  const cur = readState();
  if (cur && cur.week === week) return cur;
  const baseline: Record<string, number> = {};
  for (const m of weeklyMissions(week)) baseline[m.id] = m.measure();
  const fresh: MissionState = { week, baseline, claimed: [] };
  writeState(fresh);
  return fresh;
}

export type MissionProgress = Mission & { done: number; claimed: boolean };

/** Les 3 missions avec leur progression (delta depuis lundi). */
export function missionProgress(): MissionProgress[] {
  const st = ensureMissionState();
  return weeklyMissions(st.week).map((m) => {
    const base = Number(st.baseline[m.id] ?? 0);
    const done = Math.max(0, Math.min(m.target, m.measure() - base));
    return { ...m, done, claimed: st.claimed.includes(m.id) };
  });
}

/**
 * Récupère la récompense d'une mission accomplie : points envoyés à la
 * ligue de la semaine. Renvoie false si pas encore finie ou déjà prise.
 */
export function claimMission(id: string): boolean {
  const st = ensureMissionState();
  if (st.claimed.includes(id)) return false;
  const m = weeklyMissions(st.week).find((x) => x.id === id);
  if (!m) return false;
  const base = Number(st.baseline[m.id] ?? 0);
  if (m.measure() - base < m.target) return false;
  st.claimed.push(id);
  writeState(st);
  void submitWeeklyPoints(m.reward);
  // Badge « Missionnaire » + célébration éventuelle.
  bumpAchv("missions_claimed");
  checkLocalBadges();
  return true;
}
