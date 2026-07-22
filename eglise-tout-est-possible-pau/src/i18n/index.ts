// Architecture multilingue — français par défaut, espagnol prêt à activer.
//
// Aujourd'hui : tout le site est servi en français (locale = "fr").
// Demain : dupliquer content/ vers content/es/, définir NEXT_PUBLIC_LOCALE=es
// sur un second déploiement (ou activer un routage /es), et le dictionnaire
// espagnol ci-dessous prend le relais sans toucher aux composants.

import fr, { type DictionaryKey } from "./fr";
import es from "./es";

export type Locale = "fr" | "es";

const dictionaries: Record<Locale, Record<DictionaryKey, string>> = { fr, es };

export const locale: Locale =
  (process.env.NEXT_PUBLIC_LOCALE as Locale) === "es" ? "es" : "fr";

export function t(key: DictionaryKey): string {
  return dictionaries[locale][key] ?? dictionaries.fr[key] ?? key;
}
