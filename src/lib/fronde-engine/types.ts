/**
 * « La Fronde de David » — types du moteur de jeu.
 * La logique de gameplay (engine.ts) est totalement séparée de l'UI React
 * (FrondeGame.tsx) ; les niveaux sont des DONNÉES pures (levels.ts).
 *
 * Monde 3D simplifié, en mètres :
 *  - x : latéral (négatif = gauche), environ -6..6 ;
 *  - y : hauteur (0 = sol) ;
 *  - z : profondeur devant le joueur (~2 = tout près, ~11 = loin).
 * La caméra est en (0, 1.6, 0) et projette sur un écran logique 360×480.
 */

export type TargetType = "wolf" | "lion" | "bear" | "giant" | "helmet" | "shield" | "bonus";

export type MovementPattern = "horizontal" | "vertical" | "circle";

export interface TargetConfig {
  id: string;
  type: TargetType;
  position: { x: number; y: number; z: number };
  points: number;
  /** Coups nécessaires (défaut 1 ; le géant 3). */
  health?: number;
  moving?: boolean;
  movementPattern?: MovementPattern;
  /** Amplitude (m) et vitesse (rad/s) du mouvement. */
  moveAmp?: number;
  moveSpeed?: number;
  /** Rayon du collider (m). Défaut selon le type. */
  radius?: number;
}

/** Obstacles qui PASSENT DEVANT les cibles et bloquent la pierre. */
export type ObstacleConfig =
  | {
      kind: "log"; // balancier de bois suspendu à des chaînes
      x: number;
      y: number;
      z: number;
      /** Amplitude du balancement (m) et vitesse (rad/s). */
      amp: number;
      speed: number;
    }
  | {
      kind: "birds"; // vol d'oiseaux qui traverse l'écran
      y: number;
      z: number;
      /** Vitesse de traversée (m/s), sens (1 = vers la droite) et nombre. */
      speed: number;
      dir: 1 | -1;
      count: number;
    };

export interface LevelConfig {
  id: number;
  /** Gravité (m/s²) — 22 par défaut (arcade, chute rapide). */
  gravity: number;
  /** Force du vent max (m/s). Le vent varie doucement dans le temps. */
  windStrength: number;
  /** Direction initiale du vent : 1 = vers la droite, -1 = vers la gauche. */
  windDirection: 1 | -1;
  maxAmmo: number;
  /** Score minimal pour valider le niveau (1 étoile). */
  requiredScore: number;
  targets: TargetConfig[];
  obstacles?: ObstacleConfig[];
}

export type GameState =
  | "ready"
  | "aiming"
  | "projectileFlying"
  | "hit"
  | "miss"
  | "levelComplete"
  | "gameOver"
  | "paused";

/** Rayons de collider par défaut (m). */
export const TARGET_RADIUS: Record<TargetType, number> = {
  helmet: 0.42,
  shield: 0.5,
  wolf: 0.55,
  lion: 0.6,
  bear: 0.65,
  giant: 0.95,
  bonus: 0.38,
};

/** Points de vie par défaut. */
export const TARGET_HEALTH: Record<TargetType, number> = {
  helmet: 1,
  shield: 2,
  wolf: 1,
  lion: 1,
  bear: 2,
  giant: 3,
  bonus: 1,
};

/** Ce que le moteur remonte à l'app hôte (profil, XP, classement…). */
export interface FrondeServices {
  onLevelComplete(r: { levelId: number; score: number; stars: number; xpEarned: number }): void;
  onGameOver(r: { levelId: number; score: number }): void;
  onHighScoreUpdated(score: number): void;
  haptic(pattern: number | number[]): void;
}

/** Instantané envoyé au HUD React (à chaque changement utile, pas 60×/s). */
export interface HudSnapshot {
  state: GameState;
  ammo: number;
  score: number;
  combo: number;
  targetsLeft: number;
  stars: number; // étoiles au moment de la fin de niveau
  /** Vie du géant quand le niveau est un boss (barre en haut de l'écran). */
  bossHp: { hp: number; max: number } | null;
}
