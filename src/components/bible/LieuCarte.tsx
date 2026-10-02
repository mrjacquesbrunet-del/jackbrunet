"use client";

import { useMemo } from "react";

/**
 * CARTE STYLISÉE du monde biblique (Méditerranée orientale) en SVG pur :
 * aucune tuile réseau, aucun tracking — juste des côtes simplifiées
 * dessinées à la main, la mer en nuit profonde et la terre en brun chaud.
 *
 * - <LieuCarte points={[{g, label}]} /> : situe un lieu (point lumineux).
 * - points multiples + route : trace le PARCOURS d'un personnage (ligne
 *   pointillée dorée reliant les étapes numérotées) — façon bible d'étude.
 *
 * Le cadrage s'ajuste automatiquement aux points affichés (projection
 * équirectangulaire corrigée en longitude).
 */

export type CartePoint = { g: [number, number]; label?: string };

// x compressé pour respecter les proportions aux latitudes du Levant.
const KX = 0.84;
const px = (lon: number) => lon * KX;
const py = (lat: number) => -lat;

// ——— Côtes simplifiées (lon, lat) ———
// La Méditerranée : un seul polygone fermé (Italie → Grèce → Asie Mineure →
// Levant → Égypte → Libye), les îles par-dessus.
const MER: [number, number][] = [
  [9.5, 44.2], [12.2, 43.9], [13.6, 43.3], [14.8, 42.3], [16.1, 41.9], [18.5, 40.1],
  [16.8, 39.6], [15.65, 38.0], [15.9, 37.3], [16.5, 38.2], [17.2, 39.0], [18.2, 39.8],
  [19.3, 40.5], [19.4, 39.7], [20.2, 39.2], [21.1, 38.4], [21.5, 36.9], [22.4, 36.5],
  [23.1, 36.4], [23.5, 37.4], [23.73, 37.9], [24.1, 38.6], [23.4, 39.1], [23.0, 39.9],
  [22.6, 40.4], [22.94, 40.55], [23.8, 40.7], [24.5, 40.85], [25.5, 40.85], [26.4, 40.1],
  [26.16, 39.6], [26.8, 39.2], [26.9, 38.4], [27.0, 37.9], [27.3, 37.4], [27.5, 37.0],
  [28.3, 36.8], [29.1, 36.6], [30.4, 36.85], [31.7, 36.8], [32.8, 36.0], [33.9, 36.3],
  [34.6, 36.75], [35.6, 36.6], [36.2, 36.55], [35.9, 36.0], [35.78, 35.5], [35.9, 34.9],
  [35.85, 34.45], [35.5, 33.9], [35.2, 33.27], [34.98, 32.83], [34.75, 32.05], [34.46, 31.5],
  [34.2, 31.3], [32.3, 31.25], [30.7, 31.4], [29.9, 31.2], [27.5, 31.1], [25.2, 31.55],
  [22.0, 32.8], [19.0, 30.4], [15.3, 32.4], [13.0, 32.8], [10.5, 33.6], [9.5, 35.0],
];
// Îles (terre redessinée sur la mer).
const ILES: [number, number][][] = [
  // Chypre
  [[32.3, 35.18], [32.9, 35.4], [33.9, 35.55], [34.55, 35.65], [34.1, 35.1], [33.3, 34.75], [32.6, 34.75]],
  // Crète
  [[23.5, 35.6], [24.8, 35.65], [26.3, 35.3], [25.0, 35.0], [23.6, 35.25]],
  // Sicile
  [[12.4, 37.8], [14.2, 38.15], [15.2, 38.25], [15.1, 37.0], [13.3, 36.8], [12.4, 37.55]],
  // Malte
  [[14.2, 35.98], [14.6, 35.95], [14.5, 35.8], [14.25, 35.85]],
  // Patmos (grossie pour rester visible)
  [[26.45, 37.38], [26.65, 37.38], [26.6, 37.22], [26.48, 37.25]],
];
// Eaux intérieures et golfes (dessinés sur la terre).
const EAUX: [number, number][][] = [
  // Mer de Galilée
  [[35.52, 32.9], [35.64, 32.88], [35.62, 32.7], [35.52, 32.75]],
  // Mer Morte
  [[35.42, 31.78], [35.57, 31.72], [35.55, 31.1], [35.4, 31.25]],
  // Golfe de Suez
  [[32.55, 29.95], [33.6, 28.2], [33.2, 27.75], [32.25, 29.5]],
  // Golfe d'Akaba
  [[34.95, 29.55], [34.75, 28.1], [34.35, 28.25], [34.65, 29.5]],
];
// Fleuves (traits).
const FLEUVES: [number, number][][] = [
  // Le Jourdain
  [[35.6, 33.2], [35.57, 32.9], [35.57, 32.7], [35.5, 32.2], [35.49, 31.78]],
  // Le Nil
  [[31.2, 31.2], [31.25, 30.1], [31.0, 28.8], [31.3, 27.5], [32.5, 25.7]],
  // L'Euphrate
  [[38.0, 37.0], [38.8, 36.3], [40.4, 35.2], [42.3, 33.9], [44.42, 32.6], [46.2, 31.3], [47.6, 30.5]],
  // Le Tigre
  [[41.0, 37.5], [43.15, 36.4], [44.2, 34.6], [45.3, 33.0], [47.4, 30.9]],
];

function path(pts: [number, number][], close = true): string {
  return (
    pts.map(([lon, lat], i) => `${i ? "L" : "M"}${px(lon).toFixed(2)} ${py(lat).toFixed(2)}`).join(" ") +
    (close ? " Z" : "")
  );
}

export function LieuCarte({
  points,
  route = false,
  className = "",
}: {
  points: CartePoint[];
  /** Relie les points dans l'ordre (parcours d'un personnage). */
  route?: boolean;
  className?: string;
}) {
  const view = useMemo(() => {
    const xs = points.map((p) => px(p.g[0]));
    const ys = points.map((p) => py(p.g[1]));
    let minX = Math.min(...xs), maxX = Math.max(...xs);
    let minY = Math.min(...ys), maxY = Math.max(...ys);
    // Cadrage mini et marges généreuses pour respirer.
    const MIN = route ? 7 : 4.6;
    if (maxX - minX < MIN) { const c = (minX + maxX) / 2; minX = c - MIN / 2; maxX = c + MIN / 2; }
    if (maxY - minY < MIN * 0.62) { const c = (minY + maxY) / 2; minY = c - MIN * 0.31; maxY = c + MIN * 0.31; }
    const padX = (maxX - minX) * 0.22 + 0.5;
    const padY = (maxY - minY) * 0.22 + 0.5;
    return { x: minX - padX, y: minY - padY, w: maxX - minX + padX * 2, h: maxY - minY + padY * 2 };
  }, [points, route]);

  const stroke = Math.max(0.025, view.w / 240);
  const r = Math.max(0.12, view.w / 34);
  const fs = Math.max(r * 1.25, view.w / 26);

  // Plusieurs lieux (hors parcours) : l'étiquette passe sous le point si
  // elle chevauche une autre, et disparaît si la place manque encore.
  const placement = useMemo(() => {
    const boites: { x0: number; x1: number; y0: number; y1: number }[] = [];
    return points.map((p) => {
      if (route || !p.label) return "dessus" as const;
      const x = px(p.g[0]), y = py(p.g[1]);
      const w = p.label.length * fs * 0.56;
      for (const pos of ["dessus", "dessous"] as const) {
        const yc = pos === "dessus" ? y - r * 2.1 : y + r * 2.1 + fs;
        const b = { x0: x - w / 2, x1: x + w / 2, y0: yc - fs, y1: yc + fs * 0.2 };
        if (!boites.some((o) => b.x0 < o.x1 && o.x0 < b.x1 && b.y0 < o.y1 && o.y0 < b.y1)) {
          boites.push(b);
          return pos;
        }
      }
      return "aucune" as const;
    });
  }, [points, route, fs, r]);

  return (
    <svg
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      className={`block w-full rounded-2xl border border-white/10 ${className}`}
      style={{ background: "#2A2822", aspectRatio: `${view.w} / ${view.h}` }}
      role="img"
      aria-label="Carte du monde biblique"
    >
      {/* La mer, puis les îles, les eaux intérieures et les fleuves */}
      <path d={path(MER)} fill="#141C26" stroke="#3A4656" strokeWidth={stroke} />
      {ILES.map((i, n) => (
        <path key={`i${n}`} d={path(i)} fill="#2A2822" stroke="#3A4656" strokeWidth={stroke} />
      ))}
      {EAUX.map((e, n) => (
        <path key={`e${n}`} d={path(e)} fill="#141C26" stroke="#3A4656" strokeWidth={stroke * 0.8} />
      ))}
      {FLEUVES.map((f, n) => (
        <path key={`f${n}`} d={path(f, false)} fill="none" stroke="#2E3B4C" strokeWidth={stroke * 2.2} strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* Le tracé du parcours */}
      {route && points.length > 1 ? (
        <path
          d={points.map((p, i) => `${i ? "L" : "M"}${px(p.g[0]).toFixed(2)} ${py(p.g[1]).toFixed(2)}`).join(" ")}
          fill="none"
          stroke="#CAF000"
          strokeWidth={stroke * 2.4}
          strokeDasharray={`${stroke * 6} ${stroke * 5}`}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      ) : null}

      {/* Les étapes / le lieu */}
      {points.map((p, i) => {
        const x = px(p.g[0]), y = py(p.g[1]);
        const last = route && i === points.length - 1;
        return (
          <g key={i}>
            {!route ? <circle cx={x} cy={y} r={r * 2.3} fill="#CAF000" opacity={0.16} /> : null}
            <circle cx={x} cy={y} r={route ? r * 0.95 : r * 1.25} fill={last || !route ? "#CAF000" : "#1B1A17"} stroke="#CAF000" strokeWidth={stroke * (route ? 1.6 : 2)} />
            {route ? (
              <text x={x} y={y + r * 0.42} textAnchor="middle" fontSize={r * 1.15} fontWeight={800} fill={last ? "#1B1A17" : "#CAF000"} fontFamily="inherit">
                {i + 1}
              </text>
            ) : null}
            {p.label && (!route || i === 0 || last) && placement[i] !== "aucune" ? (
              <text
                x={x}
                y={placement[i] === "dessous" ? y + r * 2.1 + fs : y - r * (route ? 1.7 : 2.1)}
                textAnchor="middle"
                fontSize={fs}
                fontWeight={800}
                fill="#F4F2E7"
                stroke="#1B1A17"
                strokeWidth={stroke * 2.2}
                paintOrder="stroke"
                fontFamily="inherit"
              >
                {p.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
