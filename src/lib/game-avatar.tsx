"use client";

/** Avatars de personnage partagés entre la page Jeux et le Défi Biblique. */
export const AV_KEY = "jb.games.avatar.v1";

export type Char = { id: string; from: string; to: string; glyph: string };

export const CHARACTERS: Char[] = [
  { id: "lime", from: "#8FE23C", to: "#4c8f0f", glyph: "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z" }, // étoile
  { id: "violet", from: "#a78bfa", to: "#6d28d9", glyph: "M12 3c1.6 3 4.6 4 4.6 8.5A4.6 4.6 0 0 1 7.4 11.5c0-1 .4-2 1-2.7C9.5 10.5 10 7 12 3z" }, // flamme
  { id: "sky", from: "#38bdf8", to: "#0369a1", glyph: "M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z" }, // bouclier
  { id: "amber", from: "#fbbf24", to: "#b45309", glyph: "M5 16l2-9 5 5 5-5 2 9zM5 19h14" }, // couronne
  { id: "rose", from: "#fb7185", to: "#9f1239", glyph: "M6 4h9a3 3 0 0 1 3 3v13l-6-3-6 3z" }, // marque-page
  { id: "teal", from: "#2dd4bf", to: "#0f766e", glyph: "M4 12c4-6 12-6 16 0-4 6-12 6-16 0zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" }, // œil
  { id: "orange", from: "#fb923c", to: "#c2410c", glyph: "M13 2L4 14h6l-1 8 9-12h-6z" }, // éclair
  { id: "fuchsia", from: "#e879f9", to: "#a21caf", glyph: "M12 4c3 3 3 6 0 9-3-3-3-6 0-9zM12 13c3 3 3 5 0 7-3-2-3-4 0-7z" }, // colombe
];

export function getCharId(): string {
  try {
    return localStorage.getItem(AV_KEY) || CHARACTERS[0].id;
  } catch {
    return CHARACTERS[0].id;
  }
}
export function setCharId(id: string) {
  try {
    localStorage.setItem(AV_KEY, id);
  } catch {
    /* stockage indisponible */
  }
}
export function charById(id: string): Char {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

/** Avatar carré arrondi : dégradé + glyphe du personnage. */
export function CharAvatar({
  char,
  size = 96,
  ring = true,
  rounded = "rounded-2xl",
}: {
  char: Char;
  size?: number;
  ring?: boolean;
  rounded?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center ${rounded} ${ring ? "ring-4 ring-white/15" : ""}`}
      style={{ width: size, height: size, background: `linear-gradient(150deg, ${char.from}, ${char.to})` }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.5}
        height={size * 0.5}
        fill="none"
        stroke="#0C0C0B"
        strokeWidth={1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d={char.glyph} />
      </svg>
    </span>
  );
}
