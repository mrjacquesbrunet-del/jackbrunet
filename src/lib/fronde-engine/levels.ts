import type { LevelConfig, TargetConfig, TargetType } from "./types";

/**
 * Les 30 niveaux de « La Fronde de David » — DONNÉES pures, éditables sans
 * toucher au moteur. Progression : casques immobiles sans vent → créatures →
 * cibles mobiles → vent fort, distances, bonus → GÉANT aux niveaux 10/20/30.
 *
 * Coordonnées en mètres : x latéral (-4..4 lisible), y hauteur du CENTRE de
 * la cible (~0.45 posée au sol, plus haut = perchée), z profondeur (2.5..10).
 */

let seq = 0;
function T(
  type: TargetType,
  x: number,
  y: number,
  z: number,
  points: number,
  opts: Partial<TargetConfig> = {},
): TargetConfig {
  seq += 1;
  return { id: `t${seq}`, type, position: { x, y, z }, points, ...opts };
}
const MH = (t: TargetConfig, pattern: "horizontal" | "vertical" | "circle", amp: number, speed: number): TargetConfig => ({
  ...t,
  moving: true,
  movementPattern: pattern,
  moveAmp: amp,
  moveSpeed: speed,
});

function L(
  id: number,
  windStrength: number,
  windDirection: 1 | -1,
  maxAmmo: number,
  requiredScore: number,
  targets: TargetConfig[],
  gravity = 22,
): LevelConfig {
  return { id, gravity, windStrength, windDirection, maxAmmo, requiredScore, targets };
}

export const FRONDE_LEVELS: LevelConfig[] = [
  // ---------- Chapitre 1 : Le berger de Bethléhem (1-10) ----------
  // 1 : trois casques immobiles, aucun vent — la prise en main.
  L(1, 0, 1, 6, 300, [
    T("helmet", -1.3, 0.45, 4, 150),
    T("helmet", 0, 0.5, 5.2, 150),
    T("helmet", 1.4, 0.45, 4.4, 150),
  ]),
  // 2 : le loup rôde près du troupeau.
  L(2, 0, 1, 5, 350, [T("wolf", 0.2, 0.5, 4, 250), T("helmet", -1.5, 0.45, 3, 150)]),
  // 3 : plusieurs cibles + premier souffle de vent.
  L(3, 0.8, 1, 6, 500, [
    T("helmet", -1.6, 0.45, 3.2, 150),
    T("shield", 0.3, 0.55, 4.6, 200),
    T("helmet", 1.6, 0.45, 3.6, 150),
    T("helmet", 0.6, 1.6, 5.6, 180),
  ]),
  // 4 : le lion.
  L(4, 0.8, -1, 5, 500, [T("lion", -0.4, 0.55, 4.6, 300), T("shield", 1.4, 0.5, 3.4, 200)]),
  // 5 : premières cibles MOBILES.
  L(5, 0.6, 1, 6, 550, [
    MH(T("helmet", 0, 0.5, 4, 200), "horizontal", 0.9, 1.1),
    T("shield", -1.7, 0.5, 3.2, 200),
    MH(T("helmet", 1.2, 1.4, 5.4, 220), "vertical", 0.5, 1.4),
  ]),
  // 6 : l'ours (2 coups).
  L(6, 1, 1, 6, 600, [T("bear", 0.3, 0.6, 5, 350), T("helmet", -1.6, 0.45, 3.2, 150), T("helmet", 1.7, 0.45, 3.8, 160)]),
  // 7 : plus loin, plus haut.
  L(7, 1.2, -1, 6, 650, [
    T("wolf", -1.2, 0.5, 5.8, 280),
    T("helmet", 1.4, 1.9, 6.6, 220),
    MH(T("shield", 0.4, 0.55, 3.6, 200), "horizontal", 1.1, 1.3),
  ]),
  // 8 : première cible BONUS (facultative, grosse prime).
  L(8, 1.2, 1, 6, 650, [
    T("lion", 0.6, 0.55, 4.4, 300),
    T("helmet", -1.6, 0.5, 3.4, 160),
    MH(T("bonus", -0.6, 2.3, 7.2, 400), "horizontal", 1.4, 1.8),
  ]),
  // 9 : trio mouvant.
  L(9, 1.5, -1, 6, 750, [
    MH(T("wolf", -0.8, 0.5, 4.2, 260), "horizontal", 1, 1.5),
    MH(T("helmet", 1.2, 1.5, 5.8, 220), "vertical", 0.6, 1.7),
    T("shield", 0.2, 0.5, 3.2, 200),
  ]),
  // 10 : LE GÉANT (boss, 3 coups).
  L(10, 1, 1, 7, 900, [T("giant", 0, 1.15, 7.5, 600, { health: 3 }), T("helmet", -1.8, 0.45, 3.4, 150)]),

  // ---------- Chapitre 2 : Le camp d'Israël (11-20) ----------
  L(11, 1.5, 1, 6, 800, [
    T("lion", -1.1, 0.55, 5.2, 300),
    T("bear", 1, 0.6, 4.2, 350),
    MH(T("helmet", 0.2, 1.8, 6.4, 240), "horizontal", 1.2, 1.6),
  ]),
  L(12, 1.8, -1, 6, 850, [
    MH(T("lion", 0.4, 0.55, 5, 320), "horizontal", 1.3, 1.4),
    T("shield", -1.6, 0.5, 3.4, 200),
    T("wolf", 1.6, 0.5, 4, 260),
  ]),
  L(13, 2, 1, 5, 800, [T("bear", -0.8, 0.6, 6.2, 380), T("bear", 1.1, 0.6, 6.2, 380)]),
  L(14, 1.5, -1, 6, 900, [
    MH(T("wolf", -0.6, 0.5, 4.4, 280), "horizontal", 1.2, 1.9),
    MH(T("lion", 0.8, 0.6, 5.8, 340), "vertical", 0.5, 1.3),
    MH(T("bonus", 0, 2.6, 8, 450), "circle", 0.8, 1.6),
  ]),
  L(15, 2, 1, 6, 950, [
    T("lion", -1.9, 0.55, 4.6, 300),
    T("bear", 0, 0.6, 4.6, 350),
    T("lion", 1.9, 0.55, 4.6, 300),
  ]),
  L(16, 2.2, -1, 6, 950, [
    MH(T("bear", 0.4, 0.6, 6.8, 400), "horizontal", 1.4, 1.4),
    T("wolf", -1.5, 0.5, 3.8, 260),
    T("shield", 1.6, 1.6, 5.6, 240),
  ]),
  L(17, 2.5, 1, 5, 850, [
    MH(T("bear", -0.6, 0.65, 7.4, 420), "horizontal", 1.2, 1.2),
    MH(T("wolf", 0.9, 0.5, 4.4, 280), "horizontal", 1.3, 2),
  ]),
  L(18, 1.8, -1, 7, 1100, [
    T("wolf", -1.7, 0.5, 3.8, 260),
    T("lion", -0.3, 0.6, 5.2, 320),
    T("bear", 1.1, 0.65, 6.6, 400),
    MH(T("helmet", 1.7, 2, 7.4, 260), "vertical", 0.7, 1.8),
  ]),
  L(19, 2.2, 1, 6, 1050, [
    MH(T("lion", -0.7, 0.6, 6, 360), "circle", 0.7, 1.5),
    MH(T("wolf", 1, 0.5, 4.6, 300), "horizontal", 1.4, 1.7),
    MH(T("bonus", 0.2, 2.8, 8.6, 500), "horizontal", 1.6, 2.1),
  ]),
  L(20, 1.8, -1, 7, 1400, [
    T("giant", 0.2, 1.15, 8, 700, { health: 3 }),
    MH(T("wolf", -1.4, 0.5, 4.4, 280), "horizontal", 1, 1.6),
    T("lion", 1.6, 0.55, 5.4, 320),
  ]),

  // ---------- Chapitre 3 : Face au géant (21-30) ----------
  L(21, 2.5, 1, 6, 1150, [
    T("bear", -1, 0.65, 6.4, 400),
    MH(T("lion", 0.8, 0.6, 7, 380), "horizontal", 1.4, 1.5),
    T("helmet", 1.8, 0.45, 3.4, 160),
  ]),
  L(22, 2.8, -1, 6, 1200, [
    MH(T("lion", -0.4, 0.6, 5.4, 340), "circle", 0.9, 1.8),
    MH(T("bear", 1, 0.65, 7.6, 440), "horizontal", 1.2, 1.3),
    T("shield", -1.8, 0.5, 3.6, 200),
  ]),
  L(23, 2.5, 1, 7, 1400, [
    T("wolf", -2, 0.5, 4.2, 280),
    MH(T("lion", -0.5, 0.6, 6, 360), "horizontal", 1.5, 1.9),
    MH(T("bear", 0.9, 0.65, 7.8, 460), "vertical", 0.6, 1.4),
    MH(T("helmet", 1.9, 2.2, 8.2, 280), "horizontal", 1, 2.3),
  ]),
  L(24, 2.2, -1, 6, 1350, [T("giant", -0.6, 1.15, 7.8, 700, { health: 3 }), MH(T("bear", 1.3, 0.6, 5.4, 380), "horizontal", 1.2, 1.7)]),
  L(25, 3, 1, 7, 1500, [
    T("bear", -1.4, 0.7, 8.2, 480),
    T("lion", 0, 0.6, 6.4, 380),
    T("wolf", 1.4, 0.5, 4.6, 300),
    MH(T("bonus", -0.3, 3, 9, 550), "circle", 0.9, 1.9),
  ]),
  L(26, 3, -1, 6, 1300, [
    MH(T("bear", 0.5, 0.7, 8.6, 500), "horizontal", 1.4, 1.4),
    MH(T("wolf", -1, 0.5, 4.8, 320), "horizontal", 1.6, 2.2),
    T("shield", 1.8, 1.7, 6, 260),
  ]),
  L(27, 2.8, 1, 7, 1600, [
    MH(T("lion", -1.2, 0.6, 6.2, 380), "circle", 0.8, 1.7),
    MH(T("bear", 0.6, 0.7, 8, 480), "vertical", 0.7, 1.5),
    MH(T("wolf", 1.7, 0.5, 5, 320), "horizontal", 1.2, 2.4),
    T("helmet", -2, 0.45, 3.6, 170),
  ]),
  L(28, 2.5, -1, 6, 1500, [
    T("giant", 0.9, 1.15, 8.4, 750, { health: 3 }),
    MH(T("lion", -1.2, 0.6, 5.6, 360), "horizontal", 1.3, 1.9),
  ]),
  L(29, 3.2, 1, 7, 1700, [
    MH(T("bear", -0.8, 0.7, 8.8, 520), "horizontal", 1.5, 1.6),
    MH(T("lion", 0.9, 0.6, 6.6, 400), "circle", 0.9, 2),
    MH(T("wolf", -1.8, 0.5, 4.6, 320), "horizontal", 1.3, 2.5),
    MH(T("bonus", 0.3, 3.2, 9.4, 600), "horizontal", 1.8, 2.3),
  ]),
  // 30 : l'affrontement final.
  L(30, 2.8, -1, 8, 2100, [
    T("giant", 0, 1.2, 9, 900, { health: 3 }),
    MH(T("lion", -1.6, 0.6, 6, 380), "horizontal", 1.2, 1.8),
    MH(T("bear", 1.5, 0.65, 7, 460), "vertical", 0.6, 1.6),
  ]),
];

/** Chapitres de l'histoire (sélection de niveaux). */
export const FRONDE_CHAPTERS: { from: number; title: string; verse: string }[] = [
  { from: 0, title: "Le berger de Bethléhem", verse: "« L'Éternel ne regarde pas à ce que l'homme regarde… l'Éternel regarde au cœur. » — 1 Samuel 16:7" },
  { from: 10, title: "Le camp d'Israël", verse: "« Qui est ce Philistin, pour insulter les troupes du Dieu vivant ? » — 1 Samuel 17:26" },
  { from: 20, title: "Face au géant", verse: "« Tu marches contre moi avec l'épée… moi, je marche contre toi au nom de l'Éternel. » — 1 Samuel 17:45" },
];
