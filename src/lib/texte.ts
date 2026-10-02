/**
 * Nettoie les marques de mise en forme « IA » (Markdown) qui ne doivent
 * jamais apparaître à l'écran : **gras**, *italique*, `code`, titres #,
 * lignes de séparation --- et puces * / -. Le sens du texte est conservé,
 * seuls les marqueurs disparaissent (les puces deviennent des tirets).
 */
export function nettoyerMarquesIA(texte: string): string {
  return texte
    .split("\n")
    .filter((ligne) => !/^\s*([-*_—=]\s*){3,}\s*$/.test(ligne))
    .map((ligne) =>
      ligne
        .replace(/^\s*#{1,6}\s+/, "")
        .replace(/^(\s*)[-*•]\s+/, "$1— "),
    )
    .join("\n")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[\s(«])\*([^*\n]+)\*(?=[\s).,;:!?»]|$)/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1");
}
