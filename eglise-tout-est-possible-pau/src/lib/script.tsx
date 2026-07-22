import type { ReactNode } from "react";

// Convention éditoriale : dans n'importe quel texte du CMS, un passage
// entouré d'astérisques (*comme ceci*) est rendu dans la police
// manuscrite d'accent. Exemple : "On t'attend *ce dimanche.*"
export function withScript(text: string): ReactNode {
  const parts = text.split(/\*([^*]+)\*/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="script">
        {part}
      </em>
    ) : (
      part
    ),
  );
}

// Variante texte brut (balises retirées) pour les métadonnées / SEO.
export function stripScript(text: string): string {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
