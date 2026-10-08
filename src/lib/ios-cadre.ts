import { Capacitor } from "@capacitor/core";

/** Première version iOS dont la page passe SOUS l'heure (contentInset « never »). */
const VERSION_PLEIN_ECRAN = [2, 4];

let promesse: Promise<boolean> | null = null;

/**
 * Ancienne app iOS (avant 2.4) : la page est posée sous la zone de l'heure
 * (contentInset « always »), il faut alors peindre cette zone à part.
 * Les versions récentes vont d'un bord à l'autre : rien à faire.
 */
export function iosAncienCadre(): Promise<boolean> {
  if (Capacitor.getPlatform() !== "ios") return Promise.resolve(false);
  promesse ??= import("@capacitor/app")
    .then(({ App }) => App.getInfo())
    .then(({ version }) => {
      const v = version.split(".").map((n) => Number(n) || 0);
      for (let i = 0; i < VERSION_PLEIN_ECRAN.length; i++) {
        if ((v[i] ?? 0) !== VERSION_PLEIN_ECRAN[i]) return (v[i] ?? 0) < VERSION_PLEIN_ECRAN[i];
      }
      return false;
    })
    .catch(() => true);
  return promesse;
}
